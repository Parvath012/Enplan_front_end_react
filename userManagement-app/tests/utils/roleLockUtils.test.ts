import {
  isRoleAssignedToUsers,
  syncRoleLockStatus,
  syncAllRolesLockStatus,
  syncAffectedRolesLockStatus,
} from '../../src/utils/roleLockUtils';
import { updateRoleLockStatus } from '../../src/services/roleSaveService';

// Mock dependencies
jest.mock('../../src/services/roleSaveService', () => ({
  updateRoleLockStatus: jest.fn(),
}));

describe('roleLockUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('isRoleAssignedToUsers', () => {
    const mockUsers = [
      { id: 1, role: 'Admin', firstname: 'John', lastname: 'Doe' },
      { id: 2, role: 'Manager', firstname: 'Jane', lastname: 'Smith' },
      { id: 3, role: 'User', firstname: 'Bob', lastname: 'Jones' },
    ];

    it('should return true when role is assigned to a user', () => {
      expect(isRoleAssignedToUsers('Admin', mockUsers)).toBe(true);
    });

    it('should return false when role is not assigned to any user', () => {
      expect(isRoleAssignedToUsers('NonExistent', mockUsers)).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isRoleAssignedToUsers('admin', mockUsers)).toBe(true);
      expect(isRoleAssignedToUsers('ADMIN', mockUsers)).toBe(true);
      expect(isRoleAssignedToUsers('AdMiN', mockUsers)).toBe(true);
    });

    it('should handle whitespace in role names', () => {
      expect(isRoleAssignedToUsers(' Admin ', mockUsers)).toBe(true);
      expect(isRoleAssignedToUsers('Admin', mockUsers)).toBe(true);
    });

    it('should return false when roleName is empty', () => {
      expect(isRoleAssignedToUsers('', mockUsers)).toBe(false);
    });

    it('should return false when roleName is null', () => {
      expect(isRoleAssignedToUsers(null as any, mockUsers)).toBe(false);
    });

    it('should return false when roleName is undefined', () => {
      expect(isRoleAssignedToUsers(undefined as any, mockUsers)).toBe(false);
    });

    it('should return false when users array is empty', () => {
      expect(isRoleAssignedToUsers('Admin', [])).toBe(false);
    });

    it('should return false when users is null', () => {
      expect(isRoleAssignedToUsers('Admin', null as any)).toBe(false);
    });

    it('should return false when users is undefined', () => {
      expect(isRoleAssignedToUsers('Admin', undefined as any)).toBe(false);
    });

    it('should handle users with null/undefined role', () => {
      const users = [
        { id: 1, role: null },
        { id: 2, role: undefined },
        { id: 3, role: 'Admin' },
      ];
      expect(isRoleAssignedToUsers('Admin', users as any)).toBe(true);
    });

    it('should handle users with empty string role', () => {
      const users = [
        { id: 1, role: '' },
        { id: 2, role: 'Admin' },
      ];
      expect(isRoleAssignedToUsers('Admin', users as any)).toBe(true);
    });
  });

  describe('syncRoleLockStatus', () => {
    const mockUsers = [
      { id: 1, role: 'Admin', firstname: 'John', lastname: 'Doe' },
    ];

    beforeEach(() => {
      (updateRoleLockStatus as jest.Mock).mockResolvedValue(undefined);
    });

    it('should update lock status when role is assigned', async () => {
      await syncRoleLockStatus(1, 'Admin', mockUsers);
      
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🔄 Updating role lock status in database')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('✅ Role lock status synced successfully')
      );
    });

    it('should update lock status to false when role is not assigned', async () => {
      await syncRoleLockStatus(1, 'NonExistent', mockUsers);
      
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, false);
    });

    it('should throw error when update fails', async () => {
      const error = new Error('Update failed');
      (updateRoleLockStatus as jest.Mock).mockRejectedValue(error);
      
      await expect(syncRoleLockStatus(1, 'Admin', mockUsers)).rejects.toThrow('Update failed');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error syncing lock status')
      );
    });
  });

  describe('syncAllRolesLockStatus', () => {
    const mockRoles = [
      { id: 1, rolename: 'Admin', islocked: false },
      { id: 2, rolename: 'Manager', islocked: true },
      { id: 3, rolename: 'User', islocked: false },
    ];

    const mockUsers = [
      { id: 1, role: 'Admin', firstname: 'John', lastname: 'Doe' },
    ];

    beforeEach(() => {
      (updateRoleLockStatus as jest.Mock).mockResolvedValue(undefined);
    });

    it('should return early when roles array is empty', async () => {
      await syncAllRolesLockStatus([], mockUsers);
      
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
    });

    it('should return early when roles is null', async () => {
      await syncAllRolesLockStatus(null as any, mockUsers);
      
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
    });

    it('should skip roles without id or rolename', async () => {
      const roles = [
        { id: null, rolename: 'Admin' },
        { id: 2, rolename: null },
        { id: 3, rolename: 'User' },
      ];
      
      await syncAllRolesLockStatus(roles as any, mockUsers);
      
      // Should only update role with both id and rolename
      expect(updateRoleLockStatus).toHaveBeenCalledTimes(1);
    });

    it('should update roles that need lock status change', async () => {
      await syncAllRolesLockStatus(mockRoles, mockUsers);
      
      // Admin should be locked (assigned to user), Manager should be unlocked (not assigned)
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true);
      expect(updateRoleLockStatus).toHaveBeenCalledWith(2, false);
    });

    it('should not update roles that already have correct lock status', async () => {
      const roles = [
        { id: 1, rolename: 'NonExistent', islocked: false },
      ];
      
      await syncAllRolesLockStatus(roles, mockUsers);
      
      // Role is not assigned, and islocked is already false, so no update needed
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
    });

    it('should handle string role IDs', async () => {
      const roles = [
        { id: '1', rolename: 'Admin', islocked: false },
      ];
      
      await syncAllRolesLockStatus(roles as any, mockUsers);
      
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true);
    });

    it('should use originalIsLocked when forceSync is true', async () => {
      const roles = [
        { id: 1, rolename: 'Admin', islocked: false, _originalIsLocked: true } as any,
      ];
      
      await syncAllRolesLockStatus(roles, mockUsers, true);
      
      // Should compare with originalIsLocked (true) vs shouldBeLocked (true), so no update
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
    });

    it('should handle errors for individual roles without failing entire sync', async () => {
      (updateRoleLockStatus as jest.Mock)
        .mockRejectedValueOnce(new Error('Error for role 1'))
        .mockResolvedValueOnce(undefined);
      
      const roles = [
        { id: 1, rolename: 'Admin', islocked: false },
        { id: 2, rolename: 'Manager', islocked: true },
      ];
      
      await syncAllRolesLockStatus(roles, mockUsers);
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to sync lock status for role')
      );
      // Should still attempt to sync second role
      expect(updateRoleLockStatus).toHaveBeenCalledTimes(2);
    });

    it('should handle various islocked formats', async () => {
      const roles = [
        { id: 1, rolename: 'Admin', islocked: 'true' },
        { id: 2, rolename: 'Manager', isLocked: true },
        { id: 3, rolename: 'User', IsLocked: false },
      ];
      
      await syncAllRolesLockStatus(roles as any, mockUsers);
      
      // All should be checked and updated if needed
      expect(updateRoleLockStatus).toHaveBeenCalled();
    });

    it('should handle islocked as string "false"', async () => {
      const roles = [
        { id: 1, rolename: 'Admin', islocked: 'false' },
      ];
      
      await syncAllRolesLockStatus(roles, mockUsers);
      
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true);
    });

    it('should handle islocked as string "1"', async () => {
      const roles = [
        { id: 1, rolename: 'Admin', islocked: '1' },
      ];
      
      await syncAllRolesLockStatus(roles, mockUsers);
      
      // Should compare '1' (true) vs shouldBeLocked (true), so no update
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
    });

    it('should handle islocked as number 0', async () => {
      const roles = [
        { id: 1, rolename: 'Admin', islocked: 0 },
      ];
      
      await syncAllRolesLockStatus(roles, mockUsers);
      
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true);
    });

    it('should handle islocked as number 1', async () => {
      const roles = [
        { id: 1, rolename: 'Admin', islocked: 1 },
      ];
      
      await syncAllRolesLockStatus(roles, mockUsers);
      
      // Should compare 1 (true) vs shouldBeLocked (true), so no update
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
    });

    it('should handle islocked as null/undefined', async () => {
      const roles = [
        { id: 1, rolename: 'Admin', islocked: null },
        { id: 2, rolename: 'Manager', islocked: undefined },
      ];
      
      await syncAllRolesLockStatus(roles as any, mockUsers);
      
      // null/undefined should be treated as false
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true);
      expect(updateRoleLockStatus).toHaveBeenCalledWith(2, false);
    });
  });

  describe('syncAffectedRolesLockStatus', () => {
    const mockRoles = [
      { id: 1, rolename: 'Admin' },
      { id: 2, rolename: 'Manager' },
    ];

    const mockUsers = [
      { id: 1, role: 'Admin', firstname: 'John', lastname: 'Doe' },
    ];

    beforeEach(() => {
      (updateRoleLockStatus as jest.Mock).mockResolvedValue(undefined);
    });

    it('should return early when affectedRoleNames is empty', async () => {
      await syncAffectedRolesLockStatus([], mockRoles, mockUsers);
      
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return early when affectedRoleNames is null', async () => {
      await syncAffectedRolesLockStatus(null as any, mockRoles, mockUsers);
      
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
    });

    it('should return early when roles is null', async () => {
      await syncAffectedRolesLockStatus(['Admin'], null as any, mockUsers);
      
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
    });

    it('should return early when users is null', async () => {
      await syncAffectedRolesLockStatus(['Admin'], mockRoles, null as any);
      
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
    });

    it('should sync lock status for affected roles', async () => {
      await syncAffectedRolesLockStatus(['Admin'], mockRoles, mockUsers);
      
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true);
    });

    it('should handle case-insensitive role name matching', async () => {
      await syncAffectedRolesLockStatus(['admin'], mockRoles, mockUsers);
      
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true);
    });

    it('should handle whitespace in role names', async () => {
      await syncAffectedRolesLockStatus([' Admin '], mockRoles, mockUsers);
      
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true);
    });

    it('should skip roles not found in roles list', async () => {
      await syncAffectedRolesLockStatus(['NonExistent'], mockRoles, mockUsers);
      
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Role "NonExistent" not found')
      );
    });

    it('should handle multiple affected roles', async () => {
      await syncAffectedRolesLockStatus(['Admin', 'Manager'], mockRoles, mockUsers);
      
      expect(updateRoleLockStatus).toHaveBeenCalledTimes(2);
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true);
      expect(updateRoleLockStatus).toHaveBeenCalledWith(2, false);
    });

    it('should use actual role name from found role object', async () => {
      const roles = [
        { id: 1, rolename: 'Admin' },
      ];
      
      await syncAffectedRolesLockStatus(['admin'], roles, mockUsers);
      
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true, expect.anything());
    });

    it('should handle roles with string IDs', async () => {
      const roles = [
        { id: '1', rolename: 'Admin' },
      ];
      
      await syncAffectedRolesLockStatus(['Admin'], roles as any, mockUsers);
      
      expect(updateRoleLockStatus).toHaveBeenCalledWith(1, true);
    });

    it('should handle roles with null id', async () => {
      const roles = [
        { id: null, rolename: 'Admin' },
      ];
      
      await syncAffectedRolesLockStatus(['Admin'], roles as any, mockUsers);
      
      expect(updateRoleLockStatus).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });
  });
});


