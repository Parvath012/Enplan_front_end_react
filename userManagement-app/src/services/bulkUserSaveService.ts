import axios from 'axios';
import { UserFormData, buildUserCsv, OperationType } from './userSaveService';
import { ParsedUserRow, convertToUserFormData } from '../utils/excelParserService';

const API_PATH = '/api/v1/data/Data/SaveData';

const getSaveEndpoint = (): string => {
  const baseUrl = process.env.REACT_APP_DATA_API_URL ?? 'https://172.16.20.116:50005';
  return `${baseUrl}${API_PATH}`;
};

/**
 * Validate user data before sending to API
 * All fields are mandatory except Self Reporting, Reporting Manager, and Dotted Line Manager
 * No format validations for firstname, lastname, email, and role
 */
function validateBulkUsers(userFormDataArray: UserFormData[], users: ParsedUserRow[]): Array<{ row: number; email: string; error: string }> {
  const errors: Array<{ row: number; email: string; error: string }> = [];
  
  userFormDataArray.forEach((userFormData, index) => {
    const user = users[index];
    const row = index + 2; // Excel row number (1-based header + 1-based index)
    
    // Validate required fields - no format validations
    if (!userFormData.firstname?.trim()) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'First Name is required' });
    }
    if (!userFormData.lastname?.trim()) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'Last Name is required' });
    }
    if (!userFormData.emailid?.trim()) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'Email ID is required' });
    }
    if (!userFormData.phonenumber?.trim()) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'Phone Number is required' });
    }
    if (!userFormData.role?.trim()) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'Role is required' });
    }
    if (!userFormData.department?.trim()) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'Department is required' });
    }
    if (!userFormData.regions || !Array.isArray(userFormData.regions) || userFormData.regions.length === 0) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'Regions is required' });
    }
    if (!userFormData.countries || !Array.isArray(userFormData.countries) || userFormData.countries.length === 0) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'Countries is required' });
    }
    if (!userFormData.divisions || !Array.isArray(userFormData.divisions) || userFormData.divisions.length === 0) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'Divisions is required' });
    }
    if (!userFormData.groups || !Array.isArray(userFormData.groups) || userFormData.groups.length === 0) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'Groups is required' });
    }
    if (!userFormData.departments || !Array.isArray(userFormData.departments) || userFormData.departments.length === 0) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'Permissions Departments is required' });
    }
    if (!userFormData.class || !Array.isArray(userFormData.class) || userFormData.class.length === 0) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'Classes is required' });
    }
    if (!userFormData.subClass || !Array.isArray(userFormData.subClass) || userFormData.subClass.length === 0) {
      errors.push({ row, email: user.emailId || 'N/A', error: 'SubClasses is required' });
    }
    // Self Reporting, Reporting Manager, and Dotted Line Manager are optional - no validation needed
  });
  
  return errors;
}

/**
 * Build CSV data for all users and collect headers
 */
function buildCsvDataForUsers(
  userFormDataArray: UserFormData[],
  users: ParsedUserRow[]
): { userCsvData: Array<{ headers: string; row: string }>; unifiedHeaders: string[] } {
  const userCsvData: Array<{ headers: string; row: string }> = [];
  const allHeadersSet = new Set<string>();
  let baseHeaders: string[] = [];
  
  // Build CSV for each user and collect all headers
  userFormDataArray.forEach((userFormData, index) => {
    try {
      const csv = buildUserCsv(userFormData, 'n' as OperationType);
      userCsvData.push(csv);
      
      // Collect all header columns
      const headerColumns = csv.headers.split('|');
      headerColumns.forEach(header => allHeadersSet.add(header));
      
      // Use first user's header order as base (to maintain consistent column order)
      if (index === 0) {
        baseHeaders = [...headerColumns];
      }
    } catch (error: any) {
      console.error(`Error building CSV for user ${index + 2} (${users[index].emailId}):`, error);
      throw new Error(`Failed to process user at row ${index + 2} (${users[index].emailId}): ${error.message}`);
    }
  });

  // Create unified header: start with base headers, then add any missing ones
  const unifiedHeaders = [...baseHeaders];
  allHeadersSet.forEach(header => {
    if (!unifiedHeaders.includes(header)) {
      unifiedHeaders.push(header);
    }
  });

  return { userCsvData, unifiedHeaders };
}

/**
 * Build aligned CSV rows using unified header
 */
function buildAlignedCsvRows(
  userCsvData: Array<{ headers: string; row: string }>,
  unifiedHeaders: string[]
): string[] {
  const csvRows: string[] = [];
  
  userCsvData.forEach((userCsv) => {
    const userHeaders = userCsv.headers.split('|');
    const userValues = userCsv.row.split('|');
    
    // Create a map of column name to value for this user
    const valueMap = new Map<string, string>();
    userHeaders.forEach((header, idx) => {
      valueMap.set(header, userValues[idx] || 'NULL');
    });
    
    // Build row using unified header order
    const alignedRow = unifiedHeaders.map(header => {
      const value = valueMap.get(header);
      return value ?? 'NULL';
    }).join('|');
    
    csvRows.push(alignedRow);
  });

  return csvRows;
}

