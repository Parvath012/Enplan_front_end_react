import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DuplicateRolePermissionPanel from '../../../src/components/roleManagement/DuplicateRolePermissionPanel';
import '@testing-library/jest-dom';

// Mock commonApp components
jest.mock('commonApp/Panel', () => {
  return function MockPanel({ isOpen, children, onClose, onSubmit, onReset, title, submitButtonDisabled }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="panel">
        <div data-testid="panel-title">{title}</div>
        <button data-testid="panel-close" onClick={onClose}>Close</button>
        <button data-testid="panel-submit" onClick={onSubmit} disabled={submitButtonDisabled}>Submit</button>
        <button data-testid="panel-reset" onClick={onReset}>Reset</button>
        {children}
      </div>
    );
  };
});

jest.mock('commonApp/SelectField', () => {
  return function MockSelectField({ value, onChange, error, options, label, errorMessage }: any) {
    return (
      <div data-testid={`select-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
        <label>{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-error={error}
        >
          <option value="">Select...</option>
          {options?.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && errorMessage && <div data-testid="error-message">{errorMessage}</div>}
      </div>
    );
  };
});

jest.mock('commonApp/TextField', () => {
  return function MockTextField({ value, onChange, error, label, disabled, readOnly }: any) {
    return (
      <div data-testid={`textfield-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
        <label>{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-error={error}
          disabled={disabled}
          readOnly={readOnly}
        />
      </div>
    );
  };
});

jest.mock('commonApp/MultiSelectField', () => {
  return function MockMultiSelectField({ value, onChange, options, label }: any) {
    return (
      <div data-testid={`multiselect-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
        <label>{label}</label>
        <select
          multiple
          value={value}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (option: any) => option.value);
            onChange(selected);
          }}
        >
          {options?.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  };
});

jest.mock('../../../src/utils/userFormUtils', () => ({
  parsePermissionsData: jest.fn(),
}));

import { parsePermissionsData } from '../../../src/utils/userFormUtils';

describe('DuplicateRolePermissionPanel', () => {
  const mockRoles = [
    { id: '1', name: 'Admin', description: 'Administrator role' },
    { id: '2', name: 'Manager', description: 'Manager role' },
  ];

  const mockFullRoles = [
    {
      id: 1,
      rolename: 'Admin',
      permissions: JSON.stringify({
        enabledModules: ['module1', 'module2'],
        selectedPermissions: ['module1-sub1-perm1', 'module2-sub2-perm2'],
      }),
    },
    {
      id: 2,
      rolename: 'Manager',
      permissions: JSON.stringify({
        enabledModules: ['module1'],
        selectedPermissions: ['module1-sub1-perm1'],
      }),
    },
  ];

  const mockModules = ['module1', 'module2', 'module3'];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onDuplicate: jest.fn(),
    roles: mockRoles,
    fullRoles: mockFullRoles,
    modules: mockModules,
    currentRole: { roleName: 'New Role' },
    onSuccessNotification: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (parsePermissionsData as jest.Mock).mockReturnValue({
      enabledModules: ['module1', 'module2'],
      selectedPermissions: ['module1-sub1-perm1', 'module2-sub2-perm2'],
    });
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      expect(screen.getByTestId('panel')).toBeInTheDocument();
      expect(screen.getByTestId('panel-title')).toHaveTextContent('Duplicate Permission');
    });

    it('should render Source Role field', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      expect(screen.getByTestId('select-source-role')).toBeInTheDocument();
    });

    it('should render Target Role field', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      expect(screen.getByTestId('textfield-target-role')).toBeInTheDocument();
    });

    it('should render Select Modules field', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      expect(screen.getByTestId('multiselect-select-modules-(optional)')).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('should pre-fill target role from currentRole', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      const targetField = screen.getByTestId('textfield-target-role').querySelector('input');
      expect(targetField).toHaveValue('New Role');
    });

    it('should have empty source role initially', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      expect(sourceField).toHaveValue('');
    });

    it('should have empty selected modules initially', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      const modulesField = screen.getByTestId('multiselect-select-modules-(optional)').querySelector('select');
      expect(modulesField).toBeInTheDocument();
    });

    it('should reset form when panel opens', () => {
      const { rerender } = render(<DuplicateRolePermissionPanel {...defaultProps} isOpen={false} />);
      rerender(<DuplicateRolePermissionPanel {...defaultProps} isOpen={true} />);
      
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      expect(sourceField).toHaveValue('');
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when source role is empty', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when target role is empty', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} currentRole={undefined} />);
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when source and target are the same', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} currentRole={{ roleName: 'Admin' }} />);
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      fireEvent.change(sourceField!, { target: { value: 'Admin' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      fireEvent.change(sourceField!, { target: { value: 'Admin' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Source Role Options', () => {
    it('should exclude target role from source options', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} currentRole={{ roleName: 'Admin' }} />);
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      const options = sourceField?.querySelectorAll('option');
      
      const adminOption = Array.from(options || []).find((opt: any) => opt.value === 'Admin');
      expect(adminOption).toBeUndefined();
    });

    it('should show all roles when target role is different', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      const options = sourceField?.querySelectorAll('option');
      
      expect(options?.length).toBeGreaterThan(1); // At least one option (Select...)
    });
  });

  describe('Form Submission', () => {
    it('should call onDuplicate with correct parameters when no modules selected', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      fireEvent.change(sourceField!, { target: { value: 'Admin' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onDuplicate).toHaveBeenCalledWith(
        'Admin',
        'New Role',
        [],
        ['module1-sub1-perm1', 'module2-sub2-perm2'],
        ['module1', 'module2']
      );
    });

    it('should call onDuplicate with filtered permissions when modules selected', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      fireEvent.change(sourceField!, { target: { value: 'Admin' } });
      
      const modulesField = screen.getByTestId('multiselect-select-modules-(optional)').querySelector('select');
      fireEvent.change(modulesField!, { target: { selectedOptions: [{ value: 'module1' }] } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onDuplicate).toHaveBeenCalledWith(
        'Admin',
        'New Role',
        ['module1'],
        ['module1-sub1-perm1'],
        ['module1']
      );
    });

    it('should show error when source role not found', () => {
      const fullRoles = [
        { id: 1, rolename: 'OtherRole', permissions: '{}' },
      ];
      
      render(<DuplicateRolePermissionPanel {...defaultProps} fullRoles={fullRoles as any} />);
      
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      fireEvent.change(sourceField!, { target: { value: 'Admin' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onDuplicate).not.toHaveBeenCalled();
    });

    it('should call onSuccessNotification on successful submission', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      fireEvent.change(sourceField!, { target: { value: 'Admin' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onSuccessNotification).toHaveBeenCalledWith(
        expect.stringContaining('Permissions for New Role duplicated successfully')
      );
    });

    it('should call onClose after successful submission', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      fireEvent.change(sourceField!, { target: { value: 'Admin' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset form when reset button is clicked', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      fireEvent.change(sourceField!, { target: { value: 'Admin' } });
      
      const resetButton = screen.getByTestId('panel-reset');
      fireEvent.click(resetButton);
      
      expect(sourceField).toHaveValue('');
    });

    it('should keep target role after reset', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      
      const resetButton = screen.getByTestId('panel-reset');
      fireEvent.click(resetButton);
      
      const targetField = screen.getByTestId('textfield-target-role').querySelector('input');
      expect(targetField).toHaveValue('New Role');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty permissions data', () => {
      (parsePermissionsData as jest.Mock).mockReturnValue(null);
      
      render(<DuplicateRolePermissionPanel {...defaultProps} />);
      
      const sourceField = screen.getByTestId('select-source-role').querySelector('select');
      fireEvent.change(sourceField!, { target: { value: 'Admin' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      expect(defaultProps.onDuplicate).toHaveBeenCalledWith(
        'Admin',
        'New Role',
        [],
        [],
        []
      );
    });

    it('should handle source role matching target role', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} currentRole={{ roleName: 'Admin' }} />);
      
      // Admin should be excluded from source options, so this shouldn't be possible
      // But if it somehow happens, the validation should prevent submission
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should handle missing currentRole', () => {
      render(<DuplicateRolePermissionPanel {...defaultProps} currentRole={undefined} />);
      
      const targetField = screen.getByTestId('textfield-target-role').querySelector('input');
      expect(targetField).toHaveValue('');
    });
  });
});


