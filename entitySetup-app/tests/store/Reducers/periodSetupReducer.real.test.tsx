import periodSetupReducer, { PeriodSetupState } from '../../../src/store/Reducers/periodSetupReducer';
import {
  setPeriodSetupData,
  setOriginalData,
  setDataModified,
  setDataSaved,
  resetPeriodSetup,
  setLoading,
  setError,
  setPreEditData,
  fetchPeriodSetup,
  savePeriodSetup,
} from '../../../src/store/Actions/periodSetupActions';
import { PeriodSetupData } from '../../../src/services/periodSetupService';

// Mock the utility function
jest.mock('../../../src/utils/periodSetupStateUtils', () => ({
  ensureEntityStateExists: jest.fn((state, entityId) => {
    if (!state[entityId]) {
      state[entityId] = {
        data: {
          financialYear: {
            name: '',
            startMonth: '',
            endMonth: '',
            historicalDataStartFY: '',
            spanningYears: '',
          },
          weekSetup: {
            name: '',
            monthForWeekOne: '',
            startingDayOfWeek: '',
          }
        },
        originalData: {
          financialYear: {
            name: '',
            startMonth: '',
            endMonth: '',
            historicalDataStartFY: '',
            spanningYears: '',
          },
          weekSetup: {
            name: '',
            monthForWeekOne: '',
            startingDayOfWeek: '',
          }
        },
        isDataModified: false,
        isDataSaved: false,
        loading: false,
        error: null,
      };
    }
  })
}));

