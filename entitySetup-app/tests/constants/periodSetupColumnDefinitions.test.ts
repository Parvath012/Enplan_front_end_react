import { PERIOD_SETUP_COLUMNS } from '../../src/constants/periodSetupColumnDefinitions';

describe('periodSetupColumnDefinitions', () => {
  describe('PERIOD_SETUP_COLUMNS', () => {
    it('should have correct length', () => {
      expect(PERIOD_SETUP_COLUMNS).toHaveLength(13);
    });

    it('should contain all required columns', () => {
      const expectedColumns = [
        'id', 'entity_id', 'financial_year_name', 'start_month', 'end_month',
        'historical_year_span', 'user_view_year_span', 'week_name', 'month_for_week_one',
        'starting_day_of_week', 'is_deleted', 'created_at', 'last_updated_at'
      ];
      
      const actualColumns = PERIOD_SETUP_COLUMNS.map(col => col.columnName);
      expectedColumns.forEach(column => {
        expect(actualColumns).toContain(column);
      });
    });

    it('should have correct structure for each column', () => {
      PERIOD_SETUP_COLUMNS.forEach(column => {
        expect(column).toHaveProperty('dboName');
        expect(column).toHaveProperty('columnName');
        expect(column).toHaveProperty('dataType');
        expect(column).toHaveProperty('aliasName');
        expect(column).toHaveProperty('output');
        
        expect(typeof column.dboName).toBe('string');
        expect(typeof column.columnName).toBe('string');
        expect(typeof column.dataType).toBe('string');
        expect(typeof column.aliasName).toBe('string');
        expect(typeof column.output).toBe('boolean');
      });
    });

    it('should have correct dboName for all columns', () => {
      PERIOD_SETUP_COLUMNS.forEach(column => {
        expect(column.dboName).toBe('period_setup');
      });
    });

    it('should have correct data types', () => {
      const expectedDataTypes = {
        'id': 'UUID',
        'entity_id': 'UUID',
        'financial_year_name': 'VARCHAR',
        'start_month': 'VARCHAR',
        'end_month': 'VARCHAR',
        'historical_year_span': 'INTEGER',
        'user_view_year_span': 'INTEGER',
        'week_name': 'VARCHAR',
        'month_for_week_one': 'VARCHAR',
        'starting_day_of_week': 'VARCHAR',
        'is_deleted': 'BOOLEAN',
        'created_at': 'TIMESTAMP',
        'last_updated_at': 'TIMESTAMP'
      };
      
      PERIOD_SETUP_COLUMNS.forEach(column => {
        expect(column.dataType).toBe(expectedDataTypes[column.columnName as keyof typeof expectedDataTypes]);
      });
    });

    it('should have correct alias names', () => {
      const expectedAliases = {
        'id': 'Id',
        'entity_id': 'EntityId',
        'financial_year_name': 'FinancialYearName',
        'start_month': 'StartMonth',
        'end_month': 'EndMonth',
        'historical_year_span': 'HistoricalYearSpan',
        'user_view_year_span': 'UserViewYearSpan',
        'week_name': 'WeekName',
        'month_for_week_one': 'MonthForWeekOne',
        'starting_day_of_week': 'StartingDayOfWeek',
        'is_deleted': 'IsDeleted',
        'created_at': 'CreatedAt',
        'last_updated_at': 'LastUpdatedAt'
      };
      
      PERIOD_SETUP_COLUMNS.forEach(column => {
        expect(column.aliasName).toBe(expectedAliases[column.columnName as keyof typeof expectedAliases]);
      });
    });

    it('should have output set to true for all columns', () => {
      PERIOD_SETUP_COLUMNS.forEach(column => {
        expect(column.output).toBe(true);
      });
    });

    it('should have unique column names', () => {
      const columnNames = PERIOD_SETUP_COLUMNS.map(col => col.columnName);
      const uniqueColumnNames = [...new Set(columnNames)];
      expect(columnNames).toHaveLength(uniqueColumnNames.length);
    });

    it('should have unique alias names', () => {
      const aliasNames = PERIOD_SETUP_COLUMNS.map(col => col.aliasName);
      const uniqueAliasNames = [...new Set(aliasNames)];
      expect(aliasNames).toHaveLength(uniqueAliasNames.length);
    });

    it('should have proper casing for alias names', () => {
      PERIOD_SETUP_COLUMNS.forEach(column => {
        // Check that alias names follow PascalCase convention
        expect(column.aliasName).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
      });
    });

    it('should have proper casing for column names', () => {
      PERIOD_SETUP_COLUMNS.forEach(column => {
        // Check that column names follow snake_case convention
        expect(column.columnName).toMatch(/^[a-z][a-z0-9_]*$/);
      });
    });

    it('should contain specific required columns', () => {
      const requiredColumns = [
        { columnName: 'id', aliasName: 'Id', dataType: 'UUID' },
        { columnName: 'entity_id', aliasName: 'EntityId', dataType: 'UUID' },
        { columnName: 'financial_year_name', aliasName: 'FinancialYearName', dataType: 'VARCHAR' },
        { columnName: 'start_month', aliasName: 'StartMonth', dataType: 'VARCHAR' },
        { columnName: 'end_month', aliasName: 'EndMonth', dataType: 'VARCHAR' },
        { columnName: 'week_name', aliasName: 'WeekName', dataType: 'VARCHAR' },
        { columnName: 'is_deleted', aliasName: 'IsDeleted', dataType: 'BOOLEAN' }
      ];
      
      requiredColumns.forEach(requiredCol => {
        const foundColumn = PERIOD_SETUP_COLUMNS.find(col => col.columnName === requiredCol.columnName);
        expect(foundColumn).toBeDefined();
        expect(foundColumn?.aliasName).toBe(requiredCol.aliasName);
        expect(foundColumn?.dataType).toBe(requiredCol.dataType);
      });
    });

    it('should have correct order of columns', () => {
      const expectedOrder = [
        'id', 'entity_id', 'financial_year_name', 'start_month', 'end_month',
        'historical_year_span', 'user_view_year_span', 'week_name', 'month_for_week_one',
        'starting_day_of_week', 'is_deleted', 'created_at', 'last_updated_at'
      ];
      
      const actualOrder = PERIOD_SETUP_COLUMNS.map(col => col.columnName);
      expect(actualOrder).toEqual(expectedOrder);
    });
  });
});
