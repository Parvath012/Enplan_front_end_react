import { 
  makeDataApiCall, 
  parseCsvToDtos, 
  createSqlQueryConfig, 
  createApiPayload
} from 'commonApp/apiServiceUtils';

export interface UserDto {
  Id: string;
  FirstName: string;
  LastName: string;
  PhoneNumber?: string;
  Role: string;
  Department?: string;
  EmailId: string;
  ReportingManager?: string;
  DottedORProjectManager?: string;
  SelfReporting: boolean;
  Regions?: unknown;
  Country?: unknown;
  Divisions?: unknown;
  Groups?: unknown;
  Departments?: unknown;
  Class?: unknown;
  SubClass?: unknown;
  Permissions?: unknown;
  CreatedAt: string;
  LastUpdatedAt?: string;
  Status: string;
  IsEnabled: boolean;
  CreatedBy?: string;
  LastUpdatedBy?: string;
  TransferedBy?: string;
  TransferedTo?: string;
  TransferedDate?: string;
}

export interface UserModel {
  id: string;
  firstname: string;
  lastname: string;
  phonenumber?: string;
  role: string;
  department?: string;
  emailid: string;
  reportingmanager?: string;
  dottedorprojectmanager?: string;
  selfreporting: boolean;
  regions?: unknown;
  countries?: unknown;
  divisions?: unknown;
  groups?: unknown;
  departments?: unknown;
  class?: unknown;
  subClass?: unknown;
  permissions?: unknown;
  createdat: string;
  lastupdatedat?: string;
  status: string;
  isenabled: boolean;
  createdby?: string;
  lastupdatedby?: string;
  transferedby?: string;
  transferedto?: string;
  transfereddate?: string;
}

// User Management specific column configuration
const userColumns = [
  { dboName: 'user_management', columnName: 'id', dataType: 'SERIAL', aliasName: 'Id', output: true },
  { dboName: 'user_management', columnName: 'firstname', dataType: 'string', aliasName: 'FirstName', output: true },
  { dboName: 'user_management', columnName: 'lastname', dataType: 'string', aliasName: 'LastName', output: true },
  { dboName: 'user_management', columnName: 'phonenumber', dataType: 'string', aliasName: 'PhoneNumber', output: true },
  { dboName: 'user_management', columnName: 'role', dataType: 'string', aliasName: 'Role', output: true },
  { dboName: 'user_management', columnName: 'department', dataType: 'string', aliasName: 'Department', output: true },
  { dboName: 'user_management', columnName: 'emailid', dataType: 'string', aliasName: 'EmailId', output: true },
  { dboName: 'user_management', columnName: 'reportingmanager', dataType: 'string', aliasName: 'ReportingManager', output: true },
  { dboName: 'user_management', columnName: 'dottedorprojectmanager', dataType: 'string', aliasName: 'DottedORProjectManager', output: true },
  { dboName: 'user_management', columnName: 'selfreporting', dataType: 'boolean', aliasName: 'SelfReporting', output: true },
  { dboName: 'user_management', columnName: 'regions', dataType: 'JSON', aliasName: 'Regions', output: true },
  { dboName: 'user_management', columnName: 'countries', dataType: 'JSON', aliasName: 'Country', output: true },
  { dboName: 'user_management', columnName: 'divisions', dataType: 'JSON', aliasName: 'Divisions', output: true },
  { dboName: 'user_management', columnName: 'groups', dataType: 'JSON', aliasName: 'Groups', output: true },
  { dboName: 'user_management', columnName: 'departments', dataType: 'JSON', aliasName: 'Departments', output: true },
  { dboName: 'user_management', columnName: 'class', dataType: 'JSON', aliasName: 'Class', output: true },
  { dboName: 'user_management', columnName: 'subClass', dataType: 'JSON', aliasName: 'SubClass', output: true },
  { dboName: 'user_management', columnName: 'permissions', dataType: 'JSON', aliasName: 'Permissions', output: true },
  { dboName: 'user_management', columnName: 'createdat', dataType: 'timestamp', aliasName: 'CreatedAt', output: true },
  { dboName: 'user_management', columnName: 'lastupdatedat', dataType: 'timestamp', aliasName: 'LastUpdatedAt', output: true },
  { dboName: 'user_management', columnName: 'status', dataType: 'string', aliasName: 'Status', output: true },
  { dboName: 'user_management', columnName: 'isenabled', dataType: 'boolean', aliasName: 'IsEnabled', output: true },
  { dboName: 'user_management', columnName: 'createdby', dataType: 'string', aliasName: 'CreatedBy', output: true },
  { dboName: 'user_management', columnName: 'lastupdatedby', dataType: 'string', aliasName: 'LastUpdatedBy', output: true },
  { dboName: 'user_management', columnName: 'transferedby', dataType: 'string', aliasName: 'TransferedBy', output: true },
  { dboName: 'user_management', columnName: 'transferedto', dataType: 'string', aliasName: 'TransferedTo', output: true },
  { dboName: 'user_management', columnName: 'transfereddate', dataType: 'timestamp', aliasName: 'TransferedDate', output: true }
];

