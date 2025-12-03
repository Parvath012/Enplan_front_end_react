import { 
  fetchModulePermissionsFromApi, 
  transformPermissionsForTable,
  ModulePermissionsDto,
  ModulePermissionsModel 
} from '../permissionsService';
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
        '1|User Management|["Create User","Edit User"]|["create","edit"]',
        '2|Budget Management|["Create Budget","View Budget"]|["create","view"]'
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
          Module: 'User Management',
          Submodules: '["Create User","Edit User"]',
          PermissionNames: '["create","edit"]'
        },
        {
          Id: 2,
          Module: 'Budget Management',
          Submodules: '["Create Budget","View Budget"]',
          PermissionNames: '["create","view"]'
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
        expect.arrayContaining([
          expect.objectContaining({ dboName: 'module_permissions', columnName: 'id', aliasName: 'Id' }),
          expect.objectContaining({ dboName: 'module_permissions', columnName: 'module', aliasName: 'Module' }),
          expect.objectContaining({ dboName: 'module_permissions', columnName: 'submodules', aliasName: 'Submodules' }),
          expect.objectContaining({ dboName: 'module_permissions', columnName: 'permission_names', aliasName: 'PermissionNames' })
        ])
      );

      expect(mockedCreateApiPayload).toHaveBeenCalledWith([mockQueryConfig]);
      expect(mockedMakeDataApiCall).toHaveBeenCalledWith(mockPayload);
      expect(mockedParseCsvToDtos).toHaveBeenCalledWith(
        mockCsvData,
        expect.objectContaining({
          Id: 'Id',
          Module: 'Module',
          Submodules: 'Submodules',
          PermissionNames: 'PermissionNames'
        }),
        expect.any(Function)
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        module: 'User Management',
        submodules: ['Create User', 'Edit User'],
        permissionNames: ['create', 'edit']
      });
      expect(result[1]).toEqual({
        id: '2',
        module: 'Budget Management',
        submodules: ['Create Budget', 'View Budget'],
        permissionNames: ['create', 'view']
      });
    });

    it('should return empty array when no valid CSV data is returned', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue([]);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should return empty array when CSV data has only header row', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle API call errors gracefully', async () => {
      const mockError = new Error('API call failed');
      
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockRejectedValue(mockError);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('fetchModulePermissionsFromApi: API call failed:', mockError);
    });

    it('should handle parsing errors gracefully', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|User Management|["Create User"]|["create"]'
      ];

      const mockError = new Error('Parsing failed');
      
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockImplementation(() => {
        throw mockError;
      });

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('fetchModulePermissionsFromApi: API call failed:', mockError);
    });

    it('should handle invalid JSON in submodules with warning', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|User Management|invalid-json|["create"]'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'User Management',
          Submodules: 'invalid-json',
          PermissionNames: '["create"]'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].submodules).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('Failed to parse submodules JSON:', 'invalid-json');
    });

    it('should handle invalid JSON in permission names with warning', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|User Management|["Create User"]|invalid-json'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'User Management',
          Submodules: '["Create User"]',
          PermissionNames: 'invalid-json'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].permissionNames).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('Failed to parse permission names JSON:', 'invalid-json');
    });

    it('should handle empty JSON strings', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|User Management||'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'User Management',
          Submodules: '',
          PermissionNames: ''
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].submodules).toEqual([]);
      expect(result[0].permissionNames).toEqual([]);
    });

    it('should handle null JSON strings', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|User Management|null|null'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'User Management',
          Submodules: 'null',
          PermissionNames: 'null'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].submodules).toEqual([]);
      expect(result[0].permissionNames).toEqual([]);
    });

    it('should handle undefined JSON strings', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|User Management|undefined|undefined'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'User Management',
          Submodules: 'undefined',
          PermissionNames: 'undefined'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].submodules).toEqual([]);
      expect(result[0].permissionNames).toEqual([]);
    });

    it('should handle non-array JSON parsing results', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|User Management|{"not":"array"}|{"also":"not array"}'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'User Management',
          Submodules: '{"not":"array"}',
          PermissionNames: '{"also":"not array"}'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].submodules).toEqual([]);
      expect(result[0].permissionNames).toEqual([]);
    });

    it('should handle valid JSON arrays', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|User Management|["Create User","Edit User","Delete User"]|["create","edit","delete","view"]'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'User Management',
          Submodules: '["Create User","Edit User","Delete User"]',
          PermissionNames: '["create","edit","delete","view"]'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].submodules).toEqual(['Create User', 'Edit User', 'Delete User']);
      expect(result[0].permissionNames).toEqual(['create', 'edit', 'delete', 'view']);
    });

    it('should handle empty JSON arrays', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|User Management|[]|[]'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'User Management',
          Submodules: '[]',
          PermissionNames: '[]'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].submodules).toEqual([]);
      expect(result[0].permissionNames).toEqual([]);
    });

    it('should handle CSV data with non-array response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue('not an array');

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle CSV data with single element array', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(['single element']);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle CSV data with null response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(null);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle CSV data with undefined response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(undefined);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle CSV data with empty string response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue('');

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle CSV data with number response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(123);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle CSV data with object response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue({ data: 'test' });

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle CSV data with boolean response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(true);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle CSV data with function response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(() => {});

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle CSV data with symbol response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(Symbol('test'));

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle CSV data with bigint response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(BigInt(123));

      const result = await fetchModulePermissionsFromApi();

      expect(result).toEqual([]);
    });

    it('should handle CSV data with exactly 2 rows (header + 1 data)', async () => {
      const mockCsvData = [
        'Id|Module|Submodules|PermissionNames',
        '1|User Management|["Create User"]|["create"]'
      ];

      const mockParsedDtos: ModulePermissionsDto[] = [
        {
          Id: 1,
          Module: 'User Management',
          Submodules: '["Create User"]',
          PermissionNames: '["create"]'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchModulePermissionsFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('transformPermissionsForTable', () => {
    const mockPermissions: ModulePermissionsModel[] = [
      {
        id: '1',
        module: 'User Management',
        submodules: ['Create User', 'Edit User'],
        permissionNames: ['create', 'edit']
      },
      {
        id: '2',
        module: 'Budget Management',
        submodules: [],
        permissionNames: ['view']
      },
      {
        id: '3',
        module: 'Report Management',
        submodules: ['Generate Report', 'Export Report', 'Schedule Report'],
        permissionNames: ['generate', 'export', 'schedule']
      }
    ];

    it('should transform permissions with submodules correctly', () => {
      const result = transformPermissionsForTable(mockPermissions);

      expect(result).toHaveLength(5); // 2 + 0 + 3 submodules
      expect(result[0]).toEqual({
        modules: 'User Management',
        subModule: 'Create User',
        permissions: 'create, edit',
        originalData: mockPermissions[0]
      });
      expect(result[1]).toEqual({
        modules: 'User Management',
        subModule: 'Edit User',
        permissions: 'create, edit',
        originalData: mockPermissions[0]
      });
    });

    it('should handle modules without submodules', () => {
      const result = transformPermissionsForTable(mockPermissions);

      expect(result[2]).toEqual({
        modules: 'Budget Management',
        subModule: 'Budget Management',
        permissions: 'view',
        originalData: mockPermissions[1]
      });
    });

    it('should handle modules with multiple submodules', () => {
      const result = transformPermissionsForTable(mockPermissions);

      expect(result[3]).toEqual({
        modules: 'Report Management',
        subModule: 'Generate Report',
        permissions: 'generate, export, schedule',
        originalData: mockPermissions[2]
      });
      expect(result[4]).toEqual({
        modules: 'Report Management',
        subModule: 'Export Report',
        permissions: 'generate, export, schedule',
        originalData: mockPermissions[2]
      });
    });

    it('should handle empty permissions array', () => {
      const result = transformPermissionsForTable([]);

      expect(result).toEqual([]);
    });

    it('should handle permissions with empty submodules', () => {
      const permissionsWithEmptySubmodules: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'User Management',
          submodules: [],
          permissionNames: ['create']
        }
      ];

      const result = transformPermissionsForTable(permissionsWithEmptySubmodules);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        modules: 'User Management',
        subModule: 'User Management',
        permissions: 'create',
        originalData: permissionsWithEmptySubmodules[0]
      });
    });

    it('should handle permissions with empty permission names', () => {
      const permissionsWithEmptyPermissions: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'User Management',
          submodules: ['Create User'],
          permissionNames: []
        }
      ];

      const result = transformPermissionsForTable(permissionsWithEmptyPermissions);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        modules: 'User Management',
        subModule: 'Create User',
        permissions: '',
        originalData: permissionsWithEmptyPermissions[0]
      });
    });

    it('should handle permissions with single submodule and single permission', () => {
      const singlePermission: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'User Management',
          submodules: ['Create User'],
          permissionNames: ['create']
        }
      ];

      const result = transformPermissionsForTable(singlePermission);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        modules: 'User Management',
        subModule: 'Create User',
        permissions: 'create',
        originalData: singlePermission[0]
      });
    });

    it('should handle permissions with multiple submodules and multiple permissions', () => {
      const multiplePermissions: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'User Management',
          submodules: ['Create User', 'Edit User', 'Delete User', 'View User'],
          permissionNames: ['create', 'edit', 'delete', 'view', 'approve']
        }
      ];

      const result = transformPermissionsForTable(multiplePermissions);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        modules: 'User Management',
        subModule: 'Create User',
        permissions: 'create, edit, delete, view, approve',
        originalData: multiplePermissions[0]
      });
      expect(result[1]).toEqual({
        modules: 'User Management',
        subModule: 'Edit User',
        permissions: 'create, edit, delete, view, approve',
        originalData: multiplePermissions[0]
      });
      expect(result[2]).toEqual({
        modules: 'User Management',
        subModule: 'Delete User',
        permissions: 'create, edit, delete, view, approve',
        originalData: multiplePermissions[0]
      });
      expect(result[3]).toEqual({
        modules: 'User Management',
        subModule: 'View User',
        permissions: 'create, edit, delete, view, approve',
        originalData: multiplePermissions[0]
      });
    });

    it('should handle permissions with special characters in module names', () => {
      const specialCharPermissions: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'User & Role Management',
          submodules: ['Create User', 'Edit Role'],
          permissionNames: ['create', 'edit']
        }
      ];

      const result = transformPermissionsForTable(specialCharPermissions);

      expect(result).toHaveLength(2);
      expect(result[0].modules).toBe('User & Role Management');
      expect(result[1].modules).toBe('User & Role Management');
    });

    it('should handle permissions with special characters in submodule names', () => {
      const specialCharPermissions: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'User Management',
          submodules: ['Create & Edit User', 'Delete & Archive User'],
          permissionNames: ['create', 'edit', 'delete']
        }
      ];

      const result = transformPermissionsForTable(specialCharPermissions);

      expect(result).toHaveLength(2);
      expect(result[0].subModule).toBe('Create & Edit User');
      expect(result[1].subModule).toBe('Delete & Archive User');
    });

    it('should handle permissions with special characters in permission names', () => {
      const specialCharPermissions: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'User Management',
          submodules: ['Create User'],
          permissionNames: ['create_user', 'edit_user', 'delete_user', 'view_user']
        }
      ];

      const result = transformPermissionsForTable(specialCharPermissions);

      expect(result).toHaveLength(1);
      expect(result[0].permissions).toBe('create_user, edit_user, delete_user, view_user');
    });

    it('should handle permissions with empty strings in arrays', () => {
      const emptyStringPermissions: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'User Management',
          submodules: ['Create User', '', 'Edit User'],
          permissionNames: ['create', '', 'edit']
        }
      ];

      const result = transformPermissionsForTable(emptyStringPermissions);

      expect(result).toHaveLength(3);
      expect(result[0].subModule).toBe('Create User');
      expect(result[1].subModule).toBe('');
      expect(result[2].subModule).toBe('Edit User');
      expect(result[0].permissions).toBe('create, , edit');
    });

    it('should handle permissions with null/undefined values in arrays', () => {
      const nullPermissions: ModulePermissionsModel[] = [
        {
          id: '1',
          module: 'User Management',
          submodules: ['Create User', null as any, 'Edit User'],
          permissionNames: ['create', undefined as any, 'edit']
        }
      ];

      const result = transformPermissionsForTable(nullPermissions);

      expect(result).toHaveLength(3);
      expect(result[0].subModule).toBe('Create User');
      expect(result[1].subModule).toBe(null);
      expect(result[2].subModule).toBe('Edit User');
      expect(result[0].permissions).toBe('create, undefined, edit');
    });
  });
});