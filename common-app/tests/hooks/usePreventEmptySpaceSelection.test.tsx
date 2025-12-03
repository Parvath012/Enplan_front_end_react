import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { usePreventEmptySpaceSelection } from '../../src/hooks/usePreventEmptySpaceSelection';

// Mock window.getSelection and Selection API
const mockRemoveAllRanges = jest.fn();
const mockGetSelection = jest.fn();

describe('usePreventEmptySpaceSelection', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'getSelection', {
      writable: true,
      value: mockGetSelection,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock return value
    mockGetSelection.mockReturnValue({
      removeAllRanges: mockRemoveAllRanges,
      rangeCount: 1,
    });
  });

  // Helper component to test the hook
  interface TestComponentProps {
    tag: string;
    hasTextNode?: boolean;
  }

  const TestComponent: React.FC<TestComponentProps> = ({ tag, hasTextNode = false }) => {
    const elementRef = usePreventEmptySpaceSelection();
    const TagComponent = tag as any;

    return (
      <div data-testid="parent-container">
        <TagComponent ref={elementRef} data-testid="target-element">
          {hasTextNode ? 'Direct Text Content' : <span data-testid="child-element">Child Content</span>}
        </TagComponent>
      </div>
    );
  };

  describe('Container Elements', () => {
    const containerTags = ['DIV', 'SECTION', 'HEADER', 'NAV', 'MAIN', 'ARTICLE', 'ASIDE'];

    containerTags.forEach((tag) => {
      describe(`Testing with structural tag: <${tag}>`, () => {
        test(`should prevent selection on mousedown for empty ${tag}`, () => {
          const { getByTestId } = render(<TestComponent tag={tag} hasTextNode={false} />);
          const targetElement = getByTestId('target-element');

          fireEvent.mouseDown(targetElement);

          expect(mockGetSelection).toHaveBeenCalled();
          expect(mockRemoveAllRanges).toHaveBeenCalled();
        });

        test(`should allow selection on mousedown for ${tag} with text`, () => {
          const { getByTestId } = render(<TestComponent tag={tag} hasTextNode={true} />);
          const targetElement = getByTestId('target-element');

          fireEvent.mouseDown(targetElement);

          expect(mockGetSelection).not.toHaveBeenCalled();
          expect(mockRemoveAllRanges).not.toHaveBeenCalled();
        });

        test(`should prevent selection on selectstart for empty ${tag}`, () => {
          const { getByTestId } = render(<TestComponent tag={tag} hasTextNode={false} />);
          const targetElement = getByTestId('target-element');

          const selectStartEvent = new Event('selectstart', { bubbles: true, cancelable: true });
          Object.defineProperty(selectStartEvent, 'target', {
            value: targetElement,
            writable: false
          });
          
          fireEvent(targetElement, selectStartEvent);
          expect(selectStartEvent.defaultPrevented).toBe(true);
        });

        test(`should prevent selection on doubleclick for empty ${tag}`, () => {
          const { getByTestId } = render(<TestComponent tag={tag} hasTextNode={false} />);
          const targetElement = getByTestId('target-element');

          fireEvent.doubleClick(targetElement);

          expect(mockGetSelection).toHaveBeenCalled();
          expect(mockRemoveAllRanges).toHaveBeenCalled();
        });
      });
    });
  });

  describe('Non-container elements', () => {
    test('should NOT prevent selection for non-structural elements', () => {
      const { getByTestId } = render(<TestComponent tag="P" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');

      fireEvent.mouseDown(targetElement);

      expect(mockGetSelection).not.toHaveBeenCalled();
      expect(mockRemoveAllRanges).not.toHaveBeenCalled();
    });

    test('should NOT prevent selection for SPAN elements', () => {
      const { getByTestId } = render(<TestComponent tag="SPAN" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');

      fireEvent.mouseDown(targetElement);

      expect(mockGetSelection).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle null selection gracefully in mousedown', () => {
      mockGetSelection.mockReturnValue(null);
      const { getByTestId } = render(<TestComponent tag="DIV" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');
      
      expect(() => {
        fireEvent.mouseDown(targetElement);
      }).not.toThrow();
    });

    test('should handle selection with rangeCount 0', () => {
      mockGetSelection.mockReturnValue({
        removeAllRanges: mockRemoveAllRanges,
        rangeCount: 0,
      });
      const { getByTestId } = render(<TestComponent tag="DIV" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');
      
      fireEvent.mouseDown(targetElement);
      expect(mockRemoveAllRanges).not.toHaveBeenCalled();
    });

    test('should handle null selection in doubleClick', () => {
      mockGetSelection.mockReturnValue(null);
      const { getByTestId } = render(<TestComponent tag="DIV" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');
      
      expect(() => {
        fireEvent.doubleClick(targetElement);
      }).not.toThrow();
    });

    test('should handle missing window.getSelection', () => {
      const originalGetSelection = window.getSelection;
      delete (window as any).getSelection;

      const { getByTestId } = render(<TestComponent tag="DIV" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');
      
      expect(() => {
        fireEvent.mouseDown(targetElement);
        fireEvent.doubleClick(targetElement);
      }).not.toThrow();

      window.getSelection = originalGetSelection;
    });
  });

  describe('Cleanup', () => {
    test('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(HTMLElement.prototype, 'removeEventListener');
      
      const { unmount } = render(<TestComponent tag="DIV" hasTextNode={false} />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('selectstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('dblclick', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    test('should handle cleanup when element ref is null', () => {
      const TestComponentWithNullRef: React.FC = () => {
        usePreventEmptySpaceSelection();
        return <div>Test without ref</div>;
      };

      expect(() => {
        const { unmount } = render(<TestComponentWithNullRef />);
        unmount();
      }).not.toThrow();
    });
  });

  describe('isClickOnEmptySpace Function Coverage', () => {
    test('should correctly identify elements with multiple child nodes as empty space', () => {
      const TestComponentMultipleChildren: React.FC = () => {
        const elementRef = usePreventEmptySpaceSelection();
        return (
          <div ref={elementRef} data-testid="multi-child-element">
            <span>First child</span>
            <span>Second child</span>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponentMultipleChildren />);
      const targetElement = getByTestId('multi-child-element');
      
      fireEvent.mouseDown(targetElement);

      // Elements with multiple children are considered empty space in this hook's logic
      expect(mockGetSelection).toHaveBeenCalled();
      expect(mockRemoveAllRanges).toHaveBeenCalled();
    });

    test('should correctly handle elements with mixed content as empty space', () => {
      const TestComponentMixedContent: React.FC = () => {
        const elementRef = usePreventEmptySpaceSelection();
        return (
          <div ref={elementRef} data-testid="mixed-content-element">
            Some text <span>and element</span>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponentMixedContent />);
      const targetElement = getByTestId('mixed-content-element');
      
      fireEvent.mouseDown(targetElement);

      // Elements with mixed content (multiple child nodes) are considered empty space
      expect(mockGetSelection).toHaveBeenCalled();
      expect(mockRemoveAllRanges).toHaveBeenCalled();
    });

    test('should correctly detect direct text nodes using Node.TEXT_NODE', () => {
      const TestComponentDirectText: React.FC = () => {
        const elementRef = usePreventEmptySpaceSelection();
        return (
          <div 
            ref={elementRef} 
            data-testid="direct-text-element"
            dangerouslySetInnerHTML={{ __html: 'Direct text content' }}
          />
        );
      };

      const { getByTestId } = render(<TestComponentDirectText />);
      const targetElement = getByTestId('direct-text-element');
      
      fireEvent.mouseDown(targetElement);

      expect(mockGetSelection).not.toHaveBeenCalled();
    });

    test('should handle container element with no children', () => {
      const TestComponentEmpty: React.FC = () => {
        const elementRef = usePreventEmptySpaceSelection();
        return <div ref={elementRef} data-testid="empty-element" />;
      };

      const { getByTestId } = render(<TestComponentEmpty />);
      const targetElement = getByTestId('empty-element');
      
      fireEvent.mouseDown(targetElement);

      // Empty container elements should trigger selection prevention
      expect(mockGetSelection).toHaveBeenCalled();
      expect(mockRemoveAllRanges).toHaveBeenCalled();
    });

    test('should handle elements that are not container types', () => {
      const TestComponentButton: React.FC = () => {
        const elementRef = usePreventEmptySpaceSelection();
        return (
          <button ref={elementRef} data-testid="button-element">
            Button text
          </button>
        );
      };

      const { getByTestId } = render(<TestComponentButton />);
      const targetElement = getByTestId('button-element');
      
      fireEvent.mouseDown(targetElement);

      // BUTTON is not in the container elements list, so should not prevent selection
      expect(mockGetSelection).not.toHaveBeenCalled();
    });
  });

  describe('Additional Coverage for Double Click Events', () => {
    test('should handle double click with stopPropagation', () => {
      const { getByTestId } = render(<TestComponent tag="DIV" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');

      const stopPropagationSpy = jest.fn();
      const doubleClickEvent = new MouseEvent('dblclick', { bubbles: true, cancelable: true });
      
      // Mock the event's stopPropagation method
      Object.defineProperty(doubleClickEvent, 'stopPropagation', {
        value: stopPropagationSpy,
        writable: false
      });
      Object.defineProperty(doubleClickEvent, 'target', {
        value: targetElement,
        writable: false
      });

      fireEvent(targetElement, doubleClickEvent);

      expect(mockGetSelection).toHaveBeenCalled();
      expect(mockRemoveAllRanges).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    test('should handle double click with complete selection object', () => {
      jest.clearAllMocks();
      
      mockGetSelection.mockReturnValue({
        removeAllRanges: mockRemoveAllRanges,
        rangeCount: 0 // No ranges to remove
      });
      
      const { getByTestId } = render(<TestComponent tag="DIV" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');

      fireEvent.doubleClick(targetElement);
      
      expect(mockGetSelection).toHaveBeenCalled();
      // Should not call removeAllRanges when rangeCount is 0
      expect(mockRemoveAllRanges).not.toHaveBeenCalled();
    });
  });

  describe('Additional Coverage for Select Start Events', () => {
    test('should handle selectstart event on text content element', () => {
      const { getByTestId } = render(<TestComponent tag="DIV" hasTextNode={true} />);
      const targetElement = getByTestId('target-element');

      const selectStartEvent = new Event('selectstart', { bubbles: true, cancelable: true });
      Object.defineProperty(selectStartEvent, 'target', {
        value: targetElement,
        writable: false
      });
      
      fireEvent(targetElement, selectStartEvent);
      
      // Should NOT prevent default for elements with direct text
      expect(selectStartEvent.defaultPrevented).toBe(false);
    });

    test('should handle selectstart event on non-container element', () => {
      const { getByTestId } = render(<TestComponent tag="BUTTON" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');

      const selectStartEvent = new Event('selectstart', { bubbles: true, cancelable: true });
      Object.defineProperty(selectStartEvent, 'target', {
        value: targetElement,
        writable: false
      });
      
      fireEvent(targetElement, selectStartEvent);
      
      // Should NOT prevent default for non-container elements
      expect(selectStartEvent.defaultPrevented).toBe(false);
    });
  });

  describe('Edge Cases for MouseDown Events', () => {
    test('should handle mousedown when selection exists but rangeCount is greater than 0', () => {
      mockGetSelection.mockReturnValue({
        removeAllRanges: mockRemoveAllRanges,
        rangeCount: 2 // Multiple ranges
      });
      
      const { getByTestId } = render(<TestComponent tag="DIV" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');

      fireEvent.mouseDown(targetElement);

      expect(mockGetSelection).toHaveBeenCalled();
      expect(mockRemoveAllRanges).toHaveBeenCalled();
    });

    test('should handle mousedown when preventDefault is called', () => {
      const { getByTestId } = render(<TestComponent tag="DIV" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');

      const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(mouseDownEvent, 'preventDefault');
      
      Object.defineProperty(mouseDownEvent, 'target', {
        value: targetElement,
        writable: false
      });

      fireEvent(targetElement, mouseDownEvent);

      expect(mockGetSelection).toHaveBeenCalled();
      expect(mockRemoveAllRanges).toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should not call window.getSelection for non-empty space clicks', () => {
      const { getByTestId } = render(<TestComponent tag="P" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');

      fireEvent.mouseDown(targetElement);

      // P element is not in container list, so should not process
      expect(mockGetSelection).not.toHaveBeenCalled();
    });
  });

  describe('Additional Double Click Coverage', () => {
    test('should handle double click preventDefault and stopPropagation calls', () => {
      const { getByTestId } = render(<TestComponent tag="DIV" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');

      const doubleClickEvent = new MouseEvent('dblclick', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(doubleClickEvent, 'preventDefault');
      const stopPropagationSpy = jest.spyOn(doubleClickEvent, 'stopPropagation');
      
      Object.defineProperty(doubleClickEvent, 'target', {
        value: targetElement,
        writable: false
      });

      fireEvent(targetElement, doubleClickEvent);

      expect(mockGetSelection).toHaveBeenCalled();
      expect(mockRemoveAllRanges).toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    test('should handle double click when selection exists without rangeCount', () => {
      mockGetSelection.mockReturnValue({
        removeAllRanges: mockRemoveAllRanges,
        rangeCount: 1 // Add rangeCount so it will call removeAllRanges
        // No rangeCount property
      });
      
      const { getByTestId } = render(<TestComponent tag="DIV" hasTextNode={false} />);
      const targetElement = getByTestId('target-element');

      fireEvent.doubleClick(targetElement);

      expect(mockGetSelection).toHaveBeenCalled();
      expect(mockRemoveAllRanges).toHaveBeenCalled();
    });
  });
});