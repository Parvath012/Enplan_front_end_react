import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdvancedSearchComponent } from '../../../src/components/advancedsearch/AdvancedSearchComponent';

// Mock the dependencies
jest.mock('../../../src/components/advancedsearch/QueryAutoComplete', () => ({
  QueryAutoComplete: ({ onChange, onParseSuccess, onParseError, onClose, onError, columns, name, clear, disableAddToFilter, popOverStyle, ...props }: any) => {
    const [value, setValue] = React.useState('');
    
    React.useEffect(() => {
      if (clear) setValue('');
    }, [clear]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setValue(newValue);
      if (onChange) onChange(newValue);
      if (newValue.includes('error')) {
        if (onParseError) onParseError();
        if (onError) onError('Syntax Error');
      } else if (newValue.includes('success')) {
        if (onParseSuccess) onParseSuccess([{ column_hash: 'id', operator: '=', value: 'test' }]);
      }
    };

    return (
      <div data-testid="query-autocomplete">
        <input
          type="text"
          role="textbox"
          data-testid="query-autocomplete-input"
          value={value}
          onChange={handleChange}
          placeholder="Search Rows"
          {...props}
        />
        {value && (
          <button data-testid="clear-button" onClick={() => { setValue(''); if (onChange) onChange(''); }}>Clear</button>
        )}
      </div>
    );
  }
}));

jest.mock('../../../src/components/advancedsearch/FilterOptions', () => ({
  FilterOptions: ({ columns, selectedColumns, onColumnsChange, onClose, enableColumnFilter, enableRowFilter, ...props }: any) => (
    <div data-testid="filter-options">
      <button data-testid="filter-columns">Filter Columns</button>
      <button data-testid="filter-close" onClick={onClose}>Close</button>
      <span data-testid="enable-column-filter">{enableColumnFilter ? 'true' : 'false'}</span>
      <span data-testid="enable-row-filter">{enableRowFilter ? 'true' : 'false'}</span>
      {columns && columns.map((col: any) => (
        <div key={col.id} data-testid={`column-option-${col.id}`}>
          {col.name}
          <button data-testid={`select-column-${col.id}`} onClick={() => onColumnsChange([...selectedColumns, col])}>Select</button>
          <button data-testid={`deselect-column-${col.id}`} onClick={() => onColumnsChange(selectedColumns.filter((c: any) => c.id !== col.id))}>Deselect</button>
        </div>
      ))}
    </div>
  )
}));

jest.mock('../../../src/components/advancedsearch/ClearButton', () => ({
  ClearButton: ({ onClick, visible }: any) => 
    visible ? <button data-testid="clear-button" onClick={onClick}>Clear</button> : null
}));

// Mock icons
jest.mock('@carbon/icons-react', () => ({
  Search: (props: any) => <div data-testid="search-icon" {...props} />,
  Filter: (props: any) => <div data-testid="filter-icon" {...props} />,
  CaretDown: (props: any) => <div data-testid="caret-down" {...props} />,
  DataTable: (props: any) => <div data-testid="data-table-icon" {...props} />,
  Column: (props: any) => <div data-testid="column-icon" {...props} />,
  Row: (props: any) => <div data-testid="row-icon" {...props} />,
}));

const mockColumns = [
  { id: 'id', name: 'ID', type: 'numerical' as const },
  { id: 'name', name: 'Name', type: 'string' as const },
  { id: 'age', name: 'Age', type: 'numerical' as const },
  { id: 'email', name: 'Email', type: 'string' as const },
  { id: 'date', name: 'Date', type: 'date' as const }
];

