import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import UserDetailsForm from '../UserDetailsForm';
import type { UserFormData } from '../../../types/UserFormData';

// Mock all the imported components and utilities
jest.mock('../PermissionTableConstants', () => ({
  getUserFormStyles: () => ({
    formSection: { padding: '12px' },
    formRow: { display: 'flex', gap: '16px' },
    formField: { flex: 1 }
  }),
  getHorizontalDividerStyles: () => ({ borderBottom: '1px solid #e0e0e0' }),
  getVerticalDividerStyles: () => ({ borderRight: '1px solid #e0e0e0' }),
  getSmallVerticalDividerStyles: () => ({ borderRight: '1px solid #e0e0e0' }),
  getSectionTitleContainerStyles: () => ({ display: 'flex', alignItems: 'center' }),
  getFlexBetweenContainerStyles: () => ({ display: 'flex', justifyContent: 'space-between' }),
  getActionButtonStyles: () => ({ padding: '8px 16px' }),
  getButtonContentStyles: () => ({ display: 'flex', alignItems: 'center', gap: '8px' }),
  getButtonTextStyles: () => ({ fontSize: '14px' })
}));

jest.mock('../UserFormComponents', () => ({
  ReusableTextField: ({ field, label, value, onChange, error, errorMessage, disabled, readOnly, ...props }: any) => (
    <div data-testid={`reusable-textfield-${field}`}>
      <label>{label}</label>
      <input
        data-testid={`input-${field}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
      />
      {error && <span data-testid={`error-${field}`}>{errorMessage}</span>}
    </div>
  ),
  ReusableSelectField: ({ field, label, options, value, onChange, error, errorMessage, disabled, required, placeholder, ...props }: any) => (
    <div data-testid={`reusable-selectfield-${field}`}>
      <label>{label}</label>
      <select
        data-testid={`select-${field}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option: string, index: number) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
      {error && <span data-testid={`error-${field}`}>{errorMessage}</span>}
    </div>
  ),
  SectionTitle: ({ children, ...props }: any) => (
    <h3 data-testid="section-title" {...props}>{children}</h3>
  ),
  EmptyFormField: () => <div data-testid="empty-form-field" />
}));

jest.mock('commonApp/CustomCheckbox', () => {
  return function MockCustomCheckbox({ label, checked, onChange, disabled, sx, ...props }: any) {
    return (
      <div data-testid="custom-checkbox" data-disabled={disabled} data-sx={sx ? 'readonly-styles' : 'no-styles'}>
        <label>
          <input
            data-testid="checkbox-input"
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />
          {label}
        </label>
      </div>
    );
  };
});

