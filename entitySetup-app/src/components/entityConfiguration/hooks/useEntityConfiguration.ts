import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store/configureStore';
// No longer needed - using progressPercentage column directly
import { setDataModified } from '../../../store/Actions/entityConfigurationActions';

// Import all custom hooks
import { useEntityData } from './useEntityData';
import { useComponentState } from './useComponentState';
import { usePeriodSetupEffects } from './usePeriodSetupEffects';
import { useProgressCalculationEffects } from './useProgressCalculationEffects';
import { useDataLoadingEffects } from './useDataLoadingEffects';
import { useDebugAndInitialization } from './useDebugAndInitialization';
import { useEditModeLogic } from './useEditModeLogic';
import { useEditActions } from './useEditActions';
import { useSaveLogic } from './useSaveLogic';
import { useNavigationHandlers } from './useNavigationHandlers';
import { useValidationLogic } from './useValidationLogic';
import { useRemainingLogic } from './useRemainingLogic';
import { useButtonStateLogic } from './useButtonStateLogic';

// Main hook that combines all entity configuration logic
export const useEntityConfiguration = (isViewMode: boolean, navigate?: any) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Use all custom hooks
  const {
    entityId,
    entityConfiguration,
    periodSetup,
    entity,
    entitiesCount,
    isLoading,
    isRollupEntity,
  } = useEntityData();

  const {
    tabValue,
    setTabValue,
    isEditMode,
    setIsEditMode,
    userClickedEdit,
    setUserClickedEdit,
    progress,
    setProgress,
    isSaving,
    setIsSaving,
    initialModeSetRef,
    originalPeriodSetupSaveStatus,
    setOriginalPeriodSetupSaveStatus,
    modulesRef,
    modulesState,
    setModulesState,
    setUserHasSavedInSession,
  } = useComponentState(isViewMode, entityId);

  // For production code, use entityConfiguration values
  // For tests, this will be overridden by the mock values
  const { isDataModified = false, isDataSaved = false, selectedCountries = [], selectedCurrencies = [], defaultCurrency = [], isDefault = null } = entityConfiguration || {};
  
  // Track Period Setup save status separately to avoid progress bar changes during editing
  // Handle the case where periodSetup is undefined or the entity doesn't exist in periodSetup
  const periodSetupState = entityId && periodSetup?.[entityId] ? periodSetup[entityId] : null;
  const isPeriodSetupSaved = periodSetupState?.isDataSaved;

  // Use custom hook for data loading effects
  const { handleDataLoaded } = useDataLoadingEffects({
    dispatch,
    entityId,
    selectedCountries,
    selectedCurrencies,
    initialModeSetRef,
    setIsEditMode,
    setDataModified,
    entity,
    entityConfiguration
  });

  // Use custom hook for debug and initialization logic
  const { getHeaderTitle } = useDebugAndInitialization({
    entityId,
    entity,
    periodSetupState,
    isRollupEntity,
    tabValue,
    setModulesState
  });

  // Use custom hook for period setup effects
  usePeriodSetupEffects(tabValue, originalPeriodSetupSaveStatus, setOriginalPeriodSetupSaveStatus, isPeriodSetupSaved);

  // Calculate progress percentage based on saved entity data only
  // Progress should only update after save operations complete
  const calculateProgressPercentage = useCallback(() => {
    // Only use saved progress from entity table column
    // Progress is updated in the database when save operations complete
    // and then refreshed via fetchEntities()
    const savedProgress = entity?.progressPercentage ? parseFloat(entity.progressPercentage) : 0;
    
    return savedProgress;
  }, [entity]);

  // Use custom hook for progress calculation effects
  useProgressCalculationEffects({
    calculateProgressPercentage,
    setProgress
  });


  // Use custom hook for edit mode logic
  useEditModeLogic({
    isViewMode,
    tabValue,
    isDataSaved,
    entityId,
    periodSetup,
    userClickedEdit,
    modulesState,
    entity,
    entityConfiguration,
    setIsEditMode,
    setUserClickedEdit
  });

  // Use custom hook for edit actions
  const { handleEdit, resetPeriodSetupData, resetModulesData } = useEditActions({
    isEditMode,
    tabValue,
    entityId,
    selectedCountries,
    selectedCurrencies,
    defaultCurrency,
    isDefault,
    periodSetup,
    setIsEditMode,
    setUserClickedEdit,
    dispatch,
    setModulesState,
    modulesRef
  });

  // Calculate pre-populated currencies from entity data
  const prePopulatedCurrencies = useMemo(() => {
    if (!entity?.currencies) return [];
    
    try {
      // Use the same parsing logic as CountriesAndCurrencies
      const stripQuotes = (value: string): string => {
        if (value == null) return value as unknown as string;
        let v = value.trim();
        if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
          v = v.substring(1, v.length - 1);
        }
        return v;
      };
      
      const parseMaybeJson = (v?: string): unknown => {
        if (!v) return undefined;
        const s = v.trim();
        if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
          try { 
            const unescaped = s.replace(/\\"/g, '"');
            return JSON.parse(unescaped); 
          } catch { return s; }
        }
        return s;
      };
      
      const strippedCurrencies = stripQuotes(entity.currencies as string);
      const currenciesData = parseMaybeJson(strippedCurrencies) as any;
      
      if (currenciesData?.initialCurrency && currenciesData?.selectedCurrencies) {
        return currenciesData.selectedCurrencies;
      }
      return [];
    } catch (error) {
      console.error('Error parsing entity currencies:', error);
      return [];
    }
  }, [entity?.currencies]);

  // Use custom hook for save logic
  const { saveCountriesAndCurrencies, savePeriodSetupData, saveModulesData } = useSaveLogic({
    entityId,
    entity,
    isRollupEntity,
    selectedCountries,
    selectedCurrencies,
    defaultCurrency,
    isDefault,
    prePopulatedCurrencies, // Add this
    periodSetup,
    modulesRef,
    setUserHasSavedInSession,
    setModulesState,
    dispatch
  });

  // Use custom hook for remaining complex logic
  const { handleReset, handleSave } = useRemainingLogic({
    tabValue,
    isSaving,
    entityId,
    setIsSaving,
    setIsEditMode,
    setUserClickedEdit,
    saveCountriesAndCurrencies,
    savePeriodSetupData,
    saveModulesData,
    resetPeriodSetupData,
    resetModulesData,
    dispatch,
    setUserHasSavedInSession
  });

  // Use custom hook for navigation handlers
  const { navigateToEntityList, handleNext, handleFinish, handleBack, handleModulesDataChange } = useNavigationHandlers({
    tabValue,
    setTabValue,
    isRollupEntity,
    entityId,
    selectedCountries,
    selectedCurrencies,
    entity,
    navigate: navigate || null,
    setModulesState,
    modulesState,
    dispatch,
    setProgress
  });

  // Handle data changes from CountriesAndCurrencies component
  const handleCountriesDataChange = useCallback((_hasChanges: boolean) => {
    // The isDataModified state is already managed by Redux, 
    // but we can use this callback for any additional logic if needed
  }, []);

  // Handle data loading from CountriesAndCurrencies component
  const handleCountriesDataLoaded = useCallback((_data: any) => {
    // Data loading is already managed by Redux
    // but we can use this callback for any additional logic if needed
  }, []);

  const handlePeriodSetupDataChange = useCallback((_hasChanges: boolean) => {
    // Data changes are now handled by Redux actions
  }, []);

  // Use custom hook for validation logic
  const { isPeriodSetupMandatoryFieldsFilled, isPeriodSetupModified } = useValidationLogic({
    tabValue,
    entityId,
    periodSetup
  });

  // Use custom hook for button state logic
  const { isNextEnabled } = useButtonStateLogic({
    tabValue,
    selectedCountries,
    selectedCurrencies,
    isDataSaved,
    isEditMode,
    entityId,
    periodSetup,
    modulesState,
    isRollupEntity
  });

  return {
    // Entity data
    entityId,
    entity,
    entitiesCount,
    isLoading,
    isRollupEntity,
    
    // Component state
    tabValue,
    setTabValue,
    isEditMode,
    progress,
    isSaving,
    modulesRef,
    modulesState,
    
    // Redux state
    isDataModified,
    isDataSaved,
    selectedCountries,
    selectedCurrencies,
    defaultCurrency,
    isDefault,
    periodSetup,
    
    // Handlers
    handleDataLoaded,
    handleEdit,
    handleReset,
    handleSave,
    navigateToEntityList,
    handleNext,
    handleFinish,
    handleBack,
    handleCountriesDataChange,
    handleCountriesDataLoaded,
    handlePeriodSetupDataChange,
    handleModulesDataChange,
    
    // Validation
    isPeriodSetupMandatoryFieldsFilled,
    isPeriodSetupModified,
    
    // UI state
    isNextEnabled,
    getHeaderTitle
  };
};
