import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import EntityConfigurationLayout from '../../../src/components/entityConfiguration/EntityConfigurationLayout';

// Mock the useEntityConfiguration hook
const mockUseEntityConfiguration = {
  entityId: 'test-entity-id',
  entity: { id: 'test-entity-id', name: 'Test Entity', type: 'planning' },
  entitiesCount: 5,
  isLoading: false,
  isRollupEntity: false,
  tabValue: 0,
  isEditMode: false,
  progress: 0,
  isSaving: false,
  modulesRef: React.createRef(),
  modulesState: {},
  isDataModified: false,
  isDataSaved: false,
  selectedCountries: [],
  selectedCurrencies: [],
  periodSetup: {},
  handleDataLoaded: jest.fn(),
  handleEdit: jest.fn(),
  handleReset: jest.fn(),
  handleSave: jest.fn(),
  navigateToEntityList: jest.fn(),
  handleNext: jest.fn(),
  handleFinish: jest.fn(),
  handleBack: jest.fn(),
  handleCountriesDataChange: jest.fn(),
  handlePeriodSetupDataChange: jest.fn(),
  handleModulesDataChange: jest.fn(),
  isPeriodSetupMandatoryFieldsFilled: true,
  isPeriodSetupModified: false,
  isNextEnabled: true,
  getHeaderTitle: jest.fn(() => 'Test Entity Configuration')
};

jest.mock('../../../src/components/entityConfiguration/hooks/useEntityConfiguration', () => ({
  useEntityConfiguration: jest.fn(() => mockUseEntityConfiguration)
}));

// Mock the child components
jest.mock('../../../src/components/entityConfiguration/components/NavigationBar', () => {
  return jest.fn(({ tabValue, isRollupEntity, progress, onClose }) => (
    <div data-testid="navigation-bar">
      <div data-testid="tab-value">{tabValue}</div>
      <div data-testid="is-rollup-entity">{isRollupEntity ? 'true' : 'false'}</div>
      <div data-testid="progress">{progress}</div>
      <button data-testid="close-button" onClick={onClose}>Close</button>
    </div>
  ));
});

jest.mock('../../../src/components/entityConfiguration/components/FormHeaderWrapper', () => {
  return jest.fn(({ 
    isEditMode, 
    isNextEnabled, 
    isSaving, 
    tabValue, 
    isDataSaved, 
    selectedCountries, 
    selectedCurrencies, 
    entityId, 
    periodSetup, 
    modulesState, 
    isDataModified, 
    isPeriodSetupMandatoryFieldsFilled, 
    isPeriodSetupModified, 
    isRollupEntity, 
    getHeaderTitle, 
    onBack, 
    onSave, 
    onReset, 
    onEdit, 
    onNext, 
    onFinish 
  }) => (
    <div data-testid="form-header-wrapper">
      <div data-testid="is-edit-mode">{isEditMode ? 'true' : 'false'}</div>
      <div data-testid="is-next-enabled">{isNextEnabled ? 'true' : 'false'}</div>
      <div data-testid="is-saving">{isSaving ? 'true' : 'false'}</div>
      <div data-testid="tab-value">{tabValue}</div>
      <div data-testid="is-data-saved">{isDataSaved ? 'true' : 'false'}</div>
      <div data-testid="entity-id">{entityId}</div>
      <div data-testid="is-data-modified">{isDataModified ? 'true' : 'false'}</div>
      <div data-testid="is-period-setup-mandatory-fields-filled">{isPeriodSetupMandatoryFieldsFilled ? 'true' : 'false'}</div>
      <div data-testid="is-period-setup-modified">{isPeriodSetupModified ? 'true' : 'false'}</div>
      <div data-testid="is-rollup-entity">{isRollupEntity ? 'true' : 'false'}</div>
      <div data-testid="header-title">{getHeaderTitle()}</div>
      <button data-testid="back-button" onClick={onBack}>Back</button>
      <button data-testid="save-button" onClick={onSave}>Save</button>
      <button data-testid="reset-button" onClick={onReset}>Reset</button>
      <button data-testid="edit-button" onClick={onEdit}>Edit</button>
      <button data-testid="next-button" onClick={onNext}>Next</button>
      <button data-testid="finish-button" onClick={onFinish}>Finish</button>
    </div>
  ));
});

