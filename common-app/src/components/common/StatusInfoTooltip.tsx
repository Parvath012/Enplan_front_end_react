import React, { useRef } from 'react';
import { Tooltip, Box, Typography } from '@mui/material';
import { Information } from '@carbon/icons-react';
import { formatStatusTimestamp } from '../../utils/timeUtils';
import './StatusInfoTooltip.scss';

interface StatusInfoTooltipProps {
  transfereddate?: string | null;
  transferedto?: string | null;
  rowIndex?: number;
  totalRows?: number;
  children: React.ReactElement;
}

/**
 * StatusInfoTooltip Component
 * Displays status information tooltip for inactive users
 * Shows timestamp and transfer information
 */
const StatusInfoTooltip: React.FC<StatusInfoTooltipProps> = ({
  transfereddate,
  transferedto,
  rowIndex = 0,
  totalRows = 0,
  children
}) => {
  // Format timestamp
  const formattedTimestamp = formatStatusTimestamp(transfereddate ?? undefined);
  
  // Determine transfer text
  const transferText = transferedto && transferedto.trim() !== '' 
    ? transferedto 
    : 'Not Yet Assigned';
  
  // Truncate text to fixed number of characters (similar to name column)
  // Set to 20 to ensure "Not Yet Assigned" (18 chars) displays fully
  const maxChars = 20;
  const shouldTruncate = transferText.length > maxChars;
  const displayedText = shouldTruncate 
    ? transferText.substring(0, maxChars) + '...' 
    : transferText;
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [spikeTop, setSpikeTop] = React.useState<number | null>(null);
  const positionAdjustedRef = useRef<boolean>(false);
  const adjustmentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const anchorRef = useRef<HTMLElement | null>(null);
  
  // Check if this is one of the last 3 rows
  const isLastThreeRows = totalRows > 0 && rowIndex >= totalRows - 3;
  
  // Helper function to find footer element
  const findFooterElement = (): HTMLElement | null => {
    let footer: HTMLElement | null = document.querySelector('footer');
    if (footer) return footer;
    
    const textSelectors = ['Total Users', 'Active Users', 'Inactive Users'];
    for (const text of textSelectors) {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent?.includes(text)
      );
      for (const el of elements) {
        let parent = el.parentElement;
        let depth = 0;
        while (parent && parent !== document.body && depth < 5) {
          const styles = window.getComputedStyle(parent);
          const rect = parent.getBoundingClientRect();
          if ((styles.borderTopWidth !== '0px' || styles.backgroundColor !== 'rgba(0, 0, 0, 0)') &&
              rect.top > window.innerHeight * 0.7) {
            return parent;
          }
          parent = parent.parentElement;
          depth++;
        }
      }
    }
    
    return document.querySelector('[class*="footer"]') as HTMLElement ||
           document.querySelector('[id*="footer"]') as HTMLElement ||
           document.querySelector('[class*="Footer"]') as HTMLElement;
  };

  // Helper function to extract Y value from transform
  const extractTransformY = (transform: string): number => {
    if (!transform || transform === 'none') return 0;
    
    const matrixRegex = /matrix\(([^)]+)\)|matrix3d\(([^)]+)\)/;
    const matrixMatch = matrixRegex.exec(transform);
    if (matrixMatch) {
      const matrixValue = matrixMatch[1] || matrixMatch[2];
      if (matrixValue) {
        const values = matrixValue.split(',').map(parseFloat);
        return values[5] || values[13] || 0;
      }
    }
    return 0;
  };

  // Helper function to calculate and set spike position
  const calculateAndSetSpike = (
    tooltipElement: HTMLElement,
    anchorRect: DOMRect,
    tooltipRect: DOMRect,
    tooltipHeight: number
  ): void => {
    const anchorCenterY = anchorRect.top + anchorRect.height / 2;
    const calculatedSpikeTop = anchorCenterY - tooltipRect.top;
    const minSpikeTop = 8;
    const maxSpikeTop = tooltipHeight - 8;
    const clampedSpikeTop = Math.max(minSpikeTop, Math.min(maxSpikeTop, calculatedSpikeTop));
    tooltipElement.style.setProperty('--spike-top', `${clampedSpikeTop}px`);
    setSpikeTop(clampedSpikeTop);
  };

  // Helper function to apply transform adjustment
  const applyTransformAdjustment = (
    popperElement: HTMLElement,
    adjustmentY: number
  ): void => {
    const computedStyle = window.getComputedStyle(popperElement);
    const currentTransform = computedStyle.transform;
    const currentY = extractTransformY(currentTransform);
    const newY = currentY + adjustmentY;
    popperElement.style.transform = `translate3d(0, ${newY}px, 0)`;
    popperElement.style.transition = 'transform 0.15s ease-out';
  };

  // Helper function to handle positioning above
  interface PositionAboveParams {
    tooltipElement: HTMLElement;
    popperElement: HTMLElement;
    anchorRect: DOMRect;
    tooltipRect: DOMRect;
    tooltipHeight: number;
    headerBottom: number;
    headerMargin: number;
    isLastRow: boolean;
  }

  const handlePositionAbove = (params: PositionAboveParams): void => {
    const {
      tooltipElement,
      popperElement,
      anchorRect,
      tooltipRect,
      tooltipHeight,
      headerBottom,
      headerMargin,
      isLastRow
    } = params;

    let desiredTop: number;
    
    if (isLastRow) {
      const desiredBottom = anchorRect.bottom - 2;
      desiredTop = desiredBottom - tooltipHeight;
    } else {
      desiredTop = anchorRect.top - tooltipHeight - 8;
    }
    
    const currentTop = tooltipRect.top;
    let adjustmentY = desiredTop - currentTop;
    
    if (desiredTop < (headerBottom + headerMargin)) {
      adjustmentY = (anchorRect.top - headerBottom - headerMargin) - currentTop;
    }
    
    if (isLastRow) {
      const tooltipBottomAfterAdjust = currentTop + adjustmentY + tooltipHeight;
      if (tooltipBottomAfterAdjust > anchorRect.bottom) {
        adjustmentY = (anchorRect.bottom - tooltipHeight) - currentTop;
      }
    }
    
    if (Math.abs(adjustmentY) > 1) {
      applyTransformAdjustment(popperElement, adjustmentY);
      
      const recalculateSpike = () => {
        const updatedTooltipRect = tooltipElement.getBoundingClientRect();
        const updatedTooltipHeight = updatedTooltipRect.height || tooltipHeight;
        
        let currentAnchorElement = anchorRef.current;
        if (!currentAnchorElement) {
          const tooltipId = tooltipElement.closest('[role="tooltip"]')?.id;
          if (tooltipId) {
            currentAnchorElement = document.querySelector(`[aria-describedby="${tooltipId}"]`) as HTMLElement;
          }
        }
        
        if (currentAnchorElement) {
          const freshAnchorRect = currentAnchorElement.getBoundingClientRect();
          const anchorCenterY = freshAnchorRect.top + freshAnchorRect.height / 2;
          const spikePositionFromTop = anchorCenterY - updatedTooltipRect.top;
          
          const minSpikeTop = 8;
          const maxSpikeTop = updatedTooltipHeight - 8;
          const clampedSpikeTop = Math.max(minSpikeTop, Math.min(maxSpikeTop, spikePositionFromTop));
          tooltipElement.style.setProperty('--spike-top', `${clampedSpikeTop}px`);
          setSpikeTop(clampedSpikeTop);
        }
      };
      
      setTimeout(recalculateSpike, 100);
      setTimeout(recalculateSpike, 200);
    } else {
      calculateAndSetSpike(tooltipElement, anchorRect, tooltipRect, tooltipHeight);
    }
  };

  // Helper function to handle right-side positioning
  interface RightSidePositionParams {
    tooltipElement: HTMLElement;
    popperElement: HTMLElement;
    anchorRect: DOMRect;
    tooltipRect: DOMRect;
    tooltipHeight: number;
    tooltipBottom: number;
    footerTop: number;
    footerMargin: number;
  }

  const handleRightSidePosition = (params: RightSidePositionParams): void => {
    const {
      tooltipElement,
      popperElement,
      anchorRect,
      tooltipRect,
      tooltipHeight,
      tooltipBottom,
      footerTop,
      footerMargin
    } = params;

    calculateAndSetSpike(tooltipElement, anchorRect, tooltipRect, tooltipHeight);
    
    if (tooltipBottom > (footerTop - footerMargin)) {
      const excess = tooltipBottom - (footerTop - footerMargin);
      applyTransformAdjustment(popperElement, -excess);
    }
  };

  // Single function to handle all positioning - prevents flickering
  const adjustTooltipPosition = React.useCallback(() => {
    if (!tooltipRef.current || !anchorRef.current || positionAdjustedRef.current) return;
    
    const tooltipElement = tooltipRef.current;
    const anchorElement = anchorRef.current;
    const popperElement = tooltipElement.closest('[role="tooltip"]') as HTMLElement;
    
    if (!popperElement) return;
    
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const anchorRect = anchorElement.getBoundingClientRect();
    const tooltipHeight = tooltipRect.height;
    
    if (tooltipHeight === 0 || anchorRect.height === 0) return;
    
    const footer = findFooterElement();
    const footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight;
    const footerMargin = 15;
    
    const tableHeader = document.querySelector('.ag-header') as HTMLElement;
    const headerBottom = tableHeader ? tableHeader.getBoundingClientRect().bottom : 0;
    const headerMargin = 10;
    
    const tooltipBottom = tooltipRect.bottom;
    const wouldOverlapFooter = tooltipBottom > (footerTop - footerMargin);
    const shouldPositionAbove = isLastThreeRows || wouldOverlapFooter;
    const isLastRow = totalRows > 0 && rowIndex === totalRows - 1;
    
    if (shouldPositionAbove) {
      handlePositionAbove({
        tooltipElement,
        popperElement,
        anchorRect,
        tooltipRect,
        tooltipHeight,
        headerBottom,
        headerMargin,
        isLastRow
      });
    } else {
      handleRightSidePosition({
        tooltipElement,
        popperElement,
        anchorRect,
        tooltipRect,
        tooltipHeight,
        tooltipBottom,
        footerTop,
        footerMargin
      });
    }
    
    positionAdjustedRef.current = true;
  }, [isLastThreeRows, rowIndex, totalRows]);
  
  // Custom tooltip content
  const tooltipContent = (
    <Box 
      ref={tooltipRef}
      className="status-info-tooltip"
      sx={{
        '--spike-top': spikeTop !== null ? `${spikeTop}px` : '22px', // CSS variable for spike position
        '&::before': {
          left: '-8px',
          top: 'var(--spike-top, 22px)', // Use CSS variable, fallback to 22px
          transform: 'translateY(-50%)', // Center the spike vertically on the calculated point
        }
      }}
    >
      {/* Header */}
      <Box className="status-info-tooltip__header">
        <Information size={20} style={{ flexShrink: 0, color: '#5B6061' }} />
        <Typography className="status-info-tooltip__title">Status Info</Typography>
      </Box>
      
      {/* Divider */}
      <Box className="status-info-tooltip__divider" />
      
      {/* Content */}
      <Box className="status-info-tooltip__content">
        <Box className="status-info-tooltip__row">
          <Typography className="status-info-tooltip__label">Timestamp:</Typography>
          <Typography className="status-info-tooltip__value">{formattedTimestamp || 'N/A'}</Typography>
        </Box>
        <Box className="status-info-tooltip__row">
          <Typography className="status-info-tooltip__label">Responsibility Transferred To:</Typography>
          <Typography className="status-info-tooltip__value" title={shouldTruncate ? transferText : undefined}>
            {displayedText}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
  
  return (
    <Tooltip
      title={tooltipContent}
      placement="right"
      arrow={false}
      enterDelay={300}
      leaveDelay={0}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: 'transparent',
            padding: 0,
            margin: 0,
            boxShadow: 'none',
            maxWidth: 'none',
          }
        },
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: (data: any) => {
                  // For last 3 rows, position tooltip above with initial offset
                  if (isLastThreeRows && data.elements?.popper && data.elements?.reference) {
                    const tooltipElement = data.elements.popper;
                    const anchorElement = data.elements.reference;
                    const tooltipHeight = tooltipElement.getBoundingClientRect().height || 100;
                    const anchorRect = anchorElement.getBoundingClientRect();
                    
                    // Check if this is the last row
                    const isLastRow = totalRows > 0 && rowIndex === totalRows - 1;
                    
                    if (isLastRow) {
                      // For last row: position so tooltip bottom aligns with row bottom
                      // Offset = -(tooltipHeight - anchorHeight) to align bottoms
                      return [8, -(tooltipHeight - anchorRect.height - 2)];
                    } else {
                      // For other rows in last 3: position above anchor
                      return [8, -(tooltipHeight + anchorRect.height + 8)];
                    }
                  }
                  return [8, 0];
                },
              },
            },
            {
              name: 'computeStyles',
              options: {
                gpuAcceleration: false,
                adaptive: false,
              },
            },
            {
              name: 'flip',
              enabled: false, // Disable flipping to maintain consistent positioning
            },
            {
              name: 'preventOverflow',
              enabled: true,
            },
          ],
        },
      }}
      onOpen={() => {
        // Reset position adjustment flag
        positionAdjustedRef.current = false;
        
        // Clear any existing timeout
        if (adjustmentTimeoutRef.current) {
          clearTimeout(adjustmentTimeoutRef.current);
        }
        
        // Single, delayed position adjustment to prevent flickering
        // Increased delay to ensure initial offset modifier has applied
        adjustmentTimeoutRef.current = setTimeout(() => {
          adjustTooltipPosition();
        }, 250);
      }}
      onClose={() => {
        // Reset flags when tooltip closes
        positionAdjustedRef.current = false;
        if (adjustmentTimeoutRef.current) {
          clearTimeout(adjustmentTimeoutRef.current);
        }
      }}
      >
      {React.cloneElement(children as React.ReactElement<any>, {
        ...(children as any).props,
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
          anchorRef.current = e.currentTarget;
          if ((children as any).props?.onMouseEnter) {
            (children as any).props.onMouseEnter(e);
          }
        },
        ref: (node: HTMLElement | null) => {
          anchorRef.current = node;
          const childRef = (children as any).ref;
          if (typeof childRef === 'function') {
            childRef(node);
          } else if (childRef && typeof childRef === 'object' && 'current' in childRef) {
            (childRef as React.RefObject<HTMLElement | null>).current = node;
          }
        },
      })}
    </Tooltip>
  );
};

export default StatusInfoTooltip;

