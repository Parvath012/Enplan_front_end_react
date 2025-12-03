import { createAction } from '@reduxjs/toolkit';
import countriesStates from '../../data/countriesStates';
import { saveEntity, saveEntityPartialUpdate, saveEntityModules } from '../../services/entitySaveService';
import { fetchCountryStateMap, getCurrenciesForCountry } from '../../services/countryStateService';
import { fetchCurrenciesFromApi } from '../../services/currencyService';
import { fetchModulesFromApi } from '../../services/moduleService';
// Module Federation imports - TypeScript ignore for remote module
// @ts-ignore
import { convertFileToBase64, validateImageFile } from 'commonApp/imageUtils';
import { fetchEntities, updateEntityIsEnabled } from '../Reducers/entitySlice';
import { fetchEntityHierarchyFromApi } from '../../services/entitySetupService';
import { setDataSaved } from './entityConfigurationActions';
import { formatTimestamp, saveDataApiCall } from 'commonApp/apiUtils';

// Action types
export const ENTITY_SETUP_ACTIONS = {
  SET_FORM_DATA: 'entitySetup/setFormData',
  UPDATE_FIELD: 'entitySetup/updateField',
  RESET_FORM: 'entitySetup/resetForm',
  SET_LOADING: 'entitySetup/setLoading',
  SET_ERROR: 'entitySetup/setError',
  SET_SUCCESS: 'entitySetup/setSuccess',
  SET_COUNTRIES: 'entitySetup/setCountries',
  SET_CURRENCIES: 'entitySetup/setCurrencies',
  SET_ENTITY_TYPES: 'entitySetup/setEntityTypes',
  SET_STATES: 'entitySetup/setStates',
  SET_COUNTRY_STATE_MAP: 'entitySetup/setCountryStateMap',
  SET_FILE_UPLOAD: 'entitySetup/setFileUpload',
  VALIDATE_FORM: 'entitySetup/validateForm',
  SUBMIT_FORM: 'entitySetup/submitForm',
  SET_EDIT_MODE: 'entitySetup/setEditMode',
  SET_ORIGINAL_FORM_DATA: 'entitySetup/setOriginalFormData',
  SET_FORM_MODIFIED: 'entitySetup/setFormModified',
  FETCH_HIERARCHY: 'entitySetup/fetchHierarchy',
  SET_MODULES: 'entitySetup/setModules',
  CLEAR_STATES_RELOAD_FLAG: 'entitySetup/clearStatesReloadFlag',
} as const;

// Action creators
export const setFormData = createAction<any>(ENTITY_SETUP_ACTIONS.SET_FORM_DATA);
export const updateField = createAction<{ field: string; value: any }>(ENTITY_SETUP_ACTIONS.UPDATE_FIELD);
export const resetForm = createAction(ENTITY_SETUP_ACTIONS.RESET_FORM);
export const setLoading = createAction<boolean>(ENTITY_SETUP_ACTIONS.SET_LOADING);
export const setError = createAction<string | null>(ENTITY_SETUP_ACTIONS.SET_ERROR);
export const setSuccess = createAction<string | null>(ENTITY_SETUP_ACTIONS.SET_SUCCESS);
export const setCountries = createAction<string[]>(ENTITY_SETUP_ACTIONS.SET_COUNTRIES);
export const setCurrencies = createAction<Array<{id: string, currencyName: string}>>(ENTITY_SETUP_ACTIONS.SET_CURRENCIES);
export const setEntityTypes = createAction<string[]>(ENTITY_SETUP_ACTIONS.SET_ENTITY_TYPES);
export const setStates = createAction<string[]>(ENTITY_SETUP_ACTIONS.SET_STATES);
export const setCountryStateMap = createAction<Record<string, { states: string[]; currencies: string[] }>>(ENTITY_SETUP_ACTIONS.SET_COUNTRY_STATE_MAP);
export const setFileUpload = createAction<File | null>(ENTITY_SETUP_ACTIONS.SET_FILE_UPLOAD);
export const validateForm = createAction(ENTITY_SETUP_ACTIONS.VALIDATE_FORM);
export const submitForm = createAction(ENTITY_SETUP_ACTIONS.SUBMIT_FORM);
export const setEditMode = createAction<boolean>(ENTITY_SETUP_ACTIONS.SET_EDIT_MODE);
export const setOriginalFormData = createAction<any>(ENTITY_SETUP_ACTIONS.SET_ORIGINAL_FORM_DATA);
export const setFormModified = createAction<boolean>(ENTITY_SETUP_ACTIONS.SET_FORM_MODIFIED);
export const fetchHierarchy = createAction(ENTITY_SETUP_ACTIONS.FETCH_HIERARCHY);
export const setModules = createAction<Array<{id: string, name: string, description: string, isEnabled: boolean, isConfigured: boolean, entityId?: string}>>(ENTITY_SETUP_ACTIONS.SET_MODULES);
export const clearStatesReloadFlag = createAction(ENTITY_SETUP_ACTIONS.CLEAR_STATES_RELOAD_FLAG);

