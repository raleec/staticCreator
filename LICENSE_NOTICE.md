# Third-Party License Notice

## Page Builder

This project uses GrapesJS for the visual page builder with custom form and table blocks.

### License Information

**GrapesJS** (BSD-3-Clause License)
- https://grapesjs.com/
- Visual page builder library
- Free for commercial use

**GrapesJS Plugins Used:**
- grapesjs-blocks-basic (BSD-3-Clause License)
- grapesjs-preset-webpage (BSD-3-Clause License)

### Custom Form and Table Blocks

StaticCreator extends GrapesJS with custom form and table blocks defined in `/src/utils/formBlocks.ts`. These custom blocks are part of the StaticCreator codebase and are available under the same MIT license as the project.

### Form Blocks (Forms Category)

- **API Form** — Complete form with REST API submission
- **Text Input** — Single-line text field
- **Email Input** — Email field with validation
- **Number Input** — Numeric input
- **Phone Input** — Telephone field
- **Date Input** — Date picker
- **Dropdown** — Select dropdown
- **Text Area** — Multi-line text field
- **Checkbox** — Checkbox input
- **Radio Group** — Radio button group
- **File Upload** — File upload field
- **Hidden Field** — Hidden input for metadata

### Table Blocks (Tables Category)

- **Basic Table** — Simple data table
- **Striped Table** — Table with alternating row colors
- **Responsive Table** — Horizontally scrollable table

### Implementation

The page builder is implemented with:
- **GrapesJS** (BSD-3-Clause License) — Core page builder
- **React** (MIT License) — UI framework
- **Fluent UI** (MIT License) — Microsoft design system
- **Lucide React** (ISC License) — Icon library

All dependencies are fully open-source and free for commercial use.

### Previously Used Libraries

**Note**: Earlier documentation referenced Craft.js and SurveyJS, but these libraries were never actually used in production. The page builder has always been powered by GrapesJS with custom form blocks.

---

## Disclaimer

This notice is provided for informational purposes. Always verify license terms directly with the software vendor before use in production environments.
