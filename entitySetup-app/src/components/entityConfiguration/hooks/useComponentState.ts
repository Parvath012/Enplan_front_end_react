import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ModulesRef } from '../Modules';
import { 
  saveEntityConfigTab, 
  getEntityConfigTab, 
  clearEntityConfigTab,
  isEntityConfigurationPage,
  shouldRestoreTabForEntity
} from '../../../utils/tabSessionStorage';

// Custom hook to manage component state
export const useComponentState = (isViewMode: boolean, entityId?: string) => {
  const location = useLocation();
  
  // Get initial tab value from sessionStorage
  const getInitialTabValue = (): number => {
    // Only restore if we're definitely on an entity configuration page
    if (!isEntityConfigurationPage(location.pathname)) {
      clearEntityConfigTab(); // Clear if we're not on the right page
      return 0;
    }
    
    if (!shouldRestoreTabForEntity(location.pathname, entityId)) {
      return 0;
    }
    
    const stored = getEntityConfigTab();
    if (stored && (!entityId || stored.entityId === entityId)) {
      // Double-check that we're still on the right page before restoring
      const currentPath = window.location.pathname;
      if (isEntityConfigurationPage(currentPath)) {
        console.log('EntitySetup: Restoring tab from sessionStorage:', stored.tabValue);
        return stored.tabValue;
      } else {
        clearEntityConfigTab();
        return 0;
      }
    }
    
    return 0;
  };

  const [tabValue, setTabValue] = useState<number>(getInitialTabValue());
  const [isEditMode, setIsEditMode] = useState(!isViewMode);
  const [userClickedEdit, setUserClickedEdit] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const initialModeSetRef = useRef(false);
  const [originalPeriodSetupSaveStatus, setOriginalPeriodSetupSaveStatus] = useState<boolean | null>(null);
  
  // Ref for Modules component
  const modulesRef = useRef<ModulesRef>(null);
  
  // Modules state management (similar to period setup)
  const [modulesState, setModulesState] = useState<{
    isDataSaved: boolean;
    isDataModified: boolean;
    savedModules: string[];
    currentModules: string[];
  }>({
    isDataSaved: false,
    isDataModified: false,
    savedModules: [],
    currentModules: []
  });

  // Track if user has saved data in current session (not just loaded existing data)
  const [userHasSavedInSession, setUserHasSavedInSession] = useState(false);



  // Clear sessionStorage when navigating away from entity config pages
  useEffect(() => {
    if (!isEntityConfigurationPage(location.pathname)) {
      console.log('EntitySetup: Navigation detected, clearing sessionStorage');
      clearEntityConfigTab();
      // Reset tab to 0 when not on entity config page
      if (tabValue !== 0) {
        setTabValue(0);
      }
    }
  }, [location.pathname, tabValue]);

  // Handle entity ID changes - clear storage if different entity
  useEffect(() => {
    const stored = getEntityConfigTab();
    if (stored && entityId && stored.entityId && stored.entityId !== entityId) {
      console.log('EntitySetup: Different entity detected, clearing sessionStorage');
      clearEntityConfigTab();
      setTabValue(0);
    }
  }, [entityId]);

  // Add a periodic check to ensure we clear sessionStorage if user has navigated away
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentPath = window.location.pathname;
      if (!isEntityConfigurationPage(currentPath)) {
        console.log('EntitySetup: Periodic check detected navigation away, clearing sessionStorage');
        clearEntityConfigTab();
        if (tabValue !== 0) {
          setTabValue(0);
        }
      }
    }, 500); // Check every 0.5 seconds

    return () => clearInterval(intervalId);
  }, [tabValue]);

  // Custom setTabValue with sessionStorage integration
  const setTabValueWithStorage = (newTabValue: number) => {
    setTabValue(newTabValue);
    if (isEntityConfigurationPage(location.pathname)) {
      saveEntityConfigTab(newTabValue, entityId);
    }
  };

  return {
    tabValue,
    setTabValue: setTabValueWithStorage,
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
    userHasSavedInSession,
    setUserHasSavedInSession,
  };
};
