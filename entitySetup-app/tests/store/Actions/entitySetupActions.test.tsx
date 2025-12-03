import {
  ENTITY_SETUP_ACTIONS,
  setFormData,
  updateField,
  resetForm,
  setLoading,
  setError,
  setSuccess,
  setCountries,
  setCurrencies,
  setEntityTypes,
  setStates,
  setCountryStateMap,
  setFileUpload,
  validateForm,
  submitForm,
  setEditMode,
  setOriginalFormData,
  setFormModified,
  fetchHierarchy,
  setModules,
  fetchCurrencies,
  fetchModules,
  initializeEntitySetup,
  handleCountryChange,
  handleFileUpload,
  handleImageValidation,
  saveEntity,
  updateEntity,
  saveEntityModules,
  fetchEntityHierarchy
} from '../../../src/store/Actions/entitySetupActions';

// Mock the dependencies
jest.mock('../../../src/data/countriesStates', () => ({
  default: [
    { country: 'US', states: ['California', 'New York'] },
    { country: 'CA', states: ['Ontario', 'Quebec'] }
  ]
}));

jest.mock('../../../src/services/entitySaveService', () => ({
  saveEntity: jest.fn(),
  saveEntityPartialUpdate: jest.fn(),
  saveEntityModules: jest.fn()
}));

jest.mock('../../../src/services/countryStateService', () => ({
  fetchCountryStateMap: jest.fn(),
  getCurrenciesForCountry: jest.fn()
}));

jest.mock('../../../src/services/currencyService', () => ({
  fetchCurrenciesFromApi: jest.fn()
}));

jest.mock('../../../src/services/moduleService', () => ({
  fetchModulesFromApi: jest.fn()
}));

jest.mock('commonApp/imageUtils', () => ({
  convertFileToBase64: jest.fn(),
  validateImageFile: jest.fn()
}));

jest.mock('../../../src/store/Reducers/entitySlice', () => ({
  fetchEntities: jest.fn(),
  updateEntityIsEnabled: jest.fn()
}));

jest.mock('../../../src/services/entitySetupService', () => ({
  fetchEntityHierarchyFromApi: jest.fn()
}));

jest.mock('../../../src/store/Actions/entityConfigurationActions', () => ({
  setDataSaved: jest.fn()
}));

jest.mock('../../../src/utils/apiUtils', () => ({
  formatTimestamp: jest.fn(),
  saveDataApiCall: jest.fn()
}));

