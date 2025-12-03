import React from 'react';
import SelectField from 'commonApp/SelectField';

interface StandardSelectFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}

const StandardSelectField: React.FC<StandardSelectFieldProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  required = true
}) => {
  return (
    <SelectField
      id={id}
      label=""
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      required={required}
      fullWidth={true}
      size="small"
    />
  );
};

export default StandardSelectField;

