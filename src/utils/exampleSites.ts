/**
 * Pre-built example sites to help users get started quickly.
 *
 * Each example is a fully-populated Site object with multiple pages
 * containing realistic HTML/CSS content ready to customise.
 */

import type { Site } from '../types';

// ─── Shared style constants ───────────────────────────────────────────────────

const NAV_PLACEHOLDER = `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#1e293b;color:#fff;position:sticky;top:0;z-index:100;">
  <span style="font-weight:700;font-size:1.25rem;letter-spacing:-.5px;">SITE NAME</span>
  <ul style="list-style:none;display:flex;gap:28px;margin:0;padding:0;">
    <li><a href="index.html" style="color:#cbd5e1;text-decoration:none;font-size:.9rem;">Home</a></li>
    <li><a href="about.html" style="color:#cbd5e1;text-decoration:none;font-size:.9rem;">About</a></li>
    <li><a href="services.html" style="color:#cbd5e1;text-decoration:none;font-size:.9rem;">Services</a></li>
    <li><a href="contact.html" style="color:#cbd5e1;text-decoration:none;font-size:.9rem;">Contact</a></li>
  </ul>
</nav>`;

/** @internal kept for future use in snippet generation */
export const _NAV_PLACEHOLDER = NAV_PLACEHOLDER;

const FOOTER_PLACEHOLDER = `<footer style="background:#0f172a;color:#94a3b8;padding:40px;text-align:center;">
  <p style="margin:0 0 8px;font-size:.9rem;">© 2025 Site Name. All rights reserved.</p>
  <p style="margin:0;font-size:.8rem;color:#64748b;">Built with StaticCreator</p>
</footer>`;

/** @internal kept for future use in snippet generation */
export const _FOOTER_PLACEHOLDER = FOOTER_PLACEHOLDER;

// ─── Helper ──────────────────────────────────────────────────────────────────

function gjsData(html: string, css = ''): string {
  return JSON.stringify({ html, css });
}

// ─── Site 1: Corporate / Business ────────────────────────────────────────────

const CORP_NAV = `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#1e293b;color:#fff;position:sticky;top:0;z-index:100;">
  <span style="font-weight:700;font-size:1.25rem;letter-spacing:-.5px;">Contoso Corp</span>
  <ul style="list-style:none;display:flex;gap:28px;margin:0;padding:0;">
    <li><a href="home.html" style="color:#cbd5e1;text-decoration:none;font-size:.9rem;">Home</a></li>
    <li><a href="about.html" style="color:#cbd5e1;text-decoration:none;font-size:.9rem;">About</a></li>
    <li><a href="services.html" style="color:#cbd5e1;text-decoration:none;font-size:.9rem;">Services</a></li>
    <li><a href="blog.html" style="color:#cbd5e1;text-decoration:none;font-size:.9rem;">Blog</a></li>
    <li><a href="contact.html" style="color:#cbd5e1;text-decoration:none;font-size:.9rem;">Contact</a></li>
  </ul>
</nav>`;

const CORP_FOOTER = `<footer style="background:#0f172a;color:#94a3b8;padding:48px 40px;margin-top:0;">
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px;">
    <div>
      <p style="font-weight:700;font-size:1.1rem;color:#fff;margin:0 0 12px;">Contoso Corp</p>
      <p style="font-size:.875rem;line-height:1.6;margin:0;">Delivering innovative solutions that drive growth and efficiency for businesses worldwide.</p>
    </div>
    <div>
      <p style="font-weight:600;color:#fff;margin:0 0 12px;font-size:.9rem;">Quick Links</p>
      <ul style="list-style:none;padding:0;margin:0;font-size:.875rem;line-height:2;">
        <li><a href="home.html" style="color:#94a3b8;text-decoration:none;">Home</a></li>
        <li><a href="about.html" style="color:#94a3b8;text-decoration:none;">About</a></li>
        <li><a href="services.html" style="color:#94a3b8;text-decoration:none;">Services</a></li>
        <li><a href="contact.html" style="color:#94a3b8;text-decoration:none;">Contact</a></li>
      </ul>
    </div>
    <div>
      <p style="font-weight:600;color:#fff;margin:0 0 12px;font-size:.9rem;">Contact</p>
      <p style="font-size:.875rem;line-height:2;margin:0;">info@contosocorp.com<br/>+1 (555) 234-5678<br/>123 Business Ave, Seattle WA</p>
    </div>
  </div>
  <div style="max-width:1100px;margin:32px auto 0;border-top:1px solid #1e293b;padding-top:24px;text-align:center;font-size:.8rem;">
    © 2025 Contoso Corp. All rights reserved.
  </div>
</footer>`;

const corpHome = gjsData(`${CORP_NAV}
<section style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);color:#fff;padding:100px 40px;text-align:center;">
  <p style="font-size:.9rem;letter-spacing:2px;text-transform:uppercase;opacity:.8;margin:0 0 16px;">Welcome to Contoso Corp</p>
  <h1 style="font-size:3rem;font-weight:800;margin:0 0 20px;line-height:1.15;">Powering Business Growth<br/>Through Technology</h1>
  <p style="font-size:1.15rem;opacity:.9;max-width:560px;margin:0 auto 36px;line-height:1.7;">We help organisations streamline operations, modernise infrastructure, and unlock new revenue opportunities.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
    <a href="services.html" style="display:inline-block;padding:14px 36px;background:#fff;color:#1e3a5f;text-decoration:none;border-radius:8px;font-weight:700;font-size:1rem;">Our Services</a>
    <a href="contact.html" style="display:inline-block;padding:14px 36px;background:transparent;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:1rem;border:2px solid rgba(255,255,255,.6);">Get in Touch</a>
  </div>
</section>

<section style="padding:80px 40px;background:#f8fafc;">
  <div style="max-width:1100px;margin:0 auto;text-align:center;">
    <h2 style="font-size:2rem;font-weight:700;color:#0f172a;margin:0 0 12px;">Why Choose Contoso?</h2>
    <p style="color:#64748b;max-width:520px;margin:0 auto 56px;line-height:1.7;">Trusted by over 500 clients globally, we combine deep expertise with a passion for results.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;">
      <div style="background:#fff;border-radius:16px;padding:36px 28px;box-shadow:0 4px 24px rgba(0,0,0,.06);text-align:left;">
        <div style="width:48px;height:48px;background:#dbeafe;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:20px;">🚀</div>
        <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 10px;">Rapid Delivery</h3>
        <p style="color:#64748b;font-size:.9rem;line-height:1.7;margin:0;">From discovery to deployment in weeks, not months. Our agile teams move fast without cutting corners.</p>
      </div>
      <div style="background:#fff;border-radius:16px;padding:36px 28px;box-shadow:0 4px 24px rgba(0,0,0,.06);text-align:left;">
        <div style="width:48px;height:48px;background:#dcfce7;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:20px;">🔒</div>
        <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 10px;">Enterprise Security</h3>
        <p style="color:#64748b;font-size:.9rem;line-height:1.7;margin:0;">SOC 2 Type II certified with end-to-end encryption. Your data is protected at every layer.</p>
      </div>
      <div style="background:#fff;border-radius:16px;padding:36px 28px;box-shadow:0 4px 24px rgba(0,0,0,.06);text-align:left;">
        <div style="width:48px;height:48px;background:#fef3c7;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:20px;">📈</div>
        <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:0 0 10px;">Measurable ROI</h3>
        <p style="color:#64748b;font-size:.9rem;line-height:1.7;margin:0;">Average 40% efficiency gain in the first year. We track outcomes, not just outputs.</p>
      </div>
    </div>
  </div>
</section>

<section style="padding:80px 40px;background:#fff;">
  <div style="max-width:1100px;margin:0 auto;text-align:center;">
    <h2 style="font-size:2rem;font-weight:700;color:#0f172a;margin:0 0 48px;">Trusted By Industry Leaders</h2>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-bottom:64px;">
      <div style="background:#f8fafc;border-radius:12px;padding:28px 20px;font-weight:700;color:#94a3b8;font-size:1.1rem;letter-spacing:1px;">ACME INC</div>
      <div style="background:#f8fafc;border-radius:12px;padding:28px 20px;font-weight:700;color:#94a3b8;font-size:1.1rem;letter-spacing:1px;">FABRIKAM</div>
      <div style="background:#f8fafc;border-radius:12px;padding:28px 20px;font-weight:700;color:#94a3b8;font-size:1.1rem;letter-spacing:1px;">NORTHWIND</div>
      <div style="background:#f8fafc;border-radius:12px;padding:28px 20px;font-weight:700;color:#94a3b8;font-size:1.1rem;letter-spacing:1px;">TAILSPIN</div>
    </div>
    <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:20px;padding:56px 40px;color:#fff;">
      <h3 style="font-size:1.75rem;font-weight:700;margin:0 0 16px;">Ready to transform your business?</h3>
      <p style="opacity:.9;margin:0 0 28px;font-size:1rem;max-width:480px;margin-left:auto;margin-right:auto;">Schedule a free 30-minute strategy call with one of our experts today.</p>
      <a href="contact.html" style="display:inline-block;padding:14px 40px;background:#fff;color:#1e3a5f;text-decoration:none;border-radius:8px;font-weight:700;">Book a Free Call</a>
    </div>
  </div>
</section>
${CORP_FOOTER}`);

