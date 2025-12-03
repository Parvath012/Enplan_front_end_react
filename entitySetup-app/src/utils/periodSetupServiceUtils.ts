import { PeriodSetupDto, PeriodSetupModel } from '../services/periodSetupService';

/**
 * Maps a DTO to a Model
 */
export const mapDtoToModel = (dto: PeriodSetupDto): PeriodSetupModel => {
  return {
    id: dto.Id,
    entityId: dto.EntityId,
    financialYearName: dto.FinancialYearName,
    startMonth: dto.StartMonth,
    endMonth: dto.EndMonth,
    historicalYearSpan: dto.HistoricalYearSpan,
    userViewYearSpan: dto.UserViewYearSpan,
    weekName: dto.WeekName,
    monthForWeekOne: dto.MonthForWeekOne,
    startingDayOfWeek: dto.StartingDayOfWeek,
    isDeleted: dto.IsDeleted,
    createdAt: dto.CreatedAt,
    lastUpdatedAt: dto.LastUpdatedAt,
  };
};

/**
 * Strips quotes from a string value
 */
export const stripQuotes = (value: string): string => {
  if (value == null) return value as unknown as string;
  let v = value.trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    v = v.substring(1, v.length - 1);
  }
  return v;
};

/**
 * Parses boolean value from string
 */
export const parseBool = (v: any): boolean => {
  if (typeof v === 'boolean') return v;
  const s = String(v ?? '').trim().toLowerCase();
  return s === 'true';
};

/**
 * Gets a value from array by index with bounds checking
 */
export const getValueByIndex = (cols: string[], index: number): string | undefined => {
  return index >= 0 && index < cols.length ? cols[index] : undefined;
};
