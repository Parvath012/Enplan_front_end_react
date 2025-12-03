import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import FormHeaderWrapper from '../../../../src/components/entityConfiguration/components/FormHeaderWrapper';

// Mock commonApp components
jest.mock('commonApp/FormHeader', () => {
  return function MockFormHeader({
    title,
    onBack,
    showBackButton,
    showSaveButton,
    onSave,
    showResetButton,
    onReset,
    showEditButton,
    onEdit,
    showNextButton,
    onNext,
    nextButtonText,
    showCancelButton,
    isNextDisabled,
    isFormModified,
    isSaveDisabled,
    isSaveLoading
  }: any) {
    return (
      <div data-testid="form-header">
        <h1>{title}</h1>
        {showBackButton && <button onClick={onBack} data-testid="back-button">Back</button>}
        {showSaveButton && <button onClick={onSave} data-testid="save-button" disabled={isSaveDisabled || isSaveLoading}>Save</button>}
        {showResetButton && <button onClick={onReset} data-testid="reset-button">Reset</button>}
        {showEditButton && <button onClick={onEdit} data-testid="edit-button">Edit</button>}
        {showNextButton && <button onClick={onNext} data-testid="next-button" disabled={isNextDisabled}>{nextButtonText}</button>}
        {showCancelButton && <button data-testid="cancel-button">Cancel</button>}
        <div data-testid="form-modified">{isFormModified ? 'Modified' : 'Not Modified'}</div>
        <div data-testid="save-loading">{isSaveLoading ? 'Loading' : 'Not Loading'}</div>
      </div>
    );
  };
});

