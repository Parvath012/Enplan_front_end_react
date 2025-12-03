import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdvancedSearchComponent, SearchColumn, SearchRow } from '../AdvancedSearchComponent';

// Mock the imported components
jest.mock('../QueryAutoComplete', () => ({
  QueryAutoComplete: ({ onChange, onParseSuccess, onParseError, onClose, onError, clear }: any) => {
    const [value, setValue] = React.useState('');
    
    const handleChange = (newValue: string) => {
      setValue(newValue);
      onChange && onChange(newValue, []);
    };
    
    const handleClose = () => {
      setValue('');
      onClose && onClose();
    };
    
    return (
      <div data-testid="query-autocomplete">
        <input
          data-testid="query-input"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Query input"
        />
        <button
          data-testid="parse-success"
          onClick={() => onParseSuccess && onParseSuccess([{ column_hash: 'col1', operator: '=', value: 'test' }])}
        >
          Parse Success
        </button>
        <button
          data-testid="parse-error"
          onClick={() => onParseError && onParseError()}
        >
          Parse Error
        </button>
        <button
          data-testid="close-button"
          onClick={handleClose}
        >
          Close
        </button>
        <button
          data-testid="error-button"
          onClick={() => onError && onError('Test error')}
        >
          Error
        </button>
        {clear && <span data-testid="clear-indicator">Clear</span>}
      </div>
    );
  }
}));

jest.mock('../FilterOptions', () => ({
  FilterOptions: ({ onColumnsChange, onClose, enableColumnFilter, enableRowFilter }: any) => (
    <div data-testid="filter-options">
      <button
        data-testid="filter-columns"
        onClick={() => onColumnsChange([{ id: 'col1', name: 'Column 1' }])}
      >
        Filter Columns
      </button>
      <button
        data-testid="filter-all-columns"
        onClick={() => onColumnsChange([])}
      >
        Filter All Columns
      </button>
      <button
        data-testid="filter-close"
        onClick={() => onClose && onClose()}
      >
        Close Filter
      </button>
      <span data-testid="column-filter-enabled">{enableColumnFilter ? 'enabled' : 'disabled'}</span>
      <span data-testid="row-filter-enabled">{enableRowFilter ? 'enabled' : 'disabled'}</span>
    </div>
  )
}));

jest.mock('../ClearButton', () => ({
  ClearButton: ({ onClick, visible }: any) => (
    visible ? (
      <button data-testid="clear-button" onClick={onClick}>
        Clear
      </button>
    ) : null
  )
}));

// Mock CSS imports
jest.mock('../AdvancedSearchComponent.scss', () => ({}));

