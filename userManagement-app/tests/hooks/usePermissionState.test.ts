/**
 * Comprehensive tests for usePermissionState hook - 90% coverage target
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePermissionState } from '../../src/hooks/usePermissionState';

// Mock permissionTableUtils
jest.mock('../../src/components/shared/permissionTableUtils', () => ({
  setsEqual: jest.fn((set1, set2) => {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  })
}));

describe('usePermissionState', () => {
  const mockModulesData = {
    module1: { name: 'Module 1', submodules: { sub1: ['perm1', 'perm2'] } },
    module2: { name: 'Module 2', submodules: { sub2: ['perm3'] } }
  };

  const mockFormDataPermissions = {
    enabledModules: ['module1'],
    selectedPermissions: ['module1-sub1-perm1'],
    activeModule: 'module1',
    activeSubmodule: 'module1-sub1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty sets when no modules data', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: {},
          formDataPermissions: null
        })
      );

      expect(result.current.enabledModules.size).toBe(0);
      expect(result.current.selectedPermissions.size).toBe(0);
      expect(result.current.activeModule).toBeNull();
      expect(result.current.activeSubmodule).toBeNull();
    });

    it('should initialize with existing permissions when provided', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: mockFormDataPermissions
        })
      );

      expect(result.current.enabledModules.has('module1')).toBe(true);
      expect(result.current.selectedPermissions.has('module1-sub1-perm1')).toBe(true);
    });

    it('should initialize with all modules enabled when no existing permissions', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: null
        })
      );

      expect(result.current.enabledModules.has('module1')).toBe(true);
      expect(result.current.enabledModules.has('module2')).toBe(true);
    });

    it('should set initial permission state when existing permissions provided', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: mockFormDataPermissions
        })
      );

      expect(result.current.initialPermissionState).not.toBeNull();
      expect(result.current.initialPermissionState?.enabledModules.has('module1')).toBe(true);
    });

    it('should not set initialPermissionState twice when it already exists', () => {
      const { result, rerender } = renderHook(
        ({ formDataPermissions }) =>
          usePermissionState({
            modulesData: mockModulesData,
            formDataPermissions
          }),
        { initialProps: { formDataPermissions: mockFormDataPermissions } }
      );

      const firstInitialState = result.current.initialPermissionState;
      
      rerender({ formDataPermissions: { ...mockFormDataPermissions, enabledModules: ['module2'] } });
      
      // Should still be the same initial state
      expect(result.current.initialPermissionState).toBe(firstInitialState);
    });

    it('should handle empty modulesData object', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: {},
          formDataPermissions: null
        })
      );

      expect(result.current.enabledModules.size).toBe(0);
    });

    it('should handle formDataPermissions without enabledModules', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: { selectedPermissions: [] }
        })
      );

      expect(result.current.enabledModules.has('module1')).toBe(true);
      expect(result.current.enabledModules.has('module2')).toBe(true);
    });

    it('should handle formDataPermissions without selectedPermissions', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: { enabledModules: ['module1'] }
        })
      );

      expect(result.current.enabledModules.has('module1')).toBe(true);
    });
  });

  describe('State Updates', () => {
    it('should update enabledModules', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: null
        })
      );

      act(() => {
        result.current.setEnabledModules(new Set(['module1']));
      });

      expect(result.current.enabledModules.size).toBe(1);
      expect(result.current.enabledModules.has('module1')).toBe(true);
    });

    it('should update selectedPermissions', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: null
        })
      );

      act(() => {
        result.current.setSelectedPermissions(new Set(['perm1']));
      });

      expect(result.current.selectedPermissions.has('perm1')).toBe(true);
    });

    it('should update activeModule', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: null
        })
      );

      act(() => {
        result.current.setActiveModule('module1');
      });

      expect(result.current.activeModule).toBe('module1');
    });

    it('should update activeSubmodule', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: null
        })
      );

      act(() => {
        result.current.setActiveSubmodule('sub1');
      });

      expect(result.current.activeSubmodule).toBe('sub1');
    });

    it('should handle setting activeModule to null', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: { ...mockFormDataPermissions, activeModule: 'module1' }
        })
      );

      act(() => {
        result.current.setActiveModule(null);
      });

      expect(result.current.activeModule).toBeNull();
    });

    it('should handle setting activeSubmodule to null', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: { ...mockFormDataPermissions, activeSubmodule: 'sub1' }
        })
      );

      act(() => {
        result.current.setActiveSubmodule(null);
      });

      expect(result.current.activeSubmodule).toBeNull();
    });
  });

  describe('Change Tracking', () => {
    it('should detect changes to enabledModules', async () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: mockFormDataPermissions
        })
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.setEnabledModules(new Set(['module1', 'module2']));
      });

      await waitFor(() => {
        expect(result.current.hasPermissionChanges).toBe(true);
      });
    });

    it('should detect changes to selectedPermissions', async () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: mockFormDataPermissions
        })
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.setSelectedPermissions(new Set(['module1-sub1-perm1', 'module1-sub1-perm2']));
      });

      await waitFor(() => {
        expect(result.current.hasPermissionChanges).toBe(true);
      });
    });

    it('should not detect changes when state matches initial', async () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: mockFormDataPermissions
        })
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.handleReset();
      });

      await waitFor(() => {
        expect(result.current.hasPermissionChanges).toBe(false);
      });
    });

    it('should not detect changes when activeModule changes but permissions unchanged', async () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: mockFormDataPermissions
        })
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.setActiveModule('module2');
      });

      await waitFor(() => {
        // activeModule change should not trigger hasPermissionChanges
        expect(result.current.hasPermissionChanges).toBe(false);
      });
    });

    it('should not detect changes when activeSubmodule changes but permissions unchanged', async () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: mockFormDataPermissions
        })
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.setActiveSubmodule('sub2');
      });

      await waitFor(() => {
        expect(result.current.hasPermissionChanges).toBe(false);
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial state when handleReset is called', async () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: mockFormDataPermissions
        })
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.setEnabledModules(new Set(['module1', 'module2']));
        result.current.setSelectedPermissions(new Set(['perm1', 'perm2']));
      });

      act(() => {
        result.current.handleReset();
      });

      expect(result.current.enabledModules.has('module1')).toBe(true);
      await waitFor(() => {
        expect(result.current.hasPermissionChanges).toBe(false);
      });
    });

    it('should call onInputChange when reset with initial state', async () => {
      const onInputChange = jest.fn();
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: mockFormDataPermissions,
          onInputChange
        })
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.handleReset();
      });

      expect(onInputChange).toHaveBeenCalledWith('permissions', expect.objectContaining({
        enabledModules: expect.any(Array),
        selectedPermissions: expect.any(Array)
      }));
    });

    it('should not reset when initialPermissionState is null', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: {},
          formDataPermissions: null
        })
      );

      const initialEnabled = result.current.enabledModules;
      
      act(() => {
        result.current.handleReset();
      });

      expect(result.current.enabledModules).toEqual(initialEnabled);
    });

    it('should not call onInputChange when initialPermissionState is null', () => {
      const onInputChange = jest.fn();
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: {},
          formDataPermissions: null,
          onInputChange
        })
      );

      act(() => {
        result.current.handleReset();
      });

      expect(onInputChange).not.toHaveBeenCalled();
    });
  });

  describe('Reset Trigger', () => {
    it('should reset when resetTrigger changes', async () => {
      const { result, rerender } = renderHook(
        ({ resetTrigger }) =>
          usePermissionState({
            modulesData: mockModulesData,
            formDataPermissions: mockFormDataPermissions,
            resetTrigger
          }),
        { initialProps: { resetTrigger: undefined } }
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.setEnabledModules(new Set(['module1', 'module2']));
      });

      rerender({ resetTrigger: 1 });

      await waitFor(() => {
        expect(result.current.hasPermissionChanges).toBe(false);
      });
    });

    it('should not reset when resetTrigger is 0 or negative', async () => {
      const { result, rerender } = renderHook(
        ({ resetTrigger }) =>
          usePermissionState({
            modulesData: mockModulesData,
            formDataPermissions: mockFormDataPermissions,
            resetTrigger
          }),
        { initialProps: { resetTrigger: undefined } }
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.setEnabledModules(new Set(['module1', 'module2']));
      });

      rerender({ resetTrigger: 0 });
      expect(result.current.enabledModules.has('module2')).toBe(true);

      rerender({ resetTrigger: -1 });
      expect(result.current.enabledModules.has('module2')).toBe(true);
    });

    it('should reset to form data permissions when no initial state', async () => {
      const { result, rerender } = renderHook(
        ({ resetTrigger }) =>
          usePermissionState({
            modulesData: mockModulesData,
            formDataPermissions: mockFormDataPermissions,
            resetTrigger
          }),
        { initialProps: { resetTrigger: undefined } }
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.setEnabledModules(new Set(['module2']));
      });

      rerender({ resetTrigger: 1 });

      await waitFor(() => {
        expect(result.current.enabledModules.has('module1')).toBe(true);
      });
    });

    it('should reset to default state when no initial state and no form data', async () => {
      const { result, rerender } = renderHook(
        ({ resetTrigger }) =>
          usePermissionState({
            modulesData: mockModulesData,
            formDataPermissions: null,
            resetTrigger
          }),
        { initialProps: { resetTrigger: undefined } }
      );

      await waitFor(() => {
        expect(result.current.enabledModules.size).toBeGreaterThan(0);
      });

      act(() => {
        result.current.setEnabledModules(new Set(['module1']));
        result.current.setSelectedPermissions(new Set(['perm1']));
      });

      rerender({ resetTrigger: 1 });

      await waitFor(() => {
        expect(result.current.enabledModules.has('module1')).toBe(true);
        expect(result.current.enabledModules.has('module2')).toBe(true);
        expect(result.current.selectedPermissions.size).toBe(0);
      });
    });

    it('should call onInputChange when resetTrigger activates with initial state', async () => {
      const onInputChange = jest.fn();
      const { rerender } = renderHook(
        ({ resetTrigger }) =>
          usePermissionState({
            modulesData: mockModulesData,
            formDataPermissions: mockFormDataPermissions,
            resetTrigger,
            onInputChange
          }),
        { initialProps: { resetTrigger: undefined } }
      );

      await waitFor(() => {
        // Wait for initialization
      });

      rerender({ resetTrigger: 1 });

      await waitFor(() => {
        expect(onInputChange).toHaveBeenCalledWith('permissions', expect.objectContaining({
          enabledModules: expect.any(Array),
          selectedPermissions: expect.any(Array)
        }));
      });
    });

    it('should not call onInputChange when resetTrigger activates without initial state', async () => {
      const onInputChange = jest.fn();
      const { rerender } = renderHook(
        ({ resetTrigger }) =>
          usePermissionState({
            modulesData: mockModulesData,
            formDataPermissions: null,
            resetTrigger,
            onInputChange
          }),
        { initialProps: { resetTrigger: undefined } }
      );

      await waitFor(() => {
        // Wait for initialization
      });

      rerender({ resetTrigger: 1 });

      // Should not call onInputChange when there's no initialPermissionState
      await waitFor(() => {
        expect(onInputChange).not.toHaveBeenCalled();
      });
    });

    it('should set hasPermissionChanges to false when resetTrigger activates', async () => {
      const { result, rerender } = renderHook(
        ({ resetTrigger }) =>
          usePermissionState({
            modulesData: mockModulesData,
            formDataPermissions: mockFormDataPermissions,
            resetTrigger
          }),
        { initialProps: { resetTrigger: undefined } }
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.setEnabledModules(new Set(['module2']));
      });

      await waitFor(() => {
        expect(result.current.hasPermissionChanges).toBe(true);
      });

      rerender({ resetTrigger: 1 });

      await waitFor(() => {
        expect(result.current.hasPermissionChanges).toBe(false);
      });
    });
  });

  describe('Logging', () => {
    it('should log when enableLogging is true', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: mockFormDataPermissions,
          enableLogging: true
        })
      );

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not log when enableLogging is false', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: mockFormDataPermissions,
          enableLogging: false
        })
      );

      // Should not log initialization details
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('INITIALIZING'));
      consoleSpy.mockRestore();
    });

    it('should log reset operations when enableLogging is true', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { result, rerender } = renderHook(
        ({ resetTrigger }) =>
          usePermissionState({
            modulesData: mockModulesData,
            formDataPermissions: mockFormDataPermissions,
            resetTrigger,
            enableLogging: true
          }),
        { initialProps: { resetTrigger: undefined } }
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      rerender({ resetTrigger: 1 });

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('RESET TRIGGER'));
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle modulesData changing', () => {
      const { result, rerender } = renderHook(
        ({ modulesData }) =>
          usePermissionState({
            modulesData,
            formDataPermissions: null
          }),
        { initialProps: { modulesData: {} } }
      );

      rerender({ modulesData: mockModulesData });

      expect(result.current.enabledModules.size).toBeGreaterThan(0);
    });

    it('should handle formDataPermissions changing', () => {
      const { result, rerender } = renderHook(
        ({ formDataPermissions }) =>
          usePermissionState({
            modulesData: mockModulesData,
            formDataPermissions
          }),
        { initialProps: { formDataPermissions: null } }
      );

      rerender({ formDataPermissions: mockFormDataPermissions });

      expect(result.current.enabledModules.has('module1')).toBe(true);
    });

    it('should handle null activeModule and activeSubmodule in formDataPermissions', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: {
            enabledModules: ['module1'],
            selectedPermissions: ['perm1'],
            activeModule: null,
            activeSubmodule: null
          }
        })
      );

      expect(result.current.activeModule).toBeNull();
      expect(result.current.activeSubmodule).toBeNull();
    });

    it('should handle undefined activeModule and activeSubmodule in formDataPermissions', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: mockModulesData,
          formDataPermissions: {
            enabledModules: ['module1'],
            selectedPermissions: ['perm1'],
            activeModule: undefined,
            activeSubmodule: undefined
          }
        })
      );

      expect(result.current.activeModule).toBeNull();
      expect(result.current.activeSubmodule).toBeNull();
    });

    it('should handle resetToFormDataPermissions with null activeModule', async () => {
      const { result, rerender } = renderHook(
        ({ resetTrigger }) =>
          usePermissionState({
            modulesData: mockModulesData,
            formDataPermissions: {
              enabledModules: ['module1'],
              selectedPermissions: ['perm1'],
              activeModule: null,
              activeSubmodule: null
            },
            resetTrigger
          }),
        { initialProps: { resetTrigger: undefined } }
      );

      await waitFor(() => {
        expect(result.current.initialPermissionState).not.toBeNull();
      });

      act(() => {
        result.current.setActiveModule('module2');
      });

      rerender({ resetTrigger: 1 });

      await waitFor(() => {
        expect(result.current.activeModule).toBeNull();
      });
    });

    it('should handle resetToDefaultState when modulesData is empty', async () => {
      const { result, rerender } = renderHook(
        ({ resetTrigger }) =>
          usePermissionState({
            modulesData: {},
            formDataPermissions: null,
            resetTrigger
          }),
        { initialProps: { resetTrigger: undefined } }
      );

      rerender({ resetTrigger: 1 });

      expect(result.current.enabledModules.size).toBe(0);
      expect(result.current.selectedPermissions.size).toBe(0);
    });

    it('should handle when prev.size equals newSet.size but modules differ', () => {
      const { result } = renderHook(() =>
        usePermissionState({
          modulesData: { module1: {}, module2: {} },
          formDataPermissions: null
        })
      );

      act(() => {
        result.current.setEnabledModules(new Set(['module1']));
      });

      // Change modulesData to have same number of modules but different keys
      const { result: result2 } = renderHook(() =>
        usePermissionState({
          modulesData: { module3: {}, module4: {} },
          formDataPermissions: null
        })
      );

      expect(result2.current.enabledModules.has('module3')).toBe(true);
      expect(result2.current.enabledModules.has('module4')).toBe(true);
    });
  });
});
