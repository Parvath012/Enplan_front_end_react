import axios from 'axios';
import {
  quoteString,
  formatTimestamp,
  formatTimestampFromDate,
  quoteJSON,
  getQueryEndpoint
} from '../utils/saveServiceUtils';
import {
  createSaveApiBody,
  makeSaveApiCall,
  logSaveApiEnvironment,
  executeStatusToggleOperation,
  handleUserDeactivationInGroups,
  buildInitialCsvColumns
} from './serviceUtils';

export type OperationType = 'n' | 'u' | 'd'; // new, update, delete

export interface UserFormData {
  firstname: string;
  lastname: string;
  phonenumber?: string;
  role: string;
  department?: string;
  emailid: string;
  reportingmanager?: string;
  dottedorprojectmanager?: string;
  selfreporting?: boolean;
  regions?: any;
  countries?: any;
  divisions?: any;
  groups?: any;
  departments?: any; // Add departments field
  class?: any; // Add class field
  subClass?: any; // Add subClass field
  permissions?: any;
  status: string;
  isenabled: boolean;
  createdby?: string;
  lastupdatedby?: string;
  id?: string; // for updates/deletes
  createdat?: string;
  lastupdatedat?: string;
}

function addBooleanField(columns: Array<{ name: string; include: boolean; value: string }>, fieldName: string, value?: boolean, defaultValue: boolean = false) {
  const boolValue = value ?? defaultValue;
  columns.push({ name: fieldName, include: true, value: boolValue ? 'true' : 'false' });
}

// Helper function to add timestamp field
const addTimestampField = (columns: Array<{ name: string; include: boolean; value: string }>, fieldName: string, timestamp?: string) => {
  const value = timestamp ? formatTimestampFromDate(timestamp) : formatTimestamp();
  columns.push({ name: fieldName, include: true, value });
};

// Helper function to add required fields
const addRequiredFields = (columns: Array<{ name: string; include: boolean; value: string }>, form: UserFormData) => {
  columns.push({ name: 'firstname', include: true, value: quoteString(form.firstname) });
  columns.push({ name: 'lastname', include: true, value: quoteString(form.lastname) });
  columns.push({ name: 'role', include: true, value: quoteString(form.role) });
  columns.push({ name: 'emailid', include: true, value: quoteString(form.emailid) });
  columns.push({ name: 'status', include: true, value: quoteString(form.status) });
};

// Helper function to add optional string fields
const addOptionalStringFields = (columns: Array<{ name: string; include: boolean; value: string }>, form: UserFormData) => {
  const optionalFields = [
    { field: 'phonenumber', value: form.phonenumber },
    { field: 'department', value: form.department },
    { field: 'reportingmanager', value: form.reportingmanager },
    { field: 'dottedorprojectmanager', value: form.dottedorprojectmanager },
    { field: 'createdby', value: form.createdby },
    { field: 'lastupdatedby', value: form.lastupdatedby },
  ];

  optionalFields.forEach(({ field, value }) => {
    if (value) {
      columns.push({ name: field, include: true, value: quoteString(value) });
    } else if (value === null && field === 'dottedorprojectmanager') {
      // Explicitly handle null values for dottedorprojectmanager field
      columns.push({ name: field, include: true, value: 'NULL' });
    }
  });
};

// Helper function to add JSON fields
const addJsonFields = (columns: Array<{ name: string; include: boolean; value: string }>, form: UserFormData) => {
  const jsonFields = [
    { field: 'regions', value: form.regions },
    { field: 'countries', value: form.countries },
    { field: 'divisions', value: form.divisions },
    { field: 'groups', value: form.groups },
    { field: 'departments', value: form.departments },
    { field: 'class', value: form.class },
    { field: 'subClass', value: form.subClass },
    { field: 'permissions', value: form.permissions },
  ];

  jsonFields.forEach(({ field, value }) => {
    if (value) {
      columns.push({ name: field, include: true, value: quoteJSON(value) });
    }
  });
};

// Helper function to add timestamp fields based on operation
const addTimestampFields = (columns: Array<{ name: string; include: boolean; value: string }>, form: UserFormData, op: OperationType) => {
  if (op === 'n') {
    addTimestampField(columns, 'createdat', form.createdat);
  }
  if (op === 'u' || op === 'n') {
    addTimestampField(columns, 'lastupdatedat', form.lastupdatedat);
  }
};

