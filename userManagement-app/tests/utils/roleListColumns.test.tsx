import { createRoleColumnDefs } from '../../src/utils/roleListColumns';

// Mock dependencies
jest.mock('commonApp/cellRenderers', () => ({
  createHighlightedCellRenderer: jest.fn((searchValue: string, maxChars: number) => {
    return (params: any) => `HighlightedCell-${params.value}-${searchValue}-${maxChars}`;
  })
}));

jest.mock('../../src/utils/gridUtils', () => ({
  createCellStyles: jest.fn((hasLeftPadding?: boolean) => ({
    padding: hasLeftPadding ? '0 12px' : '0 8px',
    display: 'flex',
    alignItems: 'center'
  }))
}));

describe('roleListColumns', () => {
  const mockNameCellRenderer = jest.fn((params: any) => `NameCell-${params.data?.rolename || 'N/A'}`);

  describe('createRoleColumnDefs', () => {
    it('should create column definitions array', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should create 7 columns', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      expect(columns).toHaveLength(7);
    });

    it('should have Role Name column as first column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      expect(columns[0].field).toBe('rolename');
      expect(columns[0].headerName).toBe('Role Name');
    });

    it('should have Department column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      const deptColumn = columns.find(col => col.field === 'department');
      expect(deptColumn).toBeDefined();
      expect(deptColumn?.headerName).toBe('Department');
    });

    it('should have Description column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      const descColumn = columns.find(col => col.field === 'roledescription');
      expect(descColumn).toBeDefined();
      expect(descColumn?.headerName).toBe('Description');
    });

    it('should have Create Date column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      const createDateColumn = columns.find(col => col.field === 'createdat');
      expect(createDateColumn).toBeDefined();
      expect(createDateColumn?.headerName).toBe('Create Date');
    });

    it('should have Last Updated column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      const lastUpdatedColumn = columns.find(col => col.field === 'lastupdatedat');
      expect(lastUpdatedColumn).toBeDefined();
      expect(lastUpdatedColumn?.headerName).toBe('Last Updated');
    });

    it('should have Action column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      const actionColumn = columns.find(col => col.headerName === 'Action');
      expect(actionColumn).toBeDefined();
    });

    it('should have Status column as last column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      const lastColumn = columns[columns.length - 1];
      expect(lastColumn.field).toBe('status');
      expect(lastColumn.headerName).toBe('Status');
    });
  });

  describe('Role Name Column Configuration', () => {
    it('should use custom name cell renderer', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      expect(nameColumn.cellRenderer).toBe(mockNameCellRenderer);
    });

    it('should have valueGetter function', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      expect(typeof nameColumn.valueGetter).toBe('function');
    });

    it('should return role name from valueGetter', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      const params = {
        data: { rolename: 'Admin' }
      };

      const result = nameColumn.valueGetter?.(params);
      expect(result).toBe('Admin');
    });

    it('should return N/A from valueGetter when rolename is empty', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      const params = {
        data: { rolename: '' }
      };

      const result = nameColumn.valueGetter?.(params);
      expect(result).toBe('N/A');
    });

    it('should return N/A from valueGetter when rolename is undefined', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      const params = {
        data: {}
      };

      const result = nameColumn.valueGetter?.(params);
      expect(result).toBe('N/A');
    });
  });

  describe('Date Column Configuration', () => {
    it('should have valueFormatter for Create Date', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      expect(typeof createDateColumn?.valueFormatter).toBe('function');
    });

    it('should format date correctly', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      const params = {
        value: '2023-01-15T10:30:00Z'
      };

      const result = createDateColumn?.valueFormatter?.(params);
      expect(result).toMatch(/\d{2}-\w{3}-\d{2}/);
    });

    it('should return N/A for invalid date', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      const params = {
        value: 'invalid-date'
      };

      const result = createDateColumn?.valueFormatter?.(params);
      expect(result).toBe('N/A');
    });

    it('should return N/A for null date', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      const params = {
        value: null
      };

      const result = createDateColumn?.valueFormatter?.(params);
      expect(result).toBe('N/A');
    });

    it('should return N/A for empty string date', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      const params = {
        value: ''
      };

      const result = createDateColumn?.valueFormatter?.(params);
      expect(result).toBe('N/A');
    });

    it('should return N/A for undefined date', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      const params = {
        value: undefined
      };

      const result = createDateColumn?.valueFormatter?.(params);
      expect(result).toBe('N/A');
    });

    it('should format date with single digit day correctly', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      const params = {
        value: '2023-01-05T10:30:00Z'
      };

      const result = createDateColumn?.valueFormatter?.(params);
      expect(result).toBe('05-Jan-23');
    });

    it('should format date with double digit day correctly', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      const params = {
        value: '2023-01-15T10:30:00Z'
      };

      const result = createDateColumn?.valueFormatter?.(params);
      expect(result).toBe('15-Jan-23');
    });

    it('should handle date parsing error gracefully', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      // Mock Date constructor to throw error
      const originalDate = global.Date;
      global.Date = jest.fn(() => {
        throw new Error('Date parse error');
      }) as any;

      const params = {
        value: 'some-date'
      };

      const result = createDateColumn?.valueFormatter?.(params);
      expect(result).toBe('N/A');

      global.Date = originalDate;
    });

    it('should have valueFormatter for Last Updated column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const lastUpdatedColumn = columns.find(col => col.field === 'lastupdatedat');

      expect(typeof lastUpdatedColumn?.valueFormatter).toBe('function');
    });

    it('should format date correctly for Last Updated column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const lastUpdatedColumn = columns.find(col => col.field === 'lastupdatedat');

      const params = {
        value: '2023-12-25T10:30:00Z'
      };

      const result = lastUpdatedColumn?.valueFormatter?.(params);
      expect(result).toMatch(/\d{2}-\w{3}-\d{2}/);
    });

    it('should have valueGetter for Create Date column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      expect(typeof createDateColumn?.valueGetter).toBe('function');
    });

    it('should return createdat from valueGetter', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      const params = {
        data: { createdat: '2023-01-01' }
      };

      const result = createDateColumn?.valueGetter?.(params);
      expect(result).toBe('2023-01-01');
    });

    it('should return null from valueGetter when createdat is missing', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      const params = {
        data: {}
      };

      const result = createDateColumn?.valueGetter?.(params);
      expect(result).toBeNull();
    });

    it('should have valueGetter for Last Updated column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const lastUpdatedColumn = columns.find(col => col.field === 'lastupdatedat');

      expect(typeof lastUpdatedColumn?.valueGetter).toBe('function');
    });

    it('should return lastupdatedat from valueGetter', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const lastUpdatedColumn = columns.find(col => col.field === 'lastupdatedat');

      const params = {
        data: { lastupdatedat: '2023-01-02' }
      };

      const result = lastUpdatedColumn?.valueGetter?.(params);
      expect(result).toBe('2023-01-02');
    });

    it('should return null from valueGetter when lastupdatedat is missing', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const lastUpdatedColumn = columns.find(col => col.field === 'lastupdatedat');

      const params = {
        data: {}
      };

      const result = lastUpdatedColumn?.valueGetter?.(params);
      expect(result).toBeNull();
    });
  });

  describe('Action Column Configuration', () => {
    it('should have width of 175', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.width).toBe(175);
    });

    it('should not be resizable', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.resizable).toBe(false);
    });

    it('should use actionRenderer', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.cellRenderer).toBe('actionRenderer');
    });

    it('should not be sortable', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.sortable).toBe(false);
    });

    it('should not have filter', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.filter).toBe(false);
    });
  });

  describe('Search Value Integration', () => {
    it('should pass search value to columns', () => {
      const searchValue = 'test search';
      const columns = createRoleColumnDefs(searchValue, mockNameCellRenderer);

      const deptColumn = columns.find(col => col.field === 'department');
      expect(deptColumn?.cellRenderer).toBeDefined();
    });

    it('should pass empty search value', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      expect(columns).toHaveLength(7);
    });
  });

  describe('Column Width Configuration', () => {
    it('should have correct width for Role Name column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      expect(nameColumn.width).toBe(178);
    });

    it('should have correct width for Department column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const deptColumn = columns.find(col => col.field === 'department');

      expect(deptColumn?.width).toBe(210);
    });

    it('should have flex for Description column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const descColumn = columns.find(col => col.field === 'roledescription');

      expect(descColumn?.flex).toBe(1);
      expect(descColumn?.minWidth).toBe(200);
    });

    it('should have correct width for Create Date column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const createDateColumn = columns.find(col => col.field === 'createdat');

      expect(createDateColumn?.width).toBe(130);
    });

    it('should have correct width for Last Updated column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const lastUpdatedColumn = columns.find(col => col.field === 'lastupdatedat');

      expect(lastUpdatedColumn?.width).toBe(130);
    });

    it('should have correct width for Status column', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const statusColumn = columns.find(col => col.field === 'status');

      expect(statusColumn?.width).toBe(100);
    });
  });

  describe('Column Properties', () => {
    it('should have sortable property for most columns', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      columns.forEach(col => {
        if (col.headerName !== 'Action' && col.field !== 'roledescription') {
          expect(col.sortable).toBe(true);
        }
      });
    });

    it('should have Description column not sortable', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);
      const descColumn = columns.find(col => col.field === 'roledescription');

      expect(descColumn?.sortable).toBe(false);
    });

    it('should have filter property set to false for all columns', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      columns.forEach(col => {
        expect(col.filter).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null name cell renderer', () => {
      const columns = createRoleColumnDefs('', null as any);

      expect(columns).toHaveLength(7);
      expect(columns[0].cellRenderer).toBeNull();
    });

    it('should handle undefined name cell renderer', () => {
      const columns = createRoleColumnDefs('', undefined as any);

      expect(columns).toHaveLength(7);
      expect(columns[0].cellRenderer).toBeUndefined();
    });

    it('should handle very long search value', () => {
      const longSearch = 'a'.repeat(1000);
      const columns = createRoleColumnDefs(longSearch, mockNameCellRenderer);

      expect(columns).toHaveLength(7);
    });

    it('should handle special characters in search value', () => {
      const specialSearch = '<script>alert("test")</script>';
      const columns = createRoleColumnDefs(specialSearch, mockNameCellRenderer);

      expect(columns).toHaveLength(7);
    });
  });

  describe('Column Order', () => {
    it('should maintain correct column order', () => {
      const columns = createRoleColumnDefs('', mockNameCellRenderer);

      expect(columns[0].field).toBe('rolename');
      expect(columns[1].field).toBe('department');
      expect(columns[2].field).toBe('roledescription');
      expect(columns[3].field).toBe('createdat');
      expect(columns[4].field).toBe('lastupdatedat');
      expect(columns[5].headerName).toBe('Action');
      expect(columns[6].field).toBe('status');
    });
  });
});

