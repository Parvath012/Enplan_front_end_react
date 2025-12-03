import React from 'react';

const MockCustomSlider = ({ 
  value, 
  min, 
  max, 
  currentValue, 
  leftLabel, 
  rightLabel, 
  disabled, 
  width, 
  height, 
  showCurrentValueMarker, 
  currentValueLabel, 
  trackColor, 
  railColor, 
  thumbColor, 
  labelColor, 
  valueLabelDisplay, 
  className 
}: any) => {
  return (
    <div 
      data-testid="custom-slider"
      data-value={JSON.stringify(value)}
      data-min={min}
      data-max={max}
      data-current-value={currentValue}
      data-left-label={leftLabel}
      data-right-label={rightLabel}
      data-disabled={disabled}
      data-width={width}
      data-height={height}
      data-show-current-value-marker={showCurrentValueMarker}
      data-current-value-label={currentValueLabel}
      data-track-color={trackColor}
      data-rail-color={railColor}
      data-thumb-color={thumbColor}
      data-label-color={labelColor}
      data-value-label-display={valueLabelDisplay}
      className={className}
    >
      <span data-testid="slider-left-label">{leftLabel}</span>
      <span data-testid="slider-right-label">{rightLabel}</span>
      <span data-testid="slider-current-value">{currentValue}</span>
    </div>
  );
};

export default MockCustomSlider;



