# StaticCreator

A browser-based no-code tool for building and exporting static web pages. Choose between two deployment modes:

- **Azure** — pages include Azure Active Directory (Entra ID / MSAL) authentication and export with a `staticwebapp.config.json` ready for Azure Static Web Apps.
- **Generic** — pages are plain HTML/CSS/JS with form submission and API preloading, deployable to any static hosting provider (no Azure account required).

Build pages visually, configure API integrations, and export a ready-to-deploy ZIP — no back-end required.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started (Development)](#getting-started-development)
- [Application Overview](#application-overview)
- [Configuration Reference](#configuration-reference)
- [Azure App Registration Setup](#azure-app-registration-setup)
- [Building Pages](#building-pages)
- [Forms & Data Integration](#forms--data-integration)
- [API Builder](#api-builder)
- [Exporting Your Site](#exporting-your-site)
- [Deploying Your Site](#deploying-your-site)
- [Data Persistence](#data-persistence)

---

## Features

- **Visual page builder** powered by [GrapesJS](https://grapesjs.com/) — drag and drop pre-built components to build pages visually with real-time preview
- **Form blocks** — create forms with pre-built input fields (text, email, number, textarea, dropdown, checkbox, radio, file upload, and hidden fields) and table blocks for data display
- **Two deployment modes** — **Azure** (Azure Static Web Apps + MSAL authentication) or **Generic** (any static host, no Azure account needed)
- **Azure AD / MSAL authentication** baked into every exported Azure-mode page
- Support for **Azure Commercial, Government (MAG), and DoD** clouds
- **REST API forms** — submit form data to any API endpoint, optionally with an MSAL Bearer token
- **API preloading** — fetch data on page load and pre-fill form fields automatically
- **Microsoft Graph API** integration for user metadata (Azure mode only)
- **Static metadata fields** for injecting fixed key/value data into forms
- **Export as ZIP** — generates standalone HTML files; Azure-mode exports include an `staticwebapp.config.json` routing config
- **Import/export** site configurations as JSON for backup and sharing
- **API Builder** — generates OpenAPI 3.x contracts and complete .NET 8 Azure Functions projects from a visual table designer, with SQL `CREATE TABLE` import support
- All site data stored locally in the browser (no server required)

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| Azure subscription | Required for deploying generated sites |

---

## Getting Started (Development)

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Lint the source code
npm run lint
```

The dev server starts at `http://localhost:5173` by default.

---

## Application Overview

StaticCreator has two main views:

### Management Portal

The landing screen where you manage sites and pages.

- **New Site** — opens the configuration modal to create a new site with Azure credentials
- **Import Site** — load a previously exported `.json` bundle
- **API Builder** — opens the API Builder to design tables and generate a .NET 8 Azure Functions API project
- **Export as JSON** — download the full site configuration and page data
- **Export as ZIP** — download a ready-to-deploy archive
- **Edit configuration** (gear icon) — update Azure settings for an existing site
- **Add Page** — name and create a new page, then open it in the builder
- **Delete** — remove a site or a single page (with confirmation)

### Page Builder

A full-screen GrapesJS drag-and-drop editor for designing a page with visual components.

- **Blocks tab** (left panel) — drag pre-built components (Section, Hero, Card, Button, Forms, Tables, etc.) onto the canvas
- **Layers tab** (left panel) — view and manage the layer hierarchy of your page elements
- **Styles tab** (left panel) — customize styling properties for selected elements
- **Canvas** — visual editor where you can drag, drop, and arrange components
- **Save** — persists the current page content to `localStorage`
- **Preview** — toggles between edit mode and preview mode to see the final result
- **Config** (gear icon) — edit the site's configuration without leaving the builder
- **Back** — return to the Management Portal

---

## Configuration Reference

Every site has an **Azure Configuration** object. It is set when you create a site and can be edited at any time via the gear icon.

The configuration modal shows **up to five tabs** depending on the selected **Deployment Environment**:

- **Azure** mode: General, Auth, Region, Data, Forms
- **Generic** mode: General, Data, Forms (Auth and Region are not shown)

### General Tab

| Field | Required | Description |
|---|---|---|
| **Site Name** | ✅ | Display name for the site inside StaticCreator |
| **Description** | | Optional description |
| **Deployment Environment** | ✅ | `Azure` — deploy to Azure Static Web Apps with MSAL authentication; `Generic` — deploy to any static host without Azure AD |
| **Azure Subscription ID** | ✅ (Azure) | The GUID of the Azure subscription where the Static Web App will be created |
| **Resource Group** | (Azure) | Azure resource group name (used for reference; deployment is performed outside the tool) |
| **Deployment Token** | (Azure) | Azure SWA deployment token (stored locally, never transmitted by the app itself) |

> The Azure Subscription ID, Resource Group, and Deployment Token fields are only shown when **Deployment Environment** is set to **Azure**.

### Auth Tab *(Azure only)*

| Field | Required | Description |
|---|---|---|
| **Tenant (Directory) ID** | ✅ | Azure AD / Entra ID tenant GUID |
| **Client (Application) ID** | ✅ | App registration client GUID |
| **Redirect URI** | ✅ | URI Azure AD redirects to after sign-in (must match the App Registration) |
| **Post-Logout Redirect URI** | | URI Azure AD redirects to after sign-out |
| **MSAL Scopes** | | Comma-separated list of OAuth 2.0 scopes (default: `User.Read`) |
| **Custom Authority URL** | | Override the computed authority URL; defaults to the cloud-specific endpoint for the given Tenant ID |

The computed authority is displayed below the Custom Authority field:
- **Commercial**: `https://login.microsoftonline.com/<tenantId>`
- **Government / DoD**: `https://login.microsoftonline.us/<tenantId>`

### Region Tab *(Azure only)*

| Field | Description |
|---|---|
| **Cloud Environment** | `Azure Commercial`, `Azure Government (MAG)`, or `Azure DoD` |
| **Region** | Azure region for the Static Web App. Regions that do not support SWA are shown but disabled. |

### Data Tab

Defines **API Preload Queries** — generic HTTP requests that run on page load. Results are stored in `window.__pageData` and merged into `__pageMetadata`.

| Field | Description |
|---|---|
| **Name** | Key used to store results in `window.__pageData` and reference in form attributes |
| **URL** | Full URL of the API endpoint |
| **Method** | `GET` or `POST` (default: `GET`) |
| **Include Auth Header** | When checked, adds an MSAL Bearer token to the request if the user is signed in |

> See [Forms & Data Integration](docs/forms-and-data.md) for detailed usage.

### Forms Tab

Defines two categories of site-level data:

**Static Metadata Fields** — hard-coded key/value pairs injected into `__pageMetadata` on every page load.

| Column | Description |
|---|---|
| **Key** | Name used in `data-metadata-prefill` attributes and `data-metadata-inject` lists |
| **Value** | Static string value |

**Graph API Queries** *(Azure only)* — Microsoft Graph API requests executed after MSAL token acquisition. Results are stored in `__pageMetadata`.

| Column | Description |
|---|---|
| **Name** | Key used to store results in `__pageMetadata` |
| **Endpoint** | Graph API path, e.g. `/me` or `/me/memberOf` |
| **$select** | Optional OData `$select` fields, e.g. `displayName,mail` |
| **$filter** | Optional OData `$filter` expression |

---

## Azure App Registration Setup

> **This section applies to Azure mode deployments only.** If you selected **Generic** as the deployment environment, you can skip this section.

Before you can use MSAL authentication in your exported pages, you need an Azure AD App Registration.

1. Go to the [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations** → **New registration**
2. Enter a name and select the appropriate supported account type (single tenant, multi-tenant, etc.)
3. Under **Redirect URIs**, add a **Single-page application (SPA)** URI matching your deployed site URL (e.g., `https://<your-swa-name>.azurestaticapps.net`)
4. After creation, copy the **Application (client) ID** and **Directory (tenant) ID** into the StaticCreator configuration
5. Under **API permissions**, add `Microsoft Graph` → `User.Read` (delegated) as a minimum; add any extra Graph or custom API scopes your pages need
6. Grant **admin consent** if your organisation requires it

For Government or DoD clouds, register the app in the corresponding sovereign Azure portal.

---

## Building Pages

1. Create a site, then click **Add Page** and give the page a name
2. The page opens in the GrapesJS drag-and-drop editor
3. Use the **Blocks tab** on the left panel to drag components onto the canvas:
   - **Section** — basic content section with title and paragraph
   - **Text** — simple text block
   - **Image** — image placeholder
   - **Button** — call-to-action button
   - **2 Columns** / **3 Columns** — multi-column layout grids
   - **Hero** — full-width hero banner with gradient background
   - **Navbar** — navigation bar with links
   - **Footer** — footer section
   - **Card** — card component with title, description, and link
   - **Divider** — horizontal divider line
   - **Login Form** — basic login form template
   - **Forms** category — API Form and individual form field blocks (see [Form Builder documentation](docs/form-builder.md))
   - **Tables** category — Basic Table, Striped Table, Responsive Table
4. Use the **Layers tab** to view and manage the component hierarchy
5. Use the **Styles tab** to customize colors, spacing, typography, and decoration for selected elements
6. Click and drag components on the canvas to reposition them
7. Toggle **Preview** mode to see the final rendered page
8. Click **Config** (gear icon) to edit the site's configuration
9. Click **Save** (or press **Ctrl+S** / **Cmd+S**) to persist your work

### Form data attributes

When using an **API Form** snippet, configure the following HTML attributes directly in the editor:

| Attribute | Description |
|---|---|
| `data-api-url` | The URL to `POST`/`PUT`/`PATCH` the form data to |
| `data-api-method` | `POST`, `PUT`, or `PATCH` |
| `data-auth-header` | `true` to attach an MSAL access token; `false` to skip |
| `data-metadata-inject` | Comma-separated keys from `__pageMetadata` to add to the request body |
| `data-success-message` | Alert shown on a successful submission |
| `data-success-redirect` | Optional URL to navigate to instead of showing an alert |

To pre-fill a form field from page metadata, set:

| Attribute | Description |
|---|---|
| `data-metadata-prefill` | Dot-notation path into `__pageMetadata` (e.g. `currentUser.mail`) |

---

## Forms & Data Integration

See [docs/forms-and-data.md](docs/forms-and-data.md) for the complete reference on:

- REST API form data attributes
- API preload queries and `window.__pageData`
- Microsoft Graph API integration
- Static metadata fields and `__pageMetadata`
- The `data-metadata-prefill` attribute

---

## API Builder

The **API Builder** is a standalone tool accessible from the **API Builder** button in the Management Portal header. It generates a complete, contract-first Azure Functions API from a visual table designer — no site is required.

### What it generates

For each configured service, clicking **Generate & Download** produces a ZIP archive containing:

| File | Description |
|---|---|
| `openapi.yaml` | OpenAPI 3.0.3 spec (contract-first) |
| `{ServiceName}.csproj` | .NET 8 isolated Functions project file |
| `Program.cs` | Host builder with OpenAPI middleware registration |
| `host.json` | Functions host configuration |
| `local.settings.json` | Local dev settings template |
| `Models/{Table}.cs` | C# model class per table |
| `Functions/{Table}Functions.cs` | Full CRUD HTTP trigger Functions per table |

### Workflow

1. Click **API Builder** in the Management Portal header
2. Enter a **Service Name**, **Version** (e.g. `v1`), and **Base URL**
3. Add one or more tables and define their columns (name, type, nullable, primary key)
4. Optionally use **Import from SQL** on any table to auto-populate columns from a pasted `CREATE TABLE` block
5. Click **Generate & Download** to export the ZIP
6. Use **Save Config** / **Load Config** to persist and reload API configurations as JSON

### Column types

| UI Label | C# type | SQL / OpenAPI type |
|---|---|---|
| String (varchar) | `string` | `nvarchar` / `string` |
| Integer (int) | `int` | `int` / `integer` |
| Decimal (numeric) | `decimal` | `decimal` / `number` |
| Boolean (bit) | `bool` | `bit` / `boolean` |
| DateTime (datetimeoffset) | `DateTimeOffset` | `datetimeoffset` / `string (date-time)` |
| GUID (uniqueidentifier) | `Guid` | `uniqueidentifier` / `string (uuid)` |

### SQL Import

Each table has an **Import from SQL** panel. Paste a raw column-definition block copied from SSMS or a `.sql` file:

```sql
[ProductName] [nvarchar](255) NOT NULL,
[Price]       [decimal](10, 2) NOT NULL,
[CreatedAt]   [datetimeoffset] NOT NULL,
[IsActive]    [bit] NULL
```

StaticCreator parses the column names and maps SQL types to the nearest supported type. Existing primary key columns are preserved and deduplicated. Unknown SQL types fall back to `string`.

> See [docs/api-builder.md](docs/api-builder.md) for the full API Builder reference.

---

## Exporting Your Site

From the Management Portal, click the site's export buttons:

| Button | Output |
|---|---|
| **Export as JSON** (file icon) | `<site-name>.json` — full configuration + page data bundle for backup/import |
| **Export as ZIP** (archive icon) | `<site-name>.zip` — deployment-ready archive |

The ZIP archive contents differ by **Deployment Environment**:

**Azure mode:**

```
<site-name>/
├── site.json                   # Full site bundle (backup)
├── staticwebapp.config.json    # Azure SWA routing + auth config
└── pages/
    ├── home.html               # Standalone HTML with embedded MSAL bootstrap
    ├── contact.html
    └── ...
```

**Generic mode:**

```
<site-name>/
├── site.json                   # Full site bundle (backup)
└── pages/
    ├── home.html               # Standalone HTML (no MSAL, no SWA config)
    ├── contact.html
    └── ...
```

Each HTML page is fully self-contained: it includes your page's HTML/CSS and all the runtime logic for form submission and metadata pre-fill. Azure-mode pages additionally include the MSAL bootstrap script for Azure AD authentication.

---

## Deploying Your Site

### Azure Static Web Apps

See [docs/deployment.md](docs/deployment.md) for step-by-step deployment instructions for **Azure** mode exports, including:

- Deploying via the Azure Portal
- Deploying with the Azure CLI (`az staticwebapp`)
- Deploying with the SWA CLI (`swa deploy`)
- Required Azure App Registration settings
- Environment variables and application settings

### Generic Static Hosting

For **Generic** mode exports, the ZIP contains plain HTML files and a `site.json` backup — no `staticwebapp.config.json` is included. Upload the contents of the `pages/` folder (and any other assets) to any static hosting provider such as GitHub Pages, Netlify, Cloudflare Pages, or an Azure Blob Storage static website. No special configuration is required.

---

## Data Persistence

StaticCreator stores all site and page data in the **browser's `localStorage`** under the key `staticCreator_sites`. No data is sent to a server.

**Implications:**

- Data is tied to the browser and device — use **Export as JSON** to back up or transfer sites
- Clearing browser data will erase all sites
- Storage is subject to the browser's `localStorage` quota (~5–10 MB depending on the browser)

To migrate to a new browser or device:
1. Export the site as JSON from the Management Portal
2. Open StaticCreator in the new browser
3. Click **Import Site** and select the exported `.json` file
