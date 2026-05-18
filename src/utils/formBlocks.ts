import type { Editor } from 'grapesjs';

/**
 * Registers REST-API-aware form component types and draggable form blocks into
 * the provided GrapesJS editor instance.
 *
 * Component types:
 *   rest-api-form  – A <form> that POSTs/PUTs/PATCHes to a configurable URL,
 *                    optionally attaching an MSAL Bearer token and injecting
 *                    page metadata into the request body.
 *
 * Traits exposed on <input> / <select> / <textarea>:
 *   data-metadata-prefill – dot-notation key from __pageMetadata to pre-fill
 *                           the field value on page load.
 *
 * Blocks added (category "Forms"):
 *   api-form            – Full starter form with name / email / message fields
 *   form-text-input     – Single labelled text input
 *   form-email-input    – Single labelled email input
 *   form-number-input   – Single labelled number input with validation
 *   form-tel-input      – Single labelled telephone input
 *   form-date-input     – Single labelled date input
 *   form-checkbox-input – Single checkbox input with label
 *   form-radio-group    – Radio button group
 *   form-file-input     – File upload input
 *   form-select-input   – Single labelled dropdown
 *   form-textarea-input – Single labelled textarea
 *   form-hidden-input   – Hidden field (useful for metadata injection)
 *
 * Blocks added (category "Tables"):
 *   basic-table         – Simple data table with headers
 *   striped-table       – Table with striped rows
 *   responsive-table    – Responsive table with horizontal scroll
 */
