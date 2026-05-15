import { useState } from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { SiteProvider } from './contexts/SiteContext';
import ManagementPortal from './components/Management/ManagementPortal';
import PageBuilder from './components/Builder/PageBuilder';

type View =
  | { kind: 'management' }
  | { kind: 'builder'; siteId: string; pageId: string };

export default function App() {
  const [view, setView] = useState<View>({ kind: 'management' });

  function openBuilder(siteId: string, pageId: string) {
    setView({ kind: 'builder', siteId, pageId });
  }

  function closeBuilder() {
    setView({ kind: 'management' });
  }

  return (
    <FluentProvider theme={webLightTheme}>
      <SiteProvider>
        {view.kind === 'management' ? (
          <ManagementPortal onOpenBuilder={openBuilder} />
        ) : (
          <PageBuilder
            siteId={view.siteId}
            pageId={view.pageId}
            onBack={closeBuilder}
          />
        )}
      </SiteProvider>
    </FluentProvider>
  );
}
