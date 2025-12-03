// START 2937-from-develop-iQE320 - Refactoring of comparison logic and addition of module modification checks
import { createAction } from '@reduxjs/toolkit';

// Action types
export const ENTITY_CONFIGURATION_ACTIONS = {
  SET_SELECTED_COUNTRIES: 'entityConfiguration/setSelectedCountries',
  SET_SELECTED_CURRENCIES: 'entityConfiguration/setSelectedCurrencies',
  SET_DEFAULT_CURRENCY: 'entityConfiguration/setDefaultCurrency',
  SET_IS_DEFAULT_CURRENCY: 'entityConfiguration/setIsDefaultCurrency',
  SET_ORIGINAL_DATA: 'entityConfiguration/setOriginalData',
  SET_DATA_MODIFIED: 'entityConfiguration/setDataModified',
  SET_DATA_SAVED: 'entityConfiguration/setDataSaved',
  RESET_CONFIGURATION: 'entityConfiguration/resetConfiguration',
} as const;

// Helper function for reliable string comparison
// Rationale for 2937-from-develop-iQE320: This function ensures array sorting is consistent, 
// preventing false positives in data modification checks due to minor case/locale differences.
const compareStrings = (a: string, b: string): number => {
  return a.localeCompare(b, 'en', { 
    sensitivity: 'base', // 'a' equals 'A'
    numeric: true,       // '10' sorts correctly after '2'
    caseFirst: 'lower'
  });
}; // END 2937-from-develop-iQE320 - Added compareStrings helper

// Action creators
export const setSelectedCountries = createAction<{ entityId: string; countries: string[] }>(ENTITY_CONFIGURATION_ACTIONS.SET_SELECTED_COUNTRIES);
export const setSelectedCurrencies = createAction<{ entityId: string; currencies: string[] }>(ENTITY_CONFIGURATION_ACTIONS.SET_SELECTED_CURRENCIES);
export const setDefaultCurrency = createAction<{ entityId: string; defaultCurrency: string[] }>(ENTITY_CONFIGURATION_ACTIONS.SET_DEFAULT_CURRENCY);
export const setIsDefaultCurrency = createAction<{ entityId: string; isDefault: string | null }>(ENTITY_CONFIGURATION_ACTIONS.SET_IS_DEFAULT_CURRENCY);
export const setOriginalData = createAction<{
  entityId: string;
  data: {
    countries: string[];
    currencies: string[];
    defaultCurrency: string[];
    isDefault: string | null;
    isInitialCurrency?: boolean;
  };
}>(ENTITY_CONFIGURATION_ACTIONS.SET_ORIGINAL_DATA);
export const setDataModified = createAction<{ entityId: string; isModified: boolean }>(ENTITY_CONFIGURATION_ACTIONS.SET_DATA_MODIFIED);
export const setDataSaved = createAction<{ entityId: string; isSaved: boolean }>(ENTITY_CONFIGURATION_ACTIONS.SET_DATA_SAVED);
export const resetConfiguration = createAction<{ entityId: string }>(ENTITY_CONFIGURATION_ACTIONS.RESET_CONFIGURATION);

