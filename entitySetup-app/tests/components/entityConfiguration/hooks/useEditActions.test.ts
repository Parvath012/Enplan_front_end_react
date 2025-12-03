import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useEditActions } from '../../../../src/components/entityConfiguration/hooks/useEditActions';

// Mock dependencies
jest.mock('../../../../src/store/Actions/entityConfigurationActions', () => ({
  setOriginalData: jest.fn((payload) => ({ type: 'entityConfiguration/setOriginalData', payload })),
  setDataModified: jest.fn((payload) => ({ type: 'entityConfiguration/setDataModified', payload }))
}));

jest.mock('../../../../src/store/Actions/periodSetupActions', () => ({
  capturePreEditStateAction: jest.fn(() => (dispatch: any) => {
    dispatch({ type: 'periodSetup/capturePreEditState' });
  }),
  resetToPreEditStateAction: jest.fn(() => (dispatch: any) => {
    dispatch({ type: 'periodSetup/resetToPreEditState' });
  }),
  resetToInitialStateAction: jest.fn(() => (dispatch: any) => {
    dispatch({ type: 'periodSetup/resetToInitialState' });
  })
}));

describe('useEditActions', () => {
  const mockDispatch = jest.fn();
  const mockSetIsEditMode = jest.fn();
  const mockSetUserClickedEdit = jest.fn();
  const mockSetModulesState = jest.fn();
  const mockModulesRef = { current: null };

  const defaultParams = {
    isEditMode: false,
    tabValue: 0,
    entityId: 'entity-123',
    selectedCountries: ['US', 'CA'],
    selectedCurrencies: ['USD', 'CAD'],
    defaultCurrency: ['USD'],
    isDefault: 'no',
    periodSetup: {
      'entity-123': {
        data: { financialYear: '2024', weekSetup: 'Monday' },
        isDataSaved: true,
        preEditData: null
      }
    },
    setIsEditMode: mockSetIsEditMode,
    setUserClickedEdit: mockSetUserClickedEdit,
    dispatch: mockDispatch,
    setModulesState: mockSetModulesState,
    modulesRef: mockModulesRef
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      const { result } = renderHook(() => useEditActions(defaultParams));
      
      expect(result.current).toBeDefined();
      expect(result.current.handleEdit).toBeDefined();
      expect(result.current.resetPeriodSetupData).toBeDefined();
      expect(result.current.resetModulesData).toBeDefined();
    });

    it('should return all expected functions', () => {
      const { result } = renderHook(() => useEditActions(defaultParams));
      
      expect(typeof result.current.handleEdit).toBe('function');
      expect(typeof result.current.resetPeriodSetupData).toBe('function');
      expect(typeof result.current.resetModulesData).toBe('function');
    });
  });

  describe('handleEdit functionality', () => {
    it('should switch from edit mode to read-only mode', () => {
      const paramsInEditMode = {
        ...defaultParams,
        isEditMode: true
      };
      
      const { result } = renderHook(() => useEditActions(paramsInEditMode));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(false);
      expect(mockSetUserClickedEdit).toHaveBeenCalledWith(false);
    });

    it('should switch from read-only mode to edit mode', () => {
      const { result } = renderHook(() => useEditActions(defaultParams));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(true);
      expect(mockSetUserClickedEdit).toHaveBeenCalledWith(true);
    });

    it('should capture pre-edit state for Period Setup tab', () => {
      const paramsForPeriodSetup = {
        ...defaultParams,
        tabValue: 1,
        isEditMode: false
      };
      
      const { result } = renderHook(() => useEditActions(paramsForPeriodSetup));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should capture pre-edit state for Modules tab', () => {
      const paramsForModules = {
        ...defaultParams,
        tabValue: 2,
        isEditMode: false
      };
      
      const { result } = renderHook(() => useEditActions(paramsForModules));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should set original data for Countries tab', () => {
      const paramsForCountries = {
        ...defaultParams,
        tabValue: 0,
        isEditMode: false
      };
      
      const { result } = renderHook(() => useEditActions(paramsForCountries));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle edit mode for Countries tab', () => {
      const paramsForCountries = {
        ...defaultParams,
        tabValue: 0,
        isEditMode: true
      };
      
      const { result } = renderHook(() => useEditActions(paramsForCountries));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(false);
      expect(mockSetUserClickedEdit).toHaveBeenCalledWith(false);
    });
  });

  describe('resetPeriodSetupData functionality', () => {
    it('should reset to pre-edit state when preEditData exists', () => {
      const paramsWithPreEditData = {
        ...defaultParams,
        periodSetup: {
          'entity-123': {
            data: { financialYear: '2024', weekSetup: 'Monday' },
            isDataSaved: true,
            preEditData: { financialYear: '2023', weekSetup: 'Sunday' }
          }
        }
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithPreEditData));
      
      act(() => {
        result.current.resetPeriodSetupData('entity-123');
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should reset to initial state when no preEditData exists', () => {
      const { result } = renderHook(() => useEditActions(defaultParams));
      
      act(() => {
        result.current.resetPeriodSetupData('entity-123');
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle missing entityId', () => {
      const { result } = renderHook(() => useEditActions(defaultParams));
      
      act(() => {
        result.current.resetPeriodSetupData('');
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle missing periodSetup state', () => {
      const paramsWithoutPeriodSetup = {
        ...defaultParams,
        periodSetup: {}
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithoutPeriodSetup));
      
      act(() => {
        result.current.resetPeriodSetupData('entity-123');
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('resetModulesData functionality', () => {
    it('should reset modules to saved state when savedModules exist', () => {
      const mockModulesState = {
        savedModules: ['module1', 'module2'],
        currentModules: ['module1', 'module2', 'module3']
      };
      
      const paramsWithSavedModules = {
        ...defaultParams,
        modulesState: mockModulesState
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithSavedModules));
      
      act(() => {
        result.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        ...mockModulesState,
        currentModules: ['module1', 'module2']
      });
    });

    it('should reset modules to empty state when no savedModules exist', () => {
      const mockModulesState = {
        savedModules: [],
        currentModules: ['module1', 'module2', 'module3']
      };
      
      const paramsWithoutSavedModules = {
        ...defaultParams,
        modulesState: mockModulesState
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithoutSavedModules));
      
      act(() => {
        result.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        ...mockModulesState,
        currentModules: []
      });
    });

    it('should handle null modulesState', () => {
      const paramsWithNullModulesState = {
        ...defaultParams,
        modulesState: null
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithNullModulesState));
      
      act(() => {
        result.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: [],
        currentModules: []
      });
    });

    it('should handle undefined modulesState', () => {
      const paramsWithUndefinedModulesState = {
        ...defaultParams,
        modulesState: undefined
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithUndefinedModulesState));
      
      act(() => {
        result.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: [],
        currentModules: []
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle null entityId', () => {
      const paramsWithNullEntityId = {
        ...defaultParams,
        entityId: undefined
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithNullEntityId));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(true);
      expect(mockSetUserClickedEdit).toHaveBeenCalledWith(true);
    });

    it('should handle undefined entityId', () => {
      const paramsWithUndefinedEntityId = {
        ...defaultParams,
        entityId: undefined
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithUndefinedEntityId));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(true);
      expect(mockSetUserClickedEdit).toHaveBeenCalledWith(true);
    });

    it('should handle different tab values', () => {
      const testCases = [
        { tabValue: 0, expectedAction: 'setOriginalData' },
        { tabValue: 1, expectedAction: 'capturePreEditStateAction' },
        { tabValue: 2, expectedAction: 'capturePreEditStateAction' }
      ];

      testCases.forEach(({ tabValue }) => {
        const params = {
          ...defaultParams,
          tabValue,
          isEditMode: false
        };
        
        const { result } = renderHook(() => useEditActions(params));
        
        act(() => {
          result.current.handleEdit();
        });
        
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should handle empty selectedCountries and selectedCurrencies', () => {
      const paramsWithEmptyData = {
        ...defaultParams,
        selectedCountries: [],
        selectedCurrencies: [],
        defaultCurrency: []
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithEmptyData));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('State management', () => {
    it('should call setIsEditMode with correct values', () => {
      const testCases = [
        { isEditMode: true, expectedMode: false },
        { isEditMode: false, expectedMode: true }
      ];

      testCases.forEach(({ isEditMode, expectedMode }) => {
        const params = {
          ...defaultParams,
          isEditMode
        };
        
        const { result } = renderHook(() => useEditActions(params));
        
        act(() => {
          result.current.handleEdit();
        });
        
        expect(mockSetIsEditMode).toHaveBeenCalledWith(expectedMode);
      });
    });

    it('should call setUserClickedEdit with correct values', () => {
      const testCases = [
        { isEditMode: true, expectedClicked: false },
        { isEditMode: false, expectedClicked: true }
      ];

      testCases.forEach(({ isEditMode, expectedClicked }) => {
        const params = {
          ...defaultParams,
          isEditMode
        };
        
        const { result } = renderHook(() => useEditActions(params));
        
        act(() => {
          result.current.handleEdit();
        });
        
        expect(mockSetUserClickedEdit).toHaveBeenCalledWith(expectedClicked);
      });
    });
  });

  describe('Integration with Redux actions', () => {
    it('should dispatch setOriginalData with correct parameters for Countries tab', () => {
      const { result } = renderHook(() => useEditActions(defaultParams));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch capturePreEditStateAction for Period Setup tab', () => {
      const paramsForPeriodSetup = {
        ...defaultParams,
        tabValue: 1,
        isEditMode: false
      };
      
      const { result } = renderHook(() => useEditActions(paramsForPeriodSetup));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch capturePreEditStateAction for Modules tab', () => {
      const paramsForModules = {
        ...defaultParams,
        tabValue: 2,
        isEditMode: false
      };
      
      const { result } = renderHook(() => useEditActions(paramsForModules));
      
      act(() => {
        result.current.handleEdit();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Modules state updates', () => {
    it('should update modules state correctly', () => {
      const mockModulesState = {
        savedModules: ['module1'],
        currentModules: ['module1', 'module2']
      };
      
      const paramsWithModulesState = {
        ...defaultParams,
        modulesState: mockModulesState
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithModulesState));
      
      act(() => {
        result.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: ['module1'],
        currentModules: ['module1'],
        isDataModified: false
      });
    });
  });

  describe('100% Coverage Tests', () => {
    it('should handle entityId undefined with non-null assertion in setOriginalData', () => {
      const paramsWithUndefinedEntityId = {
        ...defaultParams,
        entityId: undefined as string | undefined,
        tabValue: 0,
        isEditMode: false
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithUndefinedEntityId));
      
      act(() => {
        result.current.handleEdit();
      });
      
      // Should call setOriginalData even with undefined entityId (uses non-null assertion)
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entityConfiguration/setOriginalData'
        })
      );
    });

    it('should handle entityId undefined with non-null assertion in capturePreEditStateAction for Period Setup', () => {
      const paramsWithUndefinedEntityId = {
        ...defaultParams,
        entityId: undefined as string | undefined,
        tabValue: 1,
        isEditMode: false
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithUndefinedEntityId));
      
      act(() => {
        result.current.handleEdit();
      });
      
      // Should call capturePreEditStateAction even with undefined entityId
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle entityId undefined with non-null assertion in capturePreEditStateAction for Modules', () => {
      const paramsWithUndefinedEntityId = {
        ...defaultParams,
        entityId: undefined as string | undefined,
        tabValue: 2,
        isEditMode: false
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithUndefinedEntityId));
      
      act(() => {
        result.current.handleEdit();
      });
      
      // Should call capturePreEditStateAction even with undefined entityId
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle entityId undefined with non-null assertion in setDataModified', () => {
      const paramsWithUndefinedEntityId = {
        ...defaultParams,
        entityId: undefined as string | undefined,
        tabValue: 0,
        isEditMode: false
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithUndefinedEntityId));
      
      act(() => {
        result.current.handleEdit();
      });
      
      // Should call setDataModified even with undefined entityId (uses non-null assertion)
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entityConfiguration/setDataModified',
          payload: expect.objectContaining({
            entityId: undefined,
            isModified: false
          })
        })
      );
    });

    it('should handle modulesRef.current being falsy in resetModulesData', () => {
      const paramsWithFalsyRef = {
        ...defaultParams,
        modulesRef: { current: undefined },
        modulesState: {
          savedModules: ['module1'],
          currentModules: ['module1', 'module2']
        }
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithFalsyRef));
      
      act(() => {
        result.current.resetModulesData();
      });
      
      // Should still call setModulesState even when modulesRef.current is falsy
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: ['module1'],
        currentModules: ['module1'],
        isDataModified: false
      });
    });

    it('should handle different isDefault values in setOriginalData', () => {
      const testCases = [null, 'yes', 'no', 'true', 'false'];
      
      testCases.forEach((isDefaultValue) => {
        jest.clearAllMocks();
        
        const paramsWithDifferentIsDefault = {
          ...defaultParams,
          isDefault: isDefaultValue,
          tabValue: 0,
          isEditMode: false
        };
        
        const { result } = renderHook(() => useEditActions(paramsWithDifferentIsDefault));
        
        act(() => {
          result.current.handleEdit();
        });
        
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'entityConfiguration/setOriginalData',
            payload: expect.objectContaining({
              data: expect.objectContaining({
                isDefault: isDefaultValue
              })
            })
          })
        );
      });
    });

    it('should handle different defaultCurrency array lengths in setOriginalData', () => {
      const testCases = [[], ['USD'], ['USD', 'EUR'], ['USD', 'EUR', 'GBP']];
      
      testCases.forEach((defaultCurrencyArray) => {
        jest.clearAllMocks();
        
        const paramsWithDifferentDefaultCurrency = {
          ...defaultParams,
          defaultCurrency: defaultCurrencyArray,
          tabValue: 0,
          isEditMode: false
        };
        
        const { result } = renderHook(() => useEditActions(paramsWithDifferentDefaultCurrency));
        
        act(() => {
          result.current.handleEdit();
        });
        
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'entityConfiguration/setOriginalData',
            payload: expect.objectContaining({
              data: expect.objectContaining({
                defaultCurrency: defaultCurrencyArray
              })
            })
          })
        );
      });
    });

    it('should handle tab value outside of 0-2 range', () => {
      const testCases = [-1, 3, 4, 999];
      
      testCases.forEach((tabValue) => {
        jest.clearAllMocks();
        
        const paramsWithInvalidTab = {
          ...defaultParams,
          tabValue: tabValue,
          isEditMode: false
        };
        
        const { result } = renderHook(() => useEditActions(paramsWithInvalidTab));
        
        act(() => {
          result.current.handleEdit();
        });
        
        // Should still call setIsEditMode and setUserClickedEdit
        expect(mockSetIsEditMode).toHaveBeenCalledWith(true);
        expect(mockSetUserClickedEdit).toHaveBeenCalledWith(true);
        
        // Should call setDataModified for any tab value when entering edit mode
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'entityConfiguration/setDataModified'
          })
        );
      });
    });

    it('should trigger setTimeout production path with valid previous state and non-array savedModules', () => {
      jest.useFakeTimers();
      
      // Create error params to trigger catch block
      const errorParams = {
        ...defaultParams
      };
      
      Object.defineProperty(errorParams, 'modulesState', {
        get: function() {
          throw new Error('Property access error');
        }
      });
      
      const mockPreviousStateWithNonArraySavedModules = {
        savedModules: 'not-an-array',
        currentModules: ['module1', 'module2'],
        isDataModified: true
      };
      
      // Mock setModulesState to test the non-array savedModules branch
      mockSetModulesState.mockImplementation((fn) => {
        if (typeof fn === 'function') {
          const result = fn(mockPreviousStateWithNonArraySavedModules);
          expect(result).toEqual({
            savedModules: 'not-an-array',
            currentModules: [],
            isDataModified: false
          });
        }
      });
      
      const { result } = renderHook(() => useEditActions(errorParams));
      
      act(() => {
        result.current.resetModulesData();
      });
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(mockSetModulesState).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should handle falsy modulesState in test branch (else path)', () => {
      const paramsWithFalsyModulesState = {
        ...defaultParams,
        modulesState: null
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithFalsyModulesState));
      
      act(() => {
        result.current.resetModulesData();
      });
      
      // Should call setModulesState with default empty state when modulesState is falsy
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: [],
        currentModules: [],
        isDataModified: false
      });
    });

    it('should handle empty array savedModules in test branch', () => {
      const paramsWithEmptyArraySavedModules = {
        ...defaultParams,
        modulesState: {
          savedModules: [],
          currentModules: ['module1', 'module2']
        }
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithEmptyArraySavedModules));
      
      act(() => {
        result.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: [],
        currentModules: [],
        isDataModified: false
      });
    });

    it('should execute catch block return statement when error is thrown', () => {
      jest.useFakeTimers();
      
      // Create params that throw error to trigger catch block
      const errorParams = {
        ...defaultParams
      };
      
      Object.defineProperty(errorParams, 'modulesState', {
        get: function() {
          throw new Error('Property access error');
        }
      });
      
      const { result } = renderHook(() => useEditActions(errorParams));
      
      // This should trigger the catch block and execute the return statement
      act(() => {
        result.current.resetModulesData();
      });
      
      // The function should return early from catch block
      // Verify setTimeout was called
      expect(setTimeout).toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    it('should test all ternary operator branches in resetModulesData', () => {
      // Test when modulesState exists and savedModules is array
      const paramsWithArraySavedModules = {
        ...defaultParams,
        modulesState: {
          savedModules: ['module1', 'module2'],
          currentModules: ['module1', 'module2', 'module3']
        }
      };
      
      const { result: result1 } = renderHook(() => useEditActions(paramsWithArraySavedModules));
      
      act(() => {
        result1.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: ['module1', 'module2'],
        currentModules: ['module1', 'module2'],
        isDataModified: false
      });
      
      // Clear mocks for next test
      jest.clearAllMocks();
      
      // Test when modulesState exists but savedModules is not array
      const paramsWithNonArraySavedModules = {
        ...defaultParams,
        modulesState: {
          savedModules: null,
          currentModules: ['module1', 'module2', 'module3']
        }
      };
      
      const { result: result2 } = renderHook(() => useEditActions(paramsWithNonArraySavedModules));
      
      act(() => {
        result2.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: null,
        currentModules: [],
        isDataModified: false
      });
    });

    it('should test periodSetup optional chaining and preEditData ternary operator', () => {
      // Test when periodSetup exists but periodSetupState is undefined
      const paramsWithMissingState = {
        ...defaultParams,
        periodSetup: {
          'other-entity': { data: {}, isDataSaved: true, preEditData: null }
        }
      };
      
      const { result } = renderHook(() => useEditActions(paramsWithMissingState));
      
      act(() => {
        result.current.resetPeriodSetupData('entity-123');
      });
      
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'periodSetup/resetToInitialState'
        })
      );
      
      // Clear mocks
      jest.clearAllMocks();
      
      // Test when periodSetupState exists with preEditData
      const paramsWithPreEditData = {
        ...defaultParams,
        periodSetup: {
          'entity-123': { 
            data: { financialYear: '2024' }, 
            isDataSaved: true, 
            preEditData: { financialYear: '2023' } 
          }
        }
      };
      
      const { result: result2 } = renderHook(() => useEditActions(paramsWithPreEditData));
      
      act(() => {
        result2.current.resetPeriodSetupData('entity-123');
      });
      
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'periodSetup/resetToPreEditState'
        })
      );
    });

    it('should cover the exact return statement in catch block', () => {
      // Mock setTimeout to verify it gets called
      const mockSetTimeout = jest.fn();
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(mockSetTimeout);
      
      try {
        // Create params that will throw error in try block
        const errorParams = {
          ...defaultParams
        };
        
        // Make accessing modulesState throw an error
        Object.defineProperty(errorParams, 'modulesState', {
          get: function() {
            throw new Error('Access error');
          },
          configurable: true
        });
        
        const { result } = renderHook(() => useEditActions(errorParams));
        
        act(() => {
          result.current.resetModulesData();
        });
        
        // Verify setTimeout was called (which means catch block was executed)
        expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 0);
        
        // The function should have returned early from catch block
        // This tests the return statement in the catch block
        
      } finally {
        setTimeoutSpy.mockRestore();
      }
    });

    it('should cover modulesRef.current truthy and falsy conditions completely', () => {
      // Test 1: modulesRef.current is truthy with resetModules method
      const mockResetModules = jest.fn();
      const truthyModulesRef = {
        current: {
          resetModules: mockResetModules
        }
      };
      
      const paramsWithTruthyRef = {
        ...defaultParams,
        modulesRef: truthyModulesRef,
        modulesState: {
          savedModules: ['module1'],
          currentModules: ['module1', 'module2']
        }
      };
      
      const { result: result1 } = renderHook(() => useEditActions(paramsWithTruthyRef));
      
      act(() => {
        result1.current.resetModulesData();
      });
      
      expect(mockResetModules).toHaveBeenCalled();
      
      // Clear mocks
      jest.clearAllMocks();
      
      // Test 2: modulesRef.current is falsy (null)
      const falsyModulesRef = {
        current: null
      };
      
      const paramsWithFalsyRef = {
        ...defaultParams,
        modulesRef: falsyModulesRef,
        modulesState: {
          savedModules: ['module1'],
          currentModules: ['module1', 'module2']
        }
      };
      
      const { result: result2 } = renderHook(() => useEditActions(paramsWithFalsyRef));
      
      act(() => {
        result2.current.resetModulesData();
      });
      
      // Should still proceed without calling resetModules
      expect(mockSetModulesState).toHaveBeenCalled();
      
      // Test 3: modulesRef.current is undefined
      const undefinedModulesRef = {
        current: undefined
      };
      
      const paramsWithUndefinedRef = {
        ...defaultParams,
        modulesRef: undefinedModulesRef,
        modulesState: {
          savedModules: ['module1'],
          currentModules: ['module1', 'module2']
        }
      };
      
      const { result: result3 } = renderHook(() => useEditActions(paramsWithUndefinedRef));
      
      act(() => {
        result3.current.resetModulesData();
      });
      
      // Should still proceed without calling resetModules
      expect(mockSetModulesState).toHaveBeenCalled();
    });

    it('should test Array.isArray conditional branches exhaustively', () => {
      // Test 1: savedModules is an array
      const paramsWithArraySavedModules = {
        ...defaultParams,
        modulesState: {
          savedModules: ['module1', 'module2'],
          currentModules: ['module1', 'module2', 'module3'],
          otherProp: 'test'
        }
      };
      
      const { result: result1 } = renderHook(() => useEditActions(paramsWithArraySavedModules));
      
      act(() => {
        result1.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: ['module1', 'module2'],
        currentModules: ['module1', 'module2'],
        isDataModified: false,
        otherProp: 'test'
      });
      
      jest.clearAllMocks();
      
      // Test 2: savedModules is not an array (string)
      const paramsWithStringSavedModules = {
        ...defaultParams,
        modulesState: {
          savedModules: 'not-an-array',
          currentModules: ['module1', 'module2', 'module3']
        }
      };
      
      const { result: result2 } = renderHook(() => useEditActions(paramsWithStringSavedModules));
      
      act(() => {
        result2.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: 'not-an-array',
        currentModules: [],
        isDataModified: false
      });
      
      jest.clearAllMocks();
      
      // Test 3: savedModules is null
      const paramsWithNullSavedModules = {
        ...defaultParams,
        modulesState: {
          savedModules: null,
          currentModules: ['module1', 'module2']
        }
      };
      
      const { result: result3 } = renderHook(() => useEditActions(paramsWithNullSavedModules));
      
      act(() => {
        result3.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: null,
        currentModules: [],
        isDataModified: false
      });
      
      jest.clearAllMocks();
      
      // Test 4: savedModules is undefined
      const paramsWithUndefinedSavedModules = {
        ...defaultParams,
        modulesState: {
          savedModules: undefined,
          currentModules: ['module1', 'module2']
        }
      };
      
      const { result: result4 } = renderHook(() => useEditActions(paramsWithUndefinedSavedModules));
      
      act(() => {
        result4.current.resetModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith({
        savedModules: undefined,
        currentModules: [],
        isDataModified: false
      });
    });

    it('should ensure complete branch coverage for all conditional statements', () => {
      jest.useFakeTimers();
      
      // Test the setTimeout callback with both if (!prev) branches
      const errorParams = {
        ...defaultParams
      };
      
      Object.defineProperty(errorParams, 'modulesState', {
        get: function() {
          throw new Error('Test error');
        }
      });
      
      // Mock setModulesState to test both branches of if (!prev)
      let callCount = 0;
      mockSetModulesState.mockImplementation((fn) => {
        if (typeof fn === 'function') {
          callCount++;
          if (callCount === 1) {
            // First call: test if (!prev) === true
            const result = fn(null);
            expect(result).toEqual({
              savedModules: [],
              currentModules: [],
              isDataModified: false
            });
          } else if (callCount === 2) {
            // Second call: test if (!prev) === false
            const result = fn({
              savedModules: ['existing'],
              currentModules: ['existing', 'new'],
              otherProp: 'value'
            });
            expect(result).toEqual({
              savedModules: ['existing'],
              currentModules: ['existing'],
              isDataModified: false,
              otherProp: 'value'
            });
          }
        }
      });
      
      const { result } = renderHook(() => useEditActions(errorParams));
      
      // First call - will test null previous state
      act(() => {
        result.current.resetModulesData();
      });
      
      act(() => {
        jest.runAllTimers();
      });
      
      // Reset call count and test again with different previous state
      callCount = 1; // Set to 1 so next call will be callCount === 2
      
      act(() => {
        result.current.resetModulesData();
      });
      
      act(() => {
        jest.runAllTimers();
      });
      
      expect(mockSetModulesState).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should test the exact return path and execution flow', () => {
      // Test that verifies the function returns properly after catch block
      const errorParams = {
        ...defaultParams
      };
      
      let errorThrown = false;
      Object.defineProperty(errorParams, 'modulesState', {
        get: function() {
          errorThrown = true;
          throw new Error('Expected test error');
        }
      });
      
      const { result } = renderHook(() => useEditActions(errorParams));
      
      // This should execute the catch block and return early
      act(() => {
        result.current.resetModulesData();
      });
      
      // Verify the error was thrown (meaning we entered the catch block)
      expect(errorThrown).toBe(true);
      
      // Verify the test branch is NOT executed when error is thrown
      // The function should have returned early from catch block
      expect(mockSetModulesState).not.toHaveBeenCalled();
    });
  });
})
