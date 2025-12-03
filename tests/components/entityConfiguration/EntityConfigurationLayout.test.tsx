import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import EntityConfigurationLayout from '../../../src/components/entityConfiguration/EntityConfigurationLayout';
import * as useEntityConfigurationHook from '../../../src/components/entityConfiguration/hooks/useEntityConfiguration';

const mockStore = configureStore([]);
const initialState = {
  entities: {
    items: [{ id: '1', name: 'Test Entity', country: 'US', isConfigured: true }],
    isLoading: false,
    error: null,
  },
  entityConfiguration: {
    '1': {
      selectedCountries: ['US'],
      selectedCurrencies: ['USD'],
      defaultCurrency: ['USD'],
      isDefault: 'USD',
      originalData: { countries: ['US'], currencies: ['USD'], defaultCurrency: ['USD'], isDefault: 'USD' },
      isDataModified: false,
      isDataSaved: true,
    },
  },
  periodSetup: {
    '1': {
      data: {
        financialYear: { name: 'FY2024', startMonth: 'Jan', endMonth: 'Dec', historicalDataStartFY: '2023', spanningYears: '1' },
        weekSetup: { name: 'Week', monthForWeekOne: 'Jan', startingDayOfWeek: 'Mon' },
      },
      originalData: {},
      isDataSaved: true,
    },
  },
  modules: {
    isDataSaved: true,
    currentModules: [],
    savedModules: [],
    isDataModified: false,
  },
};

// Mock the useEntityConfiguration hook
jest.mock('../../../src/components/entityConfiguration/hooks/useEntityConfiguration');
const mockUseEntityConfiguration = jest.spyOn(useEntityConfigurationHook, 'useEntityConfiguration');

describe('EntityConfigurationLayout', () => {
  beforeEach(() => {
    mockUseEntityConfiguration.mockReturnValue({
      entityId: '1',
      entity: { id: '1', name: 'Test Entity', country: 'US', isConfigured: true },
      entitiesCount: 1,
      isLoading: false,
      isRollupEntity: false,
      tabValue: 0,
      isEditMode: false,
      progress: 0,
      isSaving: false,
      modulesRef: { current: null },
      modulesState: initialState.modules,
      isDataModified: false,
      isDataSaved: true,
      selectedCountries: initialState.entityConfiguration['1'].selectedCountries,
      selectedCurrencies: initialState.entityConfiguration['1'].selectedCurrencies,
      periodSetup: initialState.periodSetup,
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
      isPeriodSetupMandatoryFieldsFilled: jest.fn(() => true),
      isPeriodSetupModified: jest.fn(() => false),
      isNextEnabled: true,
      getHeaderTitle: jest.fn(() => 'Countries and Currency'),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing when data is loaded', () => {
    render(
      <Provider store={mockStore(initialState)}>
        <Router>
          <EntityConfigurationLayout />
        </Router>
      </Provider>
    );
    expect(screen.getByTestId('navigation-bar')).toBeInTheDocument();
    expect(screen.getByTestId('form-header-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('tab-content')).toBeInTheDocument();
  });

  it('renders CircularLoader when isLoading is true', () => {
    mockUseEntityConfiguration.mockReturnValueOnce({
      ...mockUseEntityConfiguration.mock.results[0].value,
      isLoading: true,
    });
    render(
      <Provider store={mockStore(initialState)}>
        <Router>
          <EntityConfigurationLayout />
        </Router>
      </Provider>
    );
    expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
  });

  it('renders "Entity not found" when entityId or entity is missing', () => {
    mockUseEntityConfiguration.mockReturnValueOnce({
      ...mockUseEntityConfiguration.mock.results[0].value,
      entityId: undefined,
      entity: undefined,
    });
    render(
      <Provider store={mockStore(initialState)}>
        <Router>
          <EntityConfigurationLayout />
        </Router>
      </Provider>
    );
    expect(screen.getByText('Entity not found')).toBeInTheDocument();
  });
});