const corpAbout = gjsData(`${CORP_NAV}
<section style="background:#f8fafc;padding:72px 40px;text-align:center;">
  <h1 style="font-size:2.75rem;font-weight:800;color:#0f172a;margin:0 0 16px;">About Contoso Corp</h1>
  <p style="color:#64748b;max-width:600px;margin:0 auto;line-height:1.7;font-size:1.05rem;">Founded in 2010, we've spent over a decade helping businesses embrace technology to grow faster and operate smarter.</p>
</section>

<section style="padding:80px 40px;background:#fff;">
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;">
    <div>
      <h2 style="font-size:2rem;font-weight:700;color:#0f172a;margin:0 0 20px;">Our Mission</h2>
      <p style="color:#475569;line-height:1.8;margin:0 0 20px;">We believe every organisation deserves access to world-class technology. Our mission is to democratise enterprise solutions — delivering the same capabilities that Fortune 500 companies rely on to growing businesses everywhere.</p>
      <p style="color:#475569;line-height:1.8;margin:0 0 24px;">From cloud migrations to custom software and AI-powered workflows, we partner with you for the long term — not just the project.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div style="text-align:center;padding:24px;background:#f1f5f9;border-radius:12px;">
          <p style="font-size:2.25rem;font-weight:800;color:#2563eb;margin:0 0 4px;">500+</p>
          <p style="font-size:.875rem;color:#64748b;margin:0;">Clients Served</p>
        </div>
        <div style="text-align:center;padding:24px;background:#f1f5f9;border-radius:12px;">
          <p style="font-size:2.25rem;font-weight:800;color:#2563eb;margin:0 0 4px;">98%</p>
          <p style="font-size:.875rem;color:#64748b;margin:0;">Client Retention</p>
        </div>
        <div style="text-align:center;padding:24px;background:#f1f5f9;border-radius:12px;">
          <p style="font-size:2.25rem;font-weight:800;color:#2563eb;margin:0 0 4px;">14yrs</p>
          <p style="font-size:.875rem;color:#64748b;margin:0;">In Business</p>
        </div>
        <div style="text-align:center;padding:24px;background:#f1f5f9;border-radius:12px;">
          <p style="font-size:2.25rem;font-weight:800;color:#2563eb;margin:0 0 4px;">120+</p>
          <p style="font-size:.875rem;color:#64748b;margin:0;">Team Members</p>
        </div>
      </div>
    </div>
    <div style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-radius:20px;padding:48px;text-align:center;">
      <div style="font-size:4rem;margin-bottom:16px;">🏢</div>
      <p style="font-size:1.1rem;font-weight:600;color:#1e40af;margin:0 0 8px;">Headquartered in Seattle, WA</p>
      <p style="color:#3b82f6;font-size:.9rem;margin:0;">With offices in New York, Chicago and Austin</p>
    </div>
  </div>
</section>

<section style="padding:80px 40px;background:#f8fafc;">
  <div style="max-width:1100px;margin:0 auto;">
    <h2 style="font-size:2rem;font-weight:700;color:#0f172a;margin:0 0 48px;text-align:center;">Meet the Leadership Team</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;">
      <div style="background:#fff;border-radius:16px;padding:32px 24px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.06);">
        <div style="width:80px;height:80px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;font-weight:700;">AJ</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0f172a;margin:0 0 4px;">Alex Johnson</h3>
        <p style="color:#2563eb;font-size:.875rem;font-weight:600;margin:0 0 12px;">CEO &amp; Co-Founder</p>
        <p style="color:#64748b;font-size:.85rem;line-height:1.6;margin:0;">20+ years in enterprise technology. Previously VP Engineering at Microsoft.</p>
      </div>
      <div style="background:#fff;border-radius:16px;padding:32px 24px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.06);">
        <div style="width:80px;height:80px;background:linear-gradient(135deg,#0891b2,#06b6d4);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;font-weight:700;">SM</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0f172a;margin:0 0 4px;">Sarah Martinez</h3>
        <p style="color:#2563eb;font-size:.875rem;font-weight:600;margin:0 0 12px;">CTO &amp; Co-Founder</p>
        <p style="color:#64748b;font-size:.85rem;line-height:1.6;margin:0;">Cloud architect with deep Azure and AWS expertise. AWS Certified Solutions Architect.</p>
      </div>
      <div style="background:#fff;border-radius:16px;padding:32px 24px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.06);">
        <div style="width:80px;height:80px;background:linear-gradient(135deg,#059669,#10b981);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;font-weight:700;">DK</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0f172a;margin:0 0 4px;">David Kim</h3>
        <p style="color:#2563eb;font-size:.875rem;font-weight:600;margin:0 0 12px;">VP of Client Success</p>
        <p style="color:#64748b;font-size:.85rem;line-height:1.6;margin:0;">Dedicated to client outcomes. Built our customer success practice from the ground up.</p>
      </div>
    </div>
  </div>
</section>
${CORP_FOOTER}`);

const corpServices = gjsData(`${CORP_NAV}
<section style="background:#f8fafc;padding:72px 40px;text-align:center;">
  <h1 style="font-size:2.75rem;font-weight:800;color:#0f172a;margin:0 0 16px;">Our Services</h1>
  <p style="color:#64748b;max-width:560px;margin:0 auto;line-height:1.7;font-size:1.05rem;">End-to-end technology services designed to accelerate your business goals.</p>
</section>

<section style="padding:80px 40px;background:#fff;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:32px;">
      <div style="border:1px solid #e2e8f0;border-radius:16px;padding:40px;transition:box-shadow .2s;">
        <div style="font-size:2.5rem;margin-bottom:16px;">☁️</div>
        <h3 style="font-size:1.3rem;font-weight:700;color:#0f172a;margin:0 0 12px;">Cloud Migration</h3>
        <p style="color:#64748b;line-height:1.7;margin:0 0 20px;">Migrate your on-premises workloads to Azure with zero downtime. We handle planning, execution, and post-migration optimisation.</p>
        <ul style="color:#475569;font-size:.9rem;line-height:2;padding-left:20px;margin:0 0 24px;">
          <li>Infrastructure assessment &amp; planning</li>
          <li>Lift-and-shift or modernise-in-place</li>
          <li>Cost optimisation &amp; right-sizing</li>
          <li>24/7 post-migration support</li>
        </ul>
        <a href="contact.html" style="display:inline-block;padding:10px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:.9rem;">Get a Quote</a>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:16px;padding:40px;">
        <div style="font-size:2.5rem;margin-bottom:16px;">💻</div>
        <h3 style="font-size:1.3rem;font-weight:700;color:#0f172a;margin:0 0 12px;">Custom Software Development</h3>
        <p style="color:#64748b;line-height:1.7;margin:0 0 20px;">Bespoke applications built around your workflows. From internal tools to customer-facing platforms.</p>
        <ul style="color:#475569;font-size:.9rem;line-height:2;padding-left:20px;margin:0 0 24px;">
          <li>React, Angular, Vue front-ends</li>
          <li>.NET, Node.js, Python back-ends</li>
          <li>Mobile (iOS &amp; Android)</li>
          <li>API design &amp; integration</li>
        </ul>
        <a href="contact.html" style="display:inline-block;padding:10px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:.9rem;">Get a Quote</a>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:16px;padding:40px;">
        <div style="font-size:2.5rem;margin-bottom:16px;">🤖</div>
        <h3 style="font-size:1.3rem;font-weight:700;color:#0f172a;margin:0 0 12px;">AI &amp; Automation</h3>
        <p style="color:#64748b;line-height:1.7;margin:0 0 20px;">Harness the power of Azure AI and OpenAI to automate repetitive tasks and surface actionable insights.</p>
        <ul style="color:#475569;font-size:.9rem;line-height:2;padding-left:20px;margin:0 0 24px;">
          <li>Copilot &amp; GPT integrations</li>
          <li>Document intelligence &amp; OCR</li>
          <li>Workflow automation (Power Automate)</li>
          <li>Predictive analytics dashboards</li>
        </ul>
        <a href="contact.html" style="display:inline-block;padding:10px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:.9rem;">Get a Quote</a>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:16px;padding:40px;">
        <div style="font-size:2.5rem;margin-bottom:16px;">🔐</div>
        <h3 style="font-size:1.3rem;font-weight:700;color:#0f172a;margin:0 0 12px;">Managed Security</h3>
        <p style="color:#64748b;line-height:1.7;margin:0 0 20px;">Continuous threat monitoring, compliance management, and incident response for peace of mind.</p>
        <ul style="color:#475569;font-size:.9rem;line-height:2;padding-left:20px;margin:0 0 24px;">
          <li>Microsoft Sentinel SIEM</li>
          <li>Defender for Cloud setup</li>
          <li>Zero-trust architecture</li>
          <li>Compliance (ISO 27001, SOC 2, HIPAA)</li>
        </ul>
        <a href="contact.html" style="display:inline-block;padding:10px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:.9rem;">Get a Quote</a>
      </div>
    </div>
  </div>
</section>

<section style="padding:64px 40px;background:#1e3a5f;color:#fff;text-align:center;">
  <h2 style="font-size:1.75rem;font-weight:700;margin:0 0 12px;">Not sure where to start?</h2>
  <p style="opacity:.85;margin:0 0 28px;max-width:480px;margin-left:auto;margin-right:auto;line-height:1.7;">Our free discovery call helps you identify the biggest opportunities in your business. No commitment required.</p>
  <a href="contact.html" style="display:inline-block;padding:14px 40px;background:#fff;color:#1e3a5f;text-decoration:none;border-radius:8px;font-weight:700;">Schedule Discovery Call</a>
</section>
${CORP_FOOTER}`);

