import React from 'react';

const GridStyles: React.FC = () => (
  <style>{`
    .ag-header-cell-custom .ag-header-cell-text {
      font-size: 10px !important;
      font-weight: 650 !important;
      color: #818586 !important;
      font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    .ag-header-cell-custom-center .ag-header-cell-text {
      font-size: 10px !important;
      font-weight: 650 !important;
      color: #818586 !important;
      font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    .ag-header-cell.ag-header-cell-sortable .ag-header-label {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ag-header-cell .ag-header-label {
      display: flex;
      align-items: center;
      width: 100%;
    }
    .ag-header-cell .ag-header-cell-text {
      flex: 1 1 auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ag-header-cell .ag-header-label .ag-sort-indicator-container,
    .ag-header-cell .ag-header-label .ag-sort-indicator-icon,
    .ag-header-cell .ag-header-label .ag-sort-ascending-icon,
    .ag-header-cell .ag-header-label .ag-sort-descending-icon,
    .ag-header-cell .ag-header-label .ag-sort-none-icon {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
    }

    /* Hide the header filter icon if present */
    .ag-header-cell .ag-header-icon.ag-header-icon-filter {
      display: none !important;
    }

    /* Remove hover effects from AG Grid rows - Comprehensive approach */
    .ag-theme-alpine .ag-row-hover {
      background-color: transparent !important;
    }
    
    .ag-theme-alpine .ag-row:hover {
      background-color: transparent !important;
    }
    
    .ag-theme-alpine .ag-row-selected:hover {
      background-color: transparent !important;
    }
    
    .ag-theme-alpine .ag-row.ag-row-hover {
      background-color: transparent !important;
    }
    
    /* Remove hover effects from AG Grid cells */
    .ag-theme-alpine .ag-cell:hover {
      background-color: transparent !important;
    }
    
    .ag-theme-alpine .ag-cell-selected:hover {
      background-color: transparent !important;
    }
    
    .ag-theme-alpine .ag-row:hover .ag-cell {
      background-color: transparent !important;
    }
    
    .ag-theme-alpine .ag-row-hover .ag-cell {
      background-color: transparent !important;
    }
    
    /* Override AG Grid CSS custom properties */
    .ag-theme-alpine {
      --ag-row-hover-color: transparent !important;
      --ag-selected-row-background-color: transparent !important;
      --ag-range-selection-background-color: transparent !important;
    }
    
    /* Fallback selectors without theme specificity */
    .ag-row-hover {
      background-color: transparent !important;
    }
    
    .ag-row:hover {
      background-color: transparent !important;
    }
    
    .ag-row-selected:hover {
      background-color: transparent !important;
    }
    
    .ag-cell:hover {
      background-color: transparent !important;
    }
    
    .ag-cell-selected:hover {
      background-color: transparent !important;
    }
    
    /* Hide "No rows to show" message */
    .ag-overlay-no-rows-wrapper {
      display: none !important;
    }
    
    .ag-overlay-no-rows-center {
      display: none !important;
    }
    
    .ag-overlay-loading-wrapper {
      display: none !important;
    }
    
    .ag-overlay-loading-center {
      display: none !important;
    }
  `}</style>
);

export default GridStyles;


