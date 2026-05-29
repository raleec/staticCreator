import type { ApiBuilderConfig, TableDefinition, TableColumn } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Deterministic UUID v4-like string (no crypto dependency). */
function uuid(seed: number): string {
  let s = seed;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const r = ((s >>> 0) * 16) >>> 28;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Pluralise and camelCase a PascalCase table name (e.g. "Product" → "products"). */
function pluralCamel(name: string): string {
  if (!name) return 'items';
  const camel = name.charAt(0).toLowerCase() + name.slice(1);
  if (camel.endsWith('s')) return camel;
  if (camel.endsWith('y') && !/[aeiou]y$/i.test(camel)) return camel.slice(0, -1) + 'ies';
  return camel + 's';
}

/** Produce camelCase service name prefix (same as the URL path segment). */
function serviceCamel(name: string): string {
  if (!name) return 'service';
  return name.charAt(0).toLowerCase() + name.slice(1);
}

// ─── Value generation ─────────────────────────────────────────────────────────

/**
 * Generates a realistic mock value for a column based on its type and name.
 * `rowIdx` is 0-based and used for deterministic variation between rows.
 */
function generateMockValue(col: TableColumn, tableName: string, rowIdx: number): unknown {
  const n = col.name.toLowerCase();

  // Occasionally return null for nullable columns (every 4th row)
  if (col.nullable && !col.isPrimaryKey && rowIdx % 4 === 3) return null;

  switch (col.type) {
    case 'guid':
      return uuid(rowIdx * 31337 + col.name.length * 17 + tableName.length);

    case 'boolean':
      return rowIdx % 2 === 0;

    case 'datetime': {
      const d = new Date('2024-01-01T00:00:00.000Z');
      d.setDate(d.getDate() + rowIdx * 13);
      return d.toISOString();
    }

    case 'int': {
      if (/count|quantity|stock|qty|inventory/.test(n)) return (rowIdx + 1) * 10;
      if (/age/.test(n)) return 25 + (rowIdx % 40);
      if (/year/.test(n)) return 2020 + (rowIdx % 6);
      if (/order|seq|number|num|index|rank/.test(n)) return 1000 + rowIdx + 1;
      if (/score|point|rating/.test(n)) return (rowIdx % 5) + 1;
      if (/size|width|height|length/.test(n)) return 10 + rowIdx * 5;
      return rowIdx + 1;
    }

    case 'decimal': {
      if (/price|cost|amount|total|subtotal|fee|charge/.test(n)) return +((rowIdx + 1) * 9.99).toFixed(2);
      if (/rate|percent|pct|ratio/.test(n)) return +((rowIdx % 10) * 0.1 + 0.05).toFixed(4);
      if (/lat(itude)?$/.test(n)) return +((40.7128 + rowIdx * 0.01)).toFixed(6);
      if (/lon(gitude)?$|lng$/.test(n)) return +((-74.006 + rowIdx * 0.01)).toFixed(6);
      if (/weight|mass/.test(n)) return +((rowIdx + 1) * 1.5).toFixed(3);
      if (/discount/.test(n)) return +((rowIdx % 5) * 5).toFixed(2);
      return +((rowIdx + 1) * 1.25).toFixed(2);
    }

    case 'string': {
      if (/^id$/.test(n)) return `${tableName.toUpperCase().slice(0, 3)}-${String(rowIdx + 1).padStart(4, '0')}`;
      if (/email/.test(n)) return `user${rowIdx + 1}@example.com`;
      if (/phone|tel(ephone)?/.test(n)) return `+1-555-${String(1000 + rowIdx).slice(-4)}`;
      if (/url|website|link|href|src/.test(n)) return `https://example.com/${pluralCamel(tableName)}/${rowIdx + 1}`;
      if (/image|photo|avatar|picture|img/.test(n)) return `https://picsum.photos/seed/${tableName}${rowIdx}/200/200`;
      if (/colou?r/.test(n)) return ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'][rowIdx % 6];
      if (/status|state/.test(n)) return ['Active', 'Inactive', 'Pending', 'Archived'][rowIdx % 4];
      if (/type|category|kind|class|group|tag/.test(n)) return `Category ${String.fromCharCode(65 + (rowIdx % 5))}`;
      if (/code|sku|ref(erence)?|serial|barcode/.test(n)) return `${tableName.toUpperCase().slice(0, 3)}-${String(rowIdx + 1).padStart(4, '0')}`;
      if (/slug|handle/.test(n)) return `${tableName.toLowerCase()}-${rowIdx + 1}`;
      if (/desc(ription)?|note|comment|remark|summar|detail|bio|content/.test(n)) {
        return `This is a sample description for ${tableName} ${rowIdx + 1}.`;
      }
      if (/first.?name|firstname|given.?name/.test(n)) return ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan'][rowIdx % 5];
      if (/last.?name|lastname|surname|family.?name/.test(n)) return ['Smith', 'Jones', 'Williams', 'Brown', 'Davis'][rowIdx % 5];
      if (/full.?name|display.?name/.test(n)) {
        const first = ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan'][rowIdx % 5];
        const last  = ['Smith', 'Jones', 'Williams', 'Brown', 'Davis'][rowIdx % 5];
        return `${first} ${last}`;
      }
      if (/name|title|label|heading|subject/.test(n)) return `${tableName} Item ${rowIdx + 1}`;
      if (/address|street|addr/.test(n)) return `${(rowIdx + 1) * 123} Main Street`;
      if (/city|town/.test(n)) return ['New York', 'London', 'Paris', 'Toronto', 'Sydney'][rowIdx % 5];
      if (/state|province|region/.test(n)) return ['NY', 'CA', 'TX', 'FL', 'WA'][rowIdx % 5];
      if (/country|nation/.test(n)) return ['USA', 'UK', 'France', 'Canada', 'Australia'][rowIdx % 5];
      if (/zip|postal/.test(n)) return `${String(10001 + rowIdx * 111)}`;
      if (/currency/.test(n)) return ['USD', 'EUR', 'GBP', 'CAD', 'AUD'][rowIdx % 5];
      if (/language|locale|lang/.test(n)) return ['en-US', 'fr-FR', 'de-DE', 'ja-JP', 'es-ES'][rowIdx % 5];
      if (/version|ver|revision/.test(n)) return `${rowIdx + 1}.0.0`;
      if (/hash|token|secret|key|password/.test(n)) return `<redacted>`;
      return `Sample ${col.name} ${rowIdx + 1}`;
    }

    default:
      return `${col.name}_${rowIdx + 1}`;
  }
}

/** Generates `count` mock rows for a single table. */
function generateMockRows(table: TableDefinition, count: number): Record<string, unknown>[] {
  return Array.from({ length: count }, (_, i) => {
    const row: Record<string, unknown> = {};
    for (const col of table.columns) {
      // Convert PascalCase property name to camelCase JSON key
      const key = col.name.charAt(0).toLowerCase() + col.name.slice(1);
      row[key] = generateMockValue(col, table.name, i);
    }
    return row;
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generates mock data for every table in an ApiBuilderConfig.
 * Returns a plain object keyed by plural camelCase table name
 * (e.g. "Product" → "products").
 */
export function generateMockData(
  cfg: ApiBuilderConfig,
  rowsPerTable = 5,
): Record<string, unknown[]> {
  const data: Record<string, unknown[]> = {};
  for (const table of cfg.tables) {
    data[pluralCamel(table.name)] = generateMockRows(table, rowsPerTable);
  }
  return data;
}

/**
 * Generates a self-contained JavaScript seed script that:
 *  1. Stores the provided mock data in `localStorage` on first load.
 *  2. Patches `window.fetch` to intercept calls to the configured API base
 *     path and serve the data from localStorage instead of a real backend.
 *  3. Supports all five CRUD operations:
 *       GET  .../list        → { items, totalCount }
 *       GET  .../:id         → single item or 404
 *       POST .../create      → created item (201)
 *       PUT  .../:id         → replaced item (200)
 *       DELETE .../:id       → 204 No Content
 */
export function generateSeedScript(
  cfg: ApiBuilderConfig,
  data: Record<string, unknown[]>,
): string {
  const svcCamel = serviceCamel(cfg.serviceName);
  const basePath = `${cfg.baseUrl.replace(/\/$/, '')}/${cfg.version}/${svcCamel}`;
  const lsKey    = `mock__${cfg.serviceName}`;
  const seedJson = JSON.stringify(data, null, 2);
  const fileName = `${cfg.serviceName.toLowerCase()}-mock-sim.js`;

  return `/**
 * Mock Data Simulator – generated by StaticCreator API Builder
 * ─────────────────────────────────────────────────────────────
 * Service : ${cfg.serviceName} (${cfg.version})
 * Base URL: ${basePath}
 * Generated: ${new Date().toISOString()}
 *
 * USAGE
 * ─────
 * Include this script in your HTML page BEFORE any code that calls the API:
 *
 *   <script src="${fileName}"></script>
 *
 * The script patches window.fetch to intercept requests whose URL starts with
 * the base path above and serves the stored data from localStorage. All write
 * operations (POST, PUT, DELETE) are persisted back to localStorage so the
 * state survives page refreshes.
 *
 * RESETTING DATA
 * ──────────────
 * Open the browser console and run:
 *   localStorage.removeItem('${lsKey}');
 * then reload the page to restore the original seed data.
 *
 * ROUTE REFERENCE
 * ───────────────
 * The following routes are intercepted (replace <table> with the plural
 * camelCase entity name, e.g. "products"):
 *
 *   GET    ${basePath}/<table>/list      → { items: [...], totalCount: N }
 *   GET    ${basePath}/<table>/:id       → single item  |  404
 *   POST   ${basePath}/<table>/create    → created item (201)
 *   PUT    ${basePath}/<table>/:id       → replaced item (200)
 *   DELETE ${basePath}/<table>/:id       → 204 No Content
 */
(function () {
  'use strict';

  var SERVICE   = '${cfg.serviceName}';
  var BASE_PATH = '${basePath}';
  var LS_KEY    = '${lsKey}';

  /* ── Seed data ──────────────────────────────────────────────────────────── */
  var SEED = ${seedJson};

  /* ── Storage helpers ────────────────────────────────────────────────────── */
  function load() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') || SEED; }
    catch (_) { return SEED; }
  }
  function save(db) {
    localStorage.setItem(LS_KEY, JSON.stringify(db));
  }

  /* Seed localStorage on first load (preserves any changes from earlier runs) */
  if (!localStorage.getItem(LS_KEY)) save(SEED);

  /* ── Response helpers ───────────────────────────────────────────────────── */
  function jsonResponse(body, status) {
    return Promise.resolve(new Response(JSON.stringify(body), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
  function emptyResponse(status) {
    return Promise.resolve(new Response(null, { status: status || 204 }));
  }
  function readBody(init) {
    if (!init || !init.body) return Promise.resolve('{}');
    var b = init.body;
    if (typeof b === 'string') return Promise.resolve(b);
    if (b instanceof Blob) return b.text();
    if (b instanceof ArrayBuffer) return Promise.resolve(new TextDecoder().decode(b));
    /* ReadableStream / FormData – best-effort */
    try { return new Response(b).text(); } catch (_) { return Promise.resolve('{}'); }
  }

  /* ── Fetch interceptor ──────────────────────────────────────────────────── */
  var _fetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input
            : (input instanceof URL)    ? input.href
            :                             input.url;
    var method = ((init && init.method) || 'GET').toUpperCase();

    /* Pass through anything that doesn't target this mock service */
    if (!url.startsWith(BASE_PATH)) return _fetch(input, init);

    var relative = url.slice(BASE_PATH.length).replace(/^\\//, '');
    var parts    = relative.split('/').filter(Boolean);
    var table    = parts[0];   /* e.g. "products" */
    var segment  = parts[1];   /* "list" | "create" | <id> | undefined */

    var db = load();
    if (!table || !Object.prototype.hasOwnProperty.call(db, table)) {
      return _fetch(input, init);
    }

    /* GET .../list */
    if (method === 'GET' && segment === 'list') {
      var items = db[table].slice();
      return jsonResponse({ items: items, totalCount: items.length });
    }

    /* GET .../:id */
    if (method === 'GET' && segment && segment !== 'list' && segment !== 'create') {
      var found = null;
      for (var i = 0; i < db[table].length; i++) {
        if (String(db[table][i].id) === segment) { found = db[table][i]; break; }
      }
      return found ? jsonResponse(found) : jsonResponse({ error: 'Not found' }, 404);
    }

    /* POST .../create */
    if (method === 'POST' && segment === 'create') {
      return readBody(init).then(function (txt) {
        var body;
        try { body = JSON.parse(txt || '{}'); } catch (_) { body = {}; }
        if (!body.id) {
          body.id = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2);
        }
        db[table].push(body);
        save(db);
        return jsonResponse(body, 201);
      });
    }

    /* PUT .../:id */
    if (method === 'PUT' && segment) {
      return readBody(init).then(function (txt) {
        var body;
        try { body = JSON.parse(txt || '{}'); } catch (_) { body = {}; }
        var idx = -1;
        for (var j = 0; j < db[table].length; j++) {
          if (String(db[table][j].id) === segment) { idx = j; break; }
        }
        if (idx === -1) return jsonResponse({ error: 'Not found' }, 404);
        db[table][idx] = Object.assign({}, db[table][idx], body, { id: segment });
        save(db);
        return jsonResponse(db[table][idx]);
      });
    }

    /* DELETE .../:id */
    if (method === 'DELETE' && segment) {
      var delIdx = -1;
      for (var k = 0; k < db[table].length; k++) {
        if (String(db[table][k].id) === segment) { delIdx = k; break; }
      }
      if (delIdx === -1) return jsonResponse({ error: 'Not found' }, 404);
      db[table].splice(delIdx, 1);
      save(db);
      return emptyResponse(204);
    }

    return _fetch(input, init);
  };

  console.info(
    '[MockSim] ' + SERVICE + ' active — ' + Object.keys(SEED).length + ' table(s) ' +
    'stored in localStorage under key "' + LS_KEY + '"'
  );
}());
`;
}

/**
 * Triggers a browser download of the mock data as a JSON file.
 * Filename: `{serviceName}-mock-data.json`
 */
export function downloadMockDataJson(
  cfg: ApiBuilderConfig,
  data: Record<string, unknown[]>,
): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  triggerDownload(blob, `${cfg.serviceName.toLowerCase()}-mock-data.json`);
}

/**
 * Generates and triggers a browser download of the localStorage seed script.
 * Filename: `{serviceName}-mock-sim.js`
 */
export function downloadSeedScript(
  cfg: ApiBuilderConfig,
  data: Record<string, unknown[]>,
): void {
  const script = generateSeedScript(cfg, data);
  const blob = new Blob([script], { type: 'text/javascript' });
  triggerDownload(blob, `${cfg.serviceName.toLowerCase()}-mock-sim.js`);
}

// ─── Internal ─────────────────────────────────────────────────────────────────

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
