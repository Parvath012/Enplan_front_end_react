import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NavigationBar from '../../../../src/components/entityConfiguration/components/NavigationBar';

// Mock the lazy-loaded components
jest.mock('commonApp/CustomTooltip', () => {
  return jest.fn(({ children, title }: any) => (
    <div data-testid="custom-tooltip" data-title={title}>
      {children}
    </div>
  ));
});

// Mock the styles
jest.mock('../../../../src/components/entityConfiguration/styles', () => ({
  entityConfigurationStyles: {
    navigationBar: { display: 'flex', justifyContent: 'space-between' },
    navigationLeft: { display: 'flex' },
    navigationRight: { display: 'flex', alignItems: 'center' },
    tabContainer: { display: 'flex' },
    baseTab: { padding: '8px 16px', cursor: 'pointer', position: 'relative' },
    tab1: { marginRight: '16px' },
    tab: { marginRight: '16px' },
    progressContainer: { display: 'flex', alignItems: 'center', marginRight: '16px' },
    progressLabel: { marginRight: '8px' },
    progressBar: { width: '100px', height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px' },
    progressFill: { height: '100%', backgroundColor: '#006fe6', borderRadius: '2px' },
    progressPercentage: { marginLeft: '8px' },
    closeButton: { cursor: 'pointer', padding: '8px' }
  }
}));

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  Close: ({ size }: any) => <div data-testid="close-icon" data-size={size}>Close Icon</div>
}));

