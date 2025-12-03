import { renderHook, act } from '@testing-library/react';
import { useNavigationHandlers } from '../../../../src/components/entityConfiguration/hooks/useNavigationHandlers';

// Mock dependencies
jest.mock('../../../../src/store/Actions/entitySetupActions', () => ({
  updateEntityProgressPercentage: jest.fn(() => ({
    type: 'updateEntityProgressPercentage',
    payload: Promise.resolve()
  }))
}));

jest.mock('../../../../src/store/Reducers/entitySlice', () => ({
  fetchEntities: jest.fn(() => ({
    type: 'entities/fetchEntities',
    payload: Promise.resolve()
  }))
}));

jest.mock('../../../../src/services/entitySaveService', () => ({
  saveEntityPartialUpdate: jest.fn().mockResolvedValue({ status: 'Ok' })
}));

jest.mock('../../../../src/utils/tabSessionStorage', () => ({
  clearEntityConfigTab: jest.fn()
}));

describe('useNavigationHandlers', () => {
  const mockDispatch = jest.fn();
  const mockSetTabValue = jest.fn();
  const mockNavigate = jest.fn();
  const mockSetModulesState = jest.fn();
  const mockModulesRef = { 
    current: {
      saveModulesToEntity: jest.fn().mockResolvedValue(undefined)
    }
  };

  const mockSetProgress = jest.fn();
  const mockEntity = {
    id: 'entity-123',
    legalBusinessName: 'Test Entity',
    displayName: 'Test',
    entityType: 'Planning Entity',
    progressPercentage: '50'
  };

  const defaultParams = {
    tabValue: 0,
    setTabValue: mockSetTabValue,
    isRollupEntity: false,
    progress: 50,
    entityId: 'entity-123',
    selectedCountries: ['USA'],
    selectedCurrencies: ['USD'],
    entity: mockEntity,
    modulesRef: mockModulesRef,
    dispatch: mockDispatch,
    navigate: mockNavigate,
    setModulesState: mockSetModulesState,
    setProgress: mockSetProgress
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/entity-setup'
      },
      writable: true
    });
  });

  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      const { result } = renderHook(() => useNavigationHandlers(defaultParams));
      
      expect(result.current).toBeDefined();
      expect(result.current.navigateToEntityList).toBeDefined();
      expect(result.current.handleNext).toBeDefined();
      expect(result.current.handleFinish).toBeDefined();
      expect(result.current.handleBack).toBeDefined();
      expect(result.current.handleModulesDataChange).toBeDefined();
    });

    it('should return all expected functions', () => {
      const { result } = renderHook(() => useNavigationHandlers(defaultParams));
      
      expect(typeof result.current.navigateToEntityList).toBe('function');
      expect(typeof result.current.handleNext).toBe('function');
      expect(typeof result.current.handleFinish).toBe('function');
      expect(typeof result.current.handleBack).toBe('function');
      expect(typeof result.current.handleModulesDataChange).toBe('function');
    });
  });

  describe('navigateToEntityList functionality', () => {
    it('should navigate to admin path when in admin app', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/admin/entity-setup'
        },
        writable: true
      });

      const { result } = renderHook(() => useNavigationHandlers(defaultParams));
      
      act(() => {
        result.current.navigateToEntityList();
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/admin/entity-setup');
    });

    it('should navigate to root path when not in admin app', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/entity-setup'
        },
        writable: true
      });

      const { result } = renderHook(() => useNavigationHandlers(defaultParams));
      
      act(() => {
        result.current.navigateToEntityList();
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should use window.location when navigate is undefined', () => {
      const originalLocation = window.location;
      delete (window as any).location;
      
      let hrefValue = '';
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/entity-setup',
          get href() {
            return hrefValue;
          },
          set href(value: string) {
            hrefValue = value;
          }
        },
        writable: true,
        configurable: true
      });

      const paramsWithoutNavigate = {
        ...defaultParams,
        navigate: undefined
      };

      const { result } = renderHook(() => useNavigationHandlers(paramsWithoutNavigate));
      
      act(() => {
        result.current.navigateToEntityList();
      });
      
      expect(hrefValue).toBe('/');
      
      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true
      });
    });
  });

  describe('handleNext functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should increment tab value when not at max tab', () => {
      const { result } = renderHook(() => useNavigationHandlers(defaultParams));
      
      act(() => {
        result.current.handleNext();
      });
      
      expect(mockSetTabValue).toHaveBeenCalledWith(1);
    });

    it('should update progress when transitioning from Countries tab with lower current progress', async () => {
      const paramsWithLowProgress = {
        ...defaultParams,
        tabValue: 0,
        entity: { ...mockEntity, progressPercentage: '0' },
        selectedCountries: ['USA'],
        selectedCurrencies: ['USD']
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithLowProgress));
      
      await act(async () => {
        await result.current.handleNext();
      });
      
      expect(mockSetProgress).toHaveBeenCalledWith(33.3);
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockSetTabValue).toHaveBeenCalledWith(1);
    });

    it('should not update progress when current progress is higher than new progress', async () => {
      const paramsWithHighProgress = {
        ...defaultParams,
        tabValue: 0,
        entity: { ...mockEntity, progressPercentage: '100' },
        selectedCountries: ['USA'],
        selectedCurrencies: ['USD']
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithHighProgress));
      
      await act(async () => {
        await result.current.handleNext();
      });
      
      expect(mockSetProgress).not.toHaveBeenCalled();
      expect(mockSetTabValue).toHaveBeenCalledWith(1);
    });

    it('should calculate progress as 50% for rollup entity', async () => {
      const paramsForRollup = {
        ...defaultParams,
        tabValue: 0,
        isRollupEntity: true,
        entity: { ...mockEntity, progressPercentage: '0' },
        selectedCountries: ['USA'],
        selectedCurrencies: ['USD']
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsForRollup));
      
      await act(async () => {
        await result.current.handleNext();
      });
      
      expect(mockSetProgress).toHaveBeenCalledWith(50);
    });

    it('should not increment tab value when at max tab for Planning entity', () => {
      const paramsAtMaxTab = {
        ...defaultParams,
        tabValue: 2,
        isRollupEntity: false
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsAtMaxTab));
      
      act(() => {
        result.current.handleNext();
      });
      
      expect(mockSetTabValue).not.toHaveBeenCalled();
    });

    it('should not increment tab value when at max tab for Rollup entity', () => {
      const paramsAtMaxTab = {
        ...defaultParams,
        tabValue: 1,
        isRollupEntity: true
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsAtMaxTab));
      
      act(() => {
        result.current.handleNext();
      });
      
      expect(mockSetTabValue).not.toHaveBeenCalled();
    });

    it('should not update progress when not on Countries tab', async () => {
      const paramsNotOnCountriesTab = {
        ...defaultParams,
        tabValue: 1,
        entity: { ...mockEntity, progressPercentage: '0' }
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsNotOnCountriesTab));
      
      await act(async () => {
        await result.current.handleNext();
      });
      
      expect(mockSetProgress).not.toHaveBeenCalled();
      expect(mockSetTabValue).toHaveBeenCalledWith(2);
    });
  });

  describe('handleFinish functionality', () => {
    it('should save modules and update isConfigured when progress is 100%', async () => {
      const { saveEntityPartialUpdate } = require('../../../../src/services/entitySaveService');
      const { fetchEntities } = require('../../../../src/store/Reducers/entitySlice');
      
      const paramsWithModules = {
        ...defaultParams,
        modulesState: {
          currentModules: ['module1', 'module2'],
          savedModules: ['module1', 'module2']
        },
        entity: mockEntity
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithModules));
      
      await act(async () => {
        await result.current.handleFinish();
      });
      
      expect(mockModulesRef.current.saveModulesToEntity).toHaveBeenCalled();
      expect(saveEntityPartialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'entity-123',
          isConfigured: true
        }),
        'u'
      );
      expect(fetchEntities).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should not update isConfigured when progress is 66.6% (no modules)', async () => {
      const { saveEntityPartialUpdate } = require('../../../../src/services/entitySaveService');
      
      const paramsWithoutModules = {
        ...defaultParams,
        modulesState: {
          currentModules: [],
          savedModules: []
        },
        entity: mockEntity
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithoutModules));
      
      await act(async () => {
        await result.current.handleFinish();
      });
      
      expect(mockModulesRef.current.saveModulesToEntity).toHaveBeenCalled();
      expect(saveEntityPartialUpdate).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should use savedModules when currentModules is not available', async () => {
      const { saveEntityPartialUpdate } = require('../../../../src/services/entitySaveService');
      
      const paramsWithSavedModules = {
        ...defaultParams,
        modulesState: {
          savedModules: ['module1']
        },
        entity: mockEntity
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithSavedModules));
      
      await act(async () => {
        await result.current.handleFinish();
      });
      
      expect(saveEntityPartialUpdate).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle missing modulesState gracefully', async () => {
      const paramsWithoutModulesState = {
        ...defaultParams,
        modulesState: undefined,
        entity: mockEntity
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithoutModulesState));
      
      await act(async () => {
        await result.current.handleFinish();
      });
      
      expect(mockModulesRef.current.saveModulesToEntity).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle missing modulesRef gracefully', async () => {
      const paramsWithoutModulesRef = {
        ...defaultParams,
        modulesRef: { current: null },
        entity: mockEntity
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithoutModulesRef));
      
      await act(async () => {
        await result.current.handleFinish();
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle missing entityId gracefully', async () => {
      const paramsWithoutEntityId = {
        ...defaultParams,
        entityId: undefined,
        entity: mockEntity
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithoutEntityId));
      
      await act(async () => {
        await result.current.handleFinish();
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle missing dispatch gracefully', async () => {
      const paramsWithoutDispatch = {
        ...defaultParams,
        dispatch: undefined,
        entity: mockEntity
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithoutDispatch));
      
      await act(async () => {
        await result.current.handleFinish();
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle errors in saveEntityPartialUpdate gracefully', async () => {
      const { saveEntityPartialUpdate } = require('../../../../src/services/entitySaveService');
      saveEntityPartialUpdate.mockRejectedValueOnce(new Error('Save failed'));
      
      const paramsWithModules = {
        ...defaultParams,
        modulesState: {
          currentModules: ['module1'],
          savedModules: ['module1']
        },
        entity: mockEntity
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithModules));
      
      await act(async () => {
        await result.current.handleFinish();
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle errors in saveModulesToEntity gracefully', async () => {
      const mockSaveModulesToEntity = jest.fn().mockRejectedValue(new Error('Save failed'));
      const paramsWithError = {
        ...defaultParams,
        modulesRef: {
          current: {
            saveModulesToEntity: mockSaveModulesToEntity
          }
        },
        entity: mockEntity
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithError));
      
      await act(async () => {
        await result.current.handleFinish();
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('handleBack functionality', () => {
    it('should decrement tab value when not at first tab', () => {
      const paramsNotAtFirstTab = {
        ...defaultParams,
        tabValue: 1
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsNotAtFirstTab));
      
      act(() => {
        result.current.handleBack();
      });
      
      expect(mockSetTabValue).toHaveBeenCalledWith(0);
    });

    it('should navigate to entity list when at first tab', () => {
      const { result } = renderHook(() => useNavigationHandlers(defaultParams));
      
      act(() => {
        result.current.handleBack();
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('handleModulesDataChange functionality', () => {
    it('should update modules state with array', () => {
      const { result } = renderHook(() => useNavigationHandlers(defaultParams));
      
      const mockModules = ['module1', 'module2'];
      
      act(() => {
        result.current.handleModulesDataChange(mockModules);
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith(expect.any(Function));
      
      // Verify the function updates state correctly
      const updateFn = mockSetModulesState.mock.calls[0][0];
      const prevState = { currentModules: [], isDataModified: false };
      const newState = updateFn(prevState);
      expect(newState).toEqual({
        currentModules: mockModules,
        isDataModified: true
      });
    });

    it('should handle empty modules array', () => {
      const { result } = renderHook(() => useNavigationHandlers(defaultParams));
      
      act(() => {
        result.current.handleModulesDataChange([]);
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle null modules', () => {
      const { result } = renderHook(() => useNavigationHandlers(defaultParams));
      
      act(() => {
        result.current.handleModulesDataChange(null);
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith(null);
    });

    it('should handle non-array, non-null modules', () => {
      const { result } = renderHook(() => useNavigationHandlers(defaultParams));
      
      act(() => {
        result.current.handleModulesDataChange('not-an-array' as any);
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith('not-an-array');
    });
  });

  describe('Edge cases', () => {
    it('should handle missing navigate function (null)', () => {
      const paramsWithoutNavigate = {
        ...defaultParams,
        navigate: null
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithoutNavigate));
      
      act(() => {
        result.current.navigateToEntityList();
      });
      
      // When navigate is null, it should fallback to navigate('/')
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle navigate that is not a function but not null/undefined', () => {
      const paramsWithNonFunctionNavigate = {
        ...defaultParams,
        navigate: 'not-a-function' as any
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithNonFunctionNavigate));
      
      act(() => {
        result.current.navigateToEntityList();
      });
      
      // Should call navigate with '/' as fallback
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle different progress values', async () => {
      const testCases = [
        { progress: 0, modulesState: { currentModules: [] } },
        { progress: 50, modulesState: { currentModules: [] } },
        { progress: 100, modulesState: { currentModules: ['module1'] } }
      ];

      for (const { progress, modulesState } of testCases) {
        const params = {
          ...defaultParams,
          progress,
          modulesState,
          entity: mockEntity
        };
        
        const { result } = renderHook(() => useNavigationHandlers(params));
        
        await act(async () => {
          await result.current.handleFinish();
        });
        
        expect(mockNavigate).toHaveBeenCalledWith('/');
        
        // Clear mocks for next iteration
        mockDispatch.mockClear();
        mockNavigate.mockClear();
        mockModulesRef.current.saveModulesToEntity.mockClear();
      }
    });

    it('should handle different entity types', () => {
      const testCases = [
        { isRollupEntity: false, maxTab: 2 },
        { isRollupEntity: true, maxTab: 1 }
      ];

      testCases.forEach(({ isRollupEntity, maxTab }) => {
        const params = {
          ...defaultParams,
          isRollupEntity,
          tabValue: maxTab
        };
        
        const { result } = renderHook(() => useNavigationHandlers(params));
        
        act(() => {
          result.current.handleNext();
        });
        
        expect(mockSetTabValue).not.toHaveBeenCalled();
      });
    });
  });

  describe('Callback memoization', () => {
    it('should memoize callbacks', () => {
      const { result, rerender } = renderHook(
        ({ params }) => useNavigationHandlers(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstNavigateToEntityList = result.current.navigateToEntityList;
      const firstHandleNext = result.current.handleNext;
      const firstHandleFinish = result.current.handleFinish;
      const firstHandleBack = result.current.handleBack;
      const firstHandleModulesDataChange = result.current.handleModulesDataChange;
      
      rerender({ params: defaultParams });
      
      expect(result.current.navigateToEntityList).toBe(firstNavigateToEntityList);
      expect(result.current.handleNext).toBe(firstHandleNext);
      expect(result.current.handleFinish).toBe(firstHandleFinish);
      expect(result.current.handleBack).toBe(firstHandleBack);
      expect(result.current.handleModulesDataChange).toBe(firstHandleModulesDataChange);
    });

    it('should create new callbacks when dependencies change', () => {
      const { result, rerender } = renderHook(
        ({ params }) => useNavigationHandlers(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstHandleNext = result.current.handleNext;
      
      const newParams = {
        ...defaultParams,
        tabValue: 1
      };
      
      rerender({ params: newParams });
      
      expect(result.current.handleNext).not.toBe(firstHandleNext);
    });
  });

  describe('Integration with Redux', () => {
    it('should dispatch fetchEntities after updating progress', async () => {
      const { updateEntityProgressPercentage } = require('../../../../src/store/Actions/entitySetupActions');
      const { fetchEntities } = require('../../../../src/store/Reducers/entitySlice');
      
      // Reset mock to return resolved promise
      mockDispatch.mockReset();
      mockDispatch.mockResolvedValue(undefined);
      
      const paramsWithLowProgress = {
        ...defaultParams,
        tabValue: 0,
        entity: { ...mockEntity, progressPercentage: '0' },
        selectedCountries: ['USA'],
        selectedCurrencies: ['USD']
      };
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithLowProgress));
      
      await act(async () => {
        await result.current.handleNext();
        // Advance timers to trigger setTimeout
        jest.advanceTimersByTime(100);
        // Wait for setTimeout callback
        await Promise.resolve();
      });
      
      expect(updateEntityProgressPercentage).toHaveBeenCalled();
      expect(fetchEntities).toHaveBeenCalled();
    });

    it('should handle updateProgressInDatabase error gracefully', async () => {
      const mockError = new Error('Update failed');
      
      // Reset mock and make it reject
      mockDispatch.mockReset();
      mockDispatch.mockRejectedValueOnce(mockError);
      
      const paramsWithLowProgress = {
        ...defaultParams,
        tabValue: 0,
        entity: { ...mockEntity, progressPercentage: '0' },
        selectedCountries: ['USA'],
        selectedCurrencies: ['USD']
      };
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const { result } = renderHook(() => useNavigationHandlers(paramsWithLowProgress));
      
      await act(async () => {
        await result.current.handleNext();
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to update progress percentage:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Window location handling', () => {
    it('should handle different pathname patterns', () => {
      const testCases = [
        { pathname: '/admin/entity-setup', expectedPath: '/admin/entity-setup' },
        { pathname: '/entity-setup', expectedPath: '/' },
        { pathname: '/some-other-path', expectedPath: '/' }
      ];

      testCases.forEach(({ pathname, expectedPath }) => {
        Object.defineProperty(window, 'location', {
          value: { pathname },
          writable: true
        });

        const { result } = renderHook(() => useNavigationHandlers(defaultParams));
        
        act(() => {
          result.current.navigateToEntityList();
        });
        
        expect(mockNavigate).toHaveBeenCalledWith(expectedPath);
      });
    });
  });
});
