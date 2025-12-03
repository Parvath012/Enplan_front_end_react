import React from 'react';
import DuplicatePermissionPanel from './DuplicatePermissionPanel';

interface DuplicatePermissionPanelWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (duplicatedPermissions: string[], enabledModules?: string[]) => void;
  duplicatePanelUsers: Array<{ id: string; name: string; email: string }>;
  fullUsers: any[];
  modulesList: string[];
  modulesData: any;
  currentUser: {
    firstName: string;
    lastName: string;
    emailId: string;
  };
  onSuccessNotification: (message: string) => void;
}

/**
 * Reusable wrapper component for DuplicatePermissionPanel
 * Eliminates duplication between UserCreateForm and UserEditForm
 */
const DuplicatePermissionPanelWrapper: React.FC<DuplicatePermissionPanelWrapperProps> = (props) => {
  const {
    isOpen,
    onClose,
    onDuplicate,
    duplicatePanelUsers,
    fullUsers,
    modulesList,
    modulesData,
    currentUser,
    onSuccessNotification
  } = props;

  return (
    <DuplicatePermissionPanel
      isOpen={isOpen}
      onClose={onClose}
      onDuplicate={(_sourceUser, _targetUser, _selectedModules, duplicatedPermissions, enabledModules) => {
        onDuplicate(duplicatedPermissions, enabledModules);
        onClose();
      }}
      users={duplicatePanelUsers}
      fullUsers={fullUsers}
      modules={modulesList}
      modulesData={modulesData}
      currentUser={currentUser}
      onSuccessNotification={onSuccessNotification}
    />
  );
};

export default DuplicatePermissionPanelWrapper;

