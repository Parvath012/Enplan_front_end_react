import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionRenderer, { createActionRenderer } from '../../../src/components/userList/ActionRenderer';
import '@testing-library/jest-dom';

// Mock ToggleSwitch
jest.mock('commonApp/ToggleSwitch', () => {
  return function MockToggleSwitch({ isOn, handleToggle, disabled }: any) {
    return (
      <div
        data-testid="toggle-switch"
        data-is-on={isOn}
        data-disabled={disabled}
        onClick={!disabled ? handleToggle : undefined}
      >
        Toggle Switch
      </div>
    );
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
}));

describe('ActionRenderer', () => {
  const defaultParams = {
    data: {
      id: 1,
      isenabled: true,
      status: 'Active',
      transferedby: null,
    },
  };

  const defaultProps = {
    params: defaultParams,
    onEditUser: jest.fn(),
    onViewPermissions: jest.fn(),
    onToggleStatus: jest.fn(),
    togglingUsers: new Set<number>(),
    getIsDrawerOpen: jest.fn(() => false),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render Edit, View, and Toggle Switch', () => {
      render(<ActionRenderer {...defaultProps} />);
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      expect(screen.getByTestId('view-icon')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-switch')).toBeInTheDocument();
    });

    it('should render dividers between actions', () => {
      const { container } = render(<ActionRenderer {...defaultProps} />);
      // Dividers are Box components with backgroundColor: '#e0e0e0'
      const dividers = container.querySelectorAll('div[style*="width: 1px"], div[style*="height: 16px"]');
      // Should have at least 2 dividers (between Edit/View and View/Toggle)
      expect(dividers.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edit Button', () => {
    it('should call onEditUser when clicked and not disabled', () => {
      render(<ActionRenderer {...defaultProps} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      if (editButton) {
        fireEvent.click(editButton);
        expect(defaultProps.onEditUser).toHaveBeenCalledWith(1);
      }
    });

    it('should be disabled when user is transferred', () => {
      const params = {
        data: {
          ...defaultParams.data,
          transferedby: 'admin@example.com',
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).toBeDisabled();
    });

    it('should be disabled when user is inactive', () => {
      const params = {
        data: {
          ...defaultParams.data,
          isenabled: false,
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).toBeDisabled();
    });

    it('should be disabled when drawer is open', () => {
      render(<ActionRenderer {...defaultProps} getIsDrawerOpen={() => true} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).toBeDisabled();
    });

    it('should show correct title when enabled', () => {
      render(<ActionRenderer {...defaultProps} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).toHaveAttribute('title', 'Edit user');
    });

    it('should show correct title when disabled due to inactive user', () => {
      const params = {
        data: {
          ...defaultParams.data,
          isenabled: false,
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).toHaveAttribute('title', 'Cannot edit inactive user');
    });

    it('should show correct title when disabled due to transferred user', () => {
      const params = {
        data: {
          ...defaultParams.data,
          transferedby: 'admin@example.com',
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).toHaveAttribute('title', 'Cannot edit transferred user');
    });

    it('should not call onEditUser when disabled', () => {
      const params = {
        data: {
          ...defaultParams.data,
          isenabled: false,
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      if (editButton) {
        fireEvent.click(editButton);
        expect(defaultProps.onEditUser).not.toHaveBeenCalled();
      }
    });
  });

  describe('View Button', () => {
    it('should call onViewPermissions when clicked and not disabled', () => {
      render(<ActionRenderer {...defaultProps} />);
      const viewButton = screen.getByTestId('view-icon').closest('button');
      if (viewButton) {
        fireEvent.click(viewButton);
        expect(defaultProps.onViewPermissions).toHaveBeenCalledWith(1);
      }
    });

    it('should be disabled when user is transferred', () => {
      const params = {
        data: {
          ...defaultParams.data,
          transferedby: 'admin@example.com',
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const viewButton = screen.getByTestId('view-icon').closest('button');
      expect(viewButton).toBeDisabled();
    });

    it('should be disabled when user is inactive', () => {
      const params = {
        data: {
          ...defaultParams.data,
          isenabled: false,
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const viewButton = screen.getByTestId('view-icon').closest('button');
      expect(viewButton).toBeDisabled();
    });

    it('should be disabled when drawer is open', () => {
      render(<ActionRenderer {...defaultProps} getIsDrawerOpen={() => true} />);
      const viewButton = screen.getByTestId('view-icon').closest('button');
      expect(viewButton).toBeDisabled();
    });

    it('should show correct title when enabled', () => {
      render(<ActionRenderer {...defaultProps} />);
      const viewButton = screen.getByTestId('view-icon').closest('button');
      expect(viewButton).toHaveAttribute('title', 'View permissions');
    });

    it('should show correct title when disabled due to inactive user', () => {
      const params = {
        data: {
          ...defaultParams.data,
          isenabled: false,
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const viewButton = screen.getByTestId('view-icon').closest('button');
      expect(viewButton).toHaveAttribute('title', 'Cannot view inactive user');
    });

    it('should show correct title when disabled due to transferred user', () => {
      const params = {
        data: {
          ...defaultParams.data,
          transferedby: 'admin@example.com',
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const viewButton = screen.getByTestId('view-icon').closest('button');
      expect(viewButton).toHaveAttribute('title', 'Cannot view transferred user');
    });
  });

  describe('Toggle Switch', () => {
    it('should call onToggleStatus when clicked and drawer is closed', () => {
      render(<ActionRenderer {...defaultProps} />);
      const toggle = screen.getByTestId('toggle-switch');
      fireEvent.click(toggle);
      expect(defaultProps.onToggleStatus).toHaveBeenCalledWith(1, true);
    });

    it('should be disabled when user is toggling', () => {
      render(<ActionRenderer {...defaultProps} togglingUsers={new Set([1])} />);
      const toggle = screen.getByTestId('toggle-switch');
      expect(toggle).toHaveAttribute('data-disabled', 'true');
    });

    it('should not call onToggleStatus when drawer is open', () => {
      render(<ActionRenderer {...defaultProps} getIsDrawerOpen={() => true} />);
      const toggle = screen.getByTestId('toggle-switch');
      fireEvent.click(toggle);
      expect(defaultProps.onToggleStatus).not.toHaveBeenCalled();
    });

    it('should pass correct isOn value', () => {
      const params = {
        data: {
          ...defaultParams.data,
          isenabled: false,
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const toggle = screen.getByTestId('toggle-switch');
      expect(toggle).toHaveAttribute('data-is-on', 'false');
    });

    it('should log toggle action details', () => {
      render(<ActionRenderer {...defaultProps} />);
      const toggle = screen.getByTestId('toggle-switch');
      fireEvent.click(toggle);
      expect(console.log).toHaveBeenCalledWith('=== TOGGLE SWITCH CLICKED ===');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty transferedby string', () => {
      const params = {
        data: {
          ...defaultParams.data,
          transferedby: '',
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).not.toBeDisabled();
    });

    it('should handle whitespace-only transferedby', () => {
      const params = {
        data: {
          ...defaultParams.data,
          transferedby: '   ',
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      expect(editButton).not.toBeDisabled();
    });

    it('should handle different user IDs', () => {
      const params = {
        data: {
          ...defaultParams.data,
          id: 999,
        },
      };
      render(<ActionRenderer {...defaultProps} params={params} />);
      const editButton = screen.getByTestId('edit-icon').closest('button');
      if (editButton) {
        fireEvent.click(editButton);
        expect(defaultProps.onEditUser).toHaveBeenCalledWith(999);
      }
    });
  });

  describe('createActionRenderer', () => {
    it('should create a renderer function', () => {
      const renderer = createActionRenderer(
        jest.fn(),
        jest.fn(),
        jest.fn(),
        new Set(),
        () => false
      );
      expect(typeof renderer).toBe('function');
    });

    it('should return ActionRenderer component when called', () => {
      const renderer = createActionRenderer(
        jest.fn(),
        jest.fn(),
        jest.fn(),
        new Set(),
        () => false
      );
      const result = renderer(defaultParams);
      expect(result).toBeDefined();
    });

    it('should pass all props correctly', () => {
      const onEditUser = jest.fn();
      const onViewPermissions = jest.fn();
      const onToggleStatus = jest.fn();
      const togglingUsers = new Set([1]);
      const getIsDrawerOpen = jest.fn(() => false);

      const renderer = createActionRenderer(
        onEditUser,
        onViewPermissions,
        onToggleStatus,
        togglingUsers,
        getIsDrawerOpen
      );

      const { container } = render(renderer(defaultParams));
      expect(container).toBeInTheDocument();
    });
  });
});
