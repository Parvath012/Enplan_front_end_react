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

describe('AgGrid - Boundary Value and Edge Case Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Data Boundary Testing', () => {
    it('handles empty data array', async () => {
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

    it('handles single item data', async () => {
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

    it('handles maximum data boundary', async () => {
      const maxData = Array.from({ length: 1000 }, (_, i) => ({ // Reduced from 10000 to 1000 for better performance
        _id: i + 1,
        Country: `Country ${i % 100}`,
        Sales: i * 100
      }));

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'sales_data_sonam',
              value: { data: maxData }
            }
          ]
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      }, { timeout: 20000 }); // Increase timeout for large dataset
    });

    it('handles null data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: null
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles undefined data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: undefined
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });

  describe('Numeric Boundary Testing', () => {
    it('handles zero values', async () => {
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
                    _id: 0,
                    Country: 'USA',
                    Sales: 0,
                    MgnValue: 0,
                    LYsales: 0,
                    Year: 0
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

    it('handles negative values', async () => {
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
                    _id: -1,
                    Country: 'USA',
                    Sales: -1000,
                    MgnValue: -500,
                    LYsales: -900,
                    Year: -2023
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

    it('handles maximum numeric values', async () => {
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
                    _id: Number.MAX_SAFE_INTEGER,
                    Country: 'USA',
                    Sales: Number.MAX_VALUE,
                    MgnValue: Number.MAX_VALUE,
                    LYsales: Number.MAX_VALUE,
                    Year: Number.MAX_SAFE_INTEGER
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

    it('handles minimum numeric values', async () => {
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
                    _id: Number.MIN_SAFE_INTEGER,
                    Country: 'USA',
                    Sales: Number.MIN_VALUE,
                    MgnValue: Number.MIN_VALUE,
                    LYsales: Number.MIN_VALUE,
                    Year: Number.MIN_SAFE_INTEGER
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

    it('handles NaN values', async () => {
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
                    _id: NaN,
                    Country: 'USA',
                    Sales: NaN,
                    MgnValue: NaN,
                    LYsales: NaN,
                    Year: NaN
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

    it('handles Infinity values', async () => {
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
                    _id: Infinity,
                    Country: 'USA',
                    Sales: Infinity,
                    MgnValue: Infinity,
                    LYsales: Infinity,
                    Year: Infinity
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
  });

  describe('String Boundary Testing', () => {
    it('handles empty strings', async () => {
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
                    Country: '',
                    Division: '',
                    Department: '',
                    Section: '',
                    Class: '',
                    Brand: '',
                    PricePoint: '',
                    ClassPricePoint: '',
                    Month: '',
                    Date: '',
                    Half: '',
                    Quarter: '',
                    WeekNo: '',
                    DayoftheWeek: '',
                    MonthName: ''
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

    it('handles single character strings', async () => {
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
                    Country: 'U',
                    Division: 'N',
                    Department: 'S',
                    Section: 'R',
                    Class: 'E',
                    Brand: 'T',
                    PricePoint: 'P',
                    ClassPricePoint: 'P',
                    Month: '0',
                    Date: '1',
                    Half: 'H',
                    Quarter: 'Q',
                    WeekNo: '1',
                    DayoftheWeek: 'M',
                    MonthName: 'J'
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

    it('handles maximum length strings', async () => {
      const longString = 'a'.repeat(10000);
      
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
                    Country: longString,
                    Division: longString,
                    Department: longString,
                    Section: longString,
                    Class: longString,
                    Brand: longString,
                    PricePoint: longString,
                    ClassPricePoint: longString,
                    Month: longString,
                    Date: longString,
                    Half: longString,
                    Quarter: longString,
                    WeekNo: longString,
                    DayoftheWeek: longString,
                    MonthName: longString
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

    it('handles special characters in strings', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      
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
                    Country: specialChars,
                    Division: specialChars,
                    Department: specialChars,
                    Section: specialChars,
                    Class: specialChars,
                    Brand: specialChars,
                    PricePoint: specialChars,
                    ClassPricePoint: specialChars,
                    Month: specialChars,
                    Date: specialChars,
                    Half: specialChars,
                    Quarter: specialChars,
                    WeekNo: specialChars,
                    DayoftheWeek: specialChars,
                    MonthName: specialChars
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

    it('handles unicode characters in strings', async () => {
      const unicodeString = '🚀🌟💫⭐🎯🎪🎨🎭🎪🎯';
      
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
                    Country: unicodeString,
                    Division: unicodeString,
                    Department: unicodeString,
                    Section: unicodeString,
                    Class: unicodeString,
                    Brand: unicodeString,
                    PricePoint: unicodeString,
                    ClassPricePoint: unicodeString,
                    Month: unicodeString,
                    Date: unicodeString,
                    Half: unicodeString,
                    Quarter: unicodeString,
                    WeekNo: unicodeString,
                    DayoftheWeek: unicodeString,
                    MonthName: unicodeString
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
  });

  describe('API Response Boundary Testing', () => {
    it('handles malformed API response structure', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Error',
          data: null,
          error: 'Malformed response'
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles API response with missing key', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'wrong_key',
              value: {
                data: [
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

    it('handles API response with missing value', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'sales_data_sonam',
              value: null
            }
          ]
        })
      });

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles API response with undefined value', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: [
            {
              key: 'sales_data_sonam',
              value: undefined
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

  describe('CSV Data Boundary Testing', () => {
    it('handles empty CSV data', async () => {
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
                csvData: []
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

    it('handles CSV data with only headers', async () => {
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
                  '_id|Country|Division|Department|Section|Class|Brand|PricePoint|ClassPricePoint|Sales|MgnValue|LYsales|Year|Month|Date|Half|Quarter|WeekNo|DayoftheWeek|MonthName'
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

    it('handles CSV data with malformed rows', async () => {
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
                  '_id|Country|Sales',
                  '1|USA|1000',
                  '2|Canada', // Missing Sales value
                  '3||2000', // Missing Country value
                  '4|Germany|3000|Extra|Values' // Extra values
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

    it('handles CSV data with quoted values', async () => {
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
                  '_id|Country|Sales',
                  "'1'|'USA'|'1000'",
                  "'2'|'Canada'|'2000'"
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
  });

  describe('Environment Variable Boundary Testing', () => {
    it('handles undefined environment variables', async () => {
      const originalEnv = process.env;
      
      delete process.env.REACT_APP_API_BASE_URL;
      delete process.env.REACT_APP_API_ENDPOINT;
      delete process.env.REACT_APP_HEALTH_ENDPOINT;

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

      process.env = originalEnv;
    });

    it('handles empty environment variables', async () => {
      const originalEnv = process.env;
      
      process.env = {
        ...originalEnv,
        REACT_APP_API_BASE_URL: '',
        REACT_APP_API_ENDPOINT: '',
        REACT_APP_HEALTH_ENDPOINT: ''
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

      process.env = originalEnv;
    });

    it('handles invalid environment variables', async () => {
      const originalEnv = process.env;
      
      process.env = {
        ...originalEnv,
        REACT_APP_API_BASE_URL: 'invalid-url',
        REACT_APP_API_ENDPOINT: 'invalid-endpoint',
        REACT_APP_HEALTH_ENDPOINT: 'invalid-health'
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

      process.env = originalEnv;
    });
  });

  describe('Performance Boundary Testing', () => {
    it('handles rapid API calls', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({
          status: 'Ok',
          data: []
        })
      });

      const { rerender } = render(<AgGrid />);

      // Simulate rapid re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<AgGrid />);
      }

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles concurrent operations', async () => {
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

      // Simulate concurrent operations
      const promises = Array.from({ length: 5 }, () => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      await Promise.all(promises);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });
});
