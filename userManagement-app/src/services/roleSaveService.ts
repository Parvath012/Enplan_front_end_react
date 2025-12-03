import type { RoleFormData } from '../types/RoleFormData';
import {
  quoteString,
  formatTimestamp,
  quoteJSON,
  getSaveEndpoint
} from '../utils/saveServiceUtils';
import {
  logCsvData,
  logOperationStart,
  logOperationEnd
} from './serviceUtils';
import axios from 'axios';

export type OperationType = 'n' | 'u' | 'd'; // new, update, delete

// Helper function to add ID column
function addIdColumn(columns: string[], values: string[], form: RoleFormData, op: OperationType): void {
  // Always add 'id' column to headers
  columns.push('id');
  
  if (op === 'u' || op === 'd') {
    if (!form.id) {
      throw new Error('id is required for update/delete operations');
    }
    values.push(String(form.id));
  } else {
    // For new records, use empty string for id (database will auto-generate)
    values.push('');
  }
}

// Helper function to add required fields
function addRequiredFields(columns: string[], values: string[], form: RoleFormData): void {
  columns.push('rolename');
  values.push(quoteString(form.roleName));
  columns.push('status');
  values.push(quoteString(form.status));
  columns.push('isenabled');
  values.push(form.status === 'Active' ? 'true' : 'false');
  columns.push('softdelete');
  values.push('false');
  columns.push('islocked');
  values.push('false');
}

// Helper function to add optional fields
function addOptionalFields(columns: string[], values: string[], form: RoleFormData): void {
  if (form.department) {
    columns.push('department');
    values.push(quoteString(form.department));
  }
  if (form.roleDescription) {
    columns.push('roledescription');
    values.push(quoteString(form.roleDescription));
  }
  if (form.parentAttribute && Array.isArray(form.parentAttribute) && form.parentAttribute.length > 0) {
    columns.push('parentattribute');
    values.push(quoteJSON(form.parentAttribute));
  }
  // Always save permissions if they exist, even if arrays are empty (all modules OFF)
  // This ensures that when all modules are turned OFF, the empty arrays are saved to the database
  if (form.permissions?.enabledModules !== undefined && 
      form.permissions?.selectedPermissions !== undefined &&
      Array.isArray(form.permissions.enabledModules) &&
      Array.isArray(form.permissions.selectedPermissions)) {
    columns.push('permissions');
    values.push(quoteJSON({
      enabledModules: form.permissions.enabledModules || [],
      selectedPermissions: form.permissions.selectedPermissions || []
    }));
  }
}

// Helper function to add timestamp fields
function addTimestampFields(columns: string[], values: string[], op: OperationType): void {
  if (op === 'n') {
    columns.push('createdat');
    values.push(formatTimestamp());
    columns.push('createdby');
    values.push(quoteString('Admin'));
    columns.push('lastupdatedat');
    values.push(formatTimestamp());
  } else if (op === 'u') {
    columns.push('lastupdatedat');
    values.push(formatTimestamp());
    columns.push('updatedby');
    values.push(quoteString('Admin'));
  }
}

// Build CSV for role save/update
export function buildRoleCsv(form: RoleFormData, op: OperationType = 'n'): { headers: string; row: string } {
  const columns: string[] = ['_ops'];
  const values: string[] = [op];

  addIdColumn(columns, values, form, op);
  addRequiredFields(columns, values, form);
  addOptionalFields(columns, values, form);
  addTimestampFields(columns, values, op);

  const headers = columns.join('|');
  const row = values.join('|');

  logOperationStart('BUILD ROLE CSV', {
    'Operation': op,
    'Column count': columns.length,
    'Value count': values.length
  });
  logCsvData(headers, row);
  logOperationEnd(24);

  return { headers, row };
}

// Shared function to make save API call
async function makeSaveApiCall(
  body: { tableName: string; csvData: string[]; hasHeaders: boolean; uniqueColumn: string },
  errorMessage: string,
  successLogMessage?: string
) {
  console.log('Save API: Request body', body);
  console.log('Save API: Endpoint URL', getSaveEndpoint());

  try {
    const response = await axios.post(getSaveEndpoint(), body);
    const responseData = response.data;
    
    console.log('Save API: Response', responseData);
    
    // Check if the response indicates an error even with 200 status
    if (responseData.status === 'Error') {
      throw new Error(responseData.message || errorMessage);
    }
    
    // Verify the response indicates success
    if (responseData.status === 'Ok' || responseData.status === 'Success') {
      if (successLogMessage) {
        console.log(successLogMessage);
      }
    }
    
    return responseData;
  } catch (error: any) {
    console.error('Save API: Error details', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: getSaveEndpoint()
    });
    throw error;
  }
}

