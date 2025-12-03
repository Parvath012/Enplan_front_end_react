import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
// Module Federation imports
const ToggleSwitch = React.lazy(() => import('commonApp/ToggleSwitch'));
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip'));
import { ModuleCardProps } from '../../types/moduleTypes';

const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  isEditMode,
  onToggle,
  onConfigure,
}) => {
  const handleToggle = () => {
    onToggle(module.id, !module.isEnabled);
  };

  const handleConfigure = () => {
    onConfigure(module.id);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: '1px solid rgba(242, 242, 240, 1)',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        width: '100%',
        minHeight: '104px',
        transition: 'all 0.2s ease-in-out',
        opacity: isEditMode ? 1 : 0.7,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: { xs: 2, sm: 2.5 },
        width: '100%',
        paddingTop: -10,
      }}>
        {/* Toggle Switch - Left side */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: 1,
          flexShrink: 0,
          pt: 0.2,
        }}>          
            <span>
              <ToggleSwitch
                isOn={module.isEnabled}
                handleToggle={handleToggle}
                disabled={!isEditMode}
                showPointerOnDisabled={false}
              />
            </span>
        </Box>

        {/* Module Info - Center */}
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: 'none' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 650,
              fontStyle: 'normal',
              fontSize: '14px',
              color: '#5F6368',
              textAlign: 'left',
              lineHeight: '16px',
              mb: 3,
              textRendering: 'optimizeLegibility',
              fontFeatureSettings: '"kern" 1',
              WebkitFontFeatureSettings: '"kern"',
              MozFontFeatureSettings: '"kern"',
              fontKerning: 'normal',
            }}
          >
            {module.name}
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Inter18pt-Regular', 'Inter 18pt', sans-serif",
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '12px',
              color: '#777B80',
              textAlign: 'left',
              lineHeight: '20px',
              maxWidth: '100%',
            }}
          >
            {module.description}
          </Typography>
        </Box>

        {/* Configure Button - Right side */}
        {module.isEnabled && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-end',
            flexShrink: 0,
            gap: 0.5,
          }}>
            <Button
              variant="contained"
              size="small"
              onClick={isEditMode ? handleConfigure : undefined}
              disabled={!isEditMode}
              sx={{
                fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '14px',
                color: '#D0F0FF',
                lineHeight: '20px',
                textTransform: 'none',
                backgroundColor: isEditMode ? 'rgba(0, 111, 230, 1)' : 'rgba(120, 172, 244, 1)',
                minWidth: 'auto',
                width: '87px',
                height: '28px',
                px: 0,
                py: 0,
                borderRadius: '8px',
                border: 'none',
                boxShadow: 'none',
                cursor: isEditMode ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: isEditMode ? 'rgba(0, 81, 171, 1)' : 'rgba(120, 172, 244, 1)',
                  boxShadow: 'none',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(120, 172, 244, 1)',
                  color: '#D0F0FF',
                  cursor: 'not-allowed',
                },
              }}
            >
              Configure
            </Button>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "'Inter18pt-Regular', 'Inter 18pt', sans-serif",
                fontWeight: 400,
                fontStyle: 'normal',
                fontSize: '12px',
                color: '#777B80',
                textAlign: 'right',
                lineHeight: '20px',
              }}
            >
              Please setup Module for use
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ModuleCard;
