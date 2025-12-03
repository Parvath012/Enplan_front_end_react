import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Common styles for icon containers in ProcessGroupBox
 */
export const iconContainerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginRight: '8px',
  padding: '1px 2px',
  borderRadius: '4px',
  transition: 'background-color 0.2s ease',
  cursor: 'default',
  '&:hover': { backgroundColor: '#f0f0f0' }
};

/**
 * Common styles for statistics rows
 */
export const statRowStyles = {
  display: 'flex',
  marginBottom: '6px',
  alignItems: 'center',
};

export const statRowStylesLast = {
  display: 'flex',
  alignItems: 'center',
};

export const statLabelStyles = {
  fontSize: '11px',
  color: '#5a5a5a',
  fontWeight: 600,
  whiteSpace: 'nowrap' as const,
  marginRight: '6px',
};

export const statValueStyles = {
  fontSize: '11px',
  color: '#262626',
};

export const statTimeContainerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginLeft: 'auto',
};

export const statTimeStyles = {
  fontSize: '11px',
  color: '#8a8a8a',
  minWidth: '35px',
  textAlign: 'right' as const,
};

/**
 * Renders a divider pipe between icons
 */
export const IconDivider: React.FC = () => (
  <Box sx={{ color: '#d0d0d0', marginRight: '8px' }}>|</Box>
);

/**
 * Renders an icon with count in a consistent container
 */
export const IconWithCount: React.FC<{
  icon: React.ReactNode;
  count: number;
  title: string;
  includeDivider?: boolean;
}> = ({ icon, count, title, includeDivider = true }) => (
  <>
    <Box sx={iconContainerStyles} title={title}>
      {icon}
      <span>{count}</span>
    </Box>
    {includeDivider && <IconDivider />}
  </>
);

/**
 * Renders a statistics row with label, value, and time
 */
export const StatRow: React.FC<{
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
  highlighted?: boolean;
}> = ({ label, value, isLast = false, highlighted = false }) => (
  <Box
    sx={{
      ...(isLast ? statRowStylesLast : statRowStyles),
      ...(highlighted ? {
        backgroundColor: 'rgba(232, 241, 254, 1)',
        padding: '3px 6px',
        marginLeft: '-6px',
        marginRight: '-6px',
      } : {}),
    }}
  >
    <Typography sx={statLabelStyles}>
      {label}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Typography sx={statValueStyles}>
        {value}
      </Typography>
    </Box>
    <Box sx={statTimeContainerStyles}>
      <Box sx={{ color: '#d0d0d0', fontSize: '11px' }}>|</Box>
      <Typography sx={statTimeStyles}>
        0 min
      </Typography>
    </Box>
  </Box>
);

