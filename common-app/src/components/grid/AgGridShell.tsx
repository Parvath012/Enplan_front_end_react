import React from 'react';
import { AgGridReact } from 'ag-grid-react';

type AgGridShellProps = {
  rowData: any[];
  columnDefs: any[];
  defaultColDef: any;
  components?: any;
  gridOptions?: any;
  onSortChanged?: (e: any) => void;
  rowHeight?: number;
  headerHeight?: number;
  getRowStyle?: any;
  gridRef?: React.Ref<any>;
  isDraggable?: boolean;
};

const AgGridShell: React.FC<AgGridShellProps> = ({
  rowData,
  columnDefs,
  defaultColDef,
  components,
  gridOptions,
  onSortChanged,
  rowHeight = 30,
  headerHeight = 34,
  getRowStyle,
  gridRef,
  isDraggable = true,
}) => {
  return (
    <AgGridReact
      ref={gridRef as any}
      rowData={rowData}
      columnDefs={columnDefs}
      defaultColDef={{
        ...defaultColDef,
        suppressMovable: !isDraggable
      }}
      components={components}
      onSortChanged={onSortChanged}
      rowHeight={rowHeight}
      headerHeight={headerHeight}
      getRowStyle={getRowStyle}
      suppressCellFocus={true}
      rowStyle={{ cursor: 'default' }}
      className="ag-theme-alpine"
      theme="legacy"
      enableCellTextSelection={true}
      animateRows={false}
      domLayout="normal"
      suppressScrollOnNewData={true}
      suppressMovableColumns={!isDraggable}
      gridOptions={{
        ...gridOptions,
        defaultColDef: {
          ...gridOptions?.defaultColDef,
          suppressMovable: !isDraggable
        }
      }}
      multiSortKey='ctrl'
    />
  );
};

export default AgGridShell;
