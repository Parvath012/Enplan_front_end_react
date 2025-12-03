import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderListItems } from '../../../../src/components/entityConfiguration/shared/listUtils';

// Mock the lazy-loaded component
jest.mock('commonApp/ListItem', () => {
  return function MockListItem({ item, index, totalItems, idField, displayField, selectedItems, isEditMode, onToggle, isPrePopulated, defaultCurrency, isDefault }: any) {
    return (
      <div data-testid="list-item" 
           data-id={item[idField]}
           data-index={index}
           data-total={totalItems}
           data-selected={selectedItems.includes(item[idField])}
           data-edit-mode={isEditMode}
           data-pre-populated={isPrePopulated}
           data-default-currency={defaultCurrency?.includes(item[idField])}
           data-is-default={isDefault === item[idField]}
           onClick={() => onToggle(item[idField])}>
        {item[displayField]}
      </div>
    );
  };
});

// Mock NoResultsFound
jest.mock('commonApp/NoResultsFound', () => {
  return function MockNoResultsFound({ message, height }: any) {
    return <div data-testid="no-results-found" data-message={message} data-height={height}>{message}</div>;
  };
});

// StatusMessage is now a real component, no need to mock

describe('listUtils', () => {
  const defaultConfig = {
    items: [
      { id: '1', name: 'Item 1', currencyName: 'USD' },
      { id: '2', name: 'Item 2', currencyName: 'EUR' },
      { id: '3', name: 'Item 3', currencyName: 'GBP' }
    ],
    isLoading: false,
    searchTerm: '',
    searchField: 'name',
    displayField: 'name',
    idField: 'id',
    selectedItems: ['1'],
    onToggle: jest.fn(),
    loadingMessage: 'Loading items...',
    emptyMessage: 'No items found',
    prePopulatedItems: ['1'],
    defaultCurrency: ['USD'],
    isDefault: 'USD'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('renders loading message when isLoading is true', () => {
      const config = { ...defaultConfig, isLoading: true };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      expect(screen.getByTestId('status-message')).toBeInTheDocument();
      expect(screen.getByTestId('status-message')).toHaveAttribute('data-type', 'loading');
      expect(screen.getByText('Loading items...')).toBeInTheDocument();
    });

    it('renders loading message with custom message', () => {
      const config = { 
        ...defaultConfig, 
        isLoading: true, 
        loadingMessage: 'Custom loading message...' 
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      expect(screen.getByText('Custom loading message...')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty message when items array is empty', () => {
      const config = { ...defaultConfig, items: [] };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      expect(screen.getByTestId('status-message')).toBeInTheDocument();
      expect(screen.getByTestId('status-message')).toHaveAttribute('data-type', 'empty');
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('renders empty message with custom message', () => {
      const config = { 
        ...defaultConfig, 
        items: [], 
        emptyMessage: 'Custom empty message' 
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });
  });

  describe('Item Rendering', () => {
    it('renders all items when no search term', () => {
      const result = renderListItems(defaultConfig, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(3);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('renders items with correct props', () => {
      const result = renderListItems(defaultConfig, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(3);
      
      const firstItem = listItems[0];
      expect(firstItem).toHaveAttribute('data-id', '1');
      expect(firstItem).toHaveAttribute('data-index', '0');
      expect(firstItem).toHaveAttribute('data-total', '3');
      expect(firstItem).toHaveAttribute('data-selected', 'true');
      expect(firstItem).toHaveAttribute('data-edit-mode', 'true');
      expect(firstItem).toHaveAttribute('data-pre-populated', 'true');
    });

    it('handles different field configurations', () => {
      const config = {
        ...defaultConfig,
        searchField: 'currencyName',
        displayField: 'currencyName',
        idField: 'id'
      };
      
      const result = renderListItems(config, false);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(3);
      expect(screen.getByText('USD')).toBeInTheDocument();
      expect(screen.getByText('EUR')).toBeInTheDocument();
      expect(screen.getByText('GBP')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters items by search term in search field', () => {
      const config = { ...defaultConfig, searchTerm: 'Item 1' };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(1);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    });

    it('filters items by search term in id field', () => {
      const config = { ...defaultConfig, searchTerm: '2' };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(1);
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('performs case-insensitive search', () => {
      const config = { ...defaultConfig, searchTerm: 'ITEM 1' };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(1);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('handles empty search term', () => {
      const config = { ...defaultConfig, searchTerm: '' };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(3);
    });

    it('handles search term with no matches', () => {
      const config = { ...defaultConfig, searchTerm: 'nonexistent' };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.queryAllByTestId('list-item');
      expect(listItems).toHaveLength(0);
    });
  });

  describe('Pre-populated Items', () => {
    it('marks items as pre-populated for non-currency fields', () => {
      const config = { 
        ...defaultConfig, 
        displayField: 'name',
        prePopulatedItems: ['1', '2']
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems[0]).toHaveAttribute('data-pre-populated', 'true');
      expect(listItems[1]).toHaveAttribute('data-pre-populated', 'true');
      expect(listItems[2]).toHaveAttribute('data-pre-populated', 'false');
    });

    it('does not mark currency items as pre-populated', () => {
      const config = { 
        ...defaultConfig, 
        displayField: 'currencyName',
        prePopulatedItems: ['1', '2']
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      listItems.forEach(item => {
        expect(item).toHaveAttribute('data-pre-populated', 'false');
      });
    });
  });

  describe('Currency-specific Logic', () => {
    it('handles defaultCurrency prop for currency items', () => {
      const config = { 
        ...defaultConfig, 
        displayField: 'currencyName',
        defaultCurrency: ['USD', 'EUR'],
        items: [
          { id: 'USD', currencyName: 'USD' },
          { id: 'EUR', currencyName: 'EUR' },
          { id: 'GBP', currencyName: 'GBP' }
        ]
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems[0]).toHaveAttribute('data-default-currency', 'true'); // USD
      expect(listItems[1]).toHaveAttribute('data-default-currency', 'true'); // EUR
      expect(listItems[2]).toHaveAttribute('data-default-currency', 'false'); // GBP
    });

    it('handles isDefault prop for currency items', () => {
      const config = { 
        ...defaultConfig, 
        displayField: 'currencyName',
        isDefault: 'USD',
        items: [
          { id: 'USD', currencyName: 'USD' },
          { id: 'EUR', currencyName: 'EUR' },
          { id: 'GBP', currencyName: 'GBP' }
        ]
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems[0]).toHaveAttribute('data-is-default', 'true'); // USD
      expect(listItems[1]).toHaveAttribute('data-is-default', 'false'); // EUR
      expect(listItems[2]).toHaveAttribute('data-is-default', 'false'); // GBP
    });

    it('handles null isDefault', () => {
      const config = { 
        ...defaultConfig, 
        displayField: 'currencyName',
        isDefault: null
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      listItems.forEach(item => {
        expect(item).toHaveAttribute('data-is-default', 'false');
      });
    });
  });

  describe('Edit Mode', () => {
    it('passes edit mode to list items', () => {
      const result = renderListItems(defaultConfig, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      listItems.forEach(item => {
        expect(item).toHaveAttribute('data-edit-mode', 'true');
      });
    });

    it('passes read-only mode to list items', () => {
      const result = renderListItems(defaultConfig, false);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      listItems.forEach(item => {
        expect(item).toHaveAttribute('data-edit-mode', 'false');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles items with missing fields', () => {
      const config = {
        ...defaultConfig,
        items: [
          { id: '1', name: 'Item 1' },
          { id: '2' }, // Missing name field
          { name: 'Item 3' } // Missing id field
        ]
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(3);
    });

    it('handles items with null/undefined values', () => {
      const config = {
        ...defaultConfig,
        items: [
          { id: '1', name: null },
          { id: '2', name: undefined },
          { id: '3', name: 'Item 3' }
        ]
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(3);
    });

    it('handles empty selectedItems array', () => {
      const config = { ...defaultConfig, selectedItems: [] };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      listItems.forEach(item => {
        expect(item).toHaveAttribute('data-selected', 'false');
      });
    });

    it('handles undefined defaultCurrency', () => {
      const config = { 
        ...defaultConfig, 
        displayField: 'currencyName',
        defaultCurrency: undefined
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      listItems.forEach(item => {
        expect(item).toHaveAttribute('data-default-currency', 'false');
      });
    });
  });

  describe('Performance', () => {
    it('handles large number of items', () => {
      const largeItems = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        currencyName: `Currency ${i}`
      }));
      
      const config = { ...defaultConfig, items: largeItems };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(1000);
    });

    it('handles complex search patterns', () => {
      const config = { 
        ...defaultConfig, 
        searchTerm: 'item',
        items: [
          { id: '1', name: 'Item 1', currencyName: 'USD' },
          { id: '2', name: 'item 2', currencyName: 'EUR' },
          { id: '3', name: 'ITEM 3', currencyName: 'GBP' },
          { id: '4', name: 'Other', currencyName: 'GBP' }
        ]
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(3);
    });

    it('should show NoResultsFound when search term has no matches', () => {
      const config = { 
        ...defaultConfig, 
        searchTerm: 'nonexistent',
        items: [
          { id: '1', name: 'Item 1', currencyName: 'USD' }
        ]
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      // Should show NoResultsFound component
      expect(screen.getByTestId('no-results-found')).toBeInTheDocument();
      expect(screen.getByTestId('no-results-found')).toHaveTextContent('No Results Found');
      expect(screen.queryAllByTestId('list-item')).toHaveLength(0);
    });

    it('should not show NoResultsFound when search term is empty', () => {
      const config = { 
        ...defaultConfig, 
        searchTerm: '',
        items: [
          { id: '1', name: 'Item 1', currencyName: 'USD' }
        ]
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(1);
    });

    it('should filter by both searchField and idField', () => {
      const config = { 
        ...defaultConfig, 
        searchTerm: '2',
        items: [
          { id: '1', name: 'Item 1', currencyName: 'USD' },
          { id: '2', name: 'Item 2', currencyName: 'EUR' },
          { id: '3', name: 'Item 3', currencyName: 'GBP' }
        ]
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(1);
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should handle items with undefined searchField value', () => {
      const config = {
        ...defaultConfig,
        items: [
          { id: '1', name: undefined, currencyName: 'USD' },
          { id: '2', name: 'Item 2', currencyName: 'EUR' }
        ]
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(2);
    });

    it('should handle items with undefined idField value', () => {
      const config = {
        ...defaultConfig,
        items: [
          { id: undefined, name: 'Item 1', currencyName: 'USD' },
          { id: '2', name: 'Item 2', currencyName: 'EUR' }
        ]
      };
      
      const result = renderListItems(config, true);
      render(<div>{result}</div>);
      
      const listItems = screen.getAllByTestId('list-item');
      expect(listItems).toHaveLength(2);
    });
  });
});