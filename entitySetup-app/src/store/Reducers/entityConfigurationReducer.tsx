import { createReducer } from '@reduxjs/toolkit';
import {
  setSelectedCountries,
  setSelectedCurrencies,
  setDefaultCurrency,
  setIsDefaultCurrency,
  setOriginalData,
  setDataModified,
  setDataSaved,
  resetConfiguration,
} from '../Actions/entityConfigurationActions';

export interface EntityConfigurationState {
  [entityId: string]: {
    selectedCountries: string[];
    selectedCurrencies: string[];
    defaultCurrency: string[];
    isDefault: string | null;
    originalData: {
      countries: string[];
      currencies: string[];
      defaultCurrency: string[];
      isDefault: string | null;
    };
    isDataModified: boolean;
    isDataSaved: boolean;
  };
}

const initialState: EntityConfigurationState = {};

const entityConfigurationReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setSelectedCountries, (state, action) => {
      const { entityId, countries } = action.payload;
      if (!state[entityId]) {
        state[entityId] = {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
          isDataModified: false,
          isDataSaved: false,
        };
      }
      state[entityId].selectedCountries = countries;
    })
    .addCase(setSelectedCurrencies, (state, action) => {
      const { entityId, currencies } = action.payload;
      if (!state[entityId]) {
        state[entityId] = {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
          isDataModified: false,
          isDataSaved: false,
        };
      }
      state[entityId].selectedCurrencies = currencies;
    })
    .addCase(setDefaultCurrency, (state, action) => {
      const { entityId, defaultCurrency } = action.payload;
      if (!state[entityId]) {
        state[entityId] = {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
          isDataModified: false,
          isDataSaved: false,
        };
      }
      state[entityId].defaultCurrency = defaultCurrency;
    })
    .addCase(setIsDefaultCurrency, (state, action) => {
      const { entityId, isDefault } = action.payload;
      if (!state[entityId]) {
        state[entityId] = {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
          isDataModified: false,
          isDataSaved: false,
        };
      }
      state[entityId].isDefault = isDefault;
    })
    .addCase(setOriginalData, (state, action) => {
      const { entityId, data } = action.payload;
      if (!state[entityId]) {
        state[entityId] = {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
          isDataModified: false,
          isDataSaved: false,
        };
      }
      state[entityId].originalData = data;
    })
    .addCase(setDataModified, (state, action) => {
      const { entityId, isModified } = action.payload;
      if (!state[entityId]) {
        state[entityId] = {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
          isDataModified: false,
          isDataSaved: false,
        };
      }
      state[entityId].isDataModified = isModified;
    })
    .addCase(setDataSaved, (state, action) => {
      const { entityId, isSaved } = action.payload;
      if (!state[entityId]) {
        state[entityId] = {
          selectedCountries: [],
          selectedCurrencies: [],
          defaultCurrency: [],
          isDefault: null,
          originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
          isDataModified: false,
          isDataSaved: false,
        };
      }
      state[entityId].isDataSaved = isSaved;
    })
    .addCase(resetConfiguration, (state, action) => {
      const { entityId } = action.payload;
      if (state[entityId]) {
        state[entityId].selectedCountries = [...state[entityId].originalData.countries];
        state[entityId].selectedCurrencies = [...state[entityId].originalData.currencies];
        state[entityId].defaultCurrency = state[entityId].originalData.defaultCurrency;
        state[entityId].isDefault = state[entityId].originalData.isDefault;
        state[entityId].isDataModified = false;
        state[entityId].isDataSaved = false;
      }
    });
});

export default entityConfigurationReducer;
