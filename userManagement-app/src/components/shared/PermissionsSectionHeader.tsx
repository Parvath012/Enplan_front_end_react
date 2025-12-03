import React from 'react';
import { Box, Typography } from '@mui/material';
import { getUserFormStyles } from '../userManagement/PermissionTableConstants';

interface PermissionsSectionHeaderProps {
  title?: string;
  description?: string;
  isReadOnly?: boolean;
  entityType?: 'user' | 'role';
}

const PermissionsSectionHeader: React.FC<PermissionsSectionHeaderProps> = ({
  title = 'Permissions',
  description,
  isReadOnly = false,
  entityType = 'user'
}) => {
  const userFormStyles = getUserFormStyles();
  
  const getDefaultDescription = () => {
    if (isReadOnly) {
      return 'Modules and permissions currently enabled.';
    }
    if (entityType === 'role') {
      return 'Please select the modules and permissions you want to enable for this role.';
    }
    return 'Please select the modules and permissions you want to enable for this user.';
  };

  const defaultDescription = getDefaultDescription();
  const finalDescription = description ?? defaultDescription;

  return (
    <Box sx={{ mt: -0.5 }}>
      <Typography sx={userFormStyles.sectionTitle}>
        {title}
      </Typography>
      <Typography 
        sx={{
          fontFamily: "'InterTight-Regular', 'Inter Tight', sans-serif",
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '11px',
          color: '#777B80',
          textAlign: 'left',
          mt: 0,
          mb: 0
        }}
      >
        {finalDescription}
      </Typography>
    </Box>
  );
};

export default PermissionsSectionHeader;



