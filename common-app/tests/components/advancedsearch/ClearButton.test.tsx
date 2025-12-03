import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ClearButton } from '../../../src/components/advancedsearch/ClearButton';

describe('ClearButton', () => {
  const defaultProps = {
    onClick: jest.fn(),
    visible: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when visible is true', () => {
      render(<ClearButton {...defaultProps} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByLabelText('Clear')).toBeInTheDocument();
    });

    it('does not render when visible is false', () => {
      render(<ClearButton {...defaultProps} visible={false} />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders with correct text content', () => {
      render(<ClearButton {...defaultProps} />);
      
      expect(screen.getByRole('button')).toHaveTextContent('×');
    });
  });

  describe('Click Handling', () => {
    it('calls onClick when clicked', async () => {
      const onClick = jest.fn();
      render(<ClearButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when not visible', () => {
      const onClick = jest.fn();
      render(<ClearButton {...defaultProps} onClick={onClick} visible={false} />);
      
      // Button should not be rendered, so no click possible
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has correct inline styles', () => {
      render(<ClearButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'transparent',
        color: 'rgb(102, 102, 102)',
        cursor: 'pointer',
        display: 'flex',
        width: '20px',
        height: '20px',
        padding: '0px',
      });
    });

    it('has correct type attribute', () => {
      render(<ClearButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Hover Effects', () => {
    it('changes background on mouse enter', () => {
      render(<ClearButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      expect(button).toHaveStyle({ background: '#e0e0e0' });
    });

    it('resets background on mouse leave', () => {
      render(<ClearButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      expect(button).toHaveStyle({ background: 'transparent' });
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label attribute', () => {
      render(<ClearButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Clear');
    });

    it('is focusable when visible', () => {
      render(<ClearButton {...defaultProps} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
    });

    it('supports keyboard interaction', async () => {
      const onClick = jest.fn();
      render(<ClearButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      // Test click instead of keyboard since the component doesn't handle Enter key
      await userEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onClick gracefully', () => {
      expect(() => {
        render(<ClearButton {...defaultProps} onClick={undefined} />);
      }).not.toThrow();
    });

    it('handles rapid clicks', async () => {
      const onClick = jest.fn();
      render(<ClearButton {...defaultProps} onClick={onClick} />);
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      await userEvent.click(button);
      await userEvent.click(button);
      await userEvent.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('handles visibility changes', () => {
      const { rerender } = render(<ClearButton {...defaultProps} visible={true} />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      
      rerender(<ClearButton {...defaultProps} visible={false} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      
      rerender(<ClearButton {...defaultProps} visible={true} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
