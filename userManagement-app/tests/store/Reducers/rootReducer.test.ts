import rootReducer, { RootState } from '../../../src/store/Reducers/rootReducer';
import { configureStore } from '@reduxjs/toolkit';
import userSlice from '../../../src/store/Reducers/userSlice';
import roleSlice from '../../../src/store/Reducers/roleSlice';
import groupSlice from '../../../src/store/Reducers/groupSlice';

describe('rootReducer', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: rootReducer
    });
  });

  it('should be a function', () => {
    expect(typeof rootReducer).toBe('function');
  });

  it('should handle undefined state', () => {
    const mockAction = { type: 'TEST_ACTION' };
    const result = rootReducer(undefined, mockAction);
    
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('roles');
    expect(result).toHaveProperty('groups');
    expect(result.users).toBeDefined();
    expect(result.roles).toBeDefined();
    expect(result.groups).toBeDefined();
  });

  it('should handle actions without throwing', () => {
    const mockState: RootState = {
      users: {
        users: [],
        loading: false,
        hierarchyLoading: false,
        hierarchy: null,
        error: null,
        hierarchyError: null,
        hasUsers: false,
        initialFetchAttempted: false
      },
      roles: {
        roles: [],
        loading: false,
        error: null,
        hasRoles: false,
        initialFetchAttempted: false
      },
      groups: {
        groups: [],
        loading: false,
        error: null,
        hasGroups: false,
        initialFetchAttempted: false
      }
    };

    const mockAction = { type: 'TEST_ACTION' };
    
    expect(() => rootReducer(mockState, mockAction)).not.toThrow();
  });

  it('should maintain state structure', () => {
    const mockState: RootState = {
      users: {
        users: [
          {
            id: 1,
            firstname: 'John',
            lastname: 'Doe',
            emailid: 'john@example.com',
            role: 'Admin',
            department: 'IT',
            status: 'Active',
            isenabled: true,
            phonenumber: '',
            reportingmanager: '',
            dottedorprojectmanager: '',
            selfreporting: 'false',
            createdat: '',
            lastupdatedat: '',
            createdby: '',
            lastupdatedby: '',
            transferedby: '',
            transferedto: '',
            transfereddate: '',
            regions: null,
            countries: null,
            divisions: null,
            groups: null,
            departments: null,
            class: null,
            subClass: null,
            permissions: null
          }
        ],
        loading: false,
        hierarchyLoading: false,
        hierarchy: null,
        error: null,
        hierarchyError: null,
        hasUsers: true,
        initialFetchAttempted: true
      },
      roles: {
        roles: [],
        loading: false,
        error: null,
        hasRoles: false,
        initialFetchAttempted: false
      },
      groups: {
        groups: [],
        loading: false,
        error: null,
        hasGroups: false,
        initialFetchAttempted: false
      }
    };

    const mockAction = { type: 'TEST_ACTION' };
    const result = rootReducer(mockState, mockAction);

    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('roles');
    expect(result).toHaveProperty('groups');
    expect(result.users).toHaveProperty('users');
    expect(result.users).toHaveProperty('loading');
    expect(result.users).toHaveProperty('error');
    expect(result.users).toHaveProperty('hasUsers');
    expect(result.users).toHaveProperty('initialFetchAttempted');
    expect(result.roles).toHaveProperty('roles');
    expect(result.roles).toHaveProperty('loading');
    expect(result.roles).toHaveProperty('error');
    expect(result.groups).toHaveProperty('groups');
    expect(result.groups).toHaveProperty('loading');
    expect(result.groups).toHaveProperty('error');
  });

  it('should handle user-related actions', () => {
    const mockState: RootState = {
      users: {
        users: [],
        loading: false,
        hierarchyLoading: false,
        hierarchy: null,
        error: null,
        hierarchyError: null,
        hasUsers: false,
        initialFetchAttempted: false
      },
      roles: {
        roles: [],
        loading: false,
        error: null,
        hasRoles: false,
        initialFetchAttempted: false
      },
      groups: {
        groups: [],
        loading: false,
        error: null,
        hasGroups: false,
        initialFetchAttempted: false
      }
    };

    const actions = [
      { type: 'users/fetchUsers/pending' },
      { type: 'users/fetchUsers/fulfilled', payload: [] },
      { type: 'users/fetchUsers/rejected', error: { message: 'Error message' } }
    ];

    actions.forEach(action => {
      expect(() => rootReducer(mockState, action)).not.toThrow();
    });
  });

  it('should handle role-related actions', () => {
    const mockState: RootState = {
      users: {
        users: [],
        loading: false,
        hierarchyLoading: false,
        hierarchy: null,
        error: null,
        hierarchyError: null,
        hasUsers: false,
        initialFetchAttempted: false
      },
      roles: {
        roles: [],
        loading: false,
        error: null,
        hasRoles: false,
        initialFetchAttempted: false
      },
      groups: {
        groups: [],
        loading: false,
        error: null,
        hasGroups: false,
        initialFetchAttempted: false
      }
    };

    const actions = [
      { type: 'roles/fetchRoles/pending' },
      { type: 'roles/fetchRoles/fulfilled', payload: [] },
      { type: 'roles/fetchRoles/rejected', error: { message: 'Error message' } }
    ];

    actions.forEach(action => {
      expect(() => rootReducer(mockState, action)).not.toThrow();
    });
  });

  it('should handle group-related actions', () => {
    const mockState: RootState = {
      users: {
        users: [],
        loading: false,
        hierarchyLoading: false,
        hierarchy: null,
        error: null,
        hierarchyError: null,
        hasUsers: false,
        initialFetchAttempted: false
      },
      roles: {
        roles: [],
        loading: false,
        error: null,
        hasRoles: false,
        initialFetchAttempted: false
      },
      groups: {
        groups: [],
        loading: false,
        error: null,
        hasGroups: false,
        initialFetchAttempted: false
      }
    };

    const actions = [
      { type: 'groups/fetchGroups/pending' },
      { type: 'groups/fetchGroups/fulfilled', payload: [] },
      { type: 'groups/fetchGroups/rejected', error: { message: 'Error message' } }
    ];

    actions.forEach(action => {
      expect(() => rootReducer(mockState, action)).not.toThrow();
    });
  });

  it('should be immutable', () => {
    const mockState: RootState = {
      users: {
        users: [],
        loading: false,
        hierarchyLoading: false,
        hierarchy: null,
        error: null,
        hierarchyError: null,
        hasUsers: false,
        initialFetchAttempted: false
      },
      roles: {
        roles: [],
        loading: false,
        error: null,
        hasRoles: false,
        initialFetchAttempted: false
      },
      groups: {
        groups: [],
        loading: false,
        error: null,
        hasGroups: false,
        initialFetchAttempted: false
      }
    };

    const mockAction = { type: 'TEST_ACTION' };
    const result = rootReducer(mockState, mockAction);

    // Original state should not be modified
    expect(mockState.users).toEqual({
      users: [],
      loading: false,
      hierarchyLoading: false,
      hierarchy: null,
      error: null,
      hierarchyError: null,
      hasUsers: false,
      initialFetchAttempted: false
    });

    // Result should be defined and have the correct structure
    expect(result).toBeDefined();
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('roles');
    expect(result).toHaveProperty('groups');
  });

  it('should handle empty action', () => {
    const mockState: RootState = {
      users: {
        users: [],
        loading: false,
        hierarchyLoading: false,
        hierarchy: null,
        error: null,
        hierarchyError: null,
        hasUsers: false,
        initialFetchAttempted: false
      },
      roles: {
        roles: [],
        loading: false,
        error: null,
        hasRoles: false,
        initialFetchAttempted: false
      },
      groups: {
        groups: [],
        loading: false,
        error: null,
        hasGroups: false,
        initialFetchAttempted: false
      }
    };

    const emptyAction = { type: '' };
    const result = rootReducer(mockState, emptyAction);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('roles');
    expect(result).toHaveProperty('groups');
  });

  it('should combine all reducers correctly', () => {
    const initialState = rootReducer(undefined, { type: '@@INIT' });
    
    expect(initialState).toHaveProperty('users');
    expect(initialState).toHaveProperty('roles');
    expect(initialState).toHaveProperty('groups');
    
    // Verify each slice has its initial state
    expect(initialState.users).toEqual({
      users: [],
      loading: false,
      hierarchyLoading: false,
      hierarchy: null,
      error: null,
      hierarchyError: null,
      hasUsers: false,
      initialFetchAttempted: false
    });
    
    expect(initialState.roles).toEqual({
      roles: [],
      loading: false,
      error: null,
      hasRoles: false,
      initialFetchAttempted: false
    });
  });

  it('should handle actions that affect multiple slices', () => {
    const mockState: RootState = {
      users: {
        users: [],
        loading: false,
        hierarchyLoading: false,
        hierarchy: null,
        error: null,
        hierarchyError: null,
        hasUsers: false,
        initialFetchAttempted: false
      },
      roles: {
        roles: [],
        loading: false,
        error: null,
        hasRoles: false,
        initialFetchAttempted: false
      },
      groups: {
        groups: [],
        loading: false,
        error: null,
        hasGroups: false,
        initialFetchAttempted: false
      }
    };

    // Dispatch actions to different slices
    const userAction = { type: 'users/fetchUsers/pending' };
    const roleAction = { type: 'roles/fetchRoles/pending' };
    const groupAction = { type: 'groups/fetchGroups/pending' };

    let result = rootReducer(mockState, userAction);
    expect(result.users.loading).toBe(true);
    expect(result.roles.loading).toBe(false);
    expect(result.groups.loading).toBe(false);

    result = rootReducer(mockState, roleAction);
    expect(result.users.loading).toBe(false);
    expect(result.roles.loading).toBe(true);
    expect(result.groups.loading).toBe(false);

    result = rootReducer(mockState, groupAction);
    expect(result.users.loading).toBe(false);
    expect(result.roles.loading).toBe(false);
    expect(result.groups.loading).toBe(true);
  });

  it('should maintain RootState type correctly', () => {
    const state = rootReducer(undefined, { type: '@@INIT' });
    
    // TypeScript should infer this correctly
    const rootState: RootState = state;
    
    expect(rootState).toBeDefined();
    expect(rootState.users).toBeDefined();
    expect(rootState.roles).toBeDefined();
    expect(rootState.groups).toBeDefined();
  });

  it('should handle unknown action types gracefully', () => {
    const mockState: RootState = {
      users: {
        users: [],
        loading: false,
        hierarchyLoading: false,
        hierarchy: null,
        error: null,
        hierarchyError: null,
        hasUsers: false,
        initialFetchAttempted: false
      },
      roles: {
        roles: [],
        loading: false,
        error: null,
        hasRoles: false,
        initialFetchAttempted: false
      },
      groups: {
        groups: [],
        loading: false,
        error: null,
        hasGroups: false,
        initialFetchAttempted: false
      }
    };

    const unknownAction = { type: 'UNKNOWN_ACTION_TYPE_12345' };
    const result = rootReducer(mockState, unknownAction);

    // Should return state unchanged for unknown actions
    expect(result).toBeDefined();
    expect(result.users).toEqual(mockState.users);
    expect(result.roles).toEqual(mockState.roles);
    expect(result.groups).toEqual(mockState.groups);
  });
});
