/**
 * Comprehensive tests for permissionTableUtils
 */
import {
  setsEqual,
  getCurrentPermissions,
  isAllPermissionsSelected,
  buildPermissionData,
  togglePermissionInSet,
  toggleAllPermissionsForSubmodule,
  removeModulePermissions,
  buildGridRowData,
  toggleModuleEnabledState,
  calculateNewActiveModuleState,
  createModuleClickHandler,
  createSubmoduleClickHandler,
  createModuleToggleHandler,
  createSelectAllPermissionsHandler,
  createPermissionToggleHandler,
  ModuleToggleHandlerOptions,
  SelectAllPermissionsHandlerOptions
} from '../../src/components/shared/permissionTableUtils';

describe('permissionTableUtils', () => {
  describe('setsEqual', () => {
    it('should return true for equal sets', () => {
      const set1 = new Set(['a', 'b', 'c']);
      const set2 = new Set(['a', 'b', 'c']);
      expect(setsEqual(set1, set2)).toBe(true);
    });

    it('should return false for sets with different sizes', () => {
      const set1 = new Set(['a', 'b']);
      const set2 = new Set(['a', 'b', 'c']);
      expect(setsEqual(set1, set2)).toBe(false);
    });

    it('should return false for sets with different elements', () => {
      const set1 = new Set(['a', 'b']);
      const set2 = new Set(['a', 'c']);
      expect(setsEqual(set1, set2)).toBe(false);
    });

    it('should return true for empty sets', () => {
      const set1 = new Set();
      const set2 = new Set();
      expect(setsEqual(set1, set2)).toBe(true);
    });
  });

  describe('getCurrentPermissions', () => {
    it('should return permissions for a specific submodule', () => {
      const selectedPermissions = new Set(['module1-sub1-perm1', 'module1-sub1-perm2', 'module2-sub1-perm1']);
      const result = getCurrentPermissions(selectedPermissions, 'module1-sub1');
      expect(result).toEqual(['module1-sub1-perm1', 'module1-sub1-perm2']);
    });

    it('should return empty array when no permissions match', () => {
      const selectedPermissions = new Set(['module1-sub1-perm1']);
      const result = getCurrentPermissions(selectedPermissions, 'module2-sub1');
      expect(result).toEqual([]);
    });

    it('should return empty array for empty set', () => {
      const selectedPermissions = new Set();
      const result = getCurrentPermissions(selectedPermissions, 'module1-sub1');
      expect(result).toEqual([]);
    });
  });

  describe('isAllPermissionsSelected', () => {
    it('should return true when all permissions are selected', () => {
      const currentPermissions = ['perm1', 'perm2', 'perm3'];
      const allPermissions = ['perm1', 'perm2', 'perm3'];
      expect(isAllPermissionsSelected(currentPermissions, allPermissions)).toBe(true);
    });

    it('should return false when not all permissions are selected', () => {
      const currentPermissions = ['perm1', 'perm2'];
      const allPermissions = ['perm1', 'perm2', 'perm3'];
      expect(isAllPermissionsSelected(currentPermissions, allPermissions)).toBe(false);
    });

    it('should return false when no permissions are selected', () => {
      const currentPermissions: string[] = [];
      const allPermissions = ['perm1', 'perm2'];
      expect(isAllPermissionsSelected(currentPermissions, allPermissions)).toBe(false);
    });

    it('should return false when allPermissions is empty', () => {
      const currentPermissions: string[] = [];
      const allPermissions: string[] = [];
      expect(isAllPermissionsSelected(currentPermissions, allPermissions)).toBe(false);
    });
  });

  describe('buildPermissionData', () => {
    it('should build permission data object correctly', () => {
      const enabledModules = new Set(['module1', 'module2']);
      const selectedPermissions = new Set(['perm1', 'perm2']);
      const result = buildPermissionData(enabledModules, selectedPermissions, 'module1', 'sub1');
      
      expect(result).toEqual({
        enabledModules: ['module1', 'module2'],
        selectedPermissions: ['perm1', 'perm2'],
        activeModule: 'module1',
        activeSubmodule: 'sub1'
      });
    });

    it('should handle null values', () => {
      const enabledModules = new Set(['module1']);
      const selectedPermissions = new Set(['perm1']);
      const result = buildPermissionData(enabledModules, selectedPermissions, null, null);
      
      expect(result).toEqual({
        enabledModules: ['module1'],
        selectedPermissions: ['perm1'],
        activeModule: null,
        activeSubmodule: null
      });
    });
  });

  describe('togglePermissionInSet', () => {
    it('should add permission when not present', () => {
      const selectedPermissions = new Set(['perm1']);
      const result = togglePermissionInSet(selectedPermissions, 'perm2', new Set(), null, null);
      
      expect(result.has('perm2')).toBe(true);
      expect(result.has('perm1')).toBe(true);
    });

    it('should remove permission when present', () => {
      const selectedPermissions = new Set(['perm1', 'perm2']);
      const result = togglePermissionInSet(selectedPermissions, 'perm1', new Set(), null, null);
      
      expect(result.has('perm1')).toBe(false);
      expect(result.has('perm2')).toBe(true);
    });

    it('should call onInputChange when provided', () => {
      const onInputChange = jest.fn();
      const enabledModules = new Set(['module1']);
      const selectedPermissions = new Set(['perm1']);
      
      togglePermissionInSet(selectedPermissions, 'perm2', enabledModules, 'module1', 'sub1', onInputChange);
      
      expect(onInputChange).toHaveBeenCalledWith('permissions', expect.objectContaining({
        enabledModules: ['module1'],
        selectedPermissions: expect.arrayContaining(['perm1', 'perm2'])
      }));
    });

    it('should not call onInputChange when not provided', () => {
      const selectedPermissions = new Set(['perm1']);
      const result = togglePermissionInSet(selectedPermissions, 'perm2', new Set(), null, null);
      
      expect(result.has('perm2')).toBe(true);
    });
  });

  describe('toggleAllPermissionsForSubmodule', () => {
    it('should select all permissions when not all are selected', () => {
      const selectedPermissions = new Set(['module1-sub1-perm1']);
      const allPermissions = ['perm1', 'perm2', 'perm3'];
      const result = toggleAllPermissionsForSubmodule(
        selectedPermissions,
        'module1-sub1',
        allPermissions,
        new Set(),
        null,
        null
      );
      
      expect(result.has('module1-sub1-perm1')).toBe(true);
      expect(result.has('module1-sub1-perm2')).toBe(true);
      expect(result.has('module1-sub1-perm3')).toBe(true);
    });

    it('should deselect all permissions when all are selected', () => {
      const selectedPermissions = new Set(['module1-sub1-perm1', 'module1-sub1-perm2', 'module1-sub1-perm3']);
      const allPermissions = ['perm1', 'perm2', 'perm3'];
      const result = toggleAllPermissionsForSubmodule(
        selectedPermissions,
        'module1-sub1',
        allPermissions,
        new Set(),
        null,
        null
      );
      
      expect(result.has('module1-sub1-perm1')).toBe(false);
      expect(result.has('module1-sub1-perm2')).toBe(false);
      expect(result.has('module1-sub1-perm3')).toBe(false);
    });

    it('should call onInputChange when provided', () => {
      const onInputChange = jest.fn();
      const selectedPermissions = new Set(['module1-sub1-perm1']);
      const allPermissions = ['perm1', 'perm2'];
      
      toggleAllPermissionsForSubmodule(
        selectedPermissions,
        'module1-sub1',
        allPermissions,
        new Set(['module1']),
        'module1',
        'sub1',
        onInputChange
      );
      
      expect(onInputChange).toHaveBeenCalled();
    });
  });

  describe('removeModulePermissions', () => {
    it('should remove all permissions for a module', () => {
      const currentPerms = new Set([
        'module1-sub1-perm1',
        'module1-sub1-perm2',
        'module2-sub1-perm1'
      ]);
      const modulesData = {
        module1: {
          submodules: {
            sub1: ['perm1', 'perm2']
          }
        }
      };
      
      const result = removeModulePermissions('module1', currentPerms, modulesData);
      
      expect(result.has('module1-sub1-perm1')).toBe(false);
      expect(result.has('module1-sub1-perm2')).toBe(false);
      expect(result.has('module2-sub1-perm1')).toBe(true);
    });

    it('should return unchanged set when module not found', () => {
      const currentPerms = new Set(['module1-sub1-perm1']);
      const modulesData = {};
      
      const result = removeModulePermissions('module2', currentPerms, modulesData);
      
      expect(result).toEqual(currentPerms);
    });

    it('should return unchanged set when moduleData has no submodules', () => {
      const currentPerms = new Set(['module1-sub1-perm1']);
      const modulesData = {
        module1: {}
      };
      
      const result = removeModulePermissions('module1', currentPerms, modulesData);
      
      expect(result).toEqual(currentPerms);
    });
  });

  describe('buildGridRowData', () => {
    it('should build grid row data from modules data', () => {
      const modulesData = {
        module1: { name: 'Module 1', submodules: {} },
        module2: { name: 'Module 2', submodules: {} }
      };
      const enabledModules = new Set(['module1']);
      
      const result = buildGridRowData(modulesData, enabledModules);
      
      expect(result).toHaveLength(2);
      expect(result[0].module).toBe('module1');
      expect(result[0].isModuleEnabled).toBe(true);
      expect(result[1].module).toBe('module2');
      expect(result[1].isModuleEnabled).toBe(false);
    });

    it('should return empty array when modulesData is empty', () => {
      const result = buildGridRowData({}, new Set());
      expect(result).toEqual([]);
    });

    it('should return empty array when modulesData is null', () => {
      const result = buildGridRowData(null as any, new Set());
      expect(result).toEqual([]);
    });
  });

  describe('toggleModuleEnabledState', () => {
    it('should enable module when disabled', () => {
      const enabledModules = new Set(['module1']);
      const result = toggleModuleEnabledState(enabledModules, 'module2');
      
      expect(result.newSet.has('module2')).toBe(true);
      expect(result.isCurrentlyEnabled).toBe(false);
      expect(result.shouldRemovePermissions).toBe(false);
    });

    it('should disable module when enabled', () => {
      const enabledModules = new Set(['module1', 'module2']);
      const result = toggleModuleEnabledState(enabledModules, 'module2');
      
      expect(result.newSet.has('module2')).toBe(false);
      expect(result.isCurrentlyEnabled).toBe(true);
      expect(result.shouldRemovePermissions).toBe(true);
    });
  });

  describe('calculateNewActiveModuleState', () => {
    it('should return null when active module is being disabled', () => {
      const result = calculateNewActiveModuleState('module1', 'module1', false);
      expect(result).toBe(null);
    });

    it('should return current active module when different module is disabled', () => {
      const result = calculateNewActiveModuleState('module1', 'module2', false);
      expect(result).toBe('module1');
    });

    it('should return current active module when module is enabled', () => {
      const result = calculateNewActiveModuleState('module1', 'module2', true);
      expect(result).toBe('module1');
    });
  });

  describe('createModuleClickHandler', () => {
    it('should set active module and clear submodule', () => {
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const handler = createModuleClickHandler(false, new Set(), setActiveModule, setActiveSubmodule);
      
      handler('module1');
      
      expect(setActiveModule).toHaveBeenCalledWith('module1');
      expect(setActiveSubmodule).toHaveBeenCalledWith(null);
    });

    it('should not set active module when read-only', () => {
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const handler = createModuleClickHandler(true, new Set(), setActiveModule, setActiveSubmodule);
      
      handler('module1');
      
      expect(setActiveModule).not.toHaveBeenCalled();
    });

    it('should not set active module when checkEnabled is true and module not enabled', () => {
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const handler = createModuleClickHandler(false, new Set(), setActiveModule, setActiveSubmodule, true);
      
      handler('module1');
      
      expect(setActiveModule).not.toHaveBeenCalled();
    });
  });

  describe('createSubmoduleClickHandler', () => {
    it('should set active module and submodule', () => {
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const handler = createSubmoduleClickHandler(false, new Set(), setActiveModule, setActiveSubmodule);
      
      handler('module1', 'sub1');
      
      expect(setActiveModule).toHaveBeenCalledWith('module1');
      expect(setActiveSubmodule).toHaveBeenCalledWith('module1-sub1');
    });

    it('should not set when read-only', () => {
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const handler = createSubmoduleClickHandler(true, new Set(), setActiveModule, setActiveSubmodule);
      
      handler('module1', 'sub1');
      
      expect(setActiveModule).not.toHaveBeenCalled();
    });
  });

  describe('createModuleToggleHandler', () => {
    it('should enable module and call onInputChange', () => {
      const setEnabledModules = jest.fn((updater) => {
        const newSet = updater(new Set());
        expect(newSet.has('module1')).toBe(true);
      });
      const setSelectedPermissions = jest.fn();
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const onInputChange = jest.fn();
      
      const options: ModuleToggleHandlerOptions = {
        isReadOnly: false,
        enabledModules: new Set(),
        selectedPermissions: new Set(),
        activeModule: null,
        activeSubmodule: null,
        modulesData: {},
        setEnabledModules,
        setSelectedPermissions,
        setActiveModule,
        setActiveSubmodule,
        onInputChange
      };
      
      const handler = createModuleToggleHandler(options);
      handler('module1');
      
      expect(setEnabledModules).toHaveBeenCalled();
      expect(onInputChange).toHaveBeenCalled();
    });

    it('should disable module and remove permissions', () => {
      const setEnabledModules = jest.fn((updater) => {
        const newSet = updater(new Set(['module1']));
        expect(newSet.has('module1')).toBe(false);
      });
      const setSelectedPermissions = jest.fn();
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      
      const options: ModuleToggleHandlerOptions = {
        isReadOnly: false,
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['module1-sub1-perm1']),
        activeModule: 'module1',
        activeSubmodule: null,
        modulesData: {
          module1: {
            submodules: {
              sub1: ['perm1']
            }
          }
        },
        setEnabledModules,
        setSelectedPermissions,
        setActiveModule,
        setActiveSubmodule
      };
      
      const handler = createModuleToggleHandler(options);
      handler('module1');
      
      expect(setSelectedPermissions).toHaveBeenCalled();
      expect(setActiveModule).toHaveBeenCalledWith(null);
      expect(setActiveSubmodule).toHaveBeenCalledWith(null);
    });

    it('should use advanced logic when useAdvancedLogic is true', (done) => {
      const setEnabledModules = jest.fn((updater) => {
        updater(new Set());
      });
      const onInputChange = jest.fn(() => {
        expect(onInputChange).toHaveBeenCalled();
        done();
      });
      
      const options: ModuleToggleHandlerOptions = {
        isReadOnly: false,
        enabledModules: new Set(),
        selectedPermissions: new Set(),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
        modulesData: {},
        setEnabledModules,
        setSelectedPermissions: jest.fn(),
        setActiveModule: jest.fn(),
        setActiveSubmodule: jest.fn(),
        onInputChange,
        useAdvancedLogic: true
      };
      
      const handler = createModuleToggleHandler(options);
      handler('module1');
      
      jest.advanceTimersByTime(100);
    });

    it('should not do anything when read-only', () => {
      const setEnabledModules = jest.fn();
      const options: ModuleToggleHandlerOptions = {
        isReadOnly: true,
        enabledModules: new Set(),
        selectedPermissions: new Set(),
        activeModule: null,
        activeSubmodule: null,
        modulesData: {},
        setEnabledModules,
        setSelectedPermissions: jest.fn(),
        setActiveModule: jest.fn(),
        setActiveSubmodule: jest.fn()
      };
      
      const handler = createModuleToggleHandler(options);
      handler('module1');
      
      expect(setEnabledModules).not.toHaveBeenCalled();
    });
  });

  describe('createSelectAllPermissionsHandler', () => {
    it('should toggle all permissions for submodule', () => {
      const setSelectedPermissions = jest.fn((updater) => {
        const newSet = updater(new Set());
        expect(newSet.has('module1-sub1-perm1')).toBe(true);
      });
      
      const options: SelectAllPermissionsHandlerOptions = {
        isReadOnly: false,
        modulesData: {
          module1: {
            submodules: {
              sub1: ['perm1', 'perm2']
            }
          }
        },
        enabledModules: new Set(['module1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
        setSelectedPermissions,
        onInputChange: jest.fn()
      };
      
      const handler = createSelectAllPermissionsHandler(options);
      handler('module1', 'sub1');
      
      expect(setSelectedPermissions).toHaveBeenCalled();
    });

    it('should use strict check when useStrictCheck is true', () => {
      const setSelectedPermissions = jest.fn();
      
      const options: SelectAllPermissionsHandlerOptions = {
        isReadOnly: false,
        modulesData: {
          module1: {
            submodules: {
              sub1: ['perm1']
            }
          }
        },
        enabledModules: new Set(),
        activeModule: null,
        activeSubmodule: null,
        setSelectedPermissions,
        useStrictCheck: true
      };
      
      const handler = createSelectAllPermissionsHandler(options);
      handler('module1', 'sub1');
      
      expect(setSelectedPermissions).toHaveBeenCalled();
    });

    it('should return early when submodule not found in strict check', () => {
      const setSelectedPermissions = jest.fn();
      
      const options: SelectAllPermissionsHandlerOptions = {
        isReadOnly: false,
        modulesData: {
          module1: {
            submodules: {}
          }
        },
        enabledModules: new Set(),
        activeModule: null,
        activeSubmodule: null,
        setSelectedPermissions,
        useStrictCheck: true
      };
      
      const handler = createSelectAllPermissionsHandler(options);
      handler('module1', 'sub1');
      
      expect(setSelectedPermissions).not.toHaveBeenCalled();
    });

    it('should not do anything when read-only', () => {
      const setSelectedPermissions = jest.fn();
      
      const options: SelectAllPermissionsHandlerOptions = {
        isReadOnly: true,
        modulesData: {},
        enabledModules: new Set(),
        activeModule: null,
        activeSubmodule: null,
        setSelectedPermissions
      };
      
      const handler = createSelectAllPermissionsHandler(options);
      handler('module1', 'sub1');
      
      expect(setSelectedPermissions).not.toHaveBeenCalled();
    });
  });

  describe('createPermissionToggleHandler', () => {
    it('should toggle permission', () => {
      const setSelectedPermissions = jest.fn((updater) => {
        const newSet = updater(new Set());
        expect(newSet.has('module1-sub1-perm1')).toBe(true);
      });
      
      const handler = createPermissionToggleHandler(
        false,
        new Set(['module1']),
        'module1',
        'sub1',
        setSelectedPermissions,
        jest.fn()
      );
      
      handler('module1', 'sub1', 'perm1');
      
      expect(setSelectedPermissions).toHaveBeenCalled();
    });

    it('should not toggle when read-only', () => {
      const setSelectedPermissions = jest.fn();
      
      const handler = createPermissionToggleHandler(
        true,
        new Set(),
        null,
        null,
        setSelectedPermissions
      );
      
      handler('module1', 'sub1', 'perm1');
      
      expect(setSelectedPermissions).not.toHaveBeenCalled();
    });
  });
});

