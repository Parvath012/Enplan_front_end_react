export const StatusInfoTooltip = ({ children, transfereddate, transferedto, rowIndex, totalRows }: any) => (
  <div 
    data-testid="status-info-tooltip" 
    data-transfereddate={transfereddate} 
    data-transferedto={transferedto} 
    data-rowindex={rowIndex} 
    data-totalrows={totalRows}
  >
    {children}
  </div>
);

export const mockFunction = jest.fn();