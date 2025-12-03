import React from 'react';
import { Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@carbon/icons-react';

// Import CustomTooltip from common-app with fallback
const CustomTooltip = React.lazy(() => import('commonApp/CustomTooltip').catch(err => {
  console.error('Failed to load CustomTooltip from common-app:', err);
  return { 
    default: ({ children, title }: any) => <div title={title}>{children}</div>
  };
}));

interface BrowserHeaderProps {
  title: string;
  onClose: () => void;
  className?: string;
  closeButtonClassName?: string;
}

const BrowserHeader: React.FC<BrowserHeaderProps> = ({ title, onClose, className, closeButtonClassName }) => {
  return (
    <div className={className ?? 'browser__header'}>
      <Typography 
        variant="h6" 
        className="browser__title"
      >
        {title}
      </Typography>
      <React.Suspense fallback={
        <IconButton 
          onClick={onClose}
          className={closeButtonClassName ?? 'browser__close-button'}
          size="small"
          aria-label="Close"
          disableRipple
        >
          <CloseIcon size={22} />
        </IconButton>
      }>
        <CustomTooltip title="Close" placement="bottom" arrow={false} followCursor={true}>
          <IconButton 
            onClick={onClose}
            className={closeButtonClassName ?? 'browser__close-button'}
            aria-label="Close"
            disableRipple
          >
            <CloseIcon size={22} />
          </IconButton>
        </CustomTooltip>
      </React.Suspense>
    </div>
  );
};

export default BrowserHeader;

