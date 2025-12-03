import { PeriodSetupData } from '../services/periodSetupService';

// Period Setup Constants
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEK_DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const SPANNING_YEARS_OPTIONS = [
  '5 years', '10 years', '15 years', '20 years', '25 years', '30 years'
];

export const HISTORICAL_DATA_YEARS = Array.from({ length: 11 }, (_, i) => (2015 + i).toString());

// Slider constants
export const SLIDER_MIN = 2000;
export const SLIDER_MAX = 2050;
export const SLIDER_RAIL_WIDTH = 420;

// Default formats
export const DEFAULT_FINANCIAL_YEAR_FORMAT = 'FY {yy} - {yy}';
export const DEFAULT_WEEK_NAME_FORMAT = 'W{ww}-{YY}';

// Default state for period setup
export const DEFAULT_PERIOD_SETUP_DATA: PeriodSetupData = {
  financialYear: {
    name: '',
    startMonth: '',
    endMonth: '',
    historicalDataStartFY: '',
    spanningYears: '',
    format: DEFAULT_FINANCIAL_YEAR_FORMAT,
  },
  weekSetup: {
    name: '',
    monthForWeekOne: '',
    startingDayOfWeek: '',
    format: DEFAULT_WEEK_NAME_FORMAT,
  }
};

// Default state for period setup entity
export const DEFAULT_PERIOD_SETUP_ENTITY_STATE = {
  data: DEFAULT_PERIOD_SETUP_DATA,
  originalData: DEFAULT_PERIOD_SETUP_DATA,
  isDataModified: false,
  isDataSaved: false,
  loading: false,
  error: null,
};

// Financial Year Format Options
export const FINANCIAL_YEAR_FORMAT_OPTIONS = [
  { value: 'FY {yy} - {yy}', label: 'FY {yy} - {yy}', isDefault: true },
  { value: 'FY {yyyy} - {yy}', label: 'FY {yyyy} - {yy}', isDefault: false },
  { value: 'FY {yyyy} - {yyyy}', label: 'FY {yyyy} - {yyyy}', isDefault: false },
  { value: 'FY {yyyy}', label: 'FY {yyyy}', isDefault: false },
  { value: 'FY {yy}', label: 'FY {yy}', isDefault: false },
];

// Week Name Format Options
export const WEEK_NAME_FORMAT_OPTIONS = [
  { value: 'W{ww}-{YY}', label: 'W{ww}-{YY}', isDefault: true },
  { value: 'W{ww}', label: 'W{ww}' },
  { value: 'Week {ww}, {yyyy}', label: 'Week {ww}, {yyyy}' },
  { value: '{yyyy}-W{ww}', label: '{yyyy}-W{ww}' },
];