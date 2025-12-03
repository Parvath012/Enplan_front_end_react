import {
  createGetRowClass,
  createGetRowStyle,
  createGridOptions
} from '../../../src/components/common/browserRowUtils';

// Mock browserUtils
jest.mock('../../../src/components/common/browserUtils', () => ({
  normalizeId: (id: string) => String(id).toLowerCase().trim(),
  hasValidDescription: (service: any) => !!(service?.description && service.description.trim().length > 0)
}));

describe('browserRowUtils', () => {
  describe('createGetRowClass', () => {
    it('should return empty string when data is missing', () => {
      const getRowClass = createGetRowClass(null, 'row-selected', false);
      const params = { data: null };
      expect(getRowClass(params)).toBe('');
    });

    it('should return empty string when data.id is missing', () => {
      const getRowClass = createGetRowClass(null, 'row-selected', false);
      const params = { data: {} };
      expect(getRowClass(params)).toBe('');
    });

    it('should return row class when item is selected', () => {
      const selectedItem = { id: 'test-id' };
      const getRowClass = createGetRowClass(selectedItem, 'row-selected', false);
      const params = {
        data: { id: 'test-id' },
        node: { rowElement: document.createElement('div') }
      };
      expect(getRowClass(params)).toBe('row-selected');
    });

    it('should return empty string when item is not selected', () => {
      const selectedItem = { id: 'test-id' };
      const getRowClass = createGetRowClass(selectedItem, 'row-selected', false);
      const params = {
        data: { id: 'other-id' },
        node: { rowElement: document.createElement('div') }
      };
      expect(getRowClass(params)).toBe('');
    });

    it('should set aria-selected attribute when selected', () => {
      const selectedItem = { id: 'test-id' };
      const getRowClass = createGetRowClass(selectedItem, 'row-selected', false);
      const rowElement = document.createElement('div');
      const params = {
        data: { id: 'test-id' },
        node: { rowElement }
      };
      getRowClass(params);
      expect(rowElement.getAttribute('aria-selected')).toBe('true');
    });

    it('should set aria-selected to false when not selected', () => {
      const selectedItem = { id: 'test-id' };
      const getRowClass = createGetRowClass(selectedItem, 'row-selected', false);
      const rowElement = document.createElement('div');
      const params = {
        data: { id: 'other-id' },
        node: { rowElement }
      };
      getRowClass(params);
      expect(rowElement.getAttribute('aria-selected')).toBe('false');
    });

    it('should check description when checkDescription is true and item is selected', () => {
      const selectedItem = { id: 'test-id', description: 'Valid description' };
      const getRowClass = createGetRowClass(selectedItem, 'row-selected', true);
      const params = {
        data: { id: 'test-id' },
        node: { rowElement: document.createElement('div') }
      };
      expect(getRowClass(params)).toBe('row-selected');
    });

    it('should return empty string when checkDescription is true and description is invalid', () => {
      const selectedItem = { id: 'test-id', description: '' };
      const getRowClass = createGetRowClass(selectedItem, 'row-selected', true);
      const params = {
        data: { id: 'test-id' },
        node: { rowElement: document.createElement('div') }
      };
      expect(getRowClass(params)).toBe('');
    });

    it('should handle null selectedItem', () => {
      const getRowClass = createGetRowClass(null, 'row-selected', false);
      const params = {
        data: { id: 'test-id' },
        node: { rowElement: document.createElement('div') }
      };
      expect(getRowClass(params)).toBe('');
    });

    it('should normalize IDs for comparison', () => {
      const selectedItem = { id: '  TEST-ID  ' };
      const getRowClass = createGetRowClass(selectedItem, 'row-selected', false);
      const params = {
        data: { id: 'test-id' },
        node: { rowElement: document.createElement('div') }
      };
      expect(getRowClass(params)).toBe('row-selected');
    });
  });

  describe('createGetRowStyle', () => {
    it('should return default style when data is missing', () => {
      const getRowStyle = createGetRowStyle(null, false);
      const params = { data: null };
      const style = getRowStyle(params);
      expect(style).toEqual({
        cursor: 'pointer',
        width: '100%'
      });
    });

    it('should return default style when data.id is missing', () => {
      const getRowStyle = createGetRowStyle(null, false);
      const params = { data: {} };
      const style = getRowStyle(params);
      expect(style).toEqual({
        cursor: 'pointer',
        width: '100%'
      });
    });

    it('should return selected style when item is selected', () => {
      const selectedItem = { id: 'test-id' };
      const getRowStyle = createGetRowStyle(selectedItem, false);
      const params = { data: { id: 'test-id' } };
      const style = getRowStyle(params);
      expect(style).toEqual({
        backgroundColor: 'rgba(227, 239, 253, 1)',
        cursor: 'pointer',
        width: '100%'
      });
    });

    it('should return default style when item is not selected', () => {
      const selectedItem = { id: 'test-id' };
      const getRowStyle = createGetRowStyle(selectedItem, false);
      const params = { data: { id: 'other-id' } };
      const style = getRowStyle(params);
      expect(style).toEqual({
        cursor: 'pointer',
        width: '100%'
      });
    });

    it('should return sky blue background when checkDescription is true and selected', () => {
      const selectedItem = { id: 'test-id', description: 'Valid description' };
      const getRowStyle = createGetRowStyle(selectedItem, true);
      const params = { data: { id: 'test-id' } };
      const style = getRowStyle(params);
      expect(style.backgroundColor).toBe('#87CEFA');
    });

    it('should return default style when checkDescription is true and description is invalid', () => {
      const selectedItem = { id: 'test-id', description: '' };
      const getRowStyle = createGetRowStyle(selectedItem, true);
      const params = { data: { id: 'test-id' } };
      const style = getRowStyle(params);
      expect(style.backgroundColor).toBeUndefined();
    });

    it('should handle null selectedItem', () => {
      const getRowStyle = createGetRowStyle(null, false);
      const params = { data: { id: 'test-id' } };
      const style = getRowStyle(params);
      expect(style.backgroundColor).toBeUndefined();
    });
  });

  describe('createGridOptions', () => {
    const mockGetRowClass = jest.fn(() => '');
    const mockGetRowHeight = jest.fn(() => 32);
    const mockHandleServiceSelect = jest.fn();
    const mockOverlayNoRowsTemplate = '<div>No rows</div>';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create grid options with correct structure', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        false
      );

      expect(gridOptions).toHaveProperty('headerHeight', 32);
      expect(gridOptions).toHaveProperty('suppressHorizontalScroll', true);
      expect(gridOptions).toHaveProperty('domLayout', 'normal');
      expect(gridOptions).toHaveProperty('getRowClass', mockGetRowClass);
      expect(gridOptions).toHaveProperty('getRowHeight', mockGetRowHeight);
    });

    it('should include getRowId function', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        false
      );

      const rowId = gridOptions.getRowId({ data: { id: 'test-id' } });
      expect(rowId).toBe('test-id');
    });

    it('should set suppressRowHoverHighlight to true', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        false
      );

      expect(gridOptions.suppressRowHoverHighlight).toBe(true);
    });

    it('should include default column definition', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        false
      );

      expect(gridOptions.defaultColDef).toMatchObject({
        sortable: true,
        filter: false,
        resizable: true
      });
    });

    it('should handle onCellClicked when allowRowClick is false', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        false
      );

      const params = {
        column: { getColId: () => 'type' },
        data: { id: 'test-id' },
        event: { stopPropagation: jest.fn() }
      };

      gridOptions.onCellClicked?.(params as any);
      expect(mockHandleServiceSelect).toHaveBeenCalledWith({ id: 'test-id' });
    });

    it('should not call handleServiceSelect when clicking non-type column', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        false
      );

      const params = {
        column: { getColId: () => 'version' },
        data: { id: 'test-id' },
        event: { stopPropagation: jest.fn() }
      };

      gridOptions.onCellClicked?.(params as any);
      expect(mockHandleServiceSelect).not.toHaveBeenCalled();
    });

    it('should handle onRowClicked when allowRowClick is true', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        true
      );

      const event = {
        data: { id: 'test-id' },
        event: { stopPropagation: jest.fn() }
      };

      gridOptions.onRowClicked?.(event as any);
      expect(mockHandleServiceSelect).toHaveBeenCalledWith({ id: 'test-id' });
    });

    it('should handle onRowClicked with node.data when data is missing', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        true
      );

      const event = {
        data: null,
        node: { data: { id: 'test-id' } },
        event: { stopPropagation: jest.fn() }
      };

      gridOptions.onRowClicked?.(event as any);
      expect(mockHandleServiceSelect).toHaveBeenCalledWith({ id: 'test-id' });
    });

    it('should include overlayNoRowsTemplate', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        false
      );

      expect(gridOptions.overlayNoRowsTemplate).toBe(mockOverlayNoRowsTemplate);
    });

    it('should set suppressRowClickSelection to true', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        false
      );

      expect(gridOptions.suppressRowClickSelection).toBe(true);
    });

    it('should include onGridReady callback', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        false
      );

      expect(gridOptions.onGridReady).toBeDefined();
      expect(typeof gridOptions.onGridReady).toBe('function');
    });

    it('should include onFirstDataRendered callback', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        false
      );

      expect(gridOptions.onFirstDataRendered).toBeDefined();
      expect(typeof gridOptions.onFirstDataRendered).toBe('function');
    });

    it('should set rowSelection to single', () => {
      const gridOptions = createGridOptions(
        mockGetRowClass,
        mockGetRowHeight,
        mockHandleServiceSelect,
        mockOverlayNoRowsTemplate,
        false
      );

      expect(gridOptions.rowSelection).toBe('single');
    });
  });
});

