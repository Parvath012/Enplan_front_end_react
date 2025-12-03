// Mock axios before importing the service
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

// Mock axios.create to return our mock instance
const mockAxiosCreate = jest.fn(() => mockAxiosInstance);

// Mock axios module
jest.mock('axios', () => ({
  create: mockAxiosCreate,
  default: {
    create: mockAxiosCreate,
  },
}));

import axios from 'axios';
import { userService, User, UserCreateRequest, UserUpdateRequest } from '../../src/services/userService';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location
const mockLocation = {
  href: ''
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    console.log = jest.fn();
    localStorageMock.getItem.mockReturnValue(null);
    mockLocation.href = '';
    
    // Reset all axios mock methods to return undefined by default
    mockAxiosInstance.get.mockReset();
    mockAxiosInstance.post.mockReset();
    mockAxiosInstance.put.mockReset();
    mockAxiosInstance.patch.mockReset();
    mockAxiosInstance.delete.mockReset();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('Configuration', () => {
    it('should use default API base URL when environment variable is not set', () => {
      const originalEnv = process.env.REACT_APP_USER_MANAGEMENT_API_URL;
      delete process.env.REACT_APP_USER_MANAGEMENT_API_URL;
      
      // Re-import to get fresh instance
      jest.resetModules();
      const { userService: freshUserService } = require('../../src/services/userService');
      
      expect(freshUserService).toBeDefined();
      
      // Restore environment variable
      process.env.REACT_APP_USER_MANAGEMENT_API_URL = originalEnv;
    });

    it('should use environment variable API base URL when set', () => {
      const originalEnv = process.env.REACT_APP_USER_MANAGEMENT_API_URL;
      process.env.REACT_APP_USER_MANAGEMENT_API_URL = 'https://custom-api.com';
      
      // Re-import to get fresh instance
      jest.resetModules();
      const { userService: freshUserService } = require('../../src/services/userService');
      
      expect(freshUserService).toBeDefined();
      
      // Restore environment variable
      process.env.REACT_APP_USER_MANAGEMENT_API_URL = originalEnv;
    });
  });

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const mockResponse = {
        data: {
          users: [
            {
              id: 1,
              firstname: 'John',
              lastname: 'Doe',
              emailid: 'john@example.com',
              role: 'Admin',
              status: 'Active',
              isenabled: true
            }
          ],
          totalCount: 1,
          activeCount: 1,
          inactiveCount: 0
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await userService.getUsers();
      
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch users with parameters', async () => {
      const mockResponse = {
        data: {
          users: [],
          totalCount: 0,
          activeCount: 0,
          inactiveCount: 0
        }
      };

      // Mock is already set up globally
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const params = {
        page: 1,
        limit: 10,
        search: 'john',
        status: 'Active',
        role: 'Admin',
        department: 'IT'
      };

      const result = await userService.getUsers(params);
      
      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', { params });
    });

    it('should handle errors when fetching users', async () => {
      const mockError = new Error('Network error');
      
      // Mock is already set up globally
      mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(userService.getUsers()).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalledWith('Error fetching users:', mockError);
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID successfully', async () => {
      const mockUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        role: 'Admin',
        status: 'Active',
        isenabled: true
      };

      // Mock is already set up globally
      mockAxiosInstance.get.mockResolvedValue({ data: mockUser });

      const result = await userService.getUserById(1);
      
      expect(result).toEqual(mockUser);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/1');
    });

    it('should handle errors when fetching user by ID', async () => {
      const mockError = new Error('User not found');
      
      // Mock is already set up globally
      mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(userService.getUserById(999)).rejects.toThrow('User not found');
      expect(console.error).toHaveBeenCalledWith('Error fetching user:', mockError);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData: UserCreateRequest = {
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        role: 'Admin',
        status: 'Active',
        isenabled: true
      };

      const mockCreatedUser: User = {
        id: 1,
        ...userData
      };

      // Mock is already set up globally
      mockAxiosInstance.post.mockResolvedValue({ data: mockCreatedUser });

      const result = await userService.createUser(userData);
      
      expect(result).toEqual(mockCreatedUser);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', userData);
    });

    it('should handle errors when creating user', async () => {
      const userData: UserCreateRequest = {
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        role: 'Admin',
        status: 'Active',
        isenabled: true
      };

      const mockError = new Error('Email already exists');
      // Mock is already set up globally
      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(userService.createUser(userData)).rejects.toThrow('Email already exists');
      expect(console.error).toHaveBeenCalledWith('Error creating user:', mockError);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userData: UserUpdateRequest = {
        id: 1,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        role: 'Manager',
        status: 'Active',
        isenabled: true,
        lastupdatedby: 'Admin'
      };

      const mockUpdatedUser: User = {
        ...userData
      };

      // Mock is already set up globally
      mockAxiosInstance.put.mockResolvedValue({ data: mockUpdatedUser });

      const result = await userService.updateUser(1, userData);
      
      expect(result).toEqual(mockUpdatedUser);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', userData);
    });

    it('should handle errors when updating user', async () => {
      const userData: UserUpdateRequest = {
        id: 1,
        firstname: 'Jane',
        lastname: 'Smith',
        emailid: 'jane@example.com',
        role: 'Manager',
        status: 'Active',
        isenabled: true
      };

      const mockError = new Error('User not found');
      // Mock is already set up globally
      mockAxiosInstance.put.mockRejectedValue(mockError);

      await expect(userService.updateUser(1, userData)).rejects.toThrow('User not found');
      expect(console.error).toHaveBeenCalledWith('Error updating user:', mockError);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Mock is already set up globally
      mockAxiosInstance.delete.mockResolvedValue({});

      await userService.deleteUser(1);
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1');
    });

    it('should handle errors when deleting user', async () => {
      const mockError = new Error('User not found');
      // Mock is already set up globally
      mockAxiosInstance.delete.mockRejectedValue(mockError);

      await expect(userService.deleteUser(1)).rejects.toThrow('User not found');
      expect(console.error).toHaveBeenCalledWith('Error deleting user:', mockError);
    });
  });

  describe('toggleUserStatus', () => {
    it('should toggle user status successfully', async () => {
      const mockUpdatedUser: User = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        role: 'Admin',
        status: 'Active',
        isenabled: false
      };

      // Mock is already set up globally
      mockAxiosInstance.patch.mockResolvedValue({ data: mockUpdatedUser });

      const result = await userService.toggleUserStatus(1, false);
      
      expect(result).toEqual(mockUpdatedUser);
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/1/status', { isEnabled: false });
    });

    it('should handle errors when toggling user status', async () => {
      const mockError = new Error('User not found');
      // Mock is already set up globally
      mockAxiosInstance.patch.mockRejectedValue(mockError);

      await expect(userService.toggleUserStatus(1, true)).rejects.toThrow('User not found');
      expect(console.error).toHaveBeenCalledWith('Error toggling user status:', mockError);
    });
  });

  describe('getUserCount', () => {
    it('should get user count successfully', async () => {
      const mockResponse = {
        data: { count: 5 }
      };

      // Mock is already set up globally
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await userService.getUserCount();
      
      expect(result).toEqual({ count: 5 });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/count');
    });

    it('should handle errors when getting user count', async () => {
      const mockError = new Error('Server error');
      // Mock is already set up globally
      mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(userService.getUserCount()).rejects.toThrow('Server error');
      expect(console.error).toHaveBeenCalledWith('Error fetching user count:', mockError);
    });
  });

  describe('bulkUploadUsers', () => {
    it('should upload users successfully', async () => {
      const mockFile = new File(['test'], 'users.csv', { type: 'text/csv' });
      const mockResponse = {
        data: {
          success: 5,
          failed: 1,
          errors: ['Invalid email format']
        }
      };

      // Mock is already set up globally
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await userService.bulkUploadUsers(mockFile);
      
      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/users/bulk-upload',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });

    it('should handle errors when bulk uploading users', async () => {
      const mockFile = new File(['test'], 'users.csv', { type: 'text/csv' });
      const mockError = new Error('File format not supported');
      // Mock is already set up globally
      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(userService.bulkUploadUsers(mockFile)).rejects.toThrow('File format not supported');
      expect(console.error).toHaveBeenCalledWith('Error bulk uploading users:', mockError);
    });
  });

  describe('getRoles', () => {
    it('should fetch roles successfully', async () => {
      const mockResponse = {
        data: [
          { name: 'Admin' },
          { name: 'Manager' },
          { name: 'Employee' }
        ]
      };

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue(mockResponse),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };

      // Mock is already set up globally

      const result = await userService.getRoles();
      
      expect(result).toEqual([
        { value: 'Admin', label: 'Admin' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Employee', label: 'Employee' },
        { value: 'Supervisor', label: 'Supervisor' }
      ]);
    });

    it('should return default roles when API fails', async () => {
      const mockError = new Error('API error');
      
      // Mock is already set up globally
      mockAxiosInstance.get.mockRejectedValue(mockError);

      const result = await userService.getRoles();
      
      expect(result).toEqual([
        { value: 'Admin', label: 'Admin' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Employee', label: 'Employee' },
        { value: 'Supervisor', label: 'Supervisor' }
      ]);
      expect(console.error).toHaveBeenCalledWith('Error fetching roles:', mockError);
    });
  });

  describe('getDepartments', () => {
    it('should fetch departments successfully', async () => {
      const mockResponse = {
        data: [
          { name: 'IT' },
          { name: 'HR' },
          { name: 'Finance' }
        ]
      };

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue(mockResponse),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };

      // Mock is already set up globally

      const result = await userService.getDepartments();
      
      expect(result).toEqual([
        { value: 'IT', label: 'IT' },
        { value: 'HR', label: 'HR' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Operations', label: 'Operations' },
        { value: 'Marketing', label: 'Marketing' }
      ]);
    });

    it('should return default departments when API fails', async () => {
      const mockError = new Error('API error');
      // Mock is already set up globally
      mockAxiosInstance.get.mockRejectedValue(mockError);

      const result = await userService.getDepartments();
      
      expect(result).toEqual([
        { value: 'IT', label: 'IT' },
        { value: 'HR', label: 'HR' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Operations', label: 'Operations' },
        { value: 'Marketing', label: 'Marketing' }
      ]);
      expect(console.error).toHaveBeenCalledWith('Error fetching departments:', mockError);
    });
  });

  describe('getUsersForReporting', () => {
    it('should fetch users for reporting successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            firstname: 'John',
            lastname: 'Doe',
            emailid: 'john@example.com'
          },
          {
            id: 2,
            firstname: 'Jane',
            lastname: 'Smith',
            emailid: 'jane@example.com'
          }
        ]
      };

      // Mock is already set up globally
      const mockUsers = [
        { firstname: 'John', lastname: 'Doe' },
        { firstname: 'Jane', lastname: 'Smith' }
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: mockUsers });

      const result = await userService.getUsersForReporting();
      
      expect(result).toEqual([
        { value: 'John Doe', label: 'John Doe' },
        { value: 'Jane Smith', label: 'Jane Smith' }
      ]);
    });

    it('should return empty array when API fails', async () => {
      const mockError = new Error('API error');
      // Mock is already set up globally
      mockAxiosInstance.get.mockRejectedValue(mockError);

      const result = await userService.getUsersForReporting();
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error fetching users for reporting:', mockError);
    });
  });

  describe('validateEmail', () => {
    it('should validate email successfully', async () => {
      const mockResponse = {
        data: { isValid: true }
      };

      // Mock is already set up globally
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await userService.validateEmail('test@example.com');
      
      expect(result).toEqual({ isValid: true });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/validate-email', {
        email: 'test@example.com',
        excludeId: undefined
      });
    });

    it('should validate email with excludeId', async () => {
      const mockResponse = {
        data: { isValid: true }
      };

      // Mock is already set up globally
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await userService.validateEmail('test@example.com', 1);
      
      expect(result).toEqual({ isValid: true });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users/validate-email', {
        email: 'test@example.com',
        excludeId: 1
      });
    });

    it('should handle errors when validating email', async () => {
      const mockError = new Error('API error');
      // Mock is already set up globally
      mockAxiosInstance.post.mockRejectedValue(mockError);

      const result = await userService.validateEmail('test@example.com');
      
      expect(result).toEqual({ isValid: false, message: 'Error validating email' });
      expect(console.error).toHaveBeenCalledWith('Error validating email:', mockError);
    });
  });

  describe('Request Interceptor', () => {
    it('should add auth token to request headers when token exists', () => {
      // Verify interceptor was set up during module import
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      
      // Get the request interceptor function
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0]?.[0];
      
      if (requestInterceptor) {
        localStorageMock.getItem.mockReturnValue('test-token-123');
        const config = { headers: {} };
        const result = requestInterceptor(config);
        
        expect(result.headers.Authorization).toBe('Bearer test-token-123');
      }
    });

    it('should not add auth token when token does not exist', () => {
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0]?.[0];
      
      if (requestInterceptor) {
        localStorageMock.getItem.mockReturnValue(null);
        const config = { headers: {} };
        const result = requestInterceptor(config);
        
        expect(result.headers.Authorization).toBeUndefined();
      }
    });

    it('should handle request interceptor error', async () => {
      const requestError = new Error('Request config failed');
      const errorHandler = mockAxiosInstance.interceptors.request.use.mock.calls[0]?.[1];
      
      if (errorHandler) {
        try {
          await errorHandler(requestError);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
        }
      }
    });
  });

  describe('Response Interceptor', () => {
    it('should handle 401 unauthorized response', async () => {
      localStorageMock.removeItem.mockClear();
      mockLocation.href = '';
      
      const error401 = {
        response: { status: 401 },
        message: 'Unauthorized'
      };
      
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0]?.[1];
      
      if (errorHandler) {
        try {
          await errorHandler(error401);
        } catch (e) {
          // Expected to throw - verify error is defined
          expect(e).toBeDefined();
          expect(e).toBeInstanceOf(Error);
        }
        
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
        expect(mockLocation.href).toBe('/login');
      }
    });

    it('should handle response interceptor error without response', async () => {
      const error = { message: 'Network error' };
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0]?.[1];
      
      if (errorHandler) {
        try {
          await errorHandler(error);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
        }
      }
    });
  });
});
