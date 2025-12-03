import { 
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

// Mock the dependencies
jest.mock('../../../src/data/countriesStates', () => ({
  default: {
    countries: [
      { name: 'United States', states: ['California', 'New York'] },
      { name: 'Canada', states: ['Ontario', 'Quebec'] }
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
  formatTimestamp: jest.fn(),
  saveDataApiCall: jest.fn()
}));

// Import mocked modules
import { saveEntity, saveEntityPartialUpdate, saveEntityModules } from '../../../src/services/entitySaveService';
import { fetchCountryStateMap, getCurrenciesForCountry } from '../../../src/services/countryStateService';
import { convertFileToBase64, validateImageFile } from 'commonApp/imageUtils';
import { fetchEntities, updateEntityIsEnabled } from '../../../src/store/Reducers/entitySlice';
import { fetchEntityHierarchyFromApi } from '../../../src/services/entitySetupService';
import { setDataSaved } from '../../../src/store/Actions/entityConfigurationActions';
import { formatTimestamp, saveDataApiCall } from '../../../src/utils/apiUtils';

describe('entitySetupActions Async Thunks', () => {
  let mockDispatch: jest.Mock;
  let mockGetState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch = jest.fn();
    mockGetState = jest.fn();
  });

  describe('handleCountryChange', () => {
    it('should handle country selection with API map', async () => {
      const country = 'US';
      const mockStates = ['California', 'New York'];
      const mockCurrencies = ['USD'];
      
      mockGetState.mockReturnValue({
        entitySetup: {
          countryStateMap: {
            'US': { states: mockStates, currencies: mockCurrencies }
          }
        }
      });

      const thunk = handleCountryChange(country);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setStates',
          payload: mockStates
        })
      );
    });

    it('should handle currency selection for country', async () => {
      const country = 'US';
      const mockCurrencies = ['USD'];
      
      mockGetState.mockReturnValue({
        entitySetup: {
          countryStateMap: {
            'US': { states: ['CA'], currencies: mockCurrencies }
          }
        }
      });

      const thunk = handleCountryChange(country);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/updateField',
          payload: {
            field: 'currencies',
            value: expect.stringContaining('USD')
          }
        })
      );
    });

    it('should handle errors in country selection', async () => {
      const country = 'US';
      
      mockGetState.mockReturnValue({
        entitySetup: {
          countryStateMap: null
        }
      });

      (getCurrenciesForCountry as jest.Mock).mockRejectedValue(new Error('API Error'));

      const thunk = handleCountryChange(country);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Failed to update country selection'
        })
      );
    });
  });

  describe('handleFileUpload', () => {
    it('should handle valid file upload', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockBase64 = 'base64encodedstring';
      
      (validateImageFile as jest.Mock).mockReturnValue({ isValid: true });
      (convertFileToBase64 as jest.Mock).mockResolvedValue({ 
        success: true, 
        data: mockBase64 
      });

      const thunk = handleFileUpload(file);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setFileUpload',
          payload: file
        })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/updateField',
          payload: {
            field: 'logo',
            value: mockBase64
          }
        })
      );
    });

    it('should handle invalid file validation', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      (validateImageFile as jest.Mock).mockReturnValue({ 
        isValid: false, 
        error: 'Invalid file type' 
      });

      const thunk = handleFileUpload(file);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Invalid file type'
        })
      );
    });

    it('should handle file conversion error', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      (validateImageFile as jest.Mock).mockReturnValue({ isValid: true });
      (convertFileToBase64 as jest.Mock).mockResolvedValue({ 
        success: false, 
        error: 'Conversion failed' 
      });

      const thunk = handleFileUpload(file);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Conversion failed'
        })
      );
    });

    it('should handle unexpected errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      (validateImageFile as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const thunk = handleFileUpload(file);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Failed to upload file'
        })
      );
    });
  });

  describe('submitEntitySetup', () => {
    it('should submit entity setup successfully without addAnother', async () => {
      const formData = {
        id: '123',
        name: 'Test Entity',
        addAnother: false
      };
      
      (saveEntity as jest.Mock).mockResolvedValue(undefined);
      (fetchEntities as jest.Mock).mockResolvedValue(undefined);

      const thunk = submitEntitySetup(formData);
      await thunk(mockDispatch, mockGetState);

      expect(saveEntity).toHaveBeenCalledWith(
        expect.objectContaining({
          ...formData,
          isDeleted: false,
          isConfigured: false,
          isEnabled: true,
          softDeleted: false,
          setAsDefault: false
        }),
        'u'
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setLoading',
          payload: true
        })
      );
    });

    it('should submit entity setup successfully with addAnother', async () => {
      const formData = {
        id: '123',
        name: 'Test Entity',
        addAnother: true
      };
      
      (saveEntity as jest.Mock).mockResolvedValue(undefined);
      (fetchEntities as jest.Mock).mockResolvedValue(undefined);

      const thunk = submitEntitySetup(formData);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setSuccess',
          payload: 'Entity saved successfully. Add another entity.'
        })
      );
    });

    it('should handle submission errors', async () => {
      const formData = { name: 'Test Entity' };
      
      (saveEntity as jest.Mock).mockRejectedValue(new Error('Save failed'));

      const thunk = submitEntitySetup(formData);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Failed to submit entity setup'
        })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setLoading',
          payload: false
        })
      );
    });
  });

  describe('updateEntitySetup', () => {
    it('should update entity setup successfully', async () => {
      const formData = { id: '123', name: 'Updated Entity' };
      
      (saveEntity as jest.Mock).mockResolvedValue(undefined);
      (fetchEntities as jest.Mock).mockResolvedValue(undefined);

      const thunk = updateEntitySetup(formData);
      await thunk(mockDispatch, mockGetState);

      expect(saveEntity).toHaveBeenCalledWith(formData, 'u');
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setSuccess',
          payload: 'Entity updated successfully'
        })
      );
    });

    it('should handle update errors', async () => {
      const formData = { id: '123', name: 'Updated Entity' };
      
      (saveEntity as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const thunk = updateEntitySetup(formData);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Failed to update entity'
        })
      );
    });
  });

  describe('updateEntityPartial', () => {
    it('should update entity partial successfully', async () => {
      const formData = { id: '123', isEnabled: true };
      
      (saveEntityPartialUpdate as jest.Mock).mockResolvedValue(undefined);

      const thunk = updateEntityPartial(formData);
      await thunk(mockDispatch, mockGetState);

      expect(saveEntityPartialUpdate).toHaveBeenCalledWith(formData, 'u');
      expect(updateEntityIsEnabled).toHaveBeenCalledWith({
        id: '123',
        isEnabled: true
      });
    });

    it('should handle partial update errors', async () => {
      const formData = { id: '123', isEnabled: true };
      
      (saveEntityPartialUpdate as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const thunk = updateEntityPartial(formData);
      
      await expect(thunk(mockDispatch, mockGetState)).rejects.toThrow('Update failed');
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Failed to update entity'
        })
      );
    });
  });

  describe('deleteEntity', () => {
    it('should delete entity successfully', async () => {
      const entityId = '123';
      
      (saveEntity as jest.Mock).mockResolvedValue(undefined);

      const thunk = deleteEntity(entityId);
      await thunk(mockDispatch, mockGetState);

      expect(saveEntity).toHaveBeenCalledWith(
        expect.objectContaining({
          id: entityId,
          softDeleted: true,
          lastUpdatedAt: expect.any(String)
        }),
        'u'
      );
    });

    it('should handle delete errors', async () => {
      const entityId = '123';
      
      (saveEntity as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const thunk = deleteEntity(entityId);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Failed to delete entity'
        })
      );
    });
  });

  describe('saveEntityCountriesAndCurrencies', () => {
    it('should save countries and currencies successfully', async () => {
      const entityId = '123';
      const countriesData = { countries: ['US', 'CA'] };
      const currenciesData = { currencies: ['USD', 'CAD'] };
      const isRollupEntity = false;
      const currentProgress = 0;
      
      (formatTimestamp as jest.Mock).mockReturnValue('2024-01-01T00:00:00Z');
      (saveDataApiCall as jest.Mock).mockResolvedValue(undefined);
      (fetchEntities as jest.Mock).mockResolvedValue(undefined);

      const thunk = saveEntityCountriesAndCurrencies(
        entityId, 
        countriesData, 
        currenciesData, 
        isRollupEntity, 
        currentProgress
      );
      await thunk(mockDispatch, mockGetState);

      expect(saveDataApiCall).toHaveBeenCalledWith(
        expect.objectContaining({
          tableName: 'entity',
          csvData: expect.any(Array),
          hasHeaders: true,
          uniqueColumn: 'id'
        })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setSuccess',
          payload: 'Countries and currencies saved successfully'
        })
      );
    });

    it('should handle rollup entity progress calculation', async () => {
      const entityId = '123';
      const countriesData = { countries: ['US'] };
      const currenciesData = { currencies: ['USD'] };
      const isRollupEntity = true;
      const currentProgress = 0;
      
      (formatTimestamp as jest.Mock).mockReturnValue('2024-01-01T00:00:00Z');
      (saveDataApiCall as jest.Mock).mockResolvedValue(undefined);
      (fetchEntities as jest.Mock).mockResolvedValue(undefined);

      const thunk = saveEntityCountriesAndCurrencies(
        entityId, 
        countriesData, 
        currenciesData, 
        isRollupEntity, 
        currentProgress
      );
      await thunk(mockDispatch, mockGetState);

      expect(saveDataApiCall).toHaveBeenCalledWith(
        expect.objectContaining({
          csvData: expect.arrayContaining([
            expect.stringContaining('50') // Progress percentage for rollup entity
          ])
        })
      );
    });

    it('should handle save errors', async () => {
      const entityId = '123';
      const countriesData = { countries: ['US'] };
      const currenciesData = { currencies: ['USD'] };
      
      (formatTimestamp as jest.Mock).mockReturnValue('2024-01-01T00:00:00Z');
      (saveDataApiCall as jest.Mock).mockRejectedValue(new Error('Save failed'));

      const thunk = saveEntityCountriesAndCurrencies(
        entityId, 
        countriesData, 
        currenciesData
      );
      
      await expect(thunk(mockDispatch, mockGetState)).rejects.toThrow('Save failed');
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Failed to save countries and currencies'
        })
      );
    });
  });

  describe('fetchEntityHierarchy', () => {
    it('should fetch entity hierarchy successfully', async () => {
      (fetchEntityHierarchyFromApi as jest.Mock).mockResolvedValue(undefined);

      const thunk = fetchEntityHierarchy();
      await thunk(mockDispatch, mockGetState);

      expect(fetchEntityHierarchyFromApi).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setLoading',
          payload: true
        })
      );
    });

    it('should handle fetch hierarchy errors', async () => {
      (fetchEntityHierarchyFromApi as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      const thunk = fetchEntityHierarchy();
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Failed to fetch entity hierarchy'
        })
      );
    });
  });

  describe('saveEntityModulesAction', () => {
    it('should save entity modules successfully', async () => {
      const entityId = '123';
      const activeModules = ['module1', 'module2'];
      
      (saveEntityModules as jest.Mock).mockResolvedValue(undefined);
      (fetchEntities as jest.Mock).mockResolvedValue(undefined);

      const thunk = saveEntityModulesAction(entityId, activeModules);
      await thunk(mockDispatch, mockGetState);

      expect(saveEntityModules).toHaveBeenCalledWith(entityId, activeModules);
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setSuccess',
          payload: 'Entity modules saved successfully'
        })
      );
    });

    it('should handle save modules errors', async () => {
      const entityId = '123';
      const activeModules = ['module1'];
      
      (saveEntityModules as jest.Mock).mockRejectedValue(new Error('Save failed'));

      const thunk = saveEntityModulesAction(entityId, activeModules);
      
      await expect(thunk(mockDispatch, mockGetState)).rejects.toThrow('Save failed');
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Failed to save entity modules'
        })
      );
    });
  });

  describe('updateEntityProgressPercentage', () => {
    it('should update entity progress percentage successfully', async () => {
      const entityId = '123';
      const progressPercentage = '75';
      const skipRefresh = false;
      
      (saveEntityPartialUpdate as jest.Mock).mockResolvedValue(undefined);
      (fetchEntities as jest.Mock).mockResolvedValue(undefined);

      const thunk = updateEntityProgressPercentage(entityId, progressPercentage, skipRefresh);
      await thunk(mockDispatch, mockGetState);

      expect(saveEntityPartialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: entityId,
          progressPercentage: progressPercentage,
          lastUpdatedAt: expect.any(String),
          legalBusinessName: '',
          displayName: '',
          entityType: ''
        }),
        'u'
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setSuccess',
          payload: 'Entity progress updated to 75%'
        })
      );
    });

    it('should skip refresh when requested', async () => {
      const entityId = '123';
      const progressPercentage = '75';
      const skipRefresh = true;
      
      (saveEntityPartialUpdate as jest.Mock).mockResolvedValue(undefined);

      const thunk = updateEntityProgressPercentage(entityId, progressPercentage, skipRefresh);
      await thunk(mockDispatch, mockGetState);

      expect(fetchEntities).not.toHaveBeenCalled();
    });

    it('should handle progress update errors', async () => {
      const entityId = '123';
      const progressPercentage = '75';
      
      (saveEntityPartialUpdate as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const thunk = updateEntityProgressPercentage(entityId, progressPercentage);
      
      await expect(thunk(mockDispatch, mockGetState)).rejects.toThrow('Update failed');
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Failed to update progress to 75%'
        })
      );
    });
  });

  describe('Async Thunk Function Types', () => {
    it('should have correct function types for all async thunks', () => {
      expect(typeof handleCountryChange).toBe('function');
      expect(typeof handleFileUpload).toBe('function');
      expect(typeof submitEntitySetup).toBe('function');
      expect(typeof updateEntitySetup).toBe('function');
      expect(typeof updateEntityPartial).toBe('function');
      expect(typeof deleteEntity).toBe('function');
      expect(typeof saveEntityCountriesAndCurrencies).toBe('function');
      expect(typeof fetchEntityHierarchy).toBe('function');
      expect(typeof saveEntityModulesAction).toBe('function');
      expect(typeof updateEntityProgressPercentage).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const formData = { name: 'Test Entity' };
      
      (saveEntity as jest.Mock).mockRejectedValue(new Error('Network error'));

      const thunk = submitEntitySetup(formData);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError'
        })
      );
    });

    it('should handle validation errors', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      (validateImageFile as jest.Mock).mockReturnValue({ 
        isValid: false, 
        error: 'Invalid file type' 
      });

      const thunk = handleFileUpload(file);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setError',
          payload: 'Invalid file type'
        })
      );
    });
  });

  describe('Loading States', () => {
    it('should set loading states correctly', async () => {
      const formData = { name: 'Test Entity' };
      
      (saveEntity as jest.Mock).mockResolvedValue(undefined);
      (fetchEntities as jest.Mock).mockResolvedValue(undefined);

      const thunk = submitEntitySetup(formData);
      await thunk(mockDispatch, mockGetState);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setLoading',
          payload: true
        })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'entitySetup/setLoading',
          payload: false
        })
      );
    });
  });
});
