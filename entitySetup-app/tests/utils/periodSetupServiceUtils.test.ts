import {
  mapDtoToModel,
  stripQuotes,
  parseBool,
  getValueByIndex
} from '../../src/utils/periodSetupServiceUtils';
import { PeriodSetupDto } from '../../src/services/periodSetupService';

// Mock data
const mockPeriodSetupDto: PeriodSetupDto = {
  Id: 'uuid-1',
  EntityId: 'entity-1',
  FinancialYearName: 'FY 19-20',
  StartMonth: 'April',
  EndMonth: 'March',
  HistoricalYearSpan: '10',
  UserViewYearSpan: '5',
  WeekName: 'W01-20',
  MonthForWeekOne: 'January',
  StartingDayOfWeek: 'Monday',
  IsDeleted: 'false',
  CreatedAt: '2023-01-01',
  LastUpdatedAt: '2023-01-01'
};

describe('periodSetupServiceUtils', () => {
  describe('mapDtoToModel', () => {
    it('should map DTO to Model correctly', () => {
      const result = mapDtoToModel(mockPeriodSetupDto);
      
      expect(result).toEqual({
        id: 'uuid-1',
        entityId: 'entity-1',
        financialYearName: 'FY 19-20',
        startMonth: 'April',
        endMonth: 'March',
        historicalYearSpan: '10',
        userViewYearSpan: '5',
        weekName: 'W01-20',
        monthForWeekOne: 'January',
        startingDayOfWeek: 'Monday',
        isDeleted: 'false',
        createdAt: '2023-01-01',
        lastUpdatedAt: '2023-01-01'
      });
    });

    it('should handle DTO with different values', () => {
      const differentDto: PeriodSetupDto = {
        Id: 'uuid-2',
        EntityId: 'entity-2',
        FinancialYearName: 'FY 20-21',
        StartMonth: 'May',
        EndMonth: 'April',
        HistoricalYearSpan: '15',
        UserViewYearSpan: '8',
        WeekName: 'W02-21',
        MonthForWeekOne: 'February',
        StartingDayOfWeek: 'Tuesday',
        IsDeleted: 'true',
        CreatedAt: '2023-01-02',
        LastUpdatedAt: '2023-01-02'
      };
      
      const result = mapDtoToModel(differentDto);
      
      expect(result.id).toBe('uuid-2');
      expect(result.entityId).toBe('entity-2');
      expect(result.financialYearName).toBe('FY 20-21');
      expect(result.startMonth).toBe('May');
      expect(result.endMonth).toBe('April');
      expect(result.historicalYearSpan).toBe('15');
      expect(result.userViewYearSpan).toBe('8');
      expect(result.weekName).toBe('W02-21');
      expect(result.monthForWeekOne).toBe('February');
      expect(result.startingDayOfWeek).toBe('Tuesday');
      expect(result.isDeleted).toBe('true');
      expect(result.createdAt).toBe('2023-01-02');
      expect(result.lastUpdatedAt).toBe('2023-01-02');
    });

    it('should handle DTO with empty strings', () => {
      const emptyDto: PeriodSetupDto = {
        Id: '',
        EntityId: '',
        FinancialYearName: '',
        StartMonth: '',
        EndMonth: '',
        HistoricalYearSpan: '',
        UserViewYearSpan: '',
        WeekName: '',
        MonthForWeekOne: '',
        StartingDayOfWeek: '',
        IsDeleted: '',
        CreatedAt: '',
        LastUpdatedAt: ''
      };
      
      const result = mapDtoToModel(emptyDto);
      
      expect(result.id).toBe('');
      expect(result.entityId).toBe('');
      expect(result.financialYearName).toBe('');
      expect(result.startMonth).toBe('');
      expect(result.endMonth).toBe('');
      expect(result.historicalYearSpan).toBe('');
      expect(result.userViewYearSpan).toBe('');
      expect(result.weekName).toBe('');
      expect(result.monthForWeekOne).toBe('');
      expect(result.startingDayOfWeek).toBe('');
      expect(result.isDeleted).toBe('');
      expect(result.createdAt).toBe('');
      expect(result.lastUpdatedAt).toBe('');
    });
  });

  describe('stripQuotes', () => {
    it('should strip single quotes from string', () => {
      expect(stripQuotes("'test'")).toBe('test');
      expect(stripQuotes("'hello world'")).toBe('hello world');
    });

    it('should strip double quotes from string', () => {
      expect(stripQuotes('"test"')).toBe('test');
      expect(stripQuotes('"hello world"')).toBe('hello world');
    });

    it('should not strip quotes if only one side has quote', () => {
      expect(stripQuotes('"test')).toBe('"test');
      expect(stripQuotes("test'")).toBe("test'");
    });

    it('should not strip quotes if quotes are in the middle', () => {
      expect(stripQuotes('te"st')).toBe('te"st');
      expect(stripQuotes("te'st")).toBe("te'st");
    });

    it('should handle empty string', () => {
      expect(stripQuotes('')).toBe('');
    });

    it('should handle string with only quotes', () => {
      expect(stripQuotes('""')).toBe('');
      expect(stripQuotes("''")).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(stripQuotes(null as any)).toBe(null);
      expect(stripQuotes(undefined as any)).toBe(undefined);
    });

    it('should trim whitespace before checking quotes', () => {
      expect(stripQuotes(' "test" ')).toBe('test');
      expect(stripQuotes(" 'test' ")).toBe('test');
    });

    it('should handle mixed quote types', () => {
      expect(stripQuotes('"test\'')).toBe('"test\'');
      expect(stripQuotes("'test\"")).toBe("'test\"");
    });
  });

  describe('parseBool', () => {
    it('should return true for boolean true', () => {
      expect(parseBool(true)).toBe(true);
    });

    it('should return false for boolean false', () => {
      expect(parseBool(false)).toBe(false);
    });

    it('should return true for string "true"', () => {
      expect(parseBool('true')).toBe(true);
      expect(parseBool('TRUE')).toBe(true);
      expect(parseBool('True')).toBe(true);
    });

    it('should return false for string "false"', () => {
      expect(parseBool('false')).toBe(false);
      expect(parseBool('FALSE')).toBe(false);
      expect(parseBool('False')).toBe(false);
    });

    it('should return false for other strings', () => {
      expect(parseBool('yes')).toBe(false);
      expect(parseBool('no')).toBe(false);
      expect(parseBool('1')).toBe(false);
      expect(parseBool('0')).toBe(false);
      expect(parseBool('hello')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(parseBool(null)).toBe(false);
      expect(parseBool(undefined)).toBe(false);
    });

    it('should trim whitespace before parsing', () => {
      expect(parseBool(' true ')).toBe(true);
      expect(parseBool(' false ')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(parseBool('')).toBe(false);
    });

    it('should handle numbers', () => {
      expect(parseBool(1)).toBe(false);
      expect(parseBool(0)).toBe(false);
    });
  });

  describe('getValueByIndex', () => {
    const testArray = ['first', 'second', 'third', 'fourth'];

    it('should return correct value for valid index', () => {
      expect(getValueByIndex(testArray, 0)).toBe('first');
      expect(getValueByIndex(testArray, 1)).toBe('second');
      expect(getValueByIndex(testArray, 2)).toBe('third');
      expect(getValueByIndex(testArray, 3)).toBe('fourth');
    });

    it('should return undefined for negative index', () => {
      expect(getValueByIndex(testArray, -1)).toBeUndefined();
      expect(getValueByIndex(testArray, -5)).toBeUndefined();
    });

    it('should return undefined for index beyond array length', () => {
      expect(getValueByIndex(testArray, 4)).toBeUndefined();
      expect(getValueByIndex(testArray, 10)).toBeUndefined();
    });

    it('should handle empty array', () => {
      expect(getValueByIndex([], 0)).toBeUndefined();
      expect(getValueByIndex([], -1)).toBeUndefined();
    });

    it('should handle single element array', () => {
      const singleArray = ['only'];
      expect(getValueByIndex(singleArray, 0)).toBe('only');
      expect(getValueByIndex(singleArray, 1)).toBeUndefined();
    });

    it('should handle array with undefined values', () => {
      const arrayWithUndefined = ['first', undefined, 'third'];
      expect(getValueByIndex(arrayWithUndefined, 0)).toBe('first');
      expect(getValueByIndex(arrayWithUndefined, 1)).toBeUndefined();
      expect(getValueByIndex(arrayWithUndefined, 2)).toBe('third');
    });
  });
});
