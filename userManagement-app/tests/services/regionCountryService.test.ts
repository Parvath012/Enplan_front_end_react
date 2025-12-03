import { 
  fetchRegionCountryFromApi, 
  transformRegionCountryToDropdownOptions,
  regionCountryPayload,
  RegionCountryDto,
  RegionCountryModel,
  RegionCountryDropdownOptions
} from '../../src/services/regionCountryService';
import { 
  makeDataApiCall, 
  parseCsvToDtos, 
  createSqlQueryConfig, 
  createApiPayload
} from 'commonApp/apiServiceUtils';

// Mock the commonApp utilities
jest.mock('commonApp/apiServiceUtils', () => ({
  makeDataApiCall: jest.fn(),
  parseCsvToDtos: jest.fn(),
  createSqlQueryConfig: jest.fn(),
  createApiPayload: jest.fn()
}));

const mockedMakeDataApiCall = makeDataApiCall as jest.MockedFunction<typeof makeDataApiCall>;
const mockedParseCsvToDtos = parseCsvToDtos as jest.MockedFunction<typeof parseCsvToDtos>;
const mockedCreateSqlQueryConfig = createSqlQueryConfig as jest.MockedFunction<typeof createSqlQueryConfig>;
const mockedCreateApiPayload = createApiPayload as jest.MockedFunction<typeof createApiPayload>;

// Mock console methods
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

