import React from 'react';
import { Box, Typography } from '@mui/material';
import { Close } from '@carbon/icons-react';
// Module Federation imports
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip'));
import { entityConfigurationStyles } from '../styles';

interface NavigationBarProps {
  tabValue: number;
  isRollupEntity: boolean;
  progress: number;
  onClose: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  tabValue,
  isRollupEntity,
  progress,
  onClose
}) => {
  return (
    <Box sx={entityConfigurationStyles.navigationBar}>
      {/* Left Side - Tabs */}
      <Box sx={{ ...entityConfigurationStyles.navigationLeft }}>
        <Box sx={{ ...entityConfigurationStyles.tabContainer }}>
          {/* Tab 1 */}
          <Box
            sx={{
              ...entityConfigurationStyles.baseTab,
              ...entityConfigurationStyles.tab1,
              color: tabValue === 0 ? 'rgba(0, 111, 230, 1)' : '#333333',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-5px',
                left: 0,
                width: '100%',
                height: '2px',
                backgroundColor: tabValue === 0 ? 'rgba(0, 111, 230, 1)' : 'transparent',
                transition: 'background-color 0.2s ease',
              },
            }}
          >
            Countries and Currency
          </Box>

          {/* Tab 2 */}
          <Box
            sx={{
              ...entityConfigurationStyles.baseTab,
              ...entityConfigurationStyles.tab,
              color: tabValue === 1 ? 'rgba(0, 111, 230, 1)' : '#333333',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-5px',
                left: 0,
                width: '100%',
                height: '2px',
                backgroundColor: tabValue === 1 ? 'rgba(0, 111, 230, 1)' : 'transparent',
                transition: 'background-color 0.2s ease',
              },
            }}
          >
            Period Setup
          </Box>

          {/* Tab 3 */}
          {!isRollupEntity && (
            <Box
              sx={{
                ...entityConfigurationStyles.baseTab,
                ...entityConfigurationStyles.tab,
                color: tabValue === 2 ? 'rgba(0, 111, 230, 1)' : '#333333',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-5px',
                  left: 0,
                  width: '100%',
                  height: '2px',
                  backgroundColor: tabValue === 2 ? 'rgba(0, 111, 230, 1)' : 'transparent',
                  transition: 'background-color 0.2s ease',
                },
              }}
            >
              Modules
            </Box>
          )}
        </Box>
      </Box>

      {/* Right Side - Progress and Close */}
      <Box sx={{ ...entityConfigurationStyles.navigationRight }}>
        {/* Progress Indicator */}
        <Box sx={entityConfigurationStyles.progressContainer}>
          <Typography sx={entityConfigurationStyles.progressLabel}>Progress</Typography>
          <Box sx={entityConfigurationStyles.progressBar}>
            <Box
              sx={{
                ...entityConfigurationStyles.progressFill,
                width: `${progress}%`,
              }}
            />
          </Box>
          <Typography sx={entityConfigurationStyles.progressPercentage}>
            {progress % 1 === 0 ? progress.toFixed(0) : progress.toFixed(1)}%
          </Typography>
        </Box>

        {/* Close Button */}
        <CustomTooltip title="Close">
          <Box
            sx={entityConfigurationStyles.closeButton}
            onClick={onClose}
          >
            <Close size={24} />
          </Box>
        </CustomTooltip>
      </Box>
    </Box>
  );
};

export default NavigationBar;
