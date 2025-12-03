import React from 'react';

const TextField = ({ 
  label, 
  value, 
  onChange, 
  error, 
  errorMessage, 
  placeholder, 
  required, 
  readOnly, 
  disabled, 
  helperText 
}: any) => {
  const handleChange = (e: any) => {
    onChange(e.target.value);
  };

  return (
    <div data-testid={`form-field-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
      <label>{label} {required && '*'}</label>
      <input
        type="text"
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        data-testid={`input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      />
      {helperText && (
        <div data-testid={`helper-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{helperText}</div>
      )}
      {error && (
        <div data-testid={`error-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{errorMessage}</div>
      )}
    </div>
  );
};

export default TextField;
