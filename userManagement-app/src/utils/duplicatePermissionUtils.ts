/**
 * Shared utility functions for duplicate permission logic
 * Eliminates duplication between DuplicatePermissionPanel and DuplicateRolePermissionPanel
 */

import { parsePermissionsData } from './userFormUtils';

export interface DuplicatePermissionResult {
  duplicatedPermissions: string[];
  enabledModules: string[];
}

/**
 * Extract and filter permissions from source entity based on selected modules
 * @param sourcePermissions - Permissions data from source entity (user or role)
 * @param selectedModules - Array of selected module names (empty means all modules)
 * @returns Object containing filtered permissions and enabled modules
 */
export const extractDuplicatePermissions = (
  sourcePermissions: any,
  selectedModules: string[]
): DuplicatePermissionResult => {
  const sourcePermissionsData = parsePermissionsData(sourcePermissions);
  const sourceEnabledModules = sourcePermissionsData?.enabledModules || [];
  const sourceSelectedPermissions = sourcePermissionsData?.selectedPermissions || [];

  let duplicatedPermissions: string[] = [];
  let enabledModules: string[] = [];

  if (selectedModules.length > 0) {
    // If modules are selected, only copy those specific modules, submodules, and permissions
    enabledModules = selectedModules;
    
    // Filter permissions to only include those from selected modules
    sourceSelectedPermissions.forEach((permKey: string) => {
      // Permission key format: "module-submodule-permission"
      // Check if the permission belongs to any of the selected modules
      const belongsToSelectedModule = selectedModules.some(module => {
        // Check if permission key starts with "module-" to handle cases where module name might contain hyphens
        return permKey.startsWith(`${module}-`);
      });
      
      if (belongsToSelectedModule) {
        duplicatedPermissions.push(permKey);
      }
    });
  } else {
    // If no modules selected, copy ALL permissions exactly as they are
    enabledModules = [...sourceEnabledModules];
    duplicatedPermissions = [...sourceSelectedPermissions];
  }

  return {
    duplicatedPermissions,
    enabledModules
  };
};