// Thunk actions
export const toggleCountry = (country: string, entityId: string) => (dispatch: any, getState: any) => {
  const state = getState();
  const entityConfig = state.entityConfiguration[entityId] || {
    selectedCountries: [],
    selectedCurrencies: [],
    defaultCurrency: [],
    isDefault: null,
    originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
    isDataModified: false,
    isDataSaved: false,
  };
  const { selectedCountries, originalData } = entityConfig;
  
  console.log('🎯 toggleCountry called:', { country, entityId, selectedCountries });
  
  let newCountries: string[];
  
  if (selectedCountries.includes(country)) {
    // Allow unchecking any country - users should have full control over selections
    newCountries = selectedCountries.filter((c: string) => c !== country);
    dispatch(setSelectedCountries({ entityId, countries: newCountries }));
  } else {
    newCountries = [...selectedCountries, country];
    dispatch(setSelectedCountries({ entityId, countries: newCountries }));
  }
  
  // Check if data has changed
  const hasChanged = checkDataChanged(newCountries, entityConfig.selectedCurrencies, entityConfig.defaultCurrency, originalData, entityConfig.isDefault);
  dispatch(setDataModified({ entityId, isModified: hasChanged }));
};export const toggleCurrency = (currencyCode: string, entityId: string) => (dispatch: any, getState: any) => {
  const state = getState();
  const entityConfig = state.entityConfiguration[entityId] || {
    selectedCountries: [],
    selectedCurrencies: [],
    defaultCurrency: [],
    isDefault: null,
    originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
    isDataModified: false,
    isDataSaved: false,
  };
  const { selectedCurrencies, defaultCurrency, originalData } = entityConfig;
  
  // Check if this currency is in defaultCurrency (cannot be deleted/unchecked)
  const isInDefaultCurrency = defaultCurrency.includes(currencyCode);
  
  if (isInDefaultCurrency) {
    // Don't allow unchecking currencies that are in defaultCurrency
    console.log('🚫 Cannot uncheck currency in defaultCurrency:', currencyCode);
    return;
  }
  
  let newCurrencies: string[];
  
  if (selectedCurrencies.includes(currencyCode)) {
    newCurrencies = selectedCurrencies.filter((c: string) => c !== currencyCode);
    
    // Only clear isDefault if the user had selected this currency as their default
    if (entityConfig.isDefault === currencyCode) {
      dispatch(setIsDefaultCurrency({ entityId, isDefault: null }));
    }
  } else {
    newCurrencies = [...selectedCurrencies, currencyCode];
  }
  
  // Dispatch currency changes
  dispatch(setSelectedCurrencies({ entityId, currencies: newCurrencies }));
  
  // Check if data has changed
  const hasChanged = checkDataChanged(entityConfig.selectedCountries, newCurrencies, defaultCurrency, originalData, entityConfig.isDefault);
  dispatch(setDataModified({ entityId, isModified: hasChanged }));
};

export const setDefaultCurrencyAction = (currencyCode: string, entityId: string) => (dispatch: any, getState: any) => {
  // Get state once before any dispatches
  const state = getState();
  const entityConfig = state.entityConfiguration[entityId] || {
    selectedCountries: [],
    selectedCurrencies: [],
    defaultCurrency: [],
    isDefault: null,
    originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
    isDataModified: false,
    isDataSaved: false,
  };
  
  console.log('🔧 setDefaultCurrencyAction called:', {
    currencyCode,
    entityId,
    currentIsDefault: entityConfig.isDefault,
    originalIsDefault: entityConfig.originalData.isDefault,
    willChange: entityConfig.isDefault !== currencyCode
  });
  
  // Only update isDefault (user's manual selection)
  // defaultCurrency should remain unchanged (it's auto-generated from pre-populated data)
  if (entityConfig.isDefault !== currencyCode) {
    dispatch(setIsDefaultCurrency({ entityId, isDefault: currencyCode }));
    
    // Check if data has changed (only if isDefault actually changed)
    const hasChanged = checkDataChanged(entityConfig.selectedCountries, entityConfig.selectedCurrencies, entityConfig.defaultCurrency, entityConfig.originalData, currencyCode);
    
    console.log('🔧 Data change check result:', {
      hasChanged,
      originalData: entityConfig.originalData,
      currentIsDefault: currencyCode
    });
    
    dispatch(setDataModified({ entityId, isModified: hasChanged }));
  }
};

