import React from 'react';
import { Box, IconButton, SxProps, Theme } from '@mui/material';
import CustomTooltip from 'commonApp/CustomTooltip';
import { ResetAlt, Replicate } from '@carbon/icons-react';
import { getButtonStyles } from '../userManagement/PermissionTableConstants';
import CommonButton from '../userManagement/CommonButton';
import CommonTextSpan from '../userManagement/CommonTextSpan';

/**
 * Custom Sort Icon Component - shared across permission tables
 */
export const CustomSortIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#1f1f1f' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={`${size}px`}
    viewBox="0 -960 960 960"
    width={`${size}px`}
    fill={color}
  >
    <path d="m80-280 150-400h86l150 400h-82l-34-96H196l-32 96H80Zm140-164h104l-48-150h-6l-50 150Zm328 164v-76l202-252H556v-72h282v76L638-352h202v72H548ZM360-760l120-120 120 120H360ZM480-80 360-200h240L480-80Z"/>
  </svg>
);

/**
 * Reusable disabled IconButton - shared across permission tables
 */
export const DisabledIconButton: React.FC<{
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isReadOnly?: boolean;
}> = ({ title, icon, onClick, isReadOnly = false }) => (
  <CustomTooltip title={title} placement="bottom" arrow={false}>
    <span>
      <IconButton
        disabled={isReadOnly}
        onClick={onClick}
        sx={{
          ...getButtonStyles(),
          color: '#bdbdbd',
          padding: '4px',
          '&:disabled': {
            color: '#bdbdbd'
          }
        }}
      >
        {icon}
      </IconButton>
    </span>
  </CustomTooltip>
);

/**
 * Shared empty cell styles - used for empty/placeholder cells in permission tables
 */
export const getEmptyCellStyles = (): SxProps<Theme> => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#ffffff'
});

/**
 * Empty cell component - shared across permission tables
 */
export const EmptyCell: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box sx={getEmptyCellStyles()}>
    {children}
  </Box>
);

/**
 * Get reset button styles
 */
export const getResetButtonStyles = (hasPermissionChanges: boolean) => ({
  width: '28px',
  height: '28px',
  color: hasPermissionChanges ? '#6c757d' : '#ccc',
  padding: '4px',
  cursor: hasPermissionChanges ? 'pointer' : 'not-allowed',
  '&:hover': {
    color: hasPermissionChanges ? '#495057' : '#ccc',
    backgroundColor: hasPermissionChanges ? 'rgba(242, 242, 240, 1)' : 'transparent'
  },
  '&:disabled': {
    color: '#ccc',
    cursor: 'not-allowed'
  }
});

/**
 * Reset button component
 */
export const ResetButton: React.FC<{
  hasPermissionChanges: boolean;
  onReset: () => void;
  isReadOnly?: boolean;
}> = ({ hasPermissionChanges, onReset, isReadOnly = false }) => {
  if (isReadOnly) {
    return (
      <DisabledIconButton 
        title="Reset" 
        icon={<ResetAlt size={16} />} 
        isReadOnly={true}
      />
    );
  }

  return (
    <CustomTooltip title="Reset" placement="bottom" arrow={false}>
      <span>
        <IconButton
          disabled={!hasPermissionChanges}
          onClick={onReset}
          sx={getResetButtonStyles(hasPermissionChanges)}
        >
          <ResetAlt size={16} />
        </IconButton>
      </span>
    </CustomTooltip>
  );
};

/**
 * Duplicate button component
 */
export const DuplicateButton: React.FC<{
  isReadOnly?: boolean;
  onDuplicateClick?: () => void;
}> = ({ isReadOnly = false, onDuplicateClick }) => {
  return (
    <CommonButton
      disabled={isReadOnly}
      backgroundColor={isReadOnly ? '#E3F2FD' : 'rgba(0, 111, 230, 1)'}
      hoverBackgroundColor={isReadOnly ? '#E3F2FD' : 'rgba(0, 81, 171, 1)'}
      onClick={() => {
        if (onDuplicateClick) {
          onDuplicateClick();
        } else {
          console.log('Duplicate permissions - handler not provided');
        }
      }}
    >
      <Replicate color='white' size={16} style={{ marginRight: '6px' }} />
      <CommonTextSpan color='white'>
        Duplicate
      </CommonTextSpan>
    </CommonButton>
  );
};

