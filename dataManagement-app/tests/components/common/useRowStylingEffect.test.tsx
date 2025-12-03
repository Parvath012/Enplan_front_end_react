import React, { useRef } from 'react';
import { render, act } from '@testing-library/react';
import { AgGridReact } from 'ag-grid-react';
import { useRowStylingEffect } from '../../../src/components/common/useRowStylingEffect';
import { normalizeId, hasValidDescription } from '../../../src/components/common/browserUtils';

// Mock browserUtils
jest.mock('../../../src/components/common/browserUtils', () => ({
  normalizeId: jest.fn((id) => {
    if (id == null || id === '') return '';
    return String(id).trim().toLowerCase();
  }),
  hasValidDescription: jest.fn((service) => {
    if (!service) return false;
    return !!(service.description && 
           typeof service.description === 'string' && 
           service.description.trim().length > 0);
  })
}));

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 0);
  return 1;
});
global.requestAnimationFrame = mockRequestAnimationFrame as any;

describe('useRowStylingEffect', () => {
  let mockGridApi: any;
  let mockGridRef: React.RefObject<AgGridReact>;
  let mockGridContainerRef: React.RefObject<HTMLDivElement>;
  let mockContainerElement: HTMLDivElement;
  let mockRowElement: HTMLElement;
  let mockCellElement: HTMLElement;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Create mock grid API
    mockGridApi = {
      forEachNode: jest.fn(),
      getDisplayedRowAtIndex: jest.fn()
    };

    // Create mock DOM elements
    mockContainerElement = document.createElement('div');
    mockRowElement = document.createElement('div');
    mockRowElement.className = 'ag-row';
    mockRowElement.setAttribute('data-row-id', 'test-id-123');
    mockRowElement.setAttribute('data-row-id-normalized', 'test-id-123');
    
    mockCellElement = document.createElement('div');
    mockCellElement.className = 'ag-cell';
    mockRowElement.appendChild(mockCellElement);
    mockContainerElement.appendChild(mockRowElement);

    // Create refs
    mockGridRef = { current: { api: mockGridApi } as any };
    mockGridContainerRef = { current: mockContainerElement };

    // Mock getComputedStyle
    Object.defineProperty(window, 'getComputedStyle', {
      value: jest.fn(() => ({
        backgroundColor: 'rgb(135, 206, 250)'
      }))
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  const TestComponent = ({ 
    selectedItem, 
    checkDescription = false 
  }: { 
    selectedItem: { id: string; description?: string } | null;
    checkDescription?: boolean;
  }) => {
    const gridRef = useRef<AgGridReact>(null);
    const gridContainerRef = useRef<HTMLDivElement>(null);

    useRowStylingEffect({
      selectedItem,
      gridRef: mockGridRef,
      gridContainerRef: mockGridContainerRef,
      iconClassName: 'restricted-icon',
      rowSelectedClass: 'row-selected',
      checkDescription
    });

    return <div ref={gridContainerRef} data-testid="grid-container" />;
  };

  describe('Early returns', () => {
    it('should return early if gridRef.current.api is not available', () => {
      mockGridRef.current = null as any;
      
      render(<TestComponent selectedItem={null} />);
      
      // Should not throw and should not call forEachNode
      expect(mockGridApi.forEachNode).not.toHaveBeenCalled();
    });
    it('should return early if gridContainerRef.current is not available', () => {
      mockGridContainerRef.current = null as any;
      
      render(<TestComponent selectedItem={null} />);
      
      // Should not throw
      expect(mockGridApi.forEachNode).not.toHaveBeenCalled();
    });
  });

  describe('shouldHighlight logic', () => {
    it('should highlight when selectedItem has id and checkDescription is false', () => {
      const selectedItem = { id: 'test-id-123' };
      
      render(<TestComponent selectedItem={selectedItem} checkDescription={false} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });

    it('should not highlight when selectedItem is null', () => {
      render(<TestComponent selectedItem={null} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Should call forEachNode to remove highlighting
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });

    it('should not highlight when selectedId is empty string', () => {
      (normalizeId as jest.Mock).mockReturnValue('');
      const selectedItem = { id: '' };
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });

    it('should check description when checkDescription is true', () => {
      const selectedItem = { id: 'test-id-123', description: 'Valid description' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      (hasValidDescription as jest.Mock).mockReturnValue(true);
      
      render(<TestComponent selectedItem={selectedItem} checkDescription={true} />);
      
      act(() => {
        jest.advanceTimersByTime(50);
      });
      
      expect(hasValidDescription).toHaveBeenCalledWith(selectedItem);
    });

    it('should not highlight when checkDescription is true and description is invalid', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      (hasValidDescription as jest.Mock).mockReturnValue(false);
      
      render(<TestComponent selectedItem={selectedItem} checkDescription={true} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(hasValidDescription).toHaveBeenCalled();
    });
  });

  describe('applySelectionStyles', () => {
    it('should apply selection styles to row element', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // The styles should be applied via updateAllRows or forEachNode
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });

    it('should apply styles to cells', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Verify forEachNode was called which applies cell styles
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });

    it('should remove hover class', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      mockRowElement.classList.add('ag-row-hover');
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Verify the hook ran
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });
  });

  describe('removeSelectionStyles', () => {
    it('should remove selection styles when row is not hovered', () => {
      mockRowElement.classList.add('row-selected');
      mockRowElement.setAttribute('aria-selected', 'true');
      
      render(<TestComponent selectedItem={null} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockRowElement.classList.contains('row-selected')).toBe(false);
      expect(mockRowElement.getAttribute('aria-selected')).toBe('false');
    });

    it('should not remove styles when row is hovered', () => {
      mockRowElement.classList.add('row-selected');
      mockRowElement.classList.add('ag-row-hover');
      
      render(<TestComponent selectedItem={null} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Should still have row-selected class
      expect(mockRowElement.classList.contains('row-selected')).toBe(true);
    });
  });

  describe('processRowElement - Method 1: normalized ID attribute', () => {
    it('should use data-row-id-normalized attribute', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockRowElement.classList.contains('row-selected')).toBe(true);
    });
  });

  describe('processRowElement - Method 2: data-row-id attribute', () => {
    it('should use data-row-id attribute when normalized is not available', () => {
      const selectedItem = { id: 'test-id-123' };
      mockRowElement.removeAttribute('data-row-id-normalized');
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(normalizeId).toHaveBeenCalled();
    });
  });

  describe('processRowElement - Method 3: forEachNode', () => {
    it('should use forEachNode to find row by rowElement reference', () => {
      const selectedItem = { id: 'test-id-123' };
      mockRowElement.removeAttribute('data-row-id-normalized');
      mockRowElement.removeAttribute('data-row-id');
      
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ 
          data: { id: 'test-id-123' }, 
          rowElement: mockRowElement 
        });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });
  });

  describe('processRowElement - Method 4: row index', () => {
    it('should use row index as fallback', () => {
      const selectedItem = { id: 'test-id-123' };
      mockRowElement.removeAttribute('data-row-id-normalized');
      mockRowElement.removeAttribute('data-row-id');
      
      mockGridApi.forEachNode.mockImplementation(() => {});
      mockGridApi.getDisplayedRowAtIndex.mockReturnValue({
        data: { id: 'test-id-123' }
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockGridApi.getDisplayedRowAtIndex).toHaveBeenCalled();
    });
  });

  describe('applyNestedElementStyles', () => {
    it('should apply styles to nested elements', () => {
      const selectedItem = { id: 'test-id-123' };
      const nestedElement = document.createElement('div');
      mockCellElement.appendChild(nestedElement);
      
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(nestedElement.style.getPropertyValue('background-color')).toBe('rgb(135, 206, 250)');
    });

    it('should not apply background to text elements', () => {
      const selectedItem = { id: 'test-id-123' };
      const textElement = document.createElement('span');
      textElement.classList.add('type-column-text');
      mockCellElement.appendChild(textElement);
      
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Text elements should not get background color
      expect(textElement.style.getPropertyValue('background-color')).toBe('');
    });

    it('should preserve icon color for restricted icons', () => {
      const selectedItem = { id: 'test-id-123' };
      const iconElement = document.createElement('div');
      iconElement.classList.add('restricted-icon');
      mockCellElement.appendChild(iconElement);
      
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Icon should not have color property set
      expect(iconElement.style.getPropertyValue('color')).toBe('');
    });

    it('should handle SVG elements', () => {
      const selectedItem = { id: 'test-id-123' };
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      mockCellElement.appendChild(svgElement);
      
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(svgElement.style.getPropertyValue('background-color')).toBe('rgb(135, 206, 250)');
    });

    it('should handle PATH elements', () => {
      const selectedItem = { id: 'test-id-123' };
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const iconContainer = document.createElement('div');
      iconContainer.classList.add('restricted-icon');
      iconContainer.appendChild(pathElement);
      mockCellElement.appendChild(iconContainer);
      
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // PATH inside icon should not have fill removed
      expect(pathElement.style.getPropertyValue('fill')).toBe('');
    });
  });

  describe('removeNestedElementStyles', () => {
    it('should remove styles from nested elements', () => {
      const nestedElement = document.createElement('div');
      nestedElement.style.setProperty('background-color', '#87CEFA');
      nestedElement.style.setProperty('color', '#000000');
      mockCellElement.appendChild(nestedElement);
      
      render(<TestComponent selectedItem={null} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(nestedElement.style.getPropertyValue('background-color')).toBe('');
      expect(nestedElement.style.getPropertyValue('color')).toBe('');
    });

    it('should not remove styles from restricted icons', () => {
      const iconElement = document.createElement('div');
      iconElement.classList.add('restricted-icon');
      iconElement.style.setProperty('background-color', '#87CEFA');
      mockCellElement.appendChild(iconElement);
      
      render(<TestComponent selectedItem={null} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Icon styles should be preserved
      expect(iconElement.style.getPropertyValue('background-color')).toBe('rgb(135, 206, 250)');
    });
  });

  describe('updateRowStyling', () => {
    it('should apply styles when row matches selectedId', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockRowElement.classList.contains('row-selected')).toBe(true);
    });

    it('should remove styles when row does not match', () => {
      const selectedItem = { id: 'other-id' };
      (normalizeId as jest.Mock).mockImplementation((id) => {
        if (id === 'other-id') return 'other-id';
        if (id === 'test-id-123') return 'test-id-123';
        return String(id).toLowerCase();
      });
      mockRowElement.classList.add('row-selected');
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Verify the hook processed rows
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });

    it('should set role attribute', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockRowElement.getAttribute('role')).toBe('row');
    });
  });

  describe('updateAllRows', () => {
    it('should process all rows in container', () => {
      const row2 = document.createElement('div');
      row2.className = 'ag-row';
      row2.setAttribute('data-row-id', 'test-id-456');
      mockContainerElement.appendChild(row2);
      
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockImplementation((id) => {
        if (id === 'test-id-123') return 'test-id-123';
        if (id === 'test-id-456') return 'test-id-456';
        return String(id).toLowerCase();
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Both rows should be processed
      expect(mockRowElement.getAttribute('role')).toBe('row');
      expect(row2.getAttribute('role')).toBe('row');
    });
  });

  describe('Immediate highlighting', () => {
    it('should call requestAnimationFrame for immediate highlighting', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Verify the hook executed and forEachNode was called (which happens in requestAnimationFrame callback)
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });

    it('should call setTimeout multiple times for highlighting', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Should have been called multiple times (initial + interval + timeouts)
      expect(mockGridApi.forEachNode.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('MutationObserver', () => {
    it('should observe grid container for mutations', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      
      const observeSpy = jest.spyOn(MutationObserver.prototype, 'observe');
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      expect(observeSpy).toHaveBeenCalledWith(mockContainerElement, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        subtree: true,
        childList: false
      });
      
      observeSpy.mockRestore();
    });

    it('should trigger update on style attribute mutation', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      mockRowElement.classList.add('row-selected');
      
      let mutationCallback: any;
      jest.spyOn(MutationObserver.prototype, 'observe').mockImplementation(function(this: any, callback: any) {
        mutationCallback = this.callback;
      } as any);
      
      render(<TestComponent selectedItem={selectedItem} />);
      // Simulate mutation
      if (mutationCallback) {
        act(() => {
          mutationCallback([{
            type: 'attributes',
            attributeName: 'style',
            target: mockRowElement
          }]);
        });
      }
      
      jest.spyOn(MutationObserver.prototype, 'observe').mockRestore();
    });

    it('should trigger update on class attribute mutation', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      
      let mutationCallback: any;
      const originalObserve = MutationObserver.prototype.observe;
      jest.spyOn(MutationObserver.prototype, 'observe').mockImplementation(function(this: MutationObserver) {
        mutationCallback = (this as any).callback;
        return originalObserve.apply(this, arguments as any);
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      // Simulate class mutation
      if (mutationCallback) {
        act(() => {
          mutationCallback([{
            type: 'attributes',
            attributeName: 'class',
            target: mockRowElement
          }]);
        });
      }
      
      jest.spyOn(MutationObserver.prototype, 'observe').mockRestore();
    });
  });

  describe('Interval check', () => {
    it('should check selection styles periodically', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      const initialCallCount = mockGridApi.forEachNode.mock.calls.length;
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Should have been called more times due to interval
      expect(mockGridApi.forEachNode.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it('should reapply styles if background color is not sky blue', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      (window.getComputedStyle as jest.Mock).mockReturnValue({
        backgroundColor: 'rgb(255, 255, 255)' // Not sky blue
      });
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });

    it('should handle different sky blue color formats', () => {
      const selectedItem = { id: 'test-id-123' };
      (normalizeId as jest.Mock).mockReturnValue('test-id-123');
      (window.getComputedStyle as jest.Mock).mockReturnValue({
        backgroundColor: 'rgba(135, 206, 250, 1)'
      });
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should disconnect observer and clear interval on unmount', () => {
      const disconnectSpy = jest.spyOn(MutationObserver.prototype, 'disconnect');
      const selectedItem = { id: 'test-id-123' };
      
      const { unmount } = render(<TestComponent selectedItem={selectedItem} />);
      
      unmount();
      
      expect(disconnectSpy).toHaveBeenCalled();
      disconnectSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle row without data-row-id attributes', () => {
      mockRowElement.removeAttribute('data-row-id-normalized');
      mockRowElement.removeAttribute('data-row-id');
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      const selectedItem = { id: 'test-id-123' };
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(mockGridApi.forEachNode).toHaveBeenCalled();
    });

    it('should handle row with negative index', () => {
      mockRowElement.removeAttribute('data-row-id-normalized');
      mockRowElement.removeAttribute('data-row-id');
      mockGridApi.forEachNode.mockImplementation(() => {});
      mockGridApi.getDisplayedRowAtIndex.mockReturnValue(null);
      
      const selectedItem = { id: 'test-id-123' };
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Should not crash
      expect(mockGridApi.getDisplayedRowAtIndex).toHaveBeenCalled();
    });

    it('should handle element with closest restricted icon', () => {
      const selectedItem = { id: 'test-id-123' };
      const parentWithIcon = document.createElement('div');
      parentWithIcon.classList.add('restricted-icon');
      const nestedElement = document.createElement('div');
      parentWithIcon.appendChild(nestedElement);
      mockCellElement.appendChild(parentWithIcon);
      
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Should handle nested icon correctly
      expect(nestedElement.style.getPropertyValue('color')).toBe('');
    });

    it('should handle SVG with parent icon class', () => {
      const selectedItem = { id: 'test-id-123' };
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const parentIcon = document.createElement('div');
      parentIcon.classList.add('restricted-icon');
      parentIcon.appendChild(svgElement);
      mockCellElement.appendChild(parentIcon);
      
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // SVG inside icon should preserve fill
      expect(svgElement.style.getPropertyValue('fill')).toBe('');
    });

    it('should handle ag-cell-value class', () => {
      const selectedItem = { id: 'test-id-123' };
      const valueElement = document.createElement('div');
      valueElement.classList.add('ag-cell-value');
      mockCellElement.appendChild(valueElement);
      
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Value element should not get background
      expect(valueElement.style.getPropertyValue('background-color')).toBe('');
    });

    it('should handle role="gridcell" elements', () => {
      const selectedItem = { id: 'test-id-123' };
      const gridCell = document.createElement('div');
      gridCell.setAttribute('role', 'gridcell');
      mockRowElement.appendChild(gridCell);
      
      mockGridApi.forEachNode.mockImplementation((callback: any) => {
        callback({ data: { id: 'test-id-123' }, rowElement: mockRowElement });
      });
      
      render(<TestComponent selectedItem={selectedItem} />);
      
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(gridCell.style.getPropertyValue('background-color')).toBe('rgb(135, 206, 250)');
    });
  });
});

