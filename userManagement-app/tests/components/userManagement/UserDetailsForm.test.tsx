/**
 * Tests for UserDetailsForm
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserDetailsForm from '../../../src/components/userManagement/UserDetailsForm';
import type { UserFormData } from '../../../src/types/UserFormData';

// Mock dependencies
jest.mock('../../../src/components/userManagement/UserFormComponents', () => ({
  ReusableTextField: ({ field, label, value, onChange, readOnly, error, errorMessage }: any) => (
    <div data-testid={`text-field-${field}`}>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        data-error={error}
        data-error-message={errorMessage}
      />
    </div>
  ),
  ReusableSelectField: ({ field, label, value, onChange, disabled, error, errorMessage }: any) => (
    <div data-testid={`select-field-${field}`}>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-error={error}
        data-error-message={errorMessage}
      >
        <option value="">Select {label}</option>
      </select>
    </div>
  ),
  SectionTitle: ({ children, sx }: any) => <h3 data-testid="section-title">{children}</h3>,
  EmptyFormField: () => <div data-testid="empty-form-field" />
}));

jest.mock('commonApp/CustomCheckbox', () => {
  return function MockCustomCheckbox({ label, checked, onChange, disabled }: any) {
    return (
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          data-testid={`checkbox-${label.toLowerCase().replace(' ', '-')}`}
        />
        {label}
      </label>
    );
  };
});

jest.mock('../../../src/components/bulkUpload/BulkUploadPanel', () => {
  return function MockBulkUploadPanel({ isOpen, onClose }: any) {
    return isOpen ? (
      <div data-testid="bulk-upload-panel">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

jest.mock('../../../src/components/userManagement/PermissionTableConstants', () => ({
  getUserFormStyles: () => ({ formSection: {}, formRow: {}, formField: {} }),
  getHorizontalDividerStyles: () => ({}),
  getVerticalDividerStyles: () => ({}),
  getSmallVerticalDividerStyles: () => ({}),
  getSectionTitleContainerStyles: () => ({}),
  getFlexBetweenContainerStyles: () => ({}),
  getActionButtonStyles: () => ({}),
  getButtonContentStyles: () => ({}),
  getButtonTextStyles: () => ({})
}));

describe('UserDetailsForm', () => {
  const mockFormData: UserFormData = {
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '1234567890',
    role: 'Developer',
    department: 'IT',
    emailId: 'john@example.com',
    reportingManager: 'Manager1',
    dottedLineManager: 'PM1',
    selfReporting: false,
    status: 'Active',
    isenabled: true
  };

  const defaultProps = {
    formData: mockFormData,
    onInputChange: jest.fn(),
    getErrorProps: jest.fn((field) => ({
      error: false,
      errorMessage: ''
    })),
    dummyRoles: ['Developer', 'Manager'],
    dummyDepartments: ['IT', 'HR'],
    reportingUsersOptions: ['Manager1', 'Manager2']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<UserDetailsForm {...defaultProps} />);

    expect(screen.getByTestId('text-field-firstName')).toBeInTheDocument();
    expect(screen.getByTestId('text-field-lastName')).toBeInTheDocument();
    expect(screen.getByTestId('text-field-phoneNumber')).toBeInTheDocument();
    expect(screen.getByTestId('select-field-role')).toBeInTheDocument();
    expect(screen.getByTestId('select-field-department')).toBeInTheDocument();
    expect(screen.getByTestId('select-field-reportingManager')).toBeInTheDocument();
  });

  it('should call onInputChange when field value changes', () => {
    render(<UserDetailsForm {...defaultProps} />);

    const firstNameInput = screen.getByTestId('text-field-firstName').querySelector('input');
    fireEvent.change(firstNameInput!, { target: { value: 'Jane' } });

    expect(defaultProps.onInputChange).toHaveBeenCalledWith('firstName', 'Jane');
  });

  it('should show bulk upload button when formData has no id', () => {
    render(<UserDetailsForm {...defaultProps} formData={{ ...mockFormData, id: undefined }} />);

    const bulkUploadButton = screen.getByText('Bulk Upload');
    expect(bulkUploadButton).toBeInTheDocument();
  });

  it('should not show bulk upload button when formData has id', () => {
    render(<UserDetailsForm {...defaultProps} formData={{ ...mockFormData, id: '1' }} />);

    expect(screen.queryByText('Bulk Upload')).not.toBeInTheDocument();
  });

  it('should open bulk upload panel when button is clicked', () => {
    render(<UserDetailsForm {...defaultProps} formData={{ ...mockFormData, id: undefined }} />);

    const bulkUploadButton = screen.getByText('Bulk Upload');
    fireEvent.click(bulkUploadButton);

    expect(screen.getByTestId('bulk-upload-panel')).toBeInTheDocument();
  });

  it('should close bulk upload panel when close is clicked', () => {
    render(<UserDetailsForm {...defaultProps} formData={{ ...mockFormData, id: undefined }} />);

    const bulkUploadButton = screen.getByText('Bulk Upload');
    fireEvent.click(bulkUploadButton);

    expect(screen.getByTestId('bulk-upload-panel')).toBeInTheDocument();

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('bulk-upload-panel')).not.toBeInTheDocument();
  });

  it('should disable fields when isReadOnly is true', () => {
    render(<UserDetailsForm {...defaultProps} isReadOnly={true} />);

    const firstNameInput = screen.getByTestId('text-field-firstName').querySelector('input');
    expect(firstNameInput).toHaveAttribute('readOnly');

    const roleSelect = screen.getByTestId('select-field-role').querySelector('select');
    expect(roleSelect).toBeDisabled();
  });

  it('should disable reporting manager when selfReporting is true', () => {
    render(
      <UserDetailsForm
        {...defaultProps}
        formData={{ ...mockFormData, selfReporting: true }}
      />
    );

    const reportingManagerSelect = screen.getByTestId('select-field-reportingManager').querySelector('select');
    expect(reportingManagerSelect).toBeDisabled();
  });

  it('should disable dotted line manager when selfReporting is true', () => {
    render(
      <UserDetailsForm
        {...defaultProps}
        formData={{ ...mockFormData, selfReporting: true }}
      />
    );

    const dottedLineManagerSelect = screen.getByTestId('select-field-dottedLineManager').querySelector('select');
    expect(dottedLineManagerSelect).toBeDisabled();
  });

  it('should handle selfReporting checkbox change', () => {
    render(<UserDetailsForm {...defaultProps} />);

    const checkbox = screen.getByTestId('checkbox-self-reporting');
    fireEvent.change(checkbox, { target: { checked: true } });

    expect(defaultProps.onInputChange).toHaveBeenCalledWith('selfReporting', true);
  });
});

