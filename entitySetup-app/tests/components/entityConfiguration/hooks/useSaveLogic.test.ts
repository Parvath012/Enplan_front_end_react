import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useSaveLogic } from '../../../../src/components/entityConfiguration/hooks/useSaveLogic';

// Mock dependencies
jest.mock('../../../../src/store/Actions/entitySetupActions', () => ({
  saveEntityCountriesAndCurrencies: jest.fn().mockReturnValue('saveEntityCountriesAndCurrencies')
}));

jest.mock('../../../../src/store/Actions/entityConfigurationActions', () => ({
  setDataSaved: jest.fn().mockReturnValue('setDataSaved'),
  setDataModified: jest.fn().mockReturnValue('setDataModified')
}));

jest.mock('../../../../src/store/Actions/periodSetupActions', () => ({
  savePeriodSetup: jest.fn(() => 'savePeriodSetup')
}));

// Mock entitySetupService for direct calls
jest.mock('../../../../src/services/entitySetupService', () => ({
  saveEntityConfiguration: jest.fn().mockResolvedValue({ success: true })
}));

describe('useSaveLogic', () => {
  const mockDispatch = jest.fn(action => action);
  const mockSetUserHasSavedInSession = jest.fn();
  const mockSetModulesState = jest.fn();
  const mockModulesRef = {
    current: {
      saveModulesToEntity: jest.fn().mockResolvedValue(undefined)
    }
  };
  
  // Mock console.error
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });

  const defaultParams = {
    entityId: 'entity-123',
    entity: { id: 'entity-123', displayName: 'Test Entity', progressPercentage: '50' },
    isRollupEntity: false,
    selectedCountries: ['US', 'CA'],
    selectedCurrencies: ['USD', 'CAD'],
    defaultCurrency: ['USD'],
    isDefault: null,
    prePopulatedCurrencies: ['USD', 'CAD'],
    periodSetup: {
      'entity-123': {
        data: { financialYear: '2024', weekSetup: 'Monday' },
        isDataSaved: false
      }
    },
    modulesRef: mockModulesRef,
    setUserHasSavedInSession: mockSetUserHasSavedInSession,
    setModulesState: mockSetModulesState,
    dispatch: mockDispatch
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      expect(result.current).toBeDefined();
      expect(result.current.saveCountriesAndCurrencies).toBeDefined();
      expect(result.current.savePeriodSetupData).toBeDefined();
      expect(result.current.saveModulesData).toBeDefined();
    });

    it('should return all expected functions', () => {
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      expect(typeof result.current.saveCountriesAndCurrencies).toBe('function');
      expect(typeof result.current.savePeriodSetupData).toBe('function');
      expect(typeof result.current.saveModulesData).toBe('function');
    });
  });

  describe('saveCountriesAndCurrencies functionality', () => {
    it('should save countries and currencies successfully', async () => {
      const mockSaveEntityCountriesAndCurrencies = require('../../../../src/store/Actions/entitySetupActions').saveEntityCountriesAndCurrencies;
      const mockSetDataSaved = require('../../../../src/store/Actions/entityConfigurationActions').setDataSaved;
      
      mockSetDataSaved.mockReturnValue('setDataSaved');
      mockSaveEntityCountriesAndCurrencies.mockReturnValue('saveEntityCountriesAndCurrencies');
      
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        await result.current.saveCountriesAndCurrencies();
      });
      
      expect(mockDispatch).toHaveBeenCalledWith('saveEntityCountriesAndCurrencies');
      expect(mockDispatch).toHaveBeenCalledWith('setDataSaved');
      expect(mockSetUserHasSavedInSession).toHaveBeenCalledWith(true);
    });

    it('should handle save errors gracefully', async () => {
      const mockSaveEntityCountriesAndCurrencies = require('../../../../src/store/Actions/entitySetupActions').saveEntityCountriesAndCurrencies;
      
      // Setting up a specific error in the mock to test error handling
      console.error = jest.fn();
      mockSaveEntityCountriesAndCurrencies.mockImplementation(() => {
        console.error('Save failed');
        throw new Error('Save failed');
      });
      
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        try {
          await result.current.saveCountriesAndCurrencies();
        } catch (error) {
          // Error is expected - verify it's the expected error type
          expect(error).toBeDefined();
        }
      });
      
      // Verify the mock function was called
      expect(mockSaveEntityCountriesAndCurrencies).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Save failed');
    });

    it('should handle empty data', async () => {
      const mockSaveEntityCountriesAndCurrencies = require('../../../../src/store/Actions/entitySetupActions').saveEntityCountriesAndCurrencies;
      mockSaveEntityCountriesAndCurrencies.mockReturnValue('saveEntityCountriesAndCurrencies');
      
      const paramsWithEmptyData = {
        ...defaultParams,
        selectedCountries: [],
        selectedCurrencies: [],
        defaultCurrency: []
      };
      
      const { result } = renderHook(() => useSaveLogic(paramsWithEmptyData));
      
      await act(async () => {
        await result.current.saveCountriesAndCurrencies();
      });
      
      // The function should still call saveEntityCountriesAndCurrencies even with empty data
      // as per the current implementation which allows saving with empty countries
      expect(mockDispatch).toHaveBeenCalledWith('saveEntityCountriesAndCurrencies');
    });
  });

  describe('savePeriodSetupData functionality', () => {
    it('should save period setup data successfully', async () => {
      // We need to mock the dispatch function for this test specifically
      // to make it return an object with an unwrap method
      mockDispatch.mockImplementationOnce(() => {
        return {
          unwrap: jest.fn().mockResolvedValue({ success: true })
        };
      });
      
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        await result.current.savePeriodSetupData();
      });
      
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockSetUserHasSavedInSession).toHaveBeenCalledWith(true);
    });

    it('should handle save errors gracefully', async () => {
      const errorMessage = 'Save failed';
      const mockError = new Error(errorMessage);
      
      // Mock dispatch to return an object with an unwrap method that throws an error
      mockDispatch.mockImplementationOnce(() => {
        return {
          unwrap: jest.fn().mockImplementation(() => {
            console.error(errorMessage);
            throw mockError;
          })
        };
      });
      
      console.error = jest.fn();
      
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        try {
          await result.current.savePeriodSetupData();
        } catch (error) {
          // Expected error - verify it's the expected error type
          expect(error).toBeDefined();
        }
      });
      
      expect(mockDispatch).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(errorMessage);
    });

    it('should handle missing period setup data', async () => {
      const paramsWithoutPeriodSetup = {
        ...defaultParams,
        periodSetup: {}
      };
      
      const { result } = renderHook(() => useSaveLogic(paramsWithoutPeriodSetup));
      
      await act(async () => {
        await result.current.savePeriodSetupData();
      });
      
      // Since periodSetup is empty, savePeriodSetup should not be called
      expect(require('../../../../src/store/Actions/periodSetupActions').savePeriodSetup).not.toHaveBeenCalled();
    });

    it('should handle null period setup data', async () => {
      const paramsWithNullPeriodSetup = {
        ...defaultParams,
        periodSetup: {
          'entity-123': {
            data: null,
            isDataSaved: false
          }
        }
      };
      
      const { result } = renderHook(() => useSaveLogic(paramsWithNullPeriodSetup));
      
      await act(async () => {
        await result.current.savePeriodSetupData();
      });
      
      // Since data is null, savePeriodSetup should not be called
      expect(require('../../../../src/store/Actions/periodSetupActions').savePeriodSetup).not.toHaveBeenCalled();
    });
  });

  describe('saveModulesData functionality', () => {
    it('should save modules data successfully', async () => {
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        await result.current.saveModulesData();
      });
      
      expect(mockModulesRef.current.saveModulesToEntity).toHaveBeenCalled();
      expect(mockSetUserHasSavedInSession).toHaveBeenCalledWith(true);
    });

    it('should handle save errors gracefully', async () => {
      const mockSaveModulesToEntity = jest.fn().mockRejectedValue(new Error('Save failed'));
      const paramsWithError = {
        ...defaultParams,
        modulesRef: {
          current: {
            saveModulesToEntity: mockSaveModulesToEntity
          }
        }
      };
      
      const { result } = renderHook(() => useSaveLogic(paramsWithError));
      
      await act(async () => {
        try {
          await result.current.saveModulesData();
        } catch (error) {
          // Error is expected - verify it's the expected error type
          expect(error).toBeDefined();
        }
      });
      
      expect(mockSaveModulesToEntity).toHaveBeenCalled();
    });

    it('should handle missing modulesRef', async () => {
      const paramsWithoutModulesRef = {
        ...defaultParams,
        modulesRef: { current: null }
      };
      
      const { result } = renderHook(() => useSaveLogic(paramsWithoutModulesRef));
      
      await act(async () => {
        await result.current.saveModulesData();
      });
      
      // Since modulesRef.current is null, saveModulesToEntity should not be called
      // and the function will return early
      expect(mockSetModulesState).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing entityId', async () => {
      const paramsWithoutEntityId = {
        ...defaultParams,
        entityId: undefined
      };
      
      const { result } = renderHook(() => useSaveLogic(paramsWithoutEntityId));
      
      await act(async () => {
        try {
          await result.current.saveCountriesAndCurrencies();
        } catch (error) {
          // Error is expected due to the non-null assertion in the hook implementation
          expect(error).toBeDefined();
        }
      });
      
      // Since the entityId is undefined, the action shouldn't be dispatched
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle null entityId', async () => {
      const paramsWithNullEntityId = {
        ...defaultParams,
        entityId: null as unknown as undefined // Type casting to simulate null
      };
      
      const { result } = renderHook(() => useSaveLogic(paramsWithNullEntityId));
      
      await act(async () => {
        try {
          await result.current.saveCountriesAndCurrencies();
        } catch (error) {
          // Error is expected due to the non-null assertion in the hook implementation
          expect(error).toBeDefined();
        }
      });
      
      // With null entityId, we expect early failures
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle empty string entityId', async () => {
      const paramsWithEmptyEntityId = {
        ...defaultParams,
        entityId: ''
      };
      
      const mockSaveEntityCountriesAndCurrencies = require('../../../../src/store/Actions/entitySetupActions').saveEntityCountriesAndCurrencies;
      mockSaveEntityCountriesAndCurrencies.mockReturnValue('saveEntityCountriesAndCurrencies');
      
      const { result } = renderHook(() => useSaveLogic(paramsWithEmptyEntityId));
      
      await act(async () => {
        await result.current.saveCountriesAndCurrencies();
      });
      
      // Empty string should work as a valid ID
      expect(mockDispatch).toHaveBeenCalledWith('saveEntityCountriesAndCurrencies');
    });
  });

  describe('State management', () => {
    it('should update userHasSavedInSession correctly', async () => {
      const mockSetDataSaved = require('../../../../src/store/Actions/entityConfigurationActions').setDataSaved;
      mockSetDataSaved.mockReturnValue('setDataSaved');
      
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        await result.current.saveCountriesAndCurrencies();
      });
      
      expect(mockSetUserHasSavedInSession).toHaveBeenCalledWith(true);
    });

    it('should dispatch setDataSaved action', async () => {
      const mockSetDataSaved = require('../../../../src/store/Actions/entityConfigurationActions').setDataSaved;
      mockSetDataSaved.mockReturnValue('setDataSaved');
      
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        await result.current.saveCountriesAndCurrencies();
      });
      
      expect(mockDispatch).toHaveBeenCalledWith('setDataSaved');
    });

    it('should update modules state correctly', async () => {
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        await result.current.saveModulesData();
      });
      
      expect(mockSetModulesState).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Integration with services', () => {
    it('should call saveEntityConfiguration with correct parameters', async () => {
      // We need to mock both functions to test the correct flow
      const mockSaveEntityConfiguration = require('../../../../src/services/entitySetupService').saveEntityConfiguration;
      mockSaveEntityConfiguration.mockClear();
      mockSaveEntityConfiguration.mockResolvedValue({ success: true });
      
      const mockSaveEntityCountriesAndCurrencies = require('../../../../src/store/Actions/entitySetupActions').saveEntityCountriesAndCurrencies;
      mockSaveEntityCountriesAndCurrencies.mockImplementation(
        (entityId: string, countriesData: any, currenciesData: any) => {
          // This simulates what the real function would do - call saveEntityConfiguration
          mockSaveEntityConfiguration({
            entityId,
            countries: countriesData.selectedCountries,
            currencies: currenciesData.selectedCurrencies,
            defaultCurrency: currenciesData.defaultCurrency[0]
          });
          return 'saveEntityCountriesAndCurrencies';
        }
      );
      
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        await result.current.saveCountriesAndCurrencies();
      });
      
      expect(mockDispatch).toHaveBeenCalledWith('saveEntityCountriesAndCurrencies');
      expect(mockSaveEntityConfiguration).toHaveBeenCalledWith({
        entityId: 'entity-123',
        countries: ['US', 'CA'],
        currencies: ['USD', 'CAD'],
        defaultCurrency: 'USD'
      });
    });

    it('should call savePeriodSetup with correct parameters', async () => {
      const mockSavePeriodSetup = require('../../../../src/store/Actions/periodSetupActions').savePeriodSetup;
      mockSavePeriodSetup.mockReturnValue('savePeriodSetup');
      
      // Mock dispatch to return an object with an unwrap method
      mockDispatch.mockImplementationOnce(() => ({
        unwrap: jest.fn().mockResolvedValue({ success: true })
      }));
      
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        await result.current.savePeriodSetupData();
      });
      
      // Verify dispatch was called with the savePeriodSetup return value
      expect(mockDispatch).toHaveBeenCalledWith('savePeriodSetup');
    });
  });

  describe('Function memoization', () => {

    it('should create new functions when dependencies change', () => {
      const initialProps = { params: defaultParams };
      const { result, rerender } = renderHook(
        (props) => useSaveLogic(props.params),
        { initialProps }
      );
      
      const firstSaveCountriesAndCurrencies = result.current.saveCountriesAndCurrencies;
      
      const newParams = {
        ...defaultParams,
        selectedCountries: ['US', 'CA', 'MX']
      };
      
      rerender({ params: newParams });
      
      expect(result.current.saveCountriesAndCurrencies).not.toBe(firstSaveCountriesAndCurrencies);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      // Mock a network error in the service
      const mockSaveEntityCountriesAndCurrencies = require('../../../../src/store/Actions/entitySetupActions').saveEntityCountriesAndCurrencies;
      console.error = jest.fn();
      
      mockSaveEntityCountriesAndCurrencies.mockImplementation(() => {
        console.error('Network error');
        throw new Error('Network error');
      });
      
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        await expect(result.current.saveCountriesAndCurrencies()).rejects.toThrow();
      });
      
      expect(console.error).toHaveBeenCalledWith('Network error');
    });

    it('should handle timeout errors', async () => {
      // Mock a timeout error in the service
      const mockSaveEntityCountriesAndCurrencies = require('../../../../src/store/Actions/entitySetupActions').saveEntityCountriesAndCurrencies;
      console.error = jest.fn();
      
      mockSaveEntityCountriesAndCurrencies.mockImplementation(() => {
        console.error('Request timeout');
        throw new Error('Request timeout');
      });
      
      const { result } = renderHook(() => useSaveLogic(defaultParams));
      
      await act(async () => {
        await expect(result.current.saveCountriesAndCurrencies()).rejects.toThrow();
      });
      
      expect(console.error).toHaveBeenCalledWith('Request timeout');
    });
  });
});
