import { useNode } from '@craftjs/core';
import { useState, useRef, useCallback, useMemo } from 'react';
import { Plus, Trash2, GripVertical, Upload } from 'lucide-react';

interface FormBuilderProps {
  initialJson?: string;
  height?: string;
}

interface ValidationRule {
  type: 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max' | 'custom';
  value: string | number;
  message?: string;
}

interface ConditionalRule {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: string;
}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: ValidationRule[];
  conditionalRules?: ConditionalRule[];
  accept?: string; // For file uploads
  maxFileSize?: number; // In MB
  page?: number; // For multi-page forms
  previewValue?: string; // For preview mode conditional logic evaluation
}

interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  spacing: 'compact' | 'normal' | 'relaxed';
}

interface FormTemplate {
  name: string;
  description: string;
  fields: Omit<FormField, 'id'>[];
}

// Helper function to check if a field type supports placeholder
const supportsPlaceholder = (type: FormField['type']): boolean => {
  return type !== 'checkbox' && type !== 'radio' && type !== 'file';
};

// Default validation rule values
const DEFAULT_MIN_LENGTH = 3;
const DEFAULT_MIN_LENGTH_MESSAGE = 'Minimum 3 characters';

// Form templates
const formTemplates: FormTemplate[] = [
  {
    name: 'Contact Form',
    description: 'Simple contact form with name, email, and message',
    fields: [
      { type: 'text', label: 'Name', placeholder: 'Enter your name', required: true, page: 1 },
      { type: 'email', label: 'Email', placeholder: 'your.email@example.com', required: true, page: 1 },
      { type: 'text', label: 'Subject', placeholder: 'What is this about?', required: true, page: 1 },
      { type: 'textarea', label: 'Message', placeholder: 'Your message here...', required: true, page: 1 },
    ],
  },
  {
    name: 'Survey Form',
    description: 'Customer feedback survey',
    fields: [
      { type: 'text', label: 'Name', placeholder: 'Your name', required: false, page: 1 },
      { type: 'email', label: 'Email', placeholder: 'your.email@example.com', required: false, page: 1 },
      { type: 'radio', label: 'How satisfied are you?', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'], page: 2 },
      { type: 'radio', label: 'Would you recommend us?', required: true, options: ['Yes', 'No', 'Maybe'], page: 2 },
      { type: 'textarea', label: 'Additional comments', placeholder: 'Optional feedback...', required: false, page: 3 },
    ],
  },
  {
    name: 'Registration Form',
    description: 'User registration with personal details',
    fields: [
      { type: 'text', label: 'First Name', placeholder: 'John', required: true, page: 1 },
      { type: 'text', label: 'Last Name', placeholder: 'Doe', required: true, page: 1 },
      { type: 'email', label: 'Email Address', placeholder: 'john.doe@example.com', required: true, page: 1 },
      { type: 'text', label: 'Phone Number', placeholder: '123-456-7890', required: true, page: 2 },
      { type: 'select', label: 'Country', required: true, options: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Other'], page: 2 },
      { type: 'checkbox', label: 'I agree to the terms and conditions', required: true, page: 3 },
    ],
  },
  {
    name: 'Job Application',
    description: 'Job application form with file upload',
    fields: [
      { type: 'text', label: 'Full Name', placeholder: 'Your full name', required: true, page: 1 },
      { type: 'email', label: 'Email', placeholder: 'your.email@example.com', required: true, page: 1 },
      { type: 'text', label: 'Phone', placeholder: 'Your phone number', required: true, page: 1 },
      { type: 'select', label: 'Position Applied For', required: true, options: ['Software Engineer', 'Designer', 'Product Manager', 'Marketing', 'Other'], page: 2 },
      { type: 'file', label: 'Resume/CV', required: true, accept: '.pdf,.doc,.docx', maxFileSize: 5, page: 2 },
      { type: 'file', label: 'Cover Letter', required: false, accept: '.pdf,.doc,.docx', maxFileSize: 5, page: 2 },
      { type: 'textarea', label: 'Why do you want to work with us?', placeholder: 'Tell us about yourself...', required: true, page: 3 },
    ],
  },
];

export const FormBuilder = ({ initialJson = '{}', height = '600px' }: FormBuilderProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  // Parse initial form fields from JSON or use defaults
  const [fields, setFields] = useState<FormField[]>(() => {
    try {
      const parsed = typeof initialJson === 'string' ? JSON.parse(initialJson) : initialJson;
      if (parsed.fields && Array.isArray(parsed.fields)) {
        return parsed.fields;
      }
    } catch (e) {
      console.warn('Invalid initial JSON for form builder:', e);
    }
    // Default form with one text field
    return [
      {
        id: '1',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter your name',
        required: true,
        page: 1,
      },
    ];
  });

  // Counter for generating unique IDs - calculate max after fields are initialized
  const nextIdRef = useRef(
    fields.reduce((max, field) => {
      const numId = parseInt(field.id, 10);
      return !isNaN(numId) && numId >= max ? numId + 1 : max;
    }, 2)
  );

  const getNextId = useCallback(() => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id.toString();
  }, []);

  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [theme, setTheme] = useState<FormTheme>({
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderRadius: '6px',
    spacing: 'normal',
  });
  const [showTemplates, setShowTemplates] = useState<boolean>(false);

  // Calculate total pages
  const totalPages = useMemo(() => {
    const maxPage = fields.reduce((max, field) => Math.max(max, field.page || 1), 1);
    return maxPage;
  }, [fields]);

  // Get fields for current page
  const currentPageFields = useMemo(() => {
    return fields.filter((field) => (field.page || 1) === currentPage);
  }, [fields, currentPage]);

  // Check if a field should be visible based on conditional rules
  const isFieldVisible = useCallback(
    (field: FormField): boolean => {
      if (!field.conditionalRules || field.conditionalRules.length === 0) {
        return true;
      }

      // All conditional rules must be satisfied
      return field.conditionalRules.every((rule) => {
        const dependentField = fields.find((f) => f.id === rule.fieldId);
        if (!dependentField) return false;

        // In preview mode, use previewValue if available, otherwise empty string
        // Note: previewValue would be set by form input handlers in a production implementation
        // to track user selections. In the builder, it's not populated, so conditions won't
        // be visible until the form is actually used.
        const fieldValue = dependentField.previewValue || '';

        switch (rule.operator) {
          case 'equals':
            return fieldValue === rule.value;
          case 'notEquals':
            return fieldValue !== rule.value;
          case 'contains':
            return fieldValue.includes(rule.value);
          case 'greaterThan':
            return parseFloat(fieldValue) > parseFloat(rule.value);
          case 'lessThan':
            return parseFloat(fieldValue) < parseFloat(rule.value);
          default:
            return true;
        }
      });
    },
    [fields]
  );

  const loadTemplate = useCallback(
    (template: FormTemplate) => {
      const newFields = template.fields.map((field, index) => ({
        ...field,
        id: (index + 1).toString(),
      }));
      setFields(newFields);
      nextIdRef.current = newFields.length + 1;
      setSelectedField(null);
      setCurrentPage(1);
      setShowTemplates(false);
    },
    []
  );

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: getNextId(),
      type,
      label: `New ${type} field`,
      placeholder: supportsPlaceholder(type) ? `Enter ${type}` : undefined,
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      page: currentPage,
      accept: type === 'file' ? '.pdf,.doc,.docx,.jpg,.png' : undefined,
      maxFileSize: type === 'file' ? 5 : undefined,
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedField === id) {
      setSelectedField(null);
    }
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex((f) => f.id === id);
    if (index === -1) return;

    const field = fields[index];
    const currentPageFieldsFiltered = fields.filter((f) => (f.page || 1) === (field.page || 1));
    const pageIndex = currentPageFieldsFiltered.findIndex((f) => f.id === id);

    if (direction === 'up' && pageIndex === 0) return;
    if (direction === 'down' && pageIndex === currentPageFieldsFiltered.length - 1) return;

    const targetField = direction === 'up' 
      ? currentPageFieldsFiltered[pageIndex - 1] 
      : currentPageFieldsFiltered[pageIndex + 1];
    const targetIndex = fields.findIndex((f) => f.id === targetField.id);

    const newFields = [...fields];
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  const fieldTypes: { type: FormField['type']; label: string }[] = [
    { type: 'text', label: 'Text Input' },
    { type: 'email', label: 'Email' },
    { type: 'number', label: 'Number' },
    { type: 'textarea', label: 'Text Area' },
    { type: 'select', label: 'Dropdown' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'radio', label: 'Radio Buttons' },
    { type: 'file', label: 'File Upload' },
  ];

  const selectedFieldData = fields.find((f) => f.id === selectedField);

  const spacingMap = {
    compact: '12px',
    normal: '16px',
    relaxed: '24px',
  };

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{
        width: '100%',
        height,
        border: '2px dashed #cbd5e1',
        borderRadius: theme.borderRadius,
        overflow: 'hidden',
        background: theme.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar: Templates, Pages, and Theme */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 20px', 
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: showTemplates ? theme.primaryColor : '#fff',
              color: showTemplates ? '#fff' : theme.textColor,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            Templates
          </button>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '12px' }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                  fontSize: '12px',
                }}
              >
                ←
              </button>
              <span style={{ fontSize: '13px', padding: '0 8px' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  fontSize: '12px',
                }}
              >
                →
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            const newPageNumber = totalPages + 1;
            setCurrentPage(newPageNumber);
          }}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          + Add Page
        </button>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div style={{ 
          padding: '16px 20px', 
          background: '#f0f9ff', 
          borderBottom: '1px solid #e5e7eb',
          maxHeight: '200px',
          overflowY: 'auto',
        }}>
          <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: theme.textColor }}>
            Load Template
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {formTemplates.map((template) => (
              <div
                key={template.name}
                onClick={() => loadTemplate(template)}
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.primaryColor;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.primaryColor}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px', color: theme.textColor }}>
                  {template.name}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {template.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Left Panel: Form Preview */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', borderRight: '1px solid #e5e7eb' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: theme.textColor }}>
          Form Preview {totalPages > 1 && `- Page ${currentPage}`}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacingMap[theme.spacing] }}>
          {currentPageFields.filter(isFieldVisible).map((field, index) => (
            <div
              key={field.id}
              onClick={() => setSelectedField(field.id)}
              style={{
                padding: '12px',
                border: selectedField === field.id ? `2px solid ${theme.primaryColor}` : '1px solid #e5e7eb',
                borderRadius: theme.borderRadius,
                cursor: 'pointer',
                backgroundColor: selectedField === field.id ? `${theme.primaryColor}11` : theme.backgroundColor,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <GripVertical size={16} style={{ color: '#9ca3af', cursor: 'move' }} />
                <label style={{ fontWeight: '500', fontSize: '14px', flex: 1, color: theme.textColor }}>
                  {field.label}
                  {field.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveField(field.id, 'up');
                      }}
                      style={{
                        padding: '4px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: theme.textColor,
                      }}
                      title="Move up"
                    >
                      ↑
                    </button>
                  )}
                  {index < currentPageFields.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveField(field.id, 'down');
                      }}
                      style={{
                        padding: '4px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: theme.textColor,
                      }}
                      title="Move down"
                    >
                      ↓
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(field.id);
                    }}
                    style={{
                      padding: '4px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#ef4444',
                    }}
                    title="Delete field"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: theme.borderRadius,
                    fontSize: '14px',
                    minHeight: '80px',
                    color: theme.textColor,
                  }}
                  readOnly
                />
              ) : field.type === 'select' ? (
                <select
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: theme.borderRadius,
                    fontSize: '14px',
                    color: theme.textColor,
                  }}
                  disabled
                >
                  <option>Select an option</option>
                  {field.options?.map((opt, i) => (
                    <option key={`${field.id}-opt-${i}`}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" disabled style={{ accentColor: theme.primaryColor }} />
                  <span style={{ fontSize: '14px', color: theme.textColor }}>{field.placeholder || 'Checkbox option'}</span>
                </div>
              ) : field.type === 'radio' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {field.options?.map((opt, i) => (
                    <div key={`${field.id}-radio-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="radio" name={field.id} disabled style={{ accentColor: theme.primaryColor }} />
                      <span style={{ fontSize: '14px', color: theme.textColor }}>{opt}</span>
                    </div>
                  ))}
                </div>
              ) : field.type === 'file' ? (
                <div>
                  <div
                    style={{
                      width: '100%',
                      padding: '20px',
                      border: `2px dashed #d1d5db`,
                      borderRadius: theme.borderRadius,
                      textAlign: 'center',
                      background: '#f9fafb',
                      color: theme.textColor,
                    }}
                  >
                    <Upload size={24} style={{ margin: '0 auto 8px', display: 'block', color: '#9ca3af' }} />
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>Click to upload or drag and drop</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {field.accept || 'All files'} (max {field.maxFileSize || 5}MB)
                    </div>
                  </div>
                </div>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: theme.borderRadius,
                    fontSize: '14px',
                    color: theme.textColor,
                  }}
                  readOnly
                />
              )}
              {field.validation && field.validation.length > 0 && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#6b7280' }}>
                  Validation: {field.validation.map((v) => v.type).join(', ')}
                </div>
              )}
              {field.conditionalRules && field.conditionalRules.length > 0 && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#8b5cf6' }}>
                  Conditional field
                </div>
              )}
            </div>
          ))}
          {currentPageFields.length === 0 && (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#9ca3af',
                border: '2px dashed #e5e7eb',
                borderRadius: theme.borderRadius,
              }}
            >
              No fields on this page. Add fields from the right panel.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Field Types & Settings */}
      <div style={{ width: '280px', padding: '20px', overflowY: 'auto', background: '#f9fafb' }}>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Add Field
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {fieldTypes.map((ft) => (
              <button
                key={ft.type}
                onClick={() => addField(ft.type)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Plus size={14} />
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        {selectedFieldData && (
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              Field Settings
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                  Label
                </label>
                <input
                  type="text"
                  value={selectedFieldData.label}
                  onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '13px',
                  }}
                />
              </div>
              {supportsPlaceholder(selectedFieldData.type) && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={selectedFieldData.placeholder || ''}
                    onChange={(e) => updateField(selectedFieldData.id, { placeholder: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedFieldData.required || false}
                  onChange={(e) => updateField(selectedFieldData.id, { required: e.target.checked })}
                  style={{ accentColor: theme.primaryColor }}
                />
                <label htmlFor="required" style={{ fontSize: '13px', cursor: 'pointer' }}>
                  Required field
                </label>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                  Page
                </label>
                <input
                  type="number"
                  min="1"
                  value={selectedFieldData.page || 1}
                  onChange={(e) => updateField(selectedFieldData.id, { page: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '13px',
                  }}
                />
              </div>
              {(selectedFieldData.type === 'select' || selectedFieldData.type === 'radio') && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                    Options (one per line)
                  </label>
                  <textarea
                    value={selectedFieldData.options?.join('\n') || ''}
                    onChange={(e) =>
                      updateField(selectedFieldData.id, {
                        options: e.target.value.split('\n').filter((s) => s.trim()),
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '13px',
                      minHeight: '80px',
                    }}
                  />
                </div>
              )}
              {selectedFieldData.type === 'file' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                      Accepted File Types
                    </label>
                    <input
                      type="text"
                      value={selectedFieldData.accept || ''}
                      onChange={(e) => updateField(selectedFieldData.id, { accept: e.target.value })}
                      placeholder=".pdf,.doc,.docx"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={selectedFieldData.maxFileSize || 5}
                      onChange={(e) => updateField(selectedFieldData.id, { maxFileSize: parseInt(e.target.value) || 5 })}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </>
              )}
              {(selectedFieldData.type === 'text' || selectedFieldData.type === 'number' || selectedFieldData.type === 'textarea') && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                    Validation
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      onClick={() => {
                        const newValidation = [...(selectedFieldData.validation || [])];
                        newValidation.push({ type: 'minLength', value: DEFAULT_MIN_LENGTH, message: DEFAULT_MIN_LENGTH_MESSAGE });
                        updateField(selectedFieldData.id, { validation: newValidation });
                      }}
                      style={{
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      + Add Validation Rule
                    </button>
                    {selectedFieldData.validation?.map((rule, idx) => (
                      <div key={idx} style={{ 
                        padding: '8px', 
                        background: '#f3f4f6', 
                        borderRadius: '4px',
                        fontSize: '11px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <select
                            value={rule.type}
                            onChange={(e) => {
                              const newValidation = [...(selectedFieldData.validation || [])];
                              newValidation[idx] = { ...rule, type: e.target.value as ValidationRule['type'] };
                              updateField(selectedFieldData.id, { validation: newValidation });
                            }}
                            style={{
                              flex: 1,
                              padding: '4px',
                              border: '1px solid #d1d5db',
                              borderRadius: '3px',
                              fontSize: '11px',
                            }}
                          >
                            <option value="minLength">Min Length</option>
                            <option value="maxLength">Max Length</option>
                            <option value="min">Min Value</option>
                            <option value="max">Max Value</option>
                            <option value="pattern">Pattern (regex)</option>
                          </select>
                          <button
                            onClick={() => {
                              const newValidation = selectedFieldData.validation?.filter((_, i) => i !== idx);
                              updateField(selectedFieldData.id, { validation: newValidation });
                            }}
                            style={{
                              marginLeft: '4px',
                              padding: '4px 6px',
                              border: 'none',
                              background: '#ef4444',
                              color: '#fff',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '11px',
                            }}
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => {
                            const newValidation = [...(selectedFieldData.validation || [])];
                            newValidation[idx] = { ...rule, value: e.target.value };
                            updateField(selectedFieldData.id, { validation: newValidation });
                          }}
                          placeholder="Value"
                          style={{
                            width: '100%',
                            padding: '4px',
                            border: '1px solid #d1d5db',
                            borderRadius: '3px',
                            fontSize: '11px',
                            marginBottom: '4px',
                          }}
                        />
                        <input
                          type="text"
                          value={rule.message || ''}
                          onChange={(e) => {
                            const newValidation = [...(selectedFieldData.validation || [])];
                            newValidation[idx] = { ...rule, message: e.target.value };
                            updateField(selectedFieldData.id, { validation: newValidation });
                          }}
                          placeholder="Error message (optional)"
                          style={{
                            width: '100%',
                            padding: '4px',
                            border: '1px solid #d1d5db',
                            borderRadius: '3px',
                            fontSize: '11px',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                  Conditional Logic
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    onClick={() => {
                      const newRules = [...(selectedFieldData.conditionalRules || [])];
                      const otherField = fields.find((f) => f.id !== selectedFieldData.id);
                      if (otherField) {
                        newRules.push({ fieldId: otherField.id, operator: 'equals', value: '' });
                        updateField(selectedFieldData.id, { conditionalRules: newRules });
                      }
                    }}
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    + Add Condition
                  </button>
                  {selectedFieldData.conditionalRules?.map((rule, idx) => (
                    <div key={idx} style={{ 
                      padding: '8px', 
                      background: '#f3f4f6', 
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}>
                      <div style={{ marginBottom: '4px' }}>Show when:</div>
                      <select
                        value={rule.fieldId}
                        onChange={(e) => {
                          const newRules = [...(selectedFieldData.conditionalRules || [])];
                          newRules[idx] = { ...rule, fieldId: e.target.value };
                          updateField(selectedFieldData.id, { conditionalRules: newRules });
                        }}
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: '1px solid #d1d5db',
                          borderRadius: '3px',
                          fontSize: '11px',
                          marginBottom: '4px',
                        }}
                      >
                        {fields.filter((f) => f.id !== selectedFieldData.id).map((f) => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                      </select>
                      <select
                        value={rule.operator}
                        onChange={(e) => {
                          const newRules = [...(selectedFieldData.conditionalRules || [])];
                          newRules[idx] = { ...rule, operator: e.target.value as ConditionalRule['operator'] };
                          updateField(selectedFieldData.id, { conditionalRules: newRules });
                        }}
                        style={{
                          width: '100%',
                          padding: '4px',
                          border: '1px solid #d1d5db',
                          borderRadius: '3px',
                          fontSize: '11px',
                          marginBottom: '4px',
                        }}
                      >
                        <option value="equals">equals</option>
                        <option value="notEquals">not equals</option>
                        <option value="contains">contains</option>
                        <option value="greaterThan">greater than</option>
                        <option value="lessThan">less than</option>
                      </select>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => {
                            const newRules = [...(selectedFieldData.conditionalRules || [])];
                            newRules[idx] = { ...rule, value: e.target.value };
                            updateField(selectedFieldData.id, { conditionalRules: newRules });
                          }}
                          placeholder="Value"
                          style={{
                            flex: 1,
                            padding: '4px',
                            border: '1px solid #d1d5db',
                            borderRadius: '3px',
                            fontSize: '11px',
                          }}
                        />
                        <button
                          onClick={() => {
                            const newRules = selectedFieldData.conditionalRules?.filter((_, i) => i !== idx);
                            updateField(selectedFieldData.id, { conditionalRules: newRules });
                          }}
                          style={{
                            padding: '4px 6px',
                            border: 'none',
                            background: '#ef4444',
                            color: '#fff',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '11px',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Theme Settings */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Theme Settings
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                Primary Color
              </label>
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                style={{
                  width: '100%',
                  height: '32px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                Background Color
              </label>
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                style={{
                  width: '100%',
                  height: '32px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                Spacing
              </label>
              <select
                value={theme.spacing}
                onChange={(e) => setTheme({ ...theme, spacing: e.target.value as FormTheme['spacing'] })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="relaxed">Relaxed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

FormBuilder.craft = {
  displayName: 'Form Builder',
  props: {
    initialJson: '{}',
    height: '600px',
  },
  rules: {
    canDrag: () => true,
  },
};
