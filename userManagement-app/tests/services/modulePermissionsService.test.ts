import axios from 'axios';
import { 
  fetchModulePermissionsFromApi, 
  transformModulePermissionsToLayoutFormat,
  ModulePermissionsModel 
} from '../../src/services/modulePermissionsService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock environment variable
const originalEnv = process.env;

describe('modulePermissionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, REACT_APP_DATA_API_URL: 'http://localhost:3000' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('fetchModulePermissionsFromApi', () => {
    it('should fetch module permissions successfully with new API format', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            key: 'module_permissions',
            value: {
              csvData: [
                'Id|Module|Submodules|PermissionNames',
                '1|Data Management|["Data Entry","Data Import"]|[["create","read"],["import","export"]]',
                '2|Budgeting|["Budget Planning","Forecasting"]|[["create","update"],["view","approve"]]'
              ]
            }
          }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/data/Data/ExecuteSqlQueries',
        expect.objectContaining({
          executeInParallel: true,
          sqlQueries: expect.arrayContaining([
            expect.objectContaining({
              name: 'module_permissions',
              query: expect.objectContaining({
                databaseId: '09d8e037-0005-4887-abde-112a529de2b8'
              })
            })
          ])
        })
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        module: 'Data Management',
        submodules: {
          'Data Entry': ['create', 'read'],
          'Data Import': ['import', 'export']
        },
        permission_names: {}
      });
      expect(result[1]).toEqual({
        id: 2,
        module: 'Budgeting',
        submodules: {
          'Budget Planning': ['create', 'update'],
          'Forecasting': ['view', 'approve']
        },
        permission_names: {}
      });
    });

    it('should handle fallback to older API format with sqlResults', async () => {
      const mockResponse = {
        data: {
          sqlResults: [{
            records: [
              {
                id: 1,
                module: 'Data Management',
                submodules: { 'Data Entry': ['create', 'read'] },
                permission_names: {}
              }
            ]
          }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        module: 'Data Management',
        submodules: { 'Data Entry': ['create', 'read'] },
        permission_names: {}
      });
    });

    it('should handle fallback to older API format with results', async () => {
      const mockResponse = {
        data: {
          results: [{
            records: [
              {
                id: 1,
                module: 'Data Management',
                submodules: { 'Data Entry': ['create', 'read'] },
                permission_names: {}
              }
            ]
          }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        module: 'Data Management',
        submodules: { 'Data Entry': ['create', 'read'] },
        permission_names: {}
      });
    });

    it('should handle fallback to older API format with records', async () => {
      const mockResponse = {
        data: {
          records: [
            {
              id: 1,
              module: 'Data Management',
              submodules: { 'Data Entry': ['create', 'read'] },
              permission_names: {}
            }
          ]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        module: 'Data Management',
        submodules: { 'Data Entry': ['create', 'read'] },
        permission_names: {}
      });
    });

    it('should handle empty CSV data', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            key: 'module_permissions',
            value: {
              csvData: ['Id|Module|Submodules|PermissionNames']
            }
          }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(0);
    });

    it('should handle missing CSV data', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            key: 'module_permissions',
            value: {}
          }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedAxios.post.mockRejectedValue(error);

      await expect(fetchModulePermissionsFromApi()).rejects.toThrow('API Error');
    });

    it('should handle malformed JSON in CSV data', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            key: 'module_permissions',
            value: {
              csvData: [
                'Id|Module|Submodules|PermissionNames',
                '1|Data Management|invalid-json|[["create","read"]]'
              ]
            }
          }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].submodules).toEqual({});
    });

    it('should handle empty JSON arrays', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            key: 'module_permissions',
            value: {
              csvData: [
                'Id|Module|Submodules|PermissionNames',
                '1|Data Management|[]|[]'
              ]
            }
          }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].submodules).toEqual({});
    });

    it('should handle mismatched array lengths', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            key: 'module_permissions',
            value: {
              csvData: [
                'Id|Module|Submodules|PermissionNames',
                '1|Data Management|["Data Entry","Data Import"]|[["create","read"]]'
              ]
            }
          }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].submodules).toEqual({
        'Data Entry': ['create', 'read']
      });
    });
  });

  describe('transformModulePermissionsToLayoutFormat', () => {
    it('should transform module permissions to layout format', () => {
      const mockData: ModulePermissionsModel[] = [
        {
          id: 1,
          module: 'Data Management',
          submodules: {
            'Data Entry': ['create', 'read'],
            'Data Import': ['import', 'export']
          },
          permission_names: {}
        },
        {
          id: 2,
          module: 'Budgeting',
          submodules: {
            'Budget Planning': ['create', 'update'],
            'Forecasting': ['view', 'approve']
          },
          permission_names: {}
        }
      ];

      const result = transformModulePermissionsToLayoutFormat(mockData);

      expect(result).toEqual({
        'Data Management': {
          submodules: {
            'Data Entry': ['create', 'read'],
            'Data Import': ['import', 'export']
          }
        },
        'Budgeting': {
          submodules: {
            'Budget Planning': ['create', 'update'],
            'Forecasting': ['view', 'approve']
          }
        }
      });
    });

    it('should handle empty array', () => {
      const result = transformModulePermissionsToLayoutFormat([]);
      expect(result).toEqual({});
    });

    it('should handle modules with empty submodules', () => {
      const mockData: ModulePermissionsModel[] = [
        {
          id: 1,
          module: 'Data Management',
          submodules: {},
          permission_names: {}
        }
      ];

      const result = transformModulePermissionsToLayoutFormat(mockData);

      expect(result).toEqual({
        'Data Management': {
          submodules: {}
        }
      });
    });

    it('should handle modules with null submodules', () => {
      const mockData: ModulePermissionsModel[] = [
        {
          id: 1,
          module: 'Data Management',
          submodules: null as any,
          permission_names: {}
        }
      ];

      const result = transformModulePermissionsToLayoutFormat(mockData);

      expect(result).toEqual({
        'Data Management': {
          submodules: {}
        }
      });
    });

    it('should handle modules with undefined submodules', () => {
      const mockData: ModulePermissionsModel[] = [
        {
          id: 1,
          module: 'Data Management',
          submodules: undefined as any,
          permission_names: {}
        }
      ];

      const result = transformModulePermissionsToLayoutFormat(mockData);

      expect(result).toEqual({
        'Data Management': {
          submodules: {}
        }
      });
    });

    it('should handle duplicate module names', () => {
      const mockData: ModulePermissionsModel[] = [
        {
          id: 1,
          module: 'Data Management',
          submodules: { 'Data Entry': ['create'] },
          permission_names: {}
        },
        {
          id: 2,
          module: 'Data Management',
          submodules: { 'Data Import': ['import'] },
          permission_names: {}
        }
      ];

      const result = transformModulePermissionsToLayoutFormat(mockData);

      // The second module should overwrite the first one
      expect(result).toEqual({
        'Data Management': {
          submodules: { 'Data Import': ['import'] }
        }
      });
    });
  });

  describe('CSV parsing edge cases', () => {
    it('should handle quoted values in CSV', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            key: 'module_permissions',
            value: {
              csvData: [
                'Id|Module|Submodules|PermissionNames',
                "'1'|'Data Management'|'[\"Data Entry\"]'|'[[\"create\",\"read\"]]'"
              ]
            }
          }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        module: 'Data Management',
        submodules: { 'Data Entry': ['create', 'read'] },
        permission_names: {}
      });
    });

    it('should handle unquoted values in CSV', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            key: 'module_permissions',
            value: {
              csvData: [
                'Id|Module|Submodules|PermissionNames',
                '1|Data Management|["Data Entry"]|[["create","read"]]'
              ]
            }
          }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        module: 'Data Management',
        submodules: { 'Data Entry': ['create', 'read'] },
        permission_names: {}
      });
    });

    it('should handle missing columns in CSV', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            key: 'module_permissions',
            value: {
              csvData: [
                'Id|Module|Submodules|PermissionNames',
                '1|Data Management'
              ]
            }
          }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        module: 'Data Management',
        submodules: {},
        permission_names: {}
      });
    });
  });
});
