import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Edit, View } from '@carbon/icons-react';
import ToggleSwitch from 'commonApp/ToggleSwitch';
import CustomTooltip from 'commonApp/CustomTooltip';

interface ActionRendererProps {
  params: any;
  onEditUser: (userId: number) => void;
  onViewPermissions: (userId: number) => void;
  onToggleStatus: (userId: number, currentStatus: boolean) => void;
  togglingUsers: Set<number>;
  getIsDrawerOpen: () => boolean;
}

/**
 * Vertical Divider Component
 * Reusable divider component for action buttons
 */
const VerticalDivider: React.FC = () => (
  <Box sx={{
    width: '1px',
    height: '16px',
    backgroundColor: '#e0e0e0'
  }} />
);

/**
 * Action Icon Button Component
 * Reusable icon button component for action buttons
 */
interface ActionIconButtonProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  shouldDisable: boolean;
}

const ActionIconButton: React.FC<ActionIconButtonProps> = ({ title, icon, onClick, shouldDisable }) => {
  const iconButtonStyles = {
    width: '28px',
    height: '20px',
    padding: 0,
    backgroundColor: 'rgba(255,255,255,0)',
    border: 'none',
    borderRadius: '4px',
    color: '#5B6061',
    cursor: shouldDisable ? 'not-allowed' : 'pointer',
    pointerEvents: shouldDisable ? 'none' : 'auto',
    opacity: shouldDisable ? 0.5 : 1,
    '&:hover:not(.Mui-disabled)': {
      backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
    },
    '&:focus:not(.Mui-disabled)': {
      backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
    },
    '&.Mui-disabled:hover': {
      backgroundColor: 'transparent !important',
    },
    // Remove ripple effects
    '& .MuiTouchRipple-root': {
      display: 'none',
    },
  };

  return (
    <CustomTooltip title={title} placement="bottom">
      <span>
        <IconButton
          size="small"
          disabled={shouldDisable}
          onClick={onClick}
          disableRipple
          disableFocusRipple
          sx={iconButtonStyles}
        >
          {icon}
        </IconButton>
      </span>
    </CustomTooltip>
  );
};

/**
 * Action Renderer Component
 * Displays Edit, View, and Toggle Switch actions for each user row
 */
const ActionRenderer: React.FC<ActionRendererProps> = ({
  params,
  onEditUser,
  onViewPermissions,
  onToggleStatus,
  togglingUsers,
  getIsDrawerOpen
}) => {
  const user = params.data;
  
  // Check drawer state using the getter function
  const isDrawerOpen = getIsDrawerOpen();
  
  console.log('ActionRenderer called for user:', user.id, 'isenabled:', user.isenabled, 'status:', user.status, 'drawerOpen:', isDrawerOpen);
  
  // Disable Edit & View icons when responsibilities have been transferred (transferedby is set) or user is inactive
  const isTransferred = !!(user.transferedby && user.transferedby.trim() !== '');
  const isInactive = !user.isenabled;
  const shouldDisable = isTransferred || isInactive || isDrawerOpen;
  
  const getEditTitle = (): string => {
    if (!shouldDisable) return "Edit user";
    return isInactive ? "Cannot edit inactive user" : "Cannot edit transferred user";
  };

  const getViewTitle = (): string => {
    if (!shouldDisable) return "View permission";
    return isInactive ? "Cannot view inactive user" : "Cannot view transferred user";
  };
  
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: '6.5px',
      padding: '0',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      margin: '0 auto'
    }}>
      {/* Edit Icon */}
      <ActionIconButton
        title={getEditTitle()}
        icon={<Edit size={16} color={shouldDisable ? '#9E9E9E' : '#5B6061'} />}
        onClick={() => {
          if (!shouldDisable) {
            onEditUser(user.id);
          }
        }}
        shouldDisable={shouldDisable}
      />
      
      {/* Vertical divider between Edit and View Permission */}
      <VerticalDivider />
      
      {/* View Permission Icon */}
      <ActionIconButton
        title={getViewTitle()}
        icon={<View size={16} color={shouldDisable ? '#9E9E9E' : '#5B6061'} />}
        onClick={() => {
          if (!shouldDisable) {
            onViewPermissions(user.id);
          }
        }}
        shouldDisable={shouldDisable}
      />
      
      {/* Vertical divider between View Permission and Toggle */}
      <VerticalDivider />
      
      {/* Toggle Switch */}
      <Box
        sx={{
          pointerEvents: isDrawerOpen ? 'none' : 'auto',
          // When drawer is open, apply custom styling to show inactive appearance
          // Keep the toggle position (on/off) but use light gray colors
          ...(isDrawerOpen && {
            '& .toggle-switch': {
              cursor: 'default !important', // Normal cursor instead of pointer when drawer is open
              '& .switch': {
                border: '1px solid rgba(224, 224, 224, 1) !important', // Light gray border
                backgroundColor: 'rgba(255, 255, 255, 1) !important', // White background
                '&.on, &.off': {
                  border: '1px solid rgba(224, 224, 224, 1) !important', // Light gray border for both states
                }
              },
              // Apply light gray color to circle but keep position based on actual state
              '& .switch.on .circle': {
                // Keep the "on" position (left: 17px from CSS), just change color
                backgroundColor: 'rgba(210, 228, 253, 1) !important', // Light blue/gray circle
              },
              '& .switch.off .circle': {
                // Keep the "off" position (left: 1px from CSS), just change color
                backgroundColor: 'rgba(210, 228, 253, 1) !important', // Light blue/gray circle
              }
            }
          })
        }}
      >
        <ToggleSwitch
          isOn={user.isenabled}
          handleToggle={() => {
            // Handler checks drawer state and prevents action
            if (!isDrawerOpen) {
              console.log('=== TOGGLE SWITCH CLICKED ===');
              console.log('User ID:', user.id);
              console.log('Current isenabled:', user.isenabled);
              console.log('Current status:', user.status);
              console.log('New isenabled will be:', !user.isenabled);
              console.log('New status will be:', !user.isenabled ? 'Active' : 'Inactive');
              console.log('================================');
              onToggleStatus(Number(user.id), user.isenabled);
            }
          }}
          disabled={togglingUsers.has(Number(user.id)) || isDrawerOpen}
          showPointerOnDisabled={true}
        />
      </Box>
    </Box>
  );
};

/**
 * Factory function to create action renderer with handlers
 */
export const createActionRenderer = (
  onEditUser: (userId: number) => void,
  onViewPermissions: (userId: number) => void,
  onToggleStatus: (userId: number, currentStatus: boolean) => void,
  togglingUsers: Set<number>,
  getIsDrawerOpen: () => boolean
) => {
  return (params: any) => (
    <ActionRenderer
      params={params}
      onEditUser={onEditUser}
      onViewPermissions={onViewPermissions}
      onToggleStatus={onToggleStatus}
      togglingUsers={togglingUsers}
      getIsDrawerOpen={getIsDrawerOpen}
    />
  );
};

export default ActionRenderer;

