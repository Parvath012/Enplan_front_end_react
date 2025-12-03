import React from 'react';
import { Box, Slider, Typography } from '@mui/material';
import './CustomSlider.scss';

interface CustomSliderProps {
  value: number[];
  min?: number;
  max?: number;
  currentValue?: number;
  leftLabel?: string;
  rightLabel?: string;
  disabled?: boolean;
  className?: string;
  width?: number;
  height?: number;
  showCurrentValueMarker?: boolean;
  currentValueLabel?: string;
  trackColor?: string;
  railColor?: string;
  thumbColor?: string;
  labelColor?: string;
  onChange?: (event: Event, newValue: number | number[]) => void;
  valueLabelDisplay?: 'on' | 'auto' | 'off';
  step?: number;
  marks?: boolean | Array<{ value: number; label?: string }>;
  orientation?: 'horizontal' | 'vertical';
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  min = 2000,
  max = 2050,
  currentValue,
  leftLabel,
  rightLabel,
  disabled = false,
  className = '',
  width = 420,
  height = 6,
  showCurrentValueMarker = true,
  currentValueLabel = 'CV',
  trackColor = 'rgba(0, 111, 230, 1)',
  railColor = 'rgba(240, 239, 239, 1)',
  thumbColor = '#1976d2',
  labelColor = '#5F6368',
  onChange,
  valueLabelDisplay = 'auto',
  step = 1,
  marks = false,
  orientation = 'horizontal'
}) => {
  // Calculate positions for labels based on slider values
  const getLabelPosition = (val: number) => {
    const sliderRange = max - min;
    const railWidth = width;
    return ((val - min) / sliderRange) * railWidth;
  };

  // Calculate current value position if provided
  const getCurrentValuePosition = () => {
    if (!currentValue) return null;
    const sliderRange = max - min;
    const railWidth = width;
    return ((currentValue - min) / sliderRange) * railWidth;
  };

  const currentValuePos = getCurrentValuePosition();
  
  // Check if slider is active (has blue track)
  const isSliderActive = value && value.length > 0 && trackColor !== 'transparent';

  return (
    <Box className={`custom-slider ${className}`}>
      <Box 
        className="custom-slider__container"
        style={{ width: `${width}px` }}
      >
        <Slider
          value={value}
          disabled={disabled}
          valueLabelDisplay={valueLabelDisplay}
          min={min}
          max={max}
          step={step}
          marks={marks}
          orientation={orientation}
          onChange={onChange}
          className="custom-slider__slider"
          sx={{
            width: `${width - 20}px`,
            height: `${height}px`,
            cursor: 'default',
            '& .MuiSlider-track': {
              backgroundColor: trackColor,
              height: `${height + 4}px`,
            },
            '& .MuiSlider-rail': {
              backgroundColor: railColor,
              width: `${width}px`,
              height: `${height + 4}px`,
            },
            '& .MuiSlider-thumb': {
              backgroundColor: 'white',
              border: '1px solid #1976d2',
              width: '16px',
              height: '16px',
              boxShadow: 'none !important',
              cursor: 'default',
              '&:hover': {
                boxShadow: 'none !important',
                cursor: 'default',
              },
              '&:focus': {
                boxShadow: 'none !important',
                cursor: 'default',
              },
              '&:active': {
                boxShadow: 'none !important',
                cursor: 'default',
              },
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: thumbColor,
              color: 'white',
              fontSize: '12px',
              fontWeight: 500,
            },
          }}
        />
        
        {/* Current Value Marker */}
        {showCurrentValueMarker && currentValue && currentValuePos !== null && (
          <>
            <Box 
              className={`custom-slider__divider ${isSliderActive ? 'custom-slider__divider--active' : ''}`}
              style={{ left: `${currentValuePos}px` }}
            />
            <Typography 
              variant="caption" 
              className="custom-slider__cv-text"
              style={{ 
                left: `${currentValuePos}px`,
                color: labelColor
              }}
            >
              {currentValueLabel}
            </Typography>
          </>
        )}
        
        {/* Dynamic Labels */}
        {leftLabel && (
          <Typography 
            variant="caption" 
            className="custom-slider__thumb-label"
            style={{ 
              left: `${getLabelPosition(value[0])}px`,
              color: labelColor
            }}
          >
            {leftLabel}
          </Typography>
        )}
        {rightLabel && (
          <Typography 
            variant="caption" 
            className="custom-slider__thumb-label"
            style={{ 
              left: `${getLabelPosition(value[1])}px`,
              color: labelColor
            }}
          >
            {rightLabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CustomSlider;
