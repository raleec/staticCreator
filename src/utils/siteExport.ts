import JSZip from 'jszip';
import type { Site, SiteExportBundle, AzureCloud, ApiPreloadQuery } from '../types';

const EXPORT_VERSION = '1.0';

/**
 * Serialises a Site to a JSON export bundle string.
 */
export function exportSiteAsJson(site: Site): string {
  const bundle: SiteExportBundle = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    site: {
      id: site.id,
      name: site.name,
      description: site.description,
      azureConfig: site.azureConfig,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
    },
    pages: site.pages,
  };
  return JSON.stringify(bundle, null, 2);
}

/**
 * Triggers a browser download for a JSON export of the site.
 */
export function downloadSiteJson(site: Site): void {
  const json = exportSiteAsJson(site);
  const blob = new Blob([json], { type: 'application/json' });
  triggerDownload(blob, `${sanitiseFilename(site.name)}.json`);
}

/**
 * Exports the site as a ZIP archive containing:
 *  - site.json    – the full bundle
 *  - pages/       – each page rendered as a standalone HTML file
 *  - staticwebapp.config.json – Azure SWA routing config
 */
export async function downloadSiteZip(site: Site): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(sanitiseFilename(site.name))!;

  // Full bundle JSON
  folder.file('site.json', exportSiteAsJson(site));

  // Static Web App config
  folder.file('staticwebapp.config.json', buildSwaConfig(site));

  // Individual HTML pages
  const pagesFolder = folder.folder('pages')!;
  for (const page of site.pages) {
    pagesFolder.file(
      `${sanitiseFilename(page.name)}.html`,
      buildPageHtml(page.name, page.gjsData, site),
    );
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, `${sanitiseFilename(site.name)}.zip`);
}

/**
 * Parses a JSON export bundle from a File.
 * Returns the bundle or throws an error if the format is invalid.
 */
