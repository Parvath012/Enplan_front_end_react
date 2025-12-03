// Mock for commonApp/formatUtils
export const generateFinancialYearName = jest.fn((format: string, year: number) => `FY${year}`);
export const generateWeekName = jest.fn((format: string, week: number, year: number) => `Week ${week}`);
export const calculateFinancialYearYears = jest.fn((startYear: number, endYear: number) => [startYear, endYear]);
export const calculateYearLabelsAndPositions = jest.fn((years: number[]) => ({ labels: [], positions: [] }));

