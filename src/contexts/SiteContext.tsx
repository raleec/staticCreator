/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Site, Page, SiteConfig } from '../types';

// ─── Default site config ─────────────────────────────────────────────────────

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  apiPreloadQueries: [],
  metadataFields: [],
};

// ─── Context types ────────────────────────────────────────────────────────────

interface SiteContextValue {
  sites: Site[];
  activeSiteId: string | null;
  activePageId: string | null;
  setActiveSiteId: (id: string | null) => void;
  setActivePageId: (id: string | null) => void;
  createSite: (name: string, description: string, siteConfig: SiteConfig) => Site;
  updateSite: (id: string, updates: Partial<Omit<Site, 'id' | 'pages' | 'createdAt'>>) => void;
  deleteSite: (id: string) => void;
  importSite: (site: Site) => void;
  createPage: (siteId: string, name: string) => Page;
  updatePage: (siteId: string, pageId: string, updates: Partial<Omit<Page, 'id' | 'createdAt'>>) => void;
  deletePage: (siteId: string, pageId: string) => void;
  getActiveSite: () => Site | undefined;
  getActivePage: () => Page | undefined;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

const STORAGE_KEY = 'staticCreator_sites';

function loadSites(): Site[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
    // Migrate legacy sites that used azureConfig instead of siteConfig
    return parsed.map((s) => {
      if (!s.siteConfig && s.azureConfig) {
        const az = s.azureConfig as Record<string, unknown>;
        return {
          ...s,
          siteConfig: {
            apiPreloadQueries: az.graphApiQueries ?? [],
            metadataFields: az.metadataFields ?? [],
          },
        } as unknown as Site;
      }
      if (!s.siteConfig) {
        return { ...s, siteConfig: { apiPreloadQueries: [], metadataFields: [] } } as unknown as Site;
      }
      return s as unknown as Site;
    });
  } catch {
    return [];
  }
}

function saveSites(sites: Site[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  } catch {
    // localStorage quota exceeded – silently ignore
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [sites, setSites] = useState<Site[]>(loadSites);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);

  const persist = useCallback((next: Site[]) => {
    setSites(next);
    saveSites(next);
  }, []);

  const createSite = useCallback(
    (name: string, description: string, siteConfig: SiteConfig): Site => {
      const site: Site = {
        id: generateId(),
        name,
        description,
        siteConfig,
        pages: [],
        createdAt: now(),
        updatedAt: now(),
      };
      persist([...sites, site]);
      return site;
    },
    [sites, persist],
  );

  const updateSite = useCallback(
    (id: string, updates: Partial<Omit<Site, 'id' | 'pages' | 'createdAt'>>) => {
      persist(
        sites.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: now() } : s,
        ),
      );
    },
    [sites, persist],
  );

  const deleteSite = useCallback(
    (id: string) => {
      persist(sites.filter((s) => s.id !== id));
      if (activeSiteId === id) setActiveSiteId(null);
    },
    [sites, persist, activeSiteId],
  );

  const importSite = useCallback(
    (site: Site) => {
      const existing = sites.findIndex((s) => s.id === site.id);
      if (existing >= 0) {
        const next = [...sites];
        next[existing] = { ...site, updatedAt: now() };
        persist(next);
      } else {
        persist([...sites, { ...site, updatedAt: now() }]);
      }
    },
    [sites, persist],
  );

  const createPage = useCallback(
    (siteId: string, name: string): Page => {
      const page: Page = {
        id: generateId(),
        name,
        gjsData: '',
        createdAt: now(),
        updatedAt: now(),
      };
      persist(
        sites.map((s) =>
          s.id === siteId
            ? { ...s, pages: [...s.pages, page], updatedAt: now() }
            : s,
        ),
      );
      return page;
    },
    [sites, persist],
  );

  const updatePage = useCallback(
    (siteId: string, pageId: string, updates: Partial<Omit<Page, 'id' | 'createdAt'>>) => {
      persist(
        sites.map((s) =>
          s.id === siteId
            ? {
                ...s,
                pages: s.pages.map((p) =>
                  p.id === pageId ? { ...p, ...updates, updatedAt: now() } : p,
                ),
                updatedAt: now(),
              }
            : s,
        ),
      );
    },
    [sites, persist],
  );

  const deletePage = useCallback(
    (siteId: string, pageId: string) => {
      persist(
        sites.map((s) =>
          s.id === siteId
            ? { ...s, pages: s.pages.filter((p) => p.id !== pageId), updatedAt: now() }
            : s,
        ),
      );
      if (activePageId === pageId) setActivePageId(null);
    },
    [sites, persist, activePageId],
  );

  const getActiveSite = useCallback(
    () => sites.find((s) => s.id === activeSiteId),
    [sites, activeSiteId],
  );

  const getActivePage = useCallback(() => {
    const site = sites.find((s) => s.id === activeSiteId);
    return site?.pages.find((p) => p.id === activePageId);
  }, [sites, activeSiteId, activePageId]);

  return (
    <SiteContext.Provider
      value={{
        sites,
        activeSiteId,
        activePageId,
        setActiveSiteId,
        setActivePageId,
        createSite,
        updateSite,
        deleteSite,
        importSite,
        createPage,
        updatePage,
        deletePage,
        getActiveSite,
        getActivePage,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSites(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSites must be used within a SiteProvider');
  return ctx;
}
