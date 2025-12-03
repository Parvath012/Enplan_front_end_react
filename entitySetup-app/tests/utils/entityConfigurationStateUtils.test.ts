import { getEntityConfigurationState, DEFAULT_ENTITY_CONFIGURATION_STATE } from '../../src/utils/entityConfigurationStateUtils';
import { RootState } from '../../src/store/configureStore';

// Mock Redux state
const createMockState = (entityConfiguration: any = {}): RootState => ({
  entityConfiguration,
  entities: {
    items: [],
    loading: false,
    error: null,
    hierarchy: null,
    hierarchyLoading: false
  },
  periodSetup: {},
  // Add other required state properties as needed
} as RootState);

describe('entityConfigurationStateUtils', () => {
  describe('DEFAULT_ENTITY_CONFIGURATION_STATE', () => {
    it('should have correct structure', () => {
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE).toHaveProperty('selectedCountries');
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE).toHaveProperty('selectedCurrencies');
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE).toHaveProperty('defaultCurrency');
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE).toHaveProperty('originalData');
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE).toHaveProperty('isDataModified');
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE).toHaveProperty('isDataSaved');
    });

    it('should have correct default values', () => {
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE.selectedCountries).toEqual([]);
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE.selectedCurrencies).toEqual([]);
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE.defaultCurrency).toEqual([]);
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE.isDefault).toBeNull();
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE.originalData).toEqual({
        countries: [],
        currencies: [],
        defaultCurrency: [],
        isDefault: null
      });
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE.isDataModified).toBe(false);
      expect(DEFAULT_ENTITY_CONFIGURATION_STATE.isDataSaved).toBe(false);
    });
  });

  describe('getEntityConfigurationState', () => {
    it('should return default state when entityId is null', () => {
      const state = createMockState();
      const result = getEntityConfigurationState(state, null);
      expect(result).toEqual(DEFAULT_ENTITY_CONFIGURATION_STATE);
    });

    it('should return default state when entityId is undefined', () => {
      const state = createMockState();
      const result = getEntityConfigurationState(state, undefined as any);
      expect(result).toEqual(DEFAULT_ENTITY_CONFIGURATION_STATE);
    });

    it('should return default state when entityId is empty string', () => {
      const state = createMockState();
      const result = getEntityConfigurationState(state, '');
      expect(result).toEqual(DEFAULT_ENTITY_CONFIGURATION_STATE);
    });

    it('should return default state when entityConfiguration is empty', () => {
      const state = createMockState({});
      const result = getEntityConfigurationState(state, 'entity-1');
      expect(result).toEqual(DEFAULT_ENTITY_CONFIGURATION_STATE);
    });

    it('should return default state when entity does not exist in entityConfiguration', () => {
      const state = createMockState({
        'other-entity': {
          selectedCountries: ['US'],
          selectedCurrencies: ['USD'],
          defaultCurrency: 'USD',
          originalData: { countries: ['US'], currencies: ['USD'], defaultCurrency: 'USD' },
          isDataModified: true,
          isDataSaved: false
        }
      });
      const result = getEntityConfigurationState(state, 'entity-1');
      expect(result).toEqual(DEFAULT_ENTITY_CONFIGURATION_STATE);
    });

    it('should return existing state when entity exists', () => {
      const existingState = {
        selectedCountries: ['US', 'CA'],
        selectedCurrencies: ['USD', 'CAD'],
        defaultCurrency: 'USD',
        originalData: {
          countries: ['US', 'CA'],
          currencies: ['USD', 'CAD'],
          defaultCurrency: 'USD'
        },
        isDataModified: true,
        isDataSaved: false
      };
      
      const state = createMockState({
        'entity-1': existingState
      });
      
      const result = getEntityConfigurationState(state, 'entity-1');
      expect(result).toEqual(existingState);
    });

    it('should return existing state with partial data', () => {
      const existingState = {
        selectedCountries: ['US'],
        selectedCurrencies: ['USD']
        // Missing other properties
      };
      
      const state = createMockState({
        'entity-1': existingState
      });
      
      const result = getEntityConfigurationState(state, 'entity-1');
      expect(result).toEqual(existingState);
    });

    it('should handle different entity IDs correctly', () => {
      const entity1State = {
        selectedCountries: ['US'],
        selectedCurrencies: ['USD'],
        defaultCurrency: 'USD',
        originalData: { countries: ['US'], currencies: ['USD'], defaultCurrency: 'USD' },
        isDataModified: true,
        isDataSaved: false
      };
      
      const entity2State = {
        selectedCountries: ['CA'],
        selectedCurrencies: ['CAD'],
        defaultCurrency: 'CAD',
        originalData: { countries: ['CA'], currencies: ['CAD'], defaultCurrency: 'CAD' },
        isDataModified: false,
        isDataSaved: true
      };
      
      const state = createMockState({
        'entity-1': entity1State,
        'entity-2': entity2State
      });
      
      const result1 = getEntityConfigurationState(state, 'entity-1');
      const result2 = getEntityConfigurationState(state, 'entity-2');
      
      expect(result1).toEqual(entity1State);
      expect(result2).toEqual(entity2State);
    });

    it('should handle state with null values', () => {
      const existingState = {
        selectedCountries: [],
        selectedCurrencies: [],
        defaultCurrency: null,
        originalData: { countries: [], currencies: [], defaultCurrency: null },
        isDataModified: false,
        isDataSaved: false
      };
      
      const state = createMockState({
        'entity-1': existingState
      });
      
      const result = getEntityConfigurationState(state, 'entity-1');
      expect(result).toEqual(existingState);
    });

    it('should handle state with empty arrays', () => {
      const existingState = {
        selectedCountries: [],
        selectedCurrencies: [],
        defaultCurrency: 'USD',
        originalData: { countries: [], currencies: [], defaultCurrency: 'USD' },
        isDataModified: false,
        isDataSaved: true
      };
      
      const state = createMockState({
        'entity-1': existingState
      });
      
      const result = getEntityConfigurationState(state, 'entity-1');
      expect(result).toEqual(existingState);
    });

    it('should handle state with multiple countries and currencies', () => {
      const existingState = {
        selectedCountries: ['US', 'CA', 'MX'],
        selectedCurrencies: ['USD', 'CAD', 'MXN'],
        defaultCurrency: 'USD',
        originalData: {
          countries: ['US', 'CA', 'MX'],
          currencies: ['USD', 'CAD', 'MXN'],
          defaultCurrency: 'USD'
        },
        isDataModified: true,
        isDataSaved: false
      };
      
      const state = createMockState({
        'entity-1': existingState
      });
      
      const result = getEntityConfigurationState(state, 'entity-1');
      expect(result).toEqual(existingState);
    });

    it('should handle state with modified data', () => {
      const existingState = {
        selectedCountries: ['US', 'CA'],
        selectedCurrencies: ['USD', 'CAD'],
        defaultCurrency: 'USD',
        originalData: {
          countries: ['US'],
          currencies: ['USD'],
          defaultCurrency: 'USD'
        },
        isDataModified: true,
        isDataSaved: false
      };
      
      const state = createMockState({
        'entity-1': existingState
      });
      
      const result = getEntityConfigurationState(state, 'entity-1');
      expect(result).toEqual(existingState);
    });

    it('should handle state with saved data', () => {
      const existingState = {
        selectedCountries: ['US'],
        selectedCurrencies: ['USD'],
        defaultCurrency: 'USD',
        originalData: {
          countries: ['US'],
          currencies: ['USD'],
          defaultCurrency: 'USD'
        },
        isDataModified: false,
        isDataSaved: true
      };
      
      const state = createMockState({
        'entity-1': existingState
      });
      
      const result = getEntityConfigurationState(state, 'entity-1');
      expect(result).toEqual(existingState);
    });
  });
});
