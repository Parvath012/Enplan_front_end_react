import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserViewPanel from '../../../src/components/userView/UserViewPanel';

// Mock dependencies
jest.mock('../../../src/components/userManagement/PermissionsTabLayout', () => {
  return function MockPermissionsTabLayout({ formData, onInputChange, isReadOnly }: any) {
    return (
      <div data-testid="permissions-tab-layout" data-read-only={isReadOnly}>
        <div data-testid="permissions-form-data">{JSON.stringify(formData)}</div>
      </div>
    );
  };
});

jest.mock('../../../src/components/userManagement/UserDetailsForm', () => {
  return function MockUserDetailsForm({ formData, onInputChange, getErrorProps, isReadOnly }: any) {
    return (
      <div data-testid="user-details-form" data-read-only={isReadOnly}>
        <div data-testid="user-details-form-data">{JSON.stringify(formData)}</div>
        <input
          data-testid="mock-input"
          onChange={(e) => onInputChange('firstName', e.target.value)}
        />
      </div>
    );
  };
});

jest.mock('@mui/material', () => ({
  Box: ({ children, sx, ...props }: any) => (
    <div data-testid="mui-box" style={sx} {...props}>{children}</div>
  ),
  Typography: ({ children, sx, ...props }: any) => (
    <div data-testid="mui-typography" style={sx} {...props}>{children}</div>
  ),
}));

jest.mock('@carbon/icons-react', () => ({
  Close: ({ size }: any) => <div data-testid="close-icon" data-size={size}>Close</div>,
}));