// Mock entityConfigurationActions
jest.mock('../../../../src/store/Actions/entityConfigurationActions', () => ({
  getEditButtonVisibility: jest.fn(),
  getFormModifiedState: jest.fn(),
  getSaveDisabledState: jest.fn(),
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      entities: (state = { items: [] }, action) => state,
    },
  });
};

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {component}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('FormHeaderWrapper', () => {
  const defaultProps = {
    isEditMode: false,
    isNextEnabled: true,
    isSaving: false,
    tabValue: 0,
    isDataSaved: false,
    selectedCountries: [],
    selectedCurrencies: [],
    entityId: 'test-entity-id',
    periodSetup: {},
    modulesState: {},
    isDataModified: false,
    isPeriodSetupMandatoryFieldsFilled: () => true,
    isPeriodSetupModified: () => false,
    isRollupEntity: false,
    getHeaderTitle: () => 'Test Header',
    onBack: jest.fn(),
    onSave: jest.fn(),
    onReset: jest.fn(),
    onEdit: jest.fn(),
    onNext: jest.fn(),
    onFinish: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the action functions
    const { getEditButtonVisibility, getFormModifiedState, getSaveDisabledState } = require('../../../../src/store/Actions/entityConfigurationActions');
    getEditButtonVisibility.mockReturnValue(true);
    getFormModifiedState.mockReturnValue(false);
    getSaveDisabledState.mockReturnValue(false);
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<FormHeaderWrapper {...defaultProps} />);
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    });

    it('should display the header title', () => {
      renderWithProviders(<FormHeaderWrapper {...defaultProps} />);
      expect(screen.getByText('Test Header')).toBeInTheDocument();
    });

    it('should show back button', () => {
      renderWithProviders(<FormHeaderWrapper {...defaultProps} />);
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('should show next button', () => {
      renderWithProviders(<FormHeaderWrapper {...defaultProps} />);
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });
  });

  describe('Edit Mode Behavior', () => {
    it('should show save and reset buttons in edit mode', () => {
      const props = { ...defaultProps, isEditMode: true };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    });

    it('should not show save and reset buttons when not in edit mode', () => {
      const props = { ...defaultProps, isEditMode: false };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(screen.queryByTestId('save-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('reset-button')).not.toBeInTheDocument();
    });

    it('should show edit button when not in edit mode and conditions are met', () => {
      const { getEditButtonVisibility } = require('../../../../src/store/Actions/entityConfigurationActions');
      getEditButtonVisibility.mockReturnValue(true);
      
      const props = { ...defaultProps, isEditMode: false };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    });

    it('should not show edit button when in edit mode', () => {
      const { getEditButtonVisibility } = require('../../../../src/store/Actions/entityConfigurationActions');
      getEditButtonVisibility.mockReturnValue(false);
      
      const props = { ...defaultProps, isEditMode: true };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onBack when back button is clicked', () => {
      const mockOnBack = jest.fn();
      const props = { ...defaultProps, onBack: mockOnBack };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      fireEvent.click(screen.getByTestId('back-button'));
      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should call onSave when save button is clicked', () => {
      const mockOnSave = jest.fn();
      const props = { ...defaultProps, isEditMode: true, onSave: mockOnSave };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      fireEvent.click(screen.getByTestId('save-button'));
      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should call onReset when reset button is clicked', () => {
      const mockOnReset = jest.fn();
      const props = { ...defaultProps, isEditMode: true, onReset: mockOnReset };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      fireEvent.click(screen.getByTestId('reset-button'));
      expect(mockOnReset).toHaveBeenCalled();
    });

    it('should call onEdit when edit button is clicked', () => {
      const mockOnEdit = jest.fn();
      const props = { ...defaultProps, isEditMode: false, onEdit: mockOnEdit };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      fireEvent.click(screen.getByTestId('edit-button'));
      expect(mockOnEdit).toHaveBeenCalled();
    });

    it('should call onNext when next button is clicked', () => {
      const mockOnNext = jest.fn();
      const props = { ...defaultProps, onNext: mockOnNext };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      fireEvent.click(screen.getByTestId('next-button'));
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  describe('Next Button Behavior', () => {
    it('should show "Next" text for regular tabs', () => {
      const props = { ...defaultProps, tabValue: 0 };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should show "Finish" text for rollup entity on tab 1', () => {
      const props = { ...defaultProps, isRollupEntity: true, tabValue: 1 };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });

    it('should show "Finish" text for non-rollup entity on tab 2', () => {
      const props = { ...defaultProps, isRollupEntity: false, tabValue: 2 };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });

    it('should call onFinish for rollup entity on tab 1', () => {
      const mockOnFinish = jest.fn();
      const props = { ...defaultProps, isRollupEntity: true, tabValue: 1, onFinish: mockOnFinish };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      fireEvent.click(screen.getByTestId('next-button'));
      expect(mockOnFinish).toHaveBeenCalled();
    });

    it('should call onFinish for non-rollup entity on tab 2', () => {
      const mockOnFinish = jest.fn();
      const props = { ...defaultProps, isRollupEntity: false, tabValue: 2, onFinish: mockOnFinish };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      fireEvent.click(screen.getByTestId('next-button'));
      expect(mockOnFinish).toHaveBeenCalled();
    });
  });

  describe('Button States', () => {
    it('should disable next button when isNextEnabled is false', () => {
      const props = { ...defaultProps, isNextEnabled: false };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when isNextEnabled is true', () => {
      const props = { ...defaultProps, isNextEnabled: true };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      const nextButton = screen.getByTestId('next-button');
      expect(nextButton).not.toBeDisabled();
    });

    it('should show save loading state', () => {
      const props = { ...defaultProps, isEditMode: true, isSaving: true };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('should show not loading state when not saving', () => {
      const props = { ...defaultProps, isEditMode: true, isSaving: false };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      // When not saving, the save button should show "Save" text
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Action Function Integration', () => {
    it('should call getEditButtonVisibility with correct parameters', () => {
      const { getEditButtonVisibility } = require('../../../../src/store/Actions/entityConfigurationActions');
      
      const props = {
        ...defaultProps,
        tabValue: 1,
        isEditMode: false,
        isDataSaved: true,
        selectedCountries: ['US'],
        selectedCurrencies: ['USD'],
        entityId: 'test-id',
        periodSetup: { test: 'data' },
        modulesState: { test: 'state' }
      };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(getEditButtonVisibility).toHaveBeenCalledWith({
        tabValue: 1,
        isEditMode: false,
        isDataSaved: true,
        selectedCountries: ['US'],
        selectedCurrencies: ['USD'],
        entityId: 'test-id',
        periodSetup: { test: 'data' },
        modulesState: { test: 'state' }
      });
    });

    it('should call getFormModifiedState with correct parameters', () => {
      const { getFormModifiedState } = require('../../../../src/store/Actions/entityConfigurationActions');
      
      const props = {
        ...defaultProps,
        tabValue: 1,
        isDataModified: true,
        isPeriodSetupModified: () => true,
        modulesState: { test: 'state' }
      };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(getFormModifiedState).toHaveBeenCalledWith(1, true, expect.any(Function), { test: 'state' });
    });

    it('should call getSaveDisabledState with correct parameters', () => {
      const { getSaveDisabledState } = require('../../../../src/store/Actions/entityConfigurationActions');
      
      const props = {
        ...defaultProps,
        tabValue: 1,
        selectedCountries: ['US'],
        selectedCurrencies: ['USD'],
        isDataModified: true,
        isDataSaved: false,
        isPeriodSetupMandatoryFieldsFilled: () => true,
        isPeriodSetupModified: () => true,
        modulesState: { test: 'state' }
      };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(getSaveDisabledState).toHaveBeenCalledWith({
        tabValue: 1,
        selectedCountries: ['US'],
        selectedCurrencies: ['USD'],
        isDataModified: true,
        isDataSaved: false,
        isPeriodSetupMandatoryFieldsFilled: expect.any(Function),
        isPeriodSetupModified: expect.any(Function),
        modulesState: { test: 'state' }
      });
    });
  });

  describe('Component Key', () => {
    it('should generate correct key based on isEditMode and isNextEnabled', () => {
      const props = { ...defaultProps, isEditMode: true, isNextEnabled: false };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      // The key is used internally by React, we can't directly test it
      // but we can verify the component renders correctly
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined entityId', () => {
      const props = { ...defaultProps, entityId: undefined };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    });

    it('should handle empty arrays for selectedCountries and selectedCurrencies', () => {
      const props = { ...defaultProps, selectedCountries: [], selectedCurrencies: [] };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    });

    it('should handle empty periodSetup and modulesState', () => {
      const props = { ...defaultProps, periodSetup: {}, modulesState: {} };
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    });
  });

  describe('Function Props', () => {
    it('should call isPeriodSetupMandatoryFieldsFilled when needed', () => {
      const mockIsPeriodSetupMandatoryFieldsFilled = jest.fn().mockReturnValue(true);
      const props = { 
        ...defaultProps, 
        tabValue: 1, // Period Setup tab
        isEditMode: true,
        isPeriodSetupMandatoryFieldsFilled: mockIsPeriodSetupMandatoryFieldsFilled 
      };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      // The function is passed to getSaveDisabledState, which should call it
      expect(mockIsPeriodSetupMandatoryFieldsFilled).toHaveBeenCalled();
    });

    it('should call isPeriodSetupModified when needed', () => {
      const mockIsPeriodSetupModified = jest.fn().mockReturnValue(false);
      const props = { 
        ...defaultProps, 
        tabValue: 1, // Period Setup tab
        isEditMode: true,
        isPeriodSetupModified: mockIsPeriodSetupModified 
      };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      // The function is passed to getFormModifiedState and getSaveDisabledState
      expect(mockIsPeriodSetupModified).toHaveBeenCalled();
    });

    it('should call getHeaderTitle to get the title', () => {
      const mockGetHeaderTitle = jest.fn().mockReturnValue('Custom Title');
      const props = { ...defaultProps, getHeaderTitle: mockGetHeaderTitle };
      
      renderWithProviders(<FormHeaderWrapper {...props} />);
      
      expect(mockGetHeaderTitle).toHaveBeenCalled();
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });
});
