import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Save, Eye, EyeOff, Settings, ExternalLink, Code2 } from 'lucide-react';
import { useSites } from '../../contexts/SiteContext';
import ConfigModal from '../Configuration/ConfigModal';
import { getHtmlSnippets, type HtmlSnippet } from '../../utils/htmlSnippets';
import type { AzureConfig } from '../../types';

interface PageBuilderProps {
  siteId: string;
  pageId: string;
  onBack: () => void;
}

type EditorTab = 'html' | 'css' | 'snippets';

function parsePageContent(gjsData?: string): { html: string; css: string } {
  if (!gjsData) return { html: '', css: '' };
  try {
    const data = JSON.parse(gjsData) as { html?: string; css?: string };
    return { html: data.html ?? '', css: data.css ?? '' };
  } catch {
    return { html: '', css: '' };
  }
}

export default function PageBuilder({ siteId, pageId, onBack }: PageBuilderProps) {
  const { sites, updatePage, updateSite } = useSites();

  const site = sites.find((s) => s.id === siteId);
  const page = site?.pages.find((p) => p.id === pageId);

  // Initialise HTML/CSS from the persisted page content on first render.
  const [html, setHtml] = useState(() => parsePageContent(page?.gjsData).html);
  const [css, setCss] = useState(() => parsePageContent(page?.gjsData).css);

  // Reset editor content when the user navigates to a different page.
  // Setting state during render is the React-recommended approach for derived
  // state that depends on props changing.
  // See https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [loadedPageKey, setLoadedPageKey] = useState(`${siteId}:${pageId}`);
  const pageKey = `${siteId}:${pageId}`;
  if (pageKey !== loadedPageKey) {
    setLoadedPageKey(pageKey);
    const content = parsePageContent(page?.gjsData);
    setHtml(content.html);
    setCss(content.css);
  }

  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [previewMode, setPreviewMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = useCallback(() => {
    const gjsData = JSON.stringify({ html, css });
    updatePage(siteId, pageId, { gjsData });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [html, css, siteId, pageId, updatePage]);

  // Keyboard shortcut: Ctrl+S / Cmd+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleSave]);

  function insertSnippet(snippet: HtmlSnippet) {
    const ta = htmlTextareaRef.current;
    if (!ta) {
      setHtml((prev) => prev + '\n' + snippet.html);
      setActiveTab('html');
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newValue = html.substring(0, start) + '\n' + snippet.html + '\n' + html.substring(end);
    setHtml(newValue);
    setActiveTab('html');
    requestAnimationFrame(() => {
      ta.focus();
      const newCursor = start + snippet.html.length + 2;
      ta.setSelectionRange(newCursor, newCursor);
    });
  }

  function handleConfigSave(name: string, description: string, azureConfig: AzureConfig) {
    updateSite(siteId, { name, description, azureConfig });
  }

  const snippets = getHtmlSnippets();
  const snippetsByCategory = snippets.reduce<Record<string, HtmlSnippet[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const previewDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${css}</style>
</head>
<body>${html}</body>
</html>`;

  if (!site || !page) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Page not found.</p>
          <button onClick={onBack} className="text-blue-600 hover:underline">
            ← Back to Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 shrink-0 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="h-5 w-px bg-gray-600" />
          <div>
            <span className="font-semibold text-sm">{site.name}</span>
            <span className="text-gray-400 text-sm"> / {page.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://webstudio.is"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-violet-700 hover:bg-violet-600 transition-colors font-medium"
            title="Open Webstudio for visual drag-and-drop editing"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Webstudio
          </a>
          <button
            onClick={() => setPreviewMode((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              previewMode ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-700'
            }`}
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={() => setConfigOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Config
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left pane: code editor (hidden when preview mode is active) */}
        {!previewMode && (
          <div className="w-2/5 flex flex-col border-r border-gray-700 shrink-0">
            {/* Tabs */}
            <div className="flex border-b border-gray-700 bg-gray-800 shrink-0">
              {(['html', 'css', 'snippets'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-blue-500 bg-gray-900'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tab !== 'snippets' && <Code2 className="w-3 h-3" />}
                  {tab}
                </button>
              ))}
            </div>

            {/* HTML editor */}
            {activeTab === 'html' && (
              <textarea
                ref={htmlTextareaRef}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="flex-1 bg-gray-900 text-green-300 font-mono text-sm p-4 resize-none focus:outline-none"
                placeholder="<!-- Enter your HTML here -->"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
              />
            )}

            {/* CSS editor */}
            {activeTab === 'css' && (
              <textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                className="flex-1 bg-gray-900 text-blue-300 font-mono text-sm p-4 resize-none focus:outline-none"
                placeholder="/* Enter your CSS here */"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
              />
            )}

            {/* Snippets panel */}
            {activeTab === 'snippets' && (
              <div className="flex-1 overflow-y-auto p-3">
                <p className="text-xs text-gray-500 mb-3">
                  Click a snippet to insert it at the cursor in the HTML editor.
                </p>
                {Object.entries(snippetsByCategory).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {items.map((snippet) => (
                        <button
                          key={snippet.id}
                          onClick={() => insertSnippet(snippet)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"
                        >
                          {snippet.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right pane: live preview */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <iframe
            srcDoc={previewDoc}
            className="w-full h-full border-none"
            title={`Preview – ${page.name}`}
            sandbox="allow-scripts"
          />
        </div>
      </div>

      {/* Config Modal */}
      {configOpen && (
        <ConfigModal
          onClose={() => setConfigOpen(false)}
          initialConfig={site.azureConfig}
          siteName={site.name}
          siteDescription={site.description}
          onSave={handleConfigSave}
          mode="edit"
        />
      )}
    </div>
  );
}