const corpContact = gjsData(`${CORP_NAV}
<section style="padding:80px 40px;background:#f8fafc;">
  <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:1fr 1.4fr;gap:64px;align-items:start;">
    <div>
      <h1 style="font-size:2.25rem;font-weight:800;color:#0f172a;margin:0 0 16px;">Get In Touch</h1>
      <p style="color:#64748b;line-height:1.7;margin:0 0 36px;">Have a project in mind? We'd love to hear about it. Fill in the form and we'll be in touch within one business day.</p>
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div style="display:flex;align-items:flex-start;gap:14px;">
          <div style="width:40px;height:40px;background:#dbeafe;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">📧</div>
          <div>
            <p style="font-weight:600;color:#0f172a;margin:0 0 2px;font-size:.9rem;">Email</p>
            <p style="color:#2563eb;margin:0;font-size:.9rem;">info@contosocorp.com</p>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px;">
          <div style="width:40px;height:40px;background:#dcfce7;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">📞</div>
          <div>
            <p style="font-weight:600;color:#0f172a;margin:0 0 2px;font-size:.9rem;">Phone</p>
            <p style="color:#475569;margin:0;font-size:.9rem;">+1 (555) 234-5678</p>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px;">
          <div style="width:40px;height:40px;background:#fef3c7;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">📍</div>
          <div>
            <p style="font-weight:600;color:#0f172a;margin:0 0 2px;font-size:.9rem;">Address</p>
            <p style="color:#475569;margin:0;font-size:.9rem;">123 Business Ave, Suite 400<br/>Seattle, WA 98101</p>
          </div>
        </div>
      </div>
    </div>
    <form data-api-form="true" data-api-url="/api/contact" data-api-method="POST" data-success-message="Thanks! We'll be in touch within one business day." style="background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <h2 style="font-size:1.25rem;font-weight:700;color:#0f172a;margin:0 0 24px;">Send us a message</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div>
          <label style="display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:6px;">First Name</label>
          <input type="text" name="firstName" placeholder="Alex" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
        </div>
        <div>
          <label style="display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:6px;">Last Name</label>
          <input type="text" name="lastName" placeholder="Johnson" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
        </div>
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:6px;">Work Email</label>
        <input type="email" name="email" placeholder="alex@company.com" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:6px;">Company</label>
        <input type="text" name="company" placeholder="Your company" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:6px;">Service of Interest</label>
        <select name="service" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;box-sizing:border-box;font-size:.9rem;background:#fff;appearance:none;">
          <option value="">Select a service…</option>
          <option value="cloud">Cloud Migration</option>
          <option value="software">Custom Software</option>
          <option value="ai">AI &amp; Automation</option>
          <option value="security">Managed Security</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div style="margin-bottom:24px;">
        <label style="display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:6px;">Message</label>
        <textarea name="message" rows="4" placeholder="Tell us about your project or challenge…" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;box-sizing:border-box;font-size:.9rem;resize:vertical;"></textarea>
      </div>
      <button type="submit" style="width:100%;padding:12px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:.95rem;cursor:pointer;">Send Message</button>
    </form>
  </div>
</section>
${CORP_FOOTER}`);

const corpBlog = gjsData(`${CORP_NAV}
<section style="background:#f8fafc;padding:72px 40px;text-align:center;">
  <h1 style="font-size:2.75rem;font-weight:800;color:#0f172a;margin:0 0 16px;">Insights &amp; Ideas</h1>
  <p style="color:#64748b;max-width:520px;margin:0 auto;line-height:1.7;font-size:1.05rem;">Expert perspectives on cloud, AI, security, and digital transformation.</p>
</section>

<section style="padding:72px 40px;background:#fff;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;">
      <article style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="height:180px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);display:flex;align-items:center;justify-content:center;font-size:3rem;">☁️</div>
        <div style="padding:24px;">
          <span style="font-size:.75rem;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;">Cloud</span>
          <h3 style="font-size:1.05rem;font-weight:700;color:#0f172a;margin:10px 0 10px;line-height:1.4;">5 Signs Your Infrastructure Is Ready for Azure Migration</h3>
          <p style="color:#64748b;font-size:.875rem;line-height:1.6;margin:0 0 16px;">Migrating to the cloud is a major decision. Here are the signals that indicate your business is primed for a successful move.</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:32px;height:32px;background:#1e40af;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.75rem;font-weight:700;">AJ</div>
            <div>
              <p style="font-size:.8rem;font-weight:600;color:#0f172a;margin:0;">Alex Johnson</p>
              <p style="font-size:.75rem;color:#94a3b8;margin:0;">May 12, 2025 · 5 min read</p>
            </div>
          </div>
        </div>
      </article>
      <article style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="height:180px;background:linear-gradient(135deg,#fef3c7,#fde68a);display:flex;align-items:center;justify-content:center;font-size:3rem;">🤖</div>
        <div style="padding:24px;">
          <span style="font-size:.75rem;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:1px;">AI</span>
          <h3 style="font-size:1.05rem;font-weight:700;color:#0f172a;margin:10px 0 10px;line-height:1.4;">How Copilot is Changing Enterprise Productivity in 2025</h3>
          <p style="color:#64748b;font-size:.875rem;line-height:1.6;margin:0 0 16px;">We surveyed 200 enterprise customers after 6 months of Copilot adoption. The results are striking.</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:32px;height:32px;background:#0891b2;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.75rem;font-weight:700;">SM</div>
            <div>
              <p style="font-size:.8rem;font-weight:600;color:#0f172a;margin:0;">Sarah Martinez</p>
              <p style="font-size:.75rem;color:#94a3b8;margin:0;">Apr 28, 2025 · 7 min read</p>
            </div>
          </div>
        </div>
      </article>
      <article style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="height:180px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);display:flex;align-items:center;justify-content:center;font-size:3rem;">🔐</div>
        <div style="padding:24px;">
          <span style="font-size:.75rem;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:1px;">Security</span>
          <h3 style="font-size:1.05rem;font-weight:700;color:#0f172a;margin:10px 0 10px;line-height:1.4;">Zero Trust: A Practical Roadmap for Mid-Market Companies</h3>
          <p style="color:#64748b;font-size:.875rem;line-height:1.6;margin:0 0 16px;">Zero trust doesn't have to mean zero budget. Here's a phased approach that works for companies of any size.</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:32px;height:32px;background:#059669;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.75rem;font-weight:700;">DK</div>
            <div>
              <p style="font-size:.8rem;font-weight:600;color:#0f172a;margin:0;">David Kim</p>
              <p style="font-size:.75rem;color:#94a3b8;margin:0;">Apr 10, 2025 · 6 min read</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>
${CORP_FOOTER}`);

// ─── Site 2: Healthcare / Medical Clinic ─────────────────────────────────────

const MED_NAV = `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#fff;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:100;box-shadow:0 1px 8px rgba(0,0,0,.06);">
  <div style="display:flex;align-items:center;gap:10px;">
    <div style="width:36px;height:36px;background:#0284c7;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.9rem;">CW</div>
    <span style="font-weight:700;font-size:1.1rem;color:#0c4a6e;">ClearWell Medical</span>
  </div>
  <ul style="list-style:none;display:flex;gap:28px;margin:0;padding:0;">
    <li><a href="home.html" style="color:#475569;text-decoration:none;font-size:.9rem;font-weight:500;">Home</a></li>
    <li><a href="specialties.html" style="color:#475569;text-decoration:none;font-size:.9rem;font-weight:500;">Specialties</a></li>
    <li><a href="resources.html" style="color:#475569;text-decoration:none;font-size:.9rem;font-weight:500;">Patient Resources</a></li>
    <li><a href="contact.html" style="color:#475569;text-decoration:none;font-size:.9rem;font-weight:500;">Contact</a></li>
    <li><a href="appointments.html" style="display:inline-block;padding:8px 20px;background:#0284c7;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:.875rem;">Book Appointment</a></li>
  </ul>
</nav>`;

const MED_FOOTER = `<footer style="background:#0c4a6e;color:#bae6fd;padding:48px 40px;margin-top:0;">
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr;gap:40px;">
    <div>
      <p style="font-weight:700;font-size:1.1rem;color:#fff;margin:0 0 12px;">ClearWell Medical</p>
      <p style="font-size:.875rem;line-height:1.7;margin:0 0 12px;">Providing compassionate, evidence-based care to our community since 1998.</p>
      <p style="font-size:.8rem;color:#7dd3fc;margin:0;">⚕️ Board-certified physicians • Joint Commission accredited</p>
    </div>
    <div>
      <p style="font-weight:600;color:#fff;margin:0 0 12px;font-size:.9rem;">Services</p>
      <ul style="list-style:none;padding:0;margin:0;font-size:.875rem;line-height:2;">
        <li><a href="specialties.html" style="color:#bae6fd;text-decoration:none;">Family Medicine</a></li>
        <li><a href="specialties.html" style="color:#bae6fd;text-decoration:none;">Cardiology</a></li>
        <li><a href="specialties.html" style="color:#bae6fd;text-decoration:none;">Paediatrics</a></li>
        <li><a href="specialties.html" style="color:#bae6fd;text-decoration:none;">Mental Health</a></li>
      </ul>
    </div>
    <div>
      <p style="font-weight:600;color:#fff;margin:0 0 12px;font-size:.9rem;">Contact &amp; Hours</p>
      <p style="font-size:.875rem;line-height:2;margin:0;">📞 (555) 800-1234<br/>📧 info@clearwellmedical.com<br/>Mon–Fri: 8 AM – 6 PM<br/>Sat: 9 AM – 1 PM</p>
    </div>
  </div>
  <div style="max-width:1100px;margin:32px auto 0;border-top:1px solid #075985;padding-top:24px;text-align:center;font-size:.8rem;color:#7dd3fc;">
    © 2025 ClearWell Medical Group. All rights reserved. This site is for informational purposes only and does not provide medical advice.
  </div>
</footer>`;

