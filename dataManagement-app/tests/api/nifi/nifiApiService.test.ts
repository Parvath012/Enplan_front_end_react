import { apiRequest } from '../../../src/api/auth/apiRequest';
import nifiApiService, { NifiStatusResponse } from '../../../src/api/nifi/nifiApiService';

// Mock dependencies
jest.mock('axios');
jest.mock('../../../src/api/auth/apiRequest');
jest.mock('../../../src/utils/errorLogger');
jest.mock('../../../src/services/userProcessGroupMapping');

// We're only using apiRequest mock since the implementation now uses apiRequest
const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

// Mock crypto.randomUUID for Node.js versions that don't have it
if (!global.crypto) {
  global.crypto = {} as any;
}
if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = jest.fn(() => 'mock-uuid-1234-5678-90ab-cdef');
}

describe('nifiApiService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('authenticate', () => {
    it('should successfully authenticate with NiFi API', async () => {
      // Setup
      mockedApiRequest.mockResolvedValueOnce({});

      // Execute
      await nifiApiService.authenticate();

      // Verify
      expect(mockedApiRequest).toHaveBeenCalledWith('/api/authenticate', 'GET');
    });

    it('should throw an error when authentication fails', async () => {
      // Setup
      const errorMsg = 'Authentication failed';
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));
      
      // Execute and Verify
      await expect(nifiApiService.authenticate()).rejects.toThrow(errorMsg);
      expect(mockedApiRequest).toHaveBeenCalledWith('/api/authenticate', 'GET');
    });
  });

  describe('getFlowStatus', () => {
    it('should return flow status after successful authentication', async () => {
      // Setup
      const mockStatusResponse: NifiStatusResponse = {
        controllerStatus: {
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
        }
      };

      // Mock successful authentication
      mockedApiRequest.mockResolvedValueOnce({});
      
      // Mock successful API request for flow status
      mockedApiRequest.mockResolvedValueOnce(mockStatusResponse);

      // Execute
      const result = await nifiApiService.getFlowStatus();

      // Verify
      expect(mockedApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(2, '/nifi-api/flow/status', 'GET');
      expect(result).toEqual(mockStatusResponse);
    });

    it('should throw an error when authentication fails during getFlowStatus', async () => {
      // Setup
      const errorMsg = 'Authentication failed';
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      // Execute and Verify
      await expect(nifiApiService.getFlowStatus()).rejects.toThrow(errorMsg);
      expect(mockedApiRequest).toHaveBeenCalledWith('/api/authenticate', 'GET');
      expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when flow status request fails', async () => {
      // Setup
      const errorMsg = 'Failed to fetch status';
      
      // Mock successful authentication
      mockedApiRequest.mockResolvedValueOnce({});
      
      // Mock failed API request
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      // Execute and Verify
      await expect(nifiApiService.getFlowStatus()).rejects.toThrow(errorMsg);
      expect(mockedApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(2, '/nifi-api/flow/status', 'GET');
    });
  });

  // Test the error handling in both methods
  describe('error logging', () => {
    // Spy on console.error
    let consoleErrorSpy: jest.SpyInstance;
    
    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });
    
    it('should log authentication errors to console', async () => {
      // Setup
      const errorMsg = 'Authentication failed';
      const error = new Error(errorMsg);
      mockedApiRequest.mockRejectedValueOnce(error);
      
      // Execute and expect it to throw
      await expect(nifiApiService.authenticate()).rejects.toThrow();
      
      // Verify
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to authenticate with NiFi:', error);
    });
    
    it('should log flow status errors to console', async () => {
      // Setup
      const errorMsg = 'Failed to fetch status';
      const error = new Error(errorMsg);
      
      // Mock successful authentication but failed request
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockRejectedValueOnce(error);
      
      // Execute and expect it to throw
      await expect(nifiApiService.getFlowStatus()).rejects.toThrow();
      
      // Verify
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch NiFi flow status:', error);
    });
  });

  describe('createProcessGroup', () => {
    const mockProcessGroupResponse = {
      revision: { clientId: 'test-client', version: 0 },
      id: 'new-pg-id',
      uri: '/process-groups/new-pg-id',
      position: { x: 100, y: 200 },
      permissions: { canRead: true, canWrite: true },
      component: {
        id: 'new-pg-id',
        parentGroupId: 'root',
        position: { x: 100, y: 200 },
        name: 'New Process Group',
        comments: '',
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
        inputPortCount: 0,
        outputPortCount: 0,
      },
    };

    it('should successfully create a process group with provided clientId', async () => {
      const parentGroupId = 'root';
      const name = 'Test Process Group';
      const position = { x: 100, y: 200 };
      const clientId = 'my-client-id';

      // Mock authentication
      mockedApiRequest.mockResolvedValueOnce({});
      // Mock createProcessGroup
      mockedApiRequest.mockResolvedValueOnce(mockProcessGroupResponse);

      const result = await nifiApiService.createProcessGroup(parentGroupId, name, position, clientId);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/process-groups/${parentGroupId}/process-groups`,
        'POST',
        expect.objectContaining({
          revision: { clientId, version: 0 },
          component: { position, name },
        })
      );
      expect(result).toEqual(mockProcessGroupResponse);
    });

    it('should generate UUID when clientId is not provided', async () => {
      const parentGroupId = 'root';
      const name = 'Test Process Group';
      const position = { x: 100, y: 200 };

      // Mock authentication
      mockedApiRequest.mockResolvedValueOnce({});
      // Mock createProcessGroup
      mockedApiRequest.mockResolvedValueOnce(mockProcessGroupResponse);

      await nifiApiService.createProcessGroup(parentGroupId, name, position);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/process-groups/${parentGroupId}/process-groups`,
        'POST',
        expect.objectContaining({
          revision: expect.objectContaining({
            version: 0,
          }),
          component: { position, name },
          disconnectedNodeAcknowledged: false,
        })
      );
    });

    it('should handle authentication failure during createProcessGroup', async () => {
      const errorMsg = 'Auth failed';
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(
        nifiApiService.createProcessGroup('root', 'Test', { x: 0, y: 0 })
      ).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(1);
      expect(mockedApiRequest).toHaveBeenCalledWith('/api/authenticate', 'GET');
    });

    it('should handle API failure during createProcessGroup', async () => {
      const errorMsg = 'Failed to create';
      
      // Mock successful authentication
      mockedApiRequest.mockResolvedValueOnce({});
      // Mock failed create
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(
        nifiApiService.createProcessGroup('root', 'Test', { x: 0, y: 0 })
      ).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    });

    it('should handle special characters in process group name', async () => {
      const specialName = 'Test PG with "quotes" & <tags>';
      const parentGroupId = 'root';
      const position = { x: 100, y: 200 };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockProcessGroupResponse);

      await nifiApiService.createProcessGroup(parentGroupId, specialName, position);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/process-groups/${parentGroupId}/process-groups`,
        'POST',
        expect.objectContaining({
          component: expect.objectContaining({ name: specialName }),
        })
      );
    });

    it('should handle negative position coordinates', async () => {
      const position = { x: -100, y: -200 };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockProcessGroupResponse);

      await nifiApiService.createProcessGroup('root', 'Test', position);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        'POST',
        expect.objectContaining({
          component: expect.objectContaining({ position }),
        })
      );
    });
  });

  describe('getFlowProcessGroups', () => {
    const mockFlowProcessGroupsResponse = {
      processGroupFlow: {
        id: 'root',
        uri: '/flow/process-groups/root',
        parentGroupId: null,
        breadcrumb: { id: 'root', name: 'NiFi Flow' },
        flow: {
          processGroups: [],
          remoteProcessGroups: [],
          processors: [],
          inputPorts: [],
          outputPorts: [],
          connections: [],
          labels: [],
          funnels: [],
        },
        lastRefreshed: '2025-01-01T00:00:00.000Z',
      },
    };

    it('should successfully fetch flow process groups with default uiOnly=true', async () => {
      const parentGroupId = 'root';

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockFlowProcessGroupsResponse);

      const result = await nifiApiService.getFlowProcessGroups(parentGroupId);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/flow/process-groups/${parentGroupId}?uiOnly=true`,
        'GET'
      );
      expect(result).toEqual(mockFlowProcessGroupsResponse);
    });

    it('should fetch flow process groups with uiOnly=false', async () => {
      const parentGroupId = 'root';

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockFlowProcessGroupsResponse);

      await nifiApiService.getFlowProcessGroups(parentGroupId, false);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/flow/process-groups/${parentGroupId}?uiOnly=false`,
        'GET'
      );
    });

    it('should handle authentication failure during getFlowProcessGroups', async () => {
      const errorMsg = 'Auth failed';
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.getFlowProcessGroups('root')).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle API failure during getFlowProcessGroups', async () => {
      const errorMsg = 'Failed to fetch';
      
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.getFlowProcessGroups('root')).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    });

    it('should handle special characters in parentGroupId', async () => {
      const specialId = 'group-with-special-chars-@#$';

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockFlowProcessGroupsResponse);

      await nifiApiService.getFlowProcessGroups(specialId);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/flow/process-groups/${specialId}?uiOnly=true`,
        'GET'
      );
    });
  });

  describe('getControllerServices', () => {
    const mockControllerServicesResponse = {
      controllerServices: [
        {
          id: 'service-1',
          component: {
            id: 'service-1',
            name: 'Test Controller Service',
            type: 'org.apache.nifi.controller.TestService',
            state: 'ENABLED',
          },
        },
      ],
    };

    it('should successfully fetch controller services', async () => {
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockControllerServicesResponse);

      const result = await nifiApiService.getControllerServices();

      expect(mockedApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        '/nifi-api/flow/process-groups/9947aca9-0199-1000-d42a-7f7edd8bb73e/controller-services?uiOnly=true',
        'GET'
      );
      expect(result).toEqual(mockControllerServicesResponse);
    });

    it('should handle authentication failure during getControllerServices', async () => {
      const errorMsg = 'Auth failed';
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.getControllerServices()).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle API failure during getControllerServices', async () => {
      const errorMsg = 'Failed to fetch services';
      
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.getControllerServices()).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    });

    it('should handle empty controller services response', async () => {
      const emptyResponse = { controllerServices: [] };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(emptyResponse);

      const result = await nifiApiService.getControllerServices();

      expect(result).toEqual(emptyResponse);
    });
  });

  describe('console logging', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should log authentication messages', async () => {
      mockedApiRequest.mockResolvedValueOnce({});

      await nifiApiService.authenticate();

      expect(consoleLogSpy).toHaveBeenCalledWith('Authenticating with NiFi via proxy...');
      expect(consoleLogSpy).toHaveBeenCalledWith('Authentication successful');
    });

    it('should log flow status request details', async () => {
      const mockResponse = {
        controllerStatus: { activeThreadCount: 5, terminatedThreadCount: 2 } as any,
      };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      await nifiApiService.getFlowStatus();

      expect(consoleLogSpy).toHaveBeenCalledWith('Making request to:', '/nifi-api/flow/status');
      expect(consoleLogSpy).toHaveBeenCalledWith('Response received:', mockResponse);
    });

    it('should log process group creation details', async () => {
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce({ id: 'new-pg' });

      await nifiApiService.createProcessGroup('root', 'Test', { x: 0, y: 0 });

      expect(consoleLogSpy).toHaveBeenCalledWith('Creating process group:', expect.any(Object));
      expect(consoleLogSpy).toHaveBeenCalledWith('Process group created:', expect.any(Object));
    });

    it('should log flow process groups fetch details', async () => {
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: {} });

      await nifiApiService.getFlowProcessGroups('root');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Fetching flow process groups from:',
        '/nifi-api/flow/process-groups/root?uiOnly=true'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('Flow process groups fetched:', expect.any(Object));
    });

    it('should log controller services request details', async () => {
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce({ controllerServices: [] });

      await nifiApiService.getControllerServices();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Making controller services request to:',
        expect.stringContaining('controller-services?uiOnly=true')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('Controller services response received:', expect.any(Object));
    });
  });

  describe('error handling with response details', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should log error with response details for createProcessGroup', async () => {
      const error: any = new Error('Create failed');
      error.response = { status: 400, data: { message: 'Bad Request' } };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockRejectedValueOnce(error);

      await expect(nifiApiService.createProcessGroup('root', 'Test', { x: 0, y: 0 })).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create process group:', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error response:', 400, { message: 'Bad Request' });
    });

    it('should log error with request details for getFlowProcessGroups', async () => {
      const error: any = new Error('Network error');
      error.request = { url: '/test', method: 'GET' };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockRejectedValueOnce(error);

      await expect(nifiApiService.getFlowProcessGroups('root')).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch flow process groups:', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('No response received. Request was:', error.request);
    });

    it('should log error for getControllerServices', async () => {
      const error = new Error('Services fetch failed');

      // Mock authenticate to succeed first
      mockedApiRequest.mockResolvedValueOnce({});
      // Then mock getControllerServices to fail
      mockedApiRequest.mockRejectedValueOnce(error);

      await expect(nifiApiService.getControllerServices()).rejects.toThrow();

      // logDetailedError calls console.error with context and error
      // Check that it was called with the error message
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch controller services'),
        expect.any(Error)
      );
    });
  });

  describe('getProcessGroup', () => {
    const mockProcessGroupResponse = {
      revision: { clientId: 'test-client', version: 2 },
      id: 'pg-123',
      uri: '/process-groups/pg-123',
      component: {
        id: 'pg-123',
        name: 'Test Process Group',
        position: { x: 100, y: 200 },
      },
    };

    it('should successfully fetch a process group by ID', async () => {
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockProcessGroupResponse);

      const result = await nifiApiService.getProcessGroup('pg-123');

      expect(mockedApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(2, '/nifi-api/process-groups/pg-123', 'GET');
      expect(result).toEqual(mockProcessGroupResponse);
    });

    it('should handle authentication failure during getProcessGroup', async () => {
      const errorMsg = 'Auth failed';
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.getProcessGroup('pg-123')).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle API failure during getProcessGroup', async () => {
      const errorMsg = 'Failed to fetch process group';
      
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.getProcessGroup('pg-123')).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteProcessGroup', () => {
    const mockProcessGroupResponse = {
      revision: { clientId: 'test-client', version: 3 },
      id: 'pg-to-delete',
    };

    it('should successfully delete a process group with current version', async () => {
      const processGroupId = 'pg-to-delete';
      
      // Mock authentication
      mockedApiRequest.mockResolvedValueOnce({});
      // Mock getProcessGroup to get current version
      mockedApiRequest.mockResolvedValueOnce(mockProcessGroupResponse);
      // Mock DELETE request
      mockedApiRequest.mockResolvedValueOnce({ success: true });

      const result = await nifiApiService.deleteProcessGroup(processGroupId);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(2, `/nifi-api/process-groups/${processGroupId}`, 'GET');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        3,
        `/nifi-api/process-groups/${processGroupId}?clientId=mock-uuid-1234-5678-90ab-cdef&version=3&disconnectedNodeAcknowledged=false`,
        'DELETE'
      );
      expect(result).toEqual({ success: true });
    });

    it('should use provided clientId for delete request', async () => {
      const processGroupId = 'pg-to-delete';
      const clientId = 'custom-client-id';
      
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockProcessGroupResponse);
      mockedApiRequest.mockResolvedValueOnce({ success: true });

      await nifiApiService.deleteProcessGroup(processGroupId, clientId);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        3,
        `/nifi-api/process-groups/${processGroupId}?clientId=${clientId}&version=3&disconnectedNodeAcknowledged=false`,
        'DELETE'
      );
    });

    it('should handle missing revision version', async () => {
      const processGroupId = 'pg-to-delete';
      
      mockedApiRequest.mockResolvedValueOnce({});
      // Mock process group without revision
      mockedApiRequest.mockResolvedValueOnce({ id: processGroupId });
      mockedApiRequest.mockResolvedValueOnce({ success: true });

      await nifiApiService.deleteProcessGroup(processGroupId);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('version=0'),
        'DELETE'
      );
    });

    it('should handle authentication failure during deleteProcessGroup', async () => {
      const errorMsg = 'Auth failed';
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.deleteProcessGroup('pg-123')).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle failure when fetching process group version', async () => {
      const errorMsg = 'Failed to fetch';
      
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.deleteProcessGroup('pg-123')).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    });

    it('should handle failure during delete request', async () => {
      const errorMsg = 'Delete failed';
      
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockProcessGroupResponse);
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.deleteProcessGroup('pg-123')).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(3);
    });
  });

  describe('copyProcessGroup', () => {
    const mockCopyResponse = {
      flow: {
        processGroups: [{ id: 'new-pg-copy', name: 'Test Process Group (Copy)' }],
      },
    };

    it('should successfully copy a process group', async () => {
      const parentGroupId = 'root';
      const processGroupIds = ['pg-to-copy'];
      
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockCopyResponse);

      const result = await nifiApiService.copyProcessGroup(parentGroupId, processGroupIds);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/process-groups/${parentGroupId}/copy`,
        'POST',
        { processGroups: processGroupIds }
      );
      expect(result).toEqual(mockCopyResponse);
    });

    it('should copy multiple process groups', async () => {
      const parentGroupId = 'root';
      const processGroupIds = ['pg-1', 'pg-2', 'pg-3'];
      
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockCopyResponse);

      await nifiApiService.copyProcessGroup(parentGroupId, processGroupIds);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        'POST',
        { processGroups: processGroupIds }
      );
    });

    it('should handle authentication failure during copyProcessGroup', async () => {
      const errorMsg = 'Auth failed';
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.copyProcessGroup('root', ['pg-1'])).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle API failure during copyProcessGroup', async () => {
      const errorMsg = 'Copy failed';
      
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.copyProcessGroup('root', ['pg-1'])).rejects.toThrow(errorMsg);

      expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    });

    it('should handle empty process group IDs array', async () => {
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockCopyResponse);

      await nifiApiService.copyProcessGroup('root', []);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        'POST',
        { processGroups: [] }
      );
    });
  });

  describe('console logging for new methods', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should log getProcessGroup details', async () => {
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce({ id: 'pg-123' });

      await nifiApiService.getProcessGroup('pg-123');

      expect(consoleLogSpy).toHaveBeenCalledWith('Fetching process group:', '/nifi-api/process-groups/pg-123');
      expect(consoleLogSpy).toHaveBeenCalledWith('Process group fetched:', expect.any(Object));
    });

    it('should log deleteProcessGroup details', async () => {
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce({ revision: { version: 1 } });
      mockedApiRequest.mockResolvedValueOnce({ success: true });

      await nifiApiService.deleteProcessGroup('pg-123');

      expect(consoleLogSpy).toHaveBeenCalledWith('Fetching current version for process group:', 'pg-123');
      expect(consoleLogSpy).toHaveBeenCalledWith('Current version:', 1);
      expect(consoleLogSpy).toHaveBeenCalledWith('Deleting process group:', 'pg-123');
      expect(consoleLogSpy).toHaveBeenCalledWith('Process group deleted successfully:', expect.any(Object));
    });

    it('should log copyProcessGroup details', async () => {
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce({ success: true });

      await nifiApiService.copyProcessGroup('root', ['pg-1']);

      expect(consoleLogSpy).toHaveBeenCalledWith('Copying process group(s):', ['pg-1']);
      expect(consoleLogSpy).toHaveBeenCalledWith('Request URL:', '/nifi-api/process-groups/root/copy');
      expect(consoleLogSpy).toHaveBeenCalledWith('Process group(s) copied successfully:', expect.any(Object));
    });
  });

  // Test the interfaces - not a real test but ensures the types are correctly exported
  describe('interfaces', () => {
    it('should correctly define the NifiStatusResponse interface', () => {
      const mockResponse: NifiStatusResponse = {
        controllerStatus: {
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
        }
      };
      
      // This is just a type check - if it compiles, the test passes
      expect(mockResponse).toBeTruthy();
    });
  });

  describe('getRootProcessGroupId', () => {
    beforeEach(() => {
      // Clear any cached value
      (nifiApiService as any).cachedRootProcessGroupId = null;
      (nifiApiService as any).cacheTimestamp = 0;
    });

    it('should fetch and cache root process group ID', async () => {
      const mockResponse = {
        processGroupFlow: {
          id: 'root-id-123',
          uri: '/flow/process-groups/root-id-123',
          parentGroupId: null,
          breadcrumb: { id: 'root-id-123', name: 'Root' }
        }
      };

      mockedApiRequest.mockResolvedValueOnce({}); // authenticate
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.getRootProcessGroupId();

      expect(result).toBe('root-id-123');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(2, '/nifi-api/flow/process-groups/root', 'GET');
    });

    it('should use cached root process group ID when available', async () => {
      const mockResponse = {
        processGroupFlow: {
          id: 'root-id-123',
          uri: '/flow/process-groups/root-id-123',
          parentGroupId: null,
          breadcrumb: { id: 'root-id-123', name: 'Root' }
        }
      };

      mockedApiRequest.mockResolvedValueOnce({}); // authenticate
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      // First call
      await nifiApiService.getRootProcessGroupId();

      // Second call should use cache
      const result = await nifiApiService.getRootProcessGroupId();

      expect(result).toBe('root-id-123');
      // Should only authenticate once, second call uses cache
      expect(mockedApiRequest).toHaveBeenCalledTimes(2);
    });

    it('should force refresh when forceRefresh is true', async () => {
      const mockResponse1 = {
        processGroupFlow: {
          id: 'root-id-123',
          uri: '/flow/process-groups/root-id-123',
          parentGroupId: null,
          breadcrumb: { id: 'root-id-123', name: 'Root' }
        }
      };

      const mockResponse2 = {
        processGroupFlow: {
          id: 'root-id-456',
          uri: '/flow/process-groups/root-id-456',
          parentGroupId: null,
          breadcrumb: { id: 'root-id-456', name: 'Root' }
        }
      };

      mockedApiRequest.mockResolvedValue({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse1);
      mockedApiRequest.mockResolvedValueOnce(mockResponse2);

      await nifiApiService.getRootProcessGroupId();
      const result = await nifiApiService.getRootProcessGroupId(true);

      expect(result).toBe('root-id-456');
    });

    it('should handle 401 errors and retry with authentication', async () => {
      const mockResponse = {
        processGroupFlow: {
          id: 'root-id-123',
          uri: '/flow/process-groups/root-id-123',
          parentGroupId: null,
          breadcrumb: { id: 'root-id-123', name: 'Root' }
        }
      };

      const error401: any = new Error('Unauthorized');
      error401.response = { status: 401 };

      mockedApiRequest.mockResolvedValueOnce({}); // First authenticate
      mockedApiRequest.mockRejectedValueOnce(error401); // First GET fails with 401
      mockedApiRequest.mockResolvedValueOnce({}); // Retry authenticate
      mockedApiRequest.mockResolvedValueOnce(mockResponse); // Retry GET succeeds

      const result = await nifiApiService.getRootProcessGroupId();

      expect(result).toBe('root-id-123');
      expect(mockedApiRequest).toHaveBeenCalledTimes(4);
    });

    it('should return cached value as fallback when fetch fails', async () => {
      const mockResponse = {
        processGroupFlow: {
          id: 'root-id-123',
          uri: '/flow/process-groups/root-id-123',
          parentGroupId: null,
          breadcrumb: { id: 'root-id-123', name: 'Root' }
        }
      };

      // First call succeeds and caches
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);
      await nifiApiService.getRootProcessGroupId();

      // Second call fails but returns cached value
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockRejectedValueOnce(new Error('Network error'));

      const result = await nifiApiService.getRootProcessGroupId();

      expect(result).toBe('root-id-123'); // Returns cached value
    });

    it('should throw error when response is missing processGroupFlow.id', async () => {
      const invalidResponse = {
        processGroupFlow: {}
      };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(invalidResponse);

      await expect(nifiApiService.getRootProcessGroupId()).rejects.toThrow('Root process group ID not found');
    });
  });

  describe('getControllerServiceTypes', () => {
    it('should successfully fetch controller service types', async () => {
      const mockResponse = {
        controllerServiceTypes: [
          {
            type: 'org.apache.nifi.dbcp.DBCPConnectionPool',
            bundle: { group: 'org.apache.nifi', artifact: 'nifi-standard-services-api-nar', version: '2.3.0' },
            description: 'Database connection pool'
          }
        ]
      };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.getControllerServiceTypes();

      expect(mockedApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(2, '/nifi-api/flow/controller-service-types', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching controller service types', async () => {
      const errorMsg = 'Failed to fetch types';
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockRejectedValueOnce(new Error(errorMsg));

      await expect(nifiApiService.getControllerServiceTypes()).rejects.toThrow(errorMsg);
    });
  });

  describe('createControllerService', () => {
    const mockBundle = {
      group: 'org.apache.nifi',
      artifact: 'nifi-standard-services-api-nar',
      version: '2.3.0'
    };

    it('should successfully create controller service', async () => {
      const mockResponse = {
        id: 'new-cs-id',
        component: {
          id: 'new-cs-id',
          name: 'New Controller Service',
          type: 'org.apache.nifi.dbcp.DBCPConnectionPool'
        }
      };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.createControllerService(
        'process-group-id',
        'org.apache.nifi.dbcp.DBCPConnectionPool',
        mockBundle
      );

      expect(result).toEqual(mockResponse);
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        '/nifi-api/process-groups/process-group-id/controller-services',
        'POST',
        expect.objectContaining({
          component: {
            bundle: mockBundle,
            type: 'org.apache.nifi.dbcp.DBCPConnectionPool'
          }
        })
      );
    });

    it('should handle missing type or bundle', async () => {
      mockedApiRequest.mockResolvedValueOnce({});

      await expect(
        nifiApiService.createControllerService('pg-id', '', mockBundle)
      ).rejects.toThrow('Type and bundle');

      await expect(
        nifiApiService.createControllerService('pg-id', 'org.apache.nifi.Test', {} as any)
      ).rejects.toThrow('Type and bundle');
    });

    it('should generate UUID when clientId not provided', async () => {
      const mockResponse = { id: 'new-cs-id' };
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      await nifiApiService.createControllerService('pg-id', 'org.apache.nifi.Test', mockBundle);

      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        'POST',
        expect.objectContaining({
          revision: expect.objectContaining({
            clientId: expect.any(String)
          })
        })
      );
    });
  });

  describe('getControllerServiceReferences', () => {
    it('should successfully fetch controller service references', async () => {
      const mockResponse = {
        referencingComponents: [
          { id: 'proc-1', name: 'Processor 1', type: 'PROCESSOR' }
        ]
      };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.getControllerServiceReferences('cs-id-123');

      expect(result).toEqual(mockResponse);
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        '/nifi-api/controller-services/cs-id-123/references',
        'GET'
      );
    });
  });

  describe('getControllerService', () => {
    it('should successfully fetch controller service details', async () => {
      const mockResponse = {
        id: 'cs-id-123',
        component: {
          id: 'cs-id-123',
          name: 'Test Service',
          type: 'org.apache.nifi.dbcp.DBCPConnectionPool',
          state: 'ENABLED'
        },
        revision: { version: 1, clientId: 'client-1' }
      };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.getControllerService('cs-id-123');

      expect(result).toEqual(mockResponse);
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        '/nifi-api/controller-services/cs-id-123',
        'GET'
      );
    });
  });

  describe('setControllerServiceState', () => {
    it('should successfully enable controller service', async () => {
      const mockResponse = { id: 'cs-id-123', state: 'ENABLED' };
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.setControllerServiceState(
        'cs-id-123',
        { version: 1, clientId: 'client-1' },
        'ENABLED'
      );

      expect(result).toEqual(mockResponse);
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        '/nifi-api/controller-services/cs-id-123/run-status',
        'PUT',
        expect.objectContaining({
          state: 'ENABLED'
        })
      );
    });

    it('should successfully disable controller service', async () => {
      const mockResponse = { id: 'cs-id-123', state: 'DISABLED' };
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.setControllerServiceState(
        'cs-id-123',
        { version: 1 },
        'DISABLED'
      );

      expect(result).toEqual(mockResponse);
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        '/nifi-api/controller-services/cs-id-123/run-status',
        'PUT',
        expect.objectContaining({
          state: 'DISABLED'
        })
      );
    });

    it('should generate UUID when clientId not provided', async () => {
      const mockResponse = { id: 'cs-id-123' };
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      await nifiApiService.setControllerServiceState('cs-id-123', { version: 1 }, 'ENABLED');

      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        'PUT',
        expect.objectContaining({
          revision: expect.objectContaining({
            clientId: expect.any(String)
          })
        })
      );
    });
  });

  describe('enableControllerService', () => {
    it('should call setControllerServiceState with ENABLED', async () => {
      const mockResponse = { id: 'cs-id-123', state: 'ENABLED' };
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.enableControllerService(
        'cs-id-123',
        { version: 1, clientId: 'client-1' }
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('disableControllerService', () => {
    it('should call setControllerServiceState with DISABLED', async () => {
      const mockResponse = { id: 'cs-id-123', state: 'DISABLED' };
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.disableControllerService(
        'cs-id-123',
        { version: 1, clientId: 'client-1' }
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateControllerServiceReferences', () => {
    it('should successfully update controller service references to STOPPED', async () => {
      const mockResponse = { id: 'cs-id-123' };
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.updateControllerServiceReferences(
        'cs-id-123',
        'STOPPED',
        { 'proc-1': { revision: { version: 1 } } }
      );

      expect(result).toEqual(mockResponse);
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        '/nifi-api/controller-services/cs-id-123/references',
        'PUT',
        expect.objectContaining({
          state: 'STOPPED'
        })
      );
    });

    it('should successfully update controller service references to RUNNING', async () => {
      const mockResponse = { id: 'cs-id-123' };
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.updateControllerServiceReferences(
        'cs-id-123',
        'RUNNING',
        {}
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateControllerService', () => {
    it('should successfully update controller service', async () => {
      const updateData = {
        revision: { version: 1, clientId: 'client-1' },
        component: {
          id: 'cs-id-123',
          name: 'Updated Service',
          properties: {}
        }
      };

      const mockResponse = { id: 'cs-id-123', ...updateData };
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await nifiApiService.updateControllerService('cs-id-123', updateData);

      expect(result).toEqual(mockResponse);
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        '/nifi-api/controller-services/cs-id-123',
        'PUT',
        updateData
      );
    });
  });

  describe('getProcessGroupIdByName', () => {
    it('should successfully find process group by name', async () => {
      const mockFlowResponse = {
        processGroupFlow: {
          flow: {
            processGroups: [
              { id: 'pg-1', component: { name: 'Test Group' } },
              { id: 'pg-2', component: { name: 'Another Group' } }
            ]
          }
        }
      };

      mockedApiRequest.mockResolvedValueOnce({}); // authenticate
      mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: 'root-id' } }); // getRootProcessGroupId
      mockedApiRequest.mockResolvedValueOnce({}); // authenticate for getFlowProcessGroups
      mockedApiRequest.mockResolvedValueOnce(mockFlowResponse);

      const result = await nifiApiService.getProcessGroupIdByName('Test Group');

      expect(result).toBe('pg-1');
    });

    it('should return null when process group not found', async () => {
      const mockFlowResponse = {
        processGroupFlow: {
          flow: {
            processGroups: [
              { id: 'pg-1', component: { name: 'Test Group' } }
            ]
          }
        }
      };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: 'root-id' } });
      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce(mockFlowResponse);

      const result = await nifiApiService.getProcessGroupIdByName('Non-existent Group');

      expect(result).toBeNull();
    });

    it('should use provided parentGroupId when specified', async () => {
      const mockFlowResponse = {
        processGroupFlow: {
          flow: {
            processGroups: [
              { id: 'pg-1', component: { name: 'Child Group' } }
            ]
          }
        }
      };

      mockedApiRequest.mockResolvedValueOnce({});
      mockedApiRequest.mockResolvedValueOnce({}); // authenticate for getFlowProcessGroups
      mockedApiRequest.mockResolvedValueOnce(mockFlowResponse);

      const result = await nifiApiService.getProcessGroupIdByName('Child Group', 'parent-id');

      expect(result).toBe('pg-1');
      expect(mockedApiRequest).toHaveBeenNthCalledWith(
        2,
        '/nifi-api/flow/process-groups/parent-id?uiOnly=true',
        'GET'
      );
    });
  });

  describe('Helper Functions and Edge Cases', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    describe('getRootProcessGroupId - Cache Expiration', () => {
      it('should bypass cache when forceRefresh is true', async () => {
        const rootId1 = 'root-id-1';
        const rootId2 = 'root-id-2';

        // First call - cache it
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: rootId1 } });
        await nifiApiService.getRootProcessGroupId();

        // Second call with forceRefresh - should fetch new value
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: rootId2 } });
        const result = await nifiApiService.getRootProcessGroupId(true);

        expect(result).toBe(rootId2);
        expect(mockedApiRequest).toHaveBeenCalledWith('/nifi-api/flow/process-groups/root', 'GET');
      });

      it('should use cache when within TTL', async () => {
        const rootId = 'root-id-cached';

        // First call - cache it
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: rootId } });
        await nifiApiService.getRootProcessGroupId();

        // Second call - should use cache
        mockedApiRequest.mockClear();
        const result = await nifiApiService.getRootProcessGroupId();

        expect(result).toBe(rootId);
        expect(consoleLogSpy).toHaveBeenCalledWith(`Using cached root process group ID: ${rootId}`);
        // Should not make new API call
        expect(mockedApiRequest).not.toHaveBeenCalled();
      });

      it('should handle retry when 401 error occurs', async () => {
        const rootId = 'root-id-retry';
        const error401: any = new Error('Unauthorized');
        error401.response = { status: 401 };

        // First attempt fails with 401
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockRejectedValueOnce(error401);
        // Retry with new auth
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate retry
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: rootId } });

        const result = await nifiApiService.getRootProcessGroupId();

        expect(result).toBe(rootId);
        expect(consoleLogSpy).toHaveBeenCalledWith('Token expired or invalid, refreshing authentication...');
      });

      it('should throw error when max retries exceeded', async () => {
        const error401: any = new Error('Unauthorized');
        error401.response = { status: 401 };

        // All attempts fail with 401
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockRejectedValueOnce(error401);
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate retry 1
        mockedApiRequest.mockRejectedValueOnce(error401);
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate retry 2
        mockedApiRequest.mockRejectedValueOnce(error401);

        await expect(nifiApiService.getRootProcessGroupId()).rejects.toThrow();
      });

      it('should return cached value as fallback when fetch fails and cache exists', async () => {
        const cachedId = 'cached-root-id';
        const fetchError = new Error('Network error');

        // First call - cache it
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: cachedId } });
        await nifiApiService.getRootProcessGroupId();

        // Second call - fetch fails but cache exists
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockRejectedValueOnce(fetchError);

        const result = await nifiApiService.getRootProcessGroupId();

        expect(result).toBe(cachedId);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Using cached root process group ID due to fetch error');
      });
    });

    describe('setProcessGroupFlowState - Edge Cases', () => {
      it('should not update remote groups when updateRemoteGroups is false', async () => {
        const processGroupId = 'pg-enable-123';
        const mockResponse = { id: processGroupId };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({}); // flow PUT
        mockedApiRequest.mockResolvedValueOnce(mockResponse); // getProcessGroup

        await nifiApiService.enableProcessGroup(processGroupId);

        // Should not call remote process groups endpoint
        expect(mockedApiRequest).not.toHaveBeenCalledWith(
          expect.stringContaining('remote-process-groups'),
          'PUT'
        );
      });

      it('should handle DISABLED state correctly', async () => {
        const processGroupId = 'pg-disable-123';
        const mockResponse = { id: processGroupId };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({}); // flow PUT
        mockedApiRequest.mockResolvedValueOnce(mockResponse); // getProcessGroup

        await nifiApiService.disableProcessGroup(processGroupId);

        expect(mockedApiRequest).toHaveBeenNthCalledWith(
          2,
          `/nifi-api/flow/process-groups/${processGroupId}`,
          'PUT',
          expect.objectContaining({ state: 'DISABLED' })
        );
        expect(consoleLogSpy).toHaveBeenCalledWith('Disabling process group flow:', processGroupId);
      });
    });

    describe('resolveProcessGroupId - Retry and Fallback Logic', () => {
      const { userProcessGroupMappingService } = require('../../../src/services/userProcessGroupMapping');

      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should use provided process group ID when available', async () => {
        const providedId = 'provided-id';
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: 'root' } }); // getRootProcessGroupId
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate for getFlowProcessGroups
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { flow: { processGroups: [] } } });

        await nifiApiService.getFlowProcessGroups(providedId);

        expect(consoleLogSpy).toHaveBeenCalledWith(`Using provided process group ID: ${providedId}`);
      });

      it('should use user credentials when provided', async () => {
        const credentials = { username: 'testuser', password: 'testpass' };
        const userProcessGroupId = 'user-pg-id';

        (userProcessGroupMappingService.getProcessGroupIdForUser as jest.Mock) = jest
          .fn()
          .mockResolvedValue(userProcessGroupId);

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { flow: { processGroups: [] } } });

        await nifiApiService.getFlowProcessGroups(undefined, true, credentials);

        expect(userProcessGroupMappingService.getProcessGroupIdForUser).toHaveBeenCalledWith(credentials);
        expect(consoleLogSpy).toHaveBeenCalledWith(
          `Using user-specific process group ID: ${userProcessGroupId} for user: ${credentials.username}`
        );
      });

      it('should throw error when user has no process group', async () => {
        const credentials = { username: 'testuser', password: 'testpass' };

        (userProcessGroupMappingService.getProcessGroupIdForUser as jest.Mock) = jest
          .fn()
          .mockResolvedValue(null);

        await expect(
          nifiApiService.getFlowProcessGroups(undefined, true, credentials)
        ).rejects.toThrow(`No process group found for user: ${credentials.username}`);
      });
    });

    describe('updateControllerService - Conflict Error Handling', () => {
      it('should not log conflict errors (409 status)', async () => {
        const updateData = { revision: { version: 1 }, component: { id: 'cs-1' } };
        const conflictError: any = new Error('Conflict');
        conflictError.response = { status: 409, data: {} };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockRejectedValueOnce(conflictError);

        await expect(
          nifiApiService.updateControllerService('cs-1', updateData)
        ).rejects.toThrow('Conflict');
      });

      it('should not log 500 errors with 409 in details', async () => {
        const updateData = { revision: { version: 1 }, component: { id: 'cs-1' } };
        const error500: any = new Error('Server error');
        error500.response = {
          status: 500,
          data: { details: 'Error 409: Conflict occurred' }
        };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockRejectedValueOnce(error500);

        await expect(
          nifiApiService.updateControllerService('cs-1', updateData)
        ).rejects.toThrow('Server error');
      });
    });

    describe('authenticateWithNiFi - Cache Clearing', () => {
      it('should clear cached root process group ID on authentication', async () => {
        const rootId = 'root-id-before-auth';

        // First, cache a root ID
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: rootId } });
        await nifiApiService.getRootProcessGroupId();

        // Now authenticate - this should clear the cache
        mockedApiRequest.mockResolvedValueOnce({});
        await nifiApiService.authenticate();

        // Next getRootProcessGroupId should fetch fresh (not use cache)
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: 'new-root-id' } });
        const result = await nifiApiService.getRootProcessGroupId();

        expect(result).toBe('new-root-id');
        // Should not use the old cached value
        expect(consoleLogSpy).not.toHaveBeenCalledWith(`Using cached root process group ID: ${rootId}`);
      });
    });

    describe('getProcessGroupIdByName - Edge Cases', () => {
      it('should handle empty process groups array', async () => {
        const mockFlowResponse = {
          processGroupFlow: {
            flow: {
              processGroups: []
            }
          }
        };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: 'root-id' } });
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate for getFlowProcessGroups
        mockedApiRequest.mockResolvedValueOnce(mockFlowResponse);

        const result = await nifiApiService.getProcessGroupIdByName('Non-existent');

        expect(result).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Process group "Non-existent" not found under parent root-id'
        );
      });

      it('should handle missing processGroupFlow in response', async () => {
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: 'root-id' } });
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate for getFlowProcessGroups
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: {} }); // Missing flow

        const result = await nifiApiService.getProcessGroupIdByName('Test');

        expect(result).toBeNull();
      });
    });

    describe('createProcessor', () => {
      it('should create a processor with all required parameters', async () => {
        const processGroupId = 'pg-123';
        const type = 'org.apache.nifi.processors.standard.GetFile';
        const bundle = {
          group: 'org.apache.nifi',
          artifact: 'nifi-standard-processors-nar',
          version: '2.3.0'
        };
        const position = { x: 100, y: 200 };
        const mockResponse = {
          id: 'processor-123',
          component: {
            id: 'processor-123',
            type: type,
            position: position
          }
        };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: processGroupId } }); // getRootProcessGroupId
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate for createProcessor
        mockedApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await nifiApiService.createProcessor(
          processGroupId,
          type,
          bundle,
          position
        );

        expect(result).toEqual(mockResponse);
        expect(mockedApiRequest).toHaveBeenCalledWith(
          `/nifi-api/process-groups/${processGroupId}/processors`,
          'POST',
          expect.objectContaining({
            component: expect.objectContaining({
              type: type,
              bundle: bundle,
              position: position
            })
          })
        );
      });

      it('should create a processor without position when not provided', async () => {
        const processGroupId = 'pg-123';
        const type = 'org.apache.nifi.processors.standard.GetFile';
        const bundle = {
          group: 'org.apache.nifi',
          artifact: 'nifi-standard-processors-nar',
          version: '2.3.0'
        };
        const mockResponse = {
          id: 'processor-123',
          component: {
            id: 'processor-123',
            type: type
          }
        };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: processGroupId } }); // getRootProcessGroupId
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate for createProcessor
        mockedApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await nifiApiService.createProcessor(
          processGroupId,
          type,
          bundle
        );

        expect(result).toEqual(mockResponse);
        expect(mockedApiRequest).toHaveBeenCalledWith(
          `/nifi-api/process-groups/${processGroupId}/processors`,
          'POST',
          expect.objectContaining({
            component: expect.objectContaining({
              type: type,
              bundle: bundle
            })
          })
        );
      });

      it('should use root process group ID when processGroupId is undefined', async () => {
        const rootId = 'root-id';
        const type = 'org.apache.nifi.processors.standard.GetFile';
        const bundle = {
          group: 'org.apache.nifi',
          artifact: 'nifi-standard-processors-nar',
          version: '2.3.0'
        };
        const mockResponse = {
          id: 'processor-123',
          component: { id: 'processor-123', type: type }
        };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: rootId } }); // getRootProcessGroupId
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate for createProcessor
        mockedApiRequest.mockResolvedValueOnce(mockResponse);

        await nifiApiService.createProcessor(undefined, type, bundle);

        expect(mockedApiRequest).toHaveBeenCalledWith(
          `/nifi-api/process-groups/${rootId}/processors`,
          'POST',
          expect.any(Object)
        );
      });

      it('should throw error when type is missing', async () => {
        const processGroupId = 'pg-123';
        const bundle = {
          group: 'org.apache.nifi',
          artifact: 'nifi-standard-processors-nar',
          version: '2.3.0'
        };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: processGroupId } }); // getRootProcessGroupId

        await expect(
          nifiApiService.createProcessor(processGroupId, '', bundle)
        ).rejects.toThrow('Type and bundle (with group, artifact, version) are required');
      });

      it('should throw error when bundle is missing', async () => {
        const processGroupId = 'pg-123';
        const type = 'org.apache.nifi.processors.standard.GetFile';

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce({ processGroupFlow: { id: processGroupId } }); // getRootProcessGroupId

        await expect(
          nifiApiService.createProcessor(processGroupId, type, {} as any)
        ).rejects.toThrow('Type and bundle (with group, artifact, version) are required');
      });
    });

    describe('updateProcessGroupConfiguration', () => {
      it('should update process group configuration with all fields', async () => {
        const processGroupId = 'pg-123';
        const mockProcessGroup = {
          revision: { version: 5, clientId: 'client-123' },
          component: {
            id: processGroupId,
            name: 'Test Group',
            executionEngine: 'STANDARD',
            flowfileConcurrency: 'SINGLE_BATCH_PER_NODE',
            defaultFlowFileExpiration: '0 Sec',
            defaultBackPressureObjectThreshold: 10000,
            comments: 'Test comments'
          }
        };
        const config = {
          name: 'Updated Group',
          executionEngine: 'Standard',
          flowFileConcurrency: 'Single Batch Per Node',
          defaultFlowFileExpiration: '60 Sec',
          defaultBackPressureObjectThreshold: '20000',
          comments: 'Updated comments'
        };
        const mockResponse = {
          id: processGroupId,
          component: { ...mockProcessGroup.component, ...config }
        };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce(mockProcessGroup); // getProcessGroup
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate for update
        mockedApiRequest.mockResolvedValueOnce(mockResponse);

        const result = await nifiApiService.updateProcessGroupConfiguration(processGroupId, config);

        expect(result).toEqual(mockResponse);
        expect(mockedApiRequest).toHaveBeenCalledWith(
          `/nifi-api/process-groups/${processGroupId}`,
          'PUT',
          expect.objectContaining({
            revision: expect.objectContaining({
              version: 5
            }),
            component: expect.objectContaining({
              name: 'Updated Group',
              executionEngine: 'STANDARD',
              flowfileConcurrency: 'SINGLE_BATCH_PER_NODE',
              defaultFlowFileExpiration: '60 Sec',
              defaultBackPressureObjectThreshold: 20000,
              comments: 'Updated comments'
            })
          })
        );
      });

      it('should handle parameter context with valid UUID', async () => {
        const processGroupId = 'pg-123';
        const validUUID = '123e4567-e89b-12d3-a456-426614174000';
        const mockProcessGroup = {
          revision: { version: 1 },
          component: { id: processGroupId, name: 'Test' }
        };
        const config = {
          name: 'Test Group',
          parameterContextId: validUUID,
          executionEngine: 'Standard',
          flowFileConcurrency: 'Single Batch Per Node',
          defaultFlowFileExpiration: '0 Sec',
          defaultBackPressureObjectThreshold: '10000'
        };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce(mockProcessGroup);
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate for update
        mockedApiRequest.mockResolvedValueOnce({});

        await nifiApiService.updateProcessGroupConfiguration(processGroupId, config);

        expect(mockedApiRequest).toHaveBeenCalledWith(
          `/nifi-api/process-groups/${processGroupId}`,
          'PUT',
          expect.objectContaining({
            component: expect.objectContaining({
              parameterContext: { id: validUUID }
            })
          })
        );
      });

      it('should set parameter context to null when UUID is invalid', async () => {
        const processGroupId = 'pg-123';
        const invalidUUID = 'not-a-uuid';
        const mockProcessGroup = {
          revision: { version: 1 },
          component: { id: processGroupId, name: 'Test' }
        };
        const config = {
          name: 'Test Group',
          parameterContextId: invalidUUID,
          executionEngine: 'Standard',
          flowFileConcurrency: 'Single Batch Per Node',
          defaultFlowFileExpiration: '0 Sec',
          defaultBackPressureObjectThreshold: '10000'
        };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce(mockProcessGroup);
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate for update
        mockedApiRequest.mockResolvedValueOnce({});

        await nifiApiService.updateProcessGroupConfiguration(processGroupId, config);

        expect(mockedApiRequest).toHaveBeenCalledWith(
          `/nifi-api/process-groups/${processGroupId}`,
          'PUT',
          expect.objectContaining({
            component: expect.objectContaining({
              parameterContext: null
            })
          })
        );
      });

      it('should handle applyRecursively flag', async () => {
        const processGroupId = 'pg-123';
        const mockProcessGroup = {
          revision: { version: 1 },
          component: { id: processGroupId, name: 'Test' }
        };
        const config = {
          name: 'Test Group',
          applyRecursively: true,
          executionEngine: 'Standard',
          flowFileConcurrency: 'Single Batch Per Node',
          defaultFlowFileExpiration: '0 Sec',
          defaultBackPressureObjectThreshold: '10000'
        };

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce(mockProcessGroup);
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate for update
        mockedApiRequest.mockResolvedValueOnce({});

        await nifiApiService.updateProcessGroupConfiguration(processGroupId, config);

        expect(mockedApiRequest).toHaveBeenCalledWith(
          `/nifi-api/process-groups/${processGroupId}`,
          'PUT',
          expect.objectContaining({
            processGroupUpdateStrategy: 'ALL_DESCENDANTS'
          })
        );
      });

      it('should throw error when update fails', async () => {
        const processGroupId = 'pg-123';
        const mockProcessGroup = {
          revision: { version: 1 },
          component: { id: processGroupId, name: 'Test' }
        };
        const config = {
          name: 'Test Group',
          executionEngine: 'Standard',
          flowFileConcurrency: 'Single Batch Per Node',
          defaultFlowFileExpiration: '0 Sec',
          defaultBackPressureObjectThreshold: '10000'
        };
        const error = new Error('Update failed');

        mockedApiRequest.mockResolvedValueOnce({}); // authenticate
        mockedApiRequest.mockResolvedValueOnce(mockProcessGroup);
        mockedApiRequest.mockResolvedValueOnce({}); // authenticate for update
        mockedApiRequest.mockRejectedValueOnce(error);

        await expect(
          nifiApiService.updateProcessGroupConfiguration(processGroupId, config)
        ).rejects.toThrow('Update failed');
      });
    });
  });
});
