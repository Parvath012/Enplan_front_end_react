import React, { useState, useEffect, useMemo } from 'react';
import Panel from 'commonApp/Panel';
import type { Role } from '../../services/roleService';
import { extractDuplicatePermissions } from '../../utils/duplicatePermissionUtils';
import DuplicatePermissionFormFields from '../shared/DuplicatePermissionFormFields';
import './DuplicateRolePermissionPanel.scss';

export interface DuplicateRolePermissionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (sourceRole: string, targetRole: string, selectedModules: string[], duplicatedPermissions: string[], enabledModules: string[]) => void;
  roles: Array<{ id: string; name: string; description?: string }>;
  fullRoles?: Role[]; // Full role objects with permissions
  modules: string[];
  modulesData?: { [key: string]: { submodules: { [key: string]: string[] } } }; // Module permissions data
  currentRole?: { roleName: string }; // Current role being created/edited
  onSuccessNotification?: (message: string) => void; // Success notification callback
}

const DuplicateRolePermissionPanel: React.FC<DuplicateRolePermissionPanelProps> = ({
  isOpen,
  onClose,
  onDuplicate,
  roles,
  fullRoles,
  modules,
  modulesData,
  currentRole,
  onSuccessNotification
}) => {
  const [sourceRole, setSourceRole] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    sourceRole?: string;
    targetRole?: string;
  }>({});

  // Reset form when panel opens/closes
  useEffect(() => {
    if (isOpen) {
      setSourceRole('');
      // Pre-fill target role with current role being created/edited
      if (currentRole) {
        setTargetRole(currentRole.roleName);
      } else {
        setTargetRole('');
      }
      setSelectedModules([]);
      setValidationErrors({});
    }
  }, [isOpen, currentRole]);

  // Clear source role if it matches target role (shouldn't happen, but safety check)
  useEffect(() => {
    if (sourceRole && targetRole && sourceRole === targetRole) {
      setSourceRole('');
      setValidationErrors(prev => ({ ...prev, sourceRole: undefined }));
    }
  }, [targetRole, sourceRole]);

  const validateForm = () => {
    const errors: { sourceRole?: string; targetRole?: string } = {};
    
    if (!sourceRole) {
      errors.sourceRole = 'Source role is required';
    }
    
    if (!targetRole) {
      errors.targetRole = 'Target role is required';
    }
    
    if (sourceRole && targetRole && sourceRole === targetRole) {
      errors.targetRole = 'Target role must be different from source role';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Find the source role by matching the name
      const sourceRoleObj = fullRoles?.find(role => {
        return role.rolename === sourceRole;
      });

      if (!sourceRoleObj) {
        setValidationErrors({ sourceRole: 'Source role not found' });
        return;
      }

      // Extract source role's permissions using shared utility
      const { duplicatedPermissions, enabledModules } = extractDuplicatePermissions(
        sourceRoleObj.permissions,
        selectedModules
      );

      // Call the duplicate function with permissions data
      onDuplicate(sourceRole, targetRole, selectedModules, duplicatedPermissions, enabledModules);
      
      // Show success notification
      if (onSuccessNotification) {
        const successMessage = `Permissions for ${targetRole} duplicated successfully from ${sourceRole}`;
        onSuccessNotification(successMessage);
      }
      
      onClose();
    }
  };

  const handleReset = () => {
    setSourceRole('');
    // Keep target role as it's pre-filled
    if (currentRole) {
      setTargetRole(currentRole.roleName);
    } else {
      setTargetRole('');
    }
    setSelectedModules([]);
    setValidationErrors({});
  };

  // Create role options for source dropdown - exclude target role
  const sourceRoleOptions = useMemo(() => {
    return (roles || [])
      .map(role => role.name)
      .filter(roleName => roleName !== targetRole && roleName.trim() !== ''); // Exclude target role
  }, [roles, targetRole]);

  // Check if mandatory fields are filled to enable/disable submit button
  const isSubmitDisabled = !sourceRole || sourceRole.trim() === '' || !targetRole || targetRole.trim() === '' || sourceRole === targetRole;

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
        sourceLabel="Source Role"
        sourceValue={sourceRole}
        sourceOptions={sourceRoleOptions}
        sourcePlaceholder="Select Role"
        sourceError={validationErrors.sourceRole}
        onSourceChange={(value: string) => {
          setSourceRole(value);
          if (validationErrors.sourceRole) {
            setValidationErrors(prev => ({ ...prev, sourceRole: undefined }));
          }
        }}
        onSourceErrorClear={() => {
          if (validationErrors.sourceRole) {
            setValidationErrors(prev => ({ ...prev, sourceRole: undefined }));
          }
        }}
        targetLabel="Target Role"
        targetValue={targetRole}
        targetPlaceholder="Target Role"
        modulesLabel="Select Modules (Optional)"
        modulesValue={selectedModules}
        modulesOptions={modules}
        modulesPlaceholder="Select Modules (optional)"
        onModulesChange={(values: string[]) => setSelectedModules(values)}
      />
    </Panel>
  );
};

export default DuplicateRolePermissionPanel;

