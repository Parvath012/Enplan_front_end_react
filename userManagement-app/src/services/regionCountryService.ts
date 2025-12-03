import { makeDataApiCall, parseCsvToDtos, createSqlQueryConfig, createApiPayload } from 'commonApp/apiServiceUtils';

// Define columns for the region_country query
const regionCountryColumns = [
  { dboName: 'region_country', columnName: 'id', dataType: 'SERIAL', aliasName: 'Id', output: true },
  { dboName: 'region_country', columnName: 'regions', dataType: 'JSON', aliasName: 'regions', output: true },
  { dboName: 'region_country', columnName: 'countries', dataType: 'JSON', aliasName: 'countries', output: true },
  { dboName: 'region_country', columnName: 'divisions', dataType: 'JSON', aliasName: 'divisions', output: true },
  { dboName: 'region_country', columnName: 'groups', dataType: 'JSON', aliasName: 'groups', output: true },
  { dboName: 'region_country', columnName: 'departments', dataType: 'JSON', aliasName: 'departments', output: true },
  { dboName: 'region_country', columnName: 'class', dataType: 'JSON', aliasName: 'class', output: true },
  { dboName: 'region_country', columnName: 'subClass', dataType: 'JSON', aliasName: 'subClass', output: true }
];

// API payload for region_country table - using the shared column definitions
export const regionCountryPayload = {
  executeInParallel: true,
  sqlQueries: [
    {
      name: "region_country",
      query: {
        databaseId: "09d8e037-0005-4887-abde-112a529de2b8",
        columns: regionCountryColumns,
        tables: ["region_country"],
        searchFilter: {
          conditionOperator: 0,
          filters: []
        },
        orderBy: [
          {
            columnName: "id",
            sortType: 1
          }
        ],
        page: 0,
        pageSize: 1000,
        caseStatements: []
      },
      includeRecordsCount: true
    }
  ]
};

// DTO interface for API response
export interface RegionCountryDto {
  Id: number;
  regions: string;
  countries: string;
  divisions: string;
  groups: string;
  departments: string;
  class: string;
  subClass: string;
}

// Model interface for transformed data
export interface RegionCountryModel {
  id: number;
  regions: string[];
  countries: string[];
  divisions: string[];
  groups: string[];
  departments: string[];
  class: string[];
  subClass: string[];
}

// Dropdown options interface
export interface RegionCountryDropdownOptions {
  regions: string[];
  countries: string[];
  divisions: string[];
  groups: string[];
  departments: string[];
  classes: string[];
  subClasses: string[];
}

// Parse JSON string to array
function parseJsonArray(jsonString: string): string[] {
  try {
    if (!jsonString || jsonString.trim() === '') {
      return [];
    }
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse JSON array:', jsonString, error);
    return [];
  }
}

// Map DTO to Model
function mapDtoToModel(dto: RegionCountryDto): RegionCountryModel {
  return {
    id: dto.Id,
    regions: parseJsonArray(dto.regions),
    countries: parseJsonArray(dto.countries),
    divisions: parseJsonArray(dto.divisions),
    groups: parseJsonArray(dto.groups),
    departments: parseJsonArray(dto.departments),
    class: parseJsonArray(dto.class),
    subClass: parseJsonArray(dto.subClass)
  };
}

// Helper function to extract unique values from array - extracted to eliminate duplication
function extractUniqueValues(sourceArray: string[], targetArray: string[]): void {
  sourceArray.forEach(item => {
    if (item && !targetArray.includes(item)) {
      targetArray.push(item);
    }
  });
}

// Transform data to dropdown options
export function transformRegionCountryToDropdownOptions(data: RegionCountryModel[]): RegionCountryDropdownOptions {
  const options: RegionCountryDropdownOptions = {
    regions: [],
    countries: [],
    divisions: [],
    groups: [],
    departments: [],
    classes: [],
    subClasses: []
  };

  // Extract unique values from each category using helper function
  data.forEach(item => {
    extractUniqueValues(item.regions, options.regions);
    extractUniqueValues(item.countries, options.countries);
    extractUniqueValues(item.divisions, options.divisions);
    extractUniqueValues(item.groups, options.groups);
    extractUniqueValues(item.departments, options.departments);
    extractUniqueValues(item.class, options.classes);
    extractUniqueValues(item.subClass, options.subClasses);
  });

  // Sort all arrays using localeCompare for reliable alphabetical sorting
  Object.keys(options).forEach(key => {
    options[key as keyof RegionCountryDropdownOptions].sort((a, b) => a.localeCompare(b));
  });

  return options;
}

// Fetch data from API
export async function fetchRegionCountryFromApi(): Promise<RegionCountryModel[]> {
  try {
    // Create SQL query configuration using common utility
    const queryConfig = createSqlQueryConfig(
      'region_country',
      'region_country',
      regionCountryColumns
    );

    // Create API payload using common utility
    const payload = createApiPayload([queryConfig]);

    // Make API call using common utility
    const csvData = await makeDataApiCall<string>(payload);

    if (Array.isArray(csvData) && csvData.length > 1) {
      // Define header mapping for CSV to DTO conversion
      const headerMapping = {
        Id: 'Id',
        regions: 'regions',
        countries: 'countries',
        divisions: 'divisions',
        groups: 'groups',
        departments: 'departments',
        class: 'class',
        subClass: 'subClass'
      };

      // Parse CSV data to DTOs using common utility
      const dtos = parseCsvToDtos(csvData, headerMapping, (rowData) => ({
        Id: parseInt(String(rowData.Id ?? '0'), 10),
        regions: String(rowData.regions ?? '[]'),
        countries: String(rowData.countries ?? '[]'),
        divisions: String(rowData.divisions ?? '[]'),
        groups: String(rowData.groups ?? '[]'),
        departments: String(rowData.departments ?? '[]'),
        class: String(rowData.class ?? '[]'),
        subClass: String(rowData.subClass ?? '[]')
      }));

      // Map DTOs to Models
      return dtos.map(mapDtoToModel);
    }

    throw new Error('No data available from API - The region_country table may not exist or may be empty. Please check the database.');
  } catch (error) {
    console.error('fetchRegionCountryFromApi: API call failed:', error);
    throw error;
  }
}

