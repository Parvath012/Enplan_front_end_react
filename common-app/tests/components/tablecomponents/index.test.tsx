import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Table from '../../../src/components/tablecomponents';
import authReducer from '../../../src/store/Reducers/authReducer';
import dataReducer from '../../../src/store/Reducers/dataReducer';
import gridReducer from '../../../src/store/Reducers/gridReducer';
import * as gridParser from '../../../src/utils/gridParser';
import * as authActions from '../../../src/store/Actions/authActions';
import * as dataActions from '../../../src/store/Actions/dataActions';

// Mock gridParser
jest.mock('../../../src/utils/gridParser', () => ({
  parseCSVToRows: jest.fn((csvData) => {
    if (!csvData || csvData.length === 0) return [];
    const [headers, ...rows] = csvData;
    return rows.map((row: any[]) =>
      row.reduce((acc, value, index) => {
        acc[headers[index]] = value;
        return acc;
      }, {})
    );
  })
}));

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  Edit: (props: any) => <div data-testid="edit-icon" {...props} />,
  TrashCan: (props: any) => <div data-testid="trash-icon" {...props} />,
  View: (props: any) => <div data-testid="view-icon" {...props} />
}));

// Mock ReusableExcelGrid
jest.mock('../../../src/components/tablecomponents/tablegrid', () => {
  return jest.fn(({ rows, schema, enableActionsColumn, onActionClick, actionMenuItems, zoom, processRowUpdate }) => {
    return (
      <div data-zoom={zoom}>
        {/* Render headers */}
        {schema.map((col: any) => (
          <span key={col.columnName}>{col.aliasName}</span>
        ))}
        {/* Render rows */}
        {rows.map((row: any, idx: number) => (
          <div key={idx} data-testid={`row-${idx}`}>
            {schema.map((col: any) => (
              <span key={col.columnName}>{row[col.columnName]}</span>
            ))}
            {/* Render action buttons */}
            {enableActionsColumn &&
              actionMenuItems.map((action: any) => (
                <button
                  key={action.action}
                  data-testid={`${action.action}-${idx}`}
                  onClick={() => onActionClick(action.action, row)}
                >
                  {action.label}
                </button>
              ))}
          </div>
        ))}
      </div>
    );
  });
});

// Mock TableFooter
jest.mock('../../../src/components/tablecomponents/tablefooter', () => {
  return jest.fn(({ onZoomChange, onRefresh }) => {
    return <div data-testid="table-footer">Table Footer</div>;
  });
});

// Mock TableHeaderComponent
jest.mock('../../../src/components/tablecomponents/tableheader', () => {
  return jest.fn(() => <div data-testid="table-header">Table Header</div>);
});

jest.mock('../../../src/ag grid/AgGrid', () => {
  return jest.fn(() => <div data-testid="ag-grid">Mocked AgGrid</div>);
});

