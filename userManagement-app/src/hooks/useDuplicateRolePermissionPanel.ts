import { useMemo } from 'react';
import type { RoleFormData } from '../types/RoleFormData';

interface UseDuplicateRolePermissionPanelProps {
  formData: RoleFormData;
  roles: any[];
  modulesData: any;
  isDuplicatePanelOpen: boolean;
  setIsDuplicatePanelOpen: (open: boolean) => void;
  handleDuplicatePermissions: (duplicatedPermissions: string[], enabledModules?: string[]) => void;
  setNotification: (message: string) => void;
}

/**
 * Custom hook to prepare props for DuplicateRolePermissionPanelWrapper
 * Similar to useDuplicatePermissionPanel but for roles
 */
export const useDuplicateRolePermissionPanel = ({
  formData,
  roles,
  modulesData,
  isDuplicatePanelOpen,
  setIsDuplicatePanelOpen,
  handleDuplicatePermissions,
  setNotification
}: UseDuplicateRolePermissionPanelProps) => {
  // Prepare roles list for duplicate panel
  const duplicatePanelRoles = useMemo(() => {
    return roles
      .filter(role => role.rolename && role.rolename.trim() !== '')
      .map(role => ({
        id: (role.id ?? 0).toString(),
        name: role.rolename || 'Unknown Role',
        description: role.roledescription || ''
      }));
  }, [roles]);

  // Get modules list from modulesData
  const modulesList = useMemo(() => {
    return modulesData ? Object.keys(modulesData) : [];
  }, [modulesData]);

  // Prepare current role object
  const currentRole = useMemo(() => ({
    roleName: formData.roleName || ''
  }), [formData.roleName]);

  // Handler for closing the panel
  const handleClose = () => {
    setIsDuplicatePanelOpen(false);
  };

  // Handler for success notification
  const handleSuccessNotification = (message: string) => {
    setNotification(message);
  };

  return {
    isOpen: isDuplicatePanelOpen,
    onClose: handleClose,
    onDuplicate: handleDuplicatePermissions,
    duplicatePanelRoles,
    fullRoles: roles,
    modulesList,
    modulesData,
    currentRole,
    onSuccessNotification: handleSuccessNotification
  };
};

