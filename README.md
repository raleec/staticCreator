# StaticCreator

A browser-based no-code tool for building static web pages that authenticate via **Azure Active Directory (Entra ID / MSAL)** and deploy to **Azure Static Web Apps**.

Build pages visually, configure Azure AD authentication, hook up REST API forms, and export a ready-to-deploy ZIP — no back-end required.

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
- [Exporting Your Site](#exporting-your-site)
- [Deploying to Azure Static Web Apps](#deploying-to-azure-static-web-apps)
- [Data Persistence](#data-persistence)

---

## Features

- **Visual page builder** powered by [GrapesJS](https://grapesjs.com/)
- **Azure AD / MSAL authentication** baked into every exported page
- Support for **Azure Commercial, Government (MAG), DoD, and China** clouds
- **REST API forms** — submit form data to any API endpoint, optionally with an MSAL Bearer token
- **API preloading** — fetch data on page load and pre-fill form fields automatically
- **Microsoft Graph API** integration for user metadata
- **Static metadata fields** for injecting fixed key/value data into forms
- **Export as ZIP** — generates standalone HTML files with an Azure SWA routing config
- **Import/export** site configurations as JSON for backup and sharing
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
- **Export as JSON** — download the full site configuration and page data
- **Export as ZIP** — download a ready-to-deploy archive
- **Edit configuration** (gear icon) — update Azure settings for an existing site
- **Add Page** — name and create a new page, then open it in the builder
- **Delete** — remove a site or a single page (with confirmation)

### Page Builder

A full-screen GrapesJS editor for visually designing a page.

- Drag-and-drop blocks from the **Blocks** panel on the right
- Edit styles, traits, and layers with the side panels
- **Save** — persists the current page content to `localStorage`
- **Preview** — toggle device-preview mode
- **Settings** (gear icon) — edit the site's Azure configuration without leaving the builder
- **Back** — return to the Management Portal

---

## Configuration Reference

Every site has an **Azure Configuration** object. It is set when you create a site and can be edited at any time via the gear icon.

The configuration modal has five tabs:

### General Tab

| Field | Required | Description |
|---|---|---|
| **Site Name** | ✅ | Display name for the site inside StaticCreator |
| **Description** | | Optional description |
| **Azure Subscription ID** | ✅ | The GUID of the Azure subscription where the Static Web App will be created |
| **Resource Group** | | Azure resource group name (used for reference; deployment is performed outside the tool) |
| **Deployment Token** | | Azure SWA deployment token (stored locally, never transmitted by the app itself) |

### Auth Tab

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
- **China**: `https://login.chinacloudapi.cn/<tenantId>`

### Region Tab

| Field | Description |
|---|---|
| **Cloud Environment** | `Azure Commercial`, `Azure Government (MAG)`, `Azure DoD`, or `Azure China (21Vianet)` |
| **Region** | Azure region for the Static Web App. Regions that do not support SWA are shown but disabled. |

### Forms Tab

Defines **Metadata Fields** — static key/value pairs that are injected into `__pageMetadata` on page load and can be used to pre-fill form fields.

| Column | Description |
|---|---|
| **Key** | Name used in `data-metadata-prefill` attributes and `data-metadata-inject` lists |
| **Value** | Static string value |

### Data Tab

Defines **API Preload Queries** — generic HTTP requests that run on page load. Results are stored in `window.__pageData` and merged into `__pageMetadata`.

| Field | Description |
|---|---|
| **Name** | Key used to store results in `window.__pageData` and reference in form attributes |
| **URL** | Full URL of the API endpoint |
| **Method** | `GET` or `POST` (default: `GET`) |
| **Include Auth Header** | When checked, adds an MSAL Bearer token to the request if the user is signed in |

> See [Forms & Data Integration](docs/forms-and-data.md) for detailed usage.

---

## Azure App Registration Setup

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
2. The page opens in the GrapesJS editor
3. Use the **Blocks** panel (right side) to drag components onto the canvas:
   - **Basic** blocks — headings, paragraphs, images, links, etc.
   - **Forms** blocks — API Form, Text Input, Email Input, Dropdown, Textarea, Hidden Input
4. Select a component on the canvas to edit its **Traits** (properties), **Styles**, and **Settings**
5. Click **Save** to persist your work

### Form-specific traits

When an **API Form** block is selected, the Traits panel exposes:

| Trait | Description |
|---|---|
| `API Endpoint URL` | The URL to `POST`/`PUT`/`PATCH` the form data to |
| `HTTP Method` | `POST`, `PUT`, or `PATCH` |
| `Include Bearer Token` | Whether to attach an MSAL access token |
| `Inject Metadata Keys` | Comma-separated keys from `__pageMetadata` to add to the request body |
| `Success Message` | Alert shown on a successful submission |
| `Redirect URL on Success` | Optional URL to navigate to instead of showing an alert |

When an **input**, **select**, or **textarea** is selected, an extra trait appears:

| Trait | Description |
|---|---|
| `Prefill from Metadata Key` | Dot-notation path into `__pageMetadata` (e.g. `currentUser.mail`) |

---

## Forms & Data Integration

See [docs/forms-and-data.md](docs/forms-and-data.md) for the complete reference on:

- REST API form data attributes
- API preload queries and `window.__pageData`
- Microsoft Graph API integration
- Static metadata fields and `__pageMetadata`
- The `data-metadata-prefill` attribute

---

## Exporting Your Site

From the Management Portal, click the site's export buttons:

| Button | Output |
|---|---|
| **Export as JSON** (file icon) | `<site-name>.json` — full configuration + page data bundle for backup/import |
| **Export as ZIP** (archive icon) | `<site-name>.zip` — deployment-ready archive |

The ZIP archive contains:

```
<site-name>/
├── site.json                   # Full site bundle (backup)
├── staticwebapp.config.json    # Azure SWA routing + auth config
└── pages/
    ├── home.html               # Standalone HTML with embedded MSAL bootstrap
    ├── contact.html
    └── ...
```

Each HTML page is fully self-contained: it includes the MSAL bootstrap script, your page's HTML/CSS, and all the runtime logic for authentication, form submission, and metadata pre-fill.

---

## Deploying to Azure Static Web Apps

See [docs/deployment.md](docs/deployment.md) for step-by-step deployment instructions, including:

- Deploying via the Azure Portal
- Deploying with the Azure CLI (`az staticwebapp`)
- Deploying with the SWA CLI (`swa deploy`)
- Required Azure App Registration settings
- Environment variables and application settings

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
