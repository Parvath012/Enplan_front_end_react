import {
  generateFinancialYearName,
  generateWeekName,
  calculateFinancialYearYears,
  calculateYearLabelsAndPositions
} from '../../src/utils/formatUtils';

// Mock Date to get consistent test results
const mockDate = new Date(2023, 5, 15); // June 15, 2023
const originalDate = global.Date;

describe('formatUtils', () => {
  beforeEach(() => {
    // Mock Date constructor to return a consistent date
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    global.Date.UTC = originalDate.UTC;
    global.Date.parse = originalDate.parse;
    global.Date.prototype = originalDate.prototype;
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  describe('generateFinancialYearName', () => {
    it('should handle FY {yyyy} - {yyyy} format', () => {
      const result = generateFinancialYearName('FY {yyyy} - {yyyy}', 2023, 2024);
      expect(result).toBe('FY 2023 - 2024');
    });

    it('should handle FY {yyyy} - {yy} format', () => {
      const result = generateFinancialYearName('FY {yyyy} - {yy}', 2023, 2024);
      expect(result).toBe('FY 2023 - 24');
    });

    it('should handle FY {yy} - {yy} format', () => {
      const result = generateFinancialYearName('FY {yy} - {yy}', 2023, 2024);
      expect(result).toBe('FY 23 - 24');
    });

    it('should handle single {yyyy} format', () => {
      const result = generateFinancialYearName('FY {yyyy}', 2023, 2024);
      expect(result).toBe('FY 2023');
    });

    it('should handle single {yy} format', () => {
      const result = generateFinancialYearName('FY {yy}', 2023, 2024);
      expect(result).toBe('FY 23');
    });

    it('should handle multiple occurrences of the same pattern', () => {
      const result = generateFinancialYearName('FY {yyyy} - {yyyy} (FY {yyyy})', 2023, 2024);
      expect(result).toBe('FY 2023 - 2024 (FY {yyyy})');
    });

    it('should handle format with no placeholders', () => {
      const result = generateFinancialYearName('Fixed Format', 2023, 2024);
      expect(result).toBe('Fixed Format');
    });

    it('should handle empty format string', () => {
      const result = generateFinancialYearName('', 2023, 2024);
      expect(result).toBe('');
    });

    it('should handle format with mixed patterns', () => {
      const result = generateFinancialYearName('FY {yyyy} - {yy} ({yyyy})', 2023, 2024);
      expect(result).toBe('FY 2023 - 24 ({yyyy})');
    });

    it('should handle large year numbers', () => {
      const result = generateFinancialYearName('FY {yyyy} - {yyyy}', 2050, 2051);
      expect(result).toBe('FY 2050 - 2051');
    });

    it('should handle zero years', () => {
      const result = generateFinancialYearName('FY {yyyy} - {yyyy}', 0, 1);
      expect(result).toBe('FY 0 - 1');
    });
  });

  describe('generateWeekName', () => {
    it('should generate week name with {ww} placeholder', () => {
      const result = generateWeekName('Week {ww}', '5');
      expect(result).toBe('Week 5');
    });

    it('should generate week name with {YYYY} placeholder', () => {
      const result = generateWeekName('Week {ww} of {YYYY}', '10', 2023);
      expect(result).toBe('Week 10 of 2023');
    });

    it('should generate week name with {yyyy} placeholder', () => {
      const result = generateWeekName('Week {ww} of {yyyy}', '15', 2023);
      expect(result).toBe('Week 15 of 2023');
    });

    it('should generate week name with {YY} placeholder', () => {
      const result = generateWeekName('Week {ww} of {YY}', '20', 2023);
      expect(result).toBe('Week 20 of 23');
    });

    it('should generate week name with {yy} placeholder', () => {
      const result = generateWeekName('Week {ww} of {yy}', '25', 2023);
      expect(result).toBe('Week 25 of 23');
    });

    it('should use current year when year is not provided', () => {
      const result = generateWeekName('Week {ww} of {yyyy}');
      expect(result).toBe('Week 1 of 2023'); // Uses mocked current year
    });

    it('should use default week "1" when week is not provided', () => {
      const result = generateWeekName('Week {ww} of {yyyy}', undefined, 2023);
      expect(result).toBe('Week 1 of 2023');
    });

    it('should handle multiple placeholders', () => {
      const result = generateWeekName('Week {ww} of {yyyy} ({YY})', '30', 2023);
      expect(result).toBe('Week 30 of 2023 (23)');
    });

    it('should handle format with no placeholders', () => {
      const result = generateWeekName('Fixed Week Format', '5', 2023);
      expect(result).toBe('Fixed Week Format');
    });

    it('should handle empty format string', () => {
      const result = generateWeekName('', '5', 2023);
      expect(result).toBe('');
    });

    it('should handle zero week number', () => {
      const result = generateWeekName('Week {ww}', '0', 2023);
      expect(result).toBe('Week 0');
    });

    it('should handle large week numbers', () => {
      const result = generateWeekName('Week {ww}', '52', 2023);
      expect(result).toBe('Week 52');
    });
  });

  describe('calculateFinancialYearYears', () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    it('should calculate same year for consecutive months', () => {
      const result = calculateFinancialYearYears('January', 'December', months);
      expect(result).toEqual({
        financialYearStart: 2023,
        financialYearEnd: 2023
      });
    });

    it('should calculate same year for months in order', () => {
      const result = calculateFinancialYearYears('March', 'August', months);
      expect(result).toEqual({
        financialYearStart: 2023,
        financialYearEnd: 2023
      });
    });

    it('should calculate spanning years for reverse order months', () => {
      const result = calculateFinancialYearYears('December', 'January', months);
      expect(result).toEqual({
        financialYearStart: 2023,
        financialYearEnd: 2024
      });
    });

    it('should calculate spanning years for months that cross year boundary', () => {
      const result = calculateFinancialYearYears('October', 'March', months);
      expect(result).toEqual({
        financialYearStart: 2023,
        financialYearEnd: 2024
      });
    });

    it('should handle same start and end month', () => {
      const result = calculateFinancialYearYears('June', 'June', months);
      expect(result).toEqual({
        financialYearStart: 2023,
        financialYearEnd: 2024
      });
    });

    it('should handle months not found in array', () => {
      const result = calculateFinancialYearYears('InvalidMonth', 'AnotherInvalid', months);
      expect(result).toEqual({
        financialYearStart: 2023,
        financialYearEnd: 2024
      });
    });

    it('should handle empty months array', () => {
      const result = calculateFinancialYearYears('January', 'December', []);
      expect(result).toEqual({
        financialYearStart: 2023,
        financialYearEnd: 2024
      });
    });
  });

  describe('calculateYearLabelsAndPositions', () => {
    it('should calculate labels and positions for historical data', () => {
      const result = calculateYearLabelsAndPositions(
        '2020',
        '5 years',
        [2020, 2024],
        2000,
        2050,
        420
      );

      expect(result.left.label).toBe('CY-3'); // 2020 - 2023 = -3
      expect(result.right.label).toBe('CY+1'); // 2024 - 2023 = +1
      expect(result.left.position).toBe(168); // (2020 - 2000) / (2050 - 2000) * 420 = 168
      expect(result.right.position).toBe(201.6); // (2024 - 2000) / (2050 - 2000) * 420 = 201.6
    });

    it('should handle current year data', () => {
      const result = calculateYearLabelsAndPositions(
        '2023',
        '1 year',
        [2023, 2023],
        2000,
        2050,
        420
      );

      expect(result.left.label).toBe(''); // 2023 - 2023 = 0
      expect(result.right.label).toBe(''); // 2023 - 2023 = 0
      expect(result.left.position).toBeCloseTo(193.2, 1); // (2023 - 2000) / (2050 - 2000) * 420 = 193.2
      expect(result.right.position).toBeCloseTo(193.2, 1); // Same as left
    });

    it('should handle future data', () => {
      const result = calculateYearLabelsAndPositions(
        '2025',
        '3 years',
        [2025, 2027],
        2000,
        2050,
        420
      );

      expect(result.left.label).toBe('CY+2'); // 2025 - 2023 = +2
      expect(result.right.label).toBe('CY+4'); // 2027 - 2023 = +4
    });

    it('should handle custom slider min/max values', () => {
      const result = calculateYearLabelsAndPositions(
        '2010',
        '2 years',
        [2010, 2011],
        2010,
        2020,
        300
      );

      expect(result.left.label).toBe('CY-13'); // 2010 - 2023 = -13
      expect(result.right.label).toBe('CY-12'); // 2011 - 2023 = -12
      expect(result.left.position).toBe(0); // (2010 - 2010) / (2020 - 2010) * 300 = 0
      expect(result.right.position).toBe(30); // (2011 - 2010) / (2020 - 2010) * 300 = 30
    });

    it('should handle custom rail width', () => {
      const result = calculateYearLabelsAndPositions(
        '2020',
        '1 year',
        [2020, 2020],
        2000,
        2050,
        600
      );

      expect(result.left.position).toBe(240); // (2020 - 2000) / (2050 - 2000) * 600 = 240
      expect(result.right.position).toBe(240); // Same as left
    });

    it('should return empty labels when historicalDataStartFY is missing', () => {
      const result = calculateYearLabelsAndPositions(
        '',
        '5 years',
        [2020, 2024],
        2000,
        2050,
        420
      );

      expect(result.left.label).toBe('');
      expect(result.right.label).toBe('');
      expect(result.left.position).toBe(0);
      expect(result.right.position).toBe(0);
    });

    it('should return empty labels when spanningYears is missing', () => {
      const result = calculateYearLabelsAndPositions(
        '2020',
        '',
        [2020, 2024],
        2000,
        2050,
        420
      );

      expect(result.left.label).toBe('');
      expect(result.right.label).toBe('');
      expect(result.left.position).toBe(0);
      expect(result.right.position).toBe(0);
    });

    it('should handle invalid historicalDataStartFY', () => {
      const result = calculateYearLabelsAndPositions(
        'invalid',
        '5 years',
        [2020, 2024],
        2000,
        2050,
        420
      );

      expect(result.left.label).toBe('CY+NaN');
      expect(result.right.label).toBe('CY+NaN');
      expect(result.left.position).toBe(168);
      expect(result.right.position).toBe(201.6);
    });

    it('should handle invalid spanningYears', () => {
      const result = calculateYearLabelsAndPositions(
        '2020',
        'invalid years',
        [2020, 2024],
        2000,
        2050,
        420
      );

      expect(result.left.label).toBe('CY-3');
      expect(result.right.label).toBe('CY+NaN');
      expect(result.left.position).toBe(168);
      expect(result.right.position).toBe(201.6);
    });

    it('should handle edge case with very large years', () => {
      const result = calculateYearLabelsAndPositions(
        '2040',
        '10 years',
        [2040, 2049],
        2000,
        2100,
        500
      );

      expect(result.left.label).toBe('CY+17'); // 2040 - 2023 = +17
      expect(result.right.label).toBe('CY+26'); // 2049 - 2023 = +26
    });

    it('should handle edge case with very small years', () => {
      const result = calculateYearLabelsAndPositions(
        '1990',
        '5 years',
        [1990, 1994],
        1990,
        2000,
        200
      );

      expect(result.left.label).toBe('CY-33'); // 1990 - 2023 = -33
      expect(result.right.label).toBe('CY-29'); // 1994 - 2023 = -29
    });
  });
});