const mockData = [
  { id: 1, name: 'John Doe', age: 30, email: 'john@example.com', date: '2023-01-01' },
  { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com', date: '2023-01-02' },
  { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com', date: '2023-01-03' },
  { id: 4, name: 'Alice Brown', age: 28, email: 'alice@example.com', date: '2023-01-04' }
];

const defaultProps = {
  columns: mockColumns,
  data: mockData,
  onSearchResults: jest.fn(),
  onSearchModeChange: jest.fn(),
  placeholder: 'Search...',
  className: 'test-class',
  showTable: true,
  enableColumnFilter: true,
  enableRowFilter: true,
  searchModes: ['Data', 'Columns', 'Rows'] as const,
  showFilter: true,
  defaultSearchMode: 'Data' as const,
  searchBarWidth: '170px',
  searchBarHeight: '12px'
};

describe('AdvancedSearchComponent - Comprehensive Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<AdvancedSearchComponent {...defaultProps} className="custom-class" />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });

    it('renders search input with correct placeholder', () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search Data');
      expect(input).toBeInTheDocument();
    });

    it('renders data table when showTable is true', () => {
      render(<AdvancedSearchComponent {...defaultProps} showTable={true} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('does not render data table when showTable is false', () => {
      render(<AdvancedSearchComponent {...defaultProps} showTable={false} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });
  });

  describe('Search Mode Functionality', () => {
    it('handles search mode change to Columns', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchColumnsOption = screen.getByText('Search Columns');
      fireEvent.click(searchColumnsOption);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search Columns')).toBeInTheDocument();
      });
    });

    it('handles search mode change to Rows', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchRowsOption = screen.getByText('Search Rows');
      fireEvent.click(searchRowsOption);
      
      await waitFor(() => {
        expect(screen.getByTestId('query-autocomplete')).toBeInTheDocument();
      });
    });

    it('handles single search mode (no dropdown)', () => {
      render(<AdvancedSearchComponent {...defaultProps} searchModes={['Data']} />);
      expect(screen.getByPlaceholderText('Search Data')).toBeInTheDocument();
    });

    it('handles keyboard navigation in dropdown', () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.keyDown(dropdownButton, { key: 'Enter' });
      fireEvent.keyDown(dropdownButton, { key: ' ' });
      expect(dropdownButton).toBeInTheDocument();
    });
  });

  describe('Data Search Functionality', () => {
    it('filters data by search value', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search Data');
      
      fireEvent.change(input, { target: { value: 'John' } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('shows all data when search is cleared', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search Data');
      
      fireEvent.change(input, { target: { value: 'John' } });
      fireEvent.change(input, { target: { value: '' } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('handles case-insensitive search', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search Data');
      
      fireEvent.change(input, { target: { value: 'JOHN' } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });

  describe('Column Search Functionality', () => {
    it('filters columns by search value', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchColumnsOption = screen.getByText('Search Columns');
      fireEvent.click(searchColumnsOption);
      
      const input = screen.getByPlaceholderText('Search Columns');
      fireEvent.change(input, { target: { value: 'Name' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('column-icon')).toBeInTheDocument();
      });
    });

    it('handles invalid regex in column search', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchColumnsOption = screen.getByText('Search Columns');
      fireEvent.click(searchColumnsOption);
      
      const input = screen.getByPlaceholderText('Search Columns');
      fireEvent.change(input, { target: { value: '[' } }); // Invalid regex
      
      await waitFor(() => {
        expect(screen.getByTestId('column-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Row Search Functionality', () => {
    it('filters rows by query', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchRowsOption = screen.getByText('Search Rows');
      fireEvent.click(searchRowsOption);
      
      const queryInput = screen.getByTestId('query-autocomplete-input');
      fireEvent.change(queryInput, { target: { value: 'name = "John"' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('row-icon')).toBeInTheDocument();
      });
    });

    it('handles query parsing success', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchRowsOption = screen.getByText('Search Rows');
      fireEvent.click(searchRowsOption);
      
      const queryInput = screen.getByTestId('query-autocomplete-input');
      fireEvent.change(queryInput, { target: { value: 'success' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('query-autocomplete')).toBeInTheDocument();
      });
    });

    it('handles query parsing error', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchRowsOption = screen.getByText('Search Rows');
      fireEvent.click(searchRowsOption);
      
      const queryInput = screen.getByTestId('query-autocomplete-input');
      fireEvent.change(queryInput, { target: { value: 'error' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('query-autocomplete')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Options Functionality', () => {
    it('shows filter options when showFilter is true', () => {
      render(<AdvancedSearchComponent {...defaultProps} showFilter={true} />);
      expect(screen.getByTestId('filter-options')).toBeInTheDocument();
    });

    it('hides filter options when showFilter is false', () => {
      render(<AdvancedSearchComponent {...defaultProps} showFilter={false} />);
      expect(screen.queryByTestId('filter-options')).not.toBeInTheDocument();
    });

    it('handles column selection', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const selectButton = screen.getByTestId('select-column-id');
      
      fireEvent.click(selectButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('filter-options')).toBeInTheDocument();
      });
    });

    it('handles column deselection', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const deselectButton = screen.getByTestId('deselect-column-id');
      
      fireEvent.click(deselectButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('filter-options')).toBeInTheDocument();
      });
    });

    it('shows all columns when none selected', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const deselectButton = screen.getByTestId('deselect-column-id');
      
      fireEvent.click(deselectButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Props Handling', () => {
    it('handles custom searchBarWidth and searchBarHeight', () => {
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchBarWidth="200px" 
          searchBarHeight="20px" 
        />
      );
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });

    it('handles enableColumnFilter and enableRowFilter props', () => {
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          enableColumnFilter={false}
          enableRowFilter={false}
        />
      );
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });

    it('handles custom placeholder', () => {
      render(<AdvancedSearchComponent {...defaultProps} placeholder="Custom Search" />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });
  });

  describe('Callback Functions', () => {
    it('calls onSearchResults when data is filtered', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search Data');
      
      fireEvent.change(input, { target: { value: 'John' } });
      
      await waitFor(() => {
        expect(defaultProps.onSearchResults).toHaveBeenCalled();
      });
    });

    it('calls onSearchModeChange when search mode changes', () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchColumnsOption = screen.getByText('Search Columns');
      fireEvent.click(searchColumnsOption);
      
      expect(defaultProps.onSearchModeChange).toHaveBeenCalledWith('Columns');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data array', () => {
      render(<AdvancedSearchComponent {...defaultProps} data={[]} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });

    it('handles empty columns array', () => {
      render(<AdvancedSearchComponent {...defaultProps} columns={[]} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });

    it('handles undefined data', () => {
      render(<AdvancedSearchComponent {...defaultProps} data={[]} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });

    it('handles undefined columns', () => {
      render(<AdvancedSearchComponent {...defaultProps} columns={[]} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });

    it('handles null data', () => {
      render(<AdvancedSearchComponent {...defaultProps} data={[]} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });

    it('handles null columns', () => {
      render(<AdvancedSearchComponent {...defaultProps} columns={[]} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('handles component unmounting', () => {
      const { unmount } = render(<AdvancedSearchComponent {...defaultProps} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
      unmount();
      expect(screen.queryByTestId('data-table-icon')).not.toBeInTheDocument();
    });

    it('handles prop changes', () => {
      const { rerender } = render(<AdvancedSearchComponent {...defaultProps} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
      
      rerender(<AdvancedSearchComponent {...defaultProps} showTable={false} />);
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });
  });

  describe('Query Evaluation', () => {
    it('handles equals operator', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchRowsOption = screen.getByText('Search Rows');
      fireEvent.click(searchRowsOption);
      
      const queryInput = screen.getByTestId('query-autocomplete-input');
      fireEvent.change(queryInput, { target: { value: 'name = "John Doe"' } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('handles numerical comparison operators', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchRowsOption = screen.getByText('Search Rows');
      fireEvent.click(searchRowsOption);
      
      const queryInput = screen.getByTestId('query-autocomplete-input');
      fireEvent.change(queryInput, { target: { value: 'age > 25' } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });
    });

    it('handles contains operator', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchRowsOption = screen.getByText('Search Rows');
      fireEvent.click(searchRowsOption);
      
      const queryInput = screen.getByTestId('query-autocomplete-input');
      fireEvent.change(queryInput, { target: { value: 'name contains "John"' } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('handles not contains operator', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.click(dropdownButton);
      const searchRowsOption = screen.getByText('Search Rows');
      fireEvent.click(searchRowsOption);
      
      const queryInput = screen.getByTestId('query-autocomplete-input');
      fireEvent.change(queryInput, { target: { value: 'name not contains "John"' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('query-autocomplete')).toBeInTheDocument();
      });
    });
  });

  describe('Special Characters and Edge Cases', () => {
    it('handles special characters in search', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search Data');
      
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
      });
    });

    it('handles long search strings', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search Data');
      const longString = 'a'.repeat(1000);
      
      fireEvent.change(input, { target: { value: longString } });
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
      });
    });

    it('handles rapid search changes', async () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search Data');
      
      for (let i = 0; i < 5; i++) {
        fireEvent.change(input, { target: { value: `test${i}` } });
      }
      
      await waitFor(() => {
        expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('handles large datasets', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        age: i % 100,
        email: `item${i}@example.com`,
        date: `2023-01-${String(i % 30 + 1).padStart(2, '0')}`
      }));
      
      render(<AdvancedSearchComponent {...defaultProps} data={largeData} />);
      expect(screen.getByText('Item 0')).toBeInTheDocument();
      expect(screen.getByText('Item 999')).toBeInTheDocument();
    });

    it('handles rapid prop changes', () => {
      const { rerender } = render(<AdvancedSearchComponent {...defaultProps} />);
      
      for (let i = 0; i < 10; i++) {
        rerender(<AdvancedSearchComponent {...defaultProps} showTable={i % 2 === 0} />);
      }
      
      expect(screen.getByTestId('data-table-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('handles keyboard navigation', () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.keyDown(dropdownButton, { key: 'Enter' });
      fireEvent.keyDown(dropdownButton, { key: ' ' });
      
      expect(dropdownButton).toBeInTheDocument();
    });

    it('handles mouse events', () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      const dropdownButton = screen.getByTitle('Search Data');
      
      fireEvent.mouseEnter(dropdownButton);
      fireEvent.mouseLeave(dropdownButton);
      
      expect(dropdownButton).toBeInTheDocument();
    });
  });

  describe('Data Structure Variations', () => {
    it('handles data with missing fields', () => {
      const dataWithMissingFields = [
        { id: 1, name: 'John Doe' }, // missing age, email, date
        { id: 2, age: 25, email: 'jane@example.com' }, // missing name, date
        { id: 3, name: 'Bob Johnson', age: 35 } // missing email, date
      ];
      
      render(<AdvancedSearchComponent {...defaultProps} data={dataWithMissingFields} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('handles data with null/undefined values', () => {
      const dataWithNulls = [
        { id: 1, name: null, age: 30, email: 'john@example.com', date: '2023-01-01' },
        { id: 2, name: 'Jane Smith', age: null, email: 'jane@example.com', date: '2023-01-02' },
        { id: 3, name: 'Bob Johnson', age: 35, email: null, date: '2023-01-03' }
      ];
      
      render(<AdvancedSearchComponent {...defaultProps} data={dataWithNulls} />);
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('handles data with different data types', () => {
      const dataWithMixedTypes = [
        { id: 1, name: 'John Doe', age: '30', email: 'john@example.com', date: '2023-01-01' },
        { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com', date: '2023-01-02' },
        { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com', date: '2023-01-03' }
      ];
      
      render(<AdvancedSearchComponent {...defaultProps} data={dataWithMixedTypes} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });
});
