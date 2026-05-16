import { useEditor } from '@craftjs/core';
import { Button, tokens } from '@fluentui/react-components';
import {
  Text,
  ButtonComponent,
  Container,
  Section,
  Hero,
  Card,
  TwoColumns,
} from './components';

export const Toolbox = () => {
  const { connectors } = useEditor();

  const blocks = [
    {
      id: 'section',
      label: 'Section',
      create: () => <Section />,
    },
    {
      id: 'text',
      label: 'Text',
      create: () => <Text text="Insert your text here" />,
    },
    {
      id: 'button',
      label: 'Button',
      create: () => <ButtonComponent text="Click Me" />,
    },
    {
      id: 'container',
      label: 'Container',
      create: () => <Container />,
    },
    {
      id: 'hero',
      label: 'Hero',
      create: () => <Hero />,
    },
    {
      id: 'card',
      label: 'Card',
      create: () => <Card />,
    },
    {
      id: '2-columns',
      label: '2 Columns',
      create: () => <TwoColumns />,
    },
  ];

  return (
    <div className="p-3">
      <p
        className="text-xs mb-3 font-semibold uppercase tracking-wider"
        style={{ color: tokens.colorNeutralForeground2 }}
      >
        Blocks
      </p>
      <div className="space-y-1">
        {blocks.map((block) => (
          <Button
            key={block.id}
            ref={(ref: HTMLButtonElement | null) => {
              if (ref) {
                connectors.create(ref, block.create());
              }
            }}
            appearance="subtle"
            className="w-full"
            style={{ justifyContent: 'flex-start' }}
          >
            {block.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
