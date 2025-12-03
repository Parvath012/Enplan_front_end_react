import { getProcessGroupId, createServiceSelectHandler } from '../../../src/components/common/browserServiceUtils';
import { nifiApiService } from '../../../src/api/nifi/nifiApiService';
import { userProcessGroupMappingService } from '../../../src/services/userProcessGroupMapping';

// Mock dependencies
jest.mock('../../../src/api/nifi/nifiApiService');
jest.mock('../../../src/services/userProcessGroupMapping');

describe('browserServiceUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProcessGroupId', () => {
    it('should return provided parentGroupId when given', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const parentGroupId = 'test-parent-id';
      
      const result = await getProcessGroupId(parentGroupId);
      
      expect(result).toBe(parentGroupId);
      expect(consoleLogSpy).toHaveBeenCalledWith('Using provided parent process group ID:', parentGroupId);
      
      consoleLogSpy.mockRestore();
    });

    it('should return root process group ID when parentGroupId is not provided', async () => {
      const rootId = 'root-process-group-id';
      (nifiApiService.getRootProcessGroupId as jest.Mock).mockResolvedValue(rootId);
      
      const result = await getProcessGroupId();
      
      expect(result).toBe(rootId);
      expect(nifiApiService.getRootProcessGroupId).toHaveBeenCalledWith(undefined);
    });

    it('should retry with force flag when first attempt fails', async () => {
      const rootId = 'root-process-group-id';
      (nifiApiService.getRootProcessGroupId as jest.Mock)
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce(rootId);
      
      const result = await getProcessGroupId();
      
      expect(result).toBe(rootId);
      expect(nifiApiService.getRootProcessGroupId).toHaveBeenCalledTimes(2);
      expect(nifiApiService.getRootProcessGroupId).toHaveBeenNthCalledWith(1, undefined);
      expect(nifiApiService.getRootProcessGroupId).toHaveBeenNthCalledWith(2, true);
    });

    it('should fallback to userProcessGroupMappingService when both attempts fail', async () => {
      const defaultId = 'default-process-group-id';
      (nifiApiService.getRootProcessGroupId as jest.Mock)
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'));
      (userProcessGroupMappingService.getDefaultProcessGroupId as jest.Mock).mockResolvedValue(defaultId);
      
      const result = await getProcessGroupId();
      
      expect(result).toBe(defaultId);
      expect(userProcessGroupMappingService.getDefaultProcessGroupId).toHaveBeenCalled();
    });

    it('should throw error when all fallbacks fail', async () => {
      (nifiApiService.getRootProcessGroupId as jest.Mock)
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'));
      (userProcessGroupMappingService.getDefaultProcessGroupId as jest.Mock)
        .mockRejectedValueOnce(new Error('Fallback failed'));
      
      await expect(getProcessGroupId()).rejects.toThrow(
        'Unable to fetch process group ID. Please ensure NiFi is accessible.'
      );
    });
  });

  describe('createServiceSelectHandler', () => {
    it('should create a handler that sets selected item', () => {
      const setSelectedItem = jest.fn();
      const handler = createServiceSelectHandler(setSelectedItem);
      
      const service = {
        id: 'test-id',
        type: 'TestType',
        fullType: 'com.example.TestType',
        version: '1.0.0',
        tags: ['tag1'],
        description: 'Test description',
        restricted: false,
        bundle: { group: 'group', artifact: 'artifact', version: '1.0.0' }
      };
      
      handler(service);
      
      expect(setSelectedItem).toHaveBeenCalledWith({
        id: 'test-id',
        type: 'TestType',
        fullType: 'com.example.TestType',
        version: '1.0.0',
        tags: ['tag1'],
        description: 'Test description',
        restricted: false,
        bundle: { group: 'group', artifact: 'artifact', version: '1.0.0' }
      });
    });

    it('should not call setSelectedItem when service has no id', () => {
      const setSelectedItem = jest.fn();
      const handler = createServiceSelectHandler(setSelectedItem);
      
      handler({} as any);
      
      expect(setSelectedItem).not.toHaveBeenCalled();
    });

    it('should use default values when fields are missing', () => {
      const setSelectedItem = jest.fn();
      const handler = createServiceSelectHandler(setSelectedItem);
      
      const service = {
        id: 'test-id'
      };
      
      handler(service as any);
      
      expect(setSelectedItem).toHaveBeenCalledWith({
        id: 'test-id',
        type: '',
        fullType: '',
        version: '2.3.0',
        tags: [],
        description: '',
        restricted: false,
        bundle: undefined
      });
    });

    it('should use type as fallback for fullType when fullType is missing', () => {
      const setSelectedItem = jest.fn();
      const handler = createServiceSelectHandler(setSelectedItem);
      
      const service = {
        id: 'test-id',
        type: 'TestType'
      };
      
      handler(service as any);
      
      expect(setSelectedItem).toHaveBeenCalledWith(
        expect.objectContaining({
          fullType: 'TestType'
        })
      );
    });

    it('should handle null/undefined service gracefully', () => {
      const setSelectedItem = jest.fn();
      const handler = createServiceSelectHandler(setSelectedItem);
      
      handler(null as any);
      handler(undefined as any);
      
      expect(setSelectedItem).not.toHaveBeenCalled();
    });
  });
});

