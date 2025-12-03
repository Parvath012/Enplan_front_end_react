import axios from 'axios';
// Import shared utility functions from saveServiceUtils to avoid duplication
import {
  getSaveEndpoint,
  formatTimestamp,
  quoteJSON
} from '../utils/saveServiceUtils';

/**
 * Format timestamp for JSON (ISO format without quotes)
 */
export function formatTimestampForJson(): string {
  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const yyyy = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}`;
}

// quoteJSON is imported from saveServiceUtils to avoid duplication
// Re-export it for backward compatibility
export { quoteJSON };

/**
 * Format a date string to timestamp format
 */
export function formatDateToTimestamp(dateString?: string): string {
  if (!dateString) {
    return formatTimestamp();
  }
  const date = new Date(dateString);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `'${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}'`;
}

/**
 * Add timestamp field to columns array
 */
export const addTimestampField = (
  columns: Array<{ name: string; include: boolean; value: string }>,
  fieldName: string,
  timestamp?: string
): void => {
  const value = timestamp ? formatDateToTimestamp(timestamp) : formatTimestamp();
  columns.push({ name: fieldName, include: true, value });
};

/**
 * Make API call with error handling
 */
export async function makeSaveApiCall(
  body: {
    tableName: string;
    csvData: string[];
    hasHeaders: boolean;
    uniqueColumn?: string;
  },
  operationName: string = 'Save'
): Promise<any> {
  console.log(`${operationName} API: Request body`, body);
  console.log(`${operationName} API: Endpoint URL`, getSaveEndpoint());

  try {
    const response = await axios.post(getSaveEndpoint(), body);
    const responseData = response.data;

    console.log(`${operationName} API: Response`, responseData);

    // Check if the response indicates an error even with 200 status
    if (responseData.status === 'Error') {
      throw new Error(responseData.message || `Failed to ${operationName.toLowerCase()}`);
    }

    // Verify the response indicates success
    if (responseData.status === 'Ok' || responseData.status === 'Success') {
      console.log(`✅ Database ${operationName.toLowerCase()} successful`);
    }

    return responseData;
  } catch (error: any) {
    // Extract error message from various possible locations
    let errorMessage = 'Error saving data.';
    
    if (error?.response?.data) {
      // Try to get message from response data
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    console.error(`${operationName} API: Error details`, {
      message: errorMessage,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: getSaveEndpoint(),
      fullError: error
    });
    
    // Create a more informative error with the extracted message
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).originalError = error;
    (enhancedError as any).status = error?.response?.status;
    (enhancedError as any).responseData = error?.response?.data;
    throw enhancedError;
  }
}

// createApiClient has been moved to apiClientUtils.ts to avoid duplication
// Import it from '../utils/apiClientUtils' if needed

/**
 * Parse members JSON data from group
 */
export function parseMembersJson(members: any): any[] {
  if (!members) {
    return [];
  }
  
  try {
    const membersData = typeof members === 'string' 
      ? JSON.parse(members) 
      : members;
    
    if (!Array.isArray(membersData)) {
      return [];
    }
    
    return membersData;
  } catch (error) {
    console.error('Failed to parse members JSON:', error);
    return [];
  }
}

/**
 * Parse members from group and return active member user IDs as strings
 */
export function parseActiveMemberUserIds(members: any): string[] {
  const membersData = parseMembersJson(members);
  const activeMembers = membersData.filter((member: any) => !member.left_at);
  return activeMembers.map((member: any) => String(member.user_id));
}

/**
 * Build CSV headers and row from columns array
 */
export function buildCsvFromColumns(columns: Array<{ name: string; include: boolean; value: string }>): { headers: string; row: string } {
  const headers = columns.filter(c => c.include).map(c => c.name).join('|');
  const row = columns.filter(c => c.include).map(c => c.value).join('|');
  return { headers, row };
}

/**
 * Build initial CSV columns with operation and ID fields
 * Shared helper to avoid duplication between buildGroupCsv and buildUserCsv
 */
export function buildInitialCsvColumns(
  op: 'n' | 'u' | 'd',
  formId?: string
): Array<{ name: string; include: boolean; value: string }> {
  const columns: Array<{ name: string; include: boolean; value: string }> = [
    { name: '_ops', include: true, value: op },
  ];

  // Add ID column based on operation
  if (op === 'u' || op === 'd') {
    if (!formId) {
      throw new Error('id is required for update/delete operations');
    }
    columns.push({ name: 'id', include: true, value: formId });
  } else {
    columns.push({ name: 'id', include: true, value: '' }); // Empty for new records
  }

  return columns;
}

/**
 * Create API body for save operations
 */
export function createSaveApiBody(headers: string, row: string, tableName: string, uniqueColumn: string = 'id'): {
  tableName: string;
  csvData: string[];
  hasHeaders: boolean;
  uniqueColumn: string;
} {
  return {
    tableName,
    csvData: [headers, row],
    hasHeaders: true,
    uniqueColumn,
  };
}

/**
 * Build update columns for group members operations
 */
export function buildGroupMembersUpdateColumns(
  groupId: string,
  membersArray: any[],
  quoteString: (value?: string | null) => string
): Array<{ name: string; include: boolean; value: string }> {
  return [
    { name: '_ops', include: true, value: 'u' },
    { name: 'id', include: true, value: groupId },
    { name: 'members', include: true, value: quoteString(JSON.stringify(membersArray)) },
  ];
}

/**
 * Find member index in members array by user ID
 */
export function findMemberIndex(
  membersArray: Array<{ user_id: number; left_at?: string | null }>,
  memberUserId: string,
  requireActive: boolean = false
): number {
  return membersArray.findIndex((member: any) => {
    const matches = String(member.user_id) === String(memberUserId);
    if (requireActive) {
      return matches && !member.left_at;
    }
    return matches;
  });
}

/**
 * Deactivate user in group members array
 */
export function deactivateUserInMembers(membersData: any[], memberIndex: number): any[] {
  const updatedMembers = [...membersData];
  updatedMembers[memberIndex] = {
    ...updatedMembers[memberIndex],
    is_active: false
  };
  return updatedMembers;
}

/**
 * Fetch and parse group members for operations
 */
export async function fetchAndParseGroupMembers(
  groupId: string
): Promise<{
  group: any;
  membersArray: Array<{
    user_id: number;
    is_owner: boolean;
    is_active: boolean;
    joined_at: string;
    left_at: string | null;
  }>;
}> {
  const { fetchGroupById } = await import('./groupFetchService');
  const group = await fetchGroupById(groupId);
  
  if (!group) {
    throw new Error(`Group with ID ${groupId} not found`);
  }

  const membersArray = parseMembersJson(group.members) as Array<{
    user_id: number;
    is_owner: boolean;
    is_active: boolean;
    joined_at: string;
    left_at: string | null;
  }>;
  
  if (membersArray.length === 0 && group.members) {
    throw new Error('Failed to parse group members data');
  }

  return { group, membersArray };
}

/**
 * Log CSV data for debugging
 */
export function logCsvData(headers: string, row: string, additionalData?: Record<string, any>): void {
  console.log('CSV Headers:', headers);
  console.log('CSV Row:', row);
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
  }
}

/**
 * Log operation start with header separator
 */
export function logOperationStart(operationName: string, data?: Record<string, any>): void {
  console.log(`=== ${operationName.toUpperCase()} ===`);
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
  }
}

/**
 * Log operation end with separator
 */
export function logOperationEnd(separatorLength: number = 30): void {
  console.log('='.repeat(separatorLength));
}

/**
 * Log successful database save operation
 */
export function logSaveSuccess(entityType: string, identifier: string | number, additionalInfo?: Record<string, any>): void {
  console.log(`✅ Database save successful for ${entityType}:`, identifier);
  if (additionalInfo) {
    Object.entries(additionalInfo).forEach(([key, value]) => {
      console.log(`✅ ${key}:`, value);
    });
  }
}

/**
 * Log group update operation
 */
export function logGroupUpdate(groupId: string): void {
  console.log(`✅ Updated group ${groupId}`);
}

/**
 * Log bulk operation progress
 */
export function logBulkOperationProgress(count: number, operation: string): void {
  console.log(`${operation} ${count} groups`);
}

/**
 * Log bulk operation completion
 */
export function logBulkOperationComplete(count: number, operation: string, identifier: string | number): void {
  const entityType = operation === 'Updating' ? 'user' : 'entity';
  console.log(`✅ Completed ${operation.toLowerCase()} ${count} groups for ${entityType} ${identifier}`);
}

/**
 * Log when groups are found for checking
 */
export function logGroupsFoundForCheck(count: number): void {
  console.log(`Found ${count} groups to check`);
}

/**
 * Log when user is found in a group
 */
export function logUserFoundInGroup(groupName: string, groupId: string): void {
  console.log(`Found user in group: ${groupName} (ID: ${groupId})`);
}

/**
 * Handle user deactivation in all groups
 */
export async function handleUserDeactivationInGroups(userId: number): Promise<void> {
  console.log('User is being deactivated, updating all groups...');
  try {
    const { deactivateUserInAllGroups } = await import('./groupSaveService');
    await deactivateUserInAllGroups(userId);
    logSaveSuccess('deactivated user in all groups', userId);
  } catch (error) {
    console.error('Failed to deactivate user in groups:', error);
    // Don't throw - user deactivation should succeed even if group updates fail
  }
}

/**
 * Log save API environment variables (for debugging)
 */
export function logSaveApiEnvironment(): void {
  console.log('Save API: Environment variable REACT_APP_DATA_API_URL:', process.env.REACT_APP_DATA_API_URL);
  console.log('Save API: All environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_DATA_API_URL: process.env.REACT_APP_DATA_API_URL,
    REACT_APP_USER_MANAGEMENT_API_URL: process.env.REACT_APP_USER_MANAGEMENT_API_URL
  });
}

/**
 * Options for status toggle operation
 */
export interface StatusToggleOperationOptions {
  operationName: string;
  headers: string;
  row: string;
  tableName: string;
  entityType: string;
  identifier: string | number;
  additionalLogData?: Record<string, any>;
  separatorLength?: number;
  uniqueColumn?: string;
}

/**
 * Shared helper function for status toggle operations
 * Reduces duplication between groupSaveService and userSaveService
 */
export async function executeStatusToggleOperation(
  options: StatusToggleOperationOptions
): Promise<any> {
  const {
    operationName,
    headers,
    row,
    tableName,
    entityType,
    identifier,
    additionalLogData,
    separatorLength = 30,
    uniqueColumn = 'id'
  } = options;

  logOperationStart(operationName, additionalLogData);
  logCsvData(headers, row);
  logOperationEnd(separatorLength);
  
  const body = createSaveApiBody(headers, row, tableName, uniqueColumn);
  const responseData = await makeSaveApiCall(body, operationName);
  logSaveSuccess(entityType, identifier);
  
  return responseData;
}

