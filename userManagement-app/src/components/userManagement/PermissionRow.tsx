import React from 'react';
import { Box } from '@mui/material';
import CustomCheckbox from 'commonApp/CustomCheckbox';

interface PermissionRowProps {
  permission: string;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: () => void;
  key: string;
}

const PermissionRow: React.FC<PermissionRowProps> = ({
  permission,
  isChecked,
  isDisabled,
  onToggle,
  key
}) => {
  return (
    <Box key={key} sx={{
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '12px',
      paddingRight: '12px',
      height: '40px',
      backgroundColor: '#ffffff',
    }}>
      <CustomCheckbox
        checked={isChecked}
        onChange={onToggle}
        label={permission}
        disabled={isDisabled}
        sx={{ 
          '& .MuiFormControlLabel-label': {
            fontFamily: "'InterTight-Regular_Medium', 'Inter Tight Medium', 'Inter Tight', sans-serif",
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: '12px',
            color: '#5F6368',
            marginLeft: '8px',
            wordBreak: 'break-word'
          },
          '& .MuiCheckbox-root': {
            padding: '4px'
          }
        }}
      />
    </Box>
  );
};

export default PermissionRow;
