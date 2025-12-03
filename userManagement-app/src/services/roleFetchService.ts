// @ts-ignore - Module federation import
import { 
  makeDataApiCall, 
  parseCsvToDtos, 
  createSqlQueryConfig, 
  createApiPayload
} from 'commonApp/apiServiceUtils';

export interface RoleDto {
  Id: string;
  RoleName: string;
  Department?: string;
  RoleDescription?: string;
  Status: string;
  ParentAttribute?: unknown;
  Permissions?: unknown;
  CreatedAt: string;
  LastUpdatedAt?: string;
  IsEnabled: boolean;
  CreatedBy?: string;
  UpdatedBy?: string;
  SoftDelete: boolean;
  IsLocked: boolean;
  LockedBy?: string;
  LockedDate?: string;
}

export interface RoleModel {
  id: string;
  rolename: string;
  department?: string;
  roledescription?: string;
  status: string;
  parentattribute?: unknown;
  permissions?: unknown;
  createdat: string;
  lastupdatedat?: string;
  isenabled: boolean;
  createdby?: string;
  updatedby?: string;
  softdelete: boolean;
  islocked: boolean;
  lockedby?: string;
  lockeddate?: string;
}

// Role Management specific column configuration
const roleColumns = [
  { dboName: 'role', columnName: 'id', dataType: 'SERIAL', aliasName: 'Id', output: true },
  { dboName: 'role', columnName: 'rolename', dataType: 'VARCHAR', aliasName: 'RoleName', output: true },
  { dboName: 'role', columnName: 'department', dataType: 'VARCHAR', aliasName: 'Department', output: true },
  { dboName: 'role', columnName: 'roledescription', dataType: 'TEXT', aliasName: 'RoleDescription', output: true },
  { dboName: 'role', columnName: 'status', dataType: 'VARCHAR', aliasName: 'Status', output: true },
  { dboName: 'role', columnName: 'parentattribute', dataType: 'JSON', aliasName: 'ParentAttribute', output: true },
  { dboName: 'role', columnName: 'permissions', dataType: 'JSON', aliasName: 'Permissions', output: true },
  { dboName: 'role', columnName: 'createdat', dataType: 'TIMESTAMP', aliasName: 'CreatedAt', output: true },
  { dboName: 'role', columnName: 'lastupdatedat', dataType: 'TIMESTAMP', aliasName: 'LastUpdatedAt', output: true },
  { dboName: 'role', columnName: 'isenabled', dataType: 'BOOLEAN', aliasName: 'IsEnabled', output: true },
  { dboName: 'role', columnName: 'createdby', dataType: 'VARCHAR', aliasName: 'CreatedBy', output: true },
  { dboName: 'role', columnName: 'updatedby', dataType: 'VARCHAR', aliasName: 'UpdatedBy', output: true },
  { dboName: 'role', columnName: 'softdelete', dataType: 'BOOLEAN', aliasName: 'SoftDelete', output: true },
  { dboName: 'role', columnName: 'islocked', dataType: 'BOOLEAN', aliasName: 'IsLocked', output: true },
  { dboName: 'role', columnName: 'lockedby', dataType: 'VARCHAR', aliasName: 'LockedBy', output: true },
  { dboName: 'role', columnName: 'lockeddate', dataType: 'TIMESTAMP', aliasName: 'LockedDate', output: true }
];

// Role Management specific search filter - Exclude soft-deleted roles
const roleSearchFilter = {
  conditionOperator: 0,
  filters: [
    {
      propertyName: 'softdelete',
      value: false
    }
  ]
};

// Role Management specific order by - Active roles first, then by rolename
const roleOrderBy = [
  {
    columnName: "status",
    sortType: 1  // 1 = ASC (Active comes before Inactive alphabetically)
  },
  {
    columnName: "rolename",
    sortType: 1  // 1 = ASC (Then by rolename A-Z)
  }
];

