import React from 'react';

const CustomTooltip = ({ children, title, placement = 'top' }: any) => {
  return (
    <div data-testid="custom-tooltip" data-title={title} data-placement={placement}>
      {children}
    </div>
  );
};

export default CustomTooltip;
