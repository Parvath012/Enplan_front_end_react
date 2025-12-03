import { createReducer } from '@reduxjs/toolkit';
import {
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
  setEditMode,
  setOriginalFormData,
  setFormModified,
  setModules,
  clearStatesReloadFlag,
} from '../Actions/entitySetupActions';

// Helper function to check if the form has any non-default values
const hasFormValues = (formData: EntitySetupFormData): boolean => {
  return Object.entries(formData).some(([key, val]) => {
    // Check if string fields have content
    if (typeof val === 'string' && val !== '') return true;
    // Check if array fields have content
    if (Array.isArray(val) && val.length > 0) return true;
    // Check if boolean fields are true
    if (typeof val === 'boolean' && val === true) return true;
    // Check if file is present
    if (key === 'entityLogo' && val !== null) return true;
    return false;
  });
};

// Helper function to check if a field is different from original
const isFieldDifferent = (field: string, value: any, originalValue: any): boolean => {
  if (field === 'entityLogo') {
    // For files, we can't do a direct comparison
    return (value === null && originalValue !== null) || 
           (value !== null && originalValue === null);
  } else if (typeof value === 'object') {
    // For objects, compare using JSON stringify
    return JSON.stringify(value) !== JSON.stringify(originalValue);
  } else {
    // For primitive values (strings, numbers, booleans)
    return value !== originalValue;
  }
};

// Helper function to check if arrays are equal
const areArraysEqual = (arr1: any[], arr2: any[]): boolean => {
  return arr1.length === arr2.length && arr1.every((v, idx) => v === arr2[idx]);
};

// Helper function to check if all fields are equal
const areAllFieldsEqual = (formDataCopy: EntitySetupFormData, originalDataCopy: EntitySetupFormData): boolean => {
  const fieldsToCompare = [
    { form: formDataCopy.legalBusinessName, original: originalDataCopy.legalBusinessName },
    { form: formDataCopy.displayName, original: originalDataCopy.displayName },
    { form: formDataCopy.entityType, original: originalDataCopy.entityType },
    { form: formDataCopy.addressLine1, original: originalDataCopy.addressLine1 },
    { form: formDataCopy.addressLine2, original: originalDataCopy.addressLine2 },
    { form: formDataCopy.country, original: originalDataCopy.country },
    { form: formDataCopy.state, original: originalDataCopy.state },
    { form: formDataCopy.city, original: originalDataCopy.city },
    { form: formDataCopy.pinZipCode, original: originalDataCopy.pinZipCode },
    { form: formDataCopy.setAsDefault, original: originalDataCopy.setAsDefault },
    { form: formDataCopy.isDeleted, original: originalDataCopy.isDeleted },
    { form: formDataCopy.isConfigured, original: originalDataCopy.isConfigured },
    { form: formDataCopy.isEnabled, original: originalDataCopy.isEnabled },
    { form: formDataCopy.softDeleted, original: originalDataCopy.softDeleted }
  ];
  
  return fieldsToCompare.every(field => field.form === field.original);
};

// Helper function to check form modification
const checkFormModification = (formData: EntitySetupFormData, originalFormData: EntitySetupFormData, field: string, value: any): boolean => {
  // First, compare the current field with its original value
  const originalValue = (originalFormData as any)[field];
  
  // Check if this field is different
  if (isFieldDifferent(field, value, originalValue)) {
    return true;
  }
  
  // Need to check all fields because this one matches
  // Create simple copies of the objects for comparison
  const formDataCopy = { ...formData };
  const originalDataCopy = { ...originalFormData };
  
  // Remove the field that shouldn't affect comparison
  formDataCopy.addAnother = false;
  originalDataCopy.addAnother = false;
  
  // Check assignedEntity separately since it's an array
  const assigned1 = Array.isArray(formDataCopy.assignedEntity) ? formDataCopy.assignedEntity : [];
  const assigned2 = Array.isArray(originalDataCopy.assignedEntity) ? originalDataCopy.assignedEntity : [];
  
  if (!areArraysEqual(assigned1, assigned2)) {
    return true;
  }
  
  // Check all other fields
  if (!areAllFieldsEqual(formDataCopy, originalDataCopy)) {
    return true;
  }
  
  // Special handling for entityLogo
  const formLogoIsNull = formDataCopy.entityLogo === null;
  const origLogoIsNull = originalDataCopy.entityLogo === null;
  
  return formLogoIsNull !== origLogoIsNull;
};

export interface EntitySetupFormData {
  id?: string;
  legalBusinessName: string;
  displayName: string;
  entityType: string;
  assignedEntity: string[];
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  pinZipCode: string;
  entityLogo: File | null;
  logo?: string | null;
  currencies?: string; // JSON string containing currency data
  setAsDefault: boolean;
  addAnother: boolean;
  isDeleted?: boolean;
  isConfigured?: boolean;
  isEnabled?: boolean;
  softDeleted?: boolean;
  createdAt?: string;
  lastUpdatedAt?: string;
}

export interface EntitySetupState {
  formData: EntitySetupFormData;
  originalFormData: EntitySetupFormData | null; // Store the original data for edit mode
  countries: string[];
  currencies: Array<{id: string, currencyName: string}>;
  entityTypes: string[];
  states: string[];
  countryStateMap?: Record<string, { states: string[]; currencies: string[] }>;
  modules: Array<{id: string, name: string, description: string, isEnabled: boolean, isConfigured: boolean, entityId?: string}>;
  loading: boolean;
  error: string | null;
  success: string | null;
  isFormModified: boolean; // Track if the form has been modified
  isEditMode: boolean; // Track if we're in edit mode
  shouldReloadStatesForCountry: string | null; // Track if states need to be reloaded for a specific country after reset
}

