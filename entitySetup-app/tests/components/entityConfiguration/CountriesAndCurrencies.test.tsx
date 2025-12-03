import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme } from '@mui/material/styles';
import CountriesAndCurrencies from '../../../src/components/entityConfiguration/CountriesAndCurrencies';

// Mock the services and external dependencies
jest.mock('../../../src/services/countryStateService', () => ({
  fetchCountryStateMap: jest.fn(),
}));

jest.mock('../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies', () => ({
  useCountriesAndCurrencies: jest.fn(),
}));

// Mock child components with proper prop handling
jest.mock('../../../src/components/entityConfiguration/countries/CountriesList', () => 
  ({ isLoadingCountries, allCountries, ...props }: any) => (
    <div data-testid="countries-list">
      {isLoadingCountries ? 'Loading Countries...' : `Countries: ${allCountries?.join(', ') || 'None'}`}
    </div>
  )
);

jest.mock('../../../src/components/entityConfiguration/countries/SelectedCountriesGrid', () => 
  ({ selectedCountries, ...props }: any) => (
    <div data-testid="selected-countries">
      Selected: {selectedCountries?.join(', ') || 'None'}
    </div>
  )
);

jest.mock('../../../src/components/entityConfiguration/currencies/CurrenciesList', () => 
  ({ currenciesLoading, currencies, selectedCurrencies, ...props }: any) => (
    <div data-testid="currencies-list">
      {currenciesLoading ? 'Loading Currencies...' : `Currencies: ${currencies?.map((c: any) => c.currencyName).join(', ') || 'None'}`}
      <div>Selected: {selectedCurrencies?.join(', ') || 'None'}</div>
    </div>
  )
);

jest.mock('../../../src/components/entityConfiguration/countries/CountriesList', () => ({
  __esModule: true,
  default: function MockCountriesList(props: any) {
    return <div data-testid="countries-list">Countries List</div>;
  },
}));

jest.mock('../../../src/components/entityConfiguration/currencies/CurrenciesList', () => ({
  __esModule: true,
  default: function MockCurrenciesList(props: any) {
    return <div data-testid="currencies-list">Currencies List</div>;
  },
}));

jest.mock('../../../src/components/entityConfiguration/shared/StatusMessage', () => ({
  __esModule: true,
  default: function MockStatusMessage(props: any) {
    return <div data-testid="status-message">Status Message</div>;
  },
}));

jest.mock('../../../src/components/entityConfiguration/shared/CountryActionCellRenderer', () => ({
  __esModule: true,
  default: function MockCountryActionCellRenderer(props: any) {
    return <div data-testid="country-action-cell">Country Action Cell</div>;
  },
}));

// Create a mock store
const createMockStore = (entityState = {}, entitiesState = { items: [] }) => {
  return configureStore({
    reducer: {
      entityConfiguration: (state = entityState, action) => state,
      entities: (state = entitiesState, action) => state,
    },
    preloadedState: {
      entityConfiguration: entityState,
      entities: entitiesState,
    },
  });
};

const theme = createTheme();

const renderWithProviders = (
  ui: React.ReactElement,
  options: { initialState?: InitialState } = {}
) => {
  const { initialState = {} } = options;
  const store = createMockStore(
    initialState.entityConfiguration || {},
    initialState.entities || { items: [] }
  );
  
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    </Provider>
  );
};

