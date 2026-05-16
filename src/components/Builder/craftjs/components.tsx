import { useNode } from '@craftjs/core';
import type { CSSProperties } from 'react';

// Export FormBuilder from separate file
export { FormBuilder } from './FormBuilder';

// Text Component
export const Text = ({ text, fontSize = '14px', color = '#000' }: { text?: string; fontSize?: string; color?: string }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{ fontSize, color, padding: '8px' }}
    >
      {text || 'Insert your text here'}
    </div>
  );
};

Text.craft = {
  displayName: 'Text',
  props: {
    text: 'Insert your text here',
    fontSize: '14px',
    color: '#000',
  },
  rules: {
    canDrag: () => true,
  },
};

// Button Component
export const ButtonComponent = ({ text = 'Click Me', href = '#' }: { text?: string; href?: string }) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  
  const buttonStyle: CSSProperties = {
    display: 'inline-block',
    padding: '10px 20px',
    background: '#2563eb',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
  };

  return (
    <a
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      href={href}
      style={buttonStyle}
    >
      {text}
    </a>
  );
};

ButtonComponent.craft = {
  displayName: 'Button',
  props: {
    text: 'Click Me',
    href: '#',
  },
  rules: {
    canDrag: () => true,
  },
};

// Container Component
export const Container = ({ children, background = '#fff', padding = '20px' }: { children?: React.ReactNode; background?: string; padding?: string }) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{ background, padding, minHeight: '50px' }}
    >
      {children}
    </div>
  );
};

Container.craft = {
  displayName: 'Container',
  props: {
    background: '#fff',
    padding: '20px',
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
};

// Section Component
export const Section = ({ children }: { children?: React.ReactNode }) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const sectionStyle: CSSProperties = {
    padding: '40px 20px',
    minHeight: '100px',
  };

  return (
    <section
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={sectionStyle}
    >
      {children || (
        <>
          <h1>Insert your title here</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </>
      )}
    </section>
  );
};

Section.craft = {
  displayName: 'Section',
  props: {},
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
};

// Hero Component
export const Hero = ({ title = 'Welcome', description = 'Your page description goes here.', buttonText = 'Get Started' }: { title?: string; description?: string; buttonText?: string }) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const heroStyle: CSSProperties = {
    background: 'linear-gradient(135deg,#1e40af,#3b82f6)',
    color: '#fff',
    padding: '80px 40px',
    textAlign: 'center',
  };

  const titleStyle: CSSProperties = {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  };

  const descStyle: CSSProperties = {
    fontSize: '1.1rem',
    marginBottom: '2rem',
    opacity: 0.9,
  };

  const btnStyle: CSSProperties = {
    display: 'inline-block',
    padding: '12px 32px',
    background: '#fff',
    color: '#1e40af',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
  };

  return (
    <section
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={heroStyle}
    >
      <h1 style={titleStyle}>{title}</h1>
      <p style={descStyle}>{description}</p>
      <a href="#" style={btnStyle}>{buttonText}</a>
    </section>
  );
};

Hero.craft = {
  displayName: 'Hero',
  props: {
    title: 'Welcome',
    description: 'Your page description goes here.',
    buttonText: 'Get Started',
  },
  rules: {
    canDrag: () => true,
  },
};

// Card Component
export const Card = ({ title = 'Card Title', description = 'Card description text goes here.' }: { title?: string; description?: string }) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const cardStyle: CSSProperties = {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '320px',
    boxShadow: '0 1px 3px rgba(0,0,0,.1)',
  };

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={cardStyle}
    >
      <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
      <p style={{ color: '#64748b', margin: '0 0 16px' }}>{description}</p>
      <a href="#" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Learn more →</a>
    </div>
  );
};

Card.craft = {
  displayName: 'Card',
  props: {
    title: 'Card Title',
    description: 'Card description text goes here.',
  },
  rules: {
    canDrag: () => true,
  },
};

// Columns Component (2-column layout)
export const TwoColumns = ({ children }: { children?: React.ReactNode }) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const colStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    padding: '20px',
  };

  const colItemStyle: CSSProperties = {
    background: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    minHeight: '80px',
  };

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={colStyle}
    >
      {children || (
        <>
          <div style={colItemStyle}>Column 1</div>
          <div style={colItemStyle}>Column 2</div>
        </>
      )}
    </div>
  );
};

TwoColumns.craft = {
  displayName: '2 Columns',
  props: {},
  rules: {
    canDrag: () => true,
    canMoveIn: () => true,
  },
};
