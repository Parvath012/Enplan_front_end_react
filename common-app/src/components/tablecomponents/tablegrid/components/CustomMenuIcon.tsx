import React from 'react';
import { SettingsAdjust } from '@carbon/icons-react';
import { IconButton } from '@mui/material';

// Interface defining props for the custom menu icon component
interface CustomMenuIconProps {
  // Optional click event handler
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  // Optional CSS class name for additional styling
  className?: string;

  // Optional custom icon to replace default
  icon?: React.ReactNode;

  // Optional size of the icon (default 12)
  size?: number;

  // Optional active state color (default '#0051AB')
  activeColor?: string;

  // Optional inactive state color (default '#0051AB')
  inactiveColor?: string;
}

// Custom Menu Icon component with configurable properties
const CustomMenuIcon: React.FC<CustomMenuIconProps> = ({
  // Destructure props with default values
  onClick,
  className,
  activeColor = '#0051AB',     // Default active color
  inactiveColor = '#0051AB',   // Default inactive color
  icon,                        // Optional custom icon
  size = 12                    // Default icon size
}) => {
  return (
    // Material UI IconButton with custom configuration
    <IconButton
      // Click event handler
      onClick={onClick}

      // Additional CSS class
      className={className}

      // Small size button
      size="small"

      // Disabled state
      // disabled

      // Inline styles for button
      style={{
        padding: '4px',                   // Consistent padding
        transition: 'transform 0.2s ease' // Smooth transform transition
      }}
    >
      {/* Render custom icon or default SettingsAdjust icon */}
      {icon || (
        <SettingsAdjust
          // Icon size
          size={size}

          // Inline styles for icon
          style={{
            // Commented out dynamic color styling
            // color: inactiveColor, 

            // Active color
            color: activeColor,

            // Rotated icon
            transform: 'rotate(90deg)',

            // Smooth color transition
            transition: 'color 0.2s ease',
          }}
        />
      )}
    </IconButton>
  );
};

// Export the custom menu icon component as default
export default CustomMenuIcon;