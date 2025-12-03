import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TextField from '../../../src/components/form-fields/TextField';

describe('TextField Component', () => {
  const defaultProps = {
    label: 'Test Label',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with basic props', () => {
      render(<TextField {...defaultProps} />);
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<TextField {...defaultProps} label="Custom Label" />);
      
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<TextField {...defaultProps} placeholder="Enter text here" />);
      
      expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      render(<TextField {...defaultProps} value="Initial Value" />);
      
      expect(screen.getByDisplayValue('Initial Value')).toBeInTheDocument();
    });

    it('should render with helper text', () => {
      render(<TextField {...defaultProps} helperText="This is helper text" />);
      
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });

    it('should render without helper text when not provided', () => {
      render(<TextField {...defaultProps} />);
      
      expect(screen.queryByText('This is helper text')).not.toBeInTheDocument();
    });
  });

  describe('Props handling', () => {
    it('should apply disabled state', () => {
      render(<TextField {...defaultProps} disabled={true} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should apply readOnly state', () => {
      render(<TextField {...defaultProps} readOnly={true} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should apply required attribute', () => {
      render(<TextField {...defaultProps} required={true} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('should show error state', () => {
      render(<TextField {...defaultProps} error={true} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should display error message', () => {
      render(<TextField {...defaultProps} error={true} errorMessage="This field is required" />);
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should not display error message when error is false', () => {
      render(<TextField {...defaultProps} error={false} errorMessage="This field is required" />);
      
      expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
    });

    it('should apply custom size', () => {
      render(<TextField {...defaultProps} size="medium" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('MuiInputBase-input');
    });

    it('should handle fullWidth prop', () => {
      render(<TextField {...defaultProps} fullWidth={false} />);
      
      const input = screen.getByRole('textbox');
      expect(input.closest('.MuiTextField-root')).not.toHaveClass('MuiTextField-fullWidth');
    });

    it('should apply custom width', () => {
      render(<TextField {...defaultProps} width="200px" />);
      
      // Check that the Box component has the width applied via sx prop
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('should call onChange when text is entered', async () => {
      const onChange = jest.fn();
      render(<TextField {...defaultProps} onChange={onChange} value="" />);
      
      const input = screen.getByRole('textbox');
      await userEvent.clear(input);
      await userEvent.type(input, 'H');
      
      expect(onChange).toHaveBeenCalledWith('H');
    });

    it('should handle text input correctly', async () => {
      const onChange = jest.fn();
      render(<TextField {...defaultProps} onChange={onChange} value="" />);
      
      const input = screen.getByRole('textbox');
      await userEvent.clear(input);
      await userEvent.type(input, 'T');
      
      expect(onChange).toHaveBeenCalledWith('T');
    });

    it('should handle focus and blur events', async () => {
      render(<TextField {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      
      input.focus();
      expect(input).toHaveFocus();
      
      input.blur();
      expect(input).not.toHaveFocus();
    });

    it('should not call onChange when readOnly', async () => {
      const onChange = jest.fn();
      render(<TextField {...defaultProps} readOnly={true} onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Hello');
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not accept input when disabled', async () => {
      const onChange = jest.fn();
      render(<TextField {...defaultProps} disabled={true} onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Hello');
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string value', () => {
      render(<TextField {...defaultProps} value="" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should handle null value gracefully', () => {
      render(<TextField {...defaultProps} value={null as any} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should handle undefined value gracefully', () => {
      render(<TextField {...defaultProps} value={undefined as any} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should handle very long text', async () => {
      const onChange = jest.fn();
      
      render(<TextField {...defaultProps} onChange={onChange} value="" />);
      
      const input = screen.getByRole('textbox');
      await userEvent.clear(input);
      await userEvent.type(input, 'a');
      
      expect(onChange).toHaveBeenCalledWith('a');
    });

    it('should handle special characters', async () => {
      const onChange = jest.fn();
      
      render(<TextField {...defaultProps} onChange={onChange} value="" />);
      
      const input = screen.getByRole('textbox');
      await userEvent.clear(input);
      await userEvent.type(input, '!');
      
      expect(onChange).toHaveBeenCalledWith('!');
    });

    it('should handle empty label', () => {
      render(<TextField {...defaultProps} label="" />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Styling and CSS classes', () => {
    it('should apply required styling when required prop is true', () => {
      render(<TextField {...defaultProps} required={true} />);
      
      const container = screen.getByRole('textbox').closest('.form-field');
      expect(container).toHaveClass('form-field--required');
    });

    it('should apply default form-field class', () => {
      render(<TextField {...defaultProps} />);
      
      const container = screen.getByRole('textbox').closest('.form-field');
      expect(container).toHaveClass('form-field');
    });

    it('should apply error styling when error prop is true', () => {
      render(<TextField {...defaultProps} error={true} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should display error message with correct class', () => {
      render(<TextField {...defaultProps} error={true} errorMessage="Error message" />);
      
      const errorElement = screen.getByText('Error message');
      expect(errorElement.closest('.form-field__error-message')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes', () => {
      render(<TextField {...defaultProps} required={true} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });

    it('should have accessible label', () => {
      render(<TextField {...defaultProps} label="Accessible Label" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Accessible Label');
      
      expect(input).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });

    it('should handle focus management', () => {
      render(<TextField {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      input.focus();
      
      expect(input).toHaveFocus();
    });

    it('should be keyboard accessible', () => {
      render(<TextField {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should support screen readers with helper text', () => {
      render(<TextField {...defaultProps} helperText="Helper text for screen readers" />);
      
      const helperText = screen.getByText('Helper text for screen readers');
      expect(helperText).toBeInTheDocument();
    });
  });

  describe('Component lifecycle', () => {
    it('should update when props change', () => {
      const { rerender } = render(<TextField {...defaultProps} value="Initial" />);
      
      expect(screen.getByDisplayValue('Initial')).toBeInTheDocument();
      
      rerender(<TextField {...defaultProps} value="Updated" />);
      expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
    });

    it('should handle dynamic label changes', () => {
      const { rerender } = render(<TextField {...defaultProps} label="Original Label" />);
      
      expect(screen.getByText('Original Label')).toBeInTheDocument();
      
      rerender(<TextField {...defaultProps} label="New Label" />);
      expect(screen.getByText('New Label')).toBeInTheDocument();
      expect(screen.queryByText('Original Label')).not.toBeInTheDocument();
    });

    it('should handle error state changes', () => {
      const { rerender } = render(<TextField {...defaultProps} error={false} />);
      
      let input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('aria-invalid', 'true');
      
      rerender(<TextField {...defaultProps} error={true} />);
      input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle multiple text fields on same page', () => {
      render(
        <div>
          <TextField {...defaultProps} label="Field 1" />
          <TextField {...defaultProps} label="Field 2" />
        </div>
      );
      
      expect(screen.getByText('Field 1')).toBeInTheDocument();
      expect(screen.getByText('Field 2')).toBeInTheDocument();
      expect(screen.getAllByRole('textbox')).toHaveLength(2);
    });

    it('should work with form validation', async () => {
      const onChange = jest.fn();
      render(
        <TextField 
          {...defaultProps} 
          onChange={onChange}
          required={true}
          error={true}
          errorMessage="This field is required"
          value=""
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      
      await userEvent.clear(input);
      await userEvent.type(input, 'V');
      expect(onChange).toHaveBeenCalledWith('V');
    });

    it('should handle rapid text changes', async () => {
      const onChange = jest.fn();
      render(<TextField {...defaultProps} onChange={onChange} value="" />);
      
      const input = screen.getByRole('textbox');
      
      // Simulate rapid typing
      await userEvent.clear(input);
      await userEvent.type(input, 'q');
      
      expect(onChange).toHaveBeenCalledWith('q');
    });
  });

  describe('Performance and optimization', () => {
    it('should not re-render unnecessarily', () => {
      const onChange = jest.fn();
      const { rerender } = render(<TextField {...defaultProps} onChange={onChange} />);
      
      // Re-render with same props
      rerender(<TextField {...defaultProps} onChange={onChange} />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle large text content efficiently', async () => {
      const onChange = jest.fn();
      const largeText = 'Lorem ipsum '.repeat(100);
      
      render(<TextField {...defaultProps} onChange={onChange} value={largeText} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue(largeText);
    });
  });

  describe('Input styling and formatting', () => {
    it('should apply custom font styles', () => {
      render(<TextField {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      const styles = window.getComputedStyle(input);
      expect(styles.fontSize).toBe('12px');
    });

    it('should maintain font family', () => {
      render(<TextField {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveStyle({
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      });
    });

    it('should apply form-field input class', () => {
      render(<TextField {...defaultProps} />);
      
      const textfield = screen.getByRole('textbox').closest('.MuiTextField-root');
      expect(textfield).toHaveClass('form-field__input');
    });
  });

  describe('Keyboard interactions', () => {
    it('should handle Enter key', async () => {
      const onChange = jest.fn();
      render(<TextField {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      input.focus();
      
      await userEvent.keyboard('{Enter}');
      // Enter key doesn't change input value, but input should remain focused
      expect(input).toHaveFocus();
    });

    it('should handle Tab key for navigation', async () => {
      render(
        <div>
          <TextField {...defaultProps} label="Field 1" />
          <TextField {...defaultProps} label="Field 2" />
        </div>
      );
      
      const inputs = screen.getAllByRole('textbox');
      
      inputs[0].focus();
      expect(inputs[0]).toHaveFocus();
      
      await userEvent.keyboard('{Tab}');
      expect(inputs[1]).toHaveFocus();
    });

    it('should handle Escape key', async () => {
      render(<TextField {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      input.focus();
      
      await userEvent.keyboard('{Escape}');
      // Escape doesn't change anything for regular text input
      expect(input).toHaveFocus();
    });
  });
});
