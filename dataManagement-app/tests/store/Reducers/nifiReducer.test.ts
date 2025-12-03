import nifiReducer, { NifiState } from '../../../src/store/Reducers/nifiReducer';
import { 
  fetchNifiStatus, 
  setPollingActive, 
  createProcessGroup, 
  fetchFlowProcessGroups 
} from '../../../src/store/Actions/nifiActions';
import { createAction } from '@reduxjs/toolkit';

// Mock the current date to ensure consistent test results
const mockDate = new Date('2025-09-23T12:00:00Z');
const mockISOString = mockDate.toISOString();
global.Date = jest.fn(() => mockDate) as any;
(global.Date as any).toISOString = jest.fn(() => mockISOString);

describe('nifiReducer', () => {
  // Define the initial state for tests
  const initialState: NifiState = {
    status: null,
    loading: false,
    error: null,
    lastUpdated: null,
    isPollingActive: false,
    processGroups: [],
    creatingProcessGroup: false,
    fetchingProcessGroups: false,
  };

  // Sample NiFi controller status for tests
  const mockControllerStatus = {
    activeThreadCount: 10,
    terminatedThreadCount: 5,
    queued: '5/100 bytes',
    flowFilesQueued: 5,
    bytesQueued: 100,
    runningCount: 8,
    stoppedCount: 2,
    invalidCount: 0,
    disabledCount: 1,
    activeRemotePortCount: 3,
    inactiveRemotePortCount: 1,
    upToDateCount: 4,
    locallyModifiedCount: 2,
    staleCount: 0,
    locallyModifiedAndStaleCount: 0,
    syncFailureCount: 0
  };

  it('should return the initial state', () => {
    // @ts-ignore - We're passing undefined state to test initial state
    const state = nifiReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  describe('fetchNifiStatus', () => {
    it('should handle the pending state', () => {
      // Create a modified state to test changes
      const startState: NifiState = {
        ...initialState,
        error: 'Previous error that should be cleared',
      };

      // Apply the pending action
      const state = nifiReducer(startState, fetchNifiStatus.pending('requestId', undefined));

      // Verify the state changes
      expect(state).toEqual({
        ...startState,
        loading: true,
        error: null,
      });
    });

    it('should handle the fulfilled state', () => {
      // Create a modified state to test changes
      const startState: NifiState = {
        ...initialState,
        loading: true,
      };

      // Apply the fulfilled action
      const state = nifiReducer(
        startState,
        fetchNifiStatus.fulfilled(
          { controllerStatus: mockControllerStatus }, 
          'requestId', 
          undefined
        )
      );

      // Verify the state changes
      expect(state).toEqual({
        ...startState,
        loading: false,
        status: mockControllerStatus,
        lastUpdated: mockISOString,
        error: null,
      });
    });

    it('should handle the rejected state', () => {
      // Create a modified state to test changes
      const startState: NifiState = {
        ...initialState,
        loading: true,
      };
      
      // Error message to use in the test
      const errorMessage = 'Failed to fetch NiFi status';
      
      // Apply the rejected action
      const state = nifiReducer(
        startState,
        fetchNifiStatus.rejected(
          new Error('some error'), 
          'requestId', 
          undefined, 
          errorMessage
        )
      );

      // Verify the state changes
      expect(state).toEqual({
        ...startState,
        loading: false,
        error: errorMessage,
      });
    });
  });

  describe('setPollingActive', () => {
    it('should handle setPollingActive with true value', () => {
      // Apply the action to set polling to active
      const state = nifiReducer(initialState, setPollingActive(true));

      // Verify the state changes
      expect(state).toEqual({
        ...initialState,
        isPollingActive: true,
      });
    });

    it('should handle setPollingActive with false value', () => {
      // Start with polling active
      const startState: NifiState = {
        ...initialState,
        isPollingActive: true,
      };

      // Apply the action to set polling to inactive
      const state = nifiReducer(startState, setPollingActive(false));

      // Verify the state changes
      expect(state).toEqual({
        ...startState,
        isPollingActive: false,
      });
    });
  });

  // Test handling of unknown action types
  it('should ignore unknown actions', () => {
    const unknownAction = createAction('unknown/action')();
    const state = nifiReducer(initialState, unknownAction);
    
    // State should remain unchanged
    expect(state).toEqual(initialState);
  });

  // Test state immutability
  it('should create new state objects when state changes', () => {
    // Start with the initial state
    const startState: NifiState = { ...initialState };
    
    // Apply an action that changes the state
    const endState = nifiReducer(startState, setPollingActive(true));
    
    // Verify the action created a new object and didn't mutate the input
    expect(endState).not.toBe(startState);
    expect(startState).toEqual(initialState);
  });

  // Additional edge case tests
  it('should handle null controller status in fulfilled state', () => {
    const startState: NifiState = {
      ...initialState,
      loading: true,
    };

    const state = nifiReducer(
      startState,
      fetchNifiStatus.fulfilled(
        { controllerStatus: null as any }, 
        'requestId', 
        undefined
      )
    );

    expect(state.status).toBe(null);
    expect(state.loading).toBe(false);
  });

  it('should handle undefined error message in rejected state', () => {
    const startState: NifiState = {
      ...initialState,
      loading: true,
    };

    const state = nifiReducer(
      startState,
      fetchNifiStatus.rejected(
        new Error('some error'), 
        'requestId', 
        undefined, 
        undefined
      )
    );

    expect(state.error).toBe(undefined);
    expect(state.loading).toBe(false);
  });

  it('should handle empty string error message', () => {
    const startState: NifiState = {
      ...initialState,
      loading: true,
    };

    const state = nifiReducer(
      startState,
      fetchNifiStatus.rejected(
        new Error('some error'), 
        'requestId', 
        undefined, 
        ''
      )
    );

    expect(state.error).toBe('');
    expect(state.loading).toBe(false);
  });

  it('should preserve other state fields when handling pending', () => {
    const startState: NifiState = {
      ...initialState,
      status: mockControllerStatus,
      lastUpdated: '2025-01-01T00:00:00.000Z',
      isPollingActive: true,
      processGroups: [{ id: 'test' } as any],
    };

    const state = nifiReducer(startState, fetchNifiStatus.pending('requestId', undefined));

    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
    expect(state.status).toEqual(mockControllerStatus);
    expect(state.lastUpdated).toBe('2025-01-01T00:00:00.000Z');
    expect(state.isPollingActive).toBe(true);
    expect(state.processGroups).toHaveLength(1);
  });

  it('should preserve lastUpdated from previous state in rejected', () => {
    const previousTimestamp = '2025-01-01T00:00:00.000Z';
    const startState: NifiState = {
      ...initialState,
      loading: true,
      lastUpdated: previousTimestamp,
    };

    const state = nifiReducer(
      startState,
      fetchNifiStatus.rejected(
        new Error('Network error'), 
        'requestId', 
        undefined, 
        'Failed to fetch'
      )
    );

    expect(state.lastUpdated).toBe(previousTimestamp);
    expect(state.error).toBe('Failed to fetch');
  });

  it('should handle multiple consecutive setPollingActive calls', () => {
    let state = initialState;
    
    state = nifiReducer(state, setPollingActive(true));
    expect(state.isPollingActive).toBe(true);
    
    state = nifiReducer(state, setPollingActive(false));
    expect(state.isPollingActive).toBe(false);
    
    state = nifiReducer(state, setPollingActive(true));
    expect(state.isPollingActive).toBe(true);
    
    state = nifiReducer(state, setPollingActive(true));
    expect(state.isPollingActive).toBe(true);
  });

  it('should handle controller status with zero values', () => {
    const zeroStatus = {
      activeThreadCount: 0,
      terminatedThreadCount: 0,
      queued: '0/0 bytes',
      flowFilesQueued: 0,
      bytesQueued: 0,
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
    };

    const state = nifiReducer(
      initialState,
      fetchNifiStatus.fulfilled(
        { controllerStatus: zeroStatus }, 
        'requestId', 
        undefined
      )
    );

    expect(state.status).toEqual(zeroStatus);
  });

  it('should handle controller status with negative values', () => {
    const negativeStatus = {
      ...mockControllerStatus,
      activeThreadCount: -1,
      invalidCount: -5,
    };

    const state = nifiReducer(
      initialState,
      fetchNifiStatus.fulfilled(
        { controllerStatus: negativeStatus }, 
        'requestId', 
        undefined
      )
    );

    expect(state.status).toEqual(negativeStatus);
  });

  it('should handle very large numbers in controller status', () => {
    const largeStatus = {
      ...mockControllerStatus,
      activeThreadCount: Number.MAX_SAFE_INTEGER,
      bytesQueued: Number.MAX_SAFE_INTEGER,
    };

    const state = nifiReducer(
      initialState,
      fetchNifiStatus.fulfilled(
        { controllerStatus: largeStatus }, 
        'requestId', 
        undefined
      )
    );

    expect(state.status).toEqual(largeStatus);
  });

  it('should handle transition from loading to error state', () => {
    let state = initialState;
    
    // Start loading
    state = nifiReducer(state, fetchNifiStatus.pending('req1', undefined));
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
    
    // Transition to error
    state = nifiReducer(
      state,
      fetchNifiStatus.rejected(new Error('test'), 'req1', undefined, 'Error occurred')
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Error occurred');
  });

  it('should handle transition from loading to success state', () => {
    let state = initialState;
    
    // Start loading
    state = nifiReducer(state, fetchNifiStatus.pending('req1', undefined));
    expect(state.loading).toBe(true);
    
    // Transition to success
    state = nifiReducer(
      state,
      fetchNifiStatus.fulfilled({ controllerStatus: mockControllerStatus }, 'req1', undefined)
    );
    expect(state.loading).toBe(false);
    expect(state.status).toEqual(mockControllerStatus);
  });

  it('should handle retry after error', () => {
    let state = initialState;
    
    // First attempt - error
    state = nifiReducer(state, fetchNifiStatus.pending('req1', undefined));
    state = nifiReducer(
      state,
      fetchNifiStatus.rejected(new Error('test'), 'req1', undefined, 'First error')
    );
    expect(state.error).toBe('First error');
    
    // Retry - pending clears error
    state = nifiReducer(state, fetchNifiStatus.pending('req2', undefined));
    expect(state.error).toBe(null);
    expect(state.loading).toBe(true);
    
    // Retry - success
    state = nifiReducer(
      state,
      fetchNifiStatus.fulfilled({ controllerStatus: mockControllerStatus }, 'req2', undefined)
    );
    expect(state.error).toBe(null);
    expect(state.loading).toBe(false);
  });

  it('should handle polling activation during active loading', () => {
    let state = initialState;
    
    state = nifiReducer(state, fetchNifiStatus.pending('req1', undefined));
    expect(state.loading).toBe(true);
    
    state = nifiReducer(state, setPollingActive(true));
    expect(state.isPollingActive).toBe(true);
    expect(state.loading).toBe(true); // Loading should remain true
  });

  it('should maintain process groups through status updates', () => {
    const mockProcessGroups = [
      { id: 'pg1', name: 'Process Group 1' } as any,
      { id: 'pg2', name: 'Process Group 2' } as any,
    ];

    let state: NifiState = {
      ...initialState,
      processGroups: mockProcessGroups,
    };
    
    state = nifiReducer(state, fetchNifiStatus.pending('req1', undefined));
    expect(state.processGroups).toEqual(mockProcessGroups);
    
    state = nifiReducer(
      state,
      fetchNifiStatus.fulfilled({ controllerStatus: mockControllerStatus }, 'req1', undefined)
    );
    expect(state.processGroups).toEqual(mockProcessGroups);
  });

  it('should handle controller status with special characters in queued string', () => {
    const specialStatus = {
      ...mockControllerStatus,
      queued: '100/1.5 KB (special)',
    };

    const state = nifiReducer(
      initialState,
      fetchNifiStatus.fulfilled(
        { controllerStatus: specialStatus }, 
        'requestId', 
        undefined
      )
    );

    expect(state.status?.queued).toBe('100/1.5 KB (special)');
  });

  it('should handle interleaved action sequences', () => {
    let state = initialState;
    
    state = nifiReducer(state, setPollingActive(true));
    state = nifiReducer(state, fetchNifiStatus.pending('req1', undefined));
    state = nifiReducer(state, setPollingActive(false));
    state = nifiReducer(
      state,
      fetchNifiStatus.fulfilled({ controllerStatus: mockControllerStatus }, 'req1', undefined)
    );
    state = nifiReducer(state, setPollingActive(true));
    
    expect(state.isPollingActive).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.status).toEqual(mockControllerStatus);
  });

  it('should not mutate array references in state', () => {
    const mockProcessGroups = [{ id: 'pg1' } as any];
    const startState: NifiState = {
      ...initialState,
      processGroups: mockProcessGroups,
    };
    
    const endState = nifiReducer(startState, setPollingActive(true));
    
    expect(endState.processGroups).toBe(startState.processGroups); // Should maintain same array reference if not modified
    expect(startState.processGroups).toEqual(mockProcessGroups); // Original should not be mutated
  });

  it('should handle rapid successive status updates', () => {
    let state = initialState;
    
    for (let i = 0; i < 10; i++) {
      state = nifiReducer(state, fetchNifiStatus.pending(`req${i}`, undefined));
      state = nifiReducer(
        state,
        fetchNifiStatus.fulfilled(
          { controllerStatus: { ...mockControllerStatus, activeThreadCount: i } }, 
          `req${i}`, 
          undefined
        )
      );
    }
    
    expect(state.status?.activeThreadCount).toBe(9);
    expect(state.loading).toBe(false);
  });

  it('should handle status update with partially defined controller status', () => {
    const partialStatus = {
      activeThreadCount: 5,
      terminatedThreadCount: 2,
    } as any;

    const state = nifiReducer(
      initialState,
      fetchNifiStatus.fulfilled(
        { controllerStatus: partialStatus }, 
        'requestId', 
        undefined
      )
    );

    expect(state.status).toEqual(partialStatus);
  });

  it('should preserve creatingProcessGroup and fetchingProcessGroups flags', () => {
    const startState: NifiState = {
      ...initialState,
      creatingProcessGroup: true,
      fetchingProcessGroups: true,
    };

    const state = nifiReducer(
      startState,
      fetchNifiStatus.fulfilled({ controllerStatus: mockControllerStatus }, 'req1', undefined)
    );

    expect(state.creatingProcessGroup).toBe(true);
    expect(state.fetchingProcessGroups).toBe(true);
  });

  describe('createProcessGroup (lines 56-70)', () => {
    const mockProcessGroupParams = {
      parentGroupId: 'root',
      name: 'Test Process Group',
      position: { x: 100, y: 200 }
    };

    const mockProcessGroupResponse = {
      id: 'pg-123',
      revision: { version: 1 },
      uri: 'http://localhost:8443/nifi-api/process-groups/pg-123',
      position: { x: 100, y: 200 },
      permissions: { canRead: true, canWrite: true },
      component: {
        id: 'pg-123',
        name: 'Test Process Group',
        position: { x: 100, y: 200 },
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
        syncFailureCount: 0,
      }
    } as any;

    it('should handle createProcessGroup.pending (lines 56-59)', () => {
      const startState: NifiState = {
        ...initialState,
        error: 'Previous error that should be cleared',
      };

      const state = nifiReducer(
        startState,
        createProcessGroup.pending('requestId', mockProcessGroupParams)
      );

      expect(state.creatingProcessGroup).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle createProcessGroup.fulfilled (lines 61-65)', () => {
      const startState: NifiState = {
        ...initialState,
        creatingProcessGroup: true,
        processGroups: [],
      };

      const state = nifiReducer(
        startState,
        createProcessGroup.fulfilled(mockProcessGroupResponse, 'requestId', mockProcessGroupParams)
      );

      expect(state.creatingProcessGroup).toBe(false);
      expect(state.processGroups).toHaveLength(1);
      expect(state.processGroups[0]).toEqual(mockProcessGroupResponse);
      expect(state.error).toBeNull();
    });

    it('should handle createProcessGroup.rejected (lines 67-70)', () => {
      const startState: NifiState = {
        ...initialState,
        creatingProcessGroup: true,
      };

      const errorMessage = 'Failed to create process group';
      const state = nifiReducer(
        startState,
        createProcessGroup.rejected(
          new Error(errorMessage),
          'requestId',
          mockProcessGroupParams,
          errorMessage
        )
      );

      expect(state.creatingProcessGroup).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should add multiple process groups to existing list (line 63)', () => {
      const existingGroup = {
        id: 'pg-existing',
        revision: { version: 1 },
        uri: 'http://localhost:8443/nifi-api/process-groups/pg-existing',
        position: { x: 50, y: 50 },
        permissions: { canRead: true, canWrite: true },
        component: {
          id: 'pg-existing',
          name: 'Existing Group',
          position: { x: 50, y: 50 },
          runningCount: 1,
          stoppedCount: 1,
          invalidCount: 0,
          disabledCount: 0,
          activeRemotePortCount: 0,
          inactiveRemotePortCount: 0,
          upToDateCount: 0,
          locallyModifiedCount: 0,
          staleCount: 0,
          locallyModifiedAndStaleCount: 0,
          syncFailureCount: 0,
        }
      } as any;

      const startState: NifiState = {
        ...initialState,
        processGroups: [existingGroup],
      };

      const state = nifiReducer(
        startState,
        createProcessGroup.fulfilled(mockProcessGroupResponse, 'requestId', mockProcessGroupParams)
      );

      expect(state.processGroups).toHaveLength(2);
      expect(state.processGroups[0]).toEqual(existingGroup);
      expect(state.processGroups[1]).toEqual(mockProcessGroupResponse);
    });
  });

  describe('fetchFlowProcessGroups (lines 72-86)', () => {
    const mockFetchParams = {
      parentGroupId: 'root',
      uiOnly: true
    };

    const mockFlowResponse = {
      processGroupFlow: {
        id: 'root',
        uri: 'http://localhost:8443/nifi-api/flow/process-groups/root',
        parentGroupId: null,
        breadcrumb: { id: 'root', name: 'NiFi Flow' },
        lastRefreshed: '2025-09-23T12:00:00.000Z',
        flow: {
          processGroups: [
            {
              id: 'pg-1',
              revision: { version: 1 },
              uri: 'http://localhost:8443/nifi-api/process-groups/pg-1',
              position: { x: 100, y: 100 },
              permissions: { canRead: true, canWrite: true },
              component: {
                id: 'pg-1',
                name: 'Flow Group 1',
                position: { x: 100, y: 100 },
                runningCount: 2,
                stoppedCount: 1,
                invalidCount: 0,
                disabledCount: 0,
                activeRemotePortCount: 1,
                inactiveRemotePortCount: 0,
                upToDateCount: 1,
                locallyModifiedCount: 0,
                staleCount: 0,
                locallyModifiedAndStaleCount: 0,
                syncFailureCount: 0,
              }
            },
            {
              id: 'pg-2',
              revision: { version: 1 },
              uri: 'http://localhost:8443/nifi-api/process-groups/pg-2',
              position: { x: 200, y: 200 },
              permissions: { canRead: true, canWrite: true },
              component: {
                id: 'pg-2',
                name: 'Flow Group 2',
                position: { x: 200, y: 200 },
                runningCount: 1,
                stoppedCount: 2,
                invalidCount: 0,
                disabledCount: 0,
                activeRemotePortCount: 0,
                inactiveRemotePortCount: 1,
                upToDateCount: 2,
                locallyModifiedCount: 0,
                staleCount: 0,
                locallyModifiedAndStaleCount: 0,
                syncFailureCount: 0,
              }
            }
          ]
        }
      }
    } as any;

    it('should handle fetchFlowProcessGroups.pending (lines 72-75)', () => {
      const startState: NifiState = {
        ...initialState,
        error: 'Previous error that should be cleared',
      };

      const state = nifiReducer(
        startState,
        fetchFlowProcessGroups.pending('requestId', mockFetchParams)
      );

      expect(state.fetchingProcessGroups).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchFlowProcessGroups.fulfilled (lines 77-81)', () => {
      const startState: NifiState = {
        ...initialState,
        fetchingProcessGroups: true,
        processGroups: [], // Start with empty
      };

      const state = nifiReducer(
        startState,
        fetchFlowProcessGroups.fulfilled(mockFlowResponse, 'requestId', mockFetchParams)
      );

      expect(state.fetchingProcessGroups).toBe(false);
      expect(state.processGroups).toHaveLength(2);
      expect(state.processGroups).toEqual(mockFlowResponse.processGroupFlow.flow.processGroups);
      expect(state.error).toBeNull();
    });

    it('should handle fetchFlowProcessGroups.rejected (lines 83-86)', () => {
      const startState: NifiState = {
        ...initialState,
        fetchingProcessGroups: true,
      };

      const errorMessage = 'Failed to fetch flow process groups';
      const state = nifiReducer(
        startState,
        fetchFlowProcessGroups.rejected(
          new Error(errorMessage),
          'requestId',
          mockFetchParams,
          errorMessage
        )
      );

      expect(state.fetchingProcessGroups).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should replace existing process groups when fetching flow (line 79)', () => {
      const existingGroups = [
        {
          id: 'pg-old',
          revision: { version: 1 },
          uri: 'http://localhost:8443/nifi-api/process-groups/pg-old',
          position: { x: 50, y: 50 },
          permissions: { canRead: true, canWrite: true },
          component: {
            id: 'pg-old',
            name: 'Old Group',
            position: { x: 50, y: 50 },
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
            syncFailureCount: 0,
          }
        } as any
      ];

      const startState: NifiState = {
        ...initialState,
        processGroups: existingGroups,
      };

      const state = nifiReducer(
        startState,
        fetchFlowProcessGroups.fulfilled(mockFlowResponse, 'requestId', mockFetchParams)
      );

      // Should replace, not append
      expect(state.processGroups).toHaveLength(2);
      expect(state.processGroups).toEqual(mockFlowResponse.processGroupFlow.flow.processGroups);
      expect(state.processGroups.find(g => g.id === 'pg-old')).toBeUndefined();
    });

    it('should handle empty process groups response (line 79)', () => {
      const emptyFlowResponse = {
        processGroupFlow: {
          id: 'root',
          uri: 'http://localhost:8443/nifi-api/flow/process-groups/root',
          parentGroupId: null,
          breadcrumb: { id: 'root', name: 'NiFi Flow' },
          lastRefreshed: '2025-09-23T12:00:00.000Z',
          flow: {
            processGroups: []
          }
        }
      } as any;

      const state = nifiReducer(
        initialState,
        fetchFlowProcessGroups.fulfilled(emptyFlowResponse, 'requestId', mockFetchParams)
      );

      expect(state.processGroups).toEqual([]);
      expect(state.fetchingProcessGroups).toBe(false);
    });
  });

  describe('Combined actions sequence', () => {
    it('should handle createProcessGroup after fetchFlowProcessGroups', () => {
      // First fetch existing groups
      const flowResponse = {
        processGroupFlow: {
          id: 'root',
          uri: 'http://localhost:8443/nifi-api/flow/process-groups/root',
          parentGroupId: null,
          breadcrumb: { id: 'root', name: 'NiFi Flow' },
          lastRefreshed: '2025-09-23T12:00:00.000Z',
          flow: {
            processGroups: [
              {
                id: 'pg-existing',
                revision: { version: 1 },
                uri: 'http://localhost:8443/nifi-api/process-groups/pg-existing',
                position: { x: 50, y: 50 },
                permissions: { canRead: true, canWrite: true },
                component: {
                  id: 'pg-existing',
                  name: 'Existing',
                  position: { x: 50, y: 50 },
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
                  syncFailureCount: 0,
                }
              }
            ]
          }
        }
      } as any;

      let state = nifiReducer(
        initialState,
        fetchFlowProcessGroups.fulfilled(flowResponse, 'req1', { parentGroupId: 'root' })
      );

      expect(state.processGroups).toHaveLength(1);

      // Then create a new group
      const newGroup = {
        id: 'pg-new',
        revision: { version: 1 },
        uri: 'http://localhost:8443/nifi-api/process-groups/pg-new',
        position: { x: 100, y: 100 },
        permissions: { canRead: true, canWrite: true },
        component: {
          id: 'pg-new',
          name: 'New Group',
          position: { x: 100, y: 100 },
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
          syncFailureCount: 0,
        }
      } as any;

      state = nifiReducer(
        state,
        createProcessGroup.fulfilled(newGroup, 'req2', { 
          parentGroupId: 'root', 
          name: 'New Group', 
          position: { x: 100, y: 100 } 
        })
      );

      expect(state.processGroups).toHaveLength(2);
      expect(state.processGroups[0].id).toBe('pg-existing');
      expect(state.processGroups[1].id).toBe('pg-new');
    });

    it('should handle error states independently for create and fetch', () => {
      // Set error from createProcessGroup
      let state = nifiReducer(
        initialState,
        createProcessGroup.rejected(
          new Error('Create failed'),
          'req1',
          { parentGroupId: 'root', name: 'Test', position: { x: 0, y: 0 } },
          'Create failed'
        )
      );

      expect(state.error).toBe('Create failed');
      expect(state.creatingProcessGroup).toBe(false);

      // Fetch should clear the error when pending
      state = nifiReducer(
        state,
        fetchFlowProcessGroups.pending('req2', { parentGroupId: 'root' })
      );

      expect(state.error).toBeNull();
      expect(state.fetchingProcessGroups).toBe(true);
    });
  });
});