export function buildUserCsv(form: UserFormData, op: OperationType = 'n'): { headers: string; row: string } {
  // Use shared helper to build initial columns (operation and ID)
  const columns = buildInitialCsvColumns(op, form.id);

  // Add all field types
  addRequiredFields(columns, form);
  addOptionalStringFields(columns, form);
  addBooleanField(columns, 'selfreporting', form.selfreporting, false);
  addBooleanField(columns, 'isenabled', form.isenabled, true);
  addJsonFields(columns, form);
  addTimestampFields(columns, form, op);

  const headers = columns.filter(c => c.include).map(c => c.name).join('|');
  const row = columns.filter(c => c.include).map(c => c.value).join('|');

  return { headers, row };
}

export async function saveUser(form: UserFormData, op: OperationType = 'n') {
  const { headers, row } = buildUserCsv(form, op);
  const body = createSaveApiBody(headers, row, 'user_management', 'id');
  return await makeSaveApiCall(body, 'Save User');
}


// Function to build CSV for partial user updates (permission fields only)
export function buildUserPartialUpdateCsv(form: UserFormData, op: OperationType = 'u'): { headers: string; row: string } {
  // Always include operation column
  const columns: Array<{ name: string; include: boolean; value: string }> = [
    { name: '_ops', include: true, value: op },
  ];

  // Include user ID for updates
  if (form.id) {
    columns.push({ name: 'id', include: true, value: form.id });
  }

  // Add timestamp field for lastUpdatedAt
  addTimestampField(columns, 'lastupdatedat', form.lastupdatedat);

  // Define permission fields to process
  const permissionFields = [
    { formField: 'regions', dbColumn: 'regions' },
    { formField: 'countries', dbColumn: 'countries' },
    { formField: 'divisions', dbColumn: 'divisions' },
    { formField: 'groups', dbColumn: 'groups' },
    { formField: 'departments', dbColumn: 'departments' },
    { formField: 'class', dbColumn: 'class' },
    { formField: 'subClass', dbColumn: 'subClass' },
    { formField: 'permissions', dbColumn: 'permissions' }
  ];

  // Process each permission field
  permissionFields.forEach(({ formField, dbColumn }) => {
    const fieldValue = form[formField as keyof UserFormData];
    if (fieldValue !== undefined) {
      const value = fieldValue ? quoteJSON(fieldValue) : 'NULL';
      columns.push({ name: dbColumn, include: true, value });
    }
  });

  // Build header and row from included columns
  const headers = columns.filter(c => c.include).map(c => c.name).join('|');
  const row = columns.filter(c => c.include).map(c => c.value).join('|');

  return { headers, row };
}

// Function to save user partial update (permission fields only)
export async function saveUserPartialUpdate(form: UserFormData, op: OperationType = 'u') {
  const { headers, row } = buildUserPartialUpdateCsv(form, op);
  
  const body = createSaveApiBody(headers, row, 'user_management', 'id');
  return await makeSaveApiCall(body, 'Save User Partial Update');
}

// Helper function to add transfer field to headers and row
const addTransferField = (headers: string, row: string, fieldName: string, value: string | null | undefined): { headers: string; row: string } => {
  if (value === undefined) {
    return { headers, row };
  }
  headers += `|${fieldName}`;
  row += value ? `|'${value}'` : '|NULL';
  return { headers, row };
};

// Function to save user status toggle (isenabled and status fields)
export async function saveUserStatusToggle(
  userId: number, 
  isEnabled: boolean, 
  transferedby?: string | null, 
  transferedto?: string | null,
  transfereddate?: string | null
) {
  const status = isEnabled ? 'Active' : 'Inactive';
  
  // Build headers and row based on whether transfer fields are provided
  let headers = '_ops|id|isenabled|status';
  let row = `u|${userId}|${isEnabled ? 'true' : 'false'}|'${status}'`;
  
  // Add transfer fields if provided
  const transferedbyResult = addTransferField(headers, row, 'transferedby', transferedby);
  headers = transferedbyResult.headers;
  row = transferedbyResult.row;
  
  const transferedtoResult = addTransferField(headers, row, 'transferedto', transferedto);
  headers = transferedtoResult.headers;
  row = transferedtoResult.row;
  
  const transfereddateResult = addTransferField(headers, row, 'transfereddate', transfereddate);
  headers = transfereddateResult.headers;
  row = transfereddateResult.row;
  
  logSaveApiEnvironment();
  const responseData = await executeStatusToggleOperation({
    operationName: 'SAVE API CALLED',
    headers,
    row,
    tableName: 'user_management',
    entityType: 'user',
    identifier: userId,
    additionalLogData: {
      'User ID': userId,
      'New isEnabled': isEnabled,
      'New status': status,
      'TransferedBy': transferedby,
      'TransferedTo': transferedto,
      'TransferedDate': transfereddate,
      'Operation': 'u (update)'
    },
    separatorLength: 24,
    uniqueColumn: 'id'
  });
  
  // Log additional success info
  console.log(`✅ Status updated to: ${status}`);
  console.log(`✅ isEnabled updated to: ${isEnabled}`);
  
  // If user is being deactivated, also deactivate them in all groups
  if (!isEnabled) {
    await handleUserDeactivationInGroups(userId);
  }
  
  return responseData;
}

