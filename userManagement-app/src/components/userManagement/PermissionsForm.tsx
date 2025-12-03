import React from 'react';
import { Box } from '@mui/material';
import PermissionsTabLayout from './PermissionsTabLayout';
import type { UserFormData } from '../../types/UserFormData';

interface PermissionsFormProps {
  formData: UserFormData;
  onInputChange: (field: keyof UserFormData, value: string | boolean | string[] | UserFormData['permissions']) => void;
  resetTrigger: number;
  onDuplicateClick?: () => void; // Callback when duplicate button is clicked
}

const PermissionsForm: React.FC<PermissionsFormProps> = ({
  formData,
  onInputChange,
  resetTrigger,
  onDuplicateClick
}) => {
  return (
    <Box sx={{ '& > div': { padding: '12px !important' } }}>
      <PermissionsTabLayout 
        formData={formData} 
        onInputChange={onInputChange} 
        resetTrigger={resetTrigger}
        onDuplicateClick={onDuplicateClick}
      />
    </Box>
  );
};

export default PermissionsForm;

