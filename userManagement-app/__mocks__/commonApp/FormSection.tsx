import React from 'react';

const FormSection = ({ title, children }: any) => {
  return (
    <div data-testid="form-section">
      {title && <h3 data-testid="section-title">{title}</h3>}
      <div data-testid="section-content">{children}</div>
    </div>
  );
};

export default FormSection;
