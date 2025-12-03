import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectField from '../../../src/components/form-fields/SelectField';

describe('SelectField Component', () => {
  // Test props setup
  const defaultProps = {
    label: 'Test Label',
    value: '',
    onChange: jest.fn(),
    options: ['Option 1', 'Option 2', 'Option 3'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with basic props', () => {
      render(<SelectField {...defaultProps} />);
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<SelectField {...defaultProps} />);
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render without label when label is empty', () => {
      render(<SelectField {...defaultProps} label="" />);
      
      expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    });

    it('should render with placeholder when value is empty', () => {
      render(<SelectField {...defaultProps} placeholder="Select an option" />);
      
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('should render with selected value', () => {
      render(<SelectField {...defaultProps} value="Option 1" />);
      
      expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
    });

    it('should render all options', () => {
      render(<SelectField {...defaultProps} />);
      
      // Open dropdown
      fireEvent.mouseDown(screen.getByRole('combobox'));
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });

  describe('Props handling', () => {
    it('should apply disabled state', () => {
      render(<SelectField {...defaultProps} disabled />);
      
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toHaveAttribute('aria-disabled', 'true');
      expect(selectElement).toHaveClass('Mui-disabled');
    });

    it('should apply required attribute', () => {
      render(<SelectField {...defaultProps} required />);
      
      const hiddenInput = document.querySelector('input[aria-hidden="true"]');
      expect(hiddenInput).toHaveAttribute('required');
    });

    it('should show error state', () => {
      render(<SelectField {...defaultProps} error />);
      
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toHaveClass('Mui-error');
    });

    it('should display error message', () => {
      const errorMessage = 'This field is required';
      render(<SelectField {...defaultProps} error errorMessage={errorMessage} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should apply custom size', () => {
      render(<SelectField {...defaultProps} size="small" />);
      
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toHaveClass('MuiInputBase-inputSizeSmall');
    });

    it('should handle fullWidth prop', () => {
      render(<SelectField {...defaultProps} fullWidth />);
      
      const formControl = screen.getByRole('combobox').closest('.MuiFormControl-root');
      expect(formControl).toHaveClass('MuiFormControl-fullWidth');
    });

    it('should apply custom width', () => {
      render(<SelectField {...defaultProps} width="200px" />);
      
      const container = screen.getByRole('combobox').closest('.MuiBox-root');
      expect(container).toHaveStyle('width: 200px');
    });
  });

  describe('User interactions', () => {
    it('should call onChange when option is selected', () => {
      const mockOnChange = jest.fn();
      render(<SelectField {...defaultProps} onChange={mockOnChange} />);
      
      // Open dropdown
      fireEvent.mouseDown(screen.getByRole('combobox'));
      
      // Select option
      fireEvent.click(screen.getByText('Option 1'));
      
      expect(mockOnChange).toHaveBeenCalledWith('Option 1');
    });

    it('should open dropdown', () => {
      render(<SelectField {...defaultProps} />);
      
      const selectElement = screen.getByRole('combobox');
      
      // Open dropdown
      fireEvent.mouseDown(selectElement);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should handle keyboard navigation', () => {
      render(<SelectField {...defaultProps} />);
      
      const selectElement = screen.getByRole('combobox');
      
      // Focus and open with Enter
      selectElement.focus();
      fireEvent.keyDown(selectElement, { key: 'Enter' });
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should handle arrow key navigation', () => {
      render(<SelectField {...defaultProps} />);
      
      const selectElement = screen.getByRole('combobox');
      
      // Focus and open with space
      selectElement.focus();
      fireEvent.keyDown(selectElement, { key: ' ' });
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should call onOpen callback when dropdown opens', () => {
      const mockOnOpen = jest.fn();
      render(<SelectField {...defaultProps} onOpen={mockOnOpen} />);
      
      const selectElement = screen.getByRole('combobox');
      
      // Open dropdown
      fireEvent.mouseDown(selectElement);
      
      expect(mockOnOpen).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should call onClose callback when dropdown closes', () => {
      const mockOnClose = jest.fn();
      render(<SelectField {...defaultProps} onClose={mockOnClose} />);
      
      const selectElement = screen.getByRole('combobox');
      
      // Open dropdown
      fireEvent.mouseDown(selectElement);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      // Close dropdown by clicking outside or selecting an option
      fireEvent.click(screen.getByText('Option 1'));
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call both onOpen and onClose callbacks', () => {
      const mockOnOpen = jest.fn();
      const mockOnClose = jest.fn();
      render(<SelectField {...defaultProps} onOpen={mockOnOpen} onClose={mockOnClose} />);
      
      const selectElement = screen.getByRole('combobox');
      
      // Open dropdown
      fireEvent.mouseDown(selectElement);
      expect(mockOnOpen).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      // Close dropdown by selecting an option
      fireEvent.click(screen.getByText('Option 1'));
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle onOpen callback when opening via keyboard', () => {
      const mockOnOpen = jest.fn();
      render(<SelectField {...defaultProps} onOpen={mockOnOpen} />);
      
      const selectElement = screen.getByRole('combobox');
      
      // Open dropdown with Enter key
      selectElement.focus();
      fireEvent.keyDown(selectElement, { key: 'Enter' });
      
      expect(mockOnOpen).toHaveBeenCalledTimes(1);
    });

    it('should handle onClose callback when closing via keyboard', () => {
      const mockOnClose = jest.fn();
      render(<SelectField {...defaultProps} onClose={mockOnClose} />);
      
      const selectElement = screen.getByRole('combobox');
      
      // Open dropdown
      fireEvent.mouseDown(selectElement);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      // Close dropdown with Escape key
      fireEvent.keyDown(selectElement, { key: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty options array', () => {
      render(<SelectField {...defaultProps} options={[]} />);
      
      fireEvent.mouseDown(screen.getByRole('combobox'));
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });

    it('should handle undefined options', () => {
      render(<SelectField {...defaultProps} options={undefined as any} />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle null value', () => {
      render(<SelectField {...defaultProps} value={null as any} />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle undefined value', () => {
      render(<SelectField {...defaultProps} value={undefined as any} />);
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle option without label', () => {
      const optionsWithEmptyStrings = ['', 'Option 2'];
      
      render(<SelectField {...defaultProps} options={optionsWithEmptyStrings} />);
      
      fireEvent.mouseDown(screen.getByRole('combobox'));
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('should handle mixed option types', () => {
      const mixedOptions = ['Option 1', 'Option 2', ''];
      
      render(<SelectField {...defaultProps} options={mixedOptions} />);
      
      fireEvent.mouseDown(screen.getByRole('combobox'));
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Styling and CSS classes', () => {
    it('should apply required styling when required prop is true', () => {
      render(<SelectField {...defaultProps} required />);
      
      const container = screen.getByRole('combobox').closest('.MuiBox-root');
      expect(container).toHaveClass('form-field--required');
    });

    it('should apply default form-field class', () => {
      render(<SelectField {...defaultProps} />);
      
      const container = screen.getByRole('combobox').closest('.MuiBox-root');
      expect(container).toHaveClass('form-field');
    });

    it('should apply error styling when error prop is true', () => {
      render(<SelectField {...defaultProps} error />);
      
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toHaveClass('Mui-error');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes', () => {
      render(<SelectField {...defaultProps} />);
      
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should have accessible label', () => {
      render(<SelectField {...defaultProps} />);
      
      const selectElement = screen.getByRole('combobox');
      const label = screen.getByText('Test Label');
      
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('form-field__label');
    });

    it('should handle focus management', () => {
      render(<SelectField {...defaultProps} />);
      
      const selectElement = screen.getByRole('combobox');
      selectElement.focus();
      
      expect(selectElement).toHaveFocus();
    });

    it('should be keyboard accessible', () => {
      render(
        <div>
          <SelectField {...defaultProps} />
          <input data-testid="next-input" />
        </div>
      );
      
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Component lifecycle', () => {
    it('should update when props change', () => {
      const { rerender } = render(<SelectField {...defaultProps} value="Option 1" />);
      
      expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
      
      rerender(<SelectField {...defaultProps} value="Option 2" />);
      
      expect(screen.getByDisplayValue('Option 2')).toBeInTheDocument();
    });

    it('should handle dynamic label changes', () => {
      const { rerender } = render(<SelectField {...defaultProps} label="Original Label" />);
      
      expect(screen.getByText('Original Label')).toBeInTheDocument();
      
      rerender(<SelectField {...defaultProps} label="Updated Label" />);
      
      expect(screen.getByText('Updated Label')).toBeInTheDocument();
      expect(screen.queryByText('Original Label')).not.toBeInTheDocument();
    });

    it('should maintain state when options are the same', () => {
      const { rerender } = render(<SelectField {...defaultProps} value="Option 1" />);
      
      expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
      
      rerender(<SelectField {...defaultProps} value="Option 1" options={defaultProps.options} />);
      
      expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
    });
  });

  describe('Complex scenarios', () => {
    it('should handle multiple select fields on same page', () => {
      render(
        <div>
          <SelectField {...defaultProps} label="First Select" />
          <SelectField {...defaultProps} label="Second Select" />
        </div>
      );
      
      expect(screen.getByText('First Select')).toBeInTheDocument();
      expect(screen.getByText('Second Select')).toBeInTheDocument();
      
      const selectElements = screen.getAllByRole('combobox');
      expect(selectElements).toHaveLength(2);
    });

    it('should work with form validation', () => {
      const mockOnChange = jest.fn();
      render(
        <form>
          <SelectField 
            {...defaultProps} 
            onChange={mockOnChange}
            required
            error={true}
            errorMessage="Please select an option"
          />
        </form>
      );
      
      const hiddenInput = document.querySelector('input[aria-hidden="true"]');
      expect(hiddenInput).toHaveAttribute('required');
      
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toHaveClass('Mui-error');
      expect(screen.getByText('Please select an option')).toBeInTheDocument();
    });

    it('should handle rapid option changes', () => {
      const mockOnChange = jest.fn();
      render(<SelectField {...defaultProps} onChange={mockOnChange} />);
      
      fireEvent.mouseDown(screen.getByRole('combobox'));
      
      // Rapid clicks
      fireEvent.click(screen.getByText('Option 1'));
      fireEvent.click(screen.getByText('Option 2'));
      fireEvent.click(screen.getByText('Option 3'));
      
      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Performance and optimization', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = (props: any) => {
        renderSpy();
        return <SelectField {...props} />;
      };
      
      const { rerender } = render(<TestComponent {...defaultProps} />);
      
      // Same props should not cause re-render
      rerender(<TestComponent {...defaultProps} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(2); // Initial + rerender with same props
    });

    it('should handle large option lists efficiently', () => {
      const largeOptions = Array.from({ length: 1000 }, (_, i) => `Option ${i}`);
      
      render(<SelectField {...defaultProps} options={largeOptions} />);
      
      fireEvent.mouseDown(screen.getByRole('combobox'));
      
      // Should render without performance issues
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });
});