export const saveConfiguration = (entityId: string) => (dispatch: any, getState: any) => {
  const state = getState();
  const entityConfig = state.entityConfiguration[entityId] || {
    selectedCountries: [],
    selectedCurrencies: [],
    defaultCurrency: [],
    isDefault: null,
    originalData: { countries: [], currencies: [], defaultCurrency: [], isDefault: null },
    isDataModified: false,
    isDataSaved: false,
  };
  const { selectedCountries, selectedCurrencies, defaultCurrency, isDefault } = entityConfig;
  
  // Generate the correct payload structure according to requirements:
  // {
  //   "isDefault": "(AMD) Dram", // always a single string
  //   "timestamp": "2025-09-12T12:50:29.007Z",
  //   "defaultCurrency": ["(AMD) Dram", "(USD) Dollar"], // always an array, can have multiple currencies
  //   "selectedCurrencies": [] // must be empty during entity creation or editing
  // }
  const currenciesPayload = {
    isDefault: isDefault || null,
    timestamp: new Date().toISOString(),
    defaultCurrency: defaultCurrency || [],
    selectedCurrencies: [] // Always empty during save/edit as per requirements
  };
  
  console.log('💾 Saving currencies with payload:', currenciesPayload);
  
  // Update original data after successful save
  dispatch(setOriginalData({
    entityId,
    data: {
      countries: [...selectedCountries],
      currencies: [...selectedCurrencies],
      // 2937-from-develop-iQE320: Used ternary check for safe array creation 
      defaultCurrency: defaultCurrency ? [...defaultCurrency] : [],
      isDefault: isDefault,
    }
  }));
  
  dispatch(setDataModified({ entityId, isModified: false }));
  dispatch(setDataSaved({ entityId, isSaved: true }));
};

export const resetConfigurationAction = (entityId: string) => (dispatch: any, getState: any) => {
  const state = getState();
  const entityConfig = state.entityConfiguration[entityId];
  if (!entityConfig) return;
  
  const { originalData } = entityConfig;
  
  dispatch(setSelectedCountries({ entityId, countries: [...originalData.countries] }));
  dispatch(setSelectedCurrencies({ entityId, currencies: [...originalData.currencies] }));
  // 2937-from-develop-iQE320: Used ternary check for safe array creation 
  dispatch(setDefaultCurrency({ entityId, defaultCurrency: originalData.defaultCurrency ? [...originalData.defaultCurrency] : [] }));
  dispatch(setIsDefaultCurrency({ entityId, isDefault: originalData.isDefault }));
  dispatch(setDataModified({ entityId, isModified: false }));
  // Don't reset isDataSaved - progress bar should reflect if there's saved data
  // dispatch(setDataSaved({ entityId, isSaved: false }));
};

// Helper function to check if data has changed
const checkDataChanged = (
  selectedCountries: string[],
  selectedCurrencies: string[],
  defaultCurrency: string[] | null,
  originalData: { countries: string[] | null; currencies: string[] | null; defaultCurrency: string[] | null; isDefault: string | null },
  currentIsDefault?: string | null
) => {
  // 2937-from-develop-iQE320: Added checks for safe handling of null/undefined arrays
  const safeSelectedCountries = selectedCountries || [];
  const safeSelectedCurrencies = selectedCurrencies || [];
  const safeDefaultCurrency = defaultCurrency || [];
  const safeOriginalCountries = originalData.countries || [];
  const safeOriginalCurrencies = originalData.currencies || [];
  const safeOriginalDefaultCurrency = originalData.defaultCurrency || [];
  
  // 2937-from-develop-iQE320: Using the reliable compareStrings helper
  const countriesChanged = JSON.stringify([...safeSelectedCountries].sort(compareStrings)) !== JSON.stringify([...safeOriginalCountries].sort(compareStrings));
  const currenciesChanged = JSON.stringify([...safeSelectedCurrencies].sort(compareStrings)) !== JSON.stringify([...safeOriginalCurrencies].sort(compareStrings));
  const defaultCurrencyChanged = JSON.stringify([...safeDefaultCurrency].sort(compareStrings)) !== JSON.stringify([...safeOriginalDefaultCurrency].sort(compareStrings));
  const isDefaultChanged = currentIsDefault !== originalData.isDefault;
  // END 2937-from-develop-iQE320 - Improved array comparison logic
  
  console.log('🔍 checkDataChanged details:', {
    countriesChanged,
    currenciesChanged,
    defaultCurrencyChanged,
    isDefaultChanged,
    currentIsDefault,
    originalIsDefault: originalData.isDefault,
    result: countriesChanged || currenciesChanged || defaultCurrencyChanged || isDefaultChanged
  });
  
  return countriesChanged || currenciesChanged || defaultCurrencyChanged || isDefaultChanged;
};

