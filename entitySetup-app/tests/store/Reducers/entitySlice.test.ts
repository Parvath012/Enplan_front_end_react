import { configureStore } from '@reduxjs/toolkit';
import entityReducer, { fetchEntities, fetchEntityHierarchy, clearEntities, updateEntityIsEnabled, EntityState } from '../../../src/store/Reducers/entitySlice';

// Mock the service
jest.mock('../../../src/services/entitySetupService', () => ({
  fetchEntitiesFromApi: jest.fn(),
  fetchEntityHierarchyFromApi: jest.fn()
}));

import { fetchEntitiesFromApi, fetchEntityHierarchyFromApi } from '../../../src/services/entitySetupService';

describe('entitySlice', () => {
  let store: any;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        entities: entityReducer
      }
    });
  });
  
  it('should handle initial state', () => {
    const state = store.getState().entities;
    expect(state).toEqual({
      items: [],
      hierarchy: [],
      loading: false,
      hierarchyLoading: false,
      error: null,
      hierarchyError: null
    });
  });
  
  it('should handle clearEntities', () => {
    // First add some items to state
    store.dispatch({ 
      type: 'entities/fetchAll/fulfilled', 
      payload: [{ id: '1', legalBusinessName: 'Test', displayName: 'Test', entityType: 'Test', isDeleted: false, isConfigured: true, isEnabled: true }] 
    });
    
    // Verify items are in state
    expect(store.getState().entities.items).toHaveLength(1);
    
    // Clear entities
    store.dispatch(clearEntities());
    
    // Verify state is reset
    expect(store.getState().entities).toEqual({
      items: [],
      hierarchy: [],
      loading: false,
      hierarchyLoading: false,
      error: null,
      hierarchyError: null
    });
  });

  it('should handle updateEntityIsEnabled', () => {
    // First add some items to state
    const mockEntities = [
      { id: '1', legalBusinessName: 'Test Entity 1', displayName: 'Test 1', entityType: 'Planning', isDeleted: false, isConfigured: true, isEnabled: true },
      { id: '2', legalBusinessName: 'Test Entity 2', displayName: 'Test 2', entityType: 'Rollup', isDeleted: false, isConfigured: false, isEnabled: false }
    ];
    
    store.dispatch({ 
      type: 'entities/fetchAll/fulfilled', 
      payload: mockEntities 
    });
    
    // Verify initial state
    expect(store.getState().entities.items[0].isEnabled).toBe(true);
    expect(store.getState().entities.items[1].isEnabled).toBe(false);
    
    // Update entity isEnabled
    store.dispatch(updateEntityIsEnabled({ id: '1', isEnabled: false }));
    store.dispatch(updateEntityIsEnabled({ id: '2', isEnabled: true }));
    
    // Verify state is updated
    expect(store.getState().entities.items[0].isEnabled).toBe(false);
    expect(store.getState().entities.items[1].isEnabled).toBe(true);
  });

  it('should handle updateEntityIsEnabled for non-existent entity', () => {
    // First add some items to state
    const mockEntities = [
      { id: '1', legalBusinessName: 'Test Entity 1', displayName: 'Test 1', entityType: 'Planning', isDeleted: false, isConfigured: true, isEnabled: true }
    ];
    
    store.dispatch({ 
      type: 'entities/fetchAll/fulfilled', 
      payload: mockEntities 
    });
    
    // Try to update non-existent entity
    store.dispatch(updateEntityIsEnabled({ id: '999', isEnabled: false }));
    
    // Verify state is unchanged
    expect(store.getState().entities.items[0].isEnabled).toBe(true);
  });
  
  describe('fetchEntities async thunk', () => {
    it('should handle fetchEntities.pending', () => {
      store.dispatch({ type: 'entities/fetchAll/pending' });
      
      expect(store.getState().entities).toEqual({
        items: [],
        hierarchy: [],
        loading: true,
        hierarchyLoading: false,
        error: null,
        hierarchyError: null
      });
    });
    
    it('should handle fetchEntities.fulfilled', () => {
      const mockEntities = [
        { id: '1', legalBusinessName: 'Test Entity 1', displayName: 'Test 1', entityType: 'Planning', isDeleted: false, isConfigured: true, isEnabled: true },
        { id: '2', legalBusinessName: 'Test Entity 2', displayName: 'Test 2', entityType: 'Rollup', isDeleted: false, isConfigured: false, isEnabled: false }
      ];
      
      store.dispatch({ 
        type: 'entities/fetchAll/fulfilled', 
        payload: mockEntities 
      });
      
      expect(store.getState().entities).toEqual({
        items: mockEntities,
        hierarchy: [],
        loading: false,
        hierarchyLoading: false,
        error: null,
        hierarchyError: null
      });
    });
    
    it('should handle fetchEntities.rejected', () => {
      store.dispatch({ 
        type: 'entities/fetchAll/rejected',
        error: { message: 'Failed to load' } 
      });
      
      expect(store.getState().entities).toEqual({
        items: [],
        hierarchy: [],
        loading: false,
        hierarchyLoading: false,
        error: 'Failed to load',
        hierarchyError: null
      });
    });
    
    it('should fetch entities successfully', async () => {
      const mockEntities = [
        { id: '1', legalBusinessName: 'Test Entity 1', displayName: 'Test 1', entityType: 'Planning', isDeleted: false, isConfigured: true, isEnabled: true }
      ];
      
      (fetchEntitiesFromApi as jest.Mock).mockResolvedValue(mockEntities);
      
      await store.dispatch(fetchEntities());
      
      expect(fetchEntitiesFromApi).toHaveBeenCalled();
      expect(store.getState().entities.items).toEqual(mockEntities);
      expect(store.getState().entities.loading).toBe(false);
      expect(store.getState().entities.error).toBe(null);
    });
    
    it('should handle fetch entities error', async () => {
      const errorMessage = 'Network error';
      (fetchEntitiesFromApi as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      await store.dispatch(fetchEntities());
      
      expect(fetchEntitiesFromApi).toHaveBeenCalled();
      expect(store.getState().entities.items).toEqual([]);
      expect(store.getState().entities.loading).toBe(false);
      expect(store.getState().entities.error).toBe(errorMessage);
    });
  });

  describe('fetchEntityHierarchy async thunk', () => {
    it('should handle fetchEntityHierarchy.pending', () => {
      store.dispatch({ type: 'entities/fetchHierarchy/pending' });
      
      expect(store.getState().entities).toEqual({
        items: [],
        hierarchy: [],
        loading: false,
        hierarchyLoading: true,
        error: null,
        hierarchyError: null
      });
    });
    
    it('should handle fetchEntityHierarchy.fulfilled', () => {
      const mockHierarchy = [
        { id: 1, displayName: 'Parent Entity', entityType: 'Rollup Entity', parent: [] },
        { id: 2, displayName: 'Child Entity', entityType: 'Planning Entity', parent: [{ id: 1, displayName: 'Parent Entity', entityType: 'Rollup Entity' }] }
      ];
      
      store.dispatch({ 
        type: 'entities/fetchHierarchy/fulfilled', 
        payload: mockHierarchy 
      });
      
      expect(store.getState().entities).toEqual({
        items: [],
        hierarchy: mockHierarchy,
        loading: false,
        hierarchyLoading: false,
        error: null,
        hierarchyError: null
      });
    });
    
    it('should handle fetchEntityHierarchy.rejected', () => {
      store.dispatch({ 
        type: 'entities/fetchHierarchy/rejected',
        error: { message: 'Failed to load hierarchy' } 
      });
      
      expect(store.getState().entities).toEqual({
        items: [],
        hierarchy: [],
        loading: false,
        hierarchyLoading: false,
        error: null,
        hierarchyError: 'Failed to load hierarchy'
      });
    });
    
    it('should fetch entity hierarchy successfully', async () => {
      const mockHierarchy = [
        { id: 1, displayName: 'Parent Entity', entityType: 'Rollup Entity', parent: [] },
        { id: 2, displayName: 'Child Entity', entityType: 'Planning Entity', parent: [{ id: 1, displayName: 'Parent Entity', entityType: 'Rollup Entity' }] }
      ];
      
      (fetchEntityHierarchyFromApi as jest.Mock).mockResolvedValue(mockHierarchy);
      
      await store.dispatch(fetchEntityHierarchy());
      
      expect(fetchEntityHierarchyFromApi).toHaveBeenCalled();
      expect(store.getState().entities.hierarchy).toEqual(mockHierarchy);
      expect(store.getState().entities.hierarchyLoading).toBe(false);
      expect(store.getState().entities.hierarchyError).toBe(null);
    });
    
    it('should handle fetch entity hierarchy error', async () => {
      const errorMessage = 'Hierarchy network error';
      (fetchEntityHierarchyFromApi as jest.Mock).mockRejectedValue(new Error(errorMessage));
      
      await store.dispatch(fetchEntityHierarchy());
      
      expect(fetchEntityHierarchyFromApi).toHaveBeenCalled();
      expect(store.getState().entities.hierarchy).toEqual([]);
      expect(store.getState().entities.hierarchyLoading).toBe(false);
      expect(store.getState().entities.hierarchyError).toBe(errorMessage);
    });

    it('should handle fetch entity hierarchy with null error message', async () => {
      (fetchEntityHierarchyFromApi as jest.Mock).mockRejectedValue(new Error());
      
      await store.dispatch(fetchEntityHierarchy());
      
      expect(fetchEntityHierarchyFromApi).toHaveBeenCalled();
      expect(store.getState().entities.hierarchy).toEqual([]);
      expect(store.getState().entities.hierarchyLoading).toBe(false);
      // The actual implementation returns an empty string when error.message is undefined
      expect(store.getState().entities.hierarchyError).toBe('');
    });
  });

  describe('state isolation', () => {
    it('should maintain separate loading states for entities and hierarchy', () => {
      // Set entities loading
      store.dispatch({ type: 'entities/fetchAll/pending' });
      expect(store.getState().entities.loading).toBe(true);
      expect(store.getState().entities.hierarchyLoading).toBe(false);
      
      // Set hierarchy loading
      store.dispatch({ type: 'entities/fetchHierarchy/pending' });
      expect(store.getState().entities.loading).toBe(true);
      expect(store.getState().entities.hierarchyLoading).toBe(true);
      
      // Complete entities
      store.dispatch({ 
        type: 'entities/fetchAll/fulfilled', 
        payload: [] 
      });
      expect(store.getState().entities.loading).toBe(false);
      expect(store.getState().entities.hierarchyLoading).toBe(true);
      
      // Complete hierarchy
      store.dispatch({ 
        type: 'entities/fetchHierarchy/fulfilled', 
        payload: [] 
      });
      expect(store.getState().entities.loading).toBe(false);
      expect(store.getState().entities.hierarchyLoading).toBe(false);
    });

    it('should maintain separate error states for entities and hierarchy', () => {
      // Set entities error
      store.dispatch({ 
        type: 'entities/fetchAll/rejected',
        error: { message: 'Entities error' } 
      });
      expect(store.getState().entities.error).toBe('Entities error');
      expect(store.getState().entities.hierarchyError).toBe(null);
      
      // Set hierarchy error
      store.dispatch({ 
        type: 'entities/fetchHierarchy/rejected',
        error: { message: 'Hierarchy error' } 
      });
      expect(store.getState().entities.error).toBe('Entities error');
      expect(store.getState().entities.hierarchyError).toBe('Hierarchy error');
    });
  });
});
