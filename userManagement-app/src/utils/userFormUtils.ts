import React from 'react';
import type { UserFormData } from '../types/UserFormData';

// Utility functions for user forms
export const convertSelfReportingToBoolean = (value: any): boolean => {
  console.log('🔍 convertSelfReportingToBoolean input:', value, 'type:', typeof value);
  
  // Handle explicit true values
  if (value === true || value === 'true' || value === 1 || value === '1' || value === 'True' || value === 'TRUE') {
    console.log('🔍 convertSelfReportingToBoolean result: true');
    return true;
  }
  
  // Handle explicit false values
  if (value === false || value === 'false' || value === 0 || value === '0' || value === 'False' || value === 'FALSE') {
    console.log('🔍 convertSelfReportingToBoolean result: false');
    return false;
  }
  
  // Handle null, undefined, empty string, or any other falsy values as false
  if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
    console.log('🔍 convertSelfReportingToBoolean result: false (null/undefined/empty)');
    return false;
  }
  
  // For any other value, return false by default (don't use Boolean() as it can be misleading)
  console.log('🔍 convertSelfReportingToBoolean result: false (default)');
  return false;
};

export const parseArrayData = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string' && data.trim()) {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const parsePermissionsData = (data: any): any => {
  if (typeof data === 'object' && data !== null) {
    if (data.enabledModules && data.selectedPermissions) return data;
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return parsed;
    } catch {
      return { enabledModules: [], selectedPermissions: [], activeModule: null, activeSubmodule: null };
    }
  }
  
  if (typeof data === 'string' && data.trim()) {
    try {
      const parsed = JSON.parse(data);
      return parsed;
    } catch {
      return { enabledModules: [], selectedPermissions: [], activeModule: null, activeSubmodule: null };
    }
  }
  
  return { enabledModules: [], selectedPermissions: [], activeModule: null, activeSubmodule: null };
};

export const createUserFormData = (userData: any, sourceData: any): UserFormData => {
  // Debug logging for self-reporting
  console.log('🔍 createUserFormData - userData.selfreporting:', userData.selfreporting, 'type:', typeof userData.selfreporting);
  const isSelfReporting = convertSelfReportingToBoolean(userData.selfreporting);
  console.log('🔍 convertSelfReportingToBoolean result:', isSelfReporting);
  
  return {
    id: userData.id?.toString(),
    firstName: userData.firstname ?? '',
    lastName: userData.lastname ?? '',
    phoneNumber: userData.phonenumber ?? '',
    role: userData.role ?? '',
    department: userData.department ?? '',
    emailId: userData.emailid ?? '',
    selfReporting: isSelfReporting,
    reportingManager: isSelfReporting ? 'Self' : (userData.reportingmanager ?? ''),
    dottedLineManager: isSelfReporting ? '' : (userData.dottedorprojectmanager ?? ''),
    regions: parseArrayData(sourceData.regions),
    countries: parseArrayData(sourceData.countries),
    divisions: parseArrayData(sourceData.divisions),
    groups: parseArrayData(sourceData.groups),
    departments: parseArrayData(sourceData.departments),
    classes: parseArrayData(sourceData.class),
    subClasses: parseArrayData(sourceData.subClass),
    permissions: parsePermissionsData(sourceData.permissions)
  };
};

export const isInAdminApp = (): boolean => window.location.pathname.includes('/admin/user-management');

export const getNavigationPath = (hasUsers: boolean): string => {
  const adminPath = isInAdminApp() ? '/admin/user-management' : '/user-management';
  return hasUsers ? `${adminPath}/list` : `${adminPath}/welcome`;
};

export const navigateToUserManagement = (navigate: any): void => {
  navigate(isInAdminApp() ? '/admin/user-management' : '/user-management');
};

export const handleError = (error: any, setNotification: any, navigate: any, message: string = 'An error occurred. Please try again.'): void => {
  console.error('Error:', error);
  setNotification({ type: 'error', message });
  navigateToUserManagement(navigate);
};

// Interface for form data state management
export interface FormDataState {
  setFormData: (data: UserFormData) => void;
  setOriginalFormData: (data: UserFormData) => void;
  setOriginalPermissionData: (data: UserFormData) => void;
  setIsDataSaved: (saved: boolean) => void;
  setIsPermissionSaved: (saved: boolean) => void;
  setIsUserDetailsSavedToFrontend: (saved: boolean) => void;
  setIsPermissionsSavedToFrontend: (saved: boolean) => void;
  setSavedUserId: (id: string) => void;
  currentUserIdRef: React.RefObject<string | null>;
}

