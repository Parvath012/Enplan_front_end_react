import React from 'react';

interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  width?: string;
  error?: boolean;
  helperText?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  fullWidth,
  size,
  width,
  error,
  helperText,
}) => {
  return (
    <div data-testid="select-field-mock" style={{ width }}>
      {label && <label>{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-label={label}
        data-fullwidth={fullWidth}
        data-size={size}
        data-error={error}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {helperText && <span>{helperText}</span>}
    </div>
  );
};

export default SelectField;

