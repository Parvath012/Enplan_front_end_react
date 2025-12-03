import React from 'react';

const MockReadOnlyField = ({ label, value, width }: any) => {
  return (
    <div data-testid="readonly-field">
      <label>{label}</label>
      <span data-testid="readonly-value" style={{ width }}>{value}</span>
    </div>
  );
};

export default MockReadOnlyField;



