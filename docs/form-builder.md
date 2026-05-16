# Form Builder Integration

## Overview

The Form Builder is a custom-built, drag-and-drop form creation component integrated into the staticCreator page builder. It allows users to visually design forms by adding fields, configuring their properties, and previewing the result in real-time.

**License**: Fully open-source (MIT) - No commercial license required for production use.

## Why a Custom Form Builder?

### Key Advantages

- **✅ Perfect for Static Web Apps**: Fully client-side with no backend dependencies
- **✅ Native React Integration**: Built specifically for React applications
- **✅ MIT License**: Open source and free to use in production
- **✅ No License Fees**: Unlike commercial alternatives, this is completely free
- **✅ Craft.js Compatible**: Seamlessly integrates as a Craft.js component
- **✅ No Server Required**: All form building happens in the browser
- **✅ Lightweight**: Minimal dependencies, fast loading

### Features

- **Visual Form Designer**: Drag-and-drop interface for building forms
- **Multiple Field Types**: Text, email, number, textarea, dropdown, checkbox, and radio buttons
- **Field Configuration**: Customize labels, placeholders, required status, and options
- **Visual Preview**: Real-time preview of the form as you build
- **Field Reordering**: Move fields up and down with simple controls
- **Responsive Design**: Forms work on desktop, tablet, and mobile

## How to Use

### Adding a Form to Your Page

1. Open the Page Builder for your site
2. Click on "Form Builder" in the Blocks panel on the left
3. The form builder will appear on the canvas with a default field

### Building Your Form

#### Adding Fields

In the right panel, click on any field type to add it to your form:
- **Text Input**: Single-line text entry
- **Email**: Email address input with validation
- **Number**: Numeric input field
- **Text Area**: Multi-line text entry
- **Dropdown**: Select from a list of options
- **Checkbox**: Single yes/no option
- **Radio Buttons**: Choose one from multiple options

#### Configuring Fields

1. Click on any field in the preview to select it
2. The right panel will show field settings:
   - **Label**: The field name shown to users
   - **Placeholder**: Hint text inside the field (for text inputs)
   - **Required**: Mark the field as mandatory
   - **Options**: For dropdown and radio buttons, configure available choices

#### Reordering Fields

- Use the **↑** and **↓** buttons on each field to move it up or down
- Fields can also be deleted using the trash icon

### Form Data Storage

Forms are stored as JSON data within the page builder state. The JSON structure includes:

```json
{
  "fields": [
    {
      "id": "1",
      "type": "text",
      "label": "Name",
      "placeholder": "Enter your name",
      "required": true
    },
    {
      "type": "email",
      "label": "Email Address",
      "placeholder": "your@email.com",
      "required": true
    }
  ]
}
```

## Technical Details

### Implementation

The Form Builder is implemented as a Craft.js component that provides a split-pane interface:

```typescript
// File: src/components/Builder/craftjs/FormBuilder.tsx
export const FormBuilder = ({ initialJson, height }: FormBuilderProps) => {
  // Component manages form fields state
  // Left pane: Form preview with field rendering
  // Right pane: Field type selector and settings panel
  // Integrates with Craft.js using useNode hook
}
```

### Dependencies

The Form Builder uses minimal dependencies:
- `@craftjs/core`: For drag-and-drop integration
- `lucide-react`: For UI icons (MIT License)
- `react`: Core React library

No commercial or proprietary libraries are required.

### Styling

The Form Builder uses inline styles for simplicity and portability. It features:
- Clean, modern interface
- Responsive design
- Color-coded selected/unselected states
- Intuitive controls

## Integration with Static Web Apps

The Form Builder is designed for static web applications:

1. **No Backend Required**: All form building happens client-side
2. **JSON Export**: Forms are saved as JSON for easy storage
3. **Portable**: The form structure can be exported and used elsewhere
4. **Flexible**: Can be integrated with any form handling service

### Form Submission

The Form Builder creates the form structure, but you'll need to handle submissions separately. Options include:

- **Static Form Services**: Formspree, FormSubmit, or Basin
- **Serverless Functions**: Azure Functions, AWS Lambda, or Netlify Functions
- **Email Services**: SendGrid, Mailgun, or similar
- **Custom API**: Your own backend service

## Best Practices

### Form Design

1. **Keep it Simple**: Only ask for information you need
2. **Clear Labels**: Use descriptive field labels
3. **Helpful Placeholders**: Provide examples in placeholder text
4. **Mark Required Fields**: Use the required checkbox for mandatory fields
5. **Logical Order**: Arrange fields in a natural flow

### Field Configuration

- **Text Fields**: Use for short, single-line entries (name, city, etc.)
- **Email Fields**: Always use for email addresses to get proper validation
- **Text Areas**: Use for longer responses (comments, descriptions)
- **Dropdowns**: Good for 4+ options; use radio buttons for 2-3 options
- **Checkboxes**: For optional yes/no questions
- **Radio Buttons**: For mandatory choice between options

### Performance

- The Form Builder is lightweight and fast
- No external API calls or network dependencies
- Renders efficiently even with many fields

## Troubleshooting

### Form Not Appearing

If the Form Builder doesn't appear:
1. Check that the component is properly registered in PageBuilder resolver
2. Verify that all dependencies are installed
3. Check browser console for errors

### Fields Not Saving

Forms are saved as part of the page builder state. Make sure to:
1. Save the page after making changes
2. Check that the initial JSON is properly formatted

### Styling Issues

The Form Builder uses inline styles, but you can:
1. Wrap fields in custom containers with your styles
2. Override styles through CSS if needed
3. Customize the component directly in FormBuilder.tsx

## Future Enhancements

Potential improvements for future versions:

- **Validation Rules**: Add custom validation for fields
- **Conditional Logic**: Show/hide fields based on other answers
- **File Uploads**: Support for file upload fields
- **Multi-Page Forms**: Break long forms into multiple pages
- **Templates**: Pre-built form templates for common use cases
- **Export Options**: Export forms as HTML/CSS for use outside the builder
- **Custom Styling**: Theme customization options

## Comparison to Previous Version

This form builder replaces the previous SurveyJS Creator implementation:

| Feature | SurveyJS Creator | Custom Form Builder |
|---------|-----------------|---------------------|
| License | Commercial | MIT (Free) |
| Production Use | Requires purchase | Free |
| Dependencies | Heavy (3+ packages) | Minimal (icons only) |
| Complexity | Advanced features | Simple & focused |
| Customization | Limited | Full control |
| File Size | Large | Small |

## Resources

- [Craft.js Documentation](https://craft.js.org/)
- [Lucide React Icons](https://lucide.dev/)
- [React Documentation](https://react.dev/)

## License

This Form Builder component is open source and available under the MIT License. It can be freely used in commercial and production environments without any licensing fees.