const initialState: EntitySetupState = {
  formData: {
    id: undefined,
    legalBusinessName: '',
    displayName: '',
    entityType: '',
    assignedEntity: [],
    addressLine1: '',
    addressLine2: '',
    country: '',
    state: '',
    city: '',
    pinZipCode: '',
    entityLogo: null,
    logo: null,
    currencies: undefined,
    setAsDefault: false,
    addAnother: false,
    isDeleted: false,
    isConfigured: false,
    isEnabled: true,
    softDeleted: false,
    createdAt: undefined,
    lastUpdatedAt: undefined,
  },
  originalFormData: null, // No original data until edit mode
  countries: [],
  currencies: [],
  entityTypes: [],
  states: [],
  countryStateMap: undefined,
  modules: [],
  loading: false,
  error: null,
  success: null,
  isFormModified: false,
  isEditMode: false,
  shouldReloadStatesForCountry: null,
};

const entitySetupReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setFormData, (state, action) => {
      state.formData = action.payload;
      
      if (state.isEditMode && state.originalFormData) {
        // In edit mode, compare with original data to determine if modified
        const isEqual = JSON.stringify(action.payload) === JSON.stringify(state.originalFormData);
        state.isFormModified = !isEqual;
      } else {
        // In create mode, check if there are values in the form
        state.isFormModified = hasFormValues(state.formData);
      }
    })
    .addCase(setCountryStateMap, (state, action) => {
      state.countryStateMap = action.payload;
    })
    .addCase(updateField, (state, action) => {
      const { field, value } = action.payload;
      
      // Update field value safely using type assertion for index access
      (state.formData as any)[field] = value;
      
      if (state.isEditMode && state.originalFormData) {
        // In edit mode, check if the entire form matches the original data
        state.isFormModified = checkFormModification(state.formData, state.originalFormData, field, value);
      } else {
        // In create mode, check if there are any values in the form
        state.isFormModified = hasFormValues(state.formData);
      }
    })
    .addCase(resetForm, (state) => {
      if (state.isEditMode && state.originalFormData) {
        // In edit mode, reset to the original form data
        // Deep copy to ensure complete reset
        state.formData = JSON.parse(JSON.stringify(state.originalFormData));
        
        // Mark that states need to be reloaded for the original country
        // This will be handled by the hook after the reset action is dispatched
        state.shouldReloadStatesForCountry = state.originalFormData.country;
      } else {
        // In create mode, reset to empty form
        state.formData = { ...initialState.formData };
        state.formData.currencies = undefined;
        
        // Clear states when resetting in create mode
        state.states = [];
        state.shouldReloadStatesForCountry = null;
      }
      
      // Ensure NOT NULL fields are properly set for new entities
      if (!state.isEditMode) {
        state.formData.isDeleted = false;
        state.formData.isConfigured = false;
        state.formData.isEnabled = true;
        state.formData.softDeleted = false;
        state.formData.createdAt = undefined;
        state.formData.lastUpdatedAt = undefined;
      }
      
      // Common reset operations
      state.error = null;
      state.success = null;
      state.isFormModified = false; // Reset modification state
    })
    .addCase(setLoading, (state, action) => {
      state.loading = action.payload;
    })
    .addCase(setError, (state, action) => {
      state.error = action.payload;
    })
    .addCase(setSuccess, (state, action) => {
      state.success = action.payload;
    })
    .addCase(setCountries, (state, action) => {
      state.countries = action.payload;
    })
    .addCase(setCurrencies, (state, action) => {
      state.currencies = action.payload;
    })
    .addCase(setEntityTypes, (state, action) => {
      state.entityTypes = action.payload;
    })
    .addCase(setStates, (state, action) => {
      state.states = action.payload;
    })
    .addCase(setFileUpload, (state, action) => {
      state.formData.entityLogo = action.payload;
      
      // Use the same logic as updateField for consistency
      if (state.isEditMode && state.originalFormData) {
        // In edit mode, check if the current logo is different from the original
        const isDifferent = state.formData.entityLogo !== state.originalFormData.entityLogo;
        state.isFormModified = isDifferent;
      } else {
        // In create mode, check if there are any values in the form
        state.isFormModified = hasFormValues(state.formData);
      }
    })
    .addCase(setEditMode, (state, action) => {
      state.isEditMode = action.payload;
      if (action.payload) {
        // When entering edit mode, ensure isFormModified is false initially
        state.isFormModified = false;
      } else {
        // If exiting edit mode, clear original form data
        state.originalFormData = null;
      }
    })
    .addCase(setOriginalFormData, (state, action) => {
      state.originalFormData = action.payload;
      // When setting original data, always reset isFormModified to false
      state.isFormModified = false;
    })
    .addCase(setFormModified, (state, action) => {
      // Directly set the form modified state
      state.isFormModified = action.payload;
    })
    .addCase(setModules, (state, action) => {
      console.log('entitySetupReducer: setModules called with payload =', action.payload);
      state.modules = action.payload;
      console.log('entitySetupReducer: state.modules after update =', state.modules);
    })
    .addCase(clearStatesReloadFlag, (state) => {
      state.shouldReloadStatesForCountry = null;
    });
});

export default entitySetupReducer;