// Function to check if email already exists in the database
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const queryPayload = {
      executeInParallel: true,
      sqlQueries: [
        {
          name: "user",
          query: {
            databaseId: process.env.REACT_APP_DATABASE_ID ?? "09d8e037-0005-4887-abde-112a529de2b8",
            columns: [
              {
                dboName: "user_management",
                columnName: "emailid",
                dataType: "VARCHAR",
                aliasName: "EmailId",
                output: true
              }
            ],
            tables: ["user_management"],
            searchFilter: {
              conditionOperator: 0,
              filters: [
                {
                  propertyName: "emailid",
                  value: email
                }
              ]
            },
            page: 0,
            pageSize: 1,
            caseStatements: []
          },
          includeRecordsCount: true
        }
      ]
    };

    const response = await axios.post(getQueryEndpoint(), queryPayload);
    const responseData = response.data;

    if (responseData.status === 'Ok' && responseData.data && responseData.data.length > 0) {
      const queryResult = responseData.data[0];
      
      if (queryResult.value?.csvData?.length > 1) {
        // If we have data rows (more than just headers), email exists
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('checkEmailExists - Error:', error);
    // On error, assume email doesn't exist to avoid blocking valid operations
    // The database constraint will catch duplicates anyway
    return false;
  }
}

// Function to fetch the latest created user by email
export async function fetchLatestUserByEmail(email: string): Promise<{ id: string } | null> {
  try {
    const queryPayload = {
      executeInParallel: true,
      sqlQueries: [
        {
          name: "user",
          query: {
            databaseId: process.env.REACT_APP_DATABASE_ID ?? "09d8e037-0005-4887-abde-112a529de2b8",
            columns: [
              {
                dboName: "user_management",
                columnName: "id",
                dataType: "SERIAL",
                aliasName: "Id",
                output: true
              },
              {
                dboName: "user_management",
                columnName: "emailid",
                dataType: "VARCHAR",
                aliasName: "EmailId",
                output: true
              },
              {
                dboName: "user_management",
                columnName: "createdat",
                dataType: "TIMESTAMP",
                aliasName: "CreatedAt",
                output: true
              }
            ],
            tables: ["user_management"],
            searchFilter: {
              conditionOperator: 0,
              filters: [
                {
                  propertyName: "emailid",
                  value: email
                }
              ]
            },
            orderBy: [
              {
                columnName: "createdat",
                sortType: 1 // Descending order to get latest first
              }
            ],
            page: 0,
            pageSize: 1,
            caseStatements: []
          },
          includeRecordsCount: true
        }
      ]
    };

    console.log('fetchLatestUserByEmail - Query payload:', JSON.stringify(queryPayload, null, 2));

    const response = await axios.post(getQueryEndpoint(), queryPayload);
    const responseData = response.data;

    console.log('fetchLatestUserByEmail - API response:', JSON.stringify(responseData, null, 2));

    if (responseData.status === 'Ok' && responseData.data && responseData.data.length > 0) {
      const queryResult = responseData.data[0];
      console.log('fetchLatestUserByEmail - Query result:', queryResult);
      
      if (queryResult.value?.csvData?.length > 1) {
        // Parse CSV data: ["Id|EmailId|CreatedAt", "83|'D@gmail.com'|10/7/2025 9:59:57 PM"]
        const csvData = queryResult.value.csvData;
        const headers = csvData[0]?.split('|') || []; // ["Id", "EmailId", "CreatedAt"]
        const rowData = csvData[1]?.split('|') || []; // ["83", "'D@gmail.com'", "10/7/2025 9:59:57 PM"]
        
        // Find the index of the Id column with safety check
        const idIndex = Array.isArray(headers) ? headers.findIndex(header => header === 'Id') : -1;
        
        if (idIndex !== -1 && rowData?.[idIndex]) {
          const userId = rowData[idIndex]; // "83"
          console.log('fetchLatestUserByEmail - Extracted user ID:', userId);
          return { id: userId };
        }
      }
    }

    console.log('fetchLatestUserByEmail - No user found for email:', email);
    return null;
  } catch (error) {
    console.error('fetchLatestUserByEmail - Error:', error);
    throw new Error(`Failed to fetch user by email: ${error}`);
  }
}
