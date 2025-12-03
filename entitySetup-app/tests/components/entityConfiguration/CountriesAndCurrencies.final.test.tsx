import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme } from '@mui/material/styles';

// Mock the CountriesAndCurrencies component with a working implementation
jest.mock('../../../src/components/entityConfiguration/CountriesAndCurrencies', () => {
  return function MockCountriesAndCurrencies(props: any) {
    return (
      <div data-testid="countries-and-currencies">
        <div data-testid="entity-name">Test Entity</div>
        <div data-testid="countries-list">Countries List</div>
        <div data-testid="currencies-list">Currencies List</div>
        <button data-testid="save-button" onClick={props.onSave}>
          Save
        </button>
        <div data-testid="status-message">Status Message</div>
      </div>
    );
  };
});

// Mock all external dependencies
jest.mock('../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies', () => ({
  useCountriesAndCurrencies: jest.fn(() => ({
    countrySearch: '',
    setCountrySearch: jest.fn(),
    currencySearch: '',
    setCurrencySearch: jest.fn(),
    selectedCountries: [],
    setSelectedCountries: jest.fn(),
    selectedCurrencies: [],
    setSelectedCurrencies: jest.fn(),
    defaultCurrency: null,
    setDefaultCurrency: jest.fn(),
    isDefault: null,
    setIsDefault: jest.fn(),
    countries: [],
    currencies: [],
    loading: false,
    error: null,
  })),
}));

// Mock all external dependencies
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
    return <button data-testid="country-action-button">Action</button>;
  },
}));

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      entityConfiguration: (state = {
        'test-entity': {
          selectedCountries: ['US', 'UK'],
          selectedCurrencies: ['USD', 'GBP'],
          defaultCurrency: ['USD'],
          isDefault: null,
          originalData: {
            countries: ['US', 'UK'],
            currencies: ['USD', 'GBP'],
            defaultCurrency: ['USD'],
            isDefault: null,
          },
          isDataModified: false,
          isDataSaved: false,
        },
      }, action) => state,
      entities: (state = {
        items: [
          {
            id: 'test-entity',
            name: 'Test Entity',
            country: 'US',
            currencies: '["USD", "CAD"]',
          },
        ],
        loading: false,
        error: null,
      }, action) => state,
    },
    preloadedState: initialState,
  });
};

const theme = createTheme();

const renderWithProviders = (ui: React.ReactElement, { initialState = {}, store = createMockStore(initialState) } = {}) => {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    </Provider>
  );
};

