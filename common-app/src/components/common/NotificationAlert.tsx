import React from 'react';
import { Snackbar, Paper, Box, Typography, IconButton, Button } from '@mui/material';
import { Close, CheckmarkFilled, WarningAltFilled } from '@carbon/icons-react';

export type NotificationAction = {
  label: string;
  onClick: () => void;
  emphasis?: 'primary' | 'secondary';
};

type NotificationVariant = 'success' | 'warning' | 'error' | 'info';

interface NotificationAlertProps {
  open: boolean;
  variant: NotificationVariant;
  title?: string;
  message: string;
  onClose: () => void;
  actions?: NotificationAction[];
  /**
   * Auto-dismiss in ms. Defaults to 3000ms (3 seconds) for success, undefined for warnings with actions
   */
  autoHideDuration?: number;
}

/**
 * A reusable notification component that can display:
 * - Success alerts (auto-dismissible)
 * - Warning dialogs (with action buttons)
 * - Error messages
 * - Info messages
 * 
 * Features:
 * - Top-right positioning
 * - Variant-specific styling (colors, icons)
 * - Action buttons for warnings
 * - Auto-dismiss for success alerts
 * - Manual close button
 */
const NotificationAlert: React.FC<NotificationAlertProps> = ({
  open,
  variant,
  title,
  message,
  onClose,
  actions = [],
  autoHideDuration,
}) => {
  const paletteByVariant: Record<NotificationVariant, { 
    stripe: string; 
    bg: string; 
    icon: string; 
    defaultTitle: string;
    iconComponent: React.ReactNode;
  }> = {
    success: { 
      stripe: '#2E7D32', 
      bg: '#F3FFF5', 
      icon: '#2E7D32', 
      defaultTitle: 'Success',
      iconComponent: <CheckmarkFilled size={18} color="currentColor" />
    },
    warning: { 
      stripe: '#F6A500', 
      bg: '#FFFCF7', 
      icon: '#F6A500', 
      defaultTitle: 'Warning – Action Required',
      iconComponent: <WarningAltFilled size={18} color="currentColor" />
    },
    error: { 
      stripe: '#D32F2F', 
      bg: '#FFF5F5', 
      icon: '#D32F2F', 
      defaultTitle: 'Error',
      iconComponent: <WarningAltFilled size={18} color="currentColor" />
    },
    info: { 
      stripe: '#1976D2', 
      bg: '#F5F9FF', 
      icon: '#1976D2', 
      defaultTitle: 'Information',
      iconComponent: <WarningAltFilled size={18} color="currentColor" />
    },
  };

  const palette = paletteByVariant[variant];
  const resolvedTitle = title ?? palette.defaultTitle;
  
  // Auto-hide duration logic
  const getAutoHideDuration = () => {
    if (autoHideDuration !== undefined) return autoHideDuration;
    if (variant === 'success') return 3000; // Default 3 seconds for success
    if (actions.length > 0) return undefined; // No auto-hide for warnings with actions
    return 5000; // Default 5 seconds for other variants
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      onClose={onClose}
      autoHideDuration={getAutoHideDuration()}
      sx={{ zIndex: 9999 }}
    >
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          bgcolor: palette.bg,
          borderLeft: `4px solid ${palette.stripe}`,
          minWidth: 320,
          maxWidth: 420,
          px: 2,
          py: 1.5,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ mt: '2px', color: palette.icon, lineHeight: 0 }}>
            {palette.iconComponent}
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#3C4043', fontSize: '12.5px', flex: 1 }}>
            {resolvedTitle}
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Close" sx={{ color: '#666' }}>
            <Close size={16} />
          </IconButton>
        </Box>

        {/* Body */}
        <Typography sx={{ color: '#5F6368', fontSize: '12px', mt: 0.5, mb: 1 }}>
          {message}
        </Typography>

        {/* Actions */}
        {actions.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {actions.map((action, idx) => (
              <Button
                key={`${action.label}-${idx}`}
                onClick={action.onClick}
                variant="text"
                size="small"
                sx={{
                  p: 0,
                  minWidth: 0,
                  fontSize: '12px',
                  fontWeight: action.emphasis === 'primary' ? 700 : 500,
                  textTransform: 'none',
                  color: action.emphasis === 'primary' ? palette.icon : '#3C4043',
                  '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Paper>
    </Snackbar>
  );
};

export default NotificationAlert;
