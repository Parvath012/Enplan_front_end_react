import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { roleService, Role } from '../../services/roleService';
import { fetchRolesFromApi } from '../../services/roleFetchService';
import { syncAllRolesLockStatus, isRoleAssignedToUsers } from '../../utils/roleLockUtils';
import { fetchUsersFromApi } from '../../services/userFetchService';
import type { User } from '../../services/userService';
import { convertUserModelsToUsers } from '../../utils/userConversionUtils';

// Async thunks
export const fetchRoles = createAsyncThunk<Role[]>(
  'roles/fetchRoles',
  async () => {
    // Fetch roles and users in parallel
    const [roles, users] = await Promise.all([
      fetchRolesFromApi(),
      fetchUsersFromApi()
    ]);
    
    // Convert UserModel to User format for compatibility using shared utility
    const convertedUsers: User[] = convertUserModelsToUsers(users);
    
    // Convert RoleModel to Role format for compatibility
    // Store original database lock status before calculating new value for sync comparison
    const rolesWithOriginalLock: Array<Role & { _originalIsLocked?: boolean }> = roles.map(role => {
      const calculatedLockStatus = isRoleAssignedToUsers(role.rolename, convertedUsers);
      // Normalize the original database value (it might be string "true"/"false" or boolean)
      const originalDbLockStatus = (() => {
        const value: any = role.islocked;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true' || value === '1';
        }
        if (typeof value === 'number') {
          return value === 1;
        }
        return false;
      })();
      
      return {
        id: parseInt(role.id) ?? 0,
        rolename: role.rolename,
        department: role.department ?? '',
        roledescription: role.roledescription ?? '',
        status: role.status,
        parentattribute: role.parentattribute,
        permissions: role.permissions,
        createdat: role.createdat,
        lastupdatedat: role.lastupdatedat ?? '',
        isenabled: role.isenabled,
        createdby: role.createdby ?? '',
        updatedby: role.updatedby ?? '',
        softdelete: role.softdelete,
        // Update islocked based on current user assignments
        islocked: calculatedLockStatus,
        // Store original database value for sync comparison (temporary, removed before returning)
        _originalIsLocked: originalDbLockStatus,
        lockedby: role.lockedby ?? '',
        lockeddate: role.lockeddate ?? '',
      };
    });
    
    // Sync lock status in database - always sync to ensure database consistency
    // Use original database values for comparison, not the calculated values
    // Run sync in background but log errors for debugging
    syncAllRolesLockStatus(rolesWithOriginalLock, convertedUsers, true)
      .then(() => {
        console.log('✅ Role lock status sync completed successfully');
      })
      .catch(error => {
        console.error('❌ Error syncing role lock status in background:', error);
      });
    
    // Remove temporary _originalIsLocked property before returning
    const convertedRoles: Role[] = rolesWithOriginalLock.map(({ _originalIsLocked, ...role }) => role);
    
    return convertedRoles;
  }
);

export const createRole = createAsyncThunk(
  'roles/createRole',
  async (roleData: any) => {
    const role = await roleService.createRole(roleData);
    return role;
  }
);

export const toggleRoleStatus = createAsyncThunk(
  'roles/toggleRoleStatus',
  async ({ id, isEnabled }: { 
    id: number; 
    isEnabled: boolean; 
  }) => {
    // Use the Save API instead of the old toggleRoleStatus API
    const { saveRoleStatusToggle } = await import('../../services/roleSaveService');
    await saveRoleStatusToggle(id, isEnabled);
    
    // Return the updated role data
    return { id, isEnabled };
  }
);

// Role state interface
interface RoleState {
  roles: Role[];
  loading: boolean;
  error: string | null;
  hasRoles: boolean;
  initialFetchAttempted: boolean;
}

// Initial state
const initialState: RoleState = {
  roles: [],
  loading: false,
  error: null,
  hasRoles: false,
  initialFetchAttempted: false,
};

// Role slice
const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearRoles(state) {
      state.roles = [];
      state.error = null;
      state.loading = false;
    },
    updateRoleIsEnabled(state, action: PayloadAction<{ id: number; isEnabled: boolean }>) {
      const role = state.roles.find(role => role.id === action.payload.id);
      if (role) {
        role.isenabled = action.payload.isEnabled;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.initialFetchAttempted = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.loading = false;
        state.roles = action.payload;
        state.hasRoles = action.payload.length > 0;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch roles';
      });

    // Create role
    builder
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to create role';
      });

    // Toggle role status
    builder
      .addCase(toggleRoleStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleRoleStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roles.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.roles[index].isenabled = action.payload.isEnabled;
          state.roles[index].status = action.payload.isEnabled ? 'Active' : 'Inactive';
        }
      })
      .addCase(toggleRoleStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to toggle role status';
      });
  },
});

export const { clearRoles, updateRoleIsEnabled } = roleSlice.actions;
export default roleSlice.reducer;

