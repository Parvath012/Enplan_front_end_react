import React from 'react';

// Import CustomTooltip from common-app with fallback
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip').catch(err => {
  console.error('Failed to load CustomTooltip from common-app:', err);
  return { 
    default: ({ children, title }: any) => <div title={title}>{children}</div>
  };
}));

interface TruncatedTextWithTooltipProps {
  text: string;
  children?: any;
  className?: string;
  style?: any;
}

// Component to conditionally show tooltip only when text is truncated
const TruncatedTextWithTooltip: React.FC<TruncatedTextWithTooltipProps> = React.memo(({ text, children, className, style }) => {
  const textRef = React.useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        // Check if text is truncated by comparing scrollWidth to clientWidth
        // Add a small threshold (1px) to account for rounding differences
        const isOverflowed = textRef.current.scrollWidth > textRef.current.clientWidth + 1;
        setIsTruncated(isOverflowed);
      }
    };

    // Initial check
    checkTruncation();
    
    // Multiple delayed checks to account for rendering and layout
    const timeoutId1 = setTimeout(checkTruncation, 50);
    const timeoutId2 = setTimeout(checkTruncation, 100);
    const timeoutId3 = setTimeout(checkTruncation, 200);
    
    // Check on resize
    window.addEventListener('resize', checkTruncation);
    
    // Use ResizeObserver for more accurate detection (set up after mount)
    let resizeObserver: ResizeObserver | null = null;
    let observerTimeoutId: NodeJS.Timeout | null = null;
    
    const setupObserver = () => {
      if (textRef.current && window.ResizeObserver && !resizeObserver) {
        resizeObserver = new ResizeObserver(checkTruncation);
        resizeObserver.observe(textRef.current);
      }
    };
    
    // Set up observer after a brief delay to ensure element is mounted
    observerTimeoutId = setTimeout(setupObserver, 50);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      if (observerTimeoutId) {
        clearTimeout(observerTimeoutId);
      }
      window.removeEventListener('resize', checkTruncation);
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    };
  }, [text, children]);

  const textElement = React.createElement('div', {
    ref: textRef,
    className,
    style,
    tabIndex: isTruncated ? 0 : -1, // Make focusable when truncated for keyboard access
    role: isTruncated ? 'button' : undefined,
    'aria-label': isTruncated ? text : undefined
  }, children);

  // Always show tooltip if text is truncated (on hover or focus)
  if (isTruncated) {
    return React.createElement(React.Suspense, {
      key: 'tooltip-suspense',
      fallback: textElement
    }, React.createElement(CustomTooltip, {
      title: text,
      placement: 'top',
      arrow: false,
      followCursor: false,
      enterDelay: 300,
      leaveDelay: 0
    }, textElement));
  }

  return textElement;
});

TruncatedTextWithTooltip.displayName = 'TruncatedTextWithTooltip';

export default TruncatedTextWithTooltip;

