import { renderHook, act } from '@testing-library/react';
import { useHierarchyZoom } from '../../src/hooks/useHierarchyZoom';
import { ZOOM_STEPS, DEFAULT_ZOOM_INDEX } from '../../src/constants/hierarchyConstants';
import { fitViewToContainer } from '../../src/constants/hierarchyConstants';

// Mock fitViewToContainer
jest.mock('../../src/constants/hierarchyConstants', () => ({
  ...jest.requireActual('../../src/constants/hierarchyConstants'),
  fitViewToContainer: jest.fn(),
}));

describe('useHierarchyZoom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with default zoom index when no parameter provided', () => {
      const { result } = renderHook(() => useHierarchyZoom());
      
      expect(result.current.zoomIndex).toBe(DEFAULT_ZOOM_INDEX);
      expect(result.current.zoomSteps).toBe(ZOOM_STEPS);
      expect(result.current.reactFlowRef).toBeDefined();
      expect(result.current.reactFlowRef.current).toBeNull();
    });

    it('should initialize with custom zoom index when provided', () => {
      const customIndex = 5;
      const { result } = renderHook(() => useHierarchyZoom(customIndex));
      
      expect(result.current.zoomIndex).toBe(customIndex);
      expect(result.current.zoomSteps).toBe(ZOOM_STEPS);
    });

    it('should return all required properties', () => {
      const { result } = renderHook(() => useHierarchyZoom());
      
      expect(result.current).toHaveProperty('zoomIndex');
      expect(result.current).toHaveProperty('zoomSteps');
      expect(result.current).toHaveProperty('zoomIn');
      expect(result.current).toHaveProperty('zoomOut');
      expect(result.current).toHaveProperty('zoomReset');
      expect(result.current).toHaveProperty('reactFlowRef');
    });

    it('should return zoomSteps as readonly array', () => {
      const { result } = renderHook(() => useHierarchyZoom());
      
      expect(result.current.zoomSteps).toBe(ZOOM_STEPS);
      expect(Object.isFrozen(result.current.zoomSteps)).toBe(true);
    });
  });

  describe('zoomIn', () => {
    it('should increase zoom index by 1', () => {
      const { result } = renderHook(() => useHierarchyZoom(0));
      
      act(() => {
        result.current.zoomIn();
      });
      
      expect(result.current.zoomIndex).toBe(1);
    });

    it('should not exceed maximum zoom index', () => {
      const maxIndex = ZOOM_STEPS.length - 1;
      const { result } = renderHook(() => useHierarchyZoom(maxIndex));
      
      act(() => {
        result.current.zoomIn();
      });
      
      expect(result.current.zoomIndex).toBe(maxIndex);
    });

    it('should cap at maximum when already at max', () => {
      const maxIndex = ZOOM_STEPS.length - 1;
      const { result } = renderHook(() => useHierarchyZoom(maxIndex));
      
      act(() => {
        result.current.zoomIn();
        result.current.zoomIn();
        result.current.zoomIn();
      });
      
      expect(result.current.zoomIndex).toBe(maxIndex);
    });

    it('should work from middle index', () => {
      const middleIndex = Math.floor(ZOOM_STEPS.length / 2);
      const { result } = renderHook(() => useHierarchyZoom(middleIndex));
      
      act(() => {
        result.current.zoomIn();
      });
      
      expect(result.current.zoomIndex).toBe(middleIndex + 1);
    });
  });

  describe('zoomOut', () => {
    it('should decrease zoom index by 1', () => {
      const { result } = renderHook(() => useHierarchyZoom(5));
      
      act(() => {
        result.current.zoomOut();
      });
      
      expect(result.current.zoomIndex).toBe(4);
    });

    it('should not go below minimum zoom index (0)', () => {
      const { result } = renderHook(() => useHierarchyZoom(0));
      
      act(() => {
        result.current.zoomOut();
      });
      
      expect(result.current.zoomIndex).toBe(0);
    });

    it('should cap at minimum when already at min', () => {
      const { result } = renderHook(() => useHierarchyZoom(0));
      
      act(() => {
        result.current.zoomOut();
        result.current.zoomOut();
        result.current.zoomOut();
      });
      
      expect(result.current.zoomIndex).toBe(0);
    });

    it('should work from middle index', () => {
      const middleIndex = Math.floor(ZOOM_STEPS.length / 2);
      const { result } = renderHook(() => useHierarchyZoom(middleIndex));
      
      act(() => {
        result.current.zoomOut();
      });
      
      expect(result.current.zoomIndex).toBe(middleIndex - 1);
    });
  });

  describe('zoomReset', () => {
    it('should reset to default zoom index', () => {
      const { result } = renderHook(() => useHierarchyZoom(5));
      
      act(() => {
        result.current.zoomReset();
      });
      
      expect(result.current.zoomIndex).toBe(DEFAULT_ZOOM_INDEX);
    });

    it('should reset to custom default zoom index when provided', () => {
      const customIndex = 2;
      const { result } = renderHook(() => useHierarchyZoom(customIndex));
      
      // Change zoom
      act(() => {
        result.current.zoomIn();
        result.current.zoomIn();
      });
      
      expect(result.current.zoomIndex).toBe(customIndex + 2);
      
      // Reset
      act(() => {
        result.current.zoomReset();
      });
      
      expect(result.current.zoomIndex).toBe(customIndex);
    });

    it('should call fitViewToContainer when reactFlowRef is set', () => {
      const mockInstance = {
        fitView: jest.fn(),
      } as any;
      
      const { result } = renderHook(() => useHierarchyZoom());
      
      // Set the ref
      result.current.reactFlowRef.current = mockInstance;
      
      act(() => {
        result.current.zoomReset();
      });
      
      // Fast-forward timers to trigger setTimeout
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(fitViewToContainer).toHaveBeenCalledWith(mockInstance);
    });

    it('should not call fitViewToContainer when reactFlowRef is null', () => {
      const { result } = renderHook(() => useHierarchyZoom());
      
      // Ensure ref is null
      result.current.reactFlowRef.current = null;
      
      act(() => {
        result.current.zoomReset();
      });
      
      // Fast-forward timers
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(fitViewToContainer).not.toHaveBeenCalled();
    });

    it('should use setTimeout with 100ms delay', () => {
      const mockInstance = {
        fitView: jest.fn(),
      } as any;
      
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const { result } = renderHook(() => useHierarchyZoom());
      
      result.current.reactFlowRef.current = mockInstance;
      
      act(() => {
        result.current.zoomReset();
      });
      
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
      
      setTimeoutSpy.mockRestore();
    });
  });

  describe('reactFlowRef', () => {
    it('should provide a ref object', () => {
      const { result } = renderHook(() => useHierarchyZoom());
      
      expect(result.current.reactFlowRef).toBeDefined();
      expect(result.current.reactFlowRef).toHaveProperty('current');
    });

    it('should allow setting reactFlowRef.current', () => {
      const mockInstance = {
        fitView: jest.fn(),
      } as any;
      
      const { result } = renderHook(() => useHierarchyZoom());
      
      result.current.reactFlowRef.current = mockInstance;
      
      expect(result.current.reactFlowRef.current).toBe(mockInstance);
    });

    it('should persist ref across re-renders', () => {
      const { result, rerender } = renderHook(() => useHierarchyZoom());
      
      const mockInstance = {
        fitView: jest.fn(),
      } as any;
      
      result.current.reactFlowRef.current = mockInstance;
      
      rerender();
      
      expect(result.current.reactFlowRef.current).toBe(mockInstance);
    });
  });

  describe('edge cases', () => {
    it('should handle negative default zoom index', () => {
      const { result } = renderHook(() => useHierarchyZoom(-1));
      
      expect(result.current.zoomIndex).toBe(-1);
      
      act(() => {
        result.current.zoomOut();
      });
      
      // Should still be -1 (capped at 0)
      expect(result.current.zoomIndex).toBe(-1);
    });

    it('should handle default zoom index greater than max', () => {
      const maxIndex = ZOOM_STEPS.length - 1;
      const { result } = renderHook(() => useHierarchyZoom(maxIndex + 10));
      
      expect(result.current.zoomIndex).toBe(maxIndex + 10);
      
      act(() => {
        result.current.zoomIn();
      });
      
      // Should cap at max
      expect(result.current.zoomIndex).toBe(maxIndex);
    });

    it('should handle rapid zoom in/out operations', () => {
      const { result } = renderHook(() => useHierarchyZoom(3));
      
      act(() => {
        result.current.zoomIn();
        result.current.zoomOut();
        result.current.zoomIn();
        result.current.zoomIn();
        result.current.zoomOut();
      });
      
      expect(result.current.zoomIndex).toBe(4);
    });

    it('should handle multiple reset calls', () => {
      const { result } = renderHook(() => useHierarchyZoom(2));
      
      act(() => {
        result.current.zoomIn();
        result.current.zoomIn();
        result.current.zoomReset();
        result.current.zoomIn();
        result.current.zoomReset();
      });
      
      expect(result.current.zoomIndex).toBe(2);
    });
  });

  describe('integration', () => {
    it('should maintain state across multiple operations', () => {
      const { result } = renderHook(() => useHierarchyZoom(3));
      
      act(() => {
        result.current.zoomIn();
        expect(result.current.zoomIndex).toBe(4);
        
        result.current.zoomOut();
        expect(result.current.zoomIndex).toBe(3);
        
        result.current.zoomIn();
        result.current.zoomIn();
        expect(result.current.zoomIndex).toBe(5);
        
        result.current.zoomReset();
        expect(result.current.zoomIndex).toBe(3);
      });
    });

    it('should work correctly with reactFlowRef and reset', () => {
      const mockInstance = {
        fitView: jest.fn(),
      } as any;
      
      const { result } = renderHook(() => useHierarchyZoom(2));
      
      result.current.reactFlowRef.current = mockInstance;
      
      act(() => {
        result.current.zoomIn();
        result.current.zoomIn();
        result.current.zoomReset();
      });
      
      expect(result.current.zoomIndex).toBe(2);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(fitViewToContainer).toHaveBeenCalledWith(mockInstance);
    });
  });
});

