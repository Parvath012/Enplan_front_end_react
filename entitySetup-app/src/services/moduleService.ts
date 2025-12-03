import axios from 'axios';
import { makeDataApiCall, parseCsvToDtos, createSqlQueryConfig, createApiPayload } from 'commonApp/apiServiceUtils';
import { sanitizeModuleName, sanitizeModuleDescription } from 'commonApp/stringUtils';

// Module DTO interface - matching the provided SQL query structure
export interface ModuleDto {
  ModuleId: number;
  ModuleName: string;
  ModuleDescription: string;
  ToggleSwitch: boolean;
}

// Module Model interface - adapted for UI needs
export interface ModuleModel {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  isConfigured: boolean;
  entityId?: string;
}

// Define columns for the module query
const moduleColumns = [
  { dboName: 'systemmodule', columnName: 'module_id', dataType: 'INTEGER', aliasName: 'ModuleId', output: true },
  { dboName: 'systemmodule', columnName: 'module_name', dataType: 'VARCHAR', aliasName: 'ModuleName', output: true },
  { dboName: 'systemmodule', columnName: 'module_description', dataType: 'TEXT', aliasName: 'ModuleDescription', output: true },
  { dboName: 'systemmodule', columnName: 'toggle_switch', dataType: 'BOOLEAN', aliasName: 'ToggleSwitch', output: true }
];

// Map DTO to Model - converting from database structure to UI model
function mapDtoToModel(dto: ModuleDto): ModuleModel {
  const model = {
    id: dto.ModuleId.toString(),
    name: sanitizeModuleName(dto.ModuleName),
    description: sanitizeModuleDescription(dto.ModuleDescription),
    isEnabled: dto.ToggleSwitch,
    isConfigured: false, // Default to false, will be set based on entity configuration
    entityId: undefined, // Will be set when modules are assigned to entities
  };
  return model;
}


// Fetch modules from API
export async function fetchModulesFromApi(): Promise<ModuleModel[]> {
  try {
    // Create SQL query configuration using common utility
    const queryConfig = createSqlQueryConfig(
      'systemmodule',
      'systemmodule',
      moduleColumns
    );

    // Create API payload using common utility
    const payload = createApiPayload([queryConfig]);

    // Make API call using common utility
    const csvData = await makeDataApiCall<string>(payload);

    if (Array.isArray(csvData) && csvData.length > 1) {
      // Define header mapping for CSV to DTO conversion
      const headerMapping = {
        ModuleId: 'ModuleId',
        ModuleName: 'ModuleName',
        ModuleDescription: 'ModuleDescription',
        ToggleSwitch: 'ToggleSwitch'
      };

      // Parse CSV data to DTOs using common utility
      const dtos = parseCsvToDtos(csvData, headerMapping, (rowData) => ({
        ModuleId: parseInt(String(rowData.ModuleId ?? '0'), 10),
        ModuleName: String(rowData.ModuleName ?? ''),
        ModuleDescription: String(rowData.ModuleDescription ?? ''),
        ToggleSwitch: String(rowData.ToggleSwitch ?? 'false').toLowerCase() === 'true'
      }));

      // Map DTOs to Models
      return dtos.map(mapDtoToModel);
    }

    return [];
  } catch (error: any) {
    console.error('fetchModulesFromApi: API call failed:', error);
    return [];
  }
}


// Save module configuration - using the same pattern as entitySaveService
export async function saveModuleConfiguration(moduleId: string, isEnabled: boolean, entityId?: string): Promise<any> {
  try {
    const headers = 'id,name,description,isEnabled,isConfigured,entityId,createdAt,updatedAt';
    const row = `${moduleId},Module ${moduleId},Module description,${isEnabled},true,${entityId ?? ''},${new Date().toISOString()},${new Date().toISOString()}`;
    
    const body = {
      tableName: 'modules',
      csvData: [headers, row],
      hasHeaders: true,
      uniqueColumn: 'id',
    };

    console.log('saveModuleConfiguration: Saving module payload:', {
      moduleId,
      isEnabled,
      entityId,
      headers,
      row
    });

    // Use the same save endpoint as other services
    const SAVE_ENDPOINT = `${process.env.REACT_APP_DATA_API_URL ?? ''}/api/save-data`;
    const response = await axios.post(SAVE_ENDPOINT, body);
    const responseData = response.data;
    
    // Check if the response indicates an error even with 200 status
    if (responseData.status === 'Error') {
      throw new Error(responseData.message || 'Failed to save module configuration');
    }
    
    return responseData;
  } catch (error: any) {
    console.error('saveModuleConfiguration: API call failed:', error);
    throw error;
  }
}

// Update multiple modules at once
export async function updateModulesConfiguration(modules: ModuleModel[], entityId?: string): Promise<any> {
  try {
    const headers = 'id,name,description,isEnabled,isConfigured,entityId,createdAt,updatedAt';
    const rows = modules.map(module => 
      `${module.id},${module.name},${module.description},${module.isEnabled},${module.isConfigured},${entityId ?? ''},${new Date().toISOString()},${new Date().toISOString()}`
    );
    
    const body = {
      tableName: 'modules',
      csvData: [headers, ...rows],
      hasHeaders: true,
      uniqueColumn: 'id',
    };

    console.log('updateModulesConfiguration: Updating modules payload:', {
      moduleCount: modules.length,
      entityId,
      headers,
      rows
    });

    // Use the same save endpoint as other services
    const SAVE_ENDPOINT = `${process.env.REACT_APP_DATA_API_URL ?? ''}/api/save-data`;
    const response = await axios.post(SAVE_ENDPOINT, body);
    const responseData = response.data;
    
    // Check if the response indicates an error even with 200 status
    if (responseData.status === 'Error') {
      throw new Error(responseData.message || 'Failed to update modules configuration');
    }
    
    return responseData;
  } catch (error: any) {
    console.error('updateModulesConfiguration: API call failed:', error);
    throw error;
  }
}
