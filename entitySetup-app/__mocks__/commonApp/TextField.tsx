import React from 'react';

const MockTextField = ({ label, value, onChange, placeholder, disabled, required, width }: any) => {
  return (
    <div data-testid="text-field">
      <label>{label}</label>
      <input
        data-testid="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={{ width }}
      />
    </div>
  );
};

export default MockTextField;



