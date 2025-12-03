/**
 * Utility functions for permission tables
 */

/**
 * Compare two sets for equality
 */
export function setsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
  if (set1.size !== set2.size) return false;
  for (const item of set1) {
    if (!set2.has(item)) return false;
  }
  return true;
}

/**
 * Get current permissions for a specific submodule
 */
export function getCurrentPermissions(
  selectedPermissions: Set<string>,
  key: string
): string[] {
  return Array.from(selectedPermissions).filter(perm => perm.startsWith(`${key}-`));
}

/**
 * Check if all permissions are selected for a submodule
 */
export function isAllPermissionsSelected(
  currentPermissions: string[],
  allPermissions: string[]
): boolean {
  return currentPermissions.length === allPermissions.length && allPermissions.length > 0;
}

/**
 * Build permission data object for form updates
 */
export function buildPermissionData(
  enabledModules: Set<string>,
  selectedPermissions: Set<string>,
  activeModule: string | null,
  activeSubmodule: string | null
): {
  enabledModules: string[];
  selectedPermissions: string[];
  activeModule: string | null;
  activeSubmodule: string | null;
} {
  return {
    enabledModules: Array.from(enabledModules),
    selectedPermissions: Array.from(selectedPermissions),
    activeModule,
    activeSubmodule
  };
}

/**
 * Toggle permission in set and return updated set with permission data
 */
export function togglePermissionInSet<T extends string = string>(
  selectedPermissions: Set<string>,
  key: string,
  enabledModules: Set<string>,
  activeModule: string | null,
  activeSubmodule: string | null,
  onInputChange?: (field: T, value: any) => void
): Set<string> {
  const newSet = new Set(selectedPermissions);
  if (newSet.has(key)) {
    newSet.delete(key);
  } else {
    newSet.add(key);
  }

  if (onInputChange) {
    const permissionData = buildPermissionData(enabledModules, newSet, activeModule, activeSubmodule);
    onInputChange('permissions', permissionData);
  }

  return newSet;
}

/**
 * Select or deselect all permissions for a submodule
 */
export function toggleAllPermissionsForSubmodule<T extends string = string>(
  selectedPermissions: Set<string>,
  key: string,
  allPermissions: string[],
  enabledModules: Set<string>,
  activeModule: string | null,
  activeSubmodule: string | null,
  onInputChange?: (field: T, value: any) => void
): Set<string> {
  const currentPermissions = getCurrentPermissions(selectedPermissions, key);
  const shouldSelectAll = currentPermissions.length < allPermissions.length;
  const newSet = new Set(selectedPermissions);

  allPermissions.forEach((permission: string) => {
    const permKey = `${key}-${permission}`;
    if (shouldSelectAll) {
      newSet.add(permKey);
    } else {
      newSet.delete(permKey);
    }
  });

  if (onInputChange) {
    const permissionData = buildPermissionData(enabledModules, newSet, activeModule, activeSubmodule);
    onInputChange('permissions', permissionData);
  }

  return newSet;
}

/**
 * Remove all permissions for a module
 */
export function removeModulePermissions(
  module: string,
  currentPerms: Set<string>,
  modulesData: any
): Set<string> {
  const updatedPerms = new Set(currentPerms);
  const moduleData = modulesData?.[module];
  if (!moduleData?.submodules) {
    return updatedPerms;
  }

  Object.entries(moduleData.submodules).forEach(([submoduleName, perms]) => {
    if (Array.isArray(perms)) {
      perms.forEach(perm => {
        updatedPerms.delete(`${module}-${submoduleName}-${perm}`);
      });
    }
  });
  return updatedPerms;
}

/**
 * Build grid row data from modules data
 */
export function buildGridRowData(
  modulesData: any,
  enabledModules: Set<string>
): Array<{
  module: string;
  moduleData: any;
  isModuleEnabled: boolean;
  id: string;
}> {
  if (!modulesData || Object.keys(modulesData).length === 0) {
    return [];
  }

  const rows: Array<{
    module: string;
    moduleData: any;
    isModuleEnabled: boolean;
    id: string;
  }> = [];

  Object.entries(modulesData).forEach(([moduleName, moduleData]) => {
    const isModuleEnabled = enabledModules.has(moduleName);
    rows.push({
      module: moduleName,
      moduleData,
      isModuleEnabled,
      id: moduleName
    });
  });

  return rows;
}

/**
 * Core logic for toggling module enabled state
 * Returns the new enabled modules set and whether permissions should be removed
 */
export function toggleModuleEnabledState(
  enabledModules: Set<string>,
  module: string
): {
  newSet: Set<string>;
  isCurrentlyEnabled: boolean;
  shouldRemovePermissions: boolean;
} {
  const newSet = new Set(enabledModules);
  const isCurrentlyEnabled = newSet.has(module);
  
  if (isCurrentlyEnabled) {
    newSet.delete(module);
  } else {
    newSet.add(module);
  }
  
  return {
    newSet,
    isCurrentlyEnabled,
    shouldRemovePermissions: isCurrentlyEnabled
  };
}

/**
 * Calculate new active module state when toggling
 */
export function calculateNewActiveModuleState(
  activeModule: string | null,
  module: string,
  isModuleEnabled: boolean
): string | null {
  if (activeModule === module && !isModuleEnabled) {
    return null; // Module is being disabled and it was active, so clear active state
  }
  return activeModule; // Keep current active module
}

/**
 * Create module click handler - sets active module and clears submodule
 */
