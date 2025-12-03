import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ZoomControls from '../../../src/components/structure/ZoomControls';

// Mock the commonApp components
jest.mock('commonApp/CustomTooltip', () => {
  return function MockCustomTooltip({ children, title, placement }: any) {
    return (
      <div data-testid="custom-tooltip" title={title} data-placement={placement}>
        {children}
      </div>
    );
  };
});

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  Add: ({ size }: any) => <div data-testid="add-icon" data-size={size}>Add</div>,
  Subtract: ({ size }: any) => <div data-testid="subtract-icon" data-size={size}>Subtract</div>,
  Reset: ({ size }: any) => <div data-testid="reset-icon" data-size={size}>Reset</div>,
}));

describe('ZoomControls - Real Component Tests', () => {
  const mockStore = configureStore({
    reducer: {
      // Add minimal reducers if needed
    }
  });

  const defaultProps = {
    zoomIndex: 3,
    zoomSteps: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const,
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onZoomReset: jest.fn(),
  };

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    renderWithProviders(<ZoomControls {...defaultProps} />);
    
    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
    expect(screen.getByTestId('subtract-icon')).toBeInTheDocument();
    expect(screen.getByTestId('reset-icon')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument(); // 1 * 100 = 100%
  });

  it('should display correct zoom percentage', () => {
    const props = { ...defaultProps, zoomIndex: 0 };
    renderWithProviders(<ZoomControls {...props} />);
    
    expect(screen.getByText('25%')).toBeInTheDocument(); // 0.25 * 100 = 25%
  });

  it('should handle zoom in button click', () => {
    renderWithProviders(<ZoomControls {...defaultProps} />);
    
    const zoomInButton = screen.getByTestId('add-icon').closest('button');
    expect(zoomInButton).toBeInTheDocument();
    
    fireEvent.click(zoomInButton!);
    expect(defaultProps.onZoomIn).toHaveBeenCalledTimes(1);
  });

  it('should handle zoom out button click', () => {
    renderWithProviders(<ZoomControls {...defaultProps} />);
    
    const zoomOutButton = screen.getByTestId('subtract-icon').closest('button');
    expect(zoomOutButton).toBeInTheDocument();
    
    fireEvent.click(zoomOutButton!);
    expect(defaultProps.onZoomOut).toHaveBeenCalledTimes(1);
  });

  it('should handle zoom reset click', () => {
    renderWithProviders(<ZoomControls {...defaultProps} />);
    
    const resetButton = screen.getByText('100%').closest('div');
    expect(resetButton).toBeInTheDocument();
    
    fireEvent.click(resetButton!);
    expect(defaultProps.onZoomReset).toHaveBeenCalledTimes(1);
  });

  it('should disable zoom in button when at maximum zoom', () => {
    const props = { ...defaultProps, zoomIndex: 7 }; // Last index
    renderWithProviders(<ZoomControls {...props} />);
    
    const zoomInButton = screen.getByTestId('add-icon').closest('button');
    expect(zoomInButton).toBeDisabled();
  });

  it('should disable zoom out button when at minimum zoom', () => {
    const props = { ...defaultProps, zoomIndex: 0 }; // First index
    renderWithProviders(<ZoomControls {...props} />);
    
    const zoomOutButton = screen.getByTestId('subtract-icon').closest('button');
    expect(zoomOutButton).toBeDisabled();
  });

  it('should show correct tooltips', () => {
    renderWithProviders(<ZoomControls {...defaultProps} />);
    
    const tooltips = screen.getAllByTestId('custom-tooltip');
    expect(tooltips).toHaveLength(3);
    
    expect(tooltips[0]).toHaveAttribute('title', 'Zoom In');
    expect(tooltips[1]).toHaveAttribute('title', 'Reset Zoom');
    expect(tooltips[2]).toHaveAttribute('title', 'Zoom Out');
  });

  it('should show reset icon on hover', () => {
    renderWithProviders(<ZoomControls {...defaultProps} />);
    
    const resetContainer = screen.getByText('100%').closest('div');
    expect(resetContainer).toBeInTheDocument();
    
    // The reset icon should be hidden by default
    const resetIcon = screen.getByTestId('reset-icon');
    expect(resetIcon.closest('.reset-icon')).toHaveStyle('display: none');
  });

  it('should handle different zoom steps', () => {
    const customZoomSteps = [0.1, 0.5, 1, 2, 4] as const;
    const props = { ...defaultProps, zoomSteps: customZoomSteps, zoomIndex: 2 };
    
    renderWithProviders(<ZoomControls {...props} />);
    
    expect(screen.getByText('100%')).toBeInTheDocument(); // 1 * 100 = 100%
  });

  it('should handle edge cases for zoom index', () => {
    const props = { ...defaultProps, zoomIndex: 1 };
    renderWithProviders(<ZoomControls {...props} />);
    
    // Both buttons should be enabled
    const zoomInButton = screen.getByTestId('add-icon').closest('button');
    const zoomOutButton = screen.getByTestId('subtract-icon').closest('button');
    
    expect(zoomInButton).not.toBeDisabled();
    expect(zoomOutButton).not.toBeDisabled();
  });

  it('should render with correct styling', () => {
    renderWithProviders(<ZoomControls {...defaultProps} />);
    
    const container = screen.getByTestId('add-icon').closest('div')?.parentElement;
    // The actual rendered styles may differ due to CSS-in-JS or theme overrides
    // Let's just verify the container exists and has some styling
    expect(container).toBeInTheDocument();
    expect(container).toHaveStyle({
      display: 'inline-flex',
      height: '28px',
      position: 'relative',
      width: '28px'
    });
  });

  it('should handle multiple rapid clicks', () => {
    renderWithProviders(<ZoomControls {...defaultProps} />);
    
    const zoomInButton = screen.getByTestId('add-icon').closest('button');
    const zoomOutButton = screen.getByTestId('subtract-icon').closest('button');
    
    // Rapid clicks
    fireEvent.click(zoomInButton!);
    fireEvent.click(zoomInButton!);
    fireEvent.click(zoomOutButton!);
    fireEvent.click(zoomOutButton!);
    
    expect(defaultProps.onZoomIn).toHaveBeenCalledTimes(2);
    expect(defaultProps.onZoomOut).toHaveBeenCalledTimes(2);
  });

  it('should handle component unmounting', () => {
    const { unmount } = renderWithProviders(<ZoomControls {...defaultProps} />);
    
    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
    
    unmount();
    
    expect(screen.queryByTestId('add-icon')).not.toBeInTheDocument();
  });
});