describe('entitySetupActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Action Types', () => {
    it('defines all required action types', () => {
      expect(ENTITY_SETUP_ACTIONS.SET_FORM_DATA).toBe('entitySetup/setFormData');
      expect(ENTITY_SETUP_ACTIONS.UPDATE_FIELD).toBe('entitySetup/updateField');
      expect(ENTITY_SETUP_ACTIONS.RESET_FORM).toBe('entitySetup/resetForm');
      expect(ENTITY_SETUP_ACTIONS.SET_LOADING).toBe('entitySetup/setLoading');
      expect(ENTITY_SETUP_ACTIONS.SET_ERROR).toBe('entitySetup/setError');
      expect(ENTITY_SETUP_ACTIONS.SET_SUCCESS).toBe('entitySetup/setSuccess');
      expect(ENTITY_SETUP_ACTIONS.SET_COUNTRIES).toBe('entitySetup/setCountries');
      expect(ENTITY_SETUP_ACTIONS.SET_CURRENCIES).toBe('entitySetup/setCurrencies');
      expect(ENTITY_SETUP_ACTIONS.SET_ENTITY_TYPES).toBe('entitySetup/setEntityTypes');
      expect(ENTITY_SETUP_ACTIONS.SET_STATES).toBe('entitySetup/setStates');
      expect(ENTITY_SETUP_ACTIONS.SET_COUNTRY_STATE_MAP).toBe('entitySetup/setCountryStateMap');
      expect(ENTITY_SETUP_ACTIONS.SET_FILE_UPLOAD).toBe('entitySetup/setFileUpload');
      expect(ENTITY_SETUP_ACTIONS.VALIDATE_FORM).toBe('entitySetup/validateForm');
      expect(ENTITY_SETUP_ACTIONS.SUBMIT_FORM).toBe('entitySetup/submitForm');
      expect(ENTITY_SETUP_ACTIONS.SET_EDIT_MODE).toBe('entitySetup/setEditMode');
      expect(ENTITY_SETUP_ACTIONS.SET_ORIGINAL_FORM_DATA).toBe('entitySetup/setOriginalFormData');
      expect(ENTITY_SETUP_ACTIONS.SET_FORM_MODIFIED).toBe('entitySetup/setFormModified');
      expect(ENTITY_SETUP_ACTIONS.FETCH_HIERARCHY).toBe('entitySetup/fetchHierarchy');
      expect(ENTITY_SETUP_ACTIONS.SET_MODULES).toBe('entitySetup/setModules');
    });
  });

  describe('Basic Action Creators', () => {
    it('creates setFormData action', () => {
      const formData = { name: 'Test Entity', type: 'Business' };
      const action = setFormData(formData);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_FORM_DATA);
      expect(action.payload).toEqual(formData);
    });

    it('creates updateField action', () => {
      const fieldData = { field: 'name', value: 'Updated Name' };
      const action = updateField(fieldData);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.UPDATE_FIELD);
      expect(action.payload).toEqual(fieldData);
    });

    it('creates resetForm action', () => {
      const action = resetForm();
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.RESET_FORM);
      expect(action.payload).toBeUndefined();
    });

    it('creates setLoading action', () => {
      const action = setLoading(true);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_LOADING);
      expect(action.payload).toBe(true);
    });

    it('creates setError action', () => {
      const errorMessage = 'Test error';
      const action = setError(errorMessage);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_ERROR);
      expect(action.payload).toBe(errorMessage);
    });

    it('creates setSuccess action', () => {
      const successMessage = 'Test success';
      const action = setSuccess(successMessage);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_SUCCESS);
      expect(action.payload).toBe(successMessage);
    });

    it('creates setCountries action', () => {
      const countries = ['US', 'CA', 'UK'];
      const action = setCountries(countries);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_COUNTRIES);
      expect(action.payload).toEqual(countries);
    });

    it('creates setCurrencies action', () => {
      const currencies = [
        { id: 'USD', currencyName: 'US Dollar' },
        { id: 'CAD', currencyName: 'Canadian Dollar' }
      ];
      const action = setCurrencies(currencies);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_CURRENCIES);
      expect(action.payload).toEqual(currencies);
    });

    it('creates setEntityTypes action', () => {
      const entityTypes = ['Business', 'Individual'];
      const action = setEntityTypes(entityTypes);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_ENTITY_TYPES);
      expect(action.payload).toEqual(entityTypes);
    });

    it('creates setStates action', () => {
      const states = ['California', 'New York', 'Texas'];
      const action = setStates(states);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_STATES);
      expect(action.payload).toEqual(states);
    });

    it('creates setCountryStateMap action', () => {
      const countryStateMap = {
        'US': { states: ['CA', 'NY'], currencies: ['USD'] },
        'CA': { states: ['ON', 'QC'], currencies: ['CAD'] }
      };
      const action = setCountryStateMap(countryStateMap);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_COUNTRY_STATE_MAP);
      expect(action.payload).toEqual(countryStateMap);
    });

    it('creates setFileUpload action', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const action = setFileUpload(file);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_FILE_UPLOAD);
      expect(action.payload).toBe(file);
    });

    it('creates validateForm action', () => {
      const action = validateForm();
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.VALIDATE_FORM);
      expect(action.payload).toBeUndefined();
    });

    it('creates submitForm action', () => {
      const action = submitForm();
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SUBMIT_FORM);
      expect(action.payload).toBeUndefined();
    });

    it('creates setEditMode action', () => {
      const action = setEditMode(true);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_EDIT_MODE);
      expect(action.payload).toBe(true);
    });

    it('creates setOriginalFormData action', () => {
      const originalData = { name: 'Original Entity' };
      const action = setOriginalFormData(originalData);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_ORIGINAL_FORM_DATA);
      expect(action.payload).toEqual(originalData);
    });

    it('creates setFormModified action', () => {
      const action = setFormModified(true);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_FORM_MODIFIED);
      expect(action.payload).toBe(true);
    });

    it('creates fetchHierarchy action', () => {
      const action = fetchHierarchy();
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.FETCH_HIERARCHY);
      expect(action.payload).toBeUndefined();
    });

    it('creates setModules action', () => {
      const modules = ['Module1', 'Module2'];
      const action = setModules(modules);
      expect(action.type).toBe(ENTITY_SETUP_ACTIONS.SET_MODULES);
      expect(action.payload).toEqual(modules);
    });
  });

  describe('Async Action Creators', () => {
    it('creates fetchCurrencies action', () => {
      const action = fetchCurrencies();
      expect(typeof action).toBe('function');
    });

    it('creates fetchModules action', () => {
      const action = fetchModules();
      expect(typeof action).toBe('function');
    });

    it('creates initializeEntitySetup action', () => {
      const action = initializeEntitySetup();
      expect(typeof action).toBe('function');
    });

    it('creates handleCountryChange action', () => {
      const action = handleCountryChange('US');
      expect(typeof action).toBe('function');
    });

    it('creates handleFileUpload action', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const action = handleFileUpload(file);
      expect(typeof action).toBe('function');
    });


    it('creates fetchEntityHierarchy action', () => {
      const action = fetchEntityHierarchy();
      expect(typeof action).toBe('function');
    });
  });

  describe('Action Creator Properties', () => {
    it('has correct action creator types', () => {
      expect(typeof setFormData).toBe('function');
      expect(typeof updateField).toBe('function');
      expect(typeof resetForm).toBe('function');
      expect(typeof setLoading).toBe('function');
      expect(typeof setError).toBe('function');
      expect(typeof setSuccess).toBe('function');
      expect(typeof setCountries).toBe('function');
      expect(typeof setCurrencies).toBe('function');
      expect(typeof setEntityTypes).toBe('function');
      expect(typeof setStates).toBe('function');
      expect(typeof setCountryStateMap).toBe('function');
      expect(typeof setFileUpload).toBe('function');
      expect(typeof validateForm).toBe('function');
      expect(typeof submitForm).toBe('function');
      expect(typeof setEditMode).toBe('function');
      expect(typeof setOriginalFormData).toBe('function');
      expect(typeof setFormModified).toBe('function');
      expect(typeof fetchHierarchy).toBe('function');
      expect(typeof setModules).toBe('function');
    });
  });

  describe('Action Creator Consistency', () => {
    it('maintains consistent action structure', () => {
      const actions = [
        setFormData({}),
        updateField({ field: 'test', value: 'test' }),
        resetForm(),
        setLoading(true),
        setError('test'),
        setSuccess('test'),
        setCountries([]),
        setCurrencies([]),
        setEntityTypes([]),
        setStates([]),
        setCountryStateMap({}),
        setFileUpload(null),
        validateForm(),
        submitForm(),
        setEditMode(true),
        setOriginalFormData({}),
        setFormModified(true),
        fetchHierarchy(),
        setModules([])
      ];

      actions.forEach(action => {
        expect(action).toHaveProperty('type');
        expect(typeof action.type).toBe('string');
        expect(action.type).toMatch(/^entitySetup\//);
      });
    });
  });

  describe('Action Payload Types', () => {
    it('handles different payload types correctly', () => {
      // String payload
      const stringAction = setError('Error message');
      expect(stringAction.payload).toBe('Error message');

      // Boolean payload
      const booleanAction = setLoading(true);
      expect(booleanAction.payload).toBe(true);

      // Object payload
      const objectAction = setFormData({ name: 'Test' });
      expect(objectAction.payload).toEqual({ name: 'Test' });

      // Array payload
      const arrayAction = setCountries(['US', 'CA']);
      expect(arrayAction.payload).toEqual(['US', 'CA']);

      // Null payload
      const nullAction = setFileUpload(null);
      expect(nullAction.payload).toBeNull();

      // Undefined payload
      const undefinedAction = resetForm();
      expect(undefinedAction.payload).toBeUndefined();
    });
  });

  describe('Action Type Constants', () => {
    it('has unique action type constants', () => {
      const actionTypes = Object.values(ENTITY_SETUP_ACTIONS);
      const uniqueActionTypes = [...new Set(actionTypes)];
      expect(actionTypes.length).toBe(uniqueActionTypes.length);
    });

    it('has properly formatted action type constants', () => {
      Object.values(ENTITY_SETUP_ACTIONS).forEach(actionType => {
        expect(actionType).toMatch(/^entitySetup\//);
        expect(typeof actionType).toBe('string');
        expect(actionType.length).toBeGreaterThan(0);
      });
    });
  });
});
