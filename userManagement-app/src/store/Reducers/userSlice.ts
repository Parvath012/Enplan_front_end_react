import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService, User } from '../../services/userService';
import { fetchUsersFromApi } from '../../services/userFetchService';
import { fetchUserHierarchyFromApi, fetchAllHierarchiesFromApi, UserHierarchyModel } from '../../services/reportingStructureService';
import { convertUserModelsToUsers } from '../../utils/userConversionUtils';

// Async thunks
export const fetchUsers = createAsyncThunk<User[]>(
  'users/fetchUsers',
  async () => {
    const users = await fetchUsersFromApi();
    // Convert UserModel to User format for compatibility using shared utility
    return convertUserModelsToUsers(users);
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: any) => {
    const user = await userService.createUser(userData);
    return user;
  }
);

export const fetchRoles = createAsyncThunk(
  'users/fetchRoles',
  async () => {
    const roles = await userService.getRoles();
    return roles;
  }
);

export const fetchDepartments = createAsyncThunk(
  'users/fetchDepartments',
  async () => {
    const departments = await userService.getDepartments();
    return departments;
  }
);

export const fetchUsersForReporting = createAsyncThunk(
  'users/fetchUsersForReporting',
  async () => {
    const users = await userService.getUsersForReporting();
    return users;
  }
);

export const toggleUserStatus = createAsyncThunk(
  'users/toggleUserStatus',
  async ({ id, isEnabled, transferedby, transferedto, transfereddate }: { 
    id: number; 
    isEnabled: boolean; 
    transferedby?: string | null; 
    transferedto?: string | null;
    transfereddate?: string | null; 
  }) => {
    // Use the Save API instead of the old toggleUserStatus API
    const { saveUserStatusToggle } = await import('../../services/userSaveService');
    const response = await saveUserStatusToggle(id, isEnabled, transferedby, transferedto, transfereddate);
    
    // Return the updated user data
    return { id, isEnabled, transferedby, transferedto, transfereddate, ...response };
  }
);

export const fetchUserHierarchy = createAsyncThunk<UserHierarchyModel[], { viewType?: 'organizational' | 'departmental' | 'dotted-line' }>(
  'users/fetchUserHierarchy',
  async ({ viewType = 'organizational' }, { rejectWithValue }) => {
    console.log('Redux: fetchUserHierarchy thunk started with viewType:', viewType);
    try {
      let hierarchy: UserHierarchyModel[];
      
      if (viewType === 'dotted-line') {
        hierarchy = await fetchAllHierarchiesFromApi();
      } else {
        hierarchy = await fetchUserHierarchyFromApi();
      }
      
      console.log('Redux: fetchUserHierarchy thunk completed successfully:', hierarchy);
      return hierarchy;
    } catch (error: any) {
      console.error('Redux: fetchUserHierarchy thunk failed:', error);
      return rejectWithValue(error.message || 'Failed to fetch user hierarchy');
    }
  }
);

// User state interface
interface UserState {
  users: User[];
  loading: boolean;
  hierarchyLoading: boolean;
  hierarchy: UserHierarchyModel[] | null;
  error: string | null;
  hierarchyError: string | null;
  hasUsers: boolean;
  initialFetchAttempted: boolean;
}

// Initial state
const initialState: UserState = {
  users: [],
  loading: false,
  hierarchyLoading: false,
  hierarchy: null,
  error: null,
  hierarchyError: null,
  hasUsers: false,
  initialFetchAttempted: false,
};

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsers(state) {
      state.users = [];
      state.error = null;
      state.loading = false;
    },
    updateUserIsEnabled(state, action: PayloadAction<{ id: number; isEnabled: boolean }>) {
      const user = state.users.find(user => user.id === action.payload.id);
      if (user) {
        user.isenabled = action.payload.isEnabled;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.initialFetchAttempted = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
        state.hasUsers = action.payload.length > 0;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch users';
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to create user';
      });

    // Toggle user status
    builder
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Redux: toggleUserStatus.fulfilled', action.payload);
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          console.log('=== REDUX STATE UPDATE ===');
          console.log('User found at index:', index);
          console.log('Old isenabled:', state.users[index].isenabled);
          console.log('New isenabled:', action.payload.isEnabled);
          console.log('Old status:', state.users[index].status);
          console.log('Old transferedby:', state.users[index].transferedby);
          console.log('Old transferedto:', state.users[index].transferedto);
          console.log('New transferedby:', action.payload.transferedby);
          console.log('New transferedto:', action.payload.transferedto);
          console.log('New transfereddate:', action.payload.transfereddate);
          
          // Update isenabled and status fields
          state.users[index].isenabled = action.payload.isEnabled;
          state.users[index].status = action.payload.isEnabled ? 'Active' : 'Inactive';
          
          // Update transferedby, transferedto, and transfereddate fields if provided
          if (action.payload.transferedby !== undefined) {
            state.users[index].transferedby = action.payload.transferedby || '';
          }
          if (action.payload.transferedto !== undefined) {
            state.users[index].transferedto = action.payload.transferedto || '';
          }
          if (action.payload.transfereddate !== undefined) {
            state.users[index].transfereddate = action.payload.transfereddate || '';
          }
          
          console.log('New isenabled:', state.users[index].isenabled);
          console.log('New status:', state.users[index].status);
          console.log('New transferedby:', state.users[index].transferedby);
          console.log('New transferedto:', state.users[index].transferedto);
          console.log('New transfereddate:', state.users[index].transfereddate);
          console.log('===========================');
        } else {
          console.log('Redux: User not found with id', action.payload.id);
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to toggle user status';
      });

    // Fetch user hierarchy
    builder
      .addCase(fetchUserHierarchy.pending, (state) => {
        console.log('Redux: fetchUserHierarchy.pending - setting hierarchyLoading to true');
        // Don't clear existing hierarchy - keep it visible during loading for smooth transitions
        state.hierarchyLoading = true;
        state.hierarchyError = null;
        // Keep existing hierarchy data to prevent full page refresh
        // Only update when new data arrives
      })
      .addCase(fetchUserHierarchy.fulfilled, (state, action: PayloadAction<UserHierarchyModel[]>) => {
        console.log('Redux: fetchUserHierarchy.fulfilled - setting hierarchy data:', action.payload);
        console.log('Redux: fetchUserHierarchy.fulfilled - payload length:', action.payload?.length);
        console.log('Redux: fetchUserHierarchy.fulfilled - payload type:', typeof action.payload);
        console.log('Redux: fetchUserHierarchy.fulfilled - is array:', Array.isArray(action.payload));
        console.log('Redux: fetchUserHierarchy.fulfilled - full payload:', JSON.stringify(action.payload, null, 2));
        state.hierarchyLoading = false;
        // Update hierarchy data smoothly - this will trigger graph re-render without full page refresh
        state.hierarchy = action.payload;
      })
      .addCase(fetchUserHierarchy.rejected, (state, action) => {
        console.error('Redux: fetchUserHierarchy.rejected - error:', action.error.message);
        state.hierarchyLoading = false;
        state.hierarchyError = action.error.message ?? 'Failed to fetch user hierarchy';
        // Keep existing hierarchy data even on error to prevent full refresh
      });
  },
});

export const { clearUsers, updateUserIsEnabled } = userSlice.actions;
export default userSlice.reducer;
