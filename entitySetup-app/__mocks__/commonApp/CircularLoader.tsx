import React from 'react';

interface CircularLoaderProps {
  variant?: string;
  backgroundColor?: string;
  activeColor?: string;
  speed?: number;
  size?: number;
}

const CircularLoader: React.FC<CircularLoaderProps> = ({ 
  variant, 
  backgroundColor, 
  activeColor, 
  speed, 
  size 
}) => {
  return (
    <div 
      data-testid="circular-loader"
      data-variant={variant}
      data-background-color={backgroundColor}
      data-active-color={activeColor}
      data-speed={speed}
      data-size={size}
    >
      Loading...
    </div>
  );
};

export default CircularLoader;

