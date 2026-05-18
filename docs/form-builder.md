# Form Builder Integration

## Overview

StaticCreator integrates form creation directly into the GrapesJS page builder through custom form blocks. Forms are built by dragging and dropping pre-configured form field blocks onto the canvas and configuring their properties using the GrapesJS traits panel.

**License**: Forms are built using GrapesJS (BSD-3-Clause license) with custom form blocks defined in the StaticCreator codebase (MIT license).

## How Form Building Works

Forms in StaticCreator are created using:

1. **GrapesJS Blocks** — Pre-built form components available in the "Forms" category
2. **Component Types** — Custom GrapesJS component types that add REST API functionality
3. **Traits Panel** — The GrapesJS settings panel for configuring form and field properties

## Available Form Blocks

### API Form Block

The **API Form** block creates a complete form with built-in REST API submission capabilities.

**Features:**
- Submits form data to any REST API endpoint
- Supports POST, PUT, and PATCH methods
- Optional MSAL Bearer token authentication
- Metadata injection from page metadata
- Success messages and redirect URLs
- Pre-configured with name, email, and message fields

**Configurable attributes** (via GrapesJS traits):
- `data-api-url` — The API endpoint URL
- `data-api-method` — HTTP method (POST, PUT, or PATCH)
- `data-auth-header` — Include MSAL Bearer token (true/false)
- `data-metadata-inject` — Comma-separated metadata keys to inject
- `data-success-message` — Message shown on successful submission
- `data-success-redirect` — Optional URL to redirect to on success

### Individual Form Field Blocks

The following form field blocks are available in the **Forms** category:

| Block | Description |
|---|---|
| **Text Input** | Single-line text field with label |
| **Email Input** | Email field with validation and metadata pre-fill support |
| **Number Input** | Numeric input with step control |
| **Phone Input** | Telephone number field |
| **Date Input** | Date picker field |
| **Dropdown** | Select dropdown with configurable options |
| **Text Area** | Multi-line text field |
| **Checkbox** | Single checkbox with label |
| **Radio Group** | Group of radio buttons for single selection |
| **File Upload** | File upload field with size limit indicator |
| **Hidden Field** | Hidden input field for metadata injection |

## Using Forms in Your Pages

### Adding a Complete Form

1. Open the Page Builder
2. Switch to the **Blocks** tab in the left panel
3. Scroll to the **Forms** category
4. Drag the **API Form** block onto the canvas
5. Click on the form to select it
6. Use the **Traits** panel on the right to configure the form settings:
   - Set the **API Endpoint URL** to your REST API
   - Choose the **HTTP Method** (POST, PUT, or PATCH)
   - Enable **Include Bearer Token** if your API requires MSAL authentication
   - Add metadata keys to **Inject Metadata Keys** (comma-separated)
   - Customize the **Success Message**
   - Optionally set a **Redirect URL on Success**

### Adding Individual Form Fields

1. Drag individual form field blocks from the **Forms** category
2. Drop them inside a form or anywhere on the page
3. Click on each field to configure its properties via the **Traits** panel:
   - Modify the `name` attribute
   - Set placeholder text
   - Add the `required` attribute if needed

### Pre-filling Fields from Metadata

Any input, select, or textarea field can be pre-filled with data from page metadata:

1. Select the field in the canvas
2. In the **Traits** panel, find the **Prefill from Metadata Key** field
3. Enter a metadata key using dot notation (e.g., `currentUser.mail`)
4. The field will be automatically populated when the page loads

**Example:**
```html
<input type="email" name="email" data-metadata-prefill="currentUser.mail" />
```

See [Forms & Data Integration](forms-and-data.md) for more details on metadata pre-fill and the runtime data model.

## Table Blocks

The **Tables** category includes three table variants:

| Block | Description |
|---|---|
| **Basic Table** | Simple data table with headers and rows |
| **Striped Table** | Table with alternating row colors for better readability |
| **Responsive Table** | Table with horizontal scroll for narrow viewports |

Tables can be used to display static data or populated dynamically with JavaScript.

## Form Data Attributes Reference

### On `<form data-api-form="true">`

