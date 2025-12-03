import React, { useState, useImperativeHandle } from 'react';
import { Box, Typography } from '@mui/material';

interface SaveConfirmationMessageProps {
  message: string;
  autoHideDuration?: number;
  onHide: () => void;
  onShow?: () => void;
}

const SaveConfirmationMessage = React.forwardRef<
  HTMLDivElement,
  SaveConfirmationMessageProps
>(({ message, autoHideDuration = 8000, onHide, onShow }, ref) => {
  const [displayState, setDisplayState] = useState(false);

  const show = () => {
    setDisplayState(true);
    if (onShow) {
      onShow();
    }
    const timer = setTimeout(() => {
      setDisplayState(false);
      setTimeout(onHide, 300); // Wait for fade out animation
    }, autoHideDuration);

    return () => clearTimeout(timer);
  };

  const hide = () => {
    setDisplayState(false);
  };

  // Expose methods via ref using useImperativeHandle
  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));

  if (!displayState) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        opacity: displayState ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        visibility: displayState ? 'visible' : 'hidden',
        pointerEvents: 'none'
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 300,
          fontStyle: 'italic',
          fontSize: '12px',
          color: '#5B6061',
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}
      >
        {message}
      </Typography>
    </Box>
  );
});

SaveConfirmationMessage.displayName = 'SaveConfirmationMessage';

export default SaveConfirmationMessage;
