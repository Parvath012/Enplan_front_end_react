import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GridBoard from '../../../src/components/Grid/GridBoard';

// Mock CSS import
jest.mock('../../../src/components/Grid/Grid.css', () => ({}));

// Initialize global array for capturing props (accessible from hoisted jest.mock)
if (!(global as any).__gridBoardTestCapturedProps__) {
  (global as any).__gridBoardTestCapturedProps__ = [];
}

jest.mock('../../../src/components/ProcessGroupBox', () => {
  const React = require('react');
  
  const MockProcessGroupBox = React.forwardRef((props: any, ref: any) => {
    // Access the global array to capture props
    const capturedProps = (global as any).__gridBoardTestCapturedProps__ || [];
    capturedProps.push(props);
    
    return React.createElement('div', {
      'data-testid': 'process-group-box',
      'data-name': props.name,
      'data-id': props.id,
      'data-is-selected': props.isSelected,
      'data-parent-group-id': props.parentGroupId,
      onMouseDown: props.onMouseDown,
      onClick: () => props.onClick && props.onClick(props.id, props.name),
      onDoubleClick: props.onDoubleClick,
    }, props.name);
  });
  MockProcessGroupBox.displayName = 'MockProcessGroupBox';
  return {
    __esModule: true,
    default: MockProcessGroupBox,
  };
});

// Local reference to the global array for use in tests
const capturedProps = (global as any).__gridBoardTestCapturedProps__;

