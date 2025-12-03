import React from 'react';

const FormSection = ({ title, children, ...props }: any) => {
  return (
    <div data-testid="form-section" {...props}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
};

export default FormSection;

