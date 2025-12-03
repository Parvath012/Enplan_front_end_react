import {
  MONTHS,
  WEEK_DAYS,
  SPANNING_YEARS_OPTIONS,
  HISTORICAL_DATA_YEARS,
  SLIDER_MIN,
  SLIDER_MAX,
  SLIDER_RAIL_WIDTH,
  DEFAULT_FINANCIAL_YEAR_FORMAT,
  DEFAULT_WEEK_NAME_FORMAT,
  FINANCIAL_YEAR_FORMAT_OPTIONS,
  WEEK_NAME_FORMAT_OPTIONS,
  DEFAULT_PERIOD_SETUP_DATA
} from '../../src/constants/periodSetupConstants';

describe('periodSetupConstants', () => {
  describe('MONTHS', () => {
    it('should contain all 12 months', () => {
      expect(MONTHS).toHaveLength(12);
      expect(MONTHS).toEqual([
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]);
    });

    it('should have correct month names', () => {
      expect(MONTHS[0]).toBe('January');
      expect(MONTHS[11]).toBe('December');
    });
  });

  describe('WEEK_DAYS', () => {
    it('should contain all 7 days', () => {
      expect(WEEK_DAYS).toHaveLength(7);
      expect(WEEK_DAYS).toEqual([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ]);
    });

    it('should start with Monday', () => {
      expect(WEEK_DAYS[0]).toBe('Monday');
    });

    it('should end with Sunday', () => {
      expect(WEEK_DAYS[6]).toBe('Sunday');
    });
  });

  describe('SPANNING_YEARS_OPTIONS', () => {
    it('should contain expected year options', () => {
      expect(SPANNING_YEARS_OPTIONS).toEqual([
        '5 years', '10 years', '15 years', '20 years', '25 years', '30 years'
      ]);
    });

    it('should have correct length', () => {
      expect(SPANNING_YEARS_OPTIONS).toHaveLength(6);
    });

    it('should contain valid year ranges', () => {
      SPANNING_YEARS_OPTIONS.forEach(option => {
        expect(option).toMatch(/\d+\s+years?/);
      });
    });
  });

  describe('HISTORICAL_DATA_YEARS', () => {
    it('should contain years from 2015 to 2025', () => {
      expect(HISTORICAL_DATA_YEARS).toHaveLength(11);
      expect(HISTORICAL_DATA_YEARS[0]).toBe('2015');
      expect(HISTORICAL_DATA_YEARS[10]).toBe('2025');
    });

    it('should contain consecutive years', () => {
      for (let i = 0; i < HISTORICAL_DATA_YEARS.length; i++) {
        const expectedYear = (2015 + i).toString();
        expect(HISTORICAL_DATA_YEARS[i]).toBe(expectedYear);
      }
    });
  });

  describe('SLIDER constants', () => {
    it('should have correct SLIDER_MIN', () => {
      expect(SLIDER_MIN).toBe(2000);
    });

    it('should have correct SLIDER_MAX', () => {
      expect(SLIDER_MAX).toBe(2050);
    });

    it('should have correct SLIDER_RAIL_WIDTH', () => {
      expect(SLIDER_RAIL_WIDTH).toBe(420);
    });
  });

  describe('DEFAULT_FINANCIAL_YEAR_FORMAT', () => {
    it('should have correct default format', () => {
      expect(DEFAULT_FINANCIAL_YEAR_FORMAT).toBe('FY {yy} - {yy}');
    });
  });

  describe('DEFAULT_WEEK_NAME_FORMAT', () => {
    it('should have correct default format', () => {
      expect(DEFAULT_WEEK_NAME_FORMAT).toBe('W{ww}-{YY}');
    });
  });

  describe('FINANCIAL_YEAR_FORMAT_OPTIONS', () => {
    it('should contain expected format options', () => {
      expect(FINANCIAL_YEAR_FORMAT_OPTIONS).toHaveLength(5);
    });

    it('should have correct structure for each option', () => {
      FINANCIAL_YEAR_FORMAT_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('isDefault');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
        expect(typeof option.isDefault).toBe('boolean');
      });
    });

    it('should have one default option', () => {
      const defaultOptions = FINANCIAL_YEAR_FORMAT_OPTIONS.filter(option => option.isDefault);
      expect(defaultOptions).toHaveLength(1);
      expect(defaultOptions[0].value).toBe('FY {yy} - {yy}');
    });

    it('should contain expected format values', () => {
      const values = FINANCIAL_YEAR_FORMAT_OPTIONS.map(option => option.value);
      expect(values).toContain('FY {yy} - {yy}');
      expect(values).toContain('FY {yyyy} - {yy}');
      expect(values).toContain('FY {yyyy} - {yyyy}');
      expect(values).toContain('FY {yyyy}');
      expect(values).toContain('FY {yy}');
    });
  });

  describe('WEEK_NAME_FORMAT_OPTIONS', () => {
    it('should contain expected format options', () => {
      expect(WEEK_NAME_FORMAT_OPTIONS).toHaveLength(4);
    });

    it('should have correct structure for each option', () => {
      WEEK_NAME_FORMAT_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
      });
    });

    it('should contain expected format values', () => {
      const values = WEEK_NAME_FORMAT_OPTIONS.map(option => option.value);
      expect(values).toContain('W{ww}-{YY}');
      expect(values).toContain('W{ww}');
      expect(values).toContain('Week {ww}, {yyyy}');
      expect(values).toContain('{yyyy}-W{ww}');
    });
  });

  describe('DEFAULT_PERIOD_SETUP_DATA', () => {
    it('should have correct structure', () => {
      expect(DEFAULT_PERIOD_SETUP_DATA).toHaveProperty('financialYear');
      expect(DEFAULT_PERIOD_SETUP_DATA).toHaveProperty('weekSetup');
    });

    it('should have correct financialYear structure', () => {
      const { financialYear } = DEFAULT_PERIOD_SETUP_DATA;
      expect(financialYear).toHaveProperty('name');
      expect(financialYear).toHaveProperty('startMonth');
      expect(financialYear).toHaveProperty('endMonth');
      expect(financialYear).toHaveProperty('historicalDataStartFY');
      expect(financialYear).toHaveProperty('spanningYears');
      expect(financialYear).toHaveProperty('format');
    });

    it('should have correct weekSetup structure', () => {
      const { weekSetup } = DEFAULT_PERIOD_SETUP_DATA;
      expect(weekSetup).toHaveProperty('name');
      expect(weekSetup).toHaveProperty('monthForWeekOne');
      expect(weekSetup).toHaveProperty('startingDayOfWeek');
      expect(weekSetup).toHaveProperty('format');
    });

    it('should have correct default values for financialYear', () => {
      const { financialYear } = DEFAULT_PERIOD_SETUP_DATA;
      expect(financialYear.name).toBe('');
      expect(financialYear.startMonth).toBe('');
      expect(financialYear.endMonth).toBe('');
      expect(financialYear.historicalDataStartFY).toBe('');
      expect(financialYear.spanningYears).toBe('');
      expect(financialYear.format).toBe(DEFAULT_FINANCIAL_YEAR_FORMAT);
    });

    it('should have correct default values for weekSetup', () => {
      const { weekSetup } = DEFAULT_PERIOD_SETUP_DATA;
      expect(weekSetup.name).toBe('');
      expect(weekSetup.monthForWeekOne).toBe('');
      expect(weekSetup.startingDayOfWeek).toBe('');
      expect(weekSetup.format).toBe(DEFAULT_WEEK_NAME_FORMAT);
    });
  });
});