export async function importSiteFromFile(file: File): Promise<SiteExportBundle> {
  const text = await file.text();
  const bundle = JSON.parse(text) as SiteExportBundle;

  if (!bundle.version || !bundle.site || !Array.isArray(bundle.pages)) {
    throw new Error('Invalid site bundle – missing required fields.');
  }

  return bundle;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sanitiseFilename(name: string): string {
  return name.replace(/[^a-z0-9_\-. ]/gi, '_').replace(/\s+/g, '-').toLowerCase();
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Builds a minimal Azure Static Web Apps routing configuration.
 */
function buildSwaConfig(site: Site): string {
  const config = {
    routes: [
      { route: '/login', rewrite: '/index.html' },
      { route: '/*', rewrite: '/index.html' },
    ],
    navigationFallback: {
      rewrite: '/index.html',
      exclude: ['/images/*', '/css/*', '/*.{js,css,ico,png,jpg,gif,svg}'],
    },
    responseOverrides: {
      '401': { redirect: '/login', statusCode: 302 },
      '403': { statusCode: 403 },
      '404': { rewrite: '/index.html', statusCode: 200 },
    },
    auth: {
      identityProviders: {
        azureActiveDirectory: {
          registration: {
            openIdIssuer: `https://login.microsoftonline${site.azureConfig.cloud !== 'commercial' ? '.us' : '.com'}/${site.azureConfig.tenantId}/v2.0`,
            clientIdSettingName: 'AZURE_CLIENT_ID',
            clientSecretSettingName: 'AZURE_CLIENT_SECRET',
          },
        },
      },
    },
    globalHeaders: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    mimeTypes: {
      '.json': 'application/json',
    },
  };
  return JSON.stringify(config, null, 2);
}

/**
 * Returns the Microsoft Graph API base URL for the given Azure cloud.
 */
function getGraphApiBase(cloud: AzureCloud): string {
  switch (cloud) {
    case 'government': return 'https://graph.microsoft.us/v1.0';
    case 'dod':        return 'https://dod-graph.microsoft.us/v1.0';
    case 'china':      return 'https://microsoftgraph.chinacloudapi.cn/v1.0';
    default:           return 'https://graph.microsoft.com/v1.0';
  }
}

/**
 * Wraps the GrapesJS HTML output in a full standalone HTML page including
 * the MSAL authentication bootstrap, page-metadata management and REST-API
 * form submission logic.
 */
function buildPageHtml(pageName: string, gjsData: string, site: Site): string {
  let bodyHtml = '<p>Empty page</p>';
  try {
    const data = JSON.parse(gjsData) as { html?: string; css?: string };
    const css = data.css ? `<style>${data.css}</style>` : '';
    bodyHtml = `${css}${data.html ?? ''}`;
  } catch {
    // gjsData is not yet populated – use placeholder
  }

  const { tenantId, clientId, redirectUri, cloud, scopes, metadataFields, graphApiQueries, apiPreloadQueries } =
    site.azureConfig;
  const authorityBase = cloud === 'commercial' ? 'login.microsoftonline.com' : 'login.microsoftonline.us';
  const graphBase     = getGraphApiBase(cloud);

  // ── Static metadata injection ─────────────────────────────────────────────
  const staticMetadataLines = (metadataFields ?? [])
    .filter((f) => f.key)
    .map((f) => `  __pageMetadata[${JSON.stringify(f.key)}] = ${JSON.stringify(f.value)};`)
    .join('\n');

  // ── Graph API fetch calls ─────────────────────────────────────────────────
  const graphFetchLines = (graphApiQueries ?? [])
    .filter((q) => q.name && q.endpoint)
    .map((q, idx) => {
      const params: string[] = [];
      if (q.select) params.push(`$select=${encodeURIComponent(q.select)}`);
      if (q.filter) params.push(`$filter=${encodeURIComponent(q.filter)}`);
      const qs = params.length ? '?' + params.join('&') : '';
      // Use an indexed variable name to avoid invalid JS identifiers from query.name
      return `  try {
    var __resp${idx} = await fetch(${JSON.stringify(graphBase + q.endpoint + qs)}, { headers: __headers });
    __pageMetadata[${JSON.stringify(q.name)}] = await __resp${idx}.json();
  } catch(__e) { console.warn('Graph query ${q.name} failed:', __e); }`;
    })
    .join('\n');

  const scopesJson = JSON.stringify(scopes?.length ? scopes : ['User.Read']);

  // ── Generic API preload fetch calls ──────────────────────────────────────
  const apiPreloadLines = buildApiPreloadLines(apiPreloadQueries ?? [], scopesJson);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageName}</title>
  <!--
    MSAL Browser v5 – bundle @azure/msal-browser with your build tool or use the
    CDN URL below with a Subresource Integrity (SRI) hash appropriate for your
    chosen release: https://github.com/AzureAD/microsoft-authentication-library-for-js/releases
  -->
  <script src="https://alcdn.msauth.net/browser/5.10.0/js/msal-browser.min.js"
    integrity="sha384-REPLACE_WITH_ACTUAL_SRI_HASH_FOR_YOUR_VERSION"
    crossorigin="anonymous"></script>
</head>
<body>
${bodyHtml}
<script>
  // ── Page Metadata Store ────────────────────────────────────────────────────
  var __pageMetadata = {};

  // ── Global Page Data (populated by API preloads) ──────────────────────────
  window.__pageData = {};

${staticMetadataLines ? staticMetadataLines + '\n' : ''}
  // ── Graph API Fetch (called after MSAL token acquisition) ──────────────────
  async function __fetchGraphMetadata(accessToken) {
    var __headers = { Authorization: 'Bearer ' + accessToken };
${graphFetchLines}
    __prefillFormFields();
  }

  // ── Generic API Preload (called on DOMContentLoaded) ───────────────────────
  // Results are stored in window.__pageData and merged into __pageMetadata so
  // they are accessible via data-metadata-prefill attributes on form fields.
  async function __fetchApiPreloads() {
${apiPreloadLines}
    // Sync preloaded data into __pageMetadata for form-field pre-fill
    Object.keys(window.__pageData).forEach(function(k) {
      __pageMetadata[k] = window.__pageData[k];
    });
    __prefillFormFields();
  }

  // ── Metadata Pre-fill for Form Fields ─────────────────────────────────────
  // Reads data-metadata-prefill attributes and sets input values.
  // Supports dot-notation keys, e.g. "currentUser.mail".
  function __resolvePath(key) {
    return key.split('.').reduce(function(obj, k) { return obj != null ? obj[k] : undefined; }, __pageMetadata);
  }
  function __prefillFormFields() {
    document.querySelectorAll('[data-metadata-prefill]').forEach(function(el) {
      var key = el.getAttribute('data-metadata-prefill');
      if (!key) return;
      var val = __resolvePath(key);
      if (val !== undefined && val !== null) {
        el.value = typeof val === 'object' ? JSON.stringify(val) : String(val);
      }
    });
  }

  // ── REST API Form Submission Handler ──────────────────────────────────────
  function __initFormHandlers() {
    document.querySelectorAll('[data-api-form]').forEach(function(form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var url = form.getAttribute('data-api-url');
        if (!url) { console.warn('[API Form] data-api-url is not set on this form.'); return; }

        var method          = form.getAttribute('data-api-method') || 'POST';
        var includeAuth     = form.getAttribute('data-auth-header') !== 'false';
        var metadataInject  = (form.getAttribute('data-metadata-inject') || '').split(',').map(function(k) { return k.trim(); }).filter(Boolean);
        var successMessage  = form.getAttribute('data-success-message') || 'Form submitted successfully!';
        var successRedirect = form.getAttribute('data-success-redirect') || '';

        // Collect form field values.
        // When multiple inputs share the same name (e.g. checkboxes), the value
        // is first stored as a scalar and promoted to an array on subsequent
        // entries – mirrors standard HTML multi-value field behaviour.
        var body = {};
        new FormData(form).forEach(function(val, key) {
          if (Object.prototype.hasOwnProperty.call(body, key)) {
            body[key] = [].concat(body[key], val);
          } else {
            body[key] = val;
          }
        });

        // Inject metadata values (supports dot-notation)
        metadataInject.forEach(function(key) {
          var val = __resolvePath(key);
          if (val !== undefined) body[key] = val;
        });

        // Build request headers
        var headers = { 'Content-Type': 'application/json' };
        if (includeAuth) {
          var accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            try {
              var tokenResp = await msalInstance.acquireTokenSilent({ scopes: ${scopesJson}, account: accounts[0] });
              headers['Authorization'] = 'Bearer ' + tokenResp.accessToken;
            } catch(tokenErr) {
              console.warn('[API Form] Could not acquire token silently – you may need to sign in again.', tokenErr);
            }
          }
        }

        // Disable submit button during request
        var submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        try {
          var resp = await fetch(url, { method: method, headers: headers, body: JSON.stringify(body) });
          if (resp.ok) {
            if (successRedirect) {
              window.location.href = successRedirect;
            } else {
              alert(successMessage);
              form.reset();
            }
          } else {
            var statusMsg = resp.status === 401 ? 'Unauthorized – please sign in and try again.'
                          : resp.status === 403 ? 'Forbidden – you do not have permission to submit this form.'
                          : resp.status === 400 ? 'Bad request – please check your input and try again.'
                          : 'Submission failed (HTTP ' + resp.status + '). Please try again.';
            alert(statusMsg);
          }
        } catch(fetchErr) {
          console.error('[API Form] Submission error:', fetchErr);
          alert('A network error occurred. Please check your connection and try again.');
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    });
  }

  // ── MSAL Authentication Bootstrap ─────────────────────────────────────────
  var msalConfig = {
    auth: {
      clientId: '${clientId}',
      authority: 'https://${authorityBase}/${tenantId}',
      redirectUri: '${redirectUri}',
    },
    cache: { cacheLocation: 'sessionStorage', storeAuthStateInCookie: false },
  };
  var msalInstance = new msal.PublicClientApplication(msalConfig);
  msalInstance.initialize().then(async function() {
    var response = await msalInstance.handleRedirectPromise();
    if (response) {
      console.log('MSAL login response received:', response.account?.username);
    }

    // If a user is already signed in, fetch Graph metadata
    var accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      try {
        var tokenResponse = await msalInstance.acquireTokenSilent({ scopes: ${scopesJson}, account: accounts[0] });
        await __fetchGraphMetadata(tokenResponse.accessToken);
      } catch(silentErr) {
        console.warn('[MSAL] Could not acquire token silently:', silentErr);
        // Still prefill fields that have static metadata
        __prefillFormFields();
      }
    } else {
      // No authenticated user yet – still apply static metadata prefills
      __prefillFormFields();
    }
  });

  // Initialise form handlers, static metadata prefills, and generic API
  // preloads once the DOM is ready.  Graph API prefills happen later, inside
  // __fetchGraphMetadata, which runs after MSAL token acquisition.
  document.addEventListener('DOMContentLoaded', function() {
    __initFormHandlers();
    __prefillFormFields();
    __fetchApiPreloads();
  });
</script>
</body>
</html>`;
}

// ─── API Preload code-generation helper ──────────────────────────────────────

/**
 * Generates the inline JS statements for the __fetchApiPreloads function.
 * Each query fetches its configured URL, stores the JSON response in
 * window.__pageData under the query's name, and optionally includes a
 * MSAL Bearer token in the Authorization header.
 */
function buildApiPreloadLines(queries: ApiPreloadQuery[], scopesJson: string): string {
  const valid = queries.filter((q) => q.name && q.url);
  if (valid.length === 0) return '';

  const needsAuth = valid.some((q) => q.includeAuthHeader);

  const tokenBlock = needsAuth
    ? `    // Acquire MSAL token once for all auth-enabled preloads (best-effort)
    var __preloadToken = null;
    try {
      var __preloadAccounts = msalInstance.getAllAccounts();
      if (__preloadAccounts.length > 0) {
        var __preloadTokenResp = await msalInstance.acquireTokenSilent({ scopes: ${scopesJson}, account: __preloadAccounts[0] });
        __preloadToken = __preloadTokenResp.accessToken;
      }
    } catch(__tokenErr) {
      console.warn('[API Preload] Could not acquire MSAL token for authenticated preloads:', __tokenErr);
    }`
    : '';

  const fetchBlocks = valid
    .map((q, idx) => {
      const method = JSON.stringify((q.method && q.method.trim()) || 'GET');
      const authLine = q.includeAuthHeader
        ? `    var __preloadHeaders${idx} = __preloadToken ? { 'Authorization': 'Bearer ' + __preloadToken } : {};`
        : `    var __preloadHeaders${idx} = {};`;
      return `  try {
${authLine}
    var __preloadResp${idx} = await fetch(${JSON.stringify(q.url)}, { method: ${method}, headers: __preloadHeaders${idx} });
    window.__pageData[${JSON.stringify(q.name)}] = await __preloadResp${idx}.json();
  } catch(__preloadErr${idx}) {
    console.warn('[API Preload] ${q.name} failed:', __preloadErr${idx});
  }`;
    })
    .join('\n');

  return `${tokenBlock ? tokenBlock + '\n' : ''}${fetchBlocks}`;
}
