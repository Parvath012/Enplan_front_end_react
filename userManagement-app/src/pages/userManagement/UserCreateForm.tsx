import React, { useEffect, useState } from 'react';
import { Box, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { EventsAlt } from '@carbon/icons-react';
import { fetchDepartments, fetchUsersForReporting, fetchUsers } from '../../store/Reducers/userSlice';
import { fetchRoles as fetchRolesFromRoleSlice } from '../../store/Reducers/roleSlice';
import { saveUser, checkEmailExists } from '../../services/userSaveService';
import type { RootState } from '../../store/configureStore';
import { syncAffectedRolesLockStatus } from '../../utils/roleLockUtils';
import type { User } from '../../services/userService';
import { validateRequiredFields as validateRequiredFieldsUtil, validateArrayFields, validateFormats, validateEmail, validatePhoneNumber } from '../../utils/formValidationUtils';
import { getUserFormStyles, getHorizontalDividerStyles, getSmallVerticalDividerStyles, getFlexBetweenContainerStyles, getActionButtonStyles, getButtonContentStyles, getButtonTextStyles } from '../../components/userManagement/PermissionTableConstants';
import { ReusableTextField, ReusableSelectField, SectionTitle, EmptyFormField } from '../../components/userManagement/UserFormComponents';
import type { UserFormData } from '../../types/UserFormData';
import {
  isInAdminApp,
  getNavigationPath,
  navigateToUserManagement,
  updateFormData,
  TabPanel,
  createCompleteUserData,
  validateSubmissionPrerequisites,
  showSaveConfirmationMessage,
  hideSaveConfirmationMessage,
  parsePermissionsData,
  mergeDuplicatePermissions
} from '../../utils/userFormUtils';
import { useUserFormState } from '../../hooks/useUserFormState';

// Import reusable components from common-app
import FormHeaderWithTabs from 'commonApp/FormHeaderWithTabs';
import CustomCheckbox from 'commonApp/CustomCheckbox';
import NotificationAlert from 'commonApp/NotificationAlert';
import PermissionsTabLayout from '../../components/userManagement/PermissionsTabLayout';
import BulkUploadPanel from '../../components/bulkUpload/BulkUploadPanel';
import DuplicatePermissionPanelWrapper from '../../components/userManagement/DuplicatePermissionPanelWrapper';
import { useDuplicatePermissionPanel } from '../../hooks/useDuplicatePermissionPanel';
import { useModulePermissions } from '../../hooks/useModulePermissions';



// Use shared user form styles
const userFormStyles = getUserFormStyles();

const UserCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Use shared form state hook
  const {
    activeTab,
    setActiveTab,
    isFormModified,
    setIsFormModified,
    confirmOpen,
    setConfirmOpen,
    confirmMessage,
    setConfirmMessage,
    confirmType,
    setConfirmType,
    notification,
    setNotification,
    isSaveSuccessful,
    setIsSaveSuccessful,
    isLoading,
    setIsLoading,
    validationErrors,
    setValidationErrors,
    savedUserId,
    setSavedUserId,
    currentUserIdRef,
    isDataSaved,
    setIsDataSaved,
    originalFormData,
    setOriginalFormData,
    isPermissionSaved,
    setIsPermissionSaved,
    originalPermissionData,
    setOriginalPermissionData,
    showSaveConfirmation,
    setShowSaveConfirmation,
    permissionResetTrigger,
    setPermissionResetTrigger,
    frontendSavedData,
    setFrontendSavedData,
    isUserDetailsSavedToFrontend,
    setIsUserDetailsSavedToFrontend,
    isPermissionsSavedToFrontend,
    setIsPermissionsSavedToFrontend,
    isSubmitLoading,
    setIsSubmitLoading,
    formData,
    setFormData
  } = useUserFormState();


  // Detect if running in admin app context
  const isAdminApp = isInAdminApp();

  // Bulk Upload Panel state
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Duplicate Permission Panel state
  const [isDuplicatePanelOpen, setIsDuplicatePanelOpen] = useState(false);

  // Get users data from Redux store for reporting manager options and navigation logic
  const { users, hasUsers } = useSelector((state: RootState) => state.users);
  
  // Get roles from Redux store
  const { roles, hasRoles, initialFetchAttempted: rolesInitialFetchAttempted } = useSelector((state: RootState) => state.roles);

  // Fetch module permissions data for duplicate panel
  const { modulesData } = useModulePermissions();

  // Convert roles from Redux state to dropdown format (array of role names)
  // Show all roles (both active and inactive)
  const roleOptions = roles
    .map(role => role.rolename)
    .filter((name): name is string => !!name); // Remove any undefined/null values

  // Temporary dummy data for departments (until API is implemented)
  const dummyDepartments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];
  
  // Create reporting users options from existing users
  const reportingUsersOptions = users.map(user => `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.emailid || 'Unknown User');

  // Removed unused variables: roles, departments, reportingUsers
  
  // Mock data for multi-select dropdowns

  // Load dropdown data on component mount
  useEffect(() => {
    // Fetch roles from role slice (not user slice)
    if (!rolesInitialFetchAttempted) {
      // @ts-ignore
      dispatch(fetchRolesFromRoleSlice());
    }
    // @ts-ignore
    dispatch(fetchDepartments());
    // @ts-ignore
    dispatch(fetchUsersForReporting());
  }, [dispatch, rolesInitialFetchAttempted]);

  // Track data saved state changes
  useEffect(() => {
    if (isDataSaved && originalFormData) {
      console.log('User data has been saved:', originalFormData);
    }
  }, [isDataSaved, originalFormData]);

  // Track permission saved state changes
  useEffect(() => {
    if (isPermissionSaved && originalPermissionData) {
      console.log('Permission data has been saved:', originalPermissionData);
    }
  }, [isPermissionSaved, originalPermissionData]);

  // Track button states for debugging
  useEffect(() => {
    console.log('Button States Updated:', {
      activeTab: activeTab === 0 ? 'User Details' : 'Permissions',
      isFormValid: isFormValid(),
      isFormModified,
      isUserDetailsSavedToFrontend,
      isPermissionsSavedToFrontend,
      isSaveSuccessful,
      saveButtonDisabled: isLoading || !isFormValid() || (activeTab === 0 ? (isUserDetailsSavedToFrontend && !isFormModified) : (isPermissionsSavedToFrontend && !isFormModified)),
      nextButtonDisabled: activeTab === 0 ? !isSaveSuccessful : (!isUserDetailsSavedToFrontend || !isPermissionsSavedToFrontend || isSubmitLoading)
    });
  }, [activeTab, isLoading, isFormModified, isUserDetailsSavedToFrontend, isPermissionsSavedToFrontend, isSaveSuccessful, isSubmitLoading, formData]);

  const handleTabChange = (_event: React.SyntheticEvent, _newValue: number) => {
    // Tab navigation is disabled - users cannot click between tabs
    // Navigation only happens through Next button (User Details -> Permissions)
    return;
  };


  // Helper function to check if data has changed from original saved state
  const checkDataChanged = (field: keyof UserFormData, newValue: any): boolean => {
    if (activeTab === 0) {
      // User Details tab
      if (!isDataSaved || !originalFormData) {
        // If not saved yet, check if any field has non-empty value to detect modification
        return true;
      }
      const originalValue = originalFormData[field];
      return JSON.stringify(originalValue) !== JSON.stringify(newValue);
    } else if (activeTab === 1) {
      // Permission tab
      if (!isPermissionSaved || !originalPermissionData) {
        // If not saved yet, check if any field has non-empty value to detect modification
        return true;
      }
      const originalValue = originalPermissionData[field];
      return JSON.stringify(originalValue) !== JSON.stringify(newValue);
    }
    return true;
  };

  // Helper function to handle self-reporting field updates
  const handleSelfReportingUpdate = (updates: Partial<UserFormData>): void => {
    updates.reportingManager = '';
    updates.dottedLineManager = '';
  };

  // Helper function to handle form modification tracking for user details tab
  const handleUserDetailsModification = (field: keyof UserFormData, value: any): void => {
    if (!isUserDetailsSavedToFrontend) {
      setIsFormModified(true);
      console.log('User Details modified (before save)');
    } else {
      const hasDataChanged = checkDataChanged(field, value);
      setIsFormModified(hasDataChanged);
      console.log('User Details modified after save:', hasDataChanged);
      
      if (hasDataChanged && isSaveSuccessful) {
        setIsSaveSuccessful(false);
        console.log('Next button disabled - User Details modified after save');
      }
    }
  };

  // Helper function to handle form modification tracking for permissions tab
  const handlePermissionsModification = (field: keyof UserFormData, value: any): void => {
    if (!isPermissionsSavedToFrontend) {
      setIsFormModified(true);
      console.log('Permissions modified (before save)');
    } else {
      const hasDataChanged = checkDataChanged(field, value);
      setIsFormModified(hasDataChanged);
      console.log('Permissions modified after save:', hasDataChanged);
    }
  };

  // Helper function to clear validation errors
  const clearValidationErrors = (field: keyof UserFormData, value: any): void => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (field === 'selfReporting' && value === true && validationErrors.reportingManager) {
      setValidationErrors(prev => ({ ...prev, reportingManager: '' }));
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string | boolean | string[] | UserFormData['permissions']): void => {
    // Update form data
    const updates: Partial<UserFormData> = { [field]: value };
    
    // Handle self-reporting field updates
    if (field === 'selfReporting' && value === true) {
      handleSelfReportingUpdate(updates);
    }
    
    updateFormData(setFormData, updates);
    
    // Handle form modification tracking based on active tab
    if (activeTab === 0) {
      handleUserDetailsModification(field, value);
    } else if (activeTab === 1) {
      handlePermissionsModification(field, value);
    }
    
    // Clear validation errors
    clearValidationErrors(field, value);
  };

  // Helper function to get error props for form fields
  const getErrorProps = (field: keyof UserFormData) => ({
    error: !!validationErrors[field],
    errorMessage: validationErrors[field]
  });


  // Validation helper functions following EntitySetupForm pattern
  const validateUserDetailsTab = (errors: Record<string, string>): void => {
    const requiredFields = [
      { field: 'firstName', message: 'First Name is required' },
      { field: 'lastName', message: 'Last Name is required' },
      { field: 'phoneNumber', message: 'Phone Number is required' },
      { field: 'role', message: 'Role is required' },
      { field: 'department', message: 'Department is required' },
      { field: 'emailId', message: 'Email Id is required' }
    ];

    validateRequiredFieldsUtil(formData, requiredFields, errors);

    if (!formData.selfReporting && !formData.reportingManager) {
      errors.reportingManager = 'Reporting Manager is required';
    }
  };

  const validatePermissionsTab = (errors: Record<string, string>): void => {
    const requiredArrayFields = [
      { field: 'regions', message: 'Regions is required' },
      { field: 'countries', message: 'Countries is required' },
      { field: 'divisions', message: 'Divisions is required' },
      { field: 'groups', message: 'Groups is required' },
      { field: 'departments', message: 'Departments is required' },
      { field: 'classes', message: 'Classes is required' },
      { field: 'subClasses', message: 'Sub Classes is required' }
    ];

    validateArrayFields(formData, requiredArrayFields, errors);
  };

  const validateCurrentTabFields = (errors: Record<string, string>): void => {
    if (activeTab === 0) {
      validateUserDetailsTab(errors);
    } else if (activeTab === 1) {
      validatePermissionsTab(errors);
    }
  };

  const validateFormFormats = (errors: Record<string, string>): void => {
    if (activeTab === 0) {
      const formatValidations = [
        {
          field: 'phoneNumber',
          validator: validatePhoneNumber,
          message: 'Phone Number must contain only numbers'
        },
        {
          field: 'emailId',
          validator: validateEmail,
          message: 'Please enter a valid email address'
        }
      ];

      validateFormats(formData, formatValidations, errors);
    }
    // Permissions tab doesn't need format validation (only dropdown selections)
  };

  // Main validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    validateCurrentTabFields(errors);
    validateFormFormats(errors);

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = () => {
    if (activeTab === 0) {
      // User Details tab - check mandatory fields
      const hasRequiredFields = !!(
        formData.firstName?.trim() &&
        formData.lastName?.trim() &&
        formData.phoneNumber?.trim() &&
        formData.role &&
        formData.department &&
        formData.emailId?.trim() &&
        (formData.selfReporting ? true : formData.reportingManager)
      );
      return hasRequiredFields;
    } else if (activeTab === 1) {
      // Permission tab - check if ALL mandatory permission fields are filled (7 dropdowns)
      const hasAllPermissionData = !!(
        (formData.regions && formData.regions.length > 0) &&
        (formData.countries && formData.countries.length > 0) &&
        (formData.divisions && formData.divisions.length > 0) &&
        (formData.groups && formData.groups.length > 0) &&
        (formData.departments && formData.departments.length > 0) &&
        (formData.classes && formData.classes.length > 0) &&
        (formData.subClasses && formData.subClasses.length > 0)
      );
      return hasAllPermissionData;
    }
    return false;
  };

  /**
   * Frontend-only save handler - saves to React state only, no API calls
   * 
   * Complete Flow:
   * 1. User fills User Details form (firstName, lastName, phoneNumber, role, department, emailId, 
   *    reportingManager OR selfReporting checkbox, and optional dottedLineManager)
   * 2. User clicks Save → Data saved to frontend state → Next button becomes enabled
   * 3. User clicks Next → Navigates to Permissions tab
   * 4. User fills Permissions form (7 multi-select dropdowns: regions, countries, divisions, 
   *    groups, departments, classes, subClasses) + selects module permissions
   * 5. User clicks Save → Data saved to frontend state
   * 6. User clicks Submit → Makes API call to save all data from both tabs to database
   * 
   * Note: Save button only saves to React state (useState) - NO API calls
   *       Submit button (on Permissions tab) makes the API call with all data
   */
  const handleSaveWithValidation = async () => {
    console.log('=== handleSaveWithValidation called ===');
    console.log('Active Tab:', activeTab === 0 ? 'User Details' : 'Permissions');
    console.log('Form Valid:', isFormValid());
    console.log('Form Data:', formData);
    
    // Validate form before saving
    if (!validateForm()) {
      console.log('❌ Validation failed, cannot save');
      return;
    }
    
    // Check email uniqueness for User Details tab
    if (activeTab === 0 && formData.emailId?.trim()) {
      try {
        const emailExists = await checkEmailExists(formData.emailId.trim());
        if (emailExists) {
          setValidationErrors(prev => ({ ...prev, emailId: 'Email already exists' }));
          console.log('❌ Email already exists:', formData.emailId);
          return;
        }
      } catch (error) {
        console.error('Error checking email uniqueness:', error);
        // Continue with save - database constraint will catch duplicates
      }
    }
    
    setIsLoading(true);
    try {
      // Save current form data to frontend state only (no API call)
      if (activeTab === 0) {
        // User Details tab - save to frontend state
        setIsUserDetailsSavedToFrontend(true);
        setOriginalFormData({ ...formData });
        setIsDataSaved(true);
        setIsFormModified(false);
        setIsSaveSuccessful(true); // Enable Next button after successful save
        console.log('✅ User Details saved to frontend state (NO API CALL)');
        console.log('   - Next button should now be enabled');
        console.log('   - Save button should now be disabled until next modification');
      } else if (activeTab === 1) {
        // Permission tab - save to frontend state
        setIsPermissionsSavedToFrontend(true);
        setOriginalPermissionData({ ...formData });
        setIsPermissionSaved(true);
        setIsFormModified(false);
        console.log('✅ Permissions saved to frontend state (NO API CALL)');
        console.log('   - Submit button should now be enabled');
        console.log('   - Save button should now be disabled until next modification');
      }

      // Update the combined frontend saved data
      setFrontendSavedData({ ...formData });
      
      // Show confirmation message
      showSaveConfirmationMessage(setShowSaveConfirmation);
      console.log('   - "All Changes Saved" message displayed for 7.5 seconds');
      
    } catch (error) {
      console.error('❌ Error saving to frontend:', error);
      setNotification({ type: 'error', message: 'Failed to save data. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit handler - makes API call with all data from both tabs
  const handleSubmitToDatabase = async () => {
    if (!validateSubmissionPrerequisites(frontendSavedData, isUserDetailsSavedToFrontend, isPermissionsSavedToFrontend, setNotification)) {
      return;
    }

    // Double-check email uniqueness before submitting (safety check)
    if (frontendSavedData?.emailId?.trim()) {
      try {
        const emailExists = await checkEmailExists(frontendSavedData.emailId.trim());
        if (emailExists) {
          setValidationErrors(prev => ({ ...prev, emailId: 'Email already exists' }));
          console.log('❌ Email already exists before submit:', frontendSavedData.emailId);
          return;
        }
      } catch (error) {
        console.error('Error checking email uniqueness before submit:', error);
        // Continue with submit - database constraint will catch duplicates
      }
    }

    setIsSubmitLoading(true);
    try {
      // Prepare complete user data for API call using shared utility
      const completeUserData = createCompleteUserData(frontendSavedData!, savedUserId, 'create');

      // Single API call with all data (add operation for new user)
      const operationType: 'n' | 'u' = 'n';
      const response = await saveUser(completeUserData, operationType);
      console.log('Complete user data submitted to database:', response);

      // Handle response for new user creation
      console.log('New user created successfully in database with all data from both tabs.');

      // Navigate to User Directory page after successful submission
      const isAdminApp = window.location.pathname.includes('/admin/user-management');
      
      // Refresh the user list to show the new user
      // @ts-ignore
      const fetchUsersResult = dispatch(fetchUsers());
      const updatedUsers: User[] = (fetchUsersResult?.payload as User[]) ?? users ?? [];
      console.log('User list refreshed after successful submission');
      
      // Refresh roles to get latest role data before syncing lock status
      // @ts-ignore
      const fetchRolesResult = dispatch(fetchRolesFromRoleSlice());
      const updatedRoles = (fetchRolesResult?.payload as any[]) ?? roles ?? [];
      
      // Sync role lock status for the role assigned to this user
      if (frontendSavedData?.role && updatedRoles.length > 0) {
        try {
          await syncAffectedRolesLockStatus(
            [frontendSavedData.role],
            updatedRoles,
            updatedUsers
          );
          // Refresh roles again to show updated lock status in UI
          // @ts-ignore
          dispatch(fetchRolesFromRoleSlice());
        } catch (error) {
          console.error('Error syncing role lock status:', error);
          // Continue navigation even if sync fails
        }
      }
      
      navigate(isAdminApp ? '/admin/user-management' : '/user-management');
      
    } catch (error) {
      console.error('Error submitting to database:', error);
      setNotification({ type: 'error', message: 'Failed to submit to database. Please try again.' });
    } finally {
      setIsSubmitLoading(false);
    }
  };

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
    setIsFormModified(true);
  };

  // Use hook to prepare duplicate permission panel props
  const duplicatePermissionPanelProps = useDuplicatePermissionPanel({
    formData,
    users,
    modulesData,
    isDuplicatePanelOpen,
    setIsDuplicatePanelOpen,
    handleDuplicatePermissions,
    setNotification
  });

  const handleReset = (): void => {
    if (activeTab === 0) {
      // User Details tab - Clear only user details fields to fresh/empty state
      const userDetailsFields: Partial<UserFormData> = {
        id: undefined,
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: '',
        department: '',
        emailId: '',
        selfReporting: false,
        reportingManager: '',
        dottedLineManager: '',
      };
      updateFormData(setFormData, userDetailsFields);
      
      // Reset user details specific states
      setIsSaveSuccessful(false);
      setSavedUserId(null);
      currentUserIdRef.current = null;
      setIsDataSaved(false);
      setIsUserDetailsSavedToFrontend(false);
      setOriginalFormData(null);
      
      // Clear stored user ID
      localStorage.removeItem('currentUserId');
      sessionStorage.removeItem('currentUserId');
      
      console.log('User Details tab reset to fresh/empty state');
      
    } else if (activeTab === 1) {
      // Permissions tab - Clear only permission fields to fresh/empty state
      const permissionFields: Partial<UserFormData> = {
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: [],
        permissions: undefined
      };
      updateFormData(setFormData, permissionFields);
      
      // Reset permission specific states
      setIsPermissionSaved(false);
      setIsPermissionsSavedToFrontend(false);
      setOriginalPermissionData(null);
      
      // Trigger permission table reset to clear all selections
      setPermissionResetTrigger(prev => prev + 1);
      
      console.log('Permissions tab reset to fresh/empty state');
    }
    
    setIsFormModified(false);
    setValidationErrors({});
    
    // Only clear frontend saved data if both tabs have been reset
    if (!isUserDetailsSavedToFrontend && !isPermissionsSavedToFrontend) {
      setFrontendSavedData(null);
    }
  };

  const handleCancel = (): void => {
    // Check if there are unsaved modifications OR if any data has been saved to frontend state
    // After saving, isFormModified becomes false, but we should still show warning if data was saved
    const hasSavedData = isUserDetailsSavedToFrontend || isPermissionsSavedToFrontend;
    
    if (isFormModified || hasSavedData) {
      // Show warning popup if there are unsaved changes or if data has been saved
      openConfirm('cancel');
    } else {
      // Navigate directly if no changes and no saved data
      navigateToUserManagement(navigate);
    }
  };

  // Helper function to discard unsaved permission changes
  const discardPermissionChanges = (): void => {
    if (isPermissionsSavedToFrontend && originalPermissionData) {
      // Permissions were previously saved - restore to saved state
      console.log('Restoring permissions to last saved state');
      const permissionFields: Partial<UserFormData> = {
        regions: originalPermissionData.regions || [],
        countries: originalPermissionData.countries || [],
        divisions: originalPermissionData.divisions || [],
        groups: originalPermissionData.groups || [],
        departments: originalPermissionData.departments || [],
        classes: originalPermissionData.classes || [],
        subClasses: originalPermissionData.subClasses || [],
        permissions: originalPermissionData.permissions
      };
      updateFormData(setFormData, permissionFields);
    } else {
      // Permissions were never saved - clear permission fields
      console.log('Clearing unsaved permission changes');
      const permissionFields: Partial<UserFormData> = {
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: [],
        permissions: undefined
      };
      updateFormData(setFormData, permissionFields);
    }
    
    // Trigger permission table reset to ensure PermissionsTabLayout resets its internal state
    setPermissionResetTrigger(prev => prev + 1);
    
    // Reset form modification state
    setIsFormModified(false);
    console.log('Permission changes discarded - form modification state reset');
  };

  // Helper function to handle back from Permissions tab
  const handleBackFromPermissionsTab = (): void => {
    console.log('Back: Permissions tab → User Details tab');
    // Hide save confirmation message when switching tabs
    hideSaveConfirmationMessage(setShowSaveConfirmation);
    
    // Discard unsaved permission changes when leaving Permissions tab
    if (isFormModified) {
      console.log('Discarding unsaved permission changes');
      discardPermissionChanges();
    }
    
    // Reset form modification state when switching back to User Details tab
    // The form should reflect the saved state, not be marked as modified
    if (isUserDetailsSavedToFrontend) {
      setIsFormModified(false);
      console.log('Form modification state reset - User Details tab reflects saved state');
    }
    
    setActiveTab(0);
  };

  // Helper function to handle back from User Details tab
  const handleBackFromUserDetailsTab = (): void => {
    console.log('Back: User Details tab → Welcome/Roles/User Directory');
    
    const isAdminApp = isInAdminApp();
    const basePath = isAdminApp ? '/admin/user-management' : '/user-management';
    
    // If roles exist but no users, navigate to roles list page
    if (hasRoles && !hasUsers) {
      navigate(`${basePath}/roles`);
    } else {
      // Otherwise use existing navigation logic (welcome or users list)
      const targetPath = getNavigationPath(hasUsers);
      navigate(targetPath);
    }
  };

  const handleBack = (): void => {
    if (activeTab === 1) {
      handleBackFromPermissionsTab();
    } else if (activeTab === 0) {
      handleBackFromUserDetailsTab();
    }
  };

  const handleNext = (): void => {
    if (activeTab === 0) {
      // From User Details tab to Permissions tab
      // Next button should only work after successful frontend save
      if (isSaveSuccessful) {
        console.log('✓ Moving from User Details to Permissions tab');
        // Hide save confirmation message when switching tabs
        hideSaveConfirmationMessage(setShowSaveConfirmation);
        
        // Switch to Permission tab
        setActiveTab(1);
      } else {
        console.log('⚠ Cannot proceed to Permissions tab - User Details not saved');
        setNotification({ type: 'warning', message: 'Please save User Details before proceeding to Permissions tab.' });
      }
    }
  };

  // Confirmation helpers following entity pattern
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

  const handleConfirmYes = (): void => {
    if (confirmType === 'reset') {
      handleReset();
      closeConfirm();
    } else if (confirmType === 'cancel') {
      navigateToUserManagement(navigate);
      closeConfirm();
    }
  };

  const handleConfirmNo = (): void => {
    closeConfirm();
  };

  return (
    <Box 
      className={`user-create-form ${isAdminApp ? 'admin-app-context' : ''}`}
      sx={{
        ...userFormStyles.container,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        width: '100%',
        // Additional styles for admin app context
        ...(isAdminApp && {
          height: '100%',
          maxHeight: '100%',
          position: 'relative',
        }),
      }}>
      {notification && (
        <NotificationAlert
          open={true}
          variant={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          autoHideDuration={3000}
        />
      )}

      {/* Sticky Header - accounts for admin app header */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        width: '100%',
        height: '40px',
        minHeight: '40px',
        flexShrink: 0,
        borderBottom: '1px solid #e0e0e0',
        // Ensure sticky behavior works in admin app
        ...(isAdminApp && {
          position: 'sticky',
          top: 0,
          zIndex: 1001, // Higher than admin app header
        }),
      }}>
        <FormHeaderWithTabs
          title="Add User"
          tabs={[
            { label: "User Details", value: 0 },
            { label: "Permissions", value: 1 }
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onBack={handleBack}
          onReset={() => openConfirm('reset')}
          onCancel={handleCancel}
          onSave={handleSaveWithValidation}
          onNext={activeTab === 1 ? handleSubmitToDatabase : handleNext}
          isFormModified={isFormModified}
          isSaveDisabled={
            isLoading || 
            !isFormValid() || 
            (activeTab === 0 ? (isUserDetailsSavedToFrontend && !isFormModified) : (isPermissionsSavedToFrontend && !isFormModified))
          }
          isNextDisabled={activeTab === 0 ? !isSaveSuccessful : (!isUserDetailsSavedToFrontend || !isPermissionsSavedToFrontend || !isFormValid() || isFormModified || isSubmitLoading)}
          showSaveButton={true}
          showNextButton={true}
          useSubmitIcon={activeTab === 1}
          submitButtonText="Submit"
          statusMessage={showSaveConfirmation ? "All Changes Saved" : undefined}
        />
      </Box>

      {/* Scrollable Content Container */}
      <Box
        className={isAdminApp ? 'user-create-scrollable' : ''}
        sx={{
          ...userFormStyles.scrollableContent,
          flex: '1 1 auto',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: 'calc(100% - 40px)',
          // Additional styles for admin app context
          ...(isAdminApp && {
            height: 'calc(100% - 40px)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }),
        }}
      >
        <Container 
          maxWidth={false} 
          sx={{ 
            maxWidth: '100% !important',
            width: '100% !important',
            margin: '0 !important',
            padding: '12px !important',
            boxSizing: 'border-box !important',
            mt: '12px !important', 
            alignItems: 'stretch',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TabPanel value={activeTab} index={0}>
            {/* Single Basic Details Section */}
            <Box sx={{ ...userFormStyles.formSection, padding: '12px !important' }}>
              <Box sx={{ ...getFlexBetweenContainerStyles(), mb: 1.5 }}>
                <SectionTitle sx={{
                  display: 'flex', 
                  alignItems: 'center',mb: 0}}>
                  Basic Details
                </SectionTitle>
                <Button
                  sx={getActionButtonStyles()}
                  onClick={() => {
                    console.log('Bulk Upload button clicked in UserCreateForm, opening panel');
                    setIsBulkUploadOpen(true);
                  }}
                >
                  <Box
                    sx={getButtonContentStyles()}
                  >
                    <EventsAlt width={18} height={18} color="#D0F0FF" />
                    <Box
                      component="span"
                      sx={getButtonTextStyles()}
                    >
                      Bulk Upload
                    </Box>
                  </Box>
                </Button>
              </Box>
              
              {/* Row 1: First Name, Last Name, Phone Number */}
              <Box sx={{ ...userFormStyles.formRow, mb: 1.75 }}>
                <ReusableTextField
                  field="firstName"
                  label="First Name"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(value: string) => handleInputChange('firstName', value)}
                  {...getErrorProps('firstName')}
                />
                <ReusableTextField
                  field="lastName"
                  label="Last Name"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(value: string) => handleInputChange('lastName', value)}
                  {...getErrorProps('lastName')}
                />
                <ReusableTextField
                  field="phoneNumber"
                  label="Phone Number"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(value: string) => handleInputChange('phoneNumber', value)}
                  {...getErrorProps('phoneNumber')}
                />
              </Box>
              
              {/* Row 2: Role, Department */}
              <Box sx={{ ...userFormStyles.formRow, rowGap: 0 }}>
                <ReusableSelectField
                  field="role"
                  label="Role"
                  options={roleOptions}
                  placeholder="Select Role"
                  value={formData.role}
                  onChange={(value: string) => handleInputChange('role', value)}
                  {...getErrorProps('role')}
                />
                <ReusableSelectField
                  field="department"
                  label="Department"
                  options={dummyDepartments}
                  placeholder="Select Department"
                  value={formData.department}
                  onChange={(value: string) => handleInputChange('department', value)}
                  {...getErrorProps('department')}
                />
                <EmptyFormField />
              </Box>

              {/* Horizontal Divider */}
              <Box sx={getHorizontalDividerStyles()} />
              
              {/* Account Details and Reporting Details with Fields */}
              <Box sx={{
                position: 'relative',
                
                // Desktop (≥ 1200px): Horizontal layout with vertical line between sections
                '@media (min-width: 1200px)': {
                  display: 'flex',
                  flexDirection: 'row',
                  columnGap: '24px',
                  alignItems: 'start',
                  
                  // Vertical line positioned between Account Details and Reporting Details sections
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 'calc(33%)', // Position at the edge of Account Details section
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: '#E0E0E0',
                    zIndex: 1,
                  },
                },
                
                // Tablet (768px – 1199px): Grid layout with vertical line
                '@media (min-width: 768px) and (max-width: 1199px)': {
                  display: 'grid',
                  gridTemplateColumns: '1fr 1px 1fr',
                  columnGap: '24px',
                  rowGap: '14px',
                  alignItems: 'start',
                },
                
                // Mobile: Stack vertically
                '@media (max-width: 767px)': {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                },
              }}>
                
                {/* Account Details Section */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  
                  // Desktop: 1/3 width
                  '@media (min-width: 1200px)': {
                    flex: '1 1 calc(33.333% - 16px)',
                  },
                  
                  // Tablet: First grid section
                  '@media (min-width: 768px) and (max-width: 1199px)': {
                    gridColumn: '1',
                  },
                  
                  // Mobile: Full width
                  '@media (max-width: 767px)': {
                    width: '100%',
                  },
                }}>
                  {/* Account Details Header */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <SectionTitle sx={{ lineHeight: '1', margin: 0 }}>
                      Account Details
                    </SectionTitle>
                  </Box>

                  {/* Email ID Field */}
                  <ReusableTextField
                    field="emailId"
                    label="Email Id"
                    placeholder="Email Id"
                    value={formData.emailId}
                    onChange={(value: string) => handleInputChange('emailId', value)}
                    {...getErrorProps('emailId')}
                  />
                </Box>

                {/* Vertical Line for Tablet */}
                <Box sx={{
                  backgroundColor: '#E0E0E0',
                  width: '2px',
                  display: 'none',
                  
                  // Only show on tablet
                  '@media (min-width: 768px) and (max-width: 1199px)': {
                    display: 'block',
                    gridColumn: '2',
                    alignSelf: 'stretch',
                    minHeight: '120px',
                  },
                }} />

                {/* Reporting Details Section */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  
                  // Desktop: 2/3 width
                  '@media (min-width: 1200px)': {
                    flex: '1 1 calc(66.666% - 8px)',
                  },
                  
                  // Tablet: Third grid section
                  '@media (min-width: 768px) and (max-width: 1199px)': {
                    gridColumn: '3',
                  },
                  
                  // Mobile: Full width
                  '@media (max-width: 767px)': {
                    width: '100%',
                  },
                }}>
                  {/* Reporting Details Header */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    height: '16px'
                  }}>
                    <SectionTitle sx={{ lineHeight: '1', margin: 0 }}>
                      Reporting Details
                    </SectionTitle>
                    <Box sx={getSmallVerticalDividerStyles()} />
                    <CustomCheckbox
                      label="Self Reporting"
                      checked={formData.selfReporting}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        handleInputChange('selfReporting', event.target.checked);
                      }}
                    />
                  </Box>

                  {/* Reporting Fields Container */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    
                    // Desktop: Arrange fields horizontally
                    '@media (min-width: 1200px)': {
                      flexDirection: 'row',
                      gap: '24px',
                    },
                  }}>
                    {/* Reporting Manager Field */}
                    <Box sx={{
                      flex: '1 1 50%',
                      minWidth: '200px',
                      
                      '@media (max-width: 1199px)': {
                        flex: '1 1 100%',
                      },
                    }}>
                      <ReusableSelectField
                        field="reportingManager"
                        label="Reporting Manager"
                        options={reportingUsersOptions}
                        placeholder={formData.selfReporting ? "Self" : "Select Reporting Manager"}
                        value={formData.reportingManager}
                        onChange={(value: string) => handleInputChange('reportingManager', value)}
                        required={true}
                        disabled={formData.selfReporting}
                        {...getErrorProps('reportingManager')}
                      />
                    </Box>

                    {/* Dotted Line Manager Field */}
                    <Box sx={{
                      flex: '1 1 50%',
                      minWidth: '200px',
                      
                      '@media (max-width: 1199px)': {
                        flex: '1 1 100%',
                      },
                      // Ensure 8px border-radius for Dotted Line Manager dropdown
                      '& .form-field__select': {
                        borderRadius: '8px !important',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px !important',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderRadius: '8px !important',
                          },
                          '& fieldset': {
                            borderRadius: '8px !important',
                          },
                        },
                      },
                    }}>
                      <ReusableSelectField
                        field="dottedLineManager"
                        label="Dotted Line Manager/Project Manager"
                        options={reportingUsersOptions}
                        placeholder={formData.selfReporting ? "" : "Select Dotted Line Manager"}
                        value={formData.dottedLineManager}
                        onChange={(value: string) => handleInputChange('dottedLineManager', value)}
                        disabled={formData.selfReporting}
                        required={false}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ '& > div': { padding: '12px !important' } }}>
              <PermissionsTabLayout 
                formData={formData}
                onInputChange={handleInputChange}
                resetTrigger={permissionResetTrigger}
                onDuplicateClick={() => setIsDuplicatePanelOpen(true)}
              />
            </Box>
          </TabPanel>
        </Container>
      </Box>

      {/* Top-right confirmation for Reset/Cancel following entity pattern */}
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

      {/* Bulk Upload Panel */}
      <BulkUploadPanel
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
      />

      {/* Duplicate Permission Panel */}
      <DuplicatePermissionPanelWrapper {...duplicatePermissionPanelProps} />
    </Box>
  );
};

export default UserCreateForm;