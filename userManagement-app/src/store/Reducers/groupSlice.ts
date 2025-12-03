import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchGroupsFromApi, GroupModel } from '../../services/groupFetchService';
import { saveGroup, GroupFormData } from '../../services/groupSaveService';
import { TeamGroup, TeamMember } from '../../components/teamGroup/TeamGroupCard';
import type { RootState } from '../configureStore';

// Convert GroupModel to TeamGroup format
// This function needs access to users to map user_id to user details
function mapGroupModelToTeamGroup(model: GroupModel, users: any[] = []): TeamGroup {
  // Parse members if it's a JSON string
  let teamMembers: TeamMember[] = [];
  
  if (model.members) {
    try {
      // Parse JSON string - members structure: [{user_id, is_owner, is_active, joined_at, left_at}]
      const membersData = typeof model.members === 'string' 
        ? JSON.parse(model.members) 
        : model.members;
      
      if (Array.isArray(membersData)) {
        // Filter out only members who have left (left_at is not null)
        // Keep inactive members so they can be toggled
        const currentMembers = membersData.filter((member: any) => 
          !member.left_at
        );
        
        // Map to TeamMember format, using user data if available
        teamMembers = currentMembers.map((member: any) => {
          // Find user by user_id
          const user = users.find(u => Number(u.id) === Number(member.user_id));
          
          return {
            id: String(member.user_id),
            firstName: user?.firstname || '',
            lastName: user?.lastname || '',
            isOnline: member.is_active === true, // Use is_active from member data
          };
        });
      }
    } catch (error) {
      console.warn('Failed to parse members JSON:', error, 'Raw members:', model.members);
    }
  }

  return {
    id: model.id,
    name: model.name,
    description: model.description ?? '',
    createdDate: model.createdat,
    lastUpdatedDate: model.lastupdatedat || model.createdat,
    isActive: model.isactive, // Use isactive boolean directly
    teamMembers: teamMembers, // Keep all members for proper owner identification
    additionalMembersCount: Math.max(0, teamMembers.length - 4), // Count remaining members (owner + 3 others = 4)
    ownerId: model.owner_user_id, // Store owner ID
  };
}

// Helper function to map group members with full details for TeamMembersView
// This includes ALL members (active and inactive) with complete information
export function mapGroupMembersForView(model: GroupModel, users: any[] = []): Array<{
  id: string;
  firstName: string;
  lastName: string;
  emailId?: string;
  role?: string;
  joinedDate?: string;
  isActive: boolean;
  status: 'Active' | 'Inactive';
  isDeleted?: boolean;
  leftAt?: string;
}> {
  const members: Array<{
    id: string;
    firstName: string;
    lastName: string;
    emailId?: string;
    role?: string;
    joinedDate?: string;
    isActive: boolean;
    status: 'Active' | 'Inactive';
    isDeleted?: boolean;
    leftAt?: string;
  }> = [];
  
  if (model.members) {
    try {
      // Parse JSON string - members structure: [{user_id, is_owner, is_active, joined_at, left_at}]
      const membersData = typeof model.members === 'string' 
        ? JSON.parse(model.members) 
        : model.members;
      
      if (Array.isArray(membersData)) {
        // Include ALL members (both active and soft-deleted) so they can be displayed
        // Soft-deleted members have left_at set to a timestamp
        membersData.forEach((member: any) => {
          // Find user by user_id
          const user = users.find(u => Number(u.id) === Number(member.user_id));
          
          // Format joined date
          let joinedDate: string | undefined;
          if (member.joined_at) {
            try {
              const date = new Date(member.joined_at);
              const day = date.getDate();
              const month = date.toLocaleString('en-US', { month: 'short' });
              const year = date.getFullYear().toString().slice(-2);
              joinedDate = `${day}-${month}-${year}`;
            } catch (e) {
              joinedDate = member.joined_at;
            }
          }
          
          const isDeleted = !!member.left_at;
          
          members.push({
            id: String(member.user_id),
            firstName: user?.firstname || '',
            lastName: user?.lastname || '',
            emailId: user?.emailid || '',
            role: user?.role || '',
            joinedDate: joinedDate,
            isActive: member.is_active === true,
            status: member.is_active === true ? 'Active' : 'Inactive',
            isDeleted: isDeleted,
            leftAt: member.left_at || undefined,
          });
        });
      }
    } catch (error) {
      console.warn('Failed to parse members JSON for view:', error, 'Raw members:', model.members);
    }
  }
  
  return members;
}

