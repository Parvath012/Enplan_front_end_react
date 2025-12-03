import { useEffect, useCallback, useRef } from 'react';
import { determineEditMode, isNewlyCreatedEntity } from '../../../store/Actions/entityConfigurationActions';

// Custom hook to manage edit mode logic
export const useEditModeLogic = (params: {
  isViewMode: boolean;
  tabValue: number;
  isDataSaved: boolean;
  entityId: string | undefined;
  periodSetup: any;
  userClickedEdit: boolean;
  modulesState: any;
  entity: any;
  entityConfiguration: any;
  setIsEditMode: (value: boolean) => void;
  setUserClickedEdit: (value: boolean) => void;
}) => {
  const {
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
  } = params;

  // Use refs to store latest object values without causing dependency changes
  const periodSetupRef = useRef(periodSetup);
  const entityRef = useRef(entity);
  const entityConfigurationRef = useRef(entityConfiguration);
  const modulesStateRef = useRef(modulesState);
  const previousEditModeRef = useRef<boolean | null>(null);

  // Update refs synchronously during render (safe and prevents stale closures)
  periodSetupRef.current = periodSetup;
  entityRef.current = entity;
  entityConfigurationRef.current = entityConfiguration;
  modulesStateRef.current = modulesState;

  // Extract stable primitive values for dependency tracking
  const periodSetupState = entityId ? periodSetup?.[entityId] : null;
  const periodSetupIsDataSaved = periodSetupState?.isDataSaved;
  const periodSetupLoading = periodSetupState?.loading;
  const entityIdValue = entity?.id;
  const entityIsConfigured = entity?.isConfigured;
  const entityConfigIsDataSaved = entityConfiguration?.isDataSaved;
  const modulesIsDataSaved = modulesState?.isDataSaved;

  const determineEditModeCallback = useCallback(() => {
    const isNewlyCreated = isNewlyCreatedEntity(entityRef.current, entityConfigurationRef.current);
    return determineEditMode({
      isViewMode,
      tabValue,
      isDataSaved,
      entityId,
      periodSetup: periodSetupRef.current,
      userClickedEdit,
      modulesState: modulesStateRef.current,
      isNewlyCreatedEntity: isNewlyCreated
    });
  }, [tabValue, isDataSaved, isViewMode, entityId, periodSetupIsDataSaved, periodSetupLoading, userClickedEdit, modulesIsDataSaved, entityIdValue, entityIsConfigured, entityConfigIsDataSaved]);

  // Synchronize isEditMode with Redux state when component mounts or data changes
  useEffect(() => {
    if (!userClickedEdit && entity) {
      // Check if entity is newly created (progress 0%)
      const progressPercentage = entity.progressPercentage ? parseFloat(entity.progressPercentage) : 0;
      const isNewlyCreated = progressPercentage === 0;
      
      // For newly created entities (progress 0%), always stay in edit mode
      // Don't let determineEditMode override this - this prevents the page refresh issue
      if (isNewlyCreated && tabValue === 0) {
        setIsEditMode(true);
        return;
      }
      
      // For configured entities (progress > 0%), use the normal logic
      const newEditMode = determineEditModeCallback();
      if (previousEditModeRef.current !== newEditMode) {
        previousEditModeRef.current = newEditMode;
        setIsEditMode(newEditMode);
      }
    }
  }, [determineEditModeCallback, setIsEditMode, userClickedEdit, entity, tabValue]);

  // Handle Period Setup data loading
  useEffect(() => {
    if (tabValue === 1 && entityId) {
      const periodSetupState = periodSetupRef.current?.[entityId];
      if (periodSetupState?.isDataSaved && !periodSetupState?.loading && !userClickedEdit) {
        if (previousEditModeRef.current !== false) {
          previousEditModeRef.current = false;
          setIsEditMode(false);
        }
      }
    }
  }, [tabValue, entityId, periodSetupIsDataSaved, periodSetupLoading, userClickedEdit, setIsEditMode]);

  // Reset userClickedEdit flag when switching tabs
  useEffect(() => {
    setUserClickedEdit(false);
  }, [tabValue, setUserClickedEdit]);

  return { determineEditMode: determineEditModeCallback };
};
