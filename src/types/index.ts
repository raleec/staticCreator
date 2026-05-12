// ─── Azure Region ────────────────────────────────────────────────────────────

export type AzureCloud = 'commercial' | 'government' | 'dod' | 'china';

export interface AzureRegion {
  id: string;
  name: string;
  displayName: string;
  cloud: AzureCloud;
  staticWebAppsSupported: boolean;
}

// ─── Azure / MSAL Configuration ──────────────────────────────────────────────

export interface AzureConfig {
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
