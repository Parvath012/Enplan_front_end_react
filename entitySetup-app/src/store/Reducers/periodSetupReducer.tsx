import { createReducer } from '@reduxjs/toolkit';
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
} from '../Actions/periodSetupActions';
import { PeriodSetupData } from '../../services/periodSetupService';
import { ensureEntityStateExists } from '../../utils/periodSetupStateUtils';

export interface PeriodSetupState {
  [entityId: string]: {
    data: PeriodSetupData;
    originalData: PeriodSetupData;
    preEditData?: PeriodSetupData;
    isDataModified: boolean;
    isDataSaved: boolean;
    loading: boolean;
    error: string | null;
  };
}

const initialState: PeriodSetupState = {};

const periodSetupReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setPeriodSetupData, (state, action) => {
      const { entityId, data } = action.payload;
      ensureEntityStateExists(state, entityId);
      state[entityId].data = data;
    })
    .addCase(setOriginalData, (state, action) => {
      const { entityId, data } = action.payload;
      ensureEntityStateExists(state, entityId);
      state[entityId].originalData = data;
    })
    .addCase(setDataModified, (state, action) => {
      const { entityId, isModified } = action.payload;
      ensureEntityStateExists(state, entityId);
      state[entityId].isDataModified = isModified;
    })
    .addCase(setDataSaved, (state, action) => {
      const { entityId, isSaved } = action.payload;
      ensureEntityStateExists(state, entityId);
      state[entityId].isDataSaved = isSaved;
    })
    .addCase(resetPeriodSetup, (state, action) => {
      const { entityId } = action.payload;
      if (state[entityId]) {
        state[entityId].data = { ...state[entityId].originalData };
        state[entityId].isDataModified = false;
        state[entityId].isDataSaved = false;
      }
    })
    .addCase(setLoading, (state, action) => {
      const { entityId, loading } = action.payload;
      ensureEntityStateExists(state, entityId);
      state[entityId].loading = loading;
    })
    .addCase(setError, (state, action) => {
      const { entityId, error } = action.payload;
      ensureEntityStateExists(state, entityId);
      state[entityId].error = error;
    })
    .addCase(setPreEditData, (state, action) => {
      const { entityId, data } = action.payload;
      ensureEntityStateExists(state, entityId);
      state[entityId].preEditData = data;
    })
    .addCase(fetchPeriodSetup.pending, (state, action) => {
      const entityId = action.meta.arg;
      ensureEntityStateExists(state, entityId);
      state[entityId].loading = true;
      state[entityId].error = null;
    })
    .addCase(fetchPeriodSetup.fulfilled, (state, action) => {
      const entityId = action.meta.arg;
      const periodSetupData = action.payload;
      
      ensureEntityStateExists(state, entityId);
      
      state[entityId].loading = false;
      
      if (periodSetupData) {
        const data: PeriodSetupData = {
          financialYear: {
            name: periodSetupData.financialYearName,
            startMonth: periodSetupData.startMonth,
            endMonth: periodSetupData.endMonth,
            historicalDataStartFY: periodSetupData.historicalYearSpan.toString(),
            spanningYears: `${periodSetupData.userViewYearSpan} years`,
          },
          weekSetup: {
            name: periodSetupData.weekName,
            monthForWeekOne: periodSetupData.monthForWeekOne,
            startingDayOfWeek: periodSetupData.startingDayOfWeek,
          }
        };
        
        state[entityId].data = data;
        state[entityId].originalData = { ...data };
        state[entityId].isDataSaved = true;
      } else {
        // No saved data - set default values and mark as original
        const defaultData: PeriodSetupData = {
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
        };
        
        state[entityId].data = defaultData;
        state[entityId].originalData = { ...defaultData };
        state[entityId].isDataSaved = false;
      }
    })
    .addCase(fetchPeriodSetup.rejected, (state, action) => {
      const entityId = action.meta.arg;
      ensureEntityStateExists(state, entityId);
      state[entityId].loading = false;
      state[entityId].error = action.error.message ?? 'Failed to fetch period setup';
    })
    .addCase(savePeriodSetup.pending, (state, action) => {
      const entityId = action.meta.arg.entityId;
      if (state[entityId]) {
        state[entityId].loading = true;
        state[entityId].error = null;
      }
    })
    .addCase(savePeriodSetup.fulfilled, (state, action) => {
      const entityId = action.meta.arg.entityId;
      if (state[entityId]) {
        state[entityId].loading = false;
        state[entityId].isDataSaved = true;
        state[entityId].isDataModified = false;
      }
    })
    .addCase(savePeriodSetup.rejected, (state, action) => {
      const entityId = action.meta.arg.entityId;
      if (state[entityId]) {
        state[entityId].loading = false;
        state[entityId].error = action.error.message ?? 'Failed to save period setup';
      }
    });
});

export default periodSetupReducer;
