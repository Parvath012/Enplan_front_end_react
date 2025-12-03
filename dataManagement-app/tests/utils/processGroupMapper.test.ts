import { mapProcessGroupForDisplay, mapProcessGroupsForDisplay } from '../../src/utils/processGroupMapper';
import { ProcessGroupResponse } from '../../src/api/nifi/nifiApiService';

describe('processGroupMapper', () => {
  const mockProcessGroupResponse: ProcessGroupResponse = {
    id: 'pg-1',
    component: {
      name: 'Test Process Group',
      position: { x: 100, y: 200 },
      runningCount: 5,
      stoppedCount: 2,
      invalidCount: 0,
      disabledCount: 1,
      activeRemotePortCount: 3,
      inactiveRemotePortCount: 1,
      upToDateCount: 4,
      locallyModifiedCount: 1,
      staleCount: 0,
      locallyModifiedAndStaleCount: 0,
      syncFailureCount: 0
    },
    status: {
      aggregateSnapshot: {
        queued: '10 (1024 bytes)',
        input: '5 (512 bytes)',
        read: '2048 bytes',
        written: '4096 bytes',
        output: '3 (256 bytes)'
      }
    }
  };

  describe('mapProcessGroupForDisplay', () => {
    it('should map process group response correctly', () => {
      const mapped = mapProcessGroupForDisplay(mockProcessGroupResponse);

      expect(mapped.id).toBe('pg-1');
      expect(mapped.name).toBe('Test Process Group');
      expect(mapped.parameterContext).toBe('None');
      expect(mapped.position).toEqual({ x: 100, y: 200 });
      expect(mapped.runningCount).toBe(5);
      expect(mapped.stoppedCount).toBe(2);
      expect(mapped.invalidCount).toBe(0);
      expect(mapped.disabledCount).toBe(1);
      expect(mapped.activeRemotePortCount).toBe(3);
      expect(mapped.inactiveRemotePortCount).toBe(1);
      expect(mapped.queued).toBe('10 (1024 bytes)');
      expect(mapped.input).toBe('5 (512 bytes)');
      expect(mapped.read).toBe('2048 bytes');
      expect(mapped.written).toBe('4096 bytes');
      expect(mapped.output).toBe('3 (256 bytes)');
    });

    it('should use default stats when status is missing', () => {
      const responseWithoutStatus: ProcessGroupResponse = {
        id: 'pg-2',
        component: {
          name: 'No Status Group',
          position: { x: 0, y: 0 },
          runningCount: 0,
          stoppedCount: 0,
          invalidCount: 0,
          disabledCount: 0,
          activeRemotePortCount: 0,
          inactiveRemotePortCount: 0,
          upToDateCount: 0,
          locallyModifiedCount: 0,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0
        }
      };

      const mapped = mapProcessGroupForDisplay(responseWithoutStatus);

      expect(mapped.queued).toBe('0 (0 bytes)');
      expect(mapped.input).toBe('0 (0 bytes)');
      expect(mapped.read).toBe('0 bytes');
      expect(mapped.written).toBe('0 bytes');
      expect(mapped.output).toBe('0 (0 bytes)');
    });

    it('should use default stats when aggregateSnapshot is missing', () => {
      const responseWithoutSnapshot: ProcessGroupResponse = {
        id: 'pg-3',
        component: {
          name: 'No Snapshot Group',
          position: { x: 0, y: 0 },
          runningCount: 0,
          stoppedCount: 0,
          invalidCount: 0,
          disabledCount: 0,
          activeRemotePortCount: 0,
          inactiveRemotePortCount: 0,
          upToDateCount: 0,
          locallyModifiedCount: 0,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0
        },
        status: {}
      };

      const mapped = mapProcessGroupForDisplay(responseWithoutSnapshot);

      expect(mapped.queued).toBe('0 (0 bytes)');
      expect(mapped.input).toBe('0 (0 bytes)');
      expect(mapped.read).toBe('0 bytes');
      expect(mapped.written).toBe('0 bytes');
      expect(mapped.output).toBe('0 (0 bytes)');
    });

    it('should map all component properties correctly', () => {
      const mapped = mapProcessGroupForDisplay(mockProcessGroupResponse);

      expect(mapped.upToDateCount).toBe(4);
      expect(mapped.locallyModifiedCount).toBe(1);
      expect(mapped.staleCount).toBe(0);
      expect(mapped.locallyModifiedAndStaleCount).toBe(0);
      expect(mapped.syncFailureCount).toBe(0);
    });
  });

  describe('mapProcessGroupsForDisplay', () => {
    it('should map array of process groups', () => {
      const responses: ProcessGroupResponse[] = [
        mockProcessGroupResponse,
        {
          id: 'pg-2',
          component: {
            name: 'Second Group',
            position: { x: 200, y: 300 },
            runningCount: 3,
            stoppedCount: 1,
            invalidCount: 0,
            disabledCount: 0,
            activeRemotePortCount: 2,
            inactiveRemotePortCount: 0,
            upToDateCount: 3,
            locallyModifiedCount: 0,
            staleCount: 0,
            locallyModifiedAndStaleCount: 0,
            syncFailureCount: 0
          },
          status: {
            aggregateSnapshot: {
              queued: '5 (512 bytes)',
              input: '2 (256 bytes)',
              read: '1024 bytes',
              written: '2048 bytes',
              output: '1 (128 bytes)'
            }
          }
        }
      ];

      const mapped = mapProcessGroupsForDisplay(responses);

      expect(mapped).toHaveLength(2);
      expect(mapped[0].id).toBe('pg-1');
      expect(mapped[0].name).toBe('Test Process Group');
      expect(mapped[1].id).toBe('pg-2');
      expect(mapped[1].name).toBe('Second Group');
    });

    it('should handle empty array', () => {
      const mapped = mapProcessGroupsForDisplay([]);
      expect(mapped).toHaveLength(0);
      expect(Array.isArray(mapped)).toBe(true);
    });

    it('should handle single process group', () => {
      const mapped = mapProcessGroupsForDisplay([mockProcessGroupResponse]);
      expect(mapped).toHaveLength(1);
      expect(mapped[0].id).toBe('pg-1');
    });
  });
});
