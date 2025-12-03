import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Close } from '@carbon/icons-react';
import CustomTooltip from 'commonApp/CustomTooltip';

// Custom Slider Component Styles
const HEADER_STYLES = {
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  backgroundColor: '#fff',
  boxShadow: '0 0px 2px rgba(0,0,0,0.05)',
  width: '100%',
  minHeight: '50px',
  flexShrink: 0,
  borderBottom: '1px solid #e0e0e0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const CONTAINER_STYLES = {
  position: 'fixed',
  right: '0px',
  top: '0px',
  width: '420px',
  height: '100vh',
  background: '#fff',
  backgroundColor: '#fff',
  boxSizing: 'border-box',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(242, 242, 240, 1)',
  borderTop: '0px',
  borderRadius: '0px',
  borderTopLeftRadius: '0px',
  borderTopRightRadius: '0px',
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 1300,
  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const CONTENT_STYLES = {
  flex: 1,
  position: 'relative',
  backgroundColor: '#fff',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#c1c1c1',
    borderRadius: '4px',
    '&:hover': {
      background: '#a8a8a8',
    },
  },
};

const FOOTER_STYLES = {
  position: 'sticky',
  bottom: 0,
  zIndex: 1000,
  backgroundColor: '#fff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  width: '100%',
  flexShrink: 0,
  borderTop: '1px solid #e0e0e0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px', // Match header padding to align with title
  gap: '12px',
  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
interface CustomSliderProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  footerContent?: React.ReactNode;
}

const CustomSlider: React.FC<CustomSliderProps> = ({ open, onClose, title, children, footerContent }) => {
  // Animation: slide in from right
  const [visible, setVisible] = React.useState(open);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open) {
      setVisible(true);
    } else {
      // Remove after slider closes (match transition duration)
      timer = setTimeout(() => {
        setVisible(false);
      }, 600); // match transition duration
    }
    return () => clearTimeout(timer);
  }, [open]);

  if (!visible) return null;

  return (
    <>
      {/* Blurred overlay - appears immediately with slider */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1299,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      />
      <Box
        sx={{
          ...CONTAINER_STYLES,
          right: open ? '0px' : '-420px',
          transition: 'right 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box sx={HEADER_STYLES}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 650,
              fontStyle: 'normal',
              fontSize: '14px',
              color: '#4A4E52',
              textAlign: 'left',
              margin: 0
            }}
          >
            {title}
          </Typography>
          <CustomTooltip title="Close" placement="bottom" arrow={false} followCursor={true}>
            <IconButton aria-label="Close" onClick={onClose} sx={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              color: '#6c757d',
              backgroundColor: 'transparent',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              '&:hover': {
                color: '#495057',
                backgroundColor: '#f0f0f0',
              },
            }}>
              <Close size={22} />
            </IconButton>
          </CustomTooltip>
        </Box>
        <Box sx={CONTENT_STYLES}>{children}</Box>
        {footerContent && (
          <Box sx={FOOTER_STYLES}>{footerContent}</Box>
        )}
      </Box>
    </>
  );
};

export default CustomSlider;
