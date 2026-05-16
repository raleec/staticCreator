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
- **Multiple Field Types**: Text, email, number, textarea, dropdown, checkbox, radio buttons, and file uploads
- **Field Configuration**: Customize labels, placeholders, required status, and options
- **Validation Rules**: Add custom validation (min/max length, patterns, etc.) with error messages
- **Conditional Logic**: Show/hide fields based on other field values
- **Multi-Page Forms**: Break long forms into multiple pages with navigation
- **Form Templates**: Pre-built templates for common use cases (contact, survey, registration, job application)
- **Custom Styling**: Theme customization with colors and spacing options
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
- **File Upload**: Allow users to upload files with configurable file type and size limits

#### Using Templates

1. Click the "Templates" button in the top bar
2. Choose from pre-built templates:
   - **Contact Form**: Simple contact form with name, email, subject, and message
   - **Survey Form**: Customer feedback survey with multiple pages
   - **Registration Form**: User registration with personal details
   - **Job Application**: Job application form with file uploads
3. The template will replace your current form (save first if needed!)

#### Multi-Page Forms

1. Click "+ Add Page" in the top bar to create a new page
2. Assign fields to different pages using the "Page" field in settings
3. Navigate between pages using the arrow buttons
4. Users will see page numbers and navigation when filling out the form

#### Configuring Fields

1. Click on any field in the preview to select it
2. The right panel will show field settings:
   - **Label**: The field name shown to users
   - **Placeholder**: Hint text inside the field (for text inputs)
   - **Required**: Mark the field as mandatory
   - **Page**: Assign the field to a specific page
   - **Options**: For dropdown and radio buttons, configure available choices
   - **Accepted File Types**: For file uploads, specify allowed extensions (e.g., .pdf,.doc)
   - **Max File Size**: For file uploads, set maximum size in MB

#### Adding Validation Rules

For text, number, and textarea fields:
1. Click "+ Add Validation Rule" in the field settings
2. Choose validation type:
   - **Min Length**: Minimum number of characters
   - **Max Length**: Maximum number of characters
   - **Min Value**: Minimum numeric value
   - **Max Value**: Maximum numeric value
   - **Pattern**: Regular expression pattern
3. Enter the value and optional custom error message
4. Add multiple validation rules if needed

#### Setting Up Conditional Logic

Make fields appear/disappear based on other field values:
1. Click "+ Add Condition" in the field settings
2. Select which field to depend on
3. Choose an operator (equals, not equals, contains, greater than, less than)
4. Enter the comparison value
5. The field will only show when all conditions are met

#### Customizing Theme

At the bottom of the right panel:
1. **Primary Color**: Change the accent color used for buttons and highlights
2. **Background Color**: Set the form background color
3. **Spacing**: Choose between Compact, Normal, or Relaxed spacing
4. Changes apply immediately to the preview

### Form Data Storage

Forms are stored as JSON data within the page builder state. The JSON structure now includes:

```json
{
  "fields": [
    {
      "id": "1",
      "type": "text",
      "label": "Name",
      "placeholder": "Enter your name",
      "required": true,
      "page": 1,
      "validation": [
        {
          "type": "minLength",
          "value": 3,
          "message": "Name must be at least 3 characters"
        }
      ]
    },
    {
      "id": "2",
      "type": "email",
      "label": "Email Address",
      "placeholder": "your@email.com",
      "required": true,
      "page": 1
    },
    {
      "id": "3",
      "type": "file",
      "label": "Resume",
      "required": true,
      "accept": ".pdf,.doc,.docx",
      "maxFileSize": 5,
      "page": 2,
      "conditionalRules": [
        {
          "fieldId": "1",
          "operator": "notEquals",
          "value": ""
        }
      ]
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
- **File Uploads**: For documents, images, or other files (configure file types and size limits)

### Validation Best Practices

- Add validation to ensure data quality
- Use clear, helpful error messages
- Combine multiple validation rules when needed (e.g., min and max length)
- Use pattern validation for complex formats (phone numbers, postal codes)

### Multi-Page Form Tips

- Group related fields on the same page
- Keep pages short (5-7 fields maximum)
- Use logical flow (personal info → details → confirmation)
- Show progress indicators so users know how far they've progressed

### Conditional Logic Tips

- Use to reduce form complexity
- Hide irrelevant questions based on previous answers
- Keep conditions simple and clear
- Test all condition paths to ensure they work correctly

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

## Features Implemented

All the features from the "Future Enhancements" section have been implemented:

- ✅ **Validation Rules**: Add custom validation for fields (min/max length, patterns, etc.)
- ✅ **Conditional Logic**: Show/hide fields based on other field values
- ✅ **File Uploads**: Support for file upload fields with type and size restrictions
- ✅ **Multi-Page Forms**: Break long forms into multiple pages with navigation
- ✅ **Templates**: Pre-built form templates for common use cases
- ✅ **Custom Styling**: Theme customization with colors and spacing options

### Additional Improvements

- Enhanced field settings panel with organized sections
- Visual indicators for fields with validation or conditional logic
- Real-time theme preview
- Template selector with descriptions
- Page management with navigation controls
- Progress indicator for multi-page forms

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
