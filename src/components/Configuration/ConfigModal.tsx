import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { AzureConfig, AzureCloud } from '../../types';
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

const CLOUD_OPTIONS: AzureCloud[] = ['commercial', 'government', 'dod', 'china'];

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
  const [activeTab, setActiveTab] = useState<'general' | 'auth' | 'region'>('general');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateConfig<K extends keyof AzureConfig>(key: K, value: AzureConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
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
    if (!config.tenantId.trim()) errs.tenantId = 'Tenant ID is required';
    if (!config.clientId.trim()) errs.clientId = 'Client ID is required';
    if (!config.subscriptionId.trim()) errs.subscriptionId = 'Subscription ID is required';
    if (!config.redirectUri.trim()) errs.redirectUri = 'Redirect URI is required';
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
          {(['general', 'auth', 'region'] as const).map((tab) => (
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
