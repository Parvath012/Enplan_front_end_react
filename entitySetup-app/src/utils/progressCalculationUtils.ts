// Progress calculation utilities for entity configuration
// This module provides reusable logic for calculating progress based on data presence

export interface DataPresenceStatus {
  hasCountriesAndCurrencies: boolean;
  hasPeriodSetup: boolean;
  hasModules: boolean;
}

export interface ProgressCalculationParams {
  entityType: 'Planning Entity' | 'Rollup Entity';
  dataPresence: DataPresenceStatus;
  currentTab: number;
}

/**
 * Calculates progress percentage based on data presence and entity type
 * @param params - Progress calculation parameters
 * @returns Progress percentage (0-100)
 */
export function calculateProgressPercentage(params: ProgressCalculationParams): number {
  const { entityType, dataPresence, currentTab } = params;
  const isRollupEntity = entityType === 'Rollup Entity';

  console.log('calculateProgressPercentage called with:', {
    entityType,
    dataPresence,
    currentTab,
    isRollupEntity
  });

  const { hasCountriesAndCurrencies, hasPeriodSetup, hasModules } = dataPresence;

  if (isRollupEntity) {
    // Rollup Entity: Only Countries and Currencies (50%) and Period Setup (100%)
    if (hasCountriesAndCurrencies && hasPeriodSetup) {
      return 100;
    } else if (hasCountriesAndCurrencies) {
      return 50;
    } else {
      return 0;
    }
  } else if (hasCountriesAndCurrencies && hasPeriodSetup && hasModules) {
    // Planning Entity: Countries and Currencies (33.3%), Period Setup (66.6%), Modules (100%)
    return 100;
  } else if (hasCountriesAndCurrencies && hasPeriodSetup) {
    return 66.6;
  } else if (hasCountriesAndCurrencies) {
    return 33.3;
  } else {
    // If only modules data exists without countries/currencies or period setup, show 0%
    // because countries/currencies and period setup are required first
    return 0;
  }
}

/**
 * Checks if Countries and Currencies data exists
 * @param selectedCountries - Array of selected countries
 * @param selectedCurrencies - Array of selected currencies
 * @returns True if data exists
 */
export function hasCountriesAndCurrenciesData(
  selectedCountries: any,
  selectedCurrencies: any
): boolean {
  // Handle different data formats
  let countries = [];
  let currencies = [];
  
  try {
    if (Array.isArray(selectedCountries)) {
      countries = selectedCountries;
    } else if (typeof selectedCountries === 'string') {
      const parsed = JSON.parse(selectedCountries || '{}');
      // Extract selectedCountries array from the JSON object
      countries = parsed.selectedCountries || [];
    } else if (selectedCountries && typeof selectedCountries === 'object') {
      // Handle case where data is already parsed but might be an object with selectedCountries property
      countries = selectedCountries.selectedCountries || selectedCountries.countries || [];
    } else {
      countries = [];
    }
  } catch (error) {
    console.warn('Error parsing countries data:', error);
    countries = [];
  }
  
  try {
    if (Array.isArray(selectedCurrencies)) {
      currencies = selectedCurrencies;
    } else if (typeof selectedCurrencies === 'string') {
      const parsed = JSON.parse(selectedCurrencies || '{}');
      // Extract selectedCurrencies array from the JSON object
      currencies = parsed.selectedCurrencies || [];
    } else if (selectedCurrencies && typeof selectedCurrencies === 'object') {
      // Handle case where data is already parsed but might be an object with selectedCurrencies property
      currencies = selectedCurrencies.selectedCurrencies || selectedCurrencies.currencies || [];
    } else {
      currencies = [];
    }
  } catch (error) {
    console.warn('Error parsing currencies data:', error);
    currencies = [];
  }
  
  const hasData = countries.length > 0 && currencies.length > 0;
  console.log('hasCountriesAndCurrenciesData:', {
    selectedCountries: selectedCountries,
    selectedCurrencies: selectedCurrencies,
    countries: countries,
    currencies: currencies,
    hasData
  });
  return hasData;
}

/**
 * Checks if Period Setup data exists
 * @param periodSetupData - Period setup data object
 * @returns True if data exists
 */
export function hasPeriodSetupData(periodSetupData: any): boolean {
  if (!periodSetupData) {
    console.log('hasPeriodSetupData: No period setup data');
    return false;
  }
  
  // Check if essential period setup fields have values
  const hasFinancialYear = !!(periodSetupData.financialYear?.name && 
    periodSetupData.financialYear?.startMonth && 
    periodSetupData.financialYear?.endMonth);
    
  const hasWeekSetup = !!(periodSetupData.weekSetup?.name && 
    periodSetupData.weekSetup?.monthForWeekOne && 
    periodSetupData.weekSetup?.startingDayOfWeek);
    
  const hasData = hasFinancialYear && hasWeekSetup;
  console.log('hasPeriodSetupData:', {
    periodSetupData,
    hasFinancialYear: !!hasFinancialYear,
    hasWeekSetup: !!hasWeekSetup,
    hasData
  });
  return hasData;
}

/**
 * Checks if Modules data exists
 * @param modulesData - Modules data (JSON string or array)
 * @returns True if data exists
 */
export function hasModulesData(modulesData: string | any[] | undefined): boolean {
  if (!modulesData) {
    console.log('hasModulesData: No modules data');
    return false;
  }
  
  try {
    // If it's a string, parse it as JSON
    const modules = typeof modulesData === 'string' ? JSON.parse(modulesData) : modulesData;
    const hasData = Array.isArray(modules) && modules.length > 0;
    console.log('hasModulesData:', {
      modulesData,
      modules,
      hasData
    });
    return hasData;
  } catch (error) {
    console.warn('Error parsing modules data:', error);
    return false;
  }
}

/**
 * Determines data presence status for all sections
 * @param entityData - Entity data from the entity table
 * @param periodSetupData - Period setup data from period setup table
 * @param selectedCountries - Selected countries from entity table
 * @param selectedCurrencies - Selected currencies from entity table
 * @returns Data presence status object
 */
export function determineDataPresence(
  entityData: any,
  periodSetupData: any,
  selectedCountries: any,
  selectedCurrencies: any
): DataPresenceStatus {
  return {
    hasCountriesAndCurrencies: hasCountriesAndCurrenciesData(selectedCountries, selectedCurrencies),
    hasPeriodSetup: hasPeriodSetupData(periodSetupData),
    hasModules: hasModulesData(entityData?.modules),
  };
}

/**
 * Gets the maximum progress for an entity type
 * @param entityType - Type of entity
 * @returns Maximum progress percentage
 */
export function getMaxProgressForEntityType(_entityType: 'Planning Entity' | 'Rollup Entity'): number {
  return 100;
}

/**
 * Gets the number of tabs for an entity type
 * @param entityType - Type of entity
 * @returns Number of tabs
 */
export function getTabCountForEntityType(entityType: 'Planning Entity' | 'Rollup Entity'): number {
  return entityType === 'Rollup Entity' ? 2 : 3;
}