// User Management specific search filter - Show all users (active and inactive)
const userSearchFilter = {
  conditionOperator: 0,
  filters: [] // Empty filters to show all users
};

// User Management specific order by - Active users first, then by firstname
const userOrderBy = [
  {
    columnName: "status",
    sortType: 1  // 1 = ASC (Active comes before Inactive alphabetically)
  },
  {
    columnName: "firstname",
    sortType: 1  // 1 = ASC (Then by firstname A-Z)
  }
];

function mapDtoToModel(dto: UserDto): UserModel {
  return {
    id: dto.Id,
    firstname: dto.FirstName,
    lastname: dto.LastName,
    phonenumber: dto.PhoneNumber,
    role: dto.Role,
    department: dto.Department,
    emailid: dto.EmailId,
    reportingmanager: dto.ReportingManager,
    dottedorprojectmanager: dto.DottedORProjectManager,
    selfreporting: dto.SelfReporting,
    regions: dto.Regions,
    countries: dto.Country,
    divisions: dto.Divisions,
    groups: dto.Groups,
    departments: dto.Departments,
    class: dto.Class,
    subClass: dto.SubClass,
    permissions: dto.Permissions,
    createdat: dto.CreatedAt,
    lastupdatedat: dto.LastUpdatedAt,
    status: dto.Status,
    isenabled: dto.IsEnabled,
    createdby: dto.CreatedBy,
    lastupdatedby: dto.LastUpdatedBy,
    transferedby: dto.TransferedBy,
    transferedto: dto.TransferedTo,
    transfereddate: dto.TransferedDate,
  };
}

export async function fetchUsersFromApi(): Promise<UserModel[]> {
  // Create SQL query configuration using common utility
  const queryConfig = createSqlQueryConfig(
    'user_management',
    'user_management',
    userColumns,
    userSearchFilter,
    userOrderBy
  );

  // Create API payload using common utility
  const payload = createApiPayload([queryConfig]);

  // Make API call using common utility
  const csvData = await makeDataApiCall<string>(payload);

  if (Array.isArray(csvData) && csvData.length > 1) {
    // Parse CSV data using common utility
    const headerMapping = {
      Id: 'Id',
      FirstName: 'FirstName',
      LastName: 'LastName',
      PhoneNumber: 'PhoneNumber',
      Role: 'Role',
      Department: 'Department',
      EmailId: 'EmailId',
      ReportingManager: 'ReportingManager',
      DottedORProjectManager: 'DottedORProjectManager',
      SelfReporting: 'SelfReporting',
      Regions: 'Regions',
      Country: 'Country',
      Divisions: 'Divisions',
      Groups: 'Groups',
      Departments: 'Departments',
      Class: 'Class',
      SubClass: 'SubClass',
      Permissions: 'Permissions',
      CreatedAt: 'CreatedAt',
      LastUpdatedAt: 'LastUpdatedAt',
      Status: 'Status',
      IsEnabled: 'IsEnabled',
      CreatedBy: 'CreatedBy',
      LastUpdatedBy: 'LastUpdatedBy',
      TransferedBy: 'TransferedBy',
      TransferedTo: 'TransferedTo',
      TransferedDate: 'TransferedDate'
    };

    const dtos = parseCsvToDtos(csvData, headerMapping, (rowData: any) => ({
      Id: String(rowData.Id ?? ''),
      FirstName: String(rowData.FirstName ?? ''),
      LastName: String(rowData.LastName ?? ''),
      PhoneNumber: rowData.PhoneNumber ?? undefined,
      Role: String(rowData.Role ?? ''),
      Department: rowData.Department ?? undefined,
      EmailId: String(rowData.EmailId ?? ''),
      ReportingManager: rowData.ReportingManager ?? undefined,
      DottedORProjectManager: rowData.DottedORProjectManager ?? undefined,
      SelfReporting: rowData.SelfReporting ?? false,
      Regions: rowData.Regions,
      Country: rowData.Country,
      Divisions: rowData.Divisions,
      Groups: rowData.Groups,
      Departments: rowData.Departments,
      Class: rowData.Class,
      SubClass: rowData.SubClass,
      Permissions: rowData.Permissions,
      CreatedAt: String(rowData.CreatedAt ?? ''),
      LastUpdatedAt: rowData.LastUpdatedAt ?? undefined,
      Status: String(rowData.Status ?? ''),
      IsEnabled: rowData.IsEnabled ?? false,
      CreatedBy: rowData.CreatedBy ?? undefined,
      LastUpdatedBy: rowData.LastUpdatedBy ?? undefined,
      TransferedBy: rowData.TransferedBy ?? undefined,
      TransferedTo: rowData.TransferedTo ?? undefined,
      TransferedDate: rowData.TransferedDate ?? undefined,
    } as UserDto));

    console.log('fetchUsersFromApi: parsed DTOs:', dtos);
    const models = dtos.map(mapDtoToModel);
    console.log('fetchUsersFromApi: mapped models:', models);
    return models;
  }

  // Fallback: if csvData is not available, return empty array
  console.log('fetchUsersFromApi: No valid data returned');
  return [];
}

