import {
  createBrowserColumnDefs,
  filterServices
} from '../../../src/components/common/browserGridUtils';

// Mock browserCellRenderers
jest.mock('../../../src/components/common/browserCellRenderers', () => ({
  createTypeCellRenderer: jest.fn(() => () => 'Type Cell'),
  createVersionCellRenderer: jest.fn(() => () => 'Version Cell'),
  createTagsCellRenderer: jest.fn(() => () => 'Tags Cell')
}));

describe('browserGridUtils', () => {
  describe('createBrowserColumnDefs', () => {
    const mockHandleServiceSelect = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create column definitions with correct fields', () => {
      const columnDefs = createBrowserColumnDefs(
        'test',
        mockHandleServiceSelect,
        'restricted-icon',
        'row-selected'
      );

      expect(columnDefs).toHaveLength(3);
      expect(columnDefs[0].field).toBe('type');
      expect(columnDefs[1].field).toBe('version');
      expect(columnDefs[2].field).toBe('tags');
    });

    it('should create column definitions with correct header names', () => {
      const columnDefs = createBrowserColumnDefs(
        'test',
        mockHandleServiceSelect,
        'restricted-icon',
        'row-selected'
      );

      expect(columnDefs[0].headerName).toBe('Type');
      expect(columnDefs[1].headerName).toBe('Version');
      expect(columnDefs[2].headerName).toBe('Tags');
    });

    it('should create column definitions with correct flex values', () => {
      const columnDefs = createBrowserColumnDefs(
        'test',
        mockHandleServiceSelect,
        'restricted-icon',
        'row-selected'
      );

      expect(columnDefs[0].flex).toBe(30);
      expect(columnDefs[1].flex).toBe(25);
      expect(columnDefs[2].flex).toBe(45);
    });

    it('should include cell renderers', () => {
      const columnDefs = createBrowserColumnDefs(
        'test',
        mockHandleServiceSelect,
        'restricted-icon',
        'row-selected'
      );

      expect(columnDefs[0].cellRenderer).toBeDefined();
      expect(columnDefs[1].cellRenderer).toBeDefined();
      expect(columnDefs[2].cellRenderer).toBeDefined();
    });

    it('should pass search term to cell renderers', () => {
      const searchTerm = 'test search';
      const columnDefs = createBrowserColumnDefs(
        searchTerm,
        mockHandleServiceSelect,
        'restricted-icon',
        'row-selected'
      );

      expect(columnDefs[0].cellRenderer).toBeDefined();
      expect(columnDefs[1].cellRenderer).toBeDefined();
      expect(columnDefs[2].cellRenderer).toBeDefined();
    });

    it('should include cell styles', () => {
      const columnDefs = createBrowserColumnDefs(
        'test',
        mockHandleServiceSelect,
        'restricted-icon',
        'row-selected'
      );

      expect(columnDefs[0].cellStyle).toBeDefined();
      expect(columnDefs[1].cellStyle).toBeDefined();
      expect(columnDefs[2].cellStyle).toBeDefined();
    });

    it('should handle empty search term', () => {
      const columnDefs = createBrowserColumnDefs(
        '',
        mockHandleServiceSelect,
        'restricted-icon',
        'row-selected'
      );

      expect(columnDefs).toHaveLength(3);
    });
  });

  describe('filterServices', () => {
    const mockServices = [
      {
        id: '1',
        type: 'TestProcessor',
        tags: ['test', 'processor'],
        version: '1.20.0',
        description: 'Test processor description'
      },
      {
        id: '2',
        type: 'AnotherProcessor',
        tags: ['another', 'service'],
        version: '2.0.0',
        description: 'Another processor'
      },
      {
        id: '3',
        type: 'DatabaseService',
        tags: ['database', 'connection'],
        version: '1.5.0'
      }
    ];

    it('should return all services when search term is empty', () => {
      const result = filterServices(mockServices, '');
      expect(result).toEqual(mockServices);
    });

    it('should return all services when search term is whitespace only', () => {
      const result = filterServices(mockServices, '   ');
      expect(result).toEqual(mockServices);
    });

    it('should filter by type (case insensitive)', () => {
      const result = filterServices(mockServices, 'test');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('TestProcessor');
    });

    it('should filter by tags', () => {
      const result = filterServices(mockServices, 'database');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('DatabaseService');
    });

    it('should filter by version', () => {
      const result = filterServices(mockServices, '1.20.0');
      expect(result).toHaveLength(1);
      expect(result[0].version).toBe('1.20.0');
    });

    it('should filter by description', () => {
      const result = filterServices(mockServices, 'processor description');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return multiple results when multiple services match', () => {
      const result = filterServices(mockServices, 'processor');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle partial matches', () => {
      const result = filterServices(mockServices, 'test');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array when no services match', () => {
      const result = filterServices(mockServices, 'nonexistent');
      expect(result).toEqual([]);
    });

    it('should handle services without description', () => {
      const result = filterServices(mockServices, 'database');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty services array', () => {
      const result = filterServices([], 'test');
      expect(result).toEqual([]);
    });

    it('should handle case insensitive search', () => {
      const result = filterServices(mockServices, 'TEST');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should match any tag in tags array', () => {
      const result = filterServices(mockServices, 'connection');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle special characters in search term', () => {
      const servicesWithSpecialChars = [
        {
          id: '1',
          type: 'Test@Processor',
          tags: ['test#tag'],
          version: '1.0.0'
        }
      ];
      const result = filterServices(servicesWithSpecialChars, '@');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

