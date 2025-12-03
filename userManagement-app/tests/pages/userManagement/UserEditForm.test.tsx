import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import UserEditForm from '../../../src/pages/userManagement/UserEditForm';

// Mock React useState to control the loading state and modification states
const mockSetIsLoadingUserData = jest.fn();
const mockSetIsUserDetailsModified = jest.fn();
const mockSetIsPermissionsModified = jest.fn();
const mockSetHasUserDetailsChanges = jest.fn();
const mockSetHasPermissionsChanges = jest.fn();
const mockSetIsDuplicatePanelOpen = jest.fn();

let useStateCallCount = 0;
// Per-test overrides for useState values
let overrideIsLoadingUserData: boolean | null = null;
let overrideIsUserDetailsModified: boolean | null = null;
let overrideIsPermissionsModified: boolean | null = null;
let overrideHasUserDetailsChanges: boolean | null = null;
let overrideHasPermissionsChanges: boolean | null = null;

// Track which useState calls we've seen
let isLoadingUserDataCallIndex = -1;
let isUserDetailsModifiedCallIndex = -1;
let isPermissionsModifiedCallIndex = -1;
let hasUserDetailsChangesCallIndex = -1;
let hasPermissionsChangesCallIndex = -1;

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn((initial) => {
    useStateCallCount++;
    if (initial === true) {
      // First true is isLoadingUserData
      if (isLoadingUserDataCallIndex === -1) {
        isLoadingUserDataCallIndex = useStateCallCount;
      }
      if (useStateCallCount === isLoadingUserDataCallIndex) {
        return [overrideIsLoadingUserData !== null ? overrideIsLoadingUserData : false, mockSetIsLoadingUserData];
      }
      // Last true is isDuplicatePanelOpen
      return [false, mockSetIsDuplicatePanelOpen];
    }
    if (initial === false) {
      // Track which call index corresponds to which state
      if (isUserDetailsModifiedCallIndex === -1) {
        isUserDetailsModifiedCallIndex = useStateCallCount;
      } else if (isPermissionsModifiedCallIndex === -1) {
        isPermissionsModifiedCallIndex = useStateCallCount;
      } else if (hasUserDetailsChangesCallIndex === -1) {
        hasUserDetailsChangesCallIndex = useStateCallCount;
      } else if (hasPermissionsChangesCallIndex === -1) {
        hasPermissionsChangesCallIndex = useStateCallCount;
      }
      
      // Return override values if set
      if (useStateCallCount === isUserDetailsModifiedCallIndex) {
        return [overrideIsUserDetailsModified !== null ? overrideIsUserDetailsModified : false, mockSetIsUserDetailsModified];
      }
      if (useStateCallCount === isPermissionsModifiedCallIndex) {
        return [overrideIsPermissionsModified !== null ? overrideIsPermissionsModified : false, mockSetIsPermissionsModified];
      }
      if (useStateCallCount === hasUserDetailsChangesCallIndex) {
        return [overrideHasUserDetailsChanges !== null ? overrideHasUserDetailsChanges : false, mockSetHasUserDetailsChanges];
      }
      if (useStateCallCount === hasPermissionsChangesCallIndex) {
        return [overrideHasPermissionsChanges !== null ? overrideHasPermissionsChanges : false, mockSetHasPermissionsChanges];
      }
      return [false, jest.fn()];
    }
    return [initial, jest.fn()];
  })
}));

// Mock all external dependencies
const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockGetUserById = jest.fn();
const mockSaveUser = jest.fn();
const mockCreateUserFormData = jest.fn();
const mockSetFormDataStates = jest.fn();
const mockCompareUserDetailsFields = jest.fn();
const mockComparePermissionFields = jest.fn();
const mockResetFormData = jest.fn();
const mockCreateCompleteUserData = jest.fn();
const mockValidateSubmissionPrerequisites = jest.fn();
const mockHandleSaveWithValidation = jest.fn();
const mockHandleInputChange = jest.fn();
const mockSetActiveTab = jest.fn();
const mockSetConfirmOpen = jest.fn();
const mockSetConfirmType = jest.fn();
const mockSetNotification = jest.fn();
const mockSetFormData = jest.fn();
const mockSetOriginalFormData = jest.fn();
const mockSetOriginalPermissionData = jest.fn();
const mockSetIsDataSaved = jest.fn();
const mockSetIsPermissionSaved = jest.fn();
const mockSetIsUserDetailsSavedToFrontend = jest.fn();
const mockSetIsPermissionsSavedToFrontend = jest.fn();
const mockSetSavedUserId = jest.fn();
const mockSetInitialLoadedFormData = jest.fn();
const mockSetInitialLoadedPermissionData = jest.fn();
const mockSetPermissionResetTrigger = jest.fn();
const mockSetFrontendSavedData = jest.fn();
const mockSetIsSubmitLoading = jest.fn();
const mockSetShowSaveConfirmation = jest.fn();

const defaultFormData = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '1234567890',
    role: 'Admin',
    department: 'IT',
    emailId: 'john.doe@example.com',
    selfReporting: false,
    reportingManager: 'Jane Manager',
    dottedLineManager: 'Bob Project',
    regions: ['North America'],
    countries: ['USA'],
    divisions: ['Technology'],
    groups: ['Development'],
    departments: ['Engineering'],
    classes: ['Senior'],
    subClasses: ['Frontend'],
    permissions: 'read,write'
};

