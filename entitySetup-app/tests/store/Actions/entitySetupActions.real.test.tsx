import { configureStore } from '@reduxjs/toolkit';
import {
  fetchCurrencies,
  fetchModules,
  initializeEntitySetup,
  handleCountryChange,
  handleFileUpload,
  submitEntitySetup,
  updateEntitySetup,
  updateEntityPartial,
  deleteEntity,
  saveEntityCountriesAndCurrencies,
  fetchEntityHierarchy,
  saveEntityModulesAction,
  updateEntityProgressPercentage
} from '../../../src/store/Actions/entitySetupActions';

// Mock all dependencies
jest.mock('../../../src/data/countriesStates', () => ({
  default: {
    countries: [
      { name: 'US', states: ['California', 'New York'] },
      { name: 'CA', states: ['Ontario', 'Quebec'] }
    ]
  }
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
  formatTimestamp: jest.fn(() => '2023-01-01T00:00:00.000Z'),
  saveDataApiCall: jest.fn()
}));

// Import mocked functions
const mockSaveEntity = require('../../../src/services/entitySaveService').saveEntity;
const mockSaveEntityPartialUpdate = require('../../../src/services/entitySaveService').saveEntityPartialUpdate;
const mockSaveEntityModules = require('../../../src/services/entitySaveService').saveEntityModules;
const mockFetchCountryStateMap = require('../../../src/services/countryStateService').fetchCountryStateMap;
const mockGetCurrenciesForCountry = require('../../../src/services/countryStateService').getCurrenciesForCountry;
const mockFetchCurrenciesFromApi = require('../../../src/services/currencyService').fetchCurrenciesFromApi;
const mockFetchModulesFromApi = require('../../../src/services/moduleService').fetchModulesFromApi;
const mockConvertFileToBase64 = require('commonApp/imageUtils').convertFileToBase64;
const mockValidateImageFile = require('commonApp/imageUtils').validateImageFile;
const mockFetchEntities = require('../../../src/store/Reducers/entitySlice').fetchEntities;
const mockUpdateEntityIsEnabled = require('../../../src/store/Reducers/entitySlice').updateEntityIsEnabled;
const mockFetchEntityHierarchyFromApi = require('../../../src/services/entitySetupService').fetchEntityHierarchyFromApi;
const mockSetDataSaved = require('../../../src/store/Actions/entityConfigurationActions').setDataSaved;
const mockFormatTimestamp = require('../../../src/utils/apiUtils').formatTimestamp;
const mockSaveDataApiCall = require('../../../src/utils/apiUtils').saveDataApiCall;

