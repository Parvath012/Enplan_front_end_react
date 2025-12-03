import React from 'react';

const MockCustomTooltip = ({ title, placement, children }: any) => {
  return (
    <div data-testid="custom-tooltip" data-title={title} data-placement={placement}>
      {children}
    </div>
  );
};

export default MockCustomTooltip;



