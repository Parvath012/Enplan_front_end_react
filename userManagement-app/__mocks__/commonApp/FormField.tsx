import React from 'react';

const FormField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  errorMessage,
  required = false, 
  disabled = false,
  placeholder = '',
  options = [],
  helperText,
  className
}: any) => {
  const handleChange = (e: any) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  if (type === 'select') {
    return (
      <div data-testid="form-field" data-type="select" data-required={required} data-disabled={disabled}>
        {label && <label data-testid="form-field-label">{label}{required && ' *'}</label>}
        <div className="MuiInputBase-root">
          <div className="MuiSelect-root">
            {/* Simplified Select component that shows the current value */}
            <div data-testid="form-field-select">{value}</div>
          </div>
        </div>
        {errorMessage && <span data-testid="form-field-error" style={{color: 'red'}}>{errorMessage}</span>}
        {helperText && <span data-testid="form-field-helper">{helperText}</span>}
      </div>
    );
  }

  return (
    <div data-testid="form-field" data-type={type} data-required={required} data-disabled={disabled}>
      {label && <label data-testid="form-field-label">{label}{required && ' *'}</label>}
      <input
        type={type}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={disabled}
        required={required}
        data-testid="form-field-input"
        aria-invalid={error ? 'true' : 'false'}
        style={{
          backgroundColor: disabled ? '#F5F5F5' : 'white',
          color: disabled ? '#9E9E9E' : 'black'
        }}
      />
      {errorMessage && <span data-testid="form-field-error">{errorMessage}</span>}
      {helperText && <span data-testid="form-field-helper">{helperText}</span>}
    </div>
  );
};

export default FormField;
