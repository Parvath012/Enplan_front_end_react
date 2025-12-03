import { updateRoleLockStatus } from '../services/roleSaveService';
import type { User } from '../services/userService';
import type { Role } from '../services/roleService';

/**
 * Normalize boolean value from various formats
 */
function normalizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return false;
}

/**
 * Check if a role is assigned to any users
 * @param roleName - The name of the role to check
 * @param users - Array of all users
 * @returns true if role is assigned to at least one user, false otherwise
 */
export function isRoleAssignedToUsers(roleName: string, users: User[]): boolean {
  if (!roleName || !users || users.length === 0) {
    return false;
  }
  
  // Check if any user has this role assigned (case-insensitive comparison)
  return users.some(user => {
    const userRole = (user.role || '').trim();
    const normalizedRoleName = roleName.trim();
    return userRole.toLowerCase() === normalizedRoleName.toLowerCase();
  });
}

/**
 * Update lock status for a specific role based on user assignments
 * @param roleId - The ID of the role to update
 * @param roleName - The name of the role
 * @param users - Array of all users
 * @returns Promise that resolves when lock status is updated
 */
export async function syncRoleLockStatus(
  roleId: number,
  roleName: string,
  users: User[]
): Promise<void> {
  try {
    const isAssigned = isRoleAssignedToUsers(roleName, users);
    
    console.log(`🔄 Updating role lock status in database: ${roleName} (ID: ${roleId}) -> isLocked: ${isAssigned}`);
    
    // Update lock status
    await updateRoleLockStatus(roleId, isAssigned);
    
    console.log(`✅ Role lock status synced successfully: ${roleName} (ID: ${roleId}) - isLocked: ${isAssigned}`);
  } catch (error) {
    console.error(`❌ Error syncing lock status for role ${roleName} (ID: ${roleId}):`, error);
    // Re-throw error so caller knows sync failed
    throw error;
  }
}

/**
 * Sync lock status for all roles based on current user assignments
 * Only updates roles where the lock status needs to change
 * @param roles - Array of all roles
 * @param users - Array of all users
 * @param forceSync - If true, always sync to database (used when roles are loaded to ensure DB consistency)
 * @returns Promise that resolves when all lock statuses are updated
 */
export async function syncAllRolesLockStatus(
  roles: Role[],
  users: User[],
  forceSync: boolean = false
): Promise<void> {
  if (!roles || roles.length === 0) {
    return;
  }
  
  console.log('🔄 Syncing lock status for all roles. Total roles:', roles.length, 'Total users:', users.length, 'Force sync:', forceSync);
  
  // Update lock status for each role (only if it needs to change)
  const updatePromises = roles.map(async (role) => {
    if (!role.id || !role.rolename) {
      return Promise.resolve();
    }
    
    const roleId = typeof role.id === 'string' ? parseInt(role.id, 10) : Number(role.id);
    const shouldBeLocked = isRoleAssignedToUsers(role.rolename, users);
    
    // Use original database value if available (from _originalIsLocked when forceSync is true)
    // This ensures we compare with the actual database value, not the calculated value
    const roleWithOriginal = role as any;
    const hasOriginalValue = forceSync && roleWithOriginal._originalIsLocked !== undefined;
    const currentLockStatus = hasOriginalValue
      ? normalizeBoolean(roleWithOriginal._originalIsLocked)
      : normalizeBoolean(role.islocked ?? role.isLocked ?? role.IsLocked ?? false);
    
    // Log detailed information for debugging
    console.log(`🔍 Role "${role.rolename}" (ID: ${roleId}):`, {
      originalDbValue: hasOriginalValue ? roleWithOriginal._originalIsLocked : 'N/A',
      currentLockStatus,
      shouldBeLocked,
      needsUpdate: currentLockStatus !== shouldBeLocked,
      forceSync
    });
    
    // Only update if lock status needs to change
    // When forceSync is true, we compare with original DB value, so we only update if DB is out of sync
    if (currentLockStatus !== shouldBeLocked) {
      console.log(`🔒 Role "${role.rolename}" (ID: ${roleId}) lock status needs update: ${currentLockStatus} -> ${shouldBeLocked}`);
      return syncRoleLockStatus(roleId, role.rolename, users).catch(error => {
        // Log error but don't fail the entire sync
        console.error(`Failed to sync lock status for role "${role.rolename}" (ID: ${roleId}):`, error);
        return Promise.resolve(); // Continue with other roles
      });
    } else {
      console.log(`✅ Role "${role.rolename}" (ID: ${roleId}) lock status is correct: ${shouldBeLocked}`);
      return Promise.resolve();
    }
  });
  
  await Promise.all(updatePromises);
  console.log('✅ All role lock statuses synced');
}

/**
 * Sync lock status for roles affected by a user save/update/delete operation
 * This function should be called after user operations to update affected roles
 * @param affectedRoleNames - Array of role names that might have been affected
 * @param roles - Array of all roles
 * @param users - Array of all users
 * @returns Promise that resolves when affected role lock statuses are updated
 */
export async function syncAffectedRolesLockStatus(
  affectedRoleNames: string[],
  roles: Role[],
  users: User[]
): Promise<void> {
  if (!affectedRoleNames || affectedRoleNames.length === 0 || !roles || !users) {
    console.warn('syncAffectedRolesLockStatus: Missing required parameters', {
      affectedRoleNames,
      rolesCount: roles?.length,
      usersCount: users?.length
    });
    return;
  }
  
  console.log('🔄 Syncing lock status for affected roles:', affectedRoleNames);
  console.log('Available roles:', roles.map(r => r.rolename));
  console.log('Total users:', users.length);
  
  // Find affected roles and update their lock status
  const updatePromises = affectedRoleNames.map(async roleName => {
    const role = roles.find(r => {
      const rName = r.rolename ?? '';
      return rName.trim().toLowerCase() === roleName.trim().toLowerCase();
    });
    
    if (!role?.id) {
      console.warn(`⚠️ Role "${roleName}" not found in roles list. Available roles:`, roles.map(r => r.rolename));
      return Promise.resolve();
    }
    
    const roleId = typeof role.id === 'string' ? parseInt(role.id, 10) : Number(role.id);
    // Use the role name from the found role object to ensure consistency
    const actualRoleName = role.rolename || roleName;
    console.log(`🔒 Syncing lock status for role: "${actualRoleName}" (ID: ${roleId})`);
    return syncRoleLockStatus(roleId, actualRoleName, users);
  });
  
  await Promise.all(updatePromises);
  console.log('✅ Affected role lock statuses synced:', affectedRoleNames);
}

