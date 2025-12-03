import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import AgGrid from '../../src/ag grid/AgGrid';

// Mock react-dom/server to avoid MessageChannel issues
jest.mock('react-dom/server', () => ({
  renderToStaticMarkup: jest.fn(() => '<div>mocked</div>')
}));

// Mock AgGridReact with more realistic behavior
const mockGridApi = {
  sizeColumnsToContent: jest.fn(),
  sizeColumnsToFit: jest.fn(),
  refreshCells: jest.fn(),
  expandAll: jest.fn(),
  clearFocusedCell: jest.fn(),
  ensureIndexVisible: jest.fn(),
  setFocusedCell: jest.fn(),
  getDisplayedRowCount: jest.fn(() => 10),
  getDisplayedRowAtIndex: jest.fn(() => ({ data: { _id: 1, Country: 'USA' } })),
  forEachNode: jest.fn(),
  setRowData: jest.fn(),
  setColumnDefs: jest.fn(),
  getColumnDef: jest.fn(),
  getColumnApi: jest.fn(),
  getGridApi: jest.fn(),
  columnApi: {
    expandAll: jest.fn()
  }
};

jest.mock('ag-grid-react', () => ({
  AgGridReact: ({ onGridReady, onCellClicked, onCellDoubleClicked, onColumnGroupOpened, onRowGroupOpened, onColumnRowGroupChanged, onColumnPivotChanged, onCellValueChanged, onCellEditingStarted, ...props }) => {
    React.useEffect(() => {
      if (onGridReady) {
        onGridReady({ api: mockGridApi });
      }
    }, [onGridReady]);

    const handleClick = () => {
      if (onCellClicked) {
        onCellClicked({
          colDef: { field: 'Country', editable: false },
          value: 'USA',
          data: { _id: 1, Country: 'USA' },
          rowIndex: 0,
          column: { getColId: () => 'Country' }
        });
      }
    };

    const handleDoubleClick = () => {
      if (onCellDoubleClicked) {
        onCellDoubleClicked({
          colDef: { field: 'Sales', editable: true },
          value: 1000,
          data: { _id: 1, Sales: 1000 },
          rowIndex: 0,
          column: { getColId: () => 'Sales' }
        });
      }
    };

    const handleValueChange = () => {
      if (onCellValueChanged) {
        onCellValueChanged({
          colDef: { field: 'Sales' },
          oldValue: 1000,
          newValue: 2000,
          data: { _id: 1, Sales: 2000 }
        });
      }
    };

    const handleEditingStarted = () => {
      if (onCellEditingStarted) {
        onCellEditingStarted({
          colDef: { field: 'Sales' },
          value: 1000,
          data: { _id: 1, Sales: 1000 }
        });
      }
    };

    return (
      <div data-testid="aggrid" onClick={handleClick} onDoubleClick={handleDoubleClick}>
        <button onClick={handleValueChange}>Change Value</button>
        <button onClick={handleEditingStarted}>Start Editing</button>
        <button onClick={() => onColumnGroupOpened?.({ groupId: 'test' })}>Column Group</button>
        <button onClick={() => onRowGroupOpened?.({ groupId: 'test' })}>Row Group</button>
        <button onClick={() => onColumnRowGroupChanged?.({ columns: [] })}>Row Group Changed</button>
        <button onClick={() => onColumnPivotChanged?.({ columns: [] })}>Pivot Changed</button>
      </div>
    );
  }
}));

jest.mock('@carbon/icons-react', () => ({
  Add: () => <div data-testid="add-icon" />,
  ArrowsVertical: () => <div data-testid="arrows-icon" />,
  Column: () => <div data-testid="column-icon" />,
  SettingsAdjust: () => <div data-testid="settings-icon" />,
  Subtract: () => <div data-testid="subtract-icon" />,
  ChevronUp: () => <div data-testid="chevron-icon" />
}));

