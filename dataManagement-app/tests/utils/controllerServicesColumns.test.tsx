import React from 'react';
import { 
  createControllerServicesColumnDefs, 
  createControllerServicesDefaultColDef, 
  createControllerServicesGridOptions 
} from '../../src/utils/controllerServicesColumns';

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  ArrowsVertical: () => <div data-testid="arrows-vertical">ArrowsVertical</div>,
  ArrowUp: () => <div data-testid="arrow-up">ArrowUp</div>,
  ArrowDown: () => <div data-testid="arrow-down">ArrowDown</div>,
  Flash: () => <div data-testid="flash">Flash</div>,
  Warning: () => <div data-testid="warning">Warning</div>,
  FlashOff: () => <div data-testid="flash-off">FlashOff</div>,
}));

// Mock react-dom/server
jest.mock('react-dom/server', () => ({
  renderToStaticMarkup: jest.fn((element) => `<mocked>${element.type.name}</mocked>`),
}));

describe('controllerServicesColumns', () => {
  describe('createControllerServicesColumnDefs', () => {
    it('returns correct column definitions array', () => {
      const columnDefs = createControllerServicesColumnDefs();
      
      expect(Array.isArray(columnDefs)).toBe(true);
      expect(columnDefs.length).toBeGreaterThan(0);
    });

    it('includes all required columns', () => {
      const columnDefs = createControllerServicesColumnDefs();
      
      const expectedFields = ['name', 'type', 'bundle', 'state', 'scope'];
      const actualFields = columnDefs
        .filter(col => col.field)
        .map(col => col.field);
      
      expectedFields.forEach(field => {
        expect(actualFields).toContain(field);
      });
    });

    it('includes actions column', () => {
      const columnDefs = createControllerServicesColumnDefs();
      
      const actionsColumn = columnDefs.find(col => col.headerName === 'Actions');
      expect(actionsColumn).toBeDefined();
      expect(actionsColumn?.cellRenderer).toBe('actionRenderer');
    });

    it('configures columns with correct properties', () => {
      const columnDefs = createControllerServicesColumnDefs();
      
      columnDefs.forEach(col => {
        if (col.field && col.field !== 'actions') {
          // Actions column has sortable: false, so skip it
          expect(col.sortable).toBe(true);
          expect(col.suppressHeaderMenuButton).toBe(true);
          expect(col.filter).toBe(false);
          expect(col.resizable).toBe(true);
          expect(col.headerClass).toBe('ag-header-cell-custom');
          expect(col.cellClass).toBe('ag-cell-custom');
        }
      });
    });

    it('configures bundle column with valueGetter', () => {
      const columnDefs = createControllerServicesColumnDefs();
      
      const bundleColumn = columnDefs.find(col => col.field === 'bundle');
      expect(bundleColumn?.valueGetter).toBeDefined();
      
      if (bundleColumn?.valueGetter && typeof bundleColumn.valueGetter === 'function') {
        // Test valueGetter function
        const mockParams = {
          data: {
            bundle: {
              group: 'test.group',
              artifact: 'test.artifact',
              version: '1.0.0'
            }
          }
        };
        
        const result = bundleColumn.valueGetter(mockParams);
        expect(result).toBe('test.group.test.artifact - 1.0.0');
      }
    });

    it('handles missing bundle data gracefully', () => {
      const columnDefs = createControllerServicesColumnDefs();
      
      const bundleColumn = columnDefs.find(col => col.field === 'bundle');
      
      if (bundleColumn?.valueGetter && typeof bundleColumn.valueGetter === 'function') {
        const mockParams = { data: { bundle: null } };
        const result = bundleColumn.valueGetter(mockParams);
        expect(result).toBe('Unknown Bundle');
      }
    });

    it('configures state column with custom renderer', () => {
      const columnDefs = createControllerServicesColumnDefs();
      
      const stateColumn = columnDefs.find(col => col.field === 'state');
      expect(stateColumn?.cellRenderer).toBeDefined();
      expect(typeof stateColumn?.cellRenderer).toBe('function');
    });
  });

  describe('createControllerServicesDefaultColDef', () => {
    it('returns correct default column definition', () => {
      const defaultColDef = createControllerServicesDefaultColDef();
      
      expect(defaultColDef.suppressHeaderClickSorting).toBe(false);
      expect(defaultColDef.sortable).toBe(true);
      expect(defaultColDef.filter).toBe(true);
      expect(defaultColDef.resizable).toBe(true);
      expect(defaultColDef.headerClass).toBe('ag-header-cell-custom');
      expect(defaultColDef.unSortIcon).toBe(true);
      expect(defaultColDef.sortingOrder).toEqual(['asc', 'desc', null]);
    });

    it('maintains consistent structure', () => {
      const defaultColDef1 = createControllerServicesDefaultColDef();
      const defaultColDef2 = createControllerServicesDefaultColDef();
      
      expect(defaultColDef1).toEqual(defaultColDef2);
    });
  });

  describe('createControllerServicesGridOptions', () => {
    const mockActionRenderer = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns correct grid options', () => {
      const gridOptions = createControllerServicesGridOptions(mockActionRenderer);
      
      expect(gridOptions.headerHeight).toBe(34);
      expect(gridOptions.suppressHorizontalScroll).toBe(true);
      expect(gridOptions.defaultColDef.sortable).toBe(true);
      expect(gridOptions.defaultColDef.filter).toBe(false);
      expect(gridOptions.defaultColDef.resizable).toBe(true);
    });

    it('includes action renderer in components', () => {
      const gridOptions = createControllerServicesGridOptions(mockActionRenderer);
      
      expect(gridOptions.components.actionRenderer).toBe(mockActionRenderer);
    });

    it('configures custom icons', () => {
      const gridOptions = createControllerServicesGridOptions(mockActionRenderer);
      
      expect(gridOptions.icons.sortAscending).toBeDefined();
      expect(gridOptions.icons.sortDescending).toBeDefined();
      expect(gridOptions.icons.sortUnSort).toBeDefined();
    });

    it('includes custom no rows template', () => {
      const gridOptions = createControllerServicesGridOptions(mockActionRenderer);
      
      expect(gridOptions.overlayNoRowsTemplate).toContain('No controller services available');
      expect(gridOptions.overlayNoRowsTemplate).toContain('NiFi connection');
    });

    it('maintains grid configuration consistency', () => {
      const gridOptions1 = createControllerServicesGridOptions(mockActionRenderer);
      const gridOptions2 = createControllerServicesGridOptions(mockActionRenderer);
      
      expect(gridOptions1.headerHeight).toBe(gridOptions2.headerHeight);
      expect(gridOptions1.suppressHorizontalScroll).toBe(gridOptions2.suppressHorizontalScroll);
    });
  });

  describe('State column renderer', () => {
    it('renders ENABLED state correctly', () => {
      const columnDefs = createControllerServicesColumnDefs();
      const stateColumn = columnDefs.find(col => col.field === 'state');
      
      if (stateColumn?.cellRenderer && typeof stateColumn.cellRenderer === 'function') {
        const mockParams = { value: 'ENABLED' };
        const renderedElement = stateColumn.cellRenderer(mockParams);
        expect(React.isValidElement(renderedElement)).toBe(true);
      } else {
        expect(stateColumn?.cellRenderer).toBeDefined();
      }
    });

    it('renders DISABLED state correctly', () => {
      const columnDefs = createControllerServicesColumnDefs();
      const stateColumn = columnDefs.find(col => col.field === 'state');
      
      if (stateColumn?.cellRenderer && typeof stateColumn.cellRenderer === 'function') {
        const mockParams = { value: 'DISABLED' };
        const renderedElement = stateColumn.cellRenderer(mockParams);
        expect(React.isValidElement(renderedElement)).toBe(true);
      } else {
        expect(stateColumn?.cellRenderer).toBeDefined();
      }
    });

    it('renders INVALID state correctly', () => {
      const columnDefs = createControllerServicesColumnDefs();
      const stateColumn = columnDefs.find(col => col.field === 'state');
      
      if (stateColumn?.cellRenderer && typeof stateColumn.cellRenderer === 'function') {
        const mockParams = { value: 'INVALID' };
        const renderedElement = stateColumn.cellRenderer(mockParams);
        expect(React.isValidElement(renderedElement)).toBe(true);
      } else {
        expect(stateColumn?.cellRenderer).toBeDefined();
      }
    });

    it('handles unknown state gracefully', () => {
      const columnDefs = createControllerServicesColumnDefs();
      const stateColumn = columnDefs.find(col => col.field === 'state');
      
      if (stateColumn?.cellRenderer && typeof stateColumn.cellRenderer === 'function') {
        const mockParams = { value: 'UNKNOWN_STATE' };
        const renderedElement = stateColumn.cellRenderer(mockParams);
        expect(React.isValidElement(renderedElement)).toBe(true);
      } else {
        expect(stateColumn?.cellRenderer).toBeDefined();
      }
    });

    it('handles null/undefined state', () => {
      const columnDefs = createControllerServicesColumnDefs();
      const stateColumn = columnDefs.find(col => col.field === 'state');
      
      if (stateColumn?.cellRenderer && typeof stateColumn.cellRenderer === 'function') {
        const mockParams = { value: null };
        const renderedElement = stateColumn.cellRenderer(mockParams);
        expect(React.isValidElement(renderedElement)).toBe(true);
      } else {
        expect(stateColumn?.cellRenderer).toBeDefined();
      }
    });
  });
});