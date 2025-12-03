import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import UserCreateForm from '../../../src/pages/userManagement/UserCreateForm';

// Mock all external dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn((selector) => {
    const mockState = {
      users: {
        users: [
          { id: 123, firstname: 'John', lastname: 'Doe', emailid: 'john.doe@example.com' },
          { id: 124, firstname: 'Jane', lastname: 'Smith', emailid: 'jane.smith@example.com' }
        ],
        hasUsers: true,
        roles: ['Admin', 'Manager', 'Developer'],
        departments: ['IT', 'HR', 'Finance'],
        usersForReporting: []
      }
    };
    return selector(mockState);
  }),
  Provider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('../../../store/Reducers/userSlice', () => ({
  fetchRoles: jest.fn(),
  fetchDepartments: jest.fn(),
  fetchUsersForReporting: jest.fn(),
  fetchUsers: jest.fn()
}));

jest.mock('../../../services/userSaveService', () => ({
  saveUser: jest.fn()
}));

jest.mock('../../../utils/formValidationUtils', () => ({
  validateRequiredFields: jest.fn(),
  validateArrayFields: jest.fn(),
  validateFormats: jest.fn(),
  validateEmail: jest.fn(() => true),
  validatePhoneNumber: jest.fn(() => true),
}));

jest.mock('../../../utils/userFormUtils', () => ({
  isInAdminApp: jest.fn(() => false),
  getNavigationPath: jest.fn(() => '/user-management'),
  navigateToUserManagement: jest.fn(),
  updateFormData: jest.fn(),
  TabPanel: ({ children, value, index }: any) => value === index ? <div>{children}</div> : null,
  createCompleteUserData: jest.fn(() => ({})),
  validateSubmissionPrerequisites: jest.fn(() => true),
  showSaveConfirmationMessage: jest.fn(),
  hideSaveConfirmationMessage: jest.fn(),
}));

jest.mock('../../../hooks/useUserFormState', () => ({
  useUserFormState: jest.fn(() => ({
    activeTab: 0,
    setActiveTab: jest.fn(),
    isFormModified: false,
    setIsFormModified: jest.fn(),
    confirmOpen: false,
    setConfirmOpen: jest.fn(),
    confirmMessage: '',
    setConfirmMessage: jest.fn(),
    confirmType: null,
    setConfirmType: jest.fn(),
    notification: null,
    setNotification: jest.fn(),
    isSaveSuccessful: false,
    setIsSaveSuccessful: jest.fn(),
    isLoading: false,
    setIsLoading: jest.fn(),
    validationErrors: {},
    setValidationErrors: jest.fn(),
    savedUserId: null,
    setSavedUserId: jest.fn(),
    currentUserIdRef: { current: null },
    isDataSaved: false,
    setIsDataSaved: jest.fn(),
    originalFormData: null,
    setOriginalFormData: jest.fn(),
    isPermissionSaved: false,
    setIsPermissionSaved: jest.fn(),
    originalPermissionData: null,
    setOriginalPermissionData: jest.fn(),
    showSaveConfirmation: false,
    setShowSaveConfirmation: jest.fn(),
    permissionResetTrigger: 0,
    setPermissionResetTrigger: jest.fn(),
    frontendSavedData: null,
    setFrontendSavedData: jest.fn(),
    isUserDetailsSavedToFrontend: false,
    setIsUserDetailsSavedToFrontend: jest.fn(),
    isPermissionsSavedToFrontend: false,
    setIsPermissionsSavedToFrontend: jest.fn(),
    isSubmitLoading: false,
    setIsSubmitLoading: jest.fn(),
    formData: {
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
      subClasses: [],
      permissions: undefined,
    },
    setFormData: jest.fn(),
  }))
}));

jest.mock('../../../components/userManagement/PermissionTableConstants', () => ({
  getUserFormStyles: () => ({
    container: {},
    formContainer: {},
    tabContainer: {},
    tabPanel: {},
    formSection: {},
    formRow: {},
    formField: {},
    scrollableContent: {}
  }),
  getHorizontalDividerStyles: () => ({}),
  getVerticalDividerStyles: () => ({}),
  getSmallVerticalDividerStyles: () => ({}),
  getSectionTitleContainerStyles: () => ({}),
  getFlexBetweenContainerStyles: () => ({}),
  getActionButtonStyles: () => ({}),
  getButtonContentStyles: () => ({}),
  getButtonTextStyles: () => ({})
}));

