import { useCallback } from 'react';
import { resetConfigurationAction } from '../../../store/Actions/entityConfigurationActions';

// Custom hook to manage remaining complex logic
export const useRemainingLogic = (params: {
  tabValue: number;
  isSaving: boolean;
  entityId: string | undefined | null;
  setIsSaving: (value: boolean) => void;
  setIsEditMode: (value: boolean) => void;
  setUserClickedEdit: (value: boolean) => void;
  saveCountriesAndCurrencies: () => Promise<void>;
  savePeriodSetupData: () => Promise<void>;
  saveModulesData: () => Promise<void>;
  resetPeriodSetupData: (entityId: string | undefined | null) => void;
  resetModulesData: () => void;
  dispatch: any;
  setUserHasSavedInSession: (value: boolean) => void;
}) => {
  const {
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
  } = params;

  const handleReset = useCallback(() => {
    // Use a simple approach based on tab value
    if (tabValue === 0) {
      // Reset Countries and Currencies
      if (entityId) {
        dispatch(resetConfigurationAction(entityId) as any);
        // Reset session-based save flag since user reset the data
        setUserHasSavedInSession(false);
      }
    } else if (tabValue === 1) {
      // Reset Period Setup - pass entityId even if it's undefined or null
      resetPeriodSetupData(entityId);
    } else if (tabValue === 2) {
      // Reset Modules
      resetModulesData();
    }
    
    // Keep edit mode on so user can continue working
  }, [tabValue, entityId, dispatch, resetPeriodSetupData, resetModulesData, setUserHasSavedInSession]);

  const handleSave = useCallback(async () => {
    // Don't proceed if already saving or no entityId is available
    if (isSaving || !entityId) {
      return;
    }
    
    try {
      setIsSaving(true);

      // Execute save function based on selected tab
      switch (tabValue) {
        case 0:
          await saveCountriesAndCurrencies();
          break;
        case 1:
          await savePeriodSetupData();
          break;
        case 2:
          await saveModulesData();
          break;
      }

      // After successful save, exit edit mode
      setIsEditMode(false);
      setUserClickedEdit(false);
    } catch (error) {
      console.error('Failed to save entity configuration:', error);
      setIsEditMode(false);
      setUserClickedEdit(false);
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving, 
    entityId, 
    tabValue, 
    saveCountriesAndCurrencies, 
    savePeriodSetupData, 
    saveModulesData, 
    setIsSaving, 
    setIsEditMode, 
    setUserClickedEdit
  ]);

  return { handleReset, handleSave };
};
