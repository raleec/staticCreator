import { useState, useRef } from 'react';
import {
  Plus,
  Settings,
  Trash2,
  Download,
  Upload,
  FileCode,
  Globe,
  ChevronRight,
  Archive,
} from 'lucide-react';
import { useSites } from '../../contexts/SiteContext';
import ConfigModal from '../Configuration/ConfigModal';
import type { AzureConfig, Site } from '../../types';
import { downloadSiteJson, downloadSiteZip, importSiteFromFile } from '../../utils/siteExport';
import { CLOUD_LABELS } from '../../utils/azureRegions';

interface ManagementPortalProps {
  onOpenBuilder: (siteId: string, pageId: string) => void;
}

export default function ManagementPortal({ onOpenBuilder }: ManagementPortalProps) {
  const {
    sites,
    createSite,
    updateSite,
    deleteSite,
    importSite,
    createPage,
    deletePage,
    setActiveSiteId,
    setActivePageId,
  } = useSites();

  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [addingPageForSiteId, setAddingPageForSiteId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'site' | 'page'; siteId: string; pageId?: string } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  function handleSave(name: string, description: string, config: AzureConfig) {
    if (editingSite) {
      updateSite(editingSite.id, { name, description, azureConfig: config });
    } else {
      createSite(name, description, config);
    }
    setEditingSite(null);
  }

  function openEdit(site: Site) {
    setEditingSite(site);
    setConfigModalOpen(true);
  }

  function openCreate() {
    setEditingSite(null);
    setConfigModalOpen(true);
  }

  async function handleImport(file: File) {
    try {
      const bundle = await importSiteFromFile(file);
      const importedSite: Site = {
        ...bundle.site,
        pages: bundle.pages,
        updatedAt: new Date().toISOString(),
      };
      importSite(importedSite);
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function handleAddPage(siteId: string) {
    const trimmed = newPageName.trim();
    if (!trimmed) return;
    const page = createPage(siteId, trimmed);
    setNewPageName('');
    setAddingPageForSiteId(null);
    setActiveSiteId(siteId);
    setActivePageId(page.id);
    onOpenBuilder(siteId, page.id);
  }

  function handleOpenPage(siteId: string, pageId: string) {
    setActiveSiteId(siteId);
    setActivePageId(pageId);
    onOpenBuilder(siteId, pageId);
  }

  function confirmDelete(type: 'site' | 'page', siteId: string, pageId?: string) {
    setDeleteConfirm({ type, siteId, pageId });
  }

  function executeDelete() {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'site') {
      deleteSite(deleteConfirm.siteId);
    } else if (deleteConfirm.pageId) {
      deletePage(deleteConfirm.siteId, deleteConfirm.pageId);
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-7 h-7 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">StaticCreator</h1>
              <p className="text-xs text-gray-500">Azure Static Web App Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Import */}
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import Site
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Site
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {sites.length === 0 ? (
          <EmptyState onCreate={openCreate} />
        ) : (
          <div className="space-y-4">
            {sites.map((site) => {
              const isExpanded = expandedSiteId === site.id;
              return (
                <div
                  key={site.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Site Header */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <button
                      className="flex items-center gap-3 flex-1 text-left"
                      onClick={() => setExpandedSiteId(isExpanded ? null : site.id)}
                    >
                      <ChevronRight
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{site.name}</p>
                        <p className="text-xs text-gray-500">
                          {site.description || 'No description'} •{' '}
                          {site.pages.length} page{site.pages.length !== 1 ? 's' : ''} •{' '}
                          <span
                            className={`font-medium ${
                              site.azureConfig.cloud === 'dod'
                                ? 'text-red-600'
                                : site.azureConfig.cloud === 'government'
                                ? 'text-amber-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {CLOUD_LABELS[site.azureConfig.cloud]}
                          </span>{' '}
                          — {site.azureConfig.region}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => downloadSiteJson(site)}
                        title="Export as JSON"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                      >
                        <FileCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadSiteZip(site)}
                        title="Export as ZIP"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(site)}
                        title="Edit configuration"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete('site', site.id)}
                        title="Delete site"
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Page List */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50 px-5 py-4 space-y-2">
                      {site.pages.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No pages yet – add one below.</p>
                      )}
                      {site.pages.map((page) => (
                        <div
                          key={page.id}
                          className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-gray-200 hover:border-blue-300 transition-colors group"
                        >
                          <button
                            className="flex items-center gap-2 flex-1 text-left"
                            onClick={() => handleOpenPage(site.id, page.id)}
                          >
                            <FileCode className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-700 group-hover:text-blue-600">
                              {page.name}
                            </span>
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenPage(site.id, page.id)}
                              className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"
                              title="Open in builder"
                            >
                              <Download className="w-3.5 h-3.5 rotate-180" />
                            </button>
                            <button
                              onClick={() => confirmDelete('page', site.id, page.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                              title="Delete page"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Page */}
                      {addingPageForSiteId === site.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={newPageName}
                            onChange={(e) => setNewPageName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddPage(site.id);
                              if (e.key === 'Escape') { setAddingPageForSiteId(null); setNewPageName(''); }
                            }}
                            placeholder="Page name (e.g. Home)"
                            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleAddPage(site.id)}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => { setAddingPageForSiteId(null); setNewPageName(''); }}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingPageForSiteId(site.id)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add Page
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Config Modal – only mounted when open; key forces re-mount when target changes */}
      {configModalOpen && (
        <ConfigModal
          key={editingSite?.id ?? 'new'}
          onClose={() => { setConfigModalOpen(false); setEditingSite(null); }}
          initialConfig={editingSite?.azureConfig}
          siteName={editingSite?.name}
          siteDescription={editingSite?.description}
          onSave={handleSave}
          mode={editingSite ? 'edit' : 'create'}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-5">
              {deleteConfirm.type === 'site'
                ? 'Are you sure you want to delete this site and all its pages? This cannot be undone.'
                : 'Are you sure you want to delete this page? This cannot be undone.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-24">
      <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-600 mb-2">No sites yet</h2>
      <p className="text-gray-400 mb-6 max-w-sm mx-auto">
        Create your first site to start building static web pages for Azure deployment.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create Your First Site
      </button>
    </div>
  );
}
