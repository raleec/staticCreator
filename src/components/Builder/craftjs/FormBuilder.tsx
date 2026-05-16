import { useNode } from '@craftjs/core';
import { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface FormBuilderProps {
  initialJson?: string;
  height?: string;
}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export const FormBuilder = ({ initialJson = '{}', height = '600px' }: FormBuilderProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  // Counter for generating unique IDs
  const nextIdRef = useRef(1);
  const getNextId = useCallback(() => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id.toString();
  }, []);

  // Parse initial form fields from JSON or use defaults
  const getInitialFields = (): FormField[] => {
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
      },
    ];
  };

  const [fields, setFields] = useState<FormField[]>(getInitialFields);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: getNextId(),
      type,
      label: `New ${type} field`,
      placeholder: type !== 'checkbox' && type !== 'radio' ? `Enter ${type}` : undefined,
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
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
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
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
  ];

  const selectedFieldData = fields.find((f) => f.id === selectedField);

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
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff',
        display: 'flex',
      }}
    >
      {/* Left Panel: Form Preview */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', borderRight: '1px solid #e5e7eb' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Form Preview</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {fields.map((field, index) => (
            <div
              key={field.id}
              onClick={() => setSelectedField(field.id)}
              style={{
                padding: '12px',
                border: selectedField === field.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedField === field.id ? '#eff6ff' : '#fff',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <GripVertical size={16} style={{ color: '#9ca3af', cursor: 'move' }} />
                <label style={{ fontWeight: '500', fontSize: '14px', flex: 1 }}>
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
                      }}
                      title="Move up"
                    >
                      ↑
                    </button>
                  )}
                  {index < fields.length - 1 && (
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
                    borderRadius: '4px',
                    fontSize: '14px',
                    minHeight: '80px',
                  }}
                  readOnly
                />
              ) : field.type === 'select' ? (
                <select
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                  disabled
                >
                  <option>Select an option</option>
                  {field.options?.map((opt, i) => (
                    <option key={i}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" disabled />
                  <span style={{ fontSize: '14px' }}>{field.placeholder || 'Checkbox option'}</span>
                </div>
              ) : field.type === 'radio' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {field.options?.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="radio" name={field.id} disabled />
                      <span style={{ fontSize: '14px' }}>{opt}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                  readOnly
                />
              )}
            </div>
          ))}
          {fields.length === 0 && (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#9ca3af',
                border: '2px dashed #e5e7eb',
                borderRadius: '8px',
              }}
            >
              No fields yet. Add fields from the right panel.
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
              {selectedFieldData.type !== 'checkbox' && selectedFieldData.type !== 'radio' && (
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
                />
                <label htmlFor="required" style={{ fontSize: '13px', cursor: 'pointer' }}>
                  Required field
                </label>
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
            </div>
          </div>
        )}
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