// Currency actions
export const fetchCurrencies = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const currencies = await fetchCurrenciesFromApi();
    dispatch(setCurrencies(currencies));
  } catch (error) {
    dispatch(setError('Failed to fetch currencies'));
    dispatch(setCurrencies([]));
  } finally {
    dispatch(setLoading(false));
  }
};

// Module actions
export const fetchModules = () => async (dispatch: any) => {
  try {
    console.log('fetchModules action: Starting to fetch modules');
    dispatch(setLoading(true));
    const modules = await fetchModulesFromApi();
    console.log('fetchModules action: Fetched modules =', modules);
    
    // Always use the API data, even if it's empty - we need to debug the real issue
    console.log('fetchModules action: Using API data directly');
    dispatch(setModules(modules));
    
    console.log('fetchModules action: Dispatched setModules');
  } catch (error) {
    console.error('Failed to fetch modules:', error);
    dispatch(setError('Failed to fetch modules'));
    dispatch(setModules([]));
  } finally {
    dispatch(setLoading(false));
  }
};

// Async action creators
export const initializeEntitySetup = (opts?: { skipReset?: boolean }) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Try dynamic map first
    try {
      const map = await fetchCountryStateMap();
      const apiCountries = Object.keys(map).sort((a, b) => a.localeCompare(b));
      if (apiCountries.length > 0) {
        dispatch(setCountryStateMap(map));
        dispatch(setCountries(apiCountries));
      } else {
        const fallback = countriesStates.countries.map((c) => c.name).sort((a, b) => a.localeCompare(b));
        dispatch(setCountries(fallback));
      }
    } catch {
      const fallback = countriesStates.countries.map((c) => c.name).sort((a, b) => a.localeCompare(b));
      dispatch(setCountries(fallback));
    }

    // Fetch currencies from API
    try {
      const currencies = await fetchCurrenciesFromApi();
      if (currencies.length > 0) {
        dispatch(setCurrencies(currencies));
      }
    } catch (error) {
      // Fallback to empty array if API fails
      dispatch(setCurrencies([]));
    }
    
    const defaultEntityTypes = [
      'Planning Entity', 'Rollup Entity'
    ];
    

    dispatch(setEntityTypes(defaultEntityTypes));
    
    // Reset form to initial state unless skipped (e.g., edit mode)
    if (!opts?.skipReset) {
      dispatch(resetForm());
    }
    
  } catch (error) {
    dispatch(setError('Failed to initialize entity setup'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const handleCountryChange = (country: string) => async (dispatch: any, getState: any) => {
  try {
    console.log('🌍 handleCountryChange called for country:', country);
    dispatch(updateField({ field: 'country', value: country }));
    dispatch(updateField({ field: 'state', value: '' }));
    
    // Clear existing states immediately to force proper reload
    dispatch(setStates([]));
    
    // Prefer API map
    const map: Record<string, { states: string[]; currencies: string[] }> | undefined = getState()?.entitySetup?.countryStateMap;
    let states: string[] = [];
    let currencies: string[] = [];
    
    console.log('🗺️ Country state map:', map);
    console.log('🔍 Looking for country in map:', country, 'Found:', !!map?.[country]);
    
    if (map?.[country]) {
      states = [...map[country].states];
      currencies = [...map[country].currencies];
      console.log('📋 States from map:', states);
    } else {
      const countryObj = countriesStates.countries.find((c) => c.name === country);
      states = countryObj ? [...countryObj.states] : [];
      console.log('📋 States from fallback:', states, 'countryObj:', countryObj);
      
      // Fetch currencies for the country if not in map
      try {
        currencies = await getCurrenciesForCountry(country);
      } catch (error) {
        console.error('Failed to fetch currencies for country:', error);
        currencies = [];
      }
    }
    
    console.log('🔄 Dispatching setStates with:', states);
    dispatch(setStates(states));
    
    // Auto-select currencies for the country
    if (currencies.length > 0) {
      const currencyData = {
        isDefault: currencies[0], // Set first currency as isDefault (single string)
        timestamp: new Date().toISOString(),
        defaultCurrency: currencies, // Store all currencies as array
        selectedCurrencies: [] // Always empty during entity creation
      };
      
      dispatch(updateField({ field: 'currencies', value: JSON.stringify(currencyData) }));
    }
  } catch (error) {
    dispatch(setError('Failed to update country selection'));
  }
};

export const handleFileUpload = (file: File) => async (dispatch: any) => {
  try {
    // Validate file using utility function
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      dispatch(setError(validation.error ?? 'Invalid file'));
      return;
    }

    // Convert file to base64 using utility function
    const conversionResult = await convertFileToBase64(file);
    if (!conversionResult.success) {
      dispatch(setError(conversionResult.error ?? 'Failed to convert file'));
      return;
    }

    // Store both file (for preview) and base64 string (for API)
    dispatch(setFileUpload(file));
    dispatch(updateField({ field: 'logo', value: conversionResult.data }));
  } catch (error) {
    dispatch(setError('Failed to upload file'));
  }
};

export const submitEntitySetup = (formData: any) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    // Ensure all NOT NULL fields are properly set with defaults
    const submissionData = {
      ...formData,
      isDeleted: formData.isDeleted ?? false,
      isConfigured: formData.isConfigured ?? false,
      isEnabled: formData.isEnabled ?? true,
      softDeleted: formData.softDeleted ?? false,
      setAsDefault: formData.setAsDefault ?? false
    };
    
    // Persist to .NET API using SaveData
    const op: 'n' | 'u' = submissionData?.id ? 'u' : 'n';
    await saveEntity(submissionData, op);
    
    // Refetch entities to get the updated list after save
    // @ts-ignore - Redux Toolkit async action
    await dispatch(fetchEntities());
    await dispatch(fetchEntityHierarchy());
    
    // Handle form reset based on the "Add Another" checkbox
    if (!submissionData.addAnother) {
      // User wants to go back to the list, reset the form completely
      dispatch(resetForm());
      // No success message, navigation will be handled directly in component
    } else {
      // If "Add Another" is checked, we only reset specific fields but keep some settings
      const resetData = {
        // Reset addAnother back to default (unchecked) per requirement
        addAnother: false,
        setAsDefault: false, // Ensure the "Set as default" checkbox is cleared
        country: '', // Requirement: also reset country after save
        state: '',   // Requirement: also reset state after save
        
        // Reset all other fields
        id: undefined,
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
        currencies: undefined, // Reset currencies for new entity
        isDeleted: false, // Ensure isDeleted is reset to false for new entities
        isConfigured: false,
        isEnabled: true,
        softDeleted: false,
        createdAt: undefined,
        lastUpdatedAt: undefined,
      };
      dispatch(setFormData(resetData));
      // Also clear the state list so the State field is disabled until a country is reselected
      dispatch(setStates([]));
      
      // Show success message only for "Add Another" case
      dispatch(setSuccess('Entity saved successfully. Add another entity.'));
    }
  } catch (error) {
    dispatch(setError('Failed to submit entity setup'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateEntitySetup = (formData: any) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    await saveEntity(formData, 'u');
    
    // Refetch entities to get the updated list after update
    // @ts-ignore - Redux Toolkit async action
    await dispatch(fetchEntities());
    
    dispatch(setSuccess('Entity updated successfully'));
  } catch (error) {
    dispatch(setError('Failed to update entity'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateEntityPartial = (formData: any) => async (dispatch: any) => {
  try {
    await saveEntityPartialUpdate(formData, 'u');
    
    // Update local state instead of fetching all entities
    if (formData.isEnabled !== undefined) {
      dispatch(updateEntityIsEnabled({ 
        id: String(formData.id), 
        isEnabled: formData.isEnabled 
      }));
    }
    
    dispatch(setSuccess('Entity updated successfully'));
  } catch (error) {
    dispatch(setError('Failed to update entity'));
    // Re-throw the error so the calling component can handle it
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};


export const deleteEntity = (id: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Include current timestamp for lastUpdatedAt when deleting
    const deleteData = {
      id,
      softDeleted: true,
      lastUpdatedAt: new Date().toISOString()
    };

    await saveEntity(deleteData as any, 'u');
    
    // Don't set global success state since we're handling it locally
    // dispatch(setSuccess('Entity deleted successfully'));
  } catch (error) {
    dispatch(setError('Failed to delete entity'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const saveEntityCountriesAndCurrencies = (entityId: string, countriesData: any, currenciesData: any, isRollupEntity: boolean = false, currentProgress: number = 0) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Helper functions to match saveEntity format exactly
    const quoteJson = (value: unknown): string => {
      if (value == null) return "''";
      try {
        const json = JSON.stringify(value);
        return `'${json.replace(/'/g, "''")}'`;
      } catch {
        return "''";
      }
    };


    // Calculate progress percentage - only advance, never regress
    const newProgressPercentage = isRollupEntity ? '50' : '33.3';
    const finalProgressPercentage = currentProgress >= parseFloat(newProgressPercentage) ? currentProgress.toString() : newProgressPercentage;

    // Build CSV format payload with progress percentage
    const headers = '_ops|id|Countries|Currencies|ProgressPercentage|LastUpdatedAt';
    const row = `u|${entityId}|${quoteJson(countriesData)}|${quoteJson(currenciesData)}|${finalProgressPercentage}|${formatTimestamp()}`;

    const payload = {
      tableName: 'entity',
      csvData: [headers, row],
      hasHeaders: true,
      uniqueColumn: 'id',
    };

    await saveDataApiCall(payload);
    
    // Mark the data as saved in Redux state
    dispatch(setDataSaved({ entityId, isSaved: true }));
    
    // Refresh entity data to get updated countries/currencies for progress calculation
    dispatch(fetchEntities());
    
    dispatch(setSuccess('Countries and currencies saved successfully'));
  } catch (error) {
    dispatch(setError('Failed to save countries and currencies'));
    throw error; // Re-throw so the calling component can handle it
  } finally {
    dispatch(setLoading(false));
  }
};

// Helper function to fetch entity hierarchy
export const fetchEntityHierarchy = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));
    
    await fetchEntityHierarchyFromApi();
    
    // You can dispatch additional actions here if needed
    // For now, the hierarchy is managed by the entitySlice
    
  } catch (error) {
    dispatch(setError('Failed to fetch entity hierarchy'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Save modules configuration to entity table
export const saveEntityModulesAction = (entityId: string, activeModules: string[]) =>
  async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      await saveEntityModules(entityId, activeModules);
      
      // Refetch entities to get the updated list after modules save
      // @ts-ignore - Redux Toolkit async action
      await dispatch(fetchEntities());
      
      dispatch(setSuccess('Entity modules saved successfully'));
    } catch (error) {
      dispatch(setError('Failed to save entity modules'));
      throw error; // Re-throw so calling component can handle it
    } finally {
      dispatch(setLoading(false));
    }
  }
;

// Action to update entity progress percentage
export const updateEntityProgressPercentage = (entityId: string, progressPercentage: string, skipRefresh: boolean = false) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const formData = {
      id: entityId,
      progressPercentage: progressPercentage,
      lastUpdatedAt: new Date().toISOString(),
      // Required fields with defaults
      legalBusinessName: '',
      displayName: '',
      entityType: '',
    };


    await saveEntityPartialUpdate(formData, 'u');

    // Refresh entities to get updated data (unless skipped)
    if (!skipRefresh) {
      await dispatch(fetchEntities());
    }

    dispatch(setSuccess(`Entity progress updated to ${progressPercentage}%`));
  } catch (error) {
    console.error('Failed to update entity progress percentage:', error);
    dispatch(setError(`Failed to update progress to ${progressPercentage}%`));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};
