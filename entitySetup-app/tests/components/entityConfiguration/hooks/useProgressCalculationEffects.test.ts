import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useProgressCalculationEffects } from '../../../../src/components/entityConfiguration/hooks/useProgressCalculationEffects';

describe('useProgressCalculationEffects', () => {
  const mockSetProgress = jest.fn();
  const mockCalculateProgressPercentage = jest.fn();

  const defaultParams = {
    entity: {
      id: 'entity-123',
      countries: { selectedCountries: ['US', 'CA'] },
      currencies: { selectedCurrencies: ['USD', 'CAD'] },
      modules: '["module1", "module2"]'
    },
    calculateProgressPercentage: mockCalculateProgressPercentage,
    setProgress: mockSetProgress
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateProgressPercentage.mockReturnValue(50);
  });

  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      renderHook(() => useProgressCalculationEffects(defaultParams));
      
      // Hook doesn't return anything, just runs effects
      expect(mockCalculateProgressPercentage).toHaveBeenCalled();
      expect(mockSetProgress).toHaveBeenCalledWith(50);
    });
  });

  describe('Initial progress calculation', () => {
    it('should calculate initial progress when entity is provided', () => {
      renderHook(() => useProgressCalculationEffects(defaultParams));
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalled();
      expect(mockSetProgress).toHaveBeenCalledWith(50);
    });

    it('should not calculate progress when entity is null', () => {
      const paramsWithNullEntity = {
        ...defaultParams,
        entity: null
      };
      
      renderHook(() => useProgressCalculationEffects(paramsWithNullEntity));
      
      expect(mockCalculateProgressPercentage).not.toHaveBeenCalled();
      expect(mockSetProgress).not.toHaveBeenCalled();
    });

    it('should calculate progress with different values', () => {
      mockCalculateProgressPercentage.mockReturnValue(75);
      
      renderHook(() => useProgressCalculationEffects(defaultParams));
      
      expect(mockSetProgress).toHaveBeenCalledWith(75);
    });
  });

  describe('Entity data update effects', () => {
    it('should recalculate progress when entity changes', () => {
      const { rerender } = renderHook(
        ({ params }) => useProgressCalculationEffects(params),
        { initialProps: { params: defaultParams } }
      );
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalledTimes(1);
      
      // Change entity
      const newParams = {
        ...defaultParams,
        entity: {
          id: 'entity-456',
          countries: { selectedCountries: ['MX'] },
          currencies: { selectedCurrencies: ['MXN'] },
          modules: '["module3"]'
        }
      };
      
      rerender({ params: newParams });
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle null entity', () => {
      const paramsWithNullEntity = {
        ...defaultParams,
        entity: null
      };
      
      renderHook(() => useProgressCalculationEffects(paramsWithNullEntity));
      
      expect(mockCalculateProgressPercentage).not.toHaveBeenCalled();
      expect(mockSetProgress).not.toHaveBeenCalled();
    });

    it('should handle undefined entity', () => {
      const paramsWithUndefinedEntity = {
        ...defaultParams,
        entity: undefined
      };
      
      renderHook(() => useProgressCalculationEffects(paramsWithUndefinedEntity));
      
      expect(mockCalculateProgressPercentage).not.toHaveBeenCalled();
      expect(mockSetProgress).not.toHaveBeenCalled();
    });

    it('should handle empty entity object', () => {
      const paramsWithEmptyEntity = {
        ...defaultParams,
        entity: {}
      };
      
      renderHook(() => useProgressCalculationEffects(paramsWithEmptyEntity));
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalled();
      expect(mockSetProgress).toHaveBeenCalledWith(50);
    });
  });

  describe('Dependency changes', () => {
    it('should re-run effects when entity changes', () => {
      const { rerender } = renderHook(
        ({ params }) => useProgressCalculationEffects(params),
        { initialProps: { params: defaultParams } }
      );
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalledTimes(1);
      
      // Rerender with different entity
      const newParams = {
        ...defaultParams,
        entity: {
          id: 'entity-456',
          countries: { selectedCountries: ['MX'] },
          currencies: { selectedCurrencies: ['MXN'] },
          modules: '["module3"]'
        }
      };
      
      rerender({ params: newParams });
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalledTimes(2);
    });

    it('should re-run effects when calculateProgressPercentage changes', () => {
      const { rerender } = renderHook(
        ({ params }) => useProgressCalculationEffects(params),
        { initialProps: { params: defaultParams } }
      );
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalledTimes(1);
      
      // Rerender with different calculateProgressPercentage function
      const newCalculateProgressPercentage = jest.fn().mockReturnValue(75);
      const newParams = {
        ...defaultParams,
        calculateProgressPercentage: newCalculateProgressPercentage
      };
      
      rerender({ params: newParams });
      
      expect(newCalculateProgressPercentage).toHaveBeenCalledTimes(1);
      expect(mockSetProgress).toHaveBeenCalledWith(75);
    });

    it('should re-run effects when setProgress changes', () => {
      const { rerender } = renderHook(
        ({ params }) => useProgressCalculationEffects(params),
        { initialProps: { params: defaultParams } }
      );
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalledTimes(1);
      
      // Rerender with different setProgress function
      const newSetProgress = jest.fn();
      const newParams = {
        ...defaultParams,
        setProgress: newSetProgress
      };
      
      rerender({ params: newParams });
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalledTimes(2);
      expect(newSetProgress).toHaveBeenCalledWith(50);
    });
  });

  describe('Function calls', () => {
    it('should call calculateProgressPercentage when entity is provided', () => {
      renderHook(() => useProgressCalculationEffects(defaultParams));
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalled();
    });

    it('should call setProgress with calculated value', () => {
      mockCalculateProgressPercentage.mockReturnValue(75);
      
      renderHook(() => useProgressCalculationEffects(defaultParams));
      
      expect(mockSetProgress).toHaveBeenCalledWith(75);
    });

    it('should handle calculateProgressPercentage returning 0', () => {
      mockCalculateProgressPercentage.mockReturnValue(0);
      
      renderHook(() => useProgressCalculationEffects(defaultParams));
      
      expect(mockSetProgress).toHaveBeenCalledWith(0);
    });

    it('should handle calculateProgressPercentage returning 100', () => {
      mockCalculateProgressPercentage.mockReturnValue(100);
      
      renderHook(() => useProgressCalculationEffects(defaultParams));
      
      expect(mockSetProgress).toHaveBeenCalledWith(100);
    });
  });

  describe('Multiple effect triggers', () => {
    it('should handle multiple effect triggers correctly', () => {
      const { rerender } = renderHook(
        ({ params }) => useProgressCalculationEffects(params),
        { initialProps: { params: defaultParams } }
      );
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalledTimes(1);
      
      // Change entity
      const newEntityParams = {
        ...defaultParams,
        entity: {
          id: 'entity-456',
          countries: { selectedCountries: ['MX'] },
          currencies: { selectedCurrencies: ['MXN'] },
          modules: '["module3"]'
        }
      };
      
      rerender({ params: newEntityParams });
      
      expect(mockCalculateProgressPercentage).toHaveBeenCalledTimes(2);
      
      // Change calculateProgressPercentage function
      const newCalculateProgressPercentage = jest.fn().mockReturnValue(75);
      const newFunctionParams = {
        ...defaultParams,
        calculateProgressPercentage: newCalculateProgressPercentage
      };
      
      rerender({ params: newFunctionParams });
      
      expect(newCalculateProgressPercentage).toHaveBeenCalledTimes(1);
    });
  });
});
