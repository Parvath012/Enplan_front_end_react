import authReducer, { IAuth } from '../../../src/store/Reducers/authReducer';
import { SET_TOKEN, GET_TOKEN } from '../../../src/store/Actions/authActions';

describe('Auth Reducer', () => {
  // Initial State Test
  describe('Initial State', () => {
    it('should return the initial state', () => {
      const initialState = authReducer(undefined, { type: '@@INIT' });
      
      expect(initialState).toEqual({
        token: null
      });
    });
  });

  // SET_TOKEN Action Tests
  describe('SET_TOKEN Action', () => {
    it('should set the token when SET_TOKEN action is dispatched', () => {
      const initialState: IAuth = { token: null };
      const action = {
        type: SET_TOKEN,
        payload: 'new-test-token'
      };

      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        token: 'new-test-token'
      });
    });

    it('should update the token if it already exists', () => {
      const initialState: IAuth = { token: 'old-token' };
      const action = {
        type: SET_TOKEN,
        payload: 'new-test-token'
      };

      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        token: 'new-test-token'
      });
    });
  });

  // GET_TOKEN Action Tests
  describe('GET_TOKEN Action', () => {
    it('should return the current state when GET_TOKEN action is dispatched', () => {
      const initialState: IAuth = { token: 'existing-token' };
      const action = { type: GET_TOKEN };

      const newState = authReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  // Unknown Action Tests
  describe('Unknown Action', () => {
    it('should return the current state for unknown action types', () => {
      const initialState: IAuth = { token: 'test-token' };
      const action = { type: 'UNKNOWN_ACTION' };

      const newState = authReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle null payload', () => {
      const initialState: IAuth = { token: 'existing-token' };
      const action = {
        type: SET_TOKEN,
        payload: null
      };

      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        token: null
      });
    });

    it('should handle undefined payload', () => {
      const initialState: IAuth = { token: 'existing-token' };
      const action = {
        type: SET_TOKEN,
        payload: undefined
      };

      const newState = authReducer(initialState, action);

      expect(newState).toEqual({
        token: undefined
      });
    });
  });

  // Immutability Tests
  describe('Immutability', () => {
    it('should not mutate the original state', () => {
      const initialState: IAuth = { token: 'original-token' };
      const action = {
        type: SET_TOKEN,
        payload: 'new-token'
      };

      const newState = authReducer(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(initialState.token).toBe('original-token');
    });
  });

  // Type Checking Tests
  describe('Type Checking', () => {
    it('should maintain the correct interface structure', () => {
      const initialState: IAuth = { token: null };
      const action = {
        type: SET_TOKEN,
        payload: 'test-token'
      };

      const newState = authReducer(initialState, action);

      expect(Object.keys(newState)).toEqual(['token']);
      expect(typeof newState.token).toBe('string');
    });
  });
});