describe('UserViewPanel', () => {
  const mockSelectedUser = {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    phonenumber: '1234567890',
    role: 'Admin',
    department: 'IT',
    emailid: 'john.doe@example.com',
    reportingmanager: 'Jane Manager',
    dottedorprojectmanager: 'Bob Project',
    selfreporting: 'false',
    regions: JSON.stringify(['North America']),
    countries: JSON.stringify(['USA']),
    divisions: JSON.stringify(['Technology']),
    groups: JSON.stringify(['Development']),
    departments: JSON.stringify(['Engineering']),
    class: JSON.stringify(['Senior']),
    subClass: JSON.stringify(['Frontend']),
    permissions: JSON.stringify({
      enabledModules: ['Module1'],
      selectedPermissions: ['read', 'write'],
      activeModule: 'Module1',
      activeSubmodule: null
    })
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    selectedUser: mockSelectedUser
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when open is false', () => {
    render(<UserViewPanel {...defaultProps} open={false} />);
    expect(screen.queryByTestId('mui-box')).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    render(<UserViewPanel {...defaultProps} />);
    expect(screen.getByTestId('mui-box')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('should render with default Permissions tab active', () => {
    render(<UserViewPanel {...defaultProps} />);
    expect(screen.getByTestId('permissions-tab-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('user-details-form')).not.toBeInTheDocument();
  });

  it('should switch to User Details tab when clicked', () => {
    render(<UserViewPanel {...defaultProps} />);
    
    const userDetailsTab = screen.getByText('User Details');
    fireEvent.click(userDetailsTab);
    
    expect(screen.getByTestId('user-details-form')).toBeInTheDocument();
    expect(screen.queryByTestId('permissions-tab-layout')).not.toBeInTheDocument();
  });

  it('should switch back to Permissions tab when clicked', () => {
    render(<UserViewPanel {...defaultProps} />);
    
    // Switch to User Details first
    const userDetailsTab = screen.getByText('User Details');
    fireEvent.click(userDetailsTab);
    expect(screen.getByTestId('user-details-form')).toBeInTheDocument();
    
    // Switch back to Permissions
    const permissionsTab = screen.getByText('Permissions');
    fireEvent.click(permissionsTab);
    
    expect(screen.getByTestId('permissions-tab-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('user-details-form')).not.toBeInTheDocument();
  });

  it('should call onClose when close icon is clicked', () => {
    const mockOnClose = jest.fn();
    render(<UserViewPanel {...defaultProps} onClose={mockOnClose} />);
    
    const closeIcon = screen.getByTestId('close-icon').parentElement;
    if (closeIcon) {
      fireEvent.click(closeIcon);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should reset to Permissions tab when closed and reopened', () => {
    const { rerender, unmount } = render(<UserViewPanel {...defaultProps} />);
    
    // Switch to User Details
    const userDetailsTab = screen.getByText('User Details');
    fireEvent.click(userDetailsTab);
    expect(screen.getByTestId('user-details-form')).toBeInTheDocument();
    
    // Close panel by calling onClose
    const mockOnClose = jest.fn();
    const closeIcon = screen.getByTestId('close-icon').parentElement;
    if (closeIcon) {
      fireEvent.click(closeIcon);
    }
    
    // Unmount and remount to simulate reopening
    unmount();
    
    // Reopen panel
    render(<UserViewPanel {...defaultProps} open={true} onClose={mockOnClose} />);
    
    // Should be back on Permissions tab (default)
    expect(screen.getByTestId('permissions-tab-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('user-details-form')).not.toBeInTheDocument();
  });

  it('should handle null selectedUser', () => {
    render(<UserViewPanel {...defaultProps} selectedUser={null} />);
    
    expect(screen.getByTestId('permissions-tab-layout')).toBeInTheDocument();
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    expect(parsedData.firstName).toBe('');
    expect(parsedData.lastName).toBe('');
  });

  it('should handle undefined selectedUser', () => {
    render(<UserViewPanel {...defaultProps} selectedUser={undefined} />);
    
    expect(screen.getByTestId('permissions-tab-layout')).toBeInTheDocument();
  });

  it('should convert selectedUser to UserFormData format', () => {
    render(<UserViewPanel {...defaultProps} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    expect(parsedData.firstName).toBe('John');
    expect(parsedData.lastName).toBe('Doe');
    expect(parsedData.phoneNumber).toBe('1234567890');
    expect(parsedData.role).toBe('Admin');
    expect(parsedData.department).toBe('IT');
    expect(parsedData.emailId).toBe('john.doe@example.com');
    expect(parsedData.reportingManager).toBe('Jane Manager');
    expect(parsedData.dottedLineManager).toBe('Bob Project');
    expect(parsedData.selfReporting).toBe(false);
  });

  it('should parse JSON fields correctly', () => {
    render(<UserViewPanel {...defaultProps} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    expect(parsedData.regions).toEqual(['North America']);
    expect(parsedData.countries).toEqual(['USA']);
    expect(parsedData.divisions).toEqual(['Technology']);
    expect(parsedData.groups).toEqual(['Development']);
    expect(parsedData.departments).toEqual(['Engineering']);
    expect(parsedData.classes).toEqual(['Senior']);
    expect(parsedData.subClasses).toEqual(['Frontend']);
  });

  it('should parse permissions JSON correctly', () => {
    render(<UserViewPanel {...defaultProps} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    expect(parsedData.permissions).toEqual({
      enabledModules: ['Module1'],
      selectedPermissions: ['read', 'write'],
      activeModule: 'Module1',
      activeSubmodule: null
    });
  });

  it('should handle invalid JSON in fields', () => {
    const invalidUser = {
      ...mockSelectedUser,
      regions: 'invalid json',
      permissions: 'invalid json'
    };
    
    render(<UserViewPanel {...defaultProps} selectedUser={invalidUser} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    // Should handle invalid JSON gracefully - returns empty arrays
    expect(Array.isArray(parsedData.regions)).toBe(true);
    expect(parsedData.regions.length).toBe(0);
    expect(parsedData.permissions).toBeDefined();
    expect(parsedData.permissions.enabledModules).toEqual([]);
  });

  it('should handle non-string field that is already an array', () => {
    const arrayUser = {
      ...mockSelectedUser,
      regions: ['Already Array'],
      countries: ['Already Array']
    };
    
    render(<UserViewPanel {...defaultProps} selectedUser={arrayUser} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    expect(parsedData.regions).toEqual(['Already Array']);
    expect(parsedData.countries).toEqual(['Already Array']);
  });

  it('should handle falsy field values', () => {
    const falsyUser = {
      ...mockSelectedUser,
      regions: null,
      countries: undefined,
      divisions: ''
    };
    
    render(<UserViewPanel {...defaultProps} selectedUser={falsyUser} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    expect(parsedData.regions).toEqual([]);
    expect(parsedData.countries).toEqual([]);
    expect(parsedData.divisions).toEqual([]);
  });

  it('should handle non-array parsed JSON field', () => {
    const nonArrayUser = {
      ...mockSelectedUser,
      regions: JSON.stringify({ not: 'an array' })
    };
    
    render(<UserViewPanel {...defaultProps} selectedUser={nonArrayUser} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    // Should return empty array for non-array values
    expect(parsedData.regions).toEqual([]);
  });

  it('should handle permissions as object instead of string', () => {
    const objectPermissionsUser = {
      ...mockSelectedUser,
      permissions: {
        enabledModules: ['Module1'],
        selectedPermissions: ['read']
      }
    };
    
    render(<UserViewPanel {...defaultProps} selectedUser={objectPermissionsUser} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    expect(parsedData.permissions.enabledModules).toEqual(['Module1']);
    expect(parsedData.permissions.selectedPermissions).toEqual(['read']);
  });

  it('should handle permissions with missing fields', () => {
    const partialPermissionsUser = {
      ...mockSelectedUser,
      permissions: JSON.stringify({ enabledModules: ['Module1'] })
    };
    
    render(<UserViewPanel {...defaultProps} selectedUser={partialPermissionsUser} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    expect(parsedData.permissions.enabledModules).toEqual(['Module1']);
    expect(parsedData.permissions.selectedPermissions).toEqual([]);
    expect(parsedData.permissions.activeModule).toBeNull();
    expect(parsedData.permissions.activeSubmodule).toBeNull();
  });

  it('should handle empty string JSON fields', () => {
    const emptyUser = {
      ...mockSelectedUser,
      regions: '',
      countries: '',
      permissions: ''
    };
    
    render(<UserViewPanel {...defaultProps} selectedUser={emptyUser} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    expect(parsedData.regions).toEqual([]);
    expect(parsedData.countries).toEqual([]);
    expect(parsedData.permissions).toEqual({
      enabledModules: [],
      selectedPermissions: [],
      activeModule: null,
      activeSubmodule: null
    });
  });

  it('should handle non-string JSON fields', () => {
    const nonStringUser = {
      ...mockSelectedUser,
      regions: ['Already Array'],
      countries: ['Already Array']
    };
    
    render(<UserViewPanel {...defaultProps} selectedUser={nonStringUser} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    expect(parsedData.regions).toEqual(['Already Array']);
    expect(parsedData.countries).toEqual(['Already Array']);
  });

  it('should pass isReadOnly prop to UserDetailsForm', () => {
    render(<UserViewPanel {...defaultProps} />);
    
    // Switch to User Details tab
    const userDetailsTab = screen.getByText('User Details');
    fireEvent.click(userDetailsTab);
    
    const userDetailsForm = screen.getByTestId('user-details-form');
    expect(userDetailsForm).toHaveAttribute('data-read-only', 'true');
  });

  it('should pass isReadOnly prop to PermissionsTabLayout', () => {
    render(<UserViewPanel {...defaultProps} />);
    
    const permissionsLayout = screen.getByTestId('permissions-tab-layout');
    expect(permissionsLayout).toHaveAttribute('data-read-only', 'true');
  });

  it('should handle user with missing fields', () => {
    const minimalUser = {
      id: 2,
      firstname: 'Jane',
      emailid: 'jane@example.com'
    };
    
    render(<UserViewPanel {...defaultProps} selectedUser={minimalUser} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    expect(parsedData.firstName).toBe('Jane');
    expect(parsedData.lastName).toBe('');
    expect(parsedData.emailId).toBe('jane@example.com');
    expect(parsedData.phoneNumber).toBe('');
  });

  it('should handle selfReporting conversion', () => {
    const selfReportingUser = {
      ...mockSelectedUser,
      selfreporting: 'true'
    };
    
    render(<UserViewPanel {...defaultProps} selectedUser={selfReportingUser} />);
    
    const formData = screen.getByTestId('permissions-form-data');
    const parsedData = JSON.parse(formData.textContent || '{}');
    
    expect(parsedData.selfReporting).toBe(true);
  });

  it('should render tabs correctly', () => {
    render(<UserViewPanel {...defaultProps} />);
    
    expect(screen.getByText('User Details')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
  });

  it('should render close icon', () => {
    render(<UserViewPanel {...defaultProps} />);
    
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('should handle multiple tab switches', () => {
    render(<UserViewPanel {...defaultProps} />);
    
    // Switch multiple times
    fireEvent.click(screen.getByText('User Details'));
    fireEvent.click(screen.getByText('Permissions'));
    fireEvent.click(screen.getByText('User Details'));
    fireEvent.click(screen.getByText('Permissions'));
    
    expect(screen.getByTestId('permissions-tab-layout')).toBeInTheDocument();
  });

  it('should maintain tab state during component lifecycle', () => {
    const { rerender } = render(<UserViewPanel {...defaultProps} />);
    
    // Switch to User Details
    fireEvent.click(screen.getByText('User Details'));
    expect(screen.getByTestId('user-details-form')).toBeInTheDocument();
    
    // Rerender with same props
    rerender(<UserViewPanel {...defaultProps} />);
    
    // Should maintain User Details tab
    expect(screen.getByTestId('user-details-form')).toBeInTheDocument();
  });
});

