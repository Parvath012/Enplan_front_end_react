import { renderHook } from '@testing-library/react';
import { useDuplicateRolePermissionPanel } from '../../src/hooks/useDuplicateRolePermissionPanel';

describe('useDuplicateRolePermissionPanel', () => {
  const mockRoles = [
    {
      id: 1,
      rolename: 'Admin',
      roledescription: 'Administrator role',
    },
    {
      id: 2,
      rolename: 'Manager',
      roledescription: 'Manager role',
    },
    {
      id: 3,
      rolename: '',
      roledescription: 'Empty name role',
    },
  ];

  const mockModulesData = {
    module1: {
      submodules: {
        sub1: ['perm1', 'perm2'],
      },
    },
    module2: {
      submodules: {
        sub2: ['perm3'],
      },
    },
  };

  const mockFormData = {
    roleName: 'New Role',
    department: 'IT',
    roleDescription: 'New role description',
    status: 'Active' as const,
    parentAttribute: [],
  };

  const defaultProps = {
    formData: mockFormData,
    roles: mockRoles,
    modulesData: mockModulesData,
    isDuplicatePanelOpen: false,
    setIsDuplicatePanelOpen: jest.fn(),
    handleDuplicatePermissions: jest.fn(),
    setNotification: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('duplicatePanelRoles', () => {
    it('should filter and map roles correctly', () => {
      const { result } = renderHook(() => useDuplicateRolePermissionPanel(defaultProps));
      
      expect(result.current.duplicatePanelRoles).toHaveLength(2);
      expect(result.current.duplicatePanelRoles[0]).toEqual({
        id: '1',
        name: 'Admin',
        description: 'Administrator role',
      });
      expect(result.current.duplicatePanelRoles[1]).toEqual({
        id: '2',
        name: 'Manager',
        description: 'Manager role',
      });
    });

    it('should exclude roles with empty rolename', () => {
      const { result } = renderHook(() => useDuplicateRolePermissionPanel(defaultProps));
      
      const roleNames = result.current.duplicatePanelRoles.map(r => r.name);
      expect(roleNames).not.toContain('');
    });

    it('should handle roles with missing rolename', () => {
      const roles = [
        { id: 1, rolename: undefined },
        { id: 2, rolename: null },
      ];
      
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, roles })
      );
      
      expect(result.current.duplicatePanelRoles).toHaveLength(0);
    });

    it('should use default values for missing fields', () => {
      const roles = [
        { id: 1, rolename: 'Admin' },
      ];
      
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, roles })
      );
      
      expect(result.current.duplicatePanelRoles[0]).toEqual({
        id: '1',
        name: 'Admin',
        description: '',
      });
    });

    it('should handle roles with string IDs', () => {
      const roles = [
        { id: '1', rolename: 'Admin' },
      ];
      
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, roles })
      );
      
      expect(result.current.duplicatePanelRoles[0].id).toBe('1');
    });

    it('should handle roles with null IDs', () => {
      const roles = [
        { id: null, rolename: 'Admin' },
      ];
      
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, roles })
      );
      
      expect(result.current.duplicatePanelRoles[0].id).toBe('0');
    });
  });

  describe('modulesList', () => {
    it('should extract module keys from modulesData', () => {
      const { result } = renderHook(() => useDuplicateRolePermissionPanel(defaultProps));
      
      expect(result.current.modulesList).toEqual(['module1', 'module2']);
    });

    it('should return empty array when modulesData is null', () => {
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, modulesData: null })
      );
      
      expect(result.current.modulesList).toEqual([]);
    });

    it('should return empty array when modulesData is undefined', () => {
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, modulesData: undefined })
      );
      
      expect(result.current.modulesList).toEqual([]);
    });

    it('should return empty array when modulesData is empty object', () => {
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, modulesData: {} })
      );
      
      expect(result.current.modulesList).toEqual([]);
    });
  });

  describe('currentRole', () => {
    it('should use roleName from formData', () => {
      const { result } = renderHook(() => useDuplicateRolePermissionPanel(defaultProps));
      
      expect(result.current.currentRole).toEqual({
        roleName: 'New Role',
      });
    });

    it('should handle empty roleName', () => {
      const formData = { ...mockFormData, roleName: '' };
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, formData })
      );
      
      expect(result.current.currentRole).toEqual({
        roleName: '',
      });
    });

    it('should update when roleName changes', () => {
      const { result, rerender } = renderHook(
        (props) => useDuplicateRolePermissionPanel(props),
        { initialProps: defaultProps }
      );
      
      expect(result.current.currentRole.roleName).toBe('New Role');
      
      const newFormData = { ...mockFormData, roleName: 'Updated Role' };
      rerender({ ...defaultProps, formData: newFormData });
      
      expect(result.current.currentRole.roleName).toBe('Updated Role');
    });
  });

  describe('isOpen', () => {
    it('should return isDuplicatePanelOpen value', () => {
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, isDuplicatePanelOpen: true })
      );
      
      expect(result.current.isOpen).toBe(true);
    });

    it('should update when isDuplicatePanelOpen changes', () => {
      const { result, rerender } = renderHook(
        (props) => useDuplicateRolePermissionPanel(props),
        { initialProps: defaultProps }
      );
      
      expect(result.current.isOpen).toBe(false);
      
      rerender({ ...defaultProps, isDuplicatePanelOpen: true });
      
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('onClose', () => {
    it('should call setIsDuplicatePanelOpen with false', () => {
      const setIsDuplicatePanelOpen = jest.fn();
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, setIsDuplicatePanelOpen })
      );
      
      result.current.onClose();
      
      expect(setIsDuplicatePanelOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('onDuplicate', () => {
    it('should call handleDuplicatePermissions with correct parameters', () => {
      const handleDuplicatePermissions = jest.fn();
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, handleDuplicatePermissions })
      );
      
      const duplicatedPermissions = ['perm1', 'perm2'];
      const enabledModules = ['module1'];
      
      result.current.onDuplicate(duplicatedPermissions, enabledModules);
      
      expect(handleDuplicatePermissions).toHaveBeenCalledWith(duplicatedPermissions, enabledModules);
    });

    it('should handle undefined enabledModules', () => {
      const handleDuplicatePermissions = jest.fn();
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, handleDuplicatePermissions })
      );
      
      const duplicatedPermissions = ['perm1'];
      
      result.current.onDuplicate(duplicatedPermissions);
      
      expect(handleDuplicatePermissions).toHaveBeenCalledWith(duplicatedPermissions, undefined);
    });
  });

  describe('onSuccessNotification', () => {
    it('should call setNotification with message', () => {
      const setNotification = jest.fn();
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, setNotification })
      );
      
      const message = 'Success message';
      result.current.onSuccessNotification(message);
      
      expect(setNotification).toHaveBeenCalledWith(message);
    });
  });

  describe('fullRoles', () => {
    it('should return roles as-is', () => {
      const { result } = renderHook(() => useDuplicateRolePermissionPanel(defaultProps));
      
      expect(result.current.fullRoles).toBe(mockRoles);
    });
  });

  describe('modulesData', () => {
    it('should return modulesData as-is', () => {
      const { result } = renderHook(() => useDuplicateRolePermissionPanel(defaultProps));
      
      expect(result.current.modulesData).toBe(mockModulesData);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty roles array', () => {
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, roles: [] })
      );
      
      expect(result.current.duplicatePanelRoles).toHaveLength(0);
      expect(result.current.fullRoles).toEqual([]);
    });

    it('should handle roles with whitespace-only names', () => {
      const roles = [
        { id: 1, rolename: '   ' },
      ];
      
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, roles })
      );
      
      expect(result.current.duplicatePanelRoles).toHaveLength(0);
    });

    it('should handle formData with undefined roleName', () => {
      const formData = { ...mockFormData, roleName: undefined as any };
      const { result } = renderHook(() => 
        useDuplicateRolePermissionPanel({ ...defaultProps, formData })
      );
      
      expect(result.current.currentRole.roleName).toBeUndefined();
    });
  });
});


