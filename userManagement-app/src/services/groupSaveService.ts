import {
  quoteString,
  getSaveEndpoint,
  formatTimestamp
} from '../utils/saveServiceUtils';
import {
  formatTimestampForJson,
  addTimestampField,
  makeSaveApiCall,
  parseMembersJson,
  buildCsvFromColumns,
  createSaveApiBody,
  buildGroupMembersUpdateColumns,
  findMemberIndex,
  fetchAndParseGroupMembers,
  logCsvData,
  logOperationStart,
  logOperationEnd,
  logSaveSuccess,
  logGroupUpdate,
  logBulkOperationProgress,
  logBulkOperationComplete,
  logGroupsFoundForCheck,
  logUserFoundInGroup,
  deactivateUserInMembers,
  executeStatusToggleOperation,
  buildInitialCsvColumns
} from './serviceUtils';

export type OperationType = 'n' | 'u' | 'd'; // new, update, delete

export interface GroupFormData {
  name: string;
  description?: string;
  owner_user_id: string; // User ID as string
  members?: string[]; // Array of user IDs as strings
  isactive: boolean;
  id?: string; // for updates/deletes
  createdat?: string;
  lastupdatedat?: string;
}

export function buildGroupCsv(form: GroupFormData, op: OperationType = 'n'): { headers: string; row: string } {
  // Use shared helper to build initial columns (operation and ID)
  const columns = buildInitialCsvColumns(op, form.id);

  // Required fields
  columns.push({ name: 'name', include: true, value: quoteString(form.name) });
  columns.push({ name: 'owner_user_id', include: true, value: form.owner_user_id }); // Integer, no quotes
  columns.push({ name: 'isactive', include: true, value: form.isactive ? 'true' : 'false' });
  columns.push({ name: 'softdelete', include: true, value: 'false' }); // Default to false for new groups

  // Optional fields
  if (form.description) {
    columns.push({ name: 'description', include: true, value: quoteString(form.description) });
  }

  // Members field - convert array of user IDs to JSON format
  // Format: [{user_id: X, is_owner: false, is_active: true, joined_at: timestamp, left_at: null}]
  // Always include at least the owner as a member

  const joinedAt = formatTimestampForJson();
  
  // Start with owner as first member
  const membersArray: Array<{
    user_id: number;
    is_owner: boolean;
    is_active: boolean;
    joined_at: string;
    left_at: null;
  }> = [{
    user_id: parseInt(form.owner_user_id),
    is_owner: true,
    is_active: true,
    joined_at: joinedAt,
    left_at: null
  }];
  
  // Add other members (excluding owner if already in the list)
  if (form.members && form.members.length > 0) {
    form.members.forEach((userId) => {
      // Don't add owner again if they're in the members list
      if (userId !== form.owner_user_id) {
        membersArray.push({
          user_id: parseInt(userId),
          is_owner: false,
          is_active: true,
          joined_at: joinedAt,
          left_at: null
        });
      }
    });
  }
  
  columns.push({ name: 'members', include: true, value: quoteString(JSON.stringify(membersArray)) });

  // Timestamp fields
  if (op === 'n') {
    addTimestampField(columns, 'createdat', form.createdat);
  }
  if (op === 'u' || op === 'n') {
    addTimestampField(columns, 'lastupdatedat', form.lastupdatedat);
  }

  return buildCsvFromColumns(columns);
}

export async function saveGroup(form: GroupFormData, op: OperationType = 'n') {
  const { headers, row } = buildGroupCsv(form, op);
  
  logOperationStart('SAVE GROUP API CALLED', {
    'Group Name': form.name,
    'Owner User ID': form.owner_user_id,
    'Members': form.members,
    'Is Active': form.isactive,
    'Operation': op
  });
  logCsvData(headers, row);
  logOperationEnd(28);
  
  const body = createSaveApiBody(headers, row, 'teams_and_groups');
  const responseData = await makeSaveApiCall(body, 'Save Group');
  logSaveSuccess('group', form.name);
  return responseData;
}

// Function to save group status toggle (isactive field)
export async function saveGroupStatusToggle(
  groupId: string, 
  isActive: boolean
) {
  const headers = '_ops|id|isactive';
  const row = `u|${groupId}|${isActive ? 'true' : 'false'}`;
  
  return executeStatusToggleOperation({
    operationName: 'SAVE GROUP STATUS TOGGLE',
    headers,
    row,
    tableName: 'teams_and_groups',
    entityType: 'group status',
    identifier: groupId,
    additionalLogData: {
      'Group ID': groupId,
      'New isActive': isActive,
      'Operation': 'u (update)'
    },
    separatorLength: 33
  });
}

// Function to soft delete a group (set softdelete = true)
export async function softDeleteGroup(groupId: string) {
  const headers = '_ops|id|softdelete|lastupdatedat';
  const timestamp = formatTimestamp();
  const row = `u|${groupId}|true|${timestamp}`;
  
  logOperationStart('SOFT DELETE GROUP', {
    'Group ID': groupId,
    'Operation': 'u (update)'
  });
  logCsvData(headers, row);
  logOperationEnd(28);
  
  const body = createSaveApiBody(headers, row, 'teams_and_groups');
  const responseData = await makeSaveApiCall(body, 'Soft Delete Group');
  logSaveSuccess('soft-deleted group', groupId);
  
  return responseData;
}

