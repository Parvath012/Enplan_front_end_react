import React from 'react';
import TextField from 'commonApp/TextField';

interface StandardTextFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

const StandardTextField: React.FC<StandardTextFieldProps> = ({
  id,
  value,
  onChange,
  placeholder,
  required = true
}) => {
  return (
    <TextField
      id={id}
      label=""
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      fullWidth={true}
      size="small"
    />
  );
};

export default StandardTextField;

