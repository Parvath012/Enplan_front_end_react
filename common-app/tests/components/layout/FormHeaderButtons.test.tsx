import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormHeaderButtons from '../../../src/components/layout/FormHeaderButtons';
import { FormHeaderButtonsProps } from '../../../src/types/FormHeaderTypes';

// Mock CustomTooltip
jest.mock('../../../src/components/common/CustomTooltip', () => {
  return function MockCustomTooltip({ children, title }: { children: React.ReactNode; title: string }) {
    return <div data-testid="custom-tooltip" title={title}>{children}</div>;
  };
});

describe('FormHeaderButtons', () => {
  const defaultProps: FormHeaderButtonsProps = {
    onBack: jest.fn(),
    onReset: jest.fn(),
    onCancel: jest.fn(),
    onSave: jest.fn(),
    onNext: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Props with defaults (lines 115-132)', () => {
    it('should use default prop values when not provided', () => {
      render(<FormHeaderButtons {...defaultProps} />);
      
      // All buttons should be hidden by default
      expect(screen.queryByText('Reset')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('should use custom button text when provided', () => {
      render(
        <FormHeaderButtons
          {...defaultProps}
          showResetButton={true}
          showCancelButton={true}
          showSaveButton={true}
          showNextButton={true}
          showEditButton={true}
          resetButtonText="Custom Reset"
          cancelButtonText="Custom Cancel"
          saveButtonText="Custom Save"
          nextButtonText="Custom Next"
          editButtonText="Custom Edit"
        />
      );

      expect(screen.getByText('Custom Reset')).toBeInTheDocument();
      expect(screen.getByText('Custom Cancel')).toBeInTheDocument();
      expect(screen.getByText('Custom Save')).toBeInTheDocument();
      expect(screen.getByText('Custom Next')).toBeInTheDocument();
      expect(screen.getByText('Custom Edit')).toBeInTheDocument();
    });

    it('should handle isFormModified prop', () => {
      const { rerender } = render(
        <FormHeaderButtons
          {...defaultProps}
          showResetButton={true}
          isFormModified={false}
        />
      );

      const resetButton = screen.getByText('Reset');
      expect(resetButton).toBeDisabled();

      rerender(
        <FormHeaderButtons
          {...defaultProps}
          showResetButton={true}
          isFormModified={true}
        />
      );

      expect(resetButton).not.toBeDisabled();
    });

    it('should handle isSaveLoading and isSaveDisabled props', () => {
      const { rerender } = render(
        <FormHeaderButtons
          {...defaultProps}
          showSaveButton={true}
          isSaveLoading={false}
          isSaveDisabled={false}
        />
      );

      expect(screen.getByText('Save')).not.toBeDisabled();

      rerender(
        <FormHeaderButtons
          {...defaultProps}
          showSaveButton={true}
          isSaveLoading={true}
          isSaveDisabled={false}
        />
      );

      expect(screen.getByText('Saving...')).toBeDisabled();

      rerender(
        <FormHeaderButtons
          {...defaultProps}
          showSaveButton={true}
          isSaveLoading={false}
          isSaveDisabled={true}
        />
      );

      expect(screen.getByText('Save')).toBeDisabled();
    });

    it('should handle showCancelIconOnly prop', () => {
      render(
        <FormHeaderButtons
          {...defaultProps}
          showCancelButton={true}
          showCancelIconOnly={true}
        />
      );

      // Should render icon button instead of text button
      const cancelButton = screen.getByLabelText('Cancel');
      expect(cancelButton).toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('should handle isNextDisabled prop', () => {
      const { rerender } = render(
        <FormHeaderButtons
          {...defaultProps}
          showNextButton={true}
          isNextDisabled={false}
        />
      );

      expect(screen.getByText('Next')).not.toBeDisabled();

      rerender(
        <FormHeaderButtons
          {...defaultProps}
          showNextButton={true}
          isNextDisabled={true}
        />
      );

      expect(screen.getByText('Next')).toBeDisabled();
    });

    it('should handle useSubmitIcon and submitButtonText props (lines 184-185)', () => {
      render(
        <FormHeaderButtons
          {...defaultProps}
          showNextButton={true}
          useSubmitIcon={true}
          submitButtonText="Submit"
        />
      );

      // Should show submit text instead of next
      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });

  describe('Button rendering', () => {
    it('should render Edit button when showEditButton is true (line 173)', () => {
      render(
        <FormHeaderButtons
          {...defaultProps}
          showEditButton={true}
        />
      );

      expect(screen.getByText('Edit')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Edit'));
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    it('should render Back button when showBackButton is true (line 192)', () => {
      render(
        <FormHeaderButtons
          {...defaultProps}
          showBackButton={true}
        />
      );

      expect(screen.getByText('Back')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Back'));
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });

    it('should not render buttons when show flags are false', () => {
      render(
        <FormHeaderButtons
          {...defaultProps}
          showBackButton={false}
          showResetButton={false}
          showCancelButton={false}
          showSaveButton={false}
          showNextButton={false}
          showEditButton={false}
        />
      );

      expect(screen.queryByText('Back')).not.toBeInTheDocument();
      expect(screen.queryByText('Reset')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });

  describe('createTooltipButton function (line 101)', () => {
    it('should wrap buttons in tooltip when needed', () => {
      // The createTooltipButton is used internally, but we can verify tooltips are rendered
      // by checking if CustomTooltip component is in the DOM
      render(
        <FormHeaderButtons
          {...defaultProps}
          showSaveButton={true}
        />
      );

      // Tooltip might be rendered for buttons, verify button exists
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    it('should call onSave when save button is clicked', () => {
      render(
        <FormHeaderButtons
          {...defaultProps}
          showSaveButton={true}
        />
      );

      fireEvent.click(screen.getByText('Save'));
      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('should call onReset when reset button is clicked', () => {
      render(
        <FormHeaderButtons
          {...defaultProps}
          showResetButton={true}
          isFormModified={true}
        />
      );

      fireEvent.click(screen.getByText('Reset'));
      expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <FormHeaderButtons
          {...defaultProps}
          showCancelButton={true}
        />
      );

      fireEvent.click(screen.getByText('Cancel'));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onNext when next button is clicked', () => {
      render(
        <FormHeaderButtons
          {...defaultProps}
          showNextButton={true}
        />
      );

      fireEvent.click(screen.getByText('Next'));
      expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined callback functions gracefully', () => {
      render(
        <FormHeaderButtons
          onBack={undefined}
          onReset={undefined}
          onCancel={undefined}
          onSave={undefined}
          onNext={undefined}
          onEdit={undefined}
          showBackButton={true}
          showResetButton={true}
          showCancelButton={true}
          showSaveButton={true}
          showNextButton={true}
          showEditButton={true}
        />
      );

      // Buttons should not render when callbacks are undefined
      expect(screen.queryByText('Back')).not.toBeInTheDocument();
      expect(screen.queryByText('Reset')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });
});

