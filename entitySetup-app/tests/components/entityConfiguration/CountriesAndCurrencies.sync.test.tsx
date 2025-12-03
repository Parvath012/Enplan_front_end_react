import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CountriesAndCurrencies from '../../../src/components/entityConfiguration/CountriesAndCurrencies';

// Mock the dependencies
jest.mock('../../../src/services/countryStateService');
jest.mock('../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies');
jest.mock('../../../src/components/entityConfiguration/countries/CountriesList', () => {
  return function CountriesList() { return <div data-testid="countries-list">CountriesList</div>; };
});
jest.mock('../../../src/components/entityConfiguration/countries/SelectedCountriesGrid', () => {
  return function SelectedCountriesGrid() { return <div data-testid="selected-countries-grid">SelectedCountriesGrid</div>; };
});
jest.mock('../../../src/components/entityConfiguration/currencies/CurrenciesList', () => {
  return function CurrenciesList() { return <div data-testid="currencies-list">CurrenciesList</div>; };
});
jest.mock('../../../src/components/entityConfiguration/currencies/SelectedCurrenciesGrid', () => {
  return function SelectedCurrenciesGrid() { return <div data-testid="selected-currencies-grid">SelectedCurrenciesGrid</div>; };
});

const mockDispatch = jest.fn();

// Mock useCountriesAndCurrencies hook
const mockUseCountriesAndCurrencies = require('../../../src/components/entityConfiguration/hooks/useCountriesAndCurrencies');
mockUseCountriesAndCurrencies.useCountriesAndCurrencies = jest.fn();

describe('CountriesAndCurrencies - Entity Country Sync', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock store with initial state
    store = configureStore({
      reducer: {
        entityConfiguration: (state = {}, action) => {
          switch (action.type) {
            case 'entityConfiguration/setSelectedCountries':
              return {
                ...state,
                [action.payload.entityId]: {
                  ...state[action.payload.entityId],
                  selectedCountries: action.payload.countries
                }
              };
            default:
              return state;
          }
        },
        entities: (state = { items: [] }, action) => state
      },
      preloadedState: {
        entityConfiguration: {
          'test-entity-id': {
            selectedCountries: ['OldCountry'],
            selectedCurrencies: [],
            defaultCurrency: null,
            isDefault: null,
            isDataModified: false
          }
        },
        entities: {
          items: [
            {
              id: 'test-entity-id',
              country: 'NewCountry', // Updated country
              currencies: '[]'
            }
          ]
        }
      }
    });

    // Mock the hook to return expected values
    mockUseCountriesAndCurrencies.useCountriesAndCurrencies.mockReturnValue({
      countrySearch: '',
      setCountrySearch: jest.fn(),
      currencySearch: '',
      setCurrencySearch: jest.fn(),
      allCountries: ['USA', 'Canada', 'OldCountry', 'NewCountry'],
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

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/entity-setup/test-entity-id'
      }
    });
  });

  it('should sync selectedCountries when entity.country changes', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <CountriesAndCurrencies
          isEditMode={false}
          entityId="test-entity-id"
        />
      </Provider>
    );

    // Check that dispatch was called to sync selectedCountries with the new entity.country
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'entityConfiguration/setSelectedCountries',
      payload: { entityId: 'test-entity-id', countries: ['NewCountry'] }
    });
  });

  it('should not dispatch if selectedCountries already matches entity.country', () => {
    // Update store to have selectedCountries already matching entity.country
    store = configureStore({
      reducer: {
        entityConfiguration: (state = {}, action) => state,
        entities: (state = { items: [] }, action) => state
      },
      preloadedState: {
        entityConfiguration: {
          'test-entity-id': {
            selectedCountries: ['NewCountry'], // Already matches entity.country
            selectedCurrencies: [],
            defaultCurrency: null,
            isDefault: null,
            isDataModified: false
          }
        },
        entities: {
          items: [
            {
              id: 'test-entity-id',
              country: 'NewCountry',
              currencies: '[]'
            }
          ]
        }
      }
    });

    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <CountriesAndCurrencies
          isEditMode={false}
          entityId="test-entity-id"
        />
      </Provider>
    );

    // Should not dispatch setSelectedCountries since they already match
    expect(dispatchSpy).not.toHaveBeenCalledWith({
      type: 'entityConfiguration/setSelectedCountries',
      payload: { entityId: 'test-entity-id', countries: ['NewCountry'] }
    });
  });
});