/**
 * Comprehensive tests for RoleActionRenderer
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RoleActionRenderer, { createRoleActionRenderer } from '../../../src/components/roleList/RoleActionRenderer';
import '@testing-library/jest-dom';

// Mock ToggleSwitch
jest.mock('commonApp/ToggleSwitch', () => {
  return function MockToggleSwitch({ isOn, handleToggle, disabled, showPointerOnDisabled }: any) {
    return (
      <div
        data-testid="toggle-switch"
        data-is-on={isOn}
        data-disabled={disabled}
        data-show-pointer={showPointerOnDisabled}
        onClick={!disabled ? handleToggle : undefined}
      >
        Toggle Switch
      </div>
    );
  };
});

// Mock CustomTooltip
jest.mock('commonApp/CustomTooltip', () => {
  return function MockCustomTooltip({ children, title }: any) {
    return <div data-testid="tooltip" title={title}>{children}</div>;
  };
});

// Mock icons
jest.mock('@carbon/icons-react', () => ({
  Edit: ({ size, color }: { size?: number; color?: string }) => (
    <div data-testid="edit-icon" data-size={size} data-color={color}>Edit</div>
  ),
  View: ({ size, color }: { size?: number; color?: string }) => (
    <div data-testid="view-icon" data-size={size} data-color={color}>View</div>
  ),
  TrashCan: ({ size, color }: { size?: number; color?: string }) => (
    <div data-testid="delete-icon" data-size={size} data-color={color}>Delete</div>
  ),
}));

describe('RoleActionRenderer', () => {
  const defaultParams = {
    data: {
      id: 1,
      isenabled: true,
      islocked: false,
      status: 'Active',
    },
  };

  const defaultProps = {
    params: defaultParams,
    onEditRole: jest.fn(),
    onViewPermissions: jest.fn(),
    onDeleteRole: jest.fn(),
    onToggleStatus: jest.fn(),
    togglingRoles: new Set<number>(),
    getIsPanelOpen: jest.fn(() => false),
    getSelectedRoleId: jest.fn(() => null),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render Edit, View, Delete icons and Toggle Switch', () => {
      render(<RoleActionRenderer {...defaultProps} />);
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      expect(screen.getByTestId('view-icon')).toBeInTheDocument();
      expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-switch')).toBeInTheDocument();
    });

    it('should render dividers between actions', () => {
      const { container } = render(<RoleActionRenderer {...defaultProps} />);
      const dividers = container.querySelectorAll('div[style*="width: 1px"]');
      expect(dividers.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edit Button', () => {
    it('should call onEditRole when clicked and role is active', () => {
      render(<RoleActionRenderer {...defaultProps} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      if (editButton) {
        fireEvent.click(editButton);
        expect(defaultProps.onEditRole).toHaveBeenCalledWith(1);
      }
    });

    it('should be disabled when role is inactive (isenabled: false)', () => {
      const params = {
        data: { ...defaultParams.data, isenabled: false },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).toBeDisabled();
    });

    it('should be disabled when role status is Inactive', () => {
      const params = {
        data: { ...defaultParams.data, status: 'Inactive' },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).toBeDisabled();
    });

    it('should show correct title when enabled', () => {
      render(<RoleActionRenderer {...defaultProps} />);
      const tooltip = screen.getAllByTestId('tooltip')[0];
      expect(tooltip).toHaveAttribute('title', 'Edit role');
    });

    it('should show correct title when disabled due to inactive role', () => {
      const params = {
        data: { ...defaultParams.data, isenabled: false, status: 'Inactive' },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const tooltip = screen.getAllByTestId('tooltip')[0];
      expect(tooltip).toHaveAttribute('title', 'Cannot edit inactive role');
    });

    it('should show correct title when panel is open', () => {
      const props = {
        ...defaultProps,
        getIsPanelOpen: jest.fn(() => true),
        getSelectedRoleId: jest.fn(() => 1),
      };
      render(<RoleActionRenderer {...props} />);
      const tooltip = screen.getAllByTestId('tooltip')[0];
      expect(tooltip).toHaveAttribute('title', 'Cannot edit role while viewing');
    });

    it('should not call onEditRole when disabled', () => {
      const params = {
        data: { ...defaultParams.data, isenabled: false },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      if (editButton) {
        fireEvent.click(editButton);
        expect(defaultProps.onEditRole).not.toHaveBeenCalled();
      }
    });

    it('should show correct icon color when enabled', () => {
      render(<RoleActionRenderer {...defaultProps} />);
      const editIcon = screen.getByTestId('edit-icon');
      expect(editIcon).toHaveAttribute('data-color', '#5B6061');
    });

    it('should show correct icon color when disabled', () => {
      const params = {
        data: { ...defaultParams.data, isenabled: false },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const editIcon = screen.getByTestId('edit-icon');
      expect(editIcon).toHaveAttribute('data-color', '#9E9E9E');
    });
  });

  describe('View Button', () => {
    it('should call onViewPermissions when clicked and role is active', () => {
      render(<RoleActionRenderer {...defaultProps} />);
      const viewButton = screen.getByTestId('view-icon').closest('button');
      if (viewButton) {
        fireEvent.click(viewButton);
        expect(defaultProps.onViewPermissions).toHaveBeenCalledWith(1);
      }
    });

    it('should be disabled when role is inactive', () => {
      const params = {
        data: { ...defaultParams.data, isenabled: false },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const viewButton = screen.getByTestId('view-icon').closest('button');
      expect(viewButton).toBeDisabled();
    });

    it('should show correct title when enabled', () => {
      render(<RoleActionRenderer {...defaultProps} />);
      const tooltip = screen.getAllByTestId('tooltip')[1];
      expect(tooltip).toHaveAttribute('title', 'View permission');
    });

    it('should show correct title when disabled due to inactive role', () => {
      const params = {
        data: { ...defaultParams.data, isenabled: false },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const tooltip = screen.getAllByTestId('tooltip')[1];
      expect(tooltip).toHaveAttribute('title', 'Cannot view inactive role');
    });

    it('should show correct title when panel is open', () => {
      const props = {
        ...defaultProps,
        getIsPanelOpen: jest.fn(() => true),
        getSelectedRoleId: jest.fn(() => 1),
      };
      render(<RoleActionRenderer {...props} />);
      const tooltip = screen.getAllByTestId('tooltip')[1];
      expect(tooltip).toHaveAttribute('title', 'Cannot view role while panel is open');
    });
  });

  describe('Delete Button', () => {
    it('should call onDeleteRole when clicked and role is active and not locked', () => {
      render(<RoleActionRenderer {...defaultProps} />);
      const deleteButton = screen.getByTestId('delete-icon').closest('button');
      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(defaultProps.onDeleteRole).toHaveBeenCalledWith(1);
      }
    });

    it('should be disabled when role is locked', () => {
      const params = {
        data: { ...defaultParams.data, islocked: true },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const deleteButton = screen.getByTestId('delete-icon').closest('button');
      expect(deleteButton).toBeDisabled();
    });

    it('should be disabled when role is inactive', () => {
      const params = {
        data: { ...defaultParams.data, isenabled: false },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const deleteButton = screen.getByTestId('delete-icon').closest('button');
      expect(deleteButton).toBeDisabled();
    });

    it('should show correct title when enabled', () => {
      render(<RoleActionRenderer {...defaultProps} />);
      const tooltip = screen.getAllByTestId('tooltip')[2];
      expect(tooltip).toHaveAttribute('title', 'Delete role');
    });

    it('should show correct title when disabled due to locked role', () => {
      const params = {
        data: { ...defaultParams.data, islocked: true },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const tooltip = screen.getAllByTestId('tooltip')[2];
      expect(tooltip).toHaveAttribute('title', 'Cannot delete locked role');
    });

    it('should show correct title when disabled due to inactive role', () => {
      const params = {
        data: { ...defaultParams.data, isenabled: false },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const tooltip = screen.getAllByTestId('tooltip')[2];
      expect(tooltip).toHaveAttribute('title', 'Cannot delete inactive role');
    });

    it('should handle islocked as string "true"', () => {
      const params = {
        data: { ...defaultParams.data, islocked: 'true' },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const deleteButton = screen.getByTestId('delete-icon').closest('button');
      expect(deleteButton).toBeDisabled();
    });

    it('should handle isLocked in camelCase', () => {
      const params = {
        data: { ...defaultParams.data, isLocked: true },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const deleteButton = screen.getByTestId('delete-icon').closest('button');
      expect(deleteButton).toBeDisabled();
    });

    it('should handle IsLocked in PascalCase', () => {
      const params = {
        data: { ...defaultParams.data, IsLocked: true },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const deleteButton = screen.getByTestId('delete-icon').closest('button');
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Toggle Switch', () => {
    it('should call onToggleStatus when clicked', () => {
      render(<RoleActionRenderer {...defaultProps} />);
      const toggle = screen.getByTestId('toggle-switch');
      fireEvent.click(toggle);
      expect(defaultProps.onToggleStatus).toHaveBeenCalledWith(1, true);
    });

    it('should be disabled when role is toggling', () => {
      render(<RoleActionRenderer {...defaultProps} togglingRoles={new Set([1])} />);
      const toggle = screen.getByTestId('toggle-switch');
      expect(toggle).toHaveAttribute('data-disabled', 'true');
    });

    it('should pass correct isOn value when role is enabled', () => {
      render(<RoleActionRenderer {...defaultProps} />);
      const toggle = screen.getByTestId('toggle-switch');
      expect(toggle).toHaveAttribute('data-is-on', 'true');
    });

    it('should pass correct isOn value when role is disabled', () => {
      const params = {
        data: { ...defaultParams.data, isenabled: false },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const toggle = screen.getByTestId('toggle-switch');
      expect(toggle).toHaveAttribute('data-is-on', 'false');
    });

    it('should pass showPointerOnDisabled prop', () => {
      render(<RoleActionRenderer {...defaultProps} />);
      const toggle = screen.getByTestId('toggle-switch');
      expect(toggle).toHaveAttribute('data-show-pointer', 'true');
    });

    it('should be disabled when panel is open for this role', () => {
      const props = {
        ...defaultProps,
        getIsPanelOpen: jest.fn(() => true),
        getSelectedRoleId: jest.fn(() => 1),
      };
      render(<RoleActionRenderer {...props} />);
      const toggle = screen.getByTestId('toggle-switch');
      expect(toggle).toHaveAttribute('data-disabled', 'true');
    });

    it('should convert role id to number when calling onToggleStatus', () => {
      const params = {
        data: { ...defaultParams.data, id: '123' },
      };
      render(<RoleActionRenderer {...defaultProps} params={params} />);
      const toggle = screen.getByTestId('toggle-switch');
      fireEvent.click(toggle);
      expect(defaultProps.onToggleStatus).toHaveBeenCalledWith(123, true);
    });
  });

  describe('Panel State', () => {
    it('should disable actions when panel is open for this role', () => {
      const props = {
        ...defaultProps,
        getIsPanelOpen: jest.fn(() => true),
        getSelectedRoleId: jest.fn(() => 1),
      };
      render(<RoleActionRenderer {...props} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      const viewButton = screen.getByTestId('view-icon').closest('button');
      const deleteButton = screen.getByTestId('delete-icon').closest('button');
      
      expect(editButton).toBeDisabled();
      expect(viewButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });

    it('should not disable actions when panel is open for different role', () => {
      const props = {
        ...defaultProps,
        getIsPanelOpen: jest.fn(() => true),
        getSelectedRoleId: jest.fn(() => 999),
      };
      render(<RoleActionRenderer {...props} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).not.toBeDisabled();
    });
  });

  describe('createRoleActionRenderer', () => {
    it('should create a renderer function', () => {
      const renderer = createRoleActionRenderer(
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        new Set(),
        jest.fn(() => false),
        jest.fn(() => null)
      );
      expect(typeof renderer).toBe('function');
    });

    it('should return RoleActionRenderer component when called', () => {
      const renderer = createRoleActionRenderer(
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        new Set(),
        jest.fn(() => false),
        jest.fn(() => null)
      );
      const result = renderer(defaultParams);
      expect(result).toBeDefined();
    });

    it('should pass all props correctly', () => {
      const onEditRole = jest.fn();
      const renderer = createRoleActionRenderer(
        onEditRole,
        jest.fn(),
        jest.fn(),
        jest.fn(),
        new Set(),
        jest.fn(() => false),
        jest.fn(() => null)
      );
      
      const { container } = render(renderer(defaultParams));
      expect(container).toBeInTheDocument();
    });
  });
});
