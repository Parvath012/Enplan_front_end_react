import reducer, { EntityConfigurationState } from '../../../src/store/Reducers/entityConfigurationReducer';
import {
  setSelectedCountries,
  setSelectedCurrencies,
  setDefaultCurrency,
  setOriginalData,
  setDataModified,
  setDataSaved,
  resetConfiguration,
} from '../../../src/store/Actions/entityConfigurationActions';

describe('entityConfigurationReducer', () => {
  const entityId = 'test-entity-123';
  const initial: EntityConfigurationState = reducer(undefined, { type: '@@INIT' } as any);

  it('should return initial state', () => {
    expect(initial).toEqual({});
  });

  describe('setSelectedCountries', () => {
    it('should set selected countries for a new entity', () => {
      const countries = ['United States', 'Canada'];
      const action = setSelectedCountries({ entityId, countries });
      const state = reducer(initial, action);

      expect(state[entityId]).toEqual({
        selectedCountries: countries,
        selectedCurrencies: [],
        defaultCurrency: [],
        isDefault: null,
        originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
        isDataModified: false,
        isDataSaved: false,
      });
    });

    it('should update selected countries for existing entity', () => {
      const existingState = {
        [entityId]: {
          selectedCountries: ['United States'],
          selectedCurrencies: ['USD'],
          defaultCurrency: 'USD',
          originalData: { countries: [], currencies: [], defaultCurrency: null },
          isDataModified: false,
          isDataSaved: false,
        }
      };

      const newCountries = ['United States', 'Canada', 'Mexico'];
      const action = setSelectedCountries({ entityId, countries: newCountries });
      const state = reducer(existingState, action);

      expect(state[entityId].selectedCountries).toEqual(newCountries);
      expect(state[entityId].selectedCurrencies).toEqual(['USD']); // Should remain unchanged
    });
  });

  describe('setSelectedCurrencies', () => {
    it('should set selected currencies for a new entity', () => {
      const currencies = ['USD', 'CAD'];
      const action = setSelectedCurrencies({ entityId, currencies });
      const state = reducer(initial, action);

      expect(state[entityId]).toEqual({
        selectedCountries: [],
        selectedCurrencies: currencies,
        defaultCurrency: [],
        isDefault: null,
        originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
        isDataModified: false,
        isDataSaved: false,
      });
    });

    it('should update selected currencies for existing entity', () => {
      const existingState = {
        [entityId]: {
          selectedCountries: ['United States'],
          selectedCurrencies: ['USD'],
          defaultCurrency: 'USD',
          originalData: { countries: [], currencies: [], defaultCurrency: null },
          isDataModified: false,
          isDataSaved: false,
        }
      };

      const newCurrencies = ['USD', 'CAD', 'EUR'];
      const action = setSelectedCurrencies({ entityId, currencies: newCurrencies });
      const state = reducer(existingState, action);

      expect(state[entityId].selectedCurrencies).toEqual(newCurrencies);
      expect(state[entityId].selectedCountries).toEqual(['United States']); // Should remain unchanged
    });
  });

  describe('setDefaultCurrency', () => {
    it('should set default currency for a new entity', () => {
      const defaultCurrency = 'USD';
      const action = setDefaultCurrency({ entityId, defaultCurrency });
      const state = reducer(initial, action);

      expect(state[entityId]).toEqual({
        selectedCountries: [],
        selectedCurrencies: [],
        defaultCurrency,
        isDefault: null,
        originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
        isDataModified: false,
        isDataSaved: false,
      });
    });

    it('should update default currency for existing entity', () => {
      const existingState = {
        [entityId]: {
          selectedCountries: ['United States'],
          selectedCurrencies: ['USD', 'CAD'],
          defaultCurrency: 'USD',
          originalData: { countries: [], currencies: [], defaultCurrency: null },
          isDataModified: false,
          isDataSaved: false,
        }
      };

      const newDefaultCurrency = 'CAD';
      const action = setDefaultCurrency({ entityId, defaultCurrency: newDefaultCurrency });
      const state = reducer(existingState, action);

      expect(state[entityId].defaultCurrency).toBe(newDefaultCurrency);
    });

    it('should set default currency to null', () => {
      const existingState = {
        [entityId]: {
          selectedCountries: ['United States'],
          selectedCurrencies: ['USD'],
          defaultCurrency: 'USD',
          originalData: { countries: [], currencies: [], defaultCurrency: null },
          isDataModified: false,
          isDataSaved: false,
        }
      };

      const action = setDefaultCurrency({ entityId, defaultCurrency: [] });
      const state = reducer(existingState, action);

      expect(state[entityId].defaultCurrency).toEqual([]);
    });
  });

  describe('setOriginalData', () => {
    it('should set original data for a new entity', () => {
      const originalData = {
        countries: ['United States'],
        currencies: ['USD'],
        defaultCurrency: 'USD'
      };
      const action = setOriginalData({ entityId, data: originalData });
      const state = reducer(initial, action);

      expect(state[entityId]).toEqual({
        selectedCountries: [],
        selectedCurrencies: [],
        defaultCurrency: [],
        isDefault: null,
        originalData,
        isDataModified: false,
        isDataSaved: false,
      });
    });

    it('should update original data for existing entity', () => {
      const existingState = {
        [entityId]: {
          selectedCountries: ['United States'],
          selectedCurrencies: ['USD'],
          defaultCurrency: 'USD',
          originalData: { countries: [], currencies: [], defaultCurrency: null },
          isDataModified: true,
          isDataSaved: false,
        }
      };

      const newOriginalData = {
        countries: ['United States', 'Canada'],
        currencies: ['USD', 'CAD'],
        defaultCurrency: 'USD'
      };
      const action = setOriginalData({ entityId, data: newOriginalData });
      const state = reducer(existingState, action);

      expect(state[entityId].originalData).toEqual(newOriginalData);
    });
  });

  describe('setDataModified', () => {
    it('should set data modified flag for a new entity', () => {
      const action = setDataModified({ entityId, isModified: true });
      const state = reducer(initial, action);

      expect(state[entityId]).toEqual({
        selectedCountries: [],
        selectedCurrencies: [],
        defaultCurrency: [],
        isDefault: null,
        originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
        isDataModified: true,
        isDataSaved: false,
      });
    });

    it('should update data modified flag for existing entity', () => {
      const existingState = {
        [entityId]: {
          selectedCountries: ['United States'],
          selectedCurrencies: ['USD'],
          defaultCurrency: 'USD',
          originalData: { countries: [], currencies: [], defaultCurrency: null },
          isDataModified: false,
          isDataSaved: false,
        }
      };

      const action = setDataModified({ entityId, isModified: true });
      const state = reducer(existingState, action);

      expect(state[entityId].isDataModified).toBe(true);
    });
  });

  describe('setDataSaved', () => {
    it('should set data saved flag for a new entity', () => {
      const action = setDataSaved({ entityId, isSaved: true });
      const state = reducer(initial, action);

      expect(state[entityId]).toEqual({
        selectedCountries: [],
        selectedCurrencies: [],
        defaultCurrency: [],
        isDefault: null,
        originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
        isDataModified: false,
        isDataSaved: true,
      });
    });

    it('should update data saved flag for existing entity', () => {
      const existingState = {
        [entityId]: {
          selectedCountries: ['United States'],
          selectedCurrencies: ['USD'],
          defaultCurrency: 'USD',
          originalData: { countries: [], currencies: [], defaultCurrency: null },
          isDataModified: true,
          isDataSaved: false,
        }
      };

      const action = setDataSaved({ entityId, isSaved: true });
      const state = reducer(existingState, action);

      expect(state[entityId].isDataSaved).toBe(true);
    });
  });

  describe('resetConfiguration', () => {
    it('should reset configuration to original data', () => {
      const existingState = {
        [entityId]: {
          selectedCountries: ['United States', 'Canada'],
          selectedCurrencies: ['USD', 'CAD'],
          defaultCurrency: 'CAD',
          originalData: {
            countries: ['United States'],
            currencies: ['USD'],
            defaultCurrency: 'USD'
          },
          isDataModified: true,
          isDataSaved: false,
        }
      };

      const action = resetConfiguration({ entityId });
      const state = reducer(existingState, action);

      expect(state[entityId].selectedCountries).toEqual(['United States']);
      expect(state[entityId].selectedCurrencies).toEqual(['USD']);
      expect(state[entityId].defaultCurrency).toBe('USD');
      expect(state[entityId].isDataModified).toBe(false);
      expect(state[entityId].isDataSaved).toBe(false);
    });

    it('should not affect other entities when resetting one', () => {
      const otherEntityId = 'other-entity-456';
      const existingState = {
        [entityId]: {
          selectedCountries: ['United States'],
          selectedCurrencies: ['USD'],
          defaultCurrency: 'USD',
          originalData: { countries: [], currencies: [], defaultCurrency: null },
          isDataModified: true,
          isDataSaved: false,
        },
        [otherEntityId]: {
          selectedCountries: ['Canada'],
          selectedCurrencies: ['CAD'],
          defaultCurrency: 'CAD',
          originalData: { countries: [], currencies: [], defaultCurrency: null },
          isDataModified: false,
          isDataSaved: true,
        }
      };

      const action = resetConfiguration({ entityId });
      const state = reducer(existingState, action);

      expect(state[otherEntityId]).toEqual(existingState[otherEntityId]);
    });

    it('should not affect state if entity does not exist', () => {
      const nonExistentEntityId = 'non-existent-entity';
      const action = resetConfiguration({ entityId: nonExistentEntityId });
      const state = reducer(initial, action);

      expect(state).toEqual(initial);
    });
  });

  describe('multiple entities', () => {
    it('should handle multiple entities independently', () => {
      const entityId1 = 'entity-1';
      const entityId2 = 'entity-2';

      let state = reducer(initial, setSelectedCountries({ entityId: entityId1, countries: ['US'] }));
      state = reducer(state, setSelectedCountries({ entityId: entityId2, countries: ['CA'] }));

      expect(state[entityId1].selectedCountries).toEqual(['US']);
      expect(state[entityId2].selectedCountries).toEqual(['CA']);
    });
  });
});
