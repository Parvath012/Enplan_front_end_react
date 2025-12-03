import { fetchHierarchyFromApi } from 'commonApp/hierarchyApiService';
import { 
  makeDataApiCall, 
  parseCsvToDtos, 
  createSqlQueryConfig, 
  createApiPayload
} from 'commonApp/apiServiceUtils';

export interface EntityDto {
  Id: string;
  LegalBusinessName: string;
  DisplayName: string;
  EntityType: string;
  AssignedEntity?: unknown;
  AddressLine1?: string;
  AddressLine2?: string;
  Country?: string;
  State?: string;
  City?: string;
  PinZipCode?: string;
  Logo?: string;
  SetAsDefault?: boolean;
  Countries?: unknown;
  Currencies?: unknown;
  Modules?: string; // JSON string of active modules
  ProgressPercentage?: string; // Progress percentage as varchar
  IsDeleted: boolean;
  entityLogo?: File; // For UI only
  SoftDeleted?: boolean;
  CreatedAt?: string;
  LastUpdatedAt?: string;
  IsConfigured: boolean;
  IsEnabled: boolean;
}

export interface EntityModel {
  id: string;
  legalBusinessName: string;
  displayName: string;
  entityType: string;
  assignedEntity?: unknown;
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  state?: string;
  city?: string;
  pinZipCode?: string;
  logo?: string;
  setAsDefault?: boolean;
  countries?: unknown;
  currencies?: unknown;
  modules?: string; // JSON string of active modules
  progressPercentage?: string; // Progress percentage as varchar
  softDeleted?: boolean;
  entityLogo?: File; // For UI only
  isDeleted: boolean;
  createdAt?: string;
  lastUpdatedAt?: string;
  isConfigured: boolean;
  isEnabled: boolean;
}

export interface EntityHierarchyModel {
  id: number;
  legalBusinessName: string;
  entityType: string;
  displayName: string;
  parent: EntityHierarchyModel[];  // Changed from children to parent
}

// Entity Setup specific column configuration
const entityColumns = [
  { dboName: 'entity', columnName: 'id', dataType: 'UUID', aliasName: 'Id', output: true },
  { dboName: 'entity', columnName: 'legalbusinessname', dataType: 'string', aliasName: 'LegalBusinessName', output: true },
  { dboName: 'entity', columnName: 'displayname', dataType: 'string', aliasName: 'DisplayName', output: true },
  { dboName: 'entity', columnName: 'entitytype', dataType: 'string', aliasName: 'EntityType', output: true },
  { dboName: 'entity', columnName: 'assignedentity', dataType: 'JSON', aliasName: 'AssignedEntity', output: true },
  { dboName: 'entity', columnName: 'addressline1', dataType: 'string', aliasName: 'AddressLine1', output: true },
  { dboName: 'entity', columnName: 'addressline2', dataType: 'string', aliasName: 'AddressLine2', output: true },
  { dboName: 'entity', columnName: 'country', dataType: 'string', aliasName: 'Country', output: true },
  { dboName: 'entity', columnName: 'state', dataType: 'string', aliasName: 'State', output: true },
  { dboName: 'entity', columnName: 'city', dataType: 'string', aliasName: 'City', output: true },
  { dboName: 'entity', columnName: 'pinzipcode', dataType: 'string', aliasName: 'PinZipCode', output: true },
  { dboName: 'entity', columnName: 'logo', dataType: 'string', aliasName: 'Logo', output: true },
  { dboName: 'entity', columnName: 'setasdefault', dataType: 'boolean', aliasName: 'SetAsDefault', output: true },
  { dboName: 'entity', columnName: 'countries', dataType: 'JSON', aliasName: 'Countries', output: true },
  { dboName: 'entity', columnName: 'currencies', dataType: 'JSON', aliasName: 'Currencies', output: true },
  { dboName: 'entity', columnName: 'modules', dataType: 'string', aliasName: 'Modules', output: true },
  { dboName: 'entity', columnName: 'progresspercentage', dataType: 'string', aliasName: 'ProgressPercentage', output: true },
  { dboName: 'entity', columnName: 'softdeleted', dataType: 'boolean', aliasName: 'SoftDeleted', output: true },
  { dboName: 'entity', columnName: 'isdeleted', dataType: 'boolean', aliasName: 'IsDeleted', output: true },
  { dboName: 'entity', columnName: 'createdat', dataType: 'timestamp', aliasName: 'CreatedAt', output: true },
  { dboName: 'entity', columnName: 'lastupdatedat', dataType: 'timestamp', aliasName: 'LastUpdatedAt', output: true },
  { dboName: 'entity', columnName: 'isconfigured', dataType: 'boolean', aliasName: 'IsConfigured', output: true },
  { dboName: 'entity', columnName: 'isenabled', dataType: 'boolean', aliasName: 'IsEnabled', output: true }
];

// Entity Setup specific search filter
const entitySearchFilter = {
  conditionOperator: 0,
  filters: [
    {
      propertyName: 'softdeleted',
      value: false
    }
  ]
};