// Helper function to check if modules data has changed
// 2937-from-develop-iQE320: New helper added to explicitly check for array changes in module configuration
// Rationale: Ensures form modification status is determined by actual data changes, not just a boolean flag.
const checkModulesDataChanged = (
  currentModules: string[],
  savedModules: string[]
) => {
  // Safely handle null/undefined arrays
  const safeCurrentModules = currentModules || [];
  const safeSavedModules = savedModules || [];
  
  // Using compareStrings for consistent array comparison
  const modulesChanged = JSON.stringify([...safeCurrentModules].sort(compareStrings)) !== 
                        JSON.stringify([...safeSavedModules].sort(compareStrings));
  
  console.log('🔍 checkModulesDataChanged details:', {
    currentModules: [...safeCurrentModules].sort(compareStrings),
    savedModules: [...safeSavedModules].sort(compareStrings),
    modulesChanged
  });
  
  return modulesChanged;
}; // END 2937-from-develop-iQE320 - Added checkModulesDataChanged helper

// Helper functions for button state logic
export const isCountriesTabNextEnabled = (selectedCountries: string[], selectedCurrencies: string[], isDataSaved: boolean, isEditMode: boolean) => {
  // Disable Next button when isSaved field is missing (first time, data not saved yet)
  // Enable Next button only when data has been saved and not in edit mode
  const shouldEnableNext = isDataSaved && !isEditMode;
  
  console.log('Next button check for Countries tab:', {
    selectedCountries: selectedCountries.length,
    selectedCurrencies: selectedCurrencies.length,
    isDataSaved,
    isEditMode,
    shouldEnableNext
  });
  
  return shouldEnableNext;
};

export const isPeriodSetupTabNextEnabled = (entityId: string | undefined, periodSetup: any, isEditMode: boolean, isRollupEntity: boolean) => {
  const periodSetupState = entityId ? periodSetup[entityId] : null;
  const isDataSavedAndNotEditing = periodSetupState?.isDataSaved && !isEditMode;
  
  console.log('Next/Finish button check for Period Setup tab:', {
    isDataSaved: periodSetupState?.isDataSaved,
    isEditMode,
    isDataSavedAndNotEditing,
    isRollupEntity
  });
  
  return isDataSavedAndNotEditing;
};

export const isModulesTabNextEnabled = (modulesState: any, isEditMode: boolean, isRollupEntity: boolean) => {
  const isDataSavedAndNotEditing = modulesState.isDataSaved && !isEditMode;
  
  console.log('Next/Finish button check for Modules tab:', {
    isDataSaved: modulesState.isDataSaved,
    isEditMode,
    isDataSavedAndNotEditing,
    isRollupEntity
  });
  
  return isDataSavedAndNotEditing;
};

// Helper functions for FormHeader logic
export const getEditButtonVisibility = (params: {
  tabValue: number;
  isEditMode: boolean;
  isDataSaved: boolean;
  selectedCountries: string[];
  selectedCurrencies: string[];
  entityId: string | undefined;
  periodSetup: any;
  modulesState: any;
}) => {
  const { tabValue, isEditMode, isDataSaved, selectedCountries, selectedCurrencies, entityId, periodSetup, modulesState } = params;
  
  if (tabValue === 0) {
    // For Countries tab, show edit button if data is saved (isSaved field present)
    const shouldShowEdit = !isEditMode && isDataSaved;
    
    console.log('Countries Edit button check:', {
      isEditMode,
      isDataSaved,
      selectedCountries: selectedCountries.length,
      selectedCurrencies: selectedCurrencies.length,
      shouldShowEdit
    });
    
    return shouldShowEdit;
  } else if (tabValue === 1) {
    const periodSetupState = entityId ? periodSetup[entityId] : null;
    const shouldShowEdit = !isEditMode && periodSetupState?.isDataSaved;
    
    console.log('Period Setup Edit button check:', {
      isEditMode,
      isDataSaved: periodSetupState?.isDataSaved,
      shouldShowEdit,
      periodSetupState: periodSetupState?.data
    });
    
    return shouldShowEdit;
  } else if (tabValue === 2) {
    const shouldShowEdit = !isEditMode && modulesState.isDataSaved;
    
    console.log('Modules Edit button check:', {
      isEditMode,
      isDataSaved: modulesState.isDataSaved,
      shouldShowEdit,
      modulesState: {
        currentModules: modulesState.currentModules,
        savedModules: modulesState.savedModules,
        isDataModified: modulesState.isDataModified
      }
    });
    
    return shouldShowEdit;
  }
  return false;
};

