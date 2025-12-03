import { fetchUsersFromApi, UserDto } from '../../src/services/userFetchService';
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

describe('userFetchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  describe('fetchUsersFromApi', () => {
    it('should fetch and parse users successfully', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe|1234567890|Admin|IT|john@example.com|Jane Smith|Bob Johnson|true|{}|{}|{}|{}|{}|2023-01-01|2023-01-02|Active|true|Admin|Admin|||',
        '2|Jane|Smith|0987654321|Manager|HR|jane@example.com|||false|{}|{}|{}|{}|{}|2023-01-01||Active|true|Admin||||'
      ];

      const mockQueryConfig = {
        name: 'user_management',
        query: {
          databaseId: 'test-id',
          columns: [],
          tables: ['user_management'],
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

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: 'John',
          LastName: 'Doe',
          PhoneNumber: '1234567890',
          Role: 'Admin',
          Department: 'IT',
          EmailId: 'john@example.com',
          ReportingManager: 'Jane Smith',
          DottedORProjectManager: 'Bob Johnson',
          SelfReporting: true,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: 'Admin',
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        },
        {
          Id: '2',
          FirstName: 'Jane',
          LastName: 'Smith',
          PhoneNumber: '0987654321',
          Role: 'Manager',
          Department: 'HR',
          EmailId: 'jane@example.com',
          ReportingManager: undefined,
          DottedORProjectManager: undefined,
          SelfReporting: false,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: undefined,
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: undefined,
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue(mockQueryConfig);
      mockedCreateApiPayload.mockReturnValue(mockPayload);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(mockedCreateSqlQueryConfig).toHaveBeenCalledWith(
        'user_management',
        'user_management',
        expect.arrayContaining([
          expect.objectContaining({ dboName: 'user_management', columnName: 'id', aliasName: 'Id' }),
          expect.objectContaining({ dboName: 'user_management', columnName: 'firstname', aliasName: 'FirstName' }),
          expect.objectContaining({ dboName: 'user_management', columnName: 'lastname', aliasName: 'LastName' })
        ]),
        expect.objectContaining({
          conditionOperator: 0,
          filters: [] // Empty filters to show all users (active and inactive)
        }),
        expect.arrayContaining([
          { columnName: 'status', sortType: 1 },
          { columnName: 'firstname', sortType: 1 }
        ])
      );

      expect(mockedCreateApiPayload).toHaveBeenCalledWith([mockQueryConfig]);
      expect(mockedMakeDataApiCall).toHaveBeenCalledWith(mockPayload);
      expect(mockedParseCsvToDtos).toHaveBeenCalledWith(
        mockCsvData,
        expect.objectContaining({
          Id: 'Id',
          FirstName: 'FirstName',
          LastName: 'LastName',
          PhoneNumber: 'PhoneNumber',
          Role: 'Role',
          Department: 'Department',
          EmailId: 'EmailId',
          ReportingManager: 'ReportingManager',
          DottedORProjectManager: 'DottedORProjectManager',
          SelfReporting: 'SelfReporting',
          Status: 'Status',
          IsEnabled: 'IsEnabled'
        }),
        expect.any(Function)
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: true,
        regions: {},
        countries: {},
        divisions: {},
        groups: {},
        permissions: {},
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        status: 'Active',
        isenabled: true,
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: undefined,
        transferedto: undefined,
        transfereddate: undefined
      });

      expect(result[1]).toEqual({
        id: '2',
        firstname: 'Jane',
        lastname: 'Smith',
        phonenumber: '0987654321',
        role: 'Manager',
        department: 'HR',
        emailid: 'jane@example.com',
        reportingmanager: undefined,
        dottedorprojectmanager: undefined,
        selfreporting: false,
        regions: {},
        countries: {},
        divisions: {},
        groups: {},
        permissions: {},
        createdat: '2023-01-01',
        lastupdatedat: undefined,
        status: 'Active',
        isenabled: true,
        createdby: 'Admin',
        lastupdatedby: undefined,
        transferedby: undefined,
        transferedto: undefined,
        transfereddate: undefined
      });
    });

    it('should return empty array when no valid CSV data is returned', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue([]);

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should return empty array when CSV data has only header row', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle API call errors gracefully', async () => {
      const mockError = new Error('API call failed');
      
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockRejectedValue(mockError);

      await expect(fetchUsersFromApi()).rejects.toThrow('API call failed');
    });

    it('should handle parsing errors gracefully', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe|1234567890|Admin|IT|john@example.com|Jane Smith|Bob Johnson|true|{}|{}|{}|{}|{}|2023-01-01|2023-01-02|Active|true|Admin|Admin|||'
      ];

      const mockError = new Error('Parsing failed');
      
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockImplementation(() => {
        throw mockError;
      });

      await expect(fetchUsersFromApi()).rejects.toThrow('Parsing failed');
    });

    it('should handle nullish coalescing in DTO mapping', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe||Admin||john@example.com|||false|{}|{}|{}|{}|{}|2023-01-01||Active|true|Admin||||'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: 'John',
          LastName: 'Doe',
          PhoneNumber: undefined,
          Role: 'Admin',
          Department: undefined,
          EmailId: 'john@example.com',
          ReportingManager: undefined,
          DottedORProjectManager: undefined,
          SelfReporting: false,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: undefined,
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: undefined,
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: undefined,
        role: 'Admin',
        department: undefined,
        emailid: 'john@example.com',
        reportingmanager: undefined,
        dottedorprojectmanager: undefined,
        selfreporting: false,
        regions: {},
        countries: {},
        divisions: {},
        groups: {},
        permissions: {},
        createdat: '2023-01-01',
        lastupdatedat: undefined,
        status: 'Active',
        isenabled: true,
        createdby: 'Admin',
        lastupdatedby: undefined,
        transferedby: undefined,
        transferedto: undefined,
        transfereddate: undefined
      });
    });

    it('should handle JSON parsing in DTO mapping', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe|1234567890|Admin|IT|john@example.com|Jane Smith|Bob Johnson|true|{"region1":"value1"}|{"country1":"value1"}|{"div1":"value1"}|{"group1":"value1"}|{"perm1":"value1"}|2023-01-01|2023-01-02|Active|true|Admin|Admin|||'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: 'John',
          LastName: 'Doe',
          PhoneNumber: '1234567890',
          Role: 'Admin',
          Department: 'IT',
          EmailId: 'john@example.com',
          ReportingManager: 'Jane Smith',
          DottedORProjectManager: 'Bob Johnson',
          SelfReporting: true,
          Regions: { region1: 'value1' },
          Country: { country1: 'value1' },
          Divisions: { div1: 'value1' },
          Groups: { group1: 'value1' },
          Permissions: { perm1: 'value1' },
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: 'Admin',
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].regions).toEqual({ region1: 'value1' });
      expect(result[0].countries).toEqual({ country1: 'value1' });
      expect(result[0].divisions).toEqual({ div1: 'value1' });
      expect(result[0].groups).toEqual({ group1: 'value1' });
      expect(result[0].permissions).toEqual({ perm1: 'value1' });
    });

    it('should handle boolean parsing in DTO mapping', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe|1234567890|Admin|IT|john@example.com|Jane Smith|Bob Johnson|true|{}|{}|{}|{}|{}|2023-01-01|2023-01-02|Active|true|Admin|Admin|||',
        '2|Jane|Smith|0987654321|Manager|HR|jane@example.com|||false|{}|{}|{}|{}|{}|2023-01-01||Active|false|Admin||||'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: 'John',
          LastName: 'Doe',
          PhoneNumber: '1234567890',
          Role: 'Admin',
          Department: 'IT',
          EmailId: 'john@example.com',
          ReportingManager: 'Jane Smith',
          DottedORProjectManager: 'Bob Johnson',
          SelfReporting: true,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: 'Admin',
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        },
        {
          Id: '2',
          FirstName: 'Jane',
          LastName: 'Smith',
          PhoneNumber: '0987654321',
          Role: 'Manager',
          Department: 'HR',
          EmailId: 'jane@example.com',
          ReportingManager: undefined,
          DottedORProjectManager: undefined,
          SelfReporting: false,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: undefined,
          Status: 'Active',
          IsEnabled: false,
          CreatedBy: 'Admin',
          LastUpdatedBy: undefined,
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(2);
      expect(result[0].selfreporting).toBe(true);
      expect(result[0].isenabled).toBe(true);
      expect(result[1].selfreporting).toBe(false);
      expect(result[1].isenabled).toBe(false);
    });

    it('should log parsed DTOs and mapped models', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe|1234567890|Admin|IT|john@example.com|Jane Smith|Bob Johnson|true|{}|{}|{}|{}|{}|2023-01-01|2023-01-02|Active|true|Admin|Admin|||'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: 'John',
          LastName: 'Doe',
          PhoneNumber: '1234567890',
          Role: 'Admin',
          Department: 'IT',
          EmailId: 'john@example.com',
          ReportingManager: 'Jane Smith',
          DottedORProjectManager: 'Bob Johnson',
          SelfReporting: true,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: 'Admin',
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      await fetchUsersFromApi();

      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: parsed DTOs:', mockParsedDtos);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: mapped models:', expect.any(Array));
    });

    it('should handle CSV data with single row (header only)', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate'
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with exactly 2 rows (header + 1 data)', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe|1234567890|Admin|IT|john@example.com|Jane Smith|Bob Johnson|true|{}|{}|{}|{}|{}|2023-01-01|2023-01-02|Active|true|Admin|Admin|||'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: 'John',
          LastName: 'Doe',
          PhoneNumber: '1234567890',
          Role: 'Admin',
          Department: 'IT',
          EmailId: 'john@example.com',
          ReportingManager: 'Jane Smith',
          DottedORProjectManager: 'Bob Johnson',
          SelfReporting: true,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: 'Admin',
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should handle CSV data with null/undefined values in all fields', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '||||||||||||||||||||||||'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '',
          FirstName: '',
          LastName: '',
          PhoneNumber: undefined,
          Role: '',
          Department: undefined,
          EmailId: '',
          ReportingManager: undefined,
          DottedORProjectManager: undefined,
          SelfReporting: false,
          Regions: undefined,
          Country: undefined,
          Divisions: undefined,
          Groups: undefined,
          Permissions: undefined,
          CreatedAt: '',
          LastUpdatedAt: undefined,
          Status: '',
          IsEnabled: false,
          CreatedBy: undefined,
          LastUpdatedBy: undefined,
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '',
        firstname: '',
        lastname: '',
        phonenumber: undefined,
        role: '',
        department: undefined,
        emailid: '',
        reportingmanager: undefined,
        dottedorprojectmanager: undefined,
        selfreporting: false,
        regions: undefined,
        countries: undefined,
        divisions: undefined,
        groups: undefined,
        permissions: undefined,
        createdat: '',
        lastupdatedat: undefined,
        status: '',
        isenabled: false,
        createdby: undefined,
        lastupdatedby: undefined,
        transferedby: undefined,
        transferedto: undefined,
        transfereddate: undefined
      });
    });

    it('should handle CSV data with special characters and edge cases', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John\'s|O\'Connor|+1-555-123-4567|Admin|IT & Security|john.o\'connor@example.com|Jane "Boss" Smith|Bob "The Man" Johnson|true|{"region":"US"}|{"country":"USA"}|{"div":"Engineering"}|{"group":"DevOps"}|{"perm":"admin"}|2023-01-01T00:00:00Z|2023-01-02T12:30:45Z|Active|true|Admin|Admin|Transferrer|Transferee|2023-01-03T10:15:30Z'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: 'John\'s',
          LastName: 'O\'Connor',
          PhoneNumber: '+1-555-123-4567',
          Role: 'Admin',
          Department: 'IT & Security',
          EmailId: 'john.o\'connor@example.com',
          ReportingManager: 'Jane "Boss" Smith',
          DottedORProjectManager: 'Bob "The Man" Johnson',
          SelfReporting: true,
          Regions: { region: 'US' },
          Country: { country: 'USA' },
          Divisions: { div: 'Engineering' },
          Groups: { group: 'DevOps' },
          Permissions: { perm: 'admin' },
          CreatedAt: '2023-01-01T00:00:00Z',
          LastUpdatedAt: '2023-01-02T12:30:45Z',
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: 'Admin',
          TransferedBy: 'Transferrer',
          TransferedTo: 'Transferee',
          TransferedDate: '2023-01-03T10:15:30Z'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        firstname: 'John\'s',
        lastname: 'O\'Connor',
        phonenumber: '+1-555-123-4567',
        role: 'Admin',
        department: 'IT & Security',
        emailid: 'john.o\'connor@example.com',
        reportingmanager: 'Jane "Boss" Smith',
        dottedorprojectmanager: 'Bob "The Man" Johnson',
        selfreporting: true,
        regions: { region: 'US' },
        countries: { country: 'USA' },
        divisions: { div: 'Engineering' },
        groups: { group: 'DevOps' },
        permissions: { perm: 'admin' },
        createdat: '2023-01-01T00:00:00Z',
        lastupdatedat: '2023-01-02T12:30:45Z',
        status: 'Active',
        isenabled: true,
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: 'Transferrer',
        transferedto: 'Transferee',
        transfereddate: '2023-01-03T10:15:30Z'
      });
    });

    it('should handle CSV data with numeric and boolean edge cases', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '0|Test|User|0000000000|User|Test|test@test.com|||1|{}|{}|{}|{}|{}|1970-01-01|1970-01-01|Inactive|0|System|System|||'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '0',
          FirstName: 'Test',
          LastName: 'User',
          PhoneNumber: '0000000000',
          Role: 'User',
          Department: 'Test',
          EmailId: 'test@test.com',
          ReportingManager: undefined,
          DottedORProjectManager: undefined,
          SelfReporting: true,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '1970-01-01',
          LastUpdatedAt: '1970-01-01',
          Status: 'Inactive',
          IsEnabled: false,
          CreatedBy: 'System',
          LastUpdatedBy: 'System',
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('0');
      expect(result[0].selfreporting).toBe(true);
      expect(result[0].isenabled).toBe(false);
    });

    it('should handle CSV data with very long strings', async () => {
      const longString = 'A'.repeat(1000);
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        `1|${longString}|${longString}|1234567890|Admin|IT|john@example.com|${longString}|${longString}|true|{}|{}|{}|{}|{}|2023-01-01|2023-01-02|Active|true|Admin|Admin|||`
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: longString,
          LastName: longString,
          PhoneNumber: '1234567890',
          Role: 'Admin',
          Department: 'IT',
          EmailId: 'john@example.com',
          ReportingManager: longString,
          DottedORProjectManager: longString,
          SelfReporting: true,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: 'Admin',
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].firstname).toBe(longString);
      expect(result[0].lastname).toBe(longString);
      expect(result[0].reportingmanager).toBe(longString);
      expect(result[0].dottedorprojectmanager).toBe(longString);
    });

    it('should handle CSV data with empty strings vs undefined values', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe||Admin||john@example.com|||false|{}|{}|{}|{}|{}|2023-01-01||Active|true|Admin|Admin|||'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: 'John',
          LastName: 'Doe',
          PhoneNumber: '',
          Role: 'Admin',
          Department: '',
          EmailId: 'john@example.com',
          ReportingManager: '',
          DottedORProjectManager: '',
          SelfReporting: false,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '',
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: 'Admin',
          TransferedBy: '',
          TransferedTo: '',
          TransferedDate: ''
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].phonenumber).toBe('');
      expect(result[0].department).toBe('');
      expect(result[0].reportingmanager).toBe('');
      expect(result[0].dottedorprojectmanager).toBe('');
      expect(result[0].lastupdatedat).toBe('');
      expect(result[0].transferedby).toBe('');
      expect(result[0].transferedto).toBe('');
      expect(result[0].transfereddate).toBe('');
    });

    it('should handle CSV data with mixed data types in JSON fields', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe|1234567890|Admin|IT|john@example.com|Jane Smith|Bob Johnson|true|{"regions":["US","EU"],"count":2}|{"countries":{"US":"United States","EU":"Europe"}}|{"divisions":{"eng":"Engineering","hr":"Human Resources"}}|{"groups":[{"id":1,"name":"Admin"},{"id":2,"name":"User"}]}|{"permissions":{"read":true,"write":false,"delete":null}}|2023-01-01|2023-01-02|Active|true|Admin|Admin|||'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: 'John',
          LastName: 'Doe',
          PhoneNumber: '1234567890',
          Role: 'Admin',
          Department: 'IT',
          EmailId: 'john@example.com',
          ReportingManager: 'Jane Smith',
          DottedORProjectManager: 'Bob Johnson',
          SelfReporting: true,
          Regions: { regions: ['US', 'EU'], count: 2 },
          Country: { countries: { US: 'United States', EU: 'Europe' } },
          Divisions: { divisions: { eng: 'Engineering', hr: 'Human Resources' } },
          Groups: { groups: [{ id: 1, name: 'Admin' }, { id: 2, name: 'User' }] },
          Permissions: { permissions: { read: true, write: false, delete: null } },
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: 'Admin',
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].regions).toEqual({ regions: ['US', 'EU'], count: 2 });
      expect(result[0].countries).toEqual({ countries: { US: 'United States', EU: 'Europe' } });
      expect(result[0].divisions).toEqual({ divisions: { eng: 'Engineering', hr: 'Human Resources' } });
      expect(result[0].groups).toEqual({ groups: [{ id: 1, name: 'Admin' }, { id: 2, name: 'User' }] });
      expect(result[0].permissions).toEqual({ permissions: { read: true, write: false, delete: null } });
    });

    it('should handle CSV data with timestamp edge cases', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe|1234567890|Admin|IT|john@example.com|Jane Smith|Bob Johnson|true|{}|{}|{}|{}|{}|2023-01-01T00:00:00.000Z|2023-12-31T23:59:59.999Z|Active|true|Admin|Admin|Transferrer|Transferee|2024-01-01T00:00:00.000Z'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: 'John',
          LastName: 'Doe',
          PhoneNumber: '1234567890',
          Role: 'Admin',
          Department: 'IT',
          EmailId: 'john@example.com',
          ReportingManager: 'Jane Smith',
          DottedORProjectManager: 'Bob Johnson',
          SelfReporting: true,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '2023-01-01T00:00:00.000Z',
          LastUpdatedAt: '2023-12-31T23:59:59.999Z',
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: 'Admin',
          TransferedBy: 'Transferrer',
          TransferedTo: 'Transferee',
          TransferedDate: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].createdat).toBe('2023-01-01T00:00:00.000Z');
      expect(result[0].lastupdatedat).toBe('2023-12-31T23:59:59.999Z');
      expect(result[0].transfereddate).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle CSV data with non-array response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue('not an array');

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with single element array', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(['single element']);

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with null response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(null);

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with undefined response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(undefined);

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with empty string response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue('');

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with number response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(123);

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with object response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue({ data: 'test' });

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with boolean response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(true);

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with function response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(() => {});

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with symbol response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(Symbol('test'));

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with bigint response', async () => {
      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(BigInt(123));

      const result = await fetchUsersFromApi();

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('fetchUsersFromApi: No valid data returned');
    });

    it('should handle CSV data with exactly 2 rows (header + 1 data) - edge case', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe|1234567890|Admin|IT|john@example.com|Jane Smith|Bob Johnson|true|{}|{}|{}|{}|{}|2023-01-01|2023-01-02|Active|true|Admin|Admin|||'
      ];

      const mockParsedDtos: UserDto[] = [
        {
          Id: '1',
          FirstName: 'John',
          LastName: 'Doe',
          PhoneNumber: '1234567890',
          Role: 'Admin',
          Department: 'IT',
          EmailId: 'john@example.com',
          ReportingManager: 'Jane Smith',
          DottedORProjectManager: 'Bob Johnson',
          SelfReporting: true,
          Regions: {},
          Country: {},
          Divisions: {},
          Groups: {},
          Permissions: {},
          CreatedAt: '2023-01-01',
          LastUpdatedAt: '2023-01-02',
          Status: 'Active',
          IsEnabled: true,
          CreatedBy: 'Admin',
          LastUpdatedBy: 'Admin',
          TransferedBy: undefined,
          TransferedTo: undefined,
          TransferedDate: undefined
        }
      ];

      mockedCreateSqlQueryConfig.mockReturnValue({} as any);
      mockedCreateApiPayload.mockReturnValue({} as any);
      mockedMakeDataApiCall.mockResolvedValue(mockCsvData);
      mockedParseCsvToDtos.mockReturnValue(mockParsedDtos);

      const result = await fetchUsersFromApi();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should test DTO mapping function with various data types', async () => {
      const mockCsvData = [
        'Id|FirstName|LastName|PhoneNumber|Role|Department|EmailId|ReportingManager|DottedORProjectManager|SelfReporting|Regions|Country|Divisions|Groups|Permissions|CreatedAt|LastUpdatedAt|Status|IsEnabled|CreatedBy|LastUpdatedBy|TransferedBy|TransferedTo|TransferedDate',
        '1|John|Doe|1234567890|Admin|IT|john@example.com|Jane Smith|Bob Johnson|true|{}|{}|{}|{}|{}|2023-01-01|2023-01-02|Active|true|Admin|Admin|||'
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

      await fetchUsersFromApi();

      // Test the mapping function with various data scenarios
      expect(capturedMappingFunction).toBeDefined();

      // Test with null/undefined values
      const testRowData1 = {
        Id: null,
        FirstName: undefined,
        LastName: '',
        PhoneNumber: null,
        Role: undefined,
        Department: '',
        EmailId: null,
        ReportingManager: undefined,
        DottedORProjectManager: '',
        SelfReporting: null,
        Regions: undefined,
        Country: null,
        Divisions: '',
        Groups: undefined,
        Departments: null,
        Class: '',
        SubClass: undefined,
        Permissions: null,
        CreatedAt: undefined,
        LastUpdatedAt: '',
        Status: null,
        IsEnabled: undefined,
        CreatedBy: '',
        LastUpdatedBy: null,
        TransferedBy: undefined,
        TransferedTo: '',
        TransferedDate: null
      };

      const result1 = capturedMappingFunction(testRowData1);
      expect(result1).toEqual({
        Id: '',
        FirstName: '',
        LastName: '',
        PhoneNumber: undefined,
        Role: '',
        Department: '',
        EmailId: '',
        ReportingManager: undefined,
        DottedORProjectManager: '',
        SelfReporting: false,
        Regions: undefined,
        Country: null,
        Divisions: '',
        Groups: undefined,
        Departments: null,
        Class: '',
        SubClass: undefined,
        Permissions: null,
        CreatedAt: '',
        LastUpdatedAt: '',
        Status: '',
        IsEnabled: false,
        CreatedBy: '',
        LastUpdatedBy: undefined,
        TransferedBy: undefined,
        TransferedTo: '',
        TransferedDate: undefined
      });

      // Test with valid values
      const testRowData2 = {
        Id: '123',
        FirstName: 'Jane',
        LastName: 'Smith',
        PhoneNumber: '9876543210',
        Role: 'Manager',
        Department: 'HR',
        EmailId: 'jane@example.com',
        ReportingManager: 'John Doe',
        DottedORProjectManager: 'Bob Wilson',
        SelfReporting: true,
        Regions: { region: 'US' },
        Country: { country: 'USA' },
        Divisions: { div: 'Engineering' },
        Groups: { group: 'DevOps' },
        Departments: { dept: 'IT' },
        Class: { class: 'Senior' },
        SubClass: { subClass: 'Frontend' },
        Permissions: { perm: 'admin' },
        CreatedAt: '2023-01-01',
        LastUpdatedAt: '2023-01-02',
        Status: 'Active',
        IsEnabled: true,
        CreatedBy: 'Admin',
        LastUpdatedBy: 'Admin',
        TransferedBy: 'Transferrer',
        TransferedTo: 'Transferee',
        TransferedDate: '2023-01-03'
      };

      const result2 = capturedMappingFunction(testRowData2);
      expect(result2).toEqual({
        Id: '123',
        FirstName: 'Jane',
        LastName: 'Smith',
        PhoneNumber: '9876543210',
        Role: 'Manager',
        Department: 'HR',
        EmailId: 'jane@example.com',
        ReportingManager: 'John Doe',
        DottedORProjectManager: 'Bob Wilson',
        SelfReporting: true,
        Regions: { region: 'US' },
        Country: { country: 'USA' },
        Divisions: { div: 'Engineering' },
        Groups: { group: 'DevOps' },
        Departments: { dept: 'IT' },
        Class: { class: 'Senior' },
        SubClass: { subClass: 'Frontend' },
        Permissions: { perm: 'admin' },
        CreatedAt: '2023-01-01',
        LastUpdatedAt: '2023-01-02',
        Status: 'Active',
        IsEnabled: true,
        CreatedBy: 'Admin',
        LastUpdatedBy: 'Admin',
        TransferedBy: 'Transferrer',
        TransferedTo: 'Transferee',
        TransferedDate: '2023-01-03'
      });

      // Test with mixed data types
      const testRowData3 = {
        Id: 456,
        FirstName: 'Test',
        LastName: 'User',
        PhoneNumber: 1234567890,
        Role: 'User',
        Department: 'Test',
        EmailId: 'test@test.com',
        ReportingManager: 'Manager',
        DottedORProjectManager: 'Lead',
        SelfReporting: 'true',
        Regions: '{"region":"EU"}',
        Country: '{"country":"Germany"}',
        Divisions: '{"div":"Sales"}',
        Groups: '{"group":"Marketing"}',
        Departments: '{"dept":"Finance"}',
        Class: '{"class":"Junior"}',
        SubClass: '{"subClass":"Backend"}',
        Permissions: '{"perm":"read"}',
        CreatedAt: '2023-01-01',
        LastUpdatedAt: '2023-01-02',
        Status: 'Inactive',
        IsEnabled: 'false',
        CreatedBy: 'System',
        LastUpdatedBy: 'System',
        TransferedBy: 'OldManager',
        TransferedTo: 'NewManager',
        TransferedDate: '2023-01-03'
      };

      const result3 = capturedMappingFunction(testRowData3);
      expect(result3).toEqual({
        Id: '456',
        FirstName: 'Test',
        LastName: 'User',
        PhoneNumber: 1234567890,
        Role: 'User',
        Department: 'Test',
        EmailId: 'test@test.com',
        ReportingManager: 'Manager',
        DottedORProjectManager: 'Lead',
        SelfReporting: 'true',
        Regions: '{"region":"EU"}',
        Country: '{"country":"Germany"}',
        Divisions: '{"div":"Sales"}',
        Groups: '{"group":"Marketing"}',
        Departments: '{"dept":"Finance"}',
        Class: '{"class":"Junior"}',
        SubClass: '{"subClass":"Backend"}',
        Permissions: '{"perm":"read"}',
        CreatedAt: '2023-01-01',
        LastUpdatedAt: '2023-01-02',
        Status: 'Inactive',
        IsEnabled: 'false',
        CreatedBy: 'System',
        LastUpdatedBy: 'System',
        TransferedBy: 'OldManager',
        TransferedTo: 'NewManager',
        TransferedDate: '2023-01-03'
      });
    });
  });
});
