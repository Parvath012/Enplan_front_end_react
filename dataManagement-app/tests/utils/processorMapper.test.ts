import { mapProcessorForDisplay, mapProcessorsForDisplay } from '../../src/utils/processorMapper';

describe('processorMapper', () => {
  describe('mapProcessorForDisplay', () => {
    it('should map processor with all fields', () => {
      const processor = {
        id: 'processor-id',
        component: {
          id: 'component-id',
          name: 'Test Processor',
          type: 'com.example.TestProcessor',
          state: 'RUNNING',
          validationStatus: { state: 'VALID' },
          bundle: {
            group: 'com.example',
            artifact: 'test-artifact',
            version: '1.0.0'
          },
          position: { x: 100, y: 200 }
        },
        status: {
          aggregateSnapshot: {
            taskCount: 5,
            taskDuration: '00:01:30.000',
            queued: '10 (1000 bytes)',
            input: '20 (2000 bytes)',
            read: '3000 bytes',
            written: '4000 bytes',
            output: '15 (1500 bytes)'
          }
        }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.id).toBe('processor-id');
      expect(result.name).toBe('Test Processor');
      expect(result.processorType).toBe('com.example.TestProcessor');
      expect(result.runningCount).toBe(1);
      expect(result.stoppedCount).toBe(0);
      expect(result.invalidCount).toBe(0);
      expect(result.disabledCount).toBe(0);
      expect(result.position).toEqual({ x: 100, y: 200 });
      expect(result.bundleGroup).toBe('com.example');
      expect(result.bundleArtifact).toBe('test-artifact');
      expect(result.bundleVersion).toBe('1.0.0');
      expect(result.taskCount).toBe(5);
      expect(result.taskDuration).toBe('00:01:30.000');
      expect(result.taskTime).toBe('5 / 00:01:30.000');
      expect(result.isProcessor).toBe(true);
    });

    it('should use type name when name is missing', () => {
      const processor = {
        id: 'processor-id',
        component: {
          type: 'com.example.TestProcessor',
          state: 'STOPPED'
        }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.name).toBe('TestProcessor');
    });

    it('should use Unknown Processor when both name and type are missing', () => {
      const processor = {
        id: 'processor-id',
        component: {
          state: 'STOPPED'
        }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.name).toBe('Unknown Processor');
    });

    it('should set runningCount to 1 when state is RUNNING', () => {
      const processor = {
        component: { state: 'RUNNING' }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.runningCount).toBe(1);
      expect(result.stoppedCount).toBe(0);
    });

    it('should set stoppedCount to 1 when state is STOPPED', () => {
      const processor = {
        component: { state: 'STOPPED' }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.runningCount).toBe(0);
      expect(result.stoppedCount).toBe(1);
    });

    it('should set disabledCount to 1 when state is DISABLED', () => {
      const processor = {
        component: { state: 'DISABLED' }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.disabledCount).toBe(1);
      expect(result.runningCount).toBe(0);
    });

    it('should set invalidCount to 1 when validation state is INVALID', () => {
      const processor = {
        component: {
          state: 'STOPPED',
          validationStatus: { state: 'INVALID' }
        }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.invalidCount).toBe(1);
    });

    it('should use default stats when status is missing', () => {
      const processor = {
        component: { state: 'STOPPED' }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.queued).toBe('0 (0 bytes)');
      expect(result.input).toBe('0 (0 bytes)');
      expect(result.read).toBe('0 bytes');
      expect(result.written).toBe('0 bytes');
      expect(result.output).toBe('0 (0 bytes)');
    });

    it('should use default position when position is missing', () => {
      const processor = {
        component: { state: 'STOPPED' }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.position).toEqual({ x: 0, y: 0 });
    });

    it('should adjust position when x is greater than 2000', () => {
      const processor = {
        component: {
          state: 'STOPPED',
          position: { x: 3000, y: 4000 }
        }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.position).toEqual({ x: 50, y: 50 });
    });

    it('should use component.id as fallback for id', () => {
      const processor = {
        component: {
          id: 'component-id',
          state: 'STOPPED'
        }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.id).toBe('component-id');
    });

    it('should handle missing bundle fields', () => {
      const processor = {
        component: {
          state: 'STOPPED',
          bundle: {}
        }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.bundleGroup).toBe('');
      expect(result.bundleArtifact).toBe('');
      expect(result.bundleVersion).toBe('');
    });

    it('should set processor-specific fields', () => {
      const processor = {
        component: { state: 'STOPPED' }
      };

      const result = mapProcessorForDisplay(processor);

      expect(result.isProcessor).toBe(true);
      expect(result.parameterContext).toBe('None');
      expect(result.activeRemotePortCount).toBe(0);
      expect(result.inactiveRemotePortCount).toBe(0);
      expect(result.upToDateCount).toBe(0);
      expect(result.locallyModifiedCount).toBe(0);
      expect(result.staleCount).toBe(0);
      expect(result.locallyModifiedAndStaleCount).toBe(0);
      expect(result.syncFailureCount).toBe(0);
    });
  });

  describe('mapProcessorsForDisplay', () => {
    it('should map array of processors', () => {
      const processors = [
        { component: { state: 'RUNNING' } },
        { component: { state: 'STOPPED' } }
      ];

      const result = mapProcessorsForDisplay(processors);

      expect(result).toHaveLength(2);
      expect(result[0].runningCount).toBe(1);
      expect(result[1].stoppedCount).toBe(1);
    });

    it('should return empty array for null input', () => {
      const result = mapProcessorsForDisplay(null as any);

      expect(result).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
      const result = mapProcessorsForDisplay(undefined as any);

      expect(result).toEqual([]);
    });

    it('should return empty array for non-array input', () => {
      const result = mapProcessorsForDisplay({} as any);

      expect(result).toEqual([]);
    });

    it('should handle empty array', () => {
      const result = mapProcessorsForDisplay([]);

      expect(result).toEqual([]);
    });
  });
});

