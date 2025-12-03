import axios from 'axios';
import {
  makeDataApiCall,
  parseCsvToDtos,
  stripQuotes,
  createSqlQueryConfig,
  createApiPayload,
  ApiResponse,
  SqlQueryConfig,
  ApiPayload
} from '../../src/services/apiServiceUtils';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console methods to prevent test output pollution
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('apiServiceUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    // Reset environment variables
    process.env.REACT_APP_DATA_API_URL = undefined;
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('makeDataApiCall', () => {
    const mockPayload: ApiPayload = {
      executeInParallel: true,
      sqlQueries: []
    };

    it('should make API call with correct URL and payload', async () => {
      process.env.REACT_APP_DATA_API_URL = 'http://test-api.com';
      
      const mockResponse: ApiResponse<any> = {
        status: 'Ok',
        data: [{
          key: 'test_query',
          value: {
            csvData: ['id|name|email', '1|John|john@test.com', '2|Jane|jane@test.com']
          }
        }]
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await makeDataApiCall(mockPayload);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://test-api.com/api/v1/data/Data/ExecuteSqlQueries',
        mockPayload
      );
      expect(result).toEqual(['id|name|email', '1|John|john@test.com', '2|Jane|jane@test.com']);
    });

    it('should use provided apiUrl parameter over environment variable', async () => {
      process.env.REACT_APP_DATA_API_URL = 'http://env-api.com';
      
      const mockResponse: ApiResponse<any> = {
        status: 'Ok',
        data: [{
          key: 'test_query',
          value: {
            csvData: ['id|name', '1|John']
          }
        }]
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      await makeDataApiCall(mockPayload, 'http://param-api.com');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://param-api.com/api/v1/data/Data/ExecuteSqlQueries',
        mockPayload
      );
    });

    it('should throw error when no API URL is provided', async () => {
      // Delete the environment variable completely to test the error case
      delete process.env.REACT_APP_DATA_API_URL;

      await expect(makeDataApiCall(mockPayload)).rejects.toThrow(
        'REACT_APP_DATA_API_URL environment variable is required'
      );
    });

    it('should handle new API response format with csvData', async () => {
      process.env.REACT_APP_DATA_API_URL = 'http://test-api.com';
      
      const mockResponse: ApiResponse<any> = {
        status: 'Ok',
        data: [{
          key: 'users_query',
          value: {
            csvData: ['id|name|email', '1|John|john@test.com']
          }
        }]
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await makeDataApiCall(mockPayload);

      expect(result).toEqual(['id|name|email', '1|John|john@test.com']);
    });

    it('should fallback to older API response formats when csvData is not available', async () => {
      process.env.REACT_APP_DATA_API_URL = 'http://test-api.com';
      
      const mockResponse: ApiResponse<any> = {
        status: 'Ok',
        sqlResults: [{
          records: [{ id: 1, name: 'John' }]
        }]
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await makeDataApiCall(mockPayload);

      expect(result).toEqual([{ id: 1, name: 'John' }]);
    });

    it('should fallback to results array when sqlResults is not available', async () => {
      process.env.REACT_APP_DATA_API_URL = 'http://test-api.com';
      
      const mockResponse: ApiResponse<any> = {
        status: 'Ok',
        results: [{
          records: [{ id: 2, name: 'Jane' }]
        }]
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await makeDataApiCall(mockPayload);

      expect(result).toEqual([{ id: 2, name: 'Jane' }]);
    });

    it('should fallback to records array when results is not available', async () => {
      process.env.REACT_APP_DATA_API_URL = 'http://test-api.com';
      
      const mockResponse: ApiResponse<any> = {
        status: 'Ok',
        records: [{ id: 3, name: 'Bob' }]
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await makeDataApiCall(mockPayload);

      expect(result).toEqual([{ id: 3, name: 'Bob' }]);
    });

    it('should return empty array when all fallbacks fail', async () => {
      process.env.REACT_APP_DATA_API_URL = 'http://test-api.com';
      
      const mockResponse: ApiResponse<any> = {
        status: 'Ok'
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await makeDataApiCall(mockPayload);

      expect(result).toEqual([]);
    });

    it('should return empty array on API error to prevent infinite loop', async () => {
      process.env.REACT_APP_DATA_API_URL = 'http://test-api.com';
      
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      const result = await makeDataApiCall(mockPayload);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('makeDataApiCall: API call failed:', expect.any(Error));
    });

    it('should handle empty csvData array', async () => {
      process.env.REACT_APP_DATA_API_URL = 'http://test-api.com';
      
      const mockResponse: ApiResponse<any> = {
        status: 'Ok',
        data: [{
          key: 'empty_query',
          value: {
            csvData: []
          }
        }]
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await makeDataApiCall(mockPayload);

      expect(result).toEqual([]);
    });

    it('should handle csvData with only header row', async () => {
      process.env.REACT_APP_DATA_API_URL = 'http://test-api.com';
      
      const mockResponse: ApiResponse<any> = {
        status: 'Ok',
        data: [{
          key: 'header_only_query',
          value: {
            csvData: ['id|name|email']
          }
        }]
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await makeDataApiCall(mockPayload);

      expect(result).toEqual([]);
    });
  });

  describe('parseCsvToDtos', () => {
    const csvData = [
      'id|name|email|isEnabled|metadata',
      '1|John Doe|john@test.com|true|{"role":"admin"}',
      '2|Jane Smith|jane@test.com|false|{"role":"user"}',
      '3|Bob Wilson|bob@test.com|true|'
    ];

    const headerMapping = {
      id: 'id',
      name: 'name',
      email: 'email',
      isEnabled: 'isEnabled',
      metadata: 'metadata'
    };

    const dtoFactory = (rowData: Record<string, any>) => ({
      id: parseInt(rowData.id),
      name: rowData.name,
      email: rowData.email,
      isEnabled: rowData.isEnabled,
      metadata: rowData.metadata
    });

    it('should parse CSV data to DTOs correctly', () => {
      const result = parseCsvToDtos(csvData, headerMapping, dtoFactory);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        isEnabled: true,
        metadata: '{"role":"admin"}'
      });
      expect(result[1]).toEqual({
        id: 2,
        name: 'Jane Smith',
        email: 'jane@test.com',
        isEnabled: false,
        metadata: '{"role":"user"}'
      });
      expect(result[2]).toEqual({
        id: 3,
        name: 'Bob Wilson',
        email: 'bob@test.com',
        isEnabled: true,
        metadata: ''
      });
    });

    it('should handle boolean parsing correctly', () => {
      const csvData = [
        'id|isEnabled|isDeleted',
        '1|true|false',
        '2|false|true',
        '3|TRUE|FALSE',
        '4|FALSE|TRUE'
      ];

      const headerMapping = {
        id: 'id',
        isEnabled: 'isEnabled',
        isDeleted: 'isDeleted'
      };

      const dtoFactory = (rowData: Record<string, any>) => ({
        id: parseInt(rowData.id),
        isEnabled: rowData.isEnabled,
        isDeleted: rowData.isDeleted
      });

      const result = parseCsvToDtos(csvData, headerMapping, dtoFactory);

      expect(result[0].isEnabled).toBe(true);
      expect(result[0].isDeleted).toBe(false);
      expect(result[1].isEnabled).toBe(false);
      expect(result[1].isDeleted).toBe(true);
      expect(result[2].isEnabled).toBe(true);
      expect(result[2].isDeleted).toBe(false);
      expect(result[3].isEnabled).toBe(false);
      expect(result[3].isDeleted).toBe(true);
    });

    it('should handle JSON parsing correctly', () => {
      const csvData = [
        'id|metadata|config',
        '1|{"role":"admin","permissions":["read","write"]}|[1,2,3]',
        '2|{"role":"user"}|[]',
        '3|invalid json|not json'
      ];

      const headerMapping = {
        id: 'id',
        metadata: 'metadata',
        config: 'config'
      };

      const dtoFactory = (rowData: Record<string, any>) => ({
        id: parseInt(rowData.id),
        metadata: rowData.metadata,
        config: rowData.config
      });

      const result = parseCsvToDtos(csvData, headerMapping, dtoFactory);

      expect(result[0].metadata).toEqual('{"role":"admin","permissions":["read","write"]}');
      expect(result[0].config).toEqual('[1,2,3]');
      expect(result[1].metadata).toEqual('{"role":"user"}');
      expect(result[1].config).toEqual('[]');
      expect(result[2].metadata).toBe('invalid json');
      expect(result[2].config).toBe('not json');
    });

    it('should handle missing columns gracefully', () => {
      const csvData = [
        'id|name',
        '1|John',
        '2|Jane'
      ];

      const headerMapping = {
        id: 'id',
        name: 'name',
        email: 'email' // This column doesn't exist in CSV
      };

      const dtoFactory = (rowData: Record<string, any>) => ({
        id: parseInt(rowData.id),
        name: rowData.name,
        email: rowData.email
      });

      const result = parseCsvToDtos(csvData, headerMapping, dtoFactory);

      expect(result[0].email).toBeUndefined();
      expect(result[1].email).toBeUndefined();
    });

    it('should handle empty CSV data', () => {
      expect(() => parseCsvToDtos([], headerMapping, dtoFactory)).toThrow();
    });

    it('should handle CSV with only header', () => {
      const csvData = ['id|name|email'];
      const result = parseCsvToDtos(csvData, headerMapping, dtoFactory);
      expect(result).toEqual([]);
    });
  });

  describe('stripQuotes', () => {
    it('should strip single quotes from string', () => {
      expect(stripQuotes("'hello'")).toBe('hello');
    });

    it('should strip double quotes from string', () => {
      expect(stripQuotes('"hello"')).toBe('hello');
    });

    it('should not strip quotes from middle of string', () => {
      expect(stripQuotes("he'llo")).toBe("he'llo");
    });

    it('should not strip quotes if only one side has quotes', () => {
      expect(stripQuotes("'hello")).toBe("'hello");
      expect(stripQuotes('hello"')).toBe('hello"');
    });

    it('should handle empty string', () => {
      expect(stripQuotes('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(stripQuotes(null as any)).toBe(null);
      expect(stripQuotes(undefined as any)).toBe(undefined);
    });

    it('should handle string with only quotes', () => {
      expect(stripQuotes("''")).toBe('');
      expect(stripQuotes('""')).toBe('');
    });

    it('should handle string with spaces', () => {
      expect(stripQuotes(" 'hello' ")).toBe('hello');
    });
  });

  describe('createSqlQueryConfig', () => {
    const columns = [
      {
        dboName: 'users',
        columnName: 'id',
        dataType: 'int',
        aliasName: 'id',
        output: true
      },
      {
        dboName: 'users',
        columnName: 'name',
        dataType: 'varchar',
        aliasName: 'name',
        output: true
      }
    ];

    it('should create basic SQL query config', () => {
      const result = createSqlQueryConfig('test_query', 'users', columns);

      expect(result).toEqual({
        name: 'test_query',
        query: {
          databaseId: '09d8e037-0005-4887-abde-112a529de2b8',
          columns,
          tables: ['users'],
          searchFilter: undefined,
          orderBy: undefined,
          page: 0,
          pageSize: 100,
          caseStatements: []
        },
        includeRecordsCount: true
      });
    });

    it('should create SQL query config with search filter', () => {
      const searchFilter = {
        conditionOperator: 1,
        filters: [
          { propertyName: 'name', value: 'John' }
        ]
      };

      const result = createSqlQueryConfig('test_query', 'users', columns, searchFilter);

      expect(result.query.searchFilter).toEqual(searchFilter);
    });

    it('should create SQL query config with order by', () => {
      const orderBy = [
        { columnName: 'name', sortType: 1 },
        { columnName: 'id', sortType: 2 }
      ];

      const result = createSqlQueryConfig('test_query', 'users', columns, undefined, orderBy);

      expect(result.query.orderBy).toEqual(orderBy);
    });

    it('should create SQL query config with custom page and pageSize', () => {
      const result = createSqlQueryConfig('test_query', 'users', columns, undefined, undefined, 5, 50);

      expect(result.query.page).toBe(5);
      expect(result.query.pageSize).toBe(50);
    });

    it('should create SQL query config with all parameters', () => {
      const searchFilter = {
        conditionOperator: 1,
        filters: [
          { propertyName: 'name', value: 'John' }
        ]
      };

      const orderBy = [
        { columnName: 'name', sortType: 1 }
      ];

      const result = createSqlQueryConfig('test_query', 'users', columns, searchFilter, orderBy, 2, 25);

      expect(result).toEqual({
        name: 'test_query',
        query: {
          databaseId: '09d8e037-0005-4887-abde-112a529de2b8',
          columns,
          tables: ['users'],
          searchFilter,
          orderBy,
          page: 2,
          pageSize: 25,
          caseStatements: []
        },
        includeRecordsCount: true
      });
    });
  });

  describe('createApiPayload', () => {
    it('should create API payload with queries', () => {
      const queries: SqlQueryConfig[] = [
        {
          name: 'query1',
          query: {
            databaseId: 'test-id',
            columns: [],
            tables: ['table1'],
            page: 0,
            pageSize: 100,
            caseStatements: []
          },
          includeRecordsCount: true
        },
        {
          name: 'query2',
          query: {
            databaseId: 'test-id',
            columns: [],
            tables: ['table2'],
            page: 0,
            pageSize: 100,
            caseStatements: []
          },
          includeRecordsCount: true
        }
      ];

      const result = createApiPayload(queries);

      expect(result).toEqual({
        executeInParallel: true,
        sqlQueries: queries
      });
    });

    it('should create API payload with empty queries array', () => {
      const result = createApiPayload([]);

      expect(result).toEqual({
        executeInParallel: true,
        sqlQueries: []
      });
    });
  });
});
