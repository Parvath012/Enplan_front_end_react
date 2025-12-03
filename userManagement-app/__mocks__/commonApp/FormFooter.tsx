import React from 'react';

const FormFooter = ({ onSubmit, onCancel, isSubmitting, submitLabel = 'Submit', cancelLabel = 'Cancel' }: any) => {
  return (
    <div data-testid="form-footer">
      <button data-testid="cancel-button" onClick={onCancel}>
        {cancelLabel}
      </button>
      <button data-testid="submit-button" onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : submitLabel}
      </button>
    </div>
  );
};

export default FormFooter;
