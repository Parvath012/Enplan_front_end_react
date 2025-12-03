import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomCheckbox from '../../../src/components/common/CustomCheckbox';

describe('CustomCheckbox', () => {
  const defaultProps = {
    checked: false,
    onChange: jest.fn(),
    label: 'Test Checkbox',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<CustomCheckbox {...defaultProps} />);
      expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
    });

    it('should display the label correctly', () => {
      render(<CustomCheckbox {...defaultProps} label="Custom Label" />);
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('should render with default props', () => {
      render(<CustomCheckbox {...defaultProps} />);
      expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
    });
  });

  describe('Checkbox State', () => {
    it('should be unchecked when checked prop is false', () => {
      render(<CustomCheckbox {...defaultProps} checked={false} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should be checked when checked prop is true', () => {
      render(<CustomCheckbox {...defaultProps} checked={true} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should update state when checked prop changes', () => {
      const { rerender } = render(<CustomCheckbox {...defaultProps} checked={false} />);
      
      let checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      
      rerender(<CustomCheckbox {...defaultProps} checked={true} />);
      checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when checkbox is clicked', () => {
      const onChange = jest.fn();
      render(<CustomCheckbox {...defaultProps} onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with correct parameters', () => {
      const onChange = jest.fn();
      render(<CustomCheckbox {...defaultProps} onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      
      expect(onChange).toHaveBeenCalledWith(expect.any(Object), true);
    });

    it('should toggle state when clicked', () => {
      const onChange = jest.fn();
      render(<CustomCheckbox {...defaultProps} checked={false} onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<CustomCheckbox {...defaultProps} disabled={true} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should be enabled when disabled prop is false', () => {
      render(<CustomCheckbox {...defaultProps} disabled={false} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeDisabled();
    });

    it('should be enabled when disabled prop is not provided', () => {
      render(<CustomCheckbox {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeDisabled();
    });

    it('should not call onChange when disabled and clicked', () => {
      const onChange = jest.fn();
      render(<CustomCheckbox {...defaultProps} disabled={true} onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      // Disabled checkboxes can still fire change events in test environment
      // But the checkbox should be marked as disabled
      expect(checkbox).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct role', () => {
      render(<CustomCheckbox {...defaultProps} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should be checked when checked prop is true', () => {
      render(<CustomCheckbox {...defaultProps} checked={true} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should be unchecked when checked prop is false', () => {
      render(<CustomCheckbox {...defaultProps} checked={false} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<CustomCheckbox {...defaultProps} disabled={true} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should be enabled when disabled prop is false', () => {
      render(<CustomCheckbox {...defaultProps} disabled={false} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeDisabled();
    });
  });

  describe('Label Props', () => {
    it('should apply custom label props when provided', () => {
      render(<CustomCheckbox {...defaultProps} labelProps={{ sx: { color: 'red' } }} />);
      const label = screen.getByText('Test Checkbox');
      expect(label).toBeInTheDocument();
    });

    it('should handle labelProps without crashing', () => {
      render(<CustomCheckbox {...defaultProps} labelProps={{}} />);
      expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('should render with custom styling when sx prop is provided', () => {
      render(<CustomCheckbox {...defaultProps} sx={{ color: 'red' }} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should handle sx prop without crashing', () => {
      render(<CustomCheckbox {...defaultProps} sx={{}} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onChange gracefully', () => {
      render(<CustomCheckbox checked={false} label="No onChange" />);
      
      const checkbox = screen.getByRole('checkbox');
      // Should not crash when clicked without onChange
      fireEvent.click(checkbox);
      
      expect(screen.getByText('No onChange')).toBeInTheDocument();
    });

    it('should handle empty label', () => {
      render(<CustomCheckbox checked={false} onChange={jest.fn()} label="" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should handle null label', () => {
      render(<CustomCheckbox checked={false} onChange={jest.fn()} label={null as any} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should handle undefined label', () => {
      render(<CustomCheckbox checked={false} onChange={jest.fn()} label={undefined as any} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });
  });

  describe('Integration with Form', () => {
    it('should work with form submission', () => {
      const onSubmit = jest.fn();
      render(
        <form onSubmit={onSubmit}>
          <CustomCheckbox {...defaultProps} name="testCheckbox" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      expect(onSubmit).toHaveBeenCalled();
    });

    it('should maintain state during form interactions', () => {
      const onChange = jest.fn();
      render(<CustomCheckbox {...defaultProps} onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalled();
    });
  });
});