export function registerFormBlocks(editor: Editor): void {
  // ── REST API Form component ─────────────────────────────────────────────────
  editor.DomComponents.addType('rest-api-form', {
    // Identify existing HTML elements that were saved as this component type.
    isComponent: (el: HTMLElement) => {
      if (el.tagName === 'FORM' && el.hasAttribute('data-api-form')) {
        return { type: 'rest-api-form' };
      }
    },
    model: {
      defaults: {
        tagName: 'form',
        droppable: true,
        copyable: true,
        attributes: {
          'data-api-form': 'true',
          'data-api-url': '',
          'data-api-method': 'POST',
          'data-auth-header': 'true',
          'data-metadata-inject': '',
          'data-success-message': 'Form submitted successfully!',
          'data-success-redirect': '',
        },
        traits: [
          {
            type: 'text',
            name: 'data-api-url',
            label: 'API Endpoint URL',
            placeholder: 'https://api.example.com/submit',
          },
          {
            type: 'select',
            name: 'data-api-method',
            label: 'HTTP Method',
            options: [
              { id: 'POST', name: 'POST' },
              { id: 'PUT', name: 'PUT' },
              { id: 'PATCH', name: 'PATCH' },
            ],
          },
          {
            type: 'select',
            name: 'data-auth-header',
            label: 'Include Bearer Token',
            options: [
              { id: 'true', name: 'Yes – include MSAL token' },
              { id: 'false', name: 'No – unauthenticated' },
            ],
          },
          {
            type: 'text',
            name: 'data-metadata-inject',
            label: 'Inject Metadata Keys (comma-separated)',
            placeholder: 'key1, key2, currentUser.mail',
          },
          {
            type: 'text',
            name: 'data-success-message',
            label: 'Success Message',
            placeholder: 'Form submitted successfully!',
          },
          {
            type: 'text',
            name: 'data-success-redirect',
            label: 'Redirect URL on Success',
            placeholder: 'https://example.com/thank-you',
          },
        ],
      },
    },
  });

  // ── Extend built-in input / select / textarea with a metadata-prefill trait ─
  //
  // GrapesJS 0.22 stores the component definition on the type object.
  // We add our extra trait on top of the built-in defaults.
  const PREFILL_TRAIT = {
    type: 'text',
    name: 'data-metadata-prefill',
    label: 'Prefill from Metadata Key',
    placeholder: 'e.g. currentUser.mail',
  };

  for (const builtinType of ['input', 'select', 'textarea'] as const) {
    const existing = editor.DomComponents.getType(builtinType);
    if (!existing) continue;

    // Retrieve any already-defined defaults from the model prototype.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingDefaults = (existing.model as any)?.prototype?.defaults ?? {};
    const existingTraits: unknown[] = Array.isArray(existingDefaults.traits)
      ? existingDefaults.traits
      : [];

    editor.DomComponents.addType(builtinType, {
      // Re-use the original isComponent so GrapesJS keeps identifying the tag.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      isComponent: (existing as any).isComponent,
      model: {
        defaults: {
          ...existingDefaults,
          traits: [...existingTraits, PREFILL_TRAIT],
        },
      },
    });
  }

  // ── Blocks ──────────────────────────────────────────────────────────────────

  const FORM_STYLE = [
    'padding:24px',
    'border:1px solid #e2e8f0',
    'border-radius:8px',
    'max-width:520px',
    'margin:20px auto',
    'background:#fff',
    'box-shadow:0 1px 4px rgba(0,0,0,.06)',
  ].join(';');

  const INPUT_STYLE =
    'width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;box-sizing:border-box;font-size:.875rem;';

  const LABEL_STYLE =
    'display:block;font-size:.875rem;color:#374151;font-weight:500;margin-bottom:4px;';

  const FIELD_WRAP = 'margin-bottom:16px;';

  editor.BlockManager.add('api-form', {
    label: 'API Form',
    category: 'Forms',
    content: `<form data-api-form="true" data-api-url="" data-api-method="POST" data-auth-header="true" data-metadata-inject="" data-success-message="Form submitted successfully!" data-success-redirect="" style="${FORM_STYLE}">
  <h3 style="margin:0 0 20px;font-size:1.1rem;font-weight:600;color:#111827;">Contact Us</h3>
  <div style="${FIELD_WRAP}">
    <label style="${LABEL_STYLE}">Full Name</label>
    <input type="text" name="fullName" placeholder="Enter your name" style="${INPUT_STYLE}" />
  </div>
  <div style="${FIELD_WRAP}">
    <label style="${LABEL_STYLE}">Email</label>
    <input type="email" name="email" placeholder="you@example.com" style="${INPUT_STYLE}" />
  </div>
  <div style="${FIELD_WRAP}">
    <label style="${LABEL_STYLE}">Message</label>
    <textarea name="message" rows="4" placeholder="Your message..." style="${INPUT_STYLE};resize:vertical;"></textarea>
  </div>
  <button type="submit" style="width:100%;padding:10px 16px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:.9rem;">Submit</button>
</form>`,
  });

  editor.BlockManager.add('form-text-input', {
    label: 'Text Input',
    category: 'Forms',
    content: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Label</label>
  <input type="text" name="fieldName" placeholder="Enter value..." style="${INPUT_STYLE}" />
</div>`,
  });

  editor.BlockManager.add('form-email-input', {
    label: 'Email Input',
    category: 'Forms',
    content: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Email</label>
  <input type="email" name="email" placeholder="you@example.com" style="${INPUT_STYLE}" data-metadata-prefill="" />
</div>`,
  });

  editor.BlockManager.add('form-select-input', {
    label: 'Dropdown',
    category: 'Forms',
    content: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Select</label>
  <select name="selectField" style="${INPUT_STYLE};appearance:none;background:#fff;">
    <option value="">Choose an option…</option>
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
  </select>
</div>`,
  });

  editor.BlockManager.add('form-textarea-input', {
    label: 'Text Area',
    category: 'Forms',
    content: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Message</label>
  <textarea name="message" rows="4" placeholder="Enter your message…" style="${INPUT_STYLE};resize:vertical;"></textarea>
</div>`,
  });

  editor.BlockManager.add('form-number-input', {
    label: 'Number Input',
    category: 'Forms',
    content: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Number</label>
  <input type="number" name="numberField" placeholder="Enter a number" style="${INPUT_STYLE}" step="1" />
</div>`,
  });

  editor.BlockManager.add('form-tel-input', {
    label: 'Phone Input',
    category: 'Forms',
    content: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Phone Number</label>
  <input type="tel" name="phone" placeholder="+1 (555) 000-0000" style="${INPUT_STYLE}" />
</div>`,
  });

  editor.BlockManager.add('form-date-input', {
    label: 'Date Input',
    category: 'Forms',
    content: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Date</label>
  <input type="date" name="dateField" style="${INPUT_STYLE}" />
</div>`,
  });

  editor.BlockManager.add('form-checkbox-input', {
    label: 'Checkbox',
    category: 'Forms',
    content: `<div style="${FIELD_WRAP}">
  <label style="display:flex;align-items:center;font-size:.875rem;color:#374151;cursor:pointer;">
    <input type="checkbox" name="checkboxField" value="1" style="margin-right:8px;width:16px;height:16px;cursor:pointer;" />
    <span>I agree to the terms and conditions</span>
  </label>
</div>`,
  });

  editor.BlockManager.add('form-radio-group', {
    label: 'Radio Group',
    category: 'Forms',
    content: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Choose an option</label>
  <div style="margin-top:8px;">
    <label style="display:flex;align-items:center;font-size:.875rem;color:#374151;margin-bottom:8px;cursor:pointer;">
      <input type="radio" name="radioGroup" value="option1" style="margin-right:8px;cursor:pointer;" />
      <span>Option 1</span>
    </label>
    <label style="display:flex;align-items:center;font-size:.875rem;color:#374151;margin-bottom:8px;cursor:pointer;">
      <input type="radio" name="radioGroup" value="option2" style="margin-right:8px;cursor:pointer;" />
      <span>Option 2</span>
    </label>
    <label style="display:flex;align-items:center;font-size:.875rem;color:#374151;cursor:pointer;">
      <input type="radio" name="radioGroup" value="option3" style="margin-right:8px;cursor:pointer;" />
      <span>Option 3</span>
    </label>
  </div>
</div>`,
  });

  editor.BlockManager.add('form-file-input', {
    label: 'File Upload',
    category: 'Forms',
    content: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Upload File</label>
  <input type="file" name="fileField" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;box-sizing:border-box;font-size:.875rem;background:#fff;" />
  <small style="display:block;margin-top:4px;color:#6b7280;font-size:.75rem;">Max file size: 10MB</small>
</div>`,
  });

  editor.BlockManager.add('form-hidden-input', {
    label: 'Hidden Field',
    category: 'Forms',
    content: `<input type="hidden" name="hiddenField" value="" data-metadata-prefill="" />`,
  });

  // ── Table Blocks ────────────────────────────────────────────────────────────

  const TABLE_STYLE = 'width:100%;border-collapse:collapse;margin:20px 0;font-size:.875rem;';
  const TH_STYLE = 'padding:12px 15px;text-align:left;border-bottom:2px solid #e2e8f0;background:#f8fafc;font-weight:600;color:#374151;';
  const TD_STYLE = 'padding:12px 15px;border-bottom:1px solid #e2e8f0;color:#6b7280;';

  editor.BlockManager.add('basic-table', {
    label: 'Basic Table',
    category: 'Tables',
    content: `<table style="${TABLE_STYLE}">
  <thead>
    <tr>
      <th style="${TH_STYLE}">Header 1</th>
      <th style="${TH_STYLE}">Header 2</th>
      <th style="${TH_STYLE}">Header 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="${TD_STYLE}">Row 1, Cell 1</td>
      <td style="${TD_STYLE}">Row 1, Cell 2</td>
      <td style="${TD_STYLE}">Row 1, Cell 3</td>
    </tr>
    <tr>
      <td style="${TD_STYLE}">Row 2, Cell 1</td>
      <td style="${TD_STYLE}">Row 2, Cell 2</td>
      <td style="${TD_STYLE}">Row 2, Cell 3</td>
    </tr>
    <tr>
      <td style="${TD_STYLE}">Row 3, Cell 1</td>
      <td style="${TD_STYLE}">Row 3, Cell 2</td>
      <td style="${TD_STYLE}">Row 3, Cell 3</td>
    </tr>
  </tbody>
</table>`,
  });

  const TD_STRIPED_EVEN = 'padding:12px 15px;border-bottom:1px solid #e2e8f0;color:#6b7280;background:#f9fafb;';

  editor.BlockManager.add('striped-table', {
    label: 'Striped Table',
    category: 'Tables',
    content: `<table style="${TABLE_STYLE}">
  <thead>
    <tr>
      <th style="${TH_STYLE}">Name</th>
      <th style="${TH_STYLE}">Email</th>
      <th style="${TH_STYLE}">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="${TD_STYLE}">John Doe</td>
      <td style="${TD_STYLE}">john@example.com</td>
      <td style="${TD_STYLE}">Active</td>
    </tr>
    <tr>
      <td style="${TD_STRIPED_EVEN}">Jane Smith</td>
      <td style="${TD_STRIPED_EVEN}">jane@example.com</td>
      <td style="${TD_STRIPED_EVEN}">Active</td>
    </tr>
    <tr>
      <td style="${TD_STYLE}">Bob Johnson</td>
      <td style="${TD_STYLE}">bob@example.com</td>
      <td style="${TD_STYLE}">Inactive</td>
    </tr>
    <tr>
      <td style="${TD_STRIPED_EVEN}">Alice Williams</td>
      <td style="${TD_STRIPED_EVEN}">alice@example.com</td>
      <td style="${TD_STRIPED_EVEN}">Active</td>
    </tr>
  </tbody>
</table>`,
  });

  editor.BlockManager.add('responsive-table', {
    label: 'Responsive Table',
    category: 'Tables',
    content: `<div style="overflow-x:auto;margin:20px 0;">
  <table style="${TABLE_STYLE};min-width:600px;">
    <thead>
      <tr>
        <th style="${TH_STYLE}">Product</th>
        <th style="${TH_STYLE}">Price</th>
        <th style="${TH_STYLE}">Quantity</th>
        <th style="${TH_STYLE}">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="${TD_STYLE}">Product A</td>
        <td style="${TD_STYLE}">$19.99</td>
        <td style="${TD_STYLE}">2</td>
        <td style="${TD_STYLE}">$39.98</td>
      </tr>
      <tr>
        <td style="${TD_STYLE}">Product B</td>
        <td style="${TD_STYLE}">$29.99</td>
        <td style="${TD_STYLE}">1</td>
        <td style="${TD_STYLE}">$29.99</td>
      </tr>
      <tr>
        <td style="${TD_STYLE}">Product C</td>
        <td style="${TD_STYLE}">$15.99</td>
        <td style="${TD_STYLE}">3</td>
        <td style="${TD_STYLE}">$47.97</td>
      </tr>
    </tbody>
  </table>
</div>`,
  });
}
