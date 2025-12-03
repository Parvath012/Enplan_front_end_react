import { 
  fetchNifiStatus, 
  setPollingActive, 
  startNifiStatusPolling, 
  stopNifiStatusPolling,
  createProcessGroup,
  fetchFlowProcessGroups,
  NIFI_ACTIONS 
} from '../../../src/store/Actions/nifiActions';
import nifiApiService from '../../../src/api/nifi/nifiApiService';

// Mock the NiFi API service
jest.mock('../../../src/api/nifi/nifiApiService', () => ({
  getFlowStatus: jest.fn(),
  createProcessGroup: jest.fn(),
  getFlowProcessGroups: jest.fn()
}));

// Mock timer functions
jest.useFakeTimers();

describe('nifiActions', () => {
  // Mock dispatch function for testing thunks
  const mockDispatch = jest.fn();
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockDispatch.mockClear();
  });

  afterEach(() => {
    // Clear any intervals that might have been set
    jest.clearAllTimers();
  });

  describe('fetchNifiStatus', () => {
    const mockResponse = {
      controllerStatus: {
        activeThreadCount: 10,
        terminatedThreadCount: 5,
        queued: '5/100 bytes',
        bytesQueued: 100,
        flowFilesQueued: 5
      }
    };

    it('should create a successful action when API call succeeds', async () => {
      // Setup the mock to return a successful response
      (nifiApiService.getFlowStatus as jest.Mock).mockResolvedValue(mockResponse);

      // Call the thunk directly with mock dispatch and getState
      const result = await fetchNifiStatus()(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify the returned action has the expected type and payload
      expect(result.type).toBe(`${NIFI_ACTIONS.FETCH_STATUS}/fulfilled`);
      expect(result.payload).toEqual(mockResponse);
      expect(nifiApiService.getFlowStatus).toHaveBeenCalled();
    });

    it('should create a rejected action when API call fails', async () => {
      // Setup the mock to throw an error
      const error = new Error('Network error');
      (nifiApiService.getFlowStatus as jest.Mock).mockRejectedValue(error);

      // Call the thunk directly with mock dispatch and getState
      const result = await fetchNifiStatus()(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify the returned action has the expected type and error message
      expect(result.type).toBe(`${NIFI_ACTIONS.FETCH_STATUS}/rejected`);
      expect(result.payload).toBe('Network error');
      expect(nifiApiService.getFlowStatus).toHaveBeenCalled();
    });

    it('should handle non-Error objects thrown by the API', async () => {
      // Setup the mock to throw a non-Error object
      (nifiApiService.getFlowStatus as jest.Mock).mockRejectedValue('Something went wrong');

      // Call the thunk directly with mock dispatch and getState
      const result = await fetchNifiStatus()(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify the returned action has the expected type and default error message
      expect(result.type).toBe(`${NIFI_ACTIONS.FETCH_STATUS}/rejected`);
      expect(result.payload).toBe('Failed to fetch NiFi status');
      expect(nifiApiService.getFlowStatus).toHaveBeenCalled();
    });
  });

  describe('setPollingActive', () => {
    it('should create an action to set polling active state', () => {
      const action = setPollingActive(true);
      expect(action).toEqual({
        type: NIFI_ACTIONS.SET_POLLING_ACTIVE,
        payload: true
      });
    });

    it('should create an action to set polling inactive state', () => {
      const action = setPollingActive(false);
      expect(action).toEqual({
        type: NIFI_ACTIONS.SET_POLLING_ACTIVE,
        payload: false
      });
    });
  });

  describe('startNifiStatusPolling', () => {
    it('should setup polling with default interval and return a cleanup function', () => {
      // Call the action creator
      const stopPolling = startNifiStatusPolling()(mockDispatch);

      // First call should be to fetchNifiStatus and second to setPollingActive
      expect(mockDispatch).toHaveBeenCalledTimes(2);
      // First call is a thunk function
      expect(typeof mockDispatch.mock.calls[0][0]).toBe('function');
      // Second call is to setPollingActive
      expect(mockDispatch.mock.calls[1][0]).toEqual(setPollingActive(true));
      
      // Reset the mock to focus on interval dispatches
      mockDispatch.mockClear();

      // Advance timer to trigger the interval
      jest.advanceTimersByTime(10000);

      // Should have dispatched fetchNifiStatus again
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(typeof mockDispatch.mock.calls[0][0]).toBe('function');
      
      // Now call the returned cleanup function
      stopPolling();

      // Should have dispatched setPollingActive(false)
      expect(mockDispatch).toHaveBeenCalledWith(setPollingActive(false));

      // Advancing timer again should not trigger more dispatches
      mockDispatch.mockClear();
      jest.advanceTimersByTime(10000);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should use the provided interval', () => {
      // Call with a custom interval
      startNifiStatusPolling(5000)(mockDispatch);

      // Reset the mock after initial calls
      mockDispatch.mockClear();

      // Advance timer but not enough to trigger
      jest.advanceTimersByTime(4999);
      expect(mockDispatch).not.toHaveBeenCalled();

      // Now advance enough to trigger
      jest.advanceTimersByTime(1);
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should clear any existing interval when called again', () => {
      // Start polling
      startNifiStatusPolling()(mockDispatch);
      mockDispatch.mockClear();

      // Start polling again - should clear previous interval
      startNifiStatusPolling()(mockDispatch);

      // Should have dispatched fetchNifiStatus immediately
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
      mockDispatch.mockClear();

      // Advance timer to trigger the new interval
      jest.advanceTimersByTime(10000);
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));

      // Only one interval should be running (not two)
      expect(mockDispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopNifiStatusPolling', () => {
    it('should clear the interval and dispatch setPollingActive(false)', () => {
      // Start polling first
      startNifiStatusPolling()(mockDispatch);
      mockDispatch.mockClear();

      // Call stopNifiStatusPolling
      stopNifiStatusPolling()(mockDispatch);

      // Should dispatch setPollingActive(false)
      expect(mockDispatch).toHaveBeenCalledWith(setPollingActive(false));

      // Advancing timer should not trigger more dispatches
      mockDispatch.mockClear();
      jest.advanceTimersByTime(10000);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should handle the case where no interval is active', () => {
      // Start with a clean module state to ensure pollingIntervalId is null
      jest.resetModules();
      
      // Since we can't directly test the internal pollingIntervalId variable,
      // we'll verify the behavior by checking that stopNifiStatusPolling can be
      // called without errors when no interval is active
      const freshDispatch = jest.fn();
      
      // Import the modules after reset
      const freshNifiActions = require('../../../src/store/Actions/nifiActions');
      
      // Call stopNifiStatusPolling directly
      freshNifiActions.stopNifiStatusPolling()(freshDispatch);
      
      // The function should complete without errors
      expect(true).toBe(true);
    });
  });

  describe('createProcessGroup (lines 42-56)', () => {
    const mockParams = {
      parentGroupId: 'root',
      name: 'Test Process Group',
      position: { x: 100, y: 200 }
    };

    const mockResponse = {
      id: 'pg-123',
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
    };

    it('should create a successful action when process group creation succeeds (lines 43-50)', async () => {
      // Setup the mock to return a successful response
      (nifiApiService.createProcessGroup as jest.Mock).mockResolvedValue(mockResponse);

      // Call the thunk directly
      const result = await createProcessGroup(mockParams)(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify the returned action has the expected type and payload
      expect(result.type).toBe(`${NIFI_ACTIONS.CREATE_PROCESS_GROUP}/fulfilled`);
      expect(result.payload).toEqual(mockResponse);
      expect(nifiApiService.createProcessGroup).toHaveBeenCalledWith(
        mockParams.parentGroupId,
        mockParams.name,
        mockParams.position,
        undefined
      );
    });

    it('should pass clientId when provided (line 48)', async () => {
      (nifiApiService.createProcessGroup as jest.Mock).mockResolvedValue(mockResponse);

      const paramsWithClientId = {
        ...mockParams,
        clientId: 'client-123'
      };

      await createProcessGroup(paramsWithClientId)(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify clientId was passed to the API call
      expect(nifiApiService.createProcessGroup).toHaveBeenCalledWith(
        paramsWithClientId.parentGroupId,
        paramsWithClientId.name,
        paramsWithClientId.position,
        'client-123'
      );
    });

    it('should create a rejected action when process group creation fails with Error (lines 51-56)', async () => {
      // Setup the mock to throw an error
      const error = new Error('Failed to create');
      (nifiApiService.createProcessGroup as jest.Mock).mockRejectedValue(error);

      // Call the thunk
      const result = await createProcessGroup(mockParams)(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify the returned action has the expected type and error message
      expect(result.type).toBe(`${NIFI_ACTIONS.CREATE_PROCESS_GROUP}/rejected`);
      expect(result.payload).toBe('Failed to create');
    });

    it('should handle non-Error objects thrown during process group creation (lines 52-56)', async () => {
      // Setup the mock to throw a non-Error object
      (nifiApiService.createProcessGroup as jest.Mock).mockRejectedValue('Something went wrong');

      // Call the thunk
      const result = await createProcessGroup(mockParams)(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify the returned action has default error message
      expect(result.type).toBe(`${NIFI_ACTIONS.CREATE_PROCESS_GROUP}/rejected`);
      expect(result.payload).toBe('Failed to create process group');
    });
  });

  describe('fetchFlowProcessGroups (lines 69-81)', () => {
    const mockParams = {
      parentGroupId: 'root',
      uiOnly: true
    };

    const mockResponse = {
      processGroupFlow: {
        flow: {
          processGroups: [
            {
              id: 'pg-1',
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
            }
          ]
        }
      }
    };

    it('should create a successful action when fetching flow process groups succeeds (lines 70-75)', async () => {
      // Setup the mock to return a successful response
      (nifiApiService.getFlowProcessGroups as jest.Mock).mockResolvedValue(mockResponse);

      // Call the thunk
      const result = await fetchFlowProcessGroups(mockParams)(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify the returned action has the expected type and payload
      expect(result.type).toBe(`${NIFI_ACTIONS.FETCH_FLOW_PROCESS_GROUPS}/fulfilled`);
      expect(result.payload).toEqual(mockResponse);
      expect(nifiApiService.getFlowProcessGroups).toHaveBeenCalledWith(
        mockParams.parentGroupId,
        true
      );
    });

    it('should use default uiOnly value of true when not provided (line 73)', async () => {
      (nifiApiService.getFlowProcessGroups as jest.Mock).mockResolvedValue(mockResponse);

      const paramsWithoutUiOnly = {
        parentGroupId: 'root'
      };

      await fetchFlowProcessGroups(paramsWithoutUiOnly)(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify uiOnly defaults to true (line 73)
      expect(nifiApiService.getFlowProcessGroups).toHaveBeenCalledWith(
        'root',
        true
      );
    });

    it('should use provided uiOnly value when specified (line 73)', async () => {
      (nifiApiService.getFlowProcessGroups as jest.Mock).mockResolvedValue(mockResponse);

      const paramsWithUiOnlyFalse = {
        parentGroupId: 'root',
        uiOnly: false
      };

      await fetchFlowProcessGroups(paramsWithUiOnlyFalse)(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify uiOnly is false
      expect(nifiApiService.getFlowProcessGroups).toHaveBeenCalledWith(
        'root',
        false
      );
    });

    it('should create a rejected action when fetching fails with Error (lines 76-81)', async () => {
      // Setup the mock to throw an error
      const error = new Error('Network timeout');
      (nifiApiService.getFlowProcessGroups as jest.Mock).mockRejectedValue(error);

      // Call the thunk
      const result = await fetchFlowProcessGroups(mockParams)(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify the returned action has the expected type and error message
      expect(result.type).toBe(`${NIFI_ACTIONS.FETCH_FLOW_PROCESS_GROUPS}/rejected`);
      expect(result.payload).toBe('Network timeout');
    });

    it('should handle non-Error objects thrown during fetch (lines 77-81)', async () => {
      // Setup the mock to throw a non-Error object
      (nifiApiService.getFlowProcessGroups as jest.Mock).mockRejectedValue('API Error');

      // Call the thunk
      const result = await fetchFlowProcessGroups(mockParams)(
        mockDispatch,
        () => ({}),
        undefined
      );

      // Verify the returned action has default error message
      expect(result.type).toBe(`${NIFI_ACTIONS.FETCH_FLOW_PROCESS_GROUPS}/rejected`);
      expect(result.payload).toBe('Failed to fetch flow process groups');
    });
  });
});
