import { useEffect, useState, useCallback } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { ArrowLeft, Save, Check, Eye, EyeOff, Settings } from 'lucide-react';
import {
  FluentProvider,
  webDarkTheme,
  Button,
  tokens,
} from '@fluentui/react-components';
import { useSites } from '../../contexts/SiteContext';
import ConfigModal from '../Configuration/ConfigModal';
import type { AzureConfig } from '../../types';
import {
  Text,
  ButtonComponent,
  Container,
  Section,
  Hero,
  Card,
  TwoColumns,
  FormBuilder,
} from './craftjs/components';
import { Toolbox } from './craftjs/Toolbox';

interface PageBuilderProps {
  siteId: string;
  pageId: string;
  onBack: () => void;
}

// Inner component that has access to Craft.js useEditor hook
function EditorContent({ onSave, previewMode }: { siteId: string; pageId: string; onSave: () => void; previewMode: boolean }) {
  const { actions } = useEditor();

  // Save function using Craft.js query API
  const handleSave = useCallback(() => {
    onSave();
    // The actual save logic is handled in the parent component
  }, [onSave]);

  // Keyboard shortcut: Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Toggle preview mode
  useEffect(() => {
    actions.setOptions((options) => ({
      ...options,
      enabled: !previewMode,
    }));
  }, [previewMode, actions]);

  return null;
}

export default function PageBuilder({ siteId, pageId, onBack }: PageBuilderProps) {
  const { sites, updateSite } = useSites();
  const [saved, setSaved] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const site = sites.find((s) => s.id === siteId);
  const page = site?.pages.find((p) => p.id === pageId);

  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

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
      <Editor
        resolver={{
          Text,
          ButtonComponent,
          Container,
          Section,
          Hero,
          Card,
          TwoColumns,
          FormBuilder,
        }}
      >
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

          {/* Craft.js Editor Container */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left sidebar: Blocks panel */}
            {!previewMode && (
              <div
                className="w-56 flex flex-col overflow-hidden shrink-0 border-r"
                style={{
                  background: tokens.colorNeutralBackground2,
                  borderColor: tokens.colorNeutralStroke1,
                }}
              >
                <div className="flex-1 overflow-y-auto">
                  <Toolbox />
                </div>
              </div>
            )}

            {/* Canvas */}
            <div className="flex-1 h-full bg-white overflow-auto">
              <Frame>
                <Element
                  is={Container}
                  canvas
                  background="#fff"
                  padding="40px"
                >
                  {/* Default content can go here */}
                </Element>
              </Frame>
            </div>
          </div>

          {/* EditorContent component for editor interactions */}
          <EditorContent
            siteId={siteId}
            pageId={pageId}
            onSave={handleSave}
            previewMode={previewMode}
          />

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
      </Editor>
    </FluentProvider>
  );
}
