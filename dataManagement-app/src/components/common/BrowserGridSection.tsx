import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AgGridShell } from './browserLazyImports';
import BrowserErrorDisplay from './BrowserErrorDisplay';

interface BrowserGridSectionProps {
  loadingError: string | null;
  isDrawerReady: boolean;
  gridRef: React.RefObject<AgGridReact>;
  gridContainerRef: React.RefObject<HTMLDivElement>;
  rowData: any[];
  columnDefs: any[];
  defaultColDef: any;
  gridOptions: any;
  getRowStyle: (params: any) => any;
  entityName: string; // e.g., "Processors" or "controller services"
  gridContainerClassName: string;
  gridWrapperClassName: string;
}

const BrowserGridSection: React.FC<BrowserGridSectionProps> = ({
  loadingError,
  isDrawerReady,
  gridRef,
  gridContainerRef,
  rowData,
  columnDefs,
  defaultColDef,
  gridOptions,
  getRowStyle,
  entityName,
  gridContainerClassName,
  gridWrapperClassName
}) => {
  return (
    <div ref={gridContainerRef} className={gridContainerClassName}>
      <div className={gridWrapperClassName}>
        {(() => {
          if (loadingError) {
            return (
              <BrowserErrorDisplay errorMessage={loadingError} entityName={entityName} />
            );
          }
          
          if (isDrawerReady) {
            return (
              <React.Suspense fallback={<div></div>}>
                <AgGridShell
                  gridRef={gridRef}
                  rowData={rowData}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  gridOptions={gridOptions}
                  headerHeight={32}
                  getRowStyle={getRowStyle}
                  isDraggable={false}
                />
              </React.Suspense>
            );
          }
          
          return (
            <div style={{ 
              height: '400px',
              backgroundColor: '#ffffff'
            }}>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default BrowserGridSection;

