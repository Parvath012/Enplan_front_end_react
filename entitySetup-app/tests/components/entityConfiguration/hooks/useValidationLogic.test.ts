import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useValidationLogic } from '../../../../src/components/entityConfiguration/hooks/useValidationLogic';

// Mock dependencies
jest.mock('../../../../src/store/Actions/entityConfigurationActions', () => ({
  isPeriodSetupMandatoryFieldsFilled: jest.fn(),
  isPeriodSetupModified: jest.fn()
}));

describe('useValidationLogic', () => {
  const mockIsPeriodSetupMandatoryFieldsFilled = jest.fn();
  const mockIsPeriodSetupModified = jest.fn();

  const defaultParams = {
    tabValue: 1,
    entityId: 'entity-123',
    periodSetup: {
      'entity-123': {
        data: { financialYear: '2024', weekSetup: 'Monday' },
        isDataSaved: true
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    require('../../../../src/store/Actions/entityConfigurationActions').isPeriodSetupMandatoryFieldsFilled.mockImplementation(mockIsPeriodSetupMandatoryFieldsFilled);
    require('../../../../src/store/Actions/entityConfigurationActions').isPeriodSetupModified.mockImplementation(mockIsPeriodSetupModified);
    
    mockIsPeriodSetupMandatoryFieldsFilled.mockReturnValue(true);
    mockIsPeriodSetupModified.mockReturnValue(false);
  });

  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      const { result } = renderHook(() => useValidationLogic(defaultParams));
      
      expect(result.current).toBeDefined();
      expect(result.current.isPeriodSetupMandatoryFieldsFilled).toBeDefined();
      expect(result.current.isPeriodSetupModified).toBeDefined();
    });

    it('should return all expected properties', () => {
      const { result } = renderHook(() => useValidationLogic(defaultParams));
      
      expect(typeof result.current.isPeriodSetupMandatoryFieldsFilled).toBe('function');
      expect(typeof result.current.isPeriodSetupModified).toBe('function');
    });
  });

  describe('isPeriodSetupMandatoryFieldsFilled', () => {
    it('should call isPeriodSetupMandatoryFieldsFilled with correct parameters', () => {
      const { result } = renderHook(() => useValidationLogic(defaultParams));
      
      // Call the function to trigger the validation
      result.current.isPeriodSetupMandatoryFieldsFilled();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(
        1,
        'entity-123',
        {
          'entity-123': {
            data: { financialYear: '2024', weekSetup: 'Monday' },
            isDataSaved: true
          }
        }
      );
    });

    it('should return true when isPeriodSetupMandatoryFieldsFilled returns true', () => {
      mockIsPeriodSetupMandatoryFieldsFilled.mockReturnValue(true);
      
      const { result } = renderHook(() => useValidationLogic(defaultParams));
      
      expect(result.current.isPeriodSetupMandatoryFieldsFilled()).toBe(true);
    });

    it('should return false when isPeriodSetupMandatoryFieldsFilled returns false', () => {
      mockIsPeriodSetupMandatoryFieldsFilled.mockReturnValue(false);
      
      const { result } = renderHook(() => useValidationLogic(defaultParams));
      
      expect(result.current.isPeriodSetupMandatoryFieldsFilled()).toBe(false);
    });
  });

  describe('isPeriodSetupModified', () => {
    it('should call isPeriodSetupModified with correct parameters', () => {
      const { result } = renderHook(() => useValidationLogic(defaultParams));
      
      // Call the function to trigger the validation
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(
        1,
        'entity-123',
        {
          'entity-123': {
            data: { financialYear: '2024', weekSetup: 'Monday' },
            isDataSaved: true
          }
        }
      );
    });

    it('should return true when isPeriodSetupModified returns true', () => {
      mockIsPeriodSetupModified.mockReturnValue(true);
      
      const { result } = renderHook(() => useValidationLogic(defaultParams));
      
      expect(result.current.isPeriodSetupModified()).toBe(true);
    });

    it('should return false when isPeriodSetupModified returns false', () => {
      mockIsPeriodSetupModified.mockReturnValue(false);
      
      const { result } = renderHook(() => useValidationLogic(defaultParams));
      
      expect(result.current.isPeriodSetupModified()).toBe(false);
    });
  });

  describe('Different tab values', () => {
    it('should handle tabValue 0 (Countries tab)', () => {
      const paramsForCountriesTab = {
        ...defaultParams,
        tabValue: 0
      };
      
      const { result } = renderHook(() => useValidationLogic(paramsForCountriesTab));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(
        0,
        'entity-123',
        defaultParams.periodSetup
      );
      
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(
        0,
        'entity-123',
        defaultParams.periodSetup
      );
    });

    it('should handle tabValue 1 (Period Setup tab)', () => {
      const paramsForPeriodSetupTab = {
        ...defaultParams,
        tabValue: 1
      };
      
      const { result } = renderHook(() => useValidationLogic(paramsForPeriodSetupTab));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(
        1,
        'entity-123',
        defaultParams.periodSetup
      );
      
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(
        1,
        'entity-123',
        defaultParams.periodSetup
      );
    });

    it('should handle tabValue 2 (Modules tab)', () => {
      const paramsForModulesTab = {
        ...defaultParams,
        tabValue: 2
      };
      
      const { result } = renderHook(() => useValidationLogic(paramsForModulesTab));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(
        2,
        'entity-123',
        defaultParams.periodSetup
      );
      
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(
        2,
        'entity-123',
        defaultParams.periodSetup
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle null entityId', () => {
      const paramsWithNullEntityId = {
        ...defaultParams,
        entityId: null
      };
      
      const { result } = renderHook(() => useValidationLogic(paramsWithNullEntityId));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(
        1,
        null,
        defaultParams.periodSetup
      );
      
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(
        1,
        null,
        defaultParams.periodSetup
      );
    });

    it('should handle undefined entityId', () => {
      const paramsWithUndefinedEntityId = {
        ...defaultParams,
        entityId: undefined
      };
      
      const { result } = renderHook(() => useValidationLogic(paramsWithUndefinedEntityId));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(
        1,
        undefined,
        defaultParams.periodSetup
      );
      
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(
        1,
        undefined,
        defaultParams.periodSetup
      );
    });

    it('should handle empty string entityId', () => {
      const paramsWithEmptyEntityId = {
        ...defaultParams,
        entityId: ''
      };
      
      const { result } = renderHook(() => useValidationLogic(paramsWithEmptyEntityId));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(
        1,
        '',
        defaultParams.periodSetup
      );
      
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(
        1,
        '',
        defaultParams.periodSetup
      );
    });

    it('should handle null periodSetup', () => {
      const paramsWithNullPeriodSetup = {
        ...defaultParams,
        periodSetup: null
      };
      
      const { result } = renderHook(() => useValidationLogic(paramsWithNullPeriodSetup));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(
        1,
        'entity-123',
        null
      );
      
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(
        1,
        'entity-123',
        null
      );
    });

    it('should handle empty periodSetup', () => {
      const paramsWithEmptyPeriodSetup = {
        ...defaultParams,
        periodSetup: {}
      };
      
      const { result } = renderHook(() => useValidationLogic(paramsWithEmptyPeriodSetup));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(
        1,
        'entity-123',
        {}
      );
      
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(
        1,
        'entity-123',
        {}
      );
    });

    it('should handle negative tab values', () => {
      const paramsWithNegativeTab = {
        ...defaultParams,
        tabValue: -1
      };
      
      const { result } = renderHook(() => useValidationLogic(paramsWithNegativeTab));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(
        -1,
        'entity-123',
        defaultParams.periodSetup
      );
      
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(
        -1,
        'entity-123',
        defaultParams.periodSetup
      );
    });

    it('should handle large tab values', () => {
      const paramsWithLargeTab = {
        ...defaultParams,
        tabValue: 999
      };
      
      const { result } = renderHook(() => useValidationLogic(paramsWithLargeTab));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(
        999,
        'entity-123',
        defaultParams.periodSetup
      );
      
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(
        999,
        'entity-123',
        defaultParams.periodSetup
      );
    });
  });

  describe('Memoization', () => {
    it('should memoize results when dependencies do not change', () => {
      const { result, rerender } = renderHook(
        ({ params }) => useValidationLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstMandatoryFieldsFilled = result.current.isPeriodSetupMandatoryFieldsFilled;
      const firstModified = result.current.isPeriodSetupModified;
      
      rerender({ params: defaultParams });
      
      const secondMandatoryFieldsFilled = result.current.isPeriodSetupMandatoryFieldsFilled;
      const secondModified = result.current.isPeriodSetupModified;
      
      expect(firstMandatoryFieldsFilled).toBe(secondMandatoryFieldsFilled);
      expect(firstModified).toBe(secondModified);
    });

    it('should recalculate when tabValue changes', () => {
      mockIsPeriodSetupMandatoryFieldsFilled.mockReturnValueOnce(true).mockReturnValueOnce(false);
      
      const { result, rerender } = renderHook(
        ({ params }) => useValidationLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstMandatoryFieldsFilled = result.current.isPeriodSetupMandatoryFieldsFilled;
      
      const newParams = {
        ...defaultParams,
        tabValue: 2
      };
      
      rerender({ params: newParams });
      
      const secondMandatoryFieldsFilled = result.current.isPeriodSetupMandatoryFieldsFilled;
      
      // Since we mocked different return values, they should be different
      expect(firstMandatoryFieldsFilled).not.toBe(secondMandatoryFieldsFilled);
    });

    it('should recalculate when entityId changes', () => {
      mockIsPeriodSetupMandatoryFieldsFilled.mockReturnValueOnce(true).mockReturnValueOnce(false);
      
      const { result, rerender } = renderHook(
        ({ params }) => useValidationLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstMandatoryFieldsFilled = result.current.isPeriodSetupMandatoryFieldsFilled;
      
      const newParams = {
        ...defaultParams,
        entityId: 'entity-456'
      };
      
      rerender({ params: newParams });
      
      const secondMandatoryFieldsFilled = result.current.isPeriodSetupMandatoryFieldsFilled;
      
      // Since we mocked different return values, they should be different
      expect(firstMandatoryFieldsFilled).not.toBe(secondMandatoryFieldsFilled);
    });

    it('should recalculate when periodSetup changes', () => {
      mockIsPeriodSetupMandatoryFieldsFilled.mockReturnValueOnce(true).mockReturnValueOnce(false);
      
      const { result, rerender } = renderHook(
        ({ params }) => useValidationLogic(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstMandatoryFieldsFilled = result.current.isPeriodSetupMandatoryFieldsFilled;
      
      const newParams = {
        ...defaultParams,
        periodSetup: {
          'entity-123': {
            data: { financialYear: '2025', weekSetup: 'Tuesday' },
            isDataSaved: false
          }
        }
      };
      
      rerender({ params: newParams });
      
      const secondMandatoryFieldsFilled = result.current.isPeriodSetupMandatoryFieldsFilled;
      
      // Since we mocked different return values, they should be different
      expect(firstMandatoryFieldsFilled).not.toBe(secondMandatoryFieldsFilled);
    });
  });

  describe('Integration with action functions', () => {
    it('should call both validation functions', () => {
      const { result } = renderHook(() => useValidationLogic(defaultParams));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledTimes(1);
      expect(mockIsPeriodSetupModified).toHaveBeenCalledTimes(1);
    });

    it('should call validation functions with same parameters', () => {
      const { result } = renderHook(() => useValidationLogic(defaultParams));
      
      // Call the functions to trigger the validations
      result.current.isPeriodSetupMandatoryFieldsFilled();
      result.current.isPeriodSetupModified();
      
      const expectedParams = [1, 'entity-123', defaultParams.periodSetup];
      
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalledWith(...expectedParams);
      expect(mockIsPeriodSetupModified).toHaveBeenCalledWith(...expectedParams);
    });
  });

  describe('Return value consistency', () => {
    it('should return consistent boolean values', () => {
      const testCases = [
        { mandatoryFieldsFilled: true, modified: false },
        { mandatoryFieldsFilled: false, modified: true },
        { mandatoryFieldsFilled: true, modified: true },
        { mandatoryFieldsFilled: false, modified: false }
      ];

      testCases.forEach(({ mandatoryFieldsFilled, modified }) => {
        mockIsPeriodSetupMandatoryFieldsFilled.mockReturnValue(mandatoryFieldsFilled);
        mockIsPeriodSetupModified.mockReturnValue(modified);
        
        const { result } = renderHook(() => useValidationLogic(defaultParams));
        
        expect(typeof result.current.isPeriodSetupMandatoryFieldsFilled).toBe('function');
        expect(typeof result.current.isPeriodSetupModified).toBe('function');
        expect(result.current.isPeriodSetupMandatoryFieldsFilled()).toBe(mandatoryFieldsFilled);
        expect(result.current.isPeriodSetupModified()).toBe(modified);
      });
    });
  });
});
