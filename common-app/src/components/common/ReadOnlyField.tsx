import React from 'react';
import { Box, Typography } from '@mui/material';
import './ReadOnlyField.scss';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  width?: string;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  width = '219px'
}) => {
  return (
    <Box className="read-only-field" sx={{ width }}>
      <Typography 
        variant="body2" 
        className="read-only-field__label"
      >
        {label}
      </Typography>
      <Typography 
        variant="body1" 
        className="read-only-field__value"
      >
        {value || '-'}
      </Typography>
    </Box>
  );
};

export default ReadOnlyField;
