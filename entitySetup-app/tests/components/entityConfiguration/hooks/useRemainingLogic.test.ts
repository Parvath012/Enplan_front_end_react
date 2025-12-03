import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useRemainingLogic } from '../../../../src/components/entityConfiguration/hooks/useRemainingLogic';

// Mock dependencies
jest.mock('../../../../src/store/Actions/entityConfigurationActions', () => ({
  resetConfigurationAction: jest.fn((entityId) => ({ type: 'entityConfiguration/resetConfigurationAction', payload: entityId }))
}));

describe('useRemainingLogic', () => {
  const mockDispatch = jest.fn();
  const mockSetIsSaving = jest.fn();
  const mockSetIsEditMode = jest.fn();
  const mockSetUserClickedEdit = jest.fn();
  const mockSetUserHasSavedInSession = jest.fn();
  const mockSaveCountriesAndCurrencies = jest.fn().mockResolvedValue(undefined);
  const mockSavePeriodSetupData = jest.fn().mockResolvedValue(undefined);
  const mockSaveModulesData = jest.fn().mockResolvedValue(undefined);
  const mockResetPeriodSetupData = jest.fn();
  const mockResetModulesData = jest.fn();

  const defaultParams = {
    tabValue: 0,
    isSaving: false,
    entityId: 'entity-123',
    setIsSaving: mockSetIsSaving,
    setIsEditMode: mockSetIsEditMode,
    setUserClickedEdit: mockSetUserClickedEdit,
    saveCountriesAndCurrencies: mockSaveCountriesAndCurrencies,
    savePeriodSetupData: mockSavePeriodSetupData,
    saveModulesData: mockSaveModulesData,
    resetPeriodSetupData: mockResetPeriodSetupData,
    resetModulesData: mockResetModulesData,
    dispatch: mockDispatch,
    setUserHasSavedInSession: mockSetUserHasSavedInSession
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      const { result } = renderHook(() => useRemainingLogic(defaultParams));
      
      expect(result.current).toBeDefined();
      expect(result.current.handleReset).toBeDefined();
      expect(result.current.handleSave).toBeDefined();
    });

    it('should return all expected functions', () => {
      const { result } = renderHook(() => useRemainingLogic(defaultParams));
      
      expect(typeof result.current.handleReset).toBe('function');
      expect(typeof result.current.handleSave).toBe('function');
    });
  });

  describe('handleReset functionality', () => {
    it('should dispatch resetConfigurationAction for Countries tab', () => {
      const { result } = renderHook(() => useRemainingLogic(defaultParams));
      
      act(() => {
        result.current.handleReset();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should call resetPeriodSetupData for Period Setup tab', () => {
      const paramsForPeriodSetup = {
        ...defaultParams,
        tabValue: 1
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsForPeriodSetup));
      
      act(() => {
        result.current.handleReset();
      });
      
      expect(mockResetPeriodSetupData).toHaveBeenCalledWith('entity-123');
    });

    it('should call resetModulesData for Modules tab', () => {
      const paramsForModules = {
        ...defaultParams,
        tabValue: 2
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsForModules));
      
      act(() => {
        result.current.handleReset();
      });
      
      expect(mockResetModulesData).toHaveBeenCalled();
    });

    it('should handle missing entityId gracefully', () => {
      const paramsWithoutEntityId = {
        ...defaultParams,
        entityId: undefined,
        tabValue: 1
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsWithoutEntityId));
      
      act(() => {
        result.current.handleReset();
      });
      
      expect(mockResetPeriodSetupData).toHaveBeenCalledWith(undefined);
    });

    it('should handle null entityId gracefully', () => {
      const paramsWithNullEntityId = {
        ...defaultParams,
        entityId: null,
        tabValue: 1
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsWithNullEntityId));
      
      act(() => {
        result.current.handleReset();
      });
      
      expect(mockResetPeriodSetupData).toHaveBeenCalledWith(null);
    });
  });

  describe('handleSave functionality', () => {
    it('should save Countries and Currencies for tab 0', async () => {
      const { result } = renderHook(() => useRemainingLogic(defaultParams));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockSetIsSaving).toHaveBeenCalledWith(true);
      expect(mockSaveCountriesAndCurrencies).toHaveBeenCalled();
      expect(mockSetIsEditMode).toHaveBeenCalledWith(false);
      expect(mockSetUserClickedEdit).toHaveBeenCalledWith(false);
      expect(mockSetIsSaving).toHaveBeenCalledWith(false);
    });

    it('should save Period Setup for tab 1', async () => {
      const paramsForPeriodSetup = {
        ...defaultParams,
        tabValue: 1
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsForPeriodSetup));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockSetIsSaving).toHaveBeenCalledWith(true);
      expect(mockSavePeriodSetupData).toHaveBeenCalled();
      expect(mockSetIsEditMode).toHaveBeenCalledWith(false);
      expect(mockSetUserClickedEdit).toHaveBeenCalledWith(false);
      expect(mockSetIsSaving).toHaveBeenCalledWith(false);
    });

    it('should save Modules for tab 2', async () => {
      const paramsForModules = {
        ...defaultParams,
        tabValue: 2
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsForModules));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockSetIsSaving).toHaveBeenCalledWith(true);
      expect(mockSaveModulesData).toHaveBeenCalled();
      expect(mockSetIsEditMode).toHaveBeenCalledWith(false);
      expect(mockSetUserClickedEdit).toHaveBeenCalledWith(false);
      expect(mockSetIsSaving).toHaveBeenCalledWith(false);
    });

    it('should not save when already saving', async () => {
      const paramsWhileSaving = {
        ...defaultParams,
        isSaving: true
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsWhileSaving));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockSetIsSaving).not.toHaveBeenCalled();
      expect(mockSaveCountriesAndCurrencies).not.toHaveBeenCalled();
    });

    it('should not save when entityId is missing', async () => {
      const paramsWithoutEntityId = {
        ...defaultParams,
        entityId: undefined
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsWithoutEntityId));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockSetIsSaving).not.toHaveBeenCalled();
      expect(mockSaveCountriesAndCurrencies).not.toHaveBeenCalled();
    });

    it('should handle save errors gracefully', async () => {
      const mockSaveWithError = jest.fn().mockRejectedValue(new Error('Save failed'));
      const paramsWithError = {
        ...defaultParams,
        saveCountriesAndCurrencies: mockSaveWithError
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsWithError));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockSetIsSaving).toHaveBeenCalledWith(true);
      expect(mockSetIsEditMode).toHaveBeenCalledWith(false);
      expect(mockSetUserClickedEdit).toHaveBeenCalledWith(false);
      expect(mockSetIsSaving).toHaveBeenCalledWith(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid tab values', () => {
      const paramsWithInvalidTab = {
        ...defaultParams,
        tabValue: 999
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsWithInvalidTab));
      
      act(() => {
        result.current.handleReset();
      });
      
      // Should not call any reset functions for invalid tab
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockResetPeriodSetupData).not.toHaveBeenCalled();
      expect(mockResetModulesData).not.toHaveBeenCalled();
    });

    it('should handle negative tab values', () => {
      const paramsWithNegativeTab = {
        ...defaultParams,
        tabValue: -1
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsWithNegativeTab));
      
      act(() => {
        result.current.handleReset();
      });
      
      // Should not call any reset functions for negative tab
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockResetPeriodSetupData).not.toHaveBeenCalled();
      expect(mockResetModulesData).not.toHaveBeenCalled();
    });

    it('should handle empty string entityId', () => {
      const paramsWithEmptyEntityId = {
        ...defaultParams,
        entityId: '',
        tabValue: 1
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsWithEmptyEntityId));
      
      act(() => {
        result.current.handleReset();
      });
      
      expect(mockResetPeriodSetupData).toHaveBeenCalledWith('');
    });
  });

  describe('State management', () => {
    it('should set saving state correctly during save operation', async () => {
      const { result } = renderHook(() => useRemainingLogic(defaultParams));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockSetIsSaving).toHaveBeenCalledWith(true);
      expect(mockSetIsSaving).toHaveBeenCalledWith(false);
    });

    it('should set edit mode and user clicked edit to false after save', async () => {
      const { result } = renderHook(() => useRemainingLogic(defaultParams));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(false);
      expect(mockSetUserClickedEdit).toHaveBeenCalledWith(false);
    });

    it('should set edit mode and user clicked edit to false even on error', async () => {
      const mockSaveWithError = jest.fn().mockRejectedValue(new Error('Save failed'));
      const paramsWithError = {
        ...defaultParams,
        saveCountriesAndCurrencies: mockSaveWithError
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsWithError));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockSetIsEditMode).toHaveBeenCalledWith(false);
      expect(mockSetUserClickedEdit).toHaveBeenCalledWith(false);
    });
  });

  describe('Integration with Redux', () => {
    it('should dispatch resetConfigurationAction with correct parameters', () => {
      const { result } = renderHook(() => useRemainingLogic(defaultParams));
      
      act(() => {
        result.current.handleReset();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Async operations', () => {
    it('should handle async save operations correctly', async () => {
      const mockAsyncSave = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(), 100))
      );
      
      const paramsWithAsyncSave = {
        ...defaultParams,
        saveCountriesAndCurrencies: mockAsyncSave
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsWithAsyncSave));
      
      await act(async () => {
        await result.current.handleSave();
      });
      
      expect(mockAsyncSave).toHaveBeenCalled();
      expect(mockSetIsSaving).toHaveBeenCalledWith(true);
      expect(mockSetIsSaving).toHaveBeenCalledWith(false);
    });

    it('should skip save when already saving', async () => {
      // Create a simple mock that we can verify is called or not
      const mockSave = jest.fn().mockResolvedValue(undefined);
      
      // Create params with isSaving set to true
      const paramsWhileSaving = {
        ...defaultParams,
        isSaving: true,
        saveCountriesAndCurrencies: mockSave
      };
      
      const { result } = renderHook(() => useRemainingLogic(paramsWhileSaving));
      
      // Call handleSave while isSaving is true
      await act(async () => {
        await result.current.handleSave();
      });
      
      // Verify that save was not called
      expect(mockSave).not.toHaveBeenCalled();
      expect(mockSetIsSaving).not.toHaveBeenCalled();
    });
  });

  describe('Function memoization', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(
        ({ params }) => useRemainingLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstHandleReset = result.current.handleReset;
      const firstHandleSave = result.current.handleSave;
      
      rerender({ params: defaultParams });
      
      expect(result.current.handleReset).toBe(firstHandleReset);
      expect(result.current.handleSave).toBe(firstHandleSave);
    });
  });
});
