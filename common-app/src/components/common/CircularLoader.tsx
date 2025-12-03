import React from 'react';
import { Box, BoxProps } from '@mui/material';

interface CircularLoaderProps extends Omit<BoxProps, 'size'> {
  size?: number;
  backgroundColor?: string;
  activeColor?: string;
  thickness?: number;
  speed?: number;
  variant?: 'fullscreen' | 'content';
}

const CircularLoader: React.FC<CircularLoaderProps> = ({
  size = 30,
  backgroundColor = '#e0f2ff',
  activeColor = '#007bff',
  thickness = 6,
  speed = 1,
  variant = 'fullscreen',
  sx,
  ...props
}) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${circumference * 0.25} ${circumference * 0.75}`; // 25% visible, 75% gap
  const strokeDashoffset = 0; // Start from the beginning

  const isFullscreen = variant === 'fullscreen';

  return (
    <>
      {/* Backdrop - only for fullscreen variant */}
      {isFullscreen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(240, 239, 239, 1)',
            backdropFilter: 'blur(8px)',
            zIndex: 9998,
          }}
        />
      )}
      
      {/* Loader Container */}
      <Box
        sx={{
          position: isFullscreen ? 'fixed' : 'absolute',
          top: isFullscreen ? '50%' : 0,
          left: isFullscreen ? '50%' : 0,
          transform: isFullscreen ? 'translate(-50%, -50%)' : 'none',
          width: isFullscreen ? size : '100%',
          height: isFullscreen ? size : '100%',
          backgroundColor: isFullscreen ? 'transparent' : 'rgba(240, 239, 239, 0.8)',
          backdropFilter: isFullscreen ? 'none' : 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: isFullscreen ? 9999 : 1000,
          pointerEvents: 'auto',
          ...sx
        }}
        {...props}
      >
        <Box
          sx={{
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{
              transform: 'rotate(90deg)', // Start from bottom left (7 o'clock position)
            }}
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={backgroundColor}
              strokeWidth={thickness}
              strokeLinecap="round"
            />
            
            {/* Active rotating segment */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={activeColor}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              style={{
                animation: `rotate ${2 / speed}s linear infinite`,
                transformOrigin: 'center',
              }}
            />
          </svg>
          
          <style>
            {`
              @keyframes rotate {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </Box>
      </Box>
    </>
  );
};

export default CircularLoader;
