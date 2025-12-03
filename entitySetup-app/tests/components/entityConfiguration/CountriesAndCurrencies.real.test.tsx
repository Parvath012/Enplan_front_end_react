import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import CountriesAndCurrencies from '../../../src/components/entityConfiguration/CountriesAndCurrencies';

// Mock the lazy-loaded components
jest.mock('commonApp/CircularLoader', () => ({
  __esModule: true,
  default: function MockCircularLoader(props: any) {
    return <div data-testid="circular-loader">Loading...</div>;
  }
}));

// Mock the child components
jest.mock('../../../src/components/entityConfiguration/countries/CountriesList', () => ({
  __esModule: true,
  default: function MockCountriesList(props: any) {
    return (
      <div data-testid="countries-list">
        <div>Countries List</div>
        <div>Search: {props.countrySearch}</div>
        <div>Selected: {props.selectedCountries.join(', ')}</div>
        <div>Pre-populated: {props.prePopulatedCountries.join(', ')}</div>
        <div>Edit Mode: {props.isEditMode ? 'Yes' : 'No'}</div>
        <div>Loading: {props.isLoadingCountries ? 'Yes' : 'No'}</div>
      </div>
    );
  }
}));

jest.mock('../../../src/components/entityConfiguration/countries/SelectedCountriesGrid', () => ({
  __esModule: true,
  default: function MockSelectedCountriesGrid(props: any) {
    return (
      <div data-testid="selected-countries-grid">
        <div>Selected Countries Grid</div>
        <div>Selected: {props.selectedCountries.join(', ')}</div>
        <div>Pre-populated: {props.prePopulatedCountries.join(', ')}</div>
        <div>Edit Mode: {props.isEditMode ? 'Yes' : 'No'}</div>
      </div>
    );
  }
}));

jest.mock('../../../src/components/entityConfiguration/currencies/CurrenciesList', () => ({
  __esModule: true,
  default: function MockCurrenciesList(props: any) {
    return (
      <div data-testid="currencies-list">
        <div>Currencies List</div>
        <div>Search: {props.currencySearch}</div>
        <div>Selected: {props.selectedCurrencies.join(', ')}</div>
        <div>Pre-populated: {props.prePopulatedCurrencies.join(', ')}</div>
        <div>Default Currency: {props.defaultCurrency.join(', ')}</div>
        <div>Is Default: {props.isDefault || 'None'}</div>
        <div>Edit Mode: {props.isEditMode ? 'Yes' : 'No'}</div>
        <div>Loading: {props.currenciesLoading ? 'Yes' : 'No'}</div>
      </div>
    );
  }
}));

jest.mock('../../../src/components/entityConfiguration/currencies/SelectedCurrenciesGrid', () => ({
  __esModule: true,
  default: function MockSelectedCurrenciesGrid(props: any) {
    return (
      <div data-testid="selected-currencies-grid">
        <div>Selected Currencies Grid</div>
        <div>Selected: {props.selectedCurrencies.join(', ')}</div>
        <div>Pre-populated: {props.prePopulatedCurrencies.join(', ')}</div>
        <div>Default Currency: {props.defaultCurrency.join(', ')}</div>
        <div>Is Default: {props.isDefault || 'None'}</div>
        <div>Edit Mode: {props.isEditMode ? 'Yes' : 'No'}</div>
      </div>
    );
  }
}));

// Mock the custom hook
jest.mock('../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies', () => ({
  useCountriesAndCurrencies: jest.fn()
}));

// Mock the services
jest.mock('../../../src/services/countryStateService', () => ({
  fetchCountryStateMap: jest.fn()
}));

// Mock Redux actions
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: jest.fn()
}));

