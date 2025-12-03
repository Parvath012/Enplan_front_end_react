import React from 'react';
import type { UserFormData } from '../../types/UserFormData';
import {
  compareObjects,
  comparePermissionFields,
  compareUserDetailsFields,
  updateFormData,
  resetFormData,
  showSaveConfirmationMessage
} from '../../utils/userFormUtils';

interface FormStateManagerProps {
  activeTab: number;
  formData: UserFormData;
  setFormData: (data: UserFormData | ((prev: UserFormData) => UserFormData)) => void;
  originalFormData: UserFormData | null;
  originalPermissionData: UserFormData | null;
  isDataSaved: boolean;
  isPermissionSaved: boolean;
  isUserDetailsSavedToFrontend: boolean;
  isPermissionsSavedToFrontend: boolean;
  isSaveSuccessful: boolean;
  setIsSaveSuccessful: (value: boolean) => void;
  setIsUserDetailsModified: (value: boolean) => void;
  setIsPermissionsModified: (value: boolean) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
  setShowSaveConfirmation: (value: boolean) => void;
  setPermissionResetTrigger: (value: number | ((prev: number) => number)) => void;
  setOriginalFormData: (data: UserFormData) => void;
  setOriginalPermissionData: (data: UserFormData) => void;
  setIsUserDetailsSavedToFrontend: (value: boolean) => void;
  setIsPermissionsSavedToFrontend: (value: boolean) => void;
  setIsDataSaved: (value: boolean) => void;
  setIsPermissionSaved: (value: boolean) => void;
  setFrontendSavedData: (data: UserFormData) => void;
  initialLoadedFormData: UserFormData | null;
  initialLoadedPermissionData: UserFormData | null;
}

