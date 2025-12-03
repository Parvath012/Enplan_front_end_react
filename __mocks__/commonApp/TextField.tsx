import React from 'react';

const TextField = ({ label, value, onChange, disabled, required, placeholder, width, ...props }: any) => {
  return (
    <div data-testid="text-field" {...props}>
      {label && <label>{label}</label>}
      <input
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        style={{ width }}
      />
    </div>
  );
};

export default TextField;

