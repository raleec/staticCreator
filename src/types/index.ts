// ─── Form / Metadata types ───────────────────────────────────────────────────

/**
 * A named API query executed on page load to hydrate page metadata with
 * data from any HTTP endpoint.
 */
export interface ApiPreloadQuery {
  /** Key used to store and reference the query result in page metadata. */
  name: string;
  /** Full URL of the API endpoint to fetch, e.g. 'https://api.example.com/data'. */
  url: string;
  /** HTTP method to use (default: 'GET'). */
  method?: string;
  /**
   * Optional request headers as key/value pairs, e.g. for API keys or auth tokens.
   * Example: { "Authorization": "Bearer <token>", "x-api-key": "abc" }
   */
  headers?: Record<string, string>;
}

/** A static key/value pair available as page metadata for form injection. */
export interface MetadataField {
  /** Key used to reference this value in form metadata injection. */
  key: string;
  /** Static string value. */
  value: string;
}

// ─── Site Configuration ───────────────────────────────────────────────────────

/** Site-level configuration for data preload and form metadata. */
export interface SiteConfig {
  /** API queries to run on page load; results are stored by name and available for field pre-fill. */
  apiPreloadQueries?: ApiPreloadQuery[];
  /** Static key/value pairs injected as page metadata for form submissions. */
  metadataFields?: MetadataField[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export interface Page {
  id: string;
  name: string;
  /** GrapesJS serialised project data (JSON) */
  gjsData: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Site ─────────────────────────────────────────────────────────────────────

export interface Site {
  id: string;
  name: string;
  description: string;
  siteConfig: SiteConfig;
  pages: Page[];
  createdAt: string;
  updatedAt: string;
}

// ─── Export Bundle ────────────────────────────────────────────────────────────

export interface SiteExportBundle {
  version: string;
  exportedAt: string;
  site: Omit<Site, 'pages'>;
  pages: Page[];
}