describe('regionCountryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('fetchRegionCountryFromApi', () => {
    it('should fetch and parse region country data successfully', async () => {
      const mockCsvData = [
        'Id|regions|countries|divisions|groups|departments|class|subClass',
        '1|["North America","Europe"]|["USA","Canada","Germany"]|["Engineering","Sales"]|["DevOps","Marketing"]|["IT","Finance"]|["Senior","Junior"]|["Frontend","Backend"]',
        '2|["Asia","Africa"]|["Japan","India","South Africa"]|["HR","Operations"]|["Support","Analytics"]|["Legal","Admin"]|["Mid","Entry"]|["Mobile","Desktop"]'
      ];

      const mockQueryConfig = {
        name: 'region_country',
        query: {
          databaseId: 'test-id',
          columns: [],
          tables: ['region_country'],
          page: 0,
          pageSize: 100,
          caseStatements: []
        },
        includeRecordsCount: true
      };

      const mockPayload = {
        executeInParallel: true,
        sqlQueries: [mockQueryConfig]
      };

      const mockParsedDtos: RegionCountryDto[] = [
        {
          Id: 1,
          regions: '["North America","Europe"]',
          countries: '["USA","Canada","Germany"]',
          divisions: '["Engineering","Sales"]',
          groups: '["DevOps","Marketing"]',
          departments: '["IT","Finance"]',
          class: '["Senior","Junior"]',
          subClass: '["Frontend","Backend"]'
        },
        {
          Id: 2,
          regions: '["Asia","Africa"]',
          countries: '["Japan","India","South Africa"]',
          divisions: '["HR","Operations"]',
          groups: '["Support","Analytics"]',
          departments: '["Legal","Admin"]',
          class: '["Mid","Entry"]',
          subClass: '["Mobile","Desktop"]'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue(mockQueryConfig);
      mockedCreateApiPayload.mockReturnValue(mockPayload);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchRegionCountryFromApi();

      expect(mockedCreateSqlQueryConfig).toHaveBeenCalledWith(
        'region_country',
        'region_country',
        expect.arrayContaining([
          expect.objectContaining({ dboName: 'region_country', columnName: 'id', aliasName: 'Id' }),
          expect.objectContaining({ dboName: 'region_country', columnName: 'regions', aliasName: 'regions' }),
          expect.objectContaining({ dboName: 'region_country', columnName: 'countries', aliasName: 'countries' })
        ])
      );

      expect(mockedCreateApiPayload).toHaveBeenCalledWith([mockQueryConfig]);
      expect(mockedMakeDataApiCall).toHaveBeenCalledWith(mockPayload);
      expect(mockedParseCsvToDtos).toHaveBeenCalledWith(
        mockCsvData,
        expect.objectContaining({
          Id: 'Id',
          regions: 'regions',
          countries: 'countries',
          divisions: 'divisions',
          groups: 'groups',
          departments: 'departments',
          class: 'class',
          subClass: 'subClass'
        }),
        expect.any(Function)
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        regions: ['North America', 'Europe'],
        countries: ['USA', 'Canada', 'Germany'],
        divisions: ['Engineering', 'Sales'],
        groups: ['DevOps', 'Marketing'],
        departments: ['IT', 'Finance'],
        class: ['Senior', 'Junior'],
        subClass: ['Frontend', 'Backend']
      });

      expect(result[1]).toEqual({
        id: 2,
        regions: ['Asia', 'Africa'],
        countries: ['Japan', 'India', 'South Africa'],
        divisions: ['HR', 'Operations'],
        groups: ['Support', 'Analytics'],
        departments: ['Legal', 'Admin'],
        class: ['Mid', 'Entry'],
        subClass: ['Mobile', 'Desktop']
      });
    });

    it('should handle empty CSV data', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue([]);

      await expect(fetchRegionCountryFromApi()).rejects.toThrow(
        'No data available from API - The region_country table may not exist or may be empty. Please check the database.'
      );
    });

    it('should handle CSV data with only header row', async () => {
      const mockCsvData = [
        'Id|regions|countries|divisions|groups|departments|class|subClass'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);

      await expect(fetchRegionCountryFromApi()).rejects.toThrow(
        'No data available from API - The region_country table may not exist or may be empty. Please check the database.'
      );
    });

    it('should handle API call errors', async () => {
      const mockError = new Error('API call failed');
      
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockRejectedValue(mockError);

      await expect(fetchRegionCountryFromApi()).rejects.toThrow('API call failed');
      expect(console.error).toHaveBeenCalledWith('fetchRegionCountryFromApi: API call failed:', mockError);
    });

    it('should handle parsing errors', async () => {
      const mockCsvData = [
        'Id|regions|countries|divisions|groups|departments|class|subClass',
        '1|["North America"]|["USA"]|["Engineering"]|["DevOps"]|["IT"]|["Senior"]|["Frontend"]'
      ];

      const mockError = new Error('Parsing failed');
      
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockImplementation(() => {
        throw mockError;
      });

      await expect(fetchRegionCountryFromApi()).rejects.toThrow('Parsing failed');
      expect(console.error).toHaveBeenCalledWith('fetchRegionCountryFromApi: API call failed:', mockError);
    });

    it('should handle DTO mapping with various data types', async () => {
      const mockCsvData = [
        'Id|regions|countries|divisions|groups|departments|class|subClass',
        '1|["North America"]|["USA"]|["Engineering"]|["DevOps"]|["IT"]|["Senior"]|["Frontend"]'
      ];

      // Mock parseCsvToDtos to capture and test the mapping function
      let capturedMappingFunction: any;
      mockedParseCsvToDtos.mockImplementation((csvData, headerMapping, mappingFunction) => {
        capturedMappingFunction = mappingFunction;
        return [];
      });

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);

      await fetchRegionCountryFromApi();

      // Test the mapping function
      expect(capturedMappingFunction).toBeDefined();

      // Test with valid data
      const testRowData = {
        Id: '123',
        regions: '["US","EU"]',
        countries: '["USA","Germany"]',
        divisions: '["Engineering","Sales"]',
        groups: '["DevOps","Marketing"]',
        departments: '["IT","Finance"]',
        class: '["Senior","Junior"]',
        subClass: '["Frontend","Backend"]'
      };

      const result = capturedMappingFunction(testRowData);
      expect(result).toEqual({
        Id: 123,
        regions: '["US","EU"]',
        countries: '["USA","Germany"]',
        divisions: '["Engineering","Sales"]',
        groups: '["DevOps","Marketing"]',
        departments: '["IT","Finance"]',
        class: '["Senior","Junior"]',
        subClass: '["Frontend","Backend"]'
      });

      // Test with null/undefined values
      const testRowData2 = {
        Id: null,
        regions: undefined,
        countries: '',
        divisions: null,
        groups: undefined,
        departments: '',
        class: null,
        subClass: undefined
      };

      const result2 = capturedMappingFunction(testRowData2);
      expect(result2).toEqual({
        Id: 0,
        regions: '[]',
        countries: '',
        divisions: '[]',
        groups: '[]',
        departments: '',
        class: '[]',
        subClass: '[]'
      });
    });

    it('should handle non-array CSV data', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue('not an array');

      await expect(fetchRegionCountryFromApi()).rejects.toThrow(
        'No data available from API - The region_country table may not exist or may be empty. Please check the database.'
      );
    });

    it('should handle single element array', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(['single element']);

      await expect(fetchRegionCountryFromApi()).rejects.toThrow(
        'No data available from API - The region_country table may not exist or may be empty. Please check the database.'
      );
    });
  });

  describe('transformRegionCountryToDropdownOptions', () => {
    it('should transform data to dropdown options successfully', () => {
      const mockData: RegionCountryModel[] = [
        {
          id: 1,
          regions: ['North America', 'Europe'],
          countries: ['USA', 'Canada', 'Germany'],
          divisions: ['Engineering', 'Sales'],
          groups: ['DevOps', 'Marketing'],
          departments: ['IT', 'Finance'],
          class: ['Senior', 'Junior'],
          subClass: ['Frontend', 'Backend']
        },
        {
          id: 2,
          regions: ['Asia', 'Europe'], // Europe is duplicate
          countries: ['Japan', 'USA'], // USA is duplicate
          divisions: ['HR', 'Engineering'], // Engineering is duplicate
          groups: ['Support', 'DevOps'], // DevOps is duplicate
          departments: ['Legal', 'IT'], // IT is duplicate
          class: ['Mid', 'Senior'], // Senior is duplicate
          subClass: ['Mobile', 'Frontend'] // Frontend is duplicate
        }
      ];

      const result = transformRegionCountryToDropdownOptions(mockData);

      expect(result).toEqual({
        regions: ['Asia', 'Europe', 'North America'],
        countries: ['Canada', 'Germany', 'Japan', 'USA'],
        divisions: ['Engineering', 'HR', 'Sales'],
        groups: ['DevOps', 'Marketing', 'Support'],
        departments: ['Finance', 'IT', 'Legal'],
        classes: ['Junior', 'Mid', 'Senior'],
        subClasses: ['Backend', 'Frontend', 'Mobile']
      });

      // Verify all arrays are sorted alphabetically
      expect(result.regions).toEqual(['Asia', 'Europe', 'North America']);
      expect(result.countries).toEqual(['Canada', 'Germany', 'Japan', 'USA']);
      expect(result.divisions).toEqual(['Engineering', 'HR', 'Sales']);
      expect(result.groups).toEqual(['DevOps', 'Marketing', 'Support']);
      expect(result.departments).toEqual(['Finance', 'IT', 'Legal']);
      expect(result.classes).toEqual(['Junior', 'Mid', 'Senior']);
      expect(result.subClasses).toEqual(['Backend', 'Frontend', 'Mobile']);
    });

    it('should handle empty data array', () => {
      const result = transformRegionCountryToDropdownOptions([]);

      expect(result).toEqual({
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: []
      });
    });

    it('should handle data with empty arrays', () => {
      const mockData: RegionCountryModel[] = [
        {
          id: 1,
          regions: [],
          countries: [],
          divisions: [],
          groups: [],
          departments: [],
          class: [],
          subClass: []
        }
      ];

      const result = transformRegionCountryToDropdownOptions(mockData);

      expect(result).toEqual({
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        classes: [],
        subClasses: []
      });
    });

    it('should handle data with null/undefined values', () => {
      const mockData: RegionCountryModel[] = [
        {
          id: 1,
          regions: ['North America', null as any, 'Europe'],
          countries: ['USA', undefined as any, 'Canada'],
          divisions: ['Engineering', '', 'Sales'],
          groups: ['DevOps', null as any, 'Marketing'],
          departments: ['IT', undefined as any, 'Finance'],
          class: ['Senior', '', 'Junior'],
          subClass: ['Frontend', null as any, 'Backend']
        }
      ];

      const result = transformRegionCountryToDropdownOptions(mockData);

      expect(result).toEqual({
        regions: ['Europe', 'North America'],
        countries: ['Canada', 'USA'],
        divisions: ['Engineering', 'Sales'],
        groups: ['DevOps', 'Marketing'],
        departments: ['Finance', 'IT'],
        classes: ['Junior', 'Senior'],
        subClasses: ['Backend', 'Frontend']
      });
    });

    it('should handle single item data', () => {
      const mockData: RegionCountryModel[] = [
        {
          id: 1,
          regions: ['North America'],
          countries: ['USA'],
          divisions: ['Engineering'],
          groups: ['DevOps'],
          departments: ['IT'],
          class: ['Senior'],
          subClass: ['Frontend']
        }
      ];

      const result = transformRegionCountryToDropdownOptions(mockData);

      expect(result).toEqual({
        regions: ['North America'],
        countries: ['USA'],
        divisions: ['Engineering'],
        groups: ['DevOps'],
        departments: ['IT'],
        classes: ['Senior'],
        subClasses: ['Frontend']
      });
    });

    it('should handle data with special characters and case sensitivity', () => {
      const mockData: RegionCountryModel[] = [
        {
          id: 1,
          regions: ['North America', 'north america', 'NORTH AMERICA'],
          countries: ['USA', 'usa', 'UsA'],
          divisions: ['Engineering', 'engineering', 'ENGINEERING'],
          groups: ['DevOps', 'devops', 'DEVOPS'],
          departments: ['IT', 'it', 'It'],
          class: ['Senior', 'senior', 'SENIOR'],
          subClass: ['Frontend', 'frontend', 'FRONTEND']
        }
      ];

      const result = transformRegionCountryToDropdownOptions(mockData);

      expect(result).toEqual({
        regions: ['north america', 'North America', 'NORTH AMERICA'],
        countries: ['usa', 'UsA', 'USA'],
        divisions: ['engineering', 'Engineering', 'ENGINEERING'],
        groups: ['devops', 'DevOps', 'DEVOPS'],
        departments: ['it', 'It', 'IT'],
        classes: ['senior', 'Senior', 'SENIOR'],
        subClasses: ['frontend', 'Frontend', 'FRONTEND']
      });
    });

    it('should handle data with very long strings', () => {
      const longString1 = 'A'.repeat(100);
      const longString2 = 'B'.repeat(100);
      const longString3 = 'C'.repeat(100);

      const mockData: RegionCountryModel[] = [
        {
          id: 1,
          regions: [longString1, longString2],
          countries: [longString2, longString3],
          divisions: [longString3, longString1],
          groups: [longString1, longString3],
          departments: [longString2, longString1],
          class: [longString3, longString2],
          subClass: [longString1, longString2]
        }
      ];

      const result = transformRegionCountryToDropdownOptions(mockData);

      expect(result.regions).toEqual([longString1, longString2]);
      expect(result.countries).toEqual([longString2, longString3]);
      expect(result.divisions).toEqual([longString1, longString3]);
      expect(result.groups).toEqual([longString1, longString3]);
      expect(result.departments).toEqual([longString1, longString2]);
      expect(result.classes).toEqual([longString2, longString3]);
      expect(result.subClasses).toEqual([longString1, longString2]);
    });
  });

  describe('regionCountryPayload', () => {
    it('should have correct structure', () => {
      expect(regionCountryPayload).toEqual({
        executeInParallel: true,
        sqlQueries: [
          {
            name: "region_country",
            query: {
              databaseId: "09d8e037-0005-4887-abde-112a529de2b8",
              columns: expect.arrayContaining([
                expect.objectContaining({ dboName: 'region_country', columnName: 'id', aliasName: 'Id' }),
                expect.objectContaining({ dboName: 'region_country', columnName: 'regions', aliasName: 'regions' }),
                expect.objectContaining({ dboName: 'region_country', columnName: 'countries', aliasName: 'countries' })
              ]),
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
      });
    });
  });

  describe('JSON parsing edge cases', () => {
    it('should handle invalid JSON strings in transformRegionCountryToDropdownOptions', () => {
      const mockData: RegionCountryModel[] = [
        {
          id: 1,
          regions: ['North America'],
          countries: ['USA'],
          divisions: ['Engineering'],
          groups: ['DevOps'],
          departments: ['IT'],
          class: ['Senior'],
          subClass: ['Frontend']
        }
      ];

      // This test covers the parseJsonArray function indirectly
      const result = transformRegionCountryToDropdownOptions(mockData);

      expect(result).toEqual({
        regions: ['North America'],
        countries: ['USA'],
        divisions: ['Engineering'],
        groups: ['DevOps'],
        departments: ['IT'],
        classes: ['Senior'],
        subClasses: ['Frontend']
      });
    });

    it('should handle DTO mapping with invalid JSON', async () => {
      const mockCsvData = [
        'Id|regions|countries|divisions|groups|departments|class|subClass',
        '1|invalid json|{"valid":"json"}|[]|{}|null|undefined|""'
      ];

      const mockParsedDtos: RegionCountryDto[] = [
        {
          Id: 1,
          regions: 'invalid json',
          countries: '{"valid":"json"}',
          divisions: '[]',
          groups: '{}',
          departments: 'null',
          class: 'undefined',
          subClass: '""'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchRegionCountryFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].regions).toEqual([]); // Invalid JSON should return empty array
      expect(result[0].countries).toEqual([]); // Object JSON should return empty array (not an array)
      expect(result[0].divisions).toEqual([]); // Valid empty array
      expect(result[0].groups).toEqual([]); // Object JSON should return empty array
      expect(result[0].departments).toEqual([]); // "null" string should return empty array
      expect(result[0].class).toEqual([]); // "undefined" string should return empty array
      expect(result[0].subClass).toEqual([]); // Empty string should return empty array
    });

    it('should handle DTO mapping with valid JSON arrays', async () => {
      const mockCsvData = [
        'Id|regions|countries|divisions|groups|departments|class|subClass',
        '1|["North America","Europe"]|["USA","Canada"]|["Engineering"]|["DevOps"]|["IT"]|["Senior"]|["Frontend"]'
      ];

      const mockParsedDtos: RegionCountryDto[] = [
        {
          Id: 1,
          regions: '["North America","Europe"]',
          countries: '["USA","Canada"]',
          divisions: '["Engineering"]',
          groups: '["DevOps"]',
          departments: '["IT"]',
          class: '["Senior"]',
          subClass: '["Frontend"]'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchRegionCountryFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].regions).toEqual(['North America', 'Europe']);
      expect(result[0].countries).toEqual(['USA', 'Canada']);
      expect(result[0].divisions).toEqual(['Engineering']);
      expect(result[0].groups).toEqual(['DevOps']);
      expect(result[0].departments).toEqual(['IT']);
      expect(result[0].class).toEqual(['Senior']);
      expect(result[0].subClass).toEqual(['Frontend']);
    });
  });
});
