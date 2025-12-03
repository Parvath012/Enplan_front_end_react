import React, { Suspense } from 'react';
import { Box, IconButton } from '@mui/material';
import { Add, Subtract, Reset } from '@carbon/icons-react';
// Module Federation imports
const CustomTooltip = React.lazy(() => import('../common/CustomTooltip'));

interface ZoomControlsProps {
  zoomIndex: number;
  zoomSteps: readonly number[];
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomIndex,
  zoomSteps,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) => {
  return (
    <Box sx={{
      position: 'absolute',
      right: 16,
      bottom: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 2,
      width: '31px',
      height: '110px',
      background: 'inherit',
      backgroundColor: 'rgba(242, 242, 240, 1)',
      boxSizing: 'border-box',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgba(240, 239, 239, 1)',
      borderRadius: '20.5px',
      padding: '8px 4px',
      justifyContent: 'space-between'
    }}>
      <Suspense fallback={<div></div>}>
        <CustomTooltip title="Zoom In" placement="bottom">
          <IconButton
            size="small"
            onClick={onZoomIn}
            disabled={zoomIndex >= zoomSteps.length - 1}
            sx={{ 
              borderRadius: '8px',
              width: '28px',
              height: '28px',
              minWidth: '28px',
              minHeight: '28px',
              '&:hover': {
                backgroundColor: '#fff'
              },
              '&:disabled': {
                backgroundColor: 'rgba(240, 240, 240, 1)',
                color: 'rgba(176, 176, 176, 1)'
              }
            }}
          >
            <Add size={24} />
          </IconButton>
        </CustomTooltip>
      </Suspense>
      
      <Box 
        sx={{
          backgroundColor: 'transparent',
          borderRadius: '4px',
          px: 0.5,
          py: 0.25,
          fontFamily: "'ArialMT', 'Arial', sans-serif",
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '10px',
          letterSpacing: 'normal',
          color: '#333333',
          textAlign: 'center',
          margin: '2px 0',
          lineHeight: 1.2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            width: '28px',
            height: '28px'
          }
        }}
        onClick={onZoomReset}
      >
        <Suspense fallback={<div></div>}>
          <CustomTooltip title="Reset Zoom" placement="bottom">
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              '&:hover .zoom-text': {
                display: 'none'
              },
              '&:hover .reset-icon': {
                display: 'flex'
              }
            }}>
              <Box className="zoom-text" sx={{ display: 'flex' }}>
                {Math.round(zoomSteps[zoomIndex] * 100)}%
              </Box>
              <Box className="reset-icon" sx={{ display: 'none', alignItems: 'center', justifyContent: 'center' }}>
                <Reset size={14} />
              </Box>
            </Box>
          </CustomTooltip>
        </Suspense>
      </Box>
      
      <Suspense fallback={<div>Loading...</div>}>
        <CustomTooltip title="Zoom Out" placement="bottom">
          <IconButton
            size="small"
            onClick={onZoomOut}
            disabled={zoomIndex <= 0}
            sx={{ 
              borderRadius: '8px',
              width: '28px',
              height: '28px',
              minWidth: '28px',
              minHeight: '28px',
              '&:hover': {
                backgroundColor: '#fff'
              },
              '&:disabled': {
                backgroundColor: 'rgba(240, 240, 240, 1)',
                color: 'rgba(176, 176, 176, 1)'
              }
            }}
          >
            <Subtract size={24} />
          </IconButton>
        </CustomTooltip>
      </Suspense>
    </Box>
  );
};

export default ZoomControls;

