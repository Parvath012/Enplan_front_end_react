import axios from 'axios';

export interface ModulePermissionsDto {
  id: number;
  module: string;
  submodules: Record<string, string[]>; // JSON object
  permission_names: Record<string, string[]>; // JSON object
}

export interface ModulePermissionsModel {
  id: number;
  module: string;
  submodules: Record<string, string[]>;
  permission_names: Record<string, string[]>;
}

const API_PATH = '/api/v1/data/Data/ExecuteSqlQueries';
const API_URL = `${process.env.REACT_APP_DATA_API_URL ?? ''}${API_PATH}`;

const modulePermissionsPayload = {
  executeInParallel: true,
  sqlQueries: [
    {
      name: 'module_permissions',
      query: {
        databaseId: '09d8e037-0005-4887-abde-112a529de2b8', // Use the same database ID as entity setup
        columns: [
          { dboName: 'module_permissions', columnName: 'id', dataType: 'SERIAL', aliasName: 'Id', output: true },
          { dboName: 'module_permissions', columnName: 'module', dataType: 'VARCHAR', aliasName: 'Module', output: true },
          { dboName: 'module_permissions', columnName: 'submodules', dataType: 'JSON', aliasName: 'Submodules', output: true },
          { dboName: 'module_permissions', columnName: 'permission_names', dataType: 'JSON', aliasName: 'PermissionNames', output: true }
        ],
        tables: ['module_permissions'],
        searchFilter: {
          conditionOperator: 0,
          filters: []
        },
        orderBy: [
          {
            columnName: "module",
            sortType: 1 // ASC
          }
        ],
        page: 0,
        pageSize: 100,
        caseStatements: []
      },
      includeRecordsCount: true
    }
  ]
};

function mapDtoToModel(dto: ModulePermissionsDto): ModulePermissionsModel {
  return {
    id: dto.id,
    module: dto.module,
    submodules: dto.submodules,
    permission_names: dto.permission_names,
  };
}

export async function fetchModulePermissionsFromApi(): Promise<ModulePermissionsModel[]> {
  try {
    const response = await axios.post(API_URL, modulePermissionsPayload);
    const root: any = response.data;

    // Handle new API shape: { status: 'Ok', data: [{ key: 'module_permissions', value: { csvData: [ ... ] } }] }
    const csvData: string[] | undefined = root?.data?.[0]?.value?.csvData;

    if (Array.isArray(csvData) && csvData.length > 1) {
      const dtos = parseCsvToDtos(csvData);
      const models = dtos.map(mapDtoToModel);
      return models;
    }

    // Fallback to older shapes if ever returned
    const records: ModulePermissionsDto[] =
      root?.sqlResults?.[0]?.records ||
      root?.results?.[0]?.records ||
      root?.records ||
      [];

    console.log('fetchModulePermissionsFromApi: fallback records:', records);
    return records.map(mapDtoToModel);
  } catch (error) {
    console.error('fetchModulePermissionsFromApi: API call failed:', error);
    throw error;
  }
}

function parseCsvToDtos(csvData: string[]): ModulePermissionsDto[] {
  const [headerLine, ...rows] = csvData;
  const headers = headerLine.split('|').map((h: string) => stripQuotes(h));

  const headerIndex = (name: string) => headers.findIndex((h) => h === name);

  const idx = {
    Id: headerIndex('Id'),
    Module: headerIndex('Module'),
    Submodules: headerIndex('Submodules'),
    PermissionNames: headerIndex('PermissionNames'),
  } as const;

  return rows
    .map((line) => line.split('|').map((v) => stripQuotes(v)))
    .map((cols) => {
      const get = (i: number) => (i >= 0 && i < cols.length ? cols[i] : undefined);
      
      const parseJsonArray = (v?: string): string[] => {
        if (!v) return [];
        const s = v.trim();
        if (s.startsWith('[') && s.endsWith(']')) {
          try { 
            return JSON.parse(s); 
          } catch { 
            console.warn('Failed to parse JSON array:', s);
            return [];
          }
        }
        return [];
      };

      const parseNestedJsonArray = (v?: string): string[][] => {
        if (!v) return [];
        const s = v.trim();
        if (s.startsWith('[') && s.endsWith(']')) {
          try { 
            return JSON.parse(s); 
          } catch { 
            console.warn('Failed to parse nested JSON array:', s);
            return [];
          }
        }
        return [];
      };

      const submodulesArray = parseJsonArray(get(idx.Submodules));
      const permissionsArray = parseNestedJsonArray(get(idx.PermissionNames));
      
      
      // Create submodules object from arrays
      const submodules: Record<string, string[]> = {};
      submodulesArray.forEach((submodule, index) => {
        if (permissionsArray[index]) {
          submodules[submodule] = permissionsArray[index];
        }
      });

      const dto: ModulePermissionsDto = {
        id: Number(get(idx.Id)) || 0,
        module: String(get(idx.Module) ?? ''),
        submodules: submodules,
        permission_names: {}, // Not used in current implementation
      };

      return dto;
    });
}

function stripQuotes(value: string): string {
  if (value == null) return value as unknown as string;
  let v = value.trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    v = v.substring(1, v.length - 1);
  }
  return v;
}

// Transform API data to the format expected by PermissionsTabLayout
export function transformModulePermissionsToLayoutFormat(apiData: ModulePermissionsModel[]): Record<string, { submodules: Record<string, string[]> }> {
  const result: Record<string, { submodules: Record<string, string[]> }> = {};
  
  apiData.forEach(item => {
    result[item.module] = {
      submodules: item.submodules || {}
    };
  });
  return result;
}