export const getFormModifiedState = (tabValue: number, isDataModified: boolean, isPeriodSetupModified: () => boolean, modulesState: any) => {
  switch (tabValue) {
    case 0:
      return isDataModified;
    case 1:
      return isPeriodSetupModified();
    case 2:
      // 2937-from-develop-iQE320: Changed to use the new helper for robust modification check.
      // Rationale: Checks actual data difference instead of relying on a potentially inaccurate boolean flag.
      return checkModulesDataChanged(
        modulesState.currentModules || [],
        modulesState.savedModules || []
      );
    default:
      return false;
  }
};

interface SaveDisabledStateParams {
  tabValue: number;
  selectedCountries: string[];
  selectedCurrencies: string[];
  isDataModified: boolean;
  isDataSaved: boolean;
  isPeriodSetupMandatoryFieldsFilled: () => boolean;
  isPeriodSetupModified: () => boolean;
  modulesState: any;
  entity?: any; // Entity object to check progressPercentage
}

export const getSaveDisabledState = (params: SaveDisabledStateParams) => {
  const {
    tabValue,
    selectedCountries,
    selectedCurrencies,
    isDataModified,
    isDataSaved,
    isPeriodSetupMandatoryFieldsFilled,
    isPeriodSetupModified,
    modulesState,
    entity
  } = params;
  switch (tabValue) {
    case 0: {
      // Check if entity is newly created (progress 0%)
      const progressPercentage = entity?.progressPercentage ? parseFloat(entity.progressPercentage) : 0;
      const isNewlyCreated = progressPercentage === 0;
      
      // For newly created entities (progress 0%), always enable Save button
      // This gives users the feel that they're in save mode
      if (isNewlyCreated) {
        console.log('💾 Save button check for Countries tab (newly created entity):', {
          progressPercentage,
          isNewlyCreated,
          selectedCountries: selectedCountries.length,
          selectedCurrencies: selectedCurrencies.length,
          shouldDisable: false,
          reason: 'Newly created entity - Save enabled'
        });
        return false; // Enable Save for newly created entities
      }
      
      // For configured entities (progress > 0%), save button should be disabled if:
      // Data is already saved and not modified (no need to save again)
      const shouldDisable = isDataSaved && !isDataModified;
      
      let reason: string;
      if (shouldDisable) {
        reason = 'No changes to save';
      } else {
        reason = 'Save enabled';
      }
      
      console.log('💾 Save button check for Countries tab:', {
        progressPercentage,
        isNewlyCreated,
        selectedCountries: selectedCountries.length,
        selectedCurrencies: selectedCurrencies.length,
        isDataModified,
        shouldDisable,
        reason
      });
      
      return shouldDisable;
    }
    case 1: {
      const mandatoryFieldsFilled = isPeriodSetupMandatoryFieldsFilled();
      const hasModifications = isPeriodSetupModified();
      const periodSetupShouldDisable = !mandatoryFieldsFilled || !hasModifications;
      
      console.log('Period Setup Save button check:', {
        mandatoryFieldsFilled,
        hasModifications,
        shouldDisable: periodSetupShouldDisable
      });
      
      return periodSetupShouldDisable;
    }
    case 2: {
      // 2937-from-develop-iQE320: Changed to use the new helper for robust modification check.
      const hasActualChanges = checkModulesDataChanged(
        modulesState.currentModules || [],
        modulesState.savedModules || []
      );
      const modulesShouldDisable = !hasActualChanges;
      // END 2937-from-develop-iQE320 - Refined save button logic for Modules tab
      
      console.log('Modules Save button check:', {
        hasActualChanges,
        shouldDisable: modulesShouldDisable,
        modulesState: {
          currentModules: modulesState.currentModules,
          savedModules: modulesState.savedModules
        }
      });
      
      return modulesShouldDisable;
    }
    default:
      return true;
  }
};

