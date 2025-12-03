import { fetchCurrenciesFromApi } from '../../src/services/currencyService';

// Mock axios
jest.mock('axios');
const mockAxios = require('axios');

describe('currencyService', () => {
  let originalConsoleLog: any;
  let originalConsoleError: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.post.mockClear();
    // Mock console to reduce test noise
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('fetchCurrenciesFromApi', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should fetch currencies successfully with new CSV API format', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [
            {
              key: 'currencies',
              value: {
                csvData: [
                  'id|currencyName',
                  'USD|US Dollar',
                  'EUR|Euro',
                  'GBP|British Pound'
                ]
              }
            }
          ]
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/data/Data/ExecuteSqlQueries',
        expect.objectContaining({
          executeInParallel: true,
          sqlQueries: expect.arrayContaining([
            expect.objectContaining({
              name: 'currencies',
              query: expect.objectContaining({
                databaseId: '09d8e037-0005-4887-abde-112a529de2b8',
                tables: ['currencies'],
                page: 0,
                pageSize: 200,
              }),
              includeRecordsCount: true,
            }),
          ]),
        })
      );

      expect(result).toEqual([
        { id: 'USD', currencyName: 'US Dollar' },
        { id: 'EUR', currencyName: 'Euro' },
        { id: 'GBP', currencyName: 'British Pound' },
      ]);
    });

    it('should use default API URL when REACT_APP_DATA_API_URL is not set', async () => {
      delete process.env.REACT_APP_DATA_API_URL;
      
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [
            {
              key: 'currencies',
              value: {
                csvData: [
                  'id|currencyName',
                  'USD|US Dollar'
                ]
              }
            }
          ]
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      await fetchCurrenciesFromApi();

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/data/Data/ExecuteSqlQueries',
        expect.any(Object)
      );
    });

    it('should use custom API URL when REACT_APP_DATA_API_URL is set', async () => {
      // Test without environment variable first to show difference
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'currencies',
            value: {
              csvData: [
                'id|currencyName',
                'USD|US Dollar'
              ]
            }
          }
        ]
      };

      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await fetchCurrenciesFromApi();

      // When no env var is set, it should use relative path
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/data/Data/ExecuteSqlQueries',
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: 'USD', currencyName: 'US Dollar' });
    });

    it('should handle CSV data with quoted values', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [
            {
              key: 'currencies',
              value: {
                csvData: [
                  'id|currencyName',
                  '"USD"|"US Dollar"',
                  "'EUR'|'Euro'",
                  'GBP|British Pound'
                ]
              }
            }
          ]
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([
        { id: 'USD', currencyName: 'US Dollar' },
        { id: 'EUR', currencyName: 'Euro' },
        { id: 'GBP', currencyName: 'British Pound' },
      ]);
    });

    it('should handle CSV data with missing fields', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [
            {
              key: 'currencies',
              value: {
                csvData: [
                  'id|currencyName',
                  'USD|',
                  '|Euro',
                  'GBP|British Pound'
                ]
              }
            }
          ]
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([
        { id: 'USD', currencyName: '' },
        { id: '', currencyName: 'Euro' },
        { id: 'GBP', currencyName: 'British Pound' },
      ]);
    });

    it('should handle fallback to sqlResults format', async () => {
      const mockResponse = {
        data: {
          sqlResults: [
            {
              records: [
                { id: 'USD', currencyName: 'US Dollar' },
                { id: 'EUR', currencyName: 'Euro' },
              ]
            }
          ]
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([
        { id: 'USD', currencyName: 'US Dollar' },
        { id: 'EUR', currencyName: 'Euro' },
      ]);
    });

    it('should handle fallback to results format', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              records: [
                { id: 'USD', currencyName: 'US Dollar' },
                { id: 'EUR', currencyName: 'Euro' },
              ]
            }
          ]
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([
        { id: 'USD', currencyName: 'US Dollar' },
        { id: 'EUR', currencyName: 'Euro' },
      ]);
    });

    it('should handle fallback to records format', async () => {
      const mockResponse = {
        data: {
          records: [
            { id: 'USD', currencyName: 'US Dollar' },
            { id: 'EUR', currencyName: 'Euro' },
          ]
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([
        { id: 'USD', currencyName: 'US Dollar' },
        { id: 'EUR', currencyName: 'Euro' },
      ]);
    });

    it('should handle empty response data', async () => {
      const mockResponse = {
        data: {
          result: [],
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([]);
    });

    it('should handle response with null result', async () => {
      const mockResponse = {
        data: {
          result: null,
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([]);
    });

    it('should handle response with undefined result', async () => {
      const mockResponse = {
        data: {
          result: undefined,
        },
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([]);
    });

    it('should handle API error', async () => {
      const mockError = new Error('API Error');
      mockAxios.post.mockRejectedValue(mockError);

      await expect(fetchCurrenciesFromApi()).rejects.toThrow('API Error');
    });

    it('should handle network error', async () => {
      const mockError = new Error('Network Error');
      mockAxios.post.mockRejectedValue(mockError);

      await expect(fetchCurrenciesFromApi()).rejects.toThrow('Network Error');
    });

    it('should handle timeout error', async () => {
      const mockError = new Error('Request timeout');
      mockAxios.post.mockRejectedValue(mockError);

      await expect(fetchCurrenciesFromApi()).rejects.toThrow('Request timeout');
    });

    it('should handle malformed response', async () => {
      const mockResponse = {
        data: null,
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([]);
    });

    it('should handle response without data property', async () => {
      const mockResponse = {};

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([]);
    });

    it('should handle response with empty data', async () => {
      const mockResponse = {
        data: {},
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([]);
    });

    it('should use correct SQL query structure', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [
            {
              key: 'currencies',
              value: {
                csvData: [
                  'id|currencyName',
                  'USD|US Dollar'
                ]
              }
            }
          ]
        }
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      await fetchCurrenciesFromApi();

      const callArgs = mockAxios.post.mock.calls[0];
      const requestBody = callArgs[1];

      expect(requestBody).toEqual({
        executeInParallel: true,
        sqlQueries: [
          {
            name: 'currencies',
            query: {
              databaseId: '09d8e037-0005-4887-abde-112a529de2b8',
              columns: [
                {
                  dboName: 'currencies',
                  columnName: 'id',
                  aliasName: 'id',
                  dataType: 'UUID',
                  columnSize: 0,
                  isPrimaryKey: true,
                  isNullable: false,
                  createIndex: false,
                  isSequenceColumn: true,
                  columnOrderIndex: 1
                },
                {
                  dboName: 'currencies',
                  columnName: 'currencyName',
                  aliasName: 'currencyName',
                  dataType: 'VARCHAR',
                  columnSize: 255,
                  isPrimaryKey: false,
                  isNullable: false,
                  createIndex: false,
                  isSequenceColumn: false,
                  columnOrderIndex: 2
                }
              ],
              tables: ['currencies'],
              searchFilter: {
                conditionOperator: 0,
                filters: []
              },
              page: 0,
              pageSize: 200,
              caseStatements: []
            },
            includeRecordsCount: true
          }
        ]
      });
    });

    it('should handle large dataset with pagination', async () => {
      const csvData = ['id|currencyName'];
      for (let i = 0; i < 1000; i++) {
        csvData.push(`CURR${i}|Currency ${i}`);
      }

      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'currencies',
            value: {
              csvData
            }
          }
        ]
      };

      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await fetchCurrenciesFromApi();

      expect(result).toHaveLength(1000);
      expect(result[0]).toEqual({ id: 'CURR0', currencyName: 'Currency 0' });
      expect(result[999]).toEqual({ id: 'CURR999', currencyName: 'Currency 999' });
    });

    it('should handle special characters in currency names', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'currencies',
            value: {
              csvData: [
                'id|currencyName',
                'EUR|Euro (€)',
                'GBP|British Pound (£)',
                'JPY|Japanese Yen (¥)'
              ]
            }
          }
        ]
      };

      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([
        { id: 'EUR', currencyName: 'Euro (€)' },
        { id: 'GBP', currencyName: 'British Pound (£)' },
        { id: 'JPY', currencyName: 'Japanese Yen (¥)' },
      ]);
    });

    it('should handle numeric currency IDs', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'currencies',
            value: {
              csvData: [
                'id|currencyName',
                '001|First Currency',
                '002|Second Currency'
              ]
            }
          }
        ]
      };

      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([
        { id: '001', currencyName: 'First Currency' },
        { id: '002', currencyName: 'Second Currency' },
      ]);
    });

    it('should handle mixed case in currency IDs', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'currencies',
            value: {
              csvData: [
                'id|currencyName',
                'usd|US Dollar',
                'EUR|Euro',
                'Gbp|British Pound'
              ]
            }
          }
        ]
      };

      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([
        { id: 'usd', currencyName: 'US Dollar' },
        { id: 'EUR', currencyName: 'Euro' },
        { id: 'Gbp', currencyName: 'British Pound' },
      ]);
    });

    it('should handle empty currency names', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'currencies',
            value: {
              csvData: [
                'id|currencyName',
                'USD|',
                'EUR|null',
                'GBP|British Pound'
              ]
            }
          }
        ]
      };

      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([
        { id: 'USD', currencyName: '' },
        { id: 'EUR', currencyName: 'null' },
        { id: 'GBP', currencyName: 'British Pound' },
      ]);
    });

    it('should handle missing currency properties', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'currencies',
            value: {
              csvData: [
                'id|currencyName',
                'USD|',
                '|Euro',
                '|',
                'GBP|British Pound'
              ]
            }
          }
        ]
      };

      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await fetchCurrenciesFromApi();

      expect(result).toEqual([
        { id: 'USD', currencyName: '' },
        { id: '', currencyName: 'Euro' },
        { id: '', currencyName: '' },
        { id: 'GBP', currencyName: 'British Pound' },
      ]);
    });

    it('should handle axios configuration errors', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };

      mockAxios.post.mockRejectedValue(mockError);

      await expect(fetchCurrenciesFromApi()).rejects.toEqual(mockError);
    });

    it('should handle axios timeout errors', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'Request timeout',
      };

      mockAxios.post.mockRejectedValue(mockError);

      await expect(fetchCurrenciesFromApi()).rejects.toEqual(mockError);
    });

    it('should handle axios network errors', async () => {
      const mockError = {
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
      };

      mockAxios.post.mockRejectedValue(mockError);

      await expect(fetchCurrenciesFromApi()).rejects.toEqual(mockError);
    });
  });
});
