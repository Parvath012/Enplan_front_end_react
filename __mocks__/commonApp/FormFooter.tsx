import React from 'react';

const FormFooter = ({ children, ...props }: any) => {
  return (
    <div data-testid="form-footer" {...props}>
      {children}
    </div>
  );
};

export default FormFooter;