// Helper function to get header title based on tab
export const getHeaderTitle = (tabValue: number) => {
  switch (tabValue) {
    case 0:
      return 'Countries and Currency';
    case 1:
      return 'Period Setup';
    case 2:
      return 'System Modules';
    default:
      return 'Entity Configuration';
  }
};

// Helper function to detect if an entity is newly created
export const isNewlyCreatedEntity = (entity: any, entityConfiguration: any): boolean => {
  if (!entity) return false;
  
  // Check if entity has been configured before
  const hasBeenConfigured = entity.isConfigured === true;
  
  // Check progress percentage - if 0, it's a newly created entity
  const progressPercentage = entity.progressPercentage ? parseFloat(entity.progressPercentage) : 0;
  const hasProgress = progressPercentage > 0;
  
  // Check if there's any saved configuration data in Redux
  // Handle case when entityConfiguration is undefined
  const hasSavedConfiguration = entityConfiguration ? entityConfiguration.isDataSaved === true : false;
  
  // Entity is newly created if:
  // 1. Progress is 0% (no progress) - this is the primary indicator
  // OR
  // 2. It hasn't been configured before AND there's no saved configuration data
  const isNewlyCreated = !hasProgress || (!hasBeenConfigured && !hasSavedConfiguration);
  
  console.log('isNewlyCreatedEntity check:', {
    entityId: entity.id,
    hasBeenConfigured,
    progressPercentage,
    hasProgress,
    hasSavedConfiguration,
    selectedCountries: entityConfiguration?.selectedCountries?.length || 0,
    selectedCurrencies: entityConfiguration?.selectedCurrencies?.length || 0,
    isNewlyCreated,
    entityConfiguration
  });
  
  return isNewlyCreated;
};

// Helper function to determine edit mode by tab
const determineEditModeByTab = (params: {
  tabValue: number;
  isDataSaved: boolean;
  entityId: string | undefined;
  periodSetup: any;
  userClickedEdit: boolean;
  modulesState: any;
  isNewlyCreatedEntity: boolean;
}) => {
  const { tabValue, isDataSaved, entityId, periodSetup, userClickedEdit, modulesState, isNewlyCreatedEntity } = params;

  switch (tabValue) {
    case 0:
      return determineCountriesTabEditMode(isDataSaved, isNewlyCreatedEntity);
    case 1:
      return determinePeriodSetupTabEditMode(entityId, periodSetup, userClickedEdit, isNewlyCreatedEntity);
    case 2:
      return determineModulesTabEditMode(modulesState, userClickedEdit, isNewlyCreatedEntity);
    default:
      return false;
  }
};

// Helper function for Countries tab edit mode
const determineCountriesTabEditMode = (isDataSaved: boolean, isNewlyCreatedEntity: boolean) => {
  // If entity is newly created (progress 0%), always start in edit mode
  if (isNewlyCreatedEntity) {
    return true;
  }
  
  // For configured entities (progress > 0%), check if data is saved
  // If data is saved, show read-only mode (Edit button)
  // If data is not saved, show edit mode (Save button)
  return !isDataSaved;
};

