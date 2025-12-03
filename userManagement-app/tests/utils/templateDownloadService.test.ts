import * as XLSX from 'xlsx';
import { downloadUserTemplate, TEMPLATE_COLUMNS } from '../../src/utils/templateDownloadService';

// Mock xlsx
jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(),
    aoa_to_sheet: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

describe('templateDownloadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('TEMPLATE_COLUMNS', () => {
    it('should contain all required columns', () => {
      expect(TEMPLATE_COLUMNS).toContain('First Name');
      expect(TEMPLATE_COLUMNS).toContain('Last Name');
      expect(TEMPLATE_COLUMNS).toContain('Email ID');
      expect(TEMPLATE_COLUMNS).toContain('Phone Number');
      expect(TEMPLATE_COLUMNS).toContain('Role');
      expect(TEMPLATE_COLUMNS).toContain('Department');
    });

    it('should contain reporting details columns', () => {
      expect(TEMPLATE_COLUMNS).toContain('Self Reporting');
      expect(TEMPLATE_COLUMNS).toContain('Reporting Manager');
      expect(TEMPLATE_COLUMNS).toContain('Dotted Line Manager');
    });

    it('should contain multi-select permission columns', () => {
      expect(TEMPLATE_COLUMNS).toContain('Regions');
      expect(TEMPLATE_COLUMNS).toContain('Countries');
      expect(TEMPLATE_COLUMNS).toContain('Divisions');
      expect(TEMPLATE_COLUMNS).toContain('Groups');
      expect(TEMPLATE_COLUMNS).toContain('Permissions Departments');
      expect(TEMPLATE_COLUMNS).toContain('Classes');
      expect(TEMPLATE_COLUMNS).toContain('SubClasses');
    });
  });

  describe('downloadUserTemplate', () => {
    it('should create a new workbook', () => {
      const mockWorkbook = {};
      (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);

      downloadUserTemplate();

      expect(XLSX.utils.book_new).toHaveBeenCalledTimes(1);
    });

    it('should create worksheet with header row only', () => {
      const mockWorkbook = {};
      const mockWorksheet = {};
      (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.aoa_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);

      downloadUserTemplate();

      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledWith([TEMPLATE_COLUMNS]);
    });

    it('should set column widths', () => {
      const mockWorkbook = {};
      const mockWorksheet: any = {};
      (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.aoa_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);

      downloadUserTemplate();

      expect(mockWorksheet['!cols']).toBeDefined();
      expect(mockWorksheet['!cols']).toHaveLength(TEMPLATE_COLUMNS.length);
      expect(mockWorksheet['!cols'][0]).toEqual({ wch: 25 });
    });

    it('should append worksheet to workbook with correct name', () => {
      const mockWorkbook = {};
      const mockWorksheet = {};
      (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.aoa_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);

      downloadUserTemplate();

      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        mockWorkbook,
        mockWorksheet,
        'User Template'
      );
    });

    it('should write file with correct filename', () => {
      const mockWorkbook = {};
      const mockWorksheet = {};
      (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.aoa_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);

      downloadUserTemplate();

      expect(XLSX.writeFile).toHaveBeenCalledWith(mockWorkbook, 'Employee_Upload_Sheet.xlsx');
    });

    it('should log success message', () => {
      const mockWorkbook = {};
      const mockWorksheet = {};
      (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.aoa_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);

      downloadUserTemplate();

      expect(console.log).toHaveBeenCalledWith('Template downloaded successfully:', 'Employee_Upload_Sheet.xlsx');
    });

    it('should handle errors and log them', () => {
      const error = new Error('Test error');
      (XLSX.utils.book_new as jest.Mock).mockImplementation(() => {
        throw error;
      });

      expect(() => downloadUserTemplate()).toThrow('Test error');
      expect(console.error).toHaveBeenCalledWith('Error downloading template:', error);
    });

    it('should handle xlsx writeFile errors', () => {
      const mockWorkbook = {};
      const mockWorksheet = {};
      (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.aoa_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
      (XLSX.utils.book_append_sheet as jest.Mock).mockImplementation(() => {});
      
      const writeError = new Error('Write error');
      (XLSX.writeFile as jest.Mock).mockImplementation(() => {
        throw writeError;
      });

      expect(() => downloadUserTemplate()).toThrow('Write error');
      expect(console.error).toHaveBeenCalledWith('Error downloading template:', writeError);
    });

    it('should set all column widths to 25', () => {
      const mockWorkbook = {};
      const mockWorksheet: any = {};
      (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.aoa_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
      (XLSX.utils.book_append_sheet as jest.Mock).mockImplementation(() => {});
      (XLSX.writeFile as jest.Mock).mockImplementation(() => {});

      downloadUserTemplate();

      mockWorksheet['!cols'].forEach((col: any) => {
        expect(col).toEqual({ wch: 25 });
      });
    });

    it('should create worksheet with correct number of columns', () => {
      const mockWorkbook = {};
      const mockWorksheet: any = {};
      (XLSX.utils.book_new as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.aoa_to_sheet as jest.Mock).mockReturnValue(mockWorksheet);
      (XLSX.utils.book_append_sheet as jest.Mock).mockImplementation(() => {});
      (XLSX.writeFile as jest.Mock).mockImplementation(() => {});

      downloadUserTemplate();

      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledWith([TEMPLATE_COLUMNS]);
      expect(Array.isArray([TEMPLATE_COLUMNS][0])).toBe(true);
      expect([TEMPLATE_COLUMNS][0].length).toBe(TEMPLATE_COLUMNS.length);
    });
  });
});

