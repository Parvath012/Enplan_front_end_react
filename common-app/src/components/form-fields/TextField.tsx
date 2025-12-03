import React from 'react';
import { Box, TextField as MuiTextField } from '@mui/material';
import './styles.scss';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  errorMessage?: string;
  width?: string | number;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  disabled = false,
  readOnly = false,
  helperText,
  required = false,
  fullWidth = true,
  size = 'small',
  error = false,
  errorMessage,
  width = '100%',
}) => {
  // Show placeholder as value when field is disabled and empty
  const displayValue = disabled && (value === '' || value === undefined || value === null) ? placeholder : value;

  // Determine the appropriate CSS class based on field state
  const getInputClassName = () => {
    if (disabled) {
      return 'form-field__input form-field__input--disabled';
    }
    if (readOnly) {
      return 'form-field__input form-field__input--readonly';
    }
    return 'form-field__input';
  };

  return (
    <Box sx={{ width }} className={required ? 'form-field form-field--required' : 'form-field'}>
      <label className="form-field__label">{label}</label>
      <MuiTextField
        fullWidth={fullWidth}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        variant="outlined"
        size={size}
        disabled={false} // Don't use Material-UI's disabled state
        helperText={helperText}
        required={false} // Don't use HTML5 validation
        error={error}
        placeholder={disabled ? '' : placeholder}
        className={getInputClassName()}
        onMouseDown={(disabled || readOnly) ? (e) => e.preventDefault() : undefined}
        slotProps={{
          htmlInput: {
            readOnly: disabled || readOnly,
            style: {
              fontSize: '12px',
              color: disabled ? '#9E9E9E' : '#5F6368',
              fontWeight: 400,
              fontFamily:
                'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              userSelect: (disabled || readOnly) ? 'none' : 'auto',
            },
          },
        }}
      />
      {error && errorMessage && (
        <Box className="form-field__error-message">
          {errorMessage}
        </Box>
      )}
    </Box>
  );
};

export default TextField;
