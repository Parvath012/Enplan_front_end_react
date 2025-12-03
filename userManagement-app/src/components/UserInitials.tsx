import React from 'react';
import { Box } from '@mui/material';

interface UserInitialsProps {
  firstName: string;
  lastName: string;
  size?: number;
  fontSize?: number;
}

const UserInitials: React.FC<UserInitialsProps> = ({ 
  firstName, 
  lastName, 
  size = 24, 
  fontSize = 10 
}) => {
  // Generate two-letter abbreviation from first and last name
  const getInitials = (first: string, last: string) => {
    const firstInitial = first ? first.charAt(0).toUpperCase() : '';
    const lastInitial = last ? last.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  // Generate a consistent color based on the name (same pattern as entity hierarchy)
  const getColorFromName = (first: string, last: string) => {
    const name = `${first}${last}`.toLowerCase();
    const colors = [
      { bg: '#E3F2FD', border: '#2196F3', text: '#1976D2' }, // Light Blue
      { bg: '#F3E5F5', border: '#9C27B0', text: '#7B1FA2' }, // Light Purple
      { bg: '#FFEBEE', border: '#F44336', text: '#D32F2F' }, // Light Red
      { bg: '#E8F5E8', border: '#4CAF50', text: '#388E3C' }, // Light Green
      { bg: '#FFF3E0', border: '#FF9800', text: '#F57C00' }, // Light Orange
      { bg: '#FCE4EC', border: '#E91E63', text: '#C2185B' }, // Light Pink
      { bg: '#F1F8E9', border: '#8BC34A', text: '#689F38' }, // Light Lime
      { bg: '#FFFDE7', border: '#FFEB3B', text: '#F9A825' }, // Light Yellow
      { bg: '#E0F2F1', border: '#009688', text: '#00695C' }, // Light Teal
    ];
    
    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) & 0xffffffff;
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  const initials = getInitials(firstName, lastName);
  const colors = getColorFromName(firstName, lastName);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: 'none',
        color: colors.text,
        backgroundColor: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        fontSize: fontSize,
        flexShrink: 0,
        fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
        lineHeight: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {initials}
    </Box>
  );
};

export default UserInitials;
