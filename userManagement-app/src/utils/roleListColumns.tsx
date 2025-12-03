// @ts-ignore - Module federation import
import { createHighlightedCellRenderer } from 'commonApp/cellRenderers';
import { 
  createCellStyles 
} from './gridUtils';

/**
 * Format date to dd-mmm-yy format (e.g., 06-Jan-25)
 */
const formatDate = (dateValue: any): string => {
  if (!dateValue) return 'N/A';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Create AG Grid column definitions for role list
 */
export const createRoleColumnDefs = (searchValue: string, nameCellRenderer: any) => [
  {
    field: 'rolename',
    headerName: 'Role Name',
    width: 178,
    resizable: false,
    suppressMovableColumns: false,
    suppressHeaderClickSorting: false,
    sortable: true,
    filter: false,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    valueGetter: (params: any) => {
      const role = params.data;
      return role.rolename || 'N/A';
    },
    cellRenderer: nameCellRenderer,
    cellRendererParams: { searchTerm: searchValue },
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
    field: 'department',
    headerName: 'Department',
    width: 210,
    resizable: false,
    suppressMovableColumns: false,
    sortable: true,
    filter: false,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellRenderer: createHighlightedCellRenderer(searchValue, 36),
    cellStyle: createCellStyles(true),
  },
  {
    field: 'roledescription',
    headerName: 'Description',
    flex: 1,
    minWidth: 200,
    resizable: true,
    suppressMovableColumns: false,
    sortable: false, // Description column is not sortable
    filter: false,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellRenderer: createHighlightedCellRenderer(searchValue, 55),
    cellStyle: createCellStyles(true),
  },
  {
    field: 'createdat',
    headerName: 'Create Date',
    width: 130,
    resizable: true,
    suppressMovableColumns: false,
    sortable: true,
    filter: false,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellStyle: createCellStyles(),
    valueGetter: (params: any) => {
      return params.data?.createdat || null;
    },
    valueFormatter: (params: any) => {
      return formatDate(params.value);
    },
  },
  {
    field: 'lastupdatedat',
    headerName: 'Last Updated',
    width: 130,
    resizable: true,
    suppressMovableColumns: false,
    sortable: true,
    filter: false,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellStyle: createCellStyles(),
    valueGetter: (params: any) => {
      return params.data?.lastupdatedat || null;
    },
    valueFormatter: (params: any) => {
      const role = params.data;
      const lastUpdatedAt = role?.lastupdatedat;
      const createdAt = role?.createdat;
      
      // If lastupdatedat is null, empty, or equals createdat, show placeholder
      if (!lastUpdatedAt || lastUpdatedAt === '' || lastUpdatedAt === createdAt) {
        return 'DD-MMM-YYYY';
      }
      
      return formatDate(lastUpdatedAt);
    },
  },
  {
    headerName: 'Action',
    width: 175,
    resizable: false,
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
    width: 100,
    resizable: true,
    suppressMovableColumns: false,
    sortable: true,
    filter: false,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellRenderer: createHighlightedCellRenderer(searchValue, 20),
    cellStyle: createCellStyles(),
  }
];