export const setFormDataStates = (
  formDataState: FormDataState,
  userFormData: UserFormData, 
  id: string
): void => {
  formDataState.setFormData(userFormData);
  formDataState.setOriginalFormData(userFormData);
  formDataState.setOriginalPermissionData(userFormData);
  formDataState.setIsDataSaved(true);
  formDataState.setIsPermissionSaved(true);
  formDataState.setIsUserDetailsSavedToFrontend(true);
  formDataState.setIsPermissionsSavedToFrontend(true);
  formDataState.setSavedUserId(id);
  if (formDataState.currentUserIdRef.current !== null) {
    formDataState.currentUserIdRef.current = id;
  }
};

export const compareObjects = (obj1: any, obj2: any): boolean => {
  return JSON.stringify(obj1) !== JSON.stringify(obj2);
};

// Helper function to normalize and compare permissions objects
// This ensures accurate comparison by sorting arrays and ignoring navigation state
const comparePermissionsObjects = (perm1: any, perm2: any): boolean => {
  // Handle null/undefined cases
  if (!perm1 && !perm2) return false; // Both are null/undefined - no difference
  if (!perm1 || !perm2) return true; // One is null/undefined - different
  
  // Normalize arrays by sorting them before comparison
  const normalizeArray = (arr: any[] | undefined | null): string[] => {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => String(a).localeCompare(String(b)));
  };
  
  const enabledModules1 = normalizeArray(perm1.enabledModules);
  const enabledModules2 = normalizeArray(perm2.enabledModules);
  const selectedPermissions1 = normalizeArray(perm1.selectedPermissions);
  const selectedPermissions2 = normalizeArray(perm2.selectedPermissions);
  
  // Compare normalized arrays
  const enabledModulesDifferent = JSON.stringify(enabledModules1) !== JSON.stringify(enabledModules2);
  const selectedPermissionsDifferent = JSON.stringify(selectedPermissions1) !== JSON.stringify(selectedPermissions2);
  
  // Only compare actual permission data, ignore navigation state (activeModule, activeSubmodule)
  return enabledModulesDifferent || selectedPermissionsDifferent;
};

export const comparePermissionFields = (formData: UserFormData, originalData: UserFormData): boolean => {
  // Compare non-permission fields using standard comparison
  const nonPermissionFields = ['regions', 'countries', 'divisions', 'groups', 'departments', 'classes', 'subClasses'];
  const hasNonPermissionChanges = nonPermissionFields.some(field => {
    const formValue = formData[field as keyof UserFormData];
    const originalValue = originalData[field as keyof UserFormData];
    // Normalize arrays for comparison
    const normalizeArray = (arr: any): string[] => {
      if (!Array.isArray(arr)) return [];
      return [...arr].sort((a, b) => String(a).localeCompare(String(b)));
    };
    const normalizedForm = Array.isArray(formValue) ? normalizeArray(formValue) : formValue;
    const normalizedOriginal = Array.isArray(originalValue) ? normalizeArray(originalValue) : originalValue;
    return JSON.stringify(normalizedForm) !== JSON.stringify(normalizedOriginal);
  });
  
  // Compare permissions using normalized comparison
  const hasPermissionChanges = comparePermissionsObjects(formData.permissions, originalData.permissions);
  
  return hasNonPermissionChanges || hasPermissionChanges;
};

export const compareUserDetailsFields = (formData: UserFormData, originalData: UserFormData): boolean => {
  const fields = ['firstName', 'lastName', 'phoneNumber', 'role', 'department', 'emailId', 'selfReporting', 'reportingManager', 'dottedLineManager'];
  return fields.some(field => compareObjects(formData[field as keyof UserFormData], originalData[field as keyof UserFormData]));
};

export const updateFormData = (setFormData: any, updates: Partial<UserFormData>): void => {
  setFormData((prev: UserFormData) => ({ ...prev, ...updates }));
};

