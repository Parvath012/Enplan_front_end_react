import React from 'react';
import { Box, Typography } from '@mui/material';

interface EntityStructureFooterProps {
  totalCount: number;
  zoomPercentage?: number;
}

const EntityStructureFooter: React.FC<EntityStructureFooterProps> = ({ totalCount, zoomPercentage = 100 }) => {
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
      <Box> Total Entity: {totalCount} </Box>

      {/* Legend on the right side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ fontSize: '12px', color: '#5B6061', fontWeight: 400 }}>Rollup Entity:</Typography>
          <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#006fe6' }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, }}>
          <Typography sx={{ fontSize: '12px', color: '#5B6061', fontWeight: 400 }}>Planning Entity:</Typography>
          <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#5d2370' }} />
        </Box>
      </Box>
    </Box>
  );
};

export default EntityStructureFooter;


