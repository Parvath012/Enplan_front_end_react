import React from 'react';

const ReadOnlyField = ({ label, value, ...props }: any) => {
  return (
    <div data-testid="read-only-field" {...props}>
      {label && <label>{label}</label>}
      <span>{value}</span>
    </div>
  );
};

export default ReadOnlyField;

