import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import nifiApiService, { ProcessGroupPosition } from '../../api/nifi/nifiApiService';

// Action Types
export const NIFI_ACTIONS = {
  FETCH_STATUS: 'nifi/fetchStatus',
  SET_POLLING_ACTIVE: 'nifi/setPollingActive',
  CREATE_PROCESS_GROUP: 'nifi/createProcessGroup',
  FETCH_FLOW_PROCESS_GROUPS: 'nifi/fetchFlowProcessGroups',
} as const;

// Create async thunk for fetching NiFi status
export const fetchNifiStatus = createAsyncThunk(
  NIFI_ACTIONS.FETCH_STATUS,
  async (_, { rejectWithValue }) => {
    try {
      const response = await nifiApiService.getFlowStatus();
      return response;
    } catch (error) {
      let errorMessage = 'Failed to fetch NiFi status';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Action to track if polling is active
export const setPollingActive = createAction<boolean>(NIFI_ACTIONS.SET_POLLING_ACTIVE);

// Create async thunk for creating a process group
export interface CreateProcessGroupParams {
  parentGroupId: string;
  name: string;
  position: ProcessGroupPosition;
  clientId?: string;
}

export const createProcessGroup = createAsyncThunk(
  NIFI_ACTIONS.CREATE_PROCESS_GROUP,
  async (params: CreateProcessGroupParams, { rejectWithValue }) => {
    try {
      const response = await nifiApiService.createProcessGroup(
        params.parentGroupId,
        params.name,
        params.position,
        params.clientId
      );
      return response;
    } catch (error) {
      let errorMessage = 'Failed to create process group';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Create async thunk for fetching flow process groups
export interface FetchFlowProcessGroupsParams {
  parentGroupId: string;
  uiOnly?: boolean;
}

export const fetchFlowProcessGroups = createAsyncThunk(
  NIFI_ACTIONS.FETCH_FLOW_PROCESS_GROUPS,
  async (params: FetchFlowProcessGroupsParams, { rejectWithValue }) => {
    try {
      const response = await nifiApiService.getFlowProcessGroups(
        params.parentGroupId,
        params.uiOnly ?? true
      );
      return response;
    } catch (error) {
      let errorMessage = 'Failed to fetch flow process groups';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Helper to set up and manage polling
let pollingIntervalId: NodeJS.Timeout | null = null;

export const startNifiStatusPolling = (intervalMs = 10000) => (dispatch: any) => {
  // Stop any existing polling
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
  }

  // Initial fetch
  dispatch(fetchNifiStatus());
  
  // Setup interval
  pollingIntervalId = setInterval(() => {
    dispatch(fetchNifiStatus());
  }, intervalMs);
  
  dispatch(setPollingActive(true));
  
  // Return a function to clear the interval
  return () => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
      dispatch(setPollingActive(false));
    }
  };
};

// Stop polling
export const stopNifiStatusPolling = () => (dispatch: any) => {
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
    dispatch(setPollingActive(false));
  }
};
