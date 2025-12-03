import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DuplicateRolePermissionPanelWrapper from '../../../src/components/roleManagement/DuplicateRolePermissionPanelWrapper';
import '@testing-library/jest-dom';

// Mock DuplicateRolePermissionPanel
jest.mock('../../../src/components/roleManagement/DuplicateRolePermissionPanel', () => {
  return function MockDuplicateRolePermissionPanel({
    isOpen,
    onClose,
    onDuplicate,
    roles,
    fullRoles,
    modules,
    modulesData,
    currentRole,
    onSuccessNotification,
  }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="duplicate-role-panel">
        <button data-testid="panel-close" onClick={onClose}>Close</button>
        <button
          data-testid="panel-duplicate"
          onClick={() => onDuplicate('SourceRole', 'TargetRole', ['module1'], ['perm1'], ['module1'])}
        >
          Duplicate
        </button>
        <div data-testid="roles-count">{roles?.length || 0}</div>
        <div data-testid="full-roles-count">{fullRoles?.length || 0}</div>
        <div data-testid="modules-count">{modules?.length || 0}</div>
        <div data-testid="current-role">{currentRole?.roleName || ''}</div>
      </div>
    );
  };
});

describe('DuplicateRolePermissionPanelWrapper', () => {
  const mockRoles = [
    { id: '1', name: 'Admin', description: 'Administrator' },
    { id: '2', name: 'Manager', description: 'Manager' },
  ];

  const mockFullRoles = [
    { id: 1, rolename: 'Admin' },
    { id: 2, rolename: 'Manager' },
  ];

  const mockModulesList = ['module1', 'module2'];
  const mockModulesData = {
    module1: { submodules: { sub1: ['perm1'] } },
    module2: { submodules: { sub2: ['perm2'] } },
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onDuplicate: jest.fn(),
    duplicatePanelRoles: mockRoles,
    fullRoles: mockFullRoles,
    modulesList: mockModulesList,
    modulesData: mockModulesData,
    currentRole: { roleName: 'New Role' },
    onSuccessNotification: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render DuplicateRolePermissionPanel', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} />);
      expect(screen.getByTestId('duplicate-role-panel')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('duplicate-role-panel')).not.toBeInTheDocument();
    });

    it('should pass roles to panel', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} />);
      expect(screen.getByTestId('roles-count')).toHaveTextContent('2');
    });

    it('should pass fullRoles to panel', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} />);
      expect(screen.getByTestId('full-roles-count')).toHaveTextContent('2');
    });

    it('should pass modules to panel', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} />);
      expect(screen.getByTestId('modules-count')).toHaveTextContent('2');
    });

    it('should pass currentRole to panel', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} />);
      expect(screen.getByTestId('current-role')).toHaveTextContent('New Role');
    });
  });

  describe('onDuplicate Handler', () => {
    it('should call onDuplicate with correct parameters', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} />);
      
      const duplicateButton = screen.getByTestId('panel-duplicate');
      fireEvent.click(duplicateButton);
      
      expect(defaultProps.onDuplicate).toHaveBeenCalledWith(
        ['perm1'],
        ['module1']
      );
    });

    it('should call onClose after duplicate', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} />);
      
      const duplicateButton = screen.getByTestId('panel-duplicate');
      fireEvent.click(duplicateButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should ignore sourceRole, targetRole, and selectedModules parameters', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} />);
      
      const duplicateButton = screen.getByTestId('panel-duplicate');
      fireEvent.click(duplicateButton);
      
      // Should only pass duplicatedPermissions and enabledModules
      expect(defaultProps.onDuplicate).toHaveBeenCalledTimes(1);
      expect(defaultProps.onDuplicate).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Array)
      );
    });
  });

  describe('onClose Handler', () => {
    it('should call onClose when panel close button is clicked', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} />);
      
      const closeButton = screen.getByTestId('panel-close');
      fireEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty roles array', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} duplicatePanelRoles={[]} />);
      expect(screen.getByTestId('roles-count')).toHaveTextContent('0');
    });

    it('should handle empty fullRoles array', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} fullRoles={[]} />);
      expect(screen.getByTestId('full-roles-count')).toHaveTextContent('0');
    });

    it('should handle empty modulesList', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} modulesList={[]} />);
      expect(screen.getByTestId('modules-count')).toHaveTextContent('0');
    });

    it('should handle undefined currentRole', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} currentRole={undefined} />);
      expect(screen.getByTestId('current-role')).toHaveTextContent('');
    });

    it('should handle null modulesData', () => {
      render(<DuplicateRolePermissionPanelWrapper {...defaultProps} modulesData={null} />);
      expect(screen.getByTestId('duplicate-role-panel')).toBeInTheDocument();
    });
  });
});


