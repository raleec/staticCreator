/**
 * Pre-built HTML snippet library for the page editor.
 *
 * Each snippet is a self-contained HTML fragment that can be inserted into
 * the page HTML editor. Snippets are grouped into categories for display in
 * the Snippets panel.
 */

export interface HtmlSnippet {
  id: string;
  label: string;
  category: string;
  html: string;
}

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

export function getHtmlSnippets(): HtmlSnippet[] {
  return [
    // ── Layout ───────────────────────────────────────────────────────────────
    {
      id: 'section',
      label: 'Section',
      category: 'Layout',
      html: `<section style="padding:40px 20px;">
  <h1>Insert your title here</h1>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
</section>`,
    },
    {
      id: 'columns-2',
      label: '2 Columns',
      category: 'Layout',
      html: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:20px;">
  <div style="background:#f3f4f6;padding:20px;border-radius:8px;min-height:80px;">Column 1</div>
  <div style="background:#f3f4f6;padding:20px;border-radius:8px;min-height:80px;">Column 2</div>
</div>`,
    },
    {
      id: 'columns-3',
      label: '3 Columns',
      category: 'Layout',
      html: `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;padding:20px;">
  <div style="background:#f3f4f6;padding:20px;border-radius:8px;min-height:80px;">Col 1</div>
  <div style="background:#f3f4f6;padding:20px;border-radius:8px;min-height:80px;">Col 2</div>
  <div style="background:#f3f4f6;padding:20px;border-radius:8px;min-height:80px;">Col 3</div>
</div>`,
    },
    {
      id: 'divider',
      label: 'Divider',
      category: 'Layout',
      html: `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`,
    },

    // ── Components ────────────────────────────────────────────────────────────
    {
      id: 'hero',
      label: 'Hero',
      category: 'Components',
      html: `<section style="background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:80px 40px;text-align:center;">
  <h1 style="font-size:2.5rem;margin-bottom:1rem;">Welcome</h1>
  <p style="font-size:1.1rem;margin-bottom:2rem;opacity:0.9;">Your page description goes here.</p>
  <a href="#" style="display:inline-block;padding:12px 32px;background:#fff;color:#1e40af;text-decoration:none;border-radius:6px;font-weight:600;">Get Started</a>
</section>`,
    },
    {
      id: 'navbar',
      label: 'Navbar',
      category: 'Components',
      html: `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:#1e293b;color:#fff;">
  <span style="font-weight:700;font-size:1.2rem;">My App</span>
  <ul style="list-style:none;display:flex;gap:24px;margin:0;padding:0;">
    <li><a href="#" style="color:#fff;text-decoration:none;">Home</a></li>
    <li><a href="#" style="color:#fff;text-decoration:none;">About</a></li>
    <li><a href="#" style="color:#fff;text-decoration:none;">Contact</a></li>
  </ul>
</nav>`,
    },
    {
      id: 'footer',
      label: 'Footer',
      category: 'Components',
      html: `<footer style="background:#1e293b;color:#94a3b8;padding:32px;text-align:center;">
  <p>© ${new Date().getFullYear()} My Organization. All rights reserved.</p>
</footer>`,
    },
    {
      id: 'card',
      label: 'Card',
      category: 'Components',
      html: `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:24px;max-width:320px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
  <h3 style="margin:0 0 8px;">Card Title</h3>
  <p style="color:#64748b;margin:0 0 16px;">Card description text goes here.</p>
  <a href="#" style="color:#2563eb;font-weight:600;text-decoration:none;">Learn more →</a>
</div>`,
    },
    {
      id: 'button',
      label: 'Button',
      category: 'Components',
      html: `<a href="#" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Click Me</a>`,
    },
    {
      id: 'login-form',
      label: 'Login Form',
      category: 'Components',
      html: `<div style="max-width:400px;margin:40px auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;">
  <h2 style="margin:0 0 24px;text-align:center;">Sign In</h2>
  <div style="margin-bottom:16px;">
    <label style="display:block;font-size:.875rem;color:#374151;margin-bottom:4px;">Email</label>
    <input type="email" style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;box-sizing:border-box;" placeholder="you@example.com" />
  </div>
  <div style="margin-bottom:24px;">
    <label style="display:block;font-size:.875rem;color:#374151;margin-bottom:4px;">Password</label>
    <input type="password" style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;box-sizing:border-box;" />
  </div>
  <button style="width:100%;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;">Sign In</button>
</div>`,
    },

    // ── Forms ─────────────────────────────────────────────────────────────────
    {
      id: 'api-form',
      label: 'API Form',
      category: 'Forms',
      html: `<form data-api-form="true" data-api-url="" data-api-method="POST" data-auth-header="true" data-metadata-inject="" data-success-message="Form submitted successfully!" data-success-redirect="" style="${FORM_STYLE}">
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
    },
    {
      id: 'form-text-input',
      label: 'Text Input',
      category: 'Forms',
      html: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Label</label>
  <input type="text" name="fieldName" placeholder="Enter value..." style="${INPUT_STYLE}" />
</div>`,
    },
    {
      id: 'form-email-input',
      label: 'Email Input',
      category: 'Forms',
      html: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Email</label>
  <input type="email" name="email" placeholder="you@example.com" style="${INPUT_STYLE}" data-metadata-prefill="" />
</div>`,
    },
    {
      id: 'form-select-input',
      label: 'Dropdown',
      category: 'Forms',
      html: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Select</label>
  <select name="selectField" style="${INPUT_STYLE};appearance:none;background:#fff;">
    <option value="">Choose an option…</option>
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
  </select>
</div>`,
    },
    {
      id: 'form-textarea-input',
      label: 'Text Area',
      category: 'Forms',
      html: `<div style="${FIELD_WRAP}">
  <label style="${LABEL_STYLE}">Message</label>
  <textarea name="message" rows="4" placeholder="Enter your message…" style="${INPUT_STYLE};resize:vertical;"></textarea>
</div>`,
    },
    {
      id: 'form-hidden-input',
      label: 'Hidden Field',
      category: 'Forms',
      html: `<input type="hidden" name="hiddenField" value="" data-metadata-prefill="" />`,
    },
  ];
}
