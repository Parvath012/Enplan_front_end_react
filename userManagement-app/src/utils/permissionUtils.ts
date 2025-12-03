/**
 * Shared utility functions for permission management
 * Eliminates duplication between RolePermissionsTable and PermissionsTabLayout
 * Consolidates permission reset, change detection, and state management utilities
 */
import { useState } from 'react';

// ==================== Types ====================

export interface PermissionState {
  enabledModules: Set<string>;
  selectedPermissions: Set<string>;
  activeModule: string | null;
  activeSubmodule: string | null;
}

export interface InitialPermissionState {
  enabledModules: Set<string>;
  selectedPermissions: Set<string>;
  activeModule: string | null;
  activeSubmodule: string | null;
}

/**
 * Type for mutable ref objects (replaces deprecated MutableRefObject)
 */
interface MutableRef<T> {
  current: T;
}

export interface ResetPermissionStateParams {
  initialPermissionState: InitialPermissionState | null;
  setEnabledModules: (modules: Set<string>) => void;
  setSelectedPermissions: (permissions: Set<string>) => void;
  setActiveModule: (module: string | null) => void;
  setActiveSubmodule: (submodule: string | null) => void;
  setHasPermissionChanges: (hasChanges: boolean) => void;
  onInputChange?: (field: any, value: any) => void;
  pendingUpdateTimeoutRef?: MutableRef<NodeJS.Timeout | null>;
  isUpdatingRef?: MutableRef<boolean>;
}

// ==================== Hook ====================

/**
 * Shared hook for permission state management
 */
export function usePermissionState() {
  const [enabledModules, setEnabledModules] = useState<Set<string>>(new Set());
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeSubmodule, setActiveSubmodule] = useState<string | null>(null);

  // Track initial state and changes for reset button
  const [initialPermissionState, setInitialPermissionState] = useState<InitialPermissionState | null>(null);
  const [hasPermissionChanges, setHasPermissionChanges] = useState(false);

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
    setInitialPermissionState,
    hasPermissionChanges,
    setHasPermissionChanges
  };
}

// ==================== Utility Functions ====================

/**
 * Checks if two sets are equal
 */
export function setsEqual(set1: Set<string>, set2: Set<string>): boolean {
  if (set1.size !== set2.size) return false;
  for (const item of set1) {
    if (!set2.has(item)) return false;
  }
  return true;
}

/**
 * Checks if permission state has changed compared to initial state
 */
export function checkPermissionChanges(
  currentState: PermissionState,
  initialState: PermissionState
): boolean {
  return (
    !setsEqual(currentState.enabledModules, initialState.enabledModules) ||
    !setsEqual(currentState.selectedPermissions, initialState.selectedPermissions)
  );
}

/**
 * Resets permission state to initial values
 */
export function resetPermissionState({
  initialPermissionState,
  setEnabledModules,
  setSelectedPermissions,
  setActiveModule,
  setActiveSubmodule,
  setHasPermissionChanges,
  onInputChange,
  pendingUpdateTimeoutRef,
  isUpdatingRef
}: ResetPermissionStateParams): void {
  if (!initialPermissionState) return;
  
  // Cancel any pending updates
  if (pendingUpdateTimeoutRef?.current) {
    clearTimeout(pendingUpdateTimeoutRef.current);
    pendingUpdateTimeoutRef.current = null;
  }
  
  // Clear updating flag
  if (isUpdatingRef) {
    isUpdatingRef.current = false;
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
}


