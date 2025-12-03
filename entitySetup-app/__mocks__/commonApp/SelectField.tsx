import React from 'react';

const MockSelectField = ({ label, value, onChange, options, placeholder, disabled, required, width }: any) => {
  return (
    <div data-testid="select-field">
      <label>{label}</label>
      <select
        data-testid="select-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        style={{ width }}
      >
        <option value="">{placeholder}</option>
        {options?.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MockSelectField;



