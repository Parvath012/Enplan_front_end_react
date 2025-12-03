import * as XLSX from 'xlsx';
import { parseExcelFile, convertToUserFormData, ParsedUserRow } from '../../src/utils/excelParserService';

// Mock xlsx
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

describe('excelParserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseExcelFile', () => {
    const createMockWorkbook = (sheetName: string, headers: string[], rows: any[][]) => {
      const worksheet = {};
      return {
        SheetNames: [sheetName],
        Sheets: {
          [sheetName]: worksheet,
        },
      };
    };

    const createMockFile = (): File => {
      return new File([''], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    };

    // Helper to properly mock FileReader
    const setupFileReaderMock = (data: any) => {
      const mockFileReader = {
        readAsArrayBuffer: jest.fn(function(this: any, file: File) {
          // Simulate async file reading
          setTimeout(() => {
            if (this.onload) {
              this.result = new ArrayBuffer(8);
              this.onload({ target: { result: this.result } } as any);
            }
          }, 0);
        }),
        onerror: null as any,
        onload: null as any,
        result: null,
      };
      
      global.FileReader = jest.fn(() => mockFileReader) as any;
      return mockFileReader;
    };

    it('should parse valid Excel file with all required headers', async () => {
      const headers = [
        'First Name',
        'Last Name',
        'Email ID',
        'Phone Number',
        'Role',
        'Department',
        'Regions',
        'Countries',
        'Divisions',
        'Groups',
        'Permissions Departments',
        'Classes',
        'SubClasses',
      ];
      const dataRows = [
        ['John', 'Doe', 'john@example.com', '1234567890', 'Admin', 'IT', 'Region1', 'Country1', 'Division1', 'Group1', 'Dept1', 'Class1', 'SubClass1'],
      ];

      const mockWorkbook = createMockWorkbook('User Template', headers, dataRows);
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([headers, ...dataRows]);

      const file = createMockFile();
      setupFileReaderMock(null);
      
      const result = await parseExcelFile(file);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].firstName).toBe('John');
      expect(result.users[0].lastName).toBe('Doe');
      expect(result.errors).toHaveLength(0);
    });

    it('should handle missing required headers', async () => {
      const headers = ['First Name', 'Last Name']; // Missing other required headers
      const dataRows = [['John', 'Doe']]; // At least one data row
      const mockWorkbook = createMockWorkbook('User Template', headers, dataRows);
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([headers, ...dataRows]);

      const file = createMockFile();
      setupFileReaderMock(null);
      
      const result = await parseExcelFile(file);

      expect(result.users).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain("doesn't match the expected format");
    });

    it('should handle empty file', async () => {
      const mockWorkbook = createMockWorkbook('Sheet1', [], []);
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([]);

      const file = createMockFile();
      setupFileReaderMock(null);

      await expect(parseExcelFile(file)).rejects.toThrow('Excel file must contain at least a header row and one data row');
    });

    it('should handle file with only header row', async () => {
      const headers = [
        'First Name',
        'Last Name',
        'Email ID',
        'Phone Number',
        'Role',
        'Department',
        'Regions',
        'Countries',
        'Divisions',
        'Groups',
        'Permissions Departments',
        'Classes',
        'SubClasses',
      ];
      // Return header + one empty row (which will be skipped)
      const emptyRow = ['', '', '', '', '', '', '', '', '', '', '', '', ''];
      const mockWorkbook = createMockWorkbook('User Template', headers, [emptyRow]);
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([headers, emptyRow]);

      const file = createMockFile();
      setupFileReaderMock(null);

      await expect(parseExcelFile(file)).rejects.toThrow('No valid user data found in Excel file');
    });

    it('should skip empty rows', async () => {
      const headers = [
        'First Name',
        'Last Name',
        'Email ID',
        'Phone Number',
        'Role',
        'Department',
        'Regions',
        'Countries',
        'Divisions',
        'Groups',
        'Permissions Departments',
        'Classes',
        'SubClasses',
      ];
      const dataRows = [
        ['John', 'Doe', 'john@example.com', '1234567890', 'Admin', 'IT', 'Region1', 'Country1', 'Division1', 'Group1', 'Dept1', 'Class1', 'SubClass1'],
        ['', '', '', '', '', '', '', '', '', '', '', '', ''], // Empty row
        ['Jane', 'Smith', 'jane@example.com', '0987654321', 'User', 'HR', 'Region2', 'Country2', 'Division2', 'Group2', 'Dept2', 'Class2', 'SubClass2'],
      ];

      const mockWorkbook = createMockWorkbook('User Template', headers, dataRows);
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([headers, ...dataRows]);

      const file = createMockFile();
      setupFileReaderMock(null);
      
      const result = await parseExcelFile(file);

      expect(result.users).toHaveLength(2);
      expect(result.users[0].firstName).toBe('John');
      expect(result.users[1].firstName).toBe('Jane');
    });

    it('should validate required fields and collect errors', async () => {
      const headers = [
        'First Name',
        'Last Name',
        'Email ID',
        'Phone Number',
        'Role',
        'Department',
        'Regions',
        'Countries',
        'Divisions',
        'Groups',
        'Permissions Departments',
        'Classes',
        'SubClasses',
      ];
      const dataRows = [
        ['', '', '', '', '', '', '', '', '', '', '', '', ''], // All fields empty - this will be skipped as empty row
        ['John', '', '', '', '', '', '', '', '', '', '', '', ''], // Some fields empty - this will have validation errors
      ];

      const mockWorkbook = createMockWorkbook('User Template', headers, dataRows);
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([headers, ...dataRows]);

      const file = createMockFile();
      setupFileReaderMock(null);
      
      const result = await parseExcelFile(file);

      expect(result.users).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'Last Name')).toBe(true);
      expect(result.errors.some(e => e.field === 'Email ID')).toBe(true);
    });

    it('should parse comma-separated values correctly', async () => {
      const headers = [
        'First Name',
        'Last Name',
        'Email ID',
        'Phone Number',
        'Role',
        'Department',
        'Regions',
        'Countries',
        'Divisions',
        'Groups',
        'Permissions Departments',
        'Classes',
        'SubClasses',
      ];
      const dataRows = [
        ['John', 'Doe', 'john@example.com', '1234567890', 'Admin', 'IT', 'Region1,Region2', 'Country1,Country2', 'Division1', 'Group1', 'Dept1', 'Class1', 'SubClass1'],
      ];

      const mockWorkbook = createMockWorkbook('User Template', headers, dataRows);
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([headers, ...dataRows]);

      const file = createMockFile();
      setupFileReaderMock(null);
      
      const result = await parseExcelFile(file);

      expect(result.users[0].regions).toEqual(['Region1', 'Region2']);
      expect(result.users[0].countries).toEqual(['Country1', 'Country2']);
    });

    it('should parse boolean values correctly', async () => {
      const headers = [
        'First Name',
        'Last Name',
        'Email ID',
        'Phone Number',
        'Role',
        'Department',
        'Regions',
        'Countries',
        'Divisions',
        'Groups',
        'Permissions Departments',
        'Classes',
        'SubClasses',
        'Self Reporting',
      ];
      const dataRows = [
        ['John', 'Doe', 'john@example.com', '1234567890', 'Admin', 'IT', 'Region1', 'Country1', 'Division1', 'Group1', 'Dept1', 'Class1', 'SubClass1', 'Yes'],
      ];

      const mockWorkbook = createMockWorkbook('User Template', headers, dataRows);
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([headers, ...dataRows]);

      const file = createMockFile();
      setupFileReaderMock(null);
      
      const result = await parseExcelFile(file);

      expect(result.users[0].selfReporting).toBe(true);
    });

    it('should handle file read error', async () => {
      const file = createMockFile();
      const mockFileReader = {
        readAsArrayBuffer: jest.fn(function(this: any) {
          // Simulate async error
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('File read error') as any);
            }
          }, 0);
        }),
        onerror: null as any,
        onload: null as any,
        result: null,
      };

      global.FileReader = jest.fn(() => mockFileReader) as any;

      await expect(parseExcelFile(file)).rejects.toThrow('Failed to read file');
    });

    it('should handle parse error', async () => {
      const file = createMockFile();
      setupFileReaderMock(null);
      
      (XLSX.read as jest.Mock).mockImplementation(() => {
        throw new Error('Parse error');
      });

      await expect(parseExcelFile(file)).rejects.toThrow('Failed to parse Excel file');
    });

    it('should find sheet with "user" or "template" in name', async () => {
      const headers = [
        'First Name',
        'Last Name',
        'Email ID',
        'Phone Number',
        'Role',
        'Department',
        'Regions',
        'Countries',
        'Divisions',
        'Groups',
        'Permissions Departments',
        'Classes',
        'SubClasses',
      ];
      const dataRows = [
        ['John', 'Doe', 'john@example.com', '1234567890', 'Admin', 'IT', 'Region1', 'Country1', 'Division1', 'Group1', 'Dept1', 'Class1', 'SubClass1'],
      ];

      const mockWorkbook = {
        SheetNames: ['User Data Sheet'],
        Sheets: {
          'User Data Sheet': {},
        },
      };
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([headers, ...dataRows]);

      const file = createMockFile();
      setupFileReaderMock(null);
      
      const result = await parseExcelFile(file);

      expect(result.users).toHaveLength(1);
    });

    it('should use first sheet if no user/template sheet found', async () => {
      const headers = [
        'First Name',
        'Last Name',
        'Email ID',
        'Phone Number',
        'Role',
        'Department',
        'Regions',
        'Countries',
        'Divisions',
        'Groups',
        'Permissions Departments',
        'Classes',
        'SubClasses',
      ];
      const dataRows = [
        ['John', 'Doe', 'john@example.com', '1234567890', 'Admin', 'IT', 'Region1', 'Country1', 'Division1', 'Group1', 'Dept1', 'Class1', 'SubClass1'],
      ];

      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {},
        },
      };
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([headers, ...dataRows]);

      const file = createMockFile();
      setupFileReaderMock(null);
      
      const result = await parseExcelFile(file);

      expect(result.users).toHaveLength(1);
    }, 10000);

    it('should handle Email Id (case variation)', async () => {
      const headers = [
        'First Name',
        'Last Name',
        'Email Id', // Different case
        'Phone Number',
        'Role',
        'Department',
        'Regions',
        'Countries',
        'Divisions',
        'Groups',
        'Permissions Departments',
        'Classes',
        'SubClasses',
      ];
      const dataRows = [
        ['John', 'Doe', 'john@example.com', '1234567890', 'Admin', 'IT', 'Region1', 'Country1', 'Division1', 'Group1', 'Dept1', 'Class1', 'SubClass1'],
      ];

      const mockWorkbook = createMockWorkbook('User Template', headers, dataRows);
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([headers, ...dataRows]);

      const file = createMockFile();
      setupFileReaderMock(null);
      
      const result = await parseExcelFile(file);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].emailId).toBe('john@example.com');
    }, 10000);

    it('should handle optional fields', async () => {
      const headers = [
        'First Name',
        'Last Name',
        'Email ID',
        'Phone Number',
        'Role',
        'Department',
        'Regions',
        'Countries',
        'Divisions',
        'Groups',
        'Permissions Departments',
        'Classes',
        'SubClasses',
        'Self Reporting',
        'Reporting Manager',
        'Dotted Line Manager',
      ];
      const dataRows = [
        ['John', 'Doe', 'john@example.com', '1234567890', 'Admin', 'IT', 'Region1', 'Country1', 'Division1', 'Group1', 'Dept1', 'Class1', 'SubClass1', 'Yes', 'Manager1', 'Manager2'],
      ];

      const mockWorkbook = createMockWorkbook('User Template', headers, dataRows);
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([headers, ...dataRows]);

      const file = createMockFile();
      setupFileReaderMock(null);
      
      const result = await parseExcelFile(file);

      expect(result.users[0].selfReporting).toBe(true);
      expect(result.users[0].reportingManager).toBe('Manager1');
      expect(result.users[0].dottedLineManager).toBe('Manager2');
    }, 10000);
  });

  describe('convertToUserFormData', () => {
    it('should convert ParsedUserRow to UserFormData', () => {
      const parsedUser: ParsedUserRow = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john@example.com',
        selfReporting: true,
        reportingManager: 'Manager1',
        dottedLineManager: 'Manager2',
        regions: ['Region1'],
        countries: ['Country1'],
        divisions: ['Division1'],
        groups: ['Group1'],
        permissionDepartments: ['Dept1'],
        classes: ['Class1'],
        subClasses: ['SubClass1'],
      };

      const result = convertToUserFormData(parsedUser);

      expect(result.firstname).toBe('John');
      expect(result.lastname).toBe('Doe');
      expect(result.emailid).toBe('john@example.com');
      expect(result.role).toBe('Admin');
      expect(result.selfreporting).toBe(true);
      expect(result.reportingmanager).toBe('Manager1');
      expect(result.dottedorprojectmanager).toBe('Manager2');
      expect(result.regions).toEqual(['Region1']);
      expect(result.status).toBe('Active');
      expect(result.isenabled).toBe(true);
    });

    it('should handle empty arrays as undefined', () => {
      const parsedUser: ParsedUserRow = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john@example.com',
        selfReporting: false,
        reportingManager: '',
        dottedLineManager: '',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        permissionDepartments: [],
        classes: [],
        subClasses: [],
      };

      const result = convertToUserFormData(parsedUser);

      expect(result.regions).toBeUndefined();
      expect(result.countries).toBeUndefined();
      expect(result.divisions).toBeUndefined();
    });

    it('should set reportingmanager to "Self" when selfReporting is true and reportingManager is empty', () => {
      const parsedUser: ParsedUserRow = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailId: 'john@example.com',
        selfReporting: true,
        reportingManager: '',
        dottedLineManager: '',
        regions: ['Region1'],
        countries: ['Country1'],
        divisions: ['Division1'],
        groups: ['Group1'],
        permissionDepartments: ['Dept1'],
        classes: ['Class1'],
        subClasses: ['SubClass1'],
      };

      const result = convertToUserFormData(parsedUser);

      expect(result.reportingmanager).toBe('Self');
    });

    it('should handle missing optional fields', () => {
      const parsedUser: ParsedUserRow = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '',
        role: 'Admin',
        department: '',
        emailId: 'john@example.com',
        selfReporting: false,
        reportingManager: '',
        dottedLineManager: '',
        regions: ['Region1'],
        countries: ['Country1'],
        divisions: ['Division1'],
        groups: ['Group1'],
        permissionDepartments: ['Dept1'],
        classes: ['Class1'],
        subClasses: ['SubClass1'],
      };

      const result = convertToUserFormData(parsedUser);

      expect(result.phonenumber).toBeUndefined();
      expect(result.department).toBeUndefined();
      expect(result.reportingmanager).toBeUndefined();
      expect(result.dottedorprojectmanager).toBeUndefined();
    });
  });
});

