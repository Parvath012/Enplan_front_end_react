import React from 'react';
import { render, screen } from '@testing-library/react';
import GridBoard from '../../../src/components/Grid/GridBoard';

// Mock CSS import
jest.mock('../../../src/components/Grid/Grid.css', () => ({}));

// Initialize global array for capturing props
if (!(global as any).__gridBoardTriggerConfigureTestProps__) {
  (global as any).__gridBoardTriggerConfigureTestProps__ = [];
}

jest.mock('../../../src/components/ProcessGroupBox', () => {
  const React = require('react');
  
  const MockProcessGroupBox = React.forwardRef((props: any, ref: any) => {
    // Capture props for testing
    const capturedProps = (global as any).__gridBoardTriggerConfigureTestProps__ || [];
    capturedProps.push(props);
    
    return React.createElement('div', {
      'data-testid': 'process-group-box',
      'data-name': props.name,
      'data-id': props.id,
      'data-is-selected': props.isSelected,
      'data-trigger-configure': props.triggerConfigure,
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

// Local reference to the global array
const capturedProps = (global as any).__gridBoardTriggerConfigureTestProps__;

describe('GridBoard - triggerConfigure Prop', () => {
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
      queued: '0',
      input: '0',
      read: '0',
      written: '0',
      output: '0',
      upToDateCount: 0,
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
      activeRemotePortCount: 0,
      inactiveRemotePortCount: 0,
      queued: '0',
      input: '0',
      read: '0',
      written: '0',
      output: '0',
      upToDateCount: 0,
      locallyModifiedCount: 0,
      staleCount: 0,
      locallyModifiedAndStaleCount: 0,
      syncFailureCount: 0,
    },
  ];

  beforeEach(() => {
    capturedProps.length = 0;
    jest.clearAllMocks();
  });

  it('should pass triggerConfigure to selected ProcessGroupBox only', () => {
    render(
      <GridBoard
        processGroups={mockProcessGroups}
        selectedBoxId="1"
        triggerConfigure={5}
      />
    );

    const boxes = screen.getAllByTestId('process-group-box');
    expect(boxes).toHaveLength(2);

    // Check that only the selected box receives triggerConfigure
    const selectedBox = boxes.find(box => box.getAttribute('data-id') === '1');
    const unselectedBox = boxes.find(box => box.getAttribute('data-id') === '2');

    expect(selectedBox).toHaveAttribute('data-trigger-configure', '5');
    expect(unselectedBox).toHaveAttribute('data-trigger-configure', '');
  });

  it('should not pass triggerConfigure when no box is selected', () => {
    render(
      <GridBoard
        processGroups={mockProcessGroups}
        selectedBoxId={undefined}
        triggerConfigure={3}
      />
    );

    const boxes = screen.getAllByTestId('process-group-box');
    boxes.forEach(box => {
      expect(box).toHaveAttribute('data-trigger-configure', '');
    });
  });

  it('should pass undefined triggerConfigure to unselected boxes', () => {
    render(
      <GridBoard
        processGroups={mockProcessGroups}
        selectedBoxId="1"
        triggerConfigure={10}
      />
    );

    const boxes = screen.getAllByTestId('process-group-box');
    const unselectedBox = boxes.find(box => box.getAttribute('data-id') === '2');
    
    expect(unselectedBox).toHaveAttribute('data-trigger-configure', '');
  });

  it('should update triggerConfigure when prop changes', () => {
    const { rerender } = render(
      <GridBoard
        processGroups={mockProcessGroups}
        selectedBoxId="1"
        triggerConfigure={1}
      />
    );

    let selectedBox = screen.getByTestId('process-group-box');
    expect(selectedBox).toHaveAttribute('data-trigger-configure', '1');

    rerender(
      <GridBoard
        processGroups={mockProcessGroups}
        selectedBoxId="1"
        triggerConfigure={2}
      />
    );

    selectedBox = screen.getByTestId('process-group-box');
    expect(selectedBox).toHaveAttribute('data-trigger-configure', '2');
  });

  it('should handle triggerConfigure when different box is selected', () => {
    const { rerender } = render(
      <GridBoard
        processGroups={mockProcessGroups}
        selectedBoxId="1"
        triggerConfigure={5}
      />
    );

    let box1 = screen.getAllByTestId('process-group-box').find(box => box.getAttribute('data-id') === '1');
    let box2 = screen.getAllByTestId('process-group-box').find(box => box.getAttribute('data-id') === '2');

    expect(box1).toHaveAttribute('data-trigger-configure', '5');
    expect(box2).toHaveAttribute('data-trigger-configure', '');

    // Change selection to box 2
    rerender(
      <GridBoard
        processGroups={mockProcessGroups}
        selectedBoxId="2"
        triggerConfigure={6}
      />
    );

    box1 = screen.getAllByTestId('process-group-box').find(box => box.getAttribute('data-id') === '1');
    box2 = screen.getAllByTestId('process-group-box').find(box => box.getAttribute('data-id') === '2');

    expect(box1).toHaveAttribute('data-trigger-configure', '');
    expect(box2).toHaveAttribute('data-trigger-configure', '6');
  });

  it('should work with triggerConfigure value of 0', () => {
    render(
      <GridBoard
        processGroups={mockProcessGroups}
        selectedBoxId="1"
        triggerConfigure={0}
      />
    );

    const selectedBox = screen.getAllByTestId('process-group-box').find(
      box => box.getAttribute('data-id') === '1'
    );
    expect(selectedBox).toHaveAttribute('data-trigger-configure', '0');
  });

  it('should handle undefined triggerConfigure prop', () => {
    render(
      <GridBoard
        processGroups={mockProcessGroups}
        selectedBoxId="1"
        triggerConfigure={undefined}
      />
    );

    const selectedBox = screen.getAllByTestId('process-group-box').find(
      box => box.getAttribute('data-id') === '1'
    );
    // When undefined, it should not be passed (empty string in data attribute)
    expect(selectedBox).toHaveAttribute('data-trigger-configure', '');
  });

  it('should pass all other props correctly along with triggerConfigure', () => {
    const mockOnClick = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnCopy = jest.fn();
    const mockOnConfigure = jest.fn();

    render(
      <GridBoard
        processGroups={mockProcessGroups}
        selectedBoxId="1"
        triggerConfigure={7}
        onBoxClick={mockOnClick}
        onDelete={mockOnDelete}
        onCopy={mockOnCopy}
        onConfigure={mockOnConfigure}
        parentGroupId="parent-1"
      />
    );

    // Verify that other props are still passed correctly
    const capturedPropsForBox1 = capturedProps.find((p: any) => p.id === '1');
    expect(capturedPropsForBox1).toBeDefined();
    expect(capturedPropsForBox1.triggerConfigure).toBe(7);
    expect(capturedPropsForBox1.isSelected).toBe(true);
    expect(capturedPropsForBox1.parentGroupId).toBe('parent-1');
    expect(capturedPropsForBox1.onDelete).toBe(mockOnDelete);
    expect(capturedPropsForBox1.onCopy).toBe(mockOnCopy);
    expect(capturedPropsForBox1.onConfigure).toBe(mockOnConfigure);
  });
});

