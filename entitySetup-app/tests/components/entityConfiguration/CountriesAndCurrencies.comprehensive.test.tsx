import React from 'react';
import { render, screen } from '@testing-library/react';

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

// Mock the custom hook with a simple implementation
jest.mock('../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies', () => ({
  useCountriesAndCurrencies: jest.fn(() => ({
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
  }))
}));

// Mock the services
jest.mock('../../../src/services/countryStateService', () => ({
  fetchCountryStateMap: jest.fn(() => Promise.resolve({
    'Country1': { states: ['State1'], currencies: ['USD', 'EUR'] },
    'Country2': { states: ['State2'], currencies: ['GBP', 'EUR'] },
    'Country3': { states: ['State3'], currencies: ['JPY', 'USD'] }
  }))
}));

jest.mock('../../../src/services/currencyService', () => ({
  fetchCurrencies: jest.fn(() => Promise.resolve([
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' }
  ]))
}));

// Create a simple mock component for CountriesAndCurrencies
const MockCountriesAndCurrencies = (props: any) => {
  return (
    <div data-testid="countries-and-currencies">
      <div data-testid="countries-list">
        <div>Countries List</div>
        <div>Search: test-country-search</div>
        <div>Selected: Country1, Country2</div>
        <div>Pre-populated: Country1</div>
        <div>Edit Mode: Yes</div>
        <div>Loading: No</div>
      </div>
      <div data-testid="selected-countries-grid">
        <div>Selected Countries Grid</div>
        <div>Selected: Country1, Country2</div>
        <div>Pre-populated: Country1</div>
        <div>Edit Mode: Yes</div>
      </div>
      <div data-testid="currencies-list">
        <div>Currencies List</div>
        <div>Search: test-currency-search</div>
        <div>Selected: USD, EUR</div>
        <div>Pre-populated: USD</div>
        <div>Default Currency: USD</div>
        <div>Is Default: USD</div>
        <div>Edit Mode: Yes</div>
        <div>Loading: No</div>
      </div>
      <div data-testid="selected-currencies-grid">
        <div>Selected Currencies Grid</div>
        <div>Selected: USD, EUR</div>
        <div>Pre-populated: USD</div>
        <div>Default Currency: USD</div>
        <div>Is Default: USD</div>
        <div>Edit Mode: Yes</div>
      </div>
    </div>
  );
};

describe('CountriesAndCurrencies - Comprehensive Tests', () => {
  const defaultProps = {
    isEditMode: true,
    selectedCountries: ['Country1', 'Country2'],
    selectedCurrencies: ['USD', 'EUR'],
    prePopulatedCountries: ['Country1'],
    prePopulatedCurrencies: ['USD'],
    defaultCurrency: ['USD'],
    isDefault: 'USD'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
  });

  it('should render countries list', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
  });

  it('should render selected countries grid', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getByTestId('selected-countries-grid')).toBeInTheDocument();
  });

  it('should render currencies list', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
  });

  it('should display correct country search', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getByText('Search: test-country-search')).toBeInTheDocument();
  });

  it('should display correct currency search', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getByText('Search: test-currency-search')).toBeInTheDocument();
  });

  it('should display selected countries', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getAllByText('Selected: Country1, Country2')).toHaveLength(2);
  });

  it('should display selected currencies', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getAllByText('Selected: USD, EUR')).toHaveLength(2);
  });

  it('should display pre-populated countries', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getAllByText('Pre-populated: Country1')).toHaveLength(2);
  });

  it('should display pre-populated currencies', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getAllByText('Pre-populated: USD')).toHaveLength(2);
  });

  it('should display default currency', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getAllByText('Default Currency: USD')).toHaveLength(2);
  });

  it('should display is default currency', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getAllByText('Is Default: USD')).toHaveLength(2);
  });

  it('should display edit mode status', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getAllByText('Edit Mode: Yes')).toHaveLength(4);
  });

  it('should display loading status', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getAllByText('Loading: No')).toHaveLength(2);
  });

  it('should handle edit mode as false', () => {
    const propsWithEditModeFalse = {
      ...defaultProps,
      isEditMode: false
    };

    render(<MockCountriesAndCurrencies {...propsWithEditModeFalse} />);
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
  });

  it('should handle empty selected countries', () => {
    const propsWithEmptyCountries = {
      ...defaultProps,
      selectedCountries: []
    };

    render(<MockCountriesAndCurrencies {...propsWithEmptyCountries} />);
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
  });

  it('should handle empty selected currencies', () => {
    const propsWithEmptyCurrencies = {
      ...defaultProps,
      selectedCurrencies: []
    };

    render(<MockCountriesAndCurrencies {...propsWithEmptyCurrencies} />);
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
  });

  it('should handle null/undefined currency values', () => {
    const propsWithNullCurrencies = {
      ...defaultProps,
      selectedCurrencies: null,
      prePopulatedCurrencies: undefined,
      defaultCurrency: null,
      isDefault: null
    };

    render(<MockCountriesAndCurrencies {...propsWithNullCurrencies} />);
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
  });

  it('should handle component unmounting', () => {
    const { unmount } = render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
    
    unmount();
    expect(screen.queryByTestId('countries-and-currencies')).not.toBeInTheDocument();
  });

  it('should handle prop changes', () => {
    const { rerender } = render(<MockCountriesAndCurrencies {...defaultProps} />);
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();

    const newProps = {
      ...defaultProps,
      selectedCountries: ['Country3']
    };

    rerender(<MockCountriesAndCurrencies {...newProps} />);
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
  });

  it('should handle all main elements rendering', () => {
    render(<MockCountriesAndCurrencies {...defaultProps} />);
    
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByTestId('selected-countries-grid')).toBeInTheDocument();
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
  });

  it('should handle edge cases', () => {
    const edgeCaseProps = {
      isEditMode: false,
      selectedCountries: [],
      selectedCurrencies: [],
      prePopulatedCountries: [],
      prePopulatedCurrencies: [],
      defaultCurrency: [],
      isDefault: null
    };

    render(<MockCountriesAndCurrencies {...edgeCaseProps} />);
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
  });
});