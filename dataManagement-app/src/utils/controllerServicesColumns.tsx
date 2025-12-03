import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArrowsVertical, ArrowUp, ArrowDown, Flash, Warning, FlashOff } from '@carbon/icons-react';

export const createControllerServicesColumnDefs = () => [
  {
    field: 'name',
    headerName: 'Name',
    sortable: true,
    suppressHeaderMenuButton: true,
    filter: false,
    flex: 13,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellStyle: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      paddingTop: '12px',
    },
  },
  {
    field: 'type',
    headerName: 'Type',
    sortable: true,
    suppressHeaderMenuButton: true,
    filter: false,
    flex: 23,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellStyle: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      paddingTop: '12px',
    },
  },
  {
    field: 'bundle',
    headerName: 'Bundle',
    sortable: true,
    suppressHeaderMenuButton: true,
    filter: false,
    flex: 16,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellStyle: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      paddingTop: '12px',
    },
    valueGetter: (params: any) => {
      const bundle = params.data?.bundle;
      if (bundle?.group && bundle?.artifact && bundle?.version) {
        return `${bundle.group}.${bundle.artifact} - ${bundle.version}`;
      }
      return 'Unknown Bundle';
    },
  },
  {
    field: 'state',
    headerName: 'State',
    sortable: true,
    suppressHeaderMenuButton: true,
    filter: false,
    flex: 8,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellStyle: {
      paddingTop: '12px',
    },
    cellRenderer: (params: any) => {
      const state = params.value || 'Unknown';
      
      // Create status icon and text based on state
      const getStatusDisplay = (state: string) => {
        switch (state.toUpperCase()) {
          case 'ENABLED':
          case 'RUNNING':
          case 'ENABLING': // Transitional state - treat as Enabled
            return {
              icon: Flash,
              text: 'Enabled',
              color: '#666'
            };
          case 'DISABLED':
          case 'STOPPED':
          case 'DISABLING': // Transitional state - treat as Disabled
            return {
              icon: FlashOff,
              text: 'Disabled',
              color: '#666'
            };
          case 'INVALID':
            return {
              icon: Warning,
              text: 'Invalid', 
              color: '#666'
            };
          default:
            return {
              icon: Warning,
              text: 'Unknown', // Default to Unknown for unknown states
              color: '#666'
            };
        }
      };
      
      const statusInfo = getStatusDisplay(state);
      
      // Return a React element with Carbon icon and text
      return React.createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '100%',
          color: '#5B6061',
          fontSize: '10px',
          fontFamily: 'InterTight-Regular, Inter Tight, sans-serif',
          fontWeight: 400
        }
      }, [
        React.createElement(statusInfo.icon, {
          key: 'icon',
          size: 16,
          style: {
            color: statusInfo.color
          }
        }),
        React.createElement('span', {
          key: 'text',
          style: {
            fontSize: '10px',
            lineHeight: '1',
            fontFamily: 'InterTight-Regular, Inter Tight, sans-serif',
            fontWeight: 400,
            color: '#5B6061'
          }
        }, statusInfo.text)
      ]);
    },
  },
  {
    field: 'scope',
    headerName: 'Scope',
    sortable: true,
    suppressHeaderMenuButton: true,
    filter: false,
    flex: 5,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellStyle: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      paddingTop: '12px',
    },
  },
  {
    headerName: 'Actions',
    field: 'actions', // Add field for proper column identification
    colId: 'actions', // Explicit column ID
    width: 180,
    resizable: true,
    suppressMovable: false, // Will be overridden by AgGridShell
    suppressHeaderMenuButton: true,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    cellRenderer: 'actionRenderer',
    sortable: false,
    filter: false,
    suppressClickEdit: true, // Prevent edit mode on click
  }
];

export const createControllerServicesDefaultColDef = () => ({
  suppressHeaderClickSorting: false,
  sortable: true,
  filter: true,
  resizable: true,
  headerClass: 'ag-header-cell-custom',
  unSortIcon: true,
  sortingOrder: ['asc', 'desc', null] as any,
});

export const createControllerServicesGridOptions = (actionRenderer: any) => ({
  headerHeight: 34,
  suppressHorizontalScroll: true,
  defaultColDef: {
    sortable: true,
    filter: false,
    resizable: true,
    suppressHeaderMenuButton: true,
    suppressMovableColumns: false, // This will be overridden by AgGridShell
  },
  components: {
    actionRenderer: actionRenderer,
  },
  icons: {
    sortAscending: renderToStaticMarkup(<ArrowUp style={{ width: 12, height: 11, color: '#0051AB' }} />),
    sortDescending: renderToStaticMarkup(<ArrowDown style={{ width: 12, height: 11, color: '#0051AB' }} />),
    sortUnSort: renderToStaticMarkup(<ArrowsVertical style={{ width: 12, height: 12, color: '#0051AB' }} />),
  },
  overlayNoRowsTemplate: "<div style='padding: 20px; font-family: InterTight-Regular, Inter Tight, sans-serif; color: #5B6061;'>No controller services available. Please check the NiFi connection.</div>",
});