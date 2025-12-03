import React from 'react';
import { Box, Typography } from '@mui/material';

type HeaderBarProps = {
  title: string;
  onSearch?: () => void;
  onToggleFilters?: () => void;
  RightAction?: React.ReactNode;
};

const HeaderBar: React.FC<HeaderBarProps> = ({ title, onSearch, onToggleFilters, RightAction }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      height: '40px',
      background: 'inherit',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxSizing: 'border-box',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(242, 242, 240, 1)',
      px: 1.5,
      position: 'sticky',
      top: 0,
      zIndex: 5
    }}>
      <Typography 
        component="h1" 
        sx={{
          fontFamily: "'Inter-Regular_SemiBold', 'Inter SemiBold', 'Inter', sans-serif",
          fontWeight: 650,
          fontStyle: 'normal',
          fontSize: '14px',
          color: '#3C4043',
          textAlign: 'left'
        }}>
        {title}
      </Typography>

      <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, alignItems: 'center' }}>
        {RightAction}
      </Box>
    </Box>
  );
};

export default HeaderBar;
