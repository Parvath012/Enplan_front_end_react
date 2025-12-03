import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  ReusableTextField,
  ReusableSelectField,
  SectionTitle,
  EmptyFormField
} from '../../../src/components/userManagement/UserFormComponents';

// Mock the commonApp components
jest.mock('commonApp/TextField', () => {
  return function MockTextField({ label, value, onChange, placeholder, required, error, errorMessage }: any) {
    return (
      <div data-testid="text-field">
        <label>{label}</label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          aria-invalid={error}
          aria-errormessage={errorMessage}
        />
        {error && <span data-testid="error-message">{errorMessage}</span>}
      </div>
    );
  };
});

jest.mock('commonApp/SelectField', () => {
  return function MockSelectField({ label, value, onChange, options, placeholder, required, disabled, error, errorMessage }: any) {
    return (
      <div data-testid="select-field">
        <label>{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          aria-invalid={error}
          aria-errormessage={errorMessage}
        >
          <option value="">{placeholder}</option>
          {options.map((opt: any, idx: number) => (
            <option key={idx} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
        {error && <span data-testid="error-message">{errorMessage}</span>}
      </div>
    );
  };
});

describe('UserFormComponents', () => {
  describe('ReusableTextField', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render without crashing', () => {
      render(
        <ReusableTextField
          field="firstName"
          label="First Name"
          placeholder="Enter first name"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('text-field')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(
        <ReusableTextField
          field="firstName"
          label="First Name"
          placeholder="Enter first name"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('First Name')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(
        <ReusableTextField
          field="firstName"
          label="First Name"
          placeholder="Enter first name"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByPlaceholderText('Enter first name')).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(
        <ReusableTextField
          field="firstName"
          label="First Name"
          placeholder="Enter first name"
          value="John"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    it('should be required by default', () => {
      render(
        <ReusableTextField
          field="firstName"
          label="First Name"
          placeholder="Enter first name"
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('Enter first name');
      expect(input).toBeRequired();
    });

    it('should not be required when specified', () => {
      render(
        <ReusableTextField
          field="firstName"
          label="First Name"
          placeholder="Enter first name"
          value=""
          onChange={mockOnChange}
          required={false}
        />
      );

      const input = screen.getByPlaceholderText('Enter first name');
      expect(input).not.toBeRequired();
    });

    it('should show error message when error is true', () => {
      render(
        <ReusableTextField
          field="firstName"
          label="First Name"
          placeholder="Enter first name"
          value=""
          onChange={mockOnChange}
          error={true}
          errorMessage="This field is required"
        />
      );

      expect(screen.getByTestId('error-message')).toHaveTextContent('This field is required');
    });

    it('should not show error message when error is false', () => {
      render(
        <ReusableTextField
          field="firstName"
          label="First Name"
          placeholder="Enter first name"
          value=""
          onChange={mockOnChange}
          error={false}
          errorMessage="This field is required"
        />
      );

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('ReusableSelectField', () => {
    const mockOnChange = jest.fn();
    const mockOptions = [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
      { value: 'manager', label: 'Manager' }
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render without crashing', () => {
      render(
        <ReusableSelectField
          field="role"
          label="Role"
          options={mockOptions}
          placeholder="Select role"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('select-field')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(
        <ReusableSelectField
          field="role"
          label="Role"
          options={mockOptions}
          placeholder="Select role"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('should render with options', () => {
      render(
        <ReusableSelectField
          field="role"
          label="Role"
          options={mockOptions}
          placeholder="Select role"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(
        <ReusableSelectField
          field="role"
          label="Role"
          options={mockOptions}
          placeholder="Select role"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Select role')).toBeInTheDocument();
    });

    it('should render with selected value', () => {
      render(
        <ReusableSelectField
          field="role"
          label="Role"
          options={mockOptions}
          placeholder="Select role"
          value="admin"
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('admin');
    });

    it('should handle string array options', () => {
      const stringOptions = ['Option 1', 'Option 2', 'Option 3'];

      render(
        <ReusableSelectField
          field="test"
          label="Test"
          options={stringOptions}
          placeholder="Select option"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should be required by default', () => {
      render(
        <ReusableSelectField
          field="role"
          label="Role"
          options={mockOptions}
          placeholder="Select role"
          value=""
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeRequired();
    });

    it('should not be required when specified', () => {
      render(
        <ReusableSelectField
          field="role"
          label="Role"
          options={mockOptions}
          placeholder="Select role"
          value=""
          onChange={mockOnChange}
          required={false}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).not.toBeRequired();
    });

    it('should be disabled when specified', () => {
      render(
        <ReusableSelectField
          field="role"
          label="Role"
          options={mockOptions}
          placeholder="Select role"
          value=""
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('should not be disabled by default', () => {
      render(
        <ReusableSelectField
          field="role"
          label="Role"
          options={mockOptions}
          placeholder="Select role"
          value=""
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).not.toBeDisabled();
    });

    it('should show error message when error is true', () => {
      render(
        <ReusableSelectField
          field="role"
          label="Role"
          options={mockOptions}
          placeholder="Select role"
          value=""
          onChange={mockOnChange}
          error={true}
          errorMessage="Please select a role"
        />
      );

      expect(screen.getByTestId('error-message')).toHaveTextContent('Please select a role');
    });

    it('should not show error message when error is false', () => {
      render(
        <ReusableSelectField
          field="role"
          label="Role"
          options={mockOptions}
          placeholder="Select role"
          value=""
          onChange={mockOnChange}
          error={false}
          errorMessage="Please select a role"
        />
      );

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('SectionTitle', () => {
    it('should render without crashing', () => {
      render(<SectionTitle>Test Title</SectionTitle>);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render children', () => {
      render(<SectionTitle>Section Header</SectionTitle>);

      expect(screen.getByText('Section Header')).toBeInTheDocument();
    });

    it('should render with custom sx prop', () => {
      const { container } = render(
        <SectionTitle sx={{ color: 'red' }}>Custom Title</SectionTitle>
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render JSX children', () => {
      render(
        <SectionTitle>
          <span>Complex</span> <strong>Title</strong>
        </SectionTitle>
      );

      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should render empty children', () => {
      const { container } = render(<SectionTitle>{''}</SectionTitle>);

      const typography = container.querySelector('[class*="MuiTypography"]');
      expect(typography).toBeInTheDocument();
    });

    it('should render with default styles', () => {
      render(<SectionTitle>Title</SectionTitle>);

      const title = screen.getByText('Title');
      expect(title).toBeInTheDocument();
    });

    it('should merge custom sx with default styles', () => {
      render(
        <SectionTitle sx={{ fontSize: '20px' }}>
          Merged Styles
        </SectionTitle>
      );

      expect(screen.getByText('Merged Styles')).toBeInTheDocument();
    });
  });

  describe('EmptyFormField', () => {
    it('should render without crashing', () => {
      const { container } = render(<EmptyFormField />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render empty box', () => {
      const { container } = render(<EmptyFormField />);

      const box = container.firstChild;
      expect(box).toBeInTheDocument();
      expect(box).toBeEmptyDOMElement();
    });

    it('should maintain layout spacing', () => {
      const { container } = render(
        <div>
          <ReusableTextField
            field="field1"
            label="Field 1"
            placeholder="Enter value"
            value=""
            onChange={() => {}}
          />
          <EmptyFormField />
          <ReusableTextField
            field="field2"
            label="Field 2"
            placeholder="Enter value"
            value=""
            onChange={() => {}}
          />
        </div>
      );

      expect(container.children).toHaveLength(1);
    });

    it('should render multiple empty fields', () => {
      const { container } = render(
        <div>
          <EmptyFormField />
          <EmptyFormField />
          <EmptyFormField />
        </div>
      );

      const emptyFields = container.querySelectorAll('div > div');
      expect(emptyFields.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Integration Tests', () => {
    it('should render multiple form components together', () => {
      const mockOnChange = jest.fn();

      render(
        <div>
          <SectionTitle>Personal Information</SectionTitle>
          <ReusableTextField
            field="firstName"
            label="First Name"
            placeholder="Enter first name"
            value="John"
            onChange={mockOnChange}
          />
          <ReusableTextField
            field="lastName"
            label="Last Name"
            placeholder="Enter last name"
            value="Doe"
            onChange={mockOnChange}
          />
          <ReusableSelectField
            field="role"
            label="Role"
            options={['Admin', 'User']}
            placeholder="Select role"
            value="Admin"
            onChange={mockOnChange}
          />
          <EmptyFormField />
        </div>
      );

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('should handle form with errors', () => {
      const mockOnChange = jest.fn();

      render(
        <div>
          <ReusableTextField
            field="email"
            label="Email"
            placeholder="Enter email"
            value="invalid-email"
            onChange={mockOnChange}
            error={true}
            errorMessage="Invalid email format"
          />
          <ReusableSelectField
            field="department"
            label="Department"
            options={['IT', 'HR']}
            placeholder="Select department"
            value=""
            onChange={mockOnChange}
            error={true}
            errorMessage="Department is required"
          />
        </div>
      );

      const errorMessages = screen.getAllByTestId('error-message');
      expect(errorMessages).toHaveLength(2);
      expect(errorMessages[0]).toHaveTextContent('Invalid email format');
      expect(errorMessages[1]).toHaveTextContent('Department is required');
    });

    it('should handle dynamic form layout', () => {
      const mockOnChange = jest.fn();

      render(
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <ReusableTextField
            field="field1"
            label="Field 1"
            placeholder="Enter value"
            value=""
            onChange={mockOnChange}
          />
          <ReusableTextField
            field="field2"
            label="Field 2"
            placeholder="Enter value"
            value=""
            onChange={mockOnChange}
          />
          <EmptyFormField />
        </div>
      );

      expect(screen.getByText('Field 1')).toBeInTheDocument();
      expect(screen.getByText('Field 2')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      const mockOnChange = jest.fn();

      render(
        <ReusableSelectField
          field="empty"
          label="Empty Select"
          options={[]}
          placeholder="No options"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Empty Select')).toBeInTheDocument();
    });

    it('should handle very long labels', () => {
      const mockOnChange = jest.fn();

      render(
        <ReusableTextField
          field="test"
          label="This is a very long label that might wrap to multiple lines"
          placeholder="Enter value"
          value=""
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('This is a very long label that might wrap to multiple lines')).toBeInTheDocument();
    });

    it('should handle special characters in values', () => {
      const mockOnChange = jest.fn();

      render(
        <ReusableTextField
          field="special"
          label="Special"
          placeholder="Enter value"
          value="<script>alert('test')</script>"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue("<script>alert('test')</script>")).toBeInTheDocument();
    });

    it('should handle unicode characters', () => {
      const mockOnChange = jest.fn();

      render(
        <ReusableTextField
          field="unicode"
          label="Unicode"
          placeholder="Enter value"
          value="你好世界"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('你好世界')).toBeInTheDocument();
    });
  });
});

