import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Save, Check, Eye, EyeOff, Settings, ExternalLink, Code2 } from 'lucide-react';
import {
  FluentProvider,
  webDarkTheme,
  Button,
  TabList,
  Tab,
  tokens,
} from '@fluentui/react-components';
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
      <FluentProvider theme={webDarkTheme}>
        <div
          className="flex items-center justify-center h-screen"
          style={{ background: tokens.colorNeutralBackground1 }}
        >
          <div className="text-center">
            <p className="mb-4" style={{ color: tokens.colorNeutralForeground3 }}>
              Page not found.
            </p>
            <Button appearance="transparent" onClick={onBack}>
              ← Back to Management
            </Button>
          </div>
        </div>
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={webDarkTheme}>
      <div
        className="flex flex-col h-screen overflow-hidden"
        style={{ background: tokens.colorNeutralBackground1 }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-4 py-2 shrink-0 border-b"
          style={{
            background: tokens.colorNeutralBackground2,
            borderColor: tokens.colorNeutralStroke1,
          }}
        >
          <div className="flex items-center gap-3">
            <Button
              appearance="subtle"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={onBack}
            >
              Back
            </Button>
            <div
              className="h-5 w-px"
              style={{ background: tokens.colorNeutralStroke1 }}
            />
            <div>
              <span
                className="font-semibold text-sm"
                style={{ color: tokens.colorNeutralForeground1 }}
              >
                {site.name}
              </span>
              <span
                className="text-sm"
                style={{ color: tokens.colorNeutralForeground3 }}
              >
                {' '}/ {page.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              as="a"
              href="https://webstudio.is"
              target="_blank"
              rel="noopener noreferrer"
              appearance="subtle"
              icon={<ExternalLink className="w-4 h-4" />}
              title="Open Webstudio for visual drag-and-drop editing"
              style={{
                backgroundColor: tokens.colorPaletteLavenderBackground2,
                color: tokens.colorNeutralForeground1,
              }}
            >
              Open in Webstudio
            </Button>
            <Button
              appearance={previewMode ? 'primary' : 'subtle'}
              icon={previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              onClick={() => setPreviewMode((prev) => !prev)}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              appearance="subtle"
              icon={<Settings className="w-4 h-4" />}
              onClick={() => setConfigOpen(true)}
            >
              Config
            </Button>
            <Button
              appearance="primary"
              icon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              onClick={handleSave}
              style={
                saved
                  ? {
                      backgroundColor: tokens.colorPaletteGreenBackground3,
                      borderColor: tokens.colorPaletteGreenBackground3,
                    }
                  : undefined
              }
            >
              {saved ? 'Saved!' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Editor + Preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left pane: code editor (hidden when preview mode is active) */}
          {!previewMode && (
            <div
              className="w-2/5 flex flex-col shrink-0 border-r"
              style={{ borderColor: tokens.colorNeutralStroke1 }}
            >
              {/* Tabs */}
              <div
                className="px-2 pt-1 shrink-0 border-b"
                style={{
                  background: tokens.colorNeutralBackground2,
                  borderColor: tokens.colorNeutralStroke1,
                }}
              >
                <TabList
                  selectedValue={activeTab}
                  onTabSelect={(_, d) => setActiveTab(d.value as EditorTab)}
                  size="small"
                >
                  <Tab value="html" icon={<Code2 className="w-3 h-3" />}>HTML</Tab>
                  <Tab value="css" icon={<Code2 className="w-3 h-3" />}>CSS</Tab>
                  <Tab value="snippets">Snippets</Tab>
                </TabList>
              </div>

              {/* HTML editor */}
              {activeTab === 'html' && (
                <textarea
                  ref={htmlTextareaRef}
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  className="flex-1 font-mono text-sm p-4 resize-none focus:outline-none"
                  style={{
                    background: tokens.colorNeutralBackground1,
                    color: tokens.colorPaletteGreenForeground3,
                  }}
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
                  className="flex-1 font-mono text-sm p-4 resize-none focus:outline-none"
                  style={{
                    background: tokens.colorNeutralBackground1,
                    color: tokens.colorPaletteBlueForeground2,
                  }}
                  placeholder="/* Enter your CSS here */"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              )}

              {/* Snippets panel */}
              {activeTab === 'snippets' && (
                <div
                  className="flex-1 overflow-y-auto p-3"
                  style={{ background: tokens.colorNeutralBackground1 }}
                >
                  <p
                    className="text-xs mb-3"
                    style={{ color: tokens.colorNeutralForeground3 }}
                  >
                    Click a snippet to insert it at the cursor in the HTML editor.
                  </p>
                  {Object.entries(snippetsByCategory).map(([category, items]) => (
                    <div key={category} className="mb-4">
                      <h3
                        className="text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{ color: tokens.colorNeutralForeground2 }}
                      >
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {items.map((snippet) => (
                          <Button
                            key={snippet.id}
                            appearance="subtle"
                            onClick={() => insertSnippet(snippet)}
                            className="w-full"
                            style={{ justifyContent: 'flex-start' }}
                          >
                            {snippet.label}
                          </Button>
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
    </FluentProvider>
  );
}
