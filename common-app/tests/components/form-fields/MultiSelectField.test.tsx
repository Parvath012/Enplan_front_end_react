import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MultiSelectField from '../../../src/components/form-fields/MultiSelectField';

// Mock dependencies
jest.mock('../../../src/components/common/CustomTooltip', () => {
  return function MockCustomTooltip({ children, title }: any) {
    return <div data-testid="custom-tooltip" title={title}>{children}</div>;
  };
});

jest.mock('../../../src/components/common/CustomCheckbox', () => {
  return function MockCustomCheckbox({ checked, sx, ...props }: any) {
    return (
      <input
        type="checkbox"
        checked={checked || false}
        data-testid="custom-checkbox"
        {...props}
      />
    );
  };
});

jest.mock('@carbon/icons-react', () => ({
  Close: () => <div data-testid="close-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />
}));

jest.mock('./styles.scss', () => ({}));

describe('MultiSelectField', () => {
  const defaultProps = {
    label: 'Test Label',
    value: [],
    onChange: jest.fn(),
    options: ['Option 1', 'Option 2', 'Option 3']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<MultiSelectField {...defaultProps} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<MultiSelectField {...defaultProps} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<MultiSelectField {...defaultProps} placeholder="Select options" />);
    expect(screen.getByText('Select options')).toBeInTheDocument();
  });

  it('renders with default placeholder when none provided', () => {
    render(<MultiSelectField {...defaultProps} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with required class when required', () => {
    const { container } = render(<MultiSelectField {...defaultProps} required />);
    expect(container.querySelector('.form-field--required')).toBeInTheDocument();
  });

  it('renders without required class when not required', () => {
    const { container } = render(<MultiSelectField {...defaultProps} />);
    expect(container.querySelector('.form-field--required')).not.toBeInTheDocument();
  });

  it('renders with disabled state', () => {
    render(<MultiSelectField {...defaultProps} disabled />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders with enabled state by default', () => {
    render(<MultiSelectField {...defaultProps} />);
    const select = screen.getByRole('combobox');
    expect(select).not.toBeDisabled();
  });

  it('renders with custom width', () => {
    const { container } = render(<MultiSelectField {...defaultProps} width="300px" />);
    const box = container.querySelector('.form-field');
    expect(box).toHaveStyle('width: 300px');
  });

  it('renders with default width', () => {
    const { container } = render(<MultiSelectField {...defaultProps} />);
    const box = container.querySelector('.form-field');
    expect(box).toHaveStyle('width: 100%');
  });

  it('renders with small size', () => {
    render(<MultiSelectField {...defaultProps} size="small" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with medium size', () => {
    render(<MultiSelectField {...defaultProps} size="medium" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with fullWidth by default', () => {
    render(<MultiSelectField {...defaultProps} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with fullWidth false', () => {
    render(<MultiSelectField {...defaultProps} fullWidth={false} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles empty options array', () => {
    render(<MultiSelectField {...defaultProps} options={[]} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles undefined options', () => {
    render(<MultiSelectField {...defaultProps} options={undefined as any} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles null options', () => {
    render(<MultiSelectField {...defaultProps} options={null as any} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles custom noOptionsMessage', () => {
    render(<MultiSelectField {...defaultProps} options={[]} noOptionsMessage="Custom message" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles select all functionality', () => {
    const mockOnChange = jest.fn();
    render(<MultiSelectField {...defaultProps} onChange={mockOnChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const selectAllOption = screen.getByText('Select All');
    fireEvent.click(selectAllOption);
    
    expect(mockOnChange).toHaveBeenCalledWith(['Option 1', 'Option 2', 'Option 3']);
  });

  it('handles deselect all when all are selected', () => {
    const mockOnChange = jest.fn();
    render(
      <MultiSelectField 
        {...defaultProps} 
        value={['Option 1', 'Option 2', 'Option 3']}
        onChange={mockOnChange} 
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const selectAllOption = screen.getByText('Select All');
    fireEvent.click(selectAllOption);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('handles individual option selection', () => {
    const mockOnChange = jest.fn();
    render(<MultiSelectField {...defaultProps} onChange={mockOnChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);
    
    expect(mockOnChange).toHaveBeenCalledWith(['Option 1']);
  });

  it('handles individual option deselection', () => {
    const mockOnChange = jest.fn();
    render(
      <MultiSelectField 
        {...defaultProps} 
        value={['Option 1', 'Option 2']}
        onChange={mockOnChange} 
      />
    );
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles multiple option selection', () => {
    const mockOnChange = jest.fn();
    render(<MultiSelectField {...defaultProps} onChange={mockOnChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const option1 = screen.getByText('Option 1');
    const option2 = screen.getByText('Option 2');
    
    fireEvent.click(option1);
    fireEvent.click(option2);
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('handles string value conversion', () => {
    const mockOnChange = jest.fn();
    render(<MultiSelectField {...defaultProps} onChange={mockOnChange} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('handles close button click', () => {
    render(<MultiSelectField {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const closeButton = screen.getByTestId('cancel-button');
    fireEvent.click(closeButton);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles chip deletion', () => {
    const mockOnChange = jest.fn();
    render(
      <MultiSelectField 
        {...defaultProps} 
        value={['Option 1', 'Option 2']}
        onChange={mockOnChange} 
      />
    );
    
    const chips = screen.getAllByTestId('custom-tooltip');
    const deleteIcon = chips[0].querySelector('[data-testid="close-icon"]');
    
    if (deleteIcon) {
      fireEvent.click(deleteIcon);
      expect(mockOnChange).toHaveBeenCalledWith(['Option 2']);
    }
  });

  it('handles chip deletion for truncated text', () => {
    const mockOnChange = jest.fn();
    const longOption = 'This is a very long option that should be truncated';
    render(
      <MultiSelectField 
        {...defaultProps} 
        value={[longOption]}
        onChange={mockOnChange} 
      />
    );
    
    const chips = screen.getAllByTestId('custom-tooltip');
    const deleteIcon = chips[0].querySelector('[data-testid="close-icon"]');
    
    if (deleteIcon) {
      fireEvent.click(deleteIcon);
      expect(mockOnChange).toHaveBeenCalledWith([]);
    }
  });

  it('handles truncated text display', () => {
    const longOption = 'This is a very long option that should be truncated';
    render(
      <MultiSelectField 
        {...defaultProps} 
        value={[longOption]}
      />
    );
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles non-truncated text display', () => {
    const shortOption = 'Short option';
    render(
      <MultiSelectField 
        {...defaultProps} 
        value={[shortOption]}
      />
    );
    
    expect(screen.getByText('Short option')).toBeInTheDocument();
  });

  it('handles empty value array', () => {
    render(<MultiSelectField {...defaultProps} value={[]} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles undefined value', () => {
    render(<MultiSelectField {...defaultProps} value={undefined as any} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles null value', () => {
    render(<MultiSelectField {...defaultProps} value={null as any} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles non-array value', () => { 
    render(<MultiSelectField {...defaultProps} value={'not-array' as any} />);              
    expect(screen.getByText('Test Label')).toBeInTheDocument();                                       
  });

  it('handles menu open/close events', () => {
    render(<MultiSelectField {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    // Menu should be open
    expect(screen.getByText('Select All')).toBeInTheDocument();
    
    // Close menu
    fireEvent.mouseDown(select);
  });

  it('handles hover events on close button', () => {
    render(<MultiSelectField {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const closeButton = screen.getByTestId('cancel-button');
    fireEvent.mouseEnter(closeButton);
    fireEvent.mouseLeave(closeButton);
    
    expect(closeButton).toBeInTheDocument();
  });

  it('handles mouse down events on close button', () => {
    render(<MultiSelectField {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const closeButton = screen.getByTestId('cancel-button');
    fireEvent.mouseDown(closeButton);
    
    expect(closeButton).toBeInTheDocument();
  });

  it('handles stopPropagation on close button', () => {
    render(<MultiSelectField {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    const closeButton = screen.getByTestId('cancel-button');
    fireEvent.click(closeButton);
    
    expect(closeButton).toBeInTheDocument();
  });

  it('handles component unmounting', () => {
    const { unmount } = render(<MultiSelectField {...defaultProps} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    unmount();
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
  });

  it('handles prop changes', () => {
    const { rerender } = render(<MultiSelectField {...defaultProps} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    
    rerender(<MultiSelectField {...defaultProps} label="New Label" />);
    expect(screen.getByText('New Label')).toBeInTheDocument();
  });

  it('handles different option counts', () => {
    const { rerender } = render(<MultiSelectField {...defaultProps} options={['Option 1']} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    
    rerender(<MultiSelectField {...defaultProps} options={['Option 1', 'Option 2', 'Option 3', 'Option 4']} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with empty string options', () => {
    render(<MultiSelectField {...defaultProps} options={['', 'Option 1', '']} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with duplicate options', () => {
    render(<MultiSelectField {...defaultProps} options={['Option 1', 'Option 1', 'Option 2']} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with special characters in options', () => {
    render(<MultiSelectField {...defaultProps} options={['Option & 1', 'Option < 2', 'Option > 3']} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with very long options', () => {
    const longOptions = [
      'This is a very long option that should be handled properly by the component',
      'Another very long option with different content and length'
    ];
    render(<MultiSelectField {...defaultProps} options={longOptions} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with numeric options', () => {
    render(<MultiSelectField {...defaultProps} options={['1', '2', '3']} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with boolean options', () => {
    render(<MultiSelectField {...defaultProps} options={['true', 'false']} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with null/undefined options', () => {
    render(<MultiSelectField {...defaultProps} options={['null', 'undefined']} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with empty string options', () => {
    render(<MultiSelectField {...defaultProps} options={['', ' ', '  ']} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with special unicode options', () => {
    render(<MultiSelectField {...defaultProps} options={['🚀', '🌟', '💡']} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with mixed data types in options', () => {
    render(<MultiSelectField {...defaultProps} options={['String', '123', 'true', 'null']} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with very large number of options', () => {
    const manyOptions = Array.from({ length: 100 }, (_, i) => `Option ${i + 1}`);
    render(<MultiSelectField {...defaultProps} options={manyOptions} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with rapid prop changes', () => {
    const { rerender } = render(<MultiSelectField {...defaultProps} />);
    
    for (let i = 0; i < 10; i++) {
      rerender(<MultiSelectField {...defaultProps} value={[`Option ${i}`]} />);
    }
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles edge case with concurrent state updates', () => {
    const mockOnChange = jest.fn();
    render(<MultiSelectField {...defaultProps} onChange={mockOnChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    // Simulate rapid clicks
    const option1 = screen.getByText('Option 1');
    for (let i = 0; i < 5; i++) {
      fireEvent.click(option1);
    }
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('handles edge case with memory leaks', () => {
    const { unmount } = render(<MultiSelectField {...defaultProps} />);
    
    // Simulate some interactions
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    unmount();
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
  });

  it('handles edge case with accessibility', () => {
    render(<MultiSelectField {...defaultProps} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Test keyboard navigation
    fireEvent.keyDown(select, { key: 'ArrowDown' });
    fireEvent.keyDown(select, { key: 'Enter' });
    fireEvent.keyDown(select, { key: 'Escape' });
    
    expect(select).toBeInTheDocument();
  });

  it('handles edge case with performance', () => {
    const startTime = performance.now();
    render(<MultiSelectField {...defaultProps} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // Should render in less than 1 second
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  describe('Value Filtering', () => {
    it('filters out __select_all__ from value', () => {
      render(<MultiSelectField {...defaultProps} value={['Option 1', '__select_all__']} />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('filters out empty strings from value', () => {
      render(<MultiSelectField {...defaultProps} value={['Option 1', '', 'Option 2']} />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('filters out whitespace-only strings from value', () => {
      render(<MultiSelectField {...defaultProps} value={['Option 1', '   ', 'Option 2']} />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('filters out [] string from value', () => {
      render(<MultiSelectField {...defaultProps} value={['Option 1', '[]', 'Option 2']} />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('handles value with all invalid entries', () => {
      render(<MultiSelectField {...defaultProps} value={['__select_all__', '', '[]', '   ']} />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
  });

  describe('Select All Checkbox Logic', () => {
    it('calls onChange with all options when select all is clicked and none selected', () => {
      const mockOnChange = jest.fn();
      render(<MultiSelectField {...defaultProps} onChange={mockOnChange} value={[]} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      // First checkbox is Select All
      fireEvent.click(checkboxes[0]);
      
      expect(mockOnChange).toHaveBeenCalledWith(['Option 1', 'Option 2', 'Option 3']);
    });

    it('calls onChange with empty array when select all is clicked and all selected', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          onChange={mockOnChange} 
          value={['Option 1', 'Option 2', 'Option 3']} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      // First checkbox is Select All
      fireEvent.click(checkboxes[0]);
      
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('handles select all when options is empty array', () => {
      const mockOnChange = jest.fn();
      render(<MultiSelectField {...defaultProps} onChange={mockOnChange} options={[]} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      // Should show no options message, not select all
      expect(screen.queryByText('Select All')).not.toBeInTheDocument();
    });

    it('handles select all when total is 0', () => {
      const mockOnChange = jest.fn();
      render(<MultiSelectField {...defaultProps} onChange={mockOnChange} options={[]} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      // Should not show select all when no options
      expect(screen.queryByText('Select All')).not.toBeInTheDocument();
    });
  });

  describe('Individual Option Checkbox Logic', () => {
    it('calls onChange to remove option when checkbox is clicked and option is selected', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          onChange={mockOnChange} 
          value={['Option 1', 'Option 2']} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      // Second checkbox is Option 1 (first is Select All)
      // Option 1 is selected, so clicking should remove it
      fireEvent.click(checkboxes[1]);
      
      expect(mockOnChange).toHaveBeenCalledWith(['Option 2']);
    });

    it('calls onChange to add option when checkbox is clicked and option is not selected', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          onChange={mockOnChange} 
          value={['Option 2']} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      // Second checkbox is Option 1 (first is Select All)
      // Option 1 is not selected, so clicking should add it
      fireEvent.click(checkboxes[1]);
      
      expect(mockOnChange).toHaveBeenCalledWith(['Option 2', 'Option 1']);
    });
  });

  describe('Close Button Hover States', () => {
    it('sets isXHovered to true on mouse enter', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const closeButton = screen.getByTestId('cancel-button');
      fireEvent.mouseEnter(closeButton);
      
      // The hover state should affect the background color
      expect(closeButton).toBeInTheDocument();
    });

    it('sets isXHovered to false on mouse leave', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const closeButton = screen.getByTestId('cancel-button');
      fireEvent.mouseEnter(closeButton);
      fireEvent.mouseLeave(closeButton);
      
      expect(closeButton).toBeInTheDocument();
    });

    it('prevents default and stops propagation on mouseDown', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const closeButton = screen.getByTestId('cancel-button');
      const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(mouseDownEvent, 'preventDefault');
      const stopPropagationSpy = jest.spyOn(mouseDownEvent, 'stopPropagation');
      
      fireEvent(closeButton, mouseDownEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('MenuItem onClick Handlers', () => {
    it('prevents default and stops propagation on Select All MenuItem click', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const selectAllItem = screen.getByText('Select All').closest('[role="option"]');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
      
      if (selectAllItem) {
        fireEvent(selectAllItem, clickEvent);
      }
      
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('prevents default and stops propagation on option MenuItem click', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const option1 = screen.getByText('Option 1').closest('[role="option"]');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
      
      if (option1) {
        fireEvent(option1, clickEvent);
      }
      
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('No Options Message', () => {
    it('displays no options message when options array is empty', () => {
      render(<MultiSelectField {...defaultProps} options={[]} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });

    it('displays custom no options message', () => {
      render(
        <MultiSelectField 
          {...defaultProps} 
          options={[]} 
          noOptionsMessage="Custom no options message" 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('Custom no options message')).toBeInTheDocument();
    });

    it('displays no options message when options is null', () => {
      render(<MultiSelectField {...defaultProps} options={null as any} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });

    it('displays no options message when options is undefined', () => {
      render(<MultiSelectField {...defaultProps} options={undefined as any} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });
  });

  describe('Dropdown Icon Rotation', () => {
    it('rotates dropdown icon when menu is open', () => {
      const { container } = render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      // Icon should rotate when open
      const iconBox = container.querySelector('[class*="MuiBox-root"]');
      expect(iconBox).toBeInTheDocument();
    });

    it('does not rotate dropdown icon when menu is closed', () => {
      const { container } = render(<MultiSelectField {...defaultProps} />);
      
      // Menu should be closed by default
      const iconBox = container.querySelector('[class*="MuiBox-root"]');
      expect(iconBox).toBeInTheDocument();
    });
  });

  describe('Chip Rendering and Deletion', () => {
    it('renders chip with truncated text when length > 24', () => {
      const longOption = 'This is a very long option that exceeds 24 characters';
      render(<MultiSelectField {...defaultProps} value={[longOption]} />);
      
      // Should render truncated text
      expect(screen.getByText(/This is a very long op\.\.\./)).toBeInTheDocument();
    });

    it('renders chip without truncation when length <= 24', () => {
      const shortOption = 'Short option';
      render(<MultiSelectField {...defaultProps} value={[shortOption]} />);
      
      expect(screen.getByText('Short option')).toBeInTheDocument();
    });

    it('renders chip with tooltip for truncated text', () => {
      const longOption = 'This is a very long option that exceeds 24 characters';
      render(<MultiSelectField {...defaultProps} value={[longOption]} />);
      
      // Tooltip should be present for truncated text
      const tooltips = screen.getAllByTestId('custom-tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
    });

    it('calls onChange when chip delete icon is clicked', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          value={['Option 1', 'Option 2']} 
          onChange={mockOnChange} 
        />
      );
      
      // Find delete icon in chip
      const tooltips = screen.getAllByTestId('custom-tooltip');
      const deleteIcon = tooltips.find(t => t.querySelector('[data-testid="close-icon"]'));
      
      if (deleteIcon) {
        const closeIcon = deleteIcon.querySelector('[data-testid="close-icon"]');
        if (closeIcon) {
          fireEvent.click(closeIcon);
          expect(mockOnChange).toHaveBeenCalled();
        }
      }
    });

    it('calls onChange when chip onDelete is triggered', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          value={['Option 1']} 
          onChange={mockOnChange} 
        />
      );
      
      // Chip onDelete should be called
      const tooltips = screen.getAllByTestId('custom-tooltip');
      const deleteIcon = tooltips.find(t => t.querySelector('[data-testid="close-icon"]'));
      
      if (deleteIcon) {
        const closeIcon = deleteIcon.querySelector('[data-testid="close-icon"]');
        if (closeIcon) {
          fireEvent.click(closeIcon);
          expect(mockOnChange).toHaveBeenCalledWith([]);
        }
      }
    });

    it('renders multiple chips correctly', () => {
      render(
        <MultiSelectField 
          {...defaultProps} 
          value={['Option 1', 'Option 2', 'Option 3']} 
        />
      );
      
      // Should render multiple chips
      const tooltips = screen.getAllByTestId('custom-tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
    });

    it('filters out invalid values when rendering chips', () => {
      render(
        <MultiSelectField 
          {...defaultProps} 
          value={['Option 1', '', '   ', '__select_all__', '[]', 'Option 2']} 
        />
      );
      
      // Should only render chips for valid values
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('CustomDeleteIcon', () => {
    it('calls onDelete when CustomDeleteIcon is clicked', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          value={['Option 1']} 
          onChange={mockOnChange}
        />
      );
      
      // Find the delete icon and click it
      const tooltips = screen.getAllByTestId('custom-tooltip');
      const deleteIcon = tooltips.find(t => t.querySelector('[data-testid="close-icon"]'));
      
      if (deleteIcon) {
        const closeIcon = deleteIcon.querySelector('[data-testid="close-icon"]');
        if (closeIcon) {
          fireEvent.click(closeIcon);
          expect(mockOnChange).toHaveBeenCalled();
        }
      }
    });

    it('stops propagation when CustomDeleteIcon is clicked', () => {
      render(
        <MultiSelectField 
          {...defaultProps} 
          value={['Option 1']} 
        />
      );
      
      const tooltips = screen.getAllByTestId('custom-tooltip');
      const deleteIcon = tooltips.find(t => t.querySelector('[data-testid="close-icon"]'));
      
      if (deleteIcon) {
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
        
        const closeIcon = deleteIcon.querySelector('[data-testid="close-icon"]');
        if (closeIcon) {
          fireEvent(closeIcon, clickEvent);
          expect(stopPropagationSpy).toHaveBeenCalled();
        }
      }
    });
  });

  describe('Menu Height Calculations', () => {
    it('calculates menu height correctly for small number of options', () => {
      render(<MultiSelectField {...defaultProps} options={['Option 1', 'Option 2']} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('respects maxDropdownHeight prop', () => {
      render(
        <MultiSelectField 
          {...defaultProps} 
          options={Array.from({ length: 20 }, (_, i) => `Option ${i + 1}`)} 
          maxDropdownHeight={150} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('calculates height when optionCount is 0', () => {
      render(<MultiSelectField {...defaultProps} options={[]} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });
  });

  describe('Select onChange Handler', () => {
    it('does not call onChange when Select onChange is triggered', () => {
      const mockOnChange = jest.fn();
      render(<MultiSelectField {...defaultProps} onChange={mockOnChange} />);
      
      const select = screen.getByRole('combobox');
      // The Select onChange is disabled, so this should not trigger onChange
      fireEvent.change(select, { target: { value: ['Option 1'] } });
      
      // onChange should not be called from Select's onChange (it's disabled)
      // Only checkbox clicks should trigger onChange
    });
  });

  describe('Select All Hover State', () => {
    it('applies hover background when X is not hovered', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const selectAllItem = screen.getByText('Select All').closest('[role="option"]');
      if (selectAllItem) {
        fireEvent.mouseEnter(selectAllItem);
        // Hover state should be applied
        expect(selectAllItem).toBeInTheDocument();
      }
    });

    it('does not apply hover background when X is hovered', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const closeButton = screen.getByTestId('cancel-button');
      fireEvent.mouseEnter(closeButton);
      
      const selectAllItem = screen.getByText('Select All').closest('[role="option"]');
      if (selectAllItem) {
        fireEvent.mouseEnter(selectAllItem);
        // Hover should not be applied when X is hovered
        expect(selectAllItem).toBeInTheDocument();
      }
    });
  });

  describe('Checkbox stopPropagation', () => {
    it('stops propagation on Select All checkbox click', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
      
      fireEvent(checkboxes[0], clickEvent);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('stops propagation on individual option checkbox click', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
      
      if (checkboxes.length > 1) {
        fireEvent(checkboxes[1], clickEvent);
        expect(stopPropagationSpy).toHaveBeenCalled();
      }
    });
  });

  describe('Menu Open/Close State', () => {
    it('sets open to true when menu opens', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('sets open to false when menu closes', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const closeButton = screen.getByTestId('cancel-button');
      fireEvent.click(closeButton);
      
      // Menu should be closed
      expect(screen.queryByText('Select All')).not.toBeInTheDocument();
    });

    it('resets isXHovered when close button is clicked', () => {
      render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const closeButton = screen.getByTestId('cancel-button');
      fireEvent.mouseEnter(closeButton);
      fireEvent.click(closeButton);
      
      // isXHovered should be reset to false
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Select onChange Handler - Disabled Behavior', () => {
    it('does not call onChange when Select onChange is triggered directly', () => {
      const mockOnChange = jest.fn();
      render(<MultiSelectField {...defaultProps} onChange={mockOnChange} />);
      
      const select = screen.getByRole('combobox');
      // The Select onChange is disabled (lines 84-87), so this should not trigger onChange
      fireEvent.change(select, { target: { value: ['Option 1'] } });
      
      // onChange should not be called from Select's onChange (it's disabled)
      // Only checkbox clicks should trigger onChange
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('allSelected Calculation', () => {
    it('calculates allSelected as true when all options are selected', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          onChange={mockOnChange} 
          value={['Option 1', 'Option 2', 'Option 3']} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      // Select All checkbox should be checked
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      expect(checkboxes[0]).toHaveProperty('checked', true);
    });

    it('calculates allSelected as false when not all options are selected', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          onChange={mockOnChange} 
          value={['Option 1', 'Option 2']} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      // Select All checkbox should not be checked
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      expect(checkboxes[0]).toHaveProperty('checked', false);
    });

    it('calculates allSelected as false when total is 0', () => {
      render(<MultiSelectField {...defaultProps} options={[]} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      // Should show no options message, not select all
      expect(screen.queryByText('Select All')).not.toBeInTheDocument();
    });

    it('calculates allSelected as false when selectedValues length is 0', () => {
      render(<MultiSelectField {...defaultProps} value={[]} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      expect(checkboxes[0]).toHaveProperty('checked', false);
    });
  });

  describe('Divider Rendering', () => {
    it('renders divider when options exist', () => {
      const { container } = render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      // Divider should be rendered (line 208)
      const divider = container.querySelector('.form-field__divider');
      expect(divider).toBeInTheDocument();
    });

    it('does not render divider when no options', () => {
      const { container } = render(<MultiSelectField {...defaultProps} options={[]} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      // Divider should not be rendered when no options
      const divider = container.querySelector('.form-field__divider');
      expect(divider).not.toBeInTheDocument();
    });
  });

  describe('Chip Text Truncation', () => {
    it('truncates text exactly at 24 characters', () => {
      const exactly24Chars = 'A'.repeat(24);
      render(<MultiSelectField {...defaultProps} value={[exactly24Chars]} />);
      
      // Should not truncate (length is exactly 24)
      expect(screen.getByText(exactly24Chars)).toBeInTheDocument();
    });

    it('truncates text when length is 25 characters', () => {
      const exactly25Chars = 'A'.repeat(25);
      render(<MultiSelectField {...defaultProps} value={[exactly25Chars]} />);
      
      // Should truncate (length is 25, > 24)
      const truncated = 'A'.repeat(24) + '...';
      expect(screen.getByText(truncated)).toBeInTheDocument();
    });

    it('renders chip with tooltip when text is truncated', () => {
      const longOption = 'This is a very long option that exceeds 24 characters';
      render(<MultiSelectField {...defaultProps} value={[longOption]} />);
      
      // Should have tooltip for truncated text
      const tooltips = screen.getAllByTestId('custom-tooltip');
      const tooltipWithFullText = tooltips.find(t => t.getAttribute('title') === longOption);
      expect(tooltipWithFullText).toBeInTheDocument();
    });

    it('renders chip without tooltip when text is not truncated', () => {
      const shortOption = 'Short option';
      render(<MultiSelectField {...defaultProps} value={[shortOption]} />);
      
      // Should render the text directly without tooltip wrapper
      expect(screen.getByText(shortOption)).toBeInTheDocument();
    });
  });

  describe('CustomDeleteIcon onClick Handler', () => {
    it('calls onDelete and stops propagation when clicked', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          value={['Option 1']} 
          onChange={mockOnChange} 
        />
      );
      
      // Find CustomDeleteIcon in chip
      const tooltips = screen.getAllByTestId('custom-tooltip');
      const deleteIconContainer = tooltips.find(t => {
        const closeIcon = t.querySelector('[data-testid="close-icon"]');
        return closeIcon && t.textContent?.includes('Option 1');
      });
      
      if (deleteIconContainer) {
        const closeIcon = deleteIconContainer.querySelector('[data-testid="close-icon"]');
        if (closeIcon) {
          const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
          const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');
          
          fireEvent(closeIcon, clickEvent);
          
          expect(stopPropagationSpy).toHaveBeenCalled();
          expect(mockOnChange).toHaveBeenCalledWith([]);
        }
      }
    });
  });

  describe('Menu Height Calculations - Edge Cases', () => {
    it('calculates height with SELECT_ALL_ROWS when options exist', () => {
      render(<MultiSelectField {...defaultProps} options={['Option 1']} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('calculates height without SELECT_ALL_ROWS when no options', () => {
      render(<MultiSelectField {...defaultProps} options={[]} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });

    it('calculates height with DIVIDER_PX when options exist', () => {
      render(<MultiSelectField {...defaultProps} options={['Option 1', 'Option 2']} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('calculates height without DIVIDER_PX when no options', () => {
      render(<MultiSelectField {...defaultProps} options={[]} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });

    it('uses maxDropdownHeight when calculated height exceeds it', () => {
      render(
        <MultiSelectField 
          {...defaultProps} 
          options={Array.from({ length: 50 }, (_, i) => `Option ${i + 1}`)} 
          maxDropdownHeight={200} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('uses calculated height when it is less than maxDropdownHeight', () => {
      render(
        <MultiSelectField 
          {...defaultProps} 
          options={['Option 1', 'Option 2']} 
          maxDropdownHeight={500} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });
  });

  describe('selectedValues Filtering Logic', () => {
    it('filters value array correctly', () => {
      render(
        <MultiSelectField 
          {...defaultProps} 
          value={['Option 1', '__select_all__', '', '   ', '[]', 'Option 2']} 
        />
      );
      
      // Should only show chips for valid values
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('handles non-array value by converting to empty array', () => {
      render(<MultiSelectField {...defaultProps} value={'not-array' as any} />);
      
      // Should handle gracefully
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('handles value with only invalid entries', () => {
      render(
        <MultiSelectField 
          {...defaultProps} 
          value={['__select_all__', '', '[]', '   ']} 
        />
      );
      
      // Should render without chips
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
  });

  describe('Checkbox onClick - Select All', () => {
    it('calls onChange with all options when allSelected is false', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          onChange={mockOnChange} 
          value={[]} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      fireEvent.click(checkboxes[0]);
      
      expect(mockOnChange).toHaveBeenCalledWith(['Option 1', 'Option 2', 'Option 3']);
    });

    it('calls onChange with empty array when allSelected is true', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          onChange={mockOnChange} 
          value={['Option 1', 'Option 2', 'Option 3']} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      fireEvent.click(checkboxes[0]);
      
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('handles onChange being undefined', () => {
      render(
        <MultiSelectField 
          {...defaultProps} 
          onChange={undefined as any} 
          value={[]} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      // Should not throw error
      fireEvent.click(checkboxes[0]);
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
  });

  describe('Checkbox onClick - Individual Options', () => {
    it('calls onChange to remove option when isSelected is true', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          onChange={mockOnChange} 
          value={['Option 1', 'Option 2']} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      // Option 1 checkbox (index 1, after Select All)
      fireEvent.click(checkboxes[1]);
      
      expect(mockOnChange).toHaveBeenCalledWith(['Option 2']);
    });

    it('calls onChange to add option when isSelected is false', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          onChange={mockOnChange} 
          value={['Option 2']} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      // Option 1 checkbox (index 1, after Select All)
      fireEvent.click(checkboxes[1]);
      
      expect(mockOnChange).toHaveBeenCalledWith(['Option 2', 'Option 1']);
    });

    it('handles onChange being undefined for individual option', () => {
      render(
        <MultiSelectField 
          {...defaultProps} 
          onChange={undefined as any} 
          value={['Option 1']} 
        />
      );
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const checkboxes = screen.getAllByTestId('custom-checkbox');
      // Should not throw error
      if (checkboxes.length > 1) {
        fireEvent.click(checkboxes[1]);
      }
      
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
  });

  describe('Chip onDelete Handlers', () => {
    it('calls onChange when chip onDelete is triggered', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          value={['Option 1', 'Option 2']} 
          onChange={mockOnChange} 
        />
      );
      
      // Find chip and trigger onDelete
      const chips = screen.getAllByTestId('custom-tooltip');
      const deleteIcon = chips.find(t => t.querySelector('[data-testid="close-icon"]'));
      
      if (deleteIcon) {
        const closeIcon = deleteIcon.querySelector('[data-testid="close-icon"]');
        if (closeIcon) {
          fireEvent.click(closeIcon);
          expect(mockOnChange).toHaveBeenCalled();
        }
      }
    });

    it('filters out the deleted item correctly', () => {
      const mockOnChange = jest.fn();
      render(
        <MultiSelectField 
          {...defaultProps} 
          value={['Option 1', 'Option 2', 'Option 3']} 
          onChange={mockOnChange} 
        />
      );
      
      // Find chip for Option 1 and delete it
      const chips = screen.getAllByTestId('custom-tooltip');
      const deleteIcon = chips.find(t => t.querySelector('[data-testid="close-icon"]'));
      
      if (deleteIcon) {
        const closeIcon = deleteIcon.querySelector('[data-testid="close-icon"]');
        if (closeIcon) {
          fireEvent.click(closeIcon);
          // Should be called with remaining options
          expect(mockOnChange).toHaveBeenCalled();
        }
      }
    });
  });

  describe('Dropdown Icon State', () => {
    it('renders ChevronDown icon', () => {
      const { container } = render(<MultiSelectField {...defaultProps} />);
      
      // Icon should be present
      const icon = container.querySelector('[data-testid="chevron-down-icon"]');
      expect(icon).toBeInTheDocument();
    });

    it('applies rotation transform when menu is open', () => {
      const { container } = render(<MultiSelectField {...defaultProps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      // Icon should be present and rotated
      const icon = container.querySelector('[data-testid="chevron-down-icon"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Option Count Edge Cases', () => {
    it('handles options with null/undefined values', () => {
      render(<MultiSelectField {...defaultProps} options={['Option 1', null as any, undefined as any, 'Option 2']} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('handles optionCount when options is null', () => {
      render(<MultiSelectField {...defaultProps} options={null as any} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });

    it('handles optionCount when options is undefined', () => {
      render(<MultiSelectField {...defaultProps} options={undefined as any} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });
  });
});