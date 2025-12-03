import { fetchUsersFromApi } from '../services/userFetchService';
import { fetchUsers } from '../store/Reducers/userSlice';
import axios from 'axios';
import { formatTimestamp, quoteString, getSaveEndpoint } from './saveServiceUtils';

/**
 * Update all users with a specific role name to a new role name
 * @param oldRoleName - The old role name to find users by
 * @param newRoleName - The new role name to assign
 */
export const updateUsersWithRoleName = async (
  oldRoleName: string | null,
  newRoleName: string | null
): Promise<void> => {
  // Early return if role names are invalid or the same
  if (!oldRoleName || !newRoleName || oldRoleName === newRoleName) {
    console.log('No role name change or invalid names. Skipping user updates.');
    return;
  }

  try {
    // Fetch all users
    const users = await fetchUsersFromApi();
    
    // Filter users with the old role name (case-insensitive)
    const usersToUpdate = users.filter(user => {
      const userRole = user.role || '';
      return userRole.trim().toLowerCase() === oldRoleName.trim().toLowerCase();
    });

    if (usersToUpdate.length === 0) {
      console.log(`No users found with role "${oldRoleName}". Skipping update.`);
      return;
    }

    console.log(`🔄 Updating ${usersToUpdate.length} user(s) from role "${oldRoleName}" to "${newRoleName}"`);

    // Build CSV data for bulk update using pipe delimiter (matching userSaveService format)
    const headers = '_ops|id|role|lastupdatedat|lastupdatedby';
    const rows = usersToUpdate.map(user => {
      const timestamp = formatTimestamp();
      const id = String(user.id || '');
      const role = quoteString(newRoleName);
      const lastupdatedat = timestamp;
      const lastupdatedby = quoteString('System'); // Or get from context
      
      // Format: operation|id|role|timestamp|updatedBy
      return `u|${id}|${role}|${lastupdatedat}|${lastupdatedby}`;
    });

    const csvData = [headers, ...rows];

    console.log('=== BULK UPDATE USERS ROLE ===');
    console.log(`Old Role: ${oldRoleName}`);
    console.log(`New Role: ${newRoleName}`);
    console.log(`Users to update: ${usersToUpdate.length}`);
    console.log('CSV Headers:', headers);
    console.log('CSV First Row Sample:', rows[0]);
    console.log('Full CSV Data:', csvData);

    // Make API call
    const endpoint = getSaveEndpoint();
    const response = await axios.post(endpoint, {
      tableName: 'user_management',
      csvData,
      hasHeaders: true,
      uniqueColumn: 'id'
    });

    console.log('API Response:', response.data);
    
    if (response.data.status === 'Error') {
      throw new Error(response.data.message || 'Failed to update users with new role name');
    }

    console.log(`✅ Successfully updated ${usersToUpdate.length} user(s) with new role name`);
    console.log('Response status:', response.data.status);
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    console.error(`❌ Error updating users with new role name: ${errorMessage}`);
    throw new Error(`Failed to update users with new role name: ${errorMessage}`);
  }
};

/**
 * Shared function to update users with new role name after role name change
 * Extracted to eliminate duplication in RoleForm.tsx handleSave and handleSubmit
 */
export const updateUsersWithRoleNameAndRefresh = async (
  oldRoleName: string,
  newRoleName: string,
  dispatch: any,
  setNotification: (notification: { open: boolean; message: string; type: 'success' | 'error' }) => void
): Promise<void> => {
  try {
    console.log('🔄 Starting user role update process...');
    await updateUsersWithRoleName(oldRoleName, newRoleName);
    
    // Add a delay to ensure database changes are committed and propagated
    console.log('⏳ Waiting for database commit...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Refresh users list to reflect the changes - await to ensure it completes
    console.log('🔄 Fetching updated users from database...');
    // @ts-ignore
    const fetchResult = await dispatch(fetchUsers());
    
    // Verify the fetch was successful
    if (fetchResult?.payload) {
      const updatedUsers = fetchResult.payload;
      const usersWithNewRole = updatedUsers.filter((u: any) => 
        (u.role || '').trim().toLowerCase() === newRoleName.trim().toLowerCase()
      );
      console.log(`✅ Fetched ${updatedUsers.length} users, ${usersWithNewRole.length} with new role "${newRoleName}"`);
    }
    
    // Add another delay to ensure Redux state has propagated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Users list refreshed with updated role names');
  } catch (error: any) {
    console.error('❌ Error in updateUsersWithRoleNameAndRefresh:', error);
    // Don't fail the operation if user update fails, but show a warning
    setNotification({
      open: true,
      message: `Operation completed successfully, but failed to update users with new role name: ${error?.message || 'Unknown error'}`,
      type: 'error'
    });
  }
};