jest.mock('commonApp/FormHeaderWithTabs', () => {
  return function MockFormHeaderWithTabs({ 
    title, 
    tabs, 
    activeTab, 
    onTabChange, 
    onBack, 
    onReset, 
    onCancel, 
    onSave, 
    onNext,
    isFormModified,
    isSaveDisabled,
    isNextDisabled,
    showSaveButton,
    showNextButton,
    useSubmitIcon,
    submitButtonText,
    statusMessage,
    ...props 
  }: any) {
    return (
      <div data-testid="form-header-with-tabs" {...props}>
        <div data-testid="form-title">{title}</div>
        {tabs.map((tab: any, index: number) => (
          <button
            key={tab.value}
            data-testid={`tab-${index}`}
            className={activeTab === index ? 'active' : ''}
            onClick={() => onTabChange && onTabChange({} as React.SyntheticEvent, index)}
          >
            {tab.label}
          </button>
        ))}
        <button data-testid="back-button" onClick={onBack}>Back</button>
        <button data-testid="reset-button" onClick={onReset}>Reset</button>
        <button data-testid="cancel-button" onClick={onCancel}>Cancel</button>
        {showSaveButton && (
          <button 
            data-testid="save-button" 
            onClick={onSave}
            disabled={isSaveDisabled}
          >
            Save
          </button>
        )}
        {showNextButton && (
          <button 
            data-testid="next-button" 
            onClick={onNext}
            disabled={isNextDisabled}
          >
            {useSubmitIcon ? submitButtonText || 'Submit' : 'Next'}
          </button>
        )}
        {statusMessage && (
          <div data-testid="status-message">{statusMessage}</div>
        )}
      </div>
    );
  };
});

jest.mock('commonApp/CustomCheckbox', () => {
  return function MockCustomCheckbox({ label, checked, onChange, ...props }: any) {
    return (
      <div data-testid={`checkbox-${props['data-testid'] || 'default'}`} {...props}>
        <label>
          <input
            type="checkbox"
            checked={checked || false}
            onChange={(e) => onChange && onChange(e)}
          />
          {label}
        </label>
      </div>
    );
  };
});

jest.mock('commonApp/NotificationAlert', () => {
  return function MockNotificationAlert({ 
    open, 
    variant, 
    message, 
    title, 
    onClose, 
    actions, 
    autoHideDuration,
    ...props 
  }: any) {
    if (!open) return null;
    return (
      <div 
        data-testid="notification-alert" 
        data-variant={variant}
        data-title={title}
        data-message={message}
        {...props}
      >
        {title && <div data-testid="alert-title">{title}</div>}
        {message && <div data-testid="alert-message">{message}</div>}
        {actions && actions.map((action: any, index: number) => (
          <button key={index} data-testid={`alert-action-${action.label.toLowerCase()}`} onClick={action.onClick}>
            {action.label}
          </button>
        ))}
        <button data-testid="alert-close" onClick={onClose}>Close</button>
      </div>
    );
  };
});

jest.mock('../../../components/userManagement/PermissionsTabLayout', () => {
  return function MockPermissionsTabLayout({ formData, onInputChange, resetTrigger }: any) {
    return (
      <div data-testid="permissions-tab-layout">
        <div data-testid="permissions-reset-trigger">{resetTrigger}</div>
        <button 
          data-testid="permissions-test-button"
          onClick={() => onInputChange('regions', ['North America'])}
        >
          Test Permission Change
        </button>
      </div>
    );
  };
});

