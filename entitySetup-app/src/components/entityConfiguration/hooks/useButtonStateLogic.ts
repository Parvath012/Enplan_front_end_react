import { useMemo } from 'react';
import { 
  isCountriesTabNextEnabled,
  isPeriodSetupTabNextEnabled,
  isModulesTabNextEnabled
} from '../../../store/Actions/entityConfigurationActions';

// Custom hook to manage button state logic
export const useButtonStateLogic = (params: {
  tabValue: number;
  selectedCountries: string[];
  selectedCurrencies: string[];
  isDataSaved: boolean;
  isEditMode: boolean;
  entityId: string | undefined;
  periodSetup: any;
  modulesState: any;
  isRollupEntity: boolean;
}) => {
  const {
    tabValue,
    selectedCountries,
    selectedCurrencies,
    isDataSaved,
    isEditMode,
    entityId,
    periodSetup,
    modulesState,
    isRollupEntity
  } = params;

  // Determine if Next button should be enabled
  const isNextEnabled = useMemo(() => {
    switch (tabValue) {
      case 0:
        return isCountriesTabNextEnabled(selectedCountries, selectedCurrencies, isDataSaved, isEditMode);
      case 1:
        return isPeriodSetupTabNextEnabled(entityId, periodSetup, isEditMode, isRollupEntity);
      case 2:
        return isModulesTabNextEnabled(modulesState, isEditMode, isRollupEntity);
      default:
        return true;
    }
  }, [tabValue, selectedCountries.length, selectedCurrencies.length, isDataSaved, isEditMode, entityId, periodSetup, modulesState?.isDataSaved, isRollupEntity]);

  return { isNextEnabled };
};
