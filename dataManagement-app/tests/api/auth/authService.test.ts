import axios from 'axios';
import { authenticate } from '../../../src/api/auth/authService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('authService', () => {
  const originalEnv = process.env.REACT_APP_PROXY_URL;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment variable
    if (originalEnv !== undefined) {
      process.env.REACT_APP_PROXY_URL = originalEnv;
    } else {
      delete process.env.REACT_APP_PROXY_URL;
    }
  });

  it('should authenticate successfully and return a token', async () => {
    // Mock successful response
    const mockToken = 'test-jwt-token-12345';
    mockedAxios.get.mockResolvedValueOnce({
      data: { token: mockToken }
    });

    // Call the authenticate function
    const result = await authenticate();

    // Assertions
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:4001/api/authenticate', 
      { withCredentials: true }
    );
    expect(result).toBe(mockToken);
  });

  it('should handle authentication failure', async () => {
    // Mock error response
    const mockError = new Error('Authentication failed');
    mockedAxios.get.mockRejectedValueOnce(mockError);
    
    // Mock console.error to avoid cluttering test output
    console.error = jest.fn();

    // Call the authenticate function and expect it to throw
    await expect(authenticate()).rejects.toThrow('Authentication failed');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Frontend auth failed', mockError);
  });

  it('should handle network errors', async () => {
    // Mock network error
    const mockError = new Error('Network Error');
    mockedAxios.get.mockRejectedValueOnce(mockError);
    
    // Mock console.error
    console.error = jest.fn();

    // Call the authenticate function and expect it to throw
    await expect(authenticate()).rejects.toThrow('Network Error');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Frontend auth failed', mockError);
  });

  it('should handle malformed response data', async () => {
    // Mock response with missing token property
    mockedAxios.get.mockResolvedValueOnce({
      data: { message: 'Success but no token' }
    });

    // Call the authenticate function
    const result = await authenticate();

    // Since the function doesn't specifically check for token existence
    // it will return undefined without throwing
    expect(result).toBeUndefined();
  });

  it('should handle various error objects', async () => {
    // Mock error response with different error format
    const mockError = { response: { status: 401, data: { message: 'Unauthorized' } } };
    mockedAxios.get.mockRejectedValueOnce(mockError);
    
    // Mock console.error
    console.error = jest.fn();

    // Call the authenticate function and expect it to throw
    await expect(authenticate()).rejects.toEqual(mockError);
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Frontend auth failed', mockError);
  });

  describe('Environment variable handling (line 4)', () => {
    it('should use default PROXY_URL when REACT_APP_PROXY_URL is undefined', async () => {
      // Remove the environment variable to test the default fallback
      delete process.env.REACT_APP_PROXY_URL;

      // Need to reload the module to apply the environment change
      jest.resetModules();
      
      // Re-mock axios after module reset
      jest.doMock('axios');
      const axios = require('axios');
      const mockAxios = axios as jest.Mocked<typeof axios>;
      
      const { authenticate: freshAuthenticate } = require('../../../src/api/auth/authService');

      // Mock successful response
      const mockToken = 'test-token-with-default-url';
      mockAxios.get = jest.fn().mockResolvedValueOnce({
        data: { token: mockToken }
      });

      // Call the authenticate function
      const result = await freshAuthenticate();

      // Verify it used the default URL (line 4 - right side of ??)
      expect(mockAxios.get).toHaveBeenCalledWith(
        'http://localhost:4001/api/authenticate',
        { withCredentials: true }
      );
      expect(result).toBe(mockToken);
    });

    it('should use custom PROXY_URL when REACT_APP_PROXY_URL is set', async () => {
      // Set a custom proxy URL
      process.env.REACT_APP_PROXY_URL = 'http://custom-proxy:5000';

      // Need to reload the module to apply the environment change
      jest.resetModules();
      
      // Re-mock axios after module reset
      jest.doMock('axios');
      const axios = require('axios');
      const mockAxios = axios as jest.Mocked<typeof axios>;
      
      const { authenticate: freshAuthenticate } = require('../../../src/api/auth/authService');

      // Mock successful response
      const mockToken = 'test-token-with-custom-url';
      mockAxios.get = jest.fn().mockResolvedValueOnce({
        data: { token: mockToken }
      });

      // Call the authenticate function
      const result = await freshAuthenticate();

      // Verify it used the custom URL (line 4 - left side of ??)
      expect(mockAxios.get).toHaveBeenCalledWith(
        'http://custom-proxy:5000/api/authenticate',
        { withCredentials: true }
      );
      expect(result).toBe(mockToken);
    });

    it('should use default PROXY_URL when REACT_APP_PROXY_URL is explicitly deleted', async () => {
      // Explicitly delete the environment variable (simulating null/undefined)
      delete process.env.REACT_APP_PROXY_URL;

      // Need to reload the module to apply the environment change
      jest.resetModules();
      
      // Re-mock axios after module reset
      jest.doMock('axios');
      const axios = require('axios');
      const mockAxios = axios as jest.Mocked<typeof axios>;
      
      const { authenticate: freshAuthenticate } = require('../../../src/api/auth/authService');

      // Mock successful response
      const mockToken = 'test-token-when-deleted';
      mockAxios.get = jest.fn().mockResolvedValueOnce({
        data: { token: mockToken }
      });

      // Call the authenticate function
      const result = await freshAuthenticate();

      // Verify it used the default URL (nullish coalescing treats undefined as nullish)
      expect(mockAxios.get).toHaveBeenCalledWith(
        'http://localhost:4001/api/authenticate',
        { withCredentials: true }
      );
      expect(result).toBe(mockToken);
    });

    it('should use empty string PROXY_URL when REACT_APP_PROXY_URL is empty string', async () => {
      // Set the environment variable to empty string (which is NOT nullish)
      process.env.REACT_APP_PROXY_URL = '';

      // Need to reload the module to apply the environment change
      jest.resetModules();
      
      // Re-mock axios after module reset
      jest.doMock('axios');
      const axios = require('axios');
      const mockAxios = axios as jest.Mocked<typeof axios>;
      
      const { authenticate: freshAuthenticate } = require('../../../src/api/auth/authService');

      // Mock successful response
      const mockToken = 'test-token-with-empty-url';
      mockAxios.get = jest.fn().mockResolvedValueOnce({
        data: { token: mockToken }
      });

      // Call the authenticate function
      const result = await freshAuthenticate();

      // Verify it used the empty string (nullish coalescing doesn't treat empty string as nullish)
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/authenticate',
        { withCredentials: true }
      );
      expect(result).toBe(mockToken);
    });
  });
});
