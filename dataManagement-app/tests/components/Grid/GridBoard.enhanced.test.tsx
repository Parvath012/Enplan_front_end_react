/**
 * Comprehensive test suite for GridBoard component - Enhanced functionality
 * Tests for: passing new props (parentGroupId, selectedBoxId, onClick callbacks)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GridBoard from '../../../src/components/Grid/GridBoard';

// Mock ProcessGroupBox
jest.mock('../../../src/components/ProcessGroupBox/ProcessGroupBox', () => ({
  __esModule: true,
  default: ({ id, name, onClick, onDelete, onCopy, parentGroupId, isSelected }: any) => (
    <div
      data-testid={`process-group-${id}`}
      data-parent-group-id={parentGroupId}
      data-is-selected={isSelected}
      onClick={() => onClick && onClick(id, name)}
    >
      <span>{name}</span>
      {onDelete && <button onClick={onDelete} data-testid={`delete-${id}`}>Delete</button>}
      {onCopy && <button onClick={onCopy} data-testid={`copy-${id}`}>Copy</button>}
    </div>
  ),
}));

describe('GridBoard - Enhanced Functionality', () => {
  const mockProcessGroups = [
    {
      id: 'pg-1',
      name: 'Process Group 1',
      position: { x: 100, y: 100 },
      runningCount: 2,
      stoppedCount: 1,
      invalidCount: 0,
      disabledCount: 0,
      activeRemotePortCount: 1,
      inactiveRemotePortCount: 0,
      queued: '0 / 0 bytes',
      input: '100 MB',
      read: '50 MB',
      written: '75 MB',
      output: '80 MB',
      upToDateCount: 5,
      locallyModifiedCount: 0,
      staleCount: 0,
      locallyModifiedAndStaleCount: 0,
      syncFailureCount: 0,
    },
    {
      id: 'pg-2',
      name: 'Process Group 2',
      position: { x: 300, y: 100 },
      runningCount: 1,
      stoppedCount: 2,
      invalidCount: 0,
      disabledCount: 0,
      activeRemotePortCount: 0,
      inactiveRemotePortCount: 1,
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
    },
  ];

  const defaultProps = {
    processGroups: mockProcessGroups,
    onBoxClick: jest.fn(),
    onBoxDoubleClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ParentGroupId Prop', () => {
    it('should pass parentGroupId to all ProcessGroupBox components', () => {
      const parentGroupId = 'parent-123';
      
      render(
        <GridBoard
          {...defaultProps}
          parentGroupId={parentGroupId}
        />
      );

      const processGroup1 = screen.getByTestId('process-group-pg-1');
      const processGroup2 = screen.getByTestId('process-group-pg-2');

      expect(processGroup1).toHaveAttribute('data-parent-group-id', parentGroupId);
      expect(processGroup2).toHaveAttribute('data-parent-group-id', parentGroupId);
    });

    it('should handle undefined parentGroupId', () => {
      render(<GridBoard {...defaultProps} />);

      const processGroup1 = screen.getByTestId('process-group-pg-1');
      
      // Should not crash when parentGroupId is undefined
      expect(processGroup1).toBeInTheDocument();
    });

    it('should pass different parentGroupIds correctly', () => {
      const parentGroupId1 = 'parent-abc';
      const { rerender } = render(
        <GridBoard {...defaultProps} parentGroupId={parentGroupId1} />
      );

      expect(screen.getByTestId('process-group-pg-1')).toHaveAttribute(
        'data-parent-group-id',
        parentGroupId1
      );

      const parentGroupId2 = 'parent-xyz';
      rerender(<GridBoard {...defaultProps} parentGroupId={parentGroupId2} />);

      expect(screen.getByTestId('process-group-pg-1')).toHaveAttribute(
        'data-parent-group-id',
        parentGroupId2
      );
    });
  });

  describe('SelectedBoxId Prop', () => {
    it('should mark the correct ProcessGroupBox as selected', () => {
      const selectedBoxId = 'pg-1';
      
      render(
        <GridBoard
          {...defaultProps}
          selectedBoxId={selectedBoxId}
        />
      );

      const processGroup1 = screen.getByTestId('process-group-pg-1');
      const processGroup2 = screen.getByTestId('process-group-pg-2');

      expect(processGroup1).toHaveAttribute('data-is-selected', 'true');
      expect(processGroup2).toHaveAttribute('data-is-selected', 'false');
    });

    it('should update selection when selectedBoxId changes', () => {
      const { rerender } = render(
        <GridBoard {...defaultProps} selectedBoxId="pg-1" />
      );

      expect(screen.getByTestId('process-group-pg-1')).toHaveAttribute('data-is-selected', 'true');
      expect(screen.getByTestId('process-group-pg-2')).toHaveAttribute('data-is-selected', 'false');

      rerender(<GridBoard {...defaultProps} selectedBoxId="pg-2" />);

      expect(screen.getByTestId('process-group-pg-1')).toHaveAttribute('data-is-selected', 'false');
      expect(screen.getByTestId('process-group-pg-2')).toHaveAttribute('data-is-selected', 'true');
    });

    it('should handle no selection (undefined selectedBoxId)', () => {
      render(<GridBoard {...defaultProps} />);

      const processGroup1 = screen.getByTestId('process-group-pg-1');
      const processGroup2 = screen.getByTestId('process-group-pg-2');

      expect(processGroup1).toHaveAttribute('data-is-selected', 'false');
      expect(processGroup2).toHaveAttribute('data-is-selected', 'false');
    });

    it('should handle selection of non-existent box', () => {
      render(<GridBoard {...defaultProps} selectedBoxId="non-existent" />);

      const processGroup1 = screen.getByTestId('process-group-pg-1');
      const processGroup2 = screen.getByTestId('process-group-pg-2');

      expect(processGroup1).toHaveAttribute('data-is-selected', 'false');
      expect(processGroup2).toHaveAttribute('data-is-selected', 'false');
    });
  });

  describe('onClick Callback', () => {
    it('should call onClick when ProcessGroupBox is clicked', () => {
      const mockOnClick = jest.fn();
      
      render(
        <GridBoard
          {...defaultProps}
          onClick={mockOnClick}
        />
      );

      const processGroup1 = screen.getByTestId('process-group-pg-1');
      fireEvent.click(processGroup1);

      expect(mockOnClick).toHaveBeenCalledWith('pg-1', 'Process Group 1');
    });

    it('should call onClick with correct parameters for different boxes', () => {
      const mockOnClick = jest.fn();
      
      render(
        <GridBoard
          {...defaultProps}
          onClick={mockOnClick}
        />
      );

      fireEvent.click(screen.getByTestId('process-group-pg-1'));
      expect(mockOnClick).toHaveBeenCalledWith('pg-1', 'Process Group 1');

      mockOnClick.mockClear();

      fireEvent.click(screen.getByTestId('process-group-pg-2'));
      expect(mockOnClick).toHaveBeenCalledWith('pg-2', 'Process Group 2');
    });

    it('should handle undefined onClick gracefully', () => {
      render(<GridBoard {...defaultProps} />);

      const processGroup1 = screen.getByTestId('process-group-pg-1');
      
      // Should not crash when onClick is undefined
      expect(() => fireEvent.click(processGroup1)).not.toThrow();
    });

    it('should call onClick multiple times for repeated clicks', () => {
      const mockOnClick = jest.fn();
      
      render(
        <GridBoard
          {...defaultProps}
          onClick={mockOnClick}
        />
      );

      const processGroup1 = screen.getByTestId('process-group-pg-1');
      
      fireEvent.click(processGroup1);
      fireEvent.click(processGroup1);
      fireEvent.click(processGroup1);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('onDelete Callback', () => {
    it('should pass onDelete to all ProcessGroupBox components', () => {
      const mockOnDelete = jest.fn();
      
      render(
        <GridBoard
          {...defaultProps}
          onDelete={mockOnDelete}
        />
      );

      const deleteBtn1 = screen.getByTestId('delete-pg-1');
      const deleteBtn2 = screen.getByTestId('delete-pg-2');

      expect(deleteBtn1).toBeInTheDocument();
      expect(deleteBtn2).toBeInTheDocument();

      fireEvent.click(deleteBtn1);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should not render delete buttons when onDelete is undefined', () => {
      render(<GridBoard {...defaultProps} />);

      expect(screen.queryByTestId('delete-pg-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-pg-2')).not.toBeInTheDocument();
    });
  });

  describe('onCopy Callback', () => {
    it('should pass onCopy to all ProcessGroupBox components', () => {
      const mockOnCopy = jest.fn();
      
      render(
        <GridBoard
          {...defaultProps}
          onCopy={mockOnCopy}
        />
      );

      const copyBtn1 = screen.getByTestId('copy-pg-1');
      const copyBtn2 = screen.getByTestId('copy-pg-2');

      expect(copyBtn1).toBeInTheDocument();
      expect(copyBtn2).toBeInTheDocument();

      fireEvent.click(copyBtn1);
      expect(mockOnCopy).toHaveBeenCalledTimes(1);
    });

    it('should not render copy buttons when onCopy is undefined', () => {
      render(<GridBoard {...defaultProps} />);

      expect(screen.queryByTestId('copy-pg-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('copy-pg-2')).not.toBeInTheDocument();
    });
  });

  describe('Integration of All Props', () => {
    it('should pass all new props correctly to ProcessGroupBox', () => {
      const mockOnClick = jest.fn();
      const mockOnDelete = jest.fn();
      const mockOnCopy = jest.fn();
      const parentGroupId = 'parent-123';
      const selectedBoxId = 'pg-1';

      render(
        <GridBoard
          {...defaultProps}
          onClick={mockOnClick}
          onDelete={mockOnDelete}
          onCopy={mockOnCopy}
          parentGroupId={parentGroupId}
          selectedBoxId={selectedBoxId}
        />
      );

      // Check selection
      expect(screen.getByTestId('process-group-pg-1')).toHaveAttribute('data-is-selected', 'true');
      
      // Check parent group ID
      expect(screen.getByTestId('process-group-pg-1')).toHaveAttribute(
        'data-parent-group-id',
        parentGroupId
      );

      // Test callbacks
      fireEvent.click(screen.getByTestId('process-group-pg-1'));
      expect(mockOnClick).toHaveBeenCalledWith('pg-1', 'Process Group 1');

      fireEvent.click(screen.getByTestId('delete-pg-1'));
      expect(mockOnDelete).toHaveBeenCalled();

      fireEvent.click(screen.getByTestId('copy-pg-1'));
      expect(mockOnCopy).toHaveBeenCalled();
    });

    it('should handle prop changes dynamically', () => {
      const mockOnClick = jest.fn();
      const { rerender } = render(
        <GridBoard
          {...defaultProps}
          onClick={mockOnClick}
          selectedBoxId="pg-1"
          parentGroupId="parent-1"
        />
      );

      expect(screen.getByTestId('process-group-pg-1')).toHaveAttribute('data-is-selected', 'true');
      expect(screen.getByTestId('process-group-pg-1')).toHaveAttribute(
        'data-parent-group-id',
        'parent-1'
      );

      // Update props
      rerender(
        <GridBoard
          {...defaultProps}
          onClick={mockOnClick}
          selectedBoxId="pg-2"
          parentGroupId="parent-2"
        />
      );

      expect(screen.getByTestId('process-group-pg-1')).toHaveAttribute('data-is-selected', 'false');
      expect(screen.getByTestId('process-group-pg-2')).toHaveAttribute('data-is-selected', 'true');
      expect(screen.getByTestId('process-group-pg-2')).toHaveAttribute(
        'data-parent-group-id',
        'parent-2'
      );
    });
  });

  describe('Rendering Process Groups', () => {
    it('should render all process groups from props', () => {
      render(<GridBoard {...defaultProps} />);

      expect(screen.getByText('Process Group 1')).toBeInTheDocument();
      expect(screen.getByText('Process Group 2')).toBeInTheDocument();
    });

    it('should handle empty process groups array', () => {
      render(<GridBoard {...defaultProps} processGroups={[]} />);

      expect(screen.queryByTestId(/process-group-/)).not.toBeInTheDocument();
    });

    it('should update when process groups change', () => {
      const { rerender } = render(<GridBoard {...defaultProps} />);

      expect(screen.getByText('Process Group 1')).toBeInTheDocument();

      const newProcessGroups = [
        {
          ...mockProcessGroups[0],
          id: 'pg-3',
          name: 'Process Group 3',
        },
      ];

      rerender(<GridBoard {...defaultProps} processGroups={newProcessGroups} />);

      expect(screen.queryByText('Process Group 1')).not.toBeInTheDocument();
      expect(screen.getByText('Process Group 3')).toBeInTheDocument();
    });
  });

  describe('Selection Behavior', () => {
    it('should only have one ProcessGroupBox selected at a time', () => {
      render(<GridBoard {...defaultProps} selectedBoxId="pg-1" />);

      const pg1 = screen.getByTestId('process-group-pg-1');
      const pg2 = screen.getByTestId('process-group-pg-2');

      expect(pg1).toHaveAttribute('data-is-selected', 'true');
      expect(pg2).toHaveAttribute('data-is-selected', 'false');
    });

    it('should clear selection when selectedBoxId is undefined', () => {
      const { rerender } = render(<GridBoard {...defaultProps} selectedBoxId="pg-1" />);

      expect(screen.getByTestId('process-group-pg-1')).toHaveAttribute('data-is-selected', 'true');

      rerender(<GridBoard {...defaultProps} selectedBoxId={undefined} />);

      expect(screen.getByTestId('process-group-pg-1')).toHaveAttribute('data-is-selected', 'false');
      expect(screen.getByTestId('process-group-pg-2')).toHaveAttribute('data-is-selected', 'false');
    });
  });

  describe('Callback Execution Order', () => {
    it('should execute callbacks in correct order when interacting with multiple boxes', () => {
      const mockOnClick = jest.fn();
      const callOrder: string[] = [];

      mockOnClick.mockImplementation((id) => {
        callOrder.push(`click-${id}`);
      });

      render(
        <GridBoard
          {...defaultProps}
          onClick={mockOnClick}
        />
      );

      fireEvent.click(screen.getByTestId('process-group-pg-1'));
      fireEvent.click(screen.getByTestId('process-group-pg-2'));
      fireEvent.click(screen.getByTestId('process-group-pg-1'));

      expect(callOrder).toEqual(['click-pg-1', 'click-pg-2', 'click-pg-1']);
    });

    it('should handle rapid clicks without errors', () => {
      const mockOnClick = jest.fn();
      
      render(
        <GridBoard
          {...defaultProps}
          onClick={mockOnClick}
        />
      );

      const pg1 = screen.getByTestId('process-group-pg-1');
      
      for (let i = 0; i < 10; i++) {
        fireEvent.click(pg1);
      }

      expect(mockOnClick).toHaveBeenCalledTimes(10);
    });
  });
});

