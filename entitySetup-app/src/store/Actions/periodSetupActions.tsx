import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPeriodSetupFromApi, savePeriodSetupToApi, PeriodSetupData, PeriodSetupModel } from '../../services/periodSetupService';
import { DEFAULT_PERIOD_SETUP_DATA } from '../../constants/periodSetupConstants';
import { fetchEntities } from '../Reducers/entitySlice';
import { formatTimestamp, saveDataApiCall } from 'commonApp/apiUtils';

// Action types
export const PERIOD_SETUP_ACTIONS = {
  SET_PERIOD_SETUP_DATA: 'periodSetup/setPeriodSetupData',
  SET_ORIGINAL_DATA: 'periodSetup/setOriginalData',
  SET_DATA_MODIFIED: 'periodSetup/setDataModified',
  SET_DATA_SAVED: 'periodSetup/setDataSaved',
  RESET_PERIOD_SETUP: 'periodSetup/resetPeriodSetup',
  SET_LOADING: 'periodSetup/setLoading',
  SET_ERROR: 'periodSetup/setError',
  SET_PRE_EDIT_DATA: 'periodSetup/setPreEditData',
} as const;

// Action creators
export const setPeriodSetupData = createAction<{ entityId: string; data: PeriodSetupData }>(PERIOD_SETUP_ACTIONS.SET_PERIOD_SETUP_DATA);
export const setOriginalData = createAction<{ entityId: string; data: PeriodSetupData }>(PERIOD_SETUP_ACTIONS.SET_ORIGINAL_DATA);
export const setDataModified = createAction<{ entityId: string; isModified: boolean }>(PERIOD_SETUP_ACTIONS.SET_DATA_MODIFIED);
export const setDataSaved = createAction<{ entityId: string; isSaved: boolean }>(PERIOD_SETUP_ACTIONS.SET_DATA_SAVED);
export const resetPeriodSetup = createAction<{ entityId: string }>(PERIOD_SETUP_ACTIONS.RESET_PERIOD_SETUP);
export const setLoading = createAction<{ entityId: string; loading: boolean }>(PERIOD_SETUP_ACTIONS.SET_LOADING);
export const setError = createAction<{ entityId: string; error: string | null }>(PERIOD_SETUP_ACTIONS.SET_ERROR);
export const setPreEditData = createAction<{ entityId: string; data: PeriodSetupData }>(PERIOD_SETUP_ACTIONS.SET_PRE_EDIT_DATA);

// Async thunk actions
export const fetchPeriodSetup = createAsyncThunk<PeriodSetupModel | null, string>(
  'periodSetup/fetchPeriodSetup',
  async (entityId: string, { rejectWithValue }) => {
    try {
      const data = await fetchPeriodSetupFromApi(entityId);
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch period setup');
    }
  }
);

export const savePeriodSetup = createAsyncThunk<void, { entityId: string; data: PeriodSetupData; isRollupEntity?: boolean; currentProgress?: number }>(
  'periodSetup/savePeriodSetup',
  async ({ entityId, data, isRollupEntity = false, currentProgress = 0 }, { rejectWithValue, dispatch }) => {
    try {
      await savePeriodSetupToApi(entityId, data, isRollupEntity);
      
      // Update entity progress percentage using the same API format as modules
      const newProgressPercentage = isRollupEntity ? '100' : '66.6';
      const finalProgressPercentage = currentProgress >= parseFloat(newProgressPercentage) ? currentProgress.toString() : newProgressPercentage;
      

      // Use the same API call format as modules but without Modules column

      const headers = '_ops|id|LastUpdatedAt|ProgressPercentage';
      const row = `u|${entityId}|${formatTimestamp()}|${finalProgressPercentage}`;

      const payload = {
        tableName: 'entity',
        csvData: [headers, row],
        hasHeaders: true,
        uniqueColumn: 'id',
      };

      await saveDataApiCall(payload);
      
      // Refresh entity data to get updated progress
      await dispatch(fetchEntities());
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save period setup');
    }
  }
);

