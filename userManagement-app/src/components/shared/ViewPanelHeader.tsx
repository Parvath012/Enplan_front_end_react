import React from 'react';
import { Box, Typography } from '@mui/material';
import { Close } from '@carbon/icons-react';

interface ViewPanelHeaderProps {
  title?: string;
  onClose: () => void;
  tabs?: Array<{ label: string; value: number }>;
  activeTab?: number;
  onTabChange?: (event: React.SyntheticEvent, newValue: number) => void;
  TabButtonComponent?: React.ComponentType<{
    label: string;
    value: number;
    activeTab: number;
    onClick: (value: number) => void;
  }>;
}

const ViewPanelHeader: React.FC<ViewPanelHeaderProps> = ({
  title = 'Details',
  onClose,
  tabs,
  activeTab,
  onTabChange,
  TabButtonComponent
}) => {
  return (
    <Box sx={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      width: '100%',
      height: '50px',
      minHeight: '50px',
      flexShrink: 0,
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Typography sx={{
          fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontWeight: 650,
          fontSize: '14px',
          color: '#4A4E52',
          margin: 0,
        }}>
          {title}
        </Typography>
        {tabs && TabButtonComponent && activeTab !== undefined && onTabChange && (
          <Box sx={{
            ml: 2,
            width: '161px',
            height: '30px',
            backgroundColor: 'rgba(240, 239, 239, 1)',
            border: '1px solid rgba(217, 216, 215, 1)',
            borderRadius: '4px',
            boxSizing: 'border-box',
            display: 'flex',
            overflow: 'hidden',
            padding: '1px'
          }}>
            {tabs.map((tab) => (
              <TabButtonComponent
                key={tab.value}
                label={tab.label}
                value={tab.value}
                activeTab={activeTab}
                onClick={(value) => onTabChange({} as React.SyntheticEvent, value)}
              />
            ))}
          </Box>
        )}
      </Box>
      <Box
        onClick={onClose}
        sx={{
          cursor: 'pointer',
          padding: '4px',
          color: '#5F6368',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
          }
        }}
      >
        <Close size={20} />
      </Box>
    </Box>
  );
};

export default ViewPanelHeader;