// Save role (create or update)
export async function saveRole(form: RoleFormData, op: OperationType = 'n') {
  const { headers, row } = buildRoleCsv(form, op);
  
  const body = {
    tableName: 'role',
    csvData: [headers, row],
    hasHeaders: true,
    uniqueColumn: 'id', // Always use 'id' as uniqueColumn (like user save)
  };

  return makeSaveApiCall(body, 'Failed to save role', `✅ Database save successful for role: ${form.roleName}`);
}

// Function to save role status toggle (isenabled and status fields)
export async function saveRoleStatusToggle(
  roleId: number, 
  isEnabled: boolean
) {
  const status = isEnabled ? 'Active' : 'Inactive';
  
  // Build headers and row for role status update
  const headers = '_ops|id|isenabled|status|lastupdatedat';
  const timestamp = formatTimestamp();
  
  const row = `u|${roleId}|${isEnabled ? 'true' : 'false'}|'${status}'|${timestamp}`;
  
  logOperationStart('SAVE ROLE STATUS TOGGLE', {
    'Role ID': roleId,
    'New isEnabled': isEnabled,
    'New status': status
  });
  logCsvData(headers, row);
  console.log('Operation: u (update)');
  logOperationEnd(31);
  
  const body = {
    tableName: 'role',
    csvData: [headers, row],
    hasHeaders: true,
    uniqueColumn: 'id', // Use ID as unique column for updates
  };

  return makeSaveApiCall(
    body,
    'Failed to update role status',
    `✅ Database save successful for role: ${roleId}\n✅ Status updated to: ${status}\n✅ isEnabled updated to: ${isEnabled}`
  );
}

// Function to soft delete a role
export async function softDeleteRole(roleId: number) {
  // Build headers and row for role soft delete
  const headers = '_ops|id|softdelete|lastupdatedat';
  const timestamp = formatTimestamp();
  
  const row = `u|${roleId}|true|${timestamp}`;
  
  console.log('=== SOFT DELETE ROLE ===');
  console.log('Role ID:', roleId);
  console.log('CSV Headers:', headers);
  console.log('CSV Row:', row);
  console.log('Operation: u (update)');
  console.log('========================');
  
  const body = {
    tableName: 'role',
    csvData: [headers, row],
    hasHeaders: true,
    uniqueColumn: 'id', // Use ID as unique column for updates
  };

  return makeSaveApiCall(
    body,
    'Failed to delete role',
    `✅ Role soft deleted successfully: ${roleId}`
  );
}

// Function to update role lock status (islocked, lockedby, lockeddate)
export async function updateRoleLockStatus(
  roleId: number,
  isLocked: boolean
) {
  // Build headers and row for role lock status update
  const headers = '_ops|id|islocked|lockedby|lockeddate|lastupdatedat';
  const timestamp = formatTimestamp();
  // Use NULL for empty values instead of empty strings
  const lockedDate = isLocked ? timestamp : 'NULL';
  const lockedBy = isLocked ? quoteString('Admin') : 'NULL';
  
  const row = `u|${roleId}|${isLocked ? 'true' : 'false'}|${lockedBy}|${lockedDate}|${timestamp}`;
  
  console.log('=== UPDATE ROLE LOCK STATUS ===');
  console.log('Role ID:', roleId);
  console.log('Is Locked:', isLocked);
  console.log('Locked By:', lockedBy);
  console.log('Locked Date:', lockedDate);
  console.log('CSV Headers:', headers);
  console.log('CSV Row:', row);
  console.log('Operation: u (update)');
  console.log('==============================');
  
  const body = {
    tableName: 'role',
    csvData: [headers, row],
    hasHeaders: true,
    uniqueColumn: 'id',
  };

  return makeSaveApiCall(
    body,
    'Failed to update role lock status',
    `✅ Role lock status updated successfully: ${roleId}, isLocked: ${isLocked}`
  );
}

