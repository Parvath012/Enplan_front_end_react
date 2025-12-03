import React from 'react';
import { Box, Typography } from '@mui/material';
import TextField from 'commonApp/TextField';
import SelectField from 'commonApp/SelectField';
import MultiSelectField from 'commonApp/MultiSelectField';
import { getUserFormStyles } from './PermissionTableConstants';

// Use shared responsive styles
const userFormStyles = getUserFormStyles();

// Reusable TextField component
export const ReusableTextField: React.FC<{
  field: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
}> = ({ field, label, placeholder, value, onChange, required = true, disabled = false, readOnly = false, error = false, errorMessage = '' }) => {
  // When readOnly is true, always set required to false to prevent red border
  const finalRequired = readOnly ? false : required;
  
  return (
    <Box sx={userFormStyles.formField}>
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={finalRequired}
        disabled={disabled}
        readOnly={readOnly}
        error={error}
        errorMessage={errorMessage}
      />
    </Box>
  );
};

// Reusable SelectField component
export const ReusableSelectField: React.FC<{
  field: string;
  label: string;
  options: Array<{ value: string; label: string }> | string[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
}> = ({ field, label, options, placeholder, value, onChange, required = true, disabled = false, error = false, errorMessage = '' }) => (
  <Box sx={userFormStyles.formField}>
    <SelectField
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      error={error}
      errorMessage={errorMessage}
    />
  </Box>
);

// Reusable SectionTitle component
export const SectionTitle: React.FC<{
  children: React.ReactNode;
  sx?: any;
}> = ({ children, sx = {} }) => (
  <Typography sx={{ ...userFormStyles.sectionTitle, ...sx }}>
    {children}
  </Typography>
);

// Reusable MultiSelectField component
export const ReusableMultiSelectField: React.FC<{
  field: string;
  label: string;
  options: string[];
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
}> = ({ field, label, options, placeholder, value, onChange, required = true, disabled = false, error = false, errorMessage = '' }) => (
  <Box sx={userFormStyles.formField}>
    <MultiSelectField
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      width="100%"
    />
  </Box>
);

// Reusable empty space box for layout maintenance
export const EmptyFormField: React.FC = () => (
  <Box sx={userFormStyles.formField}>
    {/* Empty space to maintain layout */}
  </Box>
);
