import React from 'react';
import { Box } from '@mui/material';

interface TabPanelProps {
  readonly children?: React.ReactNode;
  readonly index: number;
  readonly value: number;
}

/**
 * Tab Panel Component
 * Displays content for a specific tab when it's active
 */
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      style={{
        display: value === index ? 'flex' : 'none',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden'
      }}
      {...other}
    >
      {/* Always render children to keep components mounted - prevents remounting on tab switch */}
      {/* Use visibility and pointer-events to hide while keeping mounted */}
      <Box sx={{
        display: value === index ? 'flex' : 'none',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        pointerEvents: value === index ? 'auto' : 'none'
      }}>
        {children}
      </Box>
    </div>
  );
};

export default TabPanel;

