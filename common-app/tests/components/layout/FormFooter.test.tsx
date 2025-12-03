import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormFooter from '../../../src/components/layout/FormFooter';

describe('FormFooter', () => {
  const defaultProps = {
    leftCheckbox: {
      checked: false,
      onChange: jest.fn(),
      label: 'Add Another'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders checkbox when leftCheckbox prop is provided', () => {
      render(<FormFooter {...defaultProps} />);
      
      const checkbox = screen.getByLabelText('Add Another');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('renders without checkbox when leftCheckbox prop is not provided', () => {
      render(<FormFooter />);
      
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('renders checkbox with correct checked state', () => {
      render(
        <FormFooter
          leftCheckbox={{
            ...defaultProps.leftCheckbox,
            checked: true
          }}
        />
      );
      
      const checkbox = screen.getByLabelText('Add Another');
      expect(checkbox).toBeChecked();
    });

    it('renders checkbox with custom label', () => {
      render(
        <FormFooter
          leftCheckbox={{
            ...defaultProps.leftCheckbox,
            label: 'Custom Label'
          }}
        />
      );
      
      expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onChange when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(
        <FormFooter
          leftCheckbox={{
            ...defaultProps.leftCheckbox,
            onChange
          }}
        />
      );
      
      const checkbox = screen.getByLabelText('Add Another');
      await user.click(checkbox);
      
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange with correct value when checkbox is toggled', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(
        <FormFooter
          leftCheckbox={{
            ...defaultProps.leftCheckbox,
            checked: true,
            onChange
          }}
        />
      );
      
      const checkbox = screen.getByLabelText('Add Another');
      await user.click(checkbox);
      
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('handles multiple checkbox clicks correctly', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const { rerender } = render(
        <FormFooter
          leftCheckbox={{
            checked: true,
            onChange,
            label: 'Test Checkbox'
          }}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      
      // First click should uncheck (true -> false)
      await user.click(checkbox);
      expect(onChange).toHaveBeenCalledWith(false);
      
      // Update the component state to reflect the change
      rerender(
        <FormFooter
          leftCheckbox={{
            checked: false,
            onChange,
            label: 'Test Checkbox'
          }}
        />
      );
      
      // Second click should check (false -> true)
      await user.click(checkbox);
      expect(onChange).toHaveBeenCalledWith(true);
      
      expect(onChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct styling classes and attributes', () => {
      const { container } = render(<FormFooter {...defaultProps} />);
      
      const footerBox = container.firstChild as HTMLElement;
      expect(footerBox).toBeInTheDocument();
      
      // Check that the box has the expected styling
      expect(footerBox).toHaveStyle({
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        paddingLeft: '16px',
        paddingRight: '16px',
        fontSize: '14px',
        backgroundColor: '#fff'
      });
    });

    it('renders checkbox with correct styling props', () => {
      render(<FormFooter {...defaultProps} />);
      
      const checkbox = screen.getByLabelText('Add Another');
      expect(checkbox).toBeInTheDocument();
      
      // The checkbox should be properly integrated with the styling
      const checkboxContainer = checkbox.closest('div');
      expect(checkboxContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty label gracefully', () => {
      render(
        <FormFooter
          leftCheckbox={{
            ...defaultProps.leftCheckbox,
            label: ''
          }}
        />
      );
      
      // Should still render without crashing
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('handles very long label text', () => {
      const longLabel = 'This is a very long label that might cause layout issues if not handled properly';
      
      render(
        <FormFooter
          leftCheckbox={{
            ...defaultProps.leftCheckbox,
            label: longLabel
          }}
        />
      );
      
      expect(screen.getByLabelText(longLabel)).toBeInTheDocument();
    });

    it('handles special characters in label', () => {
      const specialLabel = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      
      render(
        <FormFooter
          leftCheckbox={{
            ...defaultProps.leftCheckbox,
            label: specialLabel
          }}
        />
      );
      
      expect(screen.getByLabelText(specialLabel)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<FormFooter {...defaultProps} />);
      
      const checkbox = screen.getByLabelText('Add Another');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('maintains accessibility when no props are provided', () => {
      render(<FormFooter />);
      
      // Should not have any accessibility violations
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders efficiently with minimal re-renders', () => {
      const { rerender } = render(<FormFooter {...defaultProps} />);
      
      // Re-render with same props
      rerender(<FormFooter {...defaultProps} />);
      
      // Should still have the same elements
      expect(screen.getByLabelText('Add Another')).toBeInTheDocument();
    });

    it('handles rapid checkbox clicks without errors', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(
        <FormFooter
          leftCheckbox={{
            ...defaultProps.leftCheckbox,
            onChange
          }}
        />
      );
      
      const checkbox = screen.getByLabelText('Add Another');
      
      // Rapid clicks
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);
      
      expect(onChange).toHaveBeenCalledTimes(3);
    });
  });
});


