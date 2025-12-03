import React from 'react';
import { ArrowUp, ArrowDown, ArrowsVertical } from '@carbon/icons-react';
import { GridSortDirection } from '@mui/x-data-grid';

/**
 * Props for CustomSortIcon
 * @property direction - Sort direction ('asc', 'desc', or undefined)
 * @property className - Optional CSS class name
 * @property size - Optional icon size (default 12)
 * @property activeColor - Optional active state color (default blue)
 * @property inactiveColor - Optional inactive state color (default gray)
 * @property data-testid - Optional test id for testing purposes
 */
interface CustomSortIconProps {
  direction?: GridSortDirection;
  className?: string;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  'data-testid'?: string;
}

// Custom Sort Icon component with dynamic icon rendering
const CustomSortIcon: React.FC<CustomSortIconProps> = ({
  // Destructure props with default values
  direction,
  className,
  size = 12,
  activeColor = '#1976d2',     // Default active color (blue)
  inactiveColor = '#666',        // Default inactive color (gray)
  'data-testid': dataTestId,
}) => {
  
  // Utility function to generate icon styling based on active state
  const getIconStyle = (isActive: boolean) => ({
    // Dynamic color based on active state
    color: isActive ? activeColor : inactiveColor,
    
    // Consistent padding
    padding: '4px',
    
    // Smooth transition effect
    transition: 'transform 0.2s ease'
  });
  
  // Render Ascending Arrow when sort direction is ascending
  if (direction === 'asc') {
    return (
      <ArrowUp
        // Apply custom class
        className={className}
        
        // Set icon size
        size={size}
        
        // Apply active styling
        style={getIconStyle(true)}
        
        // Forward test id
        data-testid={dataTestId}
      />
    );
  }
  
  // Render Descending Arrow when sort direction is descending
  if (direction === 'desc') {
    return (
      <ArrowDown
        // Apply custom class
        className={className}
        
        // Set icon size
        size={size}
        
        // Apply active styling
        style={getIconStyle(true)}
        
        // Forward test id
        data-testid={dataTestId}
      />
    );
  }
  
  // Render Vertical Arrows when no specific sort direction
  if (direction === undefined || direction === null) {
    return (
      <ArrowsVertical
        // Apply custom class
        className={className}
        
        // Set icon size
        size={size}
        
        // Fixed color for neutral state
        style={{color:'#0051AB'}}
        
        // Forward test id
        data-testid={dataTestId}
      />
    );
  }
  
  // Fallback for invalid direction values
  return (
    <span data-testid={dataTestId} style={{ color: 'red', fontSize: size }}>
      ?
    </span>
  );
};
  
// Export the custom sort icon component as default
export default CustomSortIcon;