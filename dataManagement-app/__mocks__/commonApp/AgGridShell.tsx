import React from 'react';

const MockAgGridShell: React.FC<any> = (props) => {
  return (
    <div data-testid="ag-grid-shell" data-row-count={props.rowData?.length || 0}>
      <div>AgGrid Shell Mock</div>
      {props.columnDefs && (
        <div data-testid="column-defs-count">{props.columnDefs.length}</div>
      )}
    </div>
  );
};

export default MockAgGridShell;