jest.mock('../../../components/userManagement/UserFormComponents', () => ({
  ReusableTextField: ({ field, label, value, onChange, error, errorMessage, ...props }: any) => (
    <div data-testid={`textfield-${field}`} {...props}>
      <label>{label}</label>
      <input
        name={field}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        data-error={error}
      />
      {error && errorMessage && <span data-testid={`error-${field}`}>{errorMessage}</span>}
    </div>
  ),
  ReusableSelectField: ({ field, label, value, onChange, options, placeholder, required, disabled, error, errorMessage, ...props }: any) => (
    <div data-testid={`selectfield-${field}`} {...props}>
      <label>{label}</label>
      <select
        name={field}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        data-error={error}
      >
        <option value="">{placeholder}</option>
        {options?.map((option: string, index: number) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
      {error && errorMessage && <span data-testid={`error-${field}`}>{errorMessage}</span>}
    </div>
  ),
  SectionTitle: ({ children, sx }: any) => <h3 data-testid="section-title" style={sx}>{children}</h3>,
  EmptyFormField: () => <div data-testid="empty-form-field" />
}));

// Create a mock store
const mockStore = configureStore({
  reducer: {
    users: () => ({
      users: [
        { id: 123, firstname: 'John', lastname: 'Doe', emailid: 'john.doe@example.com' },
        { id: 124, firstname: 'Jane', lastname: 'Smith', emailid: 'jane.smith@example.com' }
      ],
      hasUsers: true,
      roles: ['Admin', 'Manager', 'Developer'],
      departments: ['IT', 'HR', 'Finance'],
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

describe('UserCreateForm - Validation Paths and Form States', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates User Details tab required fields', () => {
    const mockSetValidationErrors = jest.fn();
    const formValidationUtils = require('../../../utils/formValidationUtils');

    const { useUserFormState } = require('../../../hooks/useUserFormState');
    useUserFormState.mockReturnValue({
      activeTab: 0,
      setActiveTab: jest.fn(),
      isFormModified: false,
      setIsFormModified: jest.fn(),
      confirmOpen: false,
      setConfirmOpen: jest.fn(),
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: jest.fn(),
      notification: null,
      setNotification: jest.fn(),
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {},
      setValidationErrors: mockSetValidationErrors,
      savedUserId: null,
      setSavedUserId: jest.fn(),
      currentUserIdRef: { current: null },
      isDataSaved: false,
      setIsDataSaved: jest.fn(),
      originalFormData: null,
      setOriginalFormData: jest.fn(),
      isPermissionSaved: false,
      setIsPermissionSaved: jest.fn(),
      originalPermissionData: null,
      setOriginalPermissionData: jest.fn(),
      showSaveConfirmation: false,
      setShowSaveConfirmation: jest.fn(),
      permissionResetTrigger: 0,
      setPermissionResetTrigger: jest.fn(),
      frontendSavedData: null,
      setFrontendSavedData: jest.fn(),
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: jest.fn(),
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: jest.fn(),
      isSubmitLoading: false,
      setIsSubmitLoading: jest.fn(),
      formData: {
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
        permissions: undefined,
      },
      setFormData: jest.fn(),
    });

    render(
      <TestWrapper>
        <UserCreateForm />
      </TestWrapper>
    );

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(formValidationUtils.validateRequiredFields).toHaveBeenCalled();
    expect(formValidationUtils.validateFormats).toHaveBeenCalled();
    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('validates Permissions tab required array fields', () => {
    const mockSetValidationErrors = jest.fn();
    const formValidationUtils = require('../../../utils/formValidationUtils');

    const { useUserFormState } = require('../../../hooks/useUserFormState');
    useUserFormState.mockReturnValue({
      activeTab: 1,
      setActiveTab: jest.fn(),
      isFormModified: false,
      setIsFormModified: jest.fn(),
      confirmOpen: false,
      setConfirmOpen: jest.fn(),
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: jest.fn(),
      notification: null,
      setNotification: jest.fn(),
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {},
      setValidationErrors: mockSetValidationErrors,
      savedUserId: null,
      setSavedUserId: jest.fn(),
      currentUserIdRef: { current: null },
      isDataSaved: false,
      setIsDataSaved: jest.fn(),
      originalFormData: null,
      setOriginalFormData: jest.fn(),
      isPermissionSaved: false,
      setIsPermissionSaved: jest.fn(),
      originalPermissionData: null,
      setOriginalPermissionData: jest.fn(),
      showSaveConfirmation: false,
      setShowSaveConfirmation: jest.fn(),
      permissionResetTrigger: 0,
      setPermissionResetTrigger: jest.fn(),
      frontendSavedData: null,
      setFrontendSavedData: jest.fn(),
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: jest.fn(),
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: jest.fn(),
      isSubmitLoading: false,
      setIsSubmitLoading: jest.fn(),
      formData: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john.doe@example.com',
        selfReporting: false,
        reportingManager: 'Jane Smith',
        dottedLineManager: '',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: [],
        permissions: undefined,
      },
      setFormData: jest.fn(),
    });

    render(
      <TestWrapper>
        <UserCreateForm />
      </TestWrapper>
    );

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(formValidationUtils.validateArrayFields).toHaveBeenCalled();
    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('validates email format', () => {
    const mockSetValidationErrors = jest.fn();
    const formValidationUtils = require('../../../utils/formValidationUtils');
    formValidationUtils.validateEmail.mockReturnValue(false);

    const { useUserFormState } = require('../../../hooks/useUserFormState');
    useUserFormState.mockReturnValue({
      activeTab: 0,
      setActiveTab: jest.fn(),
      isFormModified: false,
      setIsFormModified: jest.fn(),
      confirmOpen: false,
      setConfirmOpen: jest.fn(),
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: jest.fn(),
      notification: null,
      setNotification: jest.fn(),
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {},
      setValidationErrors: mockSetValidationErrors,
      savedUserId: null,
      setSavedUserId: jest.fn(),
      currentUserIdRef: { current: null },
      isDataSaved: false,
      setIsDataSaved: jest.fn(),
      originalFormData: null,
      setOriginalFormData: jest.fn(),
      isPermissionSaved: false,
      setIsPermissionSaved: jest.fn(),
      originalPermissionData: null,
      setOriginalPermissionData: jest.fn(),
      showSaveConfirmation: false,
      setShowSaveConfirmation: jest.fn(),
      permissionResetTrigger: 0,
      setPermissionResetTrigger: jest.fn(),
      frontendSavedData: null,
      setFrontendSavedData: jest.fn(),
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: jest.fn(),
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: jest.fn(),
      isSubmitLoading: false,
      setIsSubmitLoading: jest.fn(),
      formData: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'invalid-email',
        selfReporting: false,
        reportingManager: 'Jane Smith',
        dottedLineManager: '',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: [],
        permissions: undefined,
      },
      setFormData: jest.fn(),
    });

    render(
      <TestWrapper>
        <UserCreateForm />
      </TestWrapper>
    );

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(formValidationUtils.validateEmail).toHaveBeenCalledWith('invalid-email');
    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('validates phone number format', () => {
    const mockSetValidationErrors = jest.fn();
    const formValidationUtils = require('../../../utils/formValidationUtils');
    formValidationUtils.validatePhoneNumber.mockReturnValue(false);

    const { useUserFormState } = require('../../../hooks/useUserFormState');
    useUserFormState.mockReturnValue({
      activeTab: 0,
      setActiveTab: jest.fn(),
      isFormModified: false,
      setIsFormModified: jest.fn(),
      confirmOpen: false,
      setConfirmOpen: jest.fn(),
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: jest.fn(),
      notification: null,
      setNotification: jest.fn(),
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {},
      setValidationErrors: mockSetValidationErrors,
      savedUserId: null,
      setSavedUserId: jest.fn(),
      currentUserIdRef: { current: null },
      isDataSaved: false,
      setIsDataSaved: jest.fn(),
      originalFormData: null,
      setOriginalFormData: jest.fn(),
      isPermissionSaved: false,
      setIsPermissionSaved: jest.fn(),
      originalPermissionData: null,
      setOriginalPermissionData: jest.fn(),
      showSaveConfirmation: false,
      setShowSaveConfirmation: jest.fn(),
      permissionResetTrigger: 0,
      setPermissionResetTrigger: jest.fn(),
      frontendSavedData: null,
      setFrontendSavedData: jest.fn(),
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: jest.fn(),
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: jest.fn(),
      isSubmitLoading: false,
      setIsSubmitLoading: jest.fn(),
      formData: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: 'invalid-phone',
        role: 'Admin',
        department: 'IT',
        emailId: 'john.doe@example.com',
        selfReporting: false,
        reportingManager: 'Jane Smith',
        dottedLineManager: '',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: [],
        permissions: undefined,
      },
      setFormData: jest.fn(),
    });

    render(
      <TestWrapper>
        <UserCreateForm />
      </TestWrapper>
    );

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(formValidationUtils.validatePhoneNumber).toHaveBeenCalledWith('invalid-phone');
    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('validates reporting manager requirement when not self-reporting', () => {
    const mockSetValidationErrors = jest.fn();

    const { useUserFormState } = require('../../../hooks/useUserFormState');
    useUserFormState.mockReturnValue({
      activeTab: 0,
      setActiveTab: jest.fn(),
      isFormModified: false,
      setIsFormModified: jest.fn(),
      confirmOpen: false,
      setConfirmOpen: jest.fn(),
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: jest.fn(),
      notification: null,
      setNotification: jest.fn(),
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {},
      setValidationErrors: mockSetValidationErrors,
      savedUserId: null,
      setSavedUserId: jest.fn(),
      currentUserIdRef: { current: null },
      isDataSaved: false,
      setIsDataSaved: jest.fn(),
      originalFormData: null,
      setOriginalFormData: jest.fn(),
      isPermissionSaved: false,
      setIsPermissionSaved: jest.fn(),
      originalPermissionData: null,
      setOriginalPermissionData: jest.fn(),
      showSaveConfirmation: false,
      setShowSaveConfirmation: jest.fn(),
      permissionResetTrigger: 0,
      setPermissionResetTrigger: jest.fn(),
      frontendSavedData: null,
      setFrontendSavedData: jest.fn(),
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: jest.fn(),
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: jest.fn(),
      isSubmitLoading: false,
      setIsSubmitLoading: jest.fn(),
      formData: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john.doe@example.com',
        selfReporting: false,
        reportingManager: '', // Missing required field
        dottedLineManager: '',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: [],
        permissions: undefined,
      },
      setFormData: jest.fn(),
    });

    render(
      <TestWrapper>
        <UserCreateForm />
      </TestWrapper>
    );

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('handles form validation with self-reporting enabled', () => {
    const mockSetValidationErrors = jest.fn();

    const { useUserFormState } = require('../../../hooks/useUserFormState');
    useUserFormState.mockReturnValue({
      activeTab: 0,
      setActiveTab: jest.fn(),
      isFormModified: false,
      setIsFormModified: jest.fn(),
      confirmOpen: false,
      setConfirmOpen: jest.fn(),
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: jest.fn(),
      notification: null,
      setNotification: jest.fn(),
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {},
      setValidationErrors: mockSetValidationErrors,
      savedUserId: null,
      setSavedUserId: jest.fn(),
      currentUserIdRef: { current: null },
      isDataSaved: false,
      setIsDataSaved: jest.fn(),
      originalFormData: null,
      setOriginalFormData: jest.fn(),
      isPermissionSaved: false,
      setIsPermissionSaved: jest.fn(),
      originalPermissionData: null,
      setOriginalPermissionData: jest.fn(),
      showSaveConfirmation: false,
      setShowSaveConfirmation: jest.fn(),
      permissionResetTrigger: 0,
      setPermissionResetTrigger: jest.fn(),
      frontendSavedData: null,
      setFrontendSavedData: jest.fn(),
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: jest.fn(),
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: jest.fn(),
      isSubmitLoading: false,
      setIsSubmitLoading: jest.fn(),
      formData: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john.doe@example.com',
        selfReporting: true, // Self-reporting enabled
        reportingManager: '',
        dottedLineManager: '',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: [],
        permissions: undefined,
      },
      setFormData: jest.fn(),
    });

    render(
      <TestWrapper>
        <UserCreateForm />
      </TestWrapper>
    );

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('handles form validation error clearing', () => {
    const mockSetValidationErrors = jest.fn();

    const { useUserFormState } = require('../../../hooks/useUserFormState');
    useUserFormState.mockReturnValue({
      activeTab: 0,
      setActiveTab: jest.fn(),
      isFormModified: false,
      setIsFormModified: jest.fn(),
      confirmOpen: false,
      setConfirmOpen: jest.fn(),
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: jest.fn(),
      notification: null,
      setNotification: jest.fn(),
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {
        firstName: 'First Name is required',
        reportingManager: 'Reporting Manager is required'
      },
      setValidationErrors: mockSetValidationErrors,
      savedUserId: null,
      setSavedUserId: jest.fn(),
      currentUserIdRef: { current: null },
      isDataSaved: false,
      setIsDataSaved: jest.fn(),
      originalFormData: null,
      setOriginalFormData: jest.fn(),
      isPermissionSaved: false,
      setIsPermissionSaved: jest.fn(),
      originalPermissionData: null,
      setOriginalPermissionData: jest.fn(),
      showSaveConfirmation: false,
      setShowSaveConfirmation: jest.fn(),
      permissionResetTrigger: 0,
      setPermissionResetTrigger: jest.fn(),
      frontendSavedData: null,
      setFrontendSavedData: jest.fn(),
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: jest.fn(),
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: jest.fn(),
      isSubmitLoading: false,
      setIsSubmitLoading: jest.fn(),
      formData: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john.doe@example.com',
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
        permissions: undefined,
      },
      setFormData: jest.fn(),
    });

    render(
      <TestWrapper>
        <UserCreateForm />
      </TestWrapper>
    );

    // Test input change to clear validation error
    const firstNameInput = screen.getByTestId('textfield-firstName').querySelector('input');
    fireEvent.change(firstNameInput!, { target: { value: 'John' } });

    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('handles form validation with self-reporting checkbox change', () => {
    const mockSetValidationErrors = jest.fn();

    const { useUserFormState } = require('../../../hooks/useUserFormState');
    useUserFormState.mockReturnValue({
      activeTab: 0,
      setActiveTab: jest.fn(),
      isFormModified: false,
      setIsFormModified: jest.fn(),
      confirmOpen: false,
      setConfirmOpen: jest.fn(),
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: jest.fn(),
      notification: null,
      setNotification: jest.fn(),
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {
        reportingManager: 'Reporting Manager is required'
      },
      setValidationErrors: mockSetValidationErrors,
      savedUserId: null,
      setSavedUserId: jest.fn(),
      currentUserIdRef: { current: null },
      isDataSaved: false,
      setIsDataSaved: jest.fn(),
      originalFormData: null,
      setOriginalFormData: jest.fn(),
      isPermissionSaved: false,
      setIsPermissionSaved: jest.fn(),
      originalPermissionData: null,
      setOriginalPermissionData: jest.fn(),
      showSaveConfirmation: false,
      setShowSaveConfirmation: jest.fn(),
      permissionResetTrigger: 0,
      setPermissionResetTrigger: jest.fn(),
      frontendSavedData: null,
      setFrontendSavedData: jest.fn(),
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: jest.fn(),
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: jest.fn(),
      isSubmitLoading: false,
      setIsSubmitLoading: jest.fn(),
      formData: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john.doe@example.com',
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
        permissions: undefined,
      },
      setFormData: jest.fn(),
    });

    render(
      <TestWrapper>
        <UserCreateForm />
      </TestWrapper>
    );

    // Test self-reporting checkbox change to clear reporting manager error
    const selfReportingCheckbox = screen.getByTestId('checkbox-selfReporting').querySelector('input');
    fireEvent.click(selfReportingCheckbox!);

    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('handles form validation with all validation utilities', () => {
    const mockSetValidationErrors = jest.fn();
    const formValidationUtils = require('../../../utils/formValidationUtils');

    const { useUserFormState } = require('../../../hooks/useUserFormState');
    useUserFormState.mockReturnValue({
      activeTab: 0,
      setActiveTab: jest.fn(),
      isFormModified: false,
      setIsFormModified: jest.fn(),
      confirmOpen: false,
      setConfirmOpen: jest.fn(),
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: jest.fn(),
      notification: null,
      setNotification: jest.fn(),
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {},
      setValidationErrors: mockSetValidationErrors,
      savedUserId: null,
      setSavedUserId: jest.fn(),
      currentUserIdRef: { current: null },
      isDataSaved: false,
      setIsDataSaved: jest.fn(),
      originalFormData: null,
      setOriginalFormData: jest.fn(),
      isPermissionSaved: false,
      setIsPermissionSaved: jest.fn(),
      originalPermissionData: null,
      setOriginalPermissionData: jest.fn(),
      showSaveConfirmation: false,
      setShowSaveConfirmation: jest.fn(),
      permissionResetTrigger: 0,
      setPermissionResetTrigger: jest.fn(),
      frontendSavedData: null,
      setFrontendSavedData: jest.fn(),
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: jest.fn(),
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: jest.fn(),
      isSubmitLoading: false,
      setIsSubmitLoading: jest.fn(),
      formData: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john.doe@example.com',
        selfReporting: false,
        reportingManager: 'Jane Smith',
        dottedLineManager: '',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: [],
        permissions: undefined,
      },
      setFormData: jest.fn(),
    });

    render(
      <TestWrapper>
        <UserCreateForm />
      </TestWrapper>
    );

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(formValidationUtils.validateRequiredFields).toHaveBeenCalled();
    expect(formValidationUtils.validateFormats).toHaveBeenCalled();
    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('handles form validation with permissions tab', () => {
    const mockSetValidationErrors = jest.fn();
    const formValidationUtils = require('../../../utils/formValidationUtils');

    const { useUserFormState } = require('../../../hooks/useUserFormState');
    useUserFormState.mockReturnValue({
      activeTab: 1,
      setActiveTab: jest.fn(),
      isFormModified: false,
      setIsFormModified: jest.fn(),
      confirmOpen: false,
      setConfirmOpen: jest.fn(),
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: jest.fn(),
      notification: null,
      setNotification: jest.fn(),
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {},
      setValidationErrors: mockSetValidationErrors,
      savedUserId: null,
      setSavedUserId: jest.fn(),
      currentUserIdRef: { current: null },
      isDataSaved: false,
      setIsDataSaved: jest.fn(),
      originalFormData: null,
      setOriginalFormData: jest.fn(),
      isPermissionSaved: false,
      setIsPermissionSaved: jest.fn(),
      originalPermissionData: null,
      setOriginalPermissionData: jest.fn(),
      showSaveConfirmation: false,
      setShowSaveConfirmation: jest.fn(),
      permissionResetTrigger: 0,
      setPermissionResetTrigger: jest.fn(),
      frontendSavedData: null,
      setFrontendSavedData: jest.fn(),
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: jest.fn(),
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: jest.fn(),
      isSubmitLoading: false,
      setIsSubmitLoading: jest.fn(),
      formData: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john.doe@example.com',
        selfReporting: false,
        reportingManager: 'Jane Smith',
        dottedLineManager: '',
        regions: ['North America'],
        countries: ['USA'],
        divisions: ['Engineering'],
        groups: ['Development'],
        departments: ['IT'],
        classes: ['Senior'],
        subClasses: ['Lead'],
        permissions: undefined,
      },
      setFormData: jest.fn(),
    });

    render(
      <TestWrapper>
        <UserCreateForm />
      </TestWrapper>
    );

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(formValidationUtils.validateArrayFields).toHaveBeenCalled();
    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('handles form validation with mixed validation errors', () => {
    const mockSetValidationErrors = jest.fn();
    const formValidationUtils = require('../../../utils/formValidationUtils');
    formValidationUtils.validateEmail.mockReturnValue(false);
    formValidationUtils.validatePhoneNumber.mockReturnValue(false);

    const { useUserFormState } = require('../../../hooks/useUserFormState');
    useUserFormState.mockReturnValue({
      activeTab: 0,
      setActiveTab: jest.fn(),
      isFormModified: false,
      setIsFormModified: jest.fn(),
      confirmOpen: false,
      setConfirmOpen: jest.fn(),
      confirmMessage: '',
      setConfirmMessage: jest.fn(),
      confirmType: null,
      setConfirmType: jest.fn(),
      notification: null,
      setNotification: jest.fn(),
      isSaveSuccessful: false,
      setIsSaveSuccessful: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      validationErrors: {},
      setValidationErrors: mockSetValidationErrors,
      savedUserId: null,
      setSavedUserId: jest.fn(),
      currentUserIdRef: { current: null },
      isDataSaved: false,
      setIsDataSaved: jest.fn(),
      originalFormData: null,
      setOriginalFormData: jest.fn(),
      isPermissionSaved: false,
      setIsPermissionSaved: jest.fn(),
      originalPermissionData: null,
      setOriginalPermissionData: jest.fn(),
      showSaveConfirmation: false,
      setShowSaveConfirmation: jest.fn(),
      permissionResetTrigger: 0,
      setPermissionResetTrigger: jest.fn(),
      frontendSavedData: null,
      setFrontendSavedData: jest.fn(),
      isUserDetailsSavedToFrontend: false,
      setIsUserDetailsSavedToFrontend: jest.fn(),
      isPermissionsSavedToFrontend: false,
      setIsPermissionsSavedToFrontend: jest.fn(),
      isSubmitLoading: false,
      setIsSubmitLoading: jest.fn(),
      formData: {
        firstName: '',
        lastName: '',
        phoneNumber: 'invalid-phone',
        role: '',
        department: '',
        emailId: 'invalid-email',
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
        permissions: undefined,
      },
      setFormData: jest.fn(),
    });

    render(
      <TestWrapper>
        <UserCreateForm />
      </TestWrapper>
    );

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(formValidationUtils.validateRequiredFields).toHaveBeenCalled();
    expect(formValidationUtils.validateFormats).toHaveBeenCalled();
    expect(formValidationUtils.validateEmail).toHaveBeenCalledWith('invalid-email');
    expect(formValidationUtils.validatePhoneNumber).toHaveBeenCalledWith('invalid-phone');
    expect(mockSetValidationErrors).toHaveBeenCalled();
  });
});
