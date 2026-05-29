# Forms & Data Integration

This document explains the runtime data model available in generated StaticCreator pages and how to use it to pre-fill form fields, inject metadata into submissions, and consume API responses.

---

## Table of Contents

- [Runtime Data Model](#runtime-data-model)
- [Metadata Fields (Static)](#metadata-fields-static)
- [API Preload Queries (`window.__pageData`)](#api-preload-queries-windowpagedata)
- [Microsoft Graph API Queries](#microsoft-graph-api-queries)
- [Pre-filling Form Fields (`data-metadata-prefill`)](#pre-filling-form-fields-data-metadata-prefill)
- [REST API Form Submission](#rest-api-form-submission)
- [Data Attributes Reference](#data-attributes-reference)
- [Execution Order](#execution-order)
- [Examples](#examples)

---

## Runtime Data Model

Every generated HTML page exposes two global JavaScript variables:

| Variable | Type | Description |
|---|---|---|
| `__pageMetadata` | `object` | Merged metadata from all sources. Used by pre-fill and form injection. |
| `window.__pageData` | `object` | Raw API preload results, keyed by query name. |

`__pageMetadata` is built up progressively:

1. **Static metadata fields** are set immediately when the script runs
2. **API preload results** are merged in once the `DOMContentLoaded` fetches complete
3. **Graph API results** are merged in after MSAL token acquisition

---

## Metadata Fields (Static)

Configured on the **Forms** tab of the site configuration.

These are hard-coded key/value pairs emitted directly into the page script:

```js
var __pageMetadata = {};
__pageMetadata["appVersion"]   = "2.1.0";
__pageMetadata["environment"]  = "production";
```

**Use cases:**
- Tagging form submissions with environment information
- Providing a fixed user role or tenant identifier
- Any value that does not change between page loads

---

## API Preload Queries (`window.__pageData`)

Configured on the **Data** tab of the site configuration.

Each query runs when the DOM is ready (`DOMContentLoaded`). The JSON response is stored in `window.__pageData[<name>]` and also merged into `__pageMetadata[<name>]`.

**Generated code example (one query named `catalog`):**

```js
async function __fetchApiPreloads() {
  try {
    var __preloadHeaders0 = {};
    var __preloadResp0 = await fetch("https://api.example.com/catalog", { method: "GET", headers: __preloadHeaders0 });
    window.__pageData["catalog"] = await __preloadResp0.json();
  } catch(__preloadErr0) {
    console.warn('[API Preload] catalog failed:', __preloadErr0);
  }
  // Sync into __pageMetadata
  Object.keys(window.__pageData).forEach(function(k) {
    __pageMetadata[k] = window.__pageData[k];
  });
  __prefillFormFields();
}
```

### Authenticated preloads

When **Include Auth Header** is enabled for a query, the MSAL Bearer token is acquired once before the first authenticated request and reused for all authenticated preloads on that page:

```js
// Acquire token once (best-effort)
var __preloadToken = null;
try {
  var __preloadAccounts = msalInstance.getAllAccounts();
  if (__preloadAccounts.length > 0) {
    var __preloadTokenResp = await msalInstance.acquireTokenSilent({ scopes: [...], account: __preloadAccounts[0] });
    __preloadToken = __preloadTokenResp.accessToken;
  }
} catch(__tokenErr) { /* warn and continue without token */ }

// Request with auth header
var __preloadHeaders0 = __preloadToken ? { 'Authorization': 'Bearer ' + __preloadToken } : {};
```

If token acquisition fails the request still proceeds without the header.

---

## Microsoft Graph API Queries

Configured on the **Forms** tab of the site configuration.

Graph API queries run after MSAL successfully acquires an access token. They use the MSAL access token as a Bearer token and target the Graph API base URL for the configured cloud:

| Cloud | Graph base URL |
|---|---|
| Commercial | `https://graph.microsoft.com/v1.0` |
| Government | `https://graph.microsoft.us/v1.0` |
| DoD | `https://dod-graph.microsoft.us/v1.0` |

**Example query configuration:**

| Name | Endpoint | $select |
|---|---|---|
| `currentUser` | `/me` | `displayName,mail,jobTitle` |

**Generated code:**

```js
async function __fetchGraphMetadata(accessToken) {
  var __headers = { Authorization: 'Bearer ' + accessToken };
  try {
    var __resp0 = await fetch("https://graph.microsoft.com/v1.0/me?$select=displayName%2Cmail%2CjobTitle", { headers: __headers });
    __pageMetadata["currentUser"] = await __resp0.json();
  } catch(__e) { console.warn('Graph query currentUser failed:', __e); }
  __prefillFormFields();
}
```

If no user is signed in, Graph queries are skipped and `__prefillFormFields` is called with whatever static metadata is available.

---

## Pre-filling Form Fields (`data-metadata-prefill`)

Any `<input>`, `<select>`, or `<textarea>` element can be pre-filled automatically by adding the `data-metadata-prefill` attribute.

```html
<!-- Simple key -->
<input type="text" name="environment" data-metadata-prefill="environment" />

<!-- Dot-notation for nested objects -->
<input type="email" name="email" data-metadata-prefill="currentUser.mail" />
<input type="text"  name="role"  data-metadata-prefill="profile.jobTitle" />

<!-- Deep nesting -->
<input type="text" name="city" data-metadata-prefill="location.address.city" />
```

The runtime resolver:

```js
function __resolvePath(key) {
  return key.split('.').reduce(function(obj, k) { return obj != null ? obj[k] : undefined; }, __pageMetadata);
}
function __prefillFormFields() {
  document.querySelectorAll('[data-metadata-prefill]').forEach(function(el) {
    var key = el.getAttribute('data-metadata-prefill');
    if (!key) return;
    var val = __resolvePath(key);
    if (val !== undefined && val !== null) {
      el.value = typeof val === 'object' ? JSON.stringify(val) : String(val);
    }
  });
}
```

`__prefillFormFields` is called:
- Once on `DOMContentLoaded` (picks up static metadata)
- Again after API preloads complete
- Again after Graph API results arrive

This means the field values are refreshed as more data becomes available.

---

## REST API Form Submission

Forms marked with `data-api-form="true"` are intercepted by the runtime handler. The native form submit is prevented and replaced with a `fetch` call.

### How submissions work

1. All named form fields are collected via `FormData` into a JSON object
2. Metadata keys listed in `data-metadata-inject` are resolved from `__pageMetadata` and added to the body
3. If `data-auth-header` is `true`, an MSAL access token is acquired silently and added to the `Authorization` header
4. The JSON body is sent to `data-api-url` with the method from `data-api-method`
5. On success: the user sees the `data-success-message` alert and the form is reset, or is redirected to `data-success-redirect`
6. On failure: a descriptive error message is shown based on the HTTP status code

### Multi-value fields

If multiple `<input>` elements share the same `name` attribute (e.g., a group of checkboxes), their values are collected into an array:

```html
<input type="checkbox" name="interests" value="sports" />
<input type="checkbox" name="interests" value="music" />
```

Results in:
```json
{ "interests": ["sports", "music"] }
```

---

## Data Attributes Reference

### On `<form data-api-form="true">`

| Attribute | Default | Description |
|---|---|---|
| `data-api-form` | *(required to be `"true"`)* | Marks the form as a REST API form |
| `data-api-url` | `""` | URL to send the form data to |
| `data-api-method` | `"POST"` | HTTP method: `POST`, `PUT`, or `PATCH` |
| `data-auth-header` | `"true"` | `"true"` to attach MSAL Bearer token; `"false"` for unauthenticated |
| `data-metadata-inject` | `""` | Comma-separated list of `__pageMetadata` keys to add to the request body |
| `data-success-message` | `"Form submitted successfully!"` | Alert text shown on HTTP 2xx |
| `data-success-redirect` | `""` | URL to navigate to on success (overrides success message) |

### On `<input>`, `<select>`, `<textarea>`

| Attribute | Default | Description |
|---|---|---|
| `data-metadata-prefill` | `""` | Dot-notation key into `__pageMetadata`; sets `el.value` on page load and after each data refresh |

---

## Execution Order

```
Page load
│
├── Script runs synchronously
│   └── __pageMetadata populated with static metadata fields
│
├── DOMContentLoaded
│   ├── __initFormHandlers()   ← attaches submit listeners to all [data-api-form] elements
│   ├── __prefillFormFields()  ← pre-fills with static metadata
│   └── __fetchApiPreloads()   ← starts API preload fetches
│       └── on complete:
│           ├── window.__pageData populated
│           ├── __pageMetadata merged with __pageData
│           └── __prefillFormFields()
│
└── MSAL initialization (parallel with DOMContentLoaded)
    └── msalInstance.initialize()
        └── handleRedirectPromise()
            ├── if user is signed in:
            │   └── acquireTokenSilent()
            │       └── __fetchGraphMetadata(token)
            │           └── __pageMetadata merged with Graph results
            │               └── __prefillFormFields()
            └── if no user:
                └── __prefillFormFields()  ← pre-fills with available static metadata
```

---

## Examples

### Example 1: Contact form with user email pre-filled

**Configuration:**
- Graph API query: name = `me`, endpoint = `/me`, select = `mail`

**Page HTML:**
```html
<form
  data-api-form="true"
  data-api-url="https://api.example.com/contact"
  data-api-method="POST"
  data-auth-header="false"
  data-metadata-inject="environment"
  data-success-message="Thanks! We'll be in touch."
>
  <input type="email" name="email" data-metadata-prefill="me.mail" placeholder="your@email.com" />
  <textarea name="message" placeholder="Your message..."></textarea>
  <button type="submit">Send</button>
</form>
```

When a user signs in, their email is pre-filled automatically. The `environment` value from static metadata is added to the request body.

---

### Example 2: Product selection from an API preload

**Configuration:**
- API Preload query: name = `products`, URL = `https://api.example.com/products`, method = `GET`

**Page HTML:**
```html
<select name="productId" data-metadata-prefill="">
  <!-- Populated by custom script reading window.__pageData.products -->
</select>
```

Access the preloaded data in a custom inline script:

```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // window.__pageData.products is populated after __fetchApiPreloads() completes.
    // Use a slight delay or listen for a custom event if needed.
    setTimeout(function() {
      var products = window.__pageData['products'] || [];
      var select = document.querySelector('[name="productId"]');
      products.forEach(function(p) {
        var opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        select.appendChild(opt);
      });
    }, 500);
  });
</script>
```

---

### Example 3: Authenticated API preload with metadata injection

**Configuration:**
- API Preload: name = `userProfile`, URL = `https://internal-api.example.com/profile`, method = `GET`, includeAuthHeader = true
- Metadata Field: key = `department`, value = `Engineering`

**Page HTML:**
```html
<form
  data-api-form="true"
  data-api-url="https://internal-api.example.com/requests"
  data-api-method="POST"
  data-auth-header="true"
  data-metadata-inject="department,userProfile.employeeId"
  data-success-redirect="/pages/thank-you.html"
>
  <input type="text" name="subject" placeholder="Request subject" />
  <input type="hidden" name="requestedBy" data-metadata-prefill="userProfile.displayName" />
  <button type="submit">Submit Request</button>
</form>
```

The submission body will include:
```json
{
  "subject": "<user input>",
  "requestedBy": "<from userProfile.displayName>",
  "department": "Engineering",
  "userProfile.employeeId": "<from userProfile.employeeId>"
}
```
