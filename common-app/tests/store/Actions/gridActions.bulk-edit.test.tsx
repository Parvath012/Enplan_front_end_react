import { 
  startBulkEdit,
  cancelBulkEdit,
  bulkUpdateCells,
  applyBulkEdit,
  BULK_EDIT_START,
  BULK_EDIT_CANCEL,
  BULK_UPDATE_CELLS,
  UPDATE_CELL_FORMATTING
} from '../../../src/store/Actions/gridActions';

// Mock for parseNumberString utility function
jest.mock('../../../src/utils/cellFormattingHandlers', () => ({
  parseNumberString: jest.fn(value => {
    // Simple mock implementation to handle test cases
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleanValue = value.replace(/[$,]/g, '');
      return parseFloat(cleanValue) || 0;
    }
    return 0;
  })
}));

describe('Bulk Edit Actions', () => {
  describe('startBulkEdit', () => {
    it('should create an action to start bulk edit mode', () => {
      const expectedAction = {
        type: BULK_EDIT_START
      };
      expect(startBulkEdit()).toEqual(expectedAction);
    });
  });

  describe('cancelBulkEdit', () => {
    it('should create an action to cancel bulk edit mode', () => {
      const expectedAction = {
        type: BULK_EDIT_CANCEL
      };
      expect(cancelBulkEdit()).toEqual(expectedAction);
    });
  });

  describe('bulkUpdateCells', () => {
    it('should create an action to bulk update cells', () => {
      const cells = [
        { rowId: '1', field: 'name', value: 'John' },
        { rowId: '2', field: 'name', value: 'Jane' }
      ];
      const newValue = 'New Name';
      
      const expectedAction = {
        type: BULK_UPDATE_CELLS,
        payload: {
          cells,
          value: newValue,
          formatting: undefined
        }
      };
      
      expect(bulkUpdateCells(cells, newValue)).toEqual(expectedAction);
    });

    it('should include formatting if provided', () => {
      const cells = [
        { rowId: '1', field: 'amount', value: '$100.00' },
        { rowId: '2', field: 'amount', value: '$200.00' }
      ];
      const newValue = 150;
      const formatting = { currency: '$' };
      
      const expectedAction = {
        type: BULK_UPDATE_CELLS,
        payload: {
          cells,
          value: newValue,
          formatting
        }
      };
      
      expect(bulkUpdateCells(cells, newValue, formatting)).toEqual(expectedAction);
    });
  });

  describe('applyBulkEdit', () => {
    const mockDispatch = jest.fn();
    
    beforeEach(() => {
      mockDispatch.mockClear();
    });
    
    it('should dispatch bulkUpdateCells with formatted value', () => {
      const cells = [
        { rowId: '1', field: 'name', value: 'John' },
        { rowId: '2', field: 'name', value: 'Jane' }
      ];
      const value = 'New Name';
      const config = {
        dataType: 'text',
        formatValue: jest.fn(val => `Formatted: ${val}`)
      };
      
      // Call the thunk with mock dispatch
      const thunk = applyBulkEdit(cells, value, config);
      thunk(mockDispatch as any, () => ({} as any), undefined);
      
      // Should call the formatValue function
      expect(config.formatValue).toHaveBeenCalledWith(value);
      
      // Should dispatch bulkUpdateCells with formatted value
      expect(mockDispatch).toHaveBeenCalledWith(
        bulkUpdateCells(cells, 'Formatted: New Name', undefined)
      );
      
      // Should also dispatch cancelBulkEdit
      expect(mockDispatch).toHaveBeenCalledWith(cancelBulkEdit());
    });
    
    it('should dispatch cell formatting updates for numeric types', () => {
      const cells = [
        { rowId: '1', field: 'amount', value: '$100.00' },
        { rowId: '2', field: 'amount', value: '$200.00' }
      ];
      const value = '$150.00';
      const config = {
        dataType: 'currency',
        formatting: { currency: '$' },
        formatValue: jest.fn(() => 150)
      };
      
      // Call the thunk with mock dispatch
      const thunk = applyBulkEdit(cells, value, config);
      thunk(mockDispatch as any, () => ({} as any), undefined);
      
      // Should dispatch bulkUpdateCells
      expect(mockDispatch).toHaveBeenCalledWith(
        bulkUpdateCells(cells, 150, { currency: '$' })
      );
      
      // Should dispatch UPDATE_CELL_FORMATTING for each cell
      expect(mockDispatch).toHaveBeenCalledWith({
        type: UPDATE_CELL_FORMATTING,
        payload: {
          key: '1:amount',
          formatting: {
            currency: '$',
            rawValue: 150
          }
        }
      });
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: UPDATE_CELL_FORMATTING,
        payload: {
          key: '2:amount',
          formatting: {
            currency: '$',
            rawValue: 150
          }
        }
      });
      
      // Should dispatch cancelBulkEdit
      expect(mockDispatch).toHaveBeenCalledWith(cancelBulkEdit());
    });
    
    it('should handle when formatValue is not provided', () => {
      const cells = [
        { rowId: '1', field: 'name', value: 'John' },
        { rowId: '2', field: 'name', value: 'Jane' }
      ];
      const value = 'New Name';
      const config = {
        dataType: 'text'
      };
      
      // Call the thunk with mock dispatch
      const thunk = applyBulkEdit(cells, value, config);
      thunk(mockDispatch as any, () => ({} as any), undefined);
      
      // Should dispatch bulkUpdateCells with original value
      expect(mockDispatch).toHaveBeenCalledWith(
        bulkUpdateCells(cells, value, undefined)
      );
      
      // Should also dispatch cancelBulkEdit
      expect(mockDispatch).toHaveBeenCalledWith(cancelBulkEdit());
    });
  });
});