// Async thunks
export const fetchGroups = createAsyncThunk<TeamGroup[], void, { state: RootState }>(
  'groups/fetchGroups',
  async (_, { getState }) => {
    const groups = await fetchGroupsFromApi();
    // Get users from state to map user_id to user details
    const users = getState().users.users;
    // Convert GroupModel to TeamGroup format
    const convertedGroups: TeamGroup[] = groups.map(model => mapGroupModelToTeamGroup(model, users));
    return convertedGroups;
  }
);

export const toggleGroupStatus = createAsyncThunk(
  'groups/toggleGroupStatus',
  async ({ id, isEnabled }: { 
    id: string; 
    isEnabled: boolean;
  }) => {
    // Import saveGroupStatusToggle
    const { saveGroupStatusToggle } = await import('../../services/groupSaveService');
    // Save status change to database
    await saveGroupStatusToggle(id, isEnabled);
    return { id, isEnabled };
  }
);

export const toggleMemberStatus = createAsyncThunk<{ groupId: string; memberUserId: string; isActive: boolean }, { groupId: string; memberUserId: string; isActive: boolean }, { state: RootState }>(
  'groups/toggleMemberStatus',
  async ({ groupId, memberUserId, isActive }, { rejectWithValue, dispatch }) => {
    try {
      // Import toggleMemberStatus service
      const { toggleMemberStatus: toggleMemberStatusService } = await import('../../services/groupSaveService');
      
      // Save member status change to database
      await toggleMemberStatusService(groupId, memberUserId, isActive);
      
      // Re-fetch groups to get updated data
      await dispatch(fetchGroups());
      
      return { groupId, memberUserId, isActive };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle member status');
    }
  }
);

