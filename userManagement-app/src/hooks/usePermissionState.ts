/**
 * Custom hook for managing permission state in permission tables
 */
import { useState, useEffect } from 'react';
import { setsEqual } from '../components/shared/permissionTableUtils';

export interface PermissionState {
  enabledModules: Set<string>;
  selectedPermissions: Set<string>;
  activeModule: string | null;
  activeSubmodule: string | null;
}

export interface UsePermissionStateOptions {
  modulesData: any;
  formDataPermissions: any;
  resetTrigger?: number;
  onInputChange?: (field: string, value: any) => void;
  enableLogging?: boolean;
}

export function usePermissionState({
  modulesData,
  formDataPermissions,
  resetTrigger,
  onInputChange,
  enableLogging = false
}: UsePermissionStateOptions) {
  // Interactive state for modules, submodules, and permissions
  const [enabledModules, setEnabledModules] = useState<Set<string>>(new Set());
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeSubmodule, setActiveSubmodule] = useState<string | null>(null);

  // Track initial state and changes for reset button
  const [initialPermissionState, setInitialPermissionState] = useState<PermissionState | null>(null);
  const [hasPermissionChanges, setHasPermissionChanges] = useState(false);

  // Initialize permission state when modules data is loaded
  useEffect(() => {
    if (!modulesData || Object.keys(modulesData).length === 0) {
      return;
    }

    const moduleKeys = Object.keys(modulesData);
    const existingPermissions = formDataPermissions;

    if (enableLogging) {
      console.log('🔍 INITIALIZING PERMISSION STATE - Existing permissions:', existingPermissions);
    }

    if (existingPermissions?.enabledModules && existingPermissions?.selectedPermissions) {
      // Initialize with existing permissions
      if (enableLogging) {
        console.log('🔍 INITIALIZING WITH EXISTING PERMISSIONS:', {
          enabledModules: existingPermissions.enabledModules,
          selectedPermissions: existingPermissions.selectedPermissions,
          activeModule: null,
          activeSubmodule: null
        });
      }

      setEnabledModules(new Set(existingPermissions.enabledModules));
      setSelectedPermissions(new Set(existingPermissions.selectedPermissions));
      setActiveModule(null);
      setActiveSubmodule(null);

      if (!initialPermissionState) {
        setInitialPermissionState({
          enabledModules: new Set(existingPermissions.enabledModules),
          selectedPermissions: new Set(existingPermissions.selectedPermissions),
          activeModule: null,
          activeSubmodule: null
        });
      }
    } else {
      // Initialize with default permissions
      if (enableLogging) {
        console.log('🔍 NO EXISTING PERMISSIONS - Initializing with all modules enabled');
      }

      setEnabledModules(prev => {
        const newSet = new Set(moduleKeys);
        if (prev.size !== newSet.size || !moduleKeys.every(key => prev.has(key))) {
          if (!initialPermissionState) {
            setInitialPermissionState({
              enabledModules: new Set(newSet),
              selectedPermissions: new Set(),
              activeModule: null,
              activeSubmodule: null
            });
          }
          return newSet;
        }
        return prev;
      });
    }
  }, [modulesData, initialPermissionState, formDataPermissions, enableLogging]);

  // Track changes to determine if reset button should be enabled
  useEffect(() => {
    if (!initialPermissionState) return;

    const currentState: PermissionState = {
      enabledModules,
      selectedPermissions,
      activeModule,
      activeSubmodule
    };

    const hasChanges = (
      !setsEqual(currentState.enabledModules, initialPermissionState.enabledModules) ||
      !setsEqual(currentState.selectedPermissions, initialPermissionState.selectedPermissions)
    );

    setHasPermissionChanges(hasChanges);
  }, [enabledModules, selectedPermissions, activeModule, activeSubmodule, initialPermissionState]);

  // Helper function to reset to initial state
  const resetToInitialState = () => {
    if (enableLogging) {
      console.log('🔄 RESETTING TO INITIAL LOADED STATE:', initialPermissionState);
    }
    setEnabledModules(new Set(initialPermissionState!.enabledModules));
    setSelectedPermissions(new Set(initialPermissionState!.selectedPermissions));
    setActiveModule(initialPermissionState!.activeModule);
    setActiveSubmodule(initialPermissionState!.activeSubmodule);
  };

  // Helper function to reset to form data permissions
  const resetToFormDataPermissions = (existingPermissions: any) => {
    if (enableLogging) {
      console.log('🔄 RESETTING TO EXISTING USER PERMISSIONS:', existingPermissions);
    }
    setEnabledModules(new Set(existingPermissions.enabledModules));
    setSelectedPermissions(new Set(existingPermissions.selectedPermissions));
    setActiveModule(existingPermissions.activeModule ?? null);
    setActiveSubmodule(existingPermissions.activeSubmodule ?? null);
  };

  // Helper function to reset to default state
  const resetToDefaultState = () => {
    if (enableLogging) {
      console.log('🔄 NO EXISTING PERMISSIONS - Resetting to default state');
    }
    setSelectedPermissions(new Set());
    setActiveModule(null);
    setActiveSubmodule(null);
    if (modulesData && Object.keys(modulesData).length > 0) {
      setEnabledModules(new Set(Object.keys(modulesData)));
    }
  };

  // Reset permission table state when resetTrigger changes
  useEffect(() => {
    if (resetTrigger === undefined || resetTrigger <= 0) {
      return;
    }

    if (enableLogging) {
      console.log('🔄 RESET TRIGGER ACTIVATED - Resetting permission table state');
    }

    if (initialPermissionState) {
      resetToInitialState();
    } else {
      const existingPermissions = formDataPermissions;
      if (existingPermissions?.enabledModules && existingPermissions?.selectedPermissions) {
        resetToFormDataPermissions(existingPermissions);
      } else {
        resetToDefaultState();
      }
    }

    setHasPermissionChanges(false);

    if (onInputChange && initialPermissionState) {
      onInputChange('permissions', {
        enabledModules: Array.from(initialPermissionState.enabledModules),
        selectedPermissions: Array.from(initialPermissionState.selectedPermissions),
        activeModule: initialPermissionState.activeModule,
        activeSubmodule: initialPermissionState.activeSubmodule
      });
    }
  }, [resetTrigger, modulesData, initialPermissionState, formDataPermissions, onInputChange, enableLogging]);

  // Handler for reset button click
  const handleReset = () => {
    if (!initialPermissionState) return;

    if (enableLogging) {
      console.log('Reset permissions table to initial state (user existing permissions):', initialPermissionState);
    }

    setEnabledModules(new Set(initialPermissionState.enabledModules));
    setSelectedPermissions(new Set(initialPermissionState.selectedPermissions));
    setActiveModule(initialPermissionState.activeModule);
    setActiveSubmodule(initialPermissionState.activeSubmodule);
    setHasPermissionChanges(false);

    if (onInputChange) {
      onInputChange('permissions', {
        enabledModules: Array.from(initialPermissionState.enabledModules),
        selectedPermissions: Array.from(initialPermissionState.selectedPermissions),
        activeModule: initialPermissionState.activeModule,
        activeSubmodule: initialPermissionState.activeSubmodule
      });
    }
  };

  return {
    enabledModules,
    setEnabledModules,
    selectedPermissions,
    setSelectedPermissions,
    activeModule,
    setActiveModule,
    activeSubmodule,
    setActiveSubmodule,
    initialPermissionState,
    hasPermissionChanges,
    handleReset
  };
}