describe('periodSetupReducer - Real Reducer Tests', () => {
  const mockEntityId = 'test-entity-id';
  const mockPeriodSetupData: PeriodSetupData = {
    financialYear: {
      name: 'FY 2023-24',
      startMonth: 'January',
      endMonth: 'December',
      historicalDataStartFY: '2020',
      spanningYears: '5',
    },
    weekSetup: {
      name: 'Week 1',
      monthForWeekOne: 'January',
      startingDayOfWeek: 'Monday',
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the mock to ensure it's called properly
    const { ensureEntityStateExists } = require('../../../src/utils/periodSetupStateUtils');
    ensureEntityStateExists.mockImplementation((state, entityId) => {
      if (!state[entityId]) {
        state[entityId] = {
          data: {
            financialYear: {
              name: '',
              startMonth: '',
              endMonth: '',
              historicalDataStartFY: '',
              spanningYears: '',
            },
            weekSetup: {
              name: '',
              monthForWeekOne: '',
              startingDayOfWeek: '',
            }
          },
          originalData: {
            financialYear: {
              name: '',
              startMonth: '',
              endMonth: '',
              historicalDataStartFY: '',
              spanningYears: '',
            },
            weekSetup: {
              name: '',
              monthForWeekOne: '',
              startingDayOfWeek: '',
            }
          },
          isDataModified: false,
          isDataSaved: false,
          loading: false,
          error: null,
          preEditData: null
        };
      }
      return state[entityId];
    });
  });

  describe('initial state', () => {
    it('should return empty object as initial state', () => {
      const initialState = periodSetupReducer(undefined, { type: 'UNKNOWN' });
      expect(initialState).toEqual({});
    });
  });

  describe('setPeriodSetupData', () => {
    it('should set period setup data for entity', () => {
      const action = setPeriodSetupData({
        entityId: mockEntityId,
        data: mockPeriodSetupData,
      });

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].data).toEqual(mockPeriodSetupData);
    });

    it('should update existing entity data', () => {
      const initialState: PeriodSetupState = {
        [mockEntityId]: {
          data: { 
            financialYear: { name: 'Old FY', startMonth: '', endMonth: '', historicalDataStartFY: '', spanningYears: '' },
            weekSetup: { name: '', monthForWeekOne: '', startingDayOfWeek: '' }
          },
          originalData: { 
            financialYear: { name: 'Old FY', startMonth: '', endMonth: '', historicalDataStartFY: '', spanningYears: '' },
            weekSetup: { name: '', monthForWeekOne: '', startingDayOfWeek: '' }
          },
          isDataModified: false,
          isDataSaved: false,
          loading: false,
          error: null,
        }
      };

      const action = setPeriodSetupData({
        entityId: mockEntityId,
        data: mockPeriodSetupData,
      });

      const newState = periodSetupReducer(initialState, action);

      expect(newState[mockEntityId].data).toEqual(mockPeriodSetupData);
    });
  });

  describe('setOriginalData', () => {
    it('should set original data for entity', () => {
      const action = setOriginalData({
        entityId: mockEntityId,
        data: mockPeriodSetupData,
      });

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].originalData).toEqual(mockPeriodSetupData);
    });
  });

  describe('setDataModified', () => {
    it('should set data modified flag for entity', () => {
      const action = setDataModified({
        entityId: mockEntityId,
        isModified: true,
      });

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].isDataModified).toBe(true);
    });

    it('should set data modified flag to false', () => {
      const action = setDataModified({
        entityId: mockEntityId,
        isModified: false,
      });

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].isDataModified).toBe(false);
    });
  });

  describe('setDataSaved', () => {
    it('should set data saved flag for entity', () => {
      const action = setDataSaved({
        entityId: mockEntityId,
        isSaved: true,
      });

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].isDataSaved).toBe(true);
    });

    it('should set data saved flag to false', () => {
      const action = setDataSaved({
        entityId: mockEntityId,
        isSaved: false,
      });

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].isDataSaved).toBe(false);
    });
  });

  describe('resetPeriodSetup', () => {
    it('should reset data to original data and clear flags', () => {
      const originalData = { 
        financialYear: { name: 'Original FY', startMonth: '', endMonth: '', historicalDataStartFY: '', spanningYears: '' },
        weekSetup: { name: '', monthForWeekOne: '', startingDayOfWeek: '' }
      };
      const initialState: PeriodSetupState = {
        [mockEntityId]: {
          data: { 
            financialYear: { name: 'Modified FY', startMonth: '', endMonth: '', historicalDataStartFY: '', spanningYears: '' },
            weekSetup: { name: '', monthForWeekOne: '', startingDayOfWeek: '' }
          },
          originalData: originalData,
          isDataModified: true,
          isDataSaved: true,
          loading: false,
          error: null,
        }
      };

      const action = resetPeriodSetup({
        entityId: mockEntityId,
      });

      const newState = periodSetupReducer(initialState, action);

      expect(newState[mockEntityId].data).toEqual(originalData);
      expect(newState[mockEntityId].isDataModified).toBe(false);
      expect(newState[mockEntityId].isDataSaved).toBe(false);
    });

    it('should not modify state if entity does not exist', () => {
      const initialState: PeriodSetupState = {};

      const action = resetPeriodSetup({
        entityId: 'non-existent-entity',
      });

      const newState = periodSetupReducer(initialState, action);

      expect(newState['non-existent-entity']).toBeUndefined();
    });
  });

  describe('setLoading', () => {
    it('should set loading flag for entity', () => {
      const action = setLoading({
        entityId: mockEntityId,
        loading: true,
      });

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].loading).toBe(true);
    });

    it('should set loading flag to false', () => {
      const action = setLoading({
        entityId: mockEntityId,
        loading: false,
      });

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message for entity', () => {
      const errorMessage = 'Test error message';
      const action = setError({
        entityId: mockEntityId,
        error: errorMessage,
      });

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].error).toBe(errorMessage);
    });

    it('should clear error message', () => {
      const action = setError({
        entityId: mockEntityId,
        error: null,
      });

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].error).toBe(null);
    });
  });

  describe('setPreEditData', () => {
    it('should set pre-edit data for entity', () => {
      const action = setPreEditData({
        entityId: mockEntityId,
        data: mockPeriodSetupData,
      });

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].preEditData).toEqual(mockPeriodSetupData);
    });
  });

  describe('fetchPeriodSetup async actions', () => {
    it('should handle fetchPeriodSetup.pending', () => {
      const action = {
        type: fetchPeriodSetup.pending.type,
        meta: { arg: mockEntityId }
      };

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].loading).toBe(true);
      expect(newState[mockEntityId].error).toBe(null);
    });

    it('should handle fetchPeriodSetup.fulfilled with data', () => {
      const mockApiResponse = {
        financialYearName: 'FY 2023-24',
        startMonth: 'January',
        endMonth: 'December',
        historicalYearSpan: 2020,
        userViewYearSpan: 5,
        weekName: 'Week 1',
        monthForWeekOne: 'January',
        startingDayOfWeek: 'Monday'
      };

      const action = {
        type: fetchPeriodSetup.fulfilled.type,
        payload: mockApiResponse,
        meta: { arg: mockEntityId }
      };

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].loading).toBe(false);
      expect(newState[mockEntityId].data.financialYear.name).toBe('FY 2023-24');
      expect(newState[mockEntityId].data.financialYear.startMonth).toBe('January');
      expect(newState[mockEntityId].data.financialYear.endMonth).toBe('December');
      expect(newState[mockEntityId].data.financialYear.historicalDataStartFY).toBe('2020');
      expect(newState[mockEntityId].data.financialYear.spanningYears).toBe('5 years');
      expect(newState[mockEntityId].data.weekSetup.name).toBe('Week 1');
      expect(newState[mockEntityId].data.weekSetup.monthForWeekOne).toBe('January');
      expect(newState[mockEntityId].data.weekSetup.startingDayOfWeek).toBe('Monday');
      expect(newState[mockEntityId].isDataSaved).toBe(true);
    });

    it('should handle fetchPeriodSetup.fulfilled with null data', () => {
      const action = {
        type: fetchPeriodSetup.fulfilled.type,
        payload: null,
        meta: { arg: mockEntityId }
      };

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].loading).toBe(false);
      expect(newState[mockEntityId].data.financialYear.name).toBe('');
      expect(newState[mockEntityId].data.financialYear.startMonth).toBe('');
      expect(newState[mockEntityId].data.financialYear.endMonth).toBe('');
      expect(newState[mockEntityId].data.financialYear.historicalDataStartFY).toBe('');
      expect(newState[mockEntityId].data.financialYear.spanningYears).toBe('');
      expect(newState[mockEntityId].data.weekSetup.name).toBe('');
      expect(newState[mockEntityId].data.weekSetup.monthForWeekOne).toBe('');
      expect(newState[mockEntityId].data.weekSetup.startingDayOfWeek).toBe('');
      expect(newState[mockEntityId].isDataSaved).toBe(false);
    });

    it('should handle fetchPeriodSetup.rejected', () => {
      const action = {
        type: fetchPeriodSetup.rejected.type,
        error: { message: 'Network error' },
        meta: { arg: mockEntityId }
      };

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].loading).toBe(false);
      expect(newState[mockEntityId].error).toBe('Network error');
    });

    it('should handle fetchPeriodSetup.rejected with no error message', () => {
      const action = {
        type: fetchPeriodSetup.rejected.type,
        error: {},
        meta: { arg: mockEntityId }
      };

      const newState = periodSetupReducer({}, action);

      expect(newState[mockEntityId].loading).toBe(false);
      expect(newState[mockEntityId].error).toBe('Failed to fetch period setup');
    });
  });

  describe('savePeriodSetup async actions', () => {
    it('should handle savePeriodSetup.pending', () => {
      const initialState: PeriodSetupState = {
        [mockEntityId]: {
          data: mockPeriodSetupData,
          originalData: mockPeriodSetupData,
          isDataModified: false,
          isDataSaved: false,
          loading: false,
          error: null,
        }
      };

      const action = {
        type: savePeriodSetup.pending.type,
        meta: { arg: { entityId: mockEntityId } }
      };

      const newState = periodSetupReducer(initialState, action);

      expect(newState[mockEntityId].loading).toBe(true);
      expect(newState[mockEntityId].error).toBe(null);
    });

    it('should handle savePeriodSetup.fulfilled', () => {
      const initialState: PeriodSetupState = {
        [mockEntityId]: {
          data: mockPeriodSetupData,
          originalData: mockPeriodSetupData,
          isDataModified: true,
          isDataSaved: false,
          loading: true,
          error: null,
        }
      };

      const action = {
        type: savePeriodSetup.fulfilled.type,
        payload: {},
        meta: { arg: { entityId: mockEntityId } }
      };

      const newState = periodSetupReducer(initialState, action);

      expect(newState[mockEntityId].loading).toBe(false);
      expect(newState[mockEntityId].isDataSaved).toBe(true);
      expect(newState[mockEntityId].isDataModified).toBe(false);
    });

    it('should handle savePeriodSetup.rejected', () => {
      const initialState: PeriodSetupState = {
        [mockEntityId]: {
          data: mockPeriodSetupData,
          originalData: mockPeriodSetupData,
          isDataModified: false,
          isDataSaved: false,
          loading: true,
          error: null,
        }
      };

      const action = {
        type: savePeriodSetup.rejected.type,
        error: { message: 'Save failed' },
        meta: { arg: { entityId: mockEntityId } }
      };

      const newState = periodSetupReducer(initialState, action);

      expect(newState[mockEntityId].loading).toBe(false);
      expect(newState[mockEntityId].error).toBe('Save failed');
    });

    it('should handle savePeriodSetup.rejected with no error message', () => {
      const initialState: PeriodSetupState = {
        [mockEntityId]: {
          data: mockPeriodSetupData,
          originalData: mockPeriodSetupData,
          isDataModified: false,
          isDataSaved: false,
          loading: true,
          error: null,
        }
      };

      const action = {
        type: savePeriodSetup.rejected.type,
        error: {},
        meta: { arg: { entityId: mockEntityId } }
      };

      const newState = periodSetupReducer(initialState, action);

      expect(newState[mockEntityId].loading).toBe(false);
      expect(newState[mockEntityId].error).toBe('Failed to save period setup');
    });
  });

  describe('multiple entities', () => {
    it('should handle multiple entities independently', () => {
      const entity1Id = 'entity-1';
      const entity2Id = 'entity-2';
      
      const action1 = setPeriodSetupData({
        entityId: entity1Id,
        data: { 
          financialYear: { name: 'FY 1', startMonth: '', endMonth: '', historicalDataStartFY: '', spanningYears: '' },
          weekSetup: { name: '', monthForWeekOne: '', startingDayOfWeek: '' }
        },
      });
      
      const action2 = setPeriodSetupData({
        entityId: entity2Id,
        data: { 
          financialYear: { name: 'FY 2', startMonth: '', endMonth: '', historicalDataStartFY: '', spanningYears: '' },
          weekSetup: { name: '', monthForWeekOne: '', startingDayOfWeek: '' }
        },
      });

      let state = periodSetupReducer({}, action1);
      state = periodSetupReducer(state, action2);

      expect(state[entity1Id].data.financialYear.name).toBe('FY 1');
      expect(state[entity2Id].data.financialYear.name).toBe('FY 2');
    });
  });

  describe('edge cases', () => {
    it('should handle unknown action type', () => {
      const initialState: PeriodSetupState = {
        [mockEntityId]: {
          data: mockPeriodSetupData,
          originalData: mockPeriodSetupData,
          isDataModified: false,
          isDataSaved: false,
          loading: false,
          error: null,
        }
      };

      const action = { type: 'UNKNOWN_ACTION' };
      const newState = periodSetupReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });

    it('should handle savePeriodSetup.pending when entity does not exist', () => {
      const action = {
        type: savePeriodSetup.pending.type,
        meta: { arg: { entityId: 'non-existent-entity' } }
      };

      const newState = periodSetupReducer({}, action);

      expect(newState['non-existent-entity']).toBeUndefined();
    });

    it('should handle savePeriodSetup.fulfilled when entity does not exist', () => {
      const action = {
        type: savePeriodSetup.fulfilled.type,
        payload: {},
        meta: { arg: { entityId: 'non-existent-entity' } }
      };

      const newState = periodSetupReducer({}, action);

      expect(newState['non-existent-entity']).toBeUndefined();
    });

    it('should handle savePeriodSetup.rejected when entity does not exist', () => {
      const action = {
        type: savePeriodSetup.rejected.type,
        error: { message: 'Error' },
        meta: { arg: { entityId: 'non-existent-entity' } }
      };

      const newState = periodSetupReducer({}, action);

      expect(newState['non-existent-entity']).toBeUndefined();
    });
  });
});
