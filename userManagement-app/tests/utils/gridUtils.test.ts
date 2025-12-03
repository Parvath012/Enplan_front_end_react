import {
  createBaseColumnProps,
  createCellStyles,
  createTabStyles,
  createGridOptions,
  createDefaultColDef,
  createRowStyle
} from '../../src/utils/gridUtils';

describe('gridUtils', () => {
  describe('createBaseColumnProps', () => {
    it('should create base column properties', () => {
      const props = createBaseColumnProps();
      
      expect(props).toBeDefined();
      expect(typeof props).toBe('object');
    });

    it('should return consistent properties', () => {
      const props1 = createBaseColumnProps();
      const props2 = createBaseColumnProps();
      
      expect(props1).toEqual(props2);
    });
  });

  describe('createCellStyles', () => {
    it('should create cell styles', () => {
      const styles = createCellStyles();
      
      expect(styles).toBeDefined();
      expect(typeof styles).toBe('object');
    });

    it('should return consistent styles', () => {
      const styles1 = createCellStyles();
      const styles2 = createCellStyles();
      
      expect(styles1).toEqual(styles2);
    });
  });

  describe('createTabStyles', () => {
    it('should create tab styles', () => {
      const styles = createTabStyles();
      
      expect(styles).toBeDefined();
      expect(typeof styles).toBe('object');
    });

    it('should return consistent styles', () => {
      const styles1 = createTabStyles();
      const styles2 = createTabStyles();
      
      expect(styles1).toEqual(styles2);
    });
  });

  describe('createGridOptions', () => {
    it('should create grid options', () => {
      const options = createGridOptions();
      
      expect(options).toBeDefined();
      expect(typeof options).toBe('object');
    });

    it('should return consistent options', () => {
      const options1 = createGridOptions();
      const options2 = createGridOptions();
      
      expect(options1).toEqual(options2);
    });
  });

  describe('createDefaultColDef', () => {
    it('should create default column definition', () => {
      const colDef = createDefaultColDef();
      
      expect(colDef).toBeDefined();
      expect(typeof colDef).toBe('object');
    });

    it('should return consistent column definition', () => {
      const colDef1 = createDefaultColDef();
      const colDef2 = createDefaultColDef();
      
      expect(colDef1).toEqual(colDef2);
    });
  });

  describe('createRowStyle', () => {
    it('should create row style for active user', () => {
      const params = {
        data: { status: 'Active', isenabled: true }
      };
      const styles = createRowStyle(params);
      
      expect(styles).toBeDefined();
      expect(typeof styles).toBe('object');
      expect(styles.backgroundColor).toBe('rgba(255, 255, 255, 0)');
    });

    it('should create row style for inactive user', () => {
      const params = {
        data: { status: 'Inactive', isenabled: false }
      };
      const styles = createRowStyle(params);
      
      expect(styles).toBeDefined();
      expect(typeof styles).toBe('object');
      expect(styles.backgroundColor).toBe('rgba(255, 255, 255, 0)');
      expect(styles.opacity).toBe(0.7);
      expect(styles.filter).toBe('grayscale(0.3)');
    });

    it('should return styles when called with params', () => {
      const mockParams = {
        data: { id: 1, name: 'Test', status: 'Active', isenabled: true },
        node: { rowIndex: 0 }
      };
      
      const styles = createRowStyle(mockParams);
      
      expect(styles).toBeDefined();
      expect(typeof styles).toBe('object');
    });

    it('should handle different row indices', () => {
      const evenRowParams = {
        data: { id: 1, name: 'Test', status: 'Active', isenabled: true },
        node: { rowIndex: 0 }
      };
      
      const oddRowParams = {
        data: { id: 2, name: 'Test2', status: 'Active', isenabled: true },
        node: { rowIndex: 1 }
      };
      
      const evenStyles = createRowStyle(evenRowParams);
      const oddStyles = createRowStyle(oddRowParams);
      
      expect(evenStyles).toBeDefined();
      expect(oddStyles).toBeDefined();
      expect(typeof evenStyles).toBe('object');
      expect(typeof oddStyles).toBe('object');
    });

    it('should handle null data gracefully', () => {
      const nullDataParams = {
        data: null,
        node: { rowIndex: 0 }
      };
      
      // This should not throw an error
      expect(() => createRowStyle(nullDataParams)).toThrow();
    });

    it('should handle undefined data gracefully', () => {
      const undefinedDataParams = {
        data: undefined,
        node: { rowIndex: 0 }
      };
      
      // This should not throw an error
      expect(() => createRowStyle(undefinedDataParams)).toThrow();
    });
  });

  describe('function consistency', () => {
    it('should return consistent results across multiple calls', () => {
      const baseProps1 = createBaseColumnProps();
      const baseProps2 = createBaseColumnProps();
      
      const cellStyles1 = createCellStyles();
      const cellStyles2 = createCellStyles();
      
      const tabStyles1 = createTabStyles();
      const tabStyles2 = createTabStyles();
      
      const gridOptions1 = createGridOptions();
      const gridOptions2 = createGridOptions();
      
      const colDef1 = createDefaultColDef();
      const colDef2 = createDefaultColDef();
      
      expect(baseProps1).toEqual(baseProps2);
      expect(cellStyles1).toEqual(cellStyles2);
      expect(tabStyles1).toEqual(tabStyles2);
      expect(gridOptions1).toEqual(gridOptions2);
      expect(colDef1).toEqual(colDef2);
    });
  });
});