export const softDeleteMember = createAsyncThunk<{ groupId: string; memberUserId: string }, { groupId: string; memberUserId: string }, { state: RootState }>(
  'groups/softDeleteMember',
  async ({ groupId, memberUserId }, { rejectWithValue, dispatch }) => {
    try {
      // Import softDeleteMember service
      const { softDeleteMember: softDeleteMemberService } = await import('../../services/groupSaveService');
      
      // Save soft delete to database
      await softDeleteMemberService(groupId, memberUserId);
      
      // Re-fetch groups to get updated data
      await dispatch(fetchGroups());
      
      return { groupId, memberUserId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to soft delete member');
    }
  }
);

export const createGroup = createAsyncThunk<TeamGroup, GroupFormData, { state: RootState }>(
  'groups/createGroup',
  async (groupData: GroupFormData, { getState, rejectWithValue }) => {
    try {
      // Save group to database
      await saveGroup(groupData, 'n');
      
      // Re-fetch groups to get the newly created group with its ID
      const groups = await fetchGroupsFromApi();
      const users = getState().users.users;
      
      // Find the newly created group (match by name and owner)
      const newGroup = groups
        .map(model => mapGroupModelToTeamGroup(model, users))
        .find(g => g.name === groupData.name && 
                    g.teamMembers.some(m => m.id === groupData.owner_user_id));
      
      if (!newGroup) {
        return rejectWithValue('Failed to retrieve newly created group');
      }
      
      return newGroup;
    } catch (error: any) {
      // Extract error message from various possible locations
      const errorMessage = error?.message || error?.responseData?.message || 'Failed to create group';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateGroup = createAsyncThunk<TeamGroup, GroupFormData, { state: RootState }>(
  'groups/updateGroup',
  async (groupData: GroupFormData, { getState, dispatch }) => {
    // Save group to database with update operation
    await saveGroup(groupData, 'u');
    
    // Re-fetch groups to get updated data
    await dispatch(fetchGroups());
    
    // Return the updated group data
    const groups = await fetchGroupsFromApi();
    const users = getState().users.users;
    
    // Find the updated group
    const updatedGroup = groups
      .map(model => mapGroupModelToTeamGroup(model, users))
      .find(g => g.id === groupData.id);
    
    if (!updatedGroup) {
      throw new Error('Failed to retrieve updated group');
    }
    
    return updatedGroup;
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (id: string) => {
    // Placeholder for future implementation: API call to delete group
    // This will be implemented when the delete group API endpoint is available
    // For now, just return the id
    return id;
  }
);

export const softDeleteGroup = createAsyncThunk<{ id: string }, string, { state: RootState }>(
  'groups/softDeleteGroup',
  async (groupId: string, { dispatch, rejectWithValue }) => {
    try {
      // Import softDeleteGroup service
      const { softDeleteGroup: softDeleteGroupService } = await import('../../services/groupSaveService');
      
      // Soft delete the group
      await softDeleteGroupService(groupId);
      
      // Re-fetch groups to update the UI (soft-deleted groups will be filtered out)
      await dispatch(fetchGroups());
      
      return { id: groupId };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete group';
      return rejectWithValue(errorMessage);
    }
  }
);

interface GroupState {
  groups: TeamGroup[];
  loading: boolean;
  error: string | null;
  hasGroups: boolean;
  initialFetchAttempted: boolean;
}

// Initial state
const initialState: GroupState = {
  groups: [],
  loading: false,
  error: null,
  hasGroups: false,
  initialFetchAttempted: false,
};

// Group slice
const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearGroups(state) {
      state.groups = [];
      state.error = null;
      state.loading = false;
    },
    updateGroupIsEnabled(state, action: PayloadAction<{ id: string; isEnabled: boolean }>) {
      const group = state.groups.find(group => group.id === action.payload.id);
      if (group) {
        group.isActive = action.payload.isEnabled;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.initialFetchAttempted = true;
      })
      .addCase(fetchGroups.fulfilled, (state, action: PayloadAction<TeamGroup[]>) => {
        state.loading = false;
        state.groups = action.payload;
        state.hasGroups = action.payload.length > 0;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch groups';
      });

    // Toggle group status
    builder
      .addCase(toggleGroupStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleGroupStatus.fulfilled, (state, action) => {
        state.loading = false;
        const group = state.groups.find(g => g.id === action.payload.id);
        if (group) {
          group.isActive = action.payload.isEnabled;
        }
      })
      .addCase(toggleGroupStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to toggle group status';
      });

    // Toggle member status
    builder
      .addCase(toggleMemberStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleMemberStatus.fulfilled, (state) => {
        state.loading = false;
        // Groups will be refreshed by fetchGroups in the thunk
      })
      .addCase(toggleMemberStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to toggle member status';
      });

    // Create group
    builder
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action: PayloadAction<TeamGroup>) => {
        state.loading = false;
        // Add the newly created group to the list
        state.groups.push(action.payload);
        state.hasGroups = state.groups.length > 0;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        // Extract error message from payload (rejectWithValue) or error message
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : action.error.message ?? 'Failed to create group';
      });

    // Update group
    builder
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state) => {
        state.loading = false;
        // Note: Group list is refreshed via fetchGroupsFromApi after update
        // No need to manually update the list here
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to update group';
      });

    // Delete group
    builder
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter(g => g.id !== action.payload);
        state.hasGroups = state.groups.length > 0;
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to delete group';
      });

    // Soft delete group
    builder
      .addCase(softDeleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(softDeleteGroup.fulfilled, (state) => {
        state.loading = false;
        // Groups will be refreshed by fetchGroups in the thunk
      })
      .addCase(softDeleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : action.error.message ?? 'Failed to delete group';
      });
  }
});

export const { clearGroups, updateGroupIsEnabled } = groupSlice.actions;
export default groupSlice.reducer;

