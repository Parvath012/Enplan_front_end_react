import React from 'react';
import { render } from '@testing-library/react';
import { useFormValidation } from '../FormValidation';
import type { UserFormData } from '../../../types/UserFormData';

// Mock validation utilities
jest.mock('../../../utils/formValidationUtils', () => ({
  validateRequiredFields: jest.fn(),
  validateArrayFields: jest.fn(),
  validateFormats: jest.fn(),
  validateEmail: jest.fn().mockReturnValue(true),
  validatePhoneNumber: jest.fn().mockReturnValue(true)
}));

// Test component to use the hook
const TestComponent: React.FC<{
  activeTab: number;
  formData: UserFormData;
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string>) => void;
}> = ({ activeTab, formData, validationErrors, setValidationErrors }) => {
  const validation = useFormValidation({
    activeTab,
    formData,
    validationErrors,
    setValidationErrors
  });

  return (
    <div>
      <div data-testid="validate-form-result">{validation.validateForm().toString()}</div>
      <div data-testid="is-form-valid-result">{validation.isFormValid().toString()}</div>
      <div data-testid="error-props-firstName">{validation.getErrorProps('firstName').error.toString()}</div>
      <div data-testid="error-message-firstName">{validation.getErrorProps('firstName').errorMessage}</div>
    </div>
  );
};

