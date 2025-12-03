import React, { useState, useEffect, useMemo } from 'react';
import Panel from 'commonApp/Panel';
import type { User } from '../../services/userService';
import { extractDuplicatePermissions } from '../../utils/duplicatePermissionUtils';
import DuplicatePermissionFormFields from '../shared/DuplicatePermissionFormFields';
import './DuplicatePermissionPanel.scss';

export interface DuplicatePermissionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (sourceUser: string, targetUser: string, selectedModules: string[], duplicatedPermissions: string[], enabledModules: string[]) => void;
  users: Array<{ id: string; name: string; email: string }>;
  fullUsers?: User[]; // Full user objects with permissions
  modules: string[];
  modulesData?: { [key: string]: { submodules: { [key: string]: string[] } } }; // Module permissions data (reserved for future use)
  currentUser?: { firstName: string; lastName: string; emailId: string }; // Current user being created
  onSuccessNotification?: (message: string) => void; // Success notification callback
}

const DuplicatePermissionPanel: React.FC<DuplicatePermissionPanelProps> = ({
  isOpen,
  onClose,
  onDuplicate,
  users,
  fullUsers,
  modules,
  modulesData,
  currentUser,
  onSuccessNotification
}) => {
  const [sourceUser, setSourceUser] = useState<string>('');
  const [targetUser, setTargetUser] = useState<string>('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    sourceUser?: string;
    targetUser?: string;
  }>({});

  // Reset form when panel opens/closes
  useEffect(() => {
    if (isOpen) {
      setSourceUser('');
      // Pre-fill target user with current user being created
      if (currentUser) {
        const targetUserName = `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.emailId;
        setTargetUser(targetUserName);
      } else {
        setTargetUser('');
      }
      setSelectedModules([]);
      setValidationErrors({});
    }
  }, [isOpen, currentUser]);

  // Clear source user if it matches target user (shouldn't happen, but safety check)
  useEffect(() => {
    if (sourceUser && targetUser && sourceUser === targetUser) {
      setSourceUser('');
      setValidationErrors(prev => ({ ...prev, sourceUser: undefined }));
    }
  }, [targetUser, sourceUser]);

  const validateForm = () => {
    const errors: { sourceUser?: string; targetUser?: string } = {};
    
    if (!sourceUser) {
      errors.sourceUser = 'Source user is required';
    }
    
    if (!targetUser) {
      errors.targetUser = 'Target user is required';
    }
    
    if (sourceUser && targetUser && sourceUser === targetUser) {
      errors.targetUser = 'Target user must be different from source user';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Find the source user by matching the name
      const sourceUserObj = fullUsers?.find(user => {
        const userName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.emailid || '';
        return userName === sourceUser;
      });

      if (!sourceUserObj) {
        setValidationErrors({ sourceUser: 'Source user not found' });
        return;
      }

      // Extract source user's permissions using shared utility
      const { duplicatedPermissions, enabledModules } = extractDuplicatePermissions(
        sourceUserObj.permissions,
        selectedModules
      );

      // Call the duplicate function with permissions data
      onDuplicate(sourceUser, targetUser, selectedModules, duplicatedPermissions, enabledModules);
      
      // Show success notification
      if (onSuccessNotification) {
        const successMessage = `Permissions for ${targetUser} duplicated successfully from ${sourceUser}`;
        onSuccessNotification(successMessage);
      }
      
      onClose();
    }
  };

  const handleReset = () => {
    setSourceUser('');
    // Keep target user as it's pre-filled
    if (currentUser) {
      const targetUserName = `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.emailId;
      setTargetUser(targetUserName);
    } else {
      setTargetUser('');
    }
    setSelectedModules([]);
    setValidationErrors({});
  };

  // Create user options for source dropdown - exclude target user
  // Format like reporting users in UserCreateForm
  const sourceUserOptions = useMemo(() => {
    return (users || [])
      .map(user => `${user.name}`.trim() || user.email || 'Unknown User')
      .filter(userName => userName !== targetUser && userName !== 'Unknown User'); // Exclude target user
  }, [users, targetUser]);

  // Check if mandatory fields are filled to enable/disable submit button
  const isSubmitDisabled = !sourceUser || sourceUser.trim() === '' || !targetUser || targetUser.trim() === '' || sourceUser === targetUser;

  return (
    <Panel
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicate Permission"
      resetButtonLabel="Reset"
      submitButtonLabel="Submit"
      onReset={handleReset}
      onSubmit={handleSubmit}
      submitButtonDisabled={isSubmitDisabled}
      enableBlur={false}
    >
      <DuplicatePermissionFormFields
        sourceLabel="Select Source User"
        sourceValue={sourceUser}
        sourceOptions={sourceUserOptions}
        sourcePlaceholder="Select User"
        sourceError={validationErrors.sourceUser}
        onSourceChange={(value: string) => {
          setSourceUser(value);
          if (validationErrors.sourceUser) {
            setValidationErrors(prev => ({ ...prev, sourceUser: undefined }));
          }
        }}
        onSourceErrorClear={() => {
          if (validationErrors.sourceUser) {
            setValidationErrors(prev => ({ ...prev, sourceUser: undefined }));
          }
        }}
        targetLabel="Target User"
        targetValue={targetUser}
        targetPlaceholder="Target User"
        modulesLabel="Select Modules (Optional)"
        modulesValue={selectedModules}
        modulesOptions={modules}
        modulesPlaceholder="Select Modules (optional)"
        onModulesChange={(values: string[]) => setSelectedModules(values)}
      />
    </Panel>
  );
};

export default DuplicatePermissionPanel;