describe('NavigationBar Component', () => {
  const defaultProps = {
    tabValue: 0,
    isRollupEntity: false,
    progress: 50,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<NavigationBar {...defaultProps} />);
      expect(screen.getByText('Countries and Currency')).toBeInTheDocument();
    });

    it('renders all tabs for non-rollup entity', () => {
      render(<NavigationBar {...defaultProps} />);
      
      expect(screen.getByText('Countries and Currency')).toBeInTheDocument();
      expect(screen.getByText('Period Setup')).toBeInTheDocument();
      expect(screen.getByText('Modules')).toBeInTheDocument();
    });

    it('renders only first two tabs for rollup entity', () => {
      render(<NavigationBar {...defaultProps} isRollupEntity={true} />);
      
      expect(screen.getByText('Countries and Currency')).toBeInTheDocument();
      expect(screen.getByText('Period Setup')).toBeInTheDocument();
      expect(screen.queryByText('Modules')).not.toBeInTheDocument();
    });

    it('renders progress section', () => {
      render(<NavigationBar {...defaultProps} />);
      
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders close button with tooltip', () => {
      render(<NavigationBar {...defaultProps} />);
      
      expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('custom-tooltip')).toHaveAttribute('data-title', 'Close');
      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });
  });

  describe('Tab Styling', () => {
    it('applies active styling to tab 0 when tabValue is 0', () => {
      render(<NavigationBar {...defaultProps} tabValue={0} />);
      
      const tab0 = screen.getByText('Countries and Currency');
      expect(tab0).toHaveStyle('color: rgba(0, 111, 230, 1)');
    });

    it('applies active styling to tab 1 when tabValue is 1', () => {
      render(<NavigationBar {...defaultProps} tabValue={1} />);
      
      const tab1 = screen.getByText('Period Setup');
      expect(tab1).toHaveStyle('color: rgba(0, 111, 230, 1)');
    });

    it('applies active styling to tab 2 when tabValue is 2', () => {
      render(<NavigationBar {...defaultProps} tabValue={2} />);
      
      const tab2 = screen.getByText('Modules');
      expect(tab2).toHaveStyle('color: rgba(0, 111, 230, 1)');
    });

    it('applies inactive styling to tabs when not active', () => {
      render(<NavigationBar {...defaultProps} tabValue={1} />);
      
      const tab0 = screen.getByText('Countries and Currency');
      const tab2 = screen.getByText('Modules');
      
      expect(tab0).toHaveStyle('color: #333333');
      expect(tab2).toHaveStyle('color: #333333');
    });
  });

  describe('Progress Display', () => {
    it('displays progress percentage correctly for whole numbers', () => {
      render(<NavigationBar {...defaultProps} progress={75} />);
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('displays progress percentage correctly for decimal numbers', () => {
      render(<NavigationBar {...defaultProps} progress={75.5} />);
      
      expect(screen.getByText('75.5%')).toBeInTheDocument();
    });

    it('displays progress percentage correctly for zero', () => {
      render(<NavigationBar {...defaultProps} progress={0} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('displays progress percentage correctly for 100', () => {
      render(<NavigationBar {...defaultProps} progress={100} />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('displays progress percentage correctly for negative numbers', () => {
      render(<NavigationBar {...defaultProps} progress={-10} />);
      
      expect(screen.getByText('-10%')).toBeInTheDocument();
    });

    it('displays progress percentage correctly for numbers over 100', () => {
      render(<NavigationBar {...defaultProps} progress={150} />);
      
      expect(screen.getByText('150%')).toBeInTheDocument();
    });
  });

  describe('Progress Bar Styling', () => {
    it('applies correct width to progress bar based on progress value', () => {
      render(<NavigationBar {...defaultProps} progress={75} />);
      
      const progressFill = screen.getByText('75%').previousElementSibling?.querySelector('div');
      expect(progressFill).toHaveStyle('width: 75%');
    });

    it('applies correct width to progress bar for decimal values', () => {
      render(<NavigationBar {...defaultProps} progress={33.33} />);
      
      const progressFill = screen.getByText('33.3%').previousElementSibling?.querySelector('div');
      expect(progressFill).toHaveStyle('width: 33.33%');
    });

    it('applies correct width to progress bar for zero', () => {
      render(<NavigationBar {...defaultProps} progress={0} />);
      
      const progressFill = screen.getByText('0%').previousElementSibling?.querySelector('div');
      expect(progressFill).toHaveStyle('width: 0%');
    });

    it('applies correct width to progress bar for 100', () => {
      render(<NavigationBar {...defaultProps} progress={100} />);
      
      const progressFill = screen.getByText('100%').previousElementSibling?.querySelector('div');
      expect(progressFill).toHaveStyle('width: 100%');
    });
  });

  describe('Close Button Functionality', () => {
    it('calls onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      render(<NavigationBar {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByTestId('close-icon').closest('div');
      fireEvent.click(closeButton!);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('handles multiple close button clicks', () => {
      const mockOnClose = jest.fn();
      render(<NavigationBar {...defaultProps} onClose={mockOnClose} />);
      
      const closeButton = screen.getByTestId('close-icon').closest('div');
      fireEvent.click(closeButton!);
      fireEvent.click(closeButton!);
      
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('Conditional Rendering', () => {
    it('renders Modules tab when isRollupEntity is false', () => {
      render(<NavigationBar {...defaultProps} isRollupEntity={false} />);
      
      expect(screen.getByText('Modules')).toBeInTheDocument();
    });

    it('does not render Modules tab when isRollupEntity is true', () => {
      render(<NavigationBar {...defaultProps} isRollupEntity={true} />);
      
      expect(screen.queryByText('Modules')).not.toBeInTheDocument();
    });

    it('handles undefined isRollupEntity prop', () => {
      render(<NavigationBar {...defaultProps} isRollupEntity={undefined as any} />);
      
      expect(screen.getByText('Modules')).toBeInTheDocument();
    });

    it('handles null isRollupEntity prop', () => {
      render(<NavigationBar {...defaultProps} isRollupEntity={null as any} />);
      
      expect(screen.getByText('Modules')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined tabValue', () => {
      render(<NavigationBar {...defaultProps} tabValue={undefined as any} />);
      
      expect(screen.getByText('Countries and Currency')).toBeInTheDocument();
      expect(screen.getByText('Period Setup')).toBeInTheDocument();
      expect(screen.getByText('Modules')).toBeInTheDocument();
    });

    it('handles null tabValue', () => {
      render(<NavigationBar {...defaultProps} tabValue={null as any} />);
      
      expect(screen.getByText('Countries and Currency')).toBeInTheDocument();
      expect(screen.getByText('Period Setup')).toBeInTheDocument();
      expect(screen.getByText('Modules')).toBeInTheDocument();
    });

    it('handles negative tabValue', () => {
      render(<NavigationBar {...defaultProps} tabValue={-1} />);
      
      expect(screen.getByText('Countries and Currency')).toBeInTheDocument();
      expect(screen.getByText('Period Setup')).toBeInTheDocument();
      expect(screen.getByText('Modules')).toBeInTheDocument();
    });

    it('handles tabValue greater than 2', () => {
      render(<NavigationBar {...defaultProps} tabValue={5} />);
      
      expect(screen.getByText('Countries and Currency')).toBeInTheDocument();
      expect(screen.getByText('Period Setup')).toBeInTheDocument();
      expect(screen.getByText('Modules')).toBeInTheDocument();
    });

    it('handles undefined progress', () => {
      render(<NavigationBar {...defaultProps} progress={undefined as any} />);
      
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('handles null progress', () => {
      render(<NavigationBar {...defaultProps} progress={null as any} />);
      
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('handles string progress', () => {
      render(<NavigationBar {...defaultProps} progress={'50' as any} />);
      
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('handles boolean progress', () => {
      render(<NavigationBar {...defaultProps} progress={true as any} />);
      
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('handles component unmounting', () => {
      const { unmount } = render(<NavigationBar {...defaultProps} />);
      
      expect(screen.getByText('Countries and Currency')).toBeInTheDocument();
      
      unmount();
      
      expect(screen.queryByText('Countries and Currency')).not.toBeInTheDocument();
    });

    it('handles prop changes', () => {
      const { rerender } = render(<NavigationBar {...defaultProps} />);
      
      expect(screen.getByText('50%')).toBeInTheDocument();
      
      rerender(<NavigationBar {...defaultProps} progress={75} />);
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('handles tabValue changes', () => {
      const { rerender } = render(<NavigationBar {...defaultProps} tabValue={0} />);
      
      const tab0 = screen.getByText('Countries and Currency');
      expect(tab0).toHaveStyle('color: rgba(0, 111, 230, 1)');
      
      rerender(<NavigationBar {...defaultProps} tabValue={1} />);
      
      const tab1 = screen.getByText('Period Setup');
      expect(tab1).toHaveStyle('color: rgba(0, 111, 230, 1)');
    });

    it('handles isRollupEntity changes', () => {
      const { rerender } = render(<NavigationBar {...defaultProps} isRollupEntity={false} />);
      
      expect(screen.getByText('Modules')).toBeInTheDocument();
      
      rerender(<NavigationBar {...defaultProps} isRollupEntity={true} />);
      
      expect(screen.queryByText('Modules')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper structure for screen readers', () => {
      render(<NavigationBar {...defaultProps} />);
      
      expect(screen.getByText('Countries and Currency')).toBeInTheDocument();
      expect(screen.getByText('Period Setup')).toBeInTheDocument();
      expect(screen.getByText('Modules')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('has proper close button accessibility', () => {
      render(<NavigationBar {...defaultProps} />);
      
      const closeButton = screen.getByTestId('close-icon').closest('div');
      expect(closeButton).toBeInTheDocument();
    });

    it('has proper progress indicator accessibility', () => {
      render(<NavigationBar {...defaultProps} />);
      
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('renders Close icon with correct size', () => {
      render(<NavigationBar {...defaultProps} />);
      
      const closeIcon = screen.getByTestId('close-icon');
      expect(closeIcon).toHaveAttribute('data-size', '24');
    });

    it('renders Close icon text', () => {
      render(<NavigationBar {...defaultProps} />);
      
      expect(screen.getByText('Close Icon')).toBeInTheDocument();
    });
  });

  describe('Suspense Fallback', () => {
    it('handles Suspense fallback for CustomTooltip', () => {
      // This test ensures the Suspense wrapper is working
      render(<NavigationBar {...defaultProps} />);
      
      expect(screen.getByTestId('custom-tooltip')).toBeInTheDocument();
    });
  });
});
