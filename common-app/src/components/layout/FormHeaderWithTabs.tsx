import React from 'react';
import { Box } from '@mui/material';
import FormHeaderBase from './FormHeaderBase';
import { FormHeaderWithTabsProps } from '../../types/FormHeaderTypes';

const FormHeaderWithTabs: React.FC<FormHeaderWithTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  ...props
}) => {
  const tabsElement = (
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
        <Box
          key={tab.value}
          onClick={() => onTabChange({} as React.SyntheticEvent, tab.value)}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'default',
            fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
            fontWeight: 400,
            fontSize: '12px',
            color: activeTab === tab.value ? 'rgb(208, 240, 255)' : '#818586',
            backgroundColor: activeTab === tab.value ? '#1565c0' : 'transparent',
            borderRadius: activeTab === tab.value ? '4px' : '0px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: activeTab === tab.value ? '#1565c0' : 'rgba(217, 216, 215, 0.3)',
            }
          }}
        >
          {tab.label}
        </Box>
      ))}
    </Box>
  );

  return <FormHeaderBase {...props}>{tabsElement}</FormHeaderBase>;
};

export default FormHeaderWithTabs;
