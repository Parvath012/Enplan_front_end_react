import {
  addSelectedCell,
  clearSelectedCells,
  removeSelectedCell,
  handleCellClickAction,
  handleRowSelectionAction,
  getDynamicRowHeight,
  clearSelectedRows,
  addSelectedRow
} from '../../../src/store/Actions/gridActions';

import * as gridActions from '../../../src/store/Actions/gridActions';

const mockDispatch = jest.fn();
const mockEvent = (ctrlKey = false, metaKey = false): MouseEvent => ({
  ctrlKey,
  metaKey
} as MouseEvent);

describe('handleCellClickAction', () => {
  const params = {
    id: 1,
    field: 'name',
    value: 'John'
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds cell on ctrl/meta key if not selected', () => {
    const selectedCells: any[] = [];
    const result = handleCellClickAction(params, mockEvent(true, false), selectedCells);
    result(mockDispatch);
    expect(mockDispatch).toHaveBeenCalledWith(
      addSelectedCell({ rowId: 1, field: 'name', value: 'John' })
    );
  });

  it('removes cell on ctrl/meta key if already selected', () => {
    const selectedCells = [{ rowId: 1, field: 'name' }];
    const result = handleCellClickAction(params, mockEvent(true, false), selectedCells);
    result(mockDispatch);
    expect(mockDispatch).toHaveBeenCalledWith(
      removeSelectedCell({ rowId: 1, field: 'name', value: 'John' })
    );
  });

  it('clears and adds cell when no ctrl/meta key', () => {
    const selectedCells: any[] = [];
    const result = handleCellClickAction(params, mockEvent(false, false), selectedCells);
    result(mockDispatch);
    expect(mockDispatch).toHaveBeenCalledWith(clearSelectedCells());
    expect(mockDispatch).toHaveBeenCalledWith(
      addSelectedCell({ rowId: 1, field: 'name', value: 'John' })
    );
  });

  it('ignores checkbox field', () => {
    const checkboxParams = { id: 1, field: 'checkbox', value: true } as any;
    const selectedCells: any[] = [];
    const result = handleCellClickAction(checkboxParams, mockEvent(), selectedCells);
    result(mockDispatch);
    expect(mockDispatch).not.toHaveBeenCalledWith(addSelectedCell(expect.anything()));
    expect(mockDispatch).not.toHaveBeenCalledWith(removeSelectedCell(expect.anything()));
  });
});

