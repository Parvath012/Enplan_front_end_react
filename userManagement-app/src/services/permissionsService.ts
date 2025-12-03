import { makeDataApiCall, parseCsvToDtos, createSqlQueryConfig, createApiPayload } from 'commonApp/apiServiceUtils';

// Module Permissions DTO interface - matching the table schema
export interface ModulePermissionsDto {
  Id: number;
  Module: string;
  Submodules: string; // JSON string
  PermissionNames: string; // JSON string
}

// Module Permissions Model interface - adapted for UI needs
export interface ModulePermissionsModel {
  id: string;
  module: string;
  submodules: string[];
  permissionNames: string[];
}

// Define columns for the module permissions query
const modulePermissionsColumns = [
  { dboName: 'module_permissions', columnName: 'id', dataType: 'SERIAL', aliasName: 'Id', output: true },
  { dboName: 'module_permissions', columnName: 'module', dataType: 'VARCHAR', aliasName: 'Module', output: true },
  { dboName: 'module_permissions', columnName: 'submodules', dataType: 'JSON', aliasName: 'Submodules', output: true },
  { dboName: 'module_permissions', columnName: 'permission_names', dataType: 'JSON', aliasName: 'PermissionNames', output: true }
];

// Helper function to safely parse JSON strings - extracted to eliminate duplication
function safeJsonParse<T>(jsonString: string, fallback: T, fieldName: string): T {
  try {
    if (jsonString) {
      const parsed = JSON.parse(jsonString);
      return (Array.isArray(parsed) ? parsed : fallback) as T;
    }
  } catch (error) {
    console.warn(`Failed to parse ${fieldName} JSON:`, jsonString);
  }
  return fallback;
}


// Map DTO to Model - converting from database structure to UI model
function mapDtoToModel(dto: ModulePermissionsDto): ModulePermissionsModel {
  // Parse JSON strings to arrays using helper function
  const submodules = safeJsonParse(dto.Submodules, [], 'submodules');
  const permissionNames = safeJsonParse(dto.PermissionNames, [], 'permission names');

  return {
    id: dto.Id.toString(),
    module: dto.Module || '',
    submodules,
    permissionNames
  };
}


// Fetch module permissions from API using common utilities
export async function fetchModulePermissionsFromApi(): Promise<ModulePermissionsModel[]> {
  try {
    // Create SQL query configuration using common utility
    const queryConfig = createSqlQueryConfig(
      'module_permissions',
      'module_permissions',
      modulePermissionsColumns
    );

    // Create API payload using common utility
    const payload = createApiPayload([queryConfig]);

    // Make API call using common utility
    const csvData = await makeDataApiCall<string>(payload);

    if (Array.isArray(csvData) && csvData.length > 1) {
      // Define header mapping for CSV to DTO conversion
      const headerMapping = {
        Id: 'Id',
        Module: 'Module',
        Submodules: 'Submodules',
        PermissionNames: 'PermissionNames'
      };

      // Parse CSV data to DTOs using common utility
      const dtos = parseCsvToDtos(csvData, headerMapping, (rowData) => ({
        Id: parseInt(String(rowData.Id ?? '0'), 10),
        Module: String(rowData.Module ?? ''),
        Submodules: String(rowData.Submodules ?? '[]'),
        PermissionNames: String(rowData.PermissionNames ?? '[]')
      }));

      // Map DTOs to Models
      return dtos.map(mapDtoToModel);
    }

    return [];
  } catch (error: any) {
    console.error('fetchModulePermissionsFromApi: API call failed:', error);
    return [];
  }
}

// Transform permissions data for table display
export function transformPermissionsForTable(permissions: ModulePermissionsModel[]): Array<{
  modules: string;
  subModule: string;
  permissions: string;
  originalData: ModulePermissionsModel;
}> {
  const tableData: Array<{
    modules: string;
    subModule: string;
    permissions: string;
    originalData: ModulePermissionsModel;
  }> = [];

  permissions.forEach(permission => {
    // If no submodules, create a single row with the module name
    if (permission.submodules.length === 0) {
      tableData.push({
        modules: permission.module,
        subModule: permission.module,
        permissions: permission.permissionNames.join(', '),
        originalData: permission
      });
    } else {
      // Create a row for each submodule
      permission.submodules.forEach(submodule => {
        tableData.push({
          modules: permission.module,
          subModule: submodule,
          permissions: permission.permissionNames.join(', '),
          originalData: permission
        });
      });
    }
  });

  return tableData;
}
