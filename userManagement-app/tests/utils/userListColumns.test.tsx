import { createUserColumnDefs } from '../../src/utils/userListColumns';

// Mock dependencies
jest.mock('commonApp/cellRenderers', () => ({
  createHighlightedCellRenderer: jest.fn((searchValue: string, maxChars: number) => {
    return (params: any) => `HighlightedCell-${params.value}-${searchValue}-${maxChars}`;
  })
}));

jest.mock('../../src/utils/gridUtils', () => ({
  createBaseColumnProps: jest.fn((width: number, searchValue: string, maxChars: number) => ({
    width,
    resizable: true,
    sortable: true,
    filter: true,
    searchValue,
    maxChars
  })),
  createCellStyles: jest.fn((hasLeftPadding?: boolean) => ({
    padding: hasLeftPadding ? '0 12px' : '0 8px',
    display: 'flex',
    alignItems: 'center'
  }))
}));

describe('userListColumns', () => {
  const mockNameCellRenderer = jest.fn((params: any) => `NameCell-${params.data.firstname}`);

  describe('createUserColumnDefs', () => {
    it('should create column definitions array', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should create 9 columns', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      expect(columns).toHaveLength(9);
    });

    it('should have Name column as first column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      expect(columns[0].field).toBe('name');
      expect(columns[0].headerName).toBe('Name');
    });

    it('should have User ID column as second column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      expect(columns[1].field).toBe('emailid');
      expect(columns[1].headerName).toBe('User ID');
    });

    it('should have Phone Number column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      const phoneColumn = columns.find(col => col.field === 'phonenumber');
      expect(phoneColumn).toBeDefined();
      expect(phoneColumn?.headerName).toBe('Phone Number');
    });

    it('should have Role column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      const roleColumn = columns.find(col => col.field === 'role');
      expect(roleColumn).toBeDefined();
      expect(roleColumn?.headerName).toBe('Role');
    });

    it('should have Department column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      const deptColumn = columns.find(col => col.field === 'department');
      expect(deptColumn).toBeDefined();
      expect(deptColumn?.headerName).toBe('Department');
    });

    it('should have Reporting Manager column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      const managerColumn = columns.find(col => col.field === 'reportingmanager');
      expect(managerColumn).toBeDefined();
      expect(managerColumn?.headerName).toBe('Reporting Manager');
    });

    it('should have Project Manager column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      const pmColumn = columns.find(col => col.field === 'dottedorprojectmanager');
      expect(pmColumn).toBeDefined();
      expect(pmColumn?.headerName).toBe('Project Manager');
    });

    it('should have Action column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      const actionColumn = columns.find(col => col.headerName === 'Action');
      expect(actionColumn).toBeDefined();
    });

    it('should have Status column as last column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      const lastColumn = columns[columns.length - 1];
      expect(lastColumn.field).toBe('status');
      expect(lastColumn.headerName).toBe('Status');
    });
  });

  describe('Name Column Configuration', () => {
    it('should use custom name cell renderer', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      expect(nameColumn.cellRenderer).toBe(mockNameCellRenderer);
    });

    it('should have suppressHeaderClickSorting true', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      expect(nameColumn.suppressHeaderClickSorting).toBe(true);
    });

    it('should have valueGetter function', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      expect(typeof nameColumn.valueGetter).toBe('function');
    });

    it('should return full name from valueGetter', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      const params = {
        data: { firstname: 'John', lastname: 'Doe' }
      };

      const result = nameColumn.valueGetter(params);
      expect(result).toBe('John Doe');
    });

    it('should return N/A from valueGetter when names are empty', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      const params = {
        data: { firstname: '', lastname: '' }
      };

      const result = nameColumn.valueGetter(params);
      expect(result).toBe('N/A');
    });

    it('should trim whitespace in valueGetter', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      const params = {
        data: { firstname: '  John  ', lastname: '  Doe  ' }
      };

      const result = nameColumn.valueGetter(params);
      // The trim() is applied to the combined string, so extra spaces between names remain
      // '  John  ' + ' ' + '  Doe  ' = '  John     Doe  ' -> trim() -> 'John     Doe' (5 spaces)
      expect(result).toBe('John     Doe');
    });

    it('should handle null firstname in valueGetter', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      const params = {
        data: { firstname: null, lastname: 'Doe' }
      };

      const result = nameColumn.valueGetter(params);
      expect(result).toBe('Doe');
    });

    it('should handle null lastname in valueGetter', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      const params = {
        data: { firstname: 'John', lastname: null }
      };

      const result = nameColumn.valueGetter(params);
      expect(result).toBe('John');
    });

    it('should have custom cell styles', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      expect(nameColumn.cellStyle).toBeDefined();
      expect(nameColumn.cellStyle.padding).toBe('0 12px');
    });
  });

  describe('Action Column Configuration', () => {
    it('should have width of 140', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.width).toBe(140);
    });

    it('should be resizable', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.resizable).toBe(true);
    });

    it('should not suppress movable columns', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.suppressMovableColumns).toBe(false);
    });

    it('should have custom header class', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.headerClass).toBe('ag-header-cell-custom');
    });

    it('should have custom cell class', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.cellClass).toBe('ag-cell-custom action-cell-no-border');
    });

    it('should use actionRenderer', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.cellRenderer).toBe('actionRenderer');
    });

    it('should not be sortable', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.sortable).toBe(false);
    });

    it('should not have filter', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.filter).toBe(false);
    });

    it('should have custom cell styles', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const actionColumn = columns.find(col => col.headerName === 'Action');

      expect(actionColumn?.cellStyle).toBeDefined();
      expect(actionColumn?.cellStyle.borderRight).toBe('none !important');
      expect(actionColumn?.cellStyle.padding).toBe('0 !important');
    });
  });

  describe('Search Value Integration', () => {
    it('should pass search value to columns', () => {
      const searchValue = 'test search';
      const columns = createUserColumnDefs(searchValue, mockNameCellRenderer);

      const emailColumn = columns.find(col => col.field === 'emailid');
      expect(emailColumn?.searchValue).toBe(searchValue);
    });

    it('should pass empty search value', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      const emailColumn = columns.find(col => col.field === 'emailid');
      expect(emailColumn?.searchValue).toBe('');
    });

    it('should create highlighted cell renderers with search value', () => {
      const searchValue = 'john';
      const columns = createUserColumnDefs(searchValue, mockNameCellRenderer);

      const emailColumn = columns.find(col => col.field === 'emailid');
      const renderer = emailColumn?.cellRenderer;

      expect(typeof renderer).toBe('function');
    });
  });

  describe('Column Width Configuration', () => {
    it('should have correct width for Name column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      expect(nameColumn.width).toBe(28);
    });

    it('should have correct width for User ID column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const emailColumn = columns.find(col => col.field === 'emailid');

      expect(emailColumn?.width).toBe(28);
    });

    it('should have correct width for Phone Number column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const phoneColumn = columns.find(col => col.field === 'phonenumber');

      expect(phoneColumn?.width).toBe(25);
    });

    it('should have correct width for Role column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const roleColumn = columns.find(col => col.field === 'role');

      expect(roleColumn?.width).toBe(20);
    });

    it('should have correct width for Department column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const deptColumn = columns.find(col => col.field === 'department');

      expect(deptColumn?.width).toBe(20);
    });

    it('should have correct width for Reporting Manager column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const managerColumn = columns.find(col => col.field === 'reportingmanager');

      expect(managerColumn?.width).toBe(25);
    });

    it('should have correct width for Project Manager column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const pmColumn = columns.find(col => col.field === 'dottedorprojectmanager');

      expect(pmColumn?.width).toBe(25);
    });

    it('should have correct width for Status column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const statusColumn = columns.find(col => col.field === 'status');

      expect(statusColumn?.width).toBe(18);
    });
  });

  describe('MaxChars Configuration', () => {
    it('should have correct maxChars for Name column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      expect(nameColumn.maxChars).toBe(34);
    });

    it('should have correct maxChars for User ID column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const emailColumn = columns.find(col => col.field === 'emailid');

      expect(emailColumn?.maxChars).toBe(24);
    });

    it('should have correct maxChars for Phone Number column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const phoneColumn = columns.find(col => col.field === 'phonenumber');

      expect(phoneColumn?.maxChars).toBe(20);
    });

    it('should have correct maxChars for Role column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const roleColumn = columns.find(col => col.field === 'role');

      expect(roleColumn?.maxChars).toBe(20);
    });

    it('should have correct maxChars for Department column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const deptColumn = columns.find(col => col.field === 'department');

      expect(deptColumn?.maxChars).toBe(20);
    });

    it('should have correct maxChars for Reporting Manager column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const managerColumn = columns.find(col => col.field === 'reportingmanager');

      expect(managerColumn?.maxChars).toBe(24);
    });

    it('should have correct maxChars for Project Manager column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const pmColumn = columns.find(col => col.field === 'dottedorprojectmanager');

      expect(pmColumn?.maxChars).toBe(24);
    });

    it('should have correct maxChars for Status column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const statusColumn = columns.find(col => col.field === 'status');

      expect(statusColumn?.maxChars).toBe(20);
    });
  });

  describe('Column Properties', () => {
    it('should have resizable property for all columns', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      columns.forEach((col, index) => {
        if (col.headerName !== 'Action') {
          expect(col.resizable).toBe(true);
        }
      });
    });

    it('should have sortable property for all columns except Action', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      columns.forEach(col => {
        if (col.headerName === 'Action') {
          expect(col.sortable).toBe(false);
        } else {
          expect(col.sortable).toBe(true);
        }
      });
    });

    it('should have filter property for all columns except Action', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      columns.forEach(col => {
        if (col.headerName === 'Action') {
          expect(col.filter).toBe(false);
        } else {
          expect(col.filter).toBe(true);
        }
      });
    });
  });

  describe('Cell Styles', () => {
    it('should have cellStyle for Name column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const nameColumn = columns[0];

      expect(nameColumn.cellStyle).toBeDefined();
    });

    it('should have cellStyle for User ID column', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);
      const emailColumn = columns.find(col => col.field === 'emailid');

      expect(emailColumn?.cellStyle).toBeDefined();
    });

    it('should have cellStyle for all regular columns', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      columns.forEach(col => {
        expect(col.cellStyle).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null name cell renderer', () => {
      const columns = createUserColumnDefs('', null as any);

      expect(columns).toHaveLength(9);
      expect(columns[0].cellRenderer).toBeNull();
    });

    it('should handle undefined name cell renderer', () => {
      const columns = createUserColumnDefs('', undefined as any);

      expect(columns).toHaveLength(9);
      expect(columns[0].cellRenderer).toBeUndefined();
    });

    it('should handle very long search value', () => {
      const longSearch = 'a'.repeat(1000);
      const columns = createUserColumnDefs(longSearch, mockNameCellRenderer);

      expect(columns).toHaveLength(9);
    });

    it('should handle special characters in search value', () => {
      const specialSearch = '<script>alert("test")</script>';
      const columns = createUserColumnDefs(specialSearch, mockNameCellRenderer);

      expect(columns).toHaveLength(9);
    });

    it('should handle unicode characters in search value', () => {
      const unicodeSearch = '你好世界';
      const columns = createUserColumnDefs(unicodeSearch, mockNameCellRenderer);

      expect(columns).toHaveLength(9);
    });
  });

  describe('Column Order', () => {
    it('should maintain correct column order', () => {
      const columns = createUserColumnDefs('', mockNameCellRenderer);

      expect(columns[0].field).toBe('name');
      expect(columns[1].field).toBe('emailid');
      expect(columns[2].field).toBe('phonenumber');
      expect(columns[3].field).toBe('role');
      expect(columns[4].field).toBe('department');
      expect(columns[5].field).toBe('reportingmanager');
      expect(columns[6].field).toBe('dottedorprojectmanager');
      expect(columns[7].headerName).toBe('Action');
      expect(columns[8].field).toBe('status');
    });
  });
});