const medHome = gjsData(`${MED_NAV}
<section style="background:linear-gradient(135deg,#0c4a6e 0%,#0284c7 100%);color:#fff;padding:88px 40px;text-align:center;">
  <p style="font-size:.85rem;letter-spacing:2px;text-transform:uppercase;opacity:.8;margin:0 0 16px;">ClearWell Medical Group</p>
  <h1 style="font-size:2.75rem;font-weight:800;margin:0 0 20px;line-height:1.2;">Compassionate Care<br/>Close to Home</h1>
  <p style="font-size:1.1rem;opacity:.9;max-width:520px;margin:0 auto 36px;line-height:1.7;">Board-certified physicians delivering personalised, evidence-based healthcare to patients of all ages. Same-day appointments available.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
    <a href="appointments.html" style="display:inline-block;padding:14px 36px;background:#fff;color:#0c4a6e;text-decoration:none;border-radius:8px;font-weight:700;">Book an Appointment</a>
    <a href="specialties.html" style="display:inline-block;padding:14px 36px;background:transparent;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;border:2px solid rgba(255,255,255,.6);">Our Specialties</a>
  </div>
</section>

<section style="padding:32px 40px;background:#f0f9ff;">
  <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:16px;text-align:center;">
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.05);">
      <p style="font-size:1.75rem;font-weight:800;color:#0284c7;margin:0 0 4px;">25+</p>
      <p style="font-size:.8rem;color:#64748b;margin:0;">Physicians</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.05);">
      <p style="font-size:1.75rem;font-weight:800;color:#0284c7;margin:0 0 4px;">15k+</p>
      <p style="font-size:.8rem;color:#64748b;margin:0;">Patients Served</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.05);">
      <p style="font-size:1.75rem;font-weight:800;color:#0284c7;margin:0 0 4px;">12</p>
      <p style="font-size:.8rem;color:#64748b;margin:0;">Specialties</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.05);">
      <p style="font-size:1.75rem;font-weight:800;color:#0284c7;margin:0 0 4px;">26yrs</p>
      <p style="font-size:.8rem;color:#64748b;margin:0;">In Practice</p>
    </div>
  </div>
</section>

<section style="padding:80px 40px;background:#fff;">
  <div style="max-width:1100px;margin:0 auto;text-align:center;">
    <h2 style="font-size:2rem;font-weight:700;color:#0f172a;margin:0 0 12px;">How We Help You Stay Healthy</h2>
    <p style="color:#64748b;max-width:520px;margin:0 auto 56px;line-height:1.7;">Comprehensive care from prevention through treatment, all under one roof.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;">
      <div style="background:#f0f9ff;border-radius:16px;padding:32px 24px;text-align:left;">
        <div style="font-size:2rem;margin-bottom:16px;">🩺</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">Preventive Care</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0;">Annual wellness exams, immunisations, cancer screenings, and lifestyle counselling to keep you at your best.</p>
      </div>
      <div style="background:#f0f9ff;border-radius:16px;padding:32px 24px;text-align:left;">
        <div style="font-size:2rem;margin-bottom:16px;">💊</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">Chronic Disease Management</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0;">Personalised plans for diabetes, hypertension, heart disease, and other ongoing conditions.</p>
      </div>
      <div style="background:#f0f9ff;border-radius:16px;padding:32px 24px;text-align:left;">
        <div style="font-size:2rem;margin-bottom:16px;">🖥️</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">Telehealth</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0;">Convenient video visits for follow-ups, prescription refills, and minor concerns — from the comfort of home.</p>
      </div>
    </div>
  </div>
</section>

<section style="padding:64px 40px;background:#0284c7;color:#fff;text-align:center;">
  <h2 style="font-size:1.75rem;font-weight:700;margin:0 0 12px;">Need to see a doctor today?</h2>
  <p style="opacity:.9;margin:0 0 28px;max-width:440px;margin-left:auto;margin-right:auto;">We offer same-day appointments for urgent concerns. Call us or book online.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
    <a href="appointments.html" style="display:inline-block;padding:12px 32px;background:#fff;color:#0c4a6e;text-decoration:none;border-radius:8px;font-weight:700;">Book Online</a>
    <a href="tel:5558001234" style="display:inline-block;padding:12px 32px;background:transparent;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;border:2px solid rgba(255,255,255,.7);">📞 (555) 800-1234</a>
  </div>
</section>
${MED_FOOTER}`);

const medSpecialties = gjsData(`${MED_NAV}
<section style="background:#f0f9ff;padding:72px 40px;text-align:center;">
  <h1 style="font-size:2.5rem;font-weight:800;color:#0c4a6e;margin:0 0 16px;">Our Specialties</h1>
  <p style="color:#475569;max-width:560px;margin:0 auto;line-height:1.7;font-size:1.05rem;">Expert care across 12 medical disciplines, delivered by experienced, board-certified physicians.</p>
</section>

<section style="padding:80px 40px;background:#fff;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;">
      <div style="border:1px solid #bae6fd;border-radius:16px;padding:32px 24px;background:#f0f9ff;">
        <div style="font-size:2rem;margin-bottom:12px;">👨‍👩‍👧‍👦</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">Family Medicine</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0 0 16px;">Primary care for every member of the family, from newborns to seniors. Annual physicals, sick visits, and chronic condition management.</p>
        <a href="appointments.html" style="color:#0284c7;font-size:.875rem;font-weight:600;text-decoration:none;">Book appointment →</a>
      </div>
      <div style="border:1px solid #bae6fd;border-radius:16px;padding:32px 24px;background:#f0f9ff;">
        <div style="font-size:2rem;margin-bottom:12px;">❤️</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">Cardiology</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0 0 16px;">Comprehensive heart health services including ECG, stress tests, echocardiography, and management of heart disease and hypertension.</p>
        <a href="appointments.html" style="color:#0284c7;font-size:.875rem;font-weight:600;text-decoration:none;">Book appointment →</a>
      </div>
      <div style="border:1px solid #bae6fd;border-radius:16px;padding:32px 24px;background:#f0f9ff;">
        <div style="font-size:2rem;margin-bottom:12px;">🧒</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">Paediatrics</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0 0 16px;">Well-child visits, immunisations, developmental screenings, and care for childhood illnesses. A friendly environment for kids of all ages.</p>
        <a href="appointments.html" style="color:#0284c7;font-size:.875rem;font-weight:600;text-decoration:none;">Book appointment →</a>
      </div>
      <div style="border:1px solid #bae6fd;border-radius:16px;padding:32px 24px;background:#f0f9ff;">
        <div style="font-size:2rem;margin-bottom:12px;">🧠</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">Mental Health</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0 0 16px;">Individual therapy, psychiatric evaluation, and medication management for anxiety, depression, PTSD, and other conditions.</p>
        <a href="appointments.html" style="color:#0284c7;font-size:.875rem;font-weight:600;text-decoration:none;">Book appointment →</a>
      </div>
      <div style="border:1px solid #bae6fd;border-radius:16px;padding:32px 24px;background:#f0f9ff;">
        <div style="font-size:2rem;margin-bottom:12px;">🦴</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">Orthopaedics</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0 0 16px;">Sports injuries, joint pain, fractures, and musculoskeletal disorders. Conservative and surgical treatment options available.</p>
        <a href="appointments.html" style="color:#0284c7;font-size:.875rem;font-weight:600;text-decoration:none;">Book appointment →</a>
      </div>
      <div style="border:1px solid #bae6fd;border-radius:16px;padding:32px 24px;background:#f0f9ff;">
        <div style="font-size:2rem;margin-bottom:12px;">🔬</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">Laboratory &amp; Diagnostics</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0 0 16px;">On-site lab for blood work, urinalysis, and pathology. Results typically available within 24 hours.</p>
        <a href="appointments.html" style="color:#0284c7;font-size:.875rem;font-weight:600;text-decoration:none;">Book appointment →</a>
      </div>
    </div>
  </div>
</section>
${MED_FOOTER}`);

