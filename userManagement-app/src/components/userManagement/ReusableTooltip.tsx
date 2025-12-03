import React from 'react';
import { Tooltip, TooltipProps, styled } from '@mui/material';

// Styled component for reusable tooltip
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
    margin: 0,
    transform: 'translate(-15px, 0) !important',
  },
}));

interface ReusableTooltipProps {
  title: string;
  placement?: TooltipProps['placement'];
  children: React.ReactElement;
  arrow?: boolean;
  followCursor?: boolean;
  enterDelay?: number;
  leaveDelay?: number;
  disabled?: boolean;
}

const ReusableTooltip: React.FC<ReusableTooltipProps> = ({
  title,
  placement = 'top',
  children,
  arrow = false,
  followCursor = false,
  enterDelay = 500,
  leaveDelay = 0,
  disabled = false,
}) => {
  if (disabled) {
    return children;
  }

  return (
    <StyledTooltip 
      title={title} 
      placement={placement} 
      arrow={arrow}
      followCursor={followCursor}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 8], // [x, y] - offset from the element
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

export default ReusableTooltip;

