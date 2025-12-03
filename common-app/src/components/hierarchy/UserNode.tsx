import React from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography } from '@mui/material';

export interface UserNodeData {
  label: string;
  fullName: string;
  designation: string;
  department: string;
  totalDescendantsCount?: number;
  borderColor?: string;
  backgroundColor?: string;
}

export interface UserNodeProps {
  data: UserNodeData;
  defaultBorderColor?: string;
}

const UserNode: React.FC<UserNodeProps> = ({ data, defaultBorderColor = '#4285F4' }) => {
  // Generate two-letter abbreviation from full name
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(data.fullName);
  const borderColor = data.borderColor ?? defaultBorderColor;
  const backgroundColor = data.backgroundColor ?? '#ffffff';

  const formatCount = (count: number | undefined): string => {
    if (count === undefined || count === 0) {
      return '';
    }
    return count < 10 ? `0${count}` : `${count}`;
  };

  const hasCount = data.totalDescendantsCount !== undefined && data.totalDescendantsCount !== 0;
  const badgeBackgroundColor = hasCount ? borderColor : '#ffffff';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 2,
        border: `1px solid ${borderColor}`,
        borderRadius: '6px',
        width: 246,
        height: 80,
        backgroundColor: backgroundColor,
        position: 'relative',
        transition: 'all 0.2s ease',
        cursor: 'default'
      }}
    >
      {/* Invisible input handle (left side) - for arrows to connect */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ 
          background: 'transparent', 
          width: 20, 
          height: 20,
          border: 'none',
          opacity: 0
        }}
      />

      {/* Circular profile with initials */}
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          border: `1px solid ${borderColor}`,
          color: borderColor,
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          fontSize: '13px',
          fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          flexShrink: 0,
        }}
      >
        {initials}
      </Box>

      {/* User information */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 0.5 }}>
        <Typography
          sx={{
            fontSize: '10px',
            color: '#5F6368',
            fontWeight: 400,
            lineHeight: 1.2,
            fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}
        >
          {data.fullName}
        </Typography>
        <Typography
          sx={{
            fontSize: '10px',
            color: '#5F6368',
            lineHeight: 1.2,
            fontWeight: 500,
            fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}
        >
          <span style={{ fontWeight: 700 }}>Designation: </span>
          {data.designation ?? 'N/A'}
        </Typography>
        <Typography
          sx={{
            fontSize: '10px',
            color: '#5F6368',
            lineHeight: 1.2,
            fontWeight: 500,
            fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}
        >
          <span style={{ fontWeight: 700 }}>Department: </span>
          {data.department ?? 'N/A'}
        </Typography>
      </Box>

      {/* Count indicator badge - shows number of direct reports */}
      <Box
        sx={{
          position: 'absolute',
          right: -8,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 17,
          height: 17,
          borderRadius: '50%',
          backgroundColor: badgeBackgroundColor,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 400,
          fontSize: '9px',
          fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          border: `1px solid ${borderColor}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          zIndex: 10
        }}
      >
        {formatCount(data.totalDescendantsCount)}
      </Box>

      {/* Invisible output handle (right side) - for arrows to connect */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ 
          background: 'transparent', 
          width: 20, 
          height: 20,
          border: 'none',
          opacity: 0
        }}
      />
    </Box>
  );
};

export default UserNode;