const medAppointments = gjsData(`${MED_NAV}
<section style="padding:80px 40px;background:#f0f9ff;">
  <div style="max-width:800px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <h1 style="font-size:2.25rem;font-weight:800;color:#0c4a6e;margin:0 0 12px;">Book an Appointment</h1>
      <p style="color:#475569;line-height:1.7;max-width:520px;margin:0 auto;">Complete the form below and our team will confirm your appointment within 2 hours during business hours.</p>
    </div>
    <form data-api-form="true" data-api-url="/api/appointments" data-api-method="POST" data-success-message="Your appointment request has been received! We'll confirm within 2 hours." style="background:#fff;border-radius:20px;padding:48px;box-shadow:0 8px 40px rgba(0,0,0,.08);">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div>
          <label style="display:block;font-size:.8rem;font-weight:600;color:#0c4a6e;margin-bottom:6px;">First Name *</label>
          <input type="text" name="firstName" required placeholder="Jane" style="width:100%;padding:10px 14px;border:1px solid #bae6fd;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
        </div>
        <div>
          <label style="display:block;font-size:.8rem;font-weight:600;color:#0c4a6e;margin-bottom:6px;">Last Name *</label>
          <input type="text" name="lastName" required placeholder="Smith" style="width:100%;padding:10px 14px;border:1px solid #bae6fd;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div>
          <label style="display:block;font-size:.8rem;font-weight:600;color:#0c4a6e;margin-bottom:6px;">Date of Birth *</label>
          <input type="date" name="dob" required style="width:100%;padding:10px 14px;border:1px solid #bae6fd;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
        </div>
        <div>
          <label style="display:block;font-size:.8rem;font-weight:600;color:#0c4a6e;margin-bottom:6px;">Phone Number *</label>
          <input type="tel" name="phone" required placeholder="(555) 000-0000" style="width:100%;padding:10px 14px;border:1px solid #bae6fd;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
        </div>
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block;font-size:.8rem;font-weight:600;color:#0c4a6e;margin-bottom:6px;">Email Address</label>
        <input type="email" name="email" placeholder="jane@example.com" style="width:100%;padding:10px 14px;border:1px solid #bae6fd;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div>
          <label style="display:block;font-size:.8rem;font-weight:600;color:#0c4a6e;margin-bottom:6px;">Specialty *</label>
          <select name="specialty" required style="width:100%;padding:10px 14px;border:1px solid #bae6fd;border-radius:8px;box-sizing:border-box;font-size:.9rem;background:#fff;appearance:none;">
            <option value="">Choose specialty…</option>
            <option value="family">Family Medicine</option>
            <option value="cardiology">Cardiology</option>
            <option value="paediatrics">Paediatrics</option>
            <option value="mental-health">Mental Health</option>
            <option value="orthopaedics">Orthopaedics</option>
            <option value="lab">Lab &amp; Diagnostics</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:.8rem;font-weight:600;color:#0c4a6e;margin-bottom:6px;">Preferred Date *</label>
          <input type="date" name="preferredDate" required style="width:100%;padding:10px 14px;border:1px solid #bae6fd;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
        </div>
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block;font-size:.8rem;font-weight:600;color:#0c4a6e;margin-bottom:6px;">Visit Type</label>
        <select name="visitType" style="width:100%;padding:10px 14px;border:1px solid #bae6fd;border-radius:8px;box-sizing:border-box;font-size:.9rem;background:#fff;appearance:none;">
          <option value="in-person">In-person visit</option>
          <option value="telehealth">Telehealth (video)</option>
        </select>
      </div>
      <div style="margin-bottom:28px;">
        <label style="display:block;font-size:.8rem;font-weight:600;color:#0c4a6e;margin-bottom:6px;">Reason for Visit</label>
        <textarea name="reason" rows="3" placeholder="Briefly describe your symptoms or the reason for your visit…" style="width:100%;padding:10px 14px;border:1px solid #bae6fd;border-radius:8px;box-sizing:border-box;font-size:.9rem;resize:vertical;"></textarea>
      </div>
      <button type="submit" style="width:100%;padding:14px;background:#0284c7;color:#fff;border:none;border-radius:10px;font-weight:700;font-size:1rem;cursor:pointer;">Request Appointment</button>
      <p style="text-align:center;color:#94a3b8;font-size:.8rem;margin:16px 0 0;">For emergencies call 911 or go to your nearest ER.</p>
    </form>
  </div>
</section>
${MED_FOOTER}`);

const medResources = gjsData(`${MED_NAV}
<section style="background:#f0f9ff;padding:72px 40px;text-align:center;">
  <h1 style="font-size:2.5rem;font-weight:800;color:#0c4a6e;margin:0 0 16px;">Patient Resources</h1>
  <p style="color:#475569;max-width:520px;margin:0 auto;line-height:1.7;">Everything you need to manage your healthcare — forms, FAQs, insurance, and more.</p>
</section>

<section style="padding:72px 40px;background:#fff;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-bottom:64px;">
      <div style="background:#f0f9ff;border-radius:16px;padding:32px 24px;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:12px;">📋</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">New Patient Forms</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.6;margin:0 0 16px;">Save time at your first visit by completing our intake forms online before you arrive.</p>
        <a href="#" style="display:inline-block;padding:8px 20px;background:#0284c7;color:#fff;text-decoration:none;border-radius:8px;font-size:.875rem;font-weight:600;">Download Forms</a>
      </div>
      <div style="background:#f0f9ff;border-radius:16px;padding:32px 24px;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:12px;">💳</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">Insurance &amp; Billing</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.6;margin:0 0 16px;">We accept most major insurance plans. View accepted providers and pay your bill online.</p>
        <a href="#" style="display:inline-block;padding:8px 20px;background:#0284c7;color:#fff;text-decoration:none;border-radius:8px;font-size:.875rem;font-weight:600;">View Insurance</a>
      </div>
      <div style="background:#f0f9ff;border-radius:16px;padding:32px 24px;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:12px;">💊</div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0c4a6e;margin:0 0 10px;">Prescription Refills</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.6;margin:0 0 16px;">Request refills through your patient portal. Allow 2 business days for processing.</p>
        <a href="#" style="display:inline-block;padding:8px 20px;background:#0284c7;color:#fff;text-decoration:none;border-radius:8px;font-size:.875rem;font-weight:600;">Patient Portal</a>
      </div>
    </div>

    <h2 style="font-size:1.75rem;font-weight:700;color:#0c4a6e;margin:0 0 28px;">Frequently Asked Questions</h2>
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="border:1px solid #bae6fd;border-radius:12px;padding:24px;">
        <h3 style="font-size:.95rem;font-weight:700;color:#0c4a6e;margin:0 0 8px;">How do I get a same-day appointment?</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0;">Call our office at (555) 800-1234 before 10 AM. We reserve slots each morning for urgent same-day needs. Telehealth same-day appointments are usually available until 4 PM.</p>
      </div>
      <div style="border:1px solid #bae6fd;border-radius:12px;padding:24px;">
        <h3 style="font-size:.95rem;font-weight:700;color:#0c4a6e;margin:0 0 8px;">How do I access my test results?</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0;">Results are posted to your patient portal within 24–48 hours. You'll receive an email notification when they're ready. Your physician will follow up if any results require attention.</p>
      </div>
      <div style="border:1px solid #bae6fd;border-radius:12px;padding:24px;">
        <h3 style="font-size:.95rem;font-weight:700;color:#0c4a6e;margin:0 0 8px;">What insurance plans do you accept?</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0;">We accept Medicare, Medicaid, and most major commercial plans including Aetna, Blue Cross, Cigna, United Healthcare, and Humana. Contact our billing team to verify coverage before your visit.</p>
      </div>
      <div style="border:1px solid #bae6fd;border-radius:12px;padding:24px;">
        <h3 style="font-size:.95rem;font-weight:700;color:#0c4a6e;margin:0 0 8px;">Is telehealth available for children?</h3>
        <p style="color:#475569;font-size:.875rem;line-height:1.7;margin:0;">Yes. Our paediatric team offers video visits for follow-ups, mild illness, and prescription refills. The parent or guardian must be present during the visit for patients under 18.</p>
      </div>
    </div>
  </div>
</section>
${MED_FOOTER}`);

// ─── Site 3: Restaurant ───────────────────────────────────────────────────────

const REST_NAV = `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#1a0a00;color:#fff;position:sticky;top:0;z-index:100;">
  <div>
    <span style="font-weight:800;font-size:1.3rem;color:#f59e0b;font-style:italic;">La Bella Cucina</span>
    <p style="margin:0;font-size:.7rem;color:#a16207;letter-spacing:2px;text-transform:uppercase;">Authentic Italian</p>
  </div>
  <ul style="list-style:none;display:flex;gap:28px;margin:0;padding:0;align-items:center;">
    <li><a href="home.html" style="color:#e7d5b8;text-decoration:none;font-size:.9rem;">Home</a></li>
    <li><a href="menu.html" style="color:#e7d5b8;text-decoration:none;font-size:.9rem;">Menu</a></li>
    <li><a href="about.html" style="color:#e7d5b8;text-decoration:none;font-size:.9rem;">Our Story</a></li>
    <li><a href="contact.html" style="color:#e7d5b8;text-decoration:none;font-size:.9rem;">Find Us</a></li>
    <li><a href="reservations.html" style="display:inline-block;padding:8px 20px;background:#f59e0b;color:#1a0a00;text-decoration:none;border-radius:8px;font-weight:700;font-size:.875rem;">Reserve a Table</a></li>
  </ul>
</nav>`;

const REST_FOOTER = `<footer style="background:#1a0a00;color:#a16207;padding:48px 40px;text-align:center;">
  <p style="font-weight:800;font-size:1.3rem;color:#f59e0b;font-style:italic;margin:0 0 8px;">La Bella Cucina</p>
  <p style="font-size:.875rem;margin:0 0 20px;line-height:1.8;">456 Olive Garden Lane, Little Italy, NY 10013<br/>📞 (212) 555-9876 · info@labellacucina.com<br/>Tue–Sun: 5 PM – 10 PM · Closed Mondays</p>
  <hr style="border:none;border-top:1px solid #3d1f00;margin:20px 0;" />
  <p style="font-size:.8rem;margin:0;color:#78350f;">© 2025 La Bella Cucina. All rights reserved.</p>
</footer>`;

