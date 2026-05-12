import JSZip from 'jszip';
import type { Site, SiteExportBundle } from '../types';

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
 * Wraps the GrapesJS HTML output in a full standalone HTML page including
 * the MSAL authentication bootstrap.
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

  const { tenantId, clientId, redirectUri, cloud } = site.azureConfig;
  const authorityBase = cloud === 'commercial' ? 'login.microsoftonline.com' : 'login.microsoftonline.us';

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
  // MSAL Authentication Bootstrap
  const msalConfig = {
    auth: {
      clientId: '${clientId}',
      authority: 'https://${authorityBase}/${tenantId}',
      redirectUri: '${redirectUri}',
    },
    cache: { cacheLocation: 'sessionStorage', storeAuthStateInCookie: false },
  };
  const msalInstance = new msal.PublicClientApplication(msalConfig);
  msalInstance.initialize().then(() => {
    msalInstance.handleRedirectPromise().then((response) => {
      if (response) {
        console.log('MSAL login response received:', response.account?.username);
      }
    });
  });
</script>
</body>
</html>`;
}