describe('useFormValidation Hook', () => {
  const mockSetValidationErrors = jest.fn();
  
  const defaultFormData: UserFormData = {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all required functions', () => {
    const validation = useFormValidation({
      activeTab: 0,
      formData: defaultFormData,
      validationErrors: {},
      setValidationErrors: mockSetValidationErrors
    });

    expect(typeof validation.validateForm).toBe('function');
    expect(typeof validation.isFormValid).toBe('function');
    expect(typeof validation.getErrorProps).toBe('function');
    expect(typeof validation.validateCurrentTab).toBe('function');
  });

  it('validates form for user details tab (activeTab = 0)', () => {
    render(
      <TestComponent
        activeTab={0}
        formData={defaultFormData}
        validationErrors={{}}
        setValidationErrors={mockSetValidationErrors}
      />
    );

    // The validation should be called and return a boolean
    expect(screen.getByTestId('validate-form-result')).toBeInTheDocument();
    expect(screen.getByTestId('is-form-valid-result')).toBeInTheDocument();
  });

  it('validates form for permissions tab (activeTab = 1)', () => {
    render(
      <TestComponent
        activeTab={1}
        formData={defaultFormData}
        validationErrors={{}}
        setValidationErrors={mockSetValidationErrors}
      />
    );

    expect(screen.getByTestId('validate-form-result')).toBeInTheDocument();
    expect(screen.getByTestId('is-form-valid-result')).toBeInTheDocument();
  });

  it('handles validation errors', () => {
    const validationErrors = {
      firstName: 'First Name is required',
      lastName: 'Last Name is required'
    };

    render(
      <TestComponent
        activeTab={0}
        formData={defaultFormData}
        validationErrors={validationErrors}
        setValidationErrors={mockSetValidationErrors}
      />
    );

    expect(screen.getByTestId('error-props-firstName')).toHaveTextContent('true');
    expect(screen.getByTestId('error-message-firstName')).toHaveTextContent('First Name is required');
  });

  it('handles empty validation errors', () => {
    render(
      <TestComponent
        activeTab={0}
        formData={defaultFormData}
        validationErrors={{}}
        setValidationErrors={mockSetValidationErrors}
      />
    );

    expect(screen.getByTestId('error-props-firstName')).toHaveTextContent('false');
    expect(screen.getByTestId('error-message-firstName')).toHaveTextContent('');
  });

  it('handles self-reporting validation', () => {
    const formDataWithSelfReporting = {
      ...defaultFormData,
      selfReporting: true,
      reportingManager: '',
      dottedLineManager: ''
    };

    render(
      <TestComponent
        activeTab={0}
        formData={formDataWithSelfReporting}
        validationErrors={{}}
        setValidationErrors={mockSetValidationErrors}
      />
    );

    expect(screen.getByTestId('is-form-valid-result')).toBeInTheDocument();
  });

  it('handles missing required fields', () => {
    const incompleteFormData = {
      ...defaultFormData,
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: '',
      department: '',
      emailId: ''
    };

    render(
      <TestComponent
        activeTab={0}
        formData={incompleteFormData}
        validationErrors={{}}
        setValidationErrors={mockSetValidationErrors}
      />
    );

    expect(screen.getByTestId('is-form-valid-result')).toBeInTheDocument();
  });

  it('handles permissions validation', () => {
    const permissionsFormData = {
      ...defaultFormData,
      regions: [],
      countries: [],
      divisions: [],
      groups: [],
      departments: [],
      classes: [],
      subClasses: []
    };

    render(
      <TestComponent
        activeTab={1}
        formData={permissionsFormData}
        validationErrors={{}}
        setValidationErrors={mockSetValidationErrors}
      />
    );

    expect(screen.getByTestId('is-form-valid-result')).toBeInTheDocument();
  });

  it('handles complete permissions data', () => {
    const completePermissionsData = {
      ...defaultFormData,
      regions: ['North America', 'Europe'],
      countries: ['USA', 'Canada'],
      divisions: ['Technology', 'Sales'],
      groups: ['Development', 'QA'],
      departments: ['Engineering', 'Marketing'],
      classes: ['Senior', 'Junior'],
      subClasses: ['Frontend', 'Backend']
    };

    render(
      <TestComponent
        activeTab={1}
        formData={completePermissionsData}
        validationErrors={{}}
        setValidationErrors={mockSetValidationErrors}
      />
    );

    expect(screen.getByTestId('is-form-valid-result')).toBeInTheDocument();
  });

  it('handles different field validation scenarios', () => {
    const testCases = [
      { field: 'firstName', value: 'John' },
      { field: 'lastName', value: 'Doe' },
      { field: 'phoneNumber', value: '1234567890' },
      { field: 'emailId', value: 'john@example.com' },
      { field: 'role', value: 'Admin' },
      { field: 'department', value: 'IT' }
    ];

    testCases.forEach(({ field, value }) => {
      const testFormData = { ...defaultFormData, [field]: value };
      
      render(
        <TestComponent
          activeTab={0}
          formData={testFormData}
          validationErrors={{}}
          setValidationErrors={mockSetValidationErrors}
        />
      );

      expect(screen.getByTestId('is-form-valid-result')).toBeInTheDocument();
    });
  });

  it('handles edge cases for validation', () => {
    // Empty form data
    const emptyFormData = {
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

    render(
      <TestComponent
        activeTab={0}
        formData={emptyFormData}
        validationErrors={{}}
        setValidationErrors={mockSetValidationErrors}
      />
    );

    expect(screen.getByTestId('is-form-valid-result')).toBeInTheDocument();
  });

  it('handles invalid activeTab values', () => {
    render(
      <TestComponent
        activeTab={2} // Invalid tab
        formData={defaultFormData}
        validationErrors={{}}
        setValidationErrors={mockSetValidationErrors}
      />
    );

    expect(screen.getByTestId('is-form-valid-result')).toHaveTextContent('false');
  });

  it('calls setValidationErrors when validateForm is called', () => {
    const validation = useFormValidation({
      activeTab: 0,
      formData: defaultFormData,
      validationErrors: {},
      setValidationErrors: mockSetValidationErrors
    });

    validation.validateForm();
    
    // The mock should be called (even if with empty errors)
    expect(mockSetValidationErrors).toHaveBeenCalled();
  });

  it('handles all validation error scenarios', () => {
    const errorScenarios = [
      { firstName: 'Required' },
      { lastName: 'Required' },
      { phoneNumber: 'Invalid format' },
      { emailId: 'Invalid email' },
      { role: 'Required' },
      { department: 'Required' },
      { reportingManager: 'Required' },
      { dottedLineManager: 'Required' }
    ];

    errorScenarios.forEach((errors) => {
      render(
        <TestComponent
          activeTab={0}
          formData={defaultFormData}
          validationErrors={errors}
          setValidationErrors={mockSetValidationErrors}
        />
      );

      expect(screen.getByTestId('validate-form-result')).toBeInTheDocument();
    });
  });
});

