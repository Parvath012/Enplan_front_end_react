import React from 'react';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';

// Props for the ZoomControls component
type Props = {
  zoomPercentage: number; // Current zoom percentage
  minZoom: number;        // Minimum allowed zoom
  maxZoom: number;        // Maximum allowed zoom
  onZoomChange?: (zoom: number) => void; // Callback when zoom changes
};

// ZoomControls provides slider and buttons to adjust zoom level
const ZoomControls: React.FC<Props> = ({
  zoomPercentage,
  minZoom,
  maxZoom,
  onZoomChange,
}) => {
  // Handles slider value change
  const handleZoomChange = (_: Event, newValue: number | number[]) => {
    if (onZoomChange) onZoomChange(newValue as number);
  };

  // Decrease zoom by 10, not going below minZoom
  const decreaseZoom = () => {
    if (onZoomChange) onZoomChange(Math.max(minZoom, zoomPercentage - 10));
  };

  // Increase zoom by 10, not exceeding maxZoom
  const increaseZoom = () => {
    if (onZoomChange) onZoomChange(Math.min(maxZoom, zoomPercentage + 10));
  };

  return (
    <div className="zoom-group">
      <div className="zoom-controls">
        {/* Button to decrease zoom */}
        <Button
          variant="text"
          size="small"
          onClick={decreaseZoom}
          className="zoom-button"
          disabled={!onZoomChange}
        >
          -
        </Button>
        {/* Slider to select zoom level */}
        <Slider
          size="small"
          value={zoomPercentage}
          min={minZoom}
          max={maxZoom}
          onChange={handleZoomChange}
          aria-label="Zoom Slider"
          className="zoom-slider"
          disabled={!onZoomChange}
        />
        {/* Button to increase zoom */}
        <Button
          variant="text"
          size="small"
          onClick={increaseZoom}
          className="zoom-button"
          disabled={!onZoomChange}
        >
          +
        </Button>
      </div>
      {/* Display current zoom percentage */}
      <span className="zoom-percentage">{zoomPercentage}%</span>
    </div>
  );
};

export default ZoomControls;