const restHome = gjsData(`${REST_NAV}
<section style="background:linear-gradient(rgba(26,10,0,.65),rgba(26,10,0,.65)),url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80') center/cover;color:#fff;padding:120px 40px;text-align:center;min-height:500px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
  <p style="font-size:.85rem;letter-spacing:3px;text-transform:uppercase;color:#f59e0b;margin:0 0 16px;">Est. 1987 · Little Italy, New York</p>
  <h1 style="font-size:3.5rem;font-weight:800;font-style:italic;margin:0 0 20px;line-height:1.1;font-family:Georgia,serif;">Where Every Meal<br/>Tells a Story</h1>
  <p style="font-size:1.1rem;max-width:520px;margin:0 auto 36px;line-height:1.7;color:#e7d5b8;">Handcrafted pasta, wood-fired pizzas, and family recipes passed down through three generations.</p>
  <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
    <a href="reservations.html" style="display:inline-block;padding:14px 36px;background:#f59e0b;color:#1a0a00;text-decoration:none;border-radius:8px;font-weight:700;font-size:1rem;">Reserve a Table</a>
    <a href="menu.html" style="display:inline-block;padding:14px 36px;background:transparent;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:1rem;border:2px solid rgba(255,255,255,.5);">View Menu</a>
  </div>
</section>

<section style="padding:80px 40px;background:#fdf8f0;">
  <div style="max-width:1100px;margin:0 auto;text-align:center;">
    <h2 style="font-size:2rem;font-weight:700;color:#1a0a00;margin:0 0 8px;font-family:Georgia,serif;">Tonight's Chef's Picks</h2>
    <p style="color:#92400e;margin:0 0 48px;">Fresh-made daily using the finest seasonal ingredients</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;">
      <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
        <div style="height:200px;background:linear-gradient(135deg,#fef3c7,#fde68a);display:flex;align-items:center;justify-content:center;font-size:4rem;">🍝</div>
        <div style="padding:24px;">
          <p style="font-size:.75rem;color:#f59e0b;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Pasta</p>
          <h3 style="font-size:1.1rem;font-weight:700;color:#1a0a00;margin:0 0 8px;font-family:Georgia,serif;">Tagliatelle al Ragù</h3>
          <p style="color:#78350f;font-size:.875rem;line-height:1.6;margin:0 0 12px;">Hand-rolled egg pasta with a 6-hour slow-cooked Bolognese, finished with aged Parmigiano Reggiano.</p>
          <p style="font-weight:700;color:#1a0a00;font-size:1rem;margin:0;">$24</p>
        </div>
      </div>
      <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
        <div style="height:200px;background:linear-gradient(135deg,#fee2e2,#fecaca);display:flex;align-items:center;justify-content:center;font-size:4rem;">🍕</div>
        <div style="padding:24px;">
          <p style="font-size:.75rem;color:#f59e0b;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Wood-Fired Pizza</p>
          <h3 style="font-size:1.1rem;font-weight:700;color:#1a0a00;margin:0 0 8px;font-family:Georgia,serif;">Pizza Diavola</h3>
          <p style="color:#78350f;font-size:.875rem;line-height:1.6;margin:0 0 12px;">San Marzano tomato, fior di latte, Calabrian chilli, spicy salami, fresh basil. Cooked at 800°F.</p>
          <p style="font-weight:700;color:#1a0a00;font-size:1rem;margin:0;">$21</p>
        </div>
      </div>
      <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
        <div style="height:200px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);display:flex;align-items:center;justify-content:center;font-size:4rem;">🐟</div>
        <div style="padding:24px;">
          <p style="font-size:.75rem;color:#f59e0b;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Secondi</p>
          <h3 style="font-size:1.1rem;font-weight:700;color:#1a0a00;margin:0 0 8px;font-family:Georgia,serif;">Branzino al Forno</h3>
          <p style="color:#78350f;font-size:.875rem;line-height:1.6;margin:0 0 12px;">Whole oven-roasted sea bass, lemon, capers, olives, cherry tomatoes, and fresh herbs.</p>
          <p style="font-weight:700;color:#1a0a00;font-size:1rem;margin:0;">$32</p>
        </div>
      </div>
    </div>
    <a href="menu.html" style="display:inline-block;margin-top:36px;padding:12px 32px;background:#1a0a00;color:#f59e0b;text-decoration:none;border-radius:8px;font-weight:700;">See Full Menu →</a>
  </div>
</section>

<section style="padding:64px 40px;background:#1a0a00;color:#fff;text-align:center;">
  <h2 style="font-size:1.75rem;font-weight:700;margin:0 0 12px;font-family:Georgia,serif;color:#f59e0b;">Join Us for Dinner</h2>
  <p style="color:#e7d5b8;margin:0 0 8px;">Tuesday through Sunday · Seatings from 5:00 PM</p>
  <p style="color:#a16207;margin:0 0 28px;font-size:.9rem;">We recommend reservations, especially on weekends.</p>
  <a href="reservations.html" style="display:inline-block;padding:14px 40px;background:#f59e0b;color:#1a0a00;text-decoration:none;border-radius:8px;font-weight:700;font-size:1rem;">Reserve Your Table</a>
</section>
${REST_FOOTER}`);

const restMenu = gjsData(`${REST_NAV}
<section style="background:#fdf8f0;padding:64px 40px;text-align:center;">
  <h1 style="font-size:2.75rem;font-weight:700;color:#1a0a00;margin:0 0 8px;font-family:Georgia,serif;font-style:italic;">Il Menù</h1>
  <p style="color:#92400e;font-size:1rem;">All pasta made fresh daily · Gluten-free and vegan options available upon request</p>
</section>

<section style="padding:64px 40px;background:#fff;">
  <div style="max-width:800px;margin:0 auto;">
    <h2 style="font-size:1.5rem;font-weight:700;color:#1a0a00;margin:0 0 24px;padding-bottom:12px;border-bottom:2px solid #f59e0b;font-family:Georgia,serif;">Antipasti</h2>
    <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:48px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px dashed #e7d5b8;padding-bottom:12px;">
        <div><p style="font-weight:600;color:#1a0a00;margin:0 0 4px;">Bruschetta al Pomodoro</p><p style="color:#78350f;font-size:.875rem;margin:0;">Grilled sourdough, vine tomatoes, garlic, fresh basil, extra-virgin olive oil</p></div>
        <p style="font-weight:700;color:#1a0a00;margin:0;white-space:nowrap;margin-left:20px;">$11</p>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px dashed #e7d5b8;padding-bottom:12px;">
        <div><p style="font-weight:600;color:#1a0a00;margin:0 0 4px;">Burrata con Prosciutto</p><p style="color:#78350f;font-size:.875rem;margin:0;">Creamy burrata, San Daniele prosciutto, arugula, truffle honey, aged balsamic</p></div>
        <p style="font-weight:700;color:#1a0a00;margin:0;white-space:nowrap;margin-left:20px;">$17</p>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px dashed #e7d5b8;padding-bottom:12px;">
        <div><p style="font-weight:600;color:#1a0a00;margin:0 0 4px;">Carpaccio di Manzo</p><p style="color:#78350f;font-size:.875rem;margin:0;">Thinly sliced beef tenderloin, capers, Parmesan shavings, lemon, rocket</p></div>
        <p style="font-weight:700;color:#1a0a00;margin:0;white-space:nowrap;margin-left:20px;">$19</p>
      </div>
    </div>

    <h2 style="font-size:1.5rem;font-weight:700;color:#1a0a00;margin:0 0 24px;padding-bottom:12px;border-bottom:2px solid #f59e0b;font-family:Georgia,serif;">Pasta</h2>
    <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:48px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px dashed #e7d5b8;padding-bottom:12px;">
        <div><p style="font-weight:600;color:#1a0a00;margin:0 0 4px;">Tagliatelle al Ragù Bolognese</p><p style="color:#78350f;font-size:.875rem;margin:0;">Hand-rolled egg pasta, 6-hour slow-cooked beef &amp; pork ragù, Parmigiano Reggiano DOP</p></div>
        <p style="font-weight:700;color:#1a0a00;margin:0;white-space:nowrap;margin-left:20px;">$24</p>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px dashed #e7d5b8;padding-bottom:12px;">
        <div><p style="font-weight:600;color:#1a0a00;margin:0 0 4px;">Rigatoni all'Amatriciana</p><p style="color:#78350f;font-size:.875rem;margin:0;">Guanciale, San Marzano tomato, Pecorino Romano, red chilli flakes</p></div>
        <p style="font-weight:700;color:#1a0a00;margin:0;white-space:nowrap;margin-left:20px;">$22</p>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px dashed #e7d5b8;padding-bottom:12px;">
        <div><p style="font-weight:600;color:#1a0a00;margin:0 0 4px;">Pappardelle al Cinghiale</p><p style="color:#78350f;font-size:.875rem;margin:0;">Wide egg pasta with wild boar ragù, rosemary, juniper, red wine, Parmigiano</p></div>
        <p style="font-weight:700;color:#1a0a00;margin:0;white-space:nowrap;margin-left:20px;">$27</p>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px dashed #e7d5b8;padding-bottom:12px;">
        <div><p style="font-weight:600;color:#1a0a00;margin:0 0 4px;">Cacio e Pepe (V)</p><p style="color:#78350f;font-size:.875rem;margin:0;">Tonnarelli pasta, Pecorino Romano, Parmigiano Reggiano, black pepper. Simple. Perfect.</p></div>
        <p style="font-weight:700;color:#1a0a00;margin:0;white-space:nowrap;margin-left:20px;">$20</p>
      </div>
    </div>

    <h2 style="font-size:1.5rem;font-weight:700;color:#1a0a00;margin:0 0 24px;padding-bottom:12px;border-bottom:2px solid #f59e0b;font-family:Georgia,serif;">Dolci</h2>
    <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px dashed #e7d5b8;padding-bottom:12px;">
        <div><p style="font-weight:600;color:#1a0a00;margin:0 0 4px;">Tiramisù della Nonna</p><p style="color:#78350f;font-size:.875rem;margin:0;">Our grandmother's recipe: savoiardi, espresso, mascarpone cream, dark cocoa. Served in a jar.</p></div>
        <p style="font-weight:700;color:#1a0a00;margin:0;white-space:nowrap;margin-left:20px;">$11</p>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px dashed #e7d5b8;padding-bottom:12px;">
        <div><p style="font-weight:600;color:#1a0a00;margin:0 0 4px;">Panna Cotta ai Frutti di Bosco (V)</p><p style="color:#78350f;font-size:.875rem;margin:0;">Vanilla panna cotta with a warm wild berry compote and fresh mint</p></div>
        <p style="font-weight:700;color:#1a0a00;margin:0;white-space:nowrap;margin-left:20px;">$10</p>
      </div>
    </div>
  </div>
</section>
${REST_FOOTER}`);

