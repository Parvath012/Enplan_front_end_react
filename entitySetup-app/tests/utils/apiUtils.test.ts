import { saveDataApiCall, getApiBaseUrl, makeApiCall } from '../../src/utils/apiUtils';

// Mock fetch for makeApiCall tests
global.fetch = jest.fn();

describe('apiUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.REACT_APP_DATA_API_URL;
  });

  describe('saveDataApiCall', () => {
    it('should return success response with provided data', async () => {
      const testData = { id: 1, name: 'test' };
      const result = await saveDataApiCall(testData);
      
      expect(result).toEqual({
        success: true,
        data: testData
      });
    });

    it('should handle null data', async () => {
      const result = await saveDataApiCall(null);
      
      expect(result).toEqual({
        success: true,
        data: null
      });
    });

    it('should handle undefined data', async () => {
      const result = await saveDataApiCall(undefined);
      
      expect(result).toEqual({
        success: true,
        data: undefined
      });
    });
  });

  describe('getApiBaseUrl', () => {
    it('should return default URL when environment variable is not set', () => {
      const result = getApiBaseUrl();
      expect(result).toBe('http://localhost:50005');
    });

    it('should return environment variable URL when set', () => {
      process.env.REACT_APP_DATA_API_URL = 'http://test-api.com';
      const result = getApiBaseUrl();
      expect(result).toBe('http://test-api.com');
    });

    it('should return environment variable URL when it is empty string', () => {
      process.env.REACT_APP_DATA_API_URL = '';
      const result = getApiBaseUrl();
      expect(result).toBe('');
    });

    it('should return string "null" when environment variable is null', () => {
      process.env.REACT_APP_DATA_API_URL = null as any;
      const result = getApiBaseUrl();
      expect(result).toBe('null');
    });

    it('should return string "undefined" when environment variable is undefined', () => {
      process.env.REACT_APP_DATA_API_URL = undefined;
      const result = getApiBaseUrl();
      expect(result).toBe('undefined');
    });
  });

  describe('makeApiCall', () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should make successful API call with default options', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await makeApiCall('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:50005/test-endpoint',
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should make API call with custom options', async () => {
      const mockResponse = { data: 'test' };
      const customOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await makeApiCall('/test-endpoint', customOptions);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:50005/test-endpoint',
        customOptions
      );
      expect(result).toEqual(mockResponse);
    });

    it('should use custom base URL from environment variable', async () => {
      process.env.REACT_APP_DATA_API_URL = 'http://custom-api.com';
      const mockResponse = { data: 'test' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await makeApiCall('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://custom-api.com/test-endpoint',
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('should throw error when API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(makeApiCall('/test-endpoint')).rejects.toThrow(
        'API call failed: 404'
      );
    });

    it('should throw error when fetch fails', async () => {
      const fetchError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(fetchError);

      await expect(makeApiCall('/test-endpoint')).rejects.toThrow('Network error');
    });

    it('should handle response with no JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('No JSON'); },
      } as Response);

      await expect(makeApiCall('/test-endpoint')).rejects.toThrow('No JSON');
    });
  });
});