// Entity Setup specific order by
const entityOrderBy = [
  {
    columnName: "legalbusinessname",
    sortType: 1
  }
];

function mapDtoToModel(dto: EntityDto): EntityModel {
  return {
    id: dto.Id,
    legalBusinessName: dto.LegalBusinessName,
    displayName: dto.DisplayName,
    entityType: dto.EntityType,
    assignedEntity: dto.AssignedEntity,
    addressLine1: dto.AddressLine1,
    addressLine2: dto.AddressLine2,
    country: dto.Country,
    state: dto.State,
    city: dto.City,
    pinZipCode: dto.PinZipCode,
    logo: dto.Logo,
    setAsDefault: dto.SetAsDefault,
    countries: dto.Countries,
    currencies: dto.Currencies,
    modules: dto.Modules,
    progressPercentage: dto.ProgressPercentage,
    softDeleted: dto.SoftDeleted,
    isDeleted: dto.IsDeleted,
    createdAt: dto.CreatedAt,
    lastUpdatedAt: dto.LastUpdatedAt,
    isConfigured: dto.IsConfigured,
    isEnabled: dto.IsEnabled,
  };
}

export async function fetchEntitiesFromApi(): Promise<EntityModel[]> {
  // Create SQL query configuration using common utility
  const queryConfig = createSqlQueryConfig(
    'entity',
    'entity',
    entityColumns,
    entitySearchFilter,
    entityOrderBy
  );

  // Create API payload using common utility
  const payload = createApiPayload([queryConfig]);

  // Make API call using common utility
  const csvData = await makeDataApiCall<string>(payload);

  if (Array.isArray(csvData) && csvData.length > 1) {
    // Parse CSV data using common utility
    const headerMapping = {
      Id: 'Id',
      LegalBusinessName: 'LegalBusinessName',
      DisplayName: 'DisplayName',
      EntityType: 'EntityType',
      AssignedEntity: 'AssignedEntity',
      AddressLine1: 'AddressLine1',
      AddressLine2: 'AddressLine2',
      Country: 'Country',
      State: 'State',
      City: 'City',
      PinZipCode: 'PinZipCode',
      Logo: 'Logo',
      SetAsDefault: 'SetAsDefault',
      Countries: 'Countries',
      Currencies: 'Currencies',
      Modules: 'Modules',
      ProgressPercentage: 'ProgressPercentage',
      SoftDeleted: 'SoftDeleted',
      IsDeleted: 'IsDeleted',
      CreatedAt: 'CreatedAt',
      LastUpdatedAt: 'LastUpdatedAt',
      IsConfigured: 'IsConfigured',
      IsEnabled: 'IsEnabled'
    };

    const dtos = parseCsvToDtos(csvData, headerMapping, (rowData) => ({
      Id: String(rowData.Id ?? ''),
      LegalBusinessName: String(rowData.LegalBusinessName ?? ''),
      DisplayName: String(rowData.DisplayName ?? ''),
      EntityType: String(rowData.EntityType ?? ''),
      AssignedEntity: rowData.AssignedEntity,
      AddressLine1: rowData.AddressLine1 ?? undefined,
      AddressLine2: rowData.AddressLine2 ?? undefined,
      Country: rowData.Country ?? undefined,
      State: rowData.State ?? undefined,
      City: rowData.City ?? undefined,
      PinZipCode: rowData.PinZipCode ?? undefined,
      Logo: rowData.Logo ?? undefined,
      SetAsDefault: rowData.SetAsDefault ?? false,
      Countries: rowData.Countries,
      Currencies: rowData.Currencies,
      Modules: rowData.Modules ?? undefined,
      ProgressPercentage: rowData.ProgressPercentage ?? undefined,
      SoftDeleted: rowData.SoftDeleted ?? false,
      IsDeleted: rowData.IsDeleted ?? false,
      CreatedAt: rowData.CreatedAt ?? undefined,
      LastUpdatedAt: rowData.LastUpdatedAt ?? undefined,
      IsConfigured: rowData.IsConfigured ?? false,
      IsEnabled: rowData.IsEnabled ?? false,
    } as EntityDto));

    console.log('fetchEntitiesFromApi: parsed DTOs:', dtos);
    const models = dtos.map(mapDtoToModel);
    console.log('fetchEntitiesFromApi: mapped models:', models);
    return models;
  }

  // Fallback: if csvData is not available, return empty array
  console.log('fetchEntitiesFromApi: No valid data returned');
  return [];
}

export async function fetchEntityHierarchyFromApi(): Promise<EntityHierarchyModel[]> {
  const API_BASE_URL = process.env.REACT_APP_ENTITY_HIERARCHY_API_URL ?? 'http://localhost:8888';
  const API_PATH = '/api/entity-hierarchy/all';
  
  return fetchHierarchyFromApi<EntityHierarchyModel>({
    baseUrl: API_BASE_URL,
    apiPath: API_PATH,
    timeout: 10000,
  });
}


