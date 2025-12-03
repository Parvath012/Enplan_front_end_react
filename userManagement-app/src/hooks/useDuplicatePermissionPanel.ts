import { useMemo } from 'react';
import type { UserFormData } from '../types/UserFormData';

interface UseDuplicatePermissionPanelProps {
  formData: UserFormData;
  users: any[];
  modulesData: any;
  isDuplicatePanelOpen: boolean;
  setIsDuplicatePanelOpen: (open: boolean) => void;
  handleDuplicatePermissions: (duplicatedPermissions: string[], enabledModules?: string[]) => void;
  setNotification: (notification: { type: 'success' | 'error' | 'warning'; message: string } | null) => void;
}

/**
 * Custom hook to prepare props for DuplicatePermissionPanelWrapper
 * Eliminates duplication between UserCreateForm and UserEditForm
 */
export const useDuplicatePermissionPanel = ({
  formData,
  users,
  modulesData,
  isDuplicatePanelOpen,
  setIsDuplicatePanelOpen,
  handleDuplicatePermissions,
  setNotification
}: UseDuplicatePermissionPanelProps) => {
  // Prepare users list for duplicate panel
  const duplicatePanelUsers = useMemo(() => {
    return users.map(user => ({
      id: (user.id ?? 0).toString(),
      name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.emailid || 'Unknown User',
      email: user.emailid || ''
    }));
  }, [users]);

  // Get modules list from modulesData
  const modulesList = useMemo(() => {
    return modulesData ? Object.keys(modulesData) : [];
  }, [modulesData]);

  // Prepare current user object
  const currentUser = useMemo(() => ({
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    emailId: formData.emailId || ''
  }), [formData.firstName, formData.lastName, formData.emailId]);

  // Handler for closing the panel
  const handleClose = () => {
    setIsDuplicatePanelOpen(false);
  };

  // Handler for success notification
  const handleSuccessNotification = (message: string) => {
    setNotification({ type: 'success', message });
  };

  return {
    isOpen: isDuplicatePanelOpen,
    onClose: handleClose,
    onDuplicate: handleDuplicatePermissions,
    duplicatePanelUsers,
    fullUsers: users,
    modulesList,
    modulesData,
    currentUser,
    onSuccessNotification: handleSuccessNotification
  };
};

