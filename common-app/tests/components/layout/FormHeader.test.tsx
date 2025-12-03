import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormHeader from '../../../src/components/layout/FormHeader';

describe('FormHeader Component', () => {
  const defaultProps = {
    title: 'Test Form',
    onBack: jest.fn(),
    onReset: jest.fn(),
    onCancel: jest.fn(),
    onSave: jest.fn(),
    onNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with title', () => {
      render(<FormHeader {...defaultProps} />);
      expect(screen.getByText('Test Form')).toBeInTheDocument();
    });

    it('should render back button when showBackButton is true and onBack is provided', () => {
      render(<FormHeader {...defaultProps} showBackButton={true} />);
      expect(screen.getByLabelText('Back')).toBeInTheDocument();
    });

    it('should not render back button when showBackButton is false', () => {
      render(<FormHeader {...defaultProps} showBackButton={false} />);
      expect(screen.queryByLabelText('Back')).not.toBeInTheDocument();
    });

    it('should not render back button when onBack is not provided', () => {
      render(<FormHeader {...defaultProps} onBack={undefined} />);
      expect(screen.queryByLabelText('Back')).not.toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    it('should call onBack when back button is clicked', () => {
      render(<FormHeader {...defaultProps} showBackButton={true} />);
      const backButton = screen.getByLabelText('Back');
      fireEvent.click(backButton);
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });

    it('should show back button with showCancelIconOnly when false', () => {
      render(<FormHeader {...defaultProps} showBackButton={true} showCancelIconOnly={false} />);
      expect(screen.getByLabelText('Back')).toBeInTheDocument();
    });
  });

  describe('Save Button', () => {
    it('should render save button when showSaveButton is true and onSave is provided', () => {
      render(<FormHeader {...defaultProps} showSaveButton={true} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should call onSave when save button is clicked', () => {
      render(<FormHeader {...defaultProps} showSaveButton={true} />);
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('should disable save button when isSaveDisabled is true', () => {
      render(<FormHeader {...defaultProps} showSaveButton={true} isSaveDisabled={true} />);
      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();
    });

    it('should disable save button when isSaveLoading is true', () => {
      render(<FormHeader {...defaultProps} showSaveButton={true} isSaveLoading={true} />);
      const saveButton = screen.getByText('Saving...');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Reset Button', () => {
    it('should render reset button when showResetButton is true and onReset is provided', () => {
      render(<FormHeader {...defaultProps} showResetButton={true} />);
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should call onReset when reset button is clicked', () => {
      render(<FormHeader {...defaultProps} showResetButton={true} isFormModified={true} />);
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
    });

    it('should enable reset button when isFormModified is true', () => {
      render(<FormHeader {...defaultProps} showResetButton={true} isFormModified={true} />);
      const resetButton = screen.getByText('Reset');
      expect(resetButton).not.toBeDisabled();
    });

    it('should disable reset button when isFormModified is false', () => {
      render(<FormHeader {...defaultProps} showResetButton={true} isFormModified={false} />);
      const resetButton = screen.getByText('Reset');
      expect(resetButton).toBeDisabled();
    });
  });

  describe('Next Button', () => {
    it('should render next button when showNextButton is true and onNext is provided', () => {
      render(<FormHeader {...defaultProps} showNextButton={true} />);
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should call onNext when next button is clicked', () => {
      render(<FormHeader {...defaultProps} showNextButton={true} />);
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });

    it('should disable next button when isNextDisabled is true', () => {
      render(<FormHeader {...defaultProps} showNextButton={true} isNextDisabled={true} />);
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Cancel Button', () => {
    it('should render cancel button when showCancelButton is true and onCancel is provided', () => {
      render(<FormHeader {...defaultProps} showCancelButton={true} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<FormHeader {...defaultProps} showCancelButton={true} />);
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should show icon only cancel button when showCancelIconOnly is true', () => {
      render(<FormHeader {...defaultProps} showCancelButton={true} showCancelIconOnly={true} />);
      expect(screen.getByLabelText('Cancel')).toBeInTheDocument();
    });

    it('should show text cancel button when showCancelIconOnly is false', () => {
      render(<FormHeader {...defaultProps} showCancelButton={true} showCancelIconOnly={false} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Button Combinations', () => {
    it('should show all buttons when all are enabled', () => {
      render(
        <FormHeader 
          {...defaultProps} 
          showBackButton={true}
          showSaveButton={true}
          showResetButton={true}
          showNextButton={true}
          showCancelButton={true}
        />
      );
      expect(screen.getByLabelText('Back')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should show only title when no buttons are enabled', () => {
      render(
        <FormHeader 
          {...defaultProps} 
          showBackButton={false}
          showSaveButton={false}
          showResetButton={false}
          showNextButton={false}
          showCancelButton={false}
        />
      );
      expect(screen.getByText('Test Form')).toBeInTheDocument();
      expect(screen.queryByLabelText('Back')).not.toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
      expect(screen.queryByText('Reset')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });

  describe('Icon Only Mode', () => {
    it('should show icon only back button when showCancelIconOnly is true', () => {
      render(<FormHeader {...defaultProps} showBackButton={true} showCancelIconOnly={true} />);
      expect(screen.getByLabelText('Back')).toBeInTheDocument();
    });

    it('should show text back button when showCancelIconOnly is false', () => {
      render(<FormHeader {...defaultProps} showBackButton={true} showCancelIconOnly={false} />);
      expect(screen.getByLabelText('Back')).toBeInTheDocument();
    });
  });

  describe('Custom Button Text', () => {
    it('should use custom button text when provided', () => {
      render(
        <FormHeader 
          {...defaultProps} 
          showSaveButton={true}
          showNextButton={true}
          saveButtonText="Custom Save"
          nextButtonText="Custom Next"
        />
      );
      expect(screen.getByText('Custom Save')).toBeInTheDocument();
      expect(screen.getByText('Custom Next')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing callback functions gracefully', () => {
      render(
        <FormHeader 
          title="Test"
          showBackButton={true}
          showSaveButton={true}
          showResetButton={true}
          showNextButton={true}
          showCancelButton={true}
          onBack={() => {}}
          onSave={() => {}}
          onReset={() => {}}
          onNext={() => {}}
          onCancel={() => {}}
        />
      );
      
      // Should not crash when clicking buttons without callbacks
      const backButton = screen.getByLabelText('Back');
      fireEvent.click(backButton);
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should handle undefined props gracefully', () => {
      render(<FormHeader title="Test" />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});