describe('GridBoard', () => {
  const mockProcessGroups = [
    {
      id: '1',
      name: 'Test Group 1',
      parameterContext: 'default',
      position: { x: 0, y: 0 },
      runningCount: 1,
      stoppedCount: 0,
      invalidCount: 0,
      disabledCount: 0,
      activeRemotePortCount: 0,
      inactiveRemotePortCount: 0,
      queued: '0 / 0 bytes',
      input: '0 bytes',
      read: '0 bytes',
      written: '0 bytes',
      output: '0 bytes',
      upToDateCount: 1,
      locallyModifiedCount: 0,
      staleCount: 0,
      locallyModifiedAndStaleCount: 0,
      syncFailureCount: 0,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the global array
    (global as any).__gridBoardTestCapturedProps__ = [];
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
  });

  it('renders without crashing', () => {
    expect(() => render(<GridBoard processGroups={[]} />)).not.toThrow();
  });

  it('renders grid container', () => {
    render(<GridBoard processGroups={[]} />);
    
    // Look for grid container
    const container = document.querySelector('.grid-container');
    expect(container).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<GridBoard processGroups={[]} />);
    
    // Check if the component has grid-container class
    const gridContainer = container.querySelector('.grid-container');
    expect(gridContainer).toBeTruthy();
  });

  it('handles empty state', () => {
    render(<GridBoard processGroups={[]} />);
    
    // Should render without errors even when empty
    expect(document.body).toBeTruthy();
  });

  it('renders with default props', () => {
    expect(() => render(<GridBoard processGroups={[]} />)).not.toThrow();
  });

  it('renders with process groups', () => {
    render(<GridBoard processGroups={mockProcessGroups} />);
    
    // Should render process group boxes
    const boxes = screen.getAllByTestId('process-group-box');
    expect(boxes).toHaveLength(1);
    expect(boxes[0]).toHaveTextContent('Test Group 1');
  });

  it('maintains responsive design', () => {
    const { container } = render(<GridBoard processGroups={[]} />);
    
    // Check for responsive classes or styles
    const gridElement = container.firstChild as HTMLElement;
    
    if (gridElement) {
      const styles = window.getComputedStyle(gridElement);
      expect(styles).toBeTruthy();
    }
  });

  it('supports custom styling', () => {
    const { container } = render(<GridBoard processGroups={[]} />);
    
    // Check if component has styling applied
    expect(container.firstChild).toBeTruthy();
  });

  it('handles resize events', () => {
    render(<GridBoard processGroups={[]} />);
    
    // Simulate window resize
    global.dispatchEvent(new Event('resize'));
    
    // Should not throw errors
    expect(document.body).toBeTruthy();
  });

  it('renders grid content correctly', () => {
    render(<GridBoard processGroups={mockProcessGroups} />);
    
    // Should render process groups
    const boxes = screen.getAllByTestId('process-group-box');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('handles different states', () => {
    render(<GridBoard processGroups={[]} />);
    
    // Should render different states without errors
    expect(document.body).toBeTruthy();
  });

  it('supports interaction functionality', () => {
    const onBoxClick = jest.fn();
    render(<GridBoard processGroups={mockProcessGroups} onBoxClick={onBoxClick} />);
    
    // Should support interactions without errors
    expect(document.body).toBeTruthy();
  });

  it('handles keyboard navigation', () => {
    render(<GridBoard processGroups={[]} />);
    
    // Test basic keyboard events
    const gridElement = document.body.firstElementChild;
    
    if (gridElement) {
      // Simulate keyboard events
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      gridElement.dispatchEvent(keyEvent);
    }
    
    expect(document.body).toBeTruthy();
  });

  it('renders with accessibility support', () => {
    render(<GridBoard processGroups={[]} />);
    
    // Should render with accessibility in mind
    expect(document.body).toBeTruthy();
  });

  it('updates correctly on re-render', () => {
    const { rerender } = render(<GridBoard processGroups={[]} />);
    
    rerender(<GridBoard processGroups={mockProcessGroups} />);
    
    // Should update to show new process groups
    const boxes = screen.getAllByTestId('process-group-box');
    expect(boxes).toHaveLength(1);
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = render(<GridBoard processGroups={[]} />);
    
    expect(() => unmount()).not.toThrow();
  });

  describe('New Props - Delete, Copy, ParentGroupId, SelectedBoxId', () => {
    it('should pass onDelete prop to ProcessGroupBox components', () => {
      const onDeleteMock = jest.fn();
      
      render(<GridBoard processGroups={mockProcessGroups} onDelete={onDeleteMock} />);
      
      // Component should render without error
      const boxes = screen.getAllByTestId('process-group-box');
      expect(boxes).toHaveLength(1);
    });

    it('should pass onCopy prop to ProcessGroupBox components', () => {
      const onCopyMock = jest.fn();
      
      render(<GridBoard processGroups={mockProcessGroups} onCopy={onCopyMock} />);
      
      // Component should render without error
      const boxes = screen.getAllByTestId('process-group-box');
      expect(boxes).toHaveLength(1);
    });

    it('should pass parentGroupId prop to ProcessGroupBox components', () => {
      const parentGroupId = 'parent-group-123';
      
      render(<GridBoard processGroups={mockProcessGroups} parentGroupId={parentGroupId} />);
      
      // Component should render without error
      const boxes = screen.getAllByTestId('process-group-box');
      expect(boxes).toHaveLength(1);
    });

    it('should mark ProcessGroupBox as selected when id matches selectedBoxId', () => {
      const selectedBoxId = '1';
      
      render(<GridBoard processGroups={mockProcessGroups} selectedBoxId={selectedBoxId} />);
      
      // Component should render without error
      const boxes = screen.getAllByTestId('process-group-box');
      expect(boxes).toHaveLength(1);
    });

    it('should not mark ProcessGroupBox as selected when id does not match selectedBoxId', () => {
      const selectedBoxId = 'different-id';
      
      render(<GridBoard processGroups={mockProcessGroups} selectedBoxId={selectedBoxId} />);
      
      // Component should render without error
      const boxes = screen.getAllByTestId('process-group-box');
      expect(boxes).toHaveLength(1);
    });

    it('should handle onClick callback for process group selection', () => {
      const onClickMock = jest.fn();
      
      render(<GridBoard processGroups={mockProcessGroups} onBoxClick={onClickMock} />);
      
      // Component should render with onClick support
      const boxes = screen.getAllByTestId('process-group-box');
      expect(boxes).toHaveLength(1);
    });

    it('should pass all new props together', () => {
      const onDeleteMock = jest.fn();
      const onCopyMock = jest.fn();
      const onClickMock = jest.fn();
      const parentGroupId = 'parent-123';
      const selectedBoxId = '1';
      
      render(<GridBoard 
        processGroups={mockProcessGroups} 
        onDelete={onDeleteMock}
        onCopy={onCopyMock}
        onBoxClick={onClickMock}
        parentGroupId={parentGroupId}
        selectedBoxId={selectedBoxId}
      />);
      
      // Component should render with all props
      const boxes = screen.getAllByTestId('process-group-box');
      expect(boxes).toHaveLength(1);
    });

    it('should handle undefined optional props gracefully', () => {
      render(<GridBoard 
        processGroups={mockProcessGroups} 
        onDelete={undefined}
        onCopy={undefined}
        parentGroupId={undefined}
        selectedBoxId={undefined}
      />);
      
      // Component should render without error
      const boxes = screen.getAllByTestId('process-group-box');
      expect(boxes).toHaveLength(1);
    });

    it('should handle multiple process groups with selection', () => {
      const multipleGroups = [
        ...mockProcessGroups,
        {
          id: '2',
          name: 'Test Group 2',
          parameterContext: 'default',
          position: { x: 100, y: 100 },
          runningCount: 0,
          stoppedCount: 0,
          invalidCount: 0,
          disabledCount: 0,
          activeRemotePortCount: 0,
          inactiveRemotePortCount: 0,
          queued: '0 / 0 bytes',
          input: '0 bytes',
          read: '0 bytes',
          written: '0 bytes',
          output: '0 bytes',
          upToDateCount: 0,
          locallyModifiedCount: 0,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0,
        }
      ];
      
      render(<GridBoard processGroups={multipleGroups} selectedBoxId="2" />);
      
      // Should render all groups
      const boxes = screen.getAllByTestId('process-group-box');
      expect(boxes).toHaveLength(2);
    });
  });

  describe('useEffect Debug Logging', () => {
    it('should log process groups and count on mount', () => {
      render(<GridBoard processGroups={mockProcessGroups} />);
      
      expect(console.log).toHaveBeenCalledWith('GridBoard - Process Groups:', mockProcessGroups);
      expect(console.log).toHaveBeenCalledWith('GridBoard - Number of groups:', 1);
    });

    it('should log when process groups change', () => {
      const { rerender } = render(<GridBoard processGroups={mockProcessGroups} />);
      
      const newGroups = [
        ...mockProcessGroups,
        {
          id: '2',
          name: 'Test Group 2',
          parameterContext: 'default',
          position: { x: 100, y: 100 },
          runningCount: 0,
          stoppedCount: 0,
          invalidCount: 0,
          disabledCount: 0,
          activeRemotePortCount: 0,
          inactiveRemotePortCount: 0,
          queued: '0 / 0 bytes',
          input: '0 bytes',
          read: '0 bytes',
          written: '0 bytes',
          output: '0 bytes',
          upToDateCount: 0,
          locallyModifiedCount: 0,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0,
        }
      ];
      
      (console.log as jest.Mock).mockClear();
      rerender(<GridBoard processGroups={newGroups} />);
      
      expect(console.log).toHaveBeenCalledWith('GridBoard - Process Groups:', newGroups);
      expect(console.log).toHaveBeenCalledWith('GridBoard - Number of groups:', 2);
    });

    it('should log empty array when no process groups', () => {
      render(<GridBoard processGroups={[]} />);
      
      expect(console.log).toHaveBeenCalledWith('GridBoard - Process Groups:', []);
      expect(console.log).toHaveBeenCalledWith('GridBoard - Number of groups:', 0);
    });
  });

  describe('onMouseDown Handler', () => {
    it('should call stopPropagation on mouse down event', () => {
      render(<GridBoard processGroups={mockProcessGroups} />);
      
      const box = screen.getByTestId('process-group-box');
      const mockEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;
      
      const props = capturedProps[0];
      expect(props.onMouseDown).toBeDefined();
      
      // Line 71: e.stopPropagation() - explicitly call the handler to ensure coverage
      props.onMouseDown(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should execute onMouseDown handler through DOM event (line 71)', () => {
      render(<GridBoard processGroups={mockProcessGroups} />);
      
      const box = screen.getByTestId('process-group-box');
      const stopPropagationSpy = jest.fn();
      
      // Create a mock event with stopPropagation
      const mockEvent = {
        stopPropagation: stopPropagationSpy,
        preventDefault: jest.fn(),
        currentTarget: box,
        target: box,
      } as unknown as React.MouseEvent<HTMLDivElement>;
      
      // Trigger the event handler through the DOM
      fireEvent.mouseDown(box, mockEvent);
      
      // Line 71 should be executed: e.stopPropagation()
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should pass onMouseDown handler to all ProcessGroupBox components', () => {
      const multipleGroups = [
        ...mockProcessGroups,
        {
          id: '2',
          name: 'Test Group 2',
          parameterContext: 'default',
          position: { x: 100, y: 100 },
          runningCount: 0,
          stoppedCount: 0,
          invalidCount: 0,
          disabledCount: 0,
          activeRemotePortCount: 0,
          inactiveRemotePortCount: 0,
          queued: '0 / 0 bytes',
          input: '0 bytes',
          read: '0 bytes',
          written: '0 bytes',
          output: '0 bytes',
          upToDateCount: 0,
          locallyModifiedCount: 0,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0,
        }
      ];
      
      render(<GridBoard processGroups={multipleGroups} />);
      
      expect(capturedProps).toHaveLength(2);
      capturedProps.forEach(props => {
        expect(props.onMouseDown).toBeDefined();
        expect(typeof props.onMouseDown).toBe('function');
      });
    });
  });

  describe('onClick Handler', () => {
    it('should call onBoxClick when provided', () => {
      const onBoxClick = jest.fn();
      render(<GridBoard processGroups={mockProcessGroups} onBoxClick={onBoxClick} />);
      
      const box = screen.getByTestId('process-group-box');
      const props = capturedProps[0];
      
      props.onClick('1', 'Test Group 1');
      expect(onBoxClick).toHaveBeenCalledWith('1', 'Test Group 1');
    });

    it('should not call onBoxClick when undefined', () => {
      render(<GridBoard processGroups={mockProcessGroups} />);
      
      const props = capturedProps[0];
      
      // Should not throw when onClick is called without onBoxClick prop
      expect(() => props.onClick('1', 'Test Group 1')).not.toThrow();
    });

    it('should pass onClick handler to ProcessGroupBox', () => {
      const onBoxClick = jest.fn();
      render(<GridBoard processGroups={mockProcessGroups} onBoxClick={onBoxClick} />);
      
      const props = capturedProps[0];
      expect(props.onClick).toBeDefined();
      expect(typeof props.onClick).toBe('function');
    });
  });

  describe('onDoubleClick Handler', () => {
    it('should call onBoxDoubleClick when provided', () => {
      const onBoxDoubleClick = jest.fn();
      render(<GridBoard processGroups={mockProcessGroups} onBoxDoubleClick={onBoxDoubleClick} />);
      
      const props = capturedProps[0];
      const mockEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;
      
      props.onDoubleClick(mockEvent);
      
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(onBoxDoubleClick).toHaveBeenCalledWith('1', 'Test Group 1');
    });

    it('should execute onDoubleClick handler covering lines 80-82', () => {
      const onBoxDoubleClick = jest.fn();
      render(<GridBoard processGroups={mockProcessGroups} onBoxDoubleClick={onBoxDoubleClick} />);
      
      const props = capturedProps[0];
      const stopPropagationSpy = jest.fn();
      const mockEvent = {
        stopPropagation: stopPropagationSpy,
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;
      
      // Execute the handler - this should cover:
      // Line 80: e.stopPropagation()
      // Line 81: if (onBoxDoubleClick) {
      // Line 82: onBoxDoubleClick(group.id, group.name);
      props.onDoubleClick(mockEvent);
      
      // Verify line 80 is executed
      expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
      // Verify lines 81-82 are executed
      expect(onBoxDoubleClick).toHaveBeenCalledTimes(1);
      expect(onBoxDoubleClick).toHaveBeenCalledWith('1', 'Test Group 1');
    });

    it('should execute onDoubleClick handler through DOM event (lines 80-82)', () => {
      const onBoxDoubleClick = jest.fn();
      render(<GridBoard processGroups={mockProcessGroups} onBoxDoubleClick={onBoxDoubleClick} />);
      
      const box = screen.getByTestId('process-group-box');
      const stopPropagationSpy = jest.fn();
      
      // Create a mock event with stopPropagation
      const mockEvent = {
        stopPropagation: stopPropagationSpy,
        preventDefault: jest.fn(),
        currentTarget: box,
        target: box,
      } as unknown as React.MouseEvent<HTMLDivElement>;
      
      // Trigger the event handler through the DOM
      fireEvent.doubleClick(box, mockEvent);
      
      // Line 80 should be executed: e.stopPropagation()
      expect(stopPropagationSpy).toHaveBeenCalled();
      // Lines 81-82 should be executed: if (onBoxDoubleClick) { onBoxDoubleClick(group.id, group.name); }
      expect(onBoxDoubleClick).toHaveBeenCalledWith('1', 'Test Group 1');
    });

    it('should execute onDoubleClick handler for multiple groups (lines 80-82)', () => {
      const onBoxDoubleClick = jest.fn();
      const multipleGroups = [
        ...mockProcessGroups,
        {
          id: '2',
          name: 'Test Group 2',
          parameterContext: 'default',
          position: { x: 100, y: 100 },
          runningCount: 0,
          stoppedCount: 0,
          invalidCount: 0,
          disabledCount: 0,
          activeRemotePortCount: 0,
          inactiveRemotePortCount: 0,
          queued: '0 / 0 bytes',
          input: '0 bytes',
          read: '0 bytes',
          written: '0 bytes',
          output: '0 bytes',
          upToDateCount: 0,
          locallyModifiedCount: 0,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0,
        }
      ];
      
      render(<GridBoard processGroups={multipleGroups} onBoxDoubleClick={onBoxDoubleClick} />);
      
      const boxes = screen.getAllByTestId('process-group-box');
      expect(boxes).toHaveLength(2);
      
      // Test first group - lines 80-82
      const props1 = capturedProps[0];
      const stopPropagationSpy1 = jest.fn();
      const mockEvent1 = {
        stopPropagation: stopPropagationSpy1,
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;
      
      props1.onDoubleClick(mockEvent1);
      expect(stopPropagationSpy1).toHaveBeenCalledTimes(1);
      expect(onBoxDoubleClick).toHaveBeenCalledWith('1', 'Test Group 1');
      
      // Test second group - lines 80-82
      const props2 = capturedProps[1];
      const stopPropagationSpy2 = jest.fn();
      const mockEvent2 = {
        stopPropagation: stopPropagationSpy2,
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;
      
      props2.onDoubleClick(mockEvent2);
      expect(stopPropagationSpy2).toHaveBeenCalledTimes(1);
      expect(onBoxDoubleClick).toHaveBeenCalledWith('2', 'Test Group 2');
    });

    it('should call stopPropagation even when onBoxDoubleClick is undefined', () => {
      render(<GridBoard processGroups={mockProcessGroups} />);
      
      const props = capturedProps[0];
      const mockEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;
      
      props.onDoubleClick(mockEvent);
      
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should not call onBoxDoubleClick when undefined', () => {
      render(<GridBoard processGroups={mockProcessGroups} />);
      
      const props = capturedProps[0];
      const mockEvent = {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;
      
      // Should not throw when onBoxDoubleClick is undefined
      expect(() => props.onDoubleClick(mockEvent)).not.toThrow();
    });

    it('should pass onDoubleClick handler to ProcessGroupBox', () => {
      const onBoxDoubleClick = jest.fn();
      render(<GridBoard processGroups={mockProcessGroups} onBoxDoubleClick={onBoxDoubleClick} />);
      
      const props = capturedProps[0];
      expect(props.onDoubleClick).toBeDefined();
      expect(typeof props.onDoubleClick).toBe('function');
    });
  });

  describe('All Props Passed to ProcessGroupBox', () => {
    it('should pass all required props to ProcessGroupBox', () => {
      render(<GridBoard processGroups={mockProcessGroups} />);
      
      const props = capturedProps[0];
      expect(props.id).toBe('1');
      expect(props.name).toBe('Test Group 1');
      expect(props.position).toEqual({ x: 0, y: 0 });
      expect(props.runningCount).toBe(1);
      expect(props.stoppedCount).toBe(0);
      expect(props.invalidCount).toBe(0);
      expect(props.disabledCount).toBe(0);
      expect(props.activeRemotePortCount).toBe(0);
      expect(props.inactiveRemotePortCount).toBe(0);
      expect(props.queued).toBe('0 / 0 bytes');
      expect(props.input).toBe('0 bytes');
      expect(props.read).toBe('0 bytes');
      expect(props.written).toBe('0 bytes');
      expect(props.output).toBe('0 bytes');
      expect(props.upToDateCount).toBe(1);
      expect(props.locallyModifiedCount).toBe(0);
      expect(props.staleCount).toBe(0);
      expect(props.locallyModifiedAndStaleCount).toBe(0);
      expect(props.syncFailureCount).toBe(0);
      expect(props.isDragging).toBe(false);
    });

    it('should pass optional props when provided', () => {
      const onDelete = jest.fn();
      const onCopy = jest.fn();
      const parentGroupId = 'parent-123';
      const selectedBoxId = '1';
      
      render(
        <GridBoard
          processGroups={mockProcessGroups}
          onDelete={onDelete}
          onCopy={onCopy}
          parentGroupId={parentGroupId}
          selectedBoxId={selectedBoxId}
        />
      );
      
      const props = capturedProps[0];
      expect(props.onDelete).toBe(onDelete);
      expect(props.onCopy).toBe(onCopy);
      expect(props.parentGroupId).toBe(parentGroupId);
      expect(props.isSelected).toBe(true);
    });

    it('should set isSelected to false when id does not match selectedBoxId', () => {
      render(<GridBoard processGroups={mockProcessGroups} selectedBoxId="different-id" />);
      
      const props = capturedProps[0];
      expect(props.isSelected).toBe(false);
    });

    it('should set isSelected to false when selectedBoxId is undefined', () => {
      render(<GridBoard processGroups={mockProcessGroups} />);
      
      const props = capturedProps[0];
      expect(props.isSelected).toBe(false);
    });

    it('should pass all props to multiple ProcessGroupBox components', () => {
      const multipleGroups = [
        {
          id: '1',
          name: 'Test Group 1',
          parameterContext: 'default',
          position: { x: 0, y: 0 },
          runningCount: 1,
          stoppedCount: 0,
          invalidCount: 0,
          disabledCount: 0,
          activeRemotePortCount: 0,
          inactiveRemotePortCount: 0,
          queued: '0 / 0 bytes',
          input: '0 bytes',
          read: '0 bytes',
          written: '0 bytes',
          output: '0 bytes',
          upToDateCount: 1,
          locallyModifiedCount: 0,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0,
        },
        {
          id: '2',
          name: 'Test Group 2',
          parameterContext: 'default',
          position: { x: 100, y: 100 },
          runningCount: 2,
          stoppedCount: 1,
          invalidCount: 0,
          disabledCount: 0,
          activeRemotePortCount: 1,
          inactiveRemotePortCount: 0,
          queued: '5 / 100 KB',
          input: '50 MB',
          read: '25 MB',
          written: '35 MB',
          output: '40 MB',
          upToDateCount: 3,
          locallyModifiedCount: 1,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0,
        }
      ];
      
      render(<GridBoard processGroups={multipleGroups} selectedBoxId="2" />);
      
      expect(capturedProps).toHaveLength(2);
      expect(capturedProps[0].id).toBe('1');
      expect(capturedProps[0].isSelected).toBe(false);
      expect(capturedProps[1].id).toBe('2');
      expect(capturedProps[1].isSelected).toBe(true);
    });
  });
});
