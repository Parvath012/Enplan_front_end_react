import React from 'react';

interface CircularLoaderProps {
  variant?: string;
  backgroundColor?: string;
  activeColor?: string;
  speed?: number;
}

const CircularLoader: React.FC<CircularLoaderProps> = () => {
  return <div data-testid="mock-circular-loader">Loading...</div>;
};

export default CircularLoader;
