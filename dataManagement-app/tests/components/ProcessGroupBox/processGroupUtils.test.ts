import {
  mapExecutionEngineFromAPI,
  mapFlowFileConcurrencyFromAPI,
  isValidUUID,
  loadParameterContext
} from '../../../src/components/ProcessGroupBox/processGroupUtils';

describe('processGroupUtils', () => {
  describe('mapExecutionEngineFromAPI', () => {
    it('should map INHERITED to Inherited', () => {
      expect(mapExecutionEngineFromAPI('INHERITED')).toBe('Inherited');
      expect(mapExecutionEngineFromAPI('inherited')).toBe('Inherited');
      expect(mapExecutionEngineFromAPI('Inherited')).toBe('Inherited');
    });

    it('should map STANDARD to Standard', () => {
      expect(mapExecutionEngineFromAPI('STANDARD')).toBe('Standard');
      expect(mapExecutionEngineFromAPI('standard')).toBe('Standard');
      expect(mapExecutionEngineFromAPI('Standard')).toBe('Standard');
    });

    it('should map STATELESS to Stateless', () => {
      expect(mapExecutionEngineFromAPI('STATELESS')).toBe('Stateless');
      expect(mapExecutionEngineFromAPI('stateless')).toBe('Stateless');
      expect(mapExecutionEngineFromAPI('Stateless')).toBe('Stateless');
    });

    it('should return original value for unknown values', () => {
      expect(mapExecutionEngineFromAPI('UNKNOWN')).toBe('UNKNOWN');
      expect(mapExecutionEngineFromAPI('CustomValue')).toBe('CustomValue');
    });
  });

  describe('mapFlowFileConcurrencyFromAPI', () => {
    it('should map UNBOUNDED to Unbounded', () => {
      expect(mapFlowFileConcurrencyFromAPI('UNBOUNDED')).toBe('Unbounded');
      expect(mapFlowFileConcurrencyFromAPI('unbounded')).toBe('Unbounded');
      expect(mapFlowFileConcurrencyFromAPI('Unbounded')).toBe('Unbounded');
    });

    it('should map SINGLE_FLOWFILE_PER_NODE to Single FlowFile Per Node', () => {
      expect(mapFlowFileConcurrencyFromAPI('SINGLE_FLOWFILE_PER_NODE')).toBe('Single FlowFile Per Node');
      expect(mapFlowFileConcurrencyFromAPI('single_flowfile_per_node')).toBe('Single FlowFile Per Node');
    });

    it('should map SINGLE_BATCH_PER_NODE to Single Batch Per Node', () => {
      expect(mapFlowFileConcurrencyFromAPI('SINGLE_BATCH_PER_NODE')).toBe('Single Batch Per Node');
      expect(mapFlowFileConcurrencyFromAPI('single_batch_per_node')).toBe('Single Batch Per Node');
    });

    it('should return original value for unknown values', () => {
      expect(mapFlowFileConcurrencyFromAPI('UNKNOWN')).toBe('UNKNOWN');
      expect(mapFlowFileConcurrencyFromAPI('CustomValue')).toBe('CustomValue');
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('00000000-0000-0000-0000-000000000000')).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456-42661417400')).toBe(false); // too short
      expect(isValidUUID('123e4567-e89b-12d3-a456-4266141740000')).toBe(false); // too long
    });

    it('should handle case insensitive UUIDs', () => {
      expect(isValidUUID('123E4567-E89B-12D3-A456-426614174000')).toBe(true);
      expect(isValidUUID('123e4567-E89B-12d3-A456-426614174000')).toBe(true);
    });
  });

  describe('loadParameterContext', () => {
    it('should return empty string when parameterContext is null', () => {
      expect(loadParameterContext(null)).toBe('');
    });

    it('should return empty string when parameterContext is undefined', () => {
      expect(loadParameterContext(undefined)).toBe('');
    });

    it('should return UUID when id is a valid UUID', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(loadParameterContext({ id: uuid })).toBe(uuid);
    });

    it('should return name when name matches options', () => {
      expect(loadParameterContext({ name: 'Dataflow_Dev' })).toBe('Dataflow_Dev');
      expect(loadParameterContext({ name: 'ETL_Prod' })).toBe('ETL_Prod');
      expect(loadParameterContext({ name: 'API_Gateway_Staging' })).toBe('API_Gateway_Staging');
    });

    it('should return id when id matches options', () => {
      expect(loadParameterContext({ id: 'Dataflow_Dev' })).toBe('Dataflow_Dev');
      expect(loadParameterContext({ id: 'ETL_Prod' })).toBe('ETL_Prod');
      expect(loadParameterContext({ id: 'API_Gateway_Staging' })).toBe('API_Gateway_Staging');
    });

    it('should prioritize UUID over name', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(loadParameterContext({ id: uuid, name: 'Dataflow_Dev' })).toBe(uuid);
    });

    it('should return empty string when name/id does not match options', () => {
      expect(loadParameterContext({ name: 'Unknown_Context' })).toBe('');
      expect(loadParameterContext({ id: 'Unknown_Context' })).toBe('');
    });

    it('should return empty string when id is not a valid UUID and name/id does not match', () => {
      expect(loadParameterContext({ id: 'not-a-uuid', name: 'Unknown' })).toBe('');
    });

    it('should handle empty string values', () => {
      expect(loadParameterContext({ id: '', name: '' })).toBe('');
    });
  });
});

