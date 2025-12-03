import React from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { ArrowLeft, ArrowRight, Close, Reset, Save, Edit, CheckmarkFilled } from '@carbon/icons-react';
import CustomTooltip from '../common/CustomTooltip';
import { FormHeaderButtonsProps } from '../../types/FormHeaderTypes';

// Base styles to eliminate duplication
const baseButtonStyles = {
  fontSize: '12px',
  textTransform: 'none' as const,
  borderRadius: '4px',
  '& .MuiButton-startIcon': {
    marginRight: '3px',
    marginLeft: 0
  },
  '& .MuiButton-endIcon': {
    marginLeft: '3px',
    marginRight: 0
  }
};

const baseHoverDisabledStyles = {
  '&:hover': {
    color: '#495057',
    backgroundColor: '#f5f5f5'
  },
  '&:disabled': {
    color: '#bdbdbd',
    backgroundColor: 'transparent'
  }
};

// Consolidated button styles
const commonButtonStyles = {
  ...baseButtonStyles,
  color: '#6c757d',
  minWidth: 0,
  p: '3px 6px',
  ...baseHoverDisabledStyles
};

const iconButtonStyles = {
  color: '#6c757d',
  p: '4px',
  ...baseHoverDisabledStyles
};


const nextButtonStyles = {
  ...baseButtonStyles,
  width: '59px',
  height: '22px',
  backgroundColor: 'rgb(40, 40, 38)',
  padding: '0px 10px',
  color: 'rgb(255, 255, 255)',
  minWidth: '59px',
  '&:hover': {
    backgroundColor: 'rgb(30, 30, 28)',
    color: 'rgb(255, 255, 255)'
  },
  '&:disabled': {
    color: 'rgb(255, 255, 255)',
    backgroundColor: '#bdbdbd'
  }
};

// Button factory functions to eliminate duplication
const createButton = (
  onClick: () => void,
  icon: React.ReactElement,
  text: string,
  disabled: boolean,
  styles: any,
  iconPosition: 'start' | 'end' = 'start'
) => (
  <Button
    onClick={onClick}
    {...(iconPosition === 'start' ? { startIcon: icon } : { endIcon: icon })}
    disabled={disabled}
    sx={styles}
  >
    {text}
  </Button>
);

const createIconButton = (
  onClick: () => void,
  icon: React.ReactElement,
  styles: any,
  ariaLabel?: string
) => (
  <IconButton onClick={onClick} sx={styles} aria-label={ariaLabel}>
    {icon}
  </IconButton>
);

const createTooltipButton = (
  title: string,
  button: React.ReactElement
) => (
  <CustomTooltip title={title}>
    {button}
  </CustomTooltip>
);

// Interface is now imported from FormHeaderTypes

const FormHeaderButtons: React.FC<FormHeaderButtonsProps> = ({
  onBack,
  onReset,
  onCancel,
  onSave,
  onNext,
  onEdit,
  showBackButton = false,
  showResetButton = false,
  showCancelButton = false,
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
  useSubmitIcon = false,
  submitButtonText = 'Submit',
}) => {
  // Icon constants to eliminate duplication
  const icons = {
    save: <Save size={16} />,
    reset: <Reset size={16} />,
    cancel: <Close size={16} />,
    edit: <Edit size={16} />,
    next: <ArrowRight size={16} />,
    submit: <CheckmarkFilled size={16} />,
    back: <ArrowLeft size={16} />
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {/* Save Button - Always visible when showSaveButton is true, but disabled when onSave is not provided or when isSaveDisabled is true */}
      {showSaveButton && createButton(
        onSave || (() => {}), // Provide empty function if onSave is not provided to ensure button is always rendered
        icons.save,
        isSaveLoading ? 'Saving...' : saveButtonText,
        !onSave || isSaveDisabled || isSaveLoading, // Disabled if onSave is not provided, or when explicitly disabled, or when loading
        commonButtonStyles
      )}

      {/* Reset Button */}
      {showResetButton && onReset && createButton(
        onReset,
        icons.reset,
        resetButtonText,
        !isFormModified,
        commonButtonStyles
      )}

      {/* Cancel Button */}
      {showCancelButton && onCancel && (
        showCancelIconOnly
          ? createIconButton(onCancel, icons.cancel, iconButtonStyles, 'Cancel')
          : createButton(onCancel, icons.cancel, cancelButtonText, false, commonButtonStyles)
      )}

      {/* Edit Button */}
      {showEditButton && onEdit && createButton(
        onEdit,
        icons.edit,
        editButtonText,
        false,
        commonButtonStyles
      )}

      {/* Next Button */}
      {showNextButton && onNext && createButton(
        onNext,
        useSubmitIcon ? null : icons.next,
        useSubmitIcon ? submitButtonText : nextButtonText,
        isNextDisabled,
        nextButtonStyles,
        'end'
      )}

      {/* Back Button */}
      {showBackButton && onBack && createButton(
        onBack,
        icons.back,
        "Back",
        false,
        commonButtonStyles
      )}
    </Box>
  );
};

export default FormHeaderButtons;
