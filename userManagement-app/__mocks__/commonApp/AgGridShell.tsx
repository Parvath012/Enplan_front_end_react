import React from 'react';

const AgGridShell = ({ 
  rowData, 
  columnDefs,
  onSortChanged,
  ...restProps 
}: any) => {
  return (
    <div data-testid="ag-grid-shell">
      <div data-testid="row-count">{rowData?.length || 0}</div>
      <div data-testid="column-count">{columnDefs?.length || 0}</div>
      <div data-testid="grid-data">
        {rowData?.map((row: any, index: number) => (
          <div key={index} data-testid="grid-row">
            <span data-testid="row-country">{row.country}</span>
            <span data-testid="row-prepopulated">{row.isPrePopulated ? 'prepopulated' : 'not-prepopulated'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgGridShell;
