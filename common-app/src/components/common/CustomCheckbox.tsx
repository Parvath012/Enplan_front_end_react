import React from 'react';
import { Box, Checkbox, CheckboxProps, FormControlLabel, FormControlLabelProps } from '@mui/material';

interface CustomCheckboxProps extends Omit<CheckboxProps, 'checkedIcon' | 'icon'> {
  label?: string;
  labelProps?: Omit<FormControlLabelProps, 'control' | 'label'>;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  label,
  labelProps,
  ...checkboxProps
}) => {
  const checkbox = (
    <Checkbox
      disableRipple={true}
      {...checkboxProps}
      sx={{
        transition: 'none',
        padding: "0",
        '& .MuiSvgIcon-root': { transition: 'none' },
        '&.Mui-checked': { transform: 'none' },
        "&:hover .custom-checkbox-icon.unchecked": {
          border: "1px solid #90caf9", // light blue only when unchecked
        },
        ...checkboxProps.sx
      }}
      icon={
        <Box
          className="custom-checkbox-icon unchecked"
          sx={{
            width: "18px",
            height: "18px",
            borderRadius: "4px",
            border: "1px solid #6c757d",
            backgroundColor: "#fff",
            display: "inline-block",
            boxSizing: "border-box",
          }}
        />
      }
      checkedIcon={
        <Box
          className="custom-checkbox-icon checked"
          sx={{
            width: "18px",
            height: "18px",
            borderRadius: "4px",
            border: "1px solid #0051ab",
            backgroundColor: "#0051ab",
            display: "inline-block",
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{
              position: "absolute",
              top: "2px",
              left: "2px",
              width: "14px",
              height: "14px",
              fill: "none",
              stroke: "#fff",
              strokeWidth: 3,
            }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </Box>
      }
    />
  );

  if (label) {
    return (
      <FormControlLabel
        control={checkbox}
        label={label}
        sx={{
          m: 0,
          '& .MuiFormControlLabel-label': {
            color: '#5F6368',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            marginLeft: '8px', // Add space between checkbox and label
          },
          '& .MuiCheckbox-root': {
            transition: 'none',
            padding: '9px',
          },
          '& .MuiButtonBase-root': { transform: 'none' },
          transition: 'none',
          ...labelProps?.sx
        }}
        {...labelProps}
      />
    );
  }

  return checkbox;
};

export default CustomCheckbox;
