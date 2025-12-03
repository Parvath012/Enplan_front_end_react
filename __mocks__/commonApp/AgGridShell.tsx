import React from 'react';

const AgGridShell = ({ rowData, columnDefs, onGridReady, onRowClicked, ...props }: any) => {
  return (
    <div data-testid="ag-grid-shell" {...props}>
      <div data-testid="grid-content">
        {rowData?.map((row, index) => (
          <div key={index} data-testid={`row-${index}`}>
            {Object.values(row).join(', ')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgGridShell;

