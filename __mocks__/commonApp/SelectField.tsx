import React from 'react';

const SelectField = ({ label, value, onChange, options, disabled, required, ...props }: any) => {
  return (
    <div data-testid="select-field" {...props}>
      {label && <label>{label}</label>}
      <select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
      >
        {options?.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;

