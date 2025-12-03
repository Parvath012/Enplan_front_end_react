import React from 'react';
import { Box } from '@mui/material';

interface UserHierarchyFooterProps {
  totalCount?: number;
  zoomPercentage?: number;
}

const UserHierarchyFooter: React.FC<UserHierarchyFooterProps> = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '46px',
        background: 'inherit',
        backgroundColor: 'rgba(247, 247, 246, 1)',
        boxSizing: 'border-box',
        borderWidth: '1px 0 0 0',
        borderStyle: 'solid',
        borderColor: 'rgba(240, 239, 239, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
        fontWeight: 400,
        fontSize: '12px',
        color: '#5B6061'
      }}
    >
    </Box>
  );
};

export default UserHierarchyFooter;