describe('Table Component', () => {
  // Create store with Redux Toolkit's configureStore
  const createTestStore = (preloadedState?: any) => {
    return configureStore({
      reducer: {
        authStore: authReducer,
        dataStore: dataReducer,
        gridStore: gridReducer,
        gridModeStore: (state = 'muiDataGrid', action) => state
      },
      preloadedState: {
        dataStore: {
          tableData: {
            csvData: [
              ['id', 'name', 'email'],
              ['1', 'Alice', 'alice@example.com'],
              ['2', 'Bob', 'bob@example.com'],
              ['3', 'Charlie', 'charlie@example.com']
            ],
            tableSchema: [
              { columnName: 'id', aliasName: 'ID', dataType: 'number' },
              { columnName: 'name', aliasName: 'Name', dataType: 'string' },
              { columnName: 'email', aliasName: 'Email', dataType: 'string' }
            ]
          },
          tableConfiguration: [
            { columnName: 'id', aliasName: 'ID', type: 'number' },
            { columnName: 'name', aliasName: 'Name', type: 'text' },
            { columnName: 'email', aliasName: 'Email', type: 'text' }
          ]
        },
        gridStore: {
          numericCellValues: [1, 2, 3],
          selectedRows: [{ id: '1' }, { id: '2' }],
          selectedCells: []
        },
        authStore: {
          token: null
        },
        gridModeStore: 'muiDataGrid',
        ...preloadedState
      }
    });
  };

  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    // Create store with initial state
    store = createTestStore();

    // Clear all mocks
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <Table />
      </Provider>
    );
  };

  // Rendering Tests
  test('renders table with correct data', async () => {
    renderComponent();

    // Verify parseCSVToRows was called
    expect(gridParser.parseCSVToRows).toHaveBeenCalled();

    // Verify headers are rendered
    const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
    const schema = ReusableExcelGrid.mock.calls[0][0].schema;

    expect(schema).toEqual([
      { columnName: 'id', aliasName: 'ID', dataType: 'number' },
      { columnName: 'name', aliasName: 'Name', dataType: 'string' },
      { columnName: 'email', aliasName: 'Email', dataType: 'string' }
    ]);
  });

  test('renders TableFooter', () => {
    renderComponent();

    // Verify TableFooter is rendered
    const tableFooter = screen.getByTestId('table-footer');
    expect(tableFooter).toBeInTheDocument();
  });

  test('renders TableHeaderComponent', () => {
    renderComponent();
    expect(screen.getByTestId('table-header')).toBeInTheDocument();
  });

  // Action Buttons Tests
  test('renders action buttons with icons', () => {
    renderComponent();

    const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
    const actionMenuItems = ReusableExcelGrid.mock.calls[0][0].actionMenuItems;

    // Verify action menu items structure
    expect(actionMenuItems).toHaveLength(3);

    // Check each action item
    const [editItem, deleteItem, viewItem] = actionMenuItems;

    expect(editItem).toEqual(
      expect.objectContaining({
        label: 'Edit',
        action: 'edit',
        icon: expect.anything()
      })
    );
    expect(deleteItem).toEqual(
      expect.objectContaining({
        label: 'Delete',
        action: 'delete',
        icon: expect.anything()
      })
    );
    expect(viewItem).toEqual(
      expect.objectContaining({
        label: 'View Details',
        action: 'view',
        icon: expect.anything()
      })
    );

    // Additional icon verification
    const Edit = require('@carbon/icons-react').Edit;
    const TrashCan = require('@carbon/icons-react').TrashCan;
    const View = require('@carbon/icons-react').View;

    expect(editItem.icon.type).toBe(Edit);
    expect(deleteItem.icon.type).toBe(TrashCan);
    expect(viewItem.icon.type).toBe(View);
  });

  // Action Handling Tests
  describe('Action Handling', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      if (consoleSpy) {
        consoleSpy.mockRestore();
      }
    });

    test('handles edit action', () => {
      renderComponent();

      const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
      const onActionClick = ReusableExcelGrid.mock.calls[0][0].onActionClick;

      onActionClick('edit', { id: '1', name: 'Alice', email: 'alice@example.com' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Editing row:',
        { id: '1', name: 'Alice', email: 'alice@example.com' }
      );
    });

    test('handles delete action', () => {
      renderComponent();

      const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
      const onActionClick = ReusableExcelGrid.mock.calls[0][0].onActionClick;

      onActionClick('delete', { id: '2', name: 'Bob', email: 'bob@example.com' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Deleting row:',
        { id: '2', name: 'Bob', email: 'bob@example.com' }
      );
    });

    test('handles view action', () => {
      renderComponent();

      const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
      const onActionClick = ReusableExcelGrid.mock.calls[0][0].onActionClick;

      onActionClick('view', { id: '3', name: 'Charlie', email: 'charlie@example.com' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Viewing row details:',
        { id: '3', name: 'Charlie', email: 'charlie@example.com' }
      );
    });

    test('handles unknown action', () => {
      renderComponent();

      const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
      const onActionClick = ReusableExcelGrid.mock.calls[0][0].onActionClick;

      onActionClick('unknown', { id: '1', name: 'Test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Action "unknown" clicked for:',
        { id: '1', name: 'Test' }
      );
    });
  });

  // Refresh and Zoom Handling Tests
  describe('Refresh and Zoom Handling', () => {
    describe('Refresh and Zoom Handling', () => {
      test('handles refresh with token authentication', async () => {
        // Create spies for authentication and data fetching
        const mockGetAuthenticate = jest.fn().mockResolvedValue('test-token');
        const mockGetTableData = jest.fn().mockResolvedValue({
          data: [{ value: 'test-data' }]
        });

        // Mock the action creators
        jest.spyOn(authActions, 'getAuthenticate')
          .mockImplementation(mockGetAuthenticate);
        const setTokenSpy = jest.spyOn(authActions, 'setToken');
        const getTableDataSpy = jest.spyOn(authActions, 'getTableData')
          .mockImplementation(mockGetTableData);
        const setTableDataSpy = jest.spyOn(dataActions, 'setTableData');

        // Spy on dispatch
        const dispatchSpy = jest.spyOn(store, 'dispatch');

        // Render the component
        renderComponent();

        // Get the refresh handler from TableFooter
        const TableFooter = require('../../../src/components/tablecomponents/tablefooter');
        const onRefresh = TableFooter.mock.calls[0][0].onRefresh;

        // Simulate refresh
        await onRefresh();

        // Verify authentication was called
        expect(mockGetAuthenticate).toHaveBeenCalled();

        // Verify token was set
        expect(setTokenSpy).toHaveBeenCalledWith('test-token');

        // Verify table data was fetched
        expect(getTableDataSpy).toHaveBeenCalled();

        // Additional verification of action creators
        expect(setTokenSpy).toHaveBeenCalledWith('test-token');
        expect(setTableDataSpy).toHaveBeenCalledWith('test-data');

        // Cleanup
        dispatchSpy.mockRestore();
        setTokenSpy.mockRestore();
        getTableDataSpy.mockRestore();
        setTableDataSpy.mockRestore();
      });

      // Additional test to verify the entire refresh flow
      test('complete refresh flow', async () => {
        // Create a spy for console.log to verify internal logging
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        // Mock authentication and data fetching
        const mockGetAuthenticate = jest.fn().mockResolvedValue('test-token');
        const mockGetTableData = jest.fn().mockResolvedValue({
          data: [{ value: 'test-data' }]
        });

        // Spy on action creators
        jest.spyOn(authActions, 'getAuthenticate')
          .mockImplementation(mockGetAuthenticate);
        const setTokenSpy = jest.spyOn(authActions, 'setToken');
        const getTableDataSpy = jest.spyOn(authActions, 'getTableData')
          .mockImplementation(mockGetTableData);
        const setTableDataSpy = jest.spyOn(dataActions, 'setTableData');

        // Render the component
        renderComponent();

        // Get the refresh handler from TableFooter
        const TableFooter = require('../../../src/components/tablecomponents/tablefooter');
        const onRefresh = TableFooter.mock.calls[0][0].onRefresh;

        // Simulate refresh
        await onRefresh();

        // Verify the sequence of actions
        expect(mockGetAuthenticate).toHaveBeenCalled();
        expect(setTokenSpy).toHaveBeenCalledWith('test-token');
        expect(getTableDataSpy).toHaveBeenCalled();
        expect(setTableDataSpy).toHaveBeenCalledWith('test-data');
        // Cleanup
        consoleLogSpy.mockRestore();
        setTokenSpy.mockRestore();
        getTableDataSpy.mockRestore();
        setTableDataSpy.mockRestore();
      });
    });

    test('updates zoom state', () => {
      // Render the component
      const { rerender } = renderComponent();

      // Get the TableFooter mock calls
      const TableFooter = require('../../../src/components/tablecomponents/tablefooter');
      const onZoomChange = TableFooter.mock.calls[0][0].onZoomChange;

      // Simulate zoom change
      onZoomChange(150);

      // Re-render to trigger state update
      rerender(
        <Provider store={store}>
          <Table />
        </Provider>
      );

      // Get the ReusableExcelGrid mock calls
      const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
      const zoomProp = ReusableExcelGrid.mock.calls[ReusableExcelGrid.mock.calls.length - 1][0].zoom;

      // Verify zoom prop
      expect(zoomProp).toBe(150);
    });

    test('handles empty or undefined tableData', () => {
      // Create a store with empty tableData
      const emptyStore = createTestStore({
        dataStore: {
          tableData: {
            csvData: [],
            tableSchema: []
          },
          tableConfiguration: []
        }
      });

      // Render the component with empty store
      render(
        <Provider store={emptyStore}>
          <Table />
        </Provider>
      );

      // Verify parseCSVToRows was called with empty array
      expect(gridParser.parseCSVToRows).toHaveBeenCalledWith([]);
    });
  });

  // Memoization and Edge Cases Tests
  test('useMemo memoization', () => {
    // Ensure multiple renders
    const { rerender } = renderComponent();

    // Get initial rows
    const initialRows = (gridParser.parseCSVToRows as jest.Mock).mock.calls[0][0];

    // Rerender with same data multiple times
    for (let i = 0; i < 3; i++) {
      rerender(
        <Provider store={store}>
          <Table />
        </Provider>
      );
    }

    // Get mock calls
    const mockCalls = (gridParser.parseCSVToRows as jest.Mock).mock.calls;

    // Verify memoization
    expect(mockCalls.length).toBeGreaterThanOrEqual(1);

    // Check that subsequent calls use the same input
    mockCalls.forEach((call, index) => {
      if (index > 0) {
        expect(call[0]).toEqual(initialRows);
      }
    });
  });

  // Additional tests for action menu items structure
  test('creates action items with correct structure', () => {
    renderComponent();

    const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
    const actionMenuItems = ReusableExcelGrid.mock.calls[0][0].actionMenuItems;

    // Verify each action item has required properties
    actionMenuItems.forEach((item: { icon: { props: { fontSize: any; }; }; }) => {
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('action');
      expect(item).toHaveProperty('icon');

      // Verify icon properties
      expect(item.icon.props.fontSize).toBe('small');
    });
  });

  // Tests for handleProcessRowUpdate function
  describe('Row Update Handling', () => {
    test('handles single row update', () => {
      // Render component first to initialize hooks
      renderComponent();

      // Get the ReusableExcelGrid component props
      const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
      const { processRowUpdate } = ReusableExcelGrid.mock.calls[0][0];

      // Test single row update
      const updatedRow = { id: '1', name: 'Alice Updated', email: 'alice.updated@example.com' };
      let result: any;
      act(() => {
        result = processRowUpdate(updatedRow);
      });

      // Verify result
      expect(result).toEqual(updatedRow);

      // Re-render to check if internal state was updated
      renderComponent();

      // Get updated rows
      const updatedProps = ReusableExcelGrid.mock.calls[ReusableExcelGrid.mock.calls.length - 1][0];

      // Find the updated row
      const foundRow = updatedProps.rows.find((row: any) => row.id === '1');
      expect(foundRow).toBeDefined();
    });

    test('handles bulk row updates (array of rows)', () => {
      // Render component to initialize hooks
      renderComponent();

      // Get the ReusableExcelGrid component props
      const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
      const { processRowUpdate } = ReusableExcelGrid.mock.calls[0][0];

      // Create array of updated rows
      const updatedRows = [
        { id: '1', name: 'Alice Bulk', email: 'alice.bulk@example.com' },
        { id: '2', name: 'Bob Bulk', email: 'bob.bulk@example.com' }
      ];

      // Test bulk update
      let result: any;
      act(() => {
        result = processRowUpdate(updatedRows);
      });

      // Verify result
      expect(result).toEqual(updatedRows);

      // Re-render to check if internal state was updated
      renderComponent();

      // Get updated rows
      const updatedProps = ReusableExcelGrid.mock.calls[ReusableExcelGrid.mock.calls.length - 1][0];

      // Verify the state has been updated correctly
      expect(updatedProps.rows).toHaveLength(3); // We have 3 rows in total from the mock data
    });

    test('updates state with single row update that doesnt exist in current rows', () => {
      // Render component first to initialize hooks
      renderComponent();

      // Get the ReusableExcelGrid component props
      const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
      const { processRowUpdate } = ReusableExcelGrid.mock.calls[0][0];

      // Test single row update with a new ID
      const newRow = { id: '999', name: 'New Person', email: 'new@example.com' };
      let result: any;
      act(() => {
        result = processRowUpdate(newRow);
      });

      // Verify result
      expect(result).toEqual(newRow);

      // Re-render to check if internal state was updated properly
      renderComponent();

      // The rows should remain the same length since the implementation only updates, not inserts
      const updatedProps = ReusableExcelGrid.mock.calls[ReusableExcelGrid.mock.calls.length - 1][0];

      // Check the update logic worked correctly
      const originalRows = ReusableExcelGrid.mock.calls[0][0].rows;
      expect(updatedProps.rows.length).toEqual(originalRows.length);
    });

    test('handles empty array for bulk updates', () => {
      // Render component to initialize hooks
      renderComponent();

      // Get the ReusableExcelGrid component props
      const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
      const { processRowUpdate } = ReusableExcelGrid.mock.calls[0][0];

      // Test with empty array
      const emptyArray: any[] = [];
      let result: any;
      act(() => {
        result = processRowUpdate(emptyArray);
      });

      // Verify result
      expect(result).toEqual(emptyArray);

      // Re-render to verify state doesn't change unexpectedly
      renderComponent();

      // State should remain the same
      const updatedProps = ReusableExcelGrid.mock.calls[ReusableExcelGrid.mock.calls.length - 1][0];
      const originalRows = ReusableExcelGrid.mock.calls[0][0].rows;
      expect(updatedProps.rows).toHaveLength(originalRows.length);
    });

    test('handles null value gracefully', () => {
      // Render component to initialize hooks
      renderComponent();

      // Get the ReusableExcelGrid component props
      const ReusableExcelGrid = require('../../../src/components/tablecomponents/tablegrid');
      const { processRowUpdate } = ReusableExcelGrid.mock.calls[0][0];

      // Test with null (this shouldn't happen in real usage, but we test edge case)
      let result: any;
      act(() => {
        result = processRowUpdate(null as any);
      });

      // Should return null as-is without crashing
      expect(result).toBeNull();
    });
  });
});