| Attribute | Required | Description |
|---|---|---|
| `data-api-url` | ✅ | The REST API endpoint URL |
| `data-api-method` | ✅ | HTTP method: `POST`, `PUT`, or `PATCH` |
| `data-auth-header` | | `true` to include MSAL Bearer token; `false` otherwise |
| `data-metadata-inject` | | Comma-separated metadata keys to add to request body |
| `data-success-message` | | Alert message shown on successful submission |
| `data-success-redirect` | | URL to navigate to instead of showing an alert |

### On `<input>`, `<select>`, `<textarea>`

| Attribute | Description |
|---|---|
| `data-metadata-prefill` | Dot-notation path into `__pageMetadata` to pre-fill the field |

## Technical Implementation

### Component Types

StaticCreator registers a custom GrapesJS component type `rest-api-form` that:

- Identifies `<form>` elements with `data-api-form="true"`
- Exposes configurable traits for API settings
- Handles form submission logic at runtime

### Form Blocks Registration

Form and table blocks are registered in `/src/utils/formBlocks.ts` using the `registerFormBlocks()` function, which:

1. Adds the `rest-api-form` component type to GrapesJS
2. Extends built-in input, select, and textarea components with the `data-metadata-prefill` trait
3. Registers all form field blocks in the "Forms" category
4. Registers all table blocks in the "Tables" category

This function is called when the GrapesJS editor initializes in the PageBuilder component.

### Runtime Form Submission

When a form with `data-api-form="true"` is submitted in the generated page:

1. Form data is collected from all named fields
2. Metadata values specified in `data-metadata-inject` are merged into the payload
3. An HTTP request is sent to `data-api-url` using the specified method
4. If `data-auth-header="true"` and a user is signed in, an MSAL Bearer token is acquired and attached
5. On success, either `data-success-message` is shown or the user is redirected to `data-success-redirect`
6. On error, an error message is displayed

This logic is embedded directly into each generated HTML page.

## Integration with Static Web Apps

Forms work seamlessly with:

1. **Azure Static Web Apps** — Forms can submit to Azure Functions with MSAL authentication
2. **Generic static hosting** — Forms can submit to any REST API without authentication
3. **Third-party services** — Forms can integrate with services like Formspree, FormSubmit, or custom backends

## Best Practices

### Form Design

1. **Keep it Simple**: Only ask for information you need
2. **Clear Labels**: Use descriptive field labels
3. **Helpful Placeholders**: Provide examples in placeholder text
4. **Mark Required Fields**: Use the `required` attribute for mandatory fields
5. **Logical Order**: Arrange fields in a natural flow

### Field Selection

- **Text Fields**: Use for short, single-line entries (name, city, etc.)
- **Email Fields**: Always use for email addresses to get proper validation
- **Text Areas**: Use for longer responses (comments, descriptions)
- **Dropdowns**: Good for 4+ options; use radio buttons for 2-3 options
- **Checkboxes**: For optional yes/no questions
- **Radio Buttons**: For mandatory choice between options
- **File Uploads**: For documents, images, or other files

### API Integration

- Test your API endpoint URL before deploying
- Use HTTPS for all API endpoints
- Enable authentication only when your API requires it
- Use metadata injection to add tracking fields (environment, app version, etc.)

## Troubleshooting

### Form Not Submitting

If the form doesn't submit:
1. Check the browser console for errors
2. Verify the `data-api-url` is correct and accessible
3. Check that the API supports the specified HTTP method
4. If using authentication, ensure the user is signed in and the API accepts the MSAL token

### Fields Not Pre-filling

If fields aren't pre-filling:
1. Check that metadata keys are correctly spelled in `data-metadata-prefill`
2. Verify that the metadata is available in `__pageMetadata` (check browser console)
3. For Graph API queries, ensure the user is signed in
4. For API preload queries, check the browser console for fetch errors

### Styling Issues

- Use the GrapesJS **Styles** tab to customize form appearance
- Edit form field blocks directly in the canvas to adjust inline styles
- Wrap forms in containers to control width and positioning

## Resources

- [GrapesJS Documentation](https://grapesjs.com/docs/)
- [Forms & Data Integration](forms-and-data.md)
- [Configuration Reference](configuration.md)

## License

The form blocks are implemented using:
- **GrapesJS** (BSD-3-Clause License)
- **Custom form blocks** defined in StaticCreator source code (MIT License)

No commercial licenses are required for production use.

This Form Builder component is open source and available under the MIT License. It can be freely used in commercial and production environments without any licensing fees.
