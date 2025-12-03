import { 
  makeDataApiCall, 
  parseCsvToDtos, 
  createSqlQueryConfig, 
  createApiPayload
} from 'commonApp/apiServiceUtils';

export interface GroupDto {
  Id: string;
  Name: string;
  Description?: string;
  OwnerUserId: string;
  Members?: string; // JSON array
  CreatedAt: string;
  LastUpdatedAt: string;
  IsActive: boolean;
  SoftDelete?: boolean;
}

export interface GroupModel {
  id: string;
  name: string;
  description?: string;
  owner_user_id: string;
  members?: string; // JSON array
  createdat: string;
  lastupdatedat: string;
  isactive: boolean;
  softdelete?: boolean;
}

// Helper function to parse boolean values
const parseBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  const str = String(value ?? '').trim();
  return str === 'True' || str === 'true' || str === '1';
};

// Helper function to create group DTO mapper
const createGroupDtoMapper = () => (rowData: any): GroupDto => {
  return {
    Id: String(rowData.Id ?? ''),
    Name: String(rowData.Name ?? '').replace(/(^')|('$)/g, ''),
    Description: rowData.Description ? String(rowData.Description).replace(/(^')|('$)/g, '') : undefined,
    OwnerUserId: String(rowData.OwnerUserId ?? ''),
    Members: rowData.Members ? String(rowData.Members).replace(/(^')|('$)/g, '') : undefined,
    CreatedAt: String(rowData.CreatedAt ?? ''),
    LastUpdatedAt: String(rowData.LastUpdatedAt ?? rowData.CreatedAt ?? ''),
    IsActive: parseBoolean(rowData.IsActive),
    SoftDelete: parseBoolean(rowData.SoftDelete),
  } as GroupDto;
};

// Teams and Groups table column configuration
const groupColumns = [
  { dboName: 'teams_and_groups', columnName: 'id', dataType: 'SERIAL', aliasName: 'Id', output: true },
  { dboName: 'teams_and_groups', columnName: 'name', dataType: 'VARCHAR', aliasName: 'Name', output: true },
  { dboName: 'teams_and_groups', columnName: 'description', dataType: 'TEXT', aliasName: 'Description', output: true },
  { dboName: 'teams_and_groups', columnName: 'owner_user_id', dataType: 'INTEGER', aliasName: 'OwnerUserId', output: true },
  { dboName: 'teams_and_groups', columnName: 'members', dataType: 'JSON', aliasName: 'Members', output: true },
  { dboName: 'teams_and_groups', columnName: 'createdat', dataType: 'TIMESTAMP', aliasName: 'CreatedAt', output: true },
  { dboName: 'teams_and_groups', columnName: 'lastupdatedat', dataType: 'TIMESTAMP', aliasName: 'LastUpdatedAt', output: true },
  { dboName: 'teams_and_groups', columnName: 'isactive', dataType: 'BOOLEAN', aliasName: 'IsActive', output: true },
  { dboName: 'teams_and_groups', columnName: 'softdelete', dataType: 'BOOLEAN', aliasName: 'SoftDelete', output: true }
];

// Show only non-soft-deleted groups (softdelete = false or null)
const groupSearchFilter = {
  conditionOperator: 0,
  filters: [
    {
      propertyName: 'softdelete',
      value: false
    }
  ]
};

// Order by: Active groups first, then by name
const groupOrderBy = [
  {
    columnName: "isactive",
    sortType: 0  // 0 = DESC (Active (true) comes before Inactive (false))
  },
  {
    columnName: "name",
    sortType: 1  // 1 = ASC (Then by name A-Z)
  }
];

function mapDtoToModel(dto: GroupDto): GroupModel {
  return {
    id: dto.Id,
    name: dto.Name,
    description: dto.Description,
    owner_user_id: dto.OwnerUserId,
    members: dto.Members,
    createdat: dto.CreatedAt,
    lastupdatedat: dto.LastUpdatedAt,
    isactive: dto.IsActive,
    softdelete: dto.SoftDelete ?? false,
  };
}

export async function fetchGroupsFromApi(): Promise<GroupModel[]> {
  // Create SQL query configuration using common utility
  const queryConfig = createSqlQueryConfig(
    'teams_and_groups', // Schema name
    'teams_and_groups', // Table name
    groupColumns,
    groupSearchFilter,
    groupOrderBy
  );

  // Create API payload using common utility
  const payload = createApiPayload([queryConfig]);

  // Make API call using common utility
  const csvData = await makeDataApiCall<string>(payload);

  if (Array.isArray(csvData) && csvData.length > 1) {
    // Parse CSV data using common utility
    const headerMapping = {
      Id: 'Id',
      Name: 'Name',
      Description: 'Description',
      OwnerUserId: 'OwnerUserId',
      Members: 'Members',
      CreatedAt: 'CreatedAt',
      LastUpdatedAt: 'LastUpdatedAt',
      IsActive: 'IsActive',
      SoftDelete: 'SoftDelete'
    };

    const dtos = parseCsvToDtos(csvData, headerMapping, createGroupDtoMapper());

    console.log('fetchGroupsFromApi: parsed DTOs:', dtos);
    const models = dtos.map(mapDtoToModel);
    console.log('fetchGroupsFromApi: mapped models:', models);
    return models;
  }

  // Fallback: if csvData is not available, return empty array
  console.log('fetchGroupsFromApi: No valid data returned');
  return [];
}

// Function to fetch a single group by ID
export async function fetchGroupById(groupId: string): Promise<GroupModel | null> {
  // Create search filter for specific group ID
  const groupSearchFilter = {
    conditionOperator: 0,
    filters: [
      {
        propertyName: 'id',
        value: groupId
      }
    ]
  };

  // Create SQL query configuration using common utility
  const queryConfig = createSqlQueryConfig(
    'teams_and_groups', // Schema name
    'teams_and_groups', // Table name
    groupColumns,
    groupSearchFilter,
    [] // No ordering needed for single record
  );

  // Create API payload using common utility
  const payload = createApiPayload([queryConfig]);

  // Make API call using common utility
  const csvData = await makeDataApiCall<string>(payload);

  if (Array.isArray(csvData) && csvData.length > 1) {
    // Parse CSV data using common utility
    const headerMapping = {
      Id: 'Id',
      Name: 'Name',
      Description: 'Description',
      OwnerUserId: 'OwnerUserId',
      Members: 'Members',
      CreatedAt: 'CreatedAt',
      LastUpdatedAt: 'LastUpdatedAt',
      IsActive: 'IsActive',
      SoftDelete: 'SoftDelete'
    };

    const dtos = parseCsvToDtos(csvData, headerMapping, createGroupDtoMapper());

    if (dtos.length > 0) {
      const model = mapDtoToModel(dtos[0]);
      console.log('fetchGroupById: Found group:', model.id);
      return model;
    }
  }

  console.log('fetchGroupById: Group not found for ID:', groupId);
  return null;
}

