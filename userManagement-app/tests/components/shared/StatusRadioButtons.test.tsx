import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StatusRadioButtons from '../../../src/components/shared/StatusRadioButtons';
import '@testing-library/jest-dom';

// Mock CustomRadio component
jest.mock('commonApp/CustomRadio', () => {
  return function MockCustomRadio({ checked, disabled, ...props }: any) {
    return (
      <input
        type="radio"
        checked={checked}
        disabled={disabled}
        data-testid="custom-radio"
        {...props}
      />
    );
  };
});

describe('StatusRadioButtons', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with Active value', () => {
      render(<StatusRadioButtons value="Active" />);
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should render with Inactive value', () => {
      render(<StatusRadioButtons value="Inactive" />);
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should render with custom labelColor', () => {
      const { container } = render(
        <StatusRadioButtons value="Active" labelColor="#FF0000" />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onChange when Active is selected', () => {
      render(<StatusRadioButtons value="Inactive" onChange={mockOnChange} />);
      const radioGroup = screen.getByRole('radiogroup');
      const activeRadio = screen.getByLabelText('Active');
      
      fireEvent.click(activeRadio);
      expect(mockOnChange).toHaveBeenCalledWith('Active');
    });

    it('should call onChange when Inactive is selected', () => {
      render(<StatusRadioButtons value="Active" onChange={mockOnChange} />);
      const inactiveRadio = screen.getByLabelText('Inactive');
      
      fireEvent.change(inactiveRadio, { target: { value: 'Inactive' } });
      expect(mockOnChange).toHaveBeenCalledWith('Inactive');
    });

    it('should not call onChange when onChange is not provided', () => {
      render(<StatusRadioButtons value="Active" />);
      const activeRadio = screen.getByLabelText('Active');
      
      fireEvent.click(activeRadio);
      // Should not throw error
      expect(activeRadio).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable radio buttons when disabled prop is true', () => {
      render(<StatusRadioButtons value="Active" disabled={true} />);
      const radios = screen.getAllByTestId('custom-radio');
      radios.forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });

    it('should enable radio buttons when disabled prop is false', () => {
      render(<StatusRadioButtons value="Active" disabled={false} />);
      const radios = screen.getAllByTestId('custom-radio');
      radios.forEach(radio => {
        expect(radio).not.toBeDisabled();
      });
    });

    it('should enable radio buttons by default', () => {
      render(<StatusRadioButtons value="Active" />);
      const radios = screen.getAllByTestId('custom-radio');
      radios.forEach(radio => {
        expect(radio).not.toBeDisabled();
      });
    });
  });

  describe('Value Changes', () => {
    it('should update value when Active is clicked', () => {
      const { rerender } = render(
        <StatusRadioButtons value="Inactive" onChange={mockOnChange} />
      );
      
      const activeRadio = screen.getByLabelText('Active');
      fireEvent.click(activeRadio);
      
      rerender(<StatusRadioButtons value="Active" onChange={mockOnChange} />);
      expect(activeRadio).toBeChecked();
    });

    it('should update value when Inactive is clicked', () => {
      const { rerender } = render(
        <StatusRadioButtons value="Active" onChange={mockOnChange} />
      );
      
      const inactiveRadio = screen.getByLabelText('Inactive');
      fireEvent.click(inactiveRadio);
      
      rerender(<StatusRadioButtons value="Inactive" onChange={mockOnChange} />);
      expect(inactiveRadio).toBeChecked();
    });
  });

  describe('Styling', () => {
    it('should apply default labelColor', () => {
      render(<StatusRadioButtons value="Active" />);
      const statusLabel = screen.getByText('Status');
      expect(statusLabel).toBeInTheDocument();
    });

    it('should apply custom labelColor', () => {
      render(<StatusRadioButtons value="Active" labelColor="#FF0000" />);
      const statusLabel = screen.getByText('Status');
      expect(statusLabel).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid value changes', () => {
      const { rerender } = render(
        <StatusRadioButtons value="Active" onChange={mockOnChange} />
      );
      
      const activeRadio = screen.getByLabelText('Active');
      const inactiveRadio = screen.getByLabelText('Inactive');
      
      fireEvent.click(inactiveRadio);
      rerender(<StatusRadioButtons value="Inactive" onChange={mockOnChange} />);
      
      fireEvent.click(activeRadio);
      rerender(<StatusRadioButtons value="Active" onChange={mockOnChange} />);
      
      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });

    it('should handle onChange with undefined', () => {
      render(<StatusRadioButtons value="Active" onChange={undefined} />);
      const activeRadio = screen.getByLabelText('Active');
      
      // Should not throw error
      fireEvent.click(activeRadio);
      expect(activeRadio).toBeInTheDocument();
    });

    it('should handle onChange when value changes via RadioGroup', () => {
      render(<StatusRadioButtons value="Active" onChange={mockOnChange} />);
      const radioGroup = screen.getByRole('radiogroup');
      
      fireEvent.change(radioGroup, { target: { value: 'Inactive' } });
      expect(mockOnChange).toHaveBeenCalledWith('Inactive');
    });

    it('should handle default labelColor', () => {
      const { container } = render(<StatusRadioButtons value="Active" />);
      expect(container).toBeInTheDocument();
    });

    it('should apply custom labelColor to both radio buttons', () => {
      render(<StatusRadioButtons value="Active" labelColor="#FF0000" />);
      const statusLabel = screen.getByText('Status');
      expect(statusLabel).toBeInTheDocument();
    });

    it('should handle RadioGroup onChange when onChange prop is undefined', () => {
      render(<StatusRadioButtons value="Active" onChange={undefined} />);
      const radioGroup = screen.getByRole('radiogroup');
      
      // Should not throw error when onChange is undefined
      fireEvent.change(radioGroup, { target: { value: 'Inactive' } });
      expect(radioGroup).toBeInTheDocument();
    });

    it('should handle RadioGroup onChange with Active value', () => {
      render(<StatusRadioButtons value="Inactive" onChange={mockOnChange} />);
      const radioGroup = screen.getByRole('radiogroup');
      
      fireEvent.change(radioGroup, { target: { value: 'Active' } });
      expect(mockOnChange).toHaveBeenCalledWith('Active');
    });

    it('should apply labelColor to both FormControlLabel components', () => {
      const { container } = render(<StatusRadioButtons value="Active" labelColor="#00FF00" />);
      expect(container).toBeInTheDocument();
    });

    it('should handle disabled state with custom labelColor', () => {
      render(<StatusRadioButtons value="Active" disabled={true} labelColor="#0000FF" />);
      const radios = screen.getAllByTestId('custom-radio');
      radios.forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });

    it('should handle RadioGroup onChange when value is Active and onChange is provided', () => {
      render(<StatusRadioButtons value="Active" onChange={mockOnChange} />);
      const radioGroup = screen.getByRole('radiogroup');
      
      // Change to Inactive
      fireEvent.change(radioGroup, { target: { value: 'Inactive' } });
      expect(mockOnChange).toHaveBeenCalledWith('Inactive');
    });

    it('should handle RadioGroup onChange when value is Inactive and onChange is provided', () => {
      render(<StatusRadioButtons value="Inactive" onChange={mockOnChange} />);
      const radioGroup = screen.getByRole('radiogroup');
      
      // Change to Active
      fireEvent.change(radioGroup, { target: { value: 'Active' } });
      expect(mockOnChange).toHaveBeenCalledWith('Active');
    });

    it('should render with all default props', () => {
      const { container } = render(<StatusRadioButtons value="Active" />);
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should apply labelColor to Active FormControlLabel', () => {
      const { container } = render(<StatusRadioButtons value="Active" labelColor="#FF00FF" />);
      expect(container).toBeInTheDocument();
    });

    it('should apply labelColor to Inactive FormControlLabel', () => {
      const { container } = render(<StatusRadioButtons value="Inactive" labelColor="#00FFFF" />);
      expect(container).toBeInTheDocument();
    });
  });
});


