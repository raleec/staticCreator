import { useEffect, useRef, useState, useCallback } from 'react';
import type { Editor } from 'grapesjs';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { ArrowLeft, Save, Check, Eye, EyeOff, Settings } from 'lucide-react';
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
import { registerFormBlocks } from '../../utils/formBlocks';
import type { AzureConfig } from '../../types';

interface PageBuilderProps {
  siteId: string;
  pageId: string;
  onBack: () => void;
}

export default function PageBuilder({ siteId, pageId, onBack }: PageBuilderProps) {
  const { sites, updatePage, updateSite } = useSites();
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'blocks' | 'layers' | 'styles'>('blocks');

  const site = sites.find((s) => s.id === siteId);
  const page = site?.pages.find((p) => p.id === pageId);

  const handleSave = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = editor.getHtml();
    const css = editor.getCss();
    const gjsData = JSON.stringify({ html, css });
    updatePage(siteId, pageId, { gjsData });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [siteId, pageId, updatePage]);

  useEffect(() => {
    if (!containerRef.current || !page) return;

    // Destroy previous instance if any
    if (editorRef.current) {
      editorRef.current.destroy();
      editorRef.current = null;
    }

    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100%',
      width: '100%',
      storageManager: false, // We handle persistence ourselves
      plugins: [],
      pluginsOpts: {},
      panels: {
        defaults: [
          {
            id: 'panel-switcher',
            el: '.panel__switcher',
            buttons: [
              {
                id: 'show-layers',
                active: true,
                label: 'Layers',
                command: 'show-layers',
                togglable: false,
              },
              {
                id: 'show-blocks',
                active: false,
                label: 'Blocks',
                command: 'show-blocks',
                togglable: false,
              },
              {
                id: 'show-styles',
                active: false,
                label: 'Styles',
                command: 'show-styles',
                togglable: false,
              },
            ],
          },
        ],
      },
      blockManager: {
        appendTo: '.blocks-container',
        blocks: [
          {
            id: 'section',
            label: 'Section',
            attributes: { class: 'gjs-block-section' },
            content: `<section style="padding:40px 20px;">
              <h1>Insert your title here</h1>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </section>`,
          },
          {
            id: 'text',
            label: 'Text',
            content: '<div data-gjs-type="text">Insert your text here</div>',
          },
          {
            id: 'image',
            label: 'Image',
            content: { type: 'image' },
            activate: true,
          },
          {
            id: 'button',
            label: 'Button',
            content: '<a class="btn" href="#" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Click Me</a>',
          },
          {
            id: 'columns-2',
            label: '2 Columns',
            content: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:20px;">
              <div style="background:#f3f4f6;padding:20px;border-radius:8px;min-height:80px;">Column 1</div>
              <div style="background:#f3f4f6;padding:20px;border-radius:8px;min-height:80px;">Column 2</div>
            </div>`,
          },
          {
            id: 'columns-3',
            label: '3 Columns',
            content: `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;padding:20px;">
              <div style="background:#f3f4f6;padding:20px;border-radius:8px;min-height:80px;">Col 1</div>
              <div style="background:#f3f4f6;padding:20px;border-radius:8px;min-height:80px;">Col 2</div>
              <div style="background:#f3f4f6;padding:20px;border-radius:8px;min-height:80px;">Col 3</div>
            </div>`,
          },
          {
            id: 'hero',
            label: 'Hero',
            content: `<section style="background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:80px 40px;text-align:center;">
              <h1 style="font-size:2.5rem;margin-bottom:1rem;">Welcome</h1>
              <p style="font-size:1.1rem;margin-bottom:2rem;opacity:0.9;">Your page description goes here.</p>
              <a href="#" style="display:inline-block;padding:12px 32px;background:#fff;color:#1e40af;text-decoration:none;border-radius:6px;font-weight:600;">Get Started</a>
            </section>`,
          },
          {
            id: 'navbar',
            label: 'Navbar',
            content: `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:#1e293b;color:#fff;">
              <span style="font-weight:700;font-size:1.2rem;">My App</span>
              <ul style="list-style:none;display:flex;gap:24px;margin:0;padding:0;">
                <li><a href="#" style="color:#fff;text-decoration:none;">Home</a></li>
                <li><a href="#" style="color:#fff;text-decoration:none;">About</a></li>
                <li><a href="#" style="color:#fff;text-decoration:none;">Contact</a></li>
              </ul>
            </nav>`,
          },
          {
            id: 'footer',
            label: 'Footer',
            content: `<footer style="background:#1e293b;color:#94a3b8;padding:32px;text-align:center;">
              <p>© ${new Date().getFullYear()} My Organization. All rights reserved.</p>
            </footer>`,
          },
          {
            id: 'card',
            label: 'Card',
            content: `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:24px;max-width:320px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
              <h3 style="margin:0 0 8px;">Card Title</h3>
              <p style="color:#64748b;margin:0 0 16px;">Card description text goes here.</p>
              <a href="#" style="color:#2563eb;font-weight:600;text-decoration:none;">Learn more →</a>
            </div>`,
          },
          {
            id: 'divider',
            label: 'Divider',
            content: '<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />',
          },
          {
            id: 'login-form',
            label: 'Login Form',
            content: `<div style="max-width:400px;margin:40px auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
              <h2 style="margin:0 0 24px;text-align:center;">Sign In</h2>
              <div style="margin-bottom:16px;">
                <label style="display:block;font-size:.875rem;color:#374151;margin-bottom:4px;">Email</label>
                <input type="email" style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;box-sizing:border-box;" placeholder="you@example.com" />
              </div>
              <div style="margin-bottom:24px;">
                <label style="display:block;font-size:.875rem;color:#374151;margin-bottom:4px;">Password</label>
                <input type="password" style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;box-sizing:border-box;" />
              </div>
              <button style="width:100%;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Sign In with Azure AD</button>
            </div>`,
          },
        ],
      },
      layerManager: { appendTo: '.layers-container' },
      styleManager: {
        appendTo: '.styles-container',
        sectors: [
          { name: 'Layout', open: true, properties: ['display', 'flex-direction', 'gap', 'padding', 'margin', 'width', 'height'] },
          { name: 'Typography', open: false, properties: ['font-family', 'font-size', 'font-weight', 'color', 'text-align', 'line-height'] },
          { name: 'Decoration', open: false, properties: ['background-color', 'border', 'border-radius', 'box-shadow', 'opacity'] },
        ],
      },
      traitManager: { appendTo: '.traits-container' },
    });

    // Load existing page data
    if (page.gjsData) {
      try {
        const data = JSON.parse(page.gjsData) as { html?: string; css?: string };
        if (data.html) {
          editor.setComponents(data.html);
          if (data.css) editor.setStyle(data.css);
        }
      } catch {
        // ignore parse errors
      }
    }

    // Keyboard shortcut: Ctrl+S / Cmd+S
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    editorRef.current = editor;

    // Register form blocks and component types
    registerFormBlocks(editor);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      editor.destroy();
      editorRef.current = null;
    };
  }, [siteId, pageId]); // eslint-disable-line react-hooks/exhaustive-deps

  function togglePreview() {
    const editor = editorRef.current;
    if (!editor) return;
    if (previewMode) {
      editor.stopCommand('preview');
    } else {
      editor.runCommand('preview');
    }
    setPreviewMode((prev) => !prev);
  }

  function switchTab(tab: 'blocks' | 'layers' | 'styles') {
    const editor = editorRef.current;
    if (!editor) return;
    setActiveTab(tab);
    if (tab === 'blocks') editor.runCommand('show-blocks');
    if (tab === 'layers') editor.runCommand('show-layers');
    if (tab === 'styles') editor.runCommand('show-styles');
  }

  function handleConfigSave(name: string, description: string, azureConfig: AzureConfig) {
    updateSite(siteId, { name, description, azureConfig });
  }

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
        {/* Builder Toolbar */}
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
              appearance={previewMode ? 'primary' : 'subtle'}
              icon={previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              onClick={togglePreview}
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

        {/* GrapesJS Editor Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar: Blocks / Layers / Styles panel */}
          <div
            className="w-56 flex flex-col overflow-hidden shrink-0 border-r"
            style={{
              background: tokens.colorNeutralBackground2,
              borderColor: tokens.colorNeutralStroke1,
            }}
          >
            <div
              className="px-2 pt-2 border-b"
              style={{ borderColor: tokens.colorNeutralStroke1 }}
            >
              <TabList
                selectedValue={activeTab}
                onTabSelect={(_, d) =>
                  switchTab(d.value as 'blocks' | 'layers' | 'styles')
                }
                size="small"
              >
                <Tab value="blocks">Blocks</Tab>
                <Tab value="layers">Layers</Tab>
                <Tab value="styles">Styles</Tab>
              </TabList>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="blocks-container" />
              <div className="layers-container" />
              <div className="styles-container" />
              <div className="traits-container" />
            </div>
          </div>

          {/* Canvas */}
          <div ref={containerRef} className="flex-1 h-full" />
        </div>

        {/* Config Modal – only mounted when open */}
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
