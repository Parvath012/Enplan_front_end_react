import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Edit, View, TrashCan } from '@carbon/icons-react';
import ToggleSwitch from 'commonApp/ToggleSwitch';
import CustomTooltip from 'commonApp/CustomTooltip';

interface RoleActionRendererProps {
  params: any;
  onEditRole: (roleId: number) => void;
  onViewPermissions: (roleId: number) => void;
  onDeleteRole: (roleId: number) => void;
  onToggleStatus: (roleId: number, currentStatus: boolean) => void;
  togglingRoles: Set<number>;
  getIsPanelOpen: () => boolean;
  getSelectedRoleId: () => number | null;
}

/**
 * Action Renderer Component for Roles
 * Displays Edit, View Permissions, Delete, and Toggle Switch actions for each role row
 */
const RoleActionRenderer: React.FC<RoleActionRendererProps> = ({
  params,
  onEditRole,
  onViewPermissions,
  onDeleteRole,
  onToggleStatus,
  togglingRoles,
  getIsPanelOpen,
  getSelectedRoleId,
}) => {
  const role = params.data;
  
  // Helper function to normalize isLocked value
  const normalizeIsLocked = (roleData: any): boolean => {
    const isLockedValue = roleData.islocked ?? roleData.isLocked ?? roleData.IsLocked ?? false;
    if (isLockedValue === true) return true;
    if (isLockedValue === 'true' || isLockedValue === 'True' || isLockedValue === 'TRUE') return true;
    return String(isLockedValue).toLowerCase() === 'true';
  };
  
  // Check panel state using the getter functions
  const isPanelOpen = getIsPanelOpen();
  const selectedRoleId = getSelectedRoleId();
  
  // Check if this is the selected role with panel open
  const roleId = typeof role.id === 'string' ? parseInt(role.id, 10) : Number(role.id);
  const isSelectedRoleWithPanelOpen = isPanelOpen && selectedRoleId !== null && roleId === selectedRoleId;
  
  // Check if role is locked (islocked is true - means role is assigned to users)
  const isLocked = normalizeIsLocked(role);
  const isInactive = !role.isenabled || role.status === 'Inactive';
  // Disable actions if inactive OR if panel is open for this role
  const shouldDisableActions = isInactive || isSelectedRoleWithPanelOpen;
  // Delete is disabled if: role is inactive OR role is locked (assigned to users) OR panel is open for this role
  const shouldDisableDelete = isLocked || isInactive || isSelectedRoleWithPanelOpen;
  
  const getEditTitle = (): string => {
    if (isSelectedRoleWithPanelOpen) return "Cannot edit role while viewing";
    if (!shouldDisableActions) return "Edit role";
    return "Cannot edit inactive role";
  };

  const getViewTitle = (): string => {
    if (isSelectedRoleWithPanelOpen) return "Cannot view role while panel is open";
    if (!shouldDisableActions) return "View permission";
    return "Cannot view inactive role";
  };

  const getDeleteTitle = (): string => {
    if (isSelectedRoleWithPanelOpen) return "Cannot delete role while viewing";
    if (isLocked) return "Cannot delete locked role";
    if (isInactive) return "Cannot delete inactive role";
    return "Delete role";
  };

  // Helper function to get common icon button styles
  const getIconButtonStyles = (isDisabled: boolean) => ({
    width: '28px',
    height: '20px',
    padding: 0,
    backgroundColor: 'rgba(255,255,255,0)',
    border: 'none',
    borderRadius: '4px',
    color: '#5B6061',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    pointerEvents: isDisabled ? 'none' : 'auto',
    opacity: isDisabled ? 0.5 : 1,
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
  });

  // Helper function to handle edit click
  const handleEditClick = () => {
    if (!shouldDisableActions) {
      onEditRole(role.id);
    }
  };

  // Helper function to handle view click
  const handleViewClick = () => {
    if (!shouldDisableActions) {
      onViewPermissions(role.id);
    }
  };

  // Helper function to handle delete click
  const handleDeleteClick = () => {
    if (!shouldDisableDelete) {
      onDeleteRole(role.id);
    }
  };

  // Helper function to handle toggle click
  const handleToggleClick = () => {
    if (!isSelectedRoleWithPanelOpen) {
      onToggleStatus(Number(role.id), role.isenabled);
    }
  };

  // Helper function to get toggle switch styles
  const getToggleSwitchStyles = () => {
    const baseStyles = {
      opacity: isInactive ? 0.7 : 1,
      pointerEvents: isSelectedRoleWithPanelOpen ? 'none' : 'auto',
    };

    if (!isSelectedRoleWithPanelOpen) {
      return baseStyles;
    }

    return {
      ...baseStyles,
      '& .toggle-switch': {
        cursor: 'default !important',
        '& .switch': {
          border: '1px solid rgba(224, 224, 224, 1) !important',
          backgroundColor: 'rgba(255, 255, 255, 1) !important',
          '&.on, &.off': {
            border: '1px solid rgba(224, 224, 224, 1) !important',
          }
        },
        '& .switch.on .circle': {
          backgroundColor: 'rgba(210, 228, 253, 1) !important',
        },
        '& .switch.off .circle': {
          backgroundColor: 'rgba(210, 228, 253, 1) !important',
        }
      }
    };
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
      <CustomTooltip title={getEditTitle()} placement="bottom">
        <span>
          <IconButton
            size="small"
            disabled={shouldDisableActions}
            onClick={handleEditClick}
            disableRipple
            disableFocusRipple
            sx={getIconButtonStyles(shouldDisableActions)}
          >
            <Edit size={16} color={shouldDisableActions ? '#9E9E9E' : '#5B6061'} />
          </IconButton>
        </span>
      </CustomTooltip>
      
      {/* Vertical divider between Edit and View Permission */}
      <Box sx={{
        width: '1px',
        height: '16px',
        backgroundColor: '#e0e0e0'
      }} />
      
      {/* View Permission Icon */}
      <CustomTooltip title={getViewTitle()} placement="bottom">
        <span>
          <IconButton
            size="small"
            disabled={shouldDisableActions}
            onClick={handleViewClick}
            disableRipple
            disableFocusRipple
            sx={getIconButtonStyles(shouldDisableActions)}
          >
            <View size={16} color={shouldDisableActions ? '#9E9E9E' : '#5B6061'} />
          </IconButton>
        </span>
      </CustomTooltip>
      
      {/* Vertical divider between View Permission and Delete */}
      <Box sx={{
        width: '1px',
        height: '16px',
        backgroundColor: '#e0e0e0'
      }} />
      
      {/* Delete Icon */}
      <CustomTooltip title={getDeleteTitle()} placement="bottom">
        <span>
          <IconButton
            size="small"
            disabled={shouldDisableDelete}
            onClick={handleDeleteClick}
            disableRipple
            disableFocusRipple
            sx={getIconButtonStyles(shouldDisableDelete)}
          >
            <TrashCan size={16} color={shouldDisableDelete ? '#9E9E9E' : '#5B6061'} />
          </IconButton>
        </span>
      </CustomTooltip>
      
      {/* Vertical divider between Delete and Toggle */}
      <Box sx={{
        width: '1px',
        height: '16px',
        backgroundColor: '#e0e0e0'
      }} />
      
      {/* Toggle Switch - Always clickable, but visually greyed when inactive or panel is open */}
      <Box sx={getToggleSwitchStyles()}>
        <ToggleSwitch
          isOn={role.isenabled}
          handleToggle={handleToggleClick}
          disabled={togglingRoles.has(Number(role.id)) || isSelectedRoleWithPanelOpen}
          showPointerOnDisabled={true}
        />
      </Box>
    </Box>
  );
};

/**
 * Factory function to create action renderer with handlers
 */
export const createRoleActionRenderer = (
  onEditRole: (roleId: number) => void,
  onViewPermissions: (roleId: number) => void,
  onDeleteRole: (roleId: number) => void,
  onToggleStatus: (roleId: number, currentStatus: boolean) => void,
  togglingRoles: Set<number>,
  getIsPanelOpen: () => boolean,
  getSelectedRoleId: () => number | null
) => {
  return (params: any) => (
    <RoleActionRenderer
      params={params}
      onEditRole={onEditRole}
      onViewPermissions={onViewPermissions}
      onDeleteRole={onDeleteRole}
      onToggleStatus={onToggleStatus}
      togglingRoles={togglingRoles}
      getIsPanelOpen={getIsPanelOpen}
      getSelectedRoleId={getSelectedRoleId}
    />
  );
};

export default RoleActionRenderer;

