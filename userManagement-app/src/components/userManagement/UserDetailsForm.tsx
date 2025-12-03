import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { EventsAlt } from '@carbon/icons-react';
import { getUserFormStyles, getHorizontalDividerStyles, getVerticalDividerStyles, getSmallVerticalDividerStyles, getSectionTitleContainerStyles, getFlexBetweenContainerStyles, getActionButtonStyles, getButtonContentStyles, getButtonTextStyles } from './PermissionTableConstants';
import { ReusableTextField, ReusableSelectField, SectionTitle, EmptyFormField } from './UserFormComponents';
import CustomCheckbox from 'commonApp/CustomCheckbox';
import BulkUploadPanel from '../bulkUpload/BulkUploadPanel';
import type { UserFormData } from '../../types/UserFormData';

interface UserDetailsFormProps {
  formData: UserFormData;
  onInputChange: (field: keyof UserFormData, value: string | boolean | string[] | UserFormData['permissions']) => void;
  getErrorProps: (field: keyof UserFormData) => { error: boolean; errorMessage: string };
  dummyRoles: string[];
  dummyDepartments: string[];
  reportingUsersOptions: string[];
  isReadOnly?: boolean;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({
  formData,
  onInputChange,
  getErrorProps,
  dummyRoles,
  dummyDepartments,
  reportingUsersOptions,
  isReadOnly = false
}) => {
  const userFormStyles = getUserFormStyles();
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  return (
    <Box sx={{ ...userFormStyles.formSection, padding: '12px !important' }}>
      <Box sx={{ ...getFlexBetweenContainerStyles(), mb: 0.8 }}>
        <SectionTitle>Basic Details</SectionTitle>
        {!formData.id && (
          <Button 
            sx={getActionButtonStyles()}
            onClick={() => {
              console.log('Bulk Upload button clicked, opening panel');
              setIsBulkUploadOpen(true);
            }}
          >
            <Box sx={getButtonContentStyles()}>
              <EventsAlt width={18} height={18} color="#D0F0FF" />
              <Box component="span" sx={getButtonTextStyles()}>Bulk Upload</Box>
            </Box>
          </Button>
        )}
      </Box>
      
      <Box sx={{ ...userFormStyles.formRow, mb: 3 }}>
        <ReusableTextField 
          field="firstName" 
          label="First Name" 
          placeholder="First Name" 
          value={formData.firstName} 
          onChange={(value: string) => onInputChange('firstName', value)} 
          readOnly={isReadOnly}
          {...getErrorProps('firstName')} 
        />
        <ReusableTextField 
          field="lastName" 
          label="Last Name" 
          placeholder="Last Name" 
          value={formData.lastName} 
          onChange={(value: string) => onInputChange('lastName', value)} 
          readOnly={isReadOnly}
          {...getErrorProps('lastName')} 
        />
        <ReusableTextField 
          field="phoneNumber" 
          label="Phone Number" 
          placeholder="Phone Number" 
          value={formData.phoneNumber} 
          onChange={(value: string) => onInputChange('phoneNumber', value)} 
          readOnly={isReadOnly}
          {...getErrorProps('phoneNumber')} 
        />
      </Box>
      
      <Box sx={{ ...userFormStyles.formRow, mb: 3 }}>
        <ReusableSelectField 
          field="role" 
          label="Role" 
          options={dummyRoles} 
          placeholder="Select Role" 
          value={formData.role} 
          onChange={(value: string) => onInputChange('role', value)} 
          disabled={isReadOnly}
          {...getErrorProps('role')} 
        />
        <ReusableSelectField 
          field="department" 
          label="Department" 
          options={dummyDepartments} 
          placeholder="Select Department" 
          value={formData.department} 
          onChange={(value: string) => onInputChange('department', value)} 
          disabled={isReadOnly}
          {...getErrorProps('department')} 
        />
        <EmptyFormField />
      </Box>

      <Box sx={getHorizontalDividerStyles()} />
      
      <Box sx={{ ...userFormStyles.formRow, mb: 1, position: 'relative' }}>
        <Box sx={userFormStyles.formField}>
          <Box sx={getSectionTitleContainerStyles()}>
            <SectionTitle sx={{ mt: 1, lineHeight: '1' }}>Account Details</SectionTitle>
          </Box>
        </Box>
        <Box sx={userFormStyles.formField}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            height: '16px'
          }}>
            <SectionTitle sx={{ lineHeight: '1', margin: 0 }}>Reporting Details</SectionTitle>
            <Box sx={getSmallVerticalDividerStyles()} />
            <CustomCheckbox 
              label="Self Reporting" 
              checked={formData.selfReporting} 
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => onInputChange('selfReporting', event.target.checked)} 
              disabled={isReadOnly}
              sx={isReadOnly ? {
                '& .MuiCheckbox-root': {
                  cursor: 'default !important',
                  '&:hover': {
                    backgroundColor: 'transparent !important'
                  },
                  '&:hover .custom-checkbox-icon.unchecked': {
                    border: '1px solid #6c757d !important'
                  },
                  '&:hover .custom-checkbox-icon.checked': {
                    border: '1px solid rgba(120, 172, 244, 1) !important',
                    backgroundColor: 'rgba(120, 172, 244, 1) !important'
                  }
                },
                '& .MuiFormControlLabel-root': {
                  cursor: 'default !important'
                },
                '& .MuiFormControlLabel-label': {
                  cursor: 'default !important'
                }
              } : {}}
            />
          </Box>
        </Box>
        <EmptyFormField />
        <Box sx={getVerticalDividerStyles()} />
      </Box>
      
      <Box sx={userFormStyles.formRow}>
        <ReusableTextField 
          field="emailId" 
          label="Email Id" 
          placeholder="Email Id" 
          value={formData.emailId} 
          onChange={(value: string) => onInputChange('emailId', value)} 
          readOnly={true}
          required={false}
          {...getErrorProps('emailId')} 
        />
        <ReusableSelectField 
          field="reportingManager" 
          label="Reporting Manager" 
          options={reportingUsersOptions} 
          placeholder={formData.selfReporting ? "Self" : "Select Reporting Manager"} 
          value={formData.reportingManager} 
          onChange={(value: string) => onInputChange('reportingManager', value)} 
          required={true} 
          disabled={isReadOnly || formData.selfReporting} 
          {...getErrorProps('reportingManager')} 
        />
        <Box sx={{
          flex: '1 1 calc(25% - 18px)',
          minWidth: '200px',
          '@media (max-width: 1199px)': {
            flex: '1 1 calc(50% - 12px)',
          },
          '@media (max-width: 767px)': {
            flex: '1 1 100%',
            minWidth: '0',
            width: '100%',
          },
          // Ensure 8px border-radius for Dotted Line Manager dropdown
          '& .form-field__select': {
            borderRadius: '8px !important',
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px !important',
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '8px !important',
              },
              '& fieldset': {
                borderRadius: '8px !important',
              },
            },
          },
        }}>
          <ReusableSelectField 
            field="dottedLineManager" 
            label="Dotted Line Manager/Project Manager" 
            options={reportingUsersOptions} 
            placeholder={formData.selfReporting ? "" : "Select Dotted Line Manager"} 
            value={formData.dottedLineManager} 
            onChange={(value: string) => onInputChange('dottedLineManager', value)} 
            disabled={isReadOnly || formData.selfReporting} 
            required={false}
            {...getErrorProps('dottedLineManager')} 
          />
        </Box>
      </Box>

      {/* Bulk Upload Panel */}
      <BulkUploadPanel
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
      />
    </Box>
  );
};

export default UserDetailsForm;

