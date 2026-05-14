import { useState, useRef } from 'react';
import { X, Plus, Trash2, Download, Upload, Save, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import type { ApiBuilderConfig, TableDefinition, TableColumn, ColumnType } from '../../types';
import { downloadApiBuilderZip, downloadApiConfigJson, importApiConfigFromFile } from '../../utils/apiBuilder';
import { parseSqlTableDef } from '../../utils/sqlTableParser';

interface ApiBuilderModalProps {
  onClose: () => void;
}

const COLUMN_TYPES: ColumnType[] = ['string', 'int', 'decimal', 'boolean', 'datetime', 'guid'];

const COLUMN_TYPE_LABELS: Record<ColumnType, string> = {
  string:   'String (varchar)',
  int:      'Integer (int)',
  decimal:  'Decimal (numeric)',
  boolean:  'Boolean (bit)',
  datetime: 'DateTime (datetimeoffset)',
  guid:     'GUID (uniqueidentifier)',
};

function makeColumn(overrides?: Partial<TableColumn>): TableColumn {
  return {
    name: '',
    type: 'string',
    nullable: false,
    isPrimaryKey: false,
    description: '',
    ...overrides,
  };
}

function makeTable(overrides?: Partial<TableDefinition>): TableDefinition {
  return {
    name: '',
    description: '',
    columns: [makeColumn({ name: 'Id', type: 'guid', isPrimaryKey: true, nullable: false })],
    ...overrides,
  };
}

export default function ApiBuilderModal({ onClose }: ApiBuilderModalProps) {
  const [serviceName, setServiceName] = useState('MyService');
  const [version, setVersion] = useState('v1');
  const [baseUrl, setBaseUrl] = useState('https://api.example.com');
  const [tables, setTables] = useState<TableDefinition[]>([
    makeTable({ name: 'Item', description: 'An example entity.', columns: [
      makeColumn({ name: 'Id', type: 'guid', isPrimaryKey: true, nullable: false }),
      makeColumn({ name: 'Name', type: 'string', nullable: false }),
      makeColumn({ name: 'CreatedAt', type: 'datetime', nullable: false }),
    ]}),
  ]);
  const [expandedTable, setExpandedTable] = useState<number>(0);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  /** Per-table: whether the "Import from SQL" panel is open. */
  const [importOpen, setImportOpen] = useState<Record<number, boolean>>({});
  /** Per-table: the raw SQL text pasted by the user. */
  const [importText, setImportText] = useState<Record<number, string>>({});
  /** Per-table: error message from the last import attempt. */
  const [importError, setImportError] = useState<Record<number, string>>({});
  /** Ref for the hidden file input used to import a saved config. */
  const importConfigRef = useRef<HTMLInputElement>(null);

  function clearError(key: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!serviceName.trim()) errs.serviceName = 'Service name is required';
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(serviceName.trim())) {
      errs.serviceName = 'Use letters, digits, and underscores only (must start with a letter)';
    }
    if (!version.trim()) errs.version = 'Version is required (e.g. v1)';
    if (!baseUrl.trim()) errs.baseUrl = 'Base URL is required';
    if (tables.length === 0) errs.tables = 'At least one table is required';

    tables.forEach((t, ti) => {
      if (!t.name.trim()) errs[`table-${ti}-name`] = 'Table name is required';
      else if (!/^[A-Z][a-zA-Z0-9]*$/.test(t.name.trim())) {
        errs[`table-${ti}-name`] = 'Use PascalCase (e.g. Product)';
      }

      const pkCount = t.columns.filter((c) => c.isPrimaryKey).length;
      if (pkCount === 0) errs[`table-${ti}-pk`] = 'Each table needs exactly one primary key column';
      if (pkCount > 1)   errs[`table-${ti}-pk`] = 'Only one primary key column is allowed per table';

      t.columns.forEach((col, ci) => {
        if (!col.name.trim()) errs[`col-${ti}-${ci}-name`] = 'Column name is required';
        else if (!/^[A-Z][a-zA-Z0-9]*$/.test(col.name.trim())) {
          errs[`col-${ti}-${ci}-name`] = 'Use PascalCase (e.g. FirstName)';
        }
      });
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Table mutations ───────────────────────────────────────────────────────

  function addTable() {
    const next = [...tables, makeTable({ name: `Entity${tables.length + 1}` })];
    setTables(next);
    setExpandedTable(next.length - 1);
  }

  function removeTable(idx: number) {
    setTables(tables.filter((_, i) => i !== idx));
    setExpandedTable(Math.max(0, idx - 1));
  }

  function updateTable(idx: number, patch: Partial<TableDefinition>) {
    setTables(tables.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
    clearTableErrors(idx);
  }

  function clearTableErrors(idx: number) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`table-${idx}-name`];
      delete next[`table-${idx}-pk`];
      return next;
    });
  }

  // ── Column mutations ──────────────────────────────────────────────────────

  function addColumn(tIdx: number) {
    const updated = [...tables];
    updated[tIdx] = { ...updated[tIdx], columns: [...updated[tIdx].columns, makeColumn()] };
    setTables(updated);
  }

  function removeColumn(tIdx: number, cIdx: number) {
    const updated = [...tables];
    updated[tIdx] = { ...updated[tIdx], columns: updated[tIdx].columns.filter((_, i) => i !== cIdx) };
    setTables(updated);
  }

  function updateColumn(tIdx: number, cIdx: number, patch: Partial<TableColumn>) {
    const updated = [...tables];
    const cols = updated[tIdx].columns.map((c, i) => (i === cIdx ? { ...c, ...patch } : c));
    updated[tIdx] = { ...updated[tIdx], columns: cols };
    setTables(updated);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`col-${tIdx}-${cIdx}-name`];
      return next;
    });
  }

  // ── SQL Import ────────────────────────────────────────────────────────────

  function importColumns(tIdx: number) {
    const sql = importText[tIdx] ?? '';
    if (!sql.trim()) {
      setImportError((prev) => ({ ...prev, [tIdx]: 'Paste a SQL column definition first.' }));
      return;
    }
    const parsed = parseSqlTableDef(sql);
    if (parsed.length === 0) {
      setImportError((prev) => ({ ...prev, [tIdx]: 'No columns could be parsed. Check the format and try again.' }));
      return;
    }
    // Keep existing PK column(s); add parsed columns, skipping any whose name
    // matches an existing PK column to avoid duplicates.
    const existing = tables[tIdx].columns;
    const pkCols = existing.filter((c) => c.isPrimaryKey);
    const pkNames = new Set(pkCols.map((c) => c.name.toLowerCase()));
    const dedupedParsed = parsed.filter((c) => !pkNames.has(c.name.toLowerCase()));
    const merged = [...pkCols, ...dedupedParsed];
    updateTable(tIdx, { columns: merged });
    setImportError((prev) => { const n = { ...prev }; delete n[tIdx]; return n; });
    setImportText((prev) => ({ ...prev, [tIdx]: '' }));
    setImportOpen((prev) => ({ ...prev, [tIdx]: false }));
  }

  // ── Import / Export config ────────────────────────────────────────────────

  function loadConfig(cfg: ApiBuilderConfig) {
    setServiceName(cfg.serviceName);
    setVersion(cfg.version);
    setBaseUrl(cfg.baseUrl);
    setTables(cfg.tables);
    setExpandedTable(0);
    setErrors({});
    setImportOpen({});
    setImportText({});
    setImportError({});
  }

  async function handleImportConfig(file: File) {
    try {
      const cfg = await importApiConfigFromFile(file);
      loadConfig(cfg);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(
        `Import failed: ${message}\n\n` +
          'The file must be a JSON export saved with the "Save Config" button, ' +
          'or a plain JSON object with the fields: serviceName, version, baseUrl, tables.',
      );
    }
  }

  function handleExportConfig() {
    const cfg: ApiBuilderConfig = {
      serviceName: serviceName.trim(),
      version: version.trim(),
      baseUrl: baseUrl.trim(),
      tables,
    };
    downloadApiConfigJson(cfg);
  }

  // ── Generate & Download ───────────────────────────────────────────────────

  async function handleGenerate() {
    if (!validate()) return;
    setGenerating(true);
    try {
      const cfg: ApiBuilderConfig = {
        serviceName: serviceName.trim(),
        version: version.trim(),
        baseUrl: baseUrl.trim(),
        tables,
      };
      await downloadApiBuilderZip(cfg);
    } finally {
      setGenerating(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">API Builder</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Define your data tables and generate an OpenAPI spec + .NET 8 isolated Function App.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Hidden file input for config import */}
            <input
              ref={importConfigRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportConfig(file);
                // Reset so the same file can be re-selected if needed.
                e.target.value = '';
              }}
            />
            <button
              onClick={() => importConfigRef.current?.click()}
              title="Import a previously saved API config"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import Config
            </button>
            <button
              onClick={handleExportConfig}
              title="Save current config as JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Config
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Service settings ─────────────────────────────────────────── */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Service Settings</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => { setServiceName(e.target.value); clearError('serviceName'); }}
                  placeholder="MyService"
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.serviceName ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.serviceName && <p className="text-xs text-red-500 mt-1">{errors.serviceName}</p>}
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => { setVersion(e.target.value); clearError('version'); }}
                  placeholder="v1"
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.version ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.version && <p className="text-xs text-red-500 mt-1">{errors.version}</p>}
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => { setBaseUrl(e.target.value); clearError('baseUrl'); }}
                  placeholder="https://api.example.com"
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.baseUrl ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.baseUrl && <p className="text-xs text-red-500 mt-1">{errors.baseUrl}</p>}
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700 space-y-1">
              <p><strong>URL pattern:</strong> <code>{baseUrl.replace(/\/$/, '')}/{version}/{camelPreview(serviceName)}/&lt;table&gt;s</code></p>
              <p>Each table gets <strong>GET /list</strong>, <strong>POST /create</strong>, <strong>GET /:id</strong>, <strong>PUT /:id</strong>, <strong>DELETE /:id</strong> endpoints.</p>
            </div>
          </section>

          {/* ── Tables ───────────────────────────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tables / Entities</h3>
              <button
                onClick={addTable}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Table
              </button>
            </div>

            {errors.tables && <p className="text-xs text-red-500">{errors.tables}</p>}

            {tables.map((table, tIdx) => (
              <div key={tIdx} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Table header bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <button
                    onClick={() => setExpandedTable(expandedTable === tIdx ? -1 : tIdx)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {expandedTable === tIdx
                      ? <ChevronDown className="w-4 h-4 text-gray-400" />
                      : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <span className="font-medium text-sm text-gray-700">
                      {table.name || <span className="text-gray-400 italic">Unnamed table</span>}
                    </span>
                    <span className="text-xs text-gray-400">({table.columns.length} column{table.columns.length !== 1 ? 's' : ''})</span>
                  </button>
                  {tables.length > 1 && (
                    <button onClick={() => removeTable(tIdx)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {expandedTable === tIdx && (
                  <div className="px-4 py-4 space-y-4">
                    {/* Table meta */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Table Name (PascalCase, singular) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={table.name}
                          onChange={(e) => updateTable(tIdx, { name: e.target.value })}
                          placeholder="Product"
                          className={`w-full text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`table-${tIdx}-name`] ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errors[`table-${tIdx}-name`] && <p className="text-xs text-red-500 mt-1">{errors[`table-${tIdx}-name`]}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <input
                          type="text"
                          value={table.description ?? ''}
                          onChange={(e) => updateTable(tIdx, { description: e.target.value })}
                          placeholder="Short description for the OpenAPI spec"
                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {errors[`table-${tIdx}-pk`] && (
                      <p className="text-xs text-red-500">{errors[`table-${tIdx}-pk`]}</p>
                    )}

                    {/* SQL Import panel */}
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => setImportOpen((prev) => ({ ...prev, [tIdx]: !prev[tIdx] }))}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {importOpen[tIdx] ? 'Hide SQL Import' : 'Import columns from SQL definition'}
                        {importOpen[tIdx]
                          ? <ChevronDown className="w-3.5 h-3.5 ml-auto" />
                          : <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                      </button>

                      {importOpen[tIdx] && (
                        <div className="px-3 pb-3 space-y-2">
                          <p className="text-xs text-gray-500">
                            Paste the column list from a SQL Server <code>CREATE TABLE</code> statement
                            (including or excluding the outer parentheses). Existing primary key
                            columns are preserved; all other columns are replaced.
                          </p>
                          <textarea
                            rows={8}
                            value={importText[tIdx] ?? ''}
                            onChange={(e) => {
                              setImportText((prev) => ({ ...prev, [tIdx]: e.target.value }));
                              setImportError((prev) => { const n = { ...prev }; delete n[tIdx]; return n; });
                            }}
                            placeholder={`[ColumnName] [nvarchar](255) NULL,\n[Amount]     [decimal](18,2) NOT NULL,\n[CreatedAt]  [datetime2]    NOT NULL`}
                            className="w-full text-xs font-mono border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                            spellCheck={false}
                          />
                          {importError[tIdx] && (
                            <p className="text-xs text-red-500">{importError[tIdx]}</p>
                          )}
                          <button
                            type="button"
                            onClick={() => importColumns(tIdx)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Import Columns
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Columns */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">Columns</p>

                      {/* Column header labels */}
                      <div className="grid gap-2 text-xs font-medium text-gray-400 px-1" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto' }}>
                        <span>Name</span>
                        <span>Type</span>
                        <span className="text-center">Nullable</span>
                        <span className="text-center">Primary Key</span>
                        <span />
                      </div>

                      {table.columns.map((col, cIdx) => (
                        <div key={cIdx} className="grid gap-2 items-start" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto' }}>
                          <div>
                            <input
                              type="text"
                              value={col.name}
                              onChange={(e) => updateColumn(tIdx, cIdx, { name: e.target.value })}
                              placeholder="ColumnName"
                              className={`w-full text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`col-${tIdx}-${cIdx}-name`] ? 'border-red-400' : 'border-gray-300'}`}
                            />
                            {errors[`col-${tIdx}-${cIdx}-name`] && (
                              <p className="text-xs text-red-500 mt-0.5">{errors[`col-${tIdx}-${cIdx}-name`]}</p>
                            )}
                          </div>

                          <select
                            value={col.type}
                            onChange={(e) => updateColumn(tIdx, cIdx, { type: e.target.value as ColumnType })}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            {COLUMN_TYPES.map((t) => (
                              <option key={t} value={t}>{COLUMN_TYPE_LABELS[t]}</option>
                            ))}
                          </select>

                          <div className="flex justify-center pt-2">
                            <input
                              type="checkbox"
                              checked={col.nullable}
                              onChange={(e) => updateColumn(tIdx, cIdx, { nullable: e.target.checked })}
                              disabled={col.isPrimaryKey}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>

                          <div className="flex justify-center pt-2">
                            <input
                              type="checkbox"
                              checked={col.isPrimaryKey}
                              onChange={(e) => {
                                // Ensure only one PK at a time
                                const cols = table.columns.map((c, i) =>
                                  i === cIdx
                                    ? { ...c, isPrimaryKey: e.target.checked, nullable: false }
                                    : e.target.checked ? { ...c, isPrimaryKey: false } : c
                                );
                                updateTable(tIdx, { columns: cols });
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>

                          <button
                            onClick={() => removeColumn(tIdx, cIdx)}
                            disabled={table.columns.length <= 1}
                            className="mt-1.5 p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => addColumn(tIdx)}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Column
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* ── What gets generated ──────────────────────────────────────── */}
          <section className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-gray-600">Generated output (ZIP):</p>
            <ul className="text-xs text-gray-500 space-y-0.5 list-disc ml-4">
              <li><code>openapi.yaml</code> — OpenAPI 3.0.3 contract (contract-first)</li>
              <li><code>{serviceName || 'Service'}.csproj</code> — .NET 8 isolated Functions project</li>
              <li><code>Program.cs</code> — Host builder with OpenAPI registration</li>
              <li><code>host.json</code> / <code>local.settings.json</code> — Function App config</li>
              {tables.map((t, i) => (
                <li key={i}><code>Models/{t.name || 'Entity'}.cs</code> and <code>Functions/{t.name || 'Entity'}Functions.cs</code></li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            <Download className="w-4 h-4" />
            {generating ? 'Generating…' : 'Generate & Download ZIP'}
          </button>
        </div>
      </div>
    </div>
  );
}

function camelPreview(s: string): string {
  const trimmed = s.trim();
  if (!trimmed) return '<service>';
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}