jest.mock('../bulkUpload/BulkUploadPanel', () => {
  return function MockBulkUploadPanel({ isOpen, onClose }: any) {
    return (
      <div data-testid="bulk-upload-panel" data-is-open={isOpen}>
        {isOpen && (
          <button data-testid="bulk-upload-close" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    );
  };
});

// Mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      users: (state = { users: [], hasUsers: false }) => state,
    },
  });
};

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = createMockStore();
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('UserDetailsForm Component', () => {
  const mockOnInputChange = jest.fn();
  const mockGetErrorProps = jest.fn().mockReturnValue({ error: false, errorMessage: '' });

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

  const defaultProps = {
    formData: defaultFormData,
    onInputChange: mockOnInputChange,
    getErrorProps: mockGetErrorProps,
    dummyRoles: ['Admin', 'Manager', 'Developer'],
    dummyDepartments: ['IT', 'HR', 'Finance'],
    reportingUsersOptions: ['Jane Manager', 'Bob Project', 'Alice Lead']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    // Check basic details section
    expect(screen.getByTestId('section-title')).toHaveTextContent('Basic Details');
    expect(screen.getByTestId('reusable-textfield-firstName')).toBeInTheDocument();
    expect(screen.getByTestId('reusable-textfield-lastName')).toBeInTheDocument();
    expect(screen.getByTestId('reusable-textfield-phoneNumber')).toBeInTheDocument();
    expect(screen.getByTestId('reusable-selectfield-role')).toBeInTheDocument();
    expect(screen.getByTestId('reusable-selectfield-department')).toBeInTheDocument();
    expect(screen.getByTestId('empty-form-field')).toBeInTheDocument();

    // Check account and reporting details section
    expect(screen.getAllByTestId('section-title')).toHaveLength(3);
    expect(screen.getByTestId('reusable-textfield-emailId')).toBeInTheDocument();
    expect(screen.getByTestId('reusable-selectfield-reportingManager')).toBeInTheDocument();
    expect(screen.getByTestId('reusable-selectfield-dottedLineManager')).toBeInTheDocument();
    expect(screen.getByTestId('custom-checkbox')).toBeInTheDocument();
  });

  it('displays form data correctly', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('input-firstName')).toHaveValue('John');
    expect(screen.getByTestId('input-lastName')).toHaveValue('Doe');
    expect(screen.getByTestId('input-phoneNumber')).toHaveValue('1234567890');
    expect(screen.getByTestId('input-emailId')).toHaveValue('john.doe@example.com');
    expect(screen.getByTestId('select-role')).toHaveValue('Admin');
    expect(screen.getByTestId('select-department')).toHaveValue('IT');
    expect(screen.getByTestId('select-reportingManager')).toHaveValue('Jane Manager');
    expect(screen.getByTestId('select-dottedLineManager')).toHaveValue('Bob Project');
    expect(screen.getByTestId('checkbox-input')).not.toBeChecked();
  });

  it('handles input changes', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByTestId('input-firstName'), { target: { value: 'Jane' } });
    expect(mockOnInputChange).toHaveBeenCalledWith('firstName', 'Jane');

    fireEvent.change(screen.getByTestId('input-lastName'), { target: { value: 'Smith' } });
    expect(mockOnInputChange).toHaveBeenCalledWith('lastName', 'Smith');

    fireEvent.change(screen.getByTestId('input-phoneNumber'), { target: { value: '9876543210' } });
    expect(mockOnInputChange).toHaveBeenCalledWith('phoneNumber', '9876543210');
  });

  it('handles select changes', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByTestId('select-role'), { target: { value: 'Manager' } });
    expect(mockOnInputChange).toHaveBeenCalledWith('role', 'Manager');

    fireEvent.change(screen.getByTestId('select-department'), { target: { value: 'HR' } });
    expect(mockOnInputChange).toHaveBeenCalledWith('department', 'HR');

    fireEvent.change(screen.getByTestId('select-reportingManager'), { target: { value: 'Alice Lead' } });
    expect(mockOnInputChange).toHaveBeenCalledWith('reportingManager', 'Alice Lead');

    fireEvent.change(screen.getByTestId('select-dottedLineManager'), { target: { value: 'Bob Project' } });
    expect(mockOnInputChange).toHaveBeenCalledWith('dottedLineManager', 'Bob Project');
  });

  it('handles checkbox changes', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('checkbox-input'));
    expect(mockOnInputChange).toHaveBeenCalledWith('selfReporting', true);
  });

  it('disables email field', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('input-emailId')).toBeDisabled();
  });

  it('handles self reporting enabled state', () => {
    const selfReportingFormData = {
      ...defaultFormData,
      selfReporting: true,
      reportingManager: 'Self',
      dottedLineManager: ''
    };

    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} formData={selfReportingFormData} />
      </TestWrapper>
    );

    expect(screen.getByTestId('checkbox-input')).toBeChecked();
    expect(screen.getByTestId('select-reportingManager')).toBeDisabled();
    expect(screen.getByTestId('select-dottedLineManager')).toBeDisabled();
  });

  it('shows error states', () => {
    const mockGetErrorPropsWithError = jest.fn().mockImplementation((field) => {
      if (field === 'firstName') {
        return { error: true, errorMessage: 'First Name is required' };
      }
      return { error: false, errorMessage: '' };
    });

    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} getErrorProps={mockGetErrorPropsWithError} />
      </TestWrapper>
    );

    expect(screen.getByTestId('error-firstName')).toHaveTextContent('First Name is required');
  });

  it('handles empty form data', () => {
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
      <TestWrapper>
        <UserDetailsForm {...defaultProps} formData={emptyFormData} />
      </TestWrapper>
    );

    expect(screen.getByTestId('input-firstName')).toHaveValue('');
    expect(screen.getByTestId('input-lastName')).toHaveValue('');
    expect(screen.getByTestId('input-phoneNumber')).toHaveValue('');
    expect(screen.getByTestId('input-emailId')).toHaveValue('');
  });

  it('handles different role and department options', () => {
    const customProps = {
      ...defaultProps,
      dummyRoles: ['CEO', 'CTO', 'VP'],
      dummyDepartments: ['Executive', 'Technology', 'Strategy']
    };

    render(
      <TestWrapper>
        <UserDetailsForm {...customProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('select-role')).toBeInTheDocument();
    expect(screen.getByTestId('select-department')).toBeInTheDocument();
  });

  it('handles different reporting users options', () => {
    const customProps = {
      ...defaultProps,
      reportingUsersOptions: ['Manager A', 'Manager B', 'Manager C']
    };

    render(
      <TestWrapper>
        <UserDetailsForm {...customProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('select-reportingManager')).toBeInTheDocument();
    expect(screen.getByTestId('select-dottedLineManager')).toBeInTheDocument();
  });

  it('handles bulk upload button click when id is not present', () => {
    const formDataWithoutId = {
      ...defaultFormData,
      id: undefined
    };

    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} formData={formDataWithoutId} />
      </TestWrapper>
    );

    // The bulk upload button should be present when id is not present
    expect(screen.getByText('Bulk Upload')).toBeInTheDocument();
  });

  it('handles all form field interactions', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    // Test all input fields
    const inputFields = ['firstName', 'lastName', 'phoneNumber', 'emailId'];
    inputFields.forEach(field => {
      const input = screen.getByTestId(`input-${field}`);
      fireEvent.change(input, { target: { value: 'Test Value' } });
      expect(mockOnInputChange).toHaveBeenCalledWith(field, 'Test Value');
    });

    // Test all select fields
    const selectFields = ['role', 'department', 'reportingManager', 'dottedLineManager'];
    selectFields.forEach(field => {
      const select = screen.getByTestId(`select-${field}`);
      fireEvent.change(select, { target: { value: 'Test Option' } });
      expect(mockOnInputChange).toHaveBeenCalledWith(field, 'Test Option');
    });

    // Test checkbox
    fireEvent.click(screen.getByTestId('checkbox-input'));
    expect(mockOnInputChange).toHaveBeenCalledWith('selfReporting', true);
  });

  it('handles form layout and styling', () => {
    const { container } = render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    // Check that the component renders without errors
    expect(container).toBeInTheDocument();
    expect(screen.getByTestId('reusable-textfield-firstName')).toBeInTheDocument();
  });

  it('handles edge cases', () => {
    // Test with minimal props
    const minimalProps = {
      formData: defaultFormData,
      onInputChange: mockOnInputChange,
      getErrorProps: mockGetErrorProps,
      dummyRoles: [],
      dummyDepartments: [],
      reportingUsersOptions: []
    };

    render(
      <TestWrapper>
        <UserDetailsForm {...minimalProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('reusable-textfield-firstName')).toBeInTheDocument();
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
      const mockGetErrorPropsWithErrors = jest.fn().mockImplementation((field) => ({
        error: !!errors[field as keyof typeof errors],
        errorMessage: errors[field as keyof typeof errors] || ''
      }));

      render(
        <TestWrapper>
          <UserDetailsForm {...defaultProps} getErrorProps={mockGetErrorPropsWithErrors} />
        </TestWrapper>
      );

      expect(screen.getByTestId('reusable-textfield-firstName')).toBeInTheDocument();
    });
  });

  it('shows bulk upload button when formData.id is not present', () => {
    const formDataWithoutId = {
      ...defaultFormData,
      id: undefined
    };

    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} formData={formDataWithoutId} />
      </TestWrapper>
    );

    expect(screen.getByText('Bulk Upload')).toBeInTheDocument();
  });

  it('does not show bulk upload button when formData.id is present', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    // Bulk upload button should not be present when id exists
    expect(screen.queryByText('Bulk Upload')).not.toBeInTheDocument();
  });

  it('opens bulk upload panel when bulk upload button is clicked', () => {
    const formDataWithoutId = {
      ...defaultFormData,
      id: undefined
    };

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} formData={formDataWithoutId} />
      </TestWrapper>
    );

    const bulkUploadButton = screen.getByText('Bulk Upload').closest('button');
    expect(bulkUploadButton).toBeInTheDocument();
    
    fireEvent.click(bulkUploadButton!);
    
    expect(consoleSpy).toHaveBeenCalledWith('Bulk Upload button clicked, opening panel');
    expect(screen.getByTestId('bulk-upload-panel')).toHaveAttribute('data-is-open', 'true');
    
    consoleSpy.mockRestore();
  });

  it('closes bulk upload panel when onClose is called', () => {
    const formDataWithoutId = {
      ...defaultFormData,
      id: undefined
    };

    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} formData={formDataWithoutId} />
      </TestWrapper>
    );

    const bulkUploadButton = screen.getByText('Bulk Upload').closest('button');
    fireEvent.click(bulkUploadButton!);
    
    expect(screen.getByTestId('bulk-upload-panel')).toHaveAttribute('data-is-open', 'true');
    
    const closeButton = screen.getByTestId('bulk-upload-close');
    fireEvent.click(closeButton);
    
    expect(screen.getByTestId('bulk-upload-panel')).toHaveAttribute('data-is-open', 'false');
  });

  it('handles isReadOnly prop for text fields', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} isReadOnly={true} />
      </TestWrapper>
    );

    expect(screen.getByTestId('input-firstName')).toHaveAttribute('readonly');
    expect(screen.getByTestId('input-lastName')).toHaveAttribute('readonly');
    expect(screen.getByTestId('input-phoneNumber')).toHaveAttribute('readonly');
  });

  it('handles isReadOnly prop for select fields', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} isReadOnly={true} />
      </TestWrapper>
    );

    expect(screen.getByTestId('select-role')).toBeDisabled();
    expect(screen.getByTestId('select-department')).toBeDisabled();
  });

  it('handles isReadOnly prop for checkbox with readonly styles', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} isReadOnly={true} />
      </TestWrapper>
    );

    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toHaveAttribute('data-disabled', 'true');
    expect(checkbox).toHaveAttribute('data-sx', 'readonly-styles');
  });

  it('handles checkbox without readonly styles when isReadOnly is false', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} isReadOnly={false} />
      </TestWrapper>
    );

    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toHaveAttribute('data-disabled', 'false');
    expect(checkbox).toHaveAttribute('data-sx', 'no-styles');
  });

  it('handles isReadOnly prop for reporting manager field', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} isReadOnly={true} />
      </TestWrapper>
    );

    expect(screen.getByTestId('select-reportingManager')).toBeDisabled();
  });

  it('handles isReadOnly prop for dotted line manager field', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} isReadOnly={true} />
      </TestWrapper>
    );

    expect(screen.getByTestId('select-dottedLineManager')).toBeDisabled();
  });

  it('disables reporting manager and dotted line manager when selfReporting is true and isReadOnly is false', () => {
    const selfReportingFormData = {
      ...defaultFormData,
      selfReporting: true
    };

    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} formData={selfReportingFormData} isReadOnly={false} />
      </TestWrapper>
    );

    expect(screen.getByTestId('select-reportingManager')).toBeDisabled();
    expect(screen.getByTestId('select-dottedLineManager')).toBeDisabled();
  });

  it('disables reporting manager and dotted line manager when both selfReporting and isReadOnly are true', () => {
    const selfReportingFormData = {
      ...defaultFormData,
      selfReporting: true
    };

    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} formData={selfReportingFormData} isReadOnly={true} />
      </TestWrapper>
    );

    expect(screen.getByTestId('select-reportingManager')).toBeDisabled();
    expect(screen.getByTestId('select-dottedLineManager')).toBeDisabled();
  });

  it('shows "Self" placeholder for reporting manager when selfReporting is true', () => {
    const selfReportingFormData = {
      ...defaultFormData,
      selfReporting: true,
      reportingManager: ''
    };

    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} formData={selfReportingFormData} />
      </TestWrapper>
    );

    const select = screen.getByTestId('select-reportingManager');
    const placeholderOption = Array.from(select.querySelectorAll('option')).find(
      (opt: any) => opt.textContent === 'Self'
    );
    expect(placeholderOption).toBeInTheDocument();
  });

  it('shows empty placeholder for dotted line manager when selfReporting is true', () => {
    const selfReportingFormData = {
      ...defaultFormData,
      selfReporting: true,
      dottedLineManager: ''
    };

    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} formData={selfReportingFormData} />
      </TestWrapper>
    );

    const select = screen.getByTestId('select-dottedLineManager');
    const placeholderOption = Array.from(select.querySelectorAll('option')).find(
      (opt: any) => opt.textContent === ''
    );
    expect(placeholderOption).toBeInTheDocument();
  });

  it('shows default placeholder for reporting manager when selfReporting is false', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    const select = screen.getByTestId('select-reportingManager');
    const placeholderOption = Array.from(select.querySelectorAll('option')).find(
      (opt: any) => opt.textContent === 'Select Reporting Manager'
    );
    expect(placeholderOption).toBeInTheDocument();
  });

  it('shows default placeholder for dotted line manager when selfReporting is false', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    const select = screen.getByTestId('select-dottedLineManager');
    const placeholderOption = Array.from(select.querySelectorAll('option')).find(
      (opt: any) => opt.textContent === 'Select Dotted Line Manager'
    );
    expect(placeholderOption).toBeInTheDocument();
  });

  it('handles emailId field with readOnly always true', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} isReadOnly={false} />
      </TestWrapper>
    );

    // Email field should always be readonly regardless of isReadOnly prop
    expect(screen.getByTestId('input-emailId')).toHaveAttribute('readonly');
  });

  it('handles emailId field with required false', () => {
    render(
      <TestWrapper>
        <UserDetailsForm {...defaultProps} />
      </TestWrapper>
    );

    // Email field should be present
    expect(screen.getByTestId('reusable-textfield-emailId')).toBeInTheDocument();
  });
});

