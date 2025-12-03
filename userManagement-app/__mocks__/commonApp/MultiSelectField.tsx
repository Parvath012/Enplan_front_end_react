import React from 'react';

const MultiSelectField = ({ 
  label, 
  value, 
  onChange, 
  error, 
  errorMessage, 
  placeholder, 
  required, 
  disabled,
  options,
  noOptionsMessage
}: any) => {
  const handleChange = (e: any) => {
    // Convert to array for multi-select
    const selectedValues = Array.from(e.target.selectedOptions, (option: any) => option.value);
    onChange(selectedValues);
  };

  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : (value ? [value] : []);

  return (
    <div data-testid={`form-field-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
      <label>{label} {required && '*'}</label>
      <select
        multiple
        value={safeValue}
        onChange={handleChange}
        disabled={disabled}
        data-testid={`multiselect-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      >
        {(options || []).length === 0 && (
          <option disabled>{noOptionsMessage || 'No options available'}</option>
        )}
        {(options || []).map((option: string) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error && (
        <div data-testid={`error-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{errorMessage}</div>
      )}
      {disabled && placeholder && (
        <div data-testid="disabled-message">{placeholder}</div>
      )}
    </div>
  );
};

export default MultiSelectField;