export function createModuleClickHandler(
  isReadOnly: boolean | undefined,
  enabledModules: Set<string>,
  setActiveModule: (module: string | null) => void,
  setActiveSubmodule: (submodule: string | null) => void,
  checkEnabled: boolean = false
): (module: string) => void {
  return (module: string) => {
    if (isReadOnly) return;
    if (checkEnabled && !enabledModules.has(module)) return;
    
    setActiveModule(module);
    setActiveSubmodule(null);
  };
}

/**
 * Create submodule click handler - sets active module and submodule
 */
export function createSubmoduleClickHandler(
  isReadOnly: boolean | undefined,
  enabledModules: Set<string>,
  setActiveModule: (module: string | null) => void,
  setActiveSubmodule: (submodule: string | null) => void,
  checkEnabled: boolean = false
): (module: string, submodule: string) => void {
  return (module: string, submodule: string) => {
    if (isReadOnly) return;
    if (checkEnabled && !enabledModules.has(module)) return;
    
    setActiveModule(module);
    setActiveSubmodule(`${module}-${submodule}`);
  };
}

/**
 * Options for module toggle handler
 */
export interface ModuleToggleHandlerOptions<T extends string = string> {
  isReadOnly?: boolean;
  enabledModules: Set<string>;
  selectedPermissions: Set<string>;
  activeModule: string | null;
  activeSubmodule: string | null;
  modulesData: any;
  setEnabledModules: (updater: (prev: Set<string>) => Set<string>) => void;
  setSelectedPermissions: (updater: (prev: Set<string>) => Set<string>) => void;
  setActiveModule: (module: string | null) => void;
  setActiveSubmodule: (submodule: string | null) => void;
  onInputChange?: (field: T, value: any) => void;
  useAdvancedLogic?: boolean;
}

/**
 * Create module toggle handler - handles module enable/disable with permission cleanup
 */
export function createModuleToggleHandler<T extends string = string>(
  options: ModuleToggleHandlerOptions<T>
): (module: string) => void {
  const {
    isReadOnly,
    selectedPermissions,
    activeModule,
    activeSubmodule,
    modulesData,
    setEnabledModules,
    setSelectedPermissions,
    setActiveModule,
    setActiveSubmodule,
    onInputChange,
    useAdvancedLogic = false
  } = options;
  return (module: string) => {
    if (isReadOnly) return;
    
    setEnabledModules(prev => {
      const { newSet, shouldRemovePermissions } = toggleModuleEnabledState(prev, module);
      
      if (shouldRemovePermissions) {
        setSelectedPermissions(currentPerms => removeModulePermissions(module, currentPerms, modulesData));
        if (activeModule === module) {
          setActiveModule(null);
          setActiveSubmodule(null);
        }
      }
      
      if (onInputChange) {
        let newActiveModule = activeModule;
        let newActiveSubmodule = activeSubmodule;
        
        if (useAdvancedLogic) {
          newActiveModule = calculateNewActiveModuleState(activeModule, module, newSet.has(module));
          newActiveSubmodule = activeModule === module ? null : activeSubmodule;
        }
        
        const permissionData = buildPermissionData(
          newSet,
          selectedPermissions,
          newActiveModule,
          newActiveSubmodule
        );
        
        if (useAdvancedLogic) {
          setTimeout(() => {
            onInputChange('permissions' as T, permissionData);
          }, 50);
        } else {
          onInputChange('permissions' as T, permissionData);
        }
      }
      
      return newSet;
    });
  };
}

/**
 * Options for select all permissions handler
 */
export interface SelectAllPermissionsHandlerOptions<T extends string = string> {
  isReadOnly?: boolean;
  modulesData: any;
  enabledModules: Set<string>;
  activeModule: string | null;
  activeSubmodule: string | null;
  setSelectedPermissions: (updater: (prev: Set<string>) => Set<string>) => void;
  onInputChange?: (field: T, value: any) => void;
  useStrictCheck?: boolean;
}

/**
 * Create select all permissions handler
 */
export function createSelectAllPermissionsHandler<T extends string = string>(
  options: SelectAllPermissionsHandlerOptions<T>
): (module: string, submodule: string) => void {
  const {
    isReadOnly,
    modulesData,
    enabledModules,
    activeModule,
    activeSubmodule,
    setSelectedPermissions,
    onInputChange,
    useStrictCheck = false
  } = options;
  return (module: string, submodule: string) => {
    if (isReadOnly) return;
    
    const key = `${module}-${submodule}`;
    let allPermissions: string[] = [];
    
    if (useStrictCheck) {
      const moduleData = modulesData[module];
      if (!moduleData?.submodules?.[submodule]) return;
      allPermissions = moduleData.submodules[submodule];
    } else {
      allPermissions = modulesData?.[module]?.submodules?.[submodule] || [];
    }
    
    setSelectedPermissions(prev => toggleAllPermissionsForSubmodule<T>(
      prev,
      key,
      allPermissions,
      enabledModules,
      activeModule,
      activeSubmodule,
      onInputChange as ((field: T, value: any) => void) | undefined
    ));
  };
}

/**
 * Create permission toggle handler
 */
export function createPermissionToggleHandler<T extends string = string>(
  isReadOnly: boolean | undefined,
  enabledModules: Set<string>,
  activeModule: string | null,
  activeSubmodule: string | null,
  setSelectedPermissions: (updater: (prev: Set<string>) => Set<string>) => void,
  onInputChange?: ((field: T, value: any) => void) | undefined
): (module: string, submodule: string, permission: string) => void {
  return (module: string, submodule: string, permission: string) => {
    if (isReadOnly) return;
    
    const key = `${module}-${submodule}-${permission}`;
    setSelectedPermissions(prev => togglePermissionInSet<T>(
      prev,
      key,
      enabledModules,
      activeModule,
      activeSubmodule,
      onInputChange as ((field: T, value: any) => void) | undefined
    ));
  };
}