jest.mock('../../../src/components/entityConfiguration/components/TabContent', () => {
  return jest.fn(({ 
    tabValue, 
    isRollupEntity, 
    isSaving, 
    isEditMode, 
    entityId, 
    modulesRef, 
    onCountriesDataChange, 
    onCountriesDataLoaded, 
    onPeriodSetupDataChange, 
    onModulesDataChange 
  }) => (
    <div data-testid="tab-content">
      <div data-testid="tab-value">{tabValue}</div>
      <div data-testid="is-rollup-entity">{isRollupEntity ? 'true' : 'false'}</div>
      <div data-testid="is-saving">{isSaving ? 'true' : 'false'}</div>
      <div data-testid="is-edit-mode">{isEditMode ? 'true' : 'false'}</div>
      <div data-testid="entity-id">{entityId}</div>
      <button data-testid="countries-data-change" onClick={() => onCountriesDataChange([])}>Change Countries</button>
      <button data-testid="countries-data-loaded" onClick={() => onCountriesDataLoaded()}>Data Loaded</button>
      <button data-testid="period-setup-data-change" onClick={() => onPeriodSetupDataChange({})}>Change Period Setup</button>
      <button data-testid="modules-data-change" onClick={() => onModulesDataChange({})}>Change Modules</button>
    </div>
  ));
});

// Mock the lazy-loaded CircularLoader
jest.mock('commonApp/CircularLoader', () => {
  return jest.fn(({ variant, backgroundColor, activeColor, speed }) => (
    <div data-testid="circular-loader">
      <div data-testid="variant">{variant}</div>
      <div data-testid="background-color">{backgroundColor}</div>
      <div data-testid="active-color">{activeColor}</div>
      <div data-testid="speed">{speed}</div>
    </div>
  ));
});

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock the styles
jest.mock('../../../src/components/entityConfiguration/styles', () => ({
  entityConfigurationStyles: {
    mainContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
    }
  }
}));

