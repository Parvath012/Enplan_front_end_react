import React from 'react';

const FormHeader = ({ title, onCancel }: any) => {
  return (
    <div data-testid="form-header" onClick={onCancel}>
      {title}
    </div>
  );
};

export default FormHeader;
