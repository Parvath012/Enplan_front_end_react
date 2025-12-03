/**
 * Unit tests for ZoomControls component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ZoomControls from '../../../src/components/reportingStructure/ZoomControls';

const mockZoomSteps = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

describe('ZoomControls', () => {
  const mockOnZoomIn = jest.fn();
  const mockOnZoomOut = jest.fn();
  const mockOnZoomReset = jest.fn();

  const defaultProps = {
    zoomIndex: 3,
    zoomSteps: mockZoomSteps,
    onZoomIn: mockOnZoomIn,
    onZoomOut: mockOnZoomOut,
    onZoomReset: mockOnZoomReset,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render zoom controls', () => {
    const { container } = render(<ZoomControls {...defaultProps} />);
    expect(container.querySelector('[data-title="Zoom In"]')).toBeInTheDocument();
    expect(container.querySelector('[data-title="Zoom Out"]')).toBeInTheDocument();
    expect(container.querySelector('[data-title="Reset Zoom"]')).toBeInTheDocument();
  });

  it('should display current zoom percentage', () => {
    render(<ZoomControls {...defaultProps} zoomIndex={3} />);
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('should display correct zoom percentage for different indices', () => {
    const { rerender } = render(<ZoomControls {...defaultProps} zoomIndex={0} />);
    expect(screen.getByText(/25%/)).toBeInTheDocument();

    rerender(<ZoomControls {...defaultProps} zoomIndex={1} />);
    expect(screen.getByText(/50%/)).toBeInTheDocument();

    rerender(<ZoomControls {...defaultProps} zoomIndex={7} />);
    expect(screen.getByText(/200%/)).toBeInTheDocument();
  });

  it('should call onZoomIn when zoom in button is clicked', () => {
    const { container } = render(<ZoomControls {...defaultProps} />);
    const zoomInButton = container.querySelector('[data-title="Zoom In"] button');
    fireEvent.click(zoomInButton!);
    expect(mockOnZoomIn).toHaveBeenCalledTimes(1);
  });

  it('should call onZoomOut when zoom out button is clicked', () => {
    const { container } = render(<ZoomControls {...defaultProps} />);
    const zoomOutButton = container.querySelector('[data-title="Zoom Out"] button');
    fireEvent.click(zoomOutButton!);
    expect(mockOnZoomOut).toHaveBeenCalledTimes(1);
  });

  it('should call onZoomReset when reset button is clicked', () => {
    const { container } = render(<ZoomControls {...defaultProps} />);
    const resetButton = container.querySelector('[data-title="Reset Zoom"]')?.parentElement;
    fireEvent.click(resetButton!);
    expect(mockOnZoomReset).toHaveBeenCalledTimes(1);
  });

  it('should disable zoom in button at maximum zoom', () => {
    const { container } = render(<ZoomControls {...defaultProps} zoomIndex={mockZoomSteps.length - 1} />);
    const zoomInButton = container.querySelector('[data-title="Zoom In"] button');
    expect(zoomInButton).toBeDisabled();
  });

  it('should disable zoom out button at minimum zoom', () => {
    const { container } = render(<ZoomControls {...defaultProps} zoomIndex={0} />);
    const zoomOutButton = container.querySelector('[data-title="Zoom Out"] button');
    expect(zoomOutButton).toBeDisabled();
  });

  it('should enable zoom in button when not at maximum', () => {
    const { container } = render(<ZoomControls {...defaultProps} zoomIndex={3} />);
    const zoomInButton = container.querySelector('[data-title="Zoom In"] button');
    expect(zoomInButton).not.toBeDisabled();
  });

  it('should enable zoom out button when not at minimum', () => {
    const { container } = render(<ZoomControls {...defaultProps} zoomIndex={3} />);
    const zoomOutButton = container.querySelector('[data-title="Zoom Out"] button');
    expect(zoomOutButton).not.toBeDisabled();
  });

  it('should have correct container styling', () => {
    const { container } = render(<ZoomControls {...defaultProps} />);
    const controlsContainer = container.firstChild;
    expect(controlsContainer).toBeInTheDocument();
  });
});

