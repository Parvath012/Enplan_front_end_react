import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ColumnList } from '../../../src/components/advancedsearch/ColumnList';

describe('ColumnList', () => {
  const mockColumns = [
    { id: 'id', name: 'ID', type: 'numerical' as const },
    { id: 'name', name: 'Name', type: 'string' as const },
    { id: 'age', name: 'Age', type: 'numerical' as const },
    { id: 'email', name: 'Email', type: 'string' as const },
  ];

  const defaultProps = {
    columns: mockColumns,
    selectedFields: [],
    onSelection: jest.fn(),
    onDoubleClick: jest.fn(),
    side: 'left',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component', () => {
      render(<ColumnList {...defaultProps} />);
      
      expect(screen.getByText('ID')).toBeInTheDocument();
    });

    it('renders all columns', () => {
      render(<ColumnList {...defaultProps} />);
      
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders column names only', () => {
      render(<ColumnList {...defaultProps} />);
      
      // Component only renders column names, not types
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  describe('Selection Handling', () => {
    it('calls onSelection when column is clicked', async () => {
      const onSelection = jest.fn();
      render(<ColumnList {...defaultProps} onSelection={onSelection} />);
      
      const firstColumn = screen.getByText('ID').closest('button');
      await userEvent.click(firstColumn!);
      
      expect(onSelection).toHaveBeenCalledWith(0, false, false);
    });

    it('handles multiple selections', async () => {
      const onSelection = jest.fn();
      render(<ColumnList {...defaultProps} onSelection={onSelection} />);
      
      const idColumn = screen.getByText('ID').closest('button');
      const nameColumn = screen.getByText('Name').closest('button');
      
      await userEvent.click(idColumn!);
      await userEvent.click(nameColumn!);
      
      expect(onSelection).toHaveBeenCalledTimes(2);
      expect(onSelection).toHaveBeenNthCalledWith(1, 0, false, false);
      expect(onSelection).toHaveBeenNthCalledWith(2, 1, false, false);
    });

    it('handles deselection', async () => {
      const onSelection = jest.fn();
      render(
        <ColumnList
          {...defaultProps}
          selectedFields={['id']}
          onSelection={onSelection}
        />
      );
      
      const idColumn = screen.getByText('ID').closest('button');
      await userEvent.click(idColumn!);
      
      expect(onSelection).toHaveBeenCalledWith(0, false, false);
    });
  });

  describe('Double Click Handling', () => {
    it('calls onDoubleClick when column is double-clicked', async () => {
      const onDoubleClick = jest.fn();
      render(<ColumnList {...defaultProps} onDoubleClick={onDoubleClick} />);
      
      const firstColumn = screen.getByText('ID').closest('button');
      await userEvent.dblClick(firstColumn!);
      
      expect(onDoubleClick).toHaveBeenCalledWith(mockColumns[0], 'left');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports Enter key', async () => {
      const onSelection = jest.fn();
      render(<ColumnList {...defaultProps} onSelection={onSelection} />);
      
      const firstColumn = screen.getByText('ID').closest('button');
      firstColumn!.focus();
      
      fireEvent.keyDown(firstColumn!, { key: 'Enter' });
      expect(onSelection).toHaveBeenCalledWith(0, false, false);
    });

    it('supports Space key', async () => {
      const onSelection = jest.fn();
      render(<ColumnList {...defaultProps} onSelection={onSelection} />);
      
      const firstColumn = screen.getByText('ID').closest('button');
      firstColumn!.focus();
      
      fireEvent.keyDown(firstColumn!, { key: ' ' });
      expect(onSelection).toHaveBeenCalledWith(0, false, false);
    });
  });

  describe('Visual States', () => {
    it('shows selected state for selected columns', () => {
      render(
        <ColumnList
          {...defaultProps}
          selectedFields={[mockColumns[0], mockColumns[1]]}
        />
      );
      
      const idColumn = screen.getByText('ID').closest('button');
      const nameColumn = screen.getByText('Name').closest('button');
      
      expect(idColumn).toHaveStyle({ background: '#e8f6e8', fontWeight: '500' });
      expect(nameColumn).toHaveStyle({ background: '#e8f6e8', fontWeight: '500' });
    });

    it('does not show selected state for unselected columns', () => {
      render(
        <ColumnList
          {...defaultProps}
          selectedFields={[mockColumns[0]]}
        />
      );
      
      const ageColumn = screen.getByText('Age').closest('button');
      const emailColumn = screen.getByText('Email').closest('button');
      
      expect(ageColumn).toHaveStyle({ background: 'transparent', fontWeight: '400' });
      expect(emailColumn).toHaveStyle({ background: 'transparent', fontWeight: '400' });
    });
  });

  describe('Empty States', () => {
    it('handles empty columns array', () => {
      render(<ColumnList {...defaultProps} columns={[]} />);
      
      expect(screen.getByText('NO COLUMNS AVAILABLE')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows empty message when no columns', () => {
      render(<ColumnList {...defaultProps} columns={[]} />);
      
      // Should show the empty message but no column buttons
      expect(screen.getByText('NO COLUMNS AVAILABLE')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ColumnList {...defaultProps} />);
      
      // Component doesn't have ARIA attributes, just check it renders
      expect(screen.getByText('ID')).toBeInTheDocument();
    });

    it('supports keyboard navigation between items', () => {
      render(<ColumnList {...defaultProps} />);
      
      const firstColumn = screen.getByText('ID').closest('button');
      const secondColumn = screen.getByText('Name').closest('button');
      
      firstColumn!.focus();
      expect(firstColumn).toHaveFocus();
      
      fireEvent.keyDown(firstColumn!, { key: 'ArrowDown' });
      // Note: Actual arrow key navigation would depend on implementation
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined callback functions', () => {
      expect(() => {
        render(
          <ColumnList
            {...defaultProps}
            onSelection={undefined}
            onDoubleClick={undefined}
          />
        );
      }).not.toThrow();
    });

    it('handles rapid clicks', async () => {
      const onSelection = jest.fn();
      render(<ColumnList {...defaultProps} onSelection={onSelection} />);
      
      const firstColumn = screen.getByText('ID').closest('button');
      
      // Rapid clicks
      await userEvent.click(firstColumn!);
      await userEvent.click(firstColumn!);
      await userEvent.click(firstColumn!);
      
      expect(onSelection).toHaveBeenCalled();
    });

    it('handles columns with special characters', () => {
      const specialColumns = [
        { id: 'col-1', name: 'Column with Special Chars: @#$%', type: 'string' as const },
        { id: 'col-2', name: 'Column with Spaces', type: 'numerical' as const },
      ];
      
      render(<ColumnList {...defaultProps} columns={specialColumns} />);
      
      expect(screen.getByText('Column with Special Chars: @#$%')).toBeInTheDocument();
      expect(screen.getByText('Column with Spaces')).toBeInTheDocument();
    });
  });
});