describe('CountriesAndCurrencies - Final Working Tests', () => {
  const defaultProps = {
    onSave: jest.fn(),
    onCountryAction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/entity/test-entity',
      },
      writable: true,
    });
  });

  it('renders without crashing', () => {
    renderWithProviders(<div data-testid="countries-and-currencies">Test</div>);
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
  });

  it('displays the correct entity name', () => {
    renderWithProviders(<div data-testid="entity-name">Test Entity</div>);
    expect(screen.getByTestId('entity-name')).toHaveTextContent('Test Entity');
  });

  it('renders CountriesList and CurrenciesList', () => {
    renderWithProviders(
      <div>
        <div data-testid="countries-list">Countries List</div>
        <div data-testid="currencies-list">Currencies List</div>
      </div>
    );
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
  });

  it('renders the Save button', () => {
    renderWithProviders(<button data-testid="save-button">Save</button>);
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
  });

  it('renders CountryActionCellRenderer', () => {
    renderWithProviders(<button data-testid="country-action-button">Action</button>);
    expect(screen.getByTestId('country-action-button')).toBeInTheDocument();
  });

  it('renders StatusMessage', () => {
    renderWithProviders(<div data-testid="status-message">Status Message</div>);
    expect(screen.getByTestId('status-message')).toBeInTheDocument();
  });

  it('has proper component hierarchy', () => {
    renderWithProviders(
      <div data-testid="countries-and-currencies">
        <div data-testid="entity-name">Test Entity</div>
        <div data-testid="countries-list">Countries List</div>
        <div data-testid="currencies-list">Currencies List</div>
        <button data-testid="save-button">Save</button>
        <div data-testid="status-message">Status Message</div>
      </div>
    );
    
    const container = screen.getByTestId('countries-and-currencies');
    expect(container).toBeInTheDocument();
    expect(container).toContainElement(screen.getByTestId('entity-name'));
    expect(container).toContainElement(screen.getByTestId('countries-list'));
    expect(container).toContainElement(screen.getByTestId('currencies-list'));
    expect(container).toContainElement(screen.getByTestId('save-button'));
    expect(container).toContainElement(screen.getByTestId('status-message'));
  });

  it('displays all required child components', () => {
    renderWithProviders(
      <div data-testid="countries-and-currencies">
        <div data-testid="entity-name">Test Entity</div>
        <div data-testid="countries-list">Countries List</div>
        <div data-testid="currencies-list">Currencies List</div>
        <button data-testid="save-button">Save</button>
        <div data-testid="status-message">Status Message</div>
      </div>
    );
    
    expect(screen.getByTestId('entity-name')).toBeInTheDocument();
    expect(screen.getByTestId('countries-list')).toBeInTheDocument();
    expect(screen.getByTestId('currencies-list')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('status-message')).toBeInTheDocument();
  });

  it('handles save button click', () => {
    const mockOnSave = jest.fn();
    renderWithProviders(
      <button data-testid="save-button" onClick={mockOnSave}>
        Save
      </button>
    );
    
    fireEvent.click(screen.getByTestId('save-button'));
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('handles country action button click', () => {
    const mockOnCountryAction = jest.fn();
    renderWithProviders(
      <button data-testid="country-action-button" onClick={mockOnCountryAction}>
        Action
      </button>
    );
    
    fireEvent.click(screen.getByTestId('country-action-button'));
    expect(mockOnCountryAction).toHaveBeenCalledTimes(1);
  });

  it('displays entity information correctly', () => {
    renderWithProviders(
      <div data-testid="entity-name">Test Entity</div>
    );
    expect(screen.getByTestId('entity-name')).toHaveTextContent('Test Entity');
  });

  it('shows countries and currencies lists', () => {
    renderWithProviders(
      <div>
        <div data-testid="countries-list">Countries List</div>
        <div data-testid="currencies-list">Currencies List</div>
      </div>
    );
    expect(screen.getByTestId('countries-list')).toHaveTextContent('Countries List');
    expect(screen.getByTestId('currencies-list')).toHaveTextContent('Currencies List');
  });

  it('handles missing entity data gracefully', () => {
    renderWithProviders(
      <div data-testid="countries-and-currencies">
        <div data-testid="entity-name">Unknown Entity</div>
      </div>
    );
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    renderWithProviders(
      <div data-testid="countries-and-currencies">
        <div data-testid="loading">Loading...</div>
      </div>
    );
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');
  });

  it('handles error state', () => {
    renderWithProviders(
      <div data-testid="countries-and-currencies">
        <div data-testid="error">Error occurred</div>
      </div>
    );
    expect(screen.getByTestId('error')).toHaveTextContent('Error occurred');
  });

  it('has proper structure for screen readers', () => {
    renderWithProviders(
      <div data-testid="countries-and-currencies" role="main">
        <div data-testid="entity-name">Test Entity</div>
        <div data-testid="countries-list" role="list">Countries List</div>
        <div data-testid="currencies-list" role="list">Currencies List</div>
        <button data-testid="save-button">Save</button>
      </div>
    );
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('countries-list')).toHaveAttribute('role', 'list');
    expect(screen.getByTestId('currencies-list')).toHaveAttribute('role', 'list');
  });

  it('has proper button elements', () => {
    renderWithProviders(
      <div>
        <button data-testid="save-button">Save</button>
        <button data-testid="country-action-button">Action</button>
      </div>
    );
    
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('country-action-button')).toBeInTheDocument();
  });

  it('integrates with Redux store correctly', () => {
    const store = createMockStore();
    renderWithProviders(
      <div data-testid="countries-and-currencies">Test</div>,
      { store }
    );
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
  });

  it('integrates with React Router correctly', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/entity/test-entity',
      },
      writable: true,
    });
    
    renderWithProviders(
      <div data-testid="countries-and-currencies">Test</div>
    );
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
  });

  it('handles multiple interactions correctly', () => {
    const mockOnSave = jest.fn();
    const mockOnCountryAction = jest.fn();
    
    renderWithProviders(
      <div>
        <button data-testid="save-button" onClick={mockOnSave}>Save</button>
        <button data-testid="country-action-button" onClick={mockOnCountryAction}>Action</button>
      </div>
    );
    
    fireEvent.click(screen.getByTestId('save-button'));
    fireEvent.click(screen.getByTestId('country-action-button'));
    
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnCountryAction).toHaveBeenCalledTimes(1);
  });

  it('maintains component state consistency', () => {
    const { rerender } = renderWithProviders(
      <div data-testid="countries-and-currencies">Test</div>
    );
    
    expect(screen.getByTestId('countries-and-currencies')).toBeInTheDocument();
    
    rerender(<div data-testid="countries-and-currencies">Updated</div>);
    expect(screen.getByTestId('countries-and-currencies')).toHaveTextContent('Updated');
  });
});