// Thunk actions for data management
export const updatePeriodSetupData = (entityId: string, field: string, value: string) => (dispatch: any, getState: any) => {
  const state = getState();
  const periodSetupState = state.periodSetup[entityId] || {
    data: DEFAULT_PERIOD_SETUP_DATA,
    originalData: DEFAULT_PERIOD_SETUP_DATA,
    isDataModified: false,
    isDataSaved: false,
    loading: false,
    error: null,
  };

  const { data, originalData } = periodSetupState;
  let newData = { ...data };

  // Update the specific field
  if (field.startsWith('financialYear.')) {
    const fieldName = field.split('.')[1];
    newData = {
      ...newData,
      financialYear: {
        ...newData.financialYear,
        [fieldName]: value
      }
    };
  } else if (field.startsWith('weekSetup.')) {
    const fieldName = field.split('.')[1];
    newData = {
      ...newData,
      weekSetup: {
        ...newData.weekSetup,
        [fieldName]: value
      }
    };
  }

  dispatch(setPeriodSetupData({ entityId, data: newData }));

  // Check if data has changed
  const hasChanged = checkDataChanged(newData, originalData);
  dispatch(setDataModified({ entityId, isModified: hasChanged }));
  
  // If data has changed, reset the saved flag
  if (hasChanged) {
    dispatch(setDataSaved({ entityId, isSaved: false }));
  }
};

export const savePeriodSetupAction = (entityId: string) => (dispatch: any, getState: any) => {
  const state = getState();
  const periodSetupState = state.periodSetup[entityId];
  if (!periodSetupState) return;

  const { data } = periodSetupState;

  // Update original data after successful save
  dispatch(setOriginalData({ entityId, data: { ...data } }));
  dispatch(setDataModified({ entityId, isModified: false }));
  dispatch(setDataSaved({ entityId, isSaved: true }));
};

export const resetPeriodSetupAction = (entityId: string) => (dispatch: any, getState: any) => {
  const state = getState();
  const periodSetupState = state.periodSetup[entityId];
  if (!periodSetupState) return;

  const { originalData } = periodSetupState;

  dispatch(setPeriodSetupData({ entityId, data: { ...originalData } }));
  dispatch(setDataModified({ entityId, isModified: false }));
  dispatch(setDataSaved({ entityId, isSaved: false }));
};

// New action to reset to initial/default state (for first time scenario)
export const resetToInitialStateAction = (entityId: string) => (dispatch: any) => {
  dispatch(setPeriodSetupData({ entityId, data: DEFAULT_PERIOD_SETUP_DATA }));
  dispatch(setOriginalData({ entityId, data: DEFAULT_PERIOD_SETUP_DATA }));
  dispatch(setDataModified({ entityId, isModified: false }));
  dispatch(setDataSaved({ entityId, isSaved: false }));
};

// Action to capture the state when Edit is clicked (for reset functionality)
export const capturePreEditStateAction = (entityId: string) => (dispatch: any, getState: any) => {
  const state = getState();
  const periodSetupState = state.periodSetup[entityId];
  if (!periodSetupState) return;

  const { data } = periodSetupState;
  dispatch(setPreEditData({ entityId, data: { ...data } }));
};

// Action to reset to pre-edit state (when in edit mode)
export const resetToPreEditStateAction = (entityId: string) => (dispatch: any, getState: any) => {
  const state = getState();
  const periodSetupState = state.periodSetup[entityId];
  if (!periodSetupState) return;

  const { preEditData } = periodSetupState;
  if (preEditData) {
    dispatch(setPeriodSetupData({ entityId, data: { ...preEditData } }));
    dispatch(setDataModified({ entityId, isModified: false }));
  }
};

// Helper function to check if data has changed
const checkDataChanged = (
  currentData: PeriodSetupData,
  originalData: PeriodSetupData
): boolean => {
  return JSON.stringify(currentData) !== JSON.stringify(originalData);
};