describe('entitySetupActions - Real Async Functions', () => {
  let store: any;
  let mockDispatch: jest.Mock;
  let mockGetState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock store
    store = configureStore({
      reducer: {
        entitySetup: (state = {
          loading: false,
          error: null,
          success: null,
          countryStateMap: {}
        }, action) => state
      }
    });

    mockDispatch = jest.fn();
    mockGetState = jest.fn(() => ({
      entitySetup: {
        countryStateMap: {
          'US': { states: ['California', 'New York'], currencies: ['USD'] },
          'CA': { states: ['Ontario', 'Quebec'], currencies: ['CAD'] }
        }
      }
    }));
  });

  describe('fetchCurrencies', () => {
    it('should fetch currencies successfully', async () => {
      const mockCurrencies = [
        { id: 'USD', currencyName: 'US Dollar' },
        { id: 'EUR', currencyName: 'Euro' }
      ];
      mockFetchCurrenciesFromApi.mockResolvedValue(mockCurrencies);

      const thunk = fetchCurrencies();
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: true });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setCurrencies', payload: mockCurrencies });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: false });
    });

    it('should handle fetch currencies error', async () => {
      mockFetchCurrenciesFromApi.mockRejectedValue(new Error('API Error'));

      const thunk = fetchCurrencies();
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to fetch currencies' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setCurrencies', payload: [] });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: false });
    });
  });

  describe('fetchModules', () => {
    it('should fetch modules successfully', async () => {
      const mockModules = [
        { id: '1', name: 'Module 1', description: 'Description 1', isEnabled: true, isConfigured: false },
        { id: '2', name: 'Module 2', description: 'Description 2', isEnabled: false, isConfigured: true }
      ];
      mockFetchModulesFromApi.mockResolvedValue(mockModules);

      const thunk = fetchModules();
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: true });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setModules', payload: mockModules });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: false });
    });

    it('should handle fetch modules error', async () => {
      mockFetchModulesFromApi.mockRejectedValue(new Error('API Error'));

      const thunk = fetchModules();
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to fetch modules' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setModules', payload: [] });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: false });
    });
  });

  describe('initializeEntitySetup', () => {
    it('should initialize with API data successfully', async () => {
      const mockMap = {
        'US': { states: ['California', 'New York'], currencies: ['USD'] },
        'CA': { states: ['Ontario', 'Quebec'], currencies: ['CAD'] }
      };
      const mockCurrencies = [
        { id: 'USD', currencyName: 'US Dollar' },
        { id: 'CAD', currencyName: 'Canadian Dollar' }
      ];

      mockFetchCountryStateMap.mockResolvedValue(mockMap);
      mockFetchCurrenciesFromApi.mockResolvedValue(mockCurrencies);

      const thunk = initializeEntitySetup();
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: true });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setCountryStateMap', payload: mockMap });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setCountries', payload: ['CA', 'US'] });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setCurrencies', payload: mockCurrencies });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setEntityTypes', payload: ['Planning Entity', 'Rollup Entity'] });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/resetForm' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: false });
    });

    it('should initialize with fallback data when API fails', async () => {
      mockFetchCountryStateMap.mockRejectedValue(new Error('API Error'));
      mockFetchCurrenciesFromApi.mockRejectedValue(new Error('API Error'));

      const thunk = initializeEntitySetup();
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to initialize entity setup' });
    });

    it('should skip reset when skipReset is true', async () => {
      mockFetchCountryStateMap.mockResolvedValue({});
      mockFetchCurrenciesFromApi.mockResolvedValue([]);

      const thunk = initializeEntitySetup({ skipReset: true });
      await thunk(mockDispatch);

      expect(mockDispatch).not.toHaveBeenCalledWith({ type: 'entitySetup/resetForm' });
    });

    it('should handle initialization error', async () => {
      mockFetchCountryStateMap.mockRejectedValue(new Error('API Error'));
      mockFetchCurrenciesFromApi.mockRejectedValue(new Error('API Error'));

      const thunk = initializeEntitySetup();
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to initialize entity setup' });
    });
  });

  describe('handleCountryChange', () => {
    it('should handle country change with API map data', async () => {
      const mockCurrencies = ['USD', 'EUR'];
      mockGetCurrenciesForCountry.mockResolvedValue(mockCurrencies);

      const thunk = handleCountryChange('US');
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/updateField', payload: { field: 'country', value: 'US' } });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/updateField', payload: { field: 'state', value: '' } });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setStates', payload: ['California', 'New York'] });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/updateField', payload: { field: 'currencies', value: expect.any(String) } });
    });

    it('should handle country change with fallback data', async () => {
      mockGetState.mockReturnValue({ entitySetup: { countryStateMap: {} } });
      mockGetCurrenciesForCountry.mockRejectedValue(new Error('API Error'));

      const thunk = handleCountryChange('US');
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to update country selection' });
    });

    it('should handle country change error', async () => {
      mockGetState.mockReturnValue({ entitySetup: { countryStateMap: {} } });
      mockGetCurrenciesForCountry.mockRejectedValue(new Error('API Error'));

      const thunk = handleCountryChange('US');
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to update country selection' });
    });
  });

  describe('handleFileUpload', () => {
    it('should handle valid file upload successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockBase64 = 'data:image/jpeg;base64,test';
      
      mockValidateImageFile.mockReturnValue({ isValid: true });
      mockConvertFileToBase64.mockResolvedValue({ success: true, data: mockBase64 });

      const thunk = handleFileUpload(mockFile);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setFileUpload', payload: mockFile });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/updateField', payload: { field: 'logo', value: mockBase64 } });
    });

    it('should handle invalid file validation', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      mockValidateImageFile.mockReturnValue({ isValid: false, error: 'Invalid file type' });

      const thunk = handleFileUpload(mockFile);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Invalid file type' });
    });

    it('should handle file conversion error', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      mockValidateImageFile.mockReturnValue({ isValid: true });
      mockConvertFileToBase64.mockResolvedValue({ success: false, error: 'Conversion failed' });

      const thunk = handleFileUpload(mockFile);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Conversion failed' });
    });

    it('should handle file upload error', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      mockValidateImageFile.mockImplementation(() => {
        throw new Error('Validation error');
      });

      const thunk = handleFileUpload(mockFile);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to upload file' });
    });
  });

  describe('submitEntitySetup', () => {
    it('should submit entity setup successfully without addAnother', async () => {
      const formData = { name: 'Test Entity', addAnother: false };
      mockSaveEntity.mockResolvedValue({});
      mockFetchEntities.mockResolvedValue({});
      mockFetchEntityHierarchyFromApi.mockResolvedValue({});

      const thunk = submitEntitySetup(formData);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: true });
      expect(mockSaveEntity).toHaveBeenCalledWith(expect.objectContaining({
        ...formData,
        isDeleted: false,
        isConfigured: false,
        isEnabled: true,
        softDeleted: false,
        setAsDefault: false
      }), 'n');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/resetForm' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: false });
    });

    it('should submit entity setup with addAnother checked', async () => {
      const formData = { name: 'Test Entity', addAnother: true };
      mockSaveEntity.mockResolvedValue({});
      mockFetchEntities.mockResolvedValue({});
      mockFetchEntityHierarchyFromApi.mockResolvedValue({});

      const thunk = submitEntitySetup(formData);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setFormData', payload: expect.objectContaining({
        addAnother: false,
        setAsDefault: false,
        country: '',
        state: '',
        legalBusinessName: '',
        displayName: '',
        entityType: '',
        assignedEntity: [],
        addressLine1: '',
        addressLine2: '',
        city: '',
        pinZipCode: '',
        entityLogo: null,
        logo: null,
        currencies: undefined,
        isDeleted: false,
        isConfigured: false,
        isEnabled: true,
        softDeleted: false
      }) });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setStates', payload: [] });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setSuccess', payload: 'Entity saved successfully. Add another entity.' });
    });

    it('should handle submit error', async () => {
      const formData = { name: 'Test Entity' };
      mockSaveEntity.mockRejectedValue(new Error('Save failed'));

      const thunk = submitEntitySetup(formData);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to submit entity setup' });
    });
  });

  describe('updateEntitySetup', () => {
    it('should update entity setup successfully', async () => {
      const formData = { id: '1', name: 'Updated Entity' };
      mockSaveEntity.mockResolvedValue({});
      mockFetchEntities.mockResolvedValue({});

      const thunk = updateEntitySetup(formData);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: true });
      expect(mockSaveEntity).toHaveBeenCalledWith(formData, 'u');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setSuccess', payload: 'Entity updated successfully' });
    });

    it('should handle update error', async () => {
      const formData = { id: '1', name: 'Updated Entity' };
      mockSaveEntity.mockRejectedValue(new Error('Update failed'));

      const thunk = updateEntitySetup(formData);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to update entity' });
    });
  });

  describe('updateEntityPartial', () => {
    it('should update entity partial successfully', async () => {
      const formData = { id: '1', isEnabled: true };
      mockSaveEntityPartialUpdate.mockResolvedValue({});

      const thunk = updateEntityPartial(formData);
      await thunk(mockDispatch);

      expect(mockSaveEntityPartialUpdate).toHaveBeenCalledWith(formData, 'u');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setSuccess', payload: 'Entity updated successfully' });
    });

    it('should handle update partial error', async () => {
      const formData = { id: '1', isEnabled: true };
      mockSaveEntityPartialUpdate.mockRejectedValue(new Error('Update failed'));

      const thunk = updateEntityPartial(formData);
      
      await expect(thunk(mockDispatch)).rejects.toThrow('Update failed');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to update entity' });
    });
  });

  describe('deleteEntity', () => {
    it('should delete entity successfully', async () => {
      const entityId = '1';
      mockSaveEntity.mockResolvedValue({});

      const thunk = deleteEntity(entityId);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: true });
      expect(mockSaveEntity).toHaveBeenCalledWith(expect.objectContaining({
        id: entityId,
        softDeleted: true,
        lastUpdatedAt: expect.any(String)
      }), 'u');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: false });
    });

    it('should handle delete error', async () => {
      const entityId = '1';
      mockSaveEntity.mockRejectedValue(new Error('Delete failed'));

      const thunk = deleteEntity(entityId);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to delete entity' });
    });
  });

  describe('saveEntityCountriesAndCurrencies', () => {
    it('should save countries and currencies successfully', async () => {
      const entityId = '1';
      const countriesData = ['US', 'CA'];
      const currenciesData = ['USD', 'CAD'];
      const isRollupEntity = false;
      const currentProgress = 0;

      mockSaveDataApiCall.mockResolvedValue({});
      mockFetchEntities.mockResolvedValue({});

      const thunk = saveEntityCountriesAndCurrencies(entityId, countriesData, currenciesData, isRollupEntity, currentProgress);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: true });
      expect(mockSaveDataApiCall).toHaveBeenCalledWith({
        tableName: 'entity',
        csvData: expect.any(Array),
        hasHeaders: true,
        uniqueColumn: 'id'
      });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setSuccess', payload: 'Countries and currencies saved successfully' });
    });

    it('should handle save countries and currencies error', async () => {
      const entityId = '1';
      const countriesData = ['US'];
      const currenciesData = ['USD'];

      mockSaveDataApiCall.mockRejectedValue(new Error('Save failed'));

      const thunk = saveEntityCountriesAndCurrencies(entityId, countriesData, currenciesData);
      
      await expect(thunk(mockDispatch)).rejects.toThrow('Save failed');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to save countries and currencies' });
    });
  });

  describe('fetchEntityHierarchy', () => {
    it('should fetch entity hierarchy successfully', async () => {
      mockFetchEntityHierarchyFromApi.mockResolvedValue({});

      const thunk = fetchEntityHierarchy();
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: true });
      expect(mockFetchEntityHierarchyFromApi).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: false });
    });

    it('should handle fetch entity hierarchy error', async () => {
      mockFetchEntityHierarchyFromApi.mockRejectedValue(new Error('API Error'));

      const thunk = fetchEntityHierarchy();
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to fetch entity hierarchy' });
    });
  });

  describe('saveEntityModulesAction', () => {
    it('should save entity modules successfully', async () => {
      const entityId = '1';
      const activeModules = ['module1', 'module2'];
      
      mockSaveEntityModules.mockResolvedValue({});
      mockFetchEntities.mockResolvedValue({});

      const thunk = saveEntityModulesAction(entityId, activeModules);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: true });
      expect(mockSaveEntityModules).toHaveBeenCalledWith(entityId, activeModules);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setSuccess', payload: 'Entity modules saved successfully' });
    });

    it('should handle save entity modules error', async () => {
      const entityId = '1';
      const activeModules = ['module1'];
      
      mockSaveEntityModules.mockRejectedValue(new Error('Save failed'));

      const thunk = saveEntityModulesAction(entityId, activeModules);
      
      await expect(thunk(mockDispatch)).rejects.toThrow('Save failed');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to save entity modules' });
    });
  });

  describe('updateEntityProgressPercentage', () => {
    it('should update entity progress percentage successfully', async () => {
      const entityId = '1';
      const progressPercentage = '50';
      
      mockSaveEntityPartialUpdate.mockResolvedValue({});
      mockFetchEntities.mockResolvedValue({});

      const thunk = updateEntityProgressPercentage(entityId, progressPercentage);
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setLoading', payload: true });
      expect(mockSaveEntityPartialUpdate).toHaveBeenCalledWith(expect.objectContaining({
        id: entityId,
        progressPercentage,
        lastUpdatedAt: expect.any(String),
        legalBusinessName: '',
        displayName: '',
        entityType: ''
      }), 'u');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setSuccess', payload: 'Entity progress updated to 50%' });
    });

    it('should update entity progress percentage with skip refresh', async () => {
      const entityId = '1';
      const progressPercentage = '75';
      
      mockSaveEntityPartialUpdate.mockResolvedValue({});

      const thunk = updateEntityProgressPercentage(entityId, progressPercentage, true);
      await thunk(mockDispatch);

      expect(mockSaveEntityPartialUpdate).toHaveBeenCalled();
      expect(mockFetchEntities).not.toHaveBeenCalled();
    });

    it('should handle update entity progress percentage error', async () => {
      const entityId = '1';
      const progressPercentage = '50';
      
      mockSaveEntityPartialUpdate.mockRejectedValue(new Error('Update failed'));

      const thunk = updateEntityProgressPercentage(entityId, progressPercentage);
      
      await expect(thunk(mockDispatch)).rejects.toThrow('Update failed');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'entitySetup/setError', payload: 'Failed to update progress to 50%' });
    });
  });
});
