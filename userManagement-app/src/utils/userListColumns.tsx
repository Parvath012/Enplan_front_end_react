import { createHighlightedCellRenderer } from 'commonApp/cellRenderers';
import { 
  createBaseColumnProps, 
  createCellStyles 
} from './gridUtils';

/**
 * Create AG Grid column definitions for user list
 */
export const createUserColumnDefs = (searchValue: string, nameCellRenderer: any) => [
  {
    field: 'name',
    headerName: 'Name',
    ...createBaseColumnProps(28, searchValue, 34),
    suppressHeaderClickSorting: true,
    valueGetter: (params: any) => {
      const user = params.data;
      return `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'N/A';
    },
    cellRenderer: nameCellRenderer,
    cellStyle: {
      ...createCellStyles(true),
      padding: '0 12px',
      paddingTop: '0',
      paddingLeft: '12px',
      paddingRight: '12px',
      paddingBottom: '0',
      overflow: 'visible'
    },
  },
  {
    field: 'emailid',
    headerName: 'User ID',
    ...createBaseColumnProps(28, searchValue, 24),
    cellRenderer: createHighlightedCellRenderer(searchValue, 24),
    cellStyle: createCellStyles(true),
  },
  {
    field: 'phonenumber',
    headerName: 'Phone Number',
    ...createBaseColumnProps(25, searchValue, 20),
    cellRenderer: createHighlightedCellRenderer(searchValue, 20),
    cellStyle: createCellStyles(),
  },
  {
    field: 'role',
    headerName: 'Role',
    ...createBaseColumnProps(20, searchValue, 20),
    cellRenderer: createHighlightedCellRenderer(searchValue, 20),
    cellStyle: createCellStyles(),
  },
  {
    field: 'department',
    headerName: 'Department',
    ...createBaseColumnProps(20, searchValue, 20),
    cellRenderer: createHighlightedCellRenderer(searchValue, 20),
    cellStyle: createCellStyles(),
  },
  {
    field: 'reportingmanager',
    headerName: 'Reporting Manager',
    ...createBaseColumnProps(25, searchValue, 24),
    cellRenderer: createHighlightedCellRenderer(searchValue, 24),
    cellStyle: createCellStyles(true),
  },
  {
    field: 'dottedorprojectmanager',
    headerName: 'Project Manager',
    ...createBaseColumnProps(25, searchValue, 24),
    cellRenderer: createHighlightedCellRenderer(searchValue, 24),
    cellStyle: createCellStyles(true),
  },
  {
    headerName: 'Action',
    width: 130,
    resizable: true,
    suppressMovableColumns: false,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom action-cell-no-border',
    cellRenderer: 'actionRenderer',
    sortable: false,
    filter: false,
    cellStyle: {
      borderRight: 'none !important',
      padding: '0 !important'
    }
  },
  {
    field: 'status',
    headerName: 'Status',
    ...createBaseColumnProps(18, searchValue, 20),
    cellRenderer: createHighlightedCellRenderer(searchValue, 20),
    cellStyle: createCellStyles(),
  }
];

