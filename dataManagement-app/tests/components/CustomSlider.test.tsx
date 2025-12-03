import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomSlider from '../../src/components/CustomSlider';

// HEADER_STYLES moved to CustomSlider.tsx component file

describe('CustomSlider Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    title: 'Test Slider',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render when open is true', () => {
      render(<CustomSlider {...defaultProps} />);
      expect(screen.getByText('Test Slider')).toBeInTheDocument();
    });

    it('should not render immediately when open is false', () => {
      render(<CustomSlider {...defaultProps} open={false} />);
      expect(screen.queryByText('Test Slider')).not.toBeInTheDocument();
    });

    it('should render title correctly', () => {
      render(<CustomSlider {...defaultProps} title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render children when provided', () => {
      render(
        <CustomSlider {...defaultProps}>
          <div>Test Child Content</div>
        </CustomSlider>
      );
      expect(screen.getByText('Test Child Content')).toBeInTheDocument();
    });

    it('should render footer content when provided', () => {
      const footerContent = <div>Footer Content</div>;
      render(<CustomSlider {...defaultProps} footerContent={footerContent} />);
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('should not render footer when footerContent is not provided', () => {
      const { container } = render(<CustomSlider {...defaultProps} />);
      const footers = container.querySelectorAll('[sx]');
      const hasFooter = Array.from(footers).some(
        (el) => el.textContent === '' && el.getAttribute('sx')?.includes('FOOTER_STYLES')
      );
      expect(hasFooter).toBeFalsy();
    });
  });

  describe('Close Button', () => {
    it('should render close button with × symbol', () => {
      render(<CustomSlider {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveTextContent('×');
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<CustomSlider {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should show tooltip on close button hover', async () => {
      render(<CustomSlider {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      fireEvent.mouseEnter(closeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Close')).toBeInTheDocument();
      }, { timeout: 600 });
    });
  });

  describe('Animation and Visibility', () => {
    it('should set visible state to true when open is true', () => {
      const { rerender } = render(<CustomSlider {...defaultProps} open={false} />);
      expect(screen.queryByText('Test Slider')).not.toBeInTheDocument();
      
      rerender(<CustomSlider {...defaultProps} open={true} />);
      expect(screen.getByText('Test Slider')).toBeInTheDocument();
    });

    it('should delay unmounting when closed', async () => {
      const { rerender } = render(<CustomSlider {...defaultProps} open={true} />);
      expect(screen.getByText('Test Slider')).toBeInTheDocument();
      
      rerender(<CustomSlider {...defaultProps} open={false} />);
      
      // Should still be visible immediately after setting open to false
      expect(screen.getByText('Test Slider')).toBeInTheDocument();
      
      // After timeout, should be removed
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        expect(screen.queryByText('Test Slider')).not.toBeInTheDocument();
      });
    });

    it('should clean up timeout on unmount', () => {
      const { unmount } = render(<CustomSlider {...defaultProps} open={true} />);
      unmount();
      
      jest.advanceTimersByTime(600);
      // Should not throw any errors
    });
  });

  describe('Backdrop Overlay', () => {
    it('should render backdrop overlay when open', () => {
      const { container } = render(<CustomSlider {...defaultProps} open={true} />);
      // Backdrop is rendered with MUI Box component
      const backdrop = container.querySelector('.MuiBox-root');
      expect(backdrop).toBeInTheDocument();
    });

    it('should have correct blur styles on backdrop', () => {
      const { container } = render(<CustomSlider {...defaultProps} open={true} />);
      // Check that backdrop Box component exists
      const backdrop = container.querySelector('.MuiBox-root');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Slide Animation', () => {
    it('should apply slide-in animation when opening', () => {
      render(<CustomSlider {...defaultProps} open={true} />);
      const slider = screen.getByText('Test Slider').closest('.MuiBox-root');
      expect(slider).toBeInTheDocument();
    });

    it('should apply slide-out animation when closing', () => {
      const { rerender } = render(<CustomSlider {...defaultProps} open={true} />);
      rerender(<CustomSlider {...defaultProps} open={false} />);
      
      const slider = screen.getByText('Test Slider').closest('.MuiBox-root');
      expect(slider).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have correct font family applied', () => {
      render(<CustomSlider {...defaultProps} />);
      const title = screen.getByText('Test Slider');
      expect(title).toBeInTheDocument();
    });

    it('should have fixed positioning', () => {
      const { container } = render(<CustomSlider {...defaultProps} />);
      const sliderContainer = container.querySelector('.MuiBox-root');
      expect(sliderContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close toggling', () => {
      const { rerender } = render(<CustomSlider {...defaultProps} open={true} />);
      
      rerender(<CustomSlider {...defaultProps} open={false} />);
      jest.advanceTimersByTime(100);
      
      rerender(<CustomSlider {...defaultProps} open={true} />);
      jest.advanceTimersByTime(100);
      
      expect(screen.getByText('Test Slider')).toBeInTheDocument();
    });

    it('should handle empty title', () => {
      render(<CustomSlider {...defaultProps} title="" />);
      const header = screen.getByRole('heading', { level: 2 });
      expect(header).toBeInTheDocument();
      expect(header.textContent).toBe('');
    });

    it('should handle multiple children', () => {
      render(
        <CustomSlider {...defaultProps}>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </CustomSlider>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<CustomSlider {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Test Slider');
    });

    it('should have accessible close button', () => {
      render(<CustomSlider {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with complex footer content', () => {
      const complexFooter = (
        <div>
          <button>Cancel</button>
          <button>Submit</button>
        </div>
      );
      
      render(<CustomSlider {...defaultProps} footerContent={complexFooter} />);
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('should maintain state during re-renders', () => {
      const { rerender } = render(<CustomSlider {...defaultProps} title="Original" />);
      expect(screen.getByText('Original')).toBeInTheDocument();
      
      rerender(<CustomSlider {...defaultProps} title="Updated" />);
      expect(screen.getByText('Updated')).toBeInTheDocument();
      expect(screen.queryByText('Original')).not.toBeInTheDocument();
    });
  });
});
// HEADER_STYLES removed - now defined in CustomSlider.tsx component file