/**
 * Handle API response and return appropriate result
 */
function handleApiResponse(
  response: any,
  users: ParsedUserRow[]
): { success: boolean; savedCount: number; errors: Array<{ row: number; email: string; error: string }> } {
  const responseData = response.data;
  console.log('Bulk save API response:', JSON.stringify(responseData, null, 2));

  // Check if the response indicates an error
  if (responseData.status === 'Error') {
    const errorMessage = responseData.message || responseData.error || 'Bulk save failed';
    console.error('Bulk save failed with status Error:', errorMessage);
    throw new Error(errorMessage);
  }

  // Check if response indicates success
  if (responseData.status === 'Ok' || responseData.status === 'Success') {
    console.log(`✅ Successfully saved ${users.length} users in bulk`);
    return {
      success: true,
      savedCount: users.length,
      errors: [],
    };
  }

  // If response format is unexpected but status code is 200, assume success
  if (response.status === 200) {
    console.warn('Unexpected response format but status 200, assuming success');
    return {
      success: true,
      savedCount: users.length,
      errors: [],
    };
  }

  // If we get here, something unexpected happened
  throw new Error(`Unexpected API response: ${JSON.stringify(responseData)}`);
}

/**
 * Extract error message from error object
 */
function extractErrorMessage(error: any): string {
  let errorMessage = 'Failed to save users in bulk';
  
  if (error?.response?.data) {
    const responseData = error.response.data;
    if (responseData.message) {
      errorMessage = responseData.message;
    } else if (responseData.error) {
      errorMessage = responseData.error;
    } else if (typeof responseData === 'string') {
      errorMessage = responseData;
    } else {
      errorMessage = `API Error: ${JSON.stringify(responseData)}`;
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }

  // For network errors or timeout
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    errorMessage = 'Request timeout. Please try with fewer users or check your network connection.';
  } else if (error?.response?.status === 400) {
    errorMessage = `Bad Request: ${errorMessage}`;
  } else if (error?.response?.status === 500) {
    errorMessage = `Server Error: ${errorMessage}. Please check the data format and try again.`;
  }

  return errorMessage;
}

/**
 * Save multiple users in bulk
 * Uses the same API as saveUser but sends all users in one request
 * Only uses bulk save - no fallback to individual saves
 */
export async function saveBulkUsers(users: ParsedUserRow[]): Promise<{
  success: boolean;
  savedCount: number;
  errors: Array<{ row: number; email: string; error: string }>;
}> {
  if (users.length === 0) {
    throw new Error('No users to save');
  }

  // Convert all parsed users to UserFormData
  const userFormDataArray = users.map(convertToUserFormData);

  // Validate all users before sending
  const validationErrors = validateBulkUsers(userFormDataArray, users);
  if (validationErrors.length > 0) {
    console.error('Validation errors found:', validationErrors);
    return {
      success: false,
      savedCount: 0,
      errors: validationErrors,
    };
  }

  // Build CSV data and unified headers
  const { userCsvData, unifiedHeaders } = buildCsvDataForUsers(userFormDataArray, users);
  const headers = unifiedHeaders.join('|');

  // Validate header
  if (!headers || headers.trim() === '') {
    throw new Error('Failed to generate CSV headers. Please check user data format.');
  }

  // Build aligned CSV rows
  const csvRows = buildAlignedCsvRows(userCsvData, unifiedHeaders);

  // Validate CSV structure
  if (csvRows.length !== users.length) {
    throw new Error(`CSV rows count (${csvRows.length}) doesn't match users count (${users.length})`);
  }

  // Combine headers and all rows
  const csvData = [headers, ...csvRows];

  const body = {
    tableName: 'user_management',
    csvData,
    hasHeaders: true,
    uniqueColumn: 'id',
  };

  try {
    console.log(`Attempting bulk save for ${users.length} users...`);
    console.log('Bulk save request body:', {
      tableName: body.tableName,
      hasHeaders: body.hasHeaders,
      uniqueColumn: body.uniqueColumn,
      rowCount: csvData.length,
      headerCount: 1,
      dataRowCount: csvRows.length,
    });
    
    const response = await axios.post(getSaveEndpoint(), body, {
      timeout: 60000, // 60 second timeout for bulk operations
    });
    
    return handleApiResponse(response, users);
    
  } catch (error: any) {
    console.error('Bulk save error:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
    });
    
    const errorMessage = extractErrorMessage(error);

    // Return error for all users since bulk save failed
    const errors = users.map((user, index) => ({
      row: index + 2,
      email: user.emailId,
      error: errorMessage,
    }));

    return {
      success: false,
      savedCount: 0,
      errors,
    };
  }
}

