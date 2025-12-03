import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowLeft } from '@carbon/icons-react';
import FormHeaderButtons from './FormHeaderButtons';
import { FormHeaderProps } from '../../types/FormHeaderTypes';

// Shared styles to eliminate duplication
const formHeaderContainerStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'white',
  height: 40,
  minHeight: 40,
  maxHeight: 40,
  borderWidth: '0 0 1px 0',
  borderStyle: 'solid',
  borderColor: '#e0e0e0',
  width: '100%',
  padding: '0 12px',
  zIndex: 1000,
  margin: 0,
  flexShrink: 0,
};

const leftSectionStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
};

const backButtonStyles = {
  width: 30,
  height: 30,
  borderRadius: '8px',
  color: '#6c757d',
  backgroundColor: 'transparent',
  '&:hover': { color: '#495057', backgroundColor: '#f0f0f0' },
  p: 0,
};

const titleStyles = {
  fontWeight: 650,
  color: '#3C4043',
  letterSpacing: 0,
  fontSize: '14px',
};

const statusMessageStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
};

const statusTextStyles = {
  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 300,
  fontStyle: 'italic',
  fontSize: '12px',
  color: '#5B6061',
  textAlign: 'left',
};

interface FormHeaderBaseProps extends FormHeaderProps {
  children?: React.ReactNode; // For tabs or other content
}

const FormHeaderBase: React.FC<FormHeaderBaseProps> = ({
  title,
  onBack,
  onReset,
  onCancel,
  onSave,
  onNext,
  onEdit,
  showBackButton = true,
  showResetButton = true,
  showCancelButton = true,
  showSaveButton = false,
  showNextButton = false,
  showEditButton = false,
  resetButtonText = 'Reset',
  cancelButtonText = 'Cancel',
  saveButtonText = 'Save',
  nextButtonText = 'Next',
  editButtonText = 'Edit',
  isFormModified = false,
  isSaveLoading = false,
  isSaveDisabled = false,
  showCancelIconOnly = false,
  isNextDisabled = false,
  statusMessage,
  children,
  useSubmitIcon = false,
  submitButtonText = 'Submit',
}) => {
  return (
    <Box sx={formHeaderContainerStyles}>
      {/* Left section - Back button, title, and children (tabs) */}
      <Box sx={leftSectionStyles}>
        {showBackButton && onBack && (
          <IconButton
            aria-label="Back"
            onClick={onBack}
            sx={backButtonStyles}
          >
            <ArrowLeft size={18} />
          </IconButton>
        )}
        <Typography
          variant="h6"
          component="h1"
          sx={titleStyles}
        >
          {title}
        </Typography>
        {children}
      </Box>
      
      {/* Center section for status message */}
      {statusMessage && (
        <Box sx={statusMessageStyles}>
          <Typography
            variant="body2"
            sx={statusTextStyles}
          >
            {statusMessage}
          </Typography>
        </Box>
      )}
      
      {/* Right section - Action buttons */}
      <FormHeaderButtons
        onBack={onBack}
        onReset={onReset}
        onCancel={onCancel}
        onSave={onSave}
        onNext={onNext}
        onEdit={onEdit}
        showBackButton={false} // Back button is handled separately in FormHeaderBase
        showResetButton={showResetButton}
        showCancelButton={showCancelButton}
        showSaveButton={showSaveButton}
        showNextButton={showNextButton}
        showEditButton={showEditButton}
        resetButtonText={resetButtonText}
        cancelButtonText={cancelButtonText}
        saveButtonText={saveButtonText}
        nextButtonText={nextButtonText}
        editButtonText={editButtonText}
        isFormModified={isFormModified}
        isSaveLoading={isSaveLoading}
        isSaveDisabled={isSaveDisabled}
        showCancelIconOnly={showCancelIconOnly}
        isNextDisabled={isNextDisabled}
        useSubmitIcon={useSubmitIcon}
        submitButtonText={submitButtonText}
      />
    </Box>
  );
};

export default FormHeaderBase;
