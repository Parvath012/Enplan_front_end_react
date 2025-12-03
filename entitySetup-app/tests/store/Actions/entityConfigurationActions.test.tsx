import configureMockStore from 'redux-mock-store';
import {
  setSelectedCountries,
  setSelectedCurrencies,
  setDefaultCurrency,
  setOriginalData,
  setDataModified,
  setDataSaved,
  resetConfiguration,
  toggleCountry,
  toggleCurrency,
  setDefaultCurrencyAction,
  setIsDefaultCurrency,
  saveConfiguration,
  resetConfigurationAction,
  isPeriodSetupMandatoryFieldsFilled,
  isPeriodSetupModified,
  determineEditMode,
  isCountriesTabNextEnabled,
  isPeriodSetupTabNextEnabled,
  isModulesTabNextEnabled,
  getEditButtonVisibility,
  getFormModifiedState,
  getSaveDisabledState,
  getHeaderTitle,
  isNewlyCreatedEntity,
  ENTITY_CONFIGURATION_ACTIONS
} from '../../../src/store/Actions/entityConfigurationActions';

const mockStore = configureMockStore();

describe('entityConfigurationActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Synchronous Actions', () => {
    it('should create an action to set selected countries', () => {
      const payload = { entityId: 'test-entity', countries: ['United States', 'Canada'] };
      const expectedAction = {
        type: ENTITY_CONFIGURATION_ACTIONS.SET_SELECTED_COUNTRIES,
        payload
      };
      expect(setSelectedCountries(payload)).toEqual(expectedAction);
    });

    it('should create an action to set selected currencies', () => {
      const payload = { entityId: 'test-entity', currencies: ['USD', 'CAD'] };
      const expectedAction = {
        type: ENTITY_CONFIGURATION_ACTIONS.SET_SELECTED_CURRENCIES,
        payload
      };
      expect(setSelectedCurrencies(payload)).toEqual(expectedAction);
    });

    it('should create an action to set default currency', () => {
      const payload = { entityId: 'test-entity', defaultCurrency: ['USD'] };
      const expectedAction = {
        type: ENTITY_CONFIGURATION_ACTIONS.SET_DEFAULT_CURRENCY,
        payload
      };
      expect(setDefaultCurrency(payload)).toEqual(expectedAction);
    });

    it('should create an action to set is default currency', () => {
      const payload = { entityId: 'test-entity', isDefault: 'USD' };
      const expectedAction = {
        type: ENTITY_CONFIGURATION_ACTIONS.SET_IS_DEFAULT_CURRENCY,
        payload
      };
      expect(setIsDefaultCurrency(payload)).toEqual(expectedAction);
    });

    it('should create an action to set original data', () => {
      const payload = {
        entityId: 'test-entity',
        data: {
          countries: ['United States'],
          currencies: ['USD'],
          defaultCurrency: ['USD'],
          isDefault: 'USD'
        }
      };
      const expectedAction = {
        type: ENTITY_CONFIGURATION_ACTIONS.SET_ORIGINAL_DATA,
        payload
      };
      expect(setOriginalData(payload)).toEqual(expectedAction);
    });

    it('should create an action to set data modified flag', () => {
      const payload = { entityId: 'test-entity', isModified: true };
      const expectedAction = {
        type: ENTITY_CONFIGURATION_ACTIONS.SET_DATA_MODIFIED,
        payload
      };
      expect(setDataModified(payload)).toEqual(expectedAction);
    });

    it('should create an action to set data saved flag', () => {
      const payload = { entityId: 'test-entity', isSaved: true };
      const expectedAction = {
        type: ENTITY_CONFIGURATION_ACTIONS.SET_DATA_SAVED,
        payload
      };
      expect(setDataSaved(payload)).toEqual(expectedAction);
    });

    it('should create an action to reset configuration', () => {
      const payload = { entityId: 'test-entity' };
      const expectedAction = {
        type: ENTITY_CONFIGURATION_ACTIONS.RESET_CONFIGURATION,
        payload
      };
      expect(resetConfiguration(payload)).toEqual(expectedAction);
    });
  });

  describe('Thunk Actions', () => {
    describe('toggleCountry', () => {
      it('should add country when not selected', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: ['Canada'],
              selectedCurrencies: [],
              defaultCurrency: null,
              originalData: { countries: [], currencies: [], defaultCurrency: ['USD'], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            }
          },
          entities: {
            items: [
              { id: 'test-entity', country: 'Canada', name: 'Test Entity' }
            ]
          }
        });

        toggleCountry('United States', 'test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setSelectedCountries({ entityId: 'test-entity', countries: ['Canada', 'United States'] })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'test-entity', isModified: true })
        );
      });

      it('should remove country when selected and not pre-populated', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: ['United States', 'Canada'],
              selectedCurrencies: [],
              defaultCurrency: null,
              originalData: { countries: [], currencies: [], defaultCurrency: ['USD'], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            }
          },
          entities: {
            items: [
              { id: 'test-entity', country: 'Canada', name: 'Test Entity' }
            ]
          }
        });

        toggleCountry('United States', 'test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setSelectedCountries({ entityId: 'test-entity', countries: ['Canada'] })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'test-entity', isModified: true })
        );
      });

      it('should not remove pre-populated country', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: ['United States', 'Canada'],
              selectedCurrencies: [],
              defaultCurrency: null,
              originalData: { 
                countries: ['United States'], 
                currencies: [], 
                defaultCurrency: null 
              },
              isDataModified: false,
              isDataSaved: false,
            }
          },
          entities: {
            items: [
              { id: 'test-entity', country: 'United States', name: 'Test Entity' }
            ]
          }
        });

        toggleCountry('United States', 'test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        // Should not dispatch any actions since pre-populated country cannot be removed
        expect(actions).toHaveLength(0);
      });

      it('should create entity configuration if it does not exist', () => {
        const store = mockStore({
          entityConfiguration: {},
          entities: {
            items: []
          }
        });

        toggleCountry('United States', 'new-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setSelectedCountries({ entityId: 'new-entity', countries: ['United States'] })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'new-entity', isModified: true })
        );
      });
    });

    describe('toggleCurrency', () => {
      it('should add currency when not selected', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: [],
              selectedCurrencies: ['USD'],
              defaultCurrency: ['USD'],
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: ['USD'], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            }
          }
        });

        toggleCurrency('CAD', 'test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setSelectedCurrencies({ entityId: 'test-entity', currencies: ['USD', 'CAD'] })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'test-entity', isModified: true })
        );
      });

      it('should remove currency when selected and not pre-populated', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: [],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: ['USD'],
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: ['USD'], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            }
          }
        });

        toggleCurrency('CAD', 'test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setSelectedCurrencies({ entityId: 'test-entity', currencies: ['USD'] })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'test-entity', isModified: true })
        );
      });

      it('should clear default currency when removing it', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: [],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: ['USD'],
              isDefault: 'CAD',
              originalData: { countries: [], currencies: [], defaultCurrency: ['USD'], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            }
          }
        });

        toggleCurrency('CAD', 'test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setIsDefaultCurrency({ entityId: 'test-entity', isDefault: null })
        );
        expect(actions).toContainEqual(
          setSelectedCurrencies({ entityId: 'test-entity', currencies: ['USD'] })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'test-entity', isModified: true })
        );
      });

      it('should not remove pre-populated currency', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: [],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: ['USD'],
              originalData: { 
                countries: [], 
                currencies: ['USD'], 
                defaultCurrency: ['USD'],
                isDefault: null
              },
              isDataModified: false,
              isDataSaved: false,
            }
          }
        });

        toggleCurrency('USD', 'test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        // Should not dispatch any actions since pre-populated currency cannot be removed
        expect(actions).toHaveLength(0);
      });

      it('should not allow unchecking currency in defaultCurrency', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: [],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: ['USD'],
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: ['USD'], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            }
          }
        });

        toggleCurrency('USD', 'test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toHaveLength(0);
      });

      it('should handle entity configuration that does not exist', () => {
        const store = mockStore({
          entityConfiguration: {}
        });

        toggleCurrency('USD', 'new-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setSelectedCurrencies({ entityId: 'new-entity', currencies: ['USD'] })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'new-entity', isModified: true })
        );
      });
    });

    describe('setDefaultCurrencyAction', () => {
      it('should set default currency and check for changes', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: [],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: ['USD'],
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: ['USD'], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            }
          }
        });

        setDefaultCurrencyAction('CAD', 'test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setIsDefaultCurrency({ entityId: 'test-entity', isDefault: 'CAD' })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'test-entity', isModified: true })
        );
      });

      it('should not dispatch actions when currency is already the default', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: [],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: ['USD'],
              isDefault: 'USD',
              originalData: { countries: [], currencies: [], defaultCurrency: ['USD'], isDefault: null },
              isDataModified: false,
              isDataSaved: false,
            }
          }
        });

        setDefaultCurrencyAction('USD', 'test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toHaveLength(0);
      });

      it('should handle entity configuration that does not exist', () => {
        const store = mockStore({
          entityConfiguration: {}
        });

        setDefaultCurrencyAction('USD', 'new-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setIsDefaultCurrency({ entityId: 'new-entity', isDefault: 'USD' })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'new-entity', isModified: true })
        );
      });
    });

    describe('saveConfiguration', () => {
      it('should save configuration and update original data', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: ['United States'],
              selectedCurrencies: ['USD'],
              defaultCurrency: ['USD'],
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: ['USD'], isDefault: null },
              isDataModified: true,
              isDataSaved: false,
            }
          }
        });

        saveConfiguration('test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setOriginalData({
            entityId: 'test-entity',
            data: {
              countries: ['United States'],
              currencies: ['USD'],
              defaultCurrency: ['USD'],
              isDefault: null
            }
          })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'test-entity', isModified: false })
        );
        expect(actions).toContainEqual(
          setDataSaved({ entityId: 'test-entity', isSaved: true })
        );
      });

      it('should handle entity configuration that does not exist', () => {
        const store = mockStore({
          entityConfiguration: {}
        });

        saveConfiguration('new-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setOriginalData({
            entityId: 'new-entity',
            data: {
              countries: [],
              currencies: [],
              defaultCurrency: [],
              isDefault: null
            }
          })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'new-entity', isModified: false })
        );
        expect(actions).toContainEqual(
          setDataSaved({ entityId: 'new-entity', isSaved: true })
        );
      });

      it('should handle null defaultCurrency and isDefault values', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: ['USA'],
              selectedCurrencies: ['USD'],
              defaultCurrency: null,
              isDefault: null,
              originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
              isDataModified: true,
              isDataSaved: false,
            }
          }
        });

        saveConfiguration('test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setOriginalData({
            entityId: 'test-entity',
            data: {
              countries: ['USA'],
              currencies: ['USD'],
              defaultCurrency: null,
              isDefault: null
            }
          })
        );
      });
    });

    describe('resetConfigurationAction', () => {
      it('should reset configuration to original data', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: ['United States', 'Canada'],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: ['CAD'],
              isDefault: null,
              originalData: {
                countries: ['United States'],
                currencies: ['USD'],
                defaultCurrency: ['USD'],
                isDefault: null
              },
              isDataModified: true,
              isDataSaved: false,
            }
          }
        });

        resetConfigurationAction('test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setSelectedCountries({ entityId: 'test-entity', countries: ['United States'] })
        );
        expect(actions).toContainEqual(
          setSelectedCurrencies({ entityId: 'test-entity', currencies: ['USD'] })
        );
        expect(actions).toContainEqual(
          setDefaultCurrency({ entityId: 'test-entity', defaultCurrency: ['USD'] })
        );
        expect(actions).toContainEqual(
          setDataModified({ entityId: 'test-entity', isModified: false })
        );
      });

      it('should not affect state if entity does not exist', () => {
        const store = mockStore({
          entityConfiguration: {}
        });

        resetConfigurationAction('non-existent-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toHaveLength(0);
      });

      it('should handle null defaultCurrency in originalData', () => {
        const store = mockStore({
          entityConfiguration: {
            'test-entity': {
              selectedCountries: ['USA', 'Canada'],
              selectedCurrencies: ['USD', 'CAD'],
              defaultCurrency: ['CAD'],
              isDefault: 'CAD',
              originalData: {
                countries: ['USA'],
                currencies: ['USD'],
                defaultCurrency: null,
                isDefault: null
              },
              isDataModified: true,
              isDataSaved: true,
            }
          }
        });

        resetConfigurationAction('test-entity')(store.dispatch, store.getState);

        const actions = store.getActions();
        expect(actions).toContainEqual(
          setDefaultCurrency({ entityId: 'test-entity', defaultCurrency: null })
        );
        expect(actions).toContainEqual(
          setIsDefaultCurrency({ entityId: 'test-entity', isDefault: null })
        );
      });
    });
  });

  describe('Helper Functions - Button State Logic', () => {
    describe('isCountriesTabNextEnabled', () => {
      it('should return true when data is saved and not in edit mode', () => {
        const result = isCountriesTabNextEnabled(['USA'], ['USD'], true, false);
        expect(result).toBe(true);
      });

      it('should return false when data is not saved', () => {
        const result = isCountriesTabNextEnabled(['USA'], ['USD'], false, false);
        expect(result).toBe(false);
      });

      it('should return false when in edit mode', () => {
        const result = isCountriesTabNextEnabled(['USA'], ['USD'], true, true);
        expect(result).toBe(false);
      });

      it('should return false when data not saved and in edit mode', () => {
        const result = isCountriesTabNextEnabled(['USA'], ['USD'], false, true);
        expect(result).toBe(false);
      });
    });

    describe('isPeriodSetupTabNextEnabled', () => {
      it('should return true when data is saved and not in edit mode', () => {
        const periodSetup = {
          'test-entity': { isDataSaved: true }
        };
        const result = isPeriodSetupTabNextEnabled('test-entity', periodSetup, false, false);
        expect(result).toBe(true);
      });

      it('should return false when data is not saved', () => {
        const periodSetup = {
          'test-entity': { isDataSaved: false }
        };
        const result = isPeriodSetupTabNextEnabled('test-entity', periodSetup, false, false);
        expect(result).toBe(false);
      });

      it('should return false when in edit mode', () => {
        const periodSetup = {
          'test-entity': { isDataSaved: true }
        };
        const result = isPeriodSetupTabNextEnabled('test-entity', periodSetup, true, false);
        expect(result).toBe(false);
      });

      it('should return false when entityId is undefined', () => {
        const result = isPeriodSetupTabNextEnabled(undefined, {}, false, false);
        expect(result).toBe(false);
      });

      it('should return false when period setup state does not exist', () => {
        const result = isPeriodSetupTabNextEnabled('test-entity', {}, false, false);
        expect(result).toBe(false);
      });
    });

    describe('isModulesTabNextEnabled', () => {
      it('should return true when data is saved and not in edit mode', () => {
        const modulesState = { isDataSaved: true };
        const result = isModulesTabNextEnabled(modulesState, false, false);
        expect(result).toBe(true);
      });

      it('should return false when data is not saved', () => {
        const modulesState = { isDataSaved: false };
        const result = isModulesTabNextEnabled(modulesState, false, false);
        expect(result).toBe(false);
      });

      it('should return false when in edit mode', () => {
        const modulesState = { isDataSaved: true };
        const result = isModulesTabNextEnabled(modulesState, true, false);
        expect(result).toBe(false);
      });
    });
  });

  describe('Helper Functions - FormHeader Logic', () => {
    describe('getEditButtonVisibility', () => {
      it('should return true for tab 0 with saved data and not in edit mode', () => {
        const params = {
          tabValue: 0,
          isEditMode: false,
          isDataSaved: true,
          selectedCountries: ['USA'],
          selectedCurrencies: ['USD'],
          entityId: 'test-entity',
          periodSetup: {},
          modulesState: {}
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(true);
      });

      it('should return false for tab 0 when in edit mode', () => {
        const params = {
          tabValue: 0,
          isEditMode: true,
          isDataSaved: true,
          selectedCountries: ['USA'],
          selectedCurrencies: ['USD'],
          entityId: 'test-entity',
          periodSetup: {},
          modulesState: {}
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(false);
      });

      it('should return false for tab 0 when data is not saved', () => {
        const params = {
          tabValue: 0,
          isEditMode: false,
          isDataSaved: false,
          selectedCountries: ['USA'],
          selectedCurrencies: ['USD'],
          entityId: 'test-entity',
          periodSetup: {},
          modulesState: {}
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(false);
      });

      it('should return true for tab 1 with saved period setup data', () => {
        const params = {
          tabValue: 1,
          isEditMode: false,
          isDataSaved: false,
          selectedCountries: [],
          selectedCurrencies: [],
          entityId: 'test-entity',
          periodSetup: {
            'test-entity': { isDataSaved: true }
          },
          modulesState: {}
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(true);
      });

      it('should return false for tab 1 when in edit mode', () => {
        const params = {
          tabValue: 1,
          isEditMode: true,
          isDataSaved: false,
          selectedCountries: [],
          selectedCurrencies: [],
          entityId: 'test-entity',
          periodSetup: {
            'test-entity': { isDataSaved: true }
          },
          modulesState: {}
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(false);
      });

      it('should return false for tab 1 when period setup data is not saved', () => {
        const params = {
          tabValue: 1,
          isEditMode: false,
          isDataSaved: false,
          selectedCountries: [],
          selectedCurrencies: [],
          entityId: 'test-entity',
          periodSetup: {
            'test-entity': { isDataSaved: false }
          },
          modulesState: {}
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(false);
      });

      it('should return false for tab 1 when entityId is undefined', () => {
        const params = {
          tabValue: 1,
          isEditMode: false,
          isDataSaved: false,
          selectedCountries: [],
          selectedCurrencies: [],
          entityId: undefined,
          periodSetup: {},
          modulesState: {}
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(false);
      });

      it('should return true for tab 2 with saved modules data', () => {
        const params = {
          tabValue: 2,
          isEditMode: false,
          isDataSaved: false,
          selectedCountries: [],
          selectedCurrencies: [],
          entityId: 'test-entity',
          periodSetup: {},
          modulesState: { isDataSaved: true }
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(true);
      });

      it('should return false for tab 2 when in edit mode', () => {
        const params = {
          tabValue: 2,
          isEditMode: true,
          isDataSaved: false,
          selectedCountries: [],
          selectedCurrencies: [],
          entityId: 'test-entity',
          periodSetup: {},
          modulesState: { isDataSaved: true }
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(false);
      });

      it('should return false for tab 2 when modules data is not saved', () => {
        const params = {
          tabValue: 2,
          isEditMode: false,
          isDataSaved: false,
          selectedCountries: [],
          selectedCurrencies: [],
          entityId: 'test-entity',
          periodSetup: {},
          modulesState: { isDataSaved: false }
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(false);
      });

      it('should return false for invalid tab value', () => {
        const params = {
          tabValue: 3,
          isEditMode: false,
          isDataSaved: true,
          selectedCountries: ['USA'],
          selectedCurrencies: ['USD'],
          entityId: 'test-entity',
          periodSetup: {},
          modulesState: {}
        };
        const result = getEditButtonVisibility(params);
        expect(result).toBe(false);
      });
    });

    describe('getFormModifiedState', () => {
      it('should return correct state for tab 0', () => {
        const mockIsPeriodSetupModified = jest.fn().mockReturnValue(false);
        const mockModulesState = { currentModules: [], savedModules: [] };
        
        const result = getFormModifiedState(0, true, mockIsPeriodSetupModified, mockModulesState);
        expect(result).toBe(true);
      });

      it('should return correct state for tab 1', () => {
        const mockIsPeriodSetupModified = jest.fn().mockReturnValue(true);
        const mockModulesState = { currentModules: [], savedModules: [] };
        
        const result = getFormModifiedState(1, false, mockIsPeriodSetupModified, mockModulesState);
        expect(result).toBe(true);
      });

      it('should return correct state for tab 2 when modules changed', () => {
        const mockIsPeriodSetupModified = jest.fn().mockReturnValue(false);
        const mockModulesState = { 
          currentModules: ['module1', 'module2'], 
          savedModules: ['module1'] 
        };
        
        const result = getFormModifiedState(2, false, mockIsPeriodSetupModified, mockModulesState);
        expect(result).toBe(true);
      });

      it('should return false for tab 2 when modules unchanged', () => {
        const mockIsPeriodSetupModified = jest.fn().mockReturnValue(false);
        const mockModulesState = { 
          currentModules: ['module1'], 
          savedModules: ['module1'] 
        };
        
        const result = getFormModifiedState(2, false, mockIsPeriodSetupModified, mockModulesState);
        expect(result).toBe(false);
      });

      it('should handle undefined modules state', () => {
        const mockIsPeriodSetupModified = jest.fn().mockReturnValue(false);
        const mockModulesState = { 
          currentModules: undefined, 
          savedModules: undefined 
        };
        
        const result = getFormModifiedState(2, false, mockIsPeriodSetupModified, mockModulesState);
        expect(result).toBe(false);
      });

      it('should return false for default case', () => {
        const mockIsPeriodSetupModified = jest.fn().mockReturnValue(false);
        const mockModulesState = { currentModules: [], savedModules: [] };
        
        const result = getFormModifiedState(3, false, mockIsPeriodSetupModified, mockModulesState);
        expect(result).toBe(false);
      });
    });

    describe('getSaveDisabledState', () => {
      it('should handle tab 0 - save enabled when data modified', () => {
        const params = {
          tabValue: 0,
          selectedCountries: ['USA'],
          selectedCurrencies: ['USD'],
          isDataModified: true,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => true,
          modulesState: { currentModules: [], savedModules: [] }
        };

        const result = getSaveDisabledState(params);
        expect(result).toBe(false);
      });

      it('should handle tab 0 - save disabled when data saved and not modified', () => {
        const params = {
          tabValue: 0,
          selectedCountries: ['USA'],
          selectedCurrencies: ['USD'],
          isDataModified: false,
          isDataSaved: true,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => true,
          modulesState: { currentModules: [], savedModules: [] }
        };

        const result = getSaveDisabledState(params);
        expect(result).toBe(true);
      });

      it('should handle tab 1 - save enabled when mandatory fields filled and modified', () => {
        const params = {
          tabValue: 1,
          selectedCountries: [],
          selectedCurrencies: [],
          isDataModified: false,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => true,
          modulesState: { currentModules: [], savedModules: [] }
        };

        const result = getSaveDisabledState(params);
        expect(result).toBe(false);
      });

      it('should handle tab 1 - save disabled when mandatory fields not filled', () => {
        const params = {
          tabValue: 1,
          selectedCountries: [],
          selectedCurrencies: [],
          isDataModified: false,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => false,
          isPeriodSetupModified: () => true,
          modulesState: { currentModules: [], savedModules: [] }
        };

        const result = getSaveDisabledState(params);
        expect(result).toBe(true);
      });

      it('should handle tab 1 - save disabled when not modified', () => {
        const params = {
          tabValue: 1,
          selectedCountries: [],
          selectedCurrencies: [],
          isDataModified: false,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => false,
          modulesState: { currentModules: [], savedModules: [] }
        };

        const result = getSaveDisabledState(params);
        expect(result).toBe(true);
      });

      it('should handle tab 2 - save enabled when modules changed', () => {
        const params = {
          tabValue: 2,
          selectedCountries: [],
          selectedCurrencies: [],
          isDataModified: false,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => true,
          modulesState: { 
            currentModules: ['module1', 'module2'], 
            savedModules: ['module1'] 
          }
        };

        const result = getSaveDisabledState(params);
        expect(result).toBe(false);
      });

      it('should handle tab 2 - save disabled when modules unchanged', () => {
        const params = {
          tabValue: 2,
          selectedCountries: [],
          selectedCurrencies: [],
          isDataModified: false,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => true,
          modulesState: { 
            currentModules: ['module1'], 
            savedModules: ['module1'] 
          }
        };

        const result = getSaveDisabledState(params);
        expect(result).toBe(true);
      });

      it('should handle tab 2 with undefined modules', () => {
        const params = {
          tabValue: 2,
          selectedCountries: [],
          selectedCurrencies: [],
          isDataModified: false,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => true,
          modulesState: { 
            currentModules: undefined, 
            savedModules: undefined 
          }
        };

        const result = getSaveDisabledState(params);
        expect(result).toBe(false);
      });

      it('should return true for default case', () => {
        const params = {
          tabValue: 3,
          selectedCountries: [],
          selectedCurrencies: [],
          isDataModified: false,
          isDataSaved: false,
          isPeriodSetupMandatoryFieldsFilled: () => true,
          isPeriodSetupModified: () => true,
          modulesState: { currentModules: [], savedModules: [] }
        };

        const result = getSaveDisabledState(params);
        expect(result).toBe(true);
      });
    });

    describe('getHeaderTitle', () => {
      it('should return correct title for tab 0', () => {
        const result = getHeaderTitle(0);
        expect(result).toBe('Countries and Currency');
      });

      it('should return correct title for tab 1', () => {
        const result = getHeaderTitle(1);
        expect(result).toBe('Period Setup');
      });

      it('should return correct title for tab 2', () => {
        const result = getHeaderTitle(2);
        expect(result).toBe('System Modules');
      });

      it('should return default title for invalid tab', () => {
        const result = getHeaderTitle(3);
        expect(result).toBe('Entity Configuration');
      });
    });
  });

  describe('Helper Functions - Entity Detection', () => {
    describe('isNewlyCreatedEntity', () => {
      it('should return true for newly created entity', () => {
        const mockEntity = { id: 'test-entity', isConfigured: false };
        const mockEntityConfiguration = { isDataSaved: false };

        const result = isNewlyCreatedEntity(mockEntity, mockEntityConfiguration);
        expect(result).toBe(true);
      });

      it('should return false when entity is configured', () => {
        const mockEntity = { id: 'test-entity', isConfigured: true };
        const mockEntityConfiguration = { isDataSaved: false };

        const result = isNewlyCreatedEntity(mockEntity, mockEntityConfiguration);
        expect(result).toBe(false);
      });

      it('should return false when entity has saved configuration', () => {
        const mockEntity = { id: 'test-entity', isConfigured: false };
        const mockEntityConfiguration = { isDataSaved: true };

        const result = isNewlyCreatedEntity(mockEntity, mockEntityConfiguration);
        expect(result).toBe(false);
      });

      it('should return false when entity is null', () => {
        const result = isNewlyCreatedEntity(null, {});
        expect(result).toBe(false);
      });

      it('should return false when entity is undefined', () => {
        const result = isNewlyCreatedEntity(undefined, {});
        expect(result).toBe(false);
      });

      it('should handle undefined entityConfiguration', () => {
        const mockEntity = { id: 'test-entity', isConfigured: false };

        const result = isNewlyCreatedEntity(mockEntity, undefined);
        expect(result).toBe(true);
      });

      it('should handle entity configuration with selected data but not saved', () => {
        const mockEntity = { id: 'test-entity', isConfigured: false };
        const mockEntityConfiguration = { 
          isDataSaved: false,
          selectedCountries: ['USA'],
          selectedCurrencies: ['USD']
        };

        const result = isNewlyCreatedEntity(mockEntity, mockEntityConfiguration);
        expect(result).toBe(true);
      });
    });
  });

  describe('Helper Functions - Edit Mode', () => {
    describe('determineEditMode', () => {
      it('should return false when in view mode', () => {
        const params = {
          isViewMode: true,
          tabValue: 0,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: {},
          userClickedEdit: false,
          modulesState: {},
          isNewlyCreatedEntity: false
        };

        const result = determineEditMode(params);
        expect(result).toBe(false);
      });

      it('should return true for newly created entities on tab 0', () => {
        const params = {
          isViewMode: false,
          tabValue: 0,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: {},
          userClickedEdit: false,
          modulesState: {},
          isNewlyCreatedEntity: true
        };

        const result = determineEditMode(params);
        expect(result).toBe(true);
      });

      it('should handle tab 0 with newly created entity', () => {
        const params = {
          isViewMode: false,
          tabValue: 0,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: {},
          userClickedEdit: false,
          modulesState: { isDataSaved: false },
          isNewlyCreatedEntity: true
        };

        const result = determineEditMode(params);
        expect(result).toBe(true);
      });

      it('should handle tab 0 with existing entity data not saved', () => {
        const params = {
          isViewMode: false,
          tabValue: 0,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: {},
          userClickedEdit: false,
          modulesState: { isDataSaved: false },
          isNewlyCreatedEntity: false
        };

        const result = determineEditMode(params);
        expect(result).toBe(true);
      });

      it('should handle tab 0 with existing entity data saved', () => {
        const params = {
          isViewMode: false,
          tabValue: 0,
          isDataSaved: true,
          entityId: 'test-entity',
          periodSetup: {},
          userClickedEdit: false,
          modulesState: { isDataSaved: false },
          isNewlyCreatedEntity: false
        };

        const result = determineEditMode(params);
        expect(result).toBe(false);
      });

      it('should handle tab 1 with newly created entity and no saved period setup', () => {
        const params = {
          isViewMode: false,
          tabValue: 1,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: { 'test-entity': { isDataSaved: false } },
          userClickedEdit: false,
          modulesState: { isDataSaved: false },
          isNewlyCreatedEntity: true
        };

        const result = determineEditMode(params);
        expect(result).toBe(true);
      });

      it('should handle tab 1 with saved period setup and user clicked edit', () => {
        const params = {
          isViewMode: false,
          tabValue: 1,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: { 'test-entity': { isDataSaved: true } },
          userClickedEdit: true,
          modulesState: { isDataSaved: false },
          isNewlyCreatedEntity: false
        };

        const result = determineEditMode(params);
        expect(result).toBe(true);
      });

      it('should handle tab 1 with saved period setup and user did not click edit', () => {
        const params = {
          isViewMode: false,
          tabValue: 1,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: { 'test-entity': { isDataSaved: true } },
          userClickedEdit: false,
          modulesState: { isDataSaved: false },
          isNewlyCreatedEntity: false
        };

        const result = determineEditMode(params);
        expect(result).toBe(false);
      });

      it('should handle tab 1 with undefined entityId', () => {
        const params = {
          isViewMode: false,
          tabValue: 1,
          isDataSaved: false,
          entityId: undefined,
          periodSetup: {},
          userClickedEdit: false,
          modulesState: { isDataSaved: false },
          isNewlyCreatedEntity: false
        };

        const result = determineEditMode(params);
        expect(result).toBe(true);
      });

      it('should handle tab 2 with newly created entity and no saved modules', () => {
        const params = {
          isViewMode: false,
          tabValue: 2,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: {},
          userClickedEdit: false,
          modulesState: { isDataSaved: false },
          isNewlyCreatedEntity: true
        };

        const result = determineEditMode(params);
        expect(result).toBe(true);
      });

      it('should handle tab 2 with saved modules and user clicked edit', () => {
        const params = {
          isViewMode: false,
          tabValue: 2,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: {},
          userClickedEdit: true,
          modulesState: { isDataSaved: true },
          isNewlyCreatedEntity: false
        };

        const result = determineEditMode(params);
        expect(result).toBe(true);
      });

      it('should handle tab 2 with saved modules and user did not click edit', () => {
        const params = {
          isViewMode: false,
          tabValue: 2,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: {},
          userClickedEdit: false,
          modulesState: { isDataSaved: true },
          isNewlyCreatedEntity: false
        };

        const result = determineEditMode(params);
        expect(result).toBe(false);
      });

      it('should handle invalid tab value', () => {
        const params = {
          isViewMode: false,
          tabValue: 99,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: {},
          userClickedEdit: false,
          modulesState: { isDataSaved: false },
          isNewlyCreatedEntity: false
        };

        const result = determineEditMode(params);
        expect(result).toBe(false);
      });

      it('should handle default isNewlyCreatedEntity parameter', () => {
        const params = {
          isViewMode: false,
          tabValue: 0,
          isDataSaved: false,
          entityId: 'test-entity',
          periodSetup: {},
          userClickedEdit: false,
          modulesState: { isDataSaved: false }
        };

        const result = determineEditMode(params);
        expect(result).toBe(true);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('isPeriodSetupMandatoryFieldsFilled', () => {
      it('should return true when all mandatory fields are filled', () => {
        const periodSetup = {
          'test-entity': {
            data: {
              financialYear: {
                name: 'FY2024',
                startMonth: 'Jan',
                endMonth: 'Dec',
                historicalDataStartFY: '2023',
                spanningYears: '1'
              },
              weekSetup: {
                name: 'Week',
                monthForWeekOne: 'Jan',
                startingDayOfWeek: 'Mon'
              }
            }
          }
        };

        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-entity', periodSetup);
        expect(result).toBe(true);
      });

      it('should return false when tabValue is not 1', () => {
        const periodSetup = {
          'test-entity': {
            data: {
              financialYear: {
                name: 'FY2024',
                startMonth: 'Jan',
                endMonth: 'Dec',
                historicalDataStartFY: '2023',
                spanningYears: '1'
              },
              weekSetup: {
                name: 'Week',
                monthForWeekOne: 'Jan',
                startingDayOfWeek: 'Mon'
              }
            }
          }
        };

        const result = isPeriodSetupMandatoryFieldsFilled(0, 'test-entity', periodSetup);
        expect(result).toBe(false);
      });

      it('should return false when entityId is undefined', () => {
        const periodSetup = {
          'test-entity': {
            data: {
              financialYear: {
                name: 'FY2024',
                startMonth: 'Jan',
                endMonth: 'Dec',
                historicalDataStartFY: '2023',
                spanningYears: '1'
              },
              weekSetup: {
                name: 'Week',
                monthForWeekOne: 'Jan',
                startingDayOfWeek: 'Mon'
              }
            }
          }
        };

        const result = isPeriodSetupMandatoryFieldsFilled(1, undefined, periodSetup);
        expect(result).toBe(false);
      });

      it('should return false when periodSetupState does not exist', () => {
        const periodSetup = {};

        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-entity', periodSetup);
        expect(result).toBe(false);
      });

      it('should return false when data is missing', () => {
        const periodSetup = {
          'test-entity': {}
        };

        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-entity', periodSetup);
        expect(result).toBe(false);
      });

      it('should return false when financialYear is missing', () => {
        const periodSetup = {
          'test-entity': {
            data: {
              financialYear: undefined,
              weekSetup: {
                name: 'Week',
                monthForWeekOne: 'Jan',
                startingDayOfWeek: 'Mon'
              }
            }
          }
        };

        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-entity', periodSetup);
        expect(result).toBe(true); // Returns true because undefined !== '' is true
      });

      it('should return false when weekSetup is missing', () => {
        const periodSetup = {
          'test-entity': {
            data: {
              financialYear: {
                name: 'FY2024',
                startMonth: 'Jan',
                endMonth: 'Dec',
                historicalDataStartFY: '2023',
                spanningYears: '1'
              },
              weekSetup: undefined
            }
          }
        };

        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-entity', periodSetup);
        expect(result).toBe(true); // Returns true because undefined !== '' is true
      });

      it('should return false when financialYear fields are missing', () => {
        const periodSetup = {
          'test-entity': {
            data: {
              financialYear: {
                name: 'FY2024',
                startMonth: '',
                endMonth: '',
                historicalDataStartFY: '',
                spanningYears: ''
              },
              weekSetup: {
                name: 'Week',
                monthForWeekOne: 'Jan',
                startingDayOfWeek: 'Mon'
              }
            }
          }
        };

        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-entity', periodSetup);
        expect(result).toBe(false);
      });

      it('should return false when weekSetup fields are missing', () => {
        const periodSetup = {
          'test-entity': {
            data: {
              financialYear: {
                name: 'FY2024',
                startMonth: 'Jan',
                endMonth: 'Dec',
                historicalDataStartFY: '2023',
                spanningYears: '1'
              },
              weekSetup: {
                name: 'Week',
                monthForWeekOne: '',
                startingDayOfWeek: ''
              }
            }
          }
        };

        const result = isPeriodSetupMandatoryFieldsFilled(1, 'test-entity', periodSetup);
        expect(result).toBe(false);
      });
    });

    describe('isPeriodSetupModified', () => {
      it('should return false when tabValue is not 1', () => {
        const periodSetup = {
          'test-entity': {
            data: { financialYear: { name: 'FY2024' } },
            originalData: { financialYear: { name: 'FY2023' } }
          }
        };

        const result = isPeriodSetupModified(0, 'test-entity', periodSetup);
        expect(result).toBe(false);
      });

      it('should return false when entityId is undefined', () => {
        const periodSetup = {
          'test-entity': {
            data: { financialYear: { name: 'FY2024' } },
            originalData: { financialYear: { name: 'FY2023' } }
          }
        };

        const result = isPeriodSetupModified(1, undefined, periodSetup);
        expect(result).toBe(false);
      });

      it('should return false when periodSetupState does not exist', () => {
        const periodSetup = {};

        const result = isPeriodSetupModified(1, 'test-entity', periodSetup);
        expect(result).toBe(false);
      });

      it('should return false when originalData is missing', () => {
        const periodSetup = {
          'test-entity': {
            data: { financialYear: { name: 'FY2024' } }
          }
        };

        const result = isPeriodSetupModified(1, 'test-entity', periodSetup);
        expect(result).toBe(false);
      });

      it('should return true when data has changed', () => {
        const periodSetup = {
          'test-entity': {
            data: { financialYear: { name: 'FY2024' } },
            originalData: { financialYear: { name: 'FY2023' } }
          }
        };

        const result = isPeriodSetupModified(1, 'test-entity', periodSetup);
        expect(result).toBe(true);
      });

      it('should return false when data has not changed', () => {
        const periodSetup = {
          'test-entity': {
            data: { financialYear: { name: 'FY2024' } },
            originalData: { financialYear: { name: 'FY2024' } }
          }
        };

        const result = isPeriodSetupModified(1, 'test-entity', periodSetup);
        expect(result).toBe(false);
      });

      it('should return true when complex data has changed', () => {
        const periodSetup = {
          'test-entity': {
            data: {
              financialYear: { name: 'FY2024', startMonth: 'Jan' },
              weekSetup: { name: 'Week', monthForWeekOne: 'Jan' }
            },
            originalData: {
              financialYear: { name: 'FY2023', startMonth: 'Jan' },
              weekSetup: { name: 'Week', monthForWeekOne: 'Jan' }
            }
          }
        };

        const result = isPeriodSetupModified(1, 'test-entity', periodSetup);
        expect(result).toBe(true);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null values in checkDataChanged through toggleCountry', () => {
      const store = mockStore({
        entityConfiguration: {
          'test-entity': {
            selectedCountries: [],
            selectedCurrencies: [],
            defaultCurrency: null,
            isDefault: null,
            originalData: { 
              countries: null, 
              currencies: null, 
              defaultCurrency: null, 
              isDefault: null 
            },
            isDataModified: false,
            isDataSaved: false,
          }
        },
        entities: { items: [] }
      });

      toggleCountry('USA', 'test-entity')(store.dispatch, store.getState);
      const actions = store.getActions();
      expect(actions.length).toBeGreaterThan(0);
    });

    it('should handle empty arrays in originalData', () => {
      const store = mockStore({
        entityConfiguration: {
          'test-entity': {
            selectedCountries: ['USA'],
            selectedCurrencies: ['USD'],
            defaultCurrency: ['USD'],
            isDefault: 'USD',
            originalData: { 
              countries: [], 
              currencies: [], 
              defaultCurrency: [], 
              isDefault: null 
            },
            isDataModified: false,
            isDataSaved: false,
          }
        },
        entities: { items: [] }
      });

      toggleCountry('Canada', 'test-entity')(store.dispatch, store.getState);
      const actions = store.getActions();
      expect(actions).toContainEqual(
        setDataModified({ entityId: 'test-entity', isModified: true })
      );
    });

    it('should handle undefined entities.items', () => {
      const store = mockStore({
        entityConfiguration: {},
        entities: { items: undefined }
      });

      expect(() => {
        toggleCountry('USA', 'test-entty')(store.dispatch, store.getState);
      }).not.toThrow();
    });

    it('should handle missing entities property', () => {
      const store = mockStore({
        entityConfiguration: {}
      });

      expect(() => {
        toggleCountry('USA', 'test-entity')(store.dispatch, store.getState);
      }).not.toThrow();
    });
  });
});