import React from 'react';
import { Box } from '@mui/material';

interface TabButtonProps {
  label: string;
  value: number;
  activeTab: number;
  onClick: (value: number) => void;
}

/**
 * Reusable tab button component for UserViewPanel
 */
const TabButton: React.FC<TabButtonProps> = ({ label, value, activeTab, onClick }) => {
  return (
    <Box
      onClick={() => onClick(value)}
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
        fontWeight: 400,
        fontSize: '12px',
        color: activeTab === value ? 'rgb(208, 240, 255)' : '#818586',
        backgroundColor: activeTab === value ? '#1565c0' : 'transparent',
        borderRadius: activeTab === value ? '4px' : '0px',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: activeTab === value ? '#1565c0' : 'rgba(217, 216, 215, 0.3)',
        }
      }}
    >
      {label}
    </Box>
  );
};

export default TabButton;

