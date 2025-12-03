import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import PermissionsForm from '../PermissionsForm';
import type { UserFormData } from '../../../types/UserFormData';

// Mock PermissionsTabLayout
jest.mock('../PermissionsTabLayout', () => {
  return function MockPermissionsTabLayout({ formData, onInputChange, resetTrigger }: any) {
    return (
      <div data-testid="permissions-layout" data-reset-trigger={resetTrigger}>
        <div data-testid="permissions-content">
          <input
            data-testid="input-permissions"
            value={formData.permissions || ''}
            onChange={(e) => onInputChange('permissions', e.target.value)}
          />
          <div data-testid="regions-count">{formData.regions?.length || 0}</div>
          <div data-testid="countries-count">{formData.countries?.length || 0}</div>
          <div data-testid="divisions-count">{formData.divisions?.length || 0}</div>
          <div data-testid="groups-count">{formData.groups?.length || 0}</div>
          <div data-testid="departments-count">{formData.departments?.length || 0}</div>
          <div data-testid="classes-count">{formData.classes?.length || 0}</div>
          <div data-testid="subclasses-count">{formData.subClasses?.length || 0}</div>
        </div>
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

describe('PermissionsForm Component', () => {
  const mockOnInputChange = jest.fn();

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
    regions: ['North America', 'Europe'],
    countries: ['USA', 'Canada'],
    divisions: ['Technology', 'Sales'],
    groups: ['Development', 'QA'],
    departments: ['Engineering', 'Marketing'],
    classes: ['Senior', 'Junior'],
    subClasses: ['Frontend', 'Backend'],
    permissions: 'read,write,delete'
  };

  const defaultProps = {
    formData: defaultFormData,
    onInputChange: mockOnInputChange,
    resetTrigger: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders permissions layout', () => {
    render(
      <TestWrapper>
        <PermissionsForm {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('permissions-layout')).toBeInTheDocument();
    expect(screen.getByTestId('permissions-content')).toBeInTheDocument();
  });

  it('displays form data correctly', () => {
    render(
      <TestWrapper>
        <PermissionsForm {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('input-permissions')).toHaveValue('read,write,delete');
    expect(screen.getByTestId('regions-count')).toHaveTextContent('2');
    expect(screen.getByTestId('countries-count')).toHaveTextContent('2');
    expect(screen.getByTestId('divisions-count')).toHaveTextContent('2');
    expect(screen.getByTestId('groups-count')).toHaveTextContent('2');
    expect(screen.getByTestId('departments-count')).toHaveTextContent('2');
    expect(screen.getByTestId('classes-count')).toHaveTextContent('2');
    expect(screen.getByTestId('subclasses-count')).toHaveTextContent('2');
  });

  it('handles input changes', () => {
    render(
      <TestWrapper>
        <PermissionsForm {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByTestId('input-permissions'), { 
      target: { value: 'read,write,delete,admin' } 
    });
    expect(mockOnInputChange).toHaveBeenCalledWith('permissions', 'read,write,delete,admin');
  });

  it('handles reset trigger changes', () => {
    const { rerender } = render(
      <TestWrapper>
        <PermissionsForm {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('permissions-layout')).toHaveAttribute('data-reset-trigger', '0');

    rerender(
      <TestWrapper>
        <PermissionsForm {...defaultProps} resetTrigger={1} />
      </TestWrapper>
    );

    expect(screen.getByTestId('permissions-layout')).toHaveAttribute('data-reset-trigger', '1');
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
        <PermissionsForm {...defaultProps} formData={emptyFormData} />
      </TestWrapper>
    );

    expect(screen.getByTestId('input-permissions')).toHaveValue('');
    expect(screen.getByTestId('regions-count')).toHaveTextContent('0');
    expect(screen.getByTestId('countries-count')).toHaveTextContent('0');
    expect(screen.getByTestId('divisions-count')).toHaveTextContent('0');
    expect(screen.getByTestId('groups-count')).toHaveTextContent('0');
    expect(screen.getByTestId('departments-count')).toHaveTextContent('0');
    expect(screen.getByTestId('classes-count')).toHaveTextContent('0');
    expect(screen.getByTestId('subclasses-count')).toHaveTextContent('0');
  });

  it('handles null/undefined array fields', () => {
    const formDataWithNullArrays = {
      ...defaultFormData,
      regions: null as any,
      countries: undefined as any,
      divisions: null as any,
      groups: undefined as any,
      departments: null as any,
      classes: undefined as any,
      subClasses: null as any
    };

    render(
      <TestWrapper>
        <PermissionsForm {...defaultProps} formData={formDataWithNullArrays} />
      </TestWrapper>
    );

    expect(screen.getByTestId('regions-count')).toHaveTextContent('0');
    expect(screen.getByTestId('countries-count')).toHaveTextContent('0');
    expect(screen.getByTestId('divisions-count')).toHaveTextContent('0');
    expect(screen.getByTestId('groups-count')).toHaveTextContent('0');
    expect(screen.getByTestId('departments-count')).toHaveTextContent('0');
    expect(screen.getByTestId('classes-count')).toHaveTextContent('0');
    expect(screen.getByTestId('subclasses-count')).toHaveTextContent('0');
  });

  it('handles different reset trigger values', () => {
    const resetTriggerValues = [0, 1, 5, 10, 100];

    resetTriggerValues.forEach((triggerValue) => {
      const { unmount } = render(
        <TestWrapper>
          <PermissionsForm {...defaultProps} resetTrigger={triggerValue} />
        </TestWrapper>
      );

      expect(screen.getByTestId('permissions-layout')).toHaveAttribute('data-reset-trigger', triggerValue.toString());
      unmount();
    });
  });

  it('handles different permission values', () => {
    const permissionValues = [
      'read',
      'write',
      'delete',
      'read,write',
      'read,write,delete',
      'admin',
      'user,admin,superadmin',
      ''
    ];

    permissionValues.forEach((permissions) => {
      const formDataWithPermissions = {
        ...defaultFormData,
        permissions
      };

      const { unmount } = render(
        <TestWrapper>
          <PermissionsForm {...defaultProps} formData={formDataWithPermissions} />
        </TestWrapper>
      );

      expect(screen.getByTestId('input-permissions')).toHaveValue(permissions);
      unmount();
    });
  });

  it('handles different array field combinations', () => {
    const testCases = [
      { regions: ['North'], countries: ['USA'], divisions: ['Tech'], groups: ['Dev'], departments: ['Eng'], classes: ['Senior'], subClasses: ['Frontend'] },
      { regions: [], countries: [], divisions: [], groups: [], departments: [], classes: [], subClasses: [] },
      { regions: ['A', 'B', 'C'], countries: ['X', 'Y'], divisions: ['D'], groups: ['E', 'F', 'G', 'H'], departments: ['I'], classes: ['J', 'K'], subClasses: ['L', 'M', 'N'] }
    ];

    testCases.forEach((testCase, index) => {
      const formDataWithTestCase = {
        ...defaultFormData,
        ...testCase
      };

      const { unmount } = render(
        <TestWrapper>
          <PermissionsForm {...defaultProps} formData={formDataWithTestCase} />
        </TestWrapper>
      );

      expect(screen.getByTestId('regions-count')).toHaveTextContent(testCase.regions.length.toString());
      expect(screen.getByTestId('countries-count')).toHaveTextContent(testCase.countries.length.toString());
      expect(screen.getByTestId('divisions-count')).toHaveTextContent(testCase.divisions.length.toString());
      expect(screen.getByTestId('groups-count')).toHaveTextContent(testCase.groups.length.toString());
      expect(screen.getByTestId('departments-count')).toHaveTextContent(testCase.departments.length.toString());
      expect(screen.getByTestId('classes-count')).toHaveTextContent(testCase.classes.length.toString());
      expect(screen.getByTestId('subclasses-count')).toHaveTextContent(testCase.subClasses.length.toString());
      unmount();
    });
  });

  it('handles multiple input changes', () => {
    render(
      <TestWrapper>
        <PermissionsForm {...defaultProps} />
      </TestWrapper>
    );

    const input = screen.getByTestId('input-permissions');
    
    fireEvent.change(input, { target: { value: 'read' } });
    expect(mockOnInputChange).toHaveBeenCalledWith('permissions', 'read');

    fireEvent.change(input, { target: { value: 'write' } });
    expect(mockOnInputChange).toHaveBeenCalledWith('permissions', 'write');

    fireEvent.change(input, { target: { value: 'delete' } });
    expect(mockOnInputChange).toHaveBeenCalledWith('permissions', 'delete');
  });

  it('handles component re-renders', () => {
    const { rerender } = render(
      <TestWrapper>
        <PermissionsForm {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByTestId('permissions-layout')).toBeInTheDocument();

    // Re-render with different props
    rerender(
      <TestWrapper>
        <PermissionsForm {...defaultProps} resetTrigger={5} />
      </TestWrapper>
    );

    expect(screen.getByTestId('permissions-layout')).toHaveAttribute('data-reset-trigger', '5');
  });

  it('handles edge cases', () => {
    // Test with minimal form data
    const minimalFormData = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      role: 'Admin',
      department: 'IT',
      emailId: 'john@example.com',
      selfReporting: false,
      reportingManager: 'Manager',
      dottedLineManager: 'PM',
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
        <PermissionsForm {...defaultProps} formData={minimalFormData} />
      </TestWrapper>
    );

    expect(screen.getByTestId('permissions-layout')).toBeInTheDocument();
    expect(screen.getByTestId('input-permissions')).toHaveValue('');
  });

  it('handles all prop combinations', () => {
    const propCombinations = [
      { resetTrigger: 0 },
      { resetTrigger: 1 },
      { resetTrigger: 10 },
      { resetTrigger: 100 }
    ];

    propCombinations.forEach((props) => {
      const { unmount } = render(
        <TestWrapper>
          <PermissionsForm {...defaultProps} {...props} />
        </TestWrapper>
      );

      expect(screen.getByTestId('permissions-layout')).toBeInTheDocument();
      expect(screen.getByTestId('permissions-layout')).toHaveAttribute('data-reset-trigger', props.resetTrigger.toString());
      unmount();
    });
  });

  it('maintains component structure', () => {
    const { container } = render(
      <TestWrapper>
        <PermissionsForm {...defaultProps} />
      </TestWrapper>
    );

    // Check that the component renders without errors and maintains structure
    expect(container).toBeInTheDocument();
    expect(screen.getByTestId('permissions-layout')).toBeInTheDocument();
    expect(screen.getByTestId('permissions-content')).toBeInTheDocument();
  });

  it('handles all form field interactions', () => {
    render(
      <TestWrapper>
        <PermissionsForm {...defaultProps} />
      </TestWrapper>
    );

    const input = screen.getByTestId('input-permissions');
    
    // Test various input scenarios
    const testValues = ['read', 'write', 'delete', 'admin', 'user', 'read,write', 'read,write,delete', ''];
    
    testValues.forEach((value) => {
      fireEvent.change(input, { target: { value } });
      expect(mockOnInputChange).toHaveBeenCalledWith('permissions', value);
    });
  });
});

