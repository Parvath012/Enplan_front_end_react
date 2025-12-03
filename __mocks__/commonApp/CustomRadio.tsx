import React from 'react';

const CustomRadio = ({ children, ...props }: any) => {
  return (
    <div data-testid="custom-radio" {...props}>
      {children}
    </div>
  );
};

export default CustomRadio;

