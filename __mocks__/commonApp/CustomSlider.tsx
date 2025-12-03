import React from 'react';

const CustomSlider = ({ value, onChange, min, max, ...props }: any) => {
  return (
    <div data-testid="custom-slider" {...props}>
      <input
        type="range"
        value={value || 0}
        onChange={(e) => onChange?.(parseInt(e.target.value))}
        min={min || 0}
        max={max || 100}
      />
    </div>
  );
};

export default CustomSlider;

