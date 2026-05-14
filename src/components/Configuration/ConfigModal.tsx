import { useState } from 'react';
import { X, ChevronDown, Plus, Trash2 } from 'lucide-react';
import type { AzureConfig, AzureCloud, DeploymentEnvironment, GraphApiQuery, MetadataField, ApiPreloadQuery } from '../../types';
import { DEFAULT_AZURE_CONFIG } from '../../contexts/SiteContext';
import { AZURE_REGIONS, CLOUD_LABELS, getAuthorityUrl } from '../../utils/azureRegions';

interface ConfigModalProps {
  onClose: () => void;
  initialConfig?: AzureConfig;
  siteName?: string;
  siteDescription?: string;
  onSave: (name: string, description: string, config: AzureConfig) => void;
  mode?: 'create' | 'edit';
}

const CLOUD_OPTIONS: AzureCloud[] = ['commercial', 'government', 'dod'];

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
  const [config, setConfig] = useState<AzureConfig>(
    initialConfig ?? DEFAULT_AZURE_CONFIG,
  );
  const [activeTab, setActiveTab] = useState<'general' | 'auth' | 'region' | 'forms' | 'data'>('general');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAzure = config.deploymentEnvironment !== 'generic';

  function updateConfig<K extends keyof AzureConfig>(key: K, value: AzureConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function handleDeploymentEnvironmentChange(env: DeploymentEnvironment) {
    setConfig((prev) => ({ ...prev, deploymentEnvironment: env }));
    // Switch away from Azure-only tabs when changing to generic
    if (env === 'generic' && (activeTab === 'auth' || activeTab === 'region')) {
      setActiveTab('general');
    }
  }

  function handleCloudChange(cloud: AzureCloud) {
    const firstRegionForCloud = AZURE_REGIONS.find((r) => r.cloud === cloud);
    setConfig((prev) => ({
      ...prev,
      cloud,
      region: firstRegionForCloud?.id ?? prev.region,
    }));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Site name is required';
    if (isAzure) {
      if (!config.tenantId.trim()) errs.tenantId = 'Tenant ID is required';
      if (!config.clientId.trim()) errs.clientId = 'Client ID is required';
      if (!config.subscriptionId.trim()) errs.subscriptionId = 'Subscription ID is required';
      if (!config.redirectUri.trim()) errs.redirectUri = 'Redirect URI is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    onSave(name.trim(), description.trim(), config);
    onClose();
  }

  const filteredRegions = AZURE_REGIONS.filter((r) => r.cloud === config.cloud);
  const computedAuthority = getAuthorityUrl(config.cloud, config.tenantId || '<tenant-id>');

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
          {(['general', ...(isAzure ? ['auth', 'region'] : []), 'data', 'forms'] as Array<typeof activeTab>).map((tab) => (
            <button key={tab} className={tabClass(tab)} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
              <Field label="Deployment Environment">
                <div className="flex gap-3">
                  {(['azure', 'generic'] as const).map((env) => (
                    <label key={env} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="deploymentEnvironment"
                        value={env}
                        checked={config.deploymentEnvironment === env}
                        onChange={() => handleDeploymentEnvironmentChange(env)}
                        className="accent-blue-600"
                        aria-label={env === 'azure' ? 'Azure Static Web Apps' : 'Generic static hosting'}
                      />
                      <span className="text-sm text-gray-700 capitalize">{env}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {config.deploymentEnvironment === 'generic'
                    ? 'Generic: deploy to any static hosting provider. Azure AD and region settings are not required.'
                    : 'Azure: deploy to Azure Static Web Apps with Azure AD authentication.'}
                </p>
              </Field>
              {isAzure && (
                <>
                  <Field label="Azure Subscription ID" error={errors.subscriptionId} required>
                    <input
                      type="text"
                      value={config.subscriptionId}
                      onChange={(e) => updateConfig('subscriptionId', e.target.value)}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className={inputCls(!!errors.subscriptionId)}
                    />
                  </Field>
                  <Field label="Resource Group">
                    <input
                      type="text"
                      value={config.resourceGroup}
                      onChange={(e) => updateConfig('resourceGroup', e.target.value)}
                      placeholder="my-resource-group"
                      className={inputCls(false)}
                    />
                  </Field>
                  <Field label="Deployment Token (optional)">
                    <input
                      type="password"
                      value={config.deploymentToken ?? ''}
                      onChange={(e) => updateConfig('deploymentToken', e.target.value || undefined)}
                      placeholder="Azure SWA deployment token"
                      className={inputCls(false)}
                    />
                  </Field>
                </>
              )}
            </>
          )}

          {/* ── Auth Tab ────────────────────────────────────────────────────── */}
          {activeTab === 'auth' && (
            <>
              <Field label="Tenant (Directory) ID" error={errors.tenantId} required>
                <input
                  type="text"
                  value={config.tenantId}
                  onChange={(e) => updateConfig('tenantId', e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className={inputCls(!!errors.tenantId)}
                />
              </Field>
              <Field label="Application (Client) ID" error={errors.clientId} required>
                <input
                  type="text"
                  value={config.clientId}
                  onChange={(e) => updateConfig('clientId', e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className={inputCls(!!errors.clientId)}
                />
              </Field>
              <Field label="Redirect URI" error={errors.redirectUri} required>
                <input
                  type="text"
                  value={config.redirectUri}
                  onChange={(e) => updateConfig('redirectUri', e.target.value)}
                  placeholder="https://mysite.azurestaticapps.net"
                  className={inputCls(!!errors.redirectUri)}
                />
              </Field>
              <Field label="Post-Logout Redirect URI">
                <input
                  type="text"
                  value={config.postLogoutRedirectUri}
                  onChange={(e) => updateConfig('postLogoutRedirectUri', e.target.value)}
                  placeholder="https://mysite.azurestaticapps.net"
                  className={inputCls(false)}
                />
              </Field>
              <Field label="MSAL Scopes (comma-separated)">
                <input
                  type="text"
                  value={config.scopes.join(', ')}
                  onChange={(e) =>
                    updateConfig(
                      'scopes',
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    )
                  }
                  placeholder="User.Read, openid, profile"
                  className={inputCls(false)}
                />
              </Field>
              <Field label="Custom Authority URL (optional)">
                <input
                  type="text"
                  value={config.customAuthority ?? ''}
                  onChange={(e) => updateConfig('customAuthority', e.target.value || undefined)}
                  placeholder={computedAuthority}
                  className={inputCls(false)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Computed from cloud + tenant:{' '}
                  <code className="bg-gray-100 px-1 rounded">{computedAuthority}</code>
                </p>
              </Field>
            </>
          )}

          {/* ── Region Tab ──────────────────────────────────────────────────── */}
          {activeTab === 'region' && (
            <>
              <Field label="Azure Cloud Environment">
                <div className="relative">
                  <select
                    value={config.cloud}
                    onChange={(e) => handleCloudChange(e.target.value as AzureCloud)}
                    className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CLOUD_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {CLOUD_LABELS[c]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {(config.cloud === 'government' || config.cloud === 'dod') && (
                  <p className="text-xs text-amber-600 mt-1 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    ⚠️ Government / DoD environments require a FedRAMP-authorized Azure subscription.
                  </p>
                )}
              </Field>

              <Field label="Primary Region">
                <div className="relative">
                  <select
                    value={config.region}
                    onChange={(e) => updateConfig('region', e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {filteredRegions.map((r) => (
                      <option key={r.id} value={r.id} disabled={!r.staticWebAppsSupported}>
                        {r.displayName}
                        {!r.staticWebAppsSupported ? ' (SWA not available)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </Field>

              {/* Region table */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Available regions in this environment
                </p>
                <div className="border rounded-lg overflow-hidden text-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-3 py-2 text-left">Region</th>
                        <th className="px-3 py-2 text-left">Display Name</th>
                        <th className="px-3 py-2 text-center">SWA Support</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRegions.map((r) => (
                        <tr
                          key={r.id}
                          className={`hover:bg-gray-50 cursor-pointer ${config.region === r.id ? 'bg-blue-50' : ''}`}
                          onClick={() => r.staticWebAppsSupported && updateConfig('region', r.id)}
                        >
                          <td className="px-3 py-2 font-mono text-xs text-gray-600">{r.name}</td>
                          <td className="px-3 py-2">{r.displayName}</td>
                          <td className="px-3 py-2 text-center">
                            {r.staticWebAppsSupported ? (
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Supported" />
                            ) : (
                              <span className="inline-block w-2 h-2 rounded-full bg-gray-300" title="Not supported" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── Data Tab ────────────────────────────────────────────────────── */}
          {activeTab === 'data' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">API Preload Queries</p>
                    <p className="text-xs text-gray-400">
                      Fetched on every page load. Results are stored in{' '}
                      <span className="font-mono">window.__pageData</span> (global scope) and are
                      usable in form metadata injection (e.g.{' '}
                      <span className="font-mono">products.0.name</span>).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated: ApiPreloadQuery[] = [
                        ...(config.apiPreloadQueries ?? []),
                        { name: '', url: '', method: 'GET', includeAuthHeader: false },
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
                        <input
                          type="text"
                          value={query.name}
                          onChange={(e) => {
                            const updated = [...(config.apiPreloadQueries ?? [])];
                            updated[i] = { ...updated[i], name: e.target.value };
                            updateConfig('apiPreloadQueries', updated);
                          }}
                          placeholder="Name (e.g. products)"
                          className={inputCls(false)}
                        />
                        <input
                          type="url"
                          value={query.url}
                          onChange={(e) => {
                            const updated = [...(config.apiPreloadQueries ?? [])];
                            updated[i] = { ...updated[i], url: e.target.value };
                            updateConfig('apiPreloadQueries', updated);
                          }}
                          placeholder="URL (e.g. https://api.example.com/items)"
                          className={inputCls(false)}
                        />
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <select
                              value={query.method ?? 'GET'}
                              onChange={(e) => {
                                const updated = [...(config.apiPreloadQueries ?? [])];
                                updated[i] = { ...updated[i], method: e.target.value };
                                updateConfig('apiPreloadQueries', updated);
                              }}
                              className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {['GET', 'POST'].map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={query.includeAuthHeader ?? false}
                              onChange={(e) => {
                                const updated = [...(config.apiPreloadQueries ?? [])];
                                updated[i] = { ...updated[i], includeAuthHeader: e.target.checked };
                                updateConfig('apiPreloadQueries', updated);
                              }}
                              className="rounded border-gray-300"
                            />
                            Include MSAL auth token
                          </label>
                        </div>
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

              {/* Graph API Queries */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Graph API Queries</p>
                    <p className="text-xs text-gray-400">
                      Fetched on page load after authentication. Results are stored by{' '}
                      <span className="font-mono">name</span> and usable in form metadata injection
                      (e.g.{' '}
                      <span className="font-mono">currentUser.mail</span>).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated: GraphApiQuery[] = [
                        ...(config.graphApiQueries ?? []),
                        { name: '', endpoint: '/me', select: '', filter: '' },
                      ];
                      updateConfig('graphApiQueries', updated);
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium shrink-0"
                  >
                    <Plus className="w-3 h-3" /> Add Query
                  </button>
                </div>
                {(config.graphApiQueries ?? []).length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-1">No Graph API queries configured.</p>
                ) : (
                  <div className="space-y-3">
                    {(config.graphApiQueries ?? []).map((query, i) => (
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
                                'graphApiQueries',
                                (config.graphApiQueries ?? []).filter((_, idx) => idx !== i),
                              );
                            }}
                            className="text-red-400 hover:text-red-600"
                            aria-label="Remove query"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={query.name}
                          onChange={(e) => {
                            const updated = [...(config.graphApiQueries ?? [])];
                            updated[i] = { ...updated[i], name: e.target.value };
                            updateConfig('graphApiQueries', updated);
                          }}
                          placeholder="Name (e.g. currentUser)"
                          className={inputCls(false)}
                        />
                        <input
                          type="text"
                          value={query.endpoint}
                          onChange={(e) => {
                            const updated = [...(config.graphApiQueries ?? [])];
                            updated[i] = { ...updated[i], endpoint: e.target.value };
                            updateConfig('graphApiQueries', updated);
                          }}
                          placeholder="Endpoint (e.g. /me or /me/memberOf)"
                          className={inputCls(false)}
                        />
                        <input
                          type="text"
                          value={query.select ?? ''}
                          onChange={(e) => {
                            const updated = [...(config.graphApiQueries ?? [])];
                            updated[i] = {
                              ...updated[i],
                              select: e.target.value || undefined,
                            };
                            updateConfig('graphApiQueries', updated);
                          }}
                          placeholder="$select fields (optional, e.g. displayName,mail)"
                          className={inputCls(false)}
                        />
                        <input
                          type="text"
                          value={query.filter ?? ''}
                          onChange={(e) => {
                            const updated = [...(config.graphApiQueries ?? [])];
                            updated[i] = {
                              ...updated[i],
                              filter: e.target.value || undefined,
                            };
                            updateConfig('graphApiQueries', updated);
                          }}
                          placeholder="$filter expression (optional)"
                          className={inputCls(false)}
                        />
                      </div>
                    ))}
                  </div>
                )}
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
