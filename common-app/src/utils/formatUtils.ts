// Format generation utility functions

/**
 * Generates financial year name based on format and year values
 */
export const generateFinancialYearName = (format: string, startYear: number, endYear: number): string => {
  let result = format;
  
  // Handle different format patterns more precisely
  if (format.includes('{yyyy} - {yyyy}')) {
    // FY {yyyy} - {yyyy} format
    result = result.replace(/{yyyy} - {yyyy}/g, `${startYear} - ${endYear}`);
  } else if (format.includes('{yyyy} - {yy}')) {
    // FY {yyyy} - {yy} format
    result = result.replace(/{yyyy} - {yy}/g, `${startYear} - ${endYear.toString().slice(-2)}`);
  } else if (format.includes('{yy} - {yy}')) {
    // FY {yy} - {yy} format
    result = result.replace(/{yy} - {yy}/g, `${startYear.toString().slice(-2)} - ${endYear.toString().slice(-2)}`);
  } else if (format.includes('{yyyy}')) {
    // Single {yyyy} format (FY {yyyy})
    result = result.replace(/{yyyy}/g, startYear.toString());
  } else if (format.includes('{yy}')) {
    // Single {yy} format (FY {yy})
    result = result.replace(/{yy}/g, startYear.toString().slice(-2));
  }
  
  return result;
};

/**
 * Generates week name based on format and values
 */
export const generateWeekName = (format: string, week: string = '1', year?: number): string => {
  const currentYear = year ?? new Date().getFullYear();
  
  let result = format;
  
  // Replace {ww} with week number
  result = result.replace(/{ww}/g, week);
  // Replace {YYYY} with full year
  result = result.replace(/{YYYY}/g, currentYear.toString());
  // Replace {yyyy} with full year
  result = result.replace(/{yyyy}/g, currentYear.toString());
  // Replace {YY} with 2-digit year
  result = result.replace(/{YY}/g, currentYear.toString().slice(-2));
  // Replace {yy} with 2-digit year
  result = result.replace(/{yy}/g, currentYear.toString().slice(-2));
  
  return result;
};

/**
 * Calculates financial year start and end years based on months
 */
export const calculateFinancialYearYears = (startMonth: string, endMonth: string, months: string[]) => {
  const currentYear = new Date().getFullYear();
  const startMonthIndex = months.indexOf(startMonth);
  const endMonthIndex = months.indexOf(endMonth);
  
  let financialYearStart: number;
  let financialYearEnd: number;
  
  if (startMonthIndex < endMonthIndex) {
    // Same calendar year (e.g., January to December)
    financialYearStart = currentYear;
    financialYearEnd = currentYear;
  } else {
    // Spans two calendar years (e.g., February to January)
    financialYearStart = currentYear;
    financialYearEnd = currentYear + 1;
  }
  
  return { financialYearStart, financialYearEnd };
};

/**
 * Generates year label based on difference from current year
 */
const generateYearLabel = (diff: number): string => {
  if (diff === 0) return '';
  return diff < 0 ? `CY${diff}` : `CY+${diff}`;
};

/**
 * Calculates year labels and positions for slider
 */
export const calculateYearLabelsAndPositions = (
  historicalDataStartFY: string,
  spanningYears: string,
  sliderValue: number[],
  sliderMin: number = 2000,
  sliderMax: number = 2050,
  railWidth: number = 420
) => {
  if (!historicalDataStartFY || !spanningYears) {
    return { left: { label: '', position: 0 }, right: { label: '', position: 0 } };
  }
  
  const currentYear = new Date().getFullYear();
  const historicalStartYear = parseInt(historicalDataStartFY);
  const spanYears = parseInt(spanningYears.split(' ')[0]);
  const historicalEndYear = historicalStartYear + spanYears - 1;
  
  const leftDiff = historicalStartYear - currentYear;
  const rightDiff = historicalEndYear - currentYear;
  
  // Calculate positions based on slider min/max
  const sliderRange = sliderMax - sliderMin;
  const leftPosition = ((sliderValue[0] - sliderMin) / sliderRange) * railWidth;
  const rightPosition = ((sliderValue[1] - sliderMin) / sliderRange) * railWidth;
  
  // Generate labels - all cases use the same logic
  const leftLabel = generateYearLabel(leftDiff);
  const rightLabel = generateYearLabel(rightDiff);
  
  return { 
    left: { label: leftLabel, position: leftPosition }, 
    right: { label: rightLabel, position: rightPosition } 
  };
};
