import React from 'react';
import { Box, Typography } from '@mui/material';

interface FooterProps {
  // User Management specific props
  totalUsers?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  
  // Role Management specific props
  totalRoles?: number;
  activeRoles?: number;
  inactiveRoles?: number;
  
  // Group Management specific props
  totalGroups?: number;
  activeGroups?: number;
  inactiveGroups?: number;
  
  // Team Members Management specific props
  totalMembers?: number;
  activeMembers?: number;
  inactiveMembers?: number;
  
  // Entity Setup specific props (for backward compatibility)
  count?: number;
  label?: string;
  
  // Common styling props
  height?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: number;
  fontFamily?: string;
  paddingLeft?: number;
  zIndex?: number;
}

const Footer: React.FC<FooterProps> = ({
  // User Management props
  totalUsers,
  activeUsers,
  inactiveUsers,
  
  // Role Management props
  totalRoles,
  activeRoles,
  inactiveRoles,
  
  // Group Management props
  totalGroups,
  activeGroups,
  inactiveGroups,
  
  // Team Members Management props
  totalMembers,
  activeMembers,
  inactiveMembers,
  
  // Entity Setup props (for backward compatibility)
  count,
  label,
  
  // Common styling props
  height = '46px',
  backgroundColor = 'rgba(247, 247, 246, 1)',
  borderColor = 'rgba(240, 239, 239, 1)',
  textColor = '#5B6061',
  fontSize = '12px',
  fontWeight = 400,
  fontFamily = "'InterTight-Regular', 'Inter Tight', sans-serif",
  paddingLeft = 2,
  zIndex = 10,
}) => {
  // Determine which display mode to use
  const isUserManagementMode = totalUsers !== undefined && activeUsers !== undefined && inactiveUsers !== undefined;
  const isRoleManagementMode = totalRoles !== undefined && activeRoles !== undefined && inactiveRoles !== undefined;
  const isGroupManagementMode = totalGroups !== undefined && activeGroups !== undefined && inactiveGroups !== undefined;
  const isTeamMembersMode = totalMembers !== undefined && activeMembers !== undefined && inactiveMembers !== undefined;
  const isEntitySetupMode = count !== undefined && label !== undefined;

  // Extract nested ternary into separate function
  const renderContent = () => {
    if (isTeamMembersMode) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Total Members: {totalMembers}
          </Typography>

          {/* Vertical Divider 1 */}
          <Box
            sx={{
              width: '1px',
              height: '25px',
              backgroundColor: 'rgba(200, 200, 200, 0.5)',
            }}
          />

          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Active Members: {activeMembers}
          </Typography>

          {/* Vertical Divider 2 */}
          <Box
            sx={{
              width: '1px',
              height: '25px',
              backgroundColor: 'rgba(200, 200, 200, 0.5)',
            }}
          />

          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Inactive Members: {inactiveMembers}
          </Typography>
        </Box>
      );
    }
    
    if (isGroupManagementMode) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Total Groups: {totalGroups}
          </Typography>

          {/* Vertical Divider 1 */}
          <Box
            sx={{
              width: '1px',
              height: '25px',
              backgroundColor: 'rgba(200, 200, 200, 0.5)',
            }}
          />

          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Active Groups: {activeGroups}
          </Typography>

          {/* Vertical Divider 2 */}
          <Box
            sx={{
              width: '1px',
              height: '25px',
              backgroundColor: 'rgba(200, 200, 200, 0.5)',
            }}
          />

          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Inactive Groups: {inactiveGroups}
          </Typography>
        </Box>
      );
    }
    
    if (isRoleManagementMode) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Total Roles: {totalRoles}
          </Typography>

          {/* Vertical Divider 1 */}
          <Box
            sx={{
              width: '1px',
              height: '25px',
              backgroundColor: 'rgba(200, 200, 200, 0.5)',
            }}
          />

          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Active Roles: {activeRoles}
          </Typography>

          {/* Vertical Divider 2 */}
          <Box
            sx={{
              width: '1px',
              height: '25px',
              backgroundColor: 'rgba(200, 200, 200, 0.5)',
            }}
          />

          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Inactive Roles: {inactiveRoles}
          </Typography>
        </Box>
      );
    }
    
    if (isUserManagementMode) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Total Users: {totalUsers}
          </Typography>

          {/* Vertical Divider 1 */}
          <Box
            sx={{
              width: '1px',
              height: '25px',
              backgroundColor: 'rgba(200, 200, 200, 0.5)',
            }}
          />

          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Active Users: {activeUsers}
          </Typography>

          {/* Vertical Divider 2 */}
          <Box
            sx={{
              width: '1px',
              height: '25px',
              backgroundColor: 'rgba(200, 200, 200, 0.5)',
            }}
          />

          <Typography
            sx={{
              fontFamily,
              fontWeight,
              fontSize,
              color: textColor,
              textAlign: 'left',
            }}
          >
            Inactive Users: {inactiveUsers}
          </Typography>
        </Box>
      );
    }
    
    if (isEntitySetupMode) {
      return (
        <Typography
          sx={{
            fontFamily,
            fontWeight,
            fontSize,
            color: textColor,
            textAlign: 'left',
          }}
        >
          {label}: {count}
        </Typography>
      );
    }
    
    return null;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height,
        background: 'inherit',
        backgroundColor,
        boxSizing: 'border-box',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor,
        borderLeft: 0,
        borderRadius: 0,
        borderTopLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        boxShadow: 'none',
        fontFamily,
        fontWeight,
        fontSize,
        color: textColor,
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        pl: paddingLeft,
        zIndex,
      }}
    >
      {renderContent()}
    </Box>
  );
};

export default Footer;
