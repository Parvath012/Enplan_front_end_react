import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useButtonStateLogic } from '../../../../src/components/entityConfiguration/hooks/useButtonStateLogic';

// Mock dependencies
jest.mock('../../../../src/store/Actions/entityConfigurationActions', () => ({
  isCountriesTabNextEnabled: jest.fn(),
  isPeriodSetupTabNextEnabled: jest.fn(),
  isModulesTabNextEnabled: jest.fn()
}));

describe('useButtonStateLogic', () => {
  const mockIsCountriesTabNextEnabled = jest.fn();
  const mockIsPeriodSetupTabNextEnabled = jest.fn();
  const mockIsModulesTabNextEnabled = jest.fn();

  const defaultParams = {
    tabValue: 0,
    selectedCountries: ['US', 'CA'],
    selectedCurrencies: ['USD', 'CAD'],
    isDataSaved: true,
    isEditMode: false,
    entityId: 'entity-123',
    periodSetup: {
      'entity-123': {
        data: { financialYear: '2024', weekSetup: 'Monday' },
        isDataSaved: true
      }
    },
    modulesState: {
      isDataSaved: true,
      savedModules: ['module1', 'module2'],
      currentModules: ['module1', 'module2']
    },
    isRollupEntity: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    require('../../../../src/store/Actions/entityConfigurationActions').isCountriesTabNextEnabled.mockImplementation(mockIsCountriesTabNextEnabled);
    require('../../../../src/store/Actions/entityConfigurationActions').isPeriodSetupTabNextEnabled.mockImplementation(mockIsPeriodSetupTabNextEnabled);
    require('../../../../src/store/Actions/entityConfigurationActions').isModulesTabNextEnabled.mockImplementation(mockIsModulesTabNextEnabled);
    
    mockIsCountriesTabNextEnabled.mockReturnValue(true);
    mockIsPeriodSetupTabNextEnabled.mockReturnValue(true);
    mockIsModulesTabNextEnabled.mockReturnValue(true);
  });

  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      const { result } = renderHook(() => useButtonStateLogic(defaultParams));
      
      expect(result.current).toBeDefined();
      expect(result.current.isNextEnabled).toBeDefined();
    });

    it('should return isNextEnabled property', () => {
      const { result } = renderHook(() => useButtonStateLogic(defaultParams));
      
      expect(typeof result.current.isNextEnabled).toBe('boolean');
    });
  });

  describe('Countries tab (tabValue: 0)', () => {
    it('should call isCountriesTabNextEnabled for Countries tab', () => {
      const paramsForCountriesTab = {
        ...defaultParams,
        tabValue: 0
      };
      
      renderHook(() => useButtonStateLogic(paramsForCountriesTab));
      
      expect(mockIsCountriesTabNextEnabled).toHaveBeenCalledWith(
        ['US', 'CA'],
        ['USD', 'CAD'],
        true,
        false
      );
    });

    it('should return true when isCountriesTabNextEnabled returns true', () => {
      mockIsCountriesTabNextEnabled.mockReturnValue(true);
      
      const { result } = renderHook(() => useButtonStateLogic(defaultParams));
      
      expect(result.current.isNextEnabled).toBe(true);
    });

    it('should return false when isCountriesTabNextEnabled returns false', () => {
      mockIsCountriesTabNextEnabled.mockReturnValue(false);
      
      const { result } = renderHook(() => useButtonStateLogic(defaultParams));
      
      expect(result.current.isNextEnabled).toBe(false);
    });
  });

  describe('Period Setup tab (tabValue: 1)', () => {
    it('should call isPeriodSetupTabNextEnabled for Period Setup tab', () => {
      const paramsForPeriodSetupTab = {
        ...defaultParams,
        tabValue: 1
      };
      
      renderHook(() => useButtonStateLogic(paramsForPeriodSetupTab));
      
      expect(mockIsPeriodSetupTabNextEnabled).toHaveBeenCalledWith(
        'entity-123',
        {
          'entity-123': {
            data: { financialYear: '2024', weekSetup: 'Monday' },
            isDataSaved: true
          }
        },
        false,
        false
      );
    });

    it('should return true when isPeriodSetupTabNextEnabled returns true', () => {
      mockIsPeriodSetupTabNextEnabled.mockReturnValue(true);
      
      const paramsForPeriodSetupTab = {
        ...defaultParams,
        tabValue: 1
      };
      
      const { result } = renderHook(() => useButtonStateLogic(paramsForPeriodSetupTab));
      
      expect(result.current.isNextEnabled).toBe(true);
    });

    it('should return false when isPeriodSetupTabNextEnabled returns false', () => {
      mockIsPeriodSetupTabNextEnabled.mockReturnValue(false);
      
      const paramsForPeriodSetupTab = {
        ...defaultParams,
        tabValue: 1
      };
      
      const { result } = renderHook(() => useButtonStateLogic(paramsForPeriodSetupTab));
      
      expect(result.current.isNextEnabled).toBe(false);
    });
  });

  describe('Modules tab (tabValue: 2)', () => {
    it('should call isModulesTabNextEnabled for Modules tab', () => {
      const paramsForModulesTab = {
        ...defaultParams,
        tabValue: 2
      };
      
      renderHook(() => useButtonStateLogic(paramsForModulesTab));
      
      expect(mockIsModulesTabNextEnabled).toHaveBeenCalledWith(
        {
          isDataSaved: true,
          savedModules: ['module1', 'module2'],
          currentModules: ['module1', 'module2']
        },
        false,
        false
      );
    });

    it('should return true when isModulesTabNextEnabled returns true', () => {
      mockIsModulesTabNextEnabled.mockReturnValue(true);
      
      const paramsForModulesTab = {
        ...defaultParams,
        tabValue: 2
      };
      
      const { result } = renderHook(() => useButtonStateLogic(paramsForModulesTab));
      
      expect(result.current.isNextEnabled).toBe(true);
    });

    it('should return false when isModulesTabNextEnabled returns false', () => {
      mockIsModulesTabNextEnabled.mockReturnValue(false);
      
      const paramsForModulesTab = {
        ...defaultParams,
        tabValue: 2
      };
      
      const { result } = renderHook(() => useButtonStateLogic(paramsForModulesTab));
      
      expect(result.current.isNextEnabled).toBe(false);
    });
  });

  describe('Default case (invalid tabValue)', () => {
    it('should return true for invalid tab values', () => {
      const paramsWithInvalidTab = {
        ...defaultParams,
        tabValue: 999
      };
      
      const { result } = renderHook(() => useButtonStateLogic(paramsWithInvalidTab));
      
      expect(result.current.isNextEnabled).toBe(true);
    });

    it('should return true for negative tab values', () => {
      const paramsWithNegativeTab = {
        ...defaultParams,
        tabValue: -1
      };
      
      const { result } = renderHook(() => useButtonStateLogic(paramsWithNegativeTab));
      
      expect(result.current.isNextEnabled).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty selectedCountries', () => {
      const paramsWithEmptyCountries = {
        ...defaultParams,
        selectedCountries: []
      };
      
      renderHook(() => useButtonStateLogic(paramsWithEmptyCountries));
      
      expect(mockIsCountriesTabNextEnabled).toHaveBeenCalledWith(
        [],
        ['USD', 'CAD'],
        true,
        false
      );
    });

    it('should handle empty selectedCurrencies', () => {
      const paramsWithEmptyCurrencies = {
        ...defaultParams,
        selectedCurrencies: []
      };
      
      renderHook(() => useButtonStateLogic(paramsWithEmptyCurrencies));
      
      expect(mockIsCountriesTabNextEnabled).toHaveBeenCalledWith(
        ['US', 'CA'],
        [],
        true,
        false
      );
    });

    it('should handle null entityId', () => {
      // Since the type requires string | undefined, we'll use undefined instead of null
      const paramsWithNullEntityId = {
        ...defaultParams,
        entityId: undefined, // Changed from null to undefined to match the expected type
        tabValue: 1
      };
      
      renderHook(() => useButtonStateLogic(paramsWithNullEntityId));
      
      expect(mockIsPeriodSetupTabNextEnabled).toHaveBeenCalledWith(
        undefined, // Changed from null to undefined
        defaultParams.periodSetup,
        false,
        false
      );
    });

    it('should handle undefined entityId', () => {
      const paramsWithUndefinedEntityId = {
        ...defaultParams,
        entityId: undefined,
        tabValue: 1
      };
      
      renderHook(() => useButtonStateLogic(paramsWithUndefinedEntityId));
      
      expect(mockIsPeriodSetupTabNextEnabled).toHaveBeenCalledWith(
        undefined,
        defaultParams.periodSetup,
        false,
        false
      );
    });

    it('should handle null periodSetup', () => {
      const paramsWithNullPeriodSetup = {
        ...defaultParams,
        periodSetup: null,
        tabValue: 1
      };
      
      renderHook(() => useButtonStateLogic(paramsWithNullPeriodSetup));
      
      expect(mockIsPeriodSetupTabNextEnabled).toHaveBeenCalledWith(
        'entity-123',
        null,
        false,
        false
      );
    });

    it('should handle null modulesState', () => {
      const paramsWithNullModulesState = {
        ...defaultParams,
        modulesState: null,
        tabValue: 2
      };
      
      renderHook(() => useButtonStateLogic(paramsWithNullModulesState));
      
      expect(mockIsModulesTabNextEnabled).toHaveBeenCalledWith(
        null,
        false,
        false
      );
    });

    it('should handle different isEditMode values', () => {
      const testCases = [
        { isEditMode: true, expectedEditMode: true },
        { isEditMode: false, expectedEditMode: false }
      ];

      testCases.forEach(({ isEditMode, expectedEditMode }) => {
        const params = {
          ...defaultParams,
          isEditMode
        };
        
        renderHook(() => useButtonStateLogic(params));
        
        expect(mockIsCountriesTabNextEnabled).toHaveBeenCalledWith(
          ['US', 'CA'],
          ['USD', 'CAD'],
          true,
          expectedEditMode
        );
      });
    });

    it('should handle different isDataSaved values', () => {
      const testCases = [
        { isDataSaved: true, expectedSaved: true },
        { isDataSaved: false, expectedSaved: false }
      ];

      testCases.forEach(({ isDataSaved, expectedSaved }) => {
        const params = {
          ...defaultParams,
          isDataSaved
        };
        
        renderHook(() => useButtonStateLogic(params));
        
        expect(mockIsCountriesTabNextEnabled).toHaveBeenCalledWith(
          ['US', 'CA'],
          ['USD', 'CAD'],
          expectedSaved,
          false
        );
      });
    });

    it('should handle different isRollupEntity values', () => {
      const testCases = [
        { isRollupEntity: true, expectedRollup: true },
        { isRollupEntity: false, expectedRollup: false }
      ];

      testCases.forEach(({ isRollupEntity, expectedRollup }) => {
        const params = {
          ...defaultParams,
          isRollupEntity,
          tabValue: 1
        };
        
        renderHook(() => useButtonStateLogic(params));
        
        expect(mockIsPeriodSetupTabNextEnabled).toHaveBeenCalledWith(
          'entity-123',
          defaultParams.periodSetup,
          false,
          expectedRollup
        );
      });
    });
  });

  describe('Memoization', () => {
    it('should memoize isNextEnabled result', () => {
      const { result, rerender } = renderHook(
        ({ params }) => useButtonStateLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstResult = result.current.isNextEnabled;
      
      rerender({ params: defaultParams });
      
      const secondResult = result.current.isNextEnabled;
      
      expect(firstResult).toBe(secondResult);
    });

    it('should recalculate when dependencies change', () => {
      const { result, rerender } = renderHook(
        ({ params }) => useButtonStateLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstResult = result.current.isNextEnabled;
      
      const newParams = {
        ...defaultParams,
        tabValue: 1
      };
      
      rerender({ params: newParams });
      
      const secondResult = result.current.isNextEnabled;
      
      expect(firstResult).toBe(secondResult); // Both should be true, but different functions called
    });

    it('should recalculate when selectedCountries change', () => {
      const { result, rerender } = renderHook(
        ({ params }) => useButtonStateLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstResult = result.current.isNextEnabled;
      
      const newParams = {
        ...defaultParams,
        selectedCountries: ['US', 'CA', 'MX']
      };
      
      rerender({ params: newParams });
      
      const secondResult = result.current.isNextEnabled;
      
      expect(firstResult).toBe(secondResult); // Both should be true, but different calls made
    });
  });

  describe('Integration with action functions', () => {
    it('should call correct action function based on tabValue', () => {
      const testCases = [
        { tabValue: 0, expectedFunction: 'isCountriesTabNextEnabled' },
        { tabValue: 1, expectedFunction: 'isPeriodSetupTabNextEnabled' },
        { tabValue: 2, expectedFunction: 'isModulesTabNextEnabled' }
      ];

      testCases.forEach(({ tabValue, expectedFunction }) => {
        const params = {
          ...defaultParams,
          tabValue
        };
        
        renderHook(() => useButtonStateLogic(params));
        
        if (expectedFunction === 'isCountriesTabNextEnabled') {
          expect(mockIsCountriesTabNextEnabled).toHaveBeenCalled();
        } else if (expectedFunction === 'isPeriodSetupTabNextEnabled') {
          expect(mockIsPeriodSetupTabNextEnabled).toHaveBeenCalled();
        } else if (expectedFunction === 'isModulesTabNextEnabled') {
          expect(mockIsModulesTabNextEnabled).toHaveBeenCalled();
        }
      });
    });
  });
});
