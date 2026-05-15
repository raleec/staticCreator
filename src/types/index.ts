// ─── Form / Metadata types ───────────────────────────────────────────────────

/** A named Microsoft Graph API query executed on page load. */
export interface GraphApiQuery {
  /** Key used to store and reference the query result in page metadata. */
  name: string;
  /** Graph API endpoint path, e.g. '/me' or '/me/memberOf'. */
  endpoint: string;
  /** Optional OData $select clause, e.g. 'displayName,mail'. */
  select?: string;
  /** Optional OData $filter clause. */
  filter?: string;
}

/** A static key/value pair available as page metadata for form injection. */
export interface MetadataField {
  /** Key used to reference this value in form metadata injection. */
  key: string;
  /** Static string value. */
  value: string;
}

/**
 * A generic API query executed on page load.
 * Results are stored in `window.__pageData` (global scope) and merged into
 * `__pageMetadata` so they can be referenced by form-field pre-fill attributes.
 */
export interface ApiPreloadQuery {
  /** Key used to store the result in `window.__pageData` and page metadata. */
  name: string;
  /** Full URL of the API endpoint to fetch, e.g. 'https://api.example.com/items'. */
  url: string;
  /** HTTP method (defaults to 'GET'). */
  method?: string;
  /**
   * When true the MSAL Bearer token is included in the Authorization header
   * if a user is currently authenticated – requests still succeed without it.
   */
  includeAuthHeader?: boolean;
}

// ─── Deployment Environment ──────────────────────────────────────────────────

export type DeploymentEnvironment = 'azure' | 'generic';

// ─── Azure Region ────────────────────────────────────────────────────────────

export type AzureCloud = 'commercial' | 'government' | 'dod';

export interface AzureRegion {
  id: string;
  name: string;
  displayName: string;
  cloud: AzureCloud;
  staticWebAppsSupported: boolean;
}

// ─── Azure / MSAL Configuration ──────────────────────────────────────────────

export interface AzureConfig {
  /** Deployment target: 'azure' (Azure Static Web Apps) or 'generic' (any static host) */
  deploymentEnvironment: DeploymentEnvironment;
  /** Azure Tenant (Directory) ID */
  tenantId: string;
  /** Azure AD Application (Client) ID */
  clientId: string;
  /** Azure subscription ID used when deploying SWA */
  subscriptionId: string;
  /** Azure Resource Group name */
  resourceGroup: string;
  /** Primary region for the Static Web App */
  region: string;
  /** Azure cloud environment */
  cloud: AzureCloud;
  /** Optional: custom Azure AD authority URL (overrides cloud default) */
  customAuthority?: string;
  /** MSAL redirect URI */
  redirectUri: string;
  /** MSAL post-logout redirect URI */
  postLogoutRedirectUri: string;
  /** MSAL scopes requested at sign-in */
  scopes: string[];
  /** Azure Static Web Apps deployment token */
  deploymentToken?: string;
  /** Graph API queries to run on page load; results are available for metadata injection. */
  graphApiQueries?: GraphApiQuery[];
  /** Static key/value pairs injected as page metadata for form submissions. */
  metadataFields?: MetadataField[];
  /** Generic API queries executed on page load; results stored in window.__pageData and page metadata. */
  apiPreloadQueries?: ApiPreloadQuery[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export interface Page {
  id: string;
  name: string;
  /** Serialised page content – JSON object with `html` and `css` string fields */
  gjsData: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Site ─────────────────────────────────────────────────────────────────────

export interface Site {
  id: string;
  name: string;
  description: string;
  azureConfig: AzureConfig;
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

// ─── API Builder ──────────────────────────────────────────────────────────────

/** Supported column data types in the API Builder table designer. */
export type ColumnType = 'string' | 'int' | 'decimal' | 'boolean' | 'datetime' | 'guid';

/** A single column within an API Builder table definition. */
export interface TableColumn {
  /** Column name (PascalCase recommended; used as C# property name). */
  name: string;
  /** SQL / .NET data type. */
  type: ColumnType;
  /** Whether null is a valid value. */
  nullable: boolean;
  /** When true this column is the primary key of the table. */
  isPrimaryKey: boolean;
  /** Optional human-readable description included in the OpenAPI spec. */
  description?: string;
}

/** A table (entity) whose CRUD API will be generated. */
export interface TableDefinition {
  /** Table name (PascalCase, singular recommended, e.g. "Product"). */
  name: string;
  /** Optional description included in the OpenAPI spec. */
  description?: string;
  /** Ordered list of columns. */
  columns: TableColumn[];
}

/** Export bundle wrapping an API Builder configuration with metadata. */
export interface ApiBuilderExportBundle {
  /** Schema version for forward-compatibility. */
  version: string;
  /** ISO-8601 timestamp of when the config was exported. */
  exportedAt: string;
  /** The saved API Builder configuration. */
  config: ApiBuilderConfig;
}

/** Top-level configuration for the API Builder code generator. */
export interface ApiBuilderConfig {
  /** Name of the service / Function App project (e.g. "InventoryService"). */
  serviceName: string;
  /**
   * API version label used in the URL path prefix, e.g. "v1".
   * Defaults to "v1".
   */
  version: string;
  /**
   * Base URL used in the OpenAPI `servers` block
   * (e.g. "https://api.example.com").
   */
  baseUrl: string;
  /** Tables (entities) for which CRUD Functions will be generated. */
  tables: TableDefinition[];
}
