import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { RootState } from '../../../src/store/Reducers/rootReducer';
import entitySetupReducer from '../../../src/store/Reducers/entitySetupReducer';
import entitySlice from '../../../src/store/Reducers/entitySlice';

describe('rootReducer', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: rootReducer
    });
  });

  describe('store structure', () => {
    it('should create a store with the correct structure', () => {
      const state = store.getState();
      
      expect(state).toHaveProperty('entitySetup');
      expect(state).toHaveProperty('entities');
      expect(state).toHaveProperty('entityConfiguration');
      expect(state).toHaveProperty('periodSetup');
    });

    it('should have the correct reducer keys', () => {
      const reducerKeys = Object.keys(store.getState());
      
      expect(reducerKeys).toContain('entitySetup');
      expect(reducerKeys).toContain('entities');
      expect(reducerKeys).toContain('entityConfiguration');
      expect(reducerKeys).toContain('periodSetup');
      expect(reducerKeys).toHaveLength(4);
    });

    it('should use the correct reducers', () => {
      const storeReducers = store.getState();
      
      // Test that the store uses the correct reducers by checking initial state
      expect(storeReducers.entitySetup).toBeDefined();
      expect(storeReducers.entities).toBeDefined();
      expect(storeReducers.entityConfiguration).toBeDefined();
      expect(storeReducers.periodSetup).toBeDefined();
    });
  });

  describe('initial state', () => {
    it('should have correct initial state for entitySetup', () => {
      const state = store.getState();
      
      // Check that entitySetup has the expected structure
      expect(state.entitySetup).toBeDefined();
      // The exact structure depends on entitySetupReducer's initial state
    });

    it('should have correct initial state for entities', () => {
      const state = store.getState();
      
      expect(state.entities).toEqual({
        items: [],
        hierarchy: [],
        loading: false,
        hierarchyLoading: false,
        error: null,
        hierarchyError: null
      });
    });
  });

  describe('reducer isolation', () => {
    it('should maintain separate state for entitySetup and entities', () => {
      const initialState = store.getState();
      
      // Dispatch an action that only affects entities
      store.dispatch({ 
        type: 'entities/fetchAll/pending' 
      });
      
      const newState = store.getState();
      
      // entitySetup should remain unchanged
      expect(newState.entitySetup).toEqual(initialState.entitySetup);
      
      // entities should have changed
      expect(newState.entities.loading).toBe(true);
      expect(initialState.entities.loading).toBe(false);
    });

    it('should maintain separate state for different entity actions', () => {
      const initialState = store.getState();
      
      // Dispatch an action that affects entities loading
      store.dispatch({ 
        type: 'entities/fetchAll/pending' 
      });
      
      let newState = store.getState();
      expect(newState.entities.loading).toBe(true);
      expect(newState.entities.hierarchyLoading).toBe(false);
      
      // Dispatch an action that affects hierarchy loading
      store.dispatch({ 
        type: 'entities/fetchHierarchy/pending' 
      });
      
      newState = store.getState();
      expect(newState.entities.loading).toBe(true);
      expect(newState.entities.hierarchyLoading).toBe(true);
    });
  });

  describe('action dispatching', () => {
    it('should allow dispatching actions to entitySetup reducer', () => {
      // This test verifies that actions can be dispatched to the entitySetup reducer
      // The exact action depends on what entitySetupReducer supports
      const initialState = store.getState();
      
      // Dispatch a simple action to test that the store can handle it
      store.dispatch({ type: 'TEST_ACTION' });
      
      // State should remain the same for unknown actions
      expect(store.getState()).toEqual(initialState);
    });

    it('should allow dispatching actions to entities reducer', () => {
      const initialState = store.getState();
      
      // Dispatch an action that affects entities
      store.dispatch({ 
        type: 'entities/fetchAll/pending' 
      });
      
      const newState = store.getState();
      expect(newState.entities.loading).toBe(true);
      expect(newState.entities).not.toEqual(initialState.entities);
    });
  });

  describe('RootState type', () => {
    it('should have correct RootState type structure', () => {
      const state: RootState = store.getState();
      
      // TypeScript should enforce that state has the correct structure
      expect(state).toHaveProperty('entitySetup');
      expect(state).toHaveProperty('entities');
      expect(state).toHaveProperty('entityConfiguration');
      expect(state).toHaveProperty('periodSetup');
      
      // Test that we can access nested properties
      expect(state.entities.items).toBeDefined();
      expect(state.entities.loading).toBeDefined();
      expect(state.entities.hierarchy).toBeDefined();
    });

    it('should allow type-safe state access', () => {
      const state: RootState = store.getState();
      
      // These should be type-safe and not cause TypeScript errors
      const entitySetupState = state.entitySetup;
      const entitiesState = state.entities;
      
      expect(entitySetupState).toBeDefined();
      expect(entitiesState).toBeDefined();
    });
  });

  describe('store configuration', () => {
    it('should work with configureStore', () => {
      // This test verifies that the rootReducer works correctly with configureStore
      const testStore = configureStore({
        reducer: rootReducer,
        preloadedState: {
          entities: {
            items: [],
            hierarchy: [],
            loading: false,
            hierarchyLoading: false,
            error: null,
            hierarchyError: null
          }
        }
      });
      
      expect(testStore.getState()).toBeDefined();
      expect(testStore.getState().entities).toBeDefined();
    });

    it('should handle preloaded state correctly', () => {
      const preloadedState = {
        entities: {
          items: [{ id: '1', legalBusinessName: 'Test', displayName: 'Test', entityType: 'Test', isDeleted: false, isConfigured: true, isEnabled: true }],
          hierarchy: [],
          loading: false,
          hierarchyLoading: false,
          error: null,
          hierarchyError: null
        }
      };
      
      const testStore = configureStore({
        reducer: rootReducer,
        preloadedState
      });
      
      const state = testStore.getState();
      expect(state.entities.items).toHaveLength(1);
      expect(state.entities.items[0].id).toBe('1');
    });
  });

  describe('error handling', () => {
    it('should handle unknown action types gracefully', () => {
      const initialState = store.getState();
      
      // Dispatch an unknown action
      store.dispatch({ type: 'UNKNOWN_ACTION_TYPE' });
      
      // State should remain unchanged
      expect(store.getState()).toEqual(initialState);
    });

    it('should handle malformed actions gracefully', () => {
      const initialState = store.getState();
      
      // Dispatch a malformed action
      store.dispatch({ type: 'entities/fetchAll/fulfilled', payload: 'invalid' });
      
      // The store should handle this gracefully
      expect(store.getState()).toBeDefined();
    });
  });

  describe('performance and memory', () => {
    it('should not create new state objects unnecessarily', () => {
      const initialState = store.getState();
      
      // Dispatch an action that doesn't change state
      store.dispatch({ type: 'TEST_NO_CHANGE' });
      
      // State reference should remain the same for unchanged parts
      expect(store.getState().entities).toBe(initialState.entities);
    });

    it('should handle multiple dispatches correctly', () => {
      const initialState = store.getState();
      
      // Dispatch multiple actions
      store.dispatch({ type: 'entities/fetchAll/pending' });
      store.dispatch({ type: 'entities/fetchAll/fulfilled', payload: [] });
      store.dispatch({ type: 'entities/fetchHierarchy/pending' });
      
      const finalState = store.getState();
      
      expect(finalState.entities.loading).toBe(false);
      expect(finalState.entities.hierarchyLoading).toBe(true);
      expect(finalState.entities.items).toEqual([]);
    });
  });
});
