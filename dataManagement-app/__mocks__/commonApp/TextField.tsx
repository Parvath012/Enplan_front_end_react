import React from 'react';

interface TextFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  fullWidth,
  size,
  error,
  helperText,
}) => {
  return (
    <div data-testid="text-field-mock">
      {label && <label>{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-label={label}
        data-fullwidth={fullWidth}
        data-size={size}
        data-error={error}
      />
      {helperText && <span>{helperText}</span>}
    </div>
  );
};

export default TextField;

