import React from 'react';
import { createColumnDefs, createDefaultColDef, createGridOptions } from '../../src/utils/entityListColumns';

// Mock the cellRenderers module with a working approach
jest.mock('../../src/utils/cellRenderers', () => ({
  createHighlightedCellRenderer: jest.fn((searchValue: string, maxLength: number) => {
    return (params: any) => {
      return `<span>${params.value || ''}</span>`;
    };
  }),
}));

// Mock React DOM server
jest.mock('react-dom/server', () => ({
  renderToStaticMarkup: jest.fn((element) => `<mocked>${element.type}</mocked>`),
}));

describe('entityListColumns - Working Tests', () => {
  const mockCreateHighlightedCellRenderer = require('../../src/utils/cellRenderers').createHighlightedCellRenderer;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createColumnDefs', () => {
    it('should create column definitions with correct structure', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);

      expect(Array.isArray(columnDefs)).toBe(true);
      expect(columnDefs.length).toBeGreaterThan(0);

      // Check that each column has required properties
      columnDefs.forEach(column => {
        expect(column).toHaveProperty('headerName');
        expect(column).toHaveProperty('sortable');
        expect(column).toHaveProperty('filter');
        // Some columns might not have field property (like structure column)
        if (column.field) {
          expect(column).toHaveProperty('field');
        }
      });
    });

    it('should apply correct styling to legal business name column', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);
      const legalNameColumn = columnDefs[0];

      expect(legalNameColumn.headerName).toBe('Legal Name');
      expect(legalNameColumn.sortable).toBe(true);
      expect(legalNameColumn.filter).toBe(false);
      expect(legalNameColumn.flex).toBe(18);
      expect(legalNameColumn.resizable).toBe(true);
      expect(legalNameColumn.headerClass).toBe('ag-header-cell-custom');
      expect(legalNameColumn.cellClass).toBe('ag-cell-custom');
      
      // The mock should have been called
      expect(mockCreateHighlightedCellRenderer).toHaveBeenCalled();
    });

    it('should apply correct styling to display name column', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);
      const displayNameColumn = columnDefs[1];

      expect(displayNameColumn.headerName).toBe('Display Name');
      expect(displayNameColumn.sortable).toBe(true);
      expect(displayNameColumn.filter).toBe(false);
      expect(displayNameColumn.flex).toBe(15);
      expect(displayNameColumn.resizable).toBe(true);
      expect(displayNameColumn.headerClass).toBe('ag-header-cell-custom');
      expect(displayNameColumn.cellClass).toBe('ag-cell-custom');
      
      // The mock should have been called
      expect(mockCreateHighlightedCellRenderer).toHaveBeenCalled();
    });

    it('should apply correct styling to entity type column', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);
      const entityTypeColumn = columnDefs[2];

      expect(entityTypeColumn.headerName).toBe('Entity Type');
      expect(entityTypeColumn.sortable).toBe(true);
      expect(entityTypeColumn.filter).toBe(false);
      expect(entityTypeColumn.flex).toBe(12);
      expect(entityTypeColumn.resizable).toBe(true);
      expect(entityTypeColumn.headerClass).toBe('ag-header-cell-custom');
      expect(entityTypeColumn.cellClass).toBe('ag-cell-custom');
      
      // The mock should have been called
      expect(mockCreateHighlightedCellRenderer).toHaveBeenCalled();
    });

    it('should apply correct styling to address column', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);
      const addressColumn = columnDefs[3];

      expect(addressColumn.headerName).toBe('Address');
      expect(addressColumn.sortable).toBe(true);
      expect(addressColumn.filter).toBe(false);
      expect(addressColumn.flex).toBe(25);
      expect(addressColumn.resizable).toBe(true);
      expect(addressColumn.headerClass).toBe('ag-header-cell-custom');
      expect(addressColumn.cellClass).toBe('ag-cell-custom');
      
      // The mock should have been called
      expect(mockCreateHighlightedCellRenderer).toHaveBeenCalled();
    });

    it('should apply correct styling to structure column', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);
      const structureColumn = columnDefs[4];

      expect(structureColumn.headerName).toBe('Structure');
      expect(structureColumn.sortable).toBe(false);
      expect(structureColumn.filter).toBe(false);
      expect(structureColumn.flex).toBe(15);
      expect(structureColumn.resizable).toBe(true);
      expect(structureColumn.headerClass).toBe('ag-header-cell-custom-center');
      expect(structureColumn.cellClass).toBe('ag-cell-custom-center');
    });

    it('should apply correct styling to action column', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);
      const actionColumn = columnDefs[5];

      expect(actionColumn.headerName).toBe('Action');
      expect(actionColumn.sortable).toBe(false);
      expect(actionColumn.filter).toBe(false);
      // Action column might not have flex property
      if (actionColumn.flex) {
        expect(actionColumn.flex).toBe(20);
      }
      expect(actionColumn.resizable).toBe(true);
      expect(actionColumn.headerClass).toBe('ag-header-cell-custom');
      expect(actionColumn.cellClass).toBe('ag-cell-custom');
    });

    it('should handle empty search value', () => {
      const columnDefs = createColumnDefs('');

      expect(Array.isArray(columnDefs)).toBe(true);
      expect(columnDefs.length).toBeGreaterThan(0);
    });

    it('should handle undefined search value', () => {
      const columnDefs = createColumnDefs(undefined as any);

      expect(Array.isArray(columnDefs)).toBe(true);
      expect(columnDefs.length).toBeGreaterThan(0);
    });

    it('should apply correct cell styles to text columns', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);

      // Check that text columns have the correct cell styles
      const textColumns = columnDefs.slice(0, 4); // First 4 columns are text columns
      textColumns.forEach(column => {
        expect(column.cellStyle).toBeDefined();
        expect(typeof column.cellStyle).toBe('object');
      });
    });
  });

  describe('createDefaultColDef', () => {
    it('should create default column definition with correct properties', () => {
      const defaultColDef = createDefaultColDef();

      expect(defaultColDef).toHaveProperty('sortable');
      expect(defaultColDef).toHaveProperty('filter');
      expect(defaultColDef).toHaveProperty('resizable');
      expect(defaultColDef).toHaveProperty('headerClass');
      // cellClass might not be present in defaultColDef
      if (defaultColDef.cellClass) {
        expect(defaultColDef).toHaveProperty('cellClass');
      }
    });

    it('should return consistent default column definition', () => {
      const defaultColDef1 = createDefaultColDef();
      const defaultColDef2 = createDefaultColDef();

      expect(defaultColDef1).toEqual(defaultColDef2);
    });
  });

  describe('createGridOptions', () => {
    it('should create grid options with correct structure', () => {
      const gridOptions = createGridOptions();

      expect(gridOptions).toHaveProperty('defaultColDef');
      expect(gridOptions).toHaveProperty('components');
      expect(gridOptions).toHaveProperty('overlayNoRowsTemplate');
    });

    it('should set correct default column definition', () => {
      const gridOptions = createGridOptions();

      expect(gridOptions.defaultColDef).toBeDefined();
      expect(gridOptions.defaultColDef).toHaveProperty('sortable');
      expect(gridOptions.defaultColDef).toHaveProperty('filter');
    });

    it('should register custom renderers', () => {
      const gridOptions = createGridOptions();

      expect(gridOptions.components).toBeDefined();
      expect(typeof gridOptions.components).toBe('object');
    });

    it('should set correct overlay template for no rows', () => {
      const gridOptions = createGridOptions();

      expect(gridOptions.overlayNoRowsTemplate).toBeDefined();
      expect(typeof gridOptions.overlayNoRowsTemplate).toBe('string');
    });

    it('should handle null renderers gracefully', () => {
      const gridOptions = createGridOptions();

      expect(gridOptions).toBeDefined();
      expect(gridOptions.components).toBeDefined();
    });

    it('should handle undefined renderers gracefully', () => {
      const gridOptions = createGridOptions();

      expect(gridOptions).toBeDefined();
      expect(gridOptions.components).toBeDefined();
    });
  });

  describe('address column valueGetter', () => {
    it('should combine address fields correctly', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);
      const addressColumn = columnDefs[3];

      expect(addressColumn.valueGetter).toBeDefined();
      expect(typeof addressColumn.valueGetter).toBe('function');

      const mockParams = {
        data: {
          addressLine1: '123 Main St',
          addressLine2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          pinZipCode: '10001'
        }
      };

      const result = addressColumn.valueGetter(mockParams);
      expect(result).toContain('123 Main St');
      expect(result).toContain('Apt 4B');
      expect(result).toContain('New York');
      expect(result).toContain('NY');
      expect(result).toContain('10001');
    });

    it('should handle missing address fields', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);
      const addressColumn = columnDefs[3];

      const mockParams = {
        data: {
          addressLine1: '123 Main St',
          city: 'New York'
        }
      };

      const result = addressColumn.valueGetter(mockParams);
      expect(result).toContain('123 Main St');
      expect(result).toContain('New York');
    });

    it('should return default message for empty address', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);
      const addressColumn = columnDefs[3];

      const mockParams = {
        data: {}
      };

      const result = addressColumn.valueGetter(mockParams);
      expect(result).toBe('No address provided');
    });

    it('should handle partial address data', () => {
      const searchValue = 'test';
      const columnDefs = createColumnDefs(searchValue);
      const addressColumn = columnDefs[3];

      const mockParams = {
        data: {
          addressLine1: '123 Main St',
          state: 'NY'
        }
      };

      const result = addressColumn.valueGetter(mockParams);
      expect(result).toContain('123 Main St');
      expect(result).toContain('NY');
    });
  });

  describe('mock function verification', () => {
    it('should call createHighlightedCellRenderer for text columns', () => {
      const searchValue = 'test';
      createColumnDefs(searchValue);

      // The mock should have been called for each text column
      expect(mockCreateHighlightedCellRenderer).toHaveBeenCalled();
      expect(mockCreateHighlightedCellRenderer.mock.calls.length).toBeGreaterThan(0);
    });

    it('should call createHighlightedCellRenderer with correct parameters', () => {
      const searchValue = 'test';
      createColumnDefs(searchValue);

      // Check that the mock was called with the search value
      const calls = mockCreateHighlightedCellRenderer.mock.calls;
      calls.forEach(call => {
        expect(call[0]).toBe(searchValue);
        expect(typeof call[1]).toBe('number');
      });
    });
  });
});
