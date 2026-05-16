import { useNode } from '@craftjs/core';
import { useMemo, useRef } from 'react';
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import type { ICreatorOptions } from 'survey-creator-core';
import 'survey-core/survey-core.min.css';
import 'survey-creator-core/survey-creator-core.min.css';

interface FormBuilderProps {
  initialJson?: string;
  height?: string;
}

export const FormBuilder = ({ initialJson = '{}', height = '600px' }: FormBuilderProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const containerRef = useRef<HTMLDivElement>(null);

  // Use useMemo to create the creator instance instead of useState + useEffect
  const creator = useMemo(() => {
    // Configure SurveyJS Creator
    const options: ICreatorOptions = {
      showLogicTab: true,
      showTranslationTab: false,
      showJSONEditorTab: true,
      isAutoSave: true,
    };

    // Parse initial JSON if provided
    let json = {};
    try {
      json = typeof initialJson === 'string' ? JSON.parse(initialJson) : initialJson;
    } catch (e) {
      console.warn('Invalid initial JSON for form builder:', e);
    }

    const creatorInstance = new SurveyCreator(options);
    
    // Set initial survey JSON
    if (Object.keys(json).length > 0) {
      creatorInstance.JSON = json;
    } else {
      // Default empty survey with one question
      creatorInstance.JSON = {
        title: 'New Form',
        description: 'Drag and drop form fields to build your form',
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'text',
                name: 'question1',
                title: 'Your first question',
              },
            ],
          },
        ],
      };
    }

    return creatorInstance;
  }, [initialJson]);

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
          containerRef.current = ref;
        }
      }}
      style={{
        width: '100%',
        height,
        border: '2px dashed #cbd5e1',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <div style={{ height: '100%' }}>
        <SurveyCreatorComponent creator={creator} />
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
