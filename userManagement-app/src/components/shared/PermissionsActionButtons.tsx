import React from 'react';
import { Box, IconButton } from '@mui/material';
import CustomTooltip from 'commonApp/CustomTooltip';
import { Search, Filter, Replicate, ResetAlt } from '@carbon/icons-react';
import CommonButton from '../userManagement/CommonButton';
import CommonTextSpan from '../userManagement/CommonTextSpan';
import { getFlexContainerStyles, getDividerStyles } from '../userManagement/PermissionTableConstants';

interface PermissionsActionButtonsProps {
  isReadOnly?: boolean;
  hasPermissionChanges?: boolean;
  onReset?: () => void;
  onDuplicate?: () => void;
  showSortButton?: boolean;
  SortIcon?: React.ComponentType<{ size?: number; color?: string }>;
}

// Reusable disabled IconButton component
const DisabledIconButton: React.FC<{
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
          width: '28px',
          height: '28px',
          padding: '4px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#bdbdbd',
          '&:hover': {
            backgroundColor: 'transparent',
            cursor: 'default'
          },
          '&:disabled': {
            color: '#bdbdbd',
            cursor: 'default'
          }
        }}
      >
        {icon}
      </IconButton>
    </span>
  </CustomTooltip>
);

const PermissionsActionButtons: React.FC<PermissionsActionButtonsProps> = ({
  isReadOnly = false,
  hasPermissionChanges = false,
  onReset,
  onDuplicate,
  showSortButton = false,
  SortIcon
}) => {
  return (
    <Box 
      className="permissions-action-buttons"
      sx={{ 
        display: 'flex', 
        gap: '4px', 
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        alignSelf: 'flex-end',
        '@media (max-width: 768px)': {
          flexDirection: 'column',
          gap: '2px'
        }
      }}
    >
      <Box sx={getFlexContainerStyles()}>
        {/* Search Button - Disabled */}
        <DisabledIconButton title="Search" icon={<Search size={16} />} isReadOnly={isReadOnly} />
        
        {/* Filter Button - Disabled */}
        <DisabledIconButton title="Filter" icon={<Filter size={16} />} isReadOnly={isReadOnly} />
        
        {/* Sort Button - Disabled (optional) */}
        {showSortButton && SortIcon && (
          <DisabledIconButton title="Sort" icon={<SortIcon size={16} color="#bdbdbd" />} isReadOnly={isReadOnly} />
        )}
      </Box>
      
      {/* Divider Line - Between Search/Filter/Sort and Reset/Duplicate */}
      <Box sx={{
        ...getDividerStyles(),
        alignSelf: 'center'
      }} />
      
      {/* Reset and Duplicate Buttons */}
      <Box sx={getFlexContainerStyles()}>
        {/* Reset Button */}
        {isReadOnly ? (
          <DisabledIconButton 
            title="Reset" 
            icon={<ResetAlt size={16} />} 
            isReadOnly={true}
          />
        ) : (
          <CustomTooltip title="Reset" placement="bottom" arrow={false}>
            <span>
              <IconButton
                disabled={!hasPermissionChanges}
                onClick={onReset}
                sx={{
                  width: '28px',
                  height: '28px',
                  color: hasPermissionChanges ? '#6c757d' : '#ccc',
                  padding: '4px',
                  borderRadius: '4px',
                  cursor: hasPermissionChanges ? 'pointer' : 'not-allowed',
                  '&:hover': {
                    color: hasPermissionChanges ? '#495057' : '#ccc',
                    backgroundColor: hasPermissionChanges ? 'rgba(242, 242, 240, 1)' : 'transparent',
                    borderRadius: '4px'
                  },
                  '&:disabled': {
                    color: '#ccc',
                    cursor: 'not-allowed'
                  }
                }}
              >
                <ResetAlt size={16} />
              </IconButton>
            </span>
          </CustomTooltip>
        )}
        
        {/* Vertical Divider between Reset and Duplicate */}
        <Box sx={getDividerStyles()} />
        
        {/* Duplicate Button - Using CommonButton */}
        <CommonButton
          disabled={isReadOnly}
          backgroundColor={isReadOnly ? '#E3F2FD' : 'rgba(0, 111, 230, 1)'}
          hoverBackgroundColor={isReadOnly ? '#E3F2FD' : 'rgba(0, 81, 171, 1)'}
          onClick={onDuplicate}
        >
          <Replicate color='white' size={16} style={{ marginRight: '6px' }} />
          <CommonTextSpan color='white'>
            Duplicate
          </CommonTextSpan>
        </CommonButton>
      </Box>
    </Box>
  );
};

export default PermissionsActionButtons;



