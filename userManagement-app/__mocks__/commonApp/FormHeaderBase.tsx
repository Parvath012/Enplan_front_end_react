import React from 'react';

const FormHeaderBase = ({
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
}: any) => {
  return (
    <div data-testid="form-header-base">
      {title && <h1>{title}</h1>}
      {showBackButton && onBack && <button data-testid="back-button" onClick={onBack}>Back</button>}
      {showResetButton && onReset && <button data-testid="reset-button" onClick={onReset} disabled={!isFormModified}>{resetButtonText}</button>}
      {showCancelButton && onCancel && (
        <button data-testid="cancel-button" onClick={onCancel}>{showCancelIconOnly ? '✕' : cancelButtonText}</button>
      )}
      {showSaveButton && onSave && (
        <button data-testid="save-button" onClick={onSave} disabled={isSaveDisabled || isSaveLoading}>
          {isSaveLoading ? 'Saving...' : saveButtonText}
        </button>
      )}
      {showNextButton && onNext && (
        <button data-testid="next-button" onClick={onNext} disabled={isNextDisabled}>
          {useSubmitIcon ? submitButtonText : nextButtonText}
        </button>
      )}
      {showEditButton && onEdit && <button data-testid="edit-button" onClick={onEdit}>{editButtonText}</button>}
      {statusMessage && <div data-testid="status-message">{statusMessage}</div>}
      {children}
    </div>
  );
};

export default FormHeaderBase;



