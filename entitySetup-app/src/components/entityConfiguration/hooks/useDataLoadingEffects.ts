import { useEffect, useCallback } from 'react';
import { fetchEntities } from '../../../store/Reducers/entitySlice';
import { fetchPeriodSetup } from '../../../store/Actions/periodSetupActions';
import { isNewlyCreatedEntity } from '../../../store/Actions/entityConfigurationActions';

// Custom hook to manage data loading and initialization effects
export const useDataLoadingEffects = (params: {
  dispatch: any;
  entityId: string | undefined;
  selectedCountries: string[];
  selectedCurrencies: string[];
  initialModeSetRef: React.RefObject<boolean>;
  setIsEditMode: (value: boolean) => void;
  setDataModified: (value: { entityId: string; isModified: boolean }) => void;
  entity: any;
  entityConfiguration: any;
}) => {
  const {
    dispatch,
    entityId,
    selectedCountries,
    selectedCurrencies,
    initialModeSetRef,
    setIsEditMode,
    setDataModified,
    entity,
    entityConfiguration
  } = params;
  // Fetch entities when component mounts to ensure we have the latest data
  useEffect(() => {
    // @ts-ignore - Redux Toolkit async action
    dispatch(fetchEntities());
  }, [dispatch]);

  // Fetch period setup data when entityId is available
  useEffect(() => {
    if (entityId) {
      // @ts-ignore - Redux Toolkit async action
      dispatch(fetchPeriodSetup(entityId));
    }
  }, [entityId, dispatch]);

  // Handle data loaded callback from child component
  const handleDataLoaded = useCallback((_hasData: boolean) => {
    // Only set initial mode once when data is first loaded
    if (!initialModeSetRef.current) {
      // Check for entity existence and pass entityConfiguration safely
      const isNewlyCreated = entity ? isNewlyCreatedEntity(entity, entityConfiguration) : true;
      
      // No minimum data requirement initially - allow saving with no currencies
      // Currencies can be added later
      const hasMinimumData = true;

      // Helper function to set edit mode and reset data modified flag
      const setEditModeAndResetModified = (editMode: boolean) => {
        setIsEditMode(editMode);
        if (entityId) {
          setDataModified({ entityId, isModified: false });
        }
      };

      if (isNewlyCreated) {
        // For newly created entities, always start in edit mode regardless of data
        setEditModeAndResetModified(true);
      } else if (hasMinimumData) {
        // If there's at least 1 country and 1 currency, start in read-only mode
        setIsEditMode(false);
      } else {
        // If there's no country or no currency, start in edit mode
        setEditModeAndResetModified(true);
      }

      // Mark that initial mode has been set
      initialModeSetRef.current = true;
    }
  }, [selectedCountries.length, selectedCurrencies.length, entityId, setIsEditMode, setDataModified, initialModeSetRef, entity, entityConfiguration]);

  return { handleDataLoaded };
};
