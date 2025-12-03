import { BulkEditService, BulkEditDataType } from '../../src/services/BulkEditService';
import * as cellFormattingHandlers from '../../src/utils/cellFormattingHandlers';

// Mock the parseNumberString utility function
jest.mock('../../src/utils/cellFormattingHandlers', () => {
  const original = jest.requireActual('../../src/utils/cellFormattingHandlers');
  return {
    ...original,
    parseNumberString: jest.fn(),
  };
});

describe('BulkEditService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Default implementation of parseNumberString
    (cellFormattingHandlers.parseNumberString as jest.Mock).mockImplementation((value: any) => {
      if (typeof value === 'string') {
        return Number(value.replace(/,/g, ''));
      }
      return Number(value);
    });
  });

  describe('detectDataType', () => {
    it('should detect text data type by default', () => {
      const result = BulkEditService.detectDataType([]);
      expect(result).toEqual({ dataType: BulkEditDataType.Text });
    });

    it('should detect Status column as Select type', () => {
      const result = BulkEditService.detectDataType([
        { field: 'Status', value: 'Open' },
      ]);

      expect(result).toEqual({
        dataType: BulkEditDataType.Select,
        options: ['Open', 'In Progress', 'Closed'],
      });
    });

    it('should detect date columns', () => {
      const result1 = BulkEditService.detectDataType([
        { field: 'BillDate', value: '2023-01-01' },
      ]);

      const result2 = BulkEditService.detectDataType([
        { field: 'InvoiceDate', value: '2023-01-01' },
      ]);

      expect(result1).toEqual({
        dataType: BulkEditDataType.Date,
        dateFormat: 'YYYY-MM-DD',
      });

      expect(result2).toEqual({
        dataType: BulkEditDataType.Date,
        dateFormat: 'YYYY-MM-DD',
      });
    });

    it('should return text type when cells are from different columns', () => {
      const result = BulkEditService.detectDataType([
        { field: 'Name', value: 'John' },
        { field: 'Age', value: 30 },
      ]);

      expect(result).toEqual({
        dataType: BulkEditDataType.Text,
        options: [],
      });
    });

    it('should detect currency cells', () => {
      const result = BulkEditService.detectDataType([
        { field: 'Price', value: '100.00', currency: '$' },
        { field: 'Price', value: '200.00', currency: '$' },
      ]);

      expect(result).toEqual({
        dataType: BulkEditDataType.Currency,
        currencyFormat: '$',
      });
    });

    it('should detect numeric cells', () => {
      (cellFormattingHandlers.parseNumberString as jest.Mock)
        .mockReturnValueOnce(10)
        .mockReturnValueOnce(20);

      const result = BulkEditService.detectDataType([
        { field: 'Quantity', value: 10 },
        { field: 'Quantity', value: 20 },
      ]);

      expect(result).toEqual({ dataType: BulkEditDataType.Number });
    });

    it('should detect text cells when not all values are numeric', () => {
      (cellFormattingHandlers.parseNumberString as jest.Mock)
        .mockReturnValueOnce(10)
        .mockReturnValueOnce(NaN);

      const result = BulkEditService.detectDataType([
        { field: 'Mixed', value: 10 },
        { field: 'Mixed', value: 'text' },
      ]);

      expect(result).toEqual({ dataType: BulkEditDataType.Text });
    });

    it('should use rawValue when available for numeric detection', () => {
      const result = BulkEditService.detectDataType([
        { field: 'Amount', value: '$100.00', rawValue: 100 },
        { field: 'Amount', value: '$200.00', rawValue: 200 },
      ]);

      expect(result).toEqual({ dataType: BulkEditDataType.Number });
    });
  });

  describe('validateValue', () => {
    it('should validate text values as always valid', () => {
      const config = { dataType: BulkEditDataType.Text };
      expect(BulkEditService.validateValue('any text', config)).toEqual({ isValid: true });
      expect(BulkEditService.validateValue('', config)).toEqual({ isValid: true });
    });

    it('should validate required fields', () => {
      const config = { dataType: BulkEditDataType.Text, required: true };
      expect(BulkEditService.validateValue('', config)).toEqual({ 
        isValid: false, 
        errorMessage: 'This field is required' 
      });
      expect(BulkEditService.validateValue('text', config)).toEqual({ isValid: true });
    });

    it('should validate numeric values', () => {
      const config = { dataType: BulkEditDataType.Number };
      (cellFormattingHandlers.parseNumberString as jest.Mock).mockReturnValue(50);
      expect(BulkEditService.validateValue('50', config)).toEqual({ isValid: true });

      (cellFormattingHandlers.parseNumberString as jest.Mock).mockReturnValue(NaN);
      expect(BulkEditService.validateValue('not-a-number', config)).toEqual({
        isValid: false,
        errorMessage: 'Please enter a valid number',
      });
    });

    it('should validate numeric values with min/max constraints', () => {
      const config = { dataType: BulkEditDataType.Number, min: 10, max: 100 };
      
      // Test with value below minimum
      (cellFormattingHandlers.parseNumberString as jest.Mock).mockReturnValue(5);
      expect(BulkEditService.validateValue('5', config)).toEqual({
        isValid: false,
        errorMessage: 'Value must be at least 10',
      });

      // Test with value above maximum
      (cellFormattingHandlers.parseNumberString as jest.Mock).mockReturnValue(150);
      expect(BulkEditService.validateValue('150', config)).toEqual({
        isValid: false,
        errorMessage: 'Value must be at most 100',
      });

      // Test with value within range
      (cellFormattingHandlers.parseNumberString as jest.Mock).mockReturnValue(50);
      expect(BulkEditService.validateValue('50', config)).toEqual({ isValid: true });
    });

    it('should validate currency values', () => {
      const config = { dataType: BulkEditDataType.Currency };
      
      // Valid currency
      (cellFormattingHandlers.parseNumberString as jest.Mock).mockReturnValue(100.50);
      expect(BulkEditService.validateValue('$100.50', config)).toEqual({ isValid: true });
      
      // Invalid currency
      (cellFormattingHandlers.parseNumberString as jest.Mock).mockReturnValue(NaN);
      expect(BulkEditService.validateValue('not-money', config)).toEqual({
        isValid: false,
        errorMessage: 'Please enter a valid number',
      });
    });

    it('should validate date values', () => {
      const config = { dataType: BulkEditDataType.Date };
      
      // Valid date
      expect(BulkEditService.validateValue('2023-01-01', config)).toEqual({ isValid: true });
      
      // Invalid date
      expect(BulkEditService.validateValue('not-a-date', config)).toEqual({
        isValid: false,
        errorMessage: 'Please enter a valid date',
      });
    });

    it('should validate select options', () => {
      const config = { 
        dataType: BulkEditDataType.Select, 
        options: ['Option 1', 'Option 2', 'Option 3'] 
      };
      
      // Valid option
      expect(BulkEditService.validateValue('Option 1', config)).toEqual({ isValid: true });
      
      // Invalid option
      expect(BulkEditService.validateValue('Option 4', config)).toEqual({
        isValid: false,
        errorMessage: 'Please select a valid option',
      });
    });
  });

  describe('formatValue', () => {
    it('should return text values unchanged', () => {
      const config = { dataType: BulkEditDataType.Text };
      expect(BulkEditService.formatValue('text value', config)).toBe('text value');
    });

    it('should return select values unchanged', () => {
      const config = { 
        dataType: BulkEditDataType.Select,
        options: ['Option 1', 'Option 2']
      };
      expect(BulkEditService.formatValue('Option 1', config)).toBe('Option 1');
    });

    it('should parse numeric values', () => {
      const config = { dataType: BulkEditDataType.Number };
      (cellFormattingHandlers.parseNumberString as jest.Mock).mockReturnValue(123.45);
      expect(BulkEditService.formatValue('123.45', config)).toBe(123.45);
    });

    it('should parse currency values', () => {
      const config = { 
        dataType: BulkEditDataType.Currency,
        currencyFormat: '$'
      };
      (cellFormattingHandlers.parseNumberString as jest.Mock).mockReturnValue(123.45);
      expect(BulkEditService.formatValue('$123.45', config)).toBe(123.45);
    });

    it('should format date values correctly', () => {
      const config = { 
        dataType: BulkEditDataType.Date,
        dateFormat: 'YYYY-MM-DD'
      };
      
      // Create a specific date for testing
      const testDate = new Date(2023, 0, 15); // Jan 15, 2023
      
      // Mock Date constructor
      const originalDate = global.Date;
      global.Date = function(value: any) {
        if (value) {
          return new originalDate(value);
        }
        return testDate;
      } as any;
      
      // Expected format: M/D/YYYY 12:00:00 AM
      expect(BulkEditService.formatValue('2023-01-15', config)).toBe('1/15/2023 12:00:00 AM');
      
      // Restore original Date
      global.Date = originalDate;
    });

    it('should handle invalid date values gracefully', () => {
      const config = { dataType: BulkEditDataType.Date };
      expect(BulkEditService.formatValue('not-a-date', config)).toBe('not-a-date');
    });

    it('should handle date formatting errors by returning original value', () => {
      const config = { dataType: BulkEditDataType.Date };
      
      // Mock Date constructor to throw an error
      const originalDate = global.Date;
      global.Date = function() {
        throw new Error('Date error');
      } as any;
      
      // Should return the original value when an error occurs
      expect(BulkEditService.formatValue('2023-01-15', config)).toBe('2023-01-15');
      
      // Restore original Date
      global.Date = originalDate;
    });
  });
});