const restReservations = gjsData(`${REST_NAV}
<section style="padding:80px 40px;background:#fdf8f0;">
  <div style="max-width:640px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <h1 style="font-size:2.5rem;font-weight:700;color:#1a0a00;margin:0 0 12px;font-family:Georgia,serif;font-style:italic;">Reserve a Table</h1>
      <p style="color:#78350f;line-height:1.7;">We look forward to welcoming you. For parties of 8 or more, please call us directly at (212) 555-9876.</p>
    </div>
    <form data-api-form="true" data-api-url="/api/reservations" data-api-method="POST" data-success-message="Grazie! Your reservation request has been received. We'll send a confirmation to your email shortly." style="background:#fff;border-radius:20px;padding:48px;box-shadow:0 8px 40px rgba(0,0,0,.1);border-top:4px solid #f59e0b;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div>
          <label style="display:block;font-size:.8rem;font-weight:700;color:#1a0a00;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">First Name *</label>
          <input type="text" name="firstName" required placeholder="Maria" style="width:100%;padding:10px 14px;border:1px solid #e7d5b8;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
        </div>
        <div>
          <label style="display:block;font-size:.8rem;font-weight:700;color:#1a0a00;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Last Name *</label>
          <input type="text" name="lastName" required placeholder="Rossi" style="width:100%;padding:10px 14px;border:1px solid #e7d5b8;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
        </div>
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block;font-size:.8rem;font-weight:700;color:#1a0a00;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Email *</label>
        <input type="email" name="email" required placeholder="maria@example.com" style="width:100%;padding:10px 14px;border:1px solid #e7d5b8;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block;font-size:.8rem;font-weight:700;color:#1a0a00;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Phone</label>
        <input type="tel" name="phone" placeholder="(212) 000-0000" style="width:100%;padding:10px 14px;border:1px solid #e7d5b8;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px;">
        <div>
          <label style="display:block;font-size:.8rem;font-weight:700;color:#1a0a00;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Date *</label>
          <input type="date" name="date" required style="width:100%;padding:10px 14px;border:1px solid #e7d5b8;border-radius:8px;box-sizing:border-box;font-size:.9rem;" />
        </div>
        <div>
          <label style="display:block;font-size:.8rem;font-weight:700;color:#1a0a00;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Time *</label>
          <select name="time" required style="width:100%;padding:10px 14px;border:1px solid #e7d5b8;border-radius:8px;box-sizing:border-box;font-size:.9rem;background:#fff;appearance:none;">
            <option value="">—</option>
            <option value="17:00">5:00 PM</option>
            <option value="17:30">5:30 PM</option>
            <option value="18:00">6:00 PM</option>
            <option value="18:30">6:30 PM</option>
            <option value="19:00">7:00 PM</option>
            <option value="19:30">7:30 PM</option>
            <option value="20:00">8:00 PM</option>
            <option value="20:30">8:30 PM</option>
            <option value="21:00">9:00 PM</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:.8rem;font-weight:700;color:#1a0a00;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Guests *</label>
          <select name="guests" required style="width:100%;padding:10px 14px;border:1px solid #e7d5b8;border-radius:8px;box-sizing:border-box;font-size:.9rem;background:#fff;appearance:none;">
            <option value="1">1</option>
            <option value="2" selected>2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom:28px;">
        <label style="display:block;font-size:.8rem;font-weight:700;color:#1a0a00;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Special Requests</label>
        <textarea name="requests" rows="3" placeholder="Dietary requirements, occasion details, seating preferences…" style="width:100%;padding:10px 14px;border:1px solid #e7d5b8;border-radius:8px;box-sizing:border-box;font-size:.9rem;resize:vertical;"></textarea>
      </div>
      <button type="submit" style="width:100%;padding:14px;background:#f59e0b;color:#1a0a00;border:none;border-radius:10px;font-weight:800;font-size:1rem;cursor:pointer;letter-spacing:.5px;">Confirm Reservation</button>
    </form>
  </div>
</section>
${REST_FOOTER}`);

const restAbout = gjsData(`${REST_NAV}
<section style="background:#1a0a00;color:#fff;padding:88px 40px;text-align:center;">
  <p style="font-size:.85rem;letter-spacing:3px;text-transform:uppercase;color:#f59e0b;margin:0 0 16px;">Est. 1987 · Three Generations</p>
  <h1 style="font-size:3rem;font-weight:700;margin:0 0 20px;font-family:Georgia,serif;font-style:italic;">Our Story</h1>
  <p style="font-size:1.05rem;color:#e7d5b8;max-width:580px;margin:0 auto;line-height:1.8;">La Bella Cucina began as a tiny osteria on Mulberry Street, where Nonna Giovanna cooked the dishes she learned growing up in Bologna. Today, her grandchildren carry on those recipes with the same love.</p>
</section>

<section style="padding:80px 40px;background:#fdf8f0;">
  <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;">
    <div>
      <h2 style="font-size:1.75rem;font-weight:700;color:#1a0a00;margin:0 0 20px;font-family:Georgia,serif;">A Family Legacy</h2>
      <p style="color:#78350f;line-height:1.8;margin:0 0 20px;">When Carlo and Giovanna Mancini immigrated to New York in 1985, they brought with them nothing more than a suitcase, a dog-eared recipe book, and an unshakeable belief that food is love made edible.</p>
      <p style="color:#78350f;line-height:1.8;margin:0 0 20px;">La Bella Cucina opened its doors in 1987. The original dining room sat just 28 guests. Within two years there was a line out the door every Friday night. Today the restaurant seats 90, but the kitchen still uses Giovanna's original ragù recipe — cooked low and slow for six hours, exactly as she taught.</p>
      <p style="color:#78350f;line-height:1.8;margin:0;">Now in its third generation, siblings Marco and Lucia Mancini oversee the kitchen and front-of-house respectively, ensuring every guest feels like a member of the family.</p>
    </div>
    <div>
      <div style="background:#fff;border-radius:20px;padding:32px;box-shadow:0 8px 32px rgba(0,0,0,.1);">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
          <div style="text-align:center;padding:20px;background:#fdf8f0;border-radius:12px;">
            <p style="font-size:2rem;font-weight:800;color:#f59e0b;margin:0 0 4px;">1987</p>
            <p style="font-size:.8rem;color:#78350f;margin:0;">Year Founded</p>
          </div>
          <div style="text-align:center;padding:20px;background:#fdf8f0;border-radius:12px;">
            <p style="font-size:2rem;font-weight:800;color:#f59e0b;margin:0 0 4px;">3rd</p>
            <p style="font-size:.8rem;color:#78350f;margin:0;">Generation</p>
          </div>
          <div style="text-align:center;padding:20px;background:#fdf8f0;border-radius:12px;">
            <p style="font-size:2rem;font-weight:800;color:#f59e0b;margin:0 0 4px;">38+</p>
            <p style="font-size:.8rem;color:#78350f;margin:0;">Staff Members</p>
          </div>
          <div style="text-align:center;padding:20px;background:#fdf8f0;border-radius:12px;">
            <p style="font-size:2rem;font-weight:800;color:#f59e0b;margin:0 0 4px;">★4.9</p>
            <p style="font-size:.8rem;color:#78350f;margin:0;">Avg Rating</p>
          </div>
        </div>
        <div style="background:#1a0a00;border-radius:12px;padding:20px;text-align:center;">
          <p style="color:#f59e0b;font-style:italic;font-family:Georgia,serif;font-size:1.05rem;margin:0 0 8px;">"La pasta perfetta non ha bisogno di spiegazioni."</p>
          <p style="color:#a16207;font-size:.8rem;margin:0;">— Nonna Giovanna Mancini</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section style="padding:64px 40px;background:#fff;text-align:center;">
  <h2 style="font-size:1.75rem;font-weight:700;color:#1a0a00;margin:0 0 40px;font-family:Georgia,serif;">Awards &amp; Recognition</h2>
  <div style="display:flex;justify-content:center;gap:40px;flex-wrap:wrap;">
    <div style="text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:8px;">🏆</div>
      <p style="font-weight:700;color:#1a0a00;margin:0 0 4px;font-size:.9rem;">NY Magazine</p>
      <p style="color:#78350f;font-size:.8rem;margin:0;">Best Italian Restaurant 2024</p>
    </div>
    <div style="text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:8px;">⭐</div>
      <p style="font-weight:700;color:#1a0a00;margin:0 0 4px;font-size:.9rem;">Michelin Guide</p>
      <p style="color:#78350f;font-size:.8rem;margin:0;">Bib Gourmand 2022–2025</p>
    </div>
    <div style="text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:8px;">🍽️</div>
      <p style="font-weight:700;color:#1a0a00;margin:0 0 4px;font-size:.9rem;">Zagat</p>
      <p style="color:#78350f;font-size:.8rem;margin:0;">Top 10 Italian NYC 2023</p>
    </div>
    <div style="text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:8px;">📰</div>
      <p style="font-weight:700;color:#1a0a00;margin:0 0 4px;font-size:.9rem;">NY Times</p>
      <p style="color:#78350f;font-size:.8rem;margin:0;">"A City Treasure" · 3 Stars</p>
    </div>
  </div>
</section>
${REST_FOOTER}`);

