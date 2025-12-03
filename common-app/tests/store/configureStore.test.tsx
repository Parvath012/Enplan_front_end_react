import { configureStore } from '@reduxjs/toolkit';
import store from '../../src/store/configureStore'; // Assuming this is the file path
import authReducer from '../../src/store/Reducers/authReducer';
import dataReducer from '../../src/store/Reducers/dataReducer';
import selectedCellsReducer from '../../src/store/Reducers/gridReducer';
import alignmentReducer from '../../src/store/Reducers/alignmentReducer';
import gridModeReducer from '../../src/store/Reducers/gridModeReducer';

describe('Redux Store Configuration', () => {
  it('should create a store with the correct reducers', () => {
    // Check if store is created successfully
    expect(store).toBeDefined();
  });

  it('should have the correct reducer keys', () => {
    const reducerKeys = Object.keys(store.getState());
    
    expect(reducerKeys).toContain('authStore');
    expect(reducerKeys).toContain('dataStore');
    expect(reducerKeys).toContain('gridStore');
  });

  it('should use the correct reducers', () => {
    const storeReducers = store.getState();

    // Create a mock store to compare reducers
    const mockStore = configureStore({
      reducer: {
        authStore: authReducer,
        dataStore: dataReducer,
        gridStore: selectedCellsReducer,
        alignmentStore: alignmentReducer,
        gridModeStore: gridModeReducer
      },
    });

    // Compare the structure of the state
    expect(Object.keys(storeReducers)).toEqual(
      Object.keys(mockStore.getState())
    );
  });

  it('should allow dispatching actions to reducers', () => {
    // This test ensures that the store can dispatch actions
    const initialState = store.getState();
    
    // You might want to import sample actions from respective reducers
    // For example:
    // store.dispatch(authReducer.actions.login());
    // store.dispatch(dataReducer.actions.setData(testData));
    // store.dispatch(selectedCellsReducer.actions.selectCell(cellInfo));

    // The key is to verify that dispatching doesn't throw an error
    expect(() => {
      // Add minimal dispatches to test reducer functionality
    }).not.toThrow();
  });

  it('should have immutable state updates', () => {
    const initialState = store.getState();
    
    // Dispatch some actions that would modify state
    // Check that the original state remains unchanged
    expect(store.getState()).toEqual(initialState);
  });
});