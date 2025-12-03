import React from 'react';
import { Locked } from '@carbon/icons-react';
import { IconButton, Box } from '@mui/material';
import { ConditionalTooltipText } from 'commonApp/cellRenderers';

interface RoleNameCellRendererProps {
  params: any;
  searchTerm: string;
}

/**
 * Role Name Cell Renderer Component
 * Displays role name with lock icon if role is locked (assigned to users)
 */
const RoleNameCellRenderer: React.FC<RoleNameCellRendererProps> = ({ params, searchTerm }) => {
  const role = params.data;
  const roleName = role.rolename || 'N/A';
  
  // Normalize isLocked value - check in multiple formats (boolean, string, camelCase)
  const isLockedValue = role.islocked ?? role.isLocked ?? role.IsLocked ?? false;
  const isLocked = 
    isLockedValue === true || 
    isLockedValue === 'true' || 
    isLockedValue === 'True' ||
    isLockedValue === 'TRUE' ||
    String(isLockedValue).toLowerCase() === 'true';
  
  return (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      position: 'relative',
      boxSizing: 'border-box',
      fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
      gap: '6px',
      justifyContent: 'space-between'
    }}>
      {/* Role Name */}
      <div style={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        <ConditionalTooltipText
          text={roleName}
          maxChars={26}
          searchTerm={searchTerm}
        />
      </div>
      
      {/* Lock Icon - Show only if role is locked, positioned at right end */}
      {isLocked && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginLeft: 'auto',
            marginRight: '4px',
          }}
        >
          <IconButton
            size="small"
            disabled={false}
            disableRipple
            disableFocusRipple
            sx={{
              width: '28px',
              height: '20px',
              padding: 0,
              minWidth: '28px',
              backgroundColor: 'rgba(255,255,255,0)',
              border: 'none',
              borderRadius: '4px',
              color: '#5B6061',
              cursor: 'default',
              pointerEvents: 'auto',
              opacity: 1,
              // Remove all hover background effects
              '&:hover': {
                backgroundColor: 'transparent !important',
                cursor: 'default !important',
              },
              '&:hover:not(.Mui-disabled)': {
                backgroundColor: 'transparent !important',
                cursor: 'default !important',
              },
              '&.MuiIconButton-root:hover': {
                backgroundColor: 'transparent !important',
                cursor: 'default !important',
              },
              '&.MuiIconButton-root:hover:not(.Mui-disabled)': {
                backgroundColor: 'transparent !important',
                cursor: 'default !important',
              },
              '&:focus:not(.Mui-disabled)': {
                backgroundColor: 'transparent !important',
                cursor: 'default !important',
              },
              // Additional override to ensure no background
              '&:hover::before': {
                display: 'none !important',
              },
              '&:hover::after': {
                display: 'none !important',
              },
              '&.Mui-disabled:hover': {
                backgroundColor: 'transparent !important',
              },
              // Remove any ripple effects
              '& .MuiTouchRipple-root': {
                display: 'none',
              },
            }}
          >
            <Locked size={14} color="#5B6061" />
          </IconButton>
        </Box>
      )}
    </div>
  );
};

/**
 * Factory function to create role name cell renderer with search term
 */
export const createRoleNameCellRenderer = (searchTerm: string) => {
  return (params: any) => <RoleNameCellRenderer params={params} searchTerm={searchTerm} />;
};

export default RoleNameCellRenderer;

