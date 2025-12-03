import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArrowUp, ArrowDown, ArrowsVertical } from '@carbon/icons-react';
import { normalizeId, hasValidDescription } from './browserUtils';

/**
 * Create getRowClass callback for browser grid
 * Note: This returns a function. Use useCallback in the component if needed.
 */
export const createGetRowClass = <T extends { id: string }>(
  selectedItem: T | null,
  rowSelectedClass: string,
  checkDescription: boolean = false
) => {
  return (params: any) => {
    if (!params.data?.id) {
      return '';
    }
    
    const serviceId = normalizeId(params.data.id);
    const selectedId = selectedItem ? normalizeId(selectedItem.id) : null;
    
    // Normalized string match
    let isSelected = selectedId !== null && 
                    selectedId !== '' && 
                    selectedId === serviceId;
    
    // Optionally check if selected item has a valid description
    if (checkDescription && isSelected) {
      isSelected = hasValidDescription(selectedItem);
    }
    
    // Store the original ID (not normalized) in data-row-id for reference
    const originalId = String(params.data.id);
    
    if (params.node?.rowElement) {
      const rowElement = params.node.rowElement;
      rowElement.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      rowElement.setAttribute('role', 'row');
      rowElement.setAttribute('data-row-id', originalId); // Store original ID
      rowElement.setAttribute('data-row-id-normalized', serviceId); // Store normalized for comparison
      rowElement.setAttribute('tabIndex', isSelected ? '0' : '-1');
    }
    
    return isSelected ? rowSelectedClass : '';
  };
};

/**
 * Create getRowStyle callback for browser grid
 * Note: This returns a function. Use useCallback in the component if needed.
 */
export const createGetRowStyle = <T extends { id: string }>(
  selectedItem: T | null,
  checkDescription: boolean = false
) => {
  return (params: any) => {
    if (!params.data?.id) {
      return {
        cursor: 'pointer',
        width: '100%'
      };
    }
    
    const serviceId = normalizeId(params.data.id);
    const selectedId = selectedItem ? normalizeId(selectedItem.id) : null;
    
    // Normalized string match
    let isSelected = selectedId !== null && 
                    selectedId !== '' && 
                    selectedId === serviceId;
    
    // Optionally check if selected item has a valid description
    if (checkDescription && isSelected) {
      isSelected = hasValidDescription(selectedItem);
    }
    
    if (isSelected) {
      // Return sky blue background color
      return {
        backgroundColor: checkDescription ? '#87CEFA' : 'rgba(227, 239, 253, 1)',
        cursor: 'pointer',
        width: '100%'
      };
    }
    return {
      cursor: 'pointer',
      width: '100%'
    };
  };
};

/**
 * Create grid options for browser grid
 * @param allowRowClick - If true, allows selection when clicking anywhere on the row. If false, only Type column triggers selection.
 * Note: This returns the grid options object directly. Use useMemo in the component if needed.
 */
export const createGridOptions = (
  getRowClass: (params: any) => string,
  getRowHeight: (params: any) => number,
  handleServiceSelect: (service: any) => void,
  overlayNoRowsTemplate: string,
  allowRowClick: boolean = false
) => {
  return {
    headerHeight: 32,
    suppressHorizontalScroll: true,
    domLayout: 'normal',
    getRowId: (params: any) => params.data?.id,
    getRowClass: getRowClass,
    getRowHeight: getRowHeight,
    // Disable AG Grid's default row hover - only Type column should trigger row hover
    suppressRowHoverHighlight: true,
    defaultColDef: {
      sortable: true,
      filter: false,
      resizable: true,
      suppressHeaderMenuButton: true,
      suppressMovableColumns: false,
    },
    icons: {
      sortAscending: renderToStaticMarkup(React.createElement(ArrowUp, { style: { width: 12, height: 11, color: '#0051AB' } })),
      sortDescending: renderToStaticMarkup(React.createElement(ArrowDown, { style: { width: 12, height: 11, color: '#0051AB' } })),
      sortUnSort: renderToStaticMarkup(React.createElement(ArrowsVertical, { style: { width: 12, height: 12, color: '#0051AB' } })),
    },
    overlayNoRowsTemplate: overlayNoRowsTemplate,
    suppressRowClickSelection: true,
    // Handle cell clicks
    onCellClicked: allowRowClick 
      ? (params: any) => {
          // Stop event propagation to prevent double selection
          if (params.event) {
            params.event.stopPropagation();
          }
          // Selection is handled by onRowClicked, so we don't need to do anything here
        }
      : (params: any) => {
          // Only trigger selection if clicking on Type column
          const columnId = params.column?.getColId() ?? params.colDef?.field;
          if (columnId === 'type') {
            const rowData = params.data;
            if (rowData?.id) {
              handleServiceSelect(rowData);
            }
          }
          // For Version and Tags columns, do nothing (prevent selection)
        },
    // Handle row clicks
    onRowClicked: allowRowClick
      ? (event: any) => {
          // Stop event propagation to prevent multiple selections
          if (event.event) {
            event.event.stopPropagation();
          }
          const rowData = event.data ?? event.node?.data;
          if (rowData?.id) {
            handleServiceSelect(rowData);
          }
        }
      : (event: any) => {
          // Check if the click target is in the Type column
          const target = event.event?.target as HTMLElement;
          if (target) {
            // Find the cell element
            const cellElement = target.closest('.ag-cell');
            if (cellElement) {
              const colId = cellElement.getAttribute('col-id');
              // Only allow selection if clicking on Type column
              if (colId === 'type') {
                const rowData = event.data ?? event.node?.data;
                if (rowData?.id) {
                  handleServiceSelect(rowData);
                }
              }
              // For Version and Tags columns, prevent selection
            }
          }
          // If we can't determine the column, prevent selection
        },
    onGridReady: () => {},
    onFirstDataRendered: () => {},
    rowSelection: 'single',
  };
};

