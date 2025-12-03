import React from 'react';
import { Box, Typography } from '@mui/material';

interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  marginBottom?: number;
}

const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  marginBottom = 0
}) => {
  return (
    <Box sx={{ gap: 1.5, mb: marginBottom }}>
      {title && (
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{
            mb: 1.5,
            fontWeight: 650,
            color: '#4A4E52',
            fontSize: '14px',
            fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
};

export default FormSection;