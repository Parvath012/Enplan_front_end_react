// Mock for commonApp/formatUtils
export const generateFinancialYearName = jest.fn((format: string, startYear: number, endYear: number) => `FY ${startYear}-${endYear}`);
export const generateWeekName = jest.fn((format: string, week: number, year: number) => `W${week}-${year}`);
export const calculateFinancialYearYears = jest.fn((startMonth: number, endMonth: number, months: number[]) => ({
  financialYearStart: 2023,
  financialYearEnd: 2024,
}));
export const calculateYearLabelsAndPositions = jest.fn(() => ({
  left: { label: 'CY-1', position: 0 },
  right: { label: 'CY+1', position: 100 },
}));

export default {
  generateFinancialYearName,
  generateWeekName,
  calculateFinancialYearYears,
  calculateYearLabelsAndPositions,
};
