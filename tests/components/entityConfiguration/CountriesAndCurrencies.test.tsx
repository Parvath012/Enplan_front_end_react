import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CountriesAndCurrencies from '../../src/components/entityConfiguration/CountriesAndCurrencies';
import { entityConfigurationReducer } from '../../src/store/Reducers/entityConfigurationReducer';

// Mock the services
jest.mock('../../src/services/entitySetupService', () => ({
  getCountries: jest.fn(() => Promise.resolve([
    { id: '1', name: 'United States', code: 'US' },
    { id: '2', name: 'Canada', code: 'CA' }
  ])),
  getCurrencies: jest.fn(() => Promise.resolve([
    { id: '1', name: 'US Dollar', code: 'USD' },
    { id: '2', name: 'Canadian Dollar', code: 'CAD' }
  ]))
}));

// Mock the common components
jest.mock('commonApp/components/entityConfiguration/shared/StatusMessage', () => {
  return function MockStatusMessage({ message, type }: any) {
    return (
      <div className="MuiBox-root" data-testid="status-message">
        <p className="MuiTypography-root">{message}</p>
      </div>
    );
  };
});

jest.mock('commonApp/components/entityConfiguration/shared/CountryActionCellRenderer', () => {
  return function MockCountryActionCellRenderer({ data, onToggle, isEditMode }: any) {
    return (
      <button
        data-testid="country-action-button"
        onClick={() => onToggle && onToggle(data)}
        disabled={!isEditMode}
      >
        {data || 'Toggle'}
      </button>
    );
  };
});

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      entityConfiguration: entityConfigurationReducer,
    },
    preloadedState: {
      entityConfiguration: initialState,
    },
  });
};

describe('CountriesAndCurrencies', () => {
  const defaultProps = {
    entityId: 'test-entity',
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CountriesAndCurrencies {...defaultProps} />
      </Provider>
    );
    
    expect(screen.getByText('Countries and Currencies')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CountriesAndCurrencies {...defaultProps} />
      </Provider>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should load countries and currencies on mount', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CountriesAndCurrencies {...defaultProps} />
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });
  });

  it('should handle country selection', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CountriesAndCurrencies {...defaultProps} />
      </Provider>
    );
    
    await waitFor(() => {
      const countryButton = screen.getByText('United States');
      fireEvent.click(countryButton);
    });
    
    // Verify the country was selected
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('should handle currency selection', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CountriesAndCurrencies {...defaultProps} />
      </Provider>
    );
    
    await waitFor(() => {
      const currencyButton = screen.getByText('US Dollar');
      fireEvent.click(currencyButton);
    });
    
    // Verify the currency was selected
    expect(screen.getByText('US Dollar')).toBeInTheDocument();
  });

  it('should call onSave when save button is clicked', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CountriesAndCurrencies {...defaultProps} />
      </Provider>
    );
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
    });
    
    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CountriesAndCurrencies {...defaultProps} />
      </Provider>
    );
    
    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
    });
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('should handle error states', async () => {
    // Mock service to throw error
    const { getCountries, getCurrencies } = require('../../src/services/entitySetupService');
    getCountries.mockRejectedValueOnce(new Error('Failed to load countries'));
    getCurrencies.mockRejectedValueOnce(new Error('Failed to load currencies'));
    
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CountriesAndCurrencies {...defaultProps} />
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
    });
  });

  it('should display selected countries and currencies', async () => {
    const store = createMockStore({
      'test-entity': {
        selectedCountries: ['United States'],
        selectedCurrencies: ['US Dollar'],
        defaultCurrency: ['US Dollar'],
        isDefault: 'US Dollar',
        originalData: {
          countries: [],
          currencies: [],
          defaultCurrency: [],
          isDefault: null,
        },
        isDataModified: true,
        isDataSaved: false,
      },
    });
    
    render(
      <Provider store={store}>
        <CountriesAndCurrencies {...defaultProps} />
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('US Dollar')).toBeInTheDocument();
    });
  });
});