const restContact = gjsData(`${REST_NAV}
<section style="padding:80px 40px;background:#fdf8f0;">
  <div style="max-width:900px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:56px;">
      <h1 style="font-size:2.5rem;font-weight:700;color:#1a0a00;margin:0 0 12px;font-family:Georgia,serif;font-style:italic;">Find Us</h1>
      <p style="color:#78350f;line-height:1.7;max-width:480px;margin:0 auto;">We're in the heart of Little Italy. Come hungry — the neighbourhood smells of ragù from three blocks away.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;">
      <div>
        <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,.08);margin-bottom:24px;">
          <h2 style="font-size:1.1rem;font-weight:700;color:#1a0a00;margin:0 0 20px;padding-bottom:12px;border-bottom:2px solid #f59e0b;">Hours</h2>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:.9rem;">
            <div style="display:flex;justify-content:space-between;color:#78350f;"><span style="font-weight:600;color:#1a0a00;">Tuesday – Thursday</span><span>5:00 PM – 9:30 PM</span></div>
            <div style="display:flex;justify-content:space-between;color:#78350f;"><span style="font-weight:600;color:#1a0a00;">Friday – Saturday</span><span>5:00 PM – 10:30 PM</span></div>
            <div style="display:flex;justify-content:space-between;color:#78350f;"><span style="font-weight:600;color:#1a0a00;">Sunday</span><span>4:00 PM – 9:00 PM</span></div>
            <div style="display:flex;justify-content:space-between;color:#a16207;"><span style="font-weight:600;">Monday</span><span>Closed</span></div>
          </div>
        </div>
        <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,.08);">
          <h2 style="font-size:1.1rem;font-weight:700;color:#1a0a00;margin:0 0 20px;padding-bottom:12px;border-bottom:2px solid #f59e0b;">Contact</h2>
          <div style="display:flex;flex-direction:column;gap:14px;font-size:.9rem;color:#78350f;">
            <div style="display:flex;gap:12px;align-items:flex-start;"><span>📍</span><div><p style="font-weight:600;color:#1a0a00;margin:0 0 2px;">Address</p><p style="margin:0;">456 Olive Garden Lane<br/>Little Italy, New York, NY 10013</p></div></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span>📞</span><div><p style="font-weight:600;color:#1a0a00;margin:0 0 2px;">Phone</p><p style="margin:0;">(212) 555-9876</p></div></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span>📧</span><div><p style="font-weight:600;color:#1a0a00;margin:0 0 2px;">Email</p><p style="margin:0;">info@labellacucina.com</p></div></div>
          </div>
        </div>
      </div>
      <div>
        <div style="background:#1a0a00;border-radius:16px;height:240px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;">
          <div style="text-align:center;color:#a16207;">
            <div style="font-size:3rem;margin-bottom:8px;">🗺️</div>
            <p style="font-size:.9rem;margin:0;">Map placeholder</p>
            <p style="font-size:.8rem;color:#78350f;margin:4px 0 0;">456 Olive Garden Ln, Little Italy, NY</p>
          </div>
        </div>
        <div style="background:#fff;border-radius:16px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,.08);">
          <h3 style="font-size:1rem;font-weight:700;color:#1a0a00;margin:0 0 12px;">Getting Here</h3>
          <div style="display:flex;flex-direction:column;gap:10px;font-size:.875rem;color:#78350f;">
            <div style="display:flex;gap:8px;"><span>🚇</span><p style="margin:0;"><strong style="color:#1a0a00;">Subway:</strong> J/Z to Canal St (5 min walk) or 6 to Spring St (8 min walk)</p></div>
            <div style="display:flex;gap:8px;"><span>🚌</span><p style="margin:0;"><strong style="color:#1a0a00;">Bus:</strong> M103, M22 on Canal Street</p></div>
            <div style="display:flex;gap:8px;"><span>🚗</span><p style="margin:0;"><strong style="color:#1a0a00;">Parking:</strong> Canal Street garage (3 min walk) or street parking after 6 PM</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
${REST_FOOTER}`);

// ─── Shared default AzureConfig for examples ─────────────────────────────────

const GENERIC_CONFIG = {
  deploymentEnvironment: 'generic' as const,
  tenantId: '',
  clientId: '',
  subscriptionId: '',
  resourceGroup: '',
  region: 'eastus',
  cloud: 'commercial' as const,
  redirectUri: '',
  postLogoutRedirectUri: '',
  scopes: [],
};

// ─── Timestamp helper (fixed so examples always look new) ─────────────────────

function ts(offset = 0): string {
  return new Date(Date.now() - offset).toISOString();
}

function pageId(seed: string): string {
  return `example-${seed}`;
}

// ─── Exported example sites ───────────────────────────────────────────────────

export interface ExampleSite {
  /** Short identifier used as the base for stable IDs */
  key: string;
  /** Industry / category label displayed in the UI */
  industry: string;
  /** Emoji icon for the industry */
  icon: string;
  /** Short paragraph describing the example */
  description: string;
  /** The ready-to-import Site object */
  site: Site;
}

export const EXAMPLE_SITES: ExampleSite[] = [
  {
    key: 'corporate',
    industry: 'Business & Corporate',
    icon: '🏢',
    description:
      'A professional corporate website with a bold hero, services overview, team bio, company blog, and a contact form ready for API integration.',
    site: {
      id: 'example-corp-001',
      name: 'Contoso Corp',
      description: 'Corporate website example — technology services company',
      azureConfig: GENERIC_CONFIG,
      pages: [
        { id: pageId('corp-home'), name: 'Home', gjsData: corpHome, createdAt: ts(5000), updatedAt: ts(1000) },
        { id: pageId('corp-about'), name: 'About', gjsData: corpAbout, createdAt: ts(4000), updatedAt: ts(900) },
        { id: pageId('corp-services'), name: 'Services', gjsData: corpServices, createdAt: ts(3000), updatedAt: ts(800) },
        { id: pageId('corp-blog'), name: 'Blog', gjsData: corpBlog, createdAt: ts(2000), updatedAt: ts(700) },
        { id: pageId('corp-contact'), name: 'Contact', gjsData: corpContact, createdAt: ts(1000), updatedAt: ts(600) },
      ],
      createdAt: ts(5000),
      updatedAt: ts(600),
    },
  },
  {
    key: 'healthcare',
    industry: 'Healthcare & Medical',
    icon: '🏥',
    description:
      'A patient-friendly medical group website with service specialties, an online appointment booking form, and a patient resources FAQ page.',
    site: {
      id: 'example-med-001',
      name: 'ClearWell Medical',
      description: 'Healthcare website example — medical group clinic',
      azureConfig: GENERIC_CONFIG,
      pages: [
        { id: pageId('med-home'), name: 'Home', gjsData: medHome, createdAt: ts(4000), updatedAt: ts(1000) },
        { id: pageId('med-specialties'), name: 'Specialties', gjsData: medSpecialties, createdAt: ts(3000), updatedAt: ts(900) },
        { id: pageId('med-appointments'), name: 'Appointments', gjsData: medAppointments, createdAt: ts(2000), updatedAt: ts(800) },
        { id: pageId('med-resources'), name: 'Patient Resources', gjsData: medResources, createdAt: ts(1000), updatedAt: ts(700) },
      ],
      createdAt: ts(4000),
      updatedAt: ts(700),
    },
  },
  {
    key: 'restaurant',
    industry: 'Restaurant & Hospitality',
    icon: '🍝',
    description:
      'An atmospheric restaurant website with a story-driven homepage, a full à la carte menu, an online table reservation form, and location details.',
    site: {
      id: 'example-rest-001',
      name: 'La Bella Cucina',
      description: 'Restaurant website example — Italian fine dining',
      azureConfig: GENERIC_CONFIG,
      pages: [
        { id: pageId('rest-home'), name: 'Home', gjsData: restHome, createdAt: ts(5000), updatedAt: ts(1000) },
        { id: pageId('rest-menu'), name: 'Menu', gjsData: restMenu, createdAt: ts(4000), updatedAt: ts(900) },
        { id: pageId('rest-reservations'), name: 'Reservations', gjsData: restReservations, createdAt: ts(3000), updatedAt: ts(800) },
        { id: pageId('rest-about'), name: 'Our Story', gjsData: restAbout, createdAt: ts(2000), updatedAt: ts(700) },
        { id: pageId('rest-contact'), name: 'Find Us', gjsData: restContact, createdAt: ts(1000), updatedAt: ts(600) },
      ],
      createdAt: ts(5000),
      updatedAt: ts(600),
    },
  },
];
