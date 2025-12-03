import { setDataSaved } from '../../../store/Actions/entityConfigurationActions';
import { saveEntityCountriesAndCurrencies } from '../../../store/Actions/entitySetupActions';
import { savePeriodSetup } from '../../../store/Actions/periodSetupActions';

// Custom hook to manage save logic
export const useSaveLogic = (params: {
  entityId: string | undefined;
  entity: any;
  isRollupEntity: boolean;
  selectedCountries: string[];
  selectedCurrencies: string[];
  defaultCurrency: string[];
  isDefault: string | null;
  prePopulatedCurrencies: string[]; // Add this parameter
  periodSetup: any;
  modulesRef: React.RefObject<any>;
  setUserHasSavedInSession: (value: boolean) => void;
  setModulesState: (value: any) => void;
  dispatch: any;
}) => {
  const {
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
  } = params;


  const saveCountriesAndCurrencies = async () => {
    // Early return if entityId is missing (null or undefined, but allow empty string)
    if (entityId === null || entityId === undefined) {
      return;
    }
    
    // Allow saving even with no currencies selected initially
    // Currencies can be added later
    
    const countriesData = {
      selectedCountries, // Can be empty array if no countries selected
      timestamp: new Date().toISOString()
    };
    
    // For currencies, we need to preserve ALL currencies:
    // 1. Keep ALL currencies that are currently selected (both pre-populated and user-selected)
    // 2. Only update isDefault when user changes the default
    // 3. Never remove currencies unless user explicitly unchecks them
    
    // Determine the default currency to save:
    // - defaultCurrency should always be from pre-populated data (auto-generated)
    // - isDefault is user's manual selection via radio button
    let finalDefaultCurrency = defaultCurrency;
    if (!defaultCurrency.length && prePopulatedCurrencies.length > 0) {
      // For new entities, use the first pre-populated currency as default
      finalDefaultCurrency = [prePopulatedCurrencies[0]];
    }
    
    const currenciesData = {
      selectedCurrencies: selectedCurrencies, // ALL selected currencies (preserve everything)
      defaultCurrency: finalDefaultCurrency,
      isDefault: isDefault, // User-selected default currency
      isSaved: true, // Mark as saved
      timestamp: new Date().toISOString()
    };

    console.log('Saving currencies data:', currenciesData);
    console.log('Pre-populated currencies:', prePopulatedCurrencies);
    console.log('All selected currencies:', selectedCurrencies);

    const currentProgress = entity?.progressPercentage ? parseFloat(entity.progressPercentage) : 0;
    await dispatch(saveEntityCountriesAndCurrencies(entityId, countriesData, currenciesData, isRollupEntity, currentProgress));
    
    dispatch(setDataSaved({ entityId: entityId, isSaved: true }));
    setUserHasSavedInSession(true);
  };

  const savePeriodSetupData = async () => {
    if (!entityId) {
      console.error('Entity ID is required for saving period setup data');
      return;
    }
    
    const periodSetupState = periodSetup[entityId];
    if (periodSetupState?.data) {
      const currentProgress = entity?.progressPercentage ? parseFloat(entity.progressPercentage) : 0;
      await dispatch(savePeriodSetup({ entityId, data: periodSetupState.data, isRollupEntity, currentProgress })).unwrap();
      
      setUserHasSavedInSession(true);
    }
  };

  const saveModulesData = async () => {
    if (modulesRef.current) {
      await modulesRef.current.saveModulesToEntity();

      setModulesState((prev: any) => ({
        ...prev,
        isDataSaved: true,
        isDataModified: false,
        savedModules: [...prev.currentModules]
      }));
      
      setUserHasSavedInSession(true);
    }
  };

  return { saveCountriesAndCurrencies, savePeriodSetupData, saveModulesData };
};
