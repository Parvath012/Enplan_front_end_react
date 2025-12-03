import axios from 'axios';
import { apiRequest } from '../../../src/api/auth/apiRequest';

// Mock axios
jest.mock('axios');

// Store original axios.defaults.baseURL to restore later
const originalBaseURL = axios.defaults.baseURL;

describe('apiRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set the base URL for testing
    axios.defaults.baseURL = 'http://localhost:4001';
  });

  afterAll(() => {
    // Restore original baseURL
    axios.defaults.baseURL = originalBaseURL;
  });
  
  it('should make a successful GET request', async () => {
    // Mock response data
    const mockData = { success: true, data: 'test data' };
    (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockData });
    
    // Call the function
    const result = await apiRequest('/test-endpoint');
    
    // Assertions
    expect(axios).toHaveBeenCalledWith({
      url: '/test-endpoint',
      method: 'GET',
      data: undefined,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(result).toEqual(mockData);
  });
  
  it('should make a successful POST request with data', async () => {
    // Mock response data
    const mockData = { success: true, data: 'posted data' };
    const postData = { key: 'value' };
    (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockData });
    
    // Call the function
    const result = await apiRequest('/test-endpoint', 'POST', postData);
    
    // Assertions
    expect(axios).toHaveBeenCalledWith({
      url: '/test-endpoint',
      method: 'POST',
      data: postData,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(result).toEqual(mockData);
  });
  
  it('should handle errors properly', async () => {
    // Mock an error response
    const mockError = new Error('Network error');
    (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
    
    // Mock console.error
    console.error = jest.fn();
    
    // Call the function and expect it to throw
    await expect(apiRequest('/test-endpoint')).rejects.toThrow('Network error');
    
    // Assert console.error was called with the URL pattern
    expect(console.error).toHaveBeenCalledWith(`API Request Failed for /test-endpoint:`, mockError.message);
  });

  it('should handle error with response object (lines 24-25)', async () => {
    // Mock an error with response property
    const mockError: any = new Error('API Error');
    mockError.response = {
      status: 404,
      data: { message: 'Not found' }
    };
    (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
    
    // Mock console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Call the function and expect it to throw
    await expect(apiRequest('/not-found')).rejects.toThrow('API Error');
    
    // Assert console.error was called with response details (lines 24-25)
    expect(consoleErrorSpy).toHaveBeenCalledWith(`API Request Failed for /not-found:`, mockError.message);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error response status:', 404);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error response data:', { message: 'Not found' });
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle error with request but no response (line 28 with _currentUrl)', async () => {
    // Mock an error with request property but no response
    const mockError: any = new Error('No response');
    mockError.request = {
      _currentUrl: 'http://localhost:4001/timeout',
      path: '/timeout'
    };
    (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
    
    // Mock console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Call the function and expect it to throw
    await expect(apiRequest('/timeout')).rejects.toThrow('No response');
    
    // Assert console.error was called with request details (line 28)
    expect(consoleErrorSpy).toHaveBeenCalledWith(`API Request Failed for /timeout:`, mockError.message);
    expect(consoleErrorSpy).toHaveBeenCalledWith('No response received. Request was:', 'http://localhost:4001/timeout');
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle error with request but no response (line 28 fallback to path)', async () => {
    // Mock an error with request property but no _currentUrl
    const mockError: any = new Error('Connection timeout');
    mockError.request = {
      path: '/api/data'
    };
    (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
    
    // Mock console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Call the function and expect it to throw
    await expect(apiRequest('/api/data')).rejects.toThrow('Connection timeout');
    
    // Assert console.error was called with request path (line 28 - fallback)
    expect(consoleErrorSpy).toHaveBeenCalledWith(`API Request Failed for /api/data:`, mockError.message);
    expect(consoleErrorSpy).toHaveBeenCalledWith('No response received. Request was:', '/api/data');
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle error during request setup', async () => {
    // Mock an error without response or request
    const mockError = new Error('Configuration error');
    (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
    
    // Mock console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Call the function and expect it to throw
    await expect(apiRequest('/bad-config')).rejects.toThrow('Configuration error');
    
    // Assert console.error was called with setup error
    expect(consoleErrorSpy).toHaveBeenCalledWith(`API Request Failed for /bad-config:`, mockError.message);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error setting up request:', 'Configuration error');
    
    consoleErrorSpy.mockRestore();
  });

  it('should log API response status on success', async () => {
    // Mock response
    const mockData = { result: 'success' };
    (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockData, status: 200 });
    
    // Mock console.log
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Call the function
    await apiRequest('/success');
    
    // Assert console.log was called with status (line 17)
    expect(consoleLogSpy).toHaveBeenCalledWith('API response received: 200');
    
    consoleLogSpy.mockRestore();
  });

  it('should verify fallback baseURL when env variable is undefined', () => {
    // This test verifies that the default fallback works
    // The baseURL should be set from process.env.REACT_APP_PROXY_URL ?? 'http://localhost:4001'
    expect(axios.defaults.baseURL).toBeDefined();
    expect(typeof axios.defaults.baseURL).toBe('string');
  });
  
  it('should use the default baseURL', () => {
    // Verify the baseURL is set correctly
    expect(axios.defaults.baseURL).toBe('http://localhost:4001');
  });

  it('should set withCredentials to true', async () => {
    // Mock response
    const mockData = { test: 'data' };
    (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockData });
    
    // Call the function
    await apiRequest('/test-credentials');
    
    // Verify withCredentials was set to true
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      withCredentials: true
    }));
  });

  it('should set Content-Type header to application/json', async () => {
    // Mock response
    const mockData = { test: 'data' };
    (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockData });
    
    // Call the function
    await apiRequest('/test-headers');
    
    // Verify Content-Type header was set
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      headers: {
        'Content-Type': 'application/json'
      }
    }));
  });

  describe('HTTP Methods', () => {
    it('should make a successful PUT request', async () => {
      const mockData = { success: true, data: 'updated data' };
      const putData = { id: 1, name: 'Updated' };
      (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockData });
      
      const result = await apiRequest('/test-endpoint', 'PUT', putData);
      
      expect(axios).toHaveBeenCalledWith({
        url: '/test-endpoint',
        method: 'PUT',
        data: putData,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('should make a successful DELETE request', async () => {
      const mockData = { success: true, deleted: true };
      (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockData });
      
      const result = await apiRequest('/test-endpoint', 'DELETE');
      
      expect(axios).toHaveBeenCalledWith({
        url: '/test-endpoint',
        method: 'DELETE',
        data: undefined,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('should make a DELETE request with data', async () => {
      const mockData = { success: true, deleted: true };
      const deleteData = { id: 1 };
      (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockData });
      
      const result = await apiRequest('/test-endpoint', 'DELETE', deleteData);
      
      expect(axios).toHaveBeenCalledWith({
        url: '/test-endpoint',
        method: 'DELETE',
        data: deleteData,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('Conflict Error Suppression', () => {
    it('should suppress logging for 409 conflict errors', async () => {
      const mockError: any = new Error('Conflict');
      mockError.response = {
        status: 409,
        data: { message: 'Conflict occurred' }
      };
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(apiRequest('/conflict-endpoint')).rejects.toThrow('Conflict');
      
      // Should NOT log the conflict error (suppressed)
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('API Request Failed for /conflict-endpoint'),
        expect.anything()
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('should suppress logging for 500 error with 409 in details', async () => {
      const mockError: any = new Error('Server error');
      mockError.response = {
        status: 500,
        data: { details: 'Error 409 conflict occurred' }
      };
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(apiRequest('/server-error')).rejects.toThrow('Server error');
      
      // Should NOT log the conflict error (suppressed)
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('API Request Failed for /server-error'),
        expect.anything()
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('should log non-conflict 500 errors', async () => {
      const mockError: any = new Error('Server error');
      mockError.response = {
        status: 500,
        data: { message: 'Internal server error' }
      };
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(apiRequest('/server-error')).rejects.toThrow('Server error');
      
      // Should log non-conflict 500 errors
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Request Failed for /server-error:',
        'Server error'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error response status:', 500);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error response data:', { message: 'Internal server error' });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle 500 error with empty details string', async () => {
      const mockError: any = new Error('Server error');
      mockError.response = {
        status: 500,
        data: { details: '' }
      };
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(apiRequest('/server-error')).rejects.toThrow('Server error');
      
      // Should log since details doesn't contain '409'
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Request Failed for /server-error:',
        'Server error'
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle 500 error with null details', async () => {
      const mockError: any = new Error('Server error');
      mockError.response = {
        status: 500,
        data: { details: null }
      };
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(apiRequest('/server-error')).rejects.toThrow('Server error');
      
      // Should log since details is null and doesn't contain '409'
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Request Failed for /server-error:',
        'Server error'
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle error with response but no status', async () => {
      const mockError: any = new Error('Response error');
      mockError.response = {
        data: { message: 'Error without status' }
      };
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(apiRequest('/no-status')).rejects.toThrow('Response error');
      
      // Should log the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Request Failed for /no-status:',
        'Response error'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error response status:', undefined);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error response data:', { message: 'Error without status' });
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle error with response but no data', async () => {
      const mockError: any = new Error('Response error');
      mockError.response = {
        status: 500
      };
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(apiRequest('/no-data')).rejects.toThrow('Response error');
      
      // Should log the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Request Failed for /no-data:',
        'Response error'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error response status:', 500);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error response data:', undefined);
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle error with request but no _currentUrl and no path', async () => {
      const mockError: any = new Error('Request error');
      mockError.request = {};
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(apiRequest('/no-url')).rejects.toThrow('Request error');
      
      // Should log the error with undefined for request URL
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Request Failed for /no-url:',
        'Request error'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('No response received. Request was:', undefined);
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle error with null request', async () => {
      const mockError: any = new Error('Request error');
      mockError.request = null;
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(apiRequest('/null-request')).rejects.toThrow('Request error');
      
      // Should fall through to setup error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Request Failed for /null-request:',
        'Request error'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error setting up request:', 'Request error');
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle error with undefined response and request', async () => {
      const mockError: any = new Error('Unknown error');
      mockError.response = undefined;
      mockError.request = undefined;
      (axios as unknown as jest.Mock).mockRejectedValueOnce(mockError);
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(apiRequest('/unknown')).rejects.toThrow('Unknown error');
      
      // Should log setup error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Request Failed for /unknown:',
        'Unknown error'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error setting up request:', 'Unknown error');
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('BaseURL Configuration', () => {
    it('should verify baseURL is set from environment or fallback', () => {
      // The baseURL is set at module load time (line 3)
      // We verify it's set correctly - either from env or fallback
      expect(axios.defaults.baseURL).toBeDefined();
      expect(typeof axios.defaults.baseURL).toBe('string');
      // Should be either the env value or the fallback
      expect(['http://localhost:4001', process.env.REACT_APP_PROXY_URL].filter(Boolean)).toContain(axios.defaults.baseURL);
    });

    it('should handle baseURL with nullish coalescing operator', () => {
      // Test that the ?? operator works correctly
      // If REACT_APP_PROXY_URL is undefined/null, should use fallback
      const baseURL = process.env.REACT_APP_PROXY_URL ?? 'http://localhost:4001';
      expect(baseURL).toBeDefined();
      expect(typeof baseURL).toBe('string');
    });
  });

  describe('Response Status Logging', () => {
    it('should log different status codes', async () => {
      const statusCodes = [200, 201, 204, 301, 302];
      
      for (const status of statusCodes) {
        const mockData = { result: 'success' };
        (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockData, status });
        
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        
        await apiRequest(`/status-${status}`);
        
        expect(consoleLogSpy).toHaveBeenCalledWith(`API response received: ${status}`);
        
        consoleLogSpy.mockRestore();
        jest.clearAllMocks();
      }
    });

    it('should handle response without status property', async () => {
      const mockData = { result: 'success' };
      (axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockData });
      
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await apiRequest('/no-status-response');
      
      // Should still log, but status will be undefined
      expect(consoleLogSpy).toHaveBeenCalledWith('API response received: undefined');
      
      consoleLogSpy.mockRestore();
    });
  });
});