// Helper function to update member in group
const updateMemberInGroup = async (
  groupId: string,
  memberUserId: string,
  updateFn: (member: any) => void,
  requireActive: boolean,
  operationName: string
) => {
  logOperationStart(operationName, {
    'Group ID': groupId,
    'Member User ID': memberUserId
  });

  try {
    const { membersArray } = await fetchAndParseGroupMembers(groupId);
    const memberIndex = findMemberIndex(membersArray, memberUserId, requireActive);

    if (memberIndex === -1) {
      const errorMsg = requireActive 
        ? `Active member with user ID ${memberUserId} not found in group`
        : `Member with user ID ${memberUserId} not found in group`;
      throw new Error(errorMsg);
    }

    updateFn(membersArray[memberIndex]);

    // Build CSV for update operation
    const columns = buildGroupMembersUpdateColumns(groupId, membersArray, quoteString);
    addTimestampField(columns, 'lastupdatedat');

    const { headers, row } = buildCsvFromColumns(columns);
    logCsvData(headers, row, { 'Updated members array': JSON.stringify(membersArray, null, 2) });

    const body = createSaveApiBody(headers, row, 'teams_and_groups');
    const responseData = await makeSaveApiCall(body, operationName);
    logSaveSuccess(operationName.toLowerCase(), memberUserId);
    
    return responseData;
  } catch (error: any) {
    console.error(`${operationName}: Error details`, {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: getSaveEndpoint()
    });
    throw error;
  }
};

// Function to toggle a member's status in a group
export async function toggleMemberStatus(
  groupId: string,
  memberUserId: string,
  isActive: boolean
) {
  return updateMemberInGroup(
    groupId,
    memberUserId,
    (member) => { member.is_active = isActive; },
    false,
    'Toggle Member Status'
  );
}

// Function to soft delete a member from a group (set left_at timestamp)
export async function softDeleteMember(
  groupId: string,
  memberUserId: string
) {
  return updateMemberInGroup(
    groupId,
    memberUserId,
    (member) => {
      member.left_at = formatTimestampForJson();
      member.is_active = false;
    },
    true,
    'Soft Delete Member'
  );
}

// Helper function to parse and find user in group members
const findUserInGroupMembers = (group: any, userId: number): { groupId: string; membersArray: any[] } | null => {
  if (!group.members) return null;
  
  const membersData = parseMembersJson(group.members);
  if (!Array.isArray(membersData) || membersData.length === 0) return null;
  
  const memberIndex = findMemberIndex(membersData, String(userId), true);
  if (memberIndex === -1) return null;
  
  const updatedMembers = deactivateUserInMembers(membersData, memberIndex);
  
  return {
    groupId: group.id,
    membersArray: updatedMembers
  };
};

// Helper function to find all groups containing the user
const findGroupsContainingUser = async (userId: number): Promise<Array<{ groupId: string; membersArray: any[] }>> => {
  const { fetchGroupsFromApi } = await import('./groupFetchService');
  const allGroups = await fetchGroupsFromApi();
  logGroupsFoundForCheck(allGroups.length);
  
  const groupsToUpdate: Array<{ groupId: string; membersArray: any[] }> = [];
  
  for (const group of allGroups) {
    const groupUpdate = findUserInGroupMembers(group, userId);
    if (groupUpdate) {
      groupsToUpdate.push(groupUpdate);
      logUserFoundInGroup(group.name, group.id);
    }
  }
  
  return groupsToUpdate;
};

// Helper function to update a single group
const updateGroupMembers = async (groupId: string, membersArray: any[]): Promise<void> => {
  const columns = buildGroupMembersUpdateColumns(groupId, membersArray, quoteString);
  addTimestampField(columns, 'lastupdatedat');

  const { headers, row } = buildCsvFromColumns(columns);
  const body = createSaveApiBody(headers, row, 'teams_and_groups');

  try {
    await makeSaveApiCall(body, 'Update Group Members');
    logGroupUpdate(groupId);
  } catch (error: any) {
    console.error(`Failed to update group ${groupId}:`, error?.message);
    throw error;
  }
};

// Function to update all groups when a user is deactivated
// This sets the user's is_active to false in all groups where they are a member
export async function deactivateUserInAllGroups(userId: number): Promise<void> {
  logOperationStart('DEACTIVATE USER IN ALL GROUPS', {
    'User ID': userId
  });

  try {
    const groupsToUpdate = await findGroupsContainingUser(userId);
    logBulkOperationProgress(groupsToUpdate.length, 'Updating');
    
    for (const { groupId, membersArray } of groupsToUpdate) {
      try {
        await updateGroupMembers(groupId, membersArray);
      } catch (error: any) {
        console.error(`Error updating group ${groupId}:`, error);
        // Continue with other groups even if one fails
      }
    }
    
    logBulkOperationComplete(groupsToUpdate.length, 'updating', userId);
  } catch (error: any) {
    console.error('Error deactivating user in all groups:', error);
    // Don't throw - we don't want to fail the user deactivation if group updates fail
  }
}

