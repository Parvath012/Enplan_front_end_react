import React from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography } from '@mui/material';
import { getEntityColors } from '../utils/graphUtils';

interface CustomNodeData {
  label: string;
  entityType: string;
  displayName: string;
  totalDescendantsCount?: number; // Changed to reflect total descendants count
}

interface CustomNodeProps {
  data: CustomNodeData;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const colors = getEntityColors(data.entityType);
  const isRollup = data.entityType?.toLowerCase().includes('rollup');
  
  // Generate two-letter abbreviation from display name
  const getAbbreviation = (name: string) => {
    if (!name) return 'EN';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };



  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 2,
        border: `1px solid ${colors.border}`,
        borderRadius: '6px',
        width: 246,
        height: 80,
        backgroundColor: '#ffffff', // Changed to white for both entity types
        position: 'relative',
        transition: 'all 0.2s ease',
        cursor: 'default' // Remove hand cursor, show normal cursor
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

      {/* Entity icon */}
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          border: `1px solid ${colors.border}`,
          color: colors.border,
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          fontSize: '13px',
          flexShrink: 0,
        }}
      >
        {getAbbreviation(data.displayName)}
      </Box>

      {/* Entity information */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 0.5 }}>
        <Typography
          sx={{
            fontSize: '10px',
            color: '#5F6368',
            fontWeight: 400,
            lineHeight: 1.2
          }}
        >
          {data.displayName}
        </Typography>
        <Typography
          sx={{
            fontSize: '10px',
            color: '#5F6368',
            lineHeight: 1.2,
            fontWeight: 500
          }}
        >
          <span style={{ fontWeight: 700 }}>Entity Type: </span>
          {data.entityType}
        </Typography>
      </Box>

      {/* Endpoint indicator badge for Rollup entities */}
      {isRollup && (
        <Box
          sx={{
            position: 'absolute',
            right: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 17,
            height: 17,
            borderRadius: '50%',
            backgroundColor: data.totalDescendantsCount !== 0 ? colors.border : '#ffffff',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 400,
            fontSize: '9px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 10
          }}
        >
          {data.totalDescendantsCount !== 0 ? `0${data.totalDescendantsCount}` : ''}
        </Box>
      )}

      {/* Purple circle indicator for Planning entities */}
      {!isRollup && (
        <Box
          sx={{
            position: 'absolute',
            right: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 17,
            height: 17,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: `1px solid ${colors.border}`,
            zIndex: 10
          }}
        />
      )}

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

export default CustomNode;
