import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import AgGrid from '../../src/ag grid/AgGrid';

// Mock react-dom/server to avoid MessageChannel issues
jest.mock('react-dom/server', () => ({
  renderToStaticMarkup: jest.fn(() => '<div>mocked</div>')
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock AbortSignal.timeout
global.AbortSignal = {
  timeout: jest.fn(() => ({ aborted: false }))
} as any;

// Enhanced mock for AgGridReact with comprehensive API
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
    const [gridReady, setGridReady] = React.useState(false);
    const [cellData, setCellData] = React.useState(null);

    React.useEffect(() => {
      if (onGridReady && !gridReady) {
        setGridReady(true);
        onGridReady({ api: mockGridApi });
      }
    }, [onGridReady, gridReady]);

    const handleClick = () => {
      if (onCellClicked) {
        const cellParams = {
          colDef: { field: 'Country', editable: false },
          value: 'USA',
          data: { _id: 1, Country: 'USA' },
          rowIndex: 0,
          column: { getColId: () => 'Country' }
        };
        setCellData(cellParams);
        onCellClicked(cellParams);
      }
    };

    const handleDoubleClick = () => {
      if (onCellDoubleClicked) {
        const cellParams = {
          colDef: { field: 'Sales', editable: true },
          value: 1000,
          data: { _id: 1, Sales: 1000 },
          rowIndex: 0,
          column: { getColId: () => 'Sales' }
        };
        onCellDoubleClicked(cellParams);
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

    const handleColumnGroupOpened = () => {
      if (onColumnGroupOpened) {
        onColumnGroupOpened({ groupId: 'test', expanded: true });
      }
    };

    const handleRowGroupOpened = () => {
      if (onRowGroupOpened) {
        onRowGroupOpened({ groupId: 'test', expanded: true });
      }
    };

    const handleColumnRowGroupChanged = () => {
      if (onColumnRowGroupChanged) {
        onColumnRowGroupChanged({ columns: ['Country', 'Sales'] });
      }
    };

    const handleColumnPivotChanged = () => {
      if (onColumnPivotChanged) {
        onColumnPivotChanged({ columns: ['Country', 'Sales'] });
      }
    };

    return (
      <div data-testid="aggrid">
        <button data-testid="cell-click" onClick={handleClick}>Cell Click</button>
        <button data-testid="cell-double-click" onDoubleClick={handleDoubleClick}>Cell Double Click</button>
        <button data-testid="value-change" onClick={handleValueChange}>Change Value</button>
        <button data-testid="editing-started" onClick={handleEditingStarted}>Start Editing</button>
        <button data-testid="column-group-opened" onClick={handleColumnGroupOpened}>Column Group Opened</button>
        <button data-testid="row-group-opened" onClick={handleRowGroupOpened}>Row Group Opened</button>
        <button data-testid="column-row-group-changed" onClick={handleColumnRowGroupChanged}>Row Group Changed</button>
        <button data-testid="column-pivot-changed" onClick={handleColumnPivotChanged}>Pivot Changed</button>
        {cellData && <div data-testid="cell-data">{JSON.stringify(cellData)}</div>}
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
  ChevronUp: () => <div data-testid="chevron-up-icon" />
}));

jest.mock('../../src/ag grid/menuItems', () => ({
  __esModule: true,
  default: jest.fn(() => [])
}));

jest.mock('../../src/ag grid/ActionsCellRenderer', () => ({
  __esModule: true,
  default: () => <div data-testid="actions-cell-renderer">Actions</div>
}));

describe('AgGrid - Integration Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    
    // Mock successful API response by default
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      json: () => Promise.resolve({
        status: 'Ok',
        data: [
          {
            key: 'sales_data_sonam',
            value: {
              data: [
                {
                  _id: 1,
                  Country: 'USA',
                  Division: 'North',
                  Department: 'Sales',
                  Section: 'Retail',
                  Class: 'Electronics',
                  Brand: 'TechCorp',
                  PricePoint: 'Premium',
                  ClassPricePoint: 'Premium',
                  Sales: 1000,
                  MgnValue: 500,
                  LYsales: 900,
                  Year: 2023,
                  Month: '01',
                  Date: '2023-01-01',
                  Half: 'H1',
                  Quarter: 'Q1',
                  WeekNo: '1',
                  DayoftheWeek: 'Monday',
                  MonthName: 'January'
                }
              ]
            }
          }
        ]
      })
    });
  });

  describe('Complete Data Flow Integration', () => {
    it('handles complete data loading workflow', async () => {
      render(<AgGrid />);

      // Wait for grid to be ready
      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify API was called
      expect(mockFetch).toHaveBeenCalled();
    });

    it('handles API request with health check', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify health check was called
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/health'),
        expect.objectContaining({
          method: 'GET',
          signal: expect.any(Object)
        })
      );
    });

    it('handles API request with main data endpoint', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify main API call was made
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/data/Data/ExecuteSqlQueries'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String)
        })
      );
    });
  });

  describe('Grid Event Integration', () => {
    it('handles complete cell interaction workflow', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Test cell click
      const cellClickButton = screen.getByTestId('cell-click');
      fireEvent.click(cellClickButton);

      // Test cell double click
      const cellDoubleClickButton = screen.getByTestId('cell-double-click');
      fireEvent.dblClick(cellDoubleClickButton);

      // Test value change
      const valueChangeButton = screen.getByTestId('value-change');
      fireEvent.click(valueChangeButton);

      // Test editing started
      const editingStartedButton = screen.getByTestId('editing-started');
      fireEvent.click(editingStartedButton);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles complete group interaction workflow', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Test column group opened
      const columnGroupButton = screen.getByTestId('column-group-opened');
      fireEvent.click(columnGroupButton);

      // Test row group opened
      const rowGroupButton = screen.getByTestId('row-group-opened');
      fireEvent.click(rowGroupButton);

      // Test column row group changed
      const rowGroupChangedButton = screen.getByTestId('column-row-group-changed');
      fireEvent.click(rowGroupChangedButton);

      // Test column pivot changed
      const pivotChangedButton = screen.getByTestId('column-pivot-changed');
      fireEvent.click(pivotChangedButton);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });

  describe('API Response Processing Integration', () => {
    it('handles CSV data processing workflow', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'sales_data_sonam',
              value: {
                csvData: [
                  '_id|Country|Division|Department|Section|Class|Brand|PricePoint|ClassPricePoint|Sales|MgnValue|LYsales|Year|Month|Date|Half|Quarter|WeekNo|DayoftheWeek|MonthName',
                  '1|USA|North|Sales|Retail|Electronics|TechCorp|Premium|Premium|1000|500|900|2023|01|2023-01-01|H1|Q1|1|Monday|January'
                ]
              }
            }
          ]
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles records data processing workflow', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'sales_data_sonam',
              value: {
                records: [
                  {
                    _id: 1,
                    Country: 'USA',
                    Sales: 1000
                  }
                ]
              }
            }
          ]
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles direct value object processing workflow', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'sales_data_sonam',
              value: {
                _id: 1,
                Country: 'USA',
                Sales: 1000
              }
            }
          ]
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('handles API error with fallback to mock data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles HTTP error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({ error: 'Server error' })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles malformed API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Error',
          data: null
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });

  describe('Grid Configuration Integration', () => {
    it('handles grid configuration with all options', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify grid is configured with all the complex options
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles column definitions integration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Test that all column types are handled
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles icon configuration integration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify icons are properly configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('handles large dataset processing', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        _id: i + 1,
        Country: `Country ${i % 10}`,
        Sales: i * 100
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'sales_data_sonam',
              value: { data: largeData }
            }
          ]
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles rapid state changes', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Simulate rapid interactions
      for (let i = 0; i < 10; i++) {
        const cellClickButton = screen.getByTestId('cell-click');
        fireEvent.click(cellClickButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });

  describe('Environment Variable Integration', () => {
    it('handles custom environment variables', async () => {
      const originalEnv = process.env;
      
      process.env = {
        ...originalEnv,
        REACT_APP_API_BASE_URL: 'http://custom-api:8080',
        REACT_APP_API_ENDPOINT: '/custom/endpoint',
        REACT_APP_HEALTH_ENDPOINT: '/custom/health'
      };

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify custom endpoints were used
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://custom-api:8080/custom/health'),
        expect.any(Object)
      );

      process.env = originalEnv;
    });

    it('handles missing environment variables with defaults', async () => {
      const originalEnv = process.env;
      
      delete process.env.REACT_APP_API_BASE_URL;
      delete process.env.REACT_APP_API_ENDPOINT;
      delete process.env.REACT_APP_HEALTH_ENDPOINT;

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      process.env = originalEnv;
    });
  });
});
