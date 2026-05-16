# Form Builder Integration

## Overview

The staticCreator page builder now includes a powerful drag-and-drop **Form Builder** component powered by [SurveyJS](https://surveyjs.io/). This integration allows users to create sophisticated forms, surveys, and questionnaires without writing code.

## Why SurveyJS?

After evaluating multiple options (SurveyJS, FormEngine, Form.io, OpnForm, HeyForm), we selected **SurveyJS** for the following reasons:

### Key Advantages

- **✅ Perfect for Static Web Apps**: Fully client-side with no backend dependencies
- **✅ Native React Integration**: Built specifically for React applications
- **✅ MIT License**: Open source and free to use
- **✅ Modern UI**: Intuitive drag-and-drop interface
- **✅ Craft.js Compatible**: Seamlessly integrates as a Craft.js component
- **✅ No Server Required**: All form building happens in the browser

### Features

- **Visual Form Designer**: Drag-and-drop interface for building forms
- **Rich Question Types**: Text, dropdown, checkbox, radio, matrix, rating, and more
- **Conditional Logic**: Show/hide questions based on previous answers
- **JSON Export**: Forms are saved as JSON for easy storage and portability
- **Responsive Design**: Forms work on desktop, tablet, and mobile
- **Customizable**: Full control over styling and behavior

## How to Use

### Adding a Form to Your Page

1. **Create or Edit a Page**: Navigate to the page builder
2. **Open the Blocks Panel**: Find the "Form Builder" option in the left sidebar
3. **Drag and Drop**: Drag the "Form Builder" block onto your canvas
4. **Build Your Form**: The SurveyJS Creator interface will appear

### Building Your Form

The Form Builder provides three main tabs:

1. **Designer**: Visual drag-and-drop interface
   - Add questions from the toolbox
   - Configure question properties
   - Arrange questions on pages
   - Set up conditional logic

2. **Logic**: Define branching and skip logic
   - Show/hide questions based on answers
   - Calculate values
   - Run custom expressions

3. **JSON Editor**: Direct access to the form definition
   - View and edit raw JSON
   - Import existing forms
   - Advanced customization

### Question Types

The Form Builder supports various question types:

- **Single Input**: Text, email, number, date
- **Single Choice**: Radio buttons, dropdown
- **Multiple Choice**: Checkboxes, tag box
- **Text**: Comment box, long text
- **Rating**: Stars, smileys, numeric rating
- **Matrix**: Grid questions
- **Image Picker**: Visual selection
- **File Upload**: Attach files
- **Signature**: Capture signatures
- **Boolean**: Yes/No, True/False

### Saving Forms

Forms are automatically saved as part of your page design. The form definition is stored as JSON within the Craft.js page state.

## Technical Details

### Implementation

The Form Builder is implemented as a Craft.js component that wraps the SurveyJS Creator:

```typescript
// File: src/components/Builder/craftjs/FormBuilder.tsx
export const FormBuilder = ({ initialJson, height }: FormBuilderProps) => {
  // Component creates a SurveyCreator instance
  // Integrates with Craft.js using useNode hook
  // Renders SurveyCreatorComponent
}
```

### Dependencies

The following packages are required:

- `survey-core`: Core SurveyJS library
- `survey-creator-core`: Form builder core
- `survey-creator-react`: React bindings for the creator

### Configuration

The Form Builder is configured with:

- **showLogicTab**: `true` - Enable conditional logic
- **showTranslationTab**: `false` - Disable translations (can be enabled if needed)
- **showJSONEditorTab**: `true` - Allow JSON editing
- **isAutoSave**: `true` - Automatically save changes

### Styling

The Form Builder uses SurveyJS's default styling with custom CSS imports:

```typescript
import 'survey-core/survey-core.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
```

The component can be customized to match your theme.

## Integration with Static Web Apps

### Form Rendering

To render the forms created in the Form Builder on your static pages:

1. **Export the JSON**: The form definition is stored as JSON
2. **Add to Page**: Include the SurveyJS runtime library
3. **Initialize Survey**: Create a survey instance with the JSON
4. **Handle Submission**: Process form submissions via API or serverless functions

### Example Form Rendering

```html
<!-- Include SurveyJS runtime -->
<script src="https://unpkg.com/survey-core"></script>
<link href="https://unpkg.com/survey-core/survey-core.min.css" rel="stylesheet">

<!-- Survey container -->
<div id="surveyContainer"></div>

<script>
  // Your form JSON
  const surveyJSON = { /* form definition */ };
  
  // Create survey
  const survey = new Survey.Model(surveyJSON);
  
  // Handle completion
  survey.onComplete.add((sender) => {
    const results = sender.data;
    // Send to API, log, or process
    console.log(results);
  });
  
  // Render
  survey.render("surveyContainer");
</script>
```

### Serverless Form Submission

For Static Web Apps on Azure, you can use Azure Functions to handle form submissions:

```typescript
// Example Azure Function
export async function handler(context, req) {
  const formData = req.body;
  
  // Store in database, send email, etc.
  await storeFormData(formData);
  
  return {
    status: 200,
    body: JSON.stringify({ success: true })
  };
}
```

## Best Practices

### Form Design

- **Keep It Simple**: Fewer questions = higher completion rates
- **Logical Flow**: Group related questions together
- **Clear Labels**: Use descriptive question titles
- **Required Fields**: Mark essential questions as required
- **Progress Indication**: Use multiple pages for long forms

### Performance

- **Optimize Size**: Remove unused question types to reduce bundle size
- **Lazy Loading**: Consider code-splitting for the Form Builder
- **Caching**: Cache form definitions for faster loading

### Accessibility

- **Keyboard Navigation**: All form elements are keyboard accessible
- **Screen Readers**: Questions include proper ARIA labels
- **Color Contrast**: Ensure sufficient contrast for readability

## Troubleshooting

### Build Issues

If you encounter build errors:

1. **Check Dependencies**: Ensure all SurveyJS packages are installed
   ```bash
   npm install survey-core survey-creator-core survey-creator-react
   ```

2. **Clear Cache**: Clear Vite cache and rebuild
   ```bash
   rm -rf node_modules/.vite
   npm run build
   ```

### Runtime Issues

- **CSS Not Loading**: Verify CSS imports in FormBuilder.tsx
- **Creator Not Rendering**: Check browser console for errors
- **Props Not Updating**: Ensure initialJson is properly formatted

## Future Enhancements

Potential improvements for the Form Builder:

- **Custom Question Types**: Add domain-specific question types
- **Theme Integration**: Better match with Fluent UI dark theme
- **Form Templates**: Pre-built form templates for common use cases
- **Export Options**: Export forms as HTML, PDF, or other formats
- **Analytics Integration**: Track form completion rates and abandonment
- **A/B Testing**: Test different form variations

## Resources

- [SurveyJS Documentation](https://surveyjs.io/documentation)
- [SurveyJS Creator Docs](https://surveyjs.io/survey-creator/documentation)
- [SurveyJS Examples](https://surveyjs.io/examples)
- [GitHub Repository](https://github.com/surveyjs/survey-creator)

## License

SurveyJS is licensed under the MIT License, making it free for commercial use.
