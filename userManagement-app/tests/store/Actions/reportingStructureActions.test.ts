/**
 * Tests for reportingStructureActions
 */
import {
  REPORTING_STRUCTURE_ACTIONS,
  setViewType,
  setLoading,
  setError
} from '../../../src/store/Actions/reportingStructureActions';
import { ViewByType } from '../../../src/constants/reportingStructureConstants';

describe('reportingStructureActions', () => {
  describe('Action Types', () => {
    it('should have correct action type constants', () => {
      expect(REPORTING_STRUCTURE_ACTIONS.SET_VIEW_TYPE).toBe('reportingStructure/setViewType');
      expect(REPORTING_STRUCTURE_ACTIONS.SET_LOADING).toBe('reportingStructure/setLoading');
      expect(REPORTING_STRUCTURE_ACTIONS.SET_ERROR).toBe('reportingStructure/setError');
    });
  });

  describe('setViewType', () => {
    it('should create action with organizational view type', () => {
      const action = setViewType('organizational');
      
      expect(action.type).toBe('reportingStructure/setViewType');
      expect(action.payload).toBe('organizational');
    });

    it('should create action with departmental view type', () => {
      const action = setViewType('departmental');
      
      expect(action.type).toBe('reportingStructure/setViewType');
      expect(action.payload).toBe('departmental');
    });

    it('should create action with dotted-line view type', () => {
      const action = setViewType('dotted-line');
      
      expect(action.type).toBe('reportingStructure/setViewType');
      expect(action.payload).toBe('dotted-line');
    });
  });

  describe('setLoading', () => {
    it('should create action with true loading state', () => {
      const action = setLoading(true);
      
      expect(action.type).toBe('reportingStructure/setLoading');
      expect(action.payload).toBe(true);
    });

    it('should create action with false loading state', () => {
      const action = setLoading(false);
      
      expect(action.type).toBe('reportingStructure/setLoading');
      expect(action.payload).toBe(false);
    });
  });

  describe('setError', () => {
    it('should create action with error message', () => {
      const errorMessage = 'Failed to fetch hierarchy';
      const action = setError(errorMessage);
      
      expect(action.type).toBe('reportingStructure/setError');
      expect(action.payload).toBe(errorMessage);
    });

    it('should create action with null error', () => {
      const action = setError(null);
      
      expect(action.type).toBe('reportingStructure/setError');
      expect(action.payload).toBeNull();
    });

    it('should create action with empty string error', () => {
      const action = setError('');
      
      expect(action.type).toBe('reportingStructure/setError');
      expect(action.payload).toBe('');
    });
  });

  describe('Action Creator Integration', () => {
    it('should create actions that can be dispatched', () => {
      const viewAction = setViewType('organizational');
      const loadingAction = setLoading(true);
      const errorAction = setError('Test error');

      expect(viewAction).toHaveProperty('type');
      expect(viewAction).toHaveProperty('payload');
      expect(loadingAction).toHaveProperty('type');
      expect(loadingAction).toHaveProperty('payload');
      expect(errorAction).toHaveProperty('type');
      expect(errorAction).toHaveProperty('payload');
    });

    it('should create actions compatible with Redux Toolkit', () => {
      const viewAction = setViewType('departmental');
      
      // Redux Toolkit actions should have type and payload
      expect(typeof viewAction.type).toBe('string');
      expect(viewAction.payload).toBeDefined();
    });
  });
});

