import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { SiteConfig, ApiPreloadQuery, MetadataField } from '../../types';
import { DEFAULT_SITE_CONFIG } from '../../contexts/SiteContext';

interface ConfigModalProps {
  onClose: () => void;
  initialConfig?: SiteConfig;
  siteName?: string;
  siteDescription?: string;
  onSave: (name: string, description: string, config: SiteConfig) => void;
  mode?: 'create' | 'edit';
}

/**
 * ConfigModal is rendered only when open (parents conditionally mount it).
 * State is initialised once from props on first render.
 */
export default function ConfigModal({
  onClose,
  initialConfig,
  siteName = '',
  siteDescription = '',
  onSave,
  mode = 'create',
}: ConfigModalProps) {
  const [name, setName] = useState(siteName);
  const [description, setDescription] = useState(siteDescription);
  const [config, setConfig] = useState<SiteConfig>(
    initialConfig ?? DEFAULT_SITE_CONFIG,
  );
  const [activeTab, setActiveTab] = useState<'general' | 'preload' | 'forms'>('general');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateConfig<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Site name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave(name.trim(), description.trim(), config);
    onClose();
  }

  const tabClass = (tab: typeof activeTab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'create' ? 'New Site Configuration' : 'Edit Site Configuration'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {(['general', 'preload', 'forms'] as const).map((tab) => (
            <button key={tab} className={tabClass(tab)} onClick={() => setActiveTab(tab)}>
              {tab === 'preload' ? 'Data Preload' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* ── General Tab ─────────────────────────────────────────────────── */}
          {activeTab === 'general' && (
            <>
              <Field label="Site Name" error={errors.name} required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((er) => { const n = { ...er }; delete n.name; return n; });
                  }}
                  placeholder="My Static Site"
                  className={inputCls(!!errors.name)}
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe this site…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </Field>
              <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                <p className="font-medium mb-1">Deploy anywhere</p>
                <p className="text-blue-600">
                  Pages exported from this site are standalone HTML files with no cloud-provider
                  dependencies. Host them on any static server, CDN, or file system.
                </p>
              </div>
            </>
          )}

          {/* ── Data Preload Tab ─────────────────────────────────────────────── */}
          {activeTab === 'preload' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">API Preload Queries</p>
                    <p className="text-xs text-gray-400">
                      These API endpoints are fetched on page load. Results are stored by{' '}
                      <span className="font-mono">name</span> in{' '}
                      <span className="font-mono">__pageMetadata</span> and are usable for
                      form field pre-fill (e.g.{' '}
                      <span className="font-mono">userData.email</span>).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated: ApiPreloadQuery[] = [
                        ...(config.apiPreloadQueries ?? []),
                        { name: '', url: '', method: 'GET' },
                      ];
                      updateConfig('apiPreloadQueries', updated);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium shrink-0"
                  >
                    <Plus className="w-3 h-3" /> Add Query
                  </button>
                </div>
                {(config.apiPreloadQueries ?? []).length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-1">No API preload queries configured.</p>
                ) : (
                  <div className="space-y-3">
                    {(config.apiPreloadQueries ?? []).map((query, i) => (
                      <div
                        key={i}
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Query {i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateConfig(
                                'apiPreloadQueries',
                                (config.apiPreloadQueries ?? []).filter((_, idx) => idx !== i),
                              );
                            }}
                            className="text-red-400 hover:text-red-600"
                            aria-label="Remove query"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <Field label="Name (used as metadata key)">
                          <input
                            type="text"
                            value={query.name}
                            onChange={(e) => {
                              const updated = [...(config.apiPreloadQueries ?? [])];
                              updated[i] = { ...updated[i], name: e.target.value };
                              updateConfig('apiPreloadQueries', updated);
                            }}
                            placeholder="e.g. userData, referenceData"
                            className={inputCls(false)}
                          />
                        </Field>
                        <Field label="URL">
                          <input
                            type="url"
                            value={query.url}
                            onChange={(e) => {
                              const updated = [...(config.apiPreloadQueries ?? [])];
                              updated[i] = { ...updated[i], url: e.target.value };
                              updateConfig('apiPreloadQueries', updated);
                            }}
                            placeholder="https://api.example.com/data"
                            className={inputCls(false)}
                          />
                        </Field>
                        <Field label="HTTP Method">
                          <select
                            value={query.method ?? 'GET'}
                            onChange={(e) => {
                              const updated = [...(config.apiPreloadQueries ?? [])];
                              updated[i] = { ...updated[i], method: e.target.value };
                              updateConfig('apiPreloadQueries', updated);
                            }}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                          </select>
                        </Field>
                        <Field
                          label="Request Headers (JSON)"
                        >
                          <textarea
                            rows={2}
                            value={query.headers ? JSON.stringify(query.headers, null, 2) : ''}
                            onChange={(e) => {
                              const updated = [...(config.apiPreloadQueries ?? [])];
                              try {
                                const parsed = e.target.value.trim()
                                  ? (JSON.parse(e.target.value) as Record<string, string>)
                                  : undefined;
                                updated[i] = { ...updated[i], headers: parsed };
                              } catch {
                                // keep invalid JSON as-is in the textarea (don't update state)
                                return;
                              }
                              updateConfig('apiPreloadQueries', updated);
                            }}
                            placeholder={'{\n  "x-api-key": "your-key"\n}'}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Optional. Must be valid JSON. Useful for API keys or Bearer tokens.
                          </p>
                        </Field>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Forms Tab ───────────────────────────────────────────────────── */}
          {activeTab === 'forms' && (
            <>
              {/* Static Metadata */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Static Metadata Fields</p>
                    <p className="text-xs text-gray-400">
                      Key/value pairs injected into API form requests and available for field pre-fill.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated: MetadataField[] = [
                        ...(config.metadataFields ?? []),
                        { key: '', value: '' },
                      ];
                      updateConfig('metadataFields', updated);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium shrink-0"
                  >
                    <Plus className="w-3 h-3" /> Add Field
                  </button>
                </div>
                {(config.metadataFields ?? []).length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-1">No static metadata fields configured.</p>
                ) : (
                  <div className="space-y-2">
                    {(config.metadataFields ?? []).map((field, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => {
                            const updated = [...(config.metadataFields ?? [])];
                            updated[i] = { ...updated[i], key: e.target.value };
                            updateConfig('metadataFields', updated);
                          }}
                          placeholder="key"
                          className={`${inputCls(false)} flex-1`}
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => {
                            const updated = [...(config.metadataFields ?? [])];
                            updated[i] = { ...updated[i], value: e.target.value };
                            updateConfig('metadataFields', updated);
                          }}
                          placeholder="value"
                          className={`${inputCls(false)} flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateConfig(
                              'metadataFields',
                              (config.metadataFields ?? []).filter((_, idx) => idx !== i),
                            );
                          }}
                          className="p-1 text-red-400 hover:text-red-600 shrink-0"
                          aria-label="Remove field"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
                <p className="font-medium mb-1">Using metadata in forms</p>
                <p>
                  Add <span className="font-mono bg-gray-100 px-1 rounded">data-metadata-prefill="key"</span>{' '}
                  to any input element to pre-fill it from{' '}
                  <span className="font-mono bg-gray-100 px-1 rounded">__pageMetadata</span>.
                  Supports dot-notation, e.g.{' '}
                  <span className="font-mono bg-gray-100 px-1 rounded">userData.email</span>.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {mode === 'create' ? 'Create Site' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? 'border-red-400 focus:ring-red-400'
      : 'border-gray-300 focus:ring-blue-500'
  }`;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
