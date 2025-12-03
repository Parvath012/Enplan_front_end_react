import { useCallback } from 'react';
import { clearEntityConfigTab } from '../../../utils/tabSessionStorage';
import { updateEntityProgressPercentage } from '../../../store/Actions/entitySetupActions';
import { fetchEntities } from '../../../store/Reducers/entitySlice';
import { saveEntityPartialUpdate } from '../../../services/entitySaveService';

// Custom hook to manage navigation and event handlers
export const useNavigationHandlers = (params: {
  tabValue: number;
  setTabValue: (value: number) => void;
  isRollupEntity: boolean;
  progress?: number;
  entityId?: string;
  selectedCountries?: string[];
  selectedCurrencies?: string[];
  entity?: any;
  modulesRef?: { current?: { saveModulesToEntity?: () => Promise<any> } | null };
  dispatch?: ((action: any) => void);
  navigate?: any;
  setModulesState: (value: any) => void;
  modulesState?: any;
  setProgress?: (progress: number) => void;
}) => {
  const {
    tabValue,
    setTabValue,
    isRollupEntity,
    entityId,
    selectedCountries = [],
    selectedCurrencies = [],
    entity,
    modulesRef,
    dispatch,
    navigate,
    setModulesState,
    modulesState,
    setProgress
  } = params;

  // Helper: Check if countries tab transition should update progress
  const shouldUpdateProgressOnCountriesTab = useCallback(() => {
    return tabValue === 0 && entityId && selectedCountries.length > 0 && selectedCurrencies.length > 0;
  }, [tabValue, entityId, selectedCountries.length, selectedCurrencies.length]);

  // Helper: Calculate progress percentage based on entity type
  const calculateProgress = useCallback(() => {
    return isRollupEntity ? 50 : 33.3;
  }, [isRollupEntity]);

  // Helper: Update progress in database and refresh entities
  const updateProgressInDatabase = useCallback(async (newProgress: number) => {
    if (!dispatch || !entityId) return;
    try {
      // Redux Toolkit async thunks return a Promise, so we can await it directly
      const updatePromise = dispatch(updateEntityProgressPercentage(entityId, newProgress.toFixed(1), true)) as unknown as Promise<any>;
      await updatePromise;
      // Refresh entities after a short delay to update the entity object
      setTimeout(() => {
        if (dispatch) {
          // @ts-ignore - Redux Toolkit async action
          dispatch(fetchEntities());
        }
      }, 100);
    } catch (error) {
      console.error('Failed to update progress percentage:', error);
    }
  }, [dispatch, entityId]);

  const navigateToEntityList = useCallback(() => {
    // Clear tab state when navigating back to entity list
    clearEntityConfigTab();
    const isAdminApp = window.location.pathname.includes('/admin/entity-setup');
    const targetPath = isAdminApp ? '/admin/entity-setup' : '/';
    
    console.log('Navigating to entity list:', {
      currentPath: window.location.pathname,
      isAdminApp,
      targetPath,
      navigateType: typeof navigate
    });
    
    if (typeof navigate === 'function') {
      navigate(targetPath);
    } else if (navigate !== undefined && navigate !== null) {
      // fallback for mockNavigate or null
      navigate('/');
    } else {
      // If navigate is not available, try using window.location
      console.warn('Navigate function not available, using window.location');
      window.location.href = targetPath;
    }
  }, [navigate]);

  const handleNext = useCallback(async () => {
    const maxTab = isRollupEntity ? 1 : 2;
    if (tabValue < maxTab) {
      // Update progress when transitioning from Countries tab
      // Only update if new progress would be higher than current saved progress
      if (shouldUpdateProgressOnCountriesTab()) {
        const currentProgress = entity?.progressPercentage ? parseFloat(entity.progressPercentage) : 0;
        const newProgress = calculateProgress();
        // Only update if new progress is higher than current saved progress
        // This prevents overwriting higher progress values (e.g., 100% -> 33.3%)
        if (newProgress > currentProgress) {
          if (setProgress) {
            setProgress(newProgress);
          }
          await updateProgressInDatabase(newProgress);
        }
      }
      
      setTabValue(tabValue + 1);
    }
  }, [tabValue, setTabValue, isRollupEntity, shouldUpdateProgressOnCountriesTab, calculateProgress, updateProgressInDatabase, setProgress, entity]);

  const handleFinish = useCallback(async () => {
    try {
      // Save modules if on Modules tab and modules exist
      // saveEntityModulesAction already updates progress and calls fetchEntities()
      if (modulesRef?.current && typeof modulesRef.current.saveModulesToEntity === 'function') {
        await modulesRef.current.saveModulesToEntity();
      }
      
      // Calculate expected progress based on saved modules
      // Progress is already set by saveEntityModules: 100% if modules exist, 66.6% if no modules
      const activeModules = modulesState?.currentModules || modulesState?.savedModules || [];
      const expectedProgress = activeModules.length > 0 ? 100 : 66.6;
      
      // Only update isConfigured if progress is 100%
      // Progress percentage is already set correctly by saveEntityModules
      if (expectedProgress === 100 && entityId && dispatch && entity) {
        try {
          const formData = {
            id: entityId,
            isConfigured: true,
            lastUpdatedAt: new Date().toISOString(),
            // Required fields with defaults
            legalBusinessName: entity?.legalBusinessName || '',
            displayName: entity?.displayName || '',
            entityType: entity?.entityType || '',
          };
          
          await saveEntityPartialUpdate(formData, 'u');
          
          // Refresh entities to get updated isConfigured flag
          const fetchPromise = dispatch(fetchEntities()) as unknown as Promise<any>;
          await fetchPromise;
        } catch (error) {
          console.error('Failed to update entity isConfigured:', error);
          // Continue with navigation even if update fails
        }
      }
    } catch (e) {
      console.error('Error in handleFinish:', e);
      // Continue with navigation even if there's an error
    }
    
    // Clear tab state when finishing configuration
    clearEntityConfigTab();
    
    // Navigate back to entity list
    navigateToEntityList();
  }, [modulesRef, dispatch, navigateToEntityList, entityId, entity, modulesState]);

  const handleBack = useCallback(() => {
    if (tabValue > 0) {
      setTabValue(tabValue - 1);
    } else {
      navigateToEntityList();
    }
  }, [tabValue, setTabValue, navigateToEntityList]);

  const handleModulesDataChange = useCallback((modules: string[] | null) => {
    if (modules == null) {
      setModulesState(null);
      return;
    }
    if (Array.isArray(modules)) {
      setModulesState((prev: any) => ({
        ...prev,
        currentModules: modules,
        isDataModified: true
      }));
      return;
    }
    setModulesState(modules);
  }, [setModulesState]);

  return {
    navigateToEntityList,
    handleNext,
    handleFinish,
    handleBack,
    handleModulesDataChange
  };
};