// Mock window.location
const mockLocation = {
  pathname: '/entity-setup/test-entity-id'
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('CountriesAndCurrencies - Real Component Tests', () => {
  let mockStore: any;
  let mockUseSelector: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset window.location
    window.location.pathname = '/entity-setup/test-entity-id';
    
    // Mock useSelector
    mockUseSelector = require('react-redux').useSelector as jest.Mock;
    
    // Mock useSelector to return the correct state structure
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: {
          loading: false,
          modules: [],
          error: null
        },
        entityConfiguration: {
          'test-entity-id': {
            selectedCountries: ['Country1', 'Country2'],
            selectedCurrencies: ['USD', 'EUR'],
            defaultCurrency: ['USD'],
            isDefault: 'USD',
            isDataModified: false
          }
        },
        entities: {
          items: [{
            id: 'test-entity-id',
            country: 'Country1',
            currencies: JSON.stringify({
              defaultCurrency: ['USD'],
              selectedCurrencies: ['EUR'],
              isDefault: 'USD'
            })
          }]
        }
      };
      return selector(state);
    });
    
    // Mock store
    mockStore = configureStore({
      reducer: {
        entitySetup: () => ({ 
          loading: false,
          modules: [],
          error: null
        }),
        entityConfiguration: () => ({
          'test-entity-id': {
            selectedCountries: ['Country1', 'Country2'],
            selectedCurrencies: ['USD', 'EUR'],
            defaultCurrency: ['USD'],
            isDefault: 'USD',
            isDataModified: false
          }
        }),
        entities: () => ({
          items: [{
            id: 'test-entity-id',
            country: 'Country1',
            currencies: JSON.stringify({
              defaultCurrency: ['USD'],
              selectedCurrencies: ['EUR'],
              isDefault: 'USD'
            })
          }]
        })
      }
    });
    
    // Mock useCountriesAndCurrencies hook
    const { useCountriesAndCurrencies } = require('../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies');
    useCountriesAndCurrencies.mockReturnValue({
      countrySearch: 'test-country-search',
      setCountrySearch: jest.fn(),
      currencySearch: 'test-currency-search',
      setCurrencySearch: jest.fn(),
      allCountries: ['Country1', 'Country2', 'Country3'],
      setAllCountries: jest.fn(),
      isLoadingCountries: false,
      setIsLoadingCountries: jest.fn(),
      hasFetchedData: true,
      isLoadingData: false,
      setIsLoadingData: jest.fn(),
      currenciesFetchedRef: { current: false },
      fetchSavedData: jest.fn(),
      handleCountryToggle: jest.fn(),
      handleCurrencyToggle: jest.fn(),
      handleSetDefaultCurrency: jest.fn()
    });
    
    // Mock fetchCountryStateMap
    const { fetchCountryStateMap } = require('../../../src/services/countryStateService');
    fetchCountryStateMap.mockResolvedValue({
      'Country1': { states: ['State1'], currencies: ['USD', 'EUR'] },
      'Country2': { states: ['State2'], currencies: ['GBP', 'EUR'] },
      'Country3': { states: ['State3'], currencies: ['JPY', 'USD'] }
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render without crashing', () => {
    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByText('Please select all the countries where the company has operation. Please note that the country(ies) of Company and Subsidiary are pre-populated and can\'t be edited in here.')).toBeInTheDocument();
  });

  it('should render all child components', () => {
    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByTestId('selected-countries-grid')).toBeInTheDocument();
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
    expect(screen.getByTestId('selected-currencies-grid')).toBeInTheDocument();
  });

  it('should handle loading state', async () => {
    const { useCountriesAndCurrencies } = require('../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies');
    useCountriesAndCurrencies.mockReturnValue({
      countrySearch: '',
      setCountrySearch: jest.fn(),
      currencySearch: '',
      setCurrencySearch: jest.fn(),
      allCountries: [],
      setAllCountries: jest.fn(),
      isLoadingCountries: false,
      setIsLoadingCountries: jest.fn(),
      hasFetchedData: false,
      isLoadingData: true,
      setIsLoadingData: jest.fn(),
      currenciesFetchedRef: { current: false },
      fetchSavedData: jest.fn(),
      handleCountryToggle: jest.fn(),
      handleCurrencyToggle: jest.fn(),
      handleSetDefaultCurrency: jest.fn()
    });

    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id" 
      />
    );
    
    // The loading state should show the component is loading
    expect(screen.getByTestId('test-lazy-component')).toBeInTheDocument();
  });

  it('should call onDataChange when data is modified', () => {
    const mockOnDataChange = jest.fn();
    
    // Mock useSelector to return modified data
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: { loading: false },
        entityConfiguration: {
          'test-entity-id': {
            selectedCountries: ['Country1'],
            selectedCurrencies: ['USD'],
            defaultCurrency: ['USD'],
            isDefault: 'USD',
            isDataModified: true
          }
        },
        entities: {
          items: [{
            id: 'test-entity-id',
            country: 'Country1',
            currencies: JSON.stringify({
              defaultCurrency: ['USD'],
              selectedCurrencies: ['EUR'],
              isDefault: 'USD'
            })
          }]
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
        onDataChange={mockOnDataChange}
      />
    );
    
    expect(mockOnDataChange).toHaveBeenCalledWith(true);
  });

  it('should call onDataLoaded when data is loaded', () => {
    const mockOnDataLoaded = jest.fn();
    
    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
        onDataLoaded={mockOnDataLoaded}
      />
    );
    
    expect(mockOnDataLoaded).toHaveBeenCalledWith(true);
  });

  it('should handle entity without currencies data', () => {
    // Mock useSelector to return entity without currencies
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: { loading: false },
        entityConfiguration: {
          'test-entity-id': {
            selectedCountries: [],
            selectedCurrencies: [],
            defaultCurrency: null,
            isDefault: null,
            isDataModified: false
          }
        },
        entities: {
          items: [{
            id: 'test-entity-id',
            country: 'Country1',
            currencies: null
          }]
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
  });

  it('should handle entity with string currencies data', () => {
    // Mock useSelector to return entity with string currencies
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: { loading: false },
        entityConfiguration: {
          'test-entity-id': {
            selectedCountries: [],
            selectedCurrencies: [],
            defaultCurrency: null,
            isDefault: null,
            isDataModified: false
          }
        },
        entities: {
          items: [{
            id: 'test-entity-id',
            country: 'Country1',
            currencies: '{"defaultCurrency":["USD"],"selectedCurrencies":["EUR"],"isDefault":"USD"}'
          }]
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
  });

  it('should handle entity with object currencies data', () => {
    // Mock useSelector to return entity with object currencies
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: { loading: false },
        entityConfiguration: {
          'test-entity-id': {
            selectedCountries: [],
            selectedCurrencies: [],
            defaultCurrency: null,
            isDefault: null,
            isDataModified: false
          }
        },
        entities: {
          items: [{
            id: 'test-entity-id',
            country: 'Country1',
            currencies: {
              defaultCurrency: ['USD'],
              selectedCurrencies: ['EUR'],
              isDefault: 'USD'
            }
          }]
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
  });

  it('should handle missing entityId', () => {
    window.location.pathname = '/entity-setup/';
    
    // Mock useSelector to return empty state when no entityId
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: { loading: false },
        entityConfiguration: {},
        entities: { items: [] }
      };
      return selector(state);
    });

    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId={undefined}
      />
    );
    
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
  });

  it('should handle fetchCountryStateMap error', async () => {
    const { fetchCountryStateMap } = require('../../../src/services/countryStateService');
    fetchCountryStateMap.mockRejectedValue(new Error('API Error'));
    
    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    });
  });

  it('should handle currencies loading from country-state service', async () => {
    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    await waitFor(() => {
      const { fetchCountryStateMap } = require('../../../src/services/countryStateService');
      expect(fetchCountryStateMap).toHaveBeenCalled();
    });
  });

  it('should handle component unmounting', () => {
    const { unmount } = renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    
    unmount();
    expect(screen.queryByTestId('countries-list')).not.toBeInTheDocument();
  });

  it('should handle edit mode changes', () => {
    const { rerender } = renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    expect(screen.getAllByText('Edit Mode: Yes')).toHaveLength(4);
    
    rerender(
      <Provider store={mockStore}>
        <BrowserRouter>
          <CountriesAndCurrencies 
            isEditMode={false} 
            entityId="test-entity-id"
          />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getAllByText('Edit Mode: No')).toHaveLength(4);
  });

  it('should handle different entity IDs', () => {
    window.location.pathname = '/entity-setup/different-entity-id';
    
    // Mock useSelector to return different entity
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: { loading: false },
        entityConfiguration: {
          'different-entity-id': {
            selectedCountries: ['Country3'],
            selectedCurrencies: ['GBP'],
            defaultCurrency: ['GBP'],
            isDefault: 'GBP',
            isDataModified: false
          }
        },
        entities: {
          items: [{
            id: 'different-entity-id',
            country: 'Country3',
            currencies: JSON.stringify({
              defaultCurrency: ['GBP'],
              selectedCurrencies: ['EUR'],
              isDefault: 'GBP'
            })
          }]
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="different-entity-id"
      />
    );
    
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
  });

  it('should handle currencies initialization from entity data', async () => {
    // Mock useSelector to return entity with currencies
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: { loading: false },
        entityConfiguration: {
          'test-entity-id': {
            selectedCountries: [],
            selectedCurrencies: [],
            defaultCurrency: [],
            isDefault: null,
            isDataModified: false
          }
        },
        entities: {
          items: [{
            id: 'test-entity-id',
            country: 'Country1',
            currencies: JSON.stringify({
              defaultCurrency: ['USD'],
              selectedCurrencies: ['EUR'],
              isDefault: 'USD'
            })
          }]
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    // Wait for the component to process the entity data
    await waitFor(() => {
      expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    });
  });

  it('should handle fetchSavedData when no currencies data exists', () => {
    const mockFetchSavedData = jest.fn();
    const { useCountriesAndCurrencies } = require('../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies');
    useCountriesAndCurrencies.mockReturnValue({
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
      fetchSavedData: mockFetchSavedData,
      handleCountryToggle: jest.fn(),
      handleCurrencyToggle: jest.fn(),
      handleSetDefaultCurrency: jest.fn()
    });

    // Mock useSelector to return empty currencies
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: { loading: false },
        entityConfiguration: {
          'test-entity-id': {
            selectedCountries: [],
            selectedCurrencies: [],
            defaultCurrency: null,
            isDefault: null,
            isDataModified: false
          }
        },
        entities: {
          items: [{
            id: 'test-entity-id',
            country: 'Country1',
            currencies: null
          }]
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    expect(mockFetchSavedData).toHaveBeenCalled();
  });

  it('should handle allSelectedCurrencies calculation', () => {
    // Mock useSelector to return currencies data
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: { loading: false },
        entityConfiguration: {
          'test-entity-id': {
            selectedCountries: ['Country1'],
            selectedCurrencies: ['USD'],
            defaultCurrency: ['EUR'],
            isDefault: 'GBP',
            isDataModified: false
          }
        },
        entities: {
          items: [{
            id: 'test-entity-id',
            country: 'Country1',
            currencies: JSON.stringify({
              defaultCurrency: ['EUR'],
              selectedCurrencies: ['USD'],
              isDefault: 'GBP'
            })
          }]
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    // The combined currencies should include USD, EUR, and GBP
    expect(screen.getAllByText('Selected: USD, EUR, GBP')).toHaveLength(2);
  });

  it('should handle error in currencies parsing', () => {
    // Mock useSelector to return entity with invalid currencies
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entitySetup: { loading: false },
        entityConfiguration: {
          'test-entity-id': {
            selectedCountries: [],
            selectedCurrencies: [],
            defaultCurrency: null,
            isDefault: null,
            isDataModified: false
          }
        },
        entities: {
          items: [{
            id: 'test-entity-id',
            country: 'Country1',
            currencies: 'invalid-json'
          }]
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <CountriesAndCurrencies 
        isEditMode={true} 
        entityId="test-entity-id"
      />
    );
    
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
  });
});
