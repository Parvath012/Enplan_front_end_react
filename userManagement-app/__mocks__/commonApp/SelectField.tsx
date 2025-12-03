import React from 'react';

const SelectField = ({ 
  label, 
  value, 
  onChange, 
  error, 
  errorMessage, 
  placeholder, 
  required, 
  disabled,
  options 
}: any) => {
  const handleChange = (e: any) => {
    onChange(e.target.value);
  };

  return (
    <div data-testid={`form-field-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
      <label>{label} {required && '*'}</label>
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        data-testid={`select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      >
        <option value="">{placeholder}</option>
        {(options || []).map((option: string) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error && (
        <div data-testid={`error-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{errorMessage}</div>
      )}
    </div>
  );
};

export default SelectField;
