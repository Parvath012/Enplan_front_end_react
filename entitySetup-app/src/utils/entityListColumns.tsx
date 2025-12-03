import React from 'react';
import { EntityModel } from '../services/entitySetupService';
import { createHighlightedCellRenderer } from 'commonApp/cellRenderers';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArrowsVertical, ArrowUp, ArrowDown } from '@carbon/icons-react';

export const createColumnDefs = (searchValue: string) => [
  {
    field: 'legalBusinessName',
    headerName: 'Legal Name',
    sortable: true,
    suppressHeaderMenuButton: true,
    filter: false,
    flex: 18,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellRenderer: createHighlightedCellRenderer(searchValue, 29),
    cellStyle: {
      paddingTop: '12px',
    },
  },
  {
    field: 'displayName',
    headerName: 'Display Name',
    sortable: true,
    filter: false,
    flex: 15,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellRenderer: createHighlightedCellRenderer(searchValue, 20),
    cellStyle: {
      paddingTop: '12px',
    },
  },
  {
    field: 'entityType',
    headerName: 'Entity Type',
    sortable: true,
    filter: false,
    flex: 12,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellRenderer: createHighlightedCellRenderer(searchValue, 20),
    cellStyle: {
      paddingTop: '12px',
    },
  },
  {
    field: 'address',
    headerName: 'Address',
    sortable: true,
    filter: false,
    flex: 25,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    valueGetter: (params: any) => {
      const e = params.data as EntityModel;
      const address = [e.addressLine1, e.addressLine2, e.country, e.state, e.city, e.pinZipCode]
        .filter(Boolean)
        .join(' ');
      return address || 'No address provided';
    },
    cellRenderer: createHighlightedCellRenderer(searchValue, 45),
    cellStyle: {
      paddingTop: '12px',
    },
  },
  {
    headerName: 'Structure',
    flex: 15,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    headerClass: 'ag-header-cell-custom-center',
    cellClass: 'ag-cell-custom-center',
    cellRenderer: 'structureRenderer',
    sortable: false,
    filter: false,
  },
  {
    headerName: 'Action',
    width: 220,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellRenderer: 'actionRenderer',
    sortable: false,
    filter: false,
  }
];

export const createDefaultColDef = () => ({
  suppressHeaderClickSorting: true,
  sortable: true,
  filter: true,
  resizable: true,
  headerClass: 'ag-header-cell-custom',
  unSortIcon: true,
  sortingOrder: ['asc', 'desc', null] as any,
});

export const createGridOptions = (structureRenderer: any, actionRenderer: any) => ({
  headerHeight: 34,
  defaultColDef: {
    sortable: true,
    filter: false,
    resizable: true,
    suppressHeaderMenuButton: true,
    suppressMovableColumns: false, // This will be overridden by AgGridShell
  },
  components: {
    structureRenderer: structureRenderer,
    actionRenderer: actionRenderer,
  },
  icons: {
    sortAscending: renderToStaticMarkup(<ArrowUp style={{ width: 12, height: 11, color: '#0051AB' }} />),
    sortDescending: renderToStaticMarkup(<ArrowDown style={{ width: 12, height: 11, color: '#0051AB' }} />),
    sortUnSort: renderToStaticMarkup(<ArrowsVertical style={{ width: 12, height: 12, color: '#0051AB' }} />),
  },
  overlayNoRowsTemplate: "<div style='padding: 20px; font-family: InterTight-Regular, Inter Tight, sans-serif; color: #5B6061;'>No entities available. Please add entities or check the API connection.</div>",
});
