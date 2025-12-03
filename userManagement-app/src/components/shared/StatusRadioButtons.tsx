import React from 'react';
import { Box, Typography, RadioGroup, FormControlLabel } from '@mui/material';
import CustomRadio from 'commonApp/CustomRadio';

interface StatusRadioButtonsProps {
  value: 'Active' | 'Inactive';
  onChange?: (value: 'Active' | 'Inactive') => void;
  disabled?: boolean;
  labelColor?: string;
}

const StatusRadioButtons: React.FC<StatusRadioButtonsProps> = ({
  value,
  onChange,
  disabled = false,
  labelColor = '#5F6368'
}) => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      justifyContent: 'flex-start'
    }}>
      <Typography sx={{
        fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontWeight: 500,
        fontStyle: 'normal',
        fontSize: '12px',
        color: '#5F6368',
        marginBottom: '8px',
        display: 'block'
      }}>
        Status
      </Typography>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        height: '30px',
        marginTop: 0,
        width: '100%',
        position: 'relative'
      }}>
        <RadioGroup
          row
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value as 'Active' | 'Inactive') : undefined}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            margin: 0,
            width: '100%',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <FormControlLabel
            value="Active"
            control={<CustomRadio />}
            label="Active"
            disabled={disabled}
            sx={{
              margin: 0,
              marginRight: 0,
              position: 'absolute',
              left: 0,
              '& .MuiFormControlLabel-label': {
                fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
                fontWeight: 400,
                fontSize: '12px',
                color: labelColor,
                marginLeft: '8px'
              }
            }}
          />
          <FormControlLabel
            value="Inactive"
            control={<CustomRadio />}
            label="Inactive"
            disabled={disabled}
            sx={{
              margin: 0,
              marginRight: 0,
              position: 'absolute',
              left: '50%',
              '& .MuiFormControlLabel-label': {
                fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
                fontWeight: 400,
                fontSize: '12px',
                color: labelColor,
                marginLeft: '8px'
              }
            }}
          />
        </RadioGroup>
      </Box>
    </Box>
  );
};

export default StatusRadioButtons;



