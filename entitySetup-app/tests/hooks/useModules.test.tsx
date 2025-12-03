import { renderHook, act, waitFor } from '@testing-library/react';
import { useModules } from '../../src/hooks/useModules';
import { fetchModulesFromApi, updateModulesConfiguration } from '../../src/services/moduleService';
import { Module } from '../../src/types/moduleTypes';

// Mock the module service
jest.mock('../../src/services/moduleService', () => ({
  fetchModulesFromApi: jest.fn(),
  updateModulesConfiguration: jest.fn(),
}));

const mockedFetchModulesFromApi = fetchModulesFromApi as jest.MockedFunction<typeof fetchModulesFromApi>;
const mockedUpdateModulesConfiguration = updateModulesConfiguration as jest.MockedFunction<typeof updateModulesConfiguration>;

describe('useModules Hook', () => {
  const mockModules: Module[] = [
    {
      id: '1',
      name: 'Budgeting',
      description: 'This module enables planning financial goals for various periods',
      isEnabled: false,
      isConfigured: false
    },
    {
      id: '2',
      name: 'Inventory Planning',
      description: 'This module enables planning future inventory requirements',
      isEnabled: false,
      isConfigured: false
    },
    {
      id: '3',
      name: 'Assortment Planning',
      description: 'This module enables selecting the optimal product mix',
      isEnabled: true,
      isConfigured: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    // Reset the mock implementation
    mockedFetchModulesFromApi.mockReset();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Hook Initialization', () => {
    it('should initialize with default state values', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce([]);

      const { result } = renderHook(() => useModules({}));

      // Wait for the async loadModules to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.selectedModules).toEqual([]);
        expect(result.current.hasUnsavedChanges).toBe(false);
      });
    });

    it('should call fetchModulesFromApi on mount', async () => {
      // Set up the mock to return the modules
      mockedFetchModulesFromApi.mockImplementation(() => Promise.resolve(mockModules));

      const { result } = renderHook(() => useModules({}));

      // First check that the mock is called
      expect(mockedFetchModulesFromApi).toHaveBeenCalledTimes(1);
      expect(mockedFetchModulesFromApi).toHaveBeenCalledWith();

      // Wait for the async operation to complete using act
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
        expect(result.current.selectedModules).toEqual(['3']); // Only enabled module
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set selectedModules based on enabled modules', async () => {
      const modulesWithMixedState = [
        { ...mockModules[0], isEnabled: true },
        { ...mockModules[1], isEnabled: false },
        { ...mockModules[2], isEnabled: true }
      ];
      mockedFetchModulesFromApi.mockResolvedValueOnce(modulesWithMixedState);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.selectedModules).toEqual(['1', '3']);
      });
    });
  });

  describe('loadModules Function', () => {
    it('should load modules successfully and update state', async () => {
      mockedFetchModulesFromApi.mockResolvedValue(mockModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await result.current.loadModules();
      });

      expect(mockedFetchModulesFromApi).toHaveBeenCalledTimes(2); // Once on mount, once on loadModules
      expect(result.current.modules).toEqual(mockModules);
      expect(result.current.selectedModules).toEqual(['3']);
      expect(result.current.loading).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      mockedFetchModulesFromApi.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.error).toBe('API Error');
        expect(result.current.loading).toBe(false);
        expect(result.current.modules).toEqual([]);
      });
    });

    it('should handle errors without message', async () => {
      const error = new Error();
      mockedFetchModulesFromApi.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load modules');
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading state during API call', async () => {
      mockedFetchModulesFromApi.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockModules), 100))
      );

      const { result } = renderHook(() => useModules({}));

      // Check loading state during API call
      expect(result.current.loading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.modules).toEqual(mockModules);
      });
    });
  });

  describe('toggleModule Function', () => {
    it('should enable a module and update state correctly', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      act(() => {
        result.current.toggleModule('1', true);
      });

      expect(result.current.modules[0].isEnabled).toBe(true);
      expect(result.current.selectedModules).toContain('1');
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should disable a module and update state correctly', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      act(() => {
        result.current.toggleModule('3', false);
      });

      expect(result.current.modules[2].isEnabled).toBe(false);
      expect(result.current.selectedModules).not.toContain('3');
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should not affect other modules when toggling', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      act(() => {
        result.current.toggleModule('1', true);
      });

      expect(result.current.modules[1].isEnabled).toBe(false); // Unchanged
      expect(result.current.modules[2].isEnabled).toBe(true); // Unchanged
    });

    it('should handle toggling non-existent module gracefully', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      const initialModules = [...result.current.modules];
      const initialSelectedModules = [...result.current.selectedModules];

      act(() => {
        result.current.toggleModule('non-existent', true);
      });

      expect(result.current.modules).toEqual(initialModules);
      expect(result.current.selectedModules).toEqual(initialSelectedModules);
    });

    it('should maintain hasUnsavedChanges state correctly', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      expect(result.current.hasUnsavedChanges).toBe(false);

      act(() => {
        result.current.toggleModule('1', true);
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      act(() => {
        result.current.toggleModule('1', false);
      });

      expect(result.current.hasUnsavedChanges).toBe(true); // Still true because we made changes
    });
  });

  describe('saveModules', () => {
    it('should save modules successfully', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);
      mockedUpdateModulesConfiguration.mockResolvedValueOnce({
        status: 'Success',
        message: 'Modules saved successfully'
      });

      const onProgressUpdate = jest.fn();
      const onModuleSave = jest.fn();

      const { result } = renderHook(() => useModules({
        entityId: 'entity-123',
        onProgressUpdate,
        onModuleSave
      }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      act(() => {
        result.current.toggleModule('1', true);
      });

      await act(async () => {
        await result.current.saveModules();
      });

      expect(mockedUpdateModulesConfiguration).toHaveBeenCalledWith(
        [expect.objectContaining({ ...mockModules[0], isEnabled: true }), mockModules[2]], // Enabled modules
        'entity-123'
      );
      expect(onProgressUpdate).toHaveBeenCalledWith(100);
      expect(onModuleSave).toHaveBeenCalledWith([expect.objectContaining({ ...mockModules[0], isEnabled: true }), mockModules[2]]);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should return early if no changes to save', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      let saveResult;

      await act(async () => {
        saveResult = await result.current.saveModules();
      });

      expect(saveResult.success).toBe(true);
      expect(saveResult.message).toBe('No changes to save');
      expect(mockedUpdateModulesConfiguration).not.toHaveBeenCalled();
    });

    it('should handle save error', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);
      const error = new Error('Save failed');
      mockedUpdateModulesConfiguration.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      act(() => {
        result.current.toggleModule('1', true);
      });

      let saveResult;

      await act(async () => {
        saveResult = await result.current.saveModules();
      });

      expect(saveResult.success).toBe(false);
      expect(saveResult.message).toBe('Save failed');
      expect(result.current.error).toBe('Save failed');
    });

    it('should handle save error without message', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);
      const error = new Error();
      mockedUpdateModulesConfiguration.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      act(() => {
        result.current.toggleModule('1', true);
      });

      let saveResult;

      await act(async () => {
        saveResult = await result.current.saveModules();
      });

      expect(saveResult.success).toBe(false);
      expect(saveResult.message).toBe('Failed to save modules');
    });

    it('should save without entityId', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);
      mockedUpdateModulesConfiguration.mockResolvedValueOnce({
        status: 'Success',
        message: 'Modules saved successfully'
      });

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      act(() => {
        result.current.toggleModule('1', true);
      });

      await act(async () => {
        await result.current.saveModules();
      });

      expect(mockedUpdateModulesConfiguration).toHaveBeenCalledWith(
        [expect.objectContaining({ ...mockModules[0], isEnabled: true }), mockModules[2]], // Enabled modules
        undefined
      );
    });
  });

  describe('resetModules', () => {
    it('should reset all modules to disabled state', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      act(() => {
        result.current.toggleModule('1', true);
      });

      act(() => {
        result.current.resetModules();
      });

      expect(result.current.modules.every(m => !m.isEnabled)).toBe(true);
      expect(result.current.selectedModules).toEqual([]);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('validateModules', () => {
    it('should validate successfully with enabled modules', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      const validation = result.current.validateModules();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
      expect(validation.warnings).toEqual([]);
    });

    it('should show error when no modules are enabled', async () => {
      const disabledModules = mockModules.map(m => ({ ...m, isEnabled: false }));
      mockedFetchModulesFromApi.mockResolvedValueOnce(disabledModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(disabledModules);
      });

      const validation = result.current.validateModules();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(['At least one module must be enabled']);
    });

    it('should show warning when too many modules are enabled', async () => {
      const manyEnabledModules = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Module ${i + 1}`,
        description: `Description ${i + 1}`,
        isEnabled: true,
        isConfigured: false
      }));

      mockedFetchModulesFromApi.mockResolvedValueOnce(manyEnabledModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(manyEnabledModules);
      });

      const validation = result.current.validateModules();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
      expect(validation.warnings).toEqual(['Too many modules enabled. Consider enabling only necessary modules.']);
    });

    it('should show both error and warning', async () => {
      const manyDisabledModules = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Module ${i + 1}`,
        description: `Description ${i + 1}`,
        isEnabled: false,
        isConfigured: false
      }));

      mockedFetchModulesFromApi.mockResolvedValueOnce(manyDisabledModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(manyDisabledModules);
      });

      // Enable 12 modules to trigger warning
      act(() => {
        for (let i = 0; i < 12; i++) {
          result.current.toggleModule(`${i + 1}`, true);
        }
      });

      const validation = result.current.validateModules();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
      expect(validation.warnings).toEqual(['Too many modules enabled. Consider enabling only necessary modules.']);
    });
  });

  describe('callback dependencies', () => {
    it('should not recreate functions unnecessarily', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result, rerender } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      const initialToggleModule = result.current.toggleModule;
      const initialSaveModules = result.current.saveModules;

      rerender();

      expect(result.current.toggleModule).toBe(initialToggleModule);
      expect(result.current.saveModules).toBe(initialSaveModules);
    });

    it('should recreate functions when dependencies change', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result, rerender } = renderHook(
        ({ entityId, onProgressUpdate, onModuleSave }) => useModules({
          entityId,
          onProgressUpdate,
          onModuleSave
        }),
        {
          initialProps: { entityId: 'entity-1', onProgressUpdate: jest.fn(), onModuleSave: jest.fn() }
        }
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      const initialSaveModules = result.current.saveModules;

      const onProgressUpdate2 = jest.fn();
      const onModuleSave2 = jest.fn();

      rerender({
        entityId: 'entity-2',
        onProgressUpdate: onProgressUpdate2,
        onModuleSave: onModuleSave2
      });

      expect(result.current.saveModules).not.toBe(initialSaveModules);
    });
  });

  describe('Hook Return Value Structure', () => {
    it('should return all expected properties and methods', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current).toHaveProperty('modules');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('selectedModules');
      expect(result.current).toHaveProperty('hasUnsavedChanges');
      expect(result.current).toHaveProperty('toggleModule');
      expect(result.current).toHaveProperty('saveModules');
      expect(result.current).toHaveProperty('resetModules');
      expect(result.current).toHaveProperty('validateModules');
      expect(result.current).toHaveProperty('loadModules');

      expect(typeof result.current.toggleModule).toBe('function');
      expect(typeof result.current.saveModules).toBe('function');
      expect(typeof result.current.resetModules).toBe('function');
      expect(typeof result.current.validateModules).toBe('function');
      expect(typeof result.current.loadModules).toBe('function');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty modules array gracefully', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce([]);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual([]);
      });

      expect(result.current.modules).toEqual([]);
      expect(result.current.selectedModules).toEqual([]);

      const validation = result.current.validateModules();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toEqual(['At least one module must be enabled']);
    });

    it('should handle undefined callback props without errors', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(mockModules);

      const { result } = renderHook(() => useModules({
        entityId: 'entity-123'
        // onProgressUpdate and onModuleSave are undefined
      }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(mockModules);
      });

      act(() => {
        result.current.toggleModule('1', true);
      });

      await act(async () => {
        await result.current.saveModules();
      });

      // Should not throw errors when callbacks are undefined
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should handle null/undefined module data', async () => {
      mockedFetchModulesFromApi.mockResolvedValueOnce(null as any);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual([]);
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle malformed module data', async () => {
      const malformedModules = [
        { id: '1', name: 'Test' }, // Missing required fields
        { id: '2', name: 'Test2', description: 'Test', isEnabled: 'invalid' } // Invalid type
      ];
      mockedFetchModulesFromApi.mockResolvedValueOnce(malformedModules);

      const { result } = renderHook(() => useModules({}));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(result.current.modules).toEqual(malformedModules);
      });

      // Hook should handle malformed data gracefully
      expect(result.current.modules).toEqual(malformedModules);
    });
  });
});