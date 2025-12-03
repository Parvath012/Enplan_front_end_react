import React from 'react';
import DuplicateRolePermissionPanel from './DuplicateRolePermissionPanel';

interface DuplicateRolePermissionPanelWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (duplicatedPermissions: string[], enabledModules?: string[]) => void;
  duplicatePanelRoles: Array<{ id: string; name: string; description?: string }>;
  fullRoles: any[];
  modulesList: string[];
  modulesData: any;
  currentRole: {
    roleName: string;
  };
  onSuccessNotification: (message: string) => void;
}

/**
 * Reusable wrapper component for DuplicateRolePermissionPanel
 * Similar to DuplicatePermissionPanelWrapper but for roles
 */
const DuplicateRolePermissionPanelWrapper: React.FC<DuplicateRolePermissionPanelWrapperProps> = (props) => {
  const {
    isOpen,
    onClose,
    onDuplicate,
    duplicatePanelRoles,
    fullRoles,
    modulesList,
    modulesData,
    currentRole,
    onSuccessNotification
  } = props;

  return (
    <DuplicateRolePermissionPanel
      isOpen={isOpen}
      onClose={onClose}
      onDuplicate={(_sourceRole, _targetRole, _selectedModules, duplicatedPermissions, enabledModules) => {
        onDuplicate(duplicatedPermissions, enabledModules);
        onClose();
      }}
      roles={duplicatePanelRoles}
      fullRoles={fullRoles}
      modules={modulesList}
      modulesData={modulesData}
      currentRole={currentRole}
      onSuccessNotification={onSuccessNotification}
    />
  );
};

export default DuplicateRolePermissionPanelWrapper;