// Helper function for Period Setup tab edit mode
const determinePeriodSetupTabEditMode = (entityId: string | undefined, periodSetup: any, userClickedEdit: boolean, isNewlyCreatedEntity: boolean) => {
  const periodSetupState = entityId ? periodSetup[entityId] : null;
  if (isNewlyCreatedEntity && !periodSetupState?.isDataSaved) {
    return true;
  }
  return !(periodSetupState?.isDataSaved && !userClickedEdit);
};

// Helper function for Modules tab edit mode
const determineModulesTabEditMode = (modulesState: any, userClickedEdit: boolean, isNewlyCreatedEntity: boolean) => {
  if (isNewlyCreatedEntity && !modulesState.isDataSaved) {
    return true;
  }
  return !(modulesState.isDataSaved && !userClickedEdit);
};

// Helper function to determine edit mode
export const determineEditMode = (params: {
  isViewMode: boolean;
  tabValue: number;
  isDataSaved: boolean;
  entityId: string | undefined;
  periodSetup: any;
  userClickedEdit: boolean;
  modulesState: any;
  isNewlyCreatedEntity?: boolean;
}) => {
  const {
    isViewMode,
    tabValue,
    isDataSaved,
    entityId,
    periodSetup,
    userClickedEdit,
    modulesState,
    isNewlyCreatedEntity = false
  } = params;

  if (isViewMode) return false;

  // For newly created entities (progress 0%), always start in edit mode for Countries and Currencies tab
  if (isNewlyCreatedEntity && tabValue === 0) {
    return true;
  }

  return determineEditModeByTab({
    tabValue,
    isDataSaved,
    entityId,
    periodSetup,
    userClickedEdit,
    modulesState,
    isNewlyCreatedEntity
  });
};

// Helper function to check if period setup mandatory fields are filled
export const isPeriodSetupMandatoryFieldsFilled = (tabValue: number, entityId: string | undefined, periodSetup: any) => {
  if (tabValue !== 1) return false;
  
  const periodSetupState = entityId ? periodSetup[entityId] : null;
  if (!periodSetupState?.data) return false;
  
  const { financialYear, weekSetup } = periodSetupState.data;
  
  // Check Financial Year mandatory fields
  const financialYearValid = 
    financialYear?.name?.trim() !== '' &&
    financialYear?.startMonth !== '' &&
    financialYear?.endMonth !== '' &&
    financialYear?.historicalDataStartFY !== '' &&
    financialYear?.spanningYears !== '';
  
  // Check Week Setup mandatory fields
  const weekSetupValid = 
    weekSetup?.name?.trim() !== '' &&
    weekSetup?.monthForWeekOne !== '' &&
    weekSetup?.startingDayOfWeek !== '';
  
  const allFieldsFilled = financialYearValid && weekSetupValid;
  
  console.log('Period Setup mandatory fields check:', {
    financialYearValid,
    weekSetupValid,
    allFieldsFilled,
    financialYear: {
      name: financialYear?.name,
      startMonth: financialYear?.startMonth,
      endMonth: financialYear?.endMonth,
      historicalDataStartFY: financialYear?.historicalDataStartFY,
      spanningYears: financialYear?.spanningYears
    },
    weekSetup: {
      name: weekSetup?.name,
      monthForWeekOne: weekSetup?.monthForWeekOne,
      startingDayOfWeek: weekSetup?.startingDayOfWeek
    }
  });
  
  return allFieldsFilled;
};

// Helper function to check if period setup is modified
export const isPeriodSetupModified = (tabValue: number, entityId: string | undefined, periodSetup: any) => {
  if (tabValue !== 1) return false;
  
  const periodSetupState = entityId ? periodSetup[entityId] : null;
  if (!periodSetupState?.originalData) return false;
  
  const hasChanges = JSON.stringify(periodSetupState.data) !== JSON.stringify(periodSetupState.originalData);
  
  console.log('Period Setup modification check:', {
    hasChanges,
    currentData: periodSetupState.data,
    originalData: periodSetupState.originalData
  });
  
  return hasChanges;
};

// END 2937-from-develop-iQE320 - Refactoring of comparison logic and addition of module modification checks