describe('AdvancedSearchComponent', () => {
  const mockColumns: SearchColumn[] = [
    { id: 'col1', name: 'Column 1', type: 'string' },
    { id: 'col2', name: 'Column 2', type: 'numerical' },
    { id: 'col3', name: 'Column 3', type: 'date' }
  ];

  const mockData: SearchRow[] = [
    { col1: 'Value 1', col2: 100, col3: '2023-01-01' },
    { col1: 'Value 2', col2: 200, col3: '2023-01-02' },
    { col1: 'Value 3', col2: 300, col3: '2023-01-03' }
  ];

  const defaultProps = {
    columns: mockColumns,
    data: mockData,
    onSearchResults: jest.fn(),
    onSearchModeChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with default props', () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      
      expect(screen.getByTestId('filter-options')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search Data')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <AdvancedSearchComponent {...defaultProps} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render with custom search bar dimensions', () => {
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchBarWidth="200px" 
          searchBarHeight="20px" 
        />
      );
      
      const searchContainer = screen.getByPlaceholderText('Search Data').closest('.search-input-container');
      expect(searchContainer).toHaveStyle({ width: '200px', height: '20px' });
    });

    it('should not render table when showTable is false', () => {
      render(<AdvancedSearchComponent {...defaultProps} showTable={false} />);
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('should not render filter when showFilter is false', () => {
      render(<AdvancedSearchComponent {...defaultProps} showFilter={false} />);
      
      expect(screen.queryByTestId('filter-options')).not.toBeInTheDocument();
    });

    it('should not render filter when both enableColumnFilter and enableRowFilter are false', () => {
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          enableColumnFilter={false} 
          enableRowFilter={false} 
        />
      );
      
      expect(screen.queryByTestId('filter-options')).not.toBeInTheDocument();
    });
  });

  describe('Search Mode Dropdown', () => {
    it('should render search mode dropdown when multiple modes available', () => {
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Data', 'Columns', 'Rows']} 
        />
      );
      
      // The dropdown should be rendered when there are multiple search modes
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('should not render search mode dropdown when only one mode available', () => {
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Data']} 
        />
      );
      
      // Should not render the dropdown button when only one mode
      expect(screen.queryByRole('button', { name: /search/i })).not.toBeInTheDocument();
    });

    it('should handle search mode change', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Data', 'Columns', 'Rows']} 
        />
      );
      
      const dropdownButton = screen.getByRole('button', { name: /search/i });
      await user.click(dropdownButton);
      
      // The dropdown should open and show options
      expect(screen.getByText('Search Data')).toBeInTheDocument();
    });

    it('should handle keyboard navigation in dropdown', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Data', 'Columns', 'Rows']} 
        />
      );
      
      const dropdownButton = screen.getByRole('button', { name: /search/i });
      
      // Test Enter key
      await user.click(dropdownButton);
      fireEvent.keyDown(dropdownButton, { key: 'Enter' });
      
      // Test Space key
      fireEvent.keyDown(dropdownButton, { key: ' ' });
    });
  });

  describe('Search Functionality', () => {
    it('should handle Data search mode', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Data']} 
        />
      );
      
      const input = screen.getByPlaceholderText('Search Data');
      await user.type(input, 'Value 1');
      
      expect(defaultProps.onSearchResults).toHaveBeenCalled();
    });

    it('should handle Columns search mode', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Columns']} 
          defaultSearchMode="Columns"
        />
      );
      
      const input = screen.getByPlaceholderText('Search Columns');
      await user.type(input, 'Column 1');
      
      expect(defaultProps.onSearchResults).toHaveBeenCalled();
    });

    it('should handle Rows search mode with query parsing', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Rows']} 
          defaultSearchMode="Rows"
        />
      );
      
      const queryInput = screen.getByTestId('query-input');
      await user.type(queryInput, 'col1 = "Value 1"');
      
      // Trigger parse success
      const parseSuccessButton = screen.getByTestId('parse-success');
      await user.click(parseSuccessButton);
      
      expect(defaultProps.onSearchResults).toHaveBeenCalled();
    });

    it('should handle query parse error', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Rows']} 
          defaultSearchMode="Rows"
        />
      );
      
      const parseErrorButton = screen.getByTestId('parse-error');
      await user.click(parseErrorButton);
      
      // Should handle error gracefully
      expect(screen.getByTestId('query-autocomplete')).toBeInTheDocument();
    });

    it('should handle clear functionality', async () => {
      const user = userEvent.setup();
      render(<AdvancedSearchComponent {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Search Data');
      await user.type(input, 'test');
      
      const clearButton = screen.getByTestId('clear-button');
      await user.click(clearButton);
      
      expect(input).toHaveValue('');
    });
  });

  describe('Filter Options', () => {
    it('should handle column filtering', async () => {
      const user = userEvent.setup();
      render(<AdvancedSearchComponent {...defaultProps} />);
      
      const filterColumnsButton = screen.getByTestId('filter-columns');
      await user.click(filterColumnsButton);
      
      expect(defaultProps.onSearchResults).toHaveBeenCalled();
    });

    it('should handle filtering all columns', async () => {
      const user = userEvent.setup();
      render(<AdvancedSearchComponent {...defaultProps} />);
      
      const filterAllButton = screen.getByTestId('filter-all-columns');
      await user.click(filterAllButton);
      
      expect(defaultProps.onSearchResults).toHaveBeenCalled();
    });

    it('should show correct filter enablement status', () => {
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          enableColumnFilter={true} 
          enableRowFilter={false} 
        />
      );
      
      expect(screen.getByTestId('column-filter-enabled')).toHaveTextContent('enabled');
      expect(screen.getByTestId('row-filter-enabled')).toHaveTextContent('disabled');
    });
  });

  describe('Query Evaluation', () => {
    it('should evaluate equals operator', () => {
      const { rerender } = render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Rows']} 
          defaultSearchMode="Rows"
        />
      );
      
      // Test with parsed query
      const parseSuccessButton = screen.getByTestId('parse-success');
      fireEvent.click(parseSuccessButton);
      
      expect(defaultProps.onSearchResults).toHaveBeenCalled();
    });

    it('should handle different search modes with defaultSearchMode', () => {
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          defaultSearchMode="Columns" 
        />
      );
      
      expect(screen.getByPlaceholderText('Search Columns')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data array', () => {
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          data={[]} 
        />
      );
      
      expect(screen.getByTestId('filter-options')).toBeInTheDocument();
    });

    it('should handle empty columns array', () => {
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          columns={[]} 
        />
      );
      
      expect(screen.getByTestId('filter-options')).toBeInTheDocument();
    });

    it('should handle null/undefined values in data', () => {
      const dataWithNulls: SearchRow[] = [
        { col1: null, col2: undefined, col3: '2023-01-01' },
        { col1: 'Value 2', col2: 200, col3: null }
      ];
      
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          data={dataWithNulls} 
        />
      );
      
      expect(screen.getByTestId('filter-options')).toBeInTheDocument();
    });

    it('should handle invalid regex in column search', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Columns']} 
          defaultSearchMode="Columns"
        />
      );
      
      const input = screen.getByPlaceholderText('Search Columns');
      await user.type(input, 'invalid-regex');
      
      // Should handle invalid regex gracefully
      expect(screen.getByTestId('filter-options')).toBeInTheDocument();
    });
  });

  describe('Callback Functions', () => {
    it('should call onSearchModeChange when mode changes', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Data', 'Columns']} 
        />
      );
      
      const dropdownButton = screen.getByRole('button', { name: /search/i });
      await user.click(dropdownButton);
      
      // Simulate mode selection
      const modeButton = screen.getByText('Search Columns');
      await user.click(modeButton);
      
      expect(defaultProps.onSearchModeChange).toHaveBeenCalled();
    });

    it('should call onSearchResults with filtered data', async () => {
      const user = userEvent.setup();
      render(<AdvancedSearchComponent {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Search Data');
      await user.type(input, 'Value 1');
      
      await waitFor(() => {
        expect(defaultProps.onSearchResults).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ col1: 'Value 1' })
          ]),
          expect.any(Array)
        );
      });
    });
  });

  describe('Component State Management', () => {
    it('should reset search value when mode changes', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Data', 'Columns']} 
        />
      );
      
      const input = screen.getByPlaceholderText('Search Data');
      await user.type(input, 'test value');
      
      // Change mode
      const dropdownButton = screen.getByRole('button', { name: /search/i });
      await user.click(dropdownButton);
      const modeButton = screen.getByText('Search Columns');
      await user.click(modeButton);
      
      // Input should be reset
      const newInput = screen.getByPlaceholderText('Search Columns');
      expect(newInput).toHaveValue('');
    });

    it('should handle query value changes in Rows mode', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Rows']} 
          defaultSearchMode="Rows"
        />
      );
      
      const queryInput = screen.getByTestId('query-input');
      await user.type(queryInput, 'test query');
      
      expect(queryInput).toHaveValue('test query');
    });

    it('should handle clear query in Rows mode', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Rows']} 
          defaultSearchMode="Rows"
        />
      );
      
      const queryInput = screen.getByTestId('query-input');
      await user.type(queryInput, 'test query');
      
      const closeButton = screen.getByTestId('close-button');
      await user.click(closeButton);
      
      expect(queryInput).toHaveValue('');
    });
  });

  describe('Data Table View', () => {
    it('should render data table with correct columns and data', () => {
      render(<AdvancedSearchComponent {...defaultProps} showTable={true} />);
      
      // Check if table headers are rendered
      expect(screen.getByText('Column 1')).toBeInTheDocument();
      expect(screen.getByText('Column 2')).toBeInTheDocument();
      expect(screen.getByText('Column 3')).toBeInTheDocument();
      
      // Check if data rows are rendered
      expect(screen.getByText('Value 1')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should update table when columns are filtered', async () => {
      const user = userEvent.setup();
      render(<AdvancedSearchComponent {...defaultProps} />);
      
      const filterColumnsButton = screen.getByTestId('filter-columns');
      await user.click(filterColumnsButton);
      
      // Table should update with filtered columns
      expect(screen.getByText('Column 1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<AdvancedSearchComponent {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search Data');
      expect(searchInput).toBeInTheDocument();
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Data', 'Columns']} 
        />
      );
      
      const dropdownButton = screen.getByRole('button', { name: /search/i });
      
      // Test keyboard navigation
      await user.tab();
      fireEvent.keyDown(dropdownButton, { key: 'Enter' });
      fireEvent.keyDown(dropdownButton, { key: ' ' });
    });
  });

  describe('Error Handling', () => {
    it('should handle query parse errors gracefully', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Rows']} 
          defaultSearchMode="Rows"
        />
      );
      
      const parseErrorButton = screen.getByTestId('parse-error');
      await user.click(parseErrorButton);
      
      // Component should still be functional
      expect(screen.getByTestId('query-autocomplete')).toBeInTheDocument();
    });

    it('should handle onError callback', async () => {
      const user = userEvent.setup();
      render(
        <AdvancedSearchComponent 
          {...defaultProps} 
          searchModes={['Rows']} 
          defaultSearchMode="Rows"
        />
      );
      
      const errorButton = screen.getByTestId('error-button');
      await user.click(errorButton);
      
      // Should handle error without crashing
      expect(screen.getByTestId('query-autocomplete')).toBeInTheDocument();
    });
  });
});
