import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormHeaderBase from 'commonApp/FormHeaderBase';
import NotificationAlert from 'commonApp/NotificationAlert';
import { ReusableTextField, ReusableMultiSelectField, SectionTitle } from '../../components/userManagement/UserFormComponents';
import RolePermissionsTable from '../../components/roleManagement/RolePermissionsTable';
import type { RoleFormData } from '../../types/RoleFormData';
import { getUserFormStyles, getHorizontalDividerStyles } from '../../components/userManagement/PermissionTableConstants';
import StatusRadioButtons from '../../components/shared/StatusRadioButtons';
import { saveRole } from '../../services/roleSaveService';
import { fetchRoles } from '../../store/Reducers/roleSlice';
import { fetchUsers } from '../../store/Reducers/userSlice';
import type { RootState } from '../../store/configureStore';
import { parseArrayData, parsePermissionsData, mergeDuplicatePermissions } from '../../utils/userFormUtils';
import { updateUsersWithRoleNameAndRefresh } from '../../utils/roleNameUpdateUtils';
import DuplicateRolePermissionPanelWrapper from '../../components/roleManagement/DuplicateRolePermissionPanelWrapper';
import { useDuplicateRolePermissionPanel } from '../../hooks/useDuplicateRolePermissionPanel';
import { useModulePermissions } from '../../hooks/useModulePermissions';

// Use shared user form styles
const userFormStyles = getUserFormStyles();

// Parent Attribute options (excluding 'Select All' as MultiSelectField has its own Select All)
const parentAttributeOptions = [
  'Region',
  'Country',
  'Division',
  'Group',
  'Department',
  'Class',
  'Sub Class'
];

// Helper function to normalize permissions for comparison (sorts arrays to handle ordering differences)
const normalizePermissionsForComparison = (permissions: any) => {
  if (!permissions) return null;
  // Compare function for string sorting
  const compareStrings = (a: string, b: string): number => {
    return a.localeCompare(b);
  };
  return {
    enabledModules: Array.isArray(permissions.enabledModules) 
      ? [...permissions.enabledModules].sort(compareStrings) 
      : [],
    selectedPermissions: Array.isArray(permissions.selectedPermissions) 
      ? [...permissions.selectedPermissions].sort(compareStrings) 
      : [],
    activeModule: permissions.activeModule || null,
    activeSubmodule: permissions.activeSubmodule || null
  };
};

const RoleForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { roles, hasRoles } = useSelector((state: RootState) => state.roles);
  const { users, hasUsers } = useSelector((state: RootState) => state.users);
  
  // Loading state for initial data fetch
  const [isLoadingRole, setIsLoadingRole] = useState(false);

  // Form state
  const [formData, setFormData] = useState<RoleFormData>({
    roleName: '',
    department: '',
    roleDescription: '',
    status: 'Active',
    parentAttribute: [],
    permissions: {
      enabledModules: [],
      selectedPermissions: [],
      activeModule: null,
      activeSubmodule: null
    }
  });

  // Track form modifications
  const [originalFormData, setOriginalFormData] = useState<RoleFormData | null>(null);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Track permission changes from permission table
  const [hasPermissionChanges, setHasPermissionChanges] = useState(false);
  
  // Ref to prevent infinite loops during reset - only blocks permissions updates
  const isResettingPermissionsRef = useRef(false);
  // Ref to track last permissions value to prevent duplicate updates
  const lastPermissionsRef = useRef<string | null>(null);
  // Ref to store permission table reset function
  const permissionTableResetRef = useRef<(() => void) | null>(null);
  // Ref to track last text field values to prevent duplicate updates (specifically for roleName)
  const lastTextFieldValuesRef = useRef<Record<string, any>>({});
  
  // Loading and notification states
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success'
  });
  
  // Confirmation dialog states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState<'reset' | 'cancel' | 'duplicate' | null>(null);
  
  // Duplicate Permission Panel state
  const [isDuplicatePanelOpen, setIsDuplicatePanelOpen] = useState(false);
  
  // Fetch module permissions data for duplicate panel
  const { modulesData } = useModulePermissions();

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setIsLoadingRole(true);
      
      // Try to find role in Redux store first
      const roleId = parseInt(id, 10);
      const role = roles.find(r => r.id === roleId);
      
      if (role) {
        // Parse parent attribute (can be JSON string or array)
        const parentAttribute = parseArrayData(role.parentattribute);
        
        // Parse permissions (can be JSON string or object)
        const permissions = parsePermissionsData(role.permissions);
        
        // Create form data from role
        const roleFormData: RoleFormData = {
          id: role.id,
          roleName: role.rolename ?? '',
          department: role.department ?? '',
          roleDescription: role.roledescription ?? '',
          status: (role.status === 'Active' || role.status === 'Inactive') ? role.status : 'Active',
          parentAttribute: Array.isArray(parentAttribute) ? parentAttribute : [],
          permissions: {
            enabledModules: permissions?.enabledModules || [],
            selectedPermissions: permissions?.selectedPermissions || [],
            activeModule: permissions?.activeModule || null,
            activeSubmodule: permissions?.activeSubmodule || null
          }
        };
        
        // Set form data and original form data
        setFormData(roleFormData);
        setOriginalFormData(roleFormData);
        
        // Reset permission changes flag
        setHasPermissionChanges(false);
        
        // Reset text field values ref
        lastTextFieldValuesRef.current = {};
        
        setIsLoadingRole(false);
      } else {
        // Role not found in store, fetch roles and try again
        // @ts-ignore
        dispatch(fetchRoles()).then(() => {
          setIsLoadingRole(false);
        }).catch(() => {
          setIsLoadingRole(false);
          setNotification({
            open: true,
            message: 'Failed to load role data. Please try again.',
            type: 'error'
          });
        });
      }
    } else {
      // Not in edit mode, reset form
      setFormData({
        roleName: '',
        department: '',
        roleDescription: '',
        status: 'Active',
        parentAttribute: [],
        permissions: {
          enabledModules: [],
          selectedPermissions: [],
          activeModule: null,
          activeSubmodule: null
        }
      });
      setOriginalFormData(null);
      setHasPermissionChanges(false);
      lastTextFieldValuesRef.current = {};
    }
  }, [isEditMode, id, roles, dispatch]);
  
  // Fetch users if not already loaded (needed for role name updates)
  useEffect(() => {
    // @ts-ignore
    if (users.length === 0) {
      // @ts-ignore
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length]);

  // Track form modifications - use requestAnimationFrame to defer expensive operations
  const [isFormModified, setIsFormModified] = useState(false);
  const lastFormModifiedRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Defer expensive JSON.stringify operations to next frame to avoid blocking typing
    const timeoutId = requestAnimationFrame(() => {
      // First check if there are permission changes from the permission table
      if (hasPermissionChanges) {
        if (lastFormModifiedRef.current !== true) {
          setIsFormModified(true);
          lastFormModifiedRef.current = true;
        }
        return;
      }
      
      let hasChanges: boolean;
      if (originalFormData) {
        // Normalize permissions before comparison to handle array ordering differences
        const normalizedFormData = {
          ...formData,
          permissions: normalizePermissionsForComparison(formData.permissions)
        };
        const normalizedOriginalData = {
          ...originalFormData,
          permissions: normalizePermissionsForComparison(originalFormData.permissions)
        };
        // Compare with normalized permissions
        hasChanges = JSON.stringify(normalizedFormData) !== JSON.stringify(normalizedOriginalData);
      } else {
        // Check if any field has a value
        hasChanges = (
          formData.roleName.trim() !== '' ||
          formData.department.trim() !== '' ||
          formData.roleDescription.trim() !== '' ||
          (formData.parentAttribute?.length ?? 0) > 0 ||
          (formData.permissions?.selectedPermissions?.length ?? 0) > 0
        );
      }
      
      // Only update state if the value actually changed
      if (lastFormModifiedRef.current !== hasChanges) {
        setIsFormModified(hasChanges);
        lastFormModifiedRef.current = hasChanges;
      }
    });
    
    return () => cancelAnimationFrame(timeoutId);
  }, [formData, originalFormData, hasPermissionChanges]);

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Role Name validation - mandatory, no special characters
    if (!formData.roleName.trim()) {
      errors.roleName = 'Role Name is required';
    } else if (!/^[a-zA-Z0-9\s]+$/.test(formData.roleName)) {
      errors.roleName = 'Role Name cannot contain special characters';
    }

    // Department validation - mandatory
    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }

    // Role Description validation - mandatory
    if (!formData.roleDescription.trim()) {
      errors.roleDescription = 'Role Description is required';
    }

    // Parent Attribute validation - mandatory (must have at least one selection)
    if (!formData.parentAttribute || formData.parentAttribute.length === 0) {
      errors.parentAttribute = 'Parent Attribute is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if form is valid for submission
  const isFormValid = (): boolean => {
    return (
      formData.roleName.trim() !== '' &&
      formData.department.trim() !== '' &&
      formData.roleDescription.trim() !== '' &&
      (formData.parentAttribute?.length ?? 0) > 0 &&
      formData.status !== undefined
    );
  };

  // Handle input changes - memoized to prevent function recreation on every render
  const handleInputChange = useCallback((field: keyof RoleFormData, value: any) => {
    // For text fields, use simple state update like user form
    if (field !== 'permissions') {
      // Check if value actually changed to prevent infinite loops (especially for roleName)
      const lastValue = lastTextFieldValuesRef.current[field];
      if (lastValue === value) {
        return; // Same value, skip update to prevent infinite loop
      }
      
      // Update the ref with the new value
      lastTextFieldValuesRef.current[field] = value;
      
      // Simple state update - React's reconciliation will handle duplicate values
      setFormData(prev => {
        // Double check - only update if value actually changed
        if (prev[field] === value) {
          return prev; // No change, return same object
        }
        return { ...prev, [field]: value };
      });
      
      // Clear validation error if it exists - use functional update to avoid stale closure
      setValidationErrors(prev => {
        if (!prev[field]) {
          return prev; // No error to clear, return same object
        }
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      return;
    }
    
    // For permissions: block during reset AND check if value actually changed
    if (isResettingPermissionsRef.current) {
      return; // Block during reset
    }
    
    // Create a stable string representation of the permissions value
    // Compare function for string sorting
    const compareStrings = (a: string, b: string): number => a.localeCompare(b);
    const permissionsString = JSON.stringify({
      enabledModules: (value?.enabledModules || []).slice().sort(compareStrings),
      selectedPermissions: (value?.selectedPermissions || []).slice().sort(compareStrings),
      activeModule: value?.activeModule || null,
      activeSubmodule: value?.activeSubmodule || null
    });
    
    // Check if this is the same as the last update to prevent infinite loops
    if (lastPermissionsRef.current === permissionsString) {
      return; // No change, prevent update
    }
    
    // Update the ref with the new value
    lastPermissionsRef.current = permissionsString;
    
    // Update form data
    setFormData(prev => {
      const currentPerms = prev.permissions;
      const newPerms = value;
      
      // Quick check - if lengths or simple values differ, definitely update
      if (
        (currentPerms?.enabledModules?.length || 0) !== (newPerms?.enabledModules?.length || 0) ||
        (currentPerms?.selectedPermissions?.length || 0) !== (newPerms?.selectedPermissions?.length || 0) ||
        currentPerms?.activeModule !== newPerms?.activeModule ||
        currentPerms?.activeSubmodule !== newPerms?.activeSubmodule
      ) {
        return {
          ...prev,
          [field]: value
        };
      }
      
      // Deep compare arrays only if lengths match
      const currentEnabled = (currentPerms?.enabledModules ?? []).slice().sort((a: string, b: string) => a.localeCompare(b));
      const newEnabled = (newPerms?.enabledModules ?? []).slice().sort((a: string, b: string) => a.localeCompare(b));
      const currentSelected = (currentPerms?.selectedPermissions ?? []).slice().sort((a: string, b: string) => a.localeCompare(b));
      const newSelected = (newPerms?.selectedPermissions ?? []).slice().sort((a: string, b: string) => a.localeCompare(b));
      
      const arraysEqual = 
        currentEnabled.length === newEnabled.length &&
        currentSelected.length === newSelected.length &&
        currentEnabled.every((val, idx) => val === newEnabled[idx]) &&
        currentSelected.every((val, idx) => val === newSelected[idx]);
      
      if (arraysEqual) {
        // Values are the same, but we already checked the ref, so update anyway
        // This handles the case where formData was updated from elsewhere
        return {
          ...prev,
          [field]: value
        };
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
    
    // Clear validation error for permissions field only if it exists
    setValidationErrors(prev => {
      if (!prev[field]) {
        return prev; // No error to clear, return same object
      }
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []); // Empty dependency array - setFormData and setValidationErrors are stable

  // Navigation handlers
  const handleBack = () => {
    const isAdminApp = window.location.pathname.includes('/admin/user-management');
    const basePath = isAdminApp ? '/admin/user-management' : '/user-management';
    // If no users and no roles, navigate to welcome page; otherwise navigate to roles page
    if (!hasUsers && !hasRoles) {
      navigate(`${basePath}/welcome`);
    } else {
      navigate(`${basePath}/roles`);
    }
  };

  // Confirmation dialog helpers
  const openConfirm = (type: 'reset' | 'cancel'): void => {
    if (type === 'reset') {
      setConfirmMessage('Once clicked, it will revert all entered data. Do you want to continue?');
    } else if (type === 'cancel') {
      setConfirmMessage('Once clicked, all newly entered data will be lost and the screen will be closed. Do you want to continue?');
    }
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const closeConfirm = (): void => {
    setConfirmOpen(false);
    setConfirmType(null);
  };

  // Actual reset logic (extracted to avoid circular reference)
  const performReset = () => {
    // Reset only non-permission fields (text fields, dropdowns, etc.)
    const resetData = originalFormData 
      ? { 
          ...originalFormData,
          // Keep current permissions - don't reset them
          permissions: formData.permissions
        }
      : {
          roleName: '',
          department: '',
          roleDescription: '',
          status: 'Active' as const,
          parentAttribute: [],
          // Keep current permissions - don't reset them
          permissions: formData.permissions
        };
    
    // Reset only non-permission form data
    setFormData(resetData);
    
    setValidationErrors({});
    
    // Clear permission changes flag
    setHasPermissionChanges(false);
    
    // Reset text field values ref to prevent stale checks
    lastTextFieldValuesRef.current = {};
    
    // Call permission table reset function if available
    // This will trigger the reset button above the permission table
    if (permissionTableResetRef.current) {
      permissionTableResetRef.current();
    }
  };

  const handleConfirmYes = (): void => {
    if (confirmType === 'reset') {
      performReset();
      closeConfirm();
    } else if (confirmType === 'cancel') {
      const isAdminApp = window.location.pathname.includes('/admin/user-management');
      const basePath = isAdminApp ? '/admin/user-management' : '/user-management';
      // If no users and no roles, navigate to welcome page; otherwise navigate to roles page
      if (!hasUsers && !hasRoles) {
        navigate(`${basePath}/welcome`);
      } else {
        navigate(`${basePath}/roles`);
      }
      closeConfirm();
    } else if (confirmType === 'duplicate') {
      // Open duplicate panel after user confirms
      setIsDuplicatePanelOpen(true);
      closeConfirm();
    }
  };

  const handleConfirmNo = (): void => {
    closeConfirm();
  };

  const handleCancel = () => {
    // Show warning only if form is modified
    if (isFormModified) {
      openConfirm('cancel');
    } else {
      // No changes, navigate directly
      const isAdminApp = window.location.pathname.includes('/admin/user-management');
      const basePath = isAdminApp ? '/admin/user-management' : '/user-management';
      // If no users and no roles, navigate to welcome page; otherwise navigate to roles page
      if (!hasUsers && !hasRoles) {
        navigate(`${basePath}/welcome`);
      } else {
        navigate(`${basePath}/roles`);
      }
    }
  };

  const handleReset = () => {
    // Show warning only if form is modified
    if (isFormModified) {
      openConfirm('reset');
      return;
    }
    
    // No changes, reset directly (though this shouldn't happen if reset is disabled when not modified)
    performReset();
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const operation = isEditMode ? 'u' : 'n';
      
      // Store old role name if editing and role name changed
      const oldRoleName = isEditMode && originalFormData 
        ? originalFormData.roleName 
        : null;
      const roleNameChanged = oldRoleName && oldRoleName !== formData.roleName;
      
      // Save the role
      await saveRole(formData, operation);
      
      // If role name changed, update all users with the old role name
      if (roleNameChanged && oldRoleName) {
        await updateUsersWithRoleNameAndRefresh(
          oldRoleName,
          formData.roleName,
          dispatch,
          setNotification
        );
      }
      
      // Mark as saved
      setOriginalFormData({ ...formData });
      
      // Refresh roles list
      // @ts-ignore
      dispatch(fetchRoles());
      
      if (!roleNameChanged || !oldRoleName) {
        setNotification({
          open: true,
          message: 'Role saved successfully',
          type: 'success'
        });
      }
      
      // Navigate to roles list page after successful save
      const isAdminApp = window.location.pathname.includes('/admin/user-management');
      setTimeout(() => {
        navigate(isAdminApp ? '/admin/user-management/roles' : '/user-management/roles');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving role:', error);
      setNotification({
        open: true,
        message: error?.message || 'Failed to save role. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const operation = isEditMode ? 'u' : 'n';
      
      // Store old role name if editing and role name changed
      const oldRoleName = isEditMode && originalFormData 
        ? originalFormData.roleName 
        : null;
      const roleNameChanged = oldRoleName && oldRoleName !== formData.roleName;
      
      // Save the role
      await saveRole(formData, operation);
      
      // If role name changed, update all users with the old role name
      if (roleNameChanged && oldRoleName) {
        await updateUsersWithRoleNameAndRefresh(
          oldRoleName,
          formData.roleName,
          dispatch,
          setNotification
        );
      }
      
      // Refresh roles list
      // @ts-ignore
      dispatch(fetchRoles());
      
      // Navigate to roles list page after successful submission
      const isAdminApp = window.location.pathname.includes('/admin/user-management');
      navigate(isAdminApp ? '/admin/user-management/roles' : '/user-management/roles');
    } catch (error: any) {
      console.error('Error submitting role:', error);
      setNotification({
        open: true,
        message: error?.message || 'Failed to submit role. Please try again.',
        type: 'error'
      });
      setIsSubmitting(false);
    }
  };

  // Pass handleSubmit to FormHeaderBase via onNext prop
  const handleNext = handleSubmit;

  // Handle duplicate permissions
  const handleDuplicatePermissions = (
    duplicatedPermissions: string[], 
    duplicatedEnabledModules?: string[]
  ) => {
    const currentPermissions = parsePermissionsData(formData.permissions);
    const updatedPermissions = mergeDuplicatePermissions(
      currentPermissions,
      duplicatedPermissions,
      duplicatedEnabledModules
    );
    handleInputChange('permissions', updatedPermissions);
    setHasPermissionChanges(true);
  };

  // Handler for success notification (wraps setNotification to match expected signature)
  const handleSuccessNotification = (message: string) => {
    setNotification({
      open: true,
      message,
      type: 'success'
    });
  };

  // Use hook to prepare duplicate permission panel props
  const duplicatePermissionPanelProps = useDuplicateRolePermissionPanel({
    formData,
    roles,
    modulesData,
    isDuplicatePanelOpen,
    setIsDuplicatePanelOpen,
    handleDuplicatePermissions,
    setNotification: handleSuccessNotification
  });

  const handleDuplicateClick = () => {
    // Show warning dialog before opening duplicate panel
    setConfirmMessage('The selected permissions will be duplicated and added to the existing permissions. Do you wish to continue?');
    setConfirmType('duplicate');
    setConfirmOpen(true);
  };

  // Determine button states according to requirements
  // Save: Always disabled (both in create and edit mode)
  const isSaveDisabled = true; // Always disabled as per requirements
  
  // Reset: Disabled initially, enabled when modifications are made (handled by FormHeaderBase via isFormModified)
  // Cancel: Always enabled, shows warning if modified (handled by handleCancel)
  
  // Submit: 
  // - In create mode: Enabled when all mandatory fields are filled
  // - In edit mode: Disabled initially, enabled only when changes are made AND all mandatory fields are filled
  const isSubmitDisabled = !isFormValid() || (isEditMode && !isFormModified) || isSubmitting || isLoadingRole;

  // Show loading state while fetching role data
  if (isLoadingRole && isEditMode) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%'
      }}>
        <Typography>Loading role data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Notification Alert */}
      {notification.open && (
        <NotificationAlert
          open={notification.open}
          message={notification.message}
          variant={notification.type}
          onClose={() => setNotification({ ...notification, open: false })}
        />
      )}
      
      {/* Form Header */}
      <FormHeaderBase
        title={isEditMode ? 'Edit Role' : 'Create Role'}
        onBack={handleBack}
        onReset={handleReset}
        onCancel={handleCancel}
        onSave={handleSave}
        onNext={handleNext}
        showBackButton={true}
        showResetButton={true}
        showCancelButton={true}
        showSaveButton={true}
        showNextButton={true}
        isFormModified={isFormModified}
        isSaveDisabled={isSaveDisabled}
        isSaveLoading={isSaving}
        isNextDisabled={isSubmitDisabled}
        useSubmitIcon={true}
        submitButtonText="Submit"
        resetButtonText="Reset"
        cancelButtonText="Cancel"
        saveButtonText={isSaving ? 'Saving...' : 'Save'}
      />

      {/* Form Content */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        backgroundColor: '#ffffff',
        margin: '0',
        marginTop: '12px',
        marginLeft: '12px',
        marginRight: '12px',
        borderRadius: '4px',
        boxSizing: 'border-box'
      }}>
        {/* Basic Details Section */}
        <Box sx={{ mb: 3 }}>
          <SectionTitle>Basic Details</SectionTitle>
          <Box sx={{ ...userFormStyles.formRow, flexWrap: 'nowrap', display: 'flex', gap: '14px' }}>
            <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
              <ReusableTextField
                field="roleName"
                label="Role Name"
                placeholder="Role Name"
                value={formData.roleName}
                onChange={(value) => handleInputChange('roleName', value)}
                required={true}
                error={!!validationErrors.roleName}
                errorMessage={validationErrors.roleName}
              />
            </Box>
            <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
              <ReusableTextField
                field="department"
                label="Department"
                placeholder="Department"
                value={formData.department}
                onChange={(value) => handleInputChange('department', value)}
                required={true}
                error={!!validationErrors.department}
                errorMessage={validationErrors.department}
              />
            </Box>
            <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
              <ReusableTextField
                field="roleDescription"
                label="Role Description"
                placeholder="Role Description"
                value={formData.roleDescription}
                onChange={(value) => handleInputChange('roleDescription', value)}
                required={true}
                error={!!validationErrors.roleDescription}
                errorMessage={validationErrors.roleDescription}
              />
            </Box>
          </Box>
        </Box>

        {/* Additional Details Section */}
        <Box sx={{ mb: 3 }}>
          <SectionTitle>Additional Details</SectionTitle>
          <Box sx={{ ...userFormStyles.formRow, flexWrap: 'nowrap', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            {/* Status Radio Buttons */}
            <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
              <StatusRadioButtons
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                disabled={false}
              />
            </Box>

            {/* Parent Attribute Dropdown - aligned with Department */}
            <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
              <ReusableMultiSelectField
                field="parentAttribute"
                label="Parent Attribute"
                options={parentAttributeOptions}
                placeholder="Select Parent Attribute"
                value={formData.parentAttribute}
                onChange={(value) => handleInputChange('parentAttribute', value)}
                required={true}
                error={!!validationErrors.parentAttribute}
                errorMessage={validationErrors.parentAttribute}
              />
            </Box>

            {/* Empty spacer to maintain alignment with Role Description column */}
            <Box sx={{ flex: '1 1 0', minWidth: 0 }} />
          </Box>

          {/* Horizontal Divider */}
          <Box sx={getHorizontalDividerStyles()} />
        </Box>

        {/* Permissions Table Section */}
        <RolePermissionsTable
          formData={formData}
          onInputChange={handleInputChange}
          isReadOnly={false}
          onDuplicateClick={handleDuplicateClick}
          onResetReady={(resetFn) => {
            permissionTableResetRef.current = resetFn;
          }}
          onPermissionChangesChange={(hasChanges) => {
            setHasPermissionChanges(hasChanges);
          }}
        />
      </Box>
      
      {/* Confirmation Dialog */}
      <NotificationAlert
        open={confirmOpen}
        variant="warning"
        title="Warning – Action Required"
        message={confirmMessage}
        onClose={handleConfirmNo}
        actions={[
          { label: 'No', onClick: handleConfirmNo, emphasis: 'secondary' },
          { label: 'Yes', onClick: handleConfirmYes, emphasis: 'primary' },
        ]}
      />
      
      {/* Duplicate Permission Panel */}
      <DuplicateRolePermissionPanelWrapper {...duplicatePermissionPanelProps} />
    </Box>
  );
};

export default RoleForm;

