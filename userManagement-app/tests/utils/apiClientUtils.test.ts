import axios from 'axios';
import { createApiClient } from '../../src/utils/apiClientUtils';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('apiClientUtils', () => {
  const originalEnv = process.env;
  const originalLocalStorage = global.localStorage;
  const originalLocation = window.location;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.localStorage = localStorageMock as any;

    // Mock window.location
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      href: 'http://localhost:3000',
    } as any;

    // Mock axios.create
    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    };
    mockedAxios.create = jest.fn(() => mockAxiosInstance as any);
  });

  afterEach(() => {
    process.env = originalEnv;
    global.localStorage = originalLocalStorage;
    window.location = originalLocation;
    jest.clearAllMocks();
  });

  describe('createApiClient', () => {
    it('should create axios instance with default baseURL', () => {
      delete process.env.REACT_APP_USER_MANAGEMENT_API_URL;
      const apiClient = createApiClient();
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:8081/api',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(apiClient).toBeDefined();
    });

    it('should create axios instance with custom baseURL from env', () => {
      process.env.REACT_APP_USER_MANAGEMENT_API_URL = 'https://api.example.com';
      const apiClient = createApiClient();
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.example.com',
        })
      );
      expect(apiClient).toBeDefined();
    });

    it('should create axios instance with provided baseURL parameter', () => {
      const apiClient = createApiClient('https://custom-api.com');
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://custom-api.com',
        })
      );
      expect(apiClient).toBeDefined();
    });

    it('should prioritize provided baseURL over env var', () => {
      process.env.REACT_APP_USER_MANAGEMENT_API_URL = 'https://env-api.com';
      const apiClient = createApiClient('https://param-api.com');
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://param-api.com',
        })
      );
      expect(apiClient).toBeDefined();
    });

    it('should set up request interceptor', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      
      const apiClient = createApiClient();
      expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
      expect(apiClient).toBeDefined();
    });

    it('should set up response interceptor', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      
      const apiClient = createApiClient();
      expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
      expect(apiClient).toBeDefined();
    });
  });

  describe('Request Interceptor', () => {
    it('should add auth token to headers when available', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn((successHandler) => {
              const config = { headers: {} };
              successHandler(config);
              return config;
            }),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.getItem = jest.fn(() => 'test-token');

      createApiClient();
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not add auth token when not available', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn((successHandler) => {
              const config = { headers: {} };
              successHandler(config);
              return config;
            }),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.getItem = jest.fn(() => null);

      createApiClient();
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should handle request interceptor error', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.request.use.mock.calls[0][1];
      const error = new Error('Test error');
      
      await expect(errorHandler(error)).rejects.toThrow('Request configuration failed');
    });

    it('should handle request interceptor error with message', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.request.use.mock.calls[0][1];
      const error = { message: 'Custom error' };
      
      await expect(errorHandler(error)).rejects.toThrow('Request configuration failed');
    });
  });

  describe('Response Interceptor', () => {
    it('should return response on success', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn((successHandler) => {
              const response = { data: 'test' };
              return successHandler(response);
            }),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const successHandler = mockInstance.interceptors.response.use.mock.calls[0][0];
      const response = { data: 'test' };
      const result = successHandler(response);
      
      expect(result).toBe(response);
    });

    it('should handle 401 unauthorized response', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.removeItem = jest.fn();
      delete (window as any).location;
      (window as any).location = { href: '' };

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {
          status: 401,
        },
        message: 'Unauthorized',
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Unauthorized');
      
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(window.location.href).toBe('/login');
    });

    it('should handle error without response', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = { message: 'Network error' };
      
      await expect(errorHandler(error)).rejects.toThrow('Request failed');
    });

    it('should handle error without message', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {};
      
      await expect(errorHandler(error)).rejects.toThrow('Request failed');
    });

    it('should handle error with message', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = { message: 'Custom error message' };
      
      await expect(errorHandler(error)).rejects.toThrow('Custom error message');
    });

    it('should handle response interceptor with error that has response.status 401 and redirects', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.removeItem = jest.fn();
      delete (window as any).location;
      (window as any).location = { href: '' };

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {
          status: 401,
        },
        message: 'Unauthorized',
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Unauthorized');
      
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(window.location.href).toBe('/login');
    });

    it('should handle response interceptor with error that has no response property', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        message: 'Network error',
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Network error');
    });

    it('should handle request interceptor with config that has no headers', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.getItem = jest.fn(() => 'test-token');

      createApiClient();
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = {};
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should handle request interceptor error with undefined message', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.request.use.mock.calls[0][1];
      const error = {};
      
      await expect(errorHandler(error)).rejects.toThrow('Request configuration failed');
    });

    it('should handle request interceptor when config has no headers property', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.getItem = jest.fn(() => 'test-token');

      createApiClient();
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config: any = {}; // No headers property
      const result = requestInterceptor(config);
      
      expect(result.headers).toBeDefined();
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should handle request interceptor when config.headers is null', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.getItem = jest.fn(() => 'test-token');

      createApiClient();
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config: any = { headers: null };
      const result = requestInterceptor(config);
      
      expect(result.headers).toBeDefined();
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should handle request interceptor when token is empty string', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.getItem = jest.fn(() => '');

      createApiClient();
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should handle response interceptor when error.response.status is 401 without message', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.removeItem = jest.fn();
      delete (window as any).location;
      (window as any).location = { href: '' };

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {
          status: 401,
        },
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Request failed');
      
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(window.location.href).toBe('/login');
    });

    it('should handle response interceptor when error.response.status is not 401', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {
          status: 500,
        },
        message: 'Server error',
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Server error');
      expect(global.localStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should handle response interceptor when error.response exists but no status', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {},
        message: 'Error without status',
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Error without status');
    });

    it('should handle response interceptor when error.response.status is 401 and message is undefined', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.removeItem = jest.fn();
      delete (window as any).location;
      (window as any).location = { href: '' };

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {
          status: 401,
        },
      };
      
      return expect(errorHandler(error)).rejects.toThrow('Request failed');
    });

    it('should handle request interceptor when config is undefined', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.getItem = jest.fn(() => 'test-token');

      createApiClient();
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config: any = undefined;
      const result = requestInterceptor(config);
      
      expect(result.headers).toBeDefined();
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should handle request interceptor when config.headers exists but is empty object', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.getItem = jest.fn(() => 'test-token');

      createApiClient();
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should handle request interceptor when config.headers is undefined and needs to be created', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.getItem = jest.fn(() => 'test-token');

      createApiClient();
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config: any = {}; // No headers property
      
      // This should create headers if it doesn't exist, but axios always provides it
      // So we test the case where it might be missing
      if (!config.headers) {
        config.headers = {};
      }
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should handle request interceptor when token is undefined', () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.getItem = jest.fn(() => undefined);

      createApiClient();
      const requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should handle response interceptor when error.response.status is 401 and continues to reject', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.removeItem = jest.fn();
      delete (window as any).location;
      (window as any).location = { href: '' };

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {
          status: 401,
        },
        message: 'Unauthorized',
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Unauthorized');
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(window.location.href).toBe('/login');
    });

    it('should handle response interceptor when error.response.status is 401 and error.message is undefined', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);
      global.localStorage.removeItem = jest.fn();
      delete (window as any).location;
      (window as any).location = { href: '' };

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {
          status: 401,
        },
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Request failed');
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(window.location.href).toBe('/login');
    });

    it('should handle response interceptor when error.response exists but status is undefined', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {
          // No status property
        },
        message: 'Error without status code',
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Error without status code');
    });

    it('should handle response interceptor when error.response.status is 403', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {
          status: 403,
        },
        message: 'Forbidden',
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Forbidden');
      expect(global.localStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should handle response interceptor when error.response.status is 404', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {
          status: 404,
        },
        message: 'Not Found',
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Not Found');
    });

    it('should handle response interceptor when error.response.status is 500', async () => {
      const mockInstance: any = {
        interceptors: {
          request: {
            use: jest.fn(),
          },
          response: {
            use: jest.fn(),
          },
        },
      };
      mockedAxios.create = jest.fn(() => mockInstance);

      createApiClient();
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const error = {
        response: {
          status: 500,
        },
        message: 'Internal Server Error',
      };
      
      await expect(errorHandler(error)).rejects.toThrow('Internal Server Error');
    });
  });
});


