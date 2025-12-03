import React from 'react';
import { Box } from '@mui/material';

interface FormFieldLabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

const FormFieldLabel: React.FC<FormFieldLabelProps> = ({ htmlFor, children }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '8px' }}>
      <label htmlFor={htmlFor} style={{
        fontSize: '12px',
        fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#5F6368',
        fontWeight: 500,
      }}>
        {children}
      </label>
    </Box>
  );
};

export default FormFieldLabel;

