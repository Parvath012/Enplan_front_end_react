import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments, fetchUsersForReporting, fetchUsers } from '../../store/Reducers/userSlice';
import { fetchRoles as fetchRolesFromRoleSlice } from '../../store/Reducers/roleSlice';
import { saveUser } from '../../services/userSaveService';
import { userService } from '../../services/userService';
import type { RootState } from '../../store/configureStore';
import { syncAffectedRolesLockStatus } from '../../utils/roleLockUtils';
import type { User } from '../../services/userService';
import type { UserFormData } from '../../types/UserFormData';
import {
  createUserFormData,
  isInAdminApp,
  getNavigationPath,
  navigateToUserManagement,
  handleError,
  setFormDataStates,
  TabPanel,
  FormDataState,
  createCompleteUserData,
  validateSubmissionPrerequisites,
  hideSaveConfirmationMessage,
  compareUserDetailsFields,
  comparePermissionFields,
  resetFormData,
  parsePermissionsData,
  mergeDuplicatePermissions
} from '../../utils/userFormUtils';
import { useUserFormState } from '../../hooks/useUserFormState';
import { getUserFormStyles } from '../../components/userManagement/PermissionTableConstants';

// Import reusable components from common-app
import NotificationAlert from 'commonApp/NotificationAlert';

// Import new smaller components
import FormHeader from '../../components/userManagement/FormHeader';
import { useFormValidation } from '../../components/userManagement/FormValidation';
import { useFormStateManager } from '../../components/userManagement/FormStateManager';
import UserDetailsForm from '../../components/userManagement/UserDetailsForm';
import PermissionsForm from '../../components/userManagement/PermissionsForm';
import DuplicatePermissionPanelWrapper from '../../components/userManagement/DuplicatePermissionPanelWrapper';
import { useDuplicatePermissionPanel } from '../../hooks/useDuplicatePermissionPanel';
import { useModulePermissions } from '../../hooks/useModulePermissions';

const userFormStyles = getUserFormStyles();


const UserEditForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  
  // Use shared form state hook
  const {
    activeTab,
    setActiveTab,
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
    setFormData,
    initialLoadedFormData,
    setInitialLoadedFormData,
    initialLoadedPermissionData,
    setInitialLoadedPermissionData
  } = useUserFormState();

  // Additional state specific to edit form
  const [isUserDetailsModified, setIsUserDetailsModified] = useState(false);
  const [isPermissionsModified, setIsPermissionsModified] = useState(false);
  const [hasUserDetailsChanges, setHasUserDetailsChanges] = useState(false);
  const [hasPermissionsChanges, setHasPermissionsChanges] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  
  // Duplicate Permission Panel state
  const [isDuplicatePanelOpen, setIsDuplicatePanelOpen] = useState(false);

  const { users, hasUsers } = useSelector((state: RootState) => state.users);
  
  // Get roles from Redux store
  const { roles, initialFetchAttempted: rolesInitialFetchAttempted } = useSelector((state: RootState) => state.roles);
  
  // Store initial role to detect role changes
  const [initialUserRole, setInitialUserRole] = useState<string | null>(null);

  // Convert roles from Redux state to dropdown format (array of role names)
  // Show all roles (both active and inactive)
  const roleOptions = roles
    .map(role => role.rolename)
    .filter((name): name is string => !!name); // Remove any undefined/null values

  const dummyDepartments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];
  const reportingUsersOptions = users.map(user => `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.emailid || 'Unknown User');

  // Fetch module permissions data for duplicate panel
  const { modulesData } = useModulePermissions();

  // Initialize form validation and state management
  const formValidation = useFormValidation({
    activeTab,
    formData,
    validationErrors,
    setValidationErrors
  });

  const formStateManager = useFormStateManager({
    activeTab,
    formData,
    setFormData,
    originalFormData,
    originalPermissionData,
    isDataSaved,
    isPermissionSaved,
    isUserDetailsSavedToFrontend,
    isPermissionsSavedToFrontend,
    isSaveSuccessful,
    setIsSaveSuccessful,
    setIsUserDetailsModified,
    setIsPermissionsModified,
    setValidationErrors,
    setShowSaveConfirmation,
    setPermissionResetTrigger,
    setOriginalFormData,
    setOriginalPermissionData,
    setIsUserDetailsSavedToFrontend,
    setIsPermissionsSavedToFrontend,
    setIsDataSaved,
    setIsPermissionSaved,
    setFrontendSavedData,
    initialLoadedFormData,
    initialLoadedPermissionData
  });

  const handleSaveWithValidation = async () => {
    try {
      await formStateManager.handleSaveWithValidation(formValidation.validateForm, setIsLoading);
      // After save, check if there are still changes from initial loaded state
      if (activeTab === 0 && initialLoadedFormData) {
        const hasChanges = compareUserDetailsFields(formData, initialLoadedFormData);
        setHasUserDetailsChanges(hasChanges);
      } else if (activeTab === 1 && initialLoadedPermissionData) {
        const hasChanges = comparePermissionFields(formData, initialLoadedPermissionData);
        setHasPermissionsChanges(hasChanges);
      }
    } catch (error) {
      handleError(error, setNotification, navigate, 'Failed to save data. Please try again.');
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
    setIsPermissionsModified(true);
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

  // Event handlers using the new components
  const handleInputChange = (field: keyof UserFormData, value: string | boolean | string[] | UserFormData['permissions']) => {
    formStateManager.handleInputChange(field, value);
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Track that changes are being made
    if (activeTab === 0) {
      setIsUserDetailsModified(true);
    } else if (activeTab === 1) {
      setIsPermissionsModified(true);
    }
  };

  // Track changes from initial loaded state for reset button enablement
  useEffect(() => {
    if (initialLoadedFormData && initialLoadedPermissionData) {
      // Check user details changes from initial loaded state (for reset button)
      const hasUserDetailsChangesFromInitial = compareUserDetailsFields(formData, initialLoadedFormData);
      setHasUserDetailsChanges(hasUserDetailsChangesFromInitial);
      
      // Sync isUserDetailsModified with actual changes
      // Compare with saved frontend data if available, otherwise compare with initial loaded data
      if (activeTab === 0) {
        const comparisonData = originalFormData || initialLoadedFormData;
        const hasChangesFromSaved = compareUserDetailsFields(formData, comparisonData);
        setIsUserDetailsModified(hasChangesFromSaved);
      }
      
      // Check permissions changes from initial loaded state (for reset button)
      const hasPermissionsChangesFromInitial = comparePermissionFields(formData, initialLoadedPermissionData);
      setHasPermissionsChanges(hasPermissionsChangesFromInitial);
      
      // Sync isPermissionsModified with actual changes
      // Compare with saved frontend data if available, otherwise compare with initial loaded data
      if (activeTab === 1) {
        const comparisonData = originalPermissionData || initialLoadedPermissionData;
        const hasChangesFromSaved = comparePermissionFields(formData, comparisonData);
        setIsPermissionsModified(hasChangesFromSaved);
      }
    }
  }, [formData, initialLoadedFormData, initialLoadedPermissionData, originalFormData, originalPermissionData, activeTab]);

  const handleSubmitToDatabase = async () => {
    if (!validateSubmissionPrerequisites(frontendSavedData, isUserDetailsSavedToFrontend, isPermissionsSavedToFrontend, setNotification)) {
      return;
    }

    if (isPermissionsModified) {
      setNotification({ type: 'warning', message: 'Please save Permissions before submitting.' });
      return;
    }

    setIsSubmitLoading(true);
    try {
      // Prepare complete user data for API call using shared utility
      const completeUserData = createCompleteUserData(frontendSavedData!, savedUserId, 'update');

      await saveUser(completeUserData, 'u');
      // @ts-ignore
      const fetchUsersResult = dispatch(fetchUsers());
      const updatedUsers: User[] = (fetchUsersResult?.payload as User[]) ?? users ?? [];
      
      // Refresh roles to get latest role data before syncing lock status
      // @ts-ignore
      const fetchRolesResult = dispatch(fetchRolesFromRoleSlice());
      const updatedRoles = (fetchRolesResult?.payload as any[]) ?? roles ?? [];
      
      // Sync role lock status for affected roles (old role if changed, new role)
      const affectedRoles: string[] = [];
      if (frontendSavedData?.role) {
        affectedRoles.push(frontendSavedData.role);
      }
      // If role was changed, also sync the old role
      if (initialUserRole && initialUserRole !== frontendSavedData?.role) {
        affectedRoles.push(initialUserRole);
      }
      
      if (affectedRoles.length > 0 && updatedRoles.length > 0) {
        try {
          await syncAffectedRolesLockStatus(
            affectedRoles,
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
      
      navigateToUserManagement(navigate);
    } catch (error) {
      handleError(error, setNotification, navigate, 'Failed to submit to database. Please try again.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleReset = () => {
    // Reset only the current active tab to initial loaded state
    if (initialLoadedFormData && initialLoadedPermissionData) {
      if (activeTab === 0) {
        // Reset user details tab only
        const userDetailsFields: (keyof UserFormData)[] = ['id', 'firstName', 'lastName', 'phoneNumber', 'role', 'department', 'emailId', 'selfReporting', 'reportingManager', 'dottedLineManager'];
        resetFormData(setFormData, initialLoadedFormData, userDetailsFields);
        
        // Reset only user details modification states
        setIsUserDetailsModified(false);
        setHasUserDetailsChanges(false);
        
        // Mark user details as saved to frontend by updating original data to match reset state
        // This ensures save button stays disabled after reset
        setOriginalFormData({ ...initialLoadedFormData });
        setIsUserDetailsSavedToFrontend(true);
        setIsDataSaved(true);
        
        // Update frontend saved data to match reset state (only user details part)
        // Preserve permissions data if it exists in frontendSavedData
        if (frontendSavedData) {
          const updatedData = { 
            ...frontendSavedData,
            // Reset user details fields to initial loaded state
            id: initialLoadedFormData.id,
            firstName: initialLoadedFormData.firstName,
            lastName: initialLoadedFormData.lastName,
            phoneNumber: initialLoadedFormData.phoneNumber,
            role: initialLoadedFormData.role,
            department: initialLoadedFormData.department,
            emailId: initialLoadedFormData.emailId,
            selfReporting: initialLoadedFormData.selfReporting,
            reportingManager: initialLoadedFormData.reportingManager,
            dottedLineManager: initialLoadedFormData.dottedLineManager
          };
          setFrontendSavedData(updatedData);
        } else {
          // If no frontend saved data exists, set to initial loaded form data
          setFrontendSavedData({ ...initialLoadedFormData });
        }
      } else if (activeTab === 1) {
        // Reset permissions tab only
        const permissionFields: (keyof UserFormData)[] = ['regions', 'countries', 'divisions', 'groups', 'departments', 'classes', 'subClasses', 'permissions'];
        resetFormData(setFormData, initialLoadedPermissionData, permissionFields);
        
        // Trigger permission reset
        setPermissionResetTrigger(prev => prev + 1);
        
        // Reset only permissions modification states
        setIsPermissionsModified(false);
        setHasPermissionsChanges(false);
        
        // Mark permissions as saved to frontend by updating original data to match reset state
        // This ensures save button stays disabled after reset
        setOriginalPermissionData({ ...initialLoadedPermissionData });
        setIsPermissionsSavedToFrontend(true);
        setIsPermissionSaved(true);
        
        // Update frontend saved data to match reset state (only permissions part)
        // Preserve user details data if it exists in frontendSavedData
        if (frontendSavedData) {
          const updatedData = { 
            ...frontendSavedData,
            // Reset permissions fields to initial loaded state
            regions: initialLoadedPermissionData.regions,
            countries: initialLoadedPermissionData.countries,
            divisions: initialLoadedPermissionData.divisions,
            groups: initialLoadedPermissionData.groups,
            departments: initialLoadedPermissionData.departments,
            classes: initialLoadedPermissionData.classes,
            subClasses: initialLoadedPermissionData.subClasses,
            permissions: initialLoadedPermissionData.permissions
          };
          setFrontendSavedData(updatedData);
        } else {
          // If no frontend saved data exists, set to initial loaded permission data
          setFrontendSavedData({ ...initialLoadedPermissionData });
        }
      }
      
      // Clear validation errors for the current tab
      setValidationErrors({});
    }
  };


  const handleCancel = () => {
    // Check if there are any actual changes from initial loaded state using normalized comparison
    // This ensures we only show warning if there are real changes, not just array reordering
    let hasAnyChanges = false;
    
    if (initialLoadedFormData && initialLoadedPermissionData) {
      // Check user details changes using normalized comparison
      const hasUserDetailsChangesFromInitial = compareUserDetailsFields(formData, initialLoadedFormData);
      
      // Check permissions changes using normalized comparison (handles array ordering correctly)
      const hasPermissionsChangesFromInitial = comparePermissionFields(formData, initialLoadedPermissionData);
      
      hasAnyChanges = hasUserDetailsChangesFromInitial || hasPermissionsChangesFromInitial;
    } else {
      // If we don't have initial data, check if form has any values (for create mode)
      hasAnyChanges = !!(
        formData.firstName?.trim() ||
        formData.lastName?.trim() ||
        formData.emailId?.trim() ||
        formData.phoneNumber?.trim() ||
        formData.role?.trim() ||
        formData.department?.trim() ||
        (formData.regions && formData.regions.length > 0) ||
        (formData.countries && formData.countries.length > 0) ||
        (formData.divisions && formData.divisions.length > 0) ||
        (formData.groups && formData.groups.length > 0) ||
        (formData.departments && formData.departments.length > 0) ||
        (formData.classes && formData.classes.length > 0) ||
        (formData.subClasses && formData.subClasses.length > 0) ||
        (formData.permissions && (
          (formData.permissions.enabledModules && formData.permissions.enabledModules.length > 0) ||
          (formData.permissions.selectedPermissions && formData.permissions.selectedPermissions.length > 0)
        ))
      );
    }
    
    if (hasAnyChanges) {
      // Show warning popup if there are any actual changes
      openConfirm('cancel');
    } else {
      // Navigate directly if no changes
      navigateToUserManagement(navigate);
    }
  };

  const handleBack = () => {
    if (activeTab === 1) {
      // If there are unsaved permission changes, discard them by resetting to saved state
      if (isPermissionsModified && !isPermissionsSavedToFrontend) {
        // Reset permissions to initial loaded state (discard unsaved changes)
        if (initialLoadedPermissionData) {
          const permissionFields: (keyof UserFormData)[] = ['regions', 'countries', 'divisions', 'groups', 'departments', 'classes', 'subClasses', 'permissions'];
          resetFormData(setFormData, initialLoadedPermissionData, permissionFields);
          
          // Trigger permission reset to update PermissionsTabLayout component
          setPermissionResetTrigger(prev => prev + 1);
        }
      } else if (isPermissionsModified && isPermissionsSavedToFrontend && originalPermissionData) {
        // If permissions were saved but then modified, reset to the saved state
        const permissionFields: (keyof UserFormData)[] = ['regions', 'countries', 'divisions', 'groups', 'departments', 'classes', 'subClasses', 'permissions'];
        resetFormData(setFormData, originalPermissionData, permissionFields);
        
        // Trigger permission reset to update PermissionsTabLayout component
        setPermissionResetTrigger(prev => prev + 1);
      }
      
      // Reset modification states
      setIsPermissionsModified(false);
      setHasPermissionsChanges(false);
      
      hideSaveConfirmationMessage(setShowSaveConfirmation);
      formStateManager.resetModificationStatesOnTabSwitch(0);
      formStateManager.checkAndSetModificationStateOnTabSwitch(0);
      setActiveTab(0);
    } else if (activeTab === 0) {
      const targetPath = getNavigationPath(hasUsers);
      navigate(targetPath);
    }
  };

  const handleNext = () => {
    if (activeTab === 0) {
      if (isUserDetailsModified) {
        setNotification({ type: 'warning', message: 'Please save User Details before proceeding to Permissions tab.' });
      } else {
        hideSaveConfirmationMessage(setShowSaveConfirmation);
        formStateManager.resetModificationStatesOnTabSwitch(1);
        formStateManager.checkAndSetModificationStateOnTabSwitch(1);
        setActiveTab(1);
      }
    }
  };

  const openConfirm = (type: 'reset' | 'cancel') => {
    if (type === 'reset') {
      setConfirmMessage('Once clicked, it will revert all entered data. Do you want to continue?');
    } else if (type === 'cancel') {
      setConfirmMessage('Once clicked, all newly entered data will be lost and the screen will be closed. Do you want to continue?');
    }
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmType(null);
  };

  const handleConfirmYes = () => {
    if (confirmType === 'reset') {
      handleReset();
    } else if (confirmType === 'cancel') {
      navigateToUserManagement(navigate);
    }
    closeConfirm();
  };

  const handleConfirmNo = () => closeConfirm();

  const handleTabChange = (_event: React.SyntheticEvent, _newValue: number) => {
    return;
  };

  // Load user data for editing - render immediately with store data, then update with API data
  useEffect(() => {
    const loadUserData = async () => {
      if (!id) {
        setNotification({ type: 'error', message: 'User ID not provided' });
        navigateToUserManagement(navigate);
        return;
      }

      const userFromStore = users.find(user => user.id === parseInt(id));
      
      // Immediately set form data from store if available (instant render)
      if (userFromStore) {
        const userFormData = createUserFormData(userFromStore, userFromStore);
        const formDataState: FormDataState = {
          setFormData,
          setOriginalFormData,
          setOriginalPermissionData,
          setIsDataSaved,
          setIsPermissionSaved,
          setIsUserDetailsSavedToFrontend,
          setIsPermissionsSavedToFrontend,
          setSavedUserId,
          currentUserIdRef
        };
        setFormDataStates(formDataState, userFormData, id);
        // Set initial loaded state - this never changes after initial load
        setInitialLoadedFormData({ ...userFormData });
        setInitialLoadedPermissionData({ ...userFormData });
        // Store initial role to detect changes
        setInitialUserRole(userFormData.role || null);
        setIsLoadingUserData(false); // Allow render immediately
      } else {
        setIsLoadingUserData(true); // Only show loading if no store data
      }

      // Fetch fresh data from API in background and update if different
      try {
        const freshUserData = await userService.getUserById(parseInt(id));
        
        if (freshUserData) {
          const userFormData = createUserFormData(freshUserData, freshUserData);
          const formDataState: FormDataState = {
            setFormData,
            setOriginalFormData,
            setOriginalPermissionData,
            setIsDataSaved,
            setIsPermissionSaved,
            setIsUserDetailsSavedToFrontend,
            setIsPermissionsSavedToFrontend,
            setSavedUserId,
            currentUserIdRef
          };
          setFormDataStates(formDataState, userFormData, id);
          // Update initial loaded state with fresh data
          setInitialLoadedFormData({ ...userFormData });
          setInitialLoadedPermissionData({ ...userFormData });
          // Store initial role to detect changes
          setInitialUserRole(userFormData.role || null);
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        // If we don't have store data and API fails, show error
        if (!userFromStore) {
          handleError(apiError, setNotification, navigate, 'Failed to load user data. Please try again.');
        }
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, [id, users, navigate]);

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

  if (isLoadingUserData) {
    return null;
  }

  return (
    <Box 
      className={`user-edit-form ${isInAdminApp() ? 'admin-app-context' : ''}`}
      sx={{
        ...userFormStyles.container,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%',
        ...(isInAdminApp() && { height: '100%', maxHeight: '100%', position: 'relative' }),
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
        ...(isInAdminApp() && { zIndex: 1001 }),
      }}>
      <FormHeader
          title="Edit User"
          tabs={[{ label: "User Details", value: 0 }, { label: "Permissions", value: 1 }]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onBack={handleBack}
          onReset={() => openConfirm('reset')}
          onCancel={handleCancel}
          onSave={handleSaveWithValidation}
          onNext={activeTab === 1 ? handleSubmitToDatabase : handleNext}
          isFormModified={(activeTab === 0 ? (isUserDetailsModified || hasUserDetailsChanges) : (isPermissionsModified || hasPermissionsChanges))}
        isSaveDisabled={isLoading || !formValidation.isFormValid() || (activeTab === 0 ? (isUserDetailsSavedToFrontend && !isUserDetailsModified) : (isPermissionsSavedToFrontend && !isPermissionsModified))}
          isNextDisabled={activeTab === 0 ? isUserDetailsModified : (isPermissionsModified || (!hasUserDetailsChanges && !hasPermissionsChanges) || isSubmitLoading)}
          showSaveButton={true}
          showNextButton={true}
          useSubmitIcon={activeTab === 1}
          submitButtonText="Submit"
          statusMessage={showSaveConfirmation ? "All Changes Saved" : undefined}
        />
      </Box>

      <Box
        className={isInAdminApp() ? 'user-edit-scrollable' : ''}
        sx={{
          ...userFormStyles.scrollableContent,
          flex: '1 1 auto',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: 'calc(100% - 40px)',
        }}
      >
        <Container maxWidth="xl" sx={{ mt: '12px !important', pl: '12px !important', pr: '12px !important', pt: 0 }}>
          <TabPanel value={activeTab} index={0}>
            <UserDetailsForm
              formData={formData}
              onInputChange={handleInputChange}
              getErrorProps={formValidation.getErrorProps}
              dummyRoles={roleOptions}
              dummyDepartments={dummyDepartments}
              reportingUsersOptions={reportingUsersOptions}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <PermissionsForm
              formData={formData}
              onInputChange={handleInputChange}
              resetTrigger={permissionResetTrigger}
              onDuplicateClick={() => setIsDuplicatePanelOpen(true)}
            />
          </TabPanel>
        </Container>
      </Box>

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
      <DuplicatePermissionPanelWrapper {...duplicatePermissionPanelProps} />
    </Box>
  );
};



export default UserEditForm;