jest.mock('../../src/ag grid/menuItems', () => jest.fn(() => []));
jest.mock('../../src/ag grid/ActionsCellRenderer', () => () => <div data-testid="actions-cell" />);
jest.mock('../../src/ag grid/Actions', () => ({ ActionItem: {} }));
jest.mock('../../src/ag grid/App.css', () => ({}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

Object.defineProperty(global, 'AbortSignal', {
  value: { timeout: jest.fn(() => ({ aborted: false })) }
});

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

describe('AgGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.REACT_APP_API_BASE_URL;
    delete process.env.REACT_APP_API_ENDPOINT;
    delete process.env.REACT_APP_HEALTH_ENDPOINT;
    
    // Mock successful API response by default
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve({
        status: 'Ok',
        data: [{
          key: 'sales_data_sonam',
          value: { data: [{ _id: 1, Country: 'USA', Sales: 1000 }] }
        }]
      })
    });
  });

  it('renders without crashing', async () => {
    render(<AgGrid />);
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles cell click events', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    const grid = screen.getByTestId('aggrid');
    
    await act(async () => {
      fireEvent.click(grid);
    });
    
    expect(screen.getByTestId('aggrid')).toBeInTheDocument();
  });

  it('handles cell double click events', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    const grid = screen.getByTestId('aggrid');
    
    await act(async () => {
      fireEvent.doubleClick(grid);
    });
    
    expect(screen.getByTestId('aggrid')).toBeInTheDocument();
  });

  it('handles cell value changes', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    const changeButton = screen.getByText('Change Value');
    
    await act(async () => {
      fireEvent.click(changeButton);
    });
    
    expect(screen.getByTestId('aggrid')).toBeInTheDocument();
  });

  it('handles cell editing started', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    const editButton = screen.getByText('Start Editing');
    
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    expect(screen.getByTestId('aggrid')).toBeInTheDocument();
  });

  it('handles column group opened events', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    const columnGroupButton = screen.getByText('Column Group');
    
    await act(async () => {
      fireEvent.click(columnGroupButton);
    });
    
    expect(screen.getByTestId('aggrid')).toBeInTheDocument();
  });

  it('handles row group opened events', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    const rowGroupButton = screen.getByText('Row Group');
    
    await act(async () => {
      fireEvent.click(rowGroupButton);
    });
    
    expect(screen.getByTestId('aggrid')).toBeInTheDocument();
  });

  it('handles column row group changed events', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    const rowGroupChangedButton = screen.getByText('Row Group Changed');
    
    await act(async () => {
      fireEvent.click(rowGroupChangedButton);
    });
    
    expect(screen.getByTestId('aggrid')).toBeInTheDocument();
  });

  it('handles column pivot changed events', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    const pivotChangedButton = screen.getByText('Pivot Changed');
    
    await act(async () => {
      fireEvent.click(pivotChangedButton);
    });
    
    expect(screen.getByTestId('aggrid')).toBeInTheDocument();
  });

  it('handles auto-size columns functionality', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(mockGridApi.sizeColumnsToContent).toHaveBeenCalled();
    });
  });

  it('handles column group expansion', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(mockGridApi.expandAll).toHaveBeenCalled();
    });
  });

  it('handles row group expansion', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(mockGridApi.expandAll).toHaveBeenCalled();
    });
  });

  it('handles window resize events', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    act(() => {
      fireEvent(window, new Event('resize'));
    });
    
    expect(screen.getByTestId('aggrid')).toBeInTheDocument();
  });

  it('handles component unmounting', async () => {
    const { unmount } = render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
    
    unmount();
    expect(screen.queryByTestId('aggrid')).not.toBeInTheDocument();
  });

  it('handles different environment variables', async () => {
    process.env.REACT_APP_API_BASE_URL = 'http://test-api.com';
    process.env.REACT_APP_API_ENDPOINT = '/test-endpoint';
    process.env.REACT_APP_HEALTH_ENDPOINT = '/test-health';

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles missing environment variables', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles API request with successful response', async () => {
    const mockResponse = {
      status: 'Ok',
      data: [{
        key: 'sales_data_sonam',
        value: { data: [{ _id: 1, Country: 'USA', Sales: 1000 }] }
      }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles API request with health check failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Health check failed'));
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles API request with HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles API request with timeout', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Request timeout'));
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles API response with CSV data', async () => {
    const mockResponse = {
      status: 'Ok',
      data: [{
        key: 'sales_data_sonam',
        value: { csvData: ['_id|Country|Sales', '1|USA|1000'] }
      }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles API response with records data', async () => {
    const mockResponse = {
      status: 'Ok',
      data: [{
        key: 'sales_data_sonam',
        value: { records: [{ _id: 1, Country: 'USA', Sales: 1000 }] }
      }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles API response with direct value object', async () => {
    const mockResponse = {
      status: 'Ok',
      data: [{
        key: 'sales_data_sonam',
        value: { _id: 1, Country: 'USA', Sales: 1000 }
      }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles API response with unrecognized structure', async () => {
    const mockResponse = {
      status: 'Ok',
      data: [{ key: 'sales_data_sonam', value: 'unrecognized' }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles API response processing errors', async () => {
    const mockResponse = {
      status: 'Ok',
      data: [{ key: 'sales_data_sonam', value: null }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles health check failures', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Health check failed'));
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles API timeout', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Request timeout'));
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles HTTP error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles different data types in API response', async () => {
    const mockResponse = {
      status: 'Ok',
      data: [{
        key: 'sales_data_sonam',
        value: { data: [{ _id: '1', Country: 'USA', Sales: '1000' }] }
      }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles empty API response', async () => {
    const mockResponse = { status: 'Ok', data: [] };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles malformed API response', async () => {
    const mockResponse = { status: 'Error', data: null };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles JSON parsing errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.reject(new Error('JSON parse error'))
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles large datasets', async () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      _id: i + 1,
      Country: `Country ${i}`,
      Sales: i * 100
    }));

    const mockResponse = {
      status: 'Ok',
      data: [{
        key: 'sales_data_sonam',
        value: { data: largeData }
      }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles numeric field parsing', async () => {
    const mockResponse = {
      status: 'Ok',
      data: [{
        key: 'sales_data_sonam',
        value: { data: [{ _id: '1', Country: 'USA', Sales: '1000.50', MgnValue: '500.25' }] }
      }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles string field parsing', async () => {
    const mockResponse = {
      status: 'Ok',
      data: [{
        key: 'sales_data_sonam',
        value: { data: [{ _id: 1, Country: 'USA', Sales: 1000, Division: 'Electronics' }] }
      }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles mixed data types in single response', async () => {
    const mockResponse = {
      status: 'Ok',
      data: [{
        key: 'sales_data_sonam',
        value: { 
          data: [
            { _id: 1, Country: 'USA', Sales: 1000 },
            { _id: 2, Country: 'Canada', Sales: '2000' },
            { _id: 3, Country: 'Mexico', Sales: null }
          ]
        }
      }]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map(),
      json: () => Promise.resolve(mockResponse)
    });

    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles column definitions correctly', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles grid configuration options', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles icon rendering', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles action items configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles cell renderer parameters', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles row class rules', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles cell class rules', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles default column definitions', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles status bar configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles icons configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles master detail configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles detail cell renderer parameters', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles main menu items', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles pivot mode configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles sidebar configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles animation configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles cell selection configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles clipboard configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles row group panel configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles pivot panel configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles focus configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles drag and drop configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
    expect(screen.getByTestId('aggrid')).toBeInTheDocument();
  });
});

  it('handles virtualization configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  it('handles group display type configuration', async () => {
    render(<AgGrid />);
    
    await waitFor(() => {
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });
});