function mapDtoToModel(dto: RoleDto): RoleModel {
  return {
    id: dto.Id,
    rolename: dto.RoleName,
    department: dto.Department,
    roledescription: dto.RoleDescription,
    status: dto.Status,
    parentattribute: dto.ParentAttribute,
    permissions: dto.Permissions,
    createdat: dto.CreatedAt,
    lastupdatedat: dto.LastUpdatedAt,
    isenabled: dto.IsEnabled,
    createdby: dto.CreatedBy,
    updatedby: dto.UpdatedBy,
    softdelete: dto.SoftDelete,
    islocked: dto.IsLocked,
    lockedby: dto.LockedBy,
    lockeddate: dto.LockedDate,
  };
}

export async function fetchRolesFromApi(): Promise<RoleModel[]> {
  try {
    // Create SQL query configuration using common utility
    const queryConfig = createSqlQueryConfig(
      'role',
      'role',
      roleColumns,
      roleSearchFilter,
      roleOrderBy
    );

    console.log('fetchRolesFromApi: Query config:', JSON.stringify(queryConfig, null, 2));

    // Create API payload using common utility
    const payload = createApiPayload([queryConfig]);

    console.log('fetchRolesFromApi: API payload:', JSON.stringify(payload, null, 2));

    // Make API call using common utility
    const csvData = await makeDataApiCall<string>(payload);

    console.log('fetchRolesFromApi: Raw CSV data:', csvData);
    console.log('fetchRolesFromApi: CSV data type:', typeof csvData);
    console.log('fetchRolesFromApi: Is array:', Array.isArray(csvData));
    console.log('fetchRolesFromApi: Array length:', Array.isArray(csvData) ? csvData.length : 'N/A');

    if (Array.isArray(csvData) && csvData.length > 1) {
    // Parse CSV data using common utility
    const headerMapping = {
      Id: 'Id',
      RoleName: 'RoleName',
      Department: 'Department',
      RoleDescription: 'RoleDescription',
      Status: 'Status',
      ParentAttribute: 'ParentAttribute',
      Permissions: 'Permissions',
      CreatedAt: 'CreatedAt',
      LastUpdatedAt: 'LastUpdatedAt',
      IsEnabled: 'IsEnabled',
      CreatedBy: 'CreatedBy',
      UpdatedBy: 'UpdatedBy',
      SoftDelete: 'SoftDelete',
      IsLocked: 'IsLocked',
      LockedBy: 'LockedBy',
      LockedDate: 'LockedDate'
    };

    const dtos = parseCsvToDtos(csvData, headerMapping, (rowData: any) => ({
      Id: String(rowData.Id ?? ''),
      RoleName: String(rowData.RoleName ?? ''),
      Department: rowData.Department ?? undefined,
      RoleDescription: rowData.RoleDescription ?? undefined,
      Status: String(rowData.Status ?? ''),
      ParentAttribute: rowData.ParentAttribute,
      Permissions: rowData.Permissions,
      CreatedAt: String(rowData.CreatedAt ?? ''),
      LastUpdatedAt: rowData.LastUpdatedAt ?? undefined,
      IsEnabled: rowData.IsEnabled ?? false,
      CreatedBy: rowData.CreatedBy ?? undefined,
      UpdatedBy: rowData.UpdatedBy ?? undefined,
      SoftDelete: rowData.SoftDelete ?? false,
      IsLocked: rowData.IsLocked ?? false,
      LockedBy: rowData.LockedBy ?? undefined,
      LockedDate: rowData.LockedDate ?? undefined,
    } as RoleDto));

      console.log('fetchRolesFromApi: parsed DTOs:', dtos);
      const models = dtos.map(mapDtoToModel);
      console.log('fetchRolesFromApi: mapped models:', models);
      console.log('fetchRolesFromApi: Total roles fetched:', models.length);
      return models;
    }

    // Fallback: if csvData is not available, return empty array
    console.warn('fetchRolesFromApi: No valid data returned. CSV data:', csvData);
    return [];
  } catch (error) {
    console.error('fetchRolesFromApi: Error fetching roles:', error);
    throw error;
  }
}

