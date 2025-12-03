import { ensureEntityStateExists, createDefaultEntityState } from '../../src/utils/periodSetupStateUtils';
import { DEFAULT_PERIOD_SETUP_ENTITY_STATE } from '../../src/constants/periodSetupConstants';
import { PeriodSetupState } from '../../src/store/Reducers/periodSetupReducer';

// Mock PeriodSetupState
const createMockPeriodSetupState = (entities: any = {}): PeriodSetupState => entities;

describe('periodSetupStateUtils', () => {
  describe('DEFAULT_PERIOD_SETUP_ENTITY_STATE', () => {
    it('should have correct structure', () => {
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE).toHaveProperty('data');
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE).toHaveProperty('originalData');
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE).toHaveProperty('isDataModified');
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE).toHaveProperty('isDataSaved');
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE).toHaveProperty('loading');
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE).toHaveProperty('error');
    });

    it('should have correct default values', () => {
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE.data).toEqual({
        financialYear: {
          name: '',
          startMonth: '',
          endMonth: '',
          historicalDataStartFY: '',
          spanningYears: '',
          format: 'FY {yy} - {yy}',
        },
        weekSetup: {
          name: '',
          monthForWeekOne: '',
          startingDayOfWeek: '',
          format: 'W{ww}-{YY}',
        }
      });
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE.originalData).toEqual(DEFAULT_PERIOD_SETUP_ENTITY_STATE.data);
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE.isDataModified).toBe(false);
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE.isDataSaved).toBe(false);
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE.loading).toBe(false);
      expect(DEFAULT_PERIOD_SETUP_ENTITY_STATE.error).toBeNull();
    });
  });

  describe('ensureEntityStateExists', () => {
    it('should create and return default state when entity does not exist', () => {
      const state = createMockPeriodSetupState({});
      const result = ensureEntityStateExists(state, 'entity-1');
      expect(result).toEqual(DEFAULT_PERIOD_SETUP_ENTITY_STATE);
      expect(state['entity-1']).toEqual(DEFAULT_PERIOD_SETUP_ENTITY_STATE);
    });

    it('should create and return default state when entity does not exist in non-empty state', () => {
      const state = createMockPeriodSetupState({
        'other-entity': {
          data: { someData: 'test' },
          isDataModified: true,
          isDataSaved: false,
          loading: false,
          error: null,
          originalData: { someData: 'test' }
        }
      });
      const result = ensureEntityStateExists(state, 'entity-1');
      expect(result).toEqual(DEFAULT_PERIOD_SETUP_ENTITY_STATE);
      expect(state['entity-1']).toEqual(DEFAULT_PERIOD_SETUP_ENTITY_STATE);
    });

    it('should return existing state when entity exists', () => {
      const existingState = {
        data: {
          financialYear: {
            name: 'FY 19-20',
            startMonth: 'April',
            endMonth: 'March',
            historicalDataStartFY: '2015',
            spanningYears: '10 years',
            format: 'FY {yy} - {yy}'
          },
          weekSetup: {
            name: 'W01-20',
            monthForWeekOne: 'January',
            startingDayOfWeek: 'Monday',
            format: 'W{ww}-{YY}'
          }
        },
        originalData: {
          financialYear: {
            name: 'FY 19-20',
            startMonth: 'April',
            endMonth: 'March',
            historicalDataStartFY: '2015',
            spanningYears: '10 years',
            format: 'FY {yy} - {yy}'
          },
          weekSetup: {
            name: 'W01-20',
            monthForWeekOne: 'January',
            startingDayOfWeek: 'Monday',
            format: 'W{ww}-{YY}'
          }
        },
        isDataModified: true,
        isDataSaved: true,
        loading: false,
        error: null
      };
      
      const state = createMockPeriodSetupState({
        'entity-1': existingState
      });
      
      const result = ensureEntityStateExists(state, 'entity-1');
      expect(result).toEqual(existingState);
    });

    it('should handle different entity IDs correctly', () => {
      const entity1State = {
        data: DEFAULT_PERIOD_SETUP_ENTITY_STATE.data,
        originalData: DEFAULT_PERIOD_SETUP_ENTITY_STATE.originalData,
        isDataModified: true,
        isDataSaved: false,
        loading: false,
        error: null
      };
      
      const entity2State = {
        data: DEFAULT_PERIOD_SETUP_ENTITY_STATE.data,
        originalData: DEFAULT_PERIOD_SETUP_ENTITY_STATE.originalData,
        isDataModified: false,
        isDataSaved: true,
        loading: false,
        error: null
      };
      
      const state = createMockPeriodSetupState({
        'entity-1': entity1State,
        'entity-2': entity2State
      });
      
      const result1 = ensureEntityStateExists(state, 'entity-1');
      const result2 = ensureEntityStateExists(state, 'entity-2');
      
      expect(result1).toEqual(entity1State);
      expect(result2).toEqual(entity2State);
    });
  });

  describe('createDefaultEntityState', () => {
    it('should create a new default entity state', () => {
      const result = createDefaultEntityState();
      expect(result).toEqual(DEFAULT_PERIOD_SETUP_ENTITY_STATE);
    });

    it('should create independent instances', () => {
      const state1 = createDefaultEntityState();
      const state2 = createDefaultEntityState();
      
      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });
  });
});
