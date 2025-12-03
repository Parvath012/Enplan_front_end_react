import { createReducer } from '@reduxjs/toolkit';
import { 
  fetchNifiStatus,
  setPollingActive,
  createProcessGroup,
  fetchFlowProcessGroups
} from '../Actions/nifiActions';
import { NifiControllerStatus, ProcessGroupResponse } from '../../api/nifi/nifiApiService';

export interface NifiState {
  status: NifiControllerStatus | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isPollingActive: boolean;
  processGroups: ProcessGroupResponse[];
  creatingProcessGroup: boolean;
  fetchingProcessGroups: boolean;
}

const initialState: NifiState = {
  status: null,
  loading: false,
  error: null,
  lastUpdated: null,
  isPollingActive: false,
  processGroups: [],
  creatingProcessGroup: false,
  fetchingProcessGroups: false,
};

const nifiReducer = createReducer(initialState, (builder) => {
  builder
    // Handle the pending state
    .addCase(fetchNifiStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    // Handle the fulfilled state
    .addCase(fetchNifiStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.status = action.payload.controllerStatus;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
    })
    // Handle the rejected state
    .addCase(fetchNifiStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Track if polling is active
    .addCase(setPollingActive, (state, action) => {
      state.isPollingActive = action.payload;
    })
    // Handle create process group pending state
    .addCase(createProcessGroup.pending, (state) => {
      state.creatingProcessGroup = true;
      state.error = null;
    })
    // Handle create process group fulfilled state
    .addCase(createProcessGroup.fulfilled, (state, action) => {
      state.creatingProcessGroup = false;
      state.processGroups.push(action.payload);
      state.error = null;
    })
    // Handle create process group rejected state
    .addCase(createProcessGroup.rejected, (state, action) => {
      state.creatingProcessGroup = false;
      state.error = action.payload as string;
    })
    // Handle fetch flow process groups pending state
    .addCase(fetchFlowProcessGroups.pending, (state) => {
      state.fetchingProcessGroups = true;
      state.error = null;
    })
    // Handle fetch flow process groups fulfilled state
    .addCase(fetchFlowProcessGroups.fulfilled, (state, action) => {
      state.fetchingProcessGroups = false;
      state.processGroups = action.payload.processGroupFlow.flow.processGroups;
      state.error = null;
    })
    // Handle fetch flow process groups rejected state
    .addCase(fetchFlowProcessGroups.rejected, (state, action) => {
      state.fetchingProcessGroups = false;
      state.error = action.payload as string;
    });
});

export default nifiReducer;
