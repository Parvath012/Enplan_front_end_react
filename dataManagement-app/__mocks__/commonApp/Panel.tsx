import React from 'react';

/**
 * Mock Panel component for Jest tests
 * This mock provides a simple implementation of the Panel component
 * to avoid module federation issues during testing
 */

export interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  resetButtonLabel?: string;
  submitButtonLabel?: string;
  onReset?: () => void;
  onSubmit?: () => void;
  showResetButton?: boolean;
  showSubmitButton?: boolean;
  submitButtonDisabled?: boolean;
  className?: string;
  blurClass?: string;
  enableBlur?: boolean;
  additionalBlurSelectors?: string[];
}

const Panel: React.FC<PanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  resetButtonLabel = 'Reset',
  submitButtonLabel = 'Submit',
  onReset,
  onSubmit,
  showResetButton = true,
  showSubmitButton = true,
  submitButtonDisabled = false,
  className = '',
  blurClass = 'panel-blur',
  enableBlur = true,
  additionalBlurSelectors = []
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div data-testid="panel" className={`panel ${className}`}>
      <div className="panel__header">
        <div className="panel__title">{title}</div>
        <button onClick={onClose} className="panel__close-button">Close</button>
      </div>
      <div className="panel__content">
        {children}
      </div>
      {(showResetButton || showSubmitButton) && (
        <div className="panel__actions">
          {showResetButton && (
            <button onClick={onReset} className="panel__reset-button">
              {resetButtonLabel}
            </button>
          )}
          {showSubmitButton && (
            <button 
              onClick={onSubmit} 
              className="panel__submit-button"
              disabled={submitButtonDisabled}
            >
              {submitButtonLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Panel;

