import authReducer, { IAuth } from '../../../src/store/Reducers/authReducer';
import { SET_TOKEN, GET_TOKEN, setToken, getToken } from '../../../src/store/Actions/authActions';

describe('Auth Reducer', () => {
  const initialState: IAuth = {
    token: null,
  };

  describe('Initial State', () => {
    it('should return initial state when state is undefined', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      
      expect(state).toEqual(initialState);
    });

    it('should have token set to null initially', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      
      expect(state.token).toBeNull();
    });

    it('should match IAuth interface', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      
      expect(state).toHaveProperty('token');
      expect(Object.keys(state)).toHaveLength(1);
    });
  });

  describe('SET_TOKEN Action', () => {
    it('should handle SET_TOKEN action', () => {
      const token = 'test-token-123';
      const action = setToken(token);
      const state = authReducer(initialState, action);
      
      expect(state.token).toBe(token);
    });

    it('should update token in state', () => {
      const oldState: IAuth = { token: 'old-token' };
      const newToken = 'new-token';
      const action = setToken(newToken);
      const state = authReducer(oldState, action);
      
      expect(state.token).toBe(newToken);
      expect(state.token).not.toBe(oldState.token);
    });

    it('should not mutate original state', () => {
      const originalState: IAuth = { token: 'original' };
      const stateCopy = { ...originalState };
      const action = setToken('new-token');
      
      authReducer(originalState, action);
      
      expect(originalState).toEqual(stateCopy);
    });

    it('should return new state object', () => {
      const oldState: IAuth = { token: 'old' };
      const action = setToken('new');
      const newState = authReducer(oldState, action);
      
      expect(newState).not.toBe(oldState);
    });

    it('should handle empty string token', () => {
      const action = setToken('');
      const state = authReducer(initialState, action);
      
      expect(state.token).toBe('');
    });

    it('should handle long token strings', () => {
      const longToken = 'a'.repeat(1000);
      const action = setToken(longToken);
      const state = authReducer(initialState, action);
      
      expect(state.token).toBe(longToken);
    });

    it('should handle JWT-like tokens', () => {
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const action = setToken(jwtToken);
      const state = authReducer(initialState, action);
      
      expect(state.token).toBe(jwtToken);
    });

    it('should override previous token', () => {
      const firstToken = 'first-token';
      const secondToken = 'second-token';
      
      let state = authReducer(initialState, setToken(firstToken));
      expect(state.token).toBe(firstToken);
      
      state = authReducer(state, setToken(secondToken));
      expect(state.token).toBe(secondToken);
    });

    it('should handle tokens with special characters', () => {
      const specialToken = 'token!@#$%^&*()_+-={}[]|:;<>?,./';
      const action = setToken(specialToken);
      const state = authReducer(initialState, action);
      
      expect(state.token).toBe(specialToken);
    });
  });

  describe('GET_TOKEN Action', () => {
    it('should handle GET_TOKEN action', () => {
      const currentState: IAuth = { token: 'existing-token' };
      const action = getToken();
      const state = authReducer(currentState, action);
      
      expect(state).toEqual(currentState);
    });

    it('should return current state unchanged', () => {
      const currentState: IAuth = { token: 'test-token' };
      const action = getToken();
      const state = authReducer(currentState, action);
      
      expect(state.token).toBe(currentState.token);
    });

    it('should not modify token', () => {
      const currentState: IAuth = { token: 'preserved-token' };
      const action = getToken();
      const state = authReducer(currentState, action);
      
      expect(state.token).toBe('preserved-token');
    });

    it('should preserve null token', () => {
      const currentState: IAuth = { token: null };
      const action = getToken();
      const state = authReducer(currentState, action);
      
      expect(state.token).toBeNull();
    });

    it('should return new state object reference', () => {
      const currentState: IAuth = { token: 'test' };
      const action = getToken();
      const newState = authReducer(currentState, action);
      
      expect(newState).toEqual(currentState);
      expect(newState).not.toBe(currentState);
    });
  });

  describe('Unknown Actions', () => {
    it('should return current state for unknown action types', () => {
      const currentState: IAuth = { token: 'test-token' };
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      const state = authReducer(currentState, unknownAction);
      
      expect(state).toEqual(currentState);
    });

    it('should not modify state for invalid actions', () => {
      const currentState: IAuth = { token: 'preserved' };
      const invalidAction = { type: 'INVALID' };
      const state = authReducer(currentState, invalidAction);
      
      expect(state.token).toBe('preserved');
    });

    it('should handle empty action type', () => {
      const currentState: IAuth = { token: 'test' };
      const emptyAction = { type: '' };
      const state = authReducer(currentState, emptyAction);
      
      expect(state).toEqual(currentState);
    });

    it('should handle action without payload', () => {
      const currentState: IAuth = { token: 'test' };
      const actionWithoutPayload = { type: 'SOME_ACTION' };
      const state = authReducer(currentState, actionWithoutPayload);
      
      expect(state).toEqual(currentState);
    });
  });

  describe('State Immutability', () => {
    it('should not mutate state on SET_TOKEN', () => {
      const originalState: IAuth = { token: 'original' };
      const stateCopy = JSON.parse(JSON.stringify(originalState));
      
      authReducer(originalState, setToken('new'));
      
      expect(originalState).toEqual(stateCopy);
    });

    it('should not mutate state on GET_TOKEN', () => {
      const originalState: IAuth = { token: 'original' };
      const stateCopy = JSON.parse(JSON.stringify(originalState));
      
      authReducer(originalState, getToken());
      
      expect(originalState).toEqual(stateCopy);
    });

    it('should create new state object for each action', () => {
      const state1 = authReducer(initialState, setToken('token1'));
      const state2 = authReducer(state1, setToken('token2'));
      
      expect(state1).not.toBe(state2);
      expect(state1.token).toBe('token1');
      expect(state2.token).toBe('token2');
    });

    it('should use spread operator correctly', () => {
      const state = authReducer(initialState, setToken('test'));
      
      expect(state).toHaveProperty('token');
      expect(Object.keys(state)).toHaveLength(1);
    });
  });

  describe('Action Sequences', () => {
    it('should handle sequence of SET_TOKEN actions', () => {
      let state = initialState;
      
      state = authReducer(state, setToken('token1'));
      expect(state.token).toBe('token1');
      
      state = authReducer(state, setToken('token2'));
      expect(state.token).toBe('token2');
      
      state = authReducer(state, setToken('token3'));
      expect(state.token).toBe('token3');
    });

    it('should handle alternating SET and GET actions', () => {
      let state = initialState;
      
      state = authReducer(state, setToken('token1'));
      expect(state.token).toBe('token1');
      
      state = authReducer(state, getToken());
      expect(state.token).toBe('token1');
      
      state = authReducer(state, setToken('token2'));
      expect(state.token).toBe('token2');
      
      state = authReducer(state, getToken());
      expect(state.token).toBe('token2');
    });

    it('should handle rapid token updates', () => {
      let state = initialState;
      
      for (let i = 0; i < 100; i++) {
        state = authReducer(state, setToken(`token-${i}`));
      }
      
      expect(state.token).toBe('token-99');
    });
  });

  describe('Edge Cases', () => {
    it('should handle setting token to null-like string', () => {
      const action = setToken('null');
      const state = authReducer(initialState, action);
      
      expect(state.token).toBe('null');
    });

    it('should handle setting token to undefined-like string', () => {
      const action = setToken('undefined');
      const state = authReducer(initialState, action);
      
      expect(state.token).toBe('undefined');
    });

    it('should handle whitespace-only tokens', () => {
      const action = setToken('   ');
      const state = authReducer(initialState, action);
      
      expect(state.token).toBe('   ');
    });

    it('should handle tokens with newlines', () => {
      const action = setToken('token\nwith\nnewlines');
      const state = authReducer(initialState, action);
      
      expect(state.token).toBe('token\nwith\nnewlines');
    });

    it('should handle numeric string tokens', () => {
      const action = setToken('12345');
      const state = authReducer(initialState, action);
      
      expect(state.token).toBe('12345');
    });
  });

  describe('Type Safety', () => {
    it('should conform to IAuth interface', () => {
      const state = authReducer(initialState, setToken('test'));
      
      const isIAuth = (obj: any): obj is IAuth => {
        return typeof obj === 'object' && 
               obj !== null && 
               'token' in obj &&
               (typeof obj.token === 'string' || obj.token === null);
      };
      
      expect(isIAuth(state)).toBe(true);
    });

    it('should maintain token as string or null', () => {
      const stateWithToken = authReducer(initialState, setToken('test'));
      const stateWithNull = authReducer(initialState, { type: 'UNKNOWN' });
      
      expect(typeof stateWithToken.token === 'string' || stateWithToken.token === null).toBe(true);
      expect(typeof stateWithNull.token === 'string' || stateWithNull.token === null).toBe(true);
    });
  });

  describe('Default Case', () => {
    it('should return state for undefined action', () => {
      const currentState: IAuth = { token: 'test' };
      // @ts-ignore - Testing runtime behavior with safe default
      const state = authReducer(currentState, { type: undefined });
      
      expect(state).toEqual(currentState);
    });

    it('should return state for null action type', () => {
      const currentState: IAuth = { token: 'test' };
      const action = { type: null as any };
      const state = authReducer(currentState, action);
      
      expect(state).toEqual(currentState);
    });
  });

  describe('Performance', () => {
    it('should handle many sequential actions efficiently', () => {
      const start = Date.now();
      let state = initialState;
      
      for (let i = 0; i < 1000; i++) {
        state = authReducer(state, setToken(`token-${i}`));
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
      expect(state.token).toBe('token-999');
    });

    it('should not leak memory with repeated calls', () => {
      const states: IAuth[] = [];
      let state = initialState;
      
      for (let i = 0; i < 100; i++) {
        state = authReducer(state, setToken(`token-${i}`));
        states.push(state);
      }
      
      expect(states).toHaveLength(100);
      states.forEach((s, index) => {
        expect(s.token).toBe(`token-${index}`);
      });
    });
  });
});

