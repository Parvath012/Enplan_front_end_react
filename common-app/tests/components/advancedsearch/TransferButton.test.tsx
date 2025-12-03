import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TransferButton } from '../../../src/components/advancedsearch/TransferButton';

describe('TransferButton', () => {
  const defaultProps = {
    onClick: jest.fn(),
    disabled: false,
    children: '>',
    title: 'Move Right',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with children and title', () => {
      render(<TransferButton {...defaultProps} />);
      
      expect(screen.getByText('>')).toBeInTheDocument();
      expect(screen.getByTitle('Move Right')).toBeInTheDocument();
    });

    it('renders as button element', () => {
      render(<TransferButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('calls onClick when clicked', async () => {
      const onClick = jest.fn();
      render(<TransferButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const onClick = jest.fn();
      render(<TransferButton {...defaultProps} onClick={onClick} disabled={true} />);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('applies disabled attribute when disabled is true', () => {
      render(<TransferButton {...defaultProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('does not apply disabled attribute when disabled is false', () => {
      render(<TransferButton {...defaultProps} disabled={false} />);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
      render(<TransferButton {...defaultProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ opacity: '0.5' });
    });
  });

  describe('Different Children and Titles', () => {
    it('renders different children', () => {
      const { rerender } = render(<TransferButton {...defaultProps} children="<" />);
      expect(screen.getByText('<')).toBeInTheDocument();
      
      rerender(<TransferButton {...defaultProps} children=">>" />);
      expect(screen.getByText('>>')).toBeInTheDocument();
      
      rerender(<TransferButton {...defaultProps} children="<<" />);
      expect(screen.getByText('<<')).toBeInTheDocument();
    });

    it('renders different titles', () => {
      const { rerender } = render(<TransferButton {...defaultProps} title="Move Left" />);
      expect(screen.getByTitle('Move Left')).toBeInTheDocument();
      
      rerender(<TransferButton {...defaultProps} title="Move All Right" />);
      expect(screen.getByTitle('Move All Right')).toBeInTheDocument();
      
      rerender(<TransferButton {...defaultProps} title="Move All Left" />);
      expect(screen.getByTitle('Move All Left')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports click interaction when enabled', async () => {
      const onClick = jest.fn();
      render(<TransferButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      await userEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('supports focus and click interaction', async () => {
      const onClick = jest.fn();
      render(<TransferButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
      await userEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('ignores click events when disabled', async () => {
      const onClick = jest.fn();
      render(<TransferButton {...defaultProps} onClick={onClick} disabled={true} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      await userEvent.click(button);
      
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper title attribute', () => {
      render(<TransferButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Move Right');
    });

    it('is focusable when enabled', () => {
      render(<TransferButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<TransferButton {...defaultProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Styling', () => {
    it('has correct base styles', () => {
      render(<TransferButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        background: 'transparent',
        border: '1px solid #e5e5ea',
        borderRadius: '4px',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        opacity: '1',
      });
    });

    it('applies disabled styles when disabled', () => {
      render(<TransferButton {...defaultProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ opacity: '0.5' });
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onClick gracefully', () => {
      expect(() => {
        render(<TransferButton {...defaultProps} onClick={undefined} />);
      }).not.toThrow();
    });

    it('handles rapid clicks when enabled', async () => {
      const onClick = jest.fn();
      render(<TransferButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      await userEvent.click(button);
      await userEvent.click(button);
      await userEvent.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('handles empty icon string', () => {
      render(<TransferButton {...defaultProps} icon="" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles empty title string', () => {
      render(<TransferButton {...defaultProps} title="" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', '');
    });

    it('handles special characters in children', () => {
      render(<TransferButton {...defaultProps} children="→" />);
      
      expect(screen.getByText('→')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('handles all required props', () => {
      const props = {
        onClick: jest.fn(),
        disabled: false,
        icon: '>',
        title: 'Move Right',
      };
      
      expect(() => {
        render(<TransferButton {...props} />);
      }).not.toThrow();
    });

    it('handles optional props with default values', () => {
      const minimalProps = {
        onClick: jest.fn(),
      };
      
      expect(() => {
        render(<TransferButton {...minimalProps} />);
      }).not.toThrow();
    });
  });
});
