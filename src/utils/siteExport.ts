import JSZip from 'jszip';
import type { Site, SiteExportBundle } from '../types';

const EXPORT_VERSION = '2.0';

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
      siteConfig: site.siteConfig,
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
 *  - site.json  – the full bundle
 *  - pages/     – each page rendered as a standalone HTML file
 */
export async function downloadSiteZip(site: Site): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(sanitiseFilename(site.name))!;

  // Full bundle JSON
  folder.file('site.json', exportSiteAsJson(site));

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

  // Migrate v1 bundles that used azureConfig
  const site = bundle.site as Record<string, unknown>;
  if (!site.siteConfig && site.azureConfig) {
    const az = site.azureConfig as Record<string, unknown>;
    site.siteConfig = {
      apiPreloadQueries: az.graphApiQueries ?? [],
      metadataFields: az.metadataFields ?? [],
    };
  }
  if (!site.siteConfig) {
    site.siteConfig = { apiPreloadQueries: [], metadataFields: [] };
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
 * Wraps the GrapesJS HTML output in a full standalone HTML page including
 * API data preload on load, metadata management and REST-API form submission logic.
 * No cloud-provider dependencies – deployable to any static hosting environment.
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

  const { apiPreloadQueries, metadataFields } = site.siteConfig;

  // ── Static metadata injection ─────────────────────────────────────────────
  const staticMetadataLines = (metadataFields ?? [])
    .filter((f) => f.key)
    .map((f) => `  __pageMetadata[${JSON.stringify(f.key)}] = ${JSON.stringify(f.value)};`)
    .join('\n');

  // ── API preload fetch calls ───────────────────────────────────────────────
  const apiFetchLines = (apiPreloadQueries ?? [])
    .filter((q) => q.name && q.url)
    .map((q, idx) => {
      const method = q.method ?? 'GET';
      const headersJson = JSON.stringify(q.headers ?? {});
      return `  try {
    var __resp${idx} = await fetch(${JSON.stringify(q.url)}, { method: ${JSON.stringify(method)}, headers: ${headersJson} });
    __pageMetadata[${JSON.stringify(q.name)}] = await __resp${idx}.json();
  } catch(__e) { console.warn('API preload ${q.name} failed:', __e); }`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageName}</title>
</head>
<body>
${bodyHtml}
<script>
  // ── Page Metadata Store ────────────────────────────────────────────────────
  var __pageMetadata = {};

${staticMetadataLines ? staticMetadataLines + '\n' : ''}
  // ── API Data Preload ───────────────────────────────────────────────────────
  // Fetches configured API endpoints on page load and stores results in
  // __pageMetadata, then triggers form field pre-fill.
  async function __loadApiData() {
${apiFetchLines}
    __prefillFormFields();
  }

  // ── Metadata Pre-fill for Form Fields ─────────────────────────────────────
  // Reads data-metadata-prefill attributes and sets input values.
  // Supports dot-notation keys, e.g. "currentUser.email".
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

        var headers = { 'Content-Type': 'application/json' };

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
            var statusMsg = resp.status === 401 ? 'Unauthorized – please check your credentials.'
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

  // ── Initialisation ─────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    __initFormHandlers();
    __prefillFormFields();
    __loadApiData();
  });
</script>
</body>
</html>`;
}
