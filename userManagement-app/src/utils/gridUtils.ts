// Grid utilities to eliminate duplication in UserList.tsx

// Common column properties to eliminate duplication
export const createBaseColumnProps = (flex: number, searchValue: string, cellRendererWidth?: number) => ({
  sortable: true,
  filter: false,
  flex,
  resizable: true,
  suppressMovableColumns: false, // Will be overridden by AgGridShell
  headerClass: 'ag-header-cell-custom',
  cellClass: 'ag-cell-custom',
  cellRenderer: cellRendererWidth ? `createHighlightedCellRenderer(searchValue, ${cellRendererWidth})` : undefined,
});

// Common cell styles to eliminate duplication
export const createCellStyles = (hasOverflow = false) => ({
  ...(hasOverflow && {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  paddingTop: '12px',
});

// Tab styling factory to eliminate duplication
export const createTabStyles = (isActive: boolean, marginLeft: string) => ({
  position: 'relative' as const,
  cursor: 'pointer',
  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 400,
  fontStyle: 'normal',
  fontSize: '12px',
  letterSpacing: 'normal',
  textAlign: 'center' as const,
  lineHeight: 'normal',
  textTransform: 'none' as const,
  textDecoration: 'none',
  padding: '5px 0',
  marginLeft,
  transition: 'color 0.2s ease',
  color: isActive ? 'rgba(0, 111, 230, 1)' : '#333333',
  '&:hover': {
    color: 'rgba(0, 111, 230, 1)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-5px',
    left: 0,
    width: '100%',
    height: '2px',
    backgroundColor: isActive ? 'rgba(0, 111, 230, 1)' : 'transparent',
    transition: 'background-color 0.2s ease',
  },
});

// Grid options factory to eliminate duplication
export const createGridOptions = (actionRenderer: any, icons: any) => ({
  headerHeight: 34,
  defaultColDef: {
    sortable: true,
    filter: false,
    resizable: true,
    suppressHeaderClickSorting: false, // Allow header click sorting
    suppressMovableColumns: false, // This will be overridden by AgGridShell
  },
  components: {
    actionRenderer: actionRenderer,
  },
  icons,
  overlayNoRowsTemplate: "<div style='padding: 20px; font-family: InterTight-Regular, Inter Tight, sans-serif; color: #5B6061;'>No users available. Please add users or check the API connection.</div>",
});

// Default column definition factory
export const createDefaultColDef = () => ({
  suppressHeaderClickSorting: false, // Allow header click sorting
  sortable: true,
  filter: true,
  resizable: true,
  headerClass: 'ag-header-cell-custom',
  unSortIcon: true,
  sortingOrder: ['asc', 'desc', null] as any,
});

// Row style factory
export const createRowStyle = (params: any) => {
  const user = params.data;
  const isInactive = user.status === 'Inactive' || !user.isenabled;
  return {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderBottom: '1px solid rgba(247, 247, 246, 1)',
    opacity: isInactive ? 0.7 : 1,
    filter: isInactive ? 'grayscale(0.3)' : 'none',
    transition: 'opacity 0.3s ease, filter 0.3s ease',
  };
};
