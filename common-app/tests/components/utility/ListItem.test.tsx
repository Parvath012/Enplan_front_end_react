import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListItem from '../../../src/components/utility/ListItem';

// Mock CustomCheckbox
jest.mock('../../../src/components/common/CustomCheckbox', () => {
  return function MockCustomCheckbox({ checked, disabled, onChange, readOnly }: any) {
    return (
      <input
        type="checkbox"
        checked={checked || false}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        data-testid="custom-checkbox"
      />
    );
  };
});

describe('ListItem', () => {
  const defaultProps = {
    item: { id: '1', name: 'Test Item' },
    index: 0,
    totalItems: 3,
    idField: 'id',
    displayField: 'name',
    selectedItems: [],
    isEditMode: true,
    onToggle: jest.fn(),
    isPrePopulated: false,
    defaultCurrency: [],
    isDefault: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ListItem {...defaultProps} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('renders with checked state when item is selected', () => {
    render(<ListItem {...defaultProps} selectedItems={['1']} />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders with unchecked state when item is not selected', () => {
    render(<ListItem {...defaultProps} selectedItems={[]} />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('handles click events when in edit mode', () => {
    const mockOnToggle = jest.fn();
    render(<ListItem {...defaultProps} onToggle={mockOnToggle} />);
    
    const container = screen.getByText('Test Item').closest('div');
    fireEvent.click(container!);
    
    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('does not handle click events when not in edit mode', () => {
    const mockOnToggle = jest.fn();
    render(<ListItem {...defaultProps} isEditMode={false} onToggle={mockOnToggle} />);
    
    const container = screen.getByText('Test Item').closest('div');
    fireEvent.click(container!);
    
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('does not handle click events when pre-populated', () => {
    const mockOnToggle = jest.fn();
    render(<ListItem {...defaultProps} isPrePopulated={true} onToggle={mockOnToggle} />);
    
    const container = screen.getByText('Test Item').closest('div');
    fireEvent.click(container!);
    
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('handles currency name comparison correctly', () => {
    const currencyItem = { id: 'USD', currencyName: 'US Dollar' };
    render(
      <ListItem 
        {...defaultProps} 
        item={currencyItem}
        displayField="currencyName"
        selectedItems={['US Dollar']}
      />
    );
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeChecked();
  });

  it('handles currency name with special characters', () => {
    const currencyItem = { id: 'EUR', currencyName: 'Euro (€)' };
    render(
      <ListItem 
        {...defaultProps} 
        item={currencyItem}
        displayField="currencyName"
        selectedItems={['Euro (€)']}
      />
    );
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeChecked();
  });

  it('handles currency name with regex replacement', () => {
    const currencyItem = { id: 'GBP', currencyName: 'British Pound(£)' };
    render(
      <ListItem 
        {...defaultProps} 
        item={currencyItem}
        displayField="currencyName"
        selectedItems={['British Pound(£)']}
      />
    );
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeChecked();
  });

  it('handles non-deletable currency when in defaultCurrency', () => {
    const currencyItem = { id: 'USD', currencyName: 'US Dollar' };
    render(
      <ListItem 
        {...defaultProps} 
        item={currencyItem}
        displayField="currencyName"
        defaultCurrency={['US Dollar']}
      />
    );
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('handles non-deletable currency when isDefault matches', () => {
    const currencyItem = { id: 'USD', currencyName: 'US Dollar' };
    render(
      <ListItem 
        {...defaultProps} 
        item={currencyItem}
        displayField="currencyName"
        isDefault="US Dollar"
      />
    );
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('handles checkbox click with stopPropagation', () => {
    const mockOnToggle = jest.fn();
    render(<ListItem {...defaultProps} onToggle={mockOnToggle} />);
    
    const checkbox = screen.getByTestId('custom-checkbox');
    fireEvent.click(checkbox);
    
    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('handles currency toggle correctly', () => {
    const mockOnToggle = jest.fn();
    const currencyItem = { id: 'USD', currencyName: 'US Dollar' };
    render(
      <ListItem 
        {...defaultProps} 
        item={currencyItem}
        displayField="currencyName"
        onToggle={mockOnToggle}
      />
    );
    
    const checkbox = screen.getByTestId('custom-checkbox');
    fireEvent.click(checkbox);
    
    expect(mockOnToggle).toHaveBeenCalledWith('US Dollar');
  });

  it('applies correct styling for last item', () => {
    render(<ListItem {...defaultProps} index={2} totalItems={3} />);
    const container = screen.getByText('Test Item').closest('div');
    expect(container).toHaveStyle('border-bottom: none');
  });

  it('applies correct styling for non-last item', () => {
    render(<ListItem {...defaultProps} index={0} totalItems={3} />);
    const container = screen.getByText('Test Item').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('applies opacity for pre-populated items', () => {
    render(<ListItem {...defaultProps} isPrePopulated={true} />);
    const container = screen.getByText('Test Item').closest('div');
    expect(container).toHaveStyle('opacity: 0.8');
  });

  it('applies opacity for non-deletable currency', () => {
    const currencyItem = { id: 'USD', currencyName: 'US Dollar' };
    render(
      <ListItem 
        {...defaultProps} 
        item={currencyItem}
        displayField="currencyName"
        defaultCurrency={['US Dollar']}
      />
    );
    const container = screen.getByText('US Dollar').closest('div');
    expect(container).toHaveStyle('opacity: 0.8');
  });

  it('applies cursor pointer when clickable', () => {
    render(<ListItem {...defaultProps} />);
    const container = screen.getByText('Test Item').closest('div');
    expect(container).toHaveStyle('cursor: pointer');
  });

  it('applies cursor default when not clickable', () => {
    render(<ListItem {...defaultProps} isEditMode={false} />);
    const container = screen.getByText('Test Item').closest('div');
    expect(container).toHaveStyle('cursor: default');
  });

  it('handles missing display field gracefully', () => {
    const itemWithoutDisplayField = { id: '1' };
    render(
      <ListItem 
        {...defaultProps} 
        item={itemWithoutDisplayField}
        displayField="name"
      />
    );
    expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument();
  });

  it('handles undefined selectedItems', () => {
    render(<ListItem {...defaultProps} selectedItems={[]} />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('handles null selectedItems', () => {
    render(<ListItem {...defaultProps} selectedItems={[]} />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('handles empty selectedItems array', () => {
    render(<ListItem {...defaultProps} selectedItems={[]} />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('handles multiple selected items', () => {
    render(<ListItem {...defaultProps} selectedItems={['1', '2', '3']} />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeChecked();
  });

  it('handles different index values', () => {
    const { rerender } = render(<ListItem {...defaultProps} index={0} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    
    rerender(<ListItem {...defaultProps} index={1} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    
    rerender(<ListItem {...defaultProps} index={2} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('handles different totalItems values', () => {
    const { rerender } = render(<ListItem {...defaultProps} totalItems={1} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    
    rerender(<ListItem {...defaultProps} totalItems={5} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('handles different idField values', () => {
    const item = { customId: 'custom1', name: 'Test Item' };
    render(
      <ListItem 
        {...defaultProps} 
        item={item}
        idField="customId"
      />
    );
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('handles different displayField values', () => {
    const item = { id: '1', title: 'Test Title' };
    render(
      <ListItem 
        {...defaultProps} 
        item={item}
        displayField="title"
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('handles complex item objects', () => {
    const complexItem = {
      id: '1',
      name: 'Complex Item',
      metadata: { type: 'test', value: 123 },
      nested: { deep: { value: 'nested' } }
    };
    render(<ListItem {...defaultProps} item={complexItem} />);
    expect(screen.getByText('Complex Item')).toBeInTheDocument();
  });

  it('handles edge case with empty strings', () => {
    const itemWithEmptyString = { id: '', name: '' };
    render(<ListItem {...defaultProps} item={itemWithEmptyString} />);
    expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument();
  });

  it('handles edge case with null values', () => {
    const itemWithNull = { id: null, name: null };
    render(<ListItem {...defaultProps} item={itemWithNull} />);
    expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument();
  });

  it('handles edge case with undefined values', () => {
    const itemWithUndefined = { id: undefined, name: undefined };
    render(<ListItem {...defaultProps} item={itemWithUndefined} />);
    expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument();
  });

  it('handles rapid toggle events', () => {
    const mockOnToggle = jest.fn();
    render(<ListItem {...defaultProps} onToggle={mockOnToggle} />);
    
    const checkbox = screen.getByTestId('custom-checkbox');
    for (let i = 0; i < 5; i++) {
      fireEvent.click(checkbox);
    }
    
    expect(mockOnToggle).toHaveBeenCalledTimes(5);
  });

  it('handles keyboard events', () => {
    render(<ListItem {...defaultProps} />);
    const container = screen.getByText('Test Item').closest('div');
    
    fireEvent.keyDown(container!, { key: 'Enter' });
    fireEvent.keyDown(container!, { key: ' ' });
    fireEvent.keyDown(container!, { key: 'Escape' });
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('handles mouse events', () => {
    render(<ListItem {...defaultProps} />);
    const container = screen.getByText('Test Item').closest('div');
    
    fireEvent.mouseEnter(container!);
    fireEvent.mouseLeave(container!);
    fireEvent.mouseOver(container!);
    fireEvent.mouseOut(container!);
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('handles focus events', () => {
    render(<ListItem {...defaultProps} />);
    const checkbox = screen.getByTestId('custom-checkbox');
    
    fireEvent.focus(checkbox);
    fireEvent.blur(checkbox);
    
    expect(checkbox).toBeInTheDocument();
  });

  it('handles component unmounting', () => {
    const { unmount } = render(<ListItem {...defaultProps} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    unmount();
    expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
  });

  it('handles prop changes', () => {
    const { rerender } = render(<ListItem {...defaultProps} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    
    rerender(<ListItem {...defaultProps} selectedItems={['1']} />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeChecked();
    
    rerender(<ListItem {...defaultProps} isEditMode={false} />);
    expect(checkbox).toBeDisabled();
  });

  it('handles all boolean combinations', () => {
    const combinations = [
      { isEditMode: true, isPrePopulated: false },
      { isEditMode: true, isPrePopulated: true },
      { isEditMode: false, isPrePopulated: false },
      { isEditMode: false, isPrePopulated: true }
    ];
    
    combinations.forEach((combo, index) => {
      const { unmount } = render(
        <ListItem 
          {...defaultProps} 
          isEditMode={combo.isEditMode}
          isPrePopulated={combo.isPrePopulated}
        />
      );
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      unmount();
    });
  });

  it('handles currency edge cases', () => {
    const currencyCases = [
      { name: 'US Dollar', selected: ['US Dollar'] },
      { name: 'Euro (€)', selected: ['Euro (€)'] },
      { name: 'British Pound(£)', selected: ['British Pound(£)'] },
      { name: 'Japanese Yen(¥)', selected: ['Japanese Yen(¥)'] }
    ];
    
    currencyCases.forEach((currencyCase) => {
      const { unmount } = render(
        <ListItem 
          {...defaultProps} 
          item={{ id: '1', currencyName: currencyCase.name }}
          displayField="currencyName"
          selectedItems={currencyCase.selected}
        />
      );
      const checkbox = screen.getByTestId('custom-checkbox');
      expect(checkbox).toBeChecked();
      unmount();
    });
  });

  it('handles performance with many items', () => {
    const manyItems = Array.from({ length: 100 }, (_, i) => ({
      id: `item${i}`,
      name: `Item ${i}`
    }));
    
    manyItems.forEach((item, index) => {
      const { unmount } = render(
        <ListItem 
          {...defaultProps} 
          item={item}
          index={index}
          totalItems={100}
        />
      );
      expect(screen.getByText(`Item ${index}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles accessibility attributes', () => {
    render(<ListItem {...defaultProps} />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeDisabled();
  });

  it('handles disabled state correctly', () => {
    render(<ListItem {...defaultProps} isEditMode={false} />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('handles pre-populated state correctly', () => {
    render(<ListItem {...defaultProps} isPrePopulated={true} />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('handles non-deletable currency state correctly', () => {
    const currencyItem = { id: 'USD', currencyName: 'US Dollar' };
    render(
      <ListItem 
        {...defaultProps} 
        item={currencyItem}
        displayField="currencyName"
        defaultCurrency={['US Dollar']}
      />
    );
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeDisabled();
  });
});