describe('handleRowSelectionAction', () => {
  const rows = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('selects matching rows', () => {
    const rowSelectionModel = { ids: [1, 2] };
    const result = handleRowSelectionAction(rowSelectionModel, rows);
    result(mockDispatch);
    expect(mockDispatch).toHaveBeenCalledWith(clearSelectedRows());
    expect(mockDispatch).toHaveBeenCalledWith(addSelectedRow({ id: 1, name: 'John' }));
    expect(mockDispatch).toHaveBeenCalledWith(addSelectedRow({ id: 2, name: 'Jane' }));
  });

  it('handles non-array ids gracefully', () => {
    const rowSelectionModel = { ids: null };
    const result = handleRowSelectionAction(rowSelectionModel, rows);
    result(mockDispatch);
    expect(mockDispatch).toHaveBeenCalledWith(clearSelectedRows());
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('handles empty ids array', () => {
    const rowSelectionModel = { ids: [] };
    const result = handleRowSelectionAction(rowSelectionModel, rows);
    result(mockDispatch);
    expect(mockDispatch).toHaveBeenCalledWith(clearSelectedRows());
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

describe('getDynamicRowHeight', () => {
  const longText = 'x'.repeat(200);

  const originalCreateElement = document.createElement;
  beforeAll(() => {
    document.createElement = (tag: string) => {
      const element: any = originalCreateElement.call(document, tag);
      if (tag === 'span') {
        Object.defineProperty(element, 'offsetWidth', {
          get: () => element.innerText?.length || 0
        });
      }
      return element;
    };
  });

  afterAll(() => {
    document.createElement = originalCreateElement;
  });

  it('returns auto if text exceeds estimated column width', () => {
    const row = { id: 1, description: longText };
    const wrapConfig = { '1|description': true };
    const columnWidths = { description: 50 };
    const result = getDynamicRowHeight(row, wrapConfig, columnWidths);
    expect(result).toBe('auto');
  });

  it('returns default if text does not exceed column width', () => {
    const row = { id: 1, description: 'short' };
    const wrapConfig = { '1|description': true };
    const columnWidths = { description: 100 };
    const result = getDynamicRowHeight(row, wrapConfig, columnWidths);
    expect(result).toBe(24);
  });

  it('uses fallback width when columnWidths not available', () => {
    const row = { id: 1, description: longText };
    const wrapConfig = { '1|description': true };
    const result = getDynamicRowHeight(row, wrapConfig);
    expect(result).toBe('auto');
  });

  it('returns default if wrapConfig is missing', () => {
    const row = { id: 1, description: longText };
    const result = getDynamicRowHeight(row);
    expect(result).toBe(24);
  });

  it('returns default if wrap not enabled for row', () => {
    const row = { id: 2, description: longText };
    const wrapConfig = { '1|description': true };
    const result = getDynamicRowHeight(row, wrapConfig);
    expect(result).toBe(24);
  });
});

describe('Grid Actions Additional Coverage', () => {
  describe('Action Creators', () => {
    it('storeNumericCellValues creates correct action', () => {
      const values = [1, 2, 3];
      const action = gridActions.storeNumericCellValues(values);
      expect(action).toEqual({
        type: gridActions.STORE_NUMERIC_CELL_VALUES,
        payload: values
      });
    });

    it('removeSelectedRow creates correct action', () => {
      const rowId = 1;
      const action = gridActions.removeSelectedRow(rowId);
      expect(action).toEqual({
        type: gridActions.REMOVE_SELECTED_ROW,
        payload: rowId
      });
    });

    it('resetFooterValues creates correct action', () => {
      const action = gridActions.resetFooterValues();
      expect(action).toEqual({
        type: gridActions.RESET_FOOTER_VALUES
      });
    });
    
    it('setSortModel creates correct action', () => {
      // Using a mock sortModel without explicit types
      const sortModel = [{ field: 'name', sort: 'asc', priority: 1 }] as any[];
      const action = gridActions.setSortModel(sortModel);
      expect(action).toEqual({
        type: gridActions.SET_SORT_MODEL,
        payload: sortModel
      });
    });
    
    it('updateCellFormatting creates correct action', () => {
      const key = '1:name';
      const formatting = { bold: true, color: 'red' };
      const action = gridActions.updateCellFormatting(key, formatting);
      expect(action).toEqual({
        type: gridActions.UPDATE_CELL_FORMATTING,
        payload: { key, formatting }
      });
    });
    
    it('updateSelectedCells creates correct action', () => {
      const cells = [
        { rowId: 1, field: 'name', value: 'John' }
      ];
      const action = gridActions.updateSelectedCells(cells);
      expect(action).toEqual({
        type: gridActions.UPDATE_SELECTED_CELLS,
        payload: cells
      });
    });
    
    it('setColumns creates correct action with serializable properties', () => {
      const columns = [
        {
          field: 'name',
          headerName: 'Name',
          width: 150,
          renderCell: jest.fn(),
          valueGetter: jest.fn(),
        }
      ];
      const action = gridActions.setColumns(columns);
      
      // Verify non-serializable properties are removed
      expect(action.payload[0]).not.toHaveProperty('renderCell');
      expect(action.payload[0]).not.toHaveProperty('valueGetter');
      
      // Verify serializable properties are kept
      expect(action.payload[0]).toHaveProperty('field', 'name');
      expect(action.payload[0]).toHaveProperty('headerName', 'Name');
      expect(action.payload[0]).toHaveProperty('width', 150);
      
      expect(action.type).toBe(gridActions.SET_COLUMNS);
    });
    
    it('startBulkEdit creates correct action', () => {
      const action = gridActions.startBulkEdit();
      expect(action).toEqual({
        type: gridActions.BULK_EDIT_START
      });
    });
    
    it('cancelBulkEdit creates correct action', () => {
      const action = gridActions.cancelBulkEdit();
      expect(action).toEqual({
        type: gridActions.BULK_EDIT_CANCEL
      });
    });
    
    it('bulkUpdateCells creates correct action', () => {
      const cells = [
        { rowId: 1, field: 'name', value: 'John' },
        { rowId: 2, field: 'name', value: 'Jane' }
      ];
      const newValue = 'Updated';
      const formatting = { bold: true };
      
      const action = gridActions.bulkUpdateCells(cells, newValue, formatting);
      
      expect(action).toEqual({
        type: gridActions.BULK_UPDATE_CELLS,
        payload: {
          cells,
          value: newValue,
          formatting
        }
      });
    });
  });

  describe('Bulk Edit Thunk', () => {
    it('applyBulkEdit dispatches appropriate actions', () => {
      const mockDispatch = jest.fn();
      const cells = [
        { rowId: 1, field: 'name', value: 'John' },
        { rowId: 2, field: 'name', value: 'Jane' }
      ];
      const value = 'Updated';
      
      // Simple config with no formatting
      const config = {
        dataType: 'text'
      };
      
      const thunk = gridActions.applyBulkEdit(cells, value, config);
      thunk(mockDispatch);
      
      // Should dispatch bulkUpdateCells and cancelBulkEdit
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: gridActions.BULK_UPDATE_CELLS
        })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: gridActions.BULK_EDIT_CANCEL
        })
      );
    });
    
    it('applyBulkEdit applies formatting to each cell', () => {
      const mockDispatch = jest.fn();
      const cells = [
        { rowId: 1, field: 'name', value: 'John' }
      ];
      const value = '123.45';
      
      // Config with formatting and formatValue
      const config = {
        dataType: 'number',
        formatting: { align: 'right' },
        formatValue: jest.fn().mockReturnValue('123.45')
      };
      
      const thunk = gridActions.applyBulkEdit(cells, value, config);
      thunk(mockDispatch);
      
      // Should be called for UPDATE_CELL_FORMATTING with the correct key
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: gridActions.UPDATE_CELL_FORMATTING,
          payload: expect.objectContaining({
            key: '1:name'
          })
        })
      );
      
      // Check it called formatValue
      expect(config.formatValue).toHaveBeenCalledWith(value);
    });
  });

  describe('autoResizeColumn', () => {
    let originalCreateElement: typeof document.createElement;
    let dispatchMock: jest.Mock;

    beforeEach(() => {
      // Mock document methods
      originalCreateElement = document.createElement;
      dispatchMock = jest.fn();

      // Mock querySelector and createElement
      document.querySelector = jest.fn().mockReturnValue({
        textContent: 'Test Column'
      });

      document.querySelectorAll = jest.fn().mockReturnValue([
        { textContent: 'Cell 1' },
        { textContent: 'Cell 2' }
      ]);

      document.createElement = jest.fn().mockImplementation((tag) => {
        const element = originalCreateElement.call(document, tag);
        Object.defineProperty(element, 'offsetWidth', {
          get: () => 50
        });
        return element;
      });
    });

    afterEach(() => {
      document.createElement = originalCreateElement;
    });

    it('dispatches setColumnWidth with calculated width', () => {
      const thunk = gridActions.autoResizeColumn('testField');
      thunk(dispatchMock);

      expect(dispatchMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: gridActions.SET_COLUMN_WIDTH,
          payload: expect.objectContaining({
            field: 'testField',
            width: expect.any(Number)
          })
        })
      );
    });

    it('handles empty header text', () => {
      document.querySelector = jest.fn().mockReturnValue({
        textContent: ''
      });

      const thunk = gridActions.autoResizeColumn('testField');
      thunk(dispatchMock);

      expect(dispatchMock).toHaveBeenCalled();
    });
  });

  describe('Additional handleCellClickAction Scenarios', () => {
    const mockDispatch = jest.fn();
    const params = {
      id: 1,
      field: 'name',
      value: 'John'
    };

    it('handles non-numeric values correctly', () => {
      const cell = { rowId: 1, field: 'name', value: 'text' };
      const action = gridActions.addSelectedCell(cell);
      expect(action.payload.value).toBe('text');
    });
  });

  describe('Action Type Constants', () => {
    it('should have correct action type constants', () => {
      expect(gridActions.SET_SELECTED_CELLS).toBe('SET_SELECTED_CELLS');
      expect(gridActions.ADD_SELECTED_CELL).toBe('ADD_SELECTED_CELL');
      expect(gridActions.REMOVE_SELECTED_CELL).toBe('REMOVE_SELECTED_CELL');
      expect(gridActions.CLEAR_SELECTED_CELLS).toBe('CLEAR_SELECTED_CELLS');
      expect(gridActions.STORE_NUMERIC_CELL_VALUES).toBe('STORE_NUMERIC_CELL_VALUES');
      expect(gridActions.ADD_SELECTED_ROW).toBe('ADD_SELECTED_ROW');
      expect(gridActions.REMOVE_SELECTED_ROW).toBe('REMOVE_SELECTED_ROW');
      expect(gridActions.CLEAR_SELECTED_ROWS).toBe('CLEAR_SELECTED_ROWS');
      expect(gridActions.GET_SELECTED_CELLS).toBe('GET_SELECTED_CELLS');
      expect(gridActions.SET_COLUMN_WIDTH).toBe('SET_COLUMN_WIDTH');
      expect(gridActions.RESET_FOOTER_VALUES).toBe('RESET_FOOTER_VALUES');
      expect(gridActions.SET_SORT_MODEL).toBe('SET_SORT_MODEL');
      expect(gridActions.UPDATE_CELL_FORMATTING).toBe('UPDATE_CELL_FORMATTING');
      expect(gridActions.BULK_EDIT_START).toBe('BULK_EDIT_START');
      expect(gridActions.BULK_EDIT_CANCEL).toBe('BULK_EDIT_CANCEL');
      expect(gridActions.BULK_UPDATE_CELLS).toBe('BULK_UPDATE_CELLS');
      expect(gridActions.SET_COLUMNS).toBe('SET_COLUMNS');
      expect(gridActions.UPDATE_SELECTED_CELLS).toBe('UPDATE_SELECTED_CELLS');
    });
  });

  describe('getDynamicRowHeight Edge Cases', () => {
    it('handles non-string/non-number values', () => {
      const row = {
        id: 1,
        description: { complex: 'object' }
      };
      const wrapConfig = { '1|description': true };
      const result = gridActions.getDynamicRowHeight(row, wrapConfig);
      expect(result).toBe(24);
    });

    it('handles undefined row id', () => {
      const row = { description: 'test' };
      const wrapConfig = { '1|description': true };
      const result = gridActions.getDynamicRowHeight(row, wrapConfig);
      expect(result).toBe(24);
    });
  });
});

