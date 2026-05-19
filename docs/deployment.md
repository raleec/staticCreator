# Deploying to Azure Static Web Apps

This guide covers how to deploy the static pages exported by StaticCreator to [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/).

---

## Table of Contents

- [Overview](#overview)
- [Export the Site ZIP](#export-the-site-zip)
- [ZIP Archive Contents](#zip-archive-contents)
- [Option 1: Deploy via Azure Portal](#option-1-deploy-via-azure-portal)
- [Option 2: Deploy with the SWA CLI](#option-2-deploy-with-the-swa-cli)
- [Option 3: Deploy with the Azure CLI](#option-3-deploy-with-the-azure-cli)
- [Option 4: Deploy via GitHub Actions](#option-4-deploy-via-github-actions)
- [Azure App Registration — Required Settings](#azure-app-registration--required-settings)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## Overview

StaticCreator generates plain HTML/CSS/JS pages that include:

- An embedded **MSAL Browser** bootstrap for Azure AD sign-in (Azure mode only)
- Your page's visual content (HTML + CSS from GrapesJS)
- Runtime logic for form submissions, API preloads, and metadata pre-fill

The export ZIP also contains a `staticwebapp.config.json` that configures routing, authentication, and security headers for Azure Static Web Apps.

No build step is required — you unzip and deploy.

---

## Export the Site ZIP

1. Open the **Management Portal**
2. Find the site you want to deploy
3. Click the **Archive** icon (Export as ZIP)
4. A `.zip` file is downloaded to your computer

---

## ZIP Archive Contents

```
<site-name>/
├── site.json                     # Full site bundle (backup / re-import)
├── staticwebapp.config.json      # Azure SWA routing and auth configuration
└── pages/
    ├── home.html
    ├── contact.html
    └── ...
```

### `staticwebapp.config.json`

The generated configuration includes:

```json
{
  "routes": [
    { "route": "/login",  "rewrite": "/index.html" },
    { "route": "/*",      "rewrite": "/index.html" }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*", "/css/*", "/*.{js,css,ico,png,jpg,gif,svg}"]
  },
  "responseOverrides": {
    "401": { "redirect": "/login", "statusCode": 302 },
    "403": { "statusCode": 403 },
    "404": { "rewrite": "/index.html", "statusCode": 200 }
  },
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/<tenantId>/v2.0",
          "clientIdSettingName": "AZURE_CLIENT_ID",
          "clientSecretSettingName": "AZURE_CLIENT_SECRET"
        }
      }
    }
  },
  "globalHeaders": {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
}
```

> For Government and DoD clouds the `openIdIssuer` uses `login.microsoftonline.us` instead.

---

## Option 1: Deploy via Azure Portal

### 1. Create a Static Web App

1. Sign in to the [Azure Portal](https://portal.azure.com)
2. Search for **Static Web Apps** and click **Create**
3. Fill in:
   - **Subscription** — the subscription ID from your site configuration
   - **Resource Group** — create new or use existing
   - **Name** — unique name for the Static Web App
   - **Plan type** — Free (for evaluation) or Standard (for production authentication)
   - **Region** — select the region from your site configuration
4. Under **Deployment details**, select **Other** as the source
5. Click **Review + create** → **Create**

### 2. Obtain the Deployment Token

After the Static Web App is created:

1. Open the resource in the portal
2. Go to **Settings** → **Deployment token**
3. Copy the token

### 3. Deploy with the SWA CLI (using the portal-obtained token)

```bash
npm install -g @azure/static-web-apps-cli

# Unzip the export
unzip my-site.zip -d my-site
cd my-site/my-site     # navigate into the inner folder

swa deploy . \
  --deployment-token <token> \
  --app-location .
```

---

## Option 2: Deploy with the SWA CLI

The [Azure Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/) is the recommended approach for local/CI deployment.

### Install

```bash
npm install -g @azure/static-web-apps-cli
```

### Authenticate

```bash
swa login
```

### Create (first-time) and deploy

```bash
# Unzip the export
unzip my-site.zip -d my-site
cd my-site/my-site

# Deploy (creates the SWA if it does not exist)
swa deploy . \
  --app-name <swa-name> \
  --resource-group <resource-group> \
  --subscription-id <subscription-id> \
  --location <region>
```

### Redeploy (subsequent deployments)

```bash
swa deploy . --deployment-token <token>
```

The deployment token is shown in the portal or via:

```bash
az staticwebapp secrets list \
  --name <swa-name> \
  --resource-group <resource-group> \
  --query "properties.apiKey" -o tsv
```

---

## Option 3: Deploy with the Azure CLI

### Prerequisites

```bash
# Install the Azure CLI
# https://learn.microsoft.com/cli/azure/install-azure-cli

az login
az account set --subscription <subscription-id>
```

### Create the Static Web App

```bash
az staticwebapp create \
  --name <swa-name> \
  --resource-group <resource-group> \
  --location <region> \
  --sku Standard
```

> Use `--sku Free` for evaluation; authentication features (Azure AD login) require the **Standard** tier.

### Upload static content

The Azure CLI does not directly upload files to Static Web Apps. Use the SWA CLI (Option 2) or GitHub Actions (Option 4) for file deployment.

---

## Option 4: Deploy via GitHub Actions

1. Push your unzipped site contents to a GitHub repository
2. In the Azure Portal, create a Static Web App and link it to the repository
3. Azure automatically adds a GitHub Actions workflow file (`.github/workflows/azure-static-web-apps-*.yml`) to your repository
4. Every push to the connected branch triggers a deployment

If you prefer to manage the workflow manually, here is a minimal example:

```yaml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: upload
          app_location: /        # Root of the unzipped site
          skip_app_build: true   # No build needed – files are pre-built
```

---

## Azure App Registration — Required Settings

The MSAL bootstrap embedded in your exported pages requires specific App Registration settings.

### Redirect URIs

Register your deployed URL as a **Single-page application (SPA)** redirect URI:

1. Azure Portal → **Microsoft Entra ID** → **App registrations** → your app
2. **Authentication** → **Add a platform** → **Single-page application**
3. Add:
   - `https://<swa-name>.azurestaticapps.net` (production)
   - Any other URIs used for testing

> For Government deployments the SWA URL will be `https://<swa-name>.azurestaticapps.us`.

### SWA Built-in Authentication vs. MSAL

StaticCreator pages use **MSAL Browser** (client-side) for authentication. If you also enable Azure Static Web Apps built-in auth (`staticwebapp.config.json` `auth` block), the two mechanisms operate independently.

- **MSAL** handles sign-in on the client side; tokens are stored in `sessionStorage`
- **SWA built-in auth** handles server-side route protection; it requires the **Standard** tier and a client secret configured as an application setting

To use only MSAL (simpler setup), remove the `auth` block from `staticwebapp.config.json` before deploying.

### Required Application Settings (for SWA built-in auth)

If you keep the `auth` block, add these application settings to the Static Web App:

| Setting | Value |
|---|---|
| `AZURE_CLIENT_ID` | App Registration client ID |
| `AZURE_CLIENT_SECRET` | A client secret created in the App Registration |

Set via the Azure Portal:

> Static Web App → **Settings** → **Configuration** → **Add**

Or via the CLI:

```bash
az staticwebapp appsettings set \
  --name <swa-name> \
  --resource-group <resource-group> \
  --setting-names AZURE_CLIENT_ID=<id> AZURE_CLIENT_SECRET=<secret>
```

---

## Post-Deployment Checklist

After deploying, verify the following:

- [ ] The site URL opens in a browser without errors
- [ ] Navigating to a page URL does not return 404 (the `navigationFallback` in `staticwebapp.config.json` should handle this)
- [ ] MSAL sign-in redirects correctly to the Redirect URI registered in the App Registration
- [ ] After sign-in, the page reloads and the MSAL token is acquired silently
- [ ] Form submissions reach the configured API endpoint
- [ ] API preload queries return data and pre-fill the expected fields
- [ ] Security headers are present (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)

Check headers with:

```bash
curl -I https://<swa-name>.azurestaticapps.net/pages/home.html
```

---

## Troubleshooting

### MSAL redirect loop

**Symptom:** Page keeps redirecting to the login URL.

**Cause:** The Redirect URI in the App Registration does not match `redirectUri` in the site configuration, or the MSAL `handleRedirectPromise` is failing silently.

**Fix:**
1. Confirm the Redirect URI in Azure Portal → App Registration → Authentication exactly matches the deployed URL (including trailing slash if present)
2. Open the browser console and look for MSAL errors

---

### 404 on page load after deploy

**Symptom:** Navigating directly to `https://<swa>/pages/home.html` returns 404.

**Cause:** The files were not placed at the root of the deployed static content, or the navigation fallback is not configured correctly.

**Fix:**
1. Ensure the `pages/` folder and `staticwebapp.config.json` are at the root of the deployed folder (not nested inside another folder)
2. Confirm `staticwebapp.config.json` is present and valid JSON

---

### Forms not submitting

**Symptom:** Clicking Submit does nothing or shows a network error.

**Cause:** The API endpoint URL is incorrect, CORS is not enabled on the API, or the Bearer token is being sent to an API that does not accept it.

**Fix:**
1. Open the browser console and look for `[API Form]` log messages
2. Check that `data-api-url` on the form is set to the correct URL
3. Ensure the API allows CORS from the SWA origin
4. If the API does not require authentication, set `data-auth-header="false"` on the form

---

### SRI hash mismatch for MSAL script

**Symptom:** Browser blocks the MSAL script with a content security policy or SRI error.

**Cause:** The generated pages include a placeholder SRI hash:
```html
integrity="sha384-REPLACE_WITH_ACTUAL_SRI_HASH_FOR_YOUR_VERSION"
```

**Fix:**
Replace the placeholder with the actual SRI hash for the MSAL version you are using. Find the hash on the [MSAL releases page](https://github.com/AzureAD/microsoft-authentication-library-for-js/releases) or compute it yourself:

```bash
curl -s https://alcdn.msauth.net/browser/5.10.0/js/msal-browser.min.js \
  | openssl dgst -sha384 -binary \
  | openssl base64 -A \
  | xargs -I{} echo "sha384-{}"
```

If you do not need SRI enforcement, remove the `integrity` attribute from the `<script>` tag in each generated HTML file.
