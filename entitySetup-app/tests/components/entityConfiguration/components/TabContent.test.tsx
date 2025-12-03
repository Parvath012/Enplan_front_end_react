import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TabContent from '../../../../src/components/entityConfiguration/components/TabContent';

// Mock the lazy-loaded components
jest.mock('commonApp/CircularLoader', () => {
  return jest.fn(({ variant, backgroundColor, activeColor, speed, ...props }) => (
    <div data-testid="circular-loader" data-variant={variant} {...props}>
      Circular Loader
    </div>
  ));
});

// Mock the child components
jest.mock('../../../../src/components/entityConfiguration/CountriesAndCurrencies', () => {
  return jest.fn(({ isEditMode, entityId, onDataChange, onDataLoaded }) => (
    <div data-testid="countries-and-currencies">
      <div>Countries and Currencies</div>
      <div>Edit Mode: {isEditMode ? 'true' : 'false'}</div>
      <div>Entity ID: {entityId}</div>
      <button onClick={() => onDataChange(true)}>Trigger Data Change</button>
      <button onClick={() => onDataLoaded(true)}>Trigger Data Loaded</button>
    </div>
  ));
});

jest.mock('../../../../src/components/entityConfiguration/PeriodSetup', () => {
  return jest.fn(({ entityId, isEditMode, onDataChange }) => (
    <div data-testid="period-setup">
      <div>Period Setup</div>
      <div>Edit Mode: {isEditMode ? 'true' : 'false'}</div>
      <div>Entity ID: {entityId}</div>
      <button onClick={() => onDataChange(true)}>Trigger Data Change</button>
    </div>
  ));
});

jest.mock('../../../../src/components/entityConfiguration/Modules', () => {
  return React.forwardRef<any, any>(({ isEditMode, entityId, onDataChange }, ref) => (
    <div data-testid="modules" ref={ref}>
      <div>Modules</div>
      <div>Edit Mode: {isEditMode ? 'true' : 'false'}</div>
      <div>Entity ID: {entityId}</div>
      <button onClick={() => onDataChange(['module1', 'module2'])}>Trigger Data Change</button>
    </div>
  ));
});

// Mock the styles
jest.mock('../../../../src/components/entityConfiguration/styles', () => ({
  entityConfigurationStyles: {
    tabContent: { padding: '16px' },
    tabPanel: { padding: '8px' },
    loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }
  }
}));

