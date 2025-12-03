// Import the modules we want to test
import { RootState, AppDispatch, store } from '../../src/store/configureStore';
import { setToken } from '../../src/store/Actions/authActions';
import { setPollingActive } from '../../src/store/Actions/nifiActions';

describe('configureStore', () => {
  it('should create a store with the correct configuration', () => {
    // Verify store has been configured
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(typeof store.getState).toBe('function');
  });

  it('should call configureStore with correct reducer configuration', () => {
    // This test ensures line 5 (configureStore call) is executed
    // The store should be created with authStore and nifi reducers
    const state = store.getState();
    
    // Verify the store was created with the correct reducer structure
    expect(state).toHaveProperty('authStore');
    expect(state).toHaveProperty('nifi');
    
    // Verify reducers are working by checking initial state structure
    expect(typeof state.authStore).toBe('object');
    expect(typeof state.nifi).toBe('object');
  });

  it('should create store with authStore reducer', () => {
    // Verify authStore reducer is properly configured
    const state = store.getState();
    expect(state.authStore).toBeDefined();
    
    // Dispatch an action to verify reducer is connected
    store.dispatch(setToken('test-token'));
    const updatedState = store.getState();
    expect(updatedState.authStore.token).toBe('test-token');
  });

  it('should create store with nifi reducer', () => {
    // Verify nifi reducer is properly configured
    const state = store.getState();
    expect(state.nifi).toBeDefined();
    
    // Dispatch an action to verify reducer is connected
    store.dispatch(setPollingActive(true));
    const updatedState = store.getState();
    expect(updatedState.nifi.isPollingActive).toBe(true);
  });

  it('should have both reducers in the store configuration', () => {
    // This test ensures the configureStore call on line 5 includes both reducers
    const state = store.getState();
    
    // Both reducers should be present
    expect(state).toHaveProperty('authStore');
    expect(state).toHaveProperty('nifi');
    
    // Both should be objects (reducer outputs)
    expect(typeof state.authStore).toBe('object');
    expect(typeof state.nifi).toBe('object');
  });

  it('should provide a getState function that returns the correct state structure', () => {
    // Check that the state matches the expected structure
    const state = store.getState();
    expect(state).toHaveProperty('authStore');
    expect(state).toHaveProperty('nifi');
  });

  it('should provide a dispatch function', () => {
    expect(store.dispatch).toBeDefined();
    expect(typeof store.dispatch).toBe('function');
  });

  it('should have the correct RootState and AppDispatch types', () => {
    // This test verifies at compile time that the types are correct
    // Create a value that conforms to RootState type
    const state: RootState = {
      authStore: { token: null },
      nifi: {
        status: null,
        loading: false,
        error: null,
        lastUpdated: null,
        isPollingActive: false,
        processGroups: [],
        creatingProcessGroup: false,
        fetchingProcessGroups: false
      }
    };
    
    // Verify the state structure
    expect(state).toHaveProperty('authStore');
    expect(state).toHaveProperty('nifi');
    
    // Create a function that uses AppDispatch
    const dispatchFunc = (dispatch: AppDispatch) => {
      dispatch({ type: 'TEST_ACTION' });
    };
    
    // This is just a type-checking test, so no need for assertions beyond type checking
    expect(typeof dispatchFunc).toBe('function');
  });
  
  it('should export the store as default', () => {
    // Import the default export
    const defaultExport = require('../../src/store/configureStore').default;
    
    // Verify it's the same as the named export 'store'
    expect(defaultExport).toBe(store);
  });

  it('should handle dispatching actions to authStore', () => {
    // Dispatch an action to the authStore using the action creator
    const testToken = 'test-token-123';
    store.dispatch(setToken(testToken));
    
    // Get the updated state
    const state = store.getState();
    
    // Verify the token was set
    expect(state.authStore.token).toBe(testToken);
  });

  it('should handle dispatching actions to nifi reducer', () => {
    // Dispatch an action to the nifi reducer using the action creator
    store.dispatch(setPollingActive(true));
    
    // Get the updated state
    const state = store.getState();
    
    // Verify polling is active
    expect(state.nifi.isPollingActive).toBe(true);
  });

  it('should handle multiple sequential dispatches', () => {
    // Dispatch multiple actions using action creators
    store.dispatch(setToken('token1'));
    store.dispatch(setPollingActive(true));
    store.dispatch(setToken('token2'));
    
    // Get the final state
    const state = store.getState();
    
    // Verify both reducers were updated
    expect(state.authStore.token).toBe('token2');
    expect(state.nifi.isPollingActive).toBe(true);
  });

  it('should handle invalid actions gracefully', () => {
    // Get initial state
    const initialState = store.getState();
    
    // Dispatch an invalid action
    store.dispatch({ type: 'INVALID_ACTION' });
    
    // Get the state after dispatch
    const stateAfter = store.getState();
    
    // State should remain unchanged
    expect(stateAfter).toEqual(initialState);
  });

  it('should provide subscribe functionality', () => {
    const listener = jest.fn();
    
    // Subscribe to store changes
    const unsubscribe = store.subscribe(listener);
    
    // Dispatch an action using action creator
    store.dispatch(setToken('new-token'));
    
    // Listener should have been called
    expect(listener).toHaveBeenCalled();
    
    // Unsubscribe
    unsubscribe();
    
    // Reset mock
    listener.mockClear();
    
    // Dispatch another action using action creator
    store.dispatch(setToken('another-token'));
    
    // Listener should not be called after unsubscribe
    expect(listener).not.toHaveBeenCalled();
  });

  it('should have correct initial nifi state structure', () => {
    const state = store.getState();
    
    // Verify nifi state has all required properties
    expect(state.nifi).toHaveProperty('status');
    expect(state.nifi).toHaveProperty('loading');
    expect(state.nifi).toHaveProperty('error');
    expect(state.nifi).toHaveProperty('lastUpdated');
    expect(state.nifi).toHaveProperty('isPollingActive');
    expect(state.nifi).toHaveProperty('processGroups');
    expect(state.nifi).toHaveProperty('creatingProcessGroup');
    expect(state.nifi).toHaveProperty('fetchingProcessGroups');
  });

  it('should maintain state immutability', () => {
    const stateBefore = store.getState();
    const nifiStateBefore = stateBefore.nifi;
    
    // Dispatch an action using action creator
    store.dispatch(setPollingActive(false));
    store.dispatch(setPollingActive(true));
    
    const stateAfter = store.getState();
    const nifiStateAfter = stateAfter.nifi;
    
    // New state object should be created (immutability)
    expect(nifiStateAfter).not.toBe(nifiStateBefore);
    // Value should have changed
    expect(nifiStateAfter.isPollingActive).toBe(true);
  });

  it('should handle RootState type correctly', () => {
    // This is a compile-time type check
    const state: RootState = store.getState();
    
    // Runtime verification
    expect(state).toBeDefined();
    expect(typeof state).toBe('object');
  });

  it('should handle AppDispatch type correctly', () => {
    // Create a typed dispatch
    const dispatch: AppDispatch = store.dispatch;
    
    // Verify it's callable
    expect(typeof dispatch).toBe('function');
    
    // Use the dispatch
    const action = { type: 'TEST' };
    const result = dispatch(action);
    
    // Redux dispatch returns the action
    expect(result).toBe(action);
  });

  describe('Store Configuration - Line 5 Coverage', () => {
    it('should execute configureStore call when module is imported', () => {
      // This test ensures line 5 (export const store = configureStore({) is executed
      // By importing and using the store, we ensure the configureStore call runs
      expect(store).toBeDefined();
      expect(typeof store).toBe('object');
      
      // Verify store has Redux store methods
      expect(typeof store.getState).toBe('function');
      expect(typeof store.dispatch).toBe('function');
      expect(typeof store.subscribe).toBe('function');
      expect(typeof store.replaceReducer).toBe('function');
    });

    it('should configure store with authStore reducer in reducer object', () => {
      // This verifies the reducer configuration object on line 6-9
      const state = store.getState();
      
      // Verify authStore reducer is configured
      expect(state.authStore).toBeDefined();
      
      // Verify it's actually the authReducer by checking its behavior
      const initialState = state.authStore;
      store.dispatch(setToken('verify-auth-reducer'));
      const updatedState = store.getState();
      
      expect(updatedState.authStore.token).toBe('verify-auth-reducer');
      expect(updatedState.authStore).not.toBe(initialState); // Immutability check
    });

    it('should configure store with nifi reducer in reducer object', () => {
      // This verifies the reducer configuration object on line 6-9
      const state = store.getState();
      
      // Verify nifi reducer is configured
      expect(state.nifi).toBeDefined();
      
      // Verify it's actually the nifiReducer by checking its behavior
      const initialState = state.nifi;
      store.dispatch(setPollingActive(true));
      const updatedState = store.getState();
      
      expect(updatedState.nifi.isPollingActive).toBe(true);
      expect(updatedState.nifi).not.toBe(initialState); // Immutability check
    });

    it('should have reducer object with both authStore and nifi keys', () => {
      // This test directly verifies the reducer configuration object structure
      // which is part of the configureStore call on line 5
      const state = store.getState();
      
      // Verify both reducer keys exist
      expect(state).toHaveProperty('authStore');
      expect(state).toHaveProperty('nifi');
      
      // Verify they are the only keys (no extra reducers)
      const keys = Object.keys(state);
      expect(keys.length).toBe(2);
      expect(keys).toContain('authStore');
      expect(keys).toContain('nifi');
    });

    it('should create store instance that matches configureStore return value', () => {
      // This ensures the store variable assignment on line 5 is covered
      // by verifying the store is the result of configureStore
      expect(store).toBeDefined();
      
      // Verify it's a Redux store instance
      expect(store.getState).toBeDefined();
      expect(store.dispatch).toBeDefined();
      expect(store.subscribe).toBeDefined();
      expect(store.replaceReducer).toBeDefined();
      
      // Verify it's functional
      const initialState = store.getState();
      expect(initialState).toBeDefined();
      expect(typeof initialState).toBe('object');
    });
  });

  describe('Type Exports', () => {
    it('should export RootState type correctly', () => {
      // This test ensures line 12 (RootState type) is covered
      const state: RootState = store.getState();
      
      // Verify the type works correctly
      expect(state).toBeDefined();
      expect(state).toHaveProperty('authStore');
      expect(state).toHaveProperty('nifi');
    });

    it('should export AppDispatch type correctly', () => {
      // This test ensures line 13 (AppDispatch type) is covered
      const dispatch: AppDispatch = store.dispatch;
      
      // Verify the type works correctly
      expect(typeof dispatch).toBe('function');
      
      // Use it to dispatch an action
      const result = dispatch({ type: 'TEST_TYPE' });
      expect(result).toBeDefined();
    });

    it('should export default store', () => {
      // This test ensures line 15 (default export) is covered
      const defaultExport = require('../../src/store/configureStore').default;
      
      // Verify it's the same as the named export
      expect(defaultExport).toBe(store);
      expect(defaultExport).toBeDefined();
    });
  });

  describe('Store Functionality', () => {
    it('should handle getState returning correct structure', () => {
      const state = store.getState();
      
      // Verify structure matches reducer configuration
      expect(state).toHaveProperty('authStore');
      expect(state).toHaveProperty('nifi');
    });

    it('should handle dispatch with both reducers', () => {
      // Dispatch to authStore
      store.dispatch(setToken('token-1'));
      let state = store.getState();
      expect(state.authStore.token).toBe('token-1');
      
      // Dispatch to nifi
      store.dispatch(setPollingActive(false));
      state = store.getState();
      expect(state.nifi.isPollingActive).toBe(false);
      
      // Both should still be in state
      expect(state).toHaveProperty('authStore');
      expect(state).toHaveProperty('nifi');
    });

    it('should maintain reducer isolation', () => {
      // Verify that actions to one reducer don't affect the other
      const initialState = store.getState();
      
      // Dispatch to authStore
      store.dispatch(setToken('isolated-token'));
      let state = store.getState();
      expect(state.authStore.token).toBe('isolated-token');
      expect(state.nifi).toEqual(initialState.nifi);
      
      // Dispatch to nifi
      store.dispatch(setPollingActive(true));
      state = store.getState();
      expect(state.nifi.isPollingActive).toBe(true);
      expect(state.authStore.token).toBe('isolated-token'); // Should remain unchanged
    });
  });
});
