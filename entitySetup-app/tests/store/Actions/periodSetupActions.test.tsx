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
  updatePeriodSetupData,
  savePeriodSetupAction,
  resetPeriodSetupAction,
  resetToInitialStateAction,
  capturePreEditStateAction,
  resetToPreEditStateAction,
  PERIOD_SETUP_ACTIONS,
} from '../../../src/store/Actions/periodSetupActions';
import { PeriodSetupData } from '../../../src/services/periodSetupService';
import { DEFAULT_PERIOD_SETUP_DATA } from '../../../src/constants/periodSetupConstants';

// Mock the service functions
jest.mock('../../../src/services/periodSetupService', () => ({
  fetchPeriodSetupFromApi: jest.fn(),
  savePeriodSetupToApi: jest.fn(),
}));

// Mock the API utils - using commonApp mock instead
jest.mock('commonApp/apiUtils', () => ({
  formatTimestamp: jest.fn(() => "'2023-01-01 12:00:00'"),
  saveDataApiCall: jest.fn(() => Promise.resolve()),
}));

// Mock the entity slice
jest.mock('../../../src/store/Reducers/entitySlice', () => ({
  fetchEntities: jest.fn(() => ({ type: 'entities/fetchEntities/fulfilled' })),
}));

// Mock the constants
jest.mock('../../../src/constants/periodSetupConstants', () => ({
  DEFAULT_PERIOD_SETUP_DATA: {
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
    },
  },
}));