export const useFormStateManager = ({
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
}: FormStateManagerProps) => {
  const resetModificationStatesOnTabSwitch = (newTab: number) => {
    if (newTab === 0) {
      // Reset permissions modification state when switching to user details tab
      if (isPermissionsSavedToFrontend) {
        setIsPermissionsModified(false);
      }
    } else if (newTab === 1) {
      // Reset user details modification state when switching to permissions tab
      if (isUserDetailsSavedToFrontend) {
        setIsUserDetailsModified(false);
      }
    }
  };

  const checkUserDetailsForChanges = (): boolean => {
    if (!isUserDetailsSavedToFrontend || !originalFormData) {
      return !!(formData.firstName?.trim() || formData.lastName?.trim() || formData.emailId?.trim() || formData.role);
    }
    return compareUserDetailsFields(formData, originalFormData);
  };

  const checkPermissionsForChanges = (): boolean => {
    if (!isPermissionsSavedToFrontend || !originalPermissionData) {
      return !!(formData.regions?.length || formData.countries?.length || formData.divisions?.length || 
                formData.groups?.length || formData.departments?.length || formData.classes?.length || 
                formData.subClasses?.length || formData.permissions);
    }
    return comparePermissionFields(formData, originalPermissionData);
  };

  const checkAndSetModificationStateOnTabSwitch = (newTab: number) => {
    if (newTab === 0) {
      const hasUserDetailsChanges = checkUserDetailsForChanges();
      setIsUserDetailsModified(hasUserDetailsChanges);
    } else if (newTab === 1) {
      const hasPermissionsChanges = checkPermissionsForChanges();
      setIsPermissionsModified(hasPermissionsChanges);
    }
  };

  const checkDataChanged = (field: keyof UserFormData, newValue: any): boolean => {
    if (activeTab === 0) {
      if (!isDataSaved || !originalFormData) return true;
      return compareObjects(originalFormData[field], newValue);
    } else if (activeTab === 1) {
      if (!isPermissionSaved || !originalPermissionData) return true;
      return compareObjects(originalPermissionData[field], newValue);
    }
    return true;
  };

  const handleFormModificationTracking = (field: keyof UserFormData, value: any) => {
    if (activeTab === 0) {
      if (!isUserDetailsSavedToFrontend) {
        setIsUserDetailsModified(true);
      } else {
        const hasDataChanged = checkDataChanged(field, value);
        setIsUserDetailsModified(hasDataChanged);
        if (hasDataChanged && isSaveSuccessful) setIsSaveSuccessful(false);
      }
    } else if (activeTab === 1) {
      if (!isPermissionsSavedToFrontend) {
        setIsPermissionsModified(true);
      } else {
        const hasDataChanged = checkDataChanged(field, value);
        setIsPermissionsModified(hasDataChanged);
      }
    }
  };

  const handleSelfReportingEnabled = (): void => {
    updateFormData(setFormData, { reportingManager: 'Self', dottedLineManager: '' });
    setValidationErrors(prev => ({ ...prev, reportingManager: '', dottedLineManager: '' }));
  };

  const handleSelfReportingDisabled = (): void => {
    updateFormData(setFormData, { reportingManager: '', dottedLineManager: '' });
  };

  const handleInputChange = (field: keyof UserFormData, value: string | boolean | string[] | UserFormData['permissions']) => {
    const updates: Partial<UserFormData> = { [field]: value };
    if (field === 'selfReporting' && value === true) {
      updates.reportingManager = '';
      updates.dottedLineManager = '';
    }
    updateFormData(setFormData, updates);
    
    handleFormModificationTracking(field, value);
    
    if (field === 'selfReporting') {
      if (value === true) {
        handleSelfReportingEnabled();
      } else {
        handleSelfReportingDisabled();
      }
    }
  };

  const handleReset = () => {
    // Use initial loaded state instead of originalFormData/originalPermissionData
    // This ensures reset goes back to the initial state when data was first loaded,
    // not the last saved state
    if (activeTab === 0 && initialLoadedFormData) {
      const userDetailsFields: (keyof UserFormData)[] = ['id', 'firstName', 'lastName', 'phoneNumber', 'role', 'department', 'emailId', 'selfReporting', 'reportingManager', 'dottedLineManager'];
      resetFormData(setFormData, initialLoadedFormData, userDetailsFields);
      setIsUserDetailsModified(false);
    } else if (activeTab === 1 && initialLoadedPermissionData) {
      const permissionFields: (keyof UserFormData)[] = ['regions', 'countries', 'divisions', 'groups', 'departments', 'classes', 'subClasses', 'permissions'];
      resetFormData(setFormData, initialLoadedPermissionData, permissionFields);
      setPermissionResetTrigger(prev => prev + 1);
      setIsPermissionsModified(false);
    }
    setValidationErrors({});
  };

  const handleSaveWithValidation = async (validateForm: () => boolean, setIsLoading: (value: boolean) => void) => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      if (activeTab === 0) {
        setIsUserDetailsSavedToFrontend(true);
        setOriginalFormData({ ...formData });
        setIsDataSaved(true);
        setIsUserDetailsModified(false);
        setIsSaveSuccessful(true);
      } else if (activeTab === 1) {
        setIsPermissionsSavedToFrontend(true);
        setOriginalPermissionData({ ...formData });
        setIsPermissionSaved(true);
        setIsPermissionsModified(false);
      }

      setFrontendSavedData({ ...formData });
      showSaveConfirmationMessage(setShowSaveConfirmation);
    } catch (error) {
      // Reset the saved states on error to allow retry
      if (activeTab === 0) {
        setIsUserDetailsSavedToFrontend(false);
        setIsDataSaved(false);
        setIsUserDetailsModified(true);
      } else if (activeTab === 1) {
        setIsPermissionsSavedToFrontend(false);
        setIsPermissionSaved(false);
        setIsPermissionsModified(true);
      }
      setIsSaveSuccessful(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetModificationStatesOnTabSwitch,
    checkUserDetailsForChanges,
    checkPermissionsForChanges,
    checkAndSetModificationStateOnTabSwitch,
    checkDataChanged,
    handleFormModificationTracking,
    handleSelfReportingEnabled,
    handleSelfReportingDisabled,
    handleInputChange,
    handleReset,
    handleSaveWithValidation
  };
};

export default useFormStateManager;
