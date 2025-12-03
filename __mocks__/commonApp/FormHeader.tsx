import React from 'react';

const FormHeader = ({ 
  title, 
  children, 
  isEditMode,
  isNextEnabled,
  isSaving,
  tabValue,
  isDataSaved,
  isDataModified,
  isRollupEntity,
  onBack,
  onSave,
  onReset,
  onEdit,
  onNext,
  onFinish,
  nextButtonText,
  ...props 
}: any) => {
  return (
    <div data-testid="form-header" {...props}>
      {title && <h2>{title}</h2>}
      
      {/* Back Button */}
      {onBack && (
        <button data-testid="back-button" onClick={onBack}>
          Back
        </button>
      )}
      
      {/* Save Button */}
      {onSave && isEditMode && (
        <button data-testid="save-button" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Loading' : 'Save'}
        </button>
      )}
      
      {/* Reset Button */}
      {onReset && isEditMode && (
        <button data-testid="reset-button" onClick={onReset}>
          Reset
        </button>
      )}
      
      {/* Edit Button */}
      {onEdit && !isEditMode && (
        <button data-testid="edit-button" onClick={onEdit}>
          Edit
        </button>
      )}
      
      {/* Next/Finish Button */}
      {onNext && (
        <button 
          data-testid="next-button" 
          onClick={onNext} 
          disabled={!isNextEnabled}
        >
          {nextButtonText || 'Next'}
        </button>
      )}
      
      {children}
    </div>
  );
};

export default FormHeader;
