import { GridSelectionState } from "./gridReducer";

/**
 * Root state type for Redux store
 */
export interface RootState {
  gridStore: GridSelectionState;
  authStore: any;
  dataStore: any;
  alignmentStore: any;
}
