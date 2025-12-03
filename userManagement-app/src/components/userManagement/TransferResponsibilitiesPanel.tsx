import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import SelectField from 'commonApp/SelectField';
import Panel from 'commonApp/Panel';
import type { User } from '../../services/userService';
import './TransferResponsibilitiesPanel.scss';

export interface TransferResponsibilitiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (targetUserName: string) => Promise<void>;
  onReset: () => void;
  sourceUserName: string;
  sourceUserId: number | null;
  users: User[];
  onSuccessNotification?: (message: string) => void;
}

const TransferResponsibilitiesPanel: React.FC<TransferResponsibilitiesPanelProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onReset,
  sourceUserName,
  sourceUserId,
  users,
  onSuccessNotification
}) => {
  const [targetUser, setTargetUser] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<{
    targetUser?: string;
  }>({});

  // Get the actual user name from users array using userId to ensure it's correct
  // Format: firstname + lastname, fallback to emailid, but never show 'Unknown User'
  const displaySourceUserName = useMemo(() => {
    // If we have userId, find the user directly from the users array
    if (sourceUserId !== null) {
      const sourceUser = users.find(u => u.id === sourceUserId);
      if (sourceUser) {
        // Format name consistently: firstname + lastname, fallback to emailid
        const formattedName = `${sourceUser.firstname || ''} ${sourceUser.lastname || ''}`.trim() || sourceUser.emailid || '';
        // Only return if we have a valid name (not empty)
        if (formattedName) {
          return formattedName;
        }
      }
    }
    
    // Fallback: use sourceUserName if it's valid (not 'Unknown User' or 'User')
    if (sourceUserName && sourceUserName !== 'Unknown User' && sourceUserName !== 'User') {
      return sourceUserName;
    }
    
    // Last resort: try to find user by matching sourceUserName
    const matchingUser = users.find(user => {
      const userName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.emailid || '';
      return userName === sourceUserName;
    });
    
    if (matchingUser) {
      const formattedName = `${matchingUser.firstname || ''} ${matchingUser.lastname || ''}`.trim() || matchingUser.emailid || '';
      return formattedName || '';
    }
    
    // Return empty string rather than 'Unknown User'
    return '';
  }, [sourceUserId, sourceUserName, users]);

  // Reset form when panel opens/closes
  useEffect(() => {
    if (isOpen) {
      setTargetUser('');
      setValidationErrors({});
    }
  }, [isOpen]);

  // Blur cleanup removed - only backdrop blur is used now

  const validateForm = () => {
    const errors: { targetUser?: string } = {};
    
    if (!targetUser) {
      errors.targetUser = 'Target user is required';
    }
    
    if (targetUser && displaySourceUserName && targetUser === displaySourceUserName) {
      errors.targetUser = "Responsibilities can't be transferred to the same user";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSubmit(targetUser);
        
        // Close panel first - this triggers the slide-out animation (0.3s duration)
        onClose();
        
        // Show success notification AFTER panel closes (wait for animation to complete)
        // Panel animation duration is 0.3s, so wait 350ms to ensure smooth transition
        if (onSuccessNotification) {
          const successMessage = 'Responsibilities have been Successfully transferred to the selected user';
          setTimeout(() => {
            onSuccessNotification(successMessage);
          }, 350); // Wait for panel closing animation (300ms) + small buffer
        }
      } catch (error) {
        // Keep panel open if there was an error
        console.error('Error transferring responsibilities:', error);
      }
    }
  };

  const handleReset = () => {
    setTargetUser('');
    setValidationErrors({});
    // NOTE: Not calling onReset() which would close the panel
    // Just clearing the form fields, matching DuplicatePermissionPanel behavior
  };

  // Create user options for dropdown - format like reporting users
  // Exclude the source user and only include Active users (isenabled: true AND status: 'Active')
  const targetUserOptions = useMemo(() => {
    return (users || [])
      .filter(user => {
        // Only include Active users: isenabled must be true AND status must be 'Active'
        const isActive = user.isenabled === true && user.status === 'Active';
        return isActive;
      })
      .map(user => {
        const userName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.emailid || 'Unknown User';
        return userName;
      })
      .filter(userName => userName !== displaySourceUserName && userName !== 'Unknown User'); // Exclude source user
  }, [users, displaySourceUserName]);

  // Source user options - only the source user itself for the disabled dropdown
  const sourceUserOptions = useMemo(() => {
    return displaySourceUserName && displaySourceUserName !== 'Unknown User' && displaySourceUserName !== 'User' 
      ? [displaySourceUserName] 
      : [];
  }, [displaySourceUserName]);

  // Check if mandatory field is filled to enable/disable submit button
  const isSubmitDisabled = !targetUser || targetUser.trim() === '' || targetUser === displaySourceUserName;

  return (
    <Panel
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Responsibilities"
      resetButtonLabel="Reset"
      submitButtonLabel="Submit"
      onReset={handleReset}
      onSubmit={handleSubmit}
      submitButtonDisabled={isSubmitDisabled}
      enableBlur={false}
      className="transfer-panel"
    >
      {/* Transfer Responsibilities From - Source User (disabled dropdown) */}
      <Box className="transfer-panel__field transfer-panel__field--no-arrow form-field form-field--required">
        <SelectField
          label="Transfer Responsibilities From"
          value={displaySourceUserName}
          onChange={() => {}} // No-op for disabled
          options={sourceUserOptions}
          placeholder="Transfer Responsibilities From"
          required={true}
          disabled={true}
          error={false}
          errorMessage=""
          width="100%"
        />
      </Box>

      {/* Transfer Responsibilities To - Target User (dropdown) */}
      <Box className="transfer-panel__field form-field form-field--required">
        <SelectField
          label="Transfer Responsibilities To"
          value={targetUser}
          onChange={(value: string) => {
            setTargetUser(value);
            if (validationErrors.targetUser) {
              setValidationErrors(prev => ({ ...prev, targetUser: undefined }));
            }
          }}
          options={targetUserOptions}
          placeholder="Select User"
          required={true}
          error={!!validationErrors.targetUser}
          errorMessage={validationErrors.targetUser}
          width="100%"
        />
      </Box>
    </Panel>
  );
};

export default TransferResponsibilitiesPanel;

