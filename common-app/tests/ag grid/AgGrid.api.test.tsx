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

// Mock AgGridReact
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
  AgGridReact: ({ onGridReady, ...props }) => {
    React.useEffect(() => {
      if (onGridReady) {
        onGridReady({ api: mockGridApi });
      }
    }, [onGridReady]);

    return <div data-testid="aggrid">Grid Component</div>;
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

describe('AgGrid - Advanced API Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('API Request Structure Testing', () => {
    it('handles API payload creation with correct structure', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: []
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify API payload structure
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/data/Data/ExecuteSqlQueries'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringMatching(/"executeInParallel":true/)
        })
      );
    });

    it('handles API payload with correct database configuration', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: []
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      const apiCall = mockFetch.mock.calls.find(call => 
        call[0].includes('/api/v1/data/Data/ExecuteSqlQueries')
      );
      
      expect(apiCall).toBeDefined();
      const payload = JSON.parse(apiCall[1].body);
      
      expect(payload.executeInParallel).toBe(true);
      expect(payload.sqlQueries).toHaveLength(1);
      expect(payload.sqlQueries[0].name).toBe('sales_data_sonam');
      expect(payload.sqlQueries[0].query.databaseId).toBe('09d8e037-0005-4887-abde-112a529de2b8');
      expect(payload.sqlQueries[0].query.tables).toEqual(['sales_data_sonam']);
    });

    it('handles API payload with correct column definitions', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: []
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      const apiCall = mockFetch.mock.calls.find(call => 
        call[0].includes('/api/v1/data/Data/ExecuteSqlQueries')
      );
      
      const payload = JSON.parse(apiCall[1].body);
      const columns = payload.sqlQueries[0].query.columns;
      
      expect(columns).toHaveLength(20); // All API_COLUMNS
      expect(columns.some(col => col.columnName === '_id' && col.dataType === 'integer')).toBe(true);
      expect(columns.some(col => col.columnName === 'Country' && col.dataType === 'string')).toBe(true);
      expect(columns.some(col => col.columnName === 'Sales' && col.dataType === 'numeric')).toBe(true);
    });
  });

  describe('API Response Processing Testing', () => {
    it('handles successful API response with data array', async () => {
      const testData = [
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
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'sales_data_sonam',
              value: { data: testData }
            }
          ]
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles API response with CSV data format', async () => {
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
                csvData: [
                  '_id|Country|Division|Department|Section|Class|Brand|PricePoint|ClassPricePoint|Sales|MgnValue|LYsales|Year|Month|Date|Half|Quarter|WeekNo|DayoftheWeek|MonthName',
                  '1|USA|North|Sales|Retail|Electronics|TechCorp|Premium|Premium|1000|500|900|2023|01|2023-01-01|H1|Q1|1|Monday|January',
                  '2|Canada|South|Marketing|Online|Clothing|FashionCorp|Standard|Standard|2000|1000|1800|2023|02|2023-02-01|H1|Q1|2|Tuesday|February'
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

    it('handles API response with records format', async () => {
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
                records: [
                  {
                    _id: 1,
                    Country: 'USA',
                    Sales: 1000
                  },
                  {
                    _id: 2,
                    Country: 'Canada',
                    Sales: 2000
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

    it('handles API response with direct value object', async () => {
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
            }
          ]
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles API response with unrecognized structure', async () => {
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
                unknownStructure: 'some value'
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

  describe('Data Processing Testing', () => {
    it('handles numeric field parsing correctly', async () => {
      const testData = [
        {
          _id: '1',
          Sales: '1000.50',
          MgnValue: '500.25',
          LYsales: '900.75',
          Year: '2023'
        }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'sales_data_sonam',
              value: { data: testData }
            }
          ]
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles string field parsing correctly', async () => {
      const testData = [
        {
          _id: 1,
          Country: 'United States of America',
          Division: 'North American Division',
          Department: 'Sales Department',
          Section: 'Retail Section',
          Class: 'Electronics Class',
          Brand: 'TechCorp Brand',
          PricePoint: 'Premium Price Point',
          ClassPricePoint: 'Premium Class Price Point',
          Month: 'January',
          Date: '2023-01-01',
          Half: 'First Half',
          Quarter: 'First Quarter',
          WeekNo: 'Week 1',
          DayoftheWeek: 'Monday',
          MonthName: 'January'
        }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'sales_data_sonam',
              value: { data: testData }
            }
          ]
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles mixed data types in single response', async () => {
      const testData = [
        {
          _id: 1,
          Country: 'USA',
          Sales: 1000,
          Year: 2023,
          Month: '01'
        },
        {
          _id: '2',
          Country: 'Canada',
          Sales: '2000.50',
          Year: '2023',
          Month: '02'
        }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'sales_data_sonam',
              value: { data: testData }
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

  describe('Error Handling Testing', () => {
    it('handles API timeout error', async () => {
      mockFetch.mockRejectedValue(new Error('Request timeout'));

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles HTTP error responses', async () => {
      mockFetch.mockResolvedValue({
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

    it('handles JSON parsing errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles malformed API response', async () => {
      mockFetch.mockResolvedValue({
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

    it('handles empty API response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: []
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });

  describe('Health Check Testing', () => {
    it('handles successful health check', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map([['content-type', 'application/json']]),
          json: () => Promise.resolve({ status: 'healthy' })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map([['content-type', 'application/json']]),
          json: () => Promise.resolve({
            status: 'Ok',
            data: []
          })
        });

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

    it('handles health check failure', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Health check failed'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map([['content-type', 'application/json']]),
          json: () => Promise.resolve({
            status: 'Ok',
            data: []
          })
        });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });

  describe('Environment Variable Testing', () => {
    it('handles custom API base URL', async () => {
      const originalEnv = process.env;
      
      process.env = {
        ...originalEnv,
        REACT_APP_API_BASE_URL: 'http://custom-server:9000'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: []
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://custom-server:9000'),
        expect.any(Object)
      );

      process.env = originalEnv;
    });

    it('handles custom API endpoint', async () => {
      const originalEnv = process.env;
      
      process.env = {
        ...originalEnv,
        REACT_APP_API_ENDPOINT: '/custom/data/endpoint'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: []
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/custom/data/endpoint'),
        expect.any(Object)
      );

      process.env = originalEnv;
    });

    it('handles custom health endpoint', async () => {
      const originalEnv = process.env;
      
      process.env = {
        ...originalEnv,
        REACT_APP_HEALTH_ENDPOINT: '/custom/health/check'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: []
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/custom/health/check'),
        expect.any(Object)
      );

      process.env = originalEnv;
    });
  });
});
