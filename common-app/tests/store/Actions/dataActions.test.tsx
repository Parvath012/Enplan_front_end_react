import * as dataActions from '../../../src/store/Actions/dataActions';

describe('Data Actions', () => {
  describe('setTableData Action', () => {
    // Test scenarios for different data types
    const testScenarios = [
      { input: 'test data', description: 'string data' },
      { input: 123, description: 'number data' },
      { input: true, description: 'boolean data' },
      { input: { id: 1, name: 'Test' }, description: 'object data' },
      { input: [1, 2, 3], description: 'array data' },
      { input: null, description: 'null data' },
      { input: undefined, description: 'undefined data' }
    ];

    // Individual tests for each scenario
    testScenarios.forEach(({ input, description }) => {
      it(`creates action with ${description}`, () => {
        const action = dataActions.setTableData(input);

        // Verify action type
        expect(action.type).toBe(dataActions.SET_TABLEDATA);
        
        // Verify payload
        expect(action.payload).toBe(input);
      });
    });

    // Edge cases
    const edgeCases = [
      { input: [], description: 'empty array' },
      { input: {}, description: 'empty object' },
      { input: '', description: 'empty string' }
    ];

    edgeCases.forEach(({ input, description }) => {
      it(`creates action with ${description}`, () => {
        const action = dataActions.setTableData(input);

        expect(action.type).toBe(dataActions.SET_TABLEDATA);
        expect(action.payload).toBe(input);
      });
    });

    it('maintains payload reference for complex objects', () => {
      const complexObject = { 
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ],
        metadata: {
          total: 2,
          lastUpdated: new Date()
        }
      };

      const action = dataActions.setTableData(complexObject);

      // Verify action type
      expect(action.type).toBe(dataActions.SET_TABLEDATA);
      
      // Verify payload is the exact same reference
      expect(action.payload).toBe(complexObject);
    });

    it('exports SET_TABLEDATA constant', () => {
      // Verify the constant is exported and has the correct value
      expect(dataActions.SET_TABLEDATA).toBe('SET_TABLEDATA');
    });
  });

  describe('Action Creator Consistency', () => {
    it('returns a plain action object', () => {
      const data = 'test data';
      const action = dataActions.setTableData(data);

      // Verify action is a plain object
      expect(typeof action).toBe('object');
      
      // Verify required properties
      expect(action).toHaveProperty('type');
      expect(action).toHaveProperty('payload');
    });

    it('handles multiple consecutive calls', () => {
      const data1 = 'first data';
      const data2 = 'second data';

      const action1 = dataActions.setTableData(data1);
      const action2 = dataActions.setTableData(data2);

      // Verify each action is unique
      expect(action1.type).toBe(action2.type);
      expect(action1.payload).not.toBe(action2.payload);
    });
  });

  describe('Performance and Immutability', () => {
    it('creates action without mutating input', () => {
      const originalObject = { id: 1, name: 'Test' };
      const action = dataActions.setTableData(originalObject);

      // Verify original object remains unchanged
      expect(originalObject).toEqual({ id: 1, name: 'Test' });
      
      // Verify payload is the same reference
      expect(action.payload).toBe(originalObject);
    });

    it('performance of action creation', () => {
      const startTime = performance.now();
      
      // Create multiple actions
      for (let i = 0; i < 1000; i++) {
        dataActions.setTableData(`data-${i}`);
      }
      
      const endTime = performance.now();
      
      // Verify action creation is performant (under 50ms for 1000 iterations)
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Type Checking', () => {
    it('ensures type safety for different data types', () => {
      // These are compile-time checks
      const testCases = [
        'string',
        123,
        true,
        { key: 'value' },
        [1, 2, 3],
        null,
        undefined
      ];

      testCases.forEach(data => {
        const action = dataActions.setTableData(data);
        
        // Verify action type
        expect(action.type).toBe(dataActions.SET_TABLEDATA);
        
        // Verify payload matches input
        expect(action.payload).toBe(data);
      });
    });
  });
});