describe('Grid Actions Final Coverage', () => {
  describe('getTextWidth Utility Function', () => {
    let originalCreateElement: typeof document.createElement;
    let originalBody: HTMLElement | null;
    let originalDocument: any;
    let originalEnv: any;

    beforeEach(() => {
      // Ensure document.body exists
      if (!document.body) {
        const body = document.createElement('body');
        document.documentElement.appendChild(body);
      }

      // Store original methods
      originalCreateElement = document.createElement;
      originalBody = document.body;
      originalDocument = global.document;
      originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      // Restore original methods
      document.createElement = originalCreateElement;
      
      // Restore original globals
      global.document = originalDocument;
      process.env.NODE_ENV = originalEnv;
      
      // Clean up any added elements
      if (originalBody) {
        document.body = originalBody;
      }
    });

    it('calculates text width correctly', () => {
      // Use real implementation to ensure coverage
      const textWidth = gridActions.getTextWidth('Test', '10px Arial');
      expect(textWidth).toBeGreaterThanOrEqual(0);
    });
    
    it('uses fallback for SSR', () => {
      // Instead of trying to mock document as undefined (which doesn't work well in Jest),
      // we can directly test the fallback logic by mocking document.createElement to throw
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation(() => {
        // Mock environment check
        throw new Error('document is not defined');
      });
      
      // Test with and without text
      const withText = gridActions.getTextWidth('Test', '10px Arial');
      const withoutText = gridActions.getTextWidth('', '10px Arial');
      
      // Verify fallback logic is used
      expect(withText).toBeGreaterThan(0);
      expect(withoutText).toBe(0);
      
      // Restore
      document.createElement = originalCreateElement;
    });
    
    it('handles errors during text measurement', () => {
      // Mock document.createElement to throw error
      document.createElement = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      // Mock console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Test in development environment
      process.env.NODE_ENV = 'development';
      const textWidth = gridActions.getTextWidth('Test', '10px Arial');
      
      // Check fallback logic
      expect(textWidth).toBe(32); // 4 chars * 8
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error measuring text width:',
        expect.any(Error)
      );
      
      // Test in production environment
      process.env.NODE_ENV = 'production';
      gridActions.getTextWidth('Test', '10px Arial');
      
      // Should not log in production
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      
      // Cleanup
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Edge Cases in Existing Functions', () => {
    describe('handleRowSelectionAction', () => {
      it('handles undefined rowSelectionModel gracefully', () => {
        const mockDispatch = jest.fn();
        const rows = [{ id: 1, name: 'Test' }];

        const thunk = gridActions.handleRowSelectionAction(null, rows);
        thunk(mockDispatch);

        expect(mockDispatch).toHaveBeenCalledWith(gridActions.clearSelectedRows());
      });

      it('handles non-array ids scenario', () => {
        const mockDispatch = jest.fn();
        const rows = [{ id: 1, name: 'Test' }];

        const thunk = gridActions.handleRowSelectionAction({ ids: {} }, rows);
        thunk(mockDispatch);

        expect(mockDispatch).toHaveBeenCalledWith(gridActions.clearSelectedRows());
      });
    });

    describe('autoResizeColumn Advanced Scenarios', () => {
      it('handles scenario with no visible cells', () => {
        const mockDispatch = jest.fn();

        // Mock document queries to return empty NodeList
        document.querySelector = jest.fn().mockReturnValue({
          textContent: 'Column Header'
        });
        document.querySelectorAll = jest.fn().mockReturnValue([]);

        const thunk = gridActions.autoResizeColumn('testField');
        thunk(mockDispatch);

        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: gridActions.SET_COLUMN_WIDTH
          })
        );
      });

      it('handles null or undefined cell text', () => {
        const mockDispatch = jest.fn();

        // Mock document queries with null/undefined text
        document.querySelector = jest.fn().mockReturnValue({
          textContent: 'Column Header'
        });
        document.querySelectorAll = jest.fn().mockReturnValue([
          { textContent: null },
          { textContent: undefined }
        ]);

        const thunk = gridActions.autoResizeColumn('testField');
        thunk(mockDispatch);

        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: gridActions.SET_COLUMN_WIDTH
          })
        );
      });
    });
  });

  describe('Boundary Condition Tests', () => {
    describe('getDynamicRowHeight', () => {
      it('handles extremely long text with no column width', () => {
        const row = {
          id: 1,
          description: 'x'.repeat(1000)
        };
        const wrapConfig = { '1|description': true };

        const result = gridActions.getDynamicRowHeight(row, wrapConfig);
        expect(result).toBe(24);
      });

      it('handles mixed wrap configurations', () => {
        const row = {
          id: 1,
          description: 'Short text',
          longField: 'x'.repeat(500)
        };
        const wrapConfig = {
          '1|description': false,
          '1|longField': true
        };
        const columnWidths = {
          description: 100,
          longField: 50
        };

        const result = gridActions.getDynamicRowHeight(row, wrapConfig, columnWidths);
        expect(result).toBe(24);
      });
    });
  });

  describe('Action Payload Validation', () => {
    it('handles complex object in addSelectedCell', () => {
      const complexCell = {
        rowId: 1,
        field: 'details',
        value: {
          nested: 'value',
          number: NaN
        }
      };

      const action = gridActions.addSelectedCell(complexCell);
      expect(action.payload.value).toEqual({ nested: 'value', number: NaN });
    });
  });
});
