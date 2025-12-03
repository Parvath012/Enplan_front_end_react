import { fetchGroupsFromApi, fetchGroupById, GroupModel } from '../../src/services/groupFetchService';
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
const originalConsoleLog = console.log;

describe('groupFetchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  describe('fetchGroupsFromApi', () => {
    it('should fetch and parse groups successfully', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|2023-01-01|2023-01-02|true',
        '2|Team B|Description B|2|[]|2023-01-01|2023-01-02|false'
      ];

      const mockQueryConfig = {
        name: 'teams_and_groups',
        query: {
          databaseId: 'test-id',
          columns: [],
          tables: ['teams_and_groups'],
        }
      };

      const mockPayload = { queries: [mockQueryConfig] };

      mockedCreateSqlQueryConfig.mockReturnValue(mockQueryConfig);
      mockedCreateApiPayload.mockReturnValue(mockPayload);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue([
        {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        },
        {
          Id: '2',
          Name: 'Team B',
          Description: 'Description B',
          OwnerUserId: '2',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: false
        }
      ]);

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '1',
        name: 'Team A',
        description: 'Description A',
        owner_user_id: '1',
        isactive: true
      });
      expect(mockedCreateSqlQueryConfig).toHaveBeenCalled();
      expect(mockedCreateApiPayload).toHaveBeenCalled();
      expect(mockedMakeDataApiCall).toHaveBeenCalledWith(mockPayload);
    });

    it('should return empty array when no groups found', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(['Id|Name']);
      mockedParseCsvToDtos.mockReturnValue([]);

      const result = await fetchGroupsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockRejectedValue(new Error('API Error'));

      await expect(fetchGroupsFromApi()).rejects.toThrow('API Error');
    });

    it('should return empty array when CSV data is not an array', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue('not an array' as any);

      const result = await fetchGroupsFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchGroupsFromApi: No valid data returned');
    });

    it('should return empty array when CSV data is null', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(null as any);

      const result = await fetchGroupsFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchGroupsFromApi: No valid data returned');
    });

    it('should return empty array when CSV data is undefined', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(undefined as any);

      const result = await fetchGroupsFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchGroupsFromApi: No valid data returned');
    });

    it('should return empty array when CSV data has only header row', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);

      const result = await fetchGroupsFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchGroupsFromApi: No valid data returned');
    });

    it('should handle parseBoolean with boolean true value', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with boolean true
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true // boolean true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].isactive).toBe(true);
    });

    it('should handle parseBoolean with boolean false value', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|2023-01-01|2023-01-02|false'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with boolean false
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: false // boolean false
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].isactive).toBe(false);
    });

    it('should handle parseBoolean with string "True" (capital T)', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|2023-01-01|2023-01-02|True'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with string "True"
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: 'True' // string "True"
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].isactive).toBe(true);
    });

    it('should handle parseBoolean with string "1"', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|2023-01-01|2023-01-02|1'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with string "1"
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: '1' // string "1"
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].isactive).toBe(true);
    });

    it('should handle parseBoolean with string that is not true/True/1', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|2023-01-01|2023-01-02|false'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with string "false"
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: 'false' // string "false" (not true/True/1)
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].isactive).toBe(false);
    });

    it('should handle parseBoolean with null/undefined value', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|2023-01-01|2023-01-02|'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with null/undefined
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: null // null value
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].isactive).toBe(false);
    });

    it('should strip quotes from Name field', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|\'Team A\'|Description A|1|[]|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with quoted name
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: '\'Team A\'', // Name with quotes
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Team A'); // Quotes should be stripped
    });

    it('should strip quotes from Description field when present', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|\'Description A\'|1|[]|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with quoted description
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: '\'Description A\'', // Description with quotes
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Description A'); // Quotes should be stripped
    });

    it('should handle undefined Description field', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A||1|[]|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with undefined description
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: undefined, // undefined description
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].description).toBeUndefined();
    });

    it('should handle null Description field', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A||1|[]|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with null description
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: null, // null description (falsy)
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].description).toBeUndefined();
    });

    it('should handle empty string Description field', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A||1|[]|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with empty string description
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: '', // empty string description (falsy)
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].description).toBeUndefined();
    });

    it('should strip quotes from Members field when present', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|\'[]\'|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with quoted members
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '\'[]\'', // Members with quotes
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].members).toBe('[]'); // Quotes should be stripped
    });

    it('should handle undefined Members field', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1||2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with undefined members
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: undefined, // undefined members
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].members).toBeUndefined();
    });

    it('should handle null Members field', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1||2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with null members
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: null, // null members (falsy)
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].members).toBeUndefined();
    });

    it('should handle empty string Members field', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1||2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with empty string members
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '', // empty string members (falsy)
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].members).toBeUndefined();
    });

    it('should use CreatedAt as fallback when LastUpdatedAt is missing', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|2023-01-01||true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with missing LastUpdatedAt
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: undefined, // missing LastUpdatedAt
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].lastupdatedat).toBe('2023-01-01'); // Should fallback to CreatedAt
    });

    it('should handle null/undefined Id field', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '|Team A|Description A|1|[]|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with null/undefined Id
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: null, // null Id
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(''); // Should default to empty string
    });

    it('should handle null/undefined Name field', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1||Description A|1|[]|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with null/undefined Name
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: undefined, // undefined Name
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(''); // Should default to empty string
    });

    it('should handle null/undefined CreatedAt field', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]||2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with null/undefined CreatedAt
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: null, // null CreatedAt
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].createdat).toBe(''); // Should default to empty string
    });

    it('should handle both LastUpdatedAt and CreatedAt as null/undefined', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|||true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with both null/undefined
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: null, // null CreatedAt
          LastUpdatedAt: null, // null LastUpdatedAt
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].lastupdatedat).toBe(''); // Should default to empty string when both are null
    });

    it('should handle null/undefined OwnerUserId field', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A||[]|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with null/undefined OwnerUserId
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: undefined, // undefined OwnerUserId
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchGroupsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].owner_user_id).toBe(''); // Should default to empty string
    });

    it('should log parsed DTOs and mapped models', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|2023-01-01|2023-01-02|true'
      ];

      const mockParsedDtos = [
        {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      await fetchGroupsFromApi();

      expect(console.log).toHaveBeenCalledWith('fetchGroupsFromApi: parsed DTOs:', mockParsedDtos);
      expect(console.log).toHaveBeenCalledWith('fetchGroupsFromApi: mapped models:', expect.any(Array));
    });
  });

  describe('fetchGroupById', () => {
    it('should fetch a single group by ID', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue([
        {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        }
      ]);

      const result = await fetchGroupById('1');

      expect(result).toMatchObject({
        id: '1',
        name: 'Team A',
        description: 'Description A',
        owner_user_id: '1',
        isactive: true
      });
    });

    it('should return null when group not found', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(['Id|Name']);
      mockedParseCsvToDtos.mockReturnValue([]);

      const result = await fetchGroupById('999');

      expect(result).toBeNull();
    });

    it('should handle errors when fetching by ID', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockRejectedValue(new Error('API Error'));

      await expect(fetchGroupById('1')).rejects.toThrow('API Error');
    });

    it('should return null when CSV data is not an array', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue('not an array' as any);

      const result = await fetchGroupById('1');

      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith('fetchGroupById: Group not found for ID:', '1');
    });

    it('should return null when CSV data has only header row', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue([]);

      const result = await fetchGroupById('1');

      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith('fetchGroupById: Group not found for ID:', '1');
    });

    it('should log when group is found', async () => {
      const mockCsvData = [
        'Id|Name|Description|OwnerUserId|Members|CreatedAt|LastUpdatedAt|IsActive',
        '1|Team A|Description A|1|[]|2023-01-01|2023-01-02|true'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue([
        {
          Id: '1',
          Name: 'Team A',
          Description: 'Description A',
          OwnerUserId: '1',
          Members: '[]',
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsActive: true
        }
      ]);

      await fetchGroupById('1');

      expect(console.log).toHaveBeenCalledWith('fetchGroupById: Found group:', '1');
    });
  });
});

