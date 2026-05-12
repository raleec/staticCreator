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
 *   form-select-input   – Single labelled dropdown
 *   form-textarea-input – Single labelled textarea
 *   form-hidden-input   – Hidden field (useful for metadata injection)
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
  <select name="selectField" style="${INPUT_STYLE}appearance:none;background:#fff;">
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

  editor.BlockManager.add('form-hidden-input', {
    label: 'Hidden Field',
    category: 'Forms',
    content: `<input type="hidden" name="hiddenField" value="" data-metadata-prefill="" />`,
  });
}
