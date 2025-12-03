/**
 * Tests for PermissionTableComponents
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  CustomSortIcon,
  DisabledIconButton,
  getEmptyCellStyles,
  EmptyCell,
  getResetButtonStyles,
  ResetButton,
  DuplicateButton
} from '../../../src/components/shared/PermissionTableComponents';

// Mock dependencies
jest.mock('commonApp/CustomTooltip', () => {
  return function MockCustomTooltip({ children, title }: any) {
    return <div data-testid="tooltip" title={title}>{children}</div>;
  };
});

jest.mock('@carbon/icons-react', () => ({
  ResetAlt: ({ size }: any) => <div data-testid="reset-icon">Reset Icon {size}</div>,
  Replicate: ({ size, color, style }: any) => <div data-testid="replicate-icon">Replicate Icon</div>
}));

jest.mock('../../../src/components/userManagement/PermissionTableConstants', () => ({
  getButtonStyles: () => ({ padding: '4px' })
}));

jest.mock('../../../src/components/userManagement/CommonButton', () => {
  return function MockCommonButton({ children, onClick, disabled, backgroundColor }: any) {
    return (
      <button onClick={onClick} disabled={disabled} data-testid="common-button" style={{ backgroundColor }}>
        {children}
      </button>
    );
  };
});

jest.mock('../../../src/components/userManagement/CommonTextSpan', () => {
  return function MockCommonTextSpan({ children, color }: any) {
    return <span data-testid="common-text-span" style={{ color }}>{children}</span>;
  };
});

describe('PermissionTableComponents', () => {
  describe('CustomSortIcon', () => {
    it('should render with default size and color', () => {
      const { container } = render(<CustomSortIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('height', '16px');
      expect(svg).toHaveAttribute('width', '16px');
      expect(svg).toHaveAttribute('fill', '#1f1f1f');
    });

    it('should render with custom size and color', () => {
      const { container } = render(<CustomSortIcon size={20} color="#ff0000" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('height', '20px');
      expect(svg).toHaveAttribute('width', '20px');
      expect(svg).toHaveAttribute('fill', '#ff0000');
    });
  });

  describe('DisabledIconButton', () => {
    it('should render disabled button when isReadOnly is true', () => {
      render(
        <DisabledIconButton
          title="Test Button"
          icon={<div>Icon</div>}
          isReadOnly={true}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should render enabled button when isReadOnly is false', () => {
      render(
        <DisabledIconButton
          title="Test Button"
          icon={<div>Icon</div>}
          isReadOnly={false}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should call onClick when clicked and not read-only', () => {
      const onClick = jest.fn();
      render(
        <DisabledIconButton
          title="Test Button"
          icon={<div>Icon</div>}
          onClick={onClick}
          isReadOnly={false}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalled();
    });

    it('should not call onClick when read-only', () => {
      const onClick = jest.fn();
      render(
        <DisabledIconButton
          title="Test Button"
          icon={<div>Icon</div>}
          onClick={onClick}
          isReadOnly={true}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('getEmptyCellStyles', () => {
    it('should return correct styles', () => {
      const styles = getEmptyCellStyles();
      expect(styles).toHaveProperty('position', 'absolute');
      expect(styles).toHaveProperty('display', 'flex');
      expect(styles).toHaveProperty('backgroundColor', '#ffffff');
    });
  });

  describe('EmptyCell', () => {
    it('should render with children', () => {
      render(
        <EmptyCell>
          <div>Test Content</div>
        </EmptyCell>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render without children', () => {
      const { container } = render(<EmptyCell />);
      const box = container.querySelector('div');
      expect(box).toBeInTheDocument();
    });
  });

  describe('getResetButtonStyles', () => {
    it('should return styles for enabled state', () => {
      const styles = getResetButtonStyles(true);
      expect(styles.color).toBe('#6c757d');
      expect(styles.cursor).toBe('pointer');
    });

    it('should return styles for disabled state', () => {
      const styles = getResetButtonStyles(false);
      expect(styles.color).toBe('#ccc');
      expect(styles.cursor).toBe('not-allowed');
    });
  });

  describe('ResetButton', () => {
    it('should render disabled button when isReadOnly is true', () => {
      render(
        <ResetButton
          hasPermissionChanges={true}
          onReset={jest.fn()}
          isReadOnly={true}
        />
      );
      
      expect(screen.getByTestId('reset-icon')).toBeInTheDocument();
    });

    it('should render enabled button when hasPermissionChanges is true and not read-only', () => {
      const onReset = jest.fn();
      render(
        <ResetButton
          hasPermissionChanges={true}
          onReset={onReset}
          isReadOnly={false}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      
      fireEvent.click(button);
      expect(onReset).toHaveBeenCalled();
    });

    it('should render disabled button when hasPermissionChanges is false', () => {
      render(
        <ResetButton
          hasPermissionChanges={false}
          onReset={jest.fn()}
          isReadOnly={false}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not call onReset when disabled', () => {
      const onReset = jest.fn();
      render(
        <ResetButton
          hasPermissionChanges={false}
          onReset={onReset}
          isReadOnly={false}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onReset).not.toHaveBeenCalled();
    });
  });

  describe('DuplicateButton', () => {
    it('should render enabled button when not read-only', () => {
      const onDuplicateClick = jest.fn();
      render(
        <DuplicateButton
          isReadOnly={false}
          onDuplicateClick={onDuplicateClick}
        />
      );
      
      const button = screen.getByTestId('common-button');
      expect(button).not.toBeDisabled();
      
      fireEvent.click(button);
      expect(onDuplicateClick).toHaveBeenCalled();
    });

    it('should render disabled button when read-only', () => {
      render(
        <DuplicateButton
          isReadOnly={true}
          onDuplicateClick={jest.fn()}
        />
      );
      
      const button = screen.getByTestId('common-button');
      expect(button).toBeDisabled();
    });

    it('should log to console when onDuplicateClick is not provided', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(
        <DuplicateButton
          isReadOnly={false}
        />
      );
      
      const button = screen.getByTestId('common-button');
      fireEvent.click(button);
      
      expect(consoleSpy).toHaveBeenCalledWith('Duplicate permissions - handler not provided');
      consoleSpy.mockRestore();
    });

    it('should render with correct background colors', () => {
      const { rerender } = render(
        <DuplicateButton
          isReadOnly={false}
          onDuplicateClick={jest.fn()}
        />
      );
      
      let button = screen.getByTestId('common-button');
      expect(button).toHaveStyle({ backgroundColor: 'rgba(0, 111, 230, 1)' });
      
      rerender(
        <DuplicateButton
          isReadOnly={true}
          onDuplicateClick={jest.fn()}
        />
      );
      
      button = screen.getByTestId('common-button');
      expect(button).toHaveStyle({ backgroundColor: '#E3F2FD' });
    });
  });
});