export const resetFormData = (setFormData: any, originalData: UserFormData, fields: (keyof UserFormData)[]): void => {
  setFormData((prev: UserFormData) => {
    const updates: Partial<UserFormData> = {};
    fields.forEach(field => {
      updates[field] = originalData[field] as any;
    });
    return { ...prev, ...updates };
  });
};

// TabPanel component
export interface TabPanelProps {
  readonly children?: React.ReactNode;
  readonly index: number;
  readonly value: number;
}

export const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return React.createElement(
    'div',
    {
      role: 'tabpanel',
      hidden: value !== index,
      id: `user-tabpanel-${index}`,
      'aria-labelledby': `user-tab-${index}`,
      ...other
    },
    value === index && React.createElement(
      'div',
      { style: { paddingBottom: '0px', paddingTop: '0' } },
      children
    )
  );
};

// Shared function to validate submission prerequisites
export const validateSubmissionPrerequisites = (
  frontendSavedData: UserFormData | null,
  isUserDetailsSavedToFrontend: boolean,
  isPermissionsSavedToFrontend: boolean,
  setNotification: (notification: { type: 'success' | 'error' | 'warning'; message: string } | null) => void
): boolean => {
  if (!frontendSavedData || !isUserDetailsSavedToFrontend || !isPermissionsSavedToFrontend) {
    setNotification({ type: 'error', message: 'Please save both User Details and Permissions before submitting.' });
    return false;
  }
  return true;
};

// Shared function to show save confirmation message
export const showSaveConfirmationMessage = (
  setShowSaveConfirmation: (show: boolean) => void
): void => {
  setShowSaveConfirmation(true);
  setTimeout(() => setShowSaveConfirmation(false), 7500);
};

// Shared function to hide save confirmation message
export const hideSaveConfirmationMessage = (
  setShowSaveConfirmation: (show: boolean) => void
): void => {
  setShowSaveConfirmation(false);
};

// Shared function to create complete user data for API calls
export const createCompleteUserData = (
  frontendSavedData: UserFormData, 
  savedUserId: string | null, 
  operationType: 'create' | 'update'
): any => {
  const baseData = {
    firstname: frontendSavedData.firstName,
    lastname: frontendSavedData.lastName,
    phonenumber: frontendSavedData.phoneNumber,
    role: frontendSavedData.role,
    department: frontendSavedData.department,
    emailid: frontendSavedData.emailId,
    reportingmanager: frontendSavedData.selfReporting ? 'Self' : frontendSavedData.reportingManager,
    dottedorprojectmanager: frontendSavedData.selfReporting ? null : frontendSavedData.dottedLineManager,
    selfreporting: frontendSavedData.selfReporting,
    regions: frontendSavedData.regions,
    countries: frontendSavedData.countries,
    divisions: frontendSavedData.divisions,
    groups: frontendSavedData.groups,
    departments: frontendSavedData.departments,
    class: frontendSavedData.classes,
    subClass: frontendSavedData.subClasses,
    permissions: frontendSavedData.permissions,
    status: 'Active',
    isenabled: true,
    id: savedUserId ?? undefined,
  };

  // Add operation-specific fields
  if (operationType === 'create') {
    return {
      ...baseData,
      createdby: 'Admin',
    };
  } else {
    return {
      ...baseData,
      lastupdatedby: 'Admin',
    };
  }
};

// Shared function to merge duplicate permissions
export const mergeDuplicatePermissions = (
  currentPermissions: ReturnType<typeof parsePermissionsData>,
  duplicatedPermissions: string[],
  duplicatedEnabledModules?: string[]
): UserFormData['permissions'] => {
  const currentEnabledModules = currentPermissions?.enabledModules ?? [];
  const currentSelectedPermissions = currentPermissions?.selectedPermissions ?? [];

  const mergedEnabledModules = new Set([
    ...currentEnabledModules,
    ...(duplicatedEnabledModules ?? [])
  ]);
  const mergedSelectedPermissions = new Set([
    ...currentSelectedPermissions,
    ...duplicatedPermissions
  ]);

  return {
    enabledModules: Array.from(mergedEnabledModules),
    selectedPermissions: Array.from(mergedSelectedPermissions),
    activeModule: currentPermissions?.activeModule ?? (Array.from(mergedEnabledModules)[0] ?? null),
    activeSubmodule: currentPermissions?.activeSubmodule ?? null
  };
};