import { fetchRolesFromApi, RoleDto } from '../../src/services/roleFetchService';
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
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

describe('roleFetchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('fetchRolesFromApi', () => {
    it('should fetch and parse roles successfully', async () => {
      const mockCsvData = [
        'Id|RoleName|Department|RoleDescription|Status|ParentAttribute|Permissions|CreatedAt|LastUpdatedAt|IsEnabled|CreatedBy|UpdatedBy|SoftDelete|IsLocked|LockedBy|LockedDate',
        '1|Admin|IT|Administrator role|Active|["Region","Country"]|{"enabledModules":["Module1"]}|2023-01-01|2023-01-02|true|Admin|Admin|false|false||',
        '2|User|HR|User role|Active|["Region"]|{"enabledModules":["Module2"]}|2023-01-01||true|Admin||false|false||'
      ];

      const mockQueryConfig = {
        name: 'role',
        query: {
          databaseId: 'test-id',
          columns: [],
          tables: ['role'],
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

      const mockParsedDtos: RoleDto[] = [
        {
          Id: '1',
          RoleName: 'Admin',
          Department: 'IT',
          RoleDescription: 'Administrator role',
          Status: 'Active',
          ParentAttribute: ['Region', 'Country'],
          Permissions: { enabledModules: ['Module1'] },
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsEnabled: true,
          CreatedBy: 'Admin',
          UpdatedBy: 'Admin',
          SoftDelete: false,
          IsLocked: false,
          LockedBy: undefined,
          LockedDate: undefined
        },
        {
          Id: '2',
          RoleName: 'User',
          Department: 'HR',
          RoleDescription: 'User role',
          Status: 'Active',
          ParentAttribute: ['Region'],
          Permissions: { enabledModules: ['Module2'] },
          CreatedAt: '2023-01-01',
          LastUpdatedAt: undefined,
          IsEnabled: true,
          CreatedBy: 'Admin',
          UpdatedBy: undefined,
          SoftDelete: false,
          IsLocked: false,
          LockedBy: undefined,
          LockedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue(mockQueryConfig);
      mockedCreateApiPayload.mockReturnValue(mockPayload);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchRolesFromApi();

      expect(mockedCreateSqlQueryConfig).toHaveBeenCalledWith(
        'role',
        'role',
        expect.arrayContaining([
          expect.objectContaining({ dboName: 'role', columnName: 'id', aliasName: 'Id' }),
          expect.objectContaining({ dboName: 'role', columnName: 'rolename', aliasName: 'RoleName' })
        ]),
        expect.objectContaining({
          conditionOperator: 0,
          filters: expect.arrayContaining([
            expect.objectContaining({
              propertyName: 'softdelete',
              value: false
            })
          ])
        }),
        expect.arrayContaining([
          { columnName: 'status', sortType: 1 },
          { columnName: 'rolename', sortType: 1 }
        ])
      );

      expect(mockedCreateApiPayload).toHaveBeenCalledWith([mockQueryConfig]);
      expect(mockedMakeDataApiCall).toHaveBeenCalledWith(mockPayload);
      expect(mockedParseCsvToDtos).toHaveBeenCalled();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        rolename: 'Admin',
        department: 'IT',
        roledescription: 'Administrator role',
        status: 'Active',
        parentattribute: ['Region', 'Country'],
        permissions: { enabledModules: ['Module1'] },
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        isenabled: true,
        createdby: 'Admin',
        updatedby: 'Admin',
        softdelete: false,
        islocked: false,
        lockedby: undefined,
        lockeddate: undefined
      });
    });

    it('should return empty array when no valid CSV data is returned', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue([]);

      const result = await fetchRolesFromApi();

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('fetchRolesFromApi: No valid data returned. CSV data:', []);
    });

    it('should return empty array when CSV data has only header row', async () => {
      const mockCsvData = [
        'Id|RoleName|Department|RoleDescription|Status|ParentAttribute|Permissions|CreatedAt|LastUpdatedAt|IsEnabled|CreatedBy|UpdatedBy|SoftDelete|IsLocked|LockedBy|LockedDate'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);

      const result = await fetchRolesFromApi();

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('fetchRolesFromApi: No valid data returned. CSV data:', mockCsvData);
    });

    it('should handle API call errors gracefully', async () => {
      const mockError = new Error('API call failed');
      
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockRejectedValue(mockError);

      await expect(fetchRolesFromApi()).rejects.toThrow('API call failed');
      expect(console.error).toHaveBeenCalledWith('fetchRolesFromApi: Error fetching roles:', mockError);
    });

    it('should handle nullish coalescing in DTO mapping', async () => {
      const mockCsvData = [
        'Id|RoleName|Department|RoleDescription|Status|ParentAttribute|Permissions|CreatedAt|LastUpdatedAt|IsEnabled|CreatedBy|UpdatedBy|SoftDelete|IsLocked|LockedBy|LockedDate',
        '1|Admin||Administrator role|Active|{}|{}|2023-01-01||true|Admin||false|false||'
      ];

      const mockParsedDtos: RoleDto[] = [
        {
          Id: '1',
          RoleName: 'Admin',
          Department: undefined,
          RoleDescription: 'Administrator role',
          Status: 'Active',
          ParentAttribute: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: undefined,
          IsEnabled: true,
          CreatedBy: 'Admin',
          UpdatedBy: undefined,
          SoftDelete: false,
          IsLocked: false,
          LockedBy: undefined,
          LockedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchRolesFromApi();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        rolename: 'Admin',
        department: undefined,
        roledescription: 'Administrator role',
        status: 'Active',
        parentattribute: {},
        permissions: {},
        createdat: '2023-01-01',
        lastupdatedat: undefined,
        isenabled: true,
        createdby: 'Admin',
        updatedby: undefined,
        softdelete: false,
        islocked: false,
        lockedby: undefined,
        lockeddate: undefined
      });
    });

    it('should log parsed DTOs and mapped models', async () => {
      const mockCsvData = [
        'Id|RoleName|Department|RoleDescription|Status|ParentAttribute|Permissions|CreatedAt|LastUpdatedAt|IsEnabled|CreatedBy|UpdatedBy|SoftDelete|IsLocked|LockedBy|LockedDate',
        '1|Admin|IT|Administrator role|Active|{}|{}|2023-01-01|2023-01-02|true|Admin|Admin|false|false||'
      ];

      const mockParsedDtos: RoleDto[] = [
        {
          Id: '1',
          RoleName: 'Admin',
          Department: 'IT',
          RoleDescription: 'Administrator role',
          Status: 'Active',
          ParentAttribute: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsEnabled: true,
          CreatedBy: 'Admin',
          UpdatedBy: 'Admin',
          SoftDelete: false,
          IsLocked: false,
          LockedBy: undefined,
          LockedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      await fetchRolesFromApi();

      expect(console.log).toHaveBeenCalledWith('fetchRolesFromApi: Query config:', expect.any(String));
      expect(console.log).toHaveBeenCalledWith('fetchRolesFromApi: API payload:', expect.any(String));
      expect(console.log).toHaveBeenCalledWith('fetchRolesFromApi: Raw CSV data:', mockCsvData);
      expect(console.log).toHaveBeenCalledWith('fetchRolesFromApi: CSV data type:', 'object');
      expect(console.log).toHaveBeenCalledWith('fetchRolesFromApi: Is array:', true);
      expect(console.log).toHaveBeenCalledWith('fetchRolesFromApi: Array length:', 2);
      expect(console.log).toHaveBeenCalledWith('fetchRolesFromApi: parsed DTOs:', mockParsedDtos);
      expect(console.log).toHaveBeenCalledWith('fetchRolesFromApi: mapped models:', expect.any(Array));
      expect(console.log).toHaveBeenCalledWith('fetchRolesFromApi: Total roles fetched:', 1);
    });

    it('should handle CSV data with exactly 2 rows (header + 1 data)', async () => {
      const mockCsvData = [
        'Id|RoleName|Department|RoleDescription|Status|ParentAttribute|Permissions|CreatedAt|LastUpdatedAt|IsEnabled|CreatedBy|UpdatedBy|SoftDelete|IsLocked|LockedBy|LockedDate',
        '1|Admin|IT|Administrator role|Active|{}|{}|2023-01-01|2023-01-02|true|Admin|Admin|false|false||'
      ];

      const mockParsedDtos: RoleDto[] = [
        {
          Id: '1',
          RoleName: 'Admin',
          Department: 'IT',
          RoleDescription: 'Administrator role',
          Status: 'Active',
          ParentAttribute: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsEnabled: true,
          CreatedBy: 'Admin',
          UpdatedBy: 'Admin',
          SoftDelete: false,
          IsLocked: false,
          LockedBy: undefined,
          LockedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchRolesFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should handle CSV data with non-array response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue('not an array' as any);

      const result = await fetchRolesFromApi();

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('fetchRolesFromApi: No valid data returned. CSV data:', 'not an array');
    });

    it('should handle CSV data with single element array', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(['single element']);

      const result = await fetchRolesFromApi();

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('fetchRolesFromApi: No valid data returned. CSV data:', ['single element']);
    });

    it('should handle CSV data with null response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(null as any);

      const result = await fetchRolesFromApi();

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('fetchRolesFromApi: No valid data returned. CSV data:', null);
    });

    it('should handle CSV data with undefined response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(undefined as any);

      const result = await fetchRolesFromApi();

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('fetchRolesFromApi: No valid data returned. CSV data:', undefined);
    });

    it('should handle boolean parsing in DTO mapping', async () => {
      const mockCsvData = [
        'Id|RoleName|Department|RoleDescription|Status|ParentAttribute|Permissions|CreatedAt|LastUpdatedAt|IsEnabled|CreatedBy|UpdatedBy|SoftDelete|IsLocked|LockedBy|LockedDate',
        '1|Admin|IT|Administrator role|Active|{}|{}|2023-01-01|2023-01-02|true|Admin|Admin|false|false||',
        '2|User|HR|User role|Inactive|{}|{}|2023-01-01||false|Admin||false|true||'
      ];

      const mockParsedDtos: RoleDto[] = [
        {
          Id: '1',
          RoleName: 'Admin',
          Department: 'IT',
          RoleDescription: 'Administrator role',
          Status: 'Active',
          ParentAttribute: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          IsEnabled: true,
          CreatedBy: 'Admin',
          UpdatedBy: 'Admin',
          SoftDelete: false,
          IsLocked: false,
          LockedBy: undefined,
          LockedDate: undefined
        },
        {
          Id: '2',
          RoleName: 'User',
          Department: 'HR',
          RoleDescription: 'User role',
          Status: 'Inactive',
          ParentAttribute: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: undefined,
          IsEnabled: false,
          CreatedBy: 'Admin',
          UpdatedBy: undefined,
          SoftDelete: false,
          IsLocked: true,
          LockedBy: undefined,
          LockedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchRolesFromApi();

      expect(result).toHaveLength(2);
      expect(result[0].isenabled).toBe(true);
      expect(result[0].islocked).toBe(false);
      expect(result[1].isenabled).toBe(false);
      expect(result[1].islocked).toBe(true);
    });

    it('should handle null values in DTO mapping with nullish coalescing', async () => {
      const mockCsvData = [
        'Id|RoleName|Department|RoleDescription|Status|ParentAttribute|Permissions|CreatedAt|LastUpdatedAt|IsEnabled|CreatedBy|UpdatedBy|SoftDelete|IsLocked|LockedBy|LockedDate',
        '1|Admin||Administrator role|Active|{}|{}|2023-01-01||true|Admin||false|false||'
      ];

      // Mock parseCsvToDtos to call the callback with null values to test nullish coalescing
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRow = {
          Id: null,
          RoleName: null,
          Department: null,
          RoleDescription: null,
          Status: null,
          ParentAttribute: null,
          Permissions: null,
          CreatedAt: null,
          LastUpdatedAt: null,
          IsEnabled: null,
          CreatedBy: null,
          UpdatedBy: null,
          SoftDelete: null,
          IsLocked: null,
          LockedBy: null,
          LockedDate: null
        };
        return [rowMapper(testRow)];
      });

      const result = await fetchRolesFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('');
      expect(result[0].rolename).toBe('');
      expect(result[0].status).toBe('');
      expect(result[0].createdat).toBe('');
      expect(result[0].isenabled).toBe(false);
      expect(result[0].softdelete).toBe(false);
      expect(result[0].islocked).toBe(false);
    });

    it('should handle empty string values in DTO mapping', async () => {
      const mockCsvData = [
        'Id|RoleName|Department|RoleDescription|Status|ParentAttribute|Permissions|CreatedAt|LastUpdatedAt|IsEnabled|CreatedBy|UpdatedBy|SoftDelete|IsLocked|LockedBy|LockedDate',
        '1|Admin||Administrator role|Active|{}|{}|2023-01-01||true|Admin||false|false||'
      ];

      const mockParsedDtos: RoleDto[] = [
        {
          Id: '',
          RoleName: '',
          Department: '',
          RoleDescription: '',
          Status: '',
          ParentAttribute: '',
          Permissions: '',
          CreatedAt: '',
          LastUpdatedAt: '',
          IsEnabled: false,
          CreatedBy: '',
          UpdatedBy: '',
          SoftDelete: false,
          IsLocked: false,
          LockedBy: '',
          LockedDate: ''
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchRolesFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('');
      expect(result[0].rolename).toBe('');
    });

    it('should handle DTO mapping with various nullish coalescing scenarios', async () => {
      const mockCsvData = [
        'Id|RoleName|Department|RoleDescription|Status|ParentAttribute|Permissions|CreatedAt|LastUpdatedAt|IsEnabled|CreatedBy|UpdatedBy|SoftDelete|IsLocked|LockedBy|LockedDate',
        '1|Admin||Administrator role|Active|{}|{}|2023-01-01||true|Admin||false|false||'
      ];

      // Test that parseCsvToDtos callback handles all nullish coalescing branches
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      
      // Mock parseCsvToDtos to call the callback with various null/undefined values
      mockedParseCsvToDtos.mockImplementation((_csvData, _headerMapping, rowMapper) => {
        const testRows = [
          { Id: null, RoleName: undefined, Department: null, Status: '', IsEnabled: null, SoftDelete: undefined, IsLocked: null },
          { Id: '', RoleName: 'Test', Department: undefined, Status: 'Active', IsEnabled: false, SoftDelete: true, IsLocked: false }
        ];
        return testRows.map(rowMapper);
      });

      const result = await fetchRolesFromApi();

      expect(result).toHaveLength(2);
      // First row should have defaults from nullish coalescing
      expect(result[0].id).toBe('');
      expect(result[0].rolename).toBe('');
      expect(result[0].isenabled).toBe(false);
      expect(result[0].softdelete).toBe(false);
      expect(result[0].islocked).toBe(false);
      // Second row should have actual values (SoftDelete: true should be preserved)
      expect(result[1].id).toBe('');
      expect(result[1].rolename).toBe('Test');
      expect(result[1].isenabled).toBe(false);
      expect(result[1].softdelete).toBe(true); // true value is preserved, not coalesced to false
      expect(result[1].islocked).toBe(false);
    });
  });
});
