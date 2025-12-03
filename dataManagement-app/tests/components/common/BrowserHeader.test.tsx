import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrowserHeader from '../../../src/components/common/BrowserHeader';

// Mock MUI components
jest.mock('@mui/material', () => ({
  Typography: ({ children, variant, className }: any) => (
    <div data-testid="typography" data-variant={variant} className={className}>
      {children}
    </div>
  ),
  IconButton: ({ onClick, children, className, 'aria-label': ariaLabel, size, disableRipple }: any) => (
    <button
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
      data-testid="icon-button"
      data-size={size}
      data-disable-ripple={disableRipple}
    >
      {children}
    </button>
  )
}));

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  Close: ({ size }: any) => <div data-testid="close-icon" data-size={size} />
}));

// Mock CustomTooltip
jest.mock('commonApp/CustomTooltip', () => ({
  __esModule: true,
  default: ({ children, title }: any) => (
    <div data-testid="custom-tooltip" title={title}>
      {children}
    </div>
  )
}));

describe('BrowserHeader', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with title', () => {
      render(<BrowserHeader title="Test Title" onClose={mockOnClose} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<BrowserHeader title="Test Title" onClose={mockOnClose} />);
      expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    it('should render with default className when not provided', () => {
      render(<BrowserHeader title="Test Title" onClose={mockOnClose} />);
      const header = screen.getByText('Test Title').closest('.browser__header');
      expect(header).toBeInTheDocument();
    });

    it('should render with custom className when provided', () => {
      render(<BrowserHeader title="Test Title" onClose={mockOnClose} className="custom-header" />);
      const header = screen.getByText('Test Title').closest('.custom-header');
      expect(header).toBeInTheDocument();
    });

    it('should render with default close button className when not provided', () => {
      render(<BrowserHeader title="Test Title" onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toHaveClass('browser__close-button');
    });

    it('should render with custom close button className when provided', () => {
      render(
        <BrowserHeader
          title="Test Title"
          onClose={mockOnClose}
          closeButtonClassName="custom-close-button"
        />
      );
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toHaveClass('custom-close-button');
    });

    it('should render Typography with correct variant', () => {
      render(<BrowserHeader title="Test Title" onClose={mockOnClose} />);
      const typography = screen.getByTestId('typography');
      expect(typography).toHaveAttribute('data-variant', 'h6');
    });

    it('should render Close icon with correct size', () => {
      render(<BrowserHeader title="Test Title" onClose={mockOnClose} />);
      const closeIcon = screen.getByTestId('close-icon');
      expect(closeIcon).toHaveAttribute('data-size', '22');
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<BrowserHeader title="Test Title" onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose multiple times when clicked multiple times', () => {
      render(<BrowserHeader title="Test Title" onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on close button', () => {
      render(<BrowserHeader title="Test Title" onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toHaveAttribute('aria-label', 'Close');
    });

    it('should have disableRipple on close button', () => {
      render(<BrowserHeader title="Test Title" onClose={mockOnClose} />);
      const closeButton = screen.getByTestId('icon-button');
      expect(closeButton).toHaveAttribute('data-disable-ripple', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(<BrowserHeader title="" onClose={mockOnClose} />);
      const typography = screen.getByTestId('typography');
      expect(typography).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(1000);
      render(<BrowserHeader title={longTitle} onClose={mockOnClose} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'Test & Title <>"\'';
      render(<BrowserHeader title={specialTitle} onClose={mockOnClose} />);
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });
  });

  describe('Nullish Coalescing', () => {
    it('should use default className when className is null', () => {
      render(<BrowserHeader title="Test" onClose={mockOnClose} className={null as any} />);
      const header = screen.getByText('Test').closest('.browser__header');
      expect(header).toBeInTheDocument();
    });

    it('should use default className when className is undefined', () => {
      render(<BrowserHeader title="Test" onClose={mockOnClose} className={undefined} />);
      const header = screen.getByText('Test').closest('.browser__header');
      expect(header).toBeInTheDocument();
    });

    it('should use default closeButtonClassName when closeButtonClassName is null', () => {
      render(
        <BrowserHeader title="Test" onClose={mockOnClose} closeButtonClassName={null as any} />
      );
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toHaveClass('browser__close-button');
    });

    it('should use default closeButtonClassName when closeButtonClassName is undefined', () => {
      render(
        <BrowserHeader title="Test" onClose={mockOnClose} closeButtonClassName={undefined} />
      );
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toHaveClass('browser__close-button');
    });
  });
});

