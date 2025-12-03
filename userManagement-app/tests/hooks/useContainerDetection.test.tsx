import { renderHook, act } from '@testing-library/react';
import { useContainerDetection } from '../../src/hooks/useContainerDetection';

describe('useContainerDetection', () => {
  // Mock console.log to prevent cluttering test output
  const originalConsoleLog = console.log;
  
  beforeEach(() => {
    console.log = jest.fn();
    
    // Create a test container with a specific class for testing
    const testContainer = document.createElement('div');
    testContainer.className = 'test-container';
    document.body.appendChild(testContainer);
  });
  
  afterEach(() => {
    console.log = originalConsoleLog;
    
    // Clean up the test container
    const testContainer = document.querySelector('.test-container');
    if (testContainer) {
      document.body.removeChild(testContainer);
    }
    
    // Clean up any other test elements
    const otherContainer = document.querySelector('.other-container');
    if (otherContainer) {
      document.body.removeChild(otherContainer);
    }
    
    const delayedContainer = document.querySelector('.delayed-container');
    if (delayedContainer) {
      document.body.removeChild(delayedContainer);
    }
    
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should find container immediately when selector matches an element', () => {
    // Arrange
    const selector = '.test-container';

    // Act
    const { result } = renderHook(() => useContainerDetection(selector));

    // Assert
    expect(result.current.ready).toBe(true);
    expect(result.current.containerRef.current).not.toBeNull();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Container found'),
      expect.any(HTMLDivElement)
    );
  });

  it('should retry finding container after delay when not found immediately', () => {
    // Arrange
    jest.useFakeTimers();
    const selector = '.other-container';

    // Act
    const { result } = renderHook(() => useContainerDetection(selector, 100));
    
    // Assert - initially not found
    expect(result.current.ready).toBe(false);
    expect(result.current.containerRef.current).toBeNull();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/Container not found: .+/)
    );
    
    // Create the element after initial render
    act(() => {
      const otherContainer = document.createElement('div');
      otherContainer.className = 'other-container';
      document.body.appendChild(otherContainer);
      
      // Advance timers to trigger retry
      jest.advanceTimersByTime(100);
    });
    
    // Re-render to see updated state after the timer
    const { result: resultAfter } = renderHook(() => useContainerDetection(selector, 100));
    
    // Create the element and advance timers
    act(() => {
      const otherContainer = document.createElement('div');
      otherContainer.className = 'other-container';
      document.body.appendChild(otherContainer);
      jest.advanceTimersByTime(100);
    });
    
    // The container should now be found
    expect(resultAfter.current.ready).toBe(true);
    expect(resultAfter.current.containerRef.current).not.toBeNull();
  });

  it('should update when selector changes', () => {
    // Arrange
    const initialSelector = '.test-container';
    
    // Act & Assert - first with the existing container
    const { result, rerender } = renderHook(
      (props) => useContainerDetection(props.selector), 
      { initialProps: { selector: initialSelector } }
    );
    
    expect(result.current.ready).toBe(true);
    expect(result.current.containerRef.current).not.toBeNull();
    
    // Create a new container element
    const newContainer = document.createElement('div');
    newContainer.className = 'other-container';
    document.body.appendChild(newContainer);
    
    // Change the selector
    rerender({ selector: '.other-container' });
    
    // The hook should now reference the new container
    expect(result.current.ready).toBe(true);
    expect(result.current.containerRef.current).toBe(newContainer);
  });

  it('should handle non-existent selectors', () => {
    // Arrange
    jest.useFakeTimers();
    const nonExistentSelector = '.non-existent-element';
    
    // Act
    const { result } = renderHook(() => useContainerDetection(nonExistentSelector));
    
    // Assert
    expect(result.current.ready).toBe(false);
    expect(result.current.containerRef.current).toBeNull();
    
    // Advance timer to trigger retry
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Still shouldn't find the container
    expect(result.current.ready).toBe(false);
    expect(result.current.containerRef.current).toBeNull();
  });

  it('should respect custom retry delay', () => {
    // Arrange
    jest.useFakeTimers();
    const selector = '.delayed-container';
    const customDelay = 500;
    const spyOnSetTimeout = jest.spyOn(global, 'setTimeout');
    
    // Act
    const { result } = renderHook(() => useContainerDetection(selector, customDelay));
    
    // Assert
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/Container not found: .+/)
    );
    
    // Verify the timer was set with the custom delay
    expect(spyOnSetTimeout).toHaveBeenCalledWith(expect.any(Function), customDelay);
    
    // Fast forward less than the custom delay - shouldn't find container yet
    act(() => {
      jest.advanceTimersByTime(customDelay - 1);
    });
    
    // The container should still not be found
    expect(result.current.ready).toBe(false);
    
    // Now create the container
    const delayedContainer = document.createElement('div');
    delayedContainer.className = 'delayed-container';
    document.body.appendChild(delayedContainer);
    
    // Fast forward to complete the delay
    act(() => {
      jest.advanceTimersByTime(1);
    });
    
    // Now the container should be found
    expect(result.current.ready).toBe(true);
    expect(result.current.containerRef.current).not.toBeNull();
  });

  it('should clean up timer on unmount', () => {
    // Arrange
    jest.useFakeTimers();
    const spy = jest.spyOn(window, 'clearTimeout');
    const selector = '.future-container';
    
    // Act
    const { unmount } = renderHook(() => useContainerDetection(selector));
    
    // Assert - cleanup should happen on unmount
    unmount();
    expect(spy).toHaveBeenCalled();
  });

  it('should use default retry delay when not provided', () => {
    // Arrange
    jest.useFakeTimers();
    const selector = '.default-delay-container';
    const spyOnSetTimeout = jest.spyOn(global, 'setTimeout');
    
    // Act
    renderHook(() => useContainerDetection(selector));
    
    // Assert - should use default delay of 100ms
    expect(spyOnSetTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
  });

  it('should handle multiple rerenders with same selector', () => {
    // Arrange
    const selector = '.test-container';
    
    // Act
    const { result, rerender } = renderHook(() => useContainerDetection(selector));
    
    // Assert
    expect(result.current.ready).toBe(true);
    
    // Rerender with same selector
    rerender();
    
    // Should still be ready
    expect(result.current.ready).toBe(true);
    expect(result.current.containerRef.current).not.toBeNull();
  });
});

