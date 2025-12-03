import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ZoomControls from '../../../../../src/components/tablecomponents/tablefooter/components/ZoomControls';

describe('ZoomControls', () => {
  const defaultProps = {
    zoomPercentage: 100,
    minZoom: 50,
    maxZoom: 150,
    onZoomChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders zoom percentage', () => {
    render(<ZoomControls {...defaultProps} />);
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('renders slider with correct value, min, and max', () => {
    render(<ZoomControls {...defaultProps} />);
    const slider = screen.getByRole('slider', { name: /zoom slider/i });
    expect(slider).toHaveAttribute('aria-valuenow', '100');
    expect(slider).toHaveAttribute('aria-valuemin', '50');
    expect(slider).toHaveAttribute('aria-valuemax', '150');
  });

  it('calls onZoomChange when slider is changed', () => {
    render(<ZoomControls {...defaultProps} />);
    const slider = screen.getByRole('slider', { name: /zoom slider/i });
    fireEvent.change(slider, { target: { value: 120 } });
    expect(defaultProps.onZoomChange).toHaveBeenCalledWith(120);
  });

  it('calls onZoomChange with decreased value when - button is clicked', () => {
    render(<ZoomControls {...defaultProps} />);
    const minusButton = screen.getByRole('button', { name: '-' });
    fireEvent.click(minusButton);
    expect(defaultProps.onZoomChange).toHaveBeenCalledWith(90);
  });

  it('calls onZoomChange with increased value when + button is clicked', () => {
    render(<ZoomControls {...defaultProps} />);
    const plusButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(plusButton);
    expect(defaultProps.onZoomChange).toHaveBeenCalledWith(110);
  });

  it('does not decrease below minZoom', () => {
    render(
      <ZoomControls
        {...defaultProps}
        zoomPercentage={50}
      />
    );
    const minusButton = screen.getByRole('button', { name: '-' });
    fireEvent.click(minusButton);
    expect(defaultProps.onZoomChange).toHaveBeenCalledWith(50);
  });

  it('does not increase above maxZoom', () => {
    render(
      <ZoomControls
        {...defaultProps}
        zoomPercentage={150}
      />
    );
    const plusButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(plusButton);
    expect(defaultProps.onZoomChange).toHaveBeenCalledWith(150);
  });

  it('disables slider and buttons if onZoomChange is not provided', () => {
    render(
      <ZoomControls
        zoomPercentage={100}
        minZoom={50}
        maxZoom={150}
      />
    );
    expect(screen.getByRole('slider', { name: /zoom slider/i })).toBeDisabled();
    screen.getAllByRole('button').forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });
});