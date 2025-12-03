import { useState, useRef } from 'react';
import type { UserFormData } from '../types/UserFormData';

export const useUserFormState = () => {
  // Basic form state
  const [activeTab, setActiveTab] = useState(0);
  const [isFormModified, setIsFormModified] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState<'reset' | 'cancel' | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [isSaveSuccessful, setIsSaveSuccessful] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<UserFormData | null>(null);
  const [isPermissionSaved, setIsPermissionSaved] = useState(false);
  const [originalPermissionData, setOriginalPermissionData] = useState<UserFormData | null>(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [permissionResetTrigger, setPermissionResetTrigger] = useState(0);
  
  // Initial loaded state - never changes after initial load (used for reset)
  const [initialLoadedFormData, setInitialLoadedFormData] = useState<UserFormData | null>(null);
  const [initialLoadedPermissionData, setInitialLoadedPermissionData] = useState<UserFormData | null>(null);
  
  // Frontend-only save functionality
  const [frontendSavedData, setFrontendSavedData] = useState<UserFormData | null>(null);
  const [isUserDetailsSavedToFrontend, setIsUserDetailsSavedToFrontend] = useState(false);
  const [isPermissionsSavedToFrontend, setIsPermissionsSavedToFrontend] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<UserFormData>({
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
    regions: [],
    countries: [],
    divisions: [],
    groups: [],
    departments: [],
    classes: [],
    subClasses: []
  });

  return {
    // Basic form state
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
    
    // Initial loaded state - never changes after initial load (used for reset)
    initialLoadedFormData,
    setInitialLoadedFormData,
    initialLoadedPermissionData,
    setInitialLoadedPermissionData,
    
    // Frontend-only save functionality
    frontendSavedData,
    setFrontendSavedData,
    isUserDetailsSavedToFrontend,
    setIsUserDetailsSavedToFrontend,
    isPermissionsSavedToFrontend,
    setIsPermissionsSavedToFrontend,
    isSubmitLoading,
    setIsSubmitLoading,

    // Form data state
    formData,
    setFormData
  };
};
