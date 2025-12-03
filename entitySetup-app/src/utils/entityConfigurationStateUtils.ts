// Entity Configuration State Utilities
// Centralized default state to eliminate duplication across components

export interface DefaultEntityConfigurationState {
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
}

export const DEFAULT_ENTITY_CONFIGURATION_STATE: DefaultEntityConfigurationState = {
  selectedCountries: [],
  selectedCurrencies: [],
  defaultCurrency: [],
  isDefault: null,
  originalData: {
    countries: [],
    currencies: [],
    defaultCurrency: [],
    isDefault: null,
  },
  isDataModified: false,
  isDataSaved: false,
};

/**
 * Creates a default entity configuration state
 * @returns Default entity configuration state object
 */
export const createDefaultEntityConfigurationState = (): DefaultEntityConfigurationState => {
  return { ...DEFAULT_ENTITY_CONFIGURATION_STATE };
};

/**
 * Gets entity configuration state from Redux store with fallback to default
 * @param state - Redux state
 * @param entityId - Entity ID
 * @returns Entity configuration state
 */
export const getEntityConfigurationState = (state: any, entityId: string | null): DefaultEntityConfigurationState => {
  if (!entityId) {
    return createDefaultEntityConfigurationState();
  }
  
  return state.entityConfiguration[entityId] || createDefaultEntityConfigurationState();
};
