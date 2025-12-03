import React from 'react';

interface SharedIconProps {
  size?: number;
  color?: string;
}

/**
 * Shared Icon Component - displays when user is shared/transferred
 */
const SharedIcon: React.FC<SharedIconProps> = ({ size = 16, color = '#5B6061' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M27,25h-6c-1.7,0-3,1.3-3,3v2h2v-2c0-.6.4-1,1-1h6c.6,0,1,.4,1,1v2h2v-2c0-1.7-1.3-3-3-3Z" 
      fill={color}
    />
    <path 
      d="M20,20c0,2.2,1.8,4,4,4s4-1.8,4-4-1.8-4-4-4-4,1.8-4,4ZM26,20c0,1.1-.9,2-2,2s-2-.9-2-2,.9-2,2-2,2,.9,2,2Z" 
      fill={color}
    />
    <path 
      d="M6,21v-1h-2v1c0,3.9,3.1,7,7,7h3v-2h-3c-2.8,0-5-2.2-5-5Z" 
      fill={color}
    />
    <path 
      d="M11,11h-6c-1.7,0-3,1.3-3,3v2h2v-2c0-.6.4-1,1-1h6c.6,0,1,.4,1,1v2h2v-2c0-1.7-1.3-3-3-3Z" 
      fill={color}
    />
    <path 
      d="M8,10c2.2,0,4-1.8,4-4s-1.8-4-4-4-4,1.8-4,4,1.8,4,4,4ZM8,4c1.1,0,2,.9,2,2s-.9,2-2,2-2-.9-2-2,.9-2,2-2Z" 
      fill={color}
    />
    <path 
      d="M27,9v1h2v-1c0-3.9-3.1-7-7-7h-3v2h3c2.8,0,5,2.2,5,5Z" 
      fill={color}
    />
  </svg>
);

export default SharedIcon;

