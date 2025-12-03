import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ZoomControls from '../../../src/components/hierarchy/ZoomControls';

// Mock CustomTooltip
jest.mock('../../../src/components/common/CustomTooltip', () => {
  return function MockCustomTooltip({ children, title }: any) {
    return <div data-testid="tooltip" title={title}>{children}</div>;
  };
});

describe('ZoomControls', () => {
  const defaultProps = {
    zoomIndex: 3,
    zoomSteps: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const,
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onZoomReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render zoom controls container', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const container = screen.getByRole('generic').parentElement;
      expect(container).toBeInTheDocument();
    });

    it('should render zoom in button', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      expect(zoomInButton).toBeInTheDocument();
    });

    it('should render zoom out button', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      expect(zoomOutButton).toBeInTheDocument();
    });

    it('should render zoom percentage display', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const zoomPercentage = Math.round(defaultProps.zoomSteps[defaultProps.zoomIndex] * 100);
      expect(screen.getByText(`${zoomPercentage}%`)).toBeInTheDocument();
    });

    it('should render reset icon on hover', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const resetContainer = screen.getByText('100%').closest('div');
      expect(resetContainer).toBeInTheDocument();
    });
  });

  describe('zoom in functionality', () => {
    it('should call onZoomIn when zoom in button is clicked', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      fireEvent.click(zoomInButton);
      
      expect(defaultProps.onZoomIn).toHaveBeenCalledTimes(1);
    });

    it('should disable zoom in button when at maximum zoom', () => {
      const maxIndex = defaultProps.zoomSteps.length - 1;
      render(<ZoomControls {...defaultProps} zoomIndex={maxIndex} />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      expect(zoomInButton).toBeDisabled();
    });

    it('should not disable zoom in button when not at maximum', () => {
      render(<ZoomControls {...defaultProps} zoomIndex={0} />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      expect(zoomInButton).not.toBeDisabled();
    });

    it('should enable zoom in button when below maximum', () => {
      render(<ZoomControls {...defaultProps} zoomIndex={2} />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      expect(zoomInButton).not.toBeDisabled();
    });
  });

  describe('zoom out functionality', () => {
    it('should call onZoomOut when zoom out button is clicked', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      fireEvent.click(zoomOutButton);
      
      expect(defaultProps.onZoomOut).toHaveBeenCalledTimes(1);
    });

    it('should disable zoom out button when at minimum zoom', () => {
      render(<ZoomControls {...defaultProps} zoomIndex={0} />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      expect(zoomOutButton).toBeDisabled();
    });

    it('should not disable zoom out button when not at minimum', () => {
      const maxIndex = defaultProps.zoomSteps.length - 1;
      render(<ZoomControls {...defaultProps} zoomIndex={maxIndex} />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      expect(zoomOutButton).not.toBeDisabled();
    });

    it('should enable zoom out button when above minimum', () => {
      render(<ZoomControls {...defaultProps} zoomIndex={5} />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      expect(zoomOutButton).not.toBeDisabled();
    });
  });

  describe('zoom reset functionality', () => {
    it('should call onZoomReset when reset area is clicked', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const resetContainer = screen.getByText('100%').closest('div');
      if (resetContainer) {
        fireEvent.click(resetContainer);
      }
      
      expect(defaultProps.onZoomReset).toHaveBeenCalledTimes(1);
    });

    it('should display correct zoom percentage', () => {
      render(<ZoomControls {...defaultProps} zoomIndex={0} />);
      
      const percentage = Math.round(defaultProps.zoomSteps[0] * 100);
      expect(screen.getByText(`${percentage}%`)).toBeInTheDocument();
    });

    it('should update zoom percentage when zoomIndex changes', () => {
      const { rerender } = render(<ZoomControls {...defaultProps} zoomIndex={0} />);
      
      const percentage1 = Math.round(defaultProps.zoomSteps[0] * 100);
      expect(screen.getByText(`${percentage1}%`)).toBeInTheDocument();
      
      rerender(<ZoomControls {...defaultProps} zoomIndex={5} />);
      
      const percentage2 = Math.round(defaultProps.zoomSteps[5] * 100);
      expect(screen.getByText(`${percentage2}%`)).toBeInTheDocument();
    });
  });

  describe('tooltips', () => {
    it('should show "Zoom In" tooltip', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const tooltips = screen.getAllByTestId('tooltip');
      const zoomInTooltip = tooltips.find(t => t.getAttribute('title') === 'Zoom In');
      expect(zoomInTooltip).toBeInTheDocument();
    });

    it('should show "Zoom Out" tooltip', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const tooltips = screen.getAllByTestId('tooltip');
      const zoomOutTooltip = tooltips.find(t => t.getAttribute('title') === 'Zoom Out');
      expect(zoomOutTooltip).toBeInTheDocument();
    });

    it('should show "Reset Zoom" tooltip', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const tooltips = screen.getAllByTestId('tooltip');
      const resetTooltip = tooltips.find(t => t.getAttribute('title') === 'Reset Zoom');
      expect(resetTooltip).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply correct container styles', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const container = screen.getByText('100%').closest('div')?.parentElement;
      expect(container).toHaveStyle({
        position: 'absolute',
        right: '16px',
        bottom: '16px',
      });
    });

    it('should apply correct button styles', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      expect(zoomInButton).toHaveStyle({
        borderRadius: '8px',
        width: '28px',
        height: '28px',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle zoomIndex at first step', () => {
      render(<ZoomControls {...defaultProps} zoomIndex={0} />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      expect(zoomOutButton).toBeDisabled();
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      expect(zoomInButton).not.toBeDisabled();
    });

    it('should handle zoomIndex at last step', () => {
      const maxIndex = defaultProps.zoomSteps.length - 1;
      render(<ZoomControls {...defaultProps} zoomIndex={maxIndex} />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      expect(zoomInButton).toBeDisabled();
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      expect(zoomOutButton).not.toBeDisabled();
    });

    it('should handle zoomIndex in middle', () => {
      const middleIndex = Math.floor(defaultProps.zoomSteps.length / 2);
      render(<ZoomControls {...defaultProps} zoomIndex={middleIndex} />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      
      expect(zoomInButton).not.toBeDisabled();
      expect(zoomOutButton).not.toBeDisabled();
    });

    it('should handle different zoomSteps arrays', () => {
      const customSteps = [0.5, 1, 1.5, 2] as const;
      render(
        <ZoomControls
          {...defaultProps}
          zoomSteps={customSteps}
          zoomIndex={1}
        />
      );
      
      const percentage = Math.round(customSteps[1] * 100);
      expect(screen.getByText(`${percentage}%`)).toBeInTheDocument();
    });

    it('should handle zero zoom percentage', () => {
      const zeroSteps = [0, 0.5, 1] as const;
      render(
        <ZoomControls
          {...defaultProps}
          zoomSteps={zeroSteps}
          zoomIndex={0}
        />
      );
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle very large zoom percentage', () => {
      const largeSteps = [1, 2, 3, 4, 5] as const;
      render(
        <ZoomControls
          {...defaultProps}
          zoomSteps={largeSteps}
          zoomIndex={4}
        />
      );
      
      expect(screen.getByText('500%')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should handle multiple rapid clicks on zoom in', () => {
      render(<ZoomControls {...defaultProps} zoomIndex={0} />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      
      fireEvent.click(zoomInButton);
      fireEvent.click(zoomInButton);
      fireEvent.click(zoomInButton);
      
      expect(defaultProps.onZoomIn).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple rapid clicks on zoom out', () => {
      const maxIndex = defaultProps.zoomSteps.length - 1;
      render(<ZoomControls {...defaultProps} zoomIndex={maxIndex} />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      
      fireEvent.click(zoomOutButton);
      fireEvent.click(zoomOutButton);
      fireEvent.click(zoomOutButton);
      
      expect(defaultProps.onZoomOut).toHaveBeenCalledTimes(3);
    });

    it('should handle alternating zoom in and out', () => {
      render(<ZoomControls {...defaultProps} zoomIndex={3} />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      
      fireEvent.click(zoomInButton);
      fireEvent.click(zoomOutButton);
      fireEvent.click(zoomInButton);
      
      expect(defaultProps.onZoomIn).toHaveBeenCalledTimes(2);
      expect(defaultProps.onZoomOut).toHaveBeenCalledTimes(1);
    });

    it('should handle reset after zoom changes', () => {
      const { rerender } = render(<ZoomControls {...defaultProps} zoomIndex={3} />);
      
      const resetContainer = screen.getByText('100%').closest('div');
      
      // Change zoom
      rerender(<ZoomControls {...defaultProps} zoomIndex={5} />);
      
      // Reset
      if (resetContainer) {
        fireEvent.click(resetContainer);
      }
      
      expect(defaultProps.onZoomReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have proper button roles', () => {
      render(<ZoomControls {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have disabled state for buttons at limits', () => {
      render(<ZoomControls {...defaultProps} zoomIndex={0} />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      expect(zoomOutButton).toHaveAttribute('disabled');
    });
  });
});