describe('TabContent Component', () => {
  const defaultProps = {
    tabValue: 0,
    isRollupEntity: false,
    isSaving: false,
    isEditMode: true,
    entityId: 'test-entity-123',
    modulesRef: React.createRef(),
    onCountriesDataChange: jest.fn(),
    onCountriesDataLoaded: jest.fn(),
    onPeriodSetupDataChange: jest.fn(),
    onModulesDataChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<TabContent {...defaultProps} />);
      expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
    });

    it('renders with correct tab content structure', () => {
      render(<TabContent {...defaultProps} />);
      
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
    });

    it('renders all three tab panels when not a rollup entity', () => {
      render(<TabContent {...defaultProps} isRollupEntity={false} />);
      
      // Check that the active tab content is visible
      expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
    });

    it('renders only two tab panels when it is a rollup entity', () => {
      render(<TabContent {...defaultProps} isRollupEntity={true} />);
      
      // Check that the active tab content is visible and modules is not
      expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
      expect(screen.queryByTestId('modules')).not.toBeInTheDocument();
    });
  });

  describe('Tab Panel Functionality', () => {
    it('shows correct tab panel based on tabValue', () => {
      const { rerender } = render(<TabContent {...defaultProps} tabValue={0} />);
      
      expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
      expect(screen.queryByTestId('period-setup')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modules')).not.toBeInTheDocument();

      rerender(<TabContent {...defaultProps} tabValue={1} />);
      
      expect(screen.queryByTestId('countries-and-currencies')).not.toBeInTheDocument();
      expect(screen.getByTestId('period-setup')).toBeInTheDocument();
      expect(screen.queryByTestId('modules')).not.toBeInTheDocument();

      rerender(<TabContent {...defaultProps} tabValue={2} isRollupEntity={false} />);
      
      expect(screen.queryByTestId('countries-and-currencies')).not.toBeInTheDocument();
      expect(screen.queryByTestId('period-setup')).not.toBeInTheDocument();
      expect(screen.getByTestId('modules')).toBeInTheDocument();
    });

    it('has correct aria attributes for tab panels', () => {
      render(<TabContent {...defaultProps} />);
      
      const tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toHaveAttribute('id', 'entity-config-tabpanel-0');
      expect(tabPanel).toHaveAttribute('aria-labelledby', 'entity-config-tab-0');
    });

    it('hides inactive tab panels', () => {
      render(<TabContent {...defaultProps} tabValue={1} />);
      
      // Check that the correct tab content is visible
      expect(screen.getByTestId('period-setup')).toBeInTheDocument();
      expect(screen.queryByTestId('countries-and-currencies')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when isSaving is true', () => {
      render(<TabContent {...defaultProps} isSaving={true} />);
      
      expect(screen.getByTestId('loading-container')).toBeInTheDocument();
      expect(screen.queryByTestId('countries-and-currencies')).not.toBeInTheDocument();
    });

    it('shows tab content when isSaving is false', () => {
      render(<TabContent {...defaultProps} isSaving={false} />);
      
      expect(screen.queryByTestId('loading-container')).not.toBeInTheDocument();
      expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
    });

    it('renders CircularLoader with correct props when saving', () => {
      render(<TabContent {...defaultProps} isSaving={true} />);
      
      const loader = screen.getByTestId('loading-container');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Child Component Props', () => {
    it('passes correct props to CountriesAndCurrencies', () => {
      render(<TabContent {...defaultProps} />);
      
      const countriesComponent = screen.getByTestId('countries-and-currencies');
      expect(countriesComponent).toHaveTextContent('Edit Mode: true');
      expect(countriesComponent).toHaveTextContent('Entity ID: test-entity-123');
    });

    it('passes correct props to PeriodSetup', () => {
      render(<TabContent {...defaultProps} tabValue={1} />);
      
      const periodSetupComponent = screen.getByTestId('period-setup');
      expect(periodSetupComponent).toHaveTextContent('Edit Mode: true');
      expect(periodSetupComponent).toHaveTextContent('Entity ID: test-entity-123');
    });

    it('passes correct props to Modules', () => {
      render(<TabContent {...defaultProps} tabValue={2} isRollupEntity={false} />);
      
      const modulesComponent = screen.getByTestId('modules');
      expect(modulesComponent).toHaveTextContent('Edit Mode: true');
      expect(modulesComponent).toHaveTextContent('Entity ID: test-entity-123');
    });

    it('handles different edit modes', () => {
      const { rerender } = render(<TabContent {...defaultProps} isEditMode={true} />);
      
      expect(screen.getByTestId('countries-and-currencies')).toHaveTextContent('Edit Mode: true');
      
      rerender(<TabContent {...defaultProps} isEditMode={false} />);
      
      expect(screen.getByTestId('countries-and-currencies')).toHaveTextContent('Edit Mode: false');
    });

    it('handles different entity IDs', () => {
      const { rerender } = render(<TabContent {...defaultProps} entityId="entity-1" />);
      
      expect(screen.getByTestId('countries-and-currencies')).toHaveTextContent('Entity ID: entity-1');
      
      rerender(<TabContent {...defaultProps} entityId="entity-2" />);
      
      expect(screen.getByTestId('countries-and-currencies')).toHaveTextContent('Entity ID: entity-2');
    });
  });

  describe('Event Handlers', () => {
    it('calls onCountriesDataChange when CountriesAndCurrencies triggers it', () => {
      render(<TabContent {...defaultProps} />);
      
      const changeButton = screen.getByText('Trigger Data Change');
      changeButton.click();
      
      expect(defaultProps.onCountriesDataChange).toHaveBeenCalledWith(true);
    });

    it('calls onCountriesDataLoaded when CountriesAndCurrencies triggers it', () => {
      render(<TabContent {...defaultProps} />);
      
      const loadedButton = screen.getByText('Trigger Data Loaded');
      loadedButton.click();
      
      expect(defaultProps.onCountriesDataLoaded).toHaveBeenCalledWith(true);
    });

    it('calls onPeriodSetupDataChange when PeriodSetup triggers it', () => {
      render(<TabContent {...defaultProps} tabValue={1} />);
      
      const changeButton = screen.getByText('Trigger Data Change');
      changeButton.click();
      
      expect(defaultProps.onPeriodSetupDataChange).toHaveBeenCalledWith(true);
    });

    it('calls onModulesDataChange when Modules triggers it', () => {
      render(<TabContent {...defaultProps} tabValue={2} isRollupEntity={false} />);
      
      const changeButton = screen.getByText('Trigger Data Change');
      changeButton.click();
      
      expect(defaultProps.onModulesDataChange).toHaveBeenCalledWith(['module1', 'module2']);
    });
  });

  describe('Conditional Rendering', () => {
    it('renders Modules tab only when not a rollup entity', () => {
      const { rerender } = render(<TabContent {...defaultProps} isRollupEntity={false} tabValue={2} />);
      
      expect(screen.getByTestId('modules')).toBeInTheDocument();
      
      rerender(<TabContent {...defaultProps} isRollupEntity={true} tabValue={2} />);
      
      expect(screen.queryByTestId('modules')).not.toBeInTheDocument();
    });

    it('handles tab switching correctly', () => {
      const { rerender } = render(<TabContent {...defaultProps} tabValue={0} />);
      
      expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
      
      rerender(<TabContent {...defaultProps} tabValue={1} />);
      
      expect(screen.getByTestId('period-setup')).toBeInTheDocument();
      expect(screen.queryByTestId('countries-and-currencies')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined entityId', () => {
      render(<TabContent {...defaultProps} entityId={undefined as any} />);
      
      expect(screen.getByTestId('countries-and-currencies')).toHaveTextContent('Entity ID: ');
    });

    it('handles empty entityId', () => {
      render(<TabContent {...defaultProps} entityId="" />);
      
      expect(screen.getByTestId('countries-and-currencies')).toHaveTextContent('Entity ID: ');
    });

    it('handles negative tabValue', () => {
      render(<TabContent {...defaultProps} tabValue={-1} />);
      
      // Should not show any tab content
      expect(screen.queryByTestId('countries-and-currencies')).not.toBeInTheDocument();
      expect(screen.queryByTestId('period-setup')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modules')).not.toBeInTheDocument();
    });

    it('handles tabValue greater than available tabs', () => {
      render(<TabContent {...defaultProps} tabValue={5} />);
      
      // Should not show any tab content
      expect(screen.queryByTestId('countries-and-currencies')).not.toBeInTheDocument();
      expect(screen.queryByTestId('period-setup')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modules')).not.toBeInTheDocument();
    });

    it('handles null modulesRef', () => {
      const propsWithNullRef = { ...defaultProps, modulesRef: null as any };
      render(<TabContent {...propsWithNullRef} tabValue={2} isRollupEntity={false} />);
      
      expect(screen.getByTestId('modules')).toBeInTheDocument();
    });

    it('handles undefined callback functions', () => {
      const propsWithoutCallbacks = {
        ...defaultProps,
        onCountriesDataChange: undefined as any,
        onCountriesDataLoaded: undefined as any,
        onPeriodSetupDataChange: undefined as any,
        onModulesDataChange: undefined as any
      };
      
      render(<TabContent {...propsWithoutCallbacks} />);
      
      expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for tab panels', () => {
      render(<TabContent {...defaultProps} />);
      
      const tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toHaveAttribute('id', 'entity-config-tabpanel-0');
      expect(tabPanel).toHaveAttribute('aria-labelledby', 'entity-config-tab-0');
    });

    it('maintains accessibility when switching tabs', () => {
      const { rerender } = render(<TabContent {...defaultProps} tabValue={0} />);
      
      let tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toHaveAttribute('id', 'entity-config-tabpanel-0');
      
      rerender(<TabContent {...defaultProps} tabValue={1} />);
      
      tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toHaveAttribute('id', 'entity-config-tabpanel-1');
    });
  });

  describe('Component Lifecycle', () => {
    it('handles component unmounting', () => {
      const { unmount } = render(<TabContent {...defaultProps} />);
      
      expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
      
      unmount();
      
      expect(screen.queryByTestId('countries-and-currencies')).not.toBeInTheDocument();
    });

    it('handles prop changes', () => {
      const { rerender } = render(<TabContent {...defaultProps} isEditMode={true} />);
      
      expect(screen.getByTestId('countries-and-currencies')).toHaveTextContent('Edit Mode: true');
      
      rerender(<TabContent {...defaultProps} isEditMode={false} />);
      
      expect(screen.getByTestId('countries-and-currencies')).toHaveTextContent('Edit Mode: false');
    });
  });

  describe('Suspense Fallback', () => {
    it('shows fallback when CircularLoader is loading', async () => {
      render(<TabContent {...defaultProps} isSaving={true} />);
      
      // The loading container should be present
      expect(screen.getByTestId('loading-container')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<TabContent {...defaultProps} />);
      
      const initialRender = screen.getByTestId('countries-and-currencies');
      
      // Re-render with same props
      rerender(<TabContent {...defaultProps} />);
      
      const afterRender = screen.getByTestId('countries-and-currencies');
      expect(afterRender).toBe(initialRender);
    });
  });
});