describe('EntityConfigurationLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      expect(screen.getByTestId('form-header-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });

    it('should render with isViewMode prop', () => {
      renderWithRouter(<EntityConfigurationLayout isViewMode={true} />);
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      expect(screen.getByTestId('form-header-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });

    it('should render with isViewMode false', () => {
      renderWithRouter(<EntityConfigurationLayout isViewMode={false} />);
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      expect(screen.getByTestId('form-header-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state when isLoading is true', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        isLoading: true
      });

      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
      expect(screen.getByTestId('variant')).toHaveTextContent('content');
      expect(screen.getByTestId('background-color')).toHaveTextContent('#e0f2ff');
      expect(screen.getByTestId('active-color')).toHaveTextContent('#007bff');
      expect(screen.getByTestId('speed')).toHaveTextContent('1');
    });

    it('should not show main content when loading', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        isLoading: true
      });

      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.queryByTestId('navigation-bar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('form-header-wrapper')).not.toBeInTheDocument();
      expect(screen.queryByTestId('tab-content')).not.toBeInTheDocument();
    });
  });

  describe('Entity Not Found State', () => {
    it('should show entity not found when entityId is missing', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        entityId: null,
        entity: null
      });

      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByText('Entity not found')).toBeInTheDocument();
      expect(screen.getByText('Entity ID: null')).toBeInTheDocument();
      expect(screen.getByText('Available entities: 5')).toBeInTheDocument();
    });

    it('should show entity not found when entity is missing', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        entityId: 'test-entity-id',
        entity: null
      });

      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByText('Entity not found')).toBeInTheDocument();
      expect(screen.getByText('Entity ID: test-entity-id')).toBeInTheDocument();
      expect(screen.getByText('Available entities: 5')).toBeInTheDocument();
    });

    it('should show entity not found when both entityId and entity are missing', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        entityId: null,
        entity: null
      });

      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByText('Entity not found')).toBeInTheDocument();
      expect(screen.getByText('Entity ID: null')).toBeInTheDocument();
      expect(screen.getByText('Available entities: 5')).toBeInTheDocument();
    });
  });

  describe('Component Props Passing', () => {
    it('should pass correct props to NavigationBar', () => {
      const NavigationBar = require('../../../src/components/entityConfiguration/components/NavigationBar');
      renderWithRouter(<EntityConfigurationLayout />);
      
      expect(NavigationBar).toHaveBeenCalledWith(
        expect.objectContaining({
          tabValue: 0,
          isRollupEntity: false,
          progress: 0,
          onClose: mockUseEntityConfiguration.navigateToEntityList
        }),
        expect.any(Object)
      );
    });

    it('should pass correct props to FormHeaderWrapper', () => {
      const FormHeaderWrapper = require('../../../src/components/entityConfiguration/components/FormHeaderWrapper');
      renderWithRouter(<EntityConfigurationLayout />);
      
      expect(FormHeaderWrapper).toHaveBeenCalledWith(
        expect.objectContaining({
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
          isPeriodSetupMandatoryFieldsFilled: true,
          isPeriodSetupModified: false,
          isRollupEntity: false,
          getHeaderTitle: mockUseEntityConfiguration.getHeaderTitle,
          onBack: mockUseEntityConfiguration.handleBack,
          onSave: mockUseEntityConfiguration.handleSave,
          onReset: mockUseEntityConfiguration.handleReset,
          onEdit: mockUseEntityConfiguration.handleEdit,
          onNext: mockUseEntityConfiguration.handleNext,
          onFinish: mockUseEntityConfiguration.handleFinish
        }),
        expect.any(Object)
      );
    });

    it('should pass correct props to TabContent', () => {
      const TabContent = require('../../../src/components/entityConfiguration/components/TabContent');
      renderWithRouter(<EntityConfigurationLayout />);
      
      expect(TabContent).toHaveBeenCalledWith(
        expect.objectContaining({
          tabValue: 0,
          isRollupEntity: false,
          isSaving: false,
          isEditMode: false,
          entityId: 'test-entity-id',
          modulesRef: mockUseEntityConfiguration.modulesRef,
          onCountriesDataChange: mockUseEntityConfiguration.handleCountriesDataChange,
          onCountriesDataLoaded: mockUseEntityConfiguration.handleDataLoaded,
          onPeriodSetupDataChange: mockUseEntityConfiguration.handlePeriodSetupDataChange,
          onModulesDataChange: mockUseEntityConfiguration.handleModulesDataChange
        }),
        expect.any(Object)
      );
    });
  });

  describe('Conditional Rendering', () => {
    it('should not render FormHeaderWrapper when isSaving is true', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        isSaving: true
      });

      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.queryByTestId('form-header-wrapper')).not.toBeInTheDocument();
    });

    it('should render FormHeaderWrapper when isSaving is false', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        isSaving: false
      });

      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByTestId('form-header-wrapper')).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should handle NavigationBar close action', () => {
      renderWithRouter(<EntityConfigurationLayout />);
      const closeButton = screen.getByTestId('close-button');
      fireEvent.click(closeButton);
      expect(mockUseEntityConfiguration.navigateToEntityList).toHaveBeenCalledTimes(1);
    });

    it('should handle FormHeaderWrapper actions', () => {
      renderWithRouter(<EntityConfigurationLayout />);
      
      fireEvent.click(screen.getByTestId('back-button'));
      expect(mockUseEntityConfiguration.handleBack).toHaveBeenCalledTimes(1);
      
      fireEvent.click(screen.getByTestId('save-button'));
      expect(mockUseEntityConfiguration.handleSave).toHaveBeenCalledTimes(1);
      
      fireEvent.click(screen.getByTestId('reset-button'));
      expect(mockUseEntityConfiguration.handleReset).toHaveBeenCalledTimes(1);
      
      fireEvent.click(screen.getByTestId('edit-button'));
      expect(mockUseEntityConfiguration.handleEdit).toHaveBeenCalledTimes(1);
      
      fireEvent.click(screen.getByTestId('next-button'));
      expect(mockUseEntityConfiguration.handleNext).toHaveBeenCalledTimes(1);
      
      fireEvent.click(screen.getByTestId('finish-button'));
      expect(mockUseEntityConfiguration.handleFinish).toHaveBeenCalledTimes(1);
    });

    it('should handle TabContent actions', () => {
      renderWithRouter(<EntityConfigurationLayout />);
      
      fireEvent.click(screen.getByTestId('countries-data-change'));
      expect(mockUseEntityConfiguration.handleCountriesDataChange).toHaveBeenCalledWith([]);
      
      fireEvent.click(screen.getByTestId('countries-data-loaded'));
      expect(mockUseEntityConfiguration.handleDataLoaded).toHaveBeenCalledTimes(1);
      
      fireEvent.click(screen.getByTestId('period-setup-data-change'));
      expect(mockUseEntityConfiguration.handlePeriodSetupDataChange).toHaveBeenCalledWith({});
      
      fireEvent.click(screen.getByTestId('modules-data-change'));
      expect(mockUseEntityConfiguration.handleModulesDataChange).toHaveBeenCalledWith({});
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component unmounting', () => {
      const { unmount } = renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      unmount();
    });

    it('should handle prop changes', () => {
      const { rerender } = renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      
      rerender(<EntityConfigurationLayout isViewMode={true} />);
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing entityId with empty string', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        entityId: '',
        entity: { id: '', name: 'Test Entity', type: 'planning' }
      });

      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      expect(screen.getByTestId('form-header-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });

    it('should handle undefined entityId', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        entityId: undefined,
        entity: { id: undefined, name: 'Test Entity', type: 'planning' }
      });

      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByText('Entity not found')).toBeInTheDocument();
    });

    it('should handle null entityId', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        entityId: null,
        entity: { id: null, name: 'Test Entity', type: 'planning' }
      });

      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByText('Entity not found')).toBeInTheDocument();
    });

    it('should handle empty entity object', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        entityId: 'test-entity-id',
        entity: {}
      });

      renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      expect(screen.getByTestId('form-header-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle useEntityConfiguration hook errors', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockImplementation(() => {
        throw new Error('Hook error');
      });

      expect(() => renderWithRouter(<EntityConfigurationLayout />)).toThrow('Hook error');
    });

    it('should handle missing hook return values', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      useEntityConfiguration.mockReturnValue({});

      expect(() => renderWithRouter(<EntityConfigurationLayout />)).toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      renderWithRouter(<EntityConfigurationLayout />);
      
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      expect(screen.getByTestId('form-header-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });

    it('should have proper button accessibility', () => {
      renderWithRouter(<EntityConfigurationLayout />);
      
      expect(screen.getByTestId('close-button')).toBeInTheDocument();
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      expect(screen.getByTestId('reset-button')).toBeInTheDocument();
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
      expect(screen.getByTestId('finish-button')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should work with different isViewMode values', () => {
      const { rerender } = renderWithRouter(<EntityConfigurationLayout />);
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      
      rerender(<EntityConfigurationLayout isViewMode={true} />);
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
      
      rerender(<EntityConfigurationLayout isViewMode={false} />);
      expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
    });

    it('should handle rapid state changes', () => {
      const { useEntityConfiguration } = require('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
      const { rerender } = renderWithRouter(<EntityConfigurationLayout />);
      
      // Simulate rapid state changes
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        isSaving: true
      });
      rerender(<EntityConfigurationLayout />);
      
      useEntityConfiguration.mockReturnValue({
        ...mockUseEntityConfiguration,
        isSaving: false
      });
      rerender(<EntityConfigurationLayout />);
      
      expect(screen.getByTestId('form-header-wrapper')).toBeInTheDocument();
    });
  });
});
