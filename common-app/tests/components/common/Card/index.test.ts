import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../../../../src/components/common/Card';
import type { CardProps, CardAction, CardSection } from '../../../../src/components/common/Card';
import { Typography } from '@mui/material';

describe('Card index.ts exports', () => {
  describe('Default Export', () => {
    it('should export Card component as default', () => {
      expect(Card).toBeDefined();
      expect(typeof Card).toBe('function');
    });

    it('should render Card component imported from index', () => {
      render(
        <Card
          title="Test Card"
          content={<Typography>Test Content</Typography>}
        />
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should work with all Card props when imported from index', () => {
      const data = { id: '1', name: 'Test' };
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
      ];
      const sections: CardSection[] = [
        { id: 'section1', content: <Typography>Section 1</Typography> },
      ];

      render(
        <Card
          data={data}
          id="test-id"
          title="Test Card"
          sections={sections}
          actions={actions}
          showMenuButton={true}
          size="medium"
          variant="default"
          selected={false}
          disabled={false}
          loading={false}
          onClick={jest.fn()}
        />
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Section 1')).toBeInTheDocument();
    });
  });

  describe('Type Exports', () => {
    it('should export CardProps type', () => {
      // TypeScript will fail at compile time if type is not exported
      // This test verifies the type can be used
      const props: CardProps = {
        title: 'Test',
        content: <Typography>Content</Typography>,
      };

      expect(props).toBeDefined();
      expect(props.title).toBe('Test');
    });

    it('should export CardAction type', () => {
      // TypeScript will fail at compile time if type is not exported
      const action: CardAction = {
        id: 'action1',
        label: 'Action 1',
        onClick: jest.fn(),
      };

      expect(action).toBeDefined();
      expect(action.id).toBe('action1');
      expect(action.label).toBe('Action 1');
    });

    it('should export CardAction with optional properties', () => {
      const actionWithIcon: CardAction = {
        id: 'action2',
        label: 'Action 2',
        icon: <span>Icon</span>,
        onClick: jest.fn(),
        disabled: false,
        divider: true,
      };

      expect(actionWithIcon.icon).toBeDefined();
      expect(actionWithIcon.disabled).toBe(false);
      expect(actionWithIcon.divider).toBe(true);
    });

    it('should export CardSection type', () => {
      // TypeScript will fail at compile time if type is not exported
      const section: CardSection = {
        id: 'section1',
        content: <Typography>Section Content</Typography>,
      };

      expect(section).toBeDefined();
      expect(section.id).toBe('section1');
    });

    it('should export CardSection with optional properties', () => {
      const sectionWithOptions: CardSection = {
        id: 'section2',
        content: <Typography>Section Content</Typography>,
        backgroundColor: '#f0f0f0',
        padding: '12px',
        borderBottom: true,
      };

      expect(sectionWithOptions.backgroundColor).toBe('#f0f0f0');
      expect(sectionWithOptions.padding).toBe('12px');
      expect(sectionWithOptions.borderBottom).toBe(true);
    });

    it('should export CardProps with generic type parameter', () => {
      interface CustomData {
        id: string;
        name: string;
        value: number;
      }

      const props: CardProps<CustomData> = {
        data: { id: '1', name: 'Test', value: 100 },
        title: 'Test Card',
        content: <Typography>Content</Typography>,
      };

      expect(props.data).toBeDefined();
      if (props.data) {
        expect(props.data.id).toBe('1');
        expect(props.data.name).toBe('Test');
        expect(props.data.value).toBe(100);
      }
    });
  });

  describe('Import Compatibility', () => {
    it('should allow importing Card as default export', () => {
      // This test verifies the import syntax works
      const CardComponent = Card;
      expect(CardComponent).toBeDefined();
    });

    it('should allow importing types alongside default export', () => {
      // This test verifies both default and type exports work together
      const action: CardAction = {
        id: 'test',
        label: 'Test Action',
        onClick: jest.fn(),
      };

      render(
        <Card
          title="Test"
          content={<Typography>Content</Typography>}
          actions={[action]}
          showMenuButton={true}
        />
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should allow using CardProps type in function parameters', () => {
      const renderCard = (props: CardProps) => {
        return <Card {...props} />;
      };

      const result = renderCard({
        title: 'Test Card',
        content: <Typography>Content</Typography>,
      });

      expect(result).toBeDefined();
    });

    it('should allow using CardAction type in arrays', () => {
      const actions: CardAction[] = [
        { id: '1', label: 'Action 1', onClick: jest.fn() },
        { id: '2', label: 'Action 2', onClick: jest.fn() },
      ];

      render(
        <Card
          title="Test"
          content={<Typography>Content</Typography>}
          actions={actions}
          showMenuButton={true}
        />
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should allow using CardSection type in arrays', () => {
      const sections: CardSection[] = [
        { id: '1', content: <Typography>Section 1</Typography> },
        { id: '2', content: <Typography>Section 2</Typography> },
      ];

      render(
        <Card
          title="Test"
          sections={sections}
        />
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });
  });

  describe('Export Completeness', () => {
    it('should export all required Card functionality', () => {
      // Verify Card component can be used with all its features
      const data = { id: '1' };
      const titleRenderer = (d: typeof data) => <Typography>{d.id}</Typography>;
      const content = (d: typeof data) => <Typography>Content for {d.id}</Typography>;
      const actions: CardAction[] = [
        { id: 'action1', label: 'Action 1', onClick: jest.fn() },
      ];
      const sections: CardSection[] = [
        { id: 'section1', content: <Typography>Section</Typography> },
      ];

      render(
        <Card
          data={data}
          titleRenderer={titleRenderer}
          content={content}
          sections={sections}
          actions={actions}
          footer={<Typography>Footer</Typography>}
          showMenuButton={true}
          size="large"
          width="500px"
          height="300px"
          variant="elevated"
          selected={true}
          disabled={false}
          loading={false}
          dragging={false}
          onClick={jest.fn()}
          onDoubleClick={jest.fn()}
          onMouseDown={jest.fn()}
          onHover={jest.fn()}
          className="test-class"
          headerBackgroundColor="#ffffff"
          footerBackgroundColor="#f5f5f5"
          menuClassName="menu-class"
          menuAnchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          menuTransformOrigin={{ vertical: 'top', horizontal: 'right' }}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Content for 1')).toBeInTheDocument();
      expect(screen.getByText('Section')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});

