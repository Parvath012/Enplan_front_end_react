import React from 'react';
import { Tooltip, TooltipProps, styled } from '@mui/material';

// Styled component for custom tooltip
const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: 'white',
    color: '#333',
    fontSize: 12,
    border: '1px solid #000',
    borderRadius: 4,
    padding: '6px 10px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    fontWeight: 500,
    margin: 0, // Remove default margins
    transform: 'translate(-15px, 0) !important', // Position tooltip completely to the right of cursor
  },
  // Arrow styling removed
}));

interface CustomTooltipProps {
  title: string;
  placement?: TooltipProps['placement'];
  children: React.ReactElement;
  arrow?: boolean;
  followCursor?: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  title,
  placement = 'right', // Position tooltip directly to the right of cursor
  children,
  arrow = false, // Default to false to remove arrow
  followCursor = true, // Default to follow cursor
}) => {
  return (
    <StyledTooltip 
      title={title} 
      placement={placement} 
      arrow={arrow}
      followCursor={followCursor}
      enterDelay={1000} // 1 second delay before showing tooltip
      leaveDelay={0}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [40, 0], // [x, y] - moves tooltip 40px right, aligned vertically with cursor
              },
            },
          ],
        },
      }}
    >
      {children}
    </StyledTooltip>
  );
};

export default CustomTooltip;
