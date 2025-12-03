import selectedCellsReducer, {
  GridSelectionState,
} from '../../../src/store/Reducers/gridReducer';
import {
  BULK_EDIT_START,
  BULK_EDIT_CANCEL,
  BULK_UPDATE_CELLS
} from '../../../src/store/Actions/gridActions';

describe('Grid Reducer - Bulk Edit', () => {
  // Define initial state
  const initialState: GridSelectionState = {
    selectedCells: [],
    numericCellValues: [],
    selectedRows: [],
    columnWidths: {},
    isBulkEditMode: false
  };

  // Test cases for bulk edit actions
  describe('BULK_EDIT_START', () => {
    it('should set isBulkEditMode to true', () => {
      const action = { type: BULK_EDIT_START };
      const newState = selectedCellsReducer(initialState, action);
      
      expect(newState.isBulkEditMode).toBe(true);
    });
  });

  describe('BULK_EDIT_CANCEL', () => {
    it('should set isBulkEditMode to false', () => {
      const stateWithBulkEdit = {
        ...initialState,
        isBulkEditMode: true
      };
      
      const action = { type: BULK_EDIT_CANCEL };
      const newState = selectedCellsReducer(stateWithBulkEdit, action);
      
      expect(newState.isBulkEditMode).toBe(false);
    });
  });

  describe('BULK_UPDATE_CELLS', () => {
    it('should update selected cells with new value', () => {
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
          value: 'New Name'
        }
      };
      
      const newState = selectedCellsReducer(stateWithSelectedCells, action);
      
      // isBulkEditMode should be false after bulk update
      expect(newState.isBulkEditMode).toBe(false);
      
      // All cells should be updated with new value
      expect(newState.selectedCells).toEqual([
        { rowId: '1', field: 'name', value: 'New Name' },
        { rowId: '2', field: 'name', value: 'New Name' }
      ]);
    });

    it('should only update cells that match the cells in the payload', () => {
      const selectedCells = [
        { rowId: '1', field: 'name', value: 'John' },
        { rowId: '2', field: 'name', value: 'Jane' },
        { rowId: '3', field: 'age', value: 30 }
      ];
      
      const stateWithSelectedCells = {
        ...initialState,
        selectedCells,
        isBulkEditMode: true
      };
      
      const action = {
        type: BULK_UPDATE_CELLS,
        payload: {
          cells: [
            { rowId: '1', field: 'name', value: 'John' },
            { rowId: '2', field: 'name', value: 'Jane' }
          ],
          value: 'New Name'
        }
      };
      
      const newState = selectedCellsReducer(stateWithSelectedCells, action);
      
      // Only name cells should be updated
      expect(newState.selectedCells).toEqual([
        { rowId: '1', field: 'name', value: 'New Name' },
        { rowId: '2', field: 'name', value: 'New Name' },
        { rowId: '3', field: 'age', value: 30 }
      ]);
    });

    it('should apply formatting if provided', () => {
      const selectedCells = [
        { rowId: '1', field: 'amount', value: '$100.00' },
        { rowId: '2', field: 'amount', value: '$200.00' }
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
          value: 150,
          formatting: { currency: '$' }
        }
      };
      
      const newState = selectedCellsReducer(stateWithSelectedCells, action);
      
      // Value and formatting should be applied
      expect(newState.selectedCells).toEqual([
        { rowId: '1', field: 'amount', value: 150, currency: '$' },
        { rowId: '2', field: 'amount', value: 150, currency: '$' }
      ]);
    });

    it('should update numericCellValues when updating numeric fields', () => {
      const selectedCells = [
        { rowId: '1', field: 'age', value: 25 },
        { rowId: '2', field: 'age', value: 30 }
      ];
      
      const stateWithSelectedCells = {
        ...initialState,
        selectedCells,
        numericCellValues: [25, 30],
        isBulkEditMode: true
      };
      
      const action = {
        type: BULK_UPDATE_CELLS,
        payload: {
          cells: selectedCells,
          value: 40
        }
      };
      
      const newState = selectedCellsReducer(stateWithSelectedCells, action);
      
      // numericCellValues should be updated
      expect(newState.numericCellValues).toEqual([40, 40]);
      
      // Selected cells should be updated
      expect(newState.selectedCells).toEqual([
        { rowId: '1', field: 'age', value: 40 },
        { rowId: '2', field: 'age', value: 40 }
      ]);
    });
  });
});
