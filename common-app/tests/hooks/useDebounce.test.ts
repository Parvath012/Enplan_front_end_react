import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../src/hooks/useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 100));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 100 });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time by 50ms (less than delay)
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time by another 50ms (total 100ms)
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current).toBe('updated'); // Should now be updated
  });

  it('should cancel previous timeout when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    // Change value multiple times rapidly
    rerender({ value: 'first', delay: 100 });
    rerender({ value: 'second', delay: 100 });
    rerender({ value: 'third', delay: 100 });

    // Fast-forward time by 50ms
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time by another 50ms (total 100ms)
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current).toBe('third'); // Should be the last value
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    // Change value and delay
    rerender({ value: 'updated', delay: 200 });
    expect(result.current).toBe('initial');

    // Fast-forward time by 100ms (less than new delay)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time by another 100ms (total 200ms)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated'); // Should now be updated
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 0 });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time by 1ms
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated'); // Should now be updated
  });

  it('should handle negative delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: -100 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: -100 });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time by 1ms
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated'); // Should now be updated
  });

  it('should handle different data types', () => {
    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 100 } }
    );
    expect(numberResult.current).toBe(0);
    numberRerender({ value: 42, delay: 100 });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(numberResult.current).toBe(42);

    // Test with boolean
    const { result: booleanResult, rerender: booleanRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: false, delay: 100 } }
    );
    expect(booleanResult.current).toBe(false);
    booleanRerender({ value: true, delay: 100 });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(booleanResult.current).toBe(true);

    // Test with object
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: { a: 1 }, delay: 100 } }
    );
    expect(objectResult.current).toEqual({ a: 1 });
    objectRerender({ value: { b: 2 }, delay: 100 });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(objectResult.current).toEqual({ b: 2 });

    // Test with array
    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: [1, 2, 3], delay: 100 } }
    );
    expect(arrayResult.current).toEqual([1, 2, 3]);
    arrayRerender({ value: [4, 5, 6], delay: 100 });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(arrayResult.current).toEqual([4, 5, 6]);
  });

  it('should handle null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: null, delay: 100 } }
    );

    expect(result.current).toBe(null);

    rerender({ value: undefined, delay: 100 });
    expect(result.current).toBe(null);

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe(undefined);
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() => useDebounce('test', 100));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should handle multiple rapid changes with different delays', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    // Change value with different delays
    rerender({ value: 'first', delay: 50 });
    act(() => {
      jest.advanceTimersByTime(25);
    });
    rerender({ value: 'second', delay: 100 });
    act(() => {
      jest.advanceTimersByTime(25);
    });
    rerender({ value: 'third', delay: 200 });

    // Fast-forward time by 100ms
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time by another 100ms (total 200ms)
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('third'); // Should be the last value
  });
});
