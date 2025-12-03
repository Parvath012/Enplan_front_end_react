import * as React from 'react';
import { renderHook, act } from '@testing-library/react';
import { usePeriodSetupEffects } from '../../../../src/components/entityConfiguration/hooks/usePeriodSetupEffects';

describe('usePeriodSetupEffects', () => {
  const mockOnDataChange = jest.fn();
  const mockOnDataLoaded = jest.fn();

  const defaultParams = {
    onDataChange: mockOnDataChange,
    onDataLoaded: mockOnDataLoaded
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      const { result } = renderHook(() => usePeriodSetupEffects(defaultParams));
      
      expect(result.current).toBeDefined();
      expect(result.current.handlePeriodSetupDataChange).toBeDefined();
      expect(result.current.handlePeriodSetupDataLoaded).toBeDefined();
    });

    it('should return all expected functions', () => {
      const { result } = renderHook(() => usePeriodSetupEffects(defaultParams));
      
      expect(typeof result.current.handlePeriodSetupDataChange).toBe('function');
      expect(typeof result.current.handlePeriodSetupDataLoaded).toBe('function');
    });
  });

  describe('handlePeriodSetupDataChange functionality', () => {
    it('should call onDataChange when provided', () => {
      const { result } = renderHook(() => usePeriodSetupEffects(defaultParams));
      
      act(() => {
        result.current.handlePeriodSetupDataChange(true);
      });
      
      expect(mockOnDataChange).toHaveBeenCalledWith(true);
    });

    it('should call onDataChange with false when data is not changed', () => {
      const { result } = renderHook(() => usePeriodSetupEffects(defaultParams));
      
      act(() => {
        result.current.handlePeriodSetupDataChange(false);
      });
      
      expect(mockOnDataChange).toHaveBeenCalledWith(false);
    });

    it('should handle missing onDataChange gracefully', () => {
      const paramsWithoutOnDataChange = {
        ...defaultParams,
        onDataChange: undefined
      };
      
      const { result } = renderHook(() => usePeriodSetupEffects(paramsWithoutOnDataChange));
      
      act(() => {
        result.current.handlePeriodSetupDataChange(true);
      });
      
      // Should not throw an error
      expect(true).toBe(true);
    });

    it('should handle null onDataChange gracefully', () => {
      const paramsWithNullOnDataChange = {
        ...defaultParams,
        onDataChange: null
      };
      
      const { result } = renderHook(() => usePeriodSetupEffects(paramsWithNullOnDataChange));
      
      act(() => {
        result.current.handlePeriodSetupDataChange(true);
      });
      
      // Should not throw an error
      expect(true).toBe(true);
    });
  });

  describe('handlePeriodSetupDataLoaded functionality', () => {
    it('should call onDataLoaded when provided', () => {
      const { result } = renderHook(() => usePeriodSetupEffects(defaultParams));
      
      act(() => {
        result.current.handlePeriodSetupDataLoaded(true);
      });
      
      expect(mockOnDataLoaded).toHaveBeenCalledWith(true);
    });

    it('should call onDataLoaded with false when no data is loaded', () => {
      const { result } = renderHook(() => usePeriodSetupEffects(defaultParams));
      
      act(() => {
        result.current.handlePeriodSetupDataLoaded(false);
      });
      
      expect(mockOnDataLoaded).toHaveBeenCalledWith(false);
    });

    it('should handle missing onDataLoaded gracefully', () => {
      const paramsWithoutOnDataLoaded = {
        ...defaultParams,
        onDataLoaded: undefined
      };
      
      const { result } = renderHook(() => usePeriodSetupEffects(paramsWithoutOnDataLoaded));
      
      act(() => {
        result.current.handlePeriodSetupDataLoaded(true);
      });
      
      // Should not throw an error
      expect(true).toBe(true);
    });

    it('should handle null onDataLoaded gracefully', () => {
      const paramsWithNullOnDataLoaded = {
        ...defaultParams,
        onDataLoaded: null
      };
      
      const { result } = renderHook(() => usePeriodSetupEffects(paramsWithNullOnDataLoaded));
      
      act(() => {
        result.current.handlePeriodSetupDataLoaded(true);
      });
      
      // Should not throw an error
      expect(true).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle both callbacks missing', () => {
      const paramsWithoutCallbacks = {
        onDataChange: undefined,
        onDataLoaded: undefined
      };
      
      const { result } = renderHook(() => usePeriodSetupEffects(paramsWithoutCallbacks));
      
      act(() => {
        result.current.handlePeriodSetupDataChange(true);
        result.current.handlePeriodSetupDataLoaded(false);
      });
      
      // Should not throw an error
      expect(true).toBe(true);
    });

    it('should handle both callbacks null', () => {
      const paramsWithNullCallbacks = {
        onDataChange: null,
        onDataLoaded: null
      };
      
      const { result } = renderHook(() => usePeriodSetupEffects(paramsWithNullCallbacks));
      
      act(() => {
        result.current.handlePeriodSetupDataChange(true);
        result.current.handlePeriodSetupDataLoaded(false);
      });
      
      // Should not throw an error
      expect(true).toBe(true);
    });

    it('should handle mixed callback states', () => {
      const paramsWithMixedCallbacks = {
        onDataChange: mockOnDataChange,
        onDataLoaded: null
      };
      
      const { result } = renderHook(() => usePeriodSetupEffects(paramsWithMixedCallbacks));
      
      act(() => {
        result.current.handlePeriodSetupDataChange(true);
        result.current.handlePeriodSetupDataLoaded(false);
      });
      
      expect(mockOnDataChange).toHaveBeenCalledWith(true);
      // onDataLoaded should not be called since it's null
    });
  });

  describe('Function memoization', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(
        ({ params }) => usePeriodSetupEffects(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstHandleDataChange = result.current.handlePeriodSetupDataChange;
      const firstHandleDataLoaded = result.current.handlePeriodSetupDataLoaded;
      
      rerender({ params: defaultParams });
      
      expect(result.current.handlePeriodSetupDataChange).toBe(firstHandleDataChange);
      expect(result.current.handlePeriodSetupDataLoaded).toBe(firstHandleDataLoaded);
    });

    it('should create new functions when dependencies change', () => {
      const { result, rerender } = renderHook(
        ({ params }) => usePeriodSetupEffects(params),
        { initialProps: { params: defaultParams } }
      );
      
      const firstHandleDataChange = result.current.handlePeriodSetupDataChange;
      
      const newParams = {
        ...defaultParams,
        onDataChange: jest.fn()
      };
      
      rerender({ params: newParams });
      
      expect(result.current.handlePeriodSetupDataChange).not.toBe(firstHandleDataChange);
    });
  });

  describe('Callback execution', () => {
    it('should execute onDataChange callback with correct parameters', () => {
      const { result } = renderHook(() => usePeriodSetupEffects(defaultParams));
      
      const testCases = [
        { hasChanges: true, expectedValue: true },
        { hasChanges: false, expectedValue: false }
      ];

      testCases.forEach(({ hasChanges, expectedValue }) => {
        act(() => {
          result.current.handlePeriodSetupDataChange(hasChanges);
        });
        
        expect(mockOnDataChange).toHaveBeenCalledWith(expectedValue);
      });
    });

    it('should execute onDataLoaded callback with correct parameters', () => {
      const { result } = renderHook(() => usePeriodSetupEffects(defaultParams));
      
      const testCases = [
        { hasData: true, expectedValue: true },
        { hasData: false, expectedValue: false }
      ];

      testCases.forEach(({ hasData, expectedValue }) => {
        act(() => {
          result.current.handlePeriodSetupDataLoaded(hasData);
        });
        
        expect(mockOnDataLoaded).toHaveBeenCalledWith(expectedValue);
      });
    });
  });

  describe('Multiple calls', () => {
    it('should handle multiple calls to handlePeriodSetupDataChange', () => {
      const { result } = renderHook(() => usePeriodSetupEffects(defaultParams));
      
      act(() => {
        result.current.handlePeriodSetupDataChange(true);
        result.current.handlePeriodSetupDataChange(false);
        result.current.handlePeriodSetupDataChange(true);
      });
      
      expect(mockOnDataChange).toHaveBeenCalledTimes(3);
      expect(mockOnDataChange).toHaveBeenNthCalledWith(1, true);
      expect(mockOnDataChange).toHaveBeenNthCalledWith(2, false);
      expect(mockOnDataChange).toHaveBeenNthCalledWith(3, true);
    });

    it('should handle multiple calls to handlePeriodSetupDataLoaded', () => {
      const { result } = renderHook(() => usePeriodSetupEffects(defaultParams));
      
      act(() => {
        result.current.handlePeriodSetupDataLoaded(true);
        result.current.handlePeriodSetupDataLoaded(false);
        result.current.handlePeriodSetupDataLoaded(true);
      });
      
      expect(mockOnDataLoaded).toHaveBeenCalledTimes(3);
      expect(mockOnDataLoaded).toHaveBeenNthCalledWith(1, true);
      expect(mockOnDataLoaded).toHaveBeenNthCalledWith(2, false);
      expect(mockOnDataLoaded).toHaveBeenNthCalledWith(3, true);
    });

    it('should handle mixed calls to both functions', () => {
      const { result } = renderHook(() => usePeriodSetupEffects(defaultParams));
      
      act(() => {
        result.current.handlePeriodSetupDataChange(true);
        result.current.handlePeriodSetupDataLoaded(false);
        result.current.handlePeriodSetupDataChange(false);
        result.current.handlePeriodSetupDataLoaded(true);
      });
      
      expect(mockOnDataChange).toHaveBeenCalledTimes(2);
      expect(mockOnDataLoaded).toHaveBeenCalledTimes(2);
    });
  });

  describe('Hook isolation', () => {
    it('should maintain separate state for multiple hook instances', () => {
      const mockOnDataChange1 = jest.fn();
      const mockOnDataChange2 = jest.fn();
      const mockOnDataLoaded1 = jest.fn();
      const mockOnDataLoaded2 = jest.fn();

      const { result: result1 } = renderHook(() => usePeriodSetupEffects({
        onDataChange: mockOnDataChange1,
        onDataLoaded: mockOnDataLoaded1
      }));
      
      const { result: result2 } = renderHook(() => usePeriodSetupEffects({
        onDataChange: mockOnDataChange2,
        onDataLoaded: mockOnDataLoaded2
      }));
      
      act(() => {
        result1.current.handlePeriodSetupDataChange(true);
        result2.current.handlePeriodSetupDataChange(false);
      });
      
      expect(mockOnDataChange1).toHaveBeenCalledWith(true);
      expect(mockOnDataChange2).toHaveBeenCalledWith(false);
    });
  });
});
