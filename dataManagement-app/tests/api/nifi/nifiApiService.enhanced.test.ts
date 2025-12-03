/**
 * Comprehensive test suite for nifiApiService - Enhanced functionality
 * Tests for: pasteProcessGroup, startProcessGroup, stopProcessGroup, enableProcessGroup, disableProcessGroup
 */

import { nifiApiService } from '../../../src/api/nifi/nifiApiService';
import { apiRequest } from '../../../src/api/auth/apiRequest';

// Mock dependencies
jest.mock('../../../src/api/auth/apiRequest');
jest.mock('../../../src/utils/errorLogger');

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('nifiApiService - Enhanced Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('pasteProcessGroup', () => {
    const parentGroupId = 'parent-group-123';
    const mockCopyResponse = {
      id: 'copy-response-123',
      processGroups: [
        {
          identifier: 'pg-456',
          name: 'Test Process Group',
          position: { x: 100, y: 200 }
        }
      ],
      externalControllerServiceReferences: {},
      parameterContexts: {},
      parameterProviders: {}
    };

    const mockPasteResponse = {
      id: 'paste-result-789',
      processGroups: [
        {
          id: 'new-pg-999',
          name: 'Test Process Group',
          position: { x: 100, y: 200 }
        }
      ]
    };

    it('should successfully paste a process group', async () => {
      mockApiRequest
        .mockResolvedValueOnce(undefined) // authenticate
        .mockResolvedValueOnce(mockPasteResponse); // paste

      const result = await nifiApiService.pasteProcessGroup(parentGroupId, mockCopyResponse);

      expect(mockApiRequest).toHaveBeenCalledTimes(2);
      
      // Verify authentication call
      expect(mockApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      
      // Verify paste call with correct payload
      expect(mockApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/process-groups/${parentGroupId}/paste`,
        'PUT',
        {
          copyResponse: mockCopyResponse,
          revision: { version: 2 },
          disconnectedNodeAcknowledged: false
        }
      );

      expect(result).toEqual(mockPasteResponse);
      expect(console.log).toHaveBeenCalledWith('Pasting process group(s) to parent:', parentGroupId);
    });

    it('should handle paste failure due to authentication error', async () => {
      const authError = new Error('Authentication failed');
      mockApiRequest.mockRejectedValueOnce(authError);

      await expect(
        nifiApiService.pasteProcessGroup(parentGroupId, mockCopyResponse)
      ).rejects.toThrow('Authentication failed');

      expect(mockApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle paste failure due to API error', async () => {
      const apiError = new Error('Paste operation failed');
      mockApiRequest
        .mockResolvedValueOnce(undefined) // authenticate
        .mockRejectedValueOnce(apiError); // paste fails

      await expect(
        nifiApiService.pasteProcessGroup(parentGroupId, mockCopyResponse)
      ).rejects.toThrow('Paste operation failed');

      expect(mockApiRequest).toHaveBeenCalledTimes(2);
    });

    it('should log request data as JSON', async () => {
      mockApiRequest
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(mockPasteResponse);

      await nifiApiService.pasteProcessGroup(parentGroupId, mockCopyResponse);

      expect(console.log).toHaveBeenCalledWith(
        'Request data:',
        expect.stringContaining('"copyResponse"')
      );
    });

    it('should include all required fields in request payload', async () => {
      mockApiRequest
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(mockPasteResponse);

      await nifiApiService.pasteProcessGroup(parentGroupId, mockCopyResponse);

      const pasteCall = mockApiRequest.mock.calls[1];
      const payload = pasteCall[2];

      expect(payload).toHaveProperty('copyResponse');
      expect(payload).toHaveProperty('revision');
      expect(payload.revision).toHaveProperty('version', 2);
      expect(payload).toHaveProperty('disconnectedNodeAcknowledged', false);
    });
  });

  describe('startProcessGroup', () => {
    const processGroupId = 'pg-start-123';
    const mockProcessGroupResponse = {
      id: processGroupId,
      component: {
        name: 'Test Group',
        state: 'RUNNING'
      }
    };

    it('should successfully start a process group with all steps', async () => {
      mockApiRequest
        .mockResolvedValueOnce(undefined) // authenticate
        .mockResolvedValueOnce({}) // flow PUT
        .mockResolvedValueOnce({}) // remote PUT
        .mockResolvedValueOnce(mockProcessGroupResponse); // getProcessGroup

      const result = await nifiApiService.startProcessGroup(processGroupId);

      expect(mockApiRequest).toHaveBeenCalledTimes(4);
      
      // Step 1: Authenticate
      expect(mockApiRequest).toHaveBeenNthCalledWith(1, '/api/authenticate', 'GET');
      
      // Step 2: Set flow to RUNNING
      expect(mockApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/flow/process-groups/${processGroupId}`,
        'PUT',
        {
          id: processGroupId,
          disconnectedNodeAcknowledged: false,
          state: 'RUNNING'
        }
      );
      
      // Step 3: Set remote process groups to TRANSMITTING
      expect(mockApiRequest).toHaveBeenNthCalledWith(
        3,
        `/nifi-api/remote-process-groups/process-group/${processGroupId}/run-status`,
        'PUT',
        {
          disconnectedNodeAcknowledged: false,
          state: 'TRANSMITTING'
        }
      );
      
      // Step 4: Get updated process group
      expect(mockApiRequest).toHaveBeenNthCalledWith(
        4,
        `/nifi-api/process-groups/${processGroupId}`,
        'GET'
      );

      expect(result).toEqual(mockProcessGroupResponse);
      expect(console.log).toHaveBeenCalledWith('Starting process group flow:', processGroupId);
      expect(console.log).toHaveBeenCalledWith('Process group flow started successfully');
      expect(console.log).toHaveBeenCalledWith('Remote process groups started successfully');
    });

    it('should handle failure in flow state change', async () => {
      const flowError = new Error('Flow state change failed');
      mockApiRequest
        .mockResolvedValueOnce(undefined) // authenticate
        .mockRejectedValueOnce(flowError); // flow PUT fails

      await expect(
        nifiApiService.startProcessGroup(processGroupId)
      ).rejects.toThrow('Flow state change failed');

      expect(mockApiRequest).toHaveBeenCalledTimes(2);
    });

    it('should handle failure in remote process groups state change', async () => {
      const remoteError = new Error('Remote state change failed');
      mockApiRequest
        .mockResolvedValueOnce(undefined) // authenticate
        .mockResolvedValueOnce({}) // flow PUT
        .mockRejectedValueOnce(remoteError); // remote PUT fails

      await expect(
        nifiApiService.startProcessGroup(processGroupId)
      ).rejects.toThrow('Remote state change failed');

      expect(mockApiRequest).toHaveBeenCalledTimes(3);
    });

    it('should handle failure in getProcessGroup after state changes', async () => {
      const getError = new Error('Failed to get process group');
      mockApiRequest
        .mockResolvedValueOnce(undefined) // authenticate
        .mockResolvedValueOnce({}) // flow PUT
        .mockResolvedValueOnce({}) // remote PUT
        .mockRejectedValueOnce(getError); // getProcessGroup fails

      await expect(
        nifiApiService.startProcessGroup(processGroupId)
      ).rejects.toThrow('Failed to get process group');

      expect(mockApiRequest).toHaveBeenCalledTimes(4);
    });

    it('should log all steps during start operation', async () => {
      mockApiRequest
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(mockProcessGroupResponse);

      await nifiApiService.startProcessGroup(processGroupId);

      expect(console.log).toHaveBeenCalledWith('Starting process group flow:', processGroupId);
      expect(console.log).toHaveBeenCalledWith('Request URL:', `/nifi-api/flow/process-groups/${processGroupId}`);
      expect(console.log).toHaveBeenCalledWith('Starting remote process groups:', processGroupId);
      expect(console.log).toHaveBeenCalledWith('Process group started and refreshed successfully');
    });
  });

  describe('stopProcessGroup', () => {
    const processGroupId = 'pg-stop-123';
    const mockProcessGroupResponse = {
      id: processGroupId,
      component: {
        name: 'Test Group',
        state: 'STOPPED'
      }
    };

    it('should successfully stop a process group with all steps', async () => {
      mockApiRequest
        .mockResolvedValueOnce(undefined) // authenticate
        .mockResolvedValueOnce({}) // flow PUT
        .mockResolvedValueOnce({}) // remote PUT
        .mockResolvedValueOnce(mockProcessGroupResponse); // getProcessGroup

      const result = await nifiApiService.stopProcessGroup(processGroupId);

      expect(mockApiRequest).toHaveBeenCalledTimes(4);
      
      // Verify flow state set to STOPPED
      expect(mockApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/flow/process-groups/${processGroupId}`,
        'PUT',
        {
          id: processGroupId,
          disconnectedNodeAcknowledged: false,
          state: 'STOPPED'
        }
      );
      
      // Verify remote process groups set to STOPPED (not NOT_TRANSMITTING)
      expect(mockApiRequest).toHaveBeenNthCalledWith(
        3,
        `/nifi-api/remote-process-groups/process-group/${processGroupId}/run-status`,
        'PUT',
        {
          disconnectedNodeAcknowledged: false,
          state: 'STOPPED'
        }
      );

      expect(result).toEqual(mockProcessGroupResponse);
      expect(console.log).toHaveBeenCalledWith('Stopping process group flow:', processGroupId);
      expect(console.log).toHaveBeenCalledWith('Process group stopped and refreshed successfully');
    });

    it('should handle authentication failure', async () => {
      const authError = new Error('Authentication failed');
      mockApiRequest.mockRejectedValueOnce(authError);

      await expect(
        nifiApiService.stopProcessGroup(processGroupId)
      ).rejects.toThrow('Authentication failed');

      expect(mockApiRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle flow state change failure', async () => {
      const flowError = new Error('Flow stop failed');
      mockApiRequest
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(flowError);

      await expect(
        nifiApiService.stopProcessGroup(processGroupId)
      ).rejects.toThrow('Flow stop failed');

      expect(mockApiRequest).toHaveBeenCalledTimes(2);
    });

    it('should log all stop operation steps', async () => {
      mockApiRequest
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(mockProcessGroupResponse);

      await nifiApiService.stopProcessGroup(processGroupId);

      expect(console.log).toHaveBeenCalledWith('Stopping process group flow:', processGroupId);
      expect(console.log).toHaveBeenCalledWith('Process group flow stopped successfully');
      expect(console.log).toHaveBeenCalledWith('Stopping remote process groups:', processGroupId);
      expect(console.log).toHaveBeenCalledWith('Remote process groups stopped successfully');
    });
  });

  describe('enableProcessGroup', () => {
    const processGroupId = 'pg-enable-123';
    const mockProcessGroupResponse = {
      id: processGroupId,
      component: {
        name: 'Test Group',
        state: 'ENABLED'
      }
    };

    it('should successfully enable a process group', async () => {
      mockApiRequest
        .mockResolvedValueOnce(undefined) // authenticate
        .mockResolvedValueOnce({}) // flow PUT
        .mockResolvedValueOnce(mockProcessGroupResponse); // getProcessGroup

      const result = await nifiApiService.enableProcessGroup(processGroupId);

      expect(mockApiRequest).toHaveBeenCalledTimes(3);
      
      // Verify enable call
      expect(mockApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/flow/process-groups/${processGroupId}`,
        'PUT',
        {
          id: processGroupId,
          disconnectedNodeAcknowledged: false,
          state: 'ENABLED'
        }
      );

      expect(result).toEqual(mockProcessGroupResponse);
      expect(console.log).toHaveBeenCalledWith('Enabling process group flow:', processGroupId);
      expect(console.log).toHaveBeenCalledWith('Process group flow enabled successfully');
    });

    it('should handle authentication failure', async () => {
      const authError = new Error('Auth failed');
      mockApiRequest.mockRejectedValueOnce(authError);

      await expect(
        nifiApiService.enableProcessGroup(processGroupId)
      ).rejects.toThrow('Auth failed');
    });

    it('should handle enable operation failure', async () => {
      const enableError = new Error('Enable failed');
      mockApiRequest
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(enableError);

      await expect(
        nifiApiService.enableProcessGroup(processGroupId)
      ).rejects.toThrow('Enable failed');
    });

    it('should handle getProcessGroup failure after enable', async () => {
      const getError = new Error('Get failed');
      mockApiRequest
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(getError);

      await expect(
        nifiApiService.enableProcessGroup(processGroupId)
      ).rejects.toThrow('Get failed');
    });

    it('should log request URL during enable', async () => {
      mockApiRequest
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(mockProcessGroupResponse);

      await nifiApiService.enableProcessGroup(processGroupId);

      expect(console.log).toHaveBeenCalledWith(
        'Request URL:',
        `/nifi-api/flow/process-groups/${processGroupId}`
      );
    });
  });

  describe('disableProcessGroup', () => {
    const processGroupId = 'pg-disable-123';
    const mockProcessGroupResponse = {
      id: processGroupId,
      component: {
        name: 'Test Group',
        state: 'DISABLED'
      }
    };

    it('should successfully disable a process group', async () => {
      mockApiRequest
        .mockResolvedValueOnce(undefined) // authenticate
        .mockResolvedValueOnce({}) // flow PUT
        .mockResolvedValueOnce(mockProcessGroupResponse); // getProcessGroup

      const result = await nifiApiService.disableProcessGroup(processGroupId);

      expect(mockApiRequest).toHaveBeenCalledTimes(3);
      
      // Verify disable call
      expect(mockApiRequest).toHaveBeenNthCalledWith(
        2,
        `/nifi-api/flow/process-groups/${processGroupId}`,
        'PUT',
        {
          id: processGroupId,
          disconnectedNodeAcknowledged: false,
          state: 'DISABLED'
        }
      );

      expect(result).toEqual(mockProcessGroupResponse);
      expect(console.log).toHaveBeenCalledWith('Disabling process group flow:', processGroupId);
      expect(console.log).toHaveBeenCalledWith('Process group disabled and refreshed successfully');
    });

    it('should handle authentication failure', async () => {
      const authError = new Error('Auth failed');
      mockApiRequest.mockRejectedValueOnce(authError);

      await expect(
        nifiApiService.disableProcessGroup(processGroupId)
      ).rejects.toThrow('Auth failed');
    });

    it('should handle disable operation failure', async () => {
      const disableError = new Error('Disable failed');
      mockApiRequest
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(disableError);

      await expect(
        nifiApiService.disableProcessGroup(processGroupId)
      ).rejects.toThrow('Disable failed');
    });

    it('should handle getProcessGroup failure after disable', async () => {
      const getError = new Error('Get failed');
      mockApiRequest
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(getError);

      await expect(
        nifiApiService.disableProcessGroup(processGroupId)
      ).rejects.toThrow('Get failed');
    });

    it('should log all disable operation steps', async () => {
      mockApiRequest
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(mockProcessGroupResponse);

      await nifiApiService.disableProcessGroup(processGroupId);

      expect(console.log).toHaveBeenCalledWith('Disabling process group flow:', processGroupId);
      expect(console.log).toHaveBeenCalledWith('Request URL:', `/nifi-api/flow/process-groups/${processGroupId}`);
      expect(console.log).toHaveBeenCalledWith('Process group flow disabled successfully');
    });
  });

  describe('Error handling across all operations', () => {
    it('should properly propagate errors from pasteProcessGroup', async () => {
      const error = new Error('Network error');
      mockApiRequest.mockRejectedValueOnce(error);

      await expect(
        nifiApiService.pasteProcessGroup('parent-123', {})
      ).rejects.toThrow('Network error');
    });

    it('should properly propagate errors from startProcessGroup', async () => {
      const error = new Error('Start error');
      mockApiRequest.mockRejectedValueOnce(error);

      await expect(
        nifiApiService.startProcessGroup('pg-123')
      ).rejects.toThrow('Start error');
    });

    it('should properly propagate errors from stopProcessGroup', async () => {
      const error = new Error('Stop error');
      mockApiRequest.mockRejectedValueOnce(error);

      await expect(
        nifiApiService.stopProcessGroup('pg-123')
      ).rejects.toThrow('Stop error');
    });

    it('should properly propagate errors from enableProcessGroup', async () => {
      const error = new Error('Enable error');
      mockApiRequest.mockRejectedValueOnce(error);

      await expect(
        nifiApiService.enableProcessGroup('pg-123')
      ).rejects.toThrow('Enable error');
    });

    it('should properly propagate errors from disableProcessGroup', async () => {
      const error = new Error('Disable error');
      mockApiRequest.mockRejectedValueOnce(error);

      await expect(
        nifiApiService.disableProcessGroup('pg-123')
      ).rejects.toThrow('Disable error');
    });
  });
});

