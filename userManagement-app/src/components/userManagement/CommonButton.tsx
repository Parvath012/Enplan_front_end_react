import React from 'react';
import { Box } from '@mui/material';

interface CommonButtonProps {
  width?: string;
  height?: string;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  borderRadius?: string;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const CommonButton: React.FC<CommonButtonProps> = ({
  width = '113px',
  height = '22px',
  backgroundColor = 'rgba(0, 111, 230, 1)',
  hoverBackgroundColor = 'rgba(0, 81, 171, 1)',
  borderRadius = '4px',
  onClick,
  children,
  disabled = false
}) => {
  // If disabled and a custom backgroundColor was explicitly provided (not the default),
  // use the custom color. Otherwise, use the standard disabled gray.
  const defaultBg = 'rgba(0, 111, 230, 1)';
  const isCustomBg = backgroundColor !== defaultBg;
  const actualBackgroundColor = disabled && !isCustomBg ? '#ccc' : backgroundColor;
  const actualHoverBackgroundColor = disabled && !isCustomBg ? '#ccc' : hoverBackgroundColor;
  
  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: actualBackgroundColor,
        borderRadius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        '&:hover': {
          backgroundColor: actualHoverBackgroundColor
        }
      }}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </Box>
  );
};

export default CommonButton;
