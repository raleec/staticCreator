# Configuration Reference

This document describes every field in the StaticCreator site configuration (the `AzureConfig` object) and explains how each value is used at runtime in the generated static pages.

---

## Table of Contents

- [Configuration Object (`AzureConfig`)](#configuration-object-azureconfig)
- [General Tab](#general-tab)
- [Auth Tab](#auth-tab)
- [Region Tab](#region-tab)
- [Data Tab — API Preload Queries](#data-tab--api-preload-queries)
- [Forms Tab — Metadata Fields and Graph API Queries](#forms-tab--metadata-fields-and-graph-api-queries)
- [Graph API Queries](#graph-api-queries)
- [Default Values](#default-values)
- [Configuration Validation Rules](#configuration-validation-rules)

---

## Configuration Object (`AzureConfig`)

```ts
interface AzureConfig {
  // ── General ──────────────────────────────────────────────
  deploymentEnvironment:   DeploymentEnvironment; // 'azure' | 'generic'
  tenantId:                string;
  clientId:                string;
  subscriptionId:          string;
  resourceGroup:           string;
  cloud:                   AzureCloud;       // 'commercial' | 'government' | 'dod'
  region:                  string;
  deploymentToken?:        string;

  // ── Auth ─────────────────────────────────────────────────
  redirectUri:             string;
  postLogoutRedirectUri:   string;
  scopes:                  string[];
  customAuthority?:        string;

  // ── Data ─────────────────────────────────────────────────
  metadataFields?:         MetadataField[];
  graphApiQueries?:        GraphApiQuery[];
  apiPreloadQueries?:      ApiPreloadQuery[];
}
```

---

## General Tab

The configuration modal shows **up to five tabs** depending on the selected **Deployment Environment**:

- **Azure** mode: General, Auth, Region, Data, Forms
- **Generic** mode: General, Data, Forms (Auth and Region are not shown)

### Deployment Environment *(required)*

Selects the deployment target for the generated site:

| Value | Label | Description |
|---|---|---|
| `azure` | Azure | Deploy to Azure Static Web Apps with Azure AD / MSAL authentication. Auth and Region tabs are shown. |
| `generic` | Generic | Deploy to any static hosting provider. No Azure account or Azure AD registration required. Auth and Region tabs are hidden. |

When set to **Generic**, the exported ZIP does not include a `staticwebapp.config.json` file and the generated pages do not embed the MSAL bootstrap script.

---

### Site Name *(required)*

The display name for the site inside StaticCreator. Used to derive the filename when exporting:

```
<site-name>.json   →  my-portal.json
<site-name>.zip    →  my-portal.zip
```

Non-alphanumeric characters are replaced with `-` or `_` in file names.

---

### Azure Subscription ID *(required for Azure mode)*

The GUID of the Azure subscription where the Static Web App will reside.

```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Used:
- As a reference when manually running `az staticwebapp create --subscription <id>`
- Stored in the exported `site.json` bundle

---

### Resource Group *(Azure mode only)*

The Azure resource group that contains (or will contain) the Static Web App.

```
my-resource-group
```

Stored for reference only; StaticCreator does not create or manage Azure resources directly.

---

### Deployment Token *(optional, Azure mode only)*

The deployment token for the Azure Static Web App, obtained from:

> Azure Portal → Static Web App → **Manage deployment token**

or via the CLI:

```bash
az staticwebapp secrets list \
  --name <app-name> \
  --resource-group <resource-group> \
  --query "properties.apiKey" -o tsv
```

**Stored locally in `localStorage` only.** The token is never sent to a remote server by StaticCreator itself, but you should still treat it as a secret and avoid storing it in shared environments.

It is included in the exported `site.json` bundle — consider removing it from shared exports.

---

## Auth Tab *(Azure mode only)*

> This tab is only shown when **Deployment Environment** is set to **Azure**.

### Tenant (Directory) ID *(required)*

The GUID of the Azure AD (Entra ID) tenant that authenticated users must belong to.

```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Used in the generated HTML to construct the MSAL authority URL:

```js
// Commercial example
authority: 'https://login.microsoftonline.com/<tenantId>'
```

---

### Client (Application) ID *(required)*

The GUID of the Azure AD App Registration.

```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Used in the MSAL configuration embedded in every generated page:

```js
var msalConfig = {
  auth: {
    clientId: '<clientId>',
    authority: 'https://login.microsoftonline.com/<tenantId>',
    redirectUri: '<redirectUri>',
  },
  cache: { cacheLocation: 'sessionStorage', storeAuthStateInCookie: false },
};
```

---

### Redirect URI *(required)*

The URI that Azure AD redirects to after a successful sign-in. Must exactly match one of the **Redirect URIs** configured in the App Registration under **Authentication → Single-page application**.

Typical values:
- `https://<your-swa>.azurestaticapps.net` (production)
- `http://localhost:3000` (local testing)

Defaults to `window.location.origin` when a new site is created.

---

### Post-Logout Redirect URI

The URI that Azure AD redirects to after sign-out. Defaults to `window.location.origin`.

Must also be registered in the App Registration under **Authentication → Front-channel logout URL** or as an additional redirect URI.

---

### MSAL Scopes

Comma-separated list of OAuth 2.0 / OpenID Connect scopes requested during sign-in.

Default: `User.Read`

Typical values:
```
User.Read
User.Read, openid, profile
User.Read, https://graph.microsoft.com/GroupMember.Read.All
```

The same scopes are used when acquiring tokens for REST API form submissions and Graph API queries.

---

### Custom Authority URL *(optional)*

Override the automatically computed authority URL. Leave blank to use the default for the selected cloud and tenant.

| Cloud | Default authority |
|---|---|
| Commercial | `https://login.microsoftonline.com/<tenantId>` |
| Government | `https://login.microsoftonline.us/<tenantId>` |
| DoD | `https://login.microsoftonline.us/<tenantId>` |

Use the custom field for non-standard authority URLs such as B2C tenants or custom ADFS endpoints.

---

## Region Tab *(Azure mode only)*

> This tab is only shown when **Deployment Environment** is set to **Azure**.

### Cloud Environment

Selects the Azure sovereign cloud for the deployment.

| Value | Label | Login endpoint | Graph endpoint |
|---|---|---|---|
| `commercial` | Azure Commercial | `login.microsoftonline.com` | `graph.microsoft.com` |
| `government` | Azure Government (MAG) | `login.microsoftonline.us` | `graph.microsoft.us` |
| `dod` | Azure DoD | `login.microsoftonline.us` | `dod-graph.microsoft.us` |

Changing the cloud automatically updates the region list and resets the selected region to the first available one for that cloud.

---

### Region

The primary Azure region for the Static Web App. Only regions with Static Web Apps support are selectable; unsupported regions are shown but disabled.

Supported regions by cloud (as of the time of writing):

**Commercial** (partial list): East US, East US 2, West US, West US 2, West US 3, Central US, South Central US, North Europe, West Europe, UK South, France Central, East Asia, Southeast Asia, Japan East, Australia East, Brazil South, Canada Central, Central India, Korea Central

**Government**: US Gov Arizona, US Gov Texas, US Gov Virginia

**DoD**: US DoD Central, US DoD East

---

## Data Tab — API Preload Queries

Generic HTTP requests executed on `DOMContentLoaded`. Results are stored in `window.__pageData` and merged into `__pageMetadata` for form pre-fill.

### ApiPreloadQuery

```ts
interface ApiPreloadQuery {
  name:               string;   // Storage key in window.__pageData
  url:                string;   // Full endpoint URL
  method?:            string;   // 'GET' | 'POST' (default: 'GET')
  includeAuthHeader?: boolean;  // Attach MSAL Bearer token if signed in
}
```

**Example configuration:**

| Name | URL | Method | Auth |
|---|---|---|---|
| `products` | `https://api.example.com/products` | GET | No |
| `profile` | `https://api.example.com/me` | GET | Yes |

**Runtime effect:**

```js
// After page load:
window.__pageData["products"] = { /* JSON from API */ };
window.__pageData["profile"]  = { name: "Alice", email: "alice@example.com" };

// Also available in __pageMetadata (merged):
__pageMetadata["products"] = window.__pageData["products"];
__pageMetadata["profile"]  = window.__pageData["profile"];
```

Accessing nested values in pre-fill attributes:
```html
<input data-metadata-prefill="profile.email" />
```

---

## Forms Tab — Metadata Fields and Graph API Queries

The Forms tab contains two sections: **Static Metadata Fields** (available in all deployment modes) and **Graph API Queries** (Azure mode only).

### Static Metadata Fields

Static key/value pairs that are injected into the `__pageMetadata` object on every page load, before any network requests are made.

### MetadataField

```ts
interface MetadataField {
  key:   string;   // Reference key used in data attributes and metadata-inject lists
  value: string;   // Static string value
}
```

**Example configuration:**

| Key | Value |
|---|---|
| `appVersion` | `2.1.0` |
| `environment` | `production` |
| `supportEmail` | `help@example.com` |

**Runtime effect on generated pages:**

```js
var __pageMetadata = {};
__pageMetadata["appVersion"]    = "2.1.0";
__pageMetadata["environment"]   = "production";
__pageMetadata["supportEmail"]  = "help@example.com";
```

These values can then be:
- Injected into form submissions with `data-metadata-inject="appVersion,environment"`
- Used to pre-fill form fields with `data-metadata-prefill="supportEmail"`

---

## Graph API Queries *(Azure mode only)*

Microsoft Graph API queries are configured in the **Forms** tab and run after MSAL token acquisition. Results are stored in `__pageMetadata`.

### GraphApiQuery

```ts
interface GraphApiQuery {
  name:     string;   // Key in __pageMetadata
  endpoint: string;   // Graph API path, e.g. '/me' or '/me/memberOf'
  select?:  string;   // OData $select clause, e.g. 'displayName,mail'
  filter?:  string;   // OData $filter clause
}
```

**Example:**

| Name | Endpoint | Select |
|---|---|---|
| `currentUser` | `/me` | `displayName,mail,jobTitle` |
| `groups` | `/me/memberOf` | `displayName` |

**Runtime effect:**

```js
// After Graph fetch:
__pageMetadata["currentUser"] = {
  displayName: "Alice Smith",
  mail: "alice@example.com",
  jobTitle: "Engineer"
};
```

Pre-filling a field from Graph data:

```html
<input type="email" data-metadata-prefill="currentUser.mail" />
```

---

## Default Values

When creating a new site, the following defaults are applied:

```ts
{
  deploymentEnvironment:  'azure',
  tenantId:               '',
  clientId:               '',
  subscriptionId:         '',
  resourceGroup:          '',
  region:                 'eastus',
  cloud:                  'commercial',
  redirectUri:            window.location.origin,
  postLogoutRedirectUri:  window.location.origin,
  scopes:                 ['User.Read'],
  deploymentToken:        '',
}
```

---

## Configuration Validation Rules

The following fields are validated when saving a site configuration. Attempting to save with invalid data will highlight the offending fields and prevent saving.

| Field | Rule |
|---|---|
| Site Name | Required, non-empty |
| Tenant ID | Required, non-empty *(Azure mode only)* |
| Client ID | Required, non-empty *(Azure mode only)* |
| Subscription ID | Required, non-empty *(Azure mode only)* |
| Redirect URI | Required, non-empty *(Azure mode only)* |