describe('CountriesAndCurrencies', () => {
  const defaultEntityId = 'test-entity';
  const defaultProps = {
    isEditMode: true,
    entityId: defaultEntityId,
    onDataChange: jest.fn(),
    onDataLoaded: jest.fn(),
  };

  const mockHookReturn = {
    countrySearch: '',
    setCountrySearch: jest.fn(),
    currencySearch: '',
    setCurrencySearch: jest.fn(),
    allCountries: [],
    setAllCountries: jest.fn(),
    isLoadingCountries: false,
    setIsLoadingCountries: jest.fn(),
    hasFetchedData: false,
    isLoadingData: false,
    setIsLoadingData: jest.fn(),
    currenciesFetchedRef: { current: false },
    fetchSavedData: jest.fn(),
    handleCountryToggle: jest.fn(),
    handleCurrencyToggle: jest.fn(),
    handleSetDefaultCurrency: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: { pathname: `/entity/${defaultEntityId}` },
      writable: true,
    });

    // Default mock for useCountriesAndCurrencies
    useCountriesAndCurrencies.mockReturnValue(mockHookReturn);

    // Default mock for fetchCountryStateMap
    fetchCountryStateMap.mockResolvedValue({
      'United States': { states: ['NY', 'CA'], currencies: ['USD'] },
      'Canada': { states: ['ON', 'BC'], currencies: ['CAD'] },
    });
  });

  it('shows loading spinner when isLoadingData is true', () => {
    useCountriesAndCurrencies.mockReturnValue({
      ...mockHookReturn,
      isLoadingData: true,
    });

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />);
    
    expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    expect(screen.getByText('Loading Spinner')).toBeInTheDocument();
  });

  it('renders info message and all components when not loading', () => {
    const initialState: InitialState = {
      entityConfiguration: {
        [defaultEntityId]: {
          selectedCountries: ['United States'],
          selectedCurrencies: ['USD'],
          defaultCurrency: ['CAD'],
          isDefault: 'USD',
          isDataModified: false,
        },
      },
      entities: {
        items: [{ 
          id: defaultEntityId, 
          country: 'United States', 
          currencies: { defaultCurrency: ['CAD'], selectedCurrencies: ['USD'], isDefault: 'USD' } 
        }],
      },
    };

    useCountriesAndCurrencies.mockReturnValue({
      ...mockHookReturn,
      allCountries: ['United States', 'Canada'],
      isLoadingData: false,
      hasFetchedData: true,
    });

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />, { initialState });

    expect(screen.getByText(/Please select all the countries/)).toBeInTheDocument();
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByTestId('selected-countries')).toBeInTheDocument();
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
    expect(screen.getByTestId('selected-currencies-grid')).toBeInTheDocument();
  });

  it('shows loading state for countries and currencies when isLoadingCountries is true', () => {
    useCountriesAndCurrencies.mockReturnValue({
      ...mockHookReturn,
      isLoadingCountries: true,
    });

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />);

    expect(screen.getByText('Loading Countries...')).toBeInTheDocument();
    expect(screen.getByText('Loading Currencies...')).toBeInTheDocument();
  });

  it('calls onDataChange when isDataModified changes', () => {
    const onDataChange = jest.fn();
    const initialState: InitialState = {
      entityConfiguration: {
        [defaultEntityId]: {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          isDataModified: true,
        },
      },
    };

    renderWithProviders(
      <CountriesAndCurrencies {...defaultProps} onDataChange={onDataChange} />,
      { initialState }
    );

    expect(onDataChange).toHaveBeenCalledWith(true);
  });

  it('calls onDataLoaded when data is loaded and has data', () => {
    const onDataLoaded = jest.fn();
    const initialState: InitialState = {
      entityConfiguration: {
        [defaultEntityId]: {
          selectedCountries: ['United States'],
          selectedCurrencies: ['USD'],
          defaultCurrency: [],
          isDefault: null,
          isDataModified: false,
        },
      },
    };

    useCountriesAndCurrencies.mockReturnValue({
      ...mockHookReturn,
      hasFetchedData: true,
    });

    renderWithProviders(
      <CountriesAndCurrencies {...defaultProps} onDataLoaded={onDataLoaded} />,
      { initialState }
    );

    expect(onDataLoaded).toHaveBeenCalledWith(true);
  });

  it('handles empty Redux state gracefully', () => {
    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />);

    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
    expect(screen.getByText('Selected: None')).toBeInTheDocument();
  });

  it('loads countries and currencies from service on mount', async () => {
    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />);

    await waitFor(() => {
      expect(fetchCountryStateMap).toHaveBeenCalled();
    });
  });

  it('handles entity with currencies object', () => {
    const initialState: InitialState = {
      entityConfiguration: {
        [defaultEntityId]: {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          isDataModified: false,
        },
      },
      entities: {
        items: [{ 
          id: defaultEntityId, 
          country: 'United States',
          currencies: {
            defaultCurrency: ['EUR'],
            selectedCurrencies: ['GBP'],
            isDefault: 'EUR'
          }
        }],
      },
    };

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />, { initialState });

    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
  });

  it('handles entity with currencies string', () => {
    const initialState: InitialState = {
      entityConfiguration: {
        [defaultEntityId]: {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          isDataModified: false,
        },
      },
      entities: {
        items: [{ 
          id: defaultEntityId, 
          country: 'United States',
          currencies: '{"defaultCurrency":["EUR"],"selectedCurrencies":["GBP"],"isDefault":"EUR"}'
        }],
      },
    };

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />, { initialState });

    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
  });

  it('handles malformed currencies JSON gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const initialState: InitialState = {
      entityConfiguration: {
        [defaultEntityId]: {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          isDataModified: false,
        },
      },
      entities: {
        items: [{ 
          id: defaultEntityId, 
          country: 'United States',
          currencies: '{"malformed": json'
        }],
      },
    };

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />, { initialState });

    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('handles fetchCountryStateMap error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetchCountryStateMap.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />);

    await waitFor(() => {
      expect(fetchCountryStateMap).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('combines selectedCurrencies, defaultCurrency, and isDefault correctly', () => {
    const initialState: InitialState = {
      entityConfiguration: {
        [defaultEntityId]: {
          selectedCountries: [],
          selectedCurrencies: ['USD', 'EUR'],
          defaultCurrency: ['CAD'],
          isDefault: 'GBP',
          isDataModified: false,
        },
      },
    };

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />, { initialState });

    // Should combine all unique currencies: USD, EUR, CAD, GBP
    expect(screen.getByText(/Selected: USD, EUR, CAD, GBP/)).toBeInTheDocument();
  });

  it('handles no entity ID in URL', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/some/other/path' },
      writable: true,
    });

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />);

    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
  });

  it('handles entity not found in Redux state', () => {
    const initialState: InitialState = {
      entityConfiguration: {},
      entities: { items: [] },
    };

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />, { initialState });

    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
  });

  it('processes currencies correctly from country data', async () => {
    fetchCountryStateMap.mockResolvedValue({
      'United States': { states: ['NY'], currencies: ['USD', 'EUR'] },
      'Canada': { states: ['ON'], currencies: ['CAD'] },
    });

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />);

    await waitFor(() => {
      expect(fetchCountryStateMap).toHaveBeenCalled();
    });
  });

  it('handles edit mode correctly', () => {
    renderWithProviders(<CountriesAndCurrencies {...defaultProps} isEditMode={false} />);

    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
  });

  it('handles missing onDataChange and onDataLoaded props', () => {
    const { onDataChange, onDataLoaded, ...propsWithoutCallbacks } = defaultProps;
    
    renderWithProviders(<CountriesAndCurrencies {...propsWithoutCallbacks} />);

    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
  });

  // Additional tests for better coverage
  it('handles entityId change', () => {
    const { rerender } = renderWithProviders(<CountriesAndCurrencies {...defaultProps} />);
    
    // Change entityId
    rerender(
      <Provider store={createMockStore()}>
        <ThemeProvider theme={theme}>
          <CountriesAndCurrencies {...defaultProps} entityId="new-entity" />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
  });

  it('handles undefined entityId', () => {
    const { entityId, ...propsWithoutEntityId } = defaultProps;
    
    renderWithProviders(<CountriesAndCurrencies {...propsWithoutEntityId} />);

    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
  });

  it('handles empty currencies array', () => {
    const initialState: InitialState = {
      entityConfiguration: {
        [defaultEntityId]: {
          selectedCountries: ['USA'],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          isDataModified: false,
        },
      },
    };

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />, { initialState });

    expect(screen.getByText('Selected: None')).toBeInTheDocument();
  });

  it('handles null entity', () => {
    const initialState: InitialState = {
      entityConfiguration: {
        [defaultEntityId]: {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          isDataModified: false,
        },
      },
      entities: {
        items: [],
      },
    };

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />, { initialState });

    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
  });

  it('handles auto-selection ref reset on entityId change', () => {
    useCountriesAndCurrencies.mockReturnValue({
      ...mockHookReturn,
      currenciesFetchedRef: { current: true },
    });

    const { rerender } = renderWithProviders(<CountriesAndCurrencies {...defaultProps} />);
    
    // Change entityId to trigger useEffect
    rerender(
      <Provider store={createMockStore()}>
        <ThemeProvider theme={theme}>
          <CountriesAndCurrencies {...defaultProps} entityId="different-entity" />
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
  });

  it('handles console.log for debug output', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    const initialState: InitialState = {
      entities: {
        items: [{ 
          id: defaultEntityId, 
          country: 'United States',
          currencies: { test: 'data' }
        }],
      },
    };

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />, { initialState });

    expect(consoleSpy).toHaveBeenCalledWith(
      'About to calculate prePopulatedCurrencies, entity:',
      expect.objectContaining({ id: defaultEntityId })
    );
    
    consoleSpy.mockRestore();
  });

  it('verifies all props are passed to child components', () => {
    const initialState: InitialState = {
      entityConfiguration: {
        [defaultEntityId]: {
          selectedCountries: ['USA'],
          selectedCurrencies: ['USD'],
          defaultCurrency: ['EUR'],
          isDefault: 'GBP',
          isDataModified: false,
        },
      },
      entities: {
        items: [{ 
          id: defaultEntityId, 
          country: 'USA',
        }],
      },
    };

    useCountriesAndCurrencies.mockReturnValue({
      ...mockHookReturn,
      allCountries: ['USA'],
    });

    renderWithProviders(<CountriesAndCurrencies {...defaultProps} />, { initialState });

    expect(screen.getByText('Countries: USA')).toBeInTheDocument();
    expect(screen.getByText('Selected: USA')).toBeInTheDocument();
    expect(screen.getByText(/Selected: USD, EUR, GBP/)).toBeInTheDocument();
    expect(screen.getByText('Grid: USD, EUR, GBP')).toBeInTheDocument();
  });
});
