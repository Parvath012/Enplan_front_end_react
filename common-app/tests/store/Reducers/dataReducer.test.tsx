// ...existing code...
import dataReducer, { IData, TableValue } from '../../../src/store/Reducers/dataReducer';
import { SET_TABLEDATA } from '../../../src/store/Actions/dataActions';
import { UPDATE_CELL_FORMATTING } from '../../../src/store/Actions/gridActions';

describe('dataReducer', () => {
  test('returns the same state for unknown action type', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const state = { ...initialState };
    const newState = dataReducer(state, action);
    expect(newState).toBe(state);
  });
  // ...existing code...

  describe('UPDATE_CELL_FORMATTING Action', () => {
    test('adds new formatting for a key', () => {
      const action = {
        type: UPDATE_CELL_FORMATTING,
        payload: {
          key: 'row1:field1',
          formatting: { decimalPlaces: 2, rawValue: 123 }
        }
      };
      const state: IData = { ...initialState, formattingConfig: {} };
      const newState = dataReducer(state, action);
      expect(newState.formattingConfig!).toHaveProperty('row1:field1');
      expect(newState.formattingConfig!['row1:field1']).toEqual({ decimalPlaces: 2, rawValue: 123 });
    });

    test('updates existing formatting for a key', () => {
      const action = {
        type: UPDATE_CELL_FORMATTING,
        payload: {
          key: 'row1:field1',
          formatting: { decimalPlaces: 3 }
        }
      };
      const state: IData = { ...initialState, formattingConfig: { 'row1:field1': { decimalPlaces: 2, rawValue: 123 } } };
      const newState = dataReducer(state, action);
      expect(newState.formattingConfig!['row1:field1']).toEqual({ decimalPlaces: 3, rawValue: 123 });
    });

    test('handles undefined formattingConfig', () => {
      const action = {
        type: UPDATE_CELL_FORMATTING,
        payload: {
          key: 'row2:field2',
          formatting: { decimalPlaces: 1, rawValue: 456 }
        }
      };
      const state: IData = { ...initialState, formattingConfig: undefined };
      const newState = dataReducer(state, action);
      expect(newState.formattingConfig!).toHaveProperty('row2:field2');
      expect(newState.formattingConfig!['row2:field2']).toEqual({ decimalPlaces: 1, rawValue: 456 });
    });
  });
  // Use the actual initial state from the reducer
  const initialState: IData = {
    tableData: {
      "tableSchema": [
        {
          "columnName": "_id",
          "aliasName": "Id",
          "dataType": "Int32",
          "isPrimaryKey": false,
          "isNullable": true,
          "isSequenceColumn": false
        },
        {
          "columnName": "BillDate",
          "aliasName": "Bill Date",
          "dataType": "DateTime",
          "isPrimaryKey": false,
          "isNullable": true,
          "isSequenceColumn": false
        },
        {
          "columnName": "MappedDate",
          "aliasName": "Mapped Date",
          "dataType": "DateTime",
          "isPrimaryKey": false,
          "isNullable": true,
          "isSequenceColumn": false
        },
        {
          "columnName": "Comments",
          "aliasName": "Comments",
          "dataType": "String",
          "isPrimaryKey": false,
          "isNullable": true,
          "isSequenceColumn": false,
        },
        {
          "columnName": "Status",
          "aliasName": "Status",
          "dataType": "String",
          "isPrimaryKey": false,
          "isNullable": true,
          "isSequenceColumn": false,
        }
      ],
      "csvData": [
        "Id|Bill Date|Mapped Date|Comments|Status",
        "2348|10/11/2019 12:00:00 AM|10/26/2018 12:00:00 AM|'99'|'coment'",
        "1005|5/11/2019 12:00:00 AM|5/12/2018 12:00:00 AM|'87'",
        "1692|7/31/2019 12:00:00 AM|8/1/2018 12:00:00 AM|'123'",
        // ... rest of the CSV data (truncated for brevity)
      ],
      "hasHeaders": true,
      "recordsCount": 366
    },
    tableConfiguration: [
      {
        columnName: "Comments",
        aliasName: "Comments",
        isEditable: true,
        type: ""
      },
      {
        columnName: "Status",
        aliasName: "Status",
        isEditable: true,
        type: "select",
      },
    ]
  };

  describe('SET_TABLEDATA Action', () => {
    test('updates tableData when SET_TABLEDATA action is dispatched', () => {
      // New table data to set
      const newTableData: TableValue = {
        tableSchema: [
          {
            columnName: "newColumn",
            aliasName: "New Column",
            dataType: "String",
            isPrimaryKey: true,
            isNullable: false,
            isSequenceColumn: true
          }
        ],
        csvData: ["New Column", "newValue"],
        hasHeaders: true,
        recordsCount: 2
      };

      const action = {
        type: SET_TABLEDATA,
        payload: newTableData
      };

      const newState = dataReducer(initialState, action);

      // Verify state was updated
      expect(newState.tableData).toEqual(newTableData);
      
      // Verify other parts of state remain unchanged
      expect(newState.tableConfiguration).toEqual(initialState.tableConfiguration);
    });

    test('handles null payload', () => {
      const action = {
        type: SET_TABLEDATA,
        payload: null
      };

      const newState = dataReducer(initialState, action);

      // Verify tableData is set to null
      expect(newState.tableData).toBeNull();
      
      // Verify other parts of state remain unchanged
      expect(newState.tableConfiguration).toEqual(initialState.tableConfiguration);
    });

    test('maintains immutability', () => {
      const newTableData: TableValue = {
        tableSchema: [
          {
            columnName: "newColumn",
            aliasName: "New Column",
            dataType: "String",
            isPrimaryKey: true,
            isNullable: false,
            isSequenceColumn: true
          }
        ],
        csvData: ["New Column", "newValue"],
        hasHeaders: true,
        recordsCount: 2
      };

      const action = {
        type: SET_TABLEDATA,
        payload: newTableData
      };

      const originalState = { ...initialState };
      const newState = dataReducer(initialState, action);

      // Verify original state was not mutated
      expect(initialState).toEqual(originalState);
      
      // Verify new state is different
      expect(newState).not.toBe(initialState);
    });
  });

  describe('Table Data Validation', () => {
    test('handles complex table data structure', () => {
      const complexTableData: TableValue = {
        tableSchema: [
          {
            columnName: "id",
            aliasName: "ID",
            dataType: "Int32",
            isPrimaryKey: true,
            isNullable: false,
            isSequenceColumn: true
          },
          {
            columnName: "name",
            aliasName: "Name",
            dataType: "String",
            isPrimaryKey: false,
            isNullable: true,
            isSequenceColumn: false
          }
        ],
        csvData: [
          "id|name",
          "1|John Doe",
          "2|Jane Smith"
        ],
        hasHeaders: true,
        recordsCount: 2
      };

      const action = {
        type: SET_TABLEDATA,
        payload: complexTableData
      };

      const newState = dataReducer(initialState, action);

      // Verify entire table data structure
      expect(newState.tableData).toEqual(complexTableData);
    });
  });

  describe('Performance and Edge Cases', () => {
    test('handles large dataset efficiently', () => {
      // Generate a large dataset
      const largeTableData: TableValue = {
        tableSchema: [
          {
            columnName: "id",
            aliasName: "ID",
            dataType: "Int32",
            isPrimaryKey: true,
            isNullable: false,
            isSequenceColumn: true
          }
        ],
        csvData: ["id", ...Array.from({length: 10000}, (_, i) => `${i}`)],
        hasHeaders: true,
        recordsCount: 10000
      };

      const action = {
        type: SET_TABLEDATA,
        payload: largeTableData
      };

      const startTime = performance.now();
      const newState = dataReducer(initialState, action);
      const endTime = performance.now();

      // Verify state update
      expect(newState.tableData).toEqual(largeTableData);
      
      // Verify performance (under 50ms)
      expect(endTime - startTime).toBeLessThan(50);
    });

    test('handles empty dataset', () => {
      const emptyTableData: TableValue = {
        tableSchema: [],
        csvData: [],
        hasHeaders: false,
        recordsCount: 0
      };

      const action = {
        type: SET_TABLEDATA,
        payload: emptyTableData
      };

      const newState = dataReducer(initialState, action);

      // Verify empty state
      expect(newState.tableData).toEqual(emptyTableData);
    });
  });

  describe('Table Configuration Preservation', () => {
    test('preserves table configuration when updating table data', () => {
      const newTableData: TableValue = {
        tableSchema: [
          {
            columnName: "newColumn",
            aliasName: "New Column",
            dataType: "String",
            isPrimaryKey: true,
            isNullable: false,
            isSequenceColumn: true
          }
        ],
        csvData: ["New Column", "newValue"],
        hasHeaders: true,
        recordsCount: 2
      };

      const action = {
        type: SET_TABLEDATA,
        payload: newTableData
      };

      const newState = dataReducer(initialState, action);

      // Verify table configuration remains unchanged
      expect(newState.tableConfiguration).toEqual(initialState.tableConfiguration);
    });
  });

  describe('Boundary Condition Tests', () => {
    test('handles maximum possible record count', () => {
      const maxRecordData: TableValue = {
        tableSchema: initialState.tableData!.tableSchema,
        csvData: initialState.tableData!.csvData,
        hasHeaders: initialState.tableData!.hasHeaders,
        recordsCount: Number.MAX_SAFE_INTEGER
      };

      const action = {
        type: SET_TABLEDATA,
        payload: maxRecordData
      };

      const newState = dataReducer(initialState, action);

      // Verify maximum record count
      expect(newState.tableData!.recordsCount).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('handles minimum possible record count', () => {
      const minRecordData: TableValue = {
        tableSchema: initialState.tableData!.tableSchema,
        csvData: initialState.tableData!.csvData,
        hasHeaders: initialState.tableData!.hasHeaders,
        recordsCount: 0
      };

      const action = {
        type: SET_TABLEDATA,
        payload: minRecordData
      };

      const newState = dataReducer(initialState, action);

      // Verify minimum record count
      expect(newState.tableData!.recordsCount).toBe(0);
    });
  });
});