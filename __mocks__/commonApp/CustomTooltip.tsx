import React from 'react';

const CustomTooltip = ({ children, content, ...props }: any) => {
  return (
    <div data-testid="custom-tooltip" {...props}>
      {children}
    </div>
  );
};

export default CustomTooltip;

