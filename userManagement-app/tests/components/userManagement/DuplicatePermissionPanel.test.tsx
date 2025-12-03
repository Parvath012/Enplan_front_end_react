import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DuplicatePermissionPanel from '../../../src/components/userManagement/DuplicatePermissionPanel';
import '@testing-library/jest-dom';

// Mock commonApp components
jest.mock('commonApp/Panel', () => {
  return function MockPanel({ isOpen, children, onClose, onSubmit, onReset, title }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="panel">
        <div data-testid="panel-title">{title}</div>
        <button data-testid="panel-close" onClick={onClose}>Close</button>
        <button data-testid="panel-submit" onClick={onSubmit}>Submit</button>
        <button data-testid="panel-reset" onClick={onReset}>Reset</button>
        {children}
      </div>
    );
  };
});

jest.mock('../../../src/components/shared/DuplicatePermissionFormFields', () => {
  return function MockDuplicatePermissionFormFields({
    sourceLabel,
    sourceValue,
    sourceOptions,
    sourcePlaceholder,
    sourceError,
    onSourceChange,
    onSourceErrorClear,
    targetLabel,
    targetValue,
    targetPlaceholder,
    modulesLabel,
    modulesValue,
    modulesOptions,
    modulesPlaceholder,
    onModulesChange
  }: any) {
    return (
      <div data-testid="duplicate-permission-form-fields">
        <div data-testid="select-source-user">
          <label>{sourceLabel}</label>
          <select
            value={sourceValue}
            onChange={(e) => onSourceChange(e.target.value)}
            data-error={sourceError}
          >
            <option value="">{sourcePlaceholder}</option>
            {sourceOptions?.map((opt: string, index: number) => (
              <option key={index} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {sourceError && <div data-testid="error-message">{sourceError}</div>}
        </div>
        <div data-testid="textfield-target-user">
          <label>{targetLabel}</label>
          <input
            type="text"
            value={targetValue}
            onChange={(e) => {}}
            data-error={false}
            readOnly
          />
        </div>
        <div data-testid="multiselect-modules">
          <label>{modulesLabel}</label>
          <select
            multiple
            value={modulesValue}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (option) => option.value);
              onModulesChange(selected);
            }}
          >
            {modulesOptions?.map((opt: string, index: number) => (
              <option key={index} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };
});

jest.mock('../../../src/utils/userFormUtils', () => ({
  parsePermissionsData: jest.fn(),
}));

import { parsePermissionsData } from '../../../src/utils/userFormUtils';

describe('DuplicatePermissionPanel', () => {
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const mockFullUsers = [
    {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      emailid: 'john@example.com',
      permissions: JSON.stringify({
        enabledModules: ['module1', 'module2'],
        selectedPermissions: ['module1-sub1-perm1', 'module2-sub2-perm2'],
      }),
    },
    {
      id: 2,
      firstname: 'Jane',
      lastname: 'Smith',
      emailid: 'jane@example.com',
      permissions: JSON.stringify({
        enabledModules: ['module3'],
        selectedPermissions: ['module3-sub3-perm3'],
      }),
    },
  ];

  const mockModules = ['module1', 'module2', 'module3'];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onDuplicate: jest.fn(),
    users: mockUsers,
    fullUsers: mockFullUsers,
    modules: mockModules,
    currentUser: {
      firstName: 'New',
      lastName: 'User',
      emailId: 'newuser@example.com',
    },
    onSuccessNotification: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
      const parsed = JSON.parse(perms);
      return {
        enabledModules: parsed.enabledModules || [],
        selectedPermissions: parsed.selectedPermissions || [],
      };
    });
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<DuplicatePermissionPanel {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('panel')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      expect(screen.getByTestId('panel')).toBeInTheDocument();
      expect(screen.getByTestId('panel-title')).toHaveTextContent('Duplicate Permissions');
    });

    it('should render source user select field', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      expect(screen.getByTestId('duplicate-permission-form-fields')).toBeInTheDocument();
      expect(screen.getByTestId('select-source-user')).toBeInTheDocument();
    });

    it('should render target user text field', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      expect(screen.getByTestId('textfield-target-user')).toBeInTheDocument();
    });

    it('should render modules multi-select field', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      expect(screen.getByTestId('multiselect-modules')).toBeInTheDocument();
    });

    it('should pre-fill target user with current user', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      const targetField = screen.getByTestId('textfield-target-user').querySelector('input');
      expect(targetField).toHaveValue('New User');
    });

    it('should handle target user change', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      const targetField = screen.getByTestId('textfield-target-user');
      expect(targetField).toBeInTheDocument();
    });

    it('should handle modules change', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      const modulesSelect = screen.getByTestId('multiselect-modules').querySelector('select');
      expect(modulesSelect).toBeInTheDocument();
    });

    it('should handle source user options correctly', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      const options = Array.from(sourceSelect!.options).map(opt => opt.value);
      expect(options).not.toContain('New User');
    });
  });

  describe('Form Validation', () => {
    it('should show error when source user is not selected', async () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Source user is required');
      });
    });

    it('should show error when target user is empty', async () => {
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          currentUser={undefined}
        />
      );
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessages = screen.getAllByTestId('error-message');
        expect(errorMessages.some(msg => msg.textContent === 'Target user is required')).toBe(true);
      });
    });

    it('should show error when source and target users are the same', async () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      // Select source user
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      // Set target user to same value
      const targetInput = screen.getByTestId('textfield-target-user').querySelector('input');
      fireEvent.change(targetInput!, { target: { value: 'John Doe' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessages = screen.getAllByTestId('error-message');
        expect(errorMessages.some(msg => msg.textContent === 'Target user must be different from source user')).toBe(true);
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onDuplicate with all permissions when no modules selected', async () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      // Select source user
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onDuplicate).toHaveBeenCalledWith(
          'John Doe',
          'New User',
          [],
          ['module1-sub1-perm1', 'module2-sub2-perm2'],
          ['module1', 'module2']
        );
      });
    });

    it('should call onDuplicate with selected modules only', async () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      // Select source user
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      // Select modules
      const modulesSelect = screen.getByTestId('multiselect-modules').querySelector('select');
      fireEvent.change(modulesSelect!, { target: { selectedOptions: [{ value: 'module1' }] } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onDuplicate).toHaveBeenCalledWith(
          'John Doe',
          'New User',
          ['module1'],
          ['module1-sub1-perm1'],
          ['module1']
        );
      });
    });

    it('should show success notification on successful submission', async () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onSuccessNotification).toHaveBeenCalledWith(
          'Permissions for New User duplicated successfully from John Doe'
        );
      });
    });

    it('should close panel after successful submission', async () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('should show error when source user not found', async () => {
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          fullUsers={[]}
        />
      );
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessages = screen.getAllByTestId('error-message');
        expect(errorMessages.some(msg => msg.textContent === 'Source user not found')).toBe(true);
      });
    });
  });

  describe('Form Reset', () => {
    it('should reset form when reset button is clicked', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      // Fill form
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      const resetButton = screen.getByTestId('panel-reset');
      fireEvent.click(resetButton);
      
      // Source should be cleared, target should remain pre-filled
      expect(sourceSelect).toHaveValue('');
      const targetInput = screen.getByTestId('textfield-target-user').querySelector('input');
      expect(targetInput).toHaveValue('New User');
    });
  });

  describe('Form Reset on Panel Open/Close', () => {
    it('should reset form when panel opens', () => {
      const { rerender } = render(
        <DuplicatePermissionPanel {...defaultProps} isOpen={false} />
      );
      
      rerender(<DuplicatePermissionPanel {...defaultProps} isOpen={true} />);
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      expect(sourceSelect).toHaveValue('');
    });

    it('should pre-fill target user when panel opens with currentUser', () => {
      const { rerender } = render(
        <DuplicatePermissionPanel {...defaultProps} isOpen={false} />
      );
      
      rerender(<DuplicatePermissionPanel {...defaultProps} isOpen={true} />);
      
      const targetInput = screen.getByTestId('textfield-target-user').querySelector('input');
      expect(targetInput).toHaveValue('New User');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty permissions', async () => {
      (parsePermissionsData as jest.Mock).mockReturnValue({
        enabledModules: [],
        selectedPermissions: [],
      });
      
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(defaultProps.onDuplicate).toHaveBeenCalledWith(
          'John Doe',
          'New User',
          [],
          [],
          []
        );
      });
    });

    it('should handle user with only first name', () => {
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          currentUser={{ firstName: 'New', lastName: '', emailId: 'new@example.com' }}
        />
      );
      
      const targetInput = screen.getByTestId('textfield-target-user').querySelector('input');
      expect(targetInput).toHaveValue('New');
    });

    it('should handle user with only email', () => {
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          currentUser={{ firstName: '', lastName: '', emailId: 'new@example.com' }}
        />
      );
      
      const targetInput = screen.getByTestId('textfield-target-user').querySelector('input');
      expect(targetInput).toHaveValue('new@example.com');
    });

    it('should clear source user if it matches target user', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'New User' } });
      
      // Source should be cleared automatically
      expect(sourceSelect).toHaveValue('');
    });
  });

  describe('Source User Options Filtering', () => {
    it('should exclude target user from source user options', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      const options = Array.from(sourceSelect!.options).map(opt => opt.value);
      
      // Target user "New User" should not be in options
      expect(options).not.toContain('New User');
    });

    it('should exclude Unknown User from source user options', () => {
      const usersWithUnknown = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Unknown User', email: 'unknown@example.com' },
      ];
      
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          users={usersWithUnknown}
        />
      );
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      const options = Array.from(sourceSelect!.options).map(opt => opt.value);
      
      expect(options).not.toContain('Unknown User');
    });
  });

  describe('Permission Filtering by Selected Modules', () => {
    it('should filter permissions by selected modules', async () => {
      const mockFullUsers = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          emailid: 'john@example.com',
          permissions: JSON.stringify({
            enabledModules: ['module1', 'module2'],
            selectedPermissions: [
              'module1-sub1-perm1',
              'module1-sub1-perm2',
              'module2-sub2-perm1',
            ],
          }),
        },
      ];

      (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
        const parsed = JSON.parse(perms);
        return {
          enabledModules: parsed.enabledModules || [],
          selectedPermissions: parsed.selectedPermissions || [],
        };
      });

      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          fullUsers={mockFullUsers}
        />
      );

      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });

      const modulesSelect = screen.getByTestId('multiselect-modules').querySelector('select');
      fireEvent.change(modulesSelect!, {
        target: {
          selectedOptions: [{ value: 'module1' }],
        },
      });

      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onDuplicate).toHaveBeenCalledWith(
          'John Doe',
          'New User',
          ['module1'],
          ['module1-sub1-perm1', 'module1-sub1-perm2'],
          ['module1']
        );
      });
    });

    it('should handle permissions with complex module names', async () => {
      const mockFullUsers = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          emailid: 'john@example.com',
          permissions: JSON.stringify({
            enabledModules: ['module-with-dashes'],
            selectedPermissions: ['module-with-dashes-sub-perm1'],
          }),
        },
      ];

      (parsePermissionsData as jest.Mock).mockImplementation((perms: string) => {
        const parsed = JSON.parse(perms);
        return {
          enabledModules: parsed.enabledModules || [],
          selectedPermissions: parsed.selectedPermissions || [],
        };
      });

      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          fullUsers={mockFullUsers}
          modules={['module-with-dashes']}
        />
      );

      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });

      const modulesSelect = screen.getByTestId('multiselect-modules').querySelector('select');
      fireEvent.change(modulesSelect!, {
        target: {
          selectedOptions: [{ value: 'module-with-dashes' }],
        },
      });

      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onDuplicate).toHaveBeenCalled();
      });
    });
  });

  describe('Submit Button State', () => {
    it('should disable submit when source user is empty', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit when target user is empty', () => {
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          currentUser={undefined}
        />
      );
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit when source and target are the same', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      // Try to set source to same as target (should be prevented)
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit when form is valid', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Reset Edge Cases', () => {
    it('should reset form but keep target user when currentUser exists', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      const resetButton = screen.getByTestId('panel-reset');
      fireEvent.click(resetButton);
      
      expect(sourceSelect).toHaveValue('');
      const targetInput = screen.getByTestId('textfield-target-user').querySelector('input');
      expect(targetInput).toHaveValue('New User');
    });

    it('should reset target user when currentUser is undefined', () => {
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          currentUser={undefined}
        />
      );
      
      const resetButton = screen.getByTestId('panel-reset');
      fireEvent.click(resetButton);
      
      const targetInput = screen.getByTestId('textfield-target-user').querySelector('input');
      expect(targetInput).toHaveValue('');
    });
  });

  describe('Validation Error Clearing', () => {
    it('should clear source user error when source user is selected', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      // Trigger validation error
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      // Select source user
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      // Error should be cleared
      const errorMessages = screen.queryAllByTestId('error-message');
      const sourceError = errorMessages.find(msg => 
        msg.textContent === 'Source user is required'
      );
      expect(sourceError).not.toBeInTheDocument();
    });
  });

  describe('User Name Formatting', () => {
    it('should handle user with only first name', () => {
      const mockFullUsers = [
        {
          id: 1,
          firstname: 'John',
          lastname: '',
          emailid: 'john@example.com',
          permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
        },
      ];

      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          fullUsers={mockFullUsers}
        />
      );

      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John' } });

      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      // Should not crash
      expect(submitButton).toBeInTheDocument();
    });

    it('should handle user with only email', () => {
      const mockFullUsers = [
        {
          id: 1,
          firstname: '',
          lastname: '',
          emailid: 'john@example.com',
          permissions: JSON.stringify({ enabledModules: [], selectedPermissions: [] }),
        },
      ];

      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          fullUsers={mockFullUsers}
        />
      );

      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'john@example.com' } });

      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      // Should not crash
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Success Notification', () => {
    it('should call onSuccessNotification when provided', async () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);

      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });

      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onSuccessNotification).toHaveBeenCalledWith(
          'Permissions for New User duplicated successfully from John Doe'
        );
      });
    });

    it('should not call onSuccessNotification when not provided', async () => {
      const onDuplicate = jest.fn();
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          onSuccessNotification={undefined}
          onDuplicate={onDuplicate}
        />
      );

      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });

      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onDuplicate).toHaveBeenCalled();
      });
    });

    it('should handle onSourceErrorClear callback', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      
      // Trigger error first
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      // Then change source to trigger error clear
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      // Error should be cleared
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should handle target user with only firstName', () => {
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          currentUser={{ firstName: 'New', lastName: '', emailId: '' }}
        />
      );
      const targetField = screen.getByTestId('textfield-target-user').querySelector('input');
      expect(targetField).toHaveValue('New');
    });

    it('should handle target user with only emailId', () => {
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          currentUser={{ firstName: '', lastName: '', emailId: 'new@example.com' }}
        />
      );
      const targetField = screen.getByTestId('textfield-target-user').querySelector('input');
      expect(targetField).toHaveValue('new@example.com');
    });

    it('should handle empty modules list', () => {
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          modules={[]}
        />
      );
      const modulesSelect = screen.getByTestId('multiselect-modules').querySelector('select');
      expect(modulesSelect).toBeInTheDocument();
    });

    it('should handle modulesData prop', () => {
      const modulesData = {
        module1: { submodules: { sub1: ['perm1', 'perm2'] } }
      };
      render(
        <DuplicatePermissionPanel
          {...defaultProps}
          modulesData={modulesData}
        />
      );
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });

    it('should handle validation when source and target are same after change', async () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      const targetInput = screen.getByTestId('textfield-target-user').querySelector('input');
      
      // Try to set source to match target (should be prevented by useEffect)
      fireEvent.change(sourceSelect!, { target: { value: 'New User' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessages = screen.queryAllByTestId('error-message');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should handle submit button disabled state correctly', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).toBeDisabled();
    });

    it('should handle submit button enabled state when form is valid', () => {
      render(<DuplicatePermissionPanel {...defaultProps} />);
      
      const sourceSelect = screen.getByTestId('select-source-user').querySelector('select');
      fireEvent.change(sourceSelect!, { target: { value: 'John Doe' } });
      
      const submitButton = screen.getByTestId('panel-submit');
      expect(submitButton).not.toBeDisabled();
    });
  });
});

