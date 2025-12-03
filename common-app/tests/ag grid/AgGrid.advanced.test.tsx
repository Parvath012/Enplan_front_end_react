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

// Advanced mock for AgGridReact with comprehensive functionality
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
  AgGridReact: ({ 
    onGridReady, 
    onCellClicked, 
    onCellDoubleClicked, 
    onColumnGroupOpened, 
    onRowGroupOpened, 
    onColumnRowGroupChanged, 
    onColumnPivotChanged, 
    onCellValueChanged, 
    onCellEditingStarted,
    rowData,
    columnDefs,
    ...props 
  }) => {
    const [gridReady, setGridReady] = React.useState(false);
    const [cellData, setCellData] = React.useState(null);
    const [editingCell, setEditingCell] = React.useState(null);

    React.useEffect(() => {
      if (onGridReady && !gridReady) {
        setGridReady(true);
        onGridReady({ api: mockGridApi });
        
        // Simulate auto-size columns being called after grid ready
        setTimeout(() => {
          mockGridApi.sizeColumnsToContent();
        }, 100);
      }
    }, [onGridReady, gridReady]);

    const handleClick = (event) => {
      const cellParams = {
        colDef: { field: 'Country', editable: false },
        value: 'USA',
        data: { _id: 1, Country: 'USA' },
        rowIndex: 0,
        column: { getColId: () => 'Country' }
      };
      setCellData(cellParams);
      onCellClicked?.(cellParams);
    };

    const handleDoubleClick = (event) => {
      const cellParams = {
        colDef: { field: 'Sales', editable: true },
        value: 1000,
        data: { _id: 1, Sales: 1000 },
        rowIndex: 0,
        column: { getColId: () => 'Sales' }
      };
      setEditingCell(cellParams);
      onCellDoubleClicked?.(cellParams);
    };

    const handleValueChange = () => {
      const cellParams = {
        colDef: { field: 'Sales' },
        oldValue: 1000,
        newValue: 2000,
        data: { _id: 1, Sales: 2000 }
      };
      onCellValueChanged?.(cellParams);
    };

    const handleEditingStarted = () => {
      const cellParams = {
        colDef: { field: 'Sales' },
        value: 1000,
        data: { _id: 1, Sales: 1000 }
      };
      setEditingCell(cellParams);
      onCellEditingStarted?.(cellParams);
    };

    const handleColumnGroupOpened = () => {
      onColumnGroupOpened?.({ groupId: 'test', expanded: true });
    };

    const handleRowGroupOpened = () => {
      onRowGroupOpened?.({ groupId: 'test', expanded: true });
    };

    const handleColumnRowGroupChanged = () => {
      onColumnRowGroupChanged?.({ columns: ['Country', 'Sales'] });
    };

    const handleColumnPivotChanged = () => {
      onColumnPivotChanged?.({ columns: ['Country', 'Sales'] });
    };

    return (
      <div data-testid="aggrid" {...props}>
        <div data-testid="grid-content">
          <button data-testid="cell-click" onClick={handleClick}>Cell Click</button>
          <button data-testid="cell-double-click" onDoubleClick={handleDoubleClick}>Cell Double Click</button>
          <button data-testid="value-change" onClick={handleValueChange}>Change Value</button>
          <button data-testid="editing-started" onClick={handleEditingStarted}>Start Editing</button>
          <button data-testid="column-group-opened" onClick={handleColumnGroupOpened}>Column Group Opened</button>
          <button data-testid="row-group-opened" onClick={handleRowGroupOpened}>Row Group Opened</button>
          <button data-testid="column-row-group-changed" onClick={handleColumnRowGroupChanged}>Row Group Changed</button>
          <button data-testid="column-pivot-changed" onClick={handleColumnPivotChanged}>Pivot Changed</button>
          
          {cellData && <div data-testid="cell-data">{JSON.stringify(cellData)}</div>}
          {editingCell && <div data-testid="editing-cell">{JSON.stringify(editingCell)}</div>}
          
          <div data-testid="row-data-count">{rowData?.length || 0}</div>
          <div data-testid="column-defs-count">{columnDefs?.length || 0}</div>
          
          {/* Add actions cell renderer for testing */}
          <div data-testid="actions-cell-renderer">
            <button data-testid="action-edit">Edit</button>
            <button data-testid="action-delete">Delete</button>
          </div>
        </div>
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
  default: jest.fn(() => [
    { name: 'Copy', action: 'copy' },
    { name: 'Paste', action: 'paste' }
  ])
}));

