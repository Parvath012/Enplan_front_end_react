import React from 'react';

const MultiSelectField = ({ label, value, onChange, options, disabled, ...props }: any) => {
  return (
    <div data-testid="multi-select-field" {...props}>
      {label && <label>{label}</label>}
      <select
        multiple
        value={value || []}
        onChange={(e) => onChange?.(Array.from(e.target.selectedOptions, option => option.value))}
        disabled={disabled}
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

export default MultiSelectField;

