import {
  calculateProgressPercentage,
  hasCountriesAndCurrenciesData,
  hasPeriodSetupData,
  hasModulesData,
  determineDataPresence,
  getMaxProgressForEntityType,
  getTabCountForEntityType,
  DataPresenceStatus,
  ProgressCalculationParams
} from '../../src/utils/progressCalculationUtils';

describe('progressCalculationUtils', () => {
  describe('calculateProgressPercentage', () => {
    it('should return 100% for rollup entity with all data', () => {
      const params: ProgressCalculationParams = {
        entityType: 'Rollup Entity',
        dataPresence: {
          hasCountriesAndCurrencies: true,
          hasPeriodSetup: true,
          hasModules: true
        },
        currentTab: 2
      };
      
      const result = calculateProgressPercentage(params);
      expect(result).toBe(100);
    });

    it('should return 50% for rollup entity with only countries and currencies', () => {
      const params: ProgressCalculationParams = {
        entityType: 'Rollup Entity',
        dataPresence: {
          hasCountriesAndCurrencies: true,
          hasPeriodSetup: false,
          hasModules: false
        },
        currentTab: 1
      };
      
      const result = calculateProgressPercentage(params);
      expect(result).toBe(50);
    });

    it('should return 0% for rollup entity with no data', () => {
      const params: ProgressCalculationParams = {
        entityType: 'Rollup Entity',
        dataPresence: {
          hasCountriesAndCurrencies: false,
          hasPeriodSetup: false,
          hasModules: false
        },
        currentTab: 0
      };
      
      const result = calculateProgressPercentage(params);
      expect(result).toBe(0);
    });

    it('should return 100% for planning entity with all data', () => {
      const params: ProgressCalculationParams = {
        entityType: 'Planning Entity',
        dataPresence: {
          hasCountriesAndCurrencies: true,
          hasPeriodSetup: true,
          hasModules: true
        },
        currentTab: 3
      };
      
      const result = calculateProgressPercentage(params);
      expect(result).toBe(100);
    });

    it('should return 66.6% for planning entity with countries and period setup', () => {
      const params: ProgressCalculationParams = {
        entityType: 'Planning Entity',
        dataPresence: {
          hasCountriesAndCurrencies: true,
          hasPeriodSetup: true,
          hasModules: false
        },
        currentTab: 2
      };
      
      const result = calculateProgressPercentage(params);
      expect(result).toBe(66.6);
    });

    it('should return 33.3% for planning entity with only countries and currencies', () => {
      const params: ProgressCalculationParams = {
        entityType: 'Planning Entity',
        dataPresence: {
          hasCountriesAndCurrencies: true,
          hasPeriodSetup: false,
          hasModules: false
        },
        currentTab: 1
      };
      
      const result = calculateProgressPercentage(params);
      expect(result).toBe(33.3);
    });

    it('should return 0% for planning entity with only modules data', () => {
      const params: ProgressCalculationParams = {
        entityType: 'Planning Entity',
        dataPresence: {
          hasCountriesAndCurrencies: false,
          hasPeriodSetup: false,
          hasModules: true
        },
        currentTab: 3
      };
      
      const result = calculateProgressPercentage(params);
      expect(result).toBe(0);
    });
  });

  describe('hasCountriesAndCurrenciesData', () => {
    it('should return true for valid arrays', () => {
      const countries = [{ id: 1, name: 'USA' }];
      const currencies = [{ id: 1, name: 'USD' }];
      
      const result = hasCountriesAndCurrenciesData(countries, currencies);
      expect(result).toBe(true);
    });

    it('should return false for empty arrays', () => {
      const result = hasCountriesAndCurrenciesData([], []);
      expect(result).toBe(false);
    });

    it('should return false when one array is empty', () => {
      const result = hasCountriesAndCurrenciesData([{ id: 1 }], []);
      expect(result).toBe(false);
    });

    it('should handle string data with valid JSON', () => {
      const countriesStr = '{"selectedCountries":[{"id":1,"name":"USA"}]}';
      const currenciesStr = '{"selectedCurrencies":[{"id":1,"name":"USD"}]}';
      
      const result = hasCountriesAndCurrenciesData(countriesStr, currenciesStr);
      expect(result).toBe(true);
    });

    it('should handle object data with selectedCountries property', () => {
      const countriesObj = { selectedCountries: [{ id: 1, name: 'USA' }] };
      const currenciesObj = { selectedCurrencies: [{ id: 1, name: 'USD' }] };
      
      const result = hasCountriesAndCurrenciesData(countriesObj, currenciesObj);
      expect(result).toBe(true);
    });

    it('should handle object data with countries property', () => {
      const countriesObj = { countries: [{ id: 1, name: 'USA' }] };
      const currenciesObj = { currencies: [{ id: 1, name: 'USD' }] };
      
      const result = hasCountriesAndCurrenciesData(countriesObj, currenciesObj);
      expect(result).toBe(true);
    });

    it('should handle invalid JSON strings', () => {
      const result = hasCountriesAndCurrenciesData('invalid json', 'invalid json');
      expect(result).toBe(false);
    });

    it('should handle null/undefined data', () => {
      const result = hasCountriesAndCurrenciesData(null, undefined);
      expect(result).toBe(false);
    });
  });

  describe('hasPeriodSetupData', () => {
    it('should return true for complete period setup data', () => {
      const periodSetupData = {
        financialYear: {
          name: 'FY 2024',
          startMonth: 'January',
          endMonth: 'December'
        },
        weekSetup: {
          name: 'Week 1',
          monthForWeekOne: 'January',
          startingDayOfWeek: 'Monday'
        }
      };
      
      const result = hasPeriodSetupData(periodSetupData);
      expect(result).toBe(true);
    });

    it('should return false for incomplete financial year data', () => {
      const periodSetupData = {
        financialYear: {
          name: 'FY 2024',
          startMonth: 'January'
          // missing endMonth
        },
        weekSetup: {
          name: 'Week 1',
          monthForWeekOne: 'January',
          startingDayOfWeek: 'Monday'
        }
      };
      
      const result = hasPeriodSetupData(periodSetupData);
      expect(result).toBe(false);
    });

    it('should return false for incomplete week setup data', () => {
      const periodSetupData = {
        financialYear: {
          name: 'FY 2024',
          startMonth: 'January',
          endMonth: 'December'
        },
        weekSetup: {
          name: 'Week 1',
          monthForWeekOne: 'January'
          // missing startingDayOfWeek
        }
      };
      
      const result = hasPeriodSetupData(periodSetupData);
      expect(result).toBe(false);
    });

    it('should return false for null/undefined data', () => {
      expect(hasPeriodSetupData(null)).toBe(false);
      expect(hasPeriodSetupData(undefined)).toBe(false);
    });

    it('should return false for empty object', () => {
      const result = hasPeriodSetupData({});
      expect(result).toBe(false);
    });
  });

  describe('hasModulesData', () => {
    it('should return true for valid array', () => {
      const modules = [{ id: 1, name: 'Module 1' }];
      const result = hasModulesData(modules);
      expect(result).toBe(true);
    });

    it('should return false for empty array', () => {
      const result = hasModulesData([]);
      expect(result).toBe(false);
    });

    it('should return true for valid JSON string', () => {
      const modulesStr = '[{"id":1,"name":"Module 1"}]';
      const result = hasModulesData(modulesStr);
      expect(result).toBe(true);
    });

    it('should return false for invalid JSON string', () => {
      const result = hasModulesData('invalid json');
      expect(result).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(hasModulesData(null)).toBe(false);
      expect(hasModulesData(undefined)).toBe(false);
    });
  });

  describe('determineDataPresence', () => {
    it('should return correct data presence status', () => {
      const entityData = { modules: '[{"id":1}]' };
      const periodSetupData = {
        financialYear: { name: 'FY 2024', startMonth: 'Jan', endMonth: 'Dec' },
        weekSetup: { name: 'Week 1', monthForWeekOne: 'Jan', startingDayOfWeek: 'Mon' }
      };
      const selectedCountries = [{ id: 1, name: 'USA' }];
      const selectedCurrencies = [{ id: 1, name: 'USD' }];

      const result = determineDataPresence(entityData, periodSetupData, selectedCountries, selectedCurrencies);
      
      expect(result).toEqual({
        hasCountriesAndCurrencies: true,
        hasPeriodSetup: true,
        hasModules: true
      });
    });

    it('should return false for all when no data provided', () => {
      const result = determineDataPresence(null, null, null, null);
      
      expect(result).toEqual({
        hasCountriesAndCurrencies: false,
        hasPeriodSetup: false,
        hasModules: false
      });
    });
  });

  describe('getMaxProgressForEntityType', () => {
    it('should return 100 for any entity type', () => {
      expect(getMaxProgressForEntityType('Planning Entity')).toBe(100);
      expect(getMaxProgressForEntityType('Rollup Entity')).toBe(100);
    });
  });

  describe('getTabCountForEntityType', () => {
    it('should return 3 for Planning Entity', () => {
      expect(getTabCountForEntityType('Planning Entity')).toBe(3);
    });

    it('should return 2 for Rollup Entity', () => {
      expect(getTabCountForEntityType('Rollup Entity')).toBe(2);
    });
  });
});