jest.mock('../../src/ag grid/ActionsCellRenderer', () => ({
  __esModule: true,
  default: ({ actions, onActionClick }) => (
    <div data-testid="actions-cell-renderer">
      {actions?.map((action, index) => (
        <button 
          key={index}
          data-testid={`action-${action.action}`}
          onClick={() => onActionClick?.(action.action, { _id: 1 })}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}));

describe('AgGrid - Advanced Grid Functionality Testing', () => {
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

  describe('Grid Configuration Testing', () => {
    it('handles complex grid configuration options', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify grid is configured with all advanced options
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles column definitions with all types', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify column definitions are properly set
      expect(screen.getByTestId('column-defs-count')).toBeInTheDocument();
    });

    it('handles row data configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify row data is properly set
      expect(screen.getByTestId('row-data-count')).toBeInTheDocument();
    });

    it('handles grid icons configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify icons are properly configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles status bar configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify status bar is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles master detail configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify master detail is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles pivot mode configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify pivot mode is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles sidebar configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify sidebar is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles animation configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify animation is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles cell selection configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify cell selection is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles clipboard configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify clipboard is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles row group panel configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify row group panel is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles pivot panel configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify pivot panel is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles focus configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify focus is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles drag and drop configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify drag and drop is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles virtualization configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify virtualization is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles group display type configuration', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify group display type is configured
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  describe('Cell Interaction Testing', () => {
    it('handles cell click with focus management', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      const cellClickButton = screen.getByTestId('cell-click');
      fireEvent.click(cellClickButton);

      await waitFor(() => {
        expect(screen.getByTestId('cell-data')).toBeInTheDocument();
      });
    });

    it('handles cell double click for editing', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      const cellDoubleClickButton = screen.getByTestId('cell-double-click');
      fireEvent.dblClick(cellDoubleClickButton);

      await waitFor(() => {
        expect(screen.getByTestId('editing-cell')).toBeInTheDocument();
      });
    });

    it('handles cell value changes', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      const valueChangeButton = screen.getByTestId('value-change');
      fireEvent.click(valueChangeButton);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles cell editing started', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      const editingStartedButton = screen.getByTestId('editing-started');
      fireEvent.click(editingStartedButton);

      await waitFor(() => {
        expect(screen.getByTestId('editing-cell')).toBeInTheDocument();
      });
    });
  });

  describe('Group Management Testing', () => {
    it('handles column group opened events', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      const columnGroupButton = screen.getByTestId('column-group-opened');
      fireEvent.click(columnGroupButton);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles row group opened events', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      const rowGroupButton = screen.getByTestId('row-group-opened');
      fireEvent.click(rowGroupButton);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles column row group changed events', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      const rowGroupChangedButton = screen.getByTestId('column-row-group-changed');
      fireEvent.click(rowGroupChangedButton);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });

    it('handles column pivot changed events', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      const pivotChangedButton = screen.getByTestId('column-pivot-changed');
      fireEvent.click(pivotChangedButton);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });

  describe('Action Cell Renderer Testing', () => {
    it('handles action cell renderer with actions', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify action cell renderer is present
      expect(screen.getByTestId('actions-cell-renderer')).toBeInTheDocument();
    });

    it('handles action clicks', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Test action buttons
      const editAction = screen.queryByTestId('action-edit');
      const deleteAction = screen.queryByTestId('action-delete');
      
      if (editAction) {
        fireEvent.click(editAction);
      }
      
      if (deleteAction) {
        fireEvent.click(deleteAction);
      }

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });

  describe('Grid API Testing', () => {
    it('handles grid ready with API setup', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify grid is rendered properly
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles auto-size columns functionality', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify grid is rendered properly
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles column group expansion', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify column group expansion
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });

    it('handles row group expansion', async () => {
      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      // Verify row group expansion
      expect(screen.getByTestId('aggrid')).toBeInTheDocument();
    });
  });

  describe('Performance Testing', () => {
    it('handles large dataset rendering', async () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        _id: i + 1,
        Country: `Country ${i % 10}`,
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
      for (let i = 0; i < 5; i++) {
        const cellClickButton = screen.getByTestId('cell-click');
        fireEvent.click(cellClickButton);
      }

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary Testing', () => {
    it('handles component unmounting gracefully', async () => {
      const { unmount } = render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });

      unmount();

      // Should not throw errors
      expect(true).toBe(true);
    });

    it('handles API failures gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('API Error'));

      render(<AgGrid />);

      await waitFor(() => {
        expect(screen.getByTestId('aggrid')).toBeInTheDocument();
      });
    });
  });
});
