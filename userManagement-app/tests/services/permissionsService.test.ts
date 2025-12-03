import {
  fetchModulePermissionsFromApi,
  transformPermissionsForTable,
  ModulePermissionsDto,
  ModulePermissionsModel
} from '../../src/services/permissionsService';
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

describe('permissionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('fetchModulePermissionsFromApi', () => {
    it('should fetch and parse module permissions successfully', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|Admin|["sub1","sub2"]|["read","write"]',
        '2|User|["sub3"]|["read"]'
      ];

      const mockQueryConfig = {
        name: 'module_permissions',
        query: {
          databaseId: 'test-id',
          columns: [],
          tables: ['module_permissions'],
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

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'Admin',
          Submodules: '["sub1","sub2"]',
          PermissionNames: '["read","write"]'
        },
        {
          Id: 2,
          Module: 'User',
          Submodules: '["sub3"]',
          PermissionNames: '["read"]'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue(mockQueryConfig);
      mockedCreateApiPayload.mockReturnValue(mockPayload);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      expect(mockedCreateSqlQueryConfig).toHaveBeenCalledWith(
        'module_permissions',
        'module_permissions',
        expect.any(Array)
      );
      expect(mockedCreateApiPayload).toHaveBeenCalledWith([mockQueryConfig]);
      expect(mockedMakeDataApiCall).toHaveBeenCalledWith(mockPayload);
      expect(mockedParseCsvToDtos).toHaveBeenCalledWith(
        mockCsvData,
        {
          Id: 'Id',
          Module: 'Module',
          Submodules: 'Submodules',
          PermissionNames: 'PermissionNames'
        },
        expect.any(Function)
      );

      expect(result).toEqual([
        {
          id: '1',
          module: 'Admin',
          submodules: ['sub1', 'sub2'],
          permissionNames: ['read', 'write']
        },
        {
          id: '2',
          module: 'User',
          submodules: ['sub3'],
          permissionNames: ['read']
        }
      ]);
    });

    it('should handle parseCsvToDtos callback with all fields populated', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|Admin|["sub1"]|["read"]'
      ];

      const mockQueryConfig = { name: 'test' };
      const mockPayload = { sqlQueries: [mockQueryConfig] };

      mockedCreateSqlQueryConfig.mockReturnValue(mockQueryConfig);
      mockedCreateApiPayload.mockReturnValue(mockPayload);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);

      // Capture the callback function passed to parseCsvToDtos
      let capturedCallback: ((rowData: any) => ModulePermissionsDto) | null = null;
      mockedParseCsvToDtos.mockImplementation((csvData, headerMapping, callback) => {
        capturedCallback = callback;
        return [];
      });

      await fetchModulePermissionsFromApi();

      expect(capturedCallback).not.toBeNull();
      
      // Test the callback with all fields populated (lines 82-86)
      const rowData = {
        Id: '5',
        Module: 'TestModule',
        Submodules: '["sub1","sub2"]',
        PermissionNames: '["perm1","perm2"]'
      };

      const result = capturedCallback!(rowData);
      expect(result).toEqual({
        Id: 5,
        Module: 'TestModule',
        Submodules: '["sub1","sub2"]',
        PermissionNames: '["perm1","perm2"]'
      });
    });

    it('should handle parseCsvToDtos callback with undefined/null fields', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|Admin|["sub1"]|["read"]'
      ];

      const mockQueryConfig = { name: 'test' };
      const mockPayload = { sqlQueries: [mockQueryConfig] };

      mockedCreateSqlQueryConfig.mockReturnValue(mockQueryConfig);
      mockedCreateApiPayload.mockReturnValue(mockPayload);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);

      let capturedCallback: ((rowData: any) => ModulePermissionsDto) | null = null;
      mockedParseCsvToDtos.mockImplementation((csvData, headerMapping, callback) => {
        capturedCallback = callback;
        return [];
      });

      await fetchModulePermissionsFromApi();

      // Test the callback with undefined/null fields (lines 82-86)
      const rowData = {
        Id: undefined,
        Module: null,
        Submodules: undefined,
        PermissionNames: null
      };

      const result = capturedCallback!(rowData);
      expect(result).toEqual({
        Id: 0,
        Module: '',
        Submodules: '[]',
        PermissionNames: '[]'
      });
    });

    it('should handle mapDtoToModel with valid JSON arrays', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|Admin|["sub1","sub2"]|["read","write"]'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'Admin',
          Submodules: '["sub1","sub2"]',
          PermissionNames: '["read","write"]'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({ name: 'test' });
      mockedCreateApiPayload.mockReturnValue({ sqlQueries: [] });
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      // Verify safeJsonParse was called and returned arrays (lines 44-45, 29-32)
      expect(result[0].submodules).toEqual(['sub1', 'sub2']);
      expect(result[0].permissionNames).toEqual(['read', 'write']);
    });

    it('should handle mapDtoToModel with empty JSON strings', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|Admin|[]|[]'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'Admin',
          Submodules: '[]',
          PermissionNames: '[]'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({ name: 'test' });
      mockedCreateApiPayload.mockReturnValue({ sqlQueries: [] });
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      expect(result[0].submodules).toEqual([]);
      expect(result[0].permissionNames).toEqual([]);
    });

    it('should handle mapDtoToModel with invalid JSON strings', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|Admin|invalid json|also invalid'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'Admin',
          Submodules: 'invalid json',
          PermissionNames: 'also invalid'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({ name: 'test' });
      mockedCreateApiPayload.mockReturnValue({ sqlQueries: [] });
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      // Should return fallback empty arrays and log warnings (lines 35, 37)
      expect(result[0].submodules).toEqual([]);
      expect(result[0].permissionNames).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to parse submodules JSON:',
        'invalid json'
      );
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to parse permission names JSON:',
        'also invalid'
      );
    });

    it('should handle mapDtoToModel with non-array JSON', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|Admin|{"key":"value"}|{"key":"value"}'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'Admin',
          Submodules: '{"key":"value"}',
          PermissionNames: '{"key":"value"}'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({ name: 'test' });
      mockedCreateApiPayload.mockReturnValue({ sqlQueries: [] });
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      // Should return fallback empty arrays when parsed value is not an array (line 32)
      expect(result[0].submodules).toEqual([]);
      expect(result[0].permissionNames).toEqual([]);
    });

    it('should handle mapDtoToModel with empty string JSON', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|Admin||'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'Admin',
          Submodules: '',
          PermissionNames: ''
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({ name: 'test' });
      mockedCreateApiPayload.mockReturnValue({ sqlQueries: [] });
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      // Should return fallback empty arrays for empty strings (line 30 check)
      expect(result[0].submodules).toEqual([]);
      expect(result[0].permissionNames).toEqual([]);
    });

    it('should handle mapDtoToModel with undefined Module field', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1||[]|[]'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: undefined as any,
          Submodules: '[]',
          PermissionNames: '[]'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({ name: 'test' });
      mockedCreateApiPayload.mockReturnValue({ sqlQueries: [] });
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      // Should use empty string fallback for undefined Module (line 49)
      expect(result[0].module).toBe('');
    });

    it('should return empty array when csvData is not an array', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({ name: 'test' });
      mockedCreateApiPayload.mockReturnValue({ sqlQueries: [] });
      mockedMakeDataApiCall.mockResolvedValue('not an array' as any);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should return empty array when csvData length is 1 or less', async () => {
      const mockCsvData = ['Id|Module|Submodules|PermissionNames'];

      mockedCreateSqlQueryConfig.mockReturnValue({ name: 'test' });
      mockedCreateApiPayload.mockReturnValue({ sqlQueries: [] });
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);

      const result = await fetchModulePermissionsFromApi();

      // Should not enter the if block (line 72), so parseCsvToDtos should not be called
      expect(mockedParseCsvToDtos).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return empty array when csvData length is exactly 1', async () => {
      const mockCsvData = ['Id|Module|Submodules|PermissionNames'];

      mockedCreateSqlQueryConfig.mockReturnValue({ name: 'test' });
      mockedCreateApiPayload.mockReturnValue({ sqlQueries: [] });
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle API call errors gracefully', async () => {
      const error = new Error('API call failed');
      mockedCreateSqlQueryConfig.mockReturnValue({ name: 'test' });
      mockedCreateApiPayload.mockReturnValue({ sqlQueries: [] });
      mockedMakeDataApiCall.mockRejectedValue(error);

      const result = await fetchModulePermissionsFromApi();

      // Should catch error and return empty array (lines 95-96)
      expect(console.error).toHaveBeenCalledWith(
        'fetchModulePermissionsFromApi: API call failed:',
        error
      );
      expect(result).toEqual([]);
    });

    it('should handle errors with non-Error objects', async () => {
      const error = 'String error';
      mockedCreateSqlQueryConfig.mockReturnValue({ name: 'test' });
      mockedCreateApiPayload.mockReturnValue({ sqlQueries: [] });
      mockedMakeDataApiCall.mockRejectedValue(error);

      const result = await fetchModulePermissionsFromApi();

      expect(console.error).toHaveBeenCalledWith(
        'fetchModulePermissionsFromApi: API call failed:',
        error
      );
      expect(result).toEqual([]);
    });
  });

  describe('transformPermissionsForTable', () => {
    it('should transform permissions with submodules', () => {
      const permissions: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'Admin',
          submodules: ['sub1', 'sub2'],
          permissionNames: ['read', 'write']
        }
      ];

      const result = transformPermissionsForTable(permissions);

      expect(result).toEqual([
        {
          modules: 'Admin',
          subModule: 'sub1',
          permissions: 'read, write',
          originalData: permissions[0]
        },
        {
          modules: 'Admin',
          subModule: 'sub2',
          permissions: 'read, write',
          originalData: permissions[0]
        }
      ]);
    });

    it('should transform permissions without submodules', () => {
      const permissions: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'Admin',
          submodules: [],
          permissionNames: ['read', 'write']
        }
      ];

      const result = transformPermissionsForTable(permissions);

      expect(result).toEqual([
        {
          modules: 'Admin',
          subModule: 'Admin',
          permissions: 'read, write',
          originalData: permissions[0]
        }
      ]);
    });

    it('should handle empty permission names', () => {
      const permissions: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'Admin',
          submodules: ['sub1'],
          permissionNames: []
        }
      ];

      const result = transformPermissionsForTable(permissions);

      expect(result).toEqual([
        {
          modules: 'Admin',
          subModule: 'sub1',
          permissions: '',
          originalData: permissions[0]
        }
      ]);
    });
  });
});

