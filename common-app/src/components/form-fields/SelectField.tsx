import React, { useState } from 'react';
import { Box, FormControl, Select, MenuItem, SelectChangeEvent, ListItemText } from '@mui/material';
import { ChevronDown } from '@carbon/icons-react';
import './styles.scss';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  errorMessage?: string;
  width?: string | number;
  onOpen?: () => void;
  onClose?: () => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = '',
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'small',
  error = false,
  errorMessage,
  width = '100%',
  onOpen,
  onClose,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ width, position: 'relative' }} className={required ? 'form-field form-field--required' : 'form-field'}>
      <label className="form-field__label">{label}</label>
      <FormControl
        variant="outlined"
        fullWidth={fullWidth}
        size={size}
        disabled={disabled}
        error={error}
        required={required}
        sx={{
          position: 'relative',
          '& .MuiSelect-icon': {
            display: 'none', // Hide default MUI dropdown icon
          },
          // Prevent flex stretch from affecting FormControl height in flex layouts
          // This ensures icon positioning works correctly in all contexts
          alignSelf: 'flex-start',
        }}
      >
        <Select
          value={value}
          style={{ color: '#5F6368', fontWeight: 400 }}
          onChange={(e: SelectChangeEvent<string>) => onChange(e.target.value)}
          onOpen={() => {
            setOpen(true);
            if (onOpen) onOpen();
          }}
          onClose={() => {
            setOpen(false);
            if (onClose) onClose();
          }}
          className={required ? 'required-select form-field__select' : 'form-field__select'}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return (
                <span  className="form-field__placeholder">
                  {placeholder}
                </span>
              );
            }
            return selected;
          }}
          required={required}
          MenuProps={{
            PaperProps: {
              className: 'form-field__menu-paper',
              sx: {
                mt: 0.5,
                maxHeight: 60 * 3.5,
                color: '#5F6368',
                fontWeight: 400
              },
            },
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option} className="form-field__menu-item">
              <ListItemText
                primary={option}
                slotProps={{
                  primary: {
                    fontFamily: `'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'`,
                    fontWeight: 400,
                     color: '#5F6368',
                    fontStyle: 'normal',
                    fontSize: '12px',
                  },
                }}
              />
            </MenuItem>
          ))}
        </Select>
        {/* Custom dropdown icon - positioned relative to FormControl */}
        <Box
          className="form-field__dropdown-icon"
          data-open={open}
          sx={{
            position: 'absolute',
            top: '50%',
            right: '8px',
            transform: `translateY(-50%) ${open ? 'rotate(180deg)' : 'rotate(0deg)'}`,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            transition: 'transform 0.2s ease',
            zIndex: 1,
          }}
        >
          <ChevronDown size={16} style={{ color: '#666' }} />
        </Box>

        {error && errorMessage && (
          <Box className="form-field__error-message">
            {errorMessage}
          </Box>
        )}
      </FormControl>
    </Box>
  );
};

export default SelectField;
