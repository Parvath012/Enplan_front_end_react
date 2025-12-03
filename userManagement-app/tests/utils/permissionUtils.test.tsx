import { renderHook, act } from '@testing-library/react';
import {
  usePermissionState,
  setsEqual,
  checkPermissionChanges,
  resetPermissionState,
} from '../../src/utils/permissionUtils';

describe('permissionUtils', () => {
  describe('usePermissionState', () => {
    it('should initialize with empty sets', () => {
      const { result } = renderHook(() => usePermissionState());
      
      expect(result.current.enabledModules.size).toBe(0);
      expect(result.current.selectedPermissions.size).toBe(0);
      expect(result.current.activeModule).toBeNull();
      expect(result.current.activeSubmodule).toBeNull();
      expect(result.current.initialPermissionState).toBeNull();
      expect(result.current.hasPermissionChanges).toBe(false);
    });

    it('should allow setting enabledModules', () => {
      const { result } = renderHook(() => usePermissionState());
      
      act(() => {
        result.current.setEnabledModules(new Set(['module1', 'module2']));
      });
      
      expect(result.current.enabledModules.size).toBe(2);
      expect(result.current.enabledModules.has('module1')).toBe(true);
      expect(result.current.enabledModules.has('module2')).toBe(true);
    });

    it('should allow setting selectedPermissions', () => {
      const { result } = renderHook(() => usePermissionState());
      
      act(() => {
        result.current.setSelectedPermissions(new Set(['perm1', 'perm2']));
      });
      
      expect(result.current.selectedPermissions.size).toBe(2);
      expect(result.current.selectedPermissions.has('perm1')).toBe(true);
      expect(result.current.selectedPermissions.has('perm2')).toBe(true);
    });

    it('should allow setting activeModule', () => {
      const { result } = renderHook(() => usePermissionState());
      
      act(() => {
        result.current.setActiveModule('module1');
      });
      
      expect(result.current.activeModule).toBe('module1');
    });

    it('should allow setting activeSubmodule', () => {
      const { result } = renderHook(() => usePermissionState());
      
      act(() => {
        result.current.setActiveSubmodule('sub1');
      });
      
      expect(result.current.activeSubmodule).toBe('sub1');
    });

    it('should allow setting initialPermissionState', () => {
      const { result } = renderHook(() => usePermissionState());
      const initialState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      
      act(() => {
        result.current.setInitialPermissionState(initialState);
      });
      
      expect(result.current.initialPermissionState).toEqual(initialState);
    });

    it('should allow setting hasPermissionChanges', () => {
      const { result } = renderHook(() => usePermissionState());
      
      act(() => {
        result.current.setHasPermissionChanges(true);
      });
      
      expect(result.current.hasPermissionChanges).toBe(true);
    });
  });

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

    it('should return false when one set is empty and other is not', () => {
      const set1 = new Set();
      const set2 = new Set(['a']);
      
      expect(setsEqual(set1, set2)).toBe(false);
    });

    it('should handle sets with same elements in different order', () => {
      const set1 = new Set(['a', 'b', 'c']);
      const set2 = new Set(['c', 'a', 'b']);
      
      expect(setsEqual(set1, set2)).toBe(true);
    });
  });

  describe('checkPermissionChanges', () => {
    it('should return false when states are equal', () => {
      const currentState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      const initialState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      
      expect(checkPermissionChanges(currentState, initialState)).toBe(false);
    });

    it('should return true when enabledModules differ', () => {
      const currentState = {
        enabledModules: new Set(['module1', 'module2']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      const initialState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      
      expect(checkPermissionChanges(currentState, initialState)).toBe(true);
    });

    it('should return true when selectedPermissions differ', () => {
      const currentState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1', 'perm2']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      const initialState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      
      expect(checkPermissionChanges(currentState, initialState)).toBe(true);
    });

    it('should return true when both differ', () => {
      const currentState = {
        enabledModules: new Set(['module1', 'module2']),
        selectedPermissions: new Set(['perm1', 'perm2']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      const initialState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      
      expect(checkPermissionChanges(currentState, initialState)).toBe(true);
    });
  });

  describe('resetPermissionState', () => {
    it('should reset state to initial values', () => {
      const setEnabledModules = jest.fn();
      const setSelectedPermissions = jest.fn();
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const setHasPermissionChanges = jest.fn();
      
      const initialPermissionState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      
      resetPermissionState({
        initialPermissionState,
        setEnabledModules,
        setSelectedPermissions,
        setActiveModule,
        setActiveSubmodule,
        setHasPermissionChanges,
      });
      
      expect(setEnabledModules).toHaveBeenCalledWith(new Set(['module1']));
      expect(setSelectedPermissions).toHaveBeenCalledWith(new Set(['perm1']));
      expect(setActiveModule).toHaveBeenCalledWith('module1');
      expect(setActiveSubmodule).toHaveBeenCalledWith('sub1');
      expect(setHasPermissionChanges).toHaveBeenCalledWith(false);
    });

    it('should return early when initialPermissionState is null', () => {
      const setEnabledModules = jest.fn();
      const setSelectedPermissions = jest.fn();
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const setHasPermissionChanges = jest.fn();
      
      resetPermissionState({
        initialPermissionState: null,
        setEnabledModules,
        setSelectedPermissions,
        setActiveModule,
        setActiveSubmodule,
        setHasPermissionChanges,
      });
      
      expect(setEnabledModules).not.toHaveBeenCalled();
      expect(setSelectedPermissions).not.toHaveBeenCalled();
      expect(setActiveModule).not.toHaveBeenCalled();
      expect(setActiveSubmodule).not.toHaveBeenCalled();
      expect(setHasPermissionChanges).not.toHaveBeenCalled();
    });

    it('should clear pending update timeout', () => {
      const setEnabledModules = jest.fn();
      const setSelectedPermissions = jest.fn();
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const setHasPermissionChanges = jest.fn();
      const clearTimeout = jest.fn();
      const pendingUpdateTimeoutRef = {
        current: setTimeout(() => {}, 1000),
      };
      
      global.clearTimeout = clearTimeout;
      
      const initialPermissionState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      
      resetPermissionState({
        initialPermissionState,
        setEnabledModules,
        setSelectedPermissions,
        setActiveModule,
        setActiveSubmodule,
        setHasPermissionChanges,
        pendingUpdateTimeoutRef,
      });
      
      expect(clearTimeout).toHaveBeenCalled();
      expect(pendingUpdateTimeoutRef.current).toBeNull();
    });

    it('should clear updating flag', () => {
      const setEnabledModules = jest.fn();
      const setSelectedPermissions = jest.fn();
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const setHasPermissionChanges = jest.fn();
      const isUpdatingRef = { current: true };
      
      const initialPermissionState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      
      resetPermissionState({
        initialPermissionState,
        setEnabledModules,
        setSelectedPermissions,
        setActiveModule,
        setActiveSubmodule,
        setHasPermissionChanges,
        isUpdatingRef,
      });
      
      expect(isUpdatingRef.current).toBe(false);
    });

    it('should call onInputChange when provided', () => {
      const setEnabledModules = jest.fn();
      const setSelectedPermissions = jest.fn();
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const setHasPermissionChanges = jest.fn();
      const onInputChange = jest.fn();
      
      const initialPermissionState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      
      resetPermissionState({
        initialPermissionState,
        setEnabledModules,
        setSelectedPermissions,
        setActiveModule,
        setActiveSubmodule,
        setHasPermissionChanges,
        onInputChange,
      });
      
      expect(onInputChange).toHaveBeenCalledWith('permissions', {
        enabledModules: ['module1'],
        selectedPermissions: ['perm1'],
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      });
    });

    it('should not call onInputChange when not provided', () => {
      const setEnabledModules = jest.fn();
      const setSelectedPermissions = jest.fn();
      const setActiveModule = jest.fn();
      const setActiveSubmodule = jest.fn();
      const setHasPermissionChanges = jest.fn();
      const onInputChange = undefined;
      
      const initialPermissionState = {
        enabledModules: new Set(['module1']),
        selectedPermissions: new Set(['perm1']),
        activeModule: 'module1',
        activeSubmodule: 'sub1',
      };
      
      resetPermissionState({
        initialPermissionState,
        setEnabledModules,
        setSelectedPermissions,
        setActiveModule,
        setActiveSubmodule,
        setHasPermissionChanges,
        onInputChange,
      });
      
      // Should not throw error
      expect(setEnabledModules).toHaveBeenCalled();
    });
  });
});


