// Mock for commonApp/Footer
import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC<any> = ({ 
  label = 'Footer', 
  count = 0, 
  height = '46px',
  backgroundColor,
  borderColor,
  textColor,
  fontSize,
  fontWeight,
  fontFamily,
  paddingLeft,
  zIndex,
  ...props 
}) => {
  return (
    <Box
      data-testid="footer"
      sx={{
        position: 'relative',
        width: '100%',
        height,
        backgroundColor,
        borderColor,
        color: textColor,
        fontSize,
        fontWeight,
        fontFamily,
        paddingLeft,
        zIndex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...props.sx
      }}
    >
          <Typography
            sx={{
              color: textColor,
              fontSize,
              fontWeight,
              fontFamily,
              ...props.typographySx
            }}
          >
            {label}: {count}
          </Typography>
    </Box>
  );
};

export default Footer;
