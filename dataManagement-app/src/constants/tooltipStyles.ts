import { SxProps, Theme } from '@mui/material';

/**
 * Common tooltip configuration for consistent styling across the application
 */
export const TOOLTIP_CONFIG = {
  arrow: false,
  enterDelay: 500,
  leaveDelay: 0,
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: 'white',
        color: '#333',
        fontSize: '12px',
        fontFamily: 'Roboto, Arial, sans-serif',
        padding: '6px 10px',
        borderRadius: '4px',
        border: '1px solid #000',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        fontWeight: 500,
      } as SxProps<Theme>,
    },
    popper: {
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    },
  },
};

/**
 * Common container styles for layout views
 */
export const LAYOUT_CONTAINER_STYLES = {
  display: 'flex',
  flexDirection: 'column' as const,
  width: '100%',
  overflow: 'hidden' as const,
};

/**
 * Footer container styles
 */
export const FOOTER_CONTAINER_STYLES = {
  flex: '0 0 auto',
};

