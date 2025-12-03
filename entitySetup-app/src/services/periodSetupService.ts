import axios from 'axios';
import { mapDtoToModel, stripQuotes, parseBool, getValueByIndex } from '../utils/periodSetupServiceUtils';
import { PERIOD_SETUP_COLUMNS } from '../constants/periodSetupColumnDefinitions';

export interface PeriodSetupDto {
  Id: string;
  EntityId: string;
  FinancialYearName: string;
  StartMonth: string;
  EndMonth: string;
  HistoricalYearSpan: number;
  UserViewYearSpan: number;
  WeekName: string;
  MonthForWeekOne: string;
  StartingDayOfWeek: string;
  IsDeleted: boolean;
  CreatedAt: string;
  LastUpdatedAt: string;
}

export interface PeriodSetupModel {
  id: string;
  entityId: string;
  financialYearName: string;
  startMonth: string;
  endMonth: string;
  historicalYearSpan: number;
  userViewYearSpan: number;
  weekName: string;
  monthForWeekOne: string;
  startingDayOfWeek: string;
  isDeleted: boolean;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface PeriodSetupData {
  financialYear: {
    name: string;
    startMonth: string;
    endMonth: string;
    historicalDataStartFY: string;
    spanningYears: string;
    format: string;
  };
  weekSetup: {
    name: string;
    monthForWeekOne: string;
    startingDayOfWeek: string;
    format: string;
  };
}

const FETCH_API_PATH = '/api/v1/data/Data/ExecuteSqlQueries';
const SAVE_API_PATH = '/api/v1/data/Data/SaveData';
const FETCH_API_URL = `${process.env.REACT_APP_DATA_API_URL ?? ''}${FETCH_API_PATH}`;
const SAVE_API_URL = `${process.env.REACT_APP_DATA_API_URL ?? ''}${SAVE_API_PATH}`;

const fetchPayload = {
  executeInParallel: true,
  sqlQueries: [
    {
      name: 'period_setup',
      query: {
        databaseId: '09d8e037-0005-4887-abde-112a529de2b8',
        columns: PERIOD_SETUP_COLUMNS,
        tables: [
          'period_setup'
        ],
        searchFilter: {
          conditionOperator: 0,
          filters: [
            {
              propertyName: 'is_deleted',
              operator: 0,
              value: false,
              dataType: 2
            }
          ]
        },
        page: 0,
        pageSize: 100,
        caseStatements: []
      },
      includeRecordsCount: true
    }
  ]
};

// mapDtoToModel function moved to utils/periodSetupServiceUtils.ts

export async function fetchPeriodSetupFromApi(entityId: string): Promise<PeriodSetupModel | null> {
  try {
    const response = await axios.post(FETCH_API_URL, fetchPayload);
    const root: any = response.data;

    // New API shape: { status: 'Ok', data: [{ key: 'period_setup', value: { csvData: [ ... ] } }] }
    const csvData: string[] | undefined = root?.data?.[0]?.value?.csvData;

    if (Array.isArray(csvData) && csvData.length > 1) {
      const dtos = parseCsvToDtos(csvData);
      const entityPeriodSetup = dtos.find(dto => dto.EntityId === entityId);
      return entityPeriodSetup ? mapDtoToModel(entityPeriodSetup) : null;
    }

    // Fallback to older shapes if ever returned
    const records: PeriodSetupDto[] =
      root?.sqlResults?.[0]?.records ||
      root?.results?.[0]?.records ||
      root?.records ||
      [];

    const entityPeriodSetup = records.find(record => record.EntityId === entityId);
    return entityPeriodSetup ? mapDtoToModel(entityPeriodSetup) : null;
  } catch (error) {
    console.error('Error fetching period setup:', error);
    throw error;
  }
}

export async function savePeriodSetupToApi(entityId: string, data: PeriodSetupData, isRollupEntity: boolean = false): Promise<void> {
  try {
    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Check if there's existing data to determine operation type
    const existingData = await fetchPeriodSetupFromApi(entityId);
    const isUpdate = existingData !== null;
    const operation = isUpdate ? 'u' : 'n';
    
    // Store the values as they are without calculation
    const historicalYearSpan = data.financialYear.historicalDataStartFY;
    const userViewYearSpan = data.financialYear.spanningYears.split(' ')[0];
    
    // For update operations, we need the existing record ID
    const recordId = isUpdate ? existingData.id : '';
    
    const savePayload = {
      tableName: 'period_setup',
      csvData: [
        '_ops|id|entity_id|financial_year_name|start_month|end_month|historical_year_span|user_view_year_span|week_name|month_for_week_one|starting_day_of_week|is_deleted|created_at|last_updated_at',
        `${operation}|${recordId}|'${entityId}'|'${data.financialYear.name}'|'${data.financialYear.startMonth}'|'${data.financialYear.endMonth}'|${historicalYearSpan}|${userViewYearSpan}|'${data.weekSetup.name}'|'${data.weekSetup.monthForWeekOne}'|'${data.weekSetup.startingDayOfWeek}'|false|'${currentTimestamp}'|'${currentTimestamp}'`
      ],
      hasHeaders: true,
      uniqueColumn: 'id'
    };

    await axios.post(SAVE_API_URL, savePayload);
  } catch (error) {
    console.error('Error saving period setup:', error);
    throw error;
  }
}

function parseCsvToDtos(csvData: string[]): PeriodSetupDto[] {
  const [headerLine, ...rows] = csvData;
  const headers = headerLine.split('|').map((h: string) => stripQuotes(h));

  const headerIndex = (name: string) => headers.findIndex((h) => h === name);

  const idx = {
    Id: headerIndex('Id'),
    EntityId: headerIndex('EntityId'),
    FinancialYearName: headerIndex('FinancialYearName'),
    StartMonth: headerIndex('StartMonth'),
    EndMonth: headerIndex('EndMonth'),
    HistoricalYearSpan: headerIndex('HistoricalYearSpan'),
    UserViewYearSpan: headerIndex('UserViewYearSpan'),
    WeekName: headerIndex('WeekName'),
    MonthForWeekOne: headerIndex('MonthForWeekOne'),
    StartingDayOfWeek: headerIndex('StartingDayOfWeek'),
    IsDeleted: headerIndex('IsDeleted'),
    CreatedAt: headerIndex('CreatedAt'),
    LastUpdatedAt: headerIndex('LastUpdatedAt'),
  } as const;

  return rows
    .map((line) => line.split('|').map((v) => stripQuotes(v)))
    .map((cols) => {
      const dto: PeriodSetupDto = {
        Id: String(getValueByIndex(cols, idx.Id) ?? ''),
        EntityId: String(getValueByIndex(cols, idx.EntityId) ?? ''),
        FinancialYearName: String(getValueByIndex(cols, idx.FinancialYearName) ?? ''),
        StartMonth: String(getValueByIndex(cols, idx.StartMonth) ?? ''),
        EndMonth: String(getValueByIndex(cols, idx.EndMonth) ?? ''),
        HistoricalYearSpan: parseInt(getValueByIndex(cols, idx.HistoricalYearSpan) ?? '0'),
        UserViewYearSpan: parseInt(getValueByIndex(cols, idx.UserViewYearSpan) ?? '0'),
        WeekName: String(getValueByIndex(cols, idx.WeekName) ?? ''),
        MonthForWeekOne: String(getValueByIndex(cols, idx.MonthForWeekOne) ?? ''),
        StartingDayOfWeek: String(getValueByIndex(cols, idx.StartingDayOfWeek) ?? ''),
        IsDeleted: parseBool(getValueByIndex(cols, idx.IsDeleted)),
        CreatedAt: getValueByIndex(cols, idx.CreatedAt) ?? '',
        LastUpdatedAt: getValueByIndex(cols, idx.LastUpdatedAt) ?? '',
      };

      return dto;
    });
}

// stripQuotes function moved to utils/periodSetupServiceUtils.ts