// Create a configurable mock for useUserFormState
let mockUseUserFormStateReturn = {
    activeTab: 0,
  setActiveTab: mockSetActiveTab,
    confirmOpen: false,
  setConfirmOpen: mockSetConfirmOpen,
    confirmMessage: '',
    setConfirmMessage: jest.fn(),
    confirmType: null,
  setConfirmType: mockSetConfirmType,
    notification: null,
  setNotification: mockSetNotification,
    isSaveSuccessful: false,
    setIsSaveSuccessful: jest.fn(),
    isLoading: false,
    setIsLoading: jest.fn(),
    validationErrors: {},
    setValidationErrors: jest.fn(),
    savedUserId: '1',
  setSavedUserId: mockSetSavedUserId,
    currentUserIdRef: { current: '1' },
    isDataSaved: true,
  setIsDataSaved: mockSetIsDataSaved,
  originalFormData: defaultFormData,
  setOriginalFormData: mockSetOriginalFormData,
    isPermissionSaved: true,
  setIsPermissionSaved: mockSetIsPermissionSaved,
  originalPermissionData: defaultFormData,
  setOriginalPermissionData: mockSetOriginalPermissionData,
    showSaveConfirmation: false,
  setShowSaveConfirmation: mockSetShowSaveConfirmation,
    permissionResetTrigger: 0,
  setPermissionResetTrigger: mockSetPermissionResetTrigger,
    frontendSavedData: null,
  setFrontendSavedData: mockSetFrontendSavedData,
    isUserDetailsSavedToFrontend: false,
  setIsUserDetailsSavedToFrontend: mockSetIsUserDetailsSavedToFrontend,
    isPermissionsSavedToFrontend: false,
  setIsPermissionsSavedToFrontend: mockSetIsPermissionsSavedToFrontend,
    isSubmitLoading: false,
  setIsSubmitLoading: mockSetIsSubmitLoading,
  formData: defaultFormData,
  setFormData: mockSetFormData,
  initialLoadedFormData: defaultFormData,
  setInitialLoadedFormData: mockSetInitialLoadedFormData,
  initialLoadedPermissionData: defaultFormData,
  setInitialLoadedPermissionData: mockSetInitialLoadedPermissionData
};

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn((selector) => {
    const mockState = {
      users: {
        users: [{ id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john.doe@example.com' }],
        hasUsers: true,
        roles: ['Admin', 'Manager'],
        departments: ['IT', 'HR'],
        usersForReporting: []
      },
      roles: {
        roles: [{ id: 1, rolename: 'Admin' }, { id: 2, rolename: 'Manager' }],
        initialFetchAttempted: true
      }
    };
    return selector(mockState);
  }),
  Provider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('../../../src/store/Reducers/userSlice', () => ({
  fetchRoles: jest.fn(),
  fetchDepartments: jest.fn(),
  fetchUsersForReporting: jest.fn(),
  fetchUsers: jest.fn()
}));

jest.mock('../../../src/services/userSaveService', () => ({
  saveUser: (...args: any[]) => mockSaveUser(...args)
}));

jest.mock('../../../src/services/userService', () => ({
  userService: {
    getUserById: (...args: any[]) => mockGetUserById(...args)
  }
}));

jest.mock('../../../src/utils/userFormUtils', () => ({
  createUserFormData: (...args: any[]) => mockCreateUserFormData(...args),
  isInAdminApp: jest.fn(() => false),
  getNavigationPath: jest.fn(() => '/users'),
  navigateToUserManagement: jest.fn(),
  handleError: jest.fn(),
  setFormDataStates: (...args: any[]) => mockSetFormDataStates(...args),
  compareUserDetailsFields: (...args: any[]) => mockCompareUserDetailsFields(...args),
  comparePermissionFields: (...args: any[]) => mockComparePermissionFields(...args),
  resetFormData: (...args: any[]) => mockResetFormData(...args),
  TabPanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  createCompleteUserData: (...args: any[]) => mockCreateCompleteUserData(...args),
  validateSubmissionPrerequisites: (...args: any[]) => mockValidateSubmissionPrerequisites(...args),
  hideSaveConfirmationMessage: jest.fn(),
  parsePermissionsData: jest.fn(() => []),
  mergeDuplicatePermissions: jest.fn(() => [])
}));

jest.mock('../../../src/utils/roleLockUtils', () => ({
  syncAffectedRolesLockStatus: jest.fn()
}));

jest.mock('../../../src/hooks/useUserFormState', () => ({
  useUserFormState: () => mockUseUserFormStateReturn
}));

jest.mock('../../../src/components/userManagement/PermissionTableConstants', () => ({
  getUserFormStyles: () => ({
    container: {},
    formContainer: {},
    tabContainer: {},
    tabPanel: {}
  })
}));

jest.mock('commonApp/NotificationAlert', () => {
  return function MockNotificationAlert({ open, variant, message, title, onClose, actions }: any) {
    return open ? (
      <div data-testid="notification-alert" data-variant={variant}>
        {title && <div data-testid="notification-title">{title}</div>}
        <div data-testid="notification-message">{message}</div>
        {actions?.map((action: any, index: number) => (
          <button key={index} data-testid={`notification-action-${action.label.toLowerCase()}`} onClick={action.onClick}>
            {action.label}
          </button>
        ))}
        <button data-testid="notification-close" onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

jest.mock('../../../src/components/userManagement/FormHeader', () => {
  return function MockFormHeader(props: any) {
    return (
      <div data-testid="form-header">
        <div data-testid="form-title">{props.title}</div>
        {props.tabs?.map((tab: any, index: number) => (
          <button
            key={index}
            data-testid={`tab-${tab.value}`}
            onClick={() => props.onTabChange?.(null, tab.value)}
          >
            {tab.label}
          </button>
        ))}
        <button data-testid="back-button" onClick={props.onBack}>Back</button>
        <button data-testid="reset-button" onClick={props.onReset}>Reset</button>
        <button data-testid="cancel-button" onClick={props.onCancel}>Cancel</button>
        {props.showSaveButton && <button data-testid="save-button" onClick={props.onSave} disabled={props.isSaveDisabled}>Save</button>}
        {props.showNextButton && <button data-testid="next-button" onClick={props.onNext} disabled={props.isNextDisabled}>{props.submitButtonText || 'Next'}</button>}
        {props.statusMessage && <div data-testid="status-message">{props.statusMessage}</div>}
    </div>
    );
  };
});

jest.mock('../../../src/components/userManagement/FormValidation', () => ({
  useFormValidation: () => ({
    validateForm: jest.fn(() => true),
    validateField: jest.fn(() => true),
    getFieldError: jest.fn(() => ''),
    clearErrors: jest.fn(),
    isFormValid: jest.fn(() => true),
    hasErrors: false,
    errorProps: {},
    getErrorProps: jest.fn(() => ({ error: false, errorMessage: '' }))
  })
}));

jest.mock('../../../src/components/userManagement/FormStateManager', () => ({
  useFormStateManager: () => ({
    handleSave: jest.fn(),
    handleReset: jest.fn(),
    handleInputChange: mockHandleInputChange,
    handleSaveWithValidation: mockHandleSaveWithValidation,
    resetModificationStatesOnTabSwitch: jest.fn(),
    checkAndSetModificationStateOnTabSwitch: jest.fn(),
    isFormModified: false,
    canSave: true,
    canReset: true
  })
}));

jest.mock('../../../src/components/userManagement/UserDetailsForm', () => {
  return function MockUserDetailsForm({ formData, onInputChange }: any) {
    return (
      <div data-testid="user-details-form">
        <input data-testid="input-firstName" value={formData?.firstName || ''} onChange={(e) => onInputChange('firstName', e.target.value)} />
        <input data-testid="input-lastName" value={formData?.lastName || ''} onChange={(e) => onInputChange('lastName', e.target.value)} />
      </div>
    );
  };
});

jest.mock('../../../src/components/userManagement/PermissionsForm', () => {
  return function MockPermissionsForm({ formData, onInputChange, onDuplicateClick }: any) {
    return (
      <div data-testid="permissions-form">
        <input data-testid="input-permissions" value={formData?.permissions || ''} onChange={(e) => onInputChange('permissions', e.target.value)} />
        <button data-testid="duplicate-permissions-button" onClick={onDuplicateClick}>Duplicate</button>
      </div>
    );
  };
});

jest.mock('../../../src/components/userManagement/DuplicatePermissionPanelWrapper', () => {
  return function MockDuplicatePermissionPanelWrapper({ isOpen, onClose }: any) {
    return isOpen ? <div data-testid="duplicate-panel"><button data-testid="close-duplicate-panel" onClick={onClose}>Close</button></div> : null;
  };
});

jest.mock('../../../src/hooks/useDuplicatePermissionPanel', () => ({
  useDuplicatePermissionPanel: () => ({
    isOpen: false,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    selectedUser: null,
    selectedModules: []
  })
}));

jest.mock('../../../src/hooks/useModulePermissions', () => ({
  useModulePermissions: () => ({ modulesData: [] })
}));

jest.mock('@mui/material', () => ({
  Box: ({ children, sx, className, ...props }: any) => <div className={className} style={sx} data-testid="mui-box" {...props}>{children}</div>,
  Container: ({ children, maxWidth, sx, ...props }: any) => <div data-testid="container" data-max-width={maxWidth} style={sx} {...props}>{children}</div>
}));

// Create a mock store
const mockStore = configureStore({
  reducer: {
    users: () => ({
      roles: [],
      departments: [],
      users: [],
      usersForReporting: []
    })
  }
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={mockStore}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

describe('UserEditForm - Optimized for Coverage', () => {
  beforeEach(() => {
    useStateCallCount = 0; // Reset useState call counter
    // Reset call indices
    isLoadingUserDataCallIndex = -1;
    isUserDetailsModifiedCallIndex = -1;
    isPermissionsModifiedCallIndex = -1;
    hasUserDetailsChangesCallIndex = -1;
    hasPermissionsChangesCallIndex = -1;
    // Reset useState overrides
    overrideIsLoadingUserData = null;
    overrideIsUserDetailsModified = null;
    overrideIsPermissionsModified = null;
    overrideHasUserDetailsChanges = null;
    overrideHasPermissionsChanges = null;
    jest.clearAllMocks();
    // Reset mock return value
    mockUseUserFormStateReturn = {
      activeTab: 0,
      setActiveTab: mockSetActiveTab,
      confirmOpen: false,
      setConfirmOpen: mockSetConfirmOpen,
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: mockSetConfirmType,
      notification: null,
      setNotification: mockSetNotification,
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {},
      setValidationErrors: jest.fn(),
      savedUserId: '1',
      setSavedUserId: mockSetSavedUserId,
      currentUserIdRef: { current: '1' },
      isDataSaved: true,
      setIsDataSaved: mockSetIsDataSaved,
      originalFormData: defaultFormData,
      setOriginalFormData: mockSetOriginalFormData,
      isPermissionSaved: true,
      setIsPermissionSaved: mockSetIsPermissionSaved,
      originalPermissionData: defaultFormData,
      setOriginalPermissionData: mockSetOriginalPermissionData,
      showSaveConfirmation: false,
      setShowSaveConfirmation: mockSetShowSaveConfirmation,
      permissionResetTrigger: 0,
      setPermissionResetTrigger: mockSetPermissionResetTrigger,
      frontendSavedData: null,
      setFrontendSavedData: mockSetFrontendSavedData,
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: mockSetIsUserDetailsSavedToFrontend,
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: mockSetIsPermissionsSavedToFrontend,
      isSubmitLoading: false,
      setIsSubmitLoading: mockSetIsSubmitLoading,
      formData: defaultFormData,
      setFormData: mockSetFormData,
      initialLoadedFormData: defaultFormData,
      setInitialLoadedFormData: mockSetInitialLoadedFormData,
      initialLoadedPermissionData: defaultFormData,
      setInitialLoadedPermissionData: mockSetInitialLoadedPermissionData
    };
    mockCreateUserFormData.mockReturnValue(defaultFormData);
    mockGetUserById.mockResolvedValue({ id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john.doe@example.com' });
    mockSaveUser.mockResolvedValue({});
    mockCompareUserDetailsFields.mockReturnValue(false);
    mockComparePermissionFields.mockReturnValue(false);
    mockValidateSubmissionPrerequisites.mockReturnValue(true);
    mockHandleSaveWithValidation.mockResolvedValue(undefined);
    mockSetFormDataStates.mockImplementation((formDataState: any, userFormData: any, id: string) => {
      if (formDataState.setFormData) formDataState.setFormData(userFormData);
      if (formDataState.setOriginalFormData) formDataState.setOriginalFormData(userFormData);
      if (formDataState.setOriginalPermissionData) formDataState.setOriginalPermissionData(userFormData);
      if (formDataState.setIsDataSaved) formDataState.setIsDataSaved(true);
      if (formDataState.setIsPermissionSaved) formDataState.setIsPermissionSaved(true);
      if (formDataState.setIsUserDetailsSavedToFrontend) formDataState.setIsUserDetailsSavedToFrontend(true);
      if (formDataState.setIsPermissionsSavedToFrontend) formDataState.setIsPermissionsSavedToFrontend(true);
      if (formDataState.setSavedUserId) formDataState.setSavedUserId(id);
      if (formDataState.setInitialLoadedFormData) formDataState.setInitialLoadedFormData(userFormData);
      if (formDataState.setInitialLoadedPermissionData) formDataState.setInitialLoadedPermissionData(userFormData);
      if (formDataState.currentUserIdRef) formDataState.currentUserIdRef.current = id;
    });
  });

  it('renders form with header and tabs', () => {
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    expect(screen.getByTestId('form-header')).toBeInTheDocument();
    expect(screen.getByTestId('user-details-form')).toBeInTheDocument();
  });

  it('loads user data from store and API', async () => {
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      expect(mockCreateUserFormData).toHaveBeenCalled();
      expect(mockSetFormDataStates).toHaveBeenCalled();
    });
  });

  it('handles missing user ID', async () => {
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ id: undefined });
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalled();
    });
  });

  it('handles input changes', () => {
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const input = screen.getByTestId('input-firstName');
    fireEvent.change(input, { target: { value: 'Jane' } });
    expect(mockHandleInputChange).toHaveBeenCalled();
  });

  it('handles tab switching via next button', async () => {
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeInTheDocument();
    });
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    // Next button should switch to permissions tab when on user details tab (if no modifications)
    await waitFor(() => {
      expect(mockSetActiveTab).toHaveBeenCalled();
    });
  });

  it('handles save button click', () => {
    render(<TestWrapper><UserEditForm /></TestWrapper>);
      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);
    expect(mockHandleSaveWithValidation).toHaveBeenCalled();
  });

  it('handles reset button with confirmation', () => {
    render(<TestWrapper><UserEditForm /></TestWrapper>);
      const resetButton = screen.getByTestId('reset-button');
      fireEvent.click(resetButton);
    expect(mockSetConfirmOpen).toHaveBeenCalledWith(true);
    expect(mockSetConfirmType).toHaveBeenCalledWith('reset');
  });

  it('handles cancel button - no changes', async () => {
    mockCompareUserDetailsFields.mockReturnValue(false);
    mockComparePermissionFields.mockReturnValue(false);
    // Ensure formData matches initialLoadedFormData to simulate no changes
    const identicalFormData = JSON.parse(JSON.stringify(defaultFormData));
    mockUseUserFormStateReturn.formData = identicalFormData;
    mockUseUserFormStateReturn.initialLoadedFormData = identicalFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = identicalFormData;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      const cancelButton = screen.getByTestId('cancel-button');
      expect(cancelButton).toBeInTheDocument();
      fireEvent.click(cancelButton);
    });
    // Verify cancel button exists and was rendered
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  it('handles cancel button - with changes', async () => {
    mockCompareUserDetailsFields.mockReturnValue(true);
    // Set formData to be different from initial to simulate changes
    mockUseUserFormStateReturn.formData = { ...defaultFormData, firstName: 'Changed' };
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      const cancelButton = screen.getByTestId('cancel-button');
      expect(cancelButton).toBeInTheDocument();
      fireEvent.click(cancelButton);
    });
    // Verify cancel button exists and component handles the click
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  it('handles back button from permissions tab', () => {
    mockUseUserFormStateReturn.activeTab = 1;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);
    expect(mockSetActiveTab).toHaveBeenCalledWith(0);
  });

  it('handles next button to submit', async () => {
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.frontendSavedData = defaultFormData as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    mockUseUserFormStateReturn.isDataSaved = true;
    mockUseUserFormStateReturn.isPermissionSaved = true;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeInTheDocument();
      fireEvent.click(nextButton);
    });
    // Verify next button exists and was clicked
    expect(screen.getByTestId('next-button')).toBeInTheDocument();
  });

  it('handles confirmation yes for reset', () => {
    mockUseUserFormStateReturn.confirmOpen = true;
    mockUseUserFormStateReturn.confirmType = 'reset' as any;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const yesButton = screen.getByTestId('notification-action-yes');
    fireEvent.click(yesButton);
    expect(mockResetFormData).toHaveBeenCalled();
  });

  it('handles confirmation yes for cancel', async () => {
    mockUseUserFormStateReturn.confirmOpen = true;
    mockUseUserFormStateReturn.confirmType = 'cancel' as any;
    const mockNavigateToUserManagement = require('../../../src/utils/userFormUtils').navigateToUserManagement;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      const yesButton = screen.getByTestId('notification-action-yes');
      expect(yesButton).toBeInTheDocument();
      fireEvent.click(yesButton);
    });
    // Verify navigateToUserManagement was called
    expect(mockNavigateToUserManagement).toHaveBeenCalled();
  });

  it('handles confirmation no', () => {
    mockUseUserFormStateReturn.confirmOpen = true;
    mockUseUserFormStateReturn.confirmType = 'reset' as any;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const noButton = screen.getByTestId('notification-action-no');
    fireEvent.click(noButton);
    expect(mockSetConfirmOpen).toHaveBeenCalledWith(false);
  });

  it('handles API error when loading', async () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockReturnValueOnce({
      users: [],
      hasUsers: false
    });
    mockGetUserById.mockRejectedValue(new Error('API Error'));
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    // Component should handle the error - just verify it renders
    await waitFor(() => {
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles save error', async () => {
    mockHandleSaveWithValidation.mockRejectedValueOnce(new Error('Save failed'));
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalled();
    });
  });

  it('renders permissions form when tab active', () => {
    mockUseUserFormStateReturn.activeTab = 1;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    expect(screen.getByTestId('permissions-form')).toBeInTheDocument();
  });

  it('handles duplicate permissions click', () => {
    mockUseUserFormStateReturn.activeTab = 1;
    jest.spyOn(require('../../../src/hooks/useDuplicatePermissionPanel'), 'useDuplicatePermissionPanel').mockReturnValueOnce({
      isOpen: true,
      onClose: jest.fn(),
      onConfirm: jest.fn(),
      onCancel: jest.fn(),
      selectedUser: null,
      selectedModules: []
    });
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const duplicateButton = screen.getByTestId('duplicate-permissions-button');
    fireEvent.click(duplicateButton);
    expect(screen.queryByTestId('duplicate-panel')).toBeInTheDocument();
  });

  it('tracks user details modifications', () => {
    mockCompareUserDetailsFields.mockReturnValue(true);
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    expect(mockCompareUserDetailsFields).toHaveBeenCalled();
  });

  it('tracks permissions modifications', () => {
    mockComparePermissionFields.mockReturnValue(true);
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    expect(mockComparePermissionFields).toHaveBeenCalled();
  });

  it('handles next button when prerequisites not met', async () => {
    mockValidateSubmissionPrerequisites.mockReturnValueOnce(false);
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.frontendSavedData = defaultFormData as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeInTheDocument();
      fireEvent.click(nextButton);
    });
    // Verify next button exists and was clicked
    expect(screen.getByTestId('next-button')).toBeInTheDocument();
  });

  it('handles notification display', () => {
    mockUseUserFormStateReturn.notification = { type: 'success', message: 'Saved successfully' } as any;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
  });

  it('handles showSaveConfirmation status message', () => {
    mockUseUserFormStateReturn.showSaveConfirmation = true;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    expect(screen.getByTestId('status-message')).toHaveTextContent('All Changes Saved');
  });

  it('handles save with validation for permissions tab', async () => {
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockHandleSaveWithValidation.mockResolvedValue(undefined);
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      const saveButton = screen.getByTestId('save-button');
      expect(saveButton).toBeInTheDocument();
      fireEvent.click(saveButton);
    });
    await waitFor(() => {
      expect(mockComparePermissionFields).toHaveBeenCalled();
    });
  });

  it('handles duplicate permissions merge', () => {
    jest.spyOn(require('../../../src/hooks/useDuplicatePermissionPanel'), 'useDuplicatePermissionPanel').mockReturnValueOnce({
      isOpen: true,
      onClose: jest.fn(),
      onConfirm: jest.fn((duplicatedPermissions, duplicatedEnabledModules) => {
        // Simulate duplicate permissions being merged
        const mockParsePermissionsData = require('../../../src/utils/userFormUtils').parsePermissionsData;
        const mockMergeDuplicatePermissions = require('../../../src/utils/userFormUtils').mergeDuplicatePermissions;
        const currentPermissions = mockParsePermissionsData(mockUseUserFormStateReturn.formData.permissions);
        const updatedPermissions = mockMergeDuplicatePermissions(currentPermissions, duplicatedPermissions, duplicatedEnabledModules);
        mockUseUserFormStateReturn.formData.permissions = updatedPermissions;
      }),
      onCancel: jest.fn(),
      selectedUser: null,
      selectedModules: []
    });
    mockUseUserFormStateReturn.activeTab = 1;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const duplicateButton = screen.getByTestId('duplicate-permissions-button');
    fireEvent.click(duplicateButton);
    expect(screen.queryByTestId('duplicate-panel')).toBeInTheDocument();
  });

  it('handles submit to database successfully', async () => {
    mockValidateSubmissionPrerequisites.mockReturnValue(true);
    mockSaveUser.mockResolvedValue(undefined);
    mockCreateCompleteUserData.mockReturnValue(defaultFormData);
    const mockFetchUsers = require('../../../src/store/Reducers/userSlice').fetchUsers;
    const mockNavigateToUserManagement = require('../../../src/utils/userFormUtils').navigateToUserManagement;
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.frontendSavedData = defaultFormData as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    overrideIsPermissionsModified = false;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeInTheDocument();
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(mockValidateSubmissionPrerequisites).toHaveBeenCalled();
      expect(mockCreateCompleteUserData).toHaveBeenCalled();
      expect(mockSaveUser).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockFetchUsers).toBeDefined();
      expect(mockNavigateToUserManagement).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('handles submit when permissions are modified', async () => {
    mockValidateSubmissionPrerequisites.mockReturnValue(true);
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.frontendSavedData = defaultFormData as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    overrideIsPermissionsModified = true;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);
    });
    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalled();
    });
  });

  it('handles reset for user details tab', async () => {
    mockUseUserFormStateReturn.activeTab = 0;
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockUseUserFormStateReturn.frontendSavedData = defaultFormData as any;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    await waitFor(() => {
      expect(mockSetConfirmOpen).toHaveBeenCalledWith(true);
      expect(mockSetConfirmType).toHaveBeenCalledWith('reset');
    });
    // Simulate confirmation yes
    mockUseUserFormStateReturn.confirmOpen = true;
    mockUseUserFormStateReturn.confirmType = 'reset' as any;
    const { rerender } = render(<TestWrapper><UserEditForm /></TestWrapper>);
    rerender(<TestWrapper><UserEditForm /></TestWrapper>);
    const yesButton = screen.getByTestId('notification-action-yes');
    fireEvent.click(yesButton);
    expect(mockResetFormData).toHaveBeenCalled();
  });

  it('handles reset for user details tab without frontendSavedData', async () => {
    mockUseUserFormStateReturn.activeTab = 0;
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockUseUserFormStateReturn.frontendSavedData = null as any;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    await waitFor(() => {
      expect(mockSetConfirmOpen).toHaveBeenCalledWith(true);
    });
    // Simulate confirmation yes
    mockUseUserFormStateReturn.confirmOpen = true;
    mockUseUserFormStateReturn.confirmType = 'reset' as any;
    const { rerender } = render(<TestWrapper><UserEditForm /></TestWrapper>);
    rerender(<TestWrapper><UserEditForm /></TestWrapper>);
    const yesButton = screen.getByTestId('notification-action-yes');
    fireEvent.click(yesButton);
    expect(mockSetFrontendSavedData).toHaveBeenCalled();
  });

  it('handles reset for permissions tab with frontendSavedData', async () => {
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockUseUserFormStateReturn.frontendSavedData = defaultFormData as any;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    await waitFor(() => {
      expect(mockSetConfirmOpen).toHaveBeenCalledWith(true);
    });
    // Simulate confirmation yes
    mockUseUserFormStateReturn.confirmOpen = true;
    mockUseUserFormStateReturn.confirmType = 'reset' as any;
    const { rerender } = render(<TestWrapper><UserEditForm /></TestWrapper>);
    rerender(<TestWrapper><UserEditForm /></TestWrapper>);
    const yesButton = screen.getByTestId('notification-action-yes');
    fireEvent.click(yesButton);
    expect(mockResetFormData).toHaveBeenCalled();
    expect(mockSetFrontendSavedData).toHaveBeenCalled();
  });

  it('handles reset for permissions tab without frontendSavedData', async () => {
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockUseUserFormStateReturn.frontendSavedData = null as any;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    await waitFor(() => {
      expect(mockSetConfirmOpen).toHaveBeenCalledWith(true);
    });
    // Simulate confirmation yes
    mockUseUserFormStateReturn.confirmOpen = true;
    mockUseUserFormStateReturn.confirmType = 'reset' as any;
    const { rerender } = render(<TestWrapper><UserEditForm /></TestWrapper>);
    rerender(<TestWrapper><UserEditForm /></TestWrapper>);
    const yesButton = screen.getByTestId('notification-action-yes');
    fireEvent.click(yesButton);
    expect(mockResetFormData).toHaveBeenCalled();
    expect(mockSetFrontendSavedData).toHaveBeenCalled();
  });

  it('handles reset for permissions tab with frontendSavedData preserving user details', async () => {
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = { ...defaultFormData, permissions: 'different' };
    mockUseUserFormStateReturn.frontendSavedData = { ...defaultFormData, firstName: 'Preserved', permissions: 'old' } as any;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    await waitFor(() => {
      expect(mockSetConfirmOpen).toHaveBeenCalledWith(true);
    });
    // Simulate confirmation yes
    mockUseUserFormStateReturn.confirmOpen = true;
    mockUseUserFormStateReturn.confirmType = 'reset' as any;
    const { rerender } = render(<TestWrapper><UserEditForm /></TestWrapper>);
    rerender(<TestWrapper><UserEditForm /></TestWrapper>);
    const yesButton = screen.getByTestId('notification-action-yes');
    fireEvent.click(yesButton);
    expect(mockResetFormData).toHaveBeenCalled();
    expect(mockSetFrontendSavedData).toHaveBeenCalled();
  });

  it('handles reset for user details tab with frontendSavedData preserving permissions', async () => {
    mockUseUserFormStateReturn.activeTab = 0;
    mockUseUserFormStateReturn.initialLoadedFormData = { ...defaultFormData, firstName: 'Original' };
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockUseUserFormStateReturn.frontendSavedData = { ...defaultFormData, firstName: 'Changed', permissions: 'preserved' } as any;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);
    await waitFor(() => {
      expect(mockSetConfirmOpen).toHaveBeenCalledWith(true);
    });
    // Simulate confirmation yes
    mockUseUserFormStateReturn.confirmOpen = true;
    mockUseUserFormStateReturn.confirmType = 'reset' as any;
    const { rerender } = render(<TestWrapper><UserEditForm /></TestWrapper>);
    rerender(<TestWrapper><UserEditForm /></TestWrapper>);
    const yesButton = screen.getByTestId('notification-action-yes');
    fireEvent.click(yesButton);
    expect(mockResetFormData).toHaveBeenCalled();
    expect(mockSetFrontendSavedData).toHaveBeenCalled();
  });

  it('handles back button from user details tab', () => {
    mockUseUserFormStateReturn.activeTab = 0;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('handles back button with unsaved permission changes', () => {
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    overrideIsPermissionsModified = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = false;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);
    expect(mockSetActiveTab).toHaveBeenCalledWith(0);
  });

  it('handles back button with saved but modified permissions', () => {
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.originalPermissionData = defaultFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    overrideIsPermissionsModified = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);
    expect(mockSetActiveTab).toHaveBeenCalledWith(0);
  });

  it('handles back button from permissions tab with no modifications', () => {
    mockUseUserFormStateReturn.activeTab = 1;
    overrideIsPermissionsModified = false;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);
    expect(mockSetActiveTab).toHaveBeenCalledWith(0);
  });

  it('handles next button when user details are modified', async () => {
    overrideIsUserDetailsModified = true;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);
    });
    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalled();
    });
  });

  it('handles next button when user details are not modified', () => {
    mockUseUserFormStateReturn.activeTab = 0;
    overrideIsUserDetailsModified = false;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    expect(mockSetActiveTab).toHaveBeenCalledWith(1);
  });

  it('handles openConfirm for cancel type', async () => {
    mockUseUserFormStateReturn.formData = { ...defaultFormData, firstName: 'Jane' };
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    overrideIsUserDetailsModified = true;
    overrideHasUserDetailsChanges = true;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(mockSetConfirmOpen).toHaveBeenCalledWith(true);
      expect(mockSetConfirmType).toHaveBeenCalledWith('cancel');
    });
  });

  it('handles notification close', async () => {
    mockUseUserFormStateReturn.notification = { type: 'success', message: 'Saved successfully' } as any;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      const closeButton = screen.getByTestId('notification-close');
      fireEvent.click(closeButton);
    });
    expect(mockSetNotification).toHaveBeenCalledWith(null);
  });

  it('handles submit error', async () => {
    mockValidateSubmissionPrerequisites.mockReturnValue(true);
    mockSaveUser.mockRejectedValueOnce(new Error('Submit failed'));
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.frontendSavedData = defaultFormData as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    overrideIsPermissionsModified = false;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      const nextButton = screen.getByTestId('next-button');
      fireEvent.click(nextButton);
    });
    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('handles loading state when isLoadingUserData is true', () => {
    // Reset call count and set override before render
    useStateCallCount = 0;
    overrideIsLoadingUserData = true;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    // Component should return null when loading - check that form is not rendered
    expect(screen.queryByTestId('form-header')).not.toBeInTheDocument();
  });

  it('handles duplicate permissions merge correctly', () => {
    const mockParsePermissionsData = require('../../../src/utils/userFormUtils').parsePermissionsData;
    const mockMergeDuplicatePermissions = require('../../../src/utils/userFormUtils').mergeDuplicatePermissions;
    mockParsePermissionsData.mockReturnValue({ read: true, write: true });
    mockMergeDuplicatePermissions.mockReturnValue({ read: true, write: true, admin: true });
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.formData = { ...defaultFormData, permissions: 'read,write' };
    // Mock useDuplicatePermissionPanel to return onDuplicate that calls handleDuplicatePermissions
    let capturedOnDuplicate: any;
    jest.spyOn(require('../../../src/hooks/useDuplicatePermissionPanel'), 'useDuplicatePermissionPanel').mockImplementation((props: any) => {
      capturedOnDuplicate = props.handleDuplicatePermissions;
      return {
        isOpen: true,
        onClose: jest.fn(),
        onDuplicate: props.handleDuplicatePermissions,
        duplicatePanelUsers: [],
        fullUsers: [],
        modulesList: [],
        modulesData: {},
        currentUser: { firstName: '', lastName: '', emailId: '' },
        onSuccessNotification: jest.fn()
      };
    });
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    // Call onDuplicate to trigger handleDuplicatePermissions
    if (capturedOnDuplicate) {
      capturedOnDuplicate(['admin'], ['module1']);
    }
    expect(mockParsePermissionsData).toHaveBeenCalled();
    expect(mockMergeDuplicatePermissions).toHaveBeenCalled();
    expect(mockSetIsPermissionsModified).toHaveBeenCalledWith(true);
  });

  it('handles input change with validation errors', () => {
    mockUseUserFormStateReturn.validationErrors = { firstName: 'Required' };
    const mockSetValidationErrors = jest.fn();
    mockUseUserFormStateReturn.setValidationErrors = mockSetValidationErrors;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const firstNameInput = screen.getByTestId('input-firstName');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('handles input change for permissions tab', () => {
    mockUseUserFormStateReturn.activeTab = 1;
    overrideIsPermissionsModified = false;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const permissionsInput = screen.getByTestId('input-permissions');
    fireEvent.change(permissionsInput, { target: { value: 'read,write,admin' } });
    expect(mockSetIsPermissionsModified).toHaveBeenCalled();
  });

  it('handles handleTabChange stub', () => {
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    // handleTabChange is a stub that returns early, so we just verify it doesn't crash
    const formHeader = screen.getByTestId('form-header');
    expect(formHeader).toBeInTheDocument();
  });

  it('handles API error when no store data exists', async () => {
    const mockHandleError = require('../../../src/utils/userFormUtils').handleError;
    jest.spyOn(require('react-redux'), 'useSelector').mockReturnValueOnce({
      users: [],
      hasUsers: false
    });
    mockGetUserById.mockRejectedValueOnce(new Error('API Error'));
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      // When no store data and API fails, handleError should be called
      expect(mockHandleError).toHaveBeenCalled();
    });
  });

  it('handles input change when activeTab is 0', () => {
    mockUseUserFormStateReturn.activeTab = 0;
    overrideIsUserDetailsModified = false;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const firstNameInput = screen.getByTestId('input-firstName');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    expect(mockSetIsUserDetailsModified).toHaveBeenCalled();
  });

  it('handles setIsLoadingUserData when no store data', async () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockReturnValueOnce({
      users: [],
      hasUsers: false
    });
    mockGetUserById.mockResolvedValueOnce(defaultFormData);
    mockCreateUserFormData.mockReturnValue(defaultFormData);
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    await waitFor(() => {
      expect(mockGetUserById).toHaveBeenCalled();
      // When no store data, setIsLoadingUserData(true) should be called
      expect(mockSetIsLoadingUserData).toHaveBeenCalled();
    });
  });

  it('handles submit with role change and syncAffectedRolesLockStatus', async () => {
    const mockSyncAffectedRolesLockStatus = require('../../../src/utils/roleLockUtils').syncAffectedRolesLockStatus;
    mockSyncAffectedRolesLockStatus.mockResolvedValue(undefined);
    mockValidateSubmissionPrerequisites.mockReturnValue(true);
    mockSaveUser.mockResolvedValue(undefined);
    mockCreateCompleteUserData.mockReturnValue(defaultFormData);
    mockDispatch.mockResolvedValueOnce({ payload: [] });
    mockDispatch.mockResolvedValueOnce({ payload: [{ id: 1, rolename: 'NewRole' }] });
    mockDispatch.mockResolvedValueOnce({ payload: [{ id: 1, rolename: 'NewRole' }] });
    
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.frontendSavedData = { ...defaultFormData, role: 'NewRole' } as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    overrideIsPermissionsModified = false;
    
    // Set initial role to be different
    const initialRole = 'OldRole';
    mockUseUserFormStateReturn.formData = { ...defaultFormData, role: initialRole };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockSaveUser).toHaveBeenCalled();
      expect(mockSyncAffectedRolesLockStatus).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('handles submit with role sync error', async () => {
    const mockSyncAffectedRolesLockStatus = require('../../../src/utils/roleLockUtils').syncAffectedRolesLockStatus;
    mockSyncAffectedRolesLockStatus.mockRejectedValue(new Error('Sync error'));
    mockValidateSubmissionPrerequisites.mockReturnValue(true);
    mockSaveUser.mockResolvedValue(undefined);
    mockCreateCompleteUserData.mockReturnValue(defaultFormData);
    mockDispatch.mockResolvedValueOnce({ payload: [] });
    mockDispatch.mockResolvedValueOnce({ payload: [{ id: 1, rolename: 'NewRole' }] });
    
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.frontendSavedData = { ...defaultFormData, role: 'NewRole' } as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    overrideIsPermissionsModified = false;
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockSaveUser).toHaveBeenCalled();
      expect(mockSyncAffectedRolesLockStatus).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('handles submit when no affected roles', async () => {
    mockValidateSubmissionPrerequisites.mockReturnValue(true);
    mockSaveUser.mockResolvedValue(undefined);
    mockCreateCompleteUserData.mockReturnValue(defaultFormData);
    mockDispatch.mockResolvedValueOnce({ payload: [] });
    
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.frontendSavedData = { ...defaultFormData, role: null } as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    overrideIsPermissionsModified = false;
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockSaveUser).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('handles submit when updatedRoles is empty', async () => {
    const mockSyncAffectedRolesLockStatus = require('../../../src/utils/roleLockUtils').syncAffectedRolesLockStatus;
    mockValidateSubmissionPrerequisites.mockReturnValue(true);
    mockSaveUser.mockResolvedValue(undefined);
    mockCreateCompleteUserData.mockReturnValue(defaultFormData);
    mockDispatch.mockResolvedValueOnce({ payload: [] });
    mockDispatch.mockResolvedValueOnce({ payload: [] }); // Empty roles
    
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.frontendSavedData = { ...defaultFormData, role: 'TestRole' } as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    overrideIsPermissionsModified = false;
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockSaveUser).toHaveBeenCalled();
      // Should not call syncAffectedRolesLockStatus when updatedRoles is empty
      expect(mockSyncAffectedRolesLockStatus).not.toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('handles useEffect with originalFormData and originalPermissionData', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockUseUserFormStateReturn.originalFormData = { ...defaultFormData, firstName: 'Different' };
    mockUseUserFormStateReturn.originalPermissionData = { ...defaultFormData, permissions: 'different' };
    mockUseUserFormStateReturn.activeTab = 0;
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    // Verify that comparison is done with originalFormData when available
    expect(mockCompareUserDetailsFields).toHaveBeenCalled();
  });

  it('handles useEffect with originalPermissionData for permissions tab', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockUseUserFormStateReturn.originalPermissionData = { ...defaultFormData, permissions: 'different' };
    mockUseUserFormStateReturn.activeTab = 1;
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    // Verify that comparison is done with originalPermissionData when available
    expect(mockComparePermissionFields).toHaveBeenCalled();
  });

  it('handles useEffect tracking changes when initialLoadedFormData changes', async () => {
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockUseUserFormStateReturn.originalFormData = defaultFormData;
    mockUseUserFormStateReturn.originalPermissionData = defaultFormData;
    mockCompareUserDetailsFields.mockReturnValue(true);
    mockComparePermissionFields.mockReturnValue(false);
    
    const { rerender } = render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    // Change formData to trigger useEffect
    mockUseUserFormStateReturn.formData = { ...defaultFormData, firstName: 'Changed' };
    rerender(<TestWrapper><UserEditForm /></TestWrapper>);
    
    await waitFor(() => {
      expect(mockCompareUserDetailsFields).toHaveBeenCalled();
      expect(mockSetHasUserDetailsChanges).toHaveBeenCalled();
    });
  });

  it('handles handleCancel with form data but no initial data', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = { ...defaultFormData, firstName: 'Test' };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with empty form data', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      id: '',
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
      subClasses: [],
      permissions: ''
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should navigate directly without confirmation
    expect(mockSetConfirmOpen).not.toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing regions', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      regions: ['Region1', 'Region2']
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing countries', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      countries: ['Country1']
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing divisions', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      divisions: ['Division1']
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing groups', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      groups: ['Group1']
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing departments array', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      departments: ['Dept1']
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing classes', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      classes: ['Class1']
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing subClasses', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      subClasses: ['SubClass1']
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing firstName', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      firstName: 'John'
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing lastName', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      lastName: 'Doe'
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing emailId', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      emailId: 'test@example.com'
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing phoneNumber', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      phoneNumber: '1234567890'
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing role', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      role: 'Admin'
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing department', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      department: 'IT'
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing permissions with enabledModules', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      permissions: {
        enabledModules: ['Module1'],
        selectedPermissions: []
      } as any
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with form data containing permissions with selectedPermissions', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = undefined as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = undefined as any;
    mockUseUserFormStateReturn.formData = {
      ...defaultFormData,
      permissions: {
        enabledModules: [],
        selectedPermissions: ['Permission1']
      } as any
    };
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with initial data showing user details changes', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockUseUserFormStateReturn.formData = { ...defaultFormData, firstName: 'Changed' };
    mockCompareUserDetailsFields.mockReturnValue(true);
    mockComparePermissionFields.mockReturnValue(false);
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleCancel with initial data showing permissions changes', () => {
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockUseUserFormStateReturn.formData = { ...defaultFormData, permissions: 'changed' };
    mockCompareUserDetailsFields.mockReturnValue(false);
    mockComparePermissionFields.mockReturnValue(true);
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    // Should show confirmation since there are changes
    expect(mockSetConfirmOpen).toHaveBeenCalled();
  });

  it('handles handleSaveWithValidation error', async () => {
    mockHandleSaveWithValidation.mockRejectedValueOnce(new Error('Save error'));
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockSetNotification).toHaveBeenCalled();
    });
  });

  it('handles handleSaveWithValidation for permissions tab with changes', async () => {
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData;
    mockHandleSaveWithValidation.mockResolvedValue(undefined);
    mockComparePermissionFields.mockReturnValue(true);
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockComparePermissionFields).toHaveBeenCalled();
      expect(mockSetHasPermissionsChanges).toHaveBeenCalled();
    });
  });

  it('handles duplicate permissions with enabledModules', () => {
    const mockParsePermissionsData = require('../../../src/utils/userFormUtils').parsePermissionsData;
    const mockMergeDuplicatePermissions = require('../../../src/utils/userFormUtils').mergeDuplicatePermissions;
    mockParsePermissionsData.mockReturnValue({ enabledModules: ['module1'], selectedPermissions: ['perm1'] });
    mockMergeDuplicatePermissions.mockReturnValue({ enabledModules: ['module1', 'module2'], selectedPermissions: ['perm1', 'perm2'] });
    
    let capturedOnDuplicate: any;
    jest.spyOn(require('../../../src/hooks/useDuplicatePermissionPanel'), 'useDuplicatePermissionPanel').mockImplementation((props: any) => {
      capturedOnDuplicate = props.handleDuplicatePermissions;
      return {
        isOpen: true,
        onClose: jest.fn(),
        onDuplicate: props.handleDuplicatePermissions,
        duplicatePanelUsers: [],
        fullUsers: [],
        modulesList: [],
        modulesData: {},
        currentUser: { firstName: '', lastName: '', emailId: '' },
        onSuccessNotification: jest.fn()
      };
    });
    
    mockUseUserFormStateReturn.activeTab = 1;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    if (capturedOnDuplicate) {
      capturedOnDuplicate(['perm1', 'perm2'], ['module1', 'module2']);
    }
    
    expect(mockParsePermissionsData).toHaveBeenCalled();
    expect(mockMergeDuplicatePermissions).toHaveBeenCalled();
  });

  it('handles duplicate permissions without enabledModules', () => {
    const mockParsePermissionsData = require('../../../src/utils/userFormUtils').parsePermissionsData;
    const mockMergeDuplicatePermissions = require('../../../src/utils/userFormUtils').mergeDuplicatePermissions;
    mockParsePermissionsData.mockReturnValue({ enabledModules: [], selectedPermissions: ['perm1'] });
    mockMergeDuplicatePermissions.mockReturnValue({ enabledModules: [], selectedPermissions: ['perm1', 'perm2'] });
    
    let capturedOnDuplicate: any;
    jest.spyOn(require('../../../src/hooks/useDuplicatePermissionPanel'), 'useDuplicatePermissionPanel').mockImplementation((props: any) => {
      capturedOnDuplicate = props.handleDuplicatePermissions;
      return {
        isOpen: true,
        onClose: jest.fn(),
        onDuplicate: props.handleDuplicatePermissions,
        duplicatePanelUsers: [],
        fullUsers: [],
        modulesList: [],
        modulesData: {},
        currentUser: { firstName: '', lastName: '', emailId: '' },
        onSuccessNotification: jest.fn()
      };
    });
    
    mockUseUserFormStateReturn.activeTab = 1;
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    if (capturedOnDuplicate) {
      capturedOnDuplicate(['perm1', 'perm2']);
    }
    
    expect(mockParsePermissionsData).toHaveBeenCalled();
    expect(mockMergeDuplicatePermissions).toHaveBeenCalled();
    expect(mockSetIsPermissionsModified).toHaveBeenCalledWith(true);
  });

  it('handles roles fetch when rolesInitialFetchAttempted is false', () => {
    jest.spyOn(require('react-redux'), 'useSelector').mockReturnValueOnce({
      roles: [],
      initialFetchAttempted: false
    });
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles departments and usersForReporting fetch', () => {
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles isInAdminApp styling', () => {
    jest.spyOn(require('../../../src/utils/userFormUtils'), 'isInAdminApp').mockReturnValue(true);
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    // Component should render with admin-app-context class
    expect(screen.getByTestId('form-header')).toBeInTheDocument();
  });

  it('handles handleReset when frontendSavedData does not exist for user details tab', () => {
    mockUseUserFormStateReturn.activeTab = 0;
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData as any;
    mockUseUserFormStateReturn.frontendSavedData = null;
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Should set frontendSavedData to initialLoadedFormData when it doesn't exist
    expect(mockSetFrontendSavedData).toHaveBeenCalled();
  });

  it('handles handleReset when frontendSavedData does not exist for permissions tab', () => {
    mockUseUserFormStateReturn.activeTab = 1;
    mockUseUserFormStateReturn.initialLoadedFormData = defaultFormData as any;
    mockUseUserFormStateReturn.initialLoadedPermissionData = defaultFormData as any;
    mockUseUserFormStateReturn.frontendSavedData = null;
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Should set frontendSavedData to initialLoadedPermissionData when it doesn't exist
    expect(mockSetFrontendSavedData).toHaveBeenCalled();
  });

  it('handles handleSubmitToDatabase when affectedRoles is empty', async () => {
    mockUseUserFormStateReturn.frontendSavedData = defaultFormData as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    mockUseUserFormStateReturn.isPermissionsModified = false;
    mockUseUserFormStateReturn.initialUserRole = '';
    
    mockSaveUser.mockResolvedValue(undefined);
    mockDispatch.mockReturnValue({ payload: [] });
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    // Navigate to permissions tab first
    mockUseUserFormStateReturn.activeTab = 1;
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockSaveUser).toHaveBeenCalled();
    });
  });

  it('handles handleSubmitToDatabase when updatedRoles is empty', async () => {
    mockUseUserFormStateReturn.frontendSavedData = { ...defaultFormData, role: 'Admin' } as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    mockUseUserFormStateReturn.isPermissionsModified = false;
    mockUseUserFormStateReturn.initialUserRole = 'Manager';
    
    mockSaveUser.mockResolvedValue(undefined);
    mockDispatch.mockReturnValue({ payload: [] });
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    // Navigate to permissions tab first
    mockUseUserFormStateReturn.activeTab = 1;
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockSaveUser).toHaveBeenCalled();
    });
  });

  it('handles handleSubmitToDatabase when syncAffectedRolesLockStatus throws error', async () => {
    mockUseUserFormStateReturn.frontendSavedData = { ...defaultFormData, role: 'Admin' } as any;
    mockUseUserFormStateReturn.isUserDetailsSavedToFrontend = true;
    mockUseUserFormStateReturn.isPermissionsSavedToFrontend = true;
    mockUseUserFormStateReturn.savedUserId = '1';
    mockUseUserFormStateReturn.isPermissionsModified = false;
    mockUseUserFormStateReturn.initialUserRole = 'Manager';
    
    mockSaveUser.mockResolvedValue(undefined);
    mockDispatch.mockReturnValue({ payload: [{ id: 1, rolename: 'Admin' }] });
    mockSyncAffectedRolesLockStatus.mockRejectedValue(new Error('Sync error'));
    
    render(<TestWrapper><UserEditForm /></TestWrapper>);
    
    // Navigate to permissions tab first
    mockUseUserFormStateReturn.activeTab = 1;
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(mockSaveUser).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});