describe('periodSetupActions', () => {
  const mockEntityId = 'test-entity-id';
  const mockPeriodSetupData: PeriodSetupData = {
    financialYear: {
      name: 'FY 2023-24',
      startMonth: 'April',
      endMonth: 'March',
      historicalDataStartFY: '2020',
      spanningYears: '5 years',
      format: 'FY {yy} - {yy}',
    },
    weekSetup: {
      name: 'W1-23',
      monthForWeekOne: 'January',
      startingDayOfWeek: 'Monday',
      format: 'W{ww}-{YY}',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('action creators', () => {
    it('should create setPeriodSetupData action', () => {
      const action = setPeriodSetupData({
        entityId: mockEntityId,
        data: mockPeriodSetupData,
      });

      expect(action).toEqual({
        type: PERIOD_SETUP_ACTIONS.SET_PERIOD_SETUP_DATA,
        payload: {
          entityId: mockEntityId,
          data: mockPeriodSetupData,
        },
      });
    });

    it('should create setOriginalData action', () => {
      const action = setOriginalData({
        entityId: mockEntityId,
        data: mockPeriodSetupData,
      });

      expect(action).toEqual({
        type: PERIOD_SETUP_ACTIONS.SET_ORIGINAL_DATA,
        payload: {
          entityId: mockEntityId,
          data: mockPeriodSetupData,
        },
      });
    });

    it('should create setDataModified action', () => {
      const action = setDataModified({
        entityId: mockEntityId,
        isModified: true,
      });

      expect(action).toEqual({
        type: PERIOD_SETUP_ACTIONS.SET_DATA_MODIFIED,
        payload: {
          entityId: mockEntityId,
          isModified: true,
        },
      });
    });

    it('should create setDataSaved action', () => {
      const action = setDataSaved({
        entityId: mockEntityId,
        isSaved: true,
      });

      expect(action).toEqual({
        type: PERIOD_SETUP_ACTIONS.SET_DATA_SAVED,
        payload: {
          entityId: mockEntityId,
          isSaved: true,
        },
      });
    });

    it('should create resetPeriodSetup action', () => {
      const action = resetPeriodSetup({ entityId: mockEntityId });

      expect(action).toEqual({
        type: PERIOD_SETUP_ACTIONS.RESET_PERIOD_SETUP,
        payload: {
          entityId: mockEntityId,
        },
      });
    });

    it('should create setLoading action', () => {
      const action = setLoading({
        entityId: mockEntityId,
        loading: true,
      });

      expect(action).toEqual({
        type: PERIOD_SETUP_ACTIONS.SET_LOADING,
        payload: {
          entityId: mockEntityId,
          loading: true,
        },
      });
    });

    it('should create setError action', () => {
      const action = setError({
        entityId: mockEntityId,
        error: 'Test error',
      });

      expect(action).toEqual({
        type: PERIOD_SETUP_ACTIONS.SET_ERROR,
        payload: {
          entityId: mockEntityId,
          error: 'Test error',
        },
      });
    });

    it('should create setPreEditData action', () => {
      const action = setPreEditData({
        entityId: mockEntityId,
        data: mockPeriodSetupData,
      });

      expect(action).toEqual({
        type: PERIOD_SETUP_ACTIONS.SET_PRE_EDIT_DATA,
        payload: {
          entityId: mockEntityId,
          data: mockPeriodSetupData,
        },
      });
    });
  });

  describe('async thunk actions', () => {
    describe('fetchPeriodSetup', () => {
      it('should fetch period setup data successfully', async () => {
        const mockData = {
          id: '1',
          entityId: mockEntityId,
          financialYearName: 'FY 2023-24',
          startMonth: 'April',
          endMonth: 'March',
          historicalYearSpan: 5,
          userViewYearSpan: 3,
          weekName: 'W1-23',
          monthForWeekOne: 'January',
          startingDayOfWeek: 'Monday',
          isDeleted: false,
          createdAt: '2023-01-01T00:00:00Z',
          lastUpdatedAt: '2023-01-01T00:00:00Z',
        };

        const { fetchPeriodSetupFromApi } = require('../../../src/services/periodSetupService');
        fetchPeriodSetupFromApi.mockResolvedValue(mockData);

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await fetchPeriodSetup(mockEntityId)(dispatch, getState, undefined);

        expect(fetchPeriodSetupFromApi).toHaveBeenCalledWith(mockEntityId);
        expect(result.payload).toEqual(mockData);
      });

      it('should handle fetch error', async () => {
        const error = new Error('Network error');
        const { fetchPeriodSetupFromApi } = require('../../../src/services/periodSetupService');
        fetchPeriodSetupFromApi.mockRejectedValue(error);

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await fetchPeriodSetup(mockEntityId)(dispatch, getState, undefined);

        expect(result.type).toBe('periodSetup/fetchPeriodSetup/rejected');
        expect(result.payload).toBe('Network error');
      });

      it('should handle fetch error with non-Error object', async () => {
        const { fetchPeriodSetupFromApi } = require('../../../src/services/periodSetupService');
        fetchPeriodSetupFromApi.mockRejectedValue('String error');

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await fetchPeriodSetup(mockEntityId)(dispatch, getState, undefined);

        expect(result.type).toBe('periodSetup/fetchPeriodSetup/rejected');
        expect(result.payload).toBe('Failed to fetch period setup');
      });
    });

    describe('savePeriodSetup', () => {
      it('should save period setup data successfully', async () => {
        const { savePeriodSetupToApi } = require('../../../src/services/periodSetupService');
        savePeriodSetupToApi.mockResolvedValue(undefined);

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await savePeriodSetup({
          entityId: mockEntityId,
          data: mockPeriodSetupData,
          isRollupEntity: false,
          currentProgress: 0,
        })(dispatch, getState, undefined);

        expect(savePeriodSetupToApi).toHaveBeenCalledWith(mockEntityId, mockPeriodSetupData, false);
        expect(result.type).toBe('periodSetup/savePeriodSetup/fulfilled');
      });

      it('should handle save error', async () => {
        const error = new Error('Save failed');
        const { savePeriodSetupToApi } = require('../../../src/services/periodSetupService');
        savePeriodSetupToApi.mockRejectedValue(error);

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await savePeriodSetup({
          entityId: mockEntityId,
          data: mockPeriodSetupData,
          isRollupEntity: false,
          currentProgress: 0,
        })(dispatch, getState, undefined);

        expect(result.type).toBe('periodSetup/savePeriodSetup/rejected');
        expect(result.payload).toBe('Save failed');
      });

      it('should handle save error with non-Error object', async () => {
        const { savePeriodSetupToApi } = require('../../../src/services/periodSetupService');
        savePeriodSetupToApi.mockRejectedValue('String error');

        const dispatch = jest.fn();
        const getState = jest.fn();

        const result = await savePeriodSetup({
          entityId: mockEntityId,
          data: mockPeriodSetupData,
          isRollupEntity: false,
          currentProgress: 0,
        })(dispatch, getState, undefined);

        expect(result.type).toBe('periodSetup/savePeriodSetup/rejected');
        expect(result.payload).toBe('Failed to save period setup');
      });
    });
  });

  describe('thunk actions for data management', () => {
    describe('updatePeriodSetupData', () => {
      it('should update financial year field', () => {
        const mockState = {
          periodSetup: {
            [mockEntityId]: {
              data: DEFAULT_PERIOD_SETUP_DATA,
              originalData: DEFAULT_PERIOD_SETUP_DATA,
              isDataModified: false,
              isDataSaved: false,
              loading: false,
              error: null,
            },
          },
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        updatePeriodSetupData(mockEntityId, 'financialYear.name', 'FY 2023-24')(dispatch, getState);

        expect(dispatch).toHaveBeenCalledWith(
          setPeriodSetupData({
            entityId: mockEntityId,
            data: {
              ...DEFAULT_PERIOD_SETUP_DATA,
              financialYear: {
                ...DEFAULT_PERIOD_SETUP_DATA.financialYear,
                name: 'FY 2023-24',
              },
            },
          })
        );
        expect(dispatch).toHaveBeenCalledWith(
          setDataModified({ entityId: mockEntityId, isModified: true })
        );
        expect(dispatch).toHaveBeenCalledWith(
          setDataSaved({ entityId: mockEntityId, isSaved: false })
        );
      });

      it('should update week setup field', () => {
        const mockState = {
          periodSetup: {
            [mockEntityId]: {
              data: DEFAULT_PERIOD_SETUP_DATA,
              originalData: DEFAULT_PERIOD_SETUP_DATA,
              isDataModified: false,
              isDataSaved: false,
              loading: false,
              error: null,
            },
          },
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        updatePeriodSetupData(mockEntityId, 'weekSetup.name', 'W1-23')(dispatch, getState);

        expect(dispatch).toHaveBeenCalledWith(
          setPeriodSetupData({
            entityId: mockEntityId,
            data: {
              ...DEFAULT_PERIOD_SETUP_DATA,
              weekSetup: {
                ...DEFAULT_PERIOD_SETUP_DATA.weekSetup,
                name: 'W1-23',
              },
            },
          })
        );
      });

      it('should not mark as modified when data is unchanged', () => {
        const mockState = {
          periodSetup: {
            [mockEntityId]: {
              data: DEFAULT_PERIOD_SETUP_DATA,
              originalData: DEFAULT_PERIOD_SETUP_DATA,
              isDataModified: false,
              isDataSaved: false,
              loading: false,
              error: null,
            },
          },
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        updatePeriodSetupData(mockEntityId, 'financialYear.name', '')(dispatch, getState);

        expect(dispatch).toHaveBeenCalledWith(
          setDataModified({ entityId: mockEntityId, isModified: false })
        );
        expect(dispatch).not.toHaveBeenCalledWith(
          setDataSaved({ entityId: mockEntityId, isSaved: false })
        );
      });

      it('should use default state when entity does not exist', () => {
        const mockState = {
          periodSetup: {},
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        updatePeriodSetupData(mockEntityId, 'financialYear.name', 'FY 2023-24')(dispatch, getState);

        expect(dispatch).toHaveBeenCalledWith(
          setPeriodSetupData({
            entityId: mockEntityId,
            data: {
              ...DEFAULT_PERIOD_SETUP_DATA,
              financialYear: {
                ...DEFAULT_PERIOD_SETUP_DATA.financialYear,
                name: 'FY 2023-24',
              },
            },
          })
        );
      });
    });

    describe('savePeriodSetupAction', () => {
      it('should save period setup and update flags', () => {
        const mockState = {
          periodSetup: {
            [mockEntityId]: {
              data: mockPeriodSetupData,
              originalData: DEFAULT_PERIOD_SETUP_DATA,
              isDataModified: true,
              isDataSaved: false,
              loading: false,
              error: null,
            },
          },
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        savePeriodSetupAction(mockEntityId)(dispatch, getState);

        expect(dispatch).toHaveBeenCalledWith(
          setOriginalData({ entityId: mockEntityId, data: { ...mockPeriodSetupData } })
        );
        expect(dispatch).toHaveBeenCalledWith(
          setDataModified({ entityId: mockEntityId, isModified: false })
        );
        expect(dispatch).toHaveBeenCalledWith(
          setDataSaved({ entityId: mockEntityId, isSaved: true })
        );
      });

      it('should not dispatch actions when entity does not exist', () => {
        const mockState = {
          periodSetup: {},
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        savePeriodSetupAction(mockEntityId)(dispatch, getState);

        expect(dispatch).not.toHaveBeenCalled();
      });
    });

    describe('resetPeriodSetupAction', () => {
      it('should reset to original data', () => {
        const mockState = {
          periodSetup: {
            [mockEntityId]: {
              data: mockPeriodSetupData,
              originalData: DEFAULT_PERIOD_SETUP_DATA,
              isDataModified: true,
              isDataSaved: true,
              loading: false,
              error: null,
            },
          },
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        resetPeriodSetupAction(mockEntityId)(dispatch, getState);

        expect(dispatch).toHaveBeenCalledWith(
          setPeriodSetupData({ entityId: mockEntityId, data: { ...DEFAULT_PERIOD_SETUP_DATA } })
        );
        expect(dispatch).toHaveBeenCalledWith(
          setDataModified({ entityId: mockEntityId, isModified: false })
        );
        expect(dispatch).toHaveBeenCalledWith(
          setDataSaved({ entityId: mockEntityId, isSaved: false })
        );
      });

      it('should not dispatch actions when entity does not exist', () => {
        const mockState = {
          periodSetup: {},
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        resetPeriodSetupAction(mockEntityId)(dispatch, getState);

        expect(dispatch).not.toHaveBeenCalled();
      });
    });

    describe('resetToInitialStateAction', () => {
      it('should reset to initial state', () => {
        const dispatch = jest.fn();

        resetToInitialStateAction(mockEntityId)(dispatch, jest.fn());

        expect(dispatch).toHaveBeenCalledWith(
          setPeriodSetupData({ entityId: mockEntityId, data: DEFAULT_PERIOD_SETUP_DATA })
        );
        expect(dispatch).toHaveBeenCalledWith(
          setOriginalData({ entityId: mockEntityId, data: DEFAULT_PERIOD_SETUP_DATA })
        );
        expect(dispatch).toHaveBeenCalledWith(
          setDataModified({ entityId: mockEntityId, isModified: false })
        );
        expect(dispatch).toHaveBeenCalledWith(
          setDataSaved({ entityId: mockEntityId, isSaved: false })
        );
      });
    });

    describe('capturePreEditStateAction', () => {
      it('should capture pre-edit state', () => {
        const mockState = {
          periodSetup: {
            [mockEntityId]: {
              data: mockPeriodSetupData,
              originalData: DEFAULT_PERIOD_SETUP_DATA,
              isDataModified: false,
              isDataSaved: false,
              loading: false,
              error: null,
            },
          },
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        capturePreEditStateAction(mockEntityId)(dispatch, getState);

        expect(dispatch).toHaveBeenCalledWith(
          setPreEditData({ entityId: mockEntityId, data: { ...mockPeriodSetupData } })
        );
      });

      it('should not dispatch actions when entity does not exist', () => {
        const mockState = {
          periodSetup: {},
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        capturePreEditStateAction(mockEntityId)(dispatch, getState);

        expect(dispatch).not.toHaveBeenCalled();
      });
    });

    describe('resetToPreEditStateAction', () => {
      it('should reset to pre-edit state', () => {
        const mockState = {
          periodSetup: {
            [mockEntityId]: {
              data: mockPeriodSetupData,
              originalData: DEFAULT_PERIOD_SETUP_DATA,
              preEditData: DEFAULT_PERIOD_SETUP_DATA,
              isDataModified: true,
              isDataSaved: false,
              loading: false,
              error: null,
            },
          },
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        resetToPreEditStateAction(mockEntityId)(dispatch, getState);

        expect(dispatch).toHaveBeenCalledWith(
          setPeriodSetupData({ entityId: mockEntityId, data: { ...DEFAULT_PERIOD_SETUP_DATA } })
        );
        expect(dispatch).toHaveBeenCalledWith(
          setDataModified({ entityId: mockEntityId, isModified: false })
        );
      });

      it('should not dispatch actions when entity does not exist', () => {
        const mockState = {
          periodSetup: {},
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        resetToPreEditStateAction(mockEntityId)(dispatch, getState);

        expect(dispatch).not.toHaveBeenCalled();
      });

      it('should not dispatch actions when preEditData does not exist', () => {
        const mockState = {
          periodSetup: {
            [mockEntityId]: {
              data: mockPeriodSetupData,
              originalData: DEFAULT_PERIOD_SETUP_DATA,
              preEditData: undefined,
              isDataModified: true,
              isDataSaved: false,
              loading: false,
              error: null,
            },
          },
        };

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(mockState);

        resetToPreEditStateAction(mockEntityId)(dispatch, getState);

        expect(dispatch).not.toHaveBeenCalled();
      });
    });
  });
});
