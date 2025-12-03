// Period Setup Column Definitions
// Centralized column definitions to eliminate duplication in periodSetupService.ts

export const PERIOD_SETUP_COLUMNS = [
  {
    dboName: 'period_setup',
    columnName: 'id',
    dataType: 'UUID',
    aliasName: 'Id',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'entity_id',
    dataType: 'UUID',
    aliasName: 'EntityId',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'financial_year_name',
    dataType: 'VARCHAR',
    aliasName: 'FinancialYearName',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'start_month',
    dataType: 'VARCHAR',
    aliasName: 'StartMonth',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'end_month',
    dataType: 'VARCHAR',
    aliasName: 'EndMonth',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'historical_year_span',
    dataType: 'INTEGER',
    aliasName: 'HistoricalYearSpan',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'user_view_year_span',
    dataType: 'INTEGER',
    aliasName: 'UserViewYearSpan',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'week_name',
    dataType: 'VARCHAR',
    aliasName: 'WeekName',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'month_for_week_one',
    dataType: 'VARCHAR',
    aliasName: 'MonthForWeekOne',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'starting_day_of_week',
    dataType: 'VARCHAR',
    aliasName: 'StartingDayOfWeek',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'is_deleted',
    dataType: 'BOOLEAN',
    aliasName: 'IsDeleted',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'created_at',
    dataType: 'TIMESTAMP',
    aliasName: 'CreatedAt',
    output: true
  },
  {
    dboName: 'period_setup',
    columnName: 'last_updated_at',
    dataType: 'TIMESTAMP',
    aliasName: 'LastUpdatedAt',
    output: true
  }
];
