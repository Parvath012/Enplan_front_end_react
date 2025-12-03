import {
  generateFinancialYearName,
  generateWeekName,
  calculateFinancialYearYears,
  calculateYearLabelsAndPositions
} from '../../src/utils/formatUtils';

describe('formatUtils', () => {
  describe('generateFinancialYearName', () => {
    it('should generate financial year name with {yyyy} format', () => {
      const result = generateFinancialYearName('FY {yyyy} - {yyyy}', 2023, 2024);
      expect(result).toBe('FY 2023 - 2024');
    });

    it('should generate financial year name with {yy} format', () => {
      const result = generateFinancialYearName('FY {yy} - {yy}', 2023, 2024);
      expect(result).toBe('FY 23 - 24');
    });

    it('should generate financial year name with mixed formats', () => {
      const result = generateFinancialYearName('FY {yyyy} - {yy}', 2023, 2024);
      expect(result).toBe('FY 2023 - 24');
    });

    it('should handle same year for start and end', () => {
      const result = generateFinancialYearName('FY {yyyy}', 2023, 2023);
      expect(result).toBe('FY 2023');
    });

    it('should handle format without placeholders', () => {
      const result = generateFinancialYearName('Fixed Year Name', 2023, 2024);
      expect(result).toBe('Fixed Year Name');
    });

    it('should handle multiple occurrences of same placeholder', () => {
      const result = generateFinancialYearName('FY {yy} - {yy} - {yy}', 2023, 2024);
      expect(result).toBe('FY 23 - 24 - {yy}');
    });
  });

  describe('generateWeekName', () => {
    const mockDate = new Date('2023-06-15');
    const originalDate = Date;

    beforeEach(() => {
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = originalDate.now;
    });

    afterEach(() => {
      global.Date = originalDate;
    });

    it('should generate week name with {ww} format', () => {
      const result = generateWeekName('W{ww}', '5');
      expect(result).toBe('W5');
    });

    it('should generate week name with {YYYY} format', () => {
      const result = generateWeekName('Week {ww}, {YYYY}', '5');
      expect(result).toBe('Week 5, 2023');
    });

    it('should generate week name with {yyyy} format', () => {
      const result = generateWeekName('Week {ww}, {yyyy}', '5');
      expect(result).toBe('Week 5, 2023');
    });

    it('should generate week name with {YY} format', () => {
      const result = generateWeekName('{yyyy}-W{ww}', '5');
      expect(result).toBe('2023-W5');
    });

    it('should generate week name with {yy} format', () => {
      const result = generateWeekName('{yy}-W{ww}', '5');
      expect(result).toBe('23-W5');
    });

    it('should use provided year instead of current year', () => {
      const result = generateWeekName('Week {ww}, {yyyy}', '5', 2024);
      expect(result).toBe('Week 5, 2024');
    });

    it('should use current year when no year provided', () => {
      const result = generateWeekName('Week {ww}, {yyyy}', '5');
      expect(result).toBe('Week 5, 2023');
    });

    it('should handle multiple occurrences of same placeholder', () => {
      const result = generateWeekName('W{ww}-{yy}-W{ww}', '5');
      expect(result).toBe('W5-23-W5');
    });

    it('should handle format without placeholders', () => {
      const result = generateWeekName('Fixed Week Name', '5');
      expect(result).toBe('Fixed Week Name');
    });
  });

  describe('calculateFinancialYearYears', () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const mockDate = new Date('2023-06-15');
    const originalDate = Date;

    beforeEach(() => {
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = originalDate.now;
    });

    afterEach(() => {
      global.Date = originalDate;
    });

    it('should calculate same year for start month before end month', () => {
      const result = calculateFinancialYearYears('January', 'December', months);
      expect(result.financialYearStart).toBe(2023);
      expect(result.financialYearEnd).toBe(2023);
    });

    it('should calculate same year for consecutive months', () => {
      const result = calculateFinancialYearYears('March', 'April', months);
      expect(result.financialYearStart).toBe(2023);
      expect(result.financialYearEnd).toBe(2023);
    });

    it('should calculate spanning years for start month after end month', () => {
      const result = calculateFinancialYearYears('February', 'January', months);
      expect(result.financialYearStart).toBe(2023);
      expect(result.financialYearEnd).toBe(2024);
    });

    it('should calculate spanning years for December to January', () => {
      const result = calculateFinancialYearYears('December', 'January', months);
      expect(result.financialYearStart).toBe(2023);
      expect(result.financialYearEnd).toBe(2024);
    });

    it('should handle edge case with same start and end month', () => {
      const result = calculateFinancialYearYears('June', 'June', months);
      expect(result.financialYearStart).toBe(2023);
      expect(result.financialYearEnd).toBe(2024);
    });
  });

  describe('calculateYearLabelsAndPositions', () => {
    const mockDate = new Date('2023-06-15');
    const originalDate = Date;

    beforeEach(() => {
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = originalDate.now;
    });

    afterEach(() => {
      global.Date = originalDate;
    });

    it('should calculate labels and positions for historical data', () => {
      const result = calculateYearLabelsAndPositions('2020', '5 years', [2020, 2024]);
      expect(result.left.label).toBe('CY-3');
      expect(result.right.label).toBe('CY+1');
      expect(result.left.position).toBe(168);
      expect(result.right.position).toBe(201.6);
    });

    it('should calculate labels and positions with custom slider values', () => {
      const result = calculateYearLabelsAndPositions('2020', '5 years', [2020, 2024], 2000, 2050, 420);
      expect(result.left.label).toBe('CY-3');
      expect(result.right.label).toBe('CY+1');
      expect(result.left.position).toBe(168);
      expect(result.right.position).toBe(201.6);
    });

    it('should handle current year historical data', () => {
      const result = calculateYearLabelsAndPositions('2023', '3 years', [2023, 2025]);
      expect(result.left.label).toBe('');
      expect(result.right.label).toBe('CY+2');
    });

    it('should handle future historical data', () => {
      const result = calculateYearLabelsAndPositions('2025', '2 years', [2025, 2026]);
      expect(result.left.label).toBe('CY+2');
      expect(result.right.label).toBe('CY+3');
    });

    it('should return empty labels when historicalDataStartFY is empty', () => {
      const result = calculateYearLabelsAndPositions('', '5 years', [2020, 2024]);
      expect(result.left.label).toBe('');
      expect(result.right.label).toBe('');
      expect(result.left.position).toBe(0);
      expect(result.right.position).toBe(0);
    });

    it('should return empty labels when spanningYears is empty', () => {
      const result = calculateYearLabelsAndPositions('2020', '', [2020, 2024]);
      expect(result.left.label).toBe('');
      expect(result.right.label).toBe('');
      expect(result.left.position).toBe(0);
      expect(result.right.position).toBe(0);
    });

    it('should calculate correct positions for different slider values', () => {
      const result = calculateYearLabelsAndPositions('2020', '5 years', [2010, 2030], 2000, 2050, 420);
      expect(result.left.position).toBe(84); // (2010 - 2000) / (2050 - 2000) * 420
      expect(result.right.position).toBe(252); // (2030 - 2000) / (2050 - 2000) * 420
    });

    it('should handle single year spanning', () => {
      const result = calculateYearLabelsAndPositions('2020', '1 years', [2020, 2020]);
      expect(result.left.label).toBe('CY-3');
      expect(result.right.label).toBe('CY-3');
    });

    it('should handle large spanning years', () => {
      const result = calculateYearLabelsAndPositions('2015', '20 years', [2015, 2034]);
      expect(result.left.label).toBe('CY-8');
      expect(result.right.label).toBe('CY+11');
    });
  });
});
