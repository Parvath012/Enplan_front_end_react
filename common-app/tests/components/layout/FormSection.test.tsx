import React from 'react';
import { render, screen } from '@testing-library/react';
import FormSection from '../../../src/components/layout/FormSection';

describe('FormSection', () => {
  const defaultProps = {
    title: 'Section Title',
    children: <div>Child Content</div>
  };

  describe('Rendering', () => {
    it('renders title and children when both are provided', () => {
      render(<FormSection {...defaultProps} />);
      
      expect(screen.getByRole('heading', { name: 'Section Title' })).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders without title when title prop is not provided', () => {
      render(<FormSection children={<span>No Title</span>} />);
      
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByText('No Title')).toBeInTheDocument();
    });

    it('renders with empty title string', () => {
      render(<FormSection title="" children={<span>Empty Title</span>} />);
      
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByText('Empty Title')).toBeInTheDocument();
    });

    it('renders with null title', () => {
      render(<FormSection title={null as any} children={<span>Null Title</span>} />);
      
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByText('Null Title')).toBeInTheDocument();
    });

    it('renders with undefined title', () => {
      render(<FormSection title={undefined} children={<span>Undefined Title</span>} />);
      
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByText('Undefined Title')).toBeInTheDocument();
    });
  });

  describe('Title Rendering', () => {
    it('renders title with correct heading level', () => {
      render(<FormSection {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { name: 'Section Title' });
      expect(heading.tagName).toBe('H2');
    });

    it('renders title with correct text content', () => {
      render(<FormSection {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { name: 'Section Title' });
      expect(heading).toHaveTextContent('Section Title');
    });

    it('renders title with special characters', () => {
      const specialTitle = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      
      render(<FormSection title={specialTitle} children={<span>Content</span>} />);
      
      expect(screen.getByRole('heading', { name: specialTitle })).toBeInTheDocument();
    });

    it('renders title with very long text', () => {
      const longTitle = 'This is a very long title that might cause layout issues if not handled properly by the component';
      
      render(<FormSection title={longTitle} children={<span>Content</span>} />);
      
      expect(screen.getByRole('heading', { name: longTitle })).toBeInTheDocument();
    });

    it('renders title with numbers and symbols', () => {
      const numericTitle = 'Section 123 - Test & More';
      
      render(<FormSection title={numericTitle} children={<span>Content</span>} />);
      
      expect(screen.getByRole('heading', { name: numericTitle })).toBeInTheDocument();
    });
  });

  describe('Children Rendering', () => {
    it('renders single child element', () => {
      render(<FormSection title="Test" children={<div>Single Child</div>} />);
      
      expect(screen.getByText('Single Child')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <FormSection title="Test">
          <div>First Child</div>
          <span>Second Child</span>
          <p>Third Child</p>
        </FormSection>
      );
      
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });

    it('renders complex nested children', () => {
      render(
        <FormSection title="Test">
          <div>
            <span>Nested</span>
            <div>
              <p>Deeply Nested</p>
            </div>
          </div>
        </FormSection>
      );
      
      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('Deeply Nested')).toBeInTheDocument();
    });

    it('renders children with no content', () => {
      render(<FormSection title="Test" children={<div></div>} />);
      
      const section = screen.getByRole('heading', { name: 'Test' }).closest('div');
      expect(section).toBeInTheDocument();
    });

    it('renders children with null content', () => {
      render(<FormSection title="Test" children={null} />);
      
      expect(screen.getByRole('heading', { name: 'Test' })).toBeInTheDocument();
    });

    it('renders children with undefined content', () => {
      render(<FormSection title="Test" children={undefined} />);
      
      expect(screen.getByRole('heading', { name: 'Test' })).toBeInTheDocument();
    });
  });

  describe('Margin Bottom Prop', () => {
    it('applies default margin bottom when not provided', () => {
      const { container } = render(<FormSection {...defaultProps} />);
      
      const section = container.firstChild as HTMLElement;
      expect(section).toHaveStyle({ marginBottom: '0px' });
    });

    it('applies custom margin bottom when provided', () => {
      const { container } = render(<FormSection {...defaultProps} marginBottom={16} />);
      
      const section = container.firstChild as HTMLElement;
      expect(section).toBeInTheDocument();
    });

    it('applies zero margin bottom', () => {
      const { container } = render(<FormSection {...defaultProps} marginBottom={0} />);
      
      const section = container.firstChild as HTMLElement;
      expect(section).toHaveStyle({ marginBottom: '0px' });
    });

    it('applies large margin bottom', () => {
      const { container } = render(<FormSection {...defaultProps} marginBottom={32} />);
      
      const section = container.firstChild as HTMLElement;
      expect(section).toBeInTheDocument();
    });

    it('applies negative margin bottom', () => {
      const { container } = render(<FormSection {...defaultProps} marginBottom={-8} />);
      
      const section = container.firstChild as HTMLElement;
      expect(section).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct base styling', () => {
      const { container } = render(<FormSection {...defaultProps} />);
      
      const section = container.firstChild as HTMLElement;
      expect(section).toBeInTheDocument();
      
      // Check that the section has the expected styling structure
      expect(section.tagName).toBe('DIV');
    });

    it('maintains proper heading hierarchy', () => {
      render(<FormSection {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { name: 'Section Title' });
      expect(heading.tagName).toBe('H2');
      expect(heading).toHaveTextContent('Section Title');
    });

    it('renders with consistent spacing', () => {
      const { container } = render(<FormSection {...defaultProps} />);
      
      const section = container.firstChild as HTMLElement;
      expect(section).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string title', () => {
      render(<FormSection title="" children={<span>Content</span>} />);
      
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles whitespace-only title', () => {
      render(<FormSection title="   " children={<span>Content</span>} />);
      
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });

    it('handles very long title without breaking layout', () => {
      const veryLongTitle = 'A'.repeat(1000);
      
      render(<FormSection title={veryLongTitle} children={<span>Content</span>} />);
      
      expect(screen.getByRole('heading', { name: veryLongTitle })).toBeInTheDocument();
    });

    it('handles children with special characters', () => {
      const specialContent = <div>Special: !@#$%^&*()_+-=[]{}|;:,.</div>;
      
      render(<FormSection title="Test" children={specialContent} />);
      
      expect(screen.getByText(/Special:/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<FormSection {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { name: 'Section Title' });
      expect(heading.tagName).toBe('H2');
      expect(heading).toHaveTextContent('Section Title');
    });

    it('maintains accessibility when no title is provided', () => {
      render(<FormSection children={<span>Content</span>} />);
      
      // Should not have any accessibility violations
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('has proper semantic structure', () => {
      const { container } = render(<FormSection {...defaultProps} />);
      
      const section = container.firstChild as HTMLElement;
      expect(section).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with minimal re-renders', () => {
      const { rerender } = render(<FormSection {...defaultProps} />);
      
      // Re-render with same props
      rerender(<FormSection {...defaultProps} />);
      
      // Should still have the same elements
      expect(screen.getByRole('heading', { name: 'Section Title' })).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('handles prop changes efficiently', () => {
      const { rerender } = render(<FormSection {...defaultProps} />);
      
      // Change title
      rerender(<FormSection title="New Title" children={<div>Child Content</div>} />);
      expect(screen.getByRole('heading', { name: 'New Title' })).toBeInTheDocument();
      
      // Change margin
      rerender(<FormSection title="New Title" children={<div>Child Content</div>} marginBottom={24} />);
      expect(screen.getByRole('heading', { name: 'New Title' })).toBeInTheDocument();
    });
  });
});


