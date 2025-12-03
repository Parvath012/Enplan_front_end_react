import selectedCellsReducer, {
  GridSelectionState,
  SelectedCell
} from '../../../src/store/Reducers/gridReducer';
import {
  ADD_SELECTED_CELL,
  REMOVE_SELECTED_CELL,
  CLEAR_SELECTED_CELLS,
  STORE_NUMERIC_CELL_VALUES,
  GET_SELECTED_CELLS,
  ADD_SELECTED_ROW,
  REMOVE_SELECTED_ROW,
  CLEAR_SELECTED_ROWS,
  SET_COLUMN_WIDTH,
  BULK_EDIT_START,
  BULK_EDIT_CANCEL,
  BULK_UPDATE_CELLS
} from '../../../src/store/Actions/gridActions';

describe('selectedCellsReducer', () => {
  // Initial state
  const initialState: GridSelectionState = {
    sortModel: [],
    selectedCells: [],
    numericCellValues: [],
    selectedRows: [],
    columnWidths: {},
    isBulkEditMode: false
  };

  describe('Initial State', () => {
    test('returns initial state for unknown action', () => {
      const state = selectedCellsReducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(state).toEqual(initialState);
    });
  });

  describe('ADD_SELECTED_CELL Action', () => {
    test('adds a new selected cell', () => {
      const cell: SelectedCell = {
        rowId: '1',
        field: 'name',
        value: 'John'
      };
      const action = {
        type: ADD_SELECTED_CELL,
        payload: cell
      };
      const newState = selectedCellsReducer(initialState, action);
      expect(newState.selectedCells).toEqual([cell]);
      expect(newState.numericCellValues).toEqual([]);
    });

    test('adds a cell with numeric value', () => {
      const cell: SelectedCell = {
        rowId: '1',
        field: 'age',
        value: 30
      };
      const action = {
        type: ADD_SELECTED_CELL,
        payload: cell
      };
      const newState = selectedCellsReducer(initialState, action);
      expect(newState.selectedCells).toEqual([cell]);
      expect(newState.numericCellValues).toEqual([30]);
    });

    test('prevents duplicate cell selection', () => {
      const cell: SelectedCell = {
        rowId: '1',
        field: 'name',
        value: 'John'
      };
      const action = {
        type: ADD_SELECTED_CELL,
        payload: cell
      };
      const initialStateWithCell = {
        ...initialState,
        selectedCells: [cell]
      };
      const newState = selectedCellsReducer(initialStateWithCell, action);
      expect(newState.selectedCells).toEqual([cell]);
    });

    test('handles non-numeric and zero values', () => {
      const cells: SelectedCell[] = [
        { rowId: '1', field: 'name', value: 'John' },
        { rowId: '2', field: 'age', value: 0 },
        { rowId: '3', field: 'score', value: 'NaN' }
      ];
      let state = initialState;

      cells.forEach(cell => {
        state = selectedCellsReducer(state, {
          type: ADD_SELECTED_CELL,
          payload: cell
  });
  // End Complex Scenarios
});

      expect(state.selectedCells).toEqual(cells);
      expect(state.numericCellValues).toEqual([]);
    });
  });

  describe('REMOVE_SELECTED_CELL Action', () => {
    test('removes a selected cell', () => {
      const cells: SelectedCell[] = [
        { rowId: '1', field: 'name', value: 'John' },
        { rowId: '2', field: 'age', value: 30 }
      ];
      const initialStateWithCells = {
        ...initialState,
        selectedCells: cells,
        numericCellValues: [30]
      };
      const action = {
        type: REMOVE_SELECTED_CELL,
        payload: { rowId: '2', field: 'age' }
      };
      const newState = selectedCellsReducer(initialStateWithCells, action);
      expect(newState.selectedCells).toEqual([
        { rowId: '1', field: 'name', value: 'John' }
      ]);
      expect(newState.numericCellValues).toEqual([]);
    });
  });

  describe('CLEAR_SELECTED_CELLS Action', () => {
    test('clears all selected cells', () => {
      const initialStateWithCells = {
        ...initialState,
        selectedCells: [
          { rowId: '1', field: 'name', value: 'John' },
          { rowId: '2', field: 'age', value: 30 }
        ],
        numericCellValues: [30]
      };
      const action = { type: CLEAR_SELECTED_CELLS };
      const newState = selectedCellsReducer(initialStateWithCells, action);
      expect(newState.selectedCells).toEqual([]);
      expect(newState.numericCellValues).toEqual([]);
    });
  });

  describe('STORE_NUMERIC_CELL_VALUES Action', () => {
    test('stores numeric cell values', () => {
      const numericValues = [10, 20, 30];
      const action = {
        type: STORE_NUMERIC_CELL_VALUES,
        payload: numericValues
      };
      const newState = selectedCellsReducer(initialState, action);
      expect(newState.numericCellValues).toEqual(numericValues);
    });
  });

  describe('GET_SELECTED_CELLS Action', () => {
    test('returns current state', () => {
      const initialStateWithCells = {
        ...initialState,
        selectedCells: [
          { rowId: '1', field: 'name', value: 'John' }
        ]
      };
      const action = { type: GET_SELECTED_CELLS };
      const newState = selectedCellsReducer(initialStateWithCells, action);
      expect(newState).toEqual(initialStateWithCells);
    });
  });

  describe('Row Selection Actions', () => {

    test('adds a new row when not already selected', () => {
      const row = { id: '1', name: 'John' };
      const action = {
        type: ADD_SELECTED_ROW,
        payload: row
      };
      const newState = selectedCellsReducer(initialState, action);
      expect(newState.selectedRows).toEqual([row]);
    });

    test('allows adding multiple unique rows', () => {
      const rows = [
        { id: '1', name: 'John' },
        { id: '2', name: 'Jane' }
      ];
      let state = initialState;
      rows.forEach(row => {
        state = selectedCellsReducer(state, {
          type: ADD_SELECTED_ROW,
          payload: row
        });
      });
      expect(state.selectedRows).toEqual(rows);
      expect(state.selectedRows.length).toBe(2);
    });

    test('does not add duplicate row to selectedRows', () => {
      const initialStateWithRow = {
        ...initialState,
        selectedRows: ['1']
      };
      const action = {
        type: ADD_SELECTED_ROW,
        payload: { id: '1', name: 'John' }
      };
      const newState = selectedCellsReducer(initialStateWithRow, action);
      expect(newState).toEqual(initialStateWithRow);
    });

    test('handles various id types', () => {
      const testScenarios = [
        { id: '1', name: 'Numeric String' },
        { id: 2, name: 'Number' },
        { id: 'unique-id', name: 'String ID' }
      ];
      let state = initialState;
      testScenarios.forEach(row => {
        state = selectedCellsReducer(state, {
          type: ADD_SELECTED_ROW,
          payload: row
        });
      });
      expect(state.selectedRows).toEqual(testScenarios);
      expect(state.selectedRows.length).toBe(3);
    });

    test('REMOVE_SELECTED_ROW removes a specific row', () => {
      const rows = [
        { id: '1', name: 'John' },
        { id: '2', name: 'Jane' }
      ];
      const initialStateWithRows = {
        ...initialState,
        selectedRows: rows
      };
      const action = {
        type: REMOVE_SELECTED_ROW,
        payload: '2'
      };
      const newState = selectedCellsReducer(initialStateWithRows, action);
      expect(newState.selectedRows).toEqual([{ id: '1', name: 'John' }]);
    });

    test('CLEAR_SELECTED_ROWS removes all selected rows', () => {
      const rows = ['1', '2'];
      const initialStateWithRows = {
        ...initialState,
        selectedRows: rows
      };
      const action = { type: CLEAR_SELECTED_ROWS };
      const newState = selectedCellsReducer(initialStateWithRows, action);
      expect(newState.selectedRows).toEqual([]);
    });

    test('maintains immutability when adding rows', () => {
      const originalState = { ...initialState };
      const row = { id: '1', name: 'John' };
      const action = {
        type: ADD_SELECTED_ROW,
        payload: row
      };

      const newState = selectedCellsReducer(initialState, action);

      // Verify original state is unchanged
      expect(initialState).toEqual(originalState);

      // Verify new state is different
      expect(newState).not.toBe(initialState);
    });
  });

  describe('SET_COLUMN_WIDTH Action', () => {
    test('sets column width for a specific field', () => {
      const action = {
        type: SET_COLUMN_WIDTH,
        payload: { field: 'name', width: 200 }
      };
      const newState = selectedCellsReducer(initialState, action);
      expect(newState.columnWidths).toEqual({ name: 200 });
    });

    test('updates existing column width', () => {
      const initialStateWithColumnWidth = {
        ...initialState,
        columnWidths: { id: 100 }
      };
      const action = {
        type: SET_COLUMN_WIDTH,
        payload: { field: 'name', width: 200 }
      };
      const newState = selectedCellsReducer(initialStateWithColumnWidth, action);
      expect(newState.columnWidths).toEqual({
        id: 100,
        name: 200
      });
    });
  });

  describe('Immutability', () => {
    test('does not mutate original state', () => {
      const originalState = { ...initialState };
      const cell: SelectedCell = {
        rowId: '1',
        field: 'name',
        value: 'John'
      };
      const action = {
        type: ADD_SELECTED_CELL,
        payload: cell
      };
      selectedCellsReducer(initialState, action);
      expect(initialState).toEqual(originalState);
    });

    test('creates new state object for each action', () => {
      const cell: SelectedCell = {
        rowId: '1',
        field: 'name',
        value: 30
      };
      const action = {
        type: ADD_SELECTED_CELL,
        payload: cell
      };
      const newState = selectedCellsReducer(initialState, action);
      expect(newState).not.toBe(initialState);
    });
  });

  describe('Complex Scenarios', () => {
    test('handles multiple cell selections with mixed value types', () => {
      const cells: SelectedCell[] = [
        { rowId: '1', field: 'name', value: 'John' },
        { rowId: '2', field: 'age', value: 30 },
        { rowId: '3', field: 'score', value: 45.5 },
        { rowId: '4', field: 'active', value: 0 }
      ];

      let state = initialState;
      cells.forEach(cell => {
        state = selectedCellsReducer(state, {
          type: ADD_SELECTED_CELL,
          payload: cell
        });
      });
      expect(state.selectedCells).toEqual(cells);
      expect(state.numericCellValues).toEqual([30, 45.5]);
    });

    // Top-level tests for missing actions
    test('RESET_FOOTER_VALUES resets numericCellValues, selectedCells, and selectedRows to empty arrays', () => {
      const initialStateWithData = {
        selectedCells: [
          { rowId: '1', field: 'name', value: 'John' },
          { rowId: '2', field: 'age', value: 30 }
        ],
        numericCellValues: [30],
        selectedRows: ['1'],
        columnWidths: { name: 200 },
        isBulkEditMode: false
      };
      const action = { type: 'RESET_FOOTER_VALUES' };
      const newState = selectedCellsReducer(initialStateWithData, action);
      expect(newState.selectedCells).toEqual([]);
      expect(newState.numericCellValues).toEqual([]);
      expect(newState.selectedRows).toEqual([]);
      // columnWidths should remain unchanged
      expect(newState.columnWidths).toEqual({ name: 200 });
    });

    test('UPDATE_SELECTED_CELLS updates selectedCells and recalculates numericCellValues', () => {
      const payload = [
        { rowId: '1', field: 'age', value: 10 },
        { rowId: '2', field: 'score', value: 0 },
        { rowId: '3', field: 'name', value: 'Alice' }
      ];
      const action = { type: 'UPDATE_SELECTED_CELLS', payload };
      const prevState = {
        selectedCells: [],
        numericCellValues: [],
        selectedRows: [],
        columnWidths: {},
        isBulkEditMode: false
      };
      const newState = selectedCellsReducer(prevState, action);
      expect(newState.selectedCells).toEqual(payload);
      // Only the value 10 is numeric and non-zero
      expect(newState.numericCellValues).toEqual([10]);
    });

    // Tests for bulk edit actions
    describe('Bulk Edit Actions', () => {
      test('BULK_EDIT_START sets isBulkEditMode to true', () => {
        const action = { type: BULK_EDIT_START };
        const newState = selectedCellsReducer(initialState, action);
        expect(newState.isBulkEditMode).toBe(true);
      });

      test('BULK_EDIT_CANCEL sets isBulkEditMode to false', () => {
        const stateWithBulkEditMode = {
          ...initialState,
          isBulkEditMode: true
        };
        const action = { type: BULK_EDIT_CANCEL };
        const newState = selectedCellsReducer(stateWithBulkEditMode, action);
        expect(newState.isBulkEditMode).toBe(false);
      });

      test('BULK_UPDATE_CELLS updates cell values and turns off bulk edit mode', () => {
        const selectedCells = [
          { rowId: '1', field: 'name', value: 'John' },
          { rowId: '2', field: 'name', value: 'Jane' }
        ];
        const stateWithSelectedCells = {
          ...initialState,
          selectedCells,
          isBulkEditMode: true
        };
        
        const action = {
          type: BULK_UPDATE_CELLS,
          payload: {
            cells: selectedCells,
            value: 'Updated Name',
            formatting: { format: 'text' }
          }
        };
        
        const newState = selectedCellsReducer(stateWithSelectedCells, action);
        
        // All cells should have the new value
        expect(newState.selectedCells.every(cell => cell.value === 'Updated Name')).toBe(true);
        
        // All cells should have the formatting applied
        expect(newState.selectedCells.every(cell => (cell as any).format === 'text')).toBe(true);
        
        // Bulk edit mode should be turned off
        expect(newState.isBulkEditMode).toBe(false);
      });
    });
  }); // End Complex Scenarios
}); // End of describe('selectedCellsReducer')