import axios from 'axios';
import { act } from '@testing-library/react';
import { updateUsersWithRoleName } from '../../src/utils/roleNameUpdateUtils';
import { fetchUsersFromApi } from '../../src/services/userFetchService';

// Mock apiClientUtils before any imports that use it
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

jest.mock('../../src/utils/apiClientUtils', () => ({
  createApiClient: jest.fn(() => mockApiClient)
}));

// Mock userSlice before importing roleNameUpdateUtils
jest.mock('../../src/store/Reducers/userSlice', () => ({
  fetchUsers: jest.fn(() => ({ type: 'users/fetchUsers' }))
}));

// Mock dependencies
jest.mock('../../src/services/userFetchService', () => ({
  fetchUsersFromApi: jest.fn(),
}));

jest.mock('../../src/utils/saveServiceUtils', () => ({
  formatTimestamp: jest.fn(() => "'2023-01-15 10:30:45'"),
  quoteString: jest.fn((str) => `'${str}'`),
  getSaveEndpoint: jest.fn(() => 'https://api.example.com/save'),
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('roleNameUpdateUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('updateUsersWithRoleName', () => {
    const mockUsers = [
      {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        role: 'OldRole',
        emailid: 'john@example.com',
      },
      {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        role: 'OldRole',
        emailid: 'jane@example.com',
      },
      {
        id: 3,
        firstname: 'Bob',
        lastname: 'Jones',
        role: 'OtherRole',
        emailid: 'bob@example.com',
      },
    ];

    beforeEach(() => {
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(mockUsers);
      mockedAxios.post.mockResolvedValue({
        data: { status: 'Success' },
      } as any);
    });

    it('should return early when oldRoleName and newRoleName are the same', async () => {
      await updateUsersWithRoleName('Admin', 'Admin');
      
      expect(fetchUsersFromApi).not.toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('No role name change or invalid names. Skipping user updates.');
    });

    it('should return early when oldRoleName is empty', async () => {
      await updateUsersWithRoleName('', 'NewRole');
      
      expect(fetchUsersFromApi).not.toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should return early when newRoleName is empty', async () => {
      await updateUsersWithRoleName('OldRole', '');
      
      expect(fetchUsersFromApi).not.toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should return early when oldRoleName is null', async () => {
      await updateUsersWithRoleName(null as any, 'NewRole');
      
      expect(fetchUsersFromApi).not.toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should return early when newRoleName is null', async () => {
      await updateUsersWithRoleName('OldRole', null as any);
      
      expect(fetchUsersFromApi).not.toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should fetch users from API', async () => {
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(fetchUsersFromApi).toHaveBeenCalled();
    });

    it('should filter users with old role name (case-insensitive)', async () => {
      await updateUsersWithRoleName('oldrole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      
      // Should update 2 users (John and Jane)
      expect(body.csvData.length).toBe(3); // header + 2 rows
    });

    it('should return early when no users found with old role', async () => {
      await updateUsersWithRoleName('NonExistent', 'NewRole');
      
      expect(fetchUsersFromApi).toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('No users found with role')
      );
    });

    it('should build correct CSV data', async () => {
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      
      expect(body.tableName).toBe('user_management');
      expect(body.hasHeaders).toBe(true);
      expect(body.uniqueColumn).toBe('id');
      expect(body.csvData[0]).toBe('_ops|id|role|lastupdatedat|lastupdatedby');
      expect(body.csvData[1]).toContain('u|1|');
      expect(body.csvData[2]).toContain('u|2|');
    });

    it('should handle string user IDs', async () => {
      const users = [
        {
          id: '1',
          firstname: 'John',
          lastname: 'Doe',
          role: 'OldRole',
          emailid: 'john@example.com',
        },
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      
      expect(body.csvData[1]).toContain('u|1|');
    });

    it('should handle numeric user IDs', async () => {
      const users = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          role: 'OldRole',
          emailid: 'john@example.com',
        },
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      
      expect(body.csvData[1]).toContain('u|1|');
    });

    it('should use correct endpoint', async () => {
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.example.com/save',
        expect.any(Object)
      );
    });

    it('should throw error when API returns error status', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          status: 'Error',
          message: 'Update failed',
        },
      } as any);
      
      await expect(updateUsersWithRoleName('OldRole', 'NewRole')).rejects.toThrow(
        'Failed to update users with new role name: Update failed'
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error updating users with new role name: Update failed')
      );
    });

    it('should throw error when API returns error status without message', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          status: 'Error',
        },
      } as any);
      
      await expect(updateUsersWithRoleName('OldRole', 'NewRole')).rejects.toThrow(
        'Failed to update users with new role name'
      );
    });

    it('should throw error when API request fails', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);
      
      await expect(updateUsersWithRoleName('OldRole', 'NewRole')).rejects.toThrow(
        'Failed to update users with new role name: Network error'
      );
    });

    it('should handle error without message', async () => {
      const error = {};
      mockedAxios.post.mockRejectedValue(error);
      
      await expect(updateUsersWithRoleName('OldRole', 'NewRole')).rejects.toThrow(
        'Failed to update users with new role name: Unknown error'
      );
    });

    it('should log update information', async () => {
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🔄 Updating 2 user(s)')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('=== BULK UPDATE USERS ROLE ===')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Old Role: OldRole')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('New Role: NewRole')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Users to update: 2')
      );
      // Check for CSV Headers log (the actual log format)
      const csvHeadersCall = (console.log as jest.Mock).mock.calls.find((call: any[]) => 
        call[0] && typeof call[0] === 'string' && call[0].includes('CSV Headers')
      );
      expect(csvHeadersCall).toBeDefined();
      // Check for CSV First Row Sample log
      const csvFirstRowCall = (console.log as jest.Mock).mock.calls.find((call: any[]) => 
        call[0] && typeof call[0] === 'string' && call[0].includes('CSV First Row Sample')
      );
      expect(csvFirstRowCall).toBeDefined();
      // Check for Full CSV Data log
      const fullCsvCall = (console.log as jest.Mock).mock.calls.find((call: any[]) => 
        call[0] && typeof call[0] === 'string' && call[0].includes('Full CSV Data')
      );
      expect(fullCsvCall).toBeDefined();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('API Response:')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('✅ Successfully updated 2 user(s)')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Response status:')
      );
    });

    it('should handle users with null/undefined role', async () => {
      const users = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          role: null,
          emailid: 'john@example.com',
        },
        {
          id: 2,
          firstname: 'Jane',
          lastname: 'Smith',
          role: 'OldRole',
          emailid: 'jane@example.com',
        },
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      // Should only update user with 'OldRole'
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      expect(body.csvData.length).toBe(2); // header + 1 row
    });

    it('should handle whitespace in role names', async () => {
      const users = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          role: ' OldRole ',
          emailid: 'john@example.com',
        },
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should handle CSV header format correctly', async () => {
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      
      expect(body.csvData[0]).toBe('_ops|id|role|lastupdatedat|lastupdatedby');
    });

    it('should include lastupdatedby in CSV rows', async () => {
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      
      expect(body.csvData[1]).toContain('System');
    });
  });

  describe('updateUsersWithRoleNameAndRefresh', () => {
    const mockDispatch = jest.fn();
    const mockSetNotification = jest.fn();
    const mockUsersForRefresh = [
      {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        role: 'OldRole',
        emailid: 'john@example.com',
      },
      {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        role: 'OldRole',
        emailid: 'jane@example.com',
      },
      {
        id: 3,
        firstname: 'Bob',
        lastname: 'Jones',
        role: 'OtherRole',
        emailid: 'bob@example.com',
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
      jest.useRealTimers();
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(mockUsersForRefresh);
      mockedAxios.post.mockResolvedValue({
        data: { status: 'Success' },
      } as any);
      mockDispatch.mockClear();
      mockSetNotification.mockClear();
    });

    it('should update users and refresh list successfully', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      mockDispatch.mockResolvedValue({ payload: mockUsersForRefresh });
      
      jest.useFakeTimers();
      
      const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
      
      // Advance timers to resolve all setTimeout calls
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await promise;
      });
      
      jest.useRealTimers();
      
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockSetNotification).not.toHaveBeenCalled();
    });

    it('should handle error during user update', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      mockedAxios.post.mockRejectedValueOnce(new Error('Update failed'));
      
      jest.useFakeTimers();
      
      const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
      
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await promise;
      });
      
      jest.useRealTimers();
      
      expect(mockSetNotification).toHaveBeenCalledWith({
        open: true,
        message: expect.stringContaining('Operation completed successfully, but failed to update users'),
        type: 'error'
      });
    });

    it('should verify users with new role after refresh', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      const updatedUsers = [
        { ...mockUsersForRefresh[0], role: 'NewRole' },
        { ...mockUsersForRefresh[1], role: 'NewRole' },
        mockUsersForRefresh[2]
      ];
      mockDispatch.mockResolvedValue({ payload: updatedUsers });
      
      jest.useFakeTimers();
      
      const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
      
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await promise;
      });
      
      jest.useRealTimers();
      
      expect(mockDispatch).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Fetched'));
    });

    it('should handle fetchUsers returning no payload', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      mockDispatch.mockResolvedValue({ payload: null });
      
      jest.useFakeTimers();
      
      const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
      
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await promise;
      });
      
      jest.useRealTimers();
      
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should handle error with message in updateUsersWithRoleNameAndRefresh', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      mockedAxios.post.mockRejectedValueOnce(new Error('Update failed with message'));
      
      jest.useFakeTimers();
      
      const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
      
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await promise;
      });
      
      jest.useRealTimers();
      
      expect(mockSetNotification).toHaveBeenCalledWith({
        open: true,
        message: expect.stringContaining('Update failed with message'),
        type: 'error'
      });
    });

    it('should handle error without message in updateUsersWithRoleNameAndRefresh', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      mockedAxios.post.mockRejectedValueOnce({});
      
      jest.useFakeTimers();
      
      const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
      
      await act(async () => {
        jest.advanceTimersByTime(2000);
        await promise;
      });
      
      jest.useRealTimers();
      
      expect(mockSetNotification).toHaveBeenCalledWith({
        open: true,
        message: expect.stringContaining('Unknown error'),
        type: 'error'
      });
    });

    it('should handle users with empty role string', async () => {
      // Empty oldRoleName should return early without calling fetchUsersFromApi
      await updateUsersWithRoleName('', 'NewRole');
      
      expect(fetchUsersFromApi).not.toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should handle users with undefined role', async () => {
      const users = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          role: undefined,
          emailid: 'john@example.com',
        }
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(fetchUsersFromApi).toHaveBeenCalled();
      // Should not update users with undefined role
      const callArgs = mockedAxios.post.mock.calls;
      if (callArgs.length > 0) {
        const body = callArgs[0][1] as any;
        expect(body.csvData.length).toBe(1); // Only header
      }
    });

    it('should handle users with null id', async () => {
      const users = [
        {
          id: null,
          firstname: 'John',
          lastname: 'Doe',
          role: 'OldRole',
          emailid: 'john@example.com',
        }
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      expect(body.csvData[1]).toContain('u||'); // Empty id
    });

    it('should handle users with undefined id', async () => {
      const users = [
        {
          id: undefined,
          firstname: 'John',
          lastname: 'Doe',
          role: 'OldRole',
          emailid: 'john@example.com',
        }
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should handle case-insensitive role matching with different cases', async () => {
      const users = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          role: 'OLDROLE',
          emailid: 'john@example.com',
        },
        {
          id: 2,
          firstname: 'Jane',
          lastname: 'Smith',
          role: 'oldrole',
          emailid: 'jane@example.com',
        }
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      expect(body.csvData.length).toBe(3); // header + 2 rows
    });

    it('should handle role names with special characters', async () => {
      const users = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          role: "Admin's Role",
          emailid: 'john@example.com',
        }
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName("Admin's Role", "New Admin's Role");
      
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should handle very long role names', async () => {
      const longRoleName = 'A'.repeat(200);
      const users = [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          role: longRoleName,
          emailid: 'john@example.com',
        }
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName(longRoleName, 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should handle updateUsersWithRoleNameAndRefresh with successful update', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      const updatedUsers = [
        { ...mockUsersForRefresh[0], role: 'NewRole' },
        { ...mockUsersForRefresh[1], role: 'NewRole' },
        mockUsersForRefresh[2]
      ];
      mockDispatch.mockResolvedValue({ payload: updatedUsers });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        expect(mockSetNotification).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Fetched'));
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should handle updateUsersWithRoleNameAndRefresh with no users matching new role', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      const updatedUsers = [
        { ...mockUsersForRefresh[0], role: 'OtherRole' },
        { ...mockUsersForRefresh[1], role: 'OtherRole' },
        mockUsersForRefresh[2]
      ];
      mockDispatch.mockResolvedValue({ payload: updatedUsers });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        expect(mockDispatch).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Fetched'));
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should handle users with missing id property (no id field)', async () => {
      const users = [
        {
          firstname: 'John',
          lastname: 'Doe',
          role: 'OldRole',
          emailid: 'john@example.com',
        }
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      expect(body.csvData[1]).toContain('u||'); // Empty id from String(user.id || '')
    });

    it('should handle error without accessing error.message property', async () => {
      const primitiveError = 'Simple string error';
      mockedAxios.post.mockRejectedValue(primitiveError);
      
      await expect(updateUsersWithRoleName('OldRole', 'NewRole')).rejects.toThrow(
        'Failed to update users with new role name: Unknown error'
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error updating users with new role name: Unknown error')
      );
    });

    it('should handle fetchUsersFromApi throwing an error', async () => {
      (fetchUsersFromApi as jest.Mock).mockRejectedValue(new Error('API fetch failed'));
      
      await expect(updateUsersWithRoleName('OldRole', 'NewRole')).rejects.toThrow(
        'Failed to update users with new role name: API fetch failed'
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error updating users with new role name: API fetch failed')
      );
    });

    it('should handle empty users array from API', async () => {
      (fetchUsersFromApi as jest.Mock).mockResolvedValue([]);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(fetchUsersFromApi).toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('No users found with role "OldRole"')
      );
    });

    it('should handle axios response data without status field', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          // No status field, should not throw error
        },
      } as any);
      
      await expect(updateUsersWithRoleName('OldRole', 'NewRole')).resolves.not.toThrow();
    });

    it('should handle role names with leading and trailing spaces', async () => {
      await updateUsersWithRoleName('  OldRole  ', '  NewRole  ');
      
      expect(fetchUsersFromApi).toHaveBeenCalled();
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should handle users with boolean id values', async () => {
      const users = [
        {
          id: true,
          firstname: 'John',
          lastname: 'Doe',
          role: 'OldRole',
          emailid: 'john@example.com',
        }
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      expect(body.csvData[1]).toContain('u|true|'); // String(true)
    });

    it('should handle users with numeric zero id', async () => {
      const users = [
        {
          id: 0,
          firstname: 'John',
          lastname: 'Doe',
          role: 'OldRole',
          emailid: 'john@example.com',
        }
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(users);
      
      await updateUsersWithRoleName('OldRole', 'NewRole');
      
      expect(mockedAxios.post).toHaveBeenCalled();
      const callArgs = mockedAxios.post.mock.calls[0];
      const body = callArgs[1] as any;
      expect(body.csvData[1]).toContain('u|0|'); // String(0)
    });

    it('should handle response data with Error status but no message', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          status: 'Error',
          // No message field
        },
      } as any);
      
      await expect(updateUsersWithRoleName('OldRole', 'NewRole')).rejects.toThrow(
        'Failed to update users with new role name'
      );
    });

    it('should log all console messages in updateUsersWithRoleNameAndRefresh', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      mockDispatch.mockResolvedValue({ payload: mockUsersForRefresh });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        expect(console.log).toHaveBeenCalledWith('🔄 Starting user role update process...');
        expect(console.log).toHaveBeenCalledWith('⏳ Waiting for database commit...');
        expect(console.log).toHaveBeenCalledWith('🔄 Fetching updated users from database...');
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Fetched'));
        expect(console.log).toHaveBeenCalledWith('✅ Users list refreshed with updated role names');
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    // Test to cover uncovered branch: when u.role is falsy (line 112)
    it('should handle users with falsy role values in updateUsersWithRoleNameAndRefresh filter', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      // Create payload with users having falsy roles to trigger the || '' branch
      const usersWithFalsyRoles = [
        { id: 1, firstName: 'John', role: null },     // null role - should trigger || '' branch
        { id: 2, firstName: 'Jane', role: undefined }, // undefined role - should trigger || '' branch  
        { id: 3, firstName: 'Bob', role: '' },        // empty string role - should trigger || '' branch
        { id: 4, firstName: 'Alice', role: 'NewRole' } // valid role
      ];
      
      mockDispatch.mockResolvedValue({ payload: usersWithFalsyRoles });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // This should trigger the (u.role || '') branch for falsy roles
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Fetched 4 users, 1 with new role "NewRole"'));
        expect(mockDispatch).toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    // Test to cover uncovered branch: when error.message is falsy (line 126)  
    it('should handle error without message property in updateUsersWithRoleNameAndRefresh', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      // Create an error object without a message property to trigger the || 'Unknown error' branch
      const errorWithoutMessage = { code: 500, status: 'failed' };
      mockedAxios.post.mockRejectedValueOnce(errorWithoutMessage);
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // This should trigger the error?.message || 'Unknown error' branch
        expect(mockSetNotification).toHaveBeenCalledWith({
          open: true,
          message: expect.stringContaining('Unknown error'),
          type: 'error'
        });
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    // Additional test to ensure we catch the exact branch case for falsy roles that equals empty string after || operation  
    it('should handle users where role becomes empty string after null coalescing', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      // Test where u.role is null/undefined, so (u.role || '') becomes '', and ''.trim().toLowerCase() === 'newrole'.trim().toLowerCase() should be false
      const usersWithNullRoles = [
        { id: 1, role: null }, // (null || '') = '', ''.trim().toLowerCase() = ''
        { id: 2, role: undefined }, // (undefined || '') = '', ''.trim().toLowerCase() = ''
        { id: 3, role: '' }, // ('' || '') = '', ''.trim().toLowerCase() = ''
      ];
      
      mockDispatch.mockResolvedValue({ payload: usersWithNullRoles });
      
      jest.useFakeTimers();
      
      try {
        // Search for 'NewRole' when users have null/undefined/empty roles - should find 0 matches
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // Should log 0 users with the new role since all roles are effectively empty strings after || ''
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Fetched 3 users, 0 with new role "NewRole"'));
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    // Additional test to cover the case where we're actually searching for an empty role
    it('should handle searching for empty role name to cover || branch properly', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      // Test where we search for empty string role, so comparison becomes '' === ''
      const usersForEmptyRoleSearch = [
        { id: 1, role: null },      // (null || '') = '', '' === '' = true  
        { id: 2, role: undefined }, // (undefined || '') = '', '' === '' = true
        { id: 3, role: '' },        // ('' || '') = '', '' === '' = true  
        { id: 4, role: 'SomeRole' } // ('SomeRole' || '') = 'SomeRole', 'somerole' === '' = false
      ];
      
      mockDispatch.mockResolvedValue({ payload: usersForEmptyRoleSearch });
      
      jest.useFakeTimers();
      
      try {
        // Search for empty string role - should match users 1, 2, and 3
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', '', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // Should find 3 users with empty role (effectively)
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Fetched 4 users, 3 with new role ""'));
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should handle error logging in updateUsersWithRoleNameAndRefresh', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      const error = new Error('Test error');
      mockedAxios.post.mockRejectedValueOnce(error);
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // The error is wrapped in updateUsersWithRoleName, so check for the wrapped error
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('❌ Error in updateUsersWithRoleNameAndRefresh:'),
          expect.any(Error)
        );
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should verify users with new role and log fetched users count', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      const updatedUsers = [
        { ...mockUsersForRefresh[0], role: 'NewRole' },
        { ...mockUsersForRefresh[1], role: 'NewRole' },
        mockUsersForRefresh[2]
      ];
      mockDispatch.mockResolvedValue({ payload: updatedUsers });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // Should log fetched user count with role matching
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('✅ Fetched 3 users, 2 with new role "NewRole"')
        );
        
        // Should log final success message
        expect(console.log).toHaveBeenCalledWith('✅ Users list refreshed with updated role names');
        
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockSetNotification).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should handle fetchResult with empty payload correctly', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      mockDispatch.mockResolvedValue({ payload: [] });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // Should log with 0 users and 0 with new role
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('✅ Fetched 0 users, 0 with new role "NewRole"')
        );
        
        expect(console.log).toHaveBeenCalledWith('✅ Users list refreshed with updated role names');
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should handle fetchResult with users having null/undefined roles', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      const updatedUsers = [
        { id: 1, firstName: 'John', role: null },
        { id: 2, firstName: 'Jane', role: undefined },
        { id: 3, firstName: 'Bob', role: 'NewRole' }
      ];
      mockDispatch.mockResolvedValue({ payload: updatedUsers });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // Should correctly count only users with the new role (1 user)
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('✅ Fetched 3 users, 1 with new role "NewRole"')
        );
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should handle fetchResult with users having whitespace in roles', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      const updatedUsers = [
        { id: 1, firstName: 'John', role: '  NewRole  ' },
        { id: 2, firstName: 'Jane', role: 'newrole' }, // case insensitive
        { id: 3, firstName: 'Bob', role: 'OtherRole' }
      ];
      mockDispatch.mockResolvedValue({ payload: updatedUsers });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // Should correctly trim and match case-insensitively (2 users)
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('✅ Fetched 3 users, 2 with new role "NewRole"')
        );
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should execute both setTimeout calls and complete successfully', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      mockDispatch.mockResolvedValue({ payload: mockUsersForRefresh });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          // Advance timer for the first timeout (1500ms)
          jest.advanceTimersByTime(1500);
          
          // Advance timer for the second timeout (500ms)
          jest.advanceTimersByTime(500);
          
          await promise;
        });
        
        // Verify all console logs are called including the final one
        expect(console.log).toHaveBeenCalledWith('🔄 Starting user role update process...');
        expect(console.log).toHaveBeenCalledWith('⏳ Waiting for database commit...');
        expect(console.log).toHaveBeenCalledWith('🔄 Fetching updated users from database...');
        expect(console.log).toHaveBeenCalledWith('✅ Users list refreshed with updated role names');
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should cover lines 109-114 with proper payload processing', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      // Create specific payload that will trigger the if block
      const mockPayload = [
        { id: 1, firstName: 'John', role: 'NewRole' },
        { id: 2, firstName: 'Jane', role: 'NewRole' },
        { id: 3, firstName: 'Bob', role: 'OtherRole' }
      ];
      
      mockDispatch.mockResolvedValue({ payload: mockPayload });
      
      // Use real timers to avoid timeout issues
      jest.useRealTimers();
      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        await updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
      
      // This should hit lines 109-114 (the payload processing)
      expect(console.log).toHaveBeenCalledWith('✅ Fetched 3 users, 2 with new role "NewRole"');
      
      // This should hit line 118 and 120 (second timeout and final log)
      expect(console.log).toHaveBeenCalledWith('✅ Users list refreshed with updated role names');
      
      expect(mockDispatch).toHaveBeenCalled();
    }, 15000);

    it('should complete function execution including final Promise timeout', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      // Setup payload to ensure the if block is entered
      mockDispatch.mockResolvedValue({
        payload: [
          { id: 1, role: 'NewRole' },
          { id: 2, role: 'OldRole' }
        ]
      });
      
      // Use real timers for this test to ensure async completion
      jest.useRealTimers();
      
      await updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
      
      // Verify the function completed and all logs were called
      expect(console.log).toHaveBeenCalledWith('🔄 Starting user role update process...');
      expect(console.log).toHaveBeenCalledWith('⏳ Waiting for database commit...');
      expect(console.log).toHaveBeenCalledWith('🔄 Fetching updated users from database...');
      expect(console.log).toHaveBeenCalledWith('✅ Fetched 2 users, 1 with new role "NewRole"');
      expect(console.log).toHaveBeenCalledWith('✅ Users list refreshed with updated role names');
      expect(mockSetNotification).not.toHaveBeenCalled();
    }, 15000);

    // Additional test to ensure we cover the anonymous functions
    it('should properly execute all anonymous functions in updateUsersWithRoleNameAndRefresh', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      const mockUsers = [
        { id: 1, role: 'NewRole' },
        { id: 2, role: 'NewRole' },
        { id: 3, role: 'OtherRole' }
      ];
      
      mockDispatch.mockResolvedValue({ payload: mockUsers });
      
      // Mock setTimeout to capture the resolve functions (anonymous functions 6 and 7)
      const originalSetTimeout = global.setTimeout;
      const mockSetTimeout = jest.fn((callback: Function, delay: number) => {
        // Execute the callback immediately to cover the anonymous functions
        if (typeof callback === 'function') {
          callback();
        }
        return originalSetTimeout(() => {}, delay) as any;
      });
      
      (global as any).setTimeout = mockSetTimeout;
      
      try {
        await updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        // Verify the setTimeout functions were called (these are anonymous functions 6 and 7)
        expect(mockSetTimeout).toHaveBeenCalledTimes(2);
        expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 1500);
        expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
        
        expect(console.log).toHaveBeenCalledWith('✅ Fetched 3 users, 2 with new role "NewRole"');
        expect(console.log).toHaveBeenCalledWith('✅ Users list refreshed with updated role names');
      } finally {
        global.setTimeout = originalSetTimeout;
      }
    }, 10000);

    it('should handle updateUsersWithRoleNameAndRefresh when dispatch throws an error', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      mockDispatch.mockRejectedValue(new Error('Dispatch failed'));
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        expect(mockSetNotification).toHaveBeenCalledWith({
          open: true,
          message: expect.stringContaining('Dispatch failed'),
          type: 'error'
        });
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should handle updateUsersWithRoleNameAndRefresh when fetchUsers throws an error with no message', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      const errorWithoutMessage = { someProperty: 'value' };
      mockDispatch.mockRejectedValue(errorWithoutMessage);
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        expect(mockSetNotification).toHaveBeenCalledWith({
          open: true,
          message: expect.stringContaining('Unknown error'),
          type: 'error'
        });
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should handle updateUsersWithRoleNameAndRefresh when fetchUsers returns undefined', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      mockDispatch.mockResolvedValue(undefined);
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        expect(mockDispatch).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('✅ Users list refreshed with updated role names');
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should handle updateUsersWithRoleNameAndRefresh when fetchUsers returns empty payload', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      mockDispatch.mockResolvedValue({ payload: [] });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        expect(mockDispatch).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Fetched 0 users'));
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    it('should handle updateUsersWithRoleNameAndRefresh logging all expected messages', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      const updatedUsers = [
        { ...mockUsersForRefresh[0], role: 'NewRole' },
        { ...mockUsersForRefresh[1], role: 'NewRole' }
      ];
      mockDispatch.mockResolvedValue({ payload: updatedUsers });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // Check that all expected log messages are called
        expect(console.log).toHaveBeenCalledWith('🔄 Starting user role update process...');
        expect(console.log).toHaveBeenCalledWith('⏳ Waiting for database commit...');
        expect(console.log).toHaveBeenCalledWith('🔄 Fetching updated users from database...');
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Fetched 2 users, 2 with new role "NewRole"'));
        expect(console.log).toHaveBeenCalledWith('✅ Users list refreshed with updated role names');
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

  });

  // Dedicated tests to achieve 95%+ coverage
  describe('Coverage completion tests', () => {
    const mockDispatch = jest.fn();
    const mockSetNotification = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      (fetchUsersFromApi as jest.Mock).mockResolvedValue([]);
      mockedAxios.post.mockResolvedValue({ data: { status: 'Success' } });
      mockDispatch.mockClear();
      mockSetNotification.mockClear();
    });

    it('should execute updateUsersWithRoleNameAndRefresh hitting all uncovered lines', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      // Setup mock to trigger the payload branch (lines 109-114)
      const testPayload = [
        { id: 1, role: 'NewRole' },
        { id: 2, role: ' newrole ' }, // different case and whitespace 
        { id: 3, role: 'OtherRole' }
      ];
      
      mockDispatch.mockImplementation(async () => {
        return Promise.resolve({ payload: testPayload });
      });

      // Create a real implementation that will hit the timeout functions
      const originalSetTimeout = setTimeout;
      const timeoutCallbacks: Function[] = [];
      
      (global as any).setTimeout = jest.fn((callback: Function, _delay: number) => {
        timeoutCallbacks.push(callback);
        return originalSetTimeout(() => {
          callback();
        }, 0); // Execute immediately
      });

      try {
        await updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        // Force execution of timeout callbacks
        timeoutCallbacks.forEach(callback => callback());
        
        // Verify the if (fetchResult?.payload) block was hit (lines 109-114)
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Fetched 3 users, 2 with new role "NewRole"'));
        
        // Verify the final log (line 120)
        expect(console.log).toHaveBeenCalledWith('✅ Users list refreshed with updated role names');
        
        expect(mockSetNotification).not.toHaveBeenCalled();
      } finally {
        (global as any).setTimeout = originalSetTimeout;
      }
    }, 15000);
  });

  // Additional tests to cover the remaining uncovered branches for 95%+ coverage
  describe('Branch coverage completion tests', () => {
    const mockDispatch = jest.fn();
    const mockSetNotification = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      mockDispatch.mockClear();
      mockSetNotification.mockClear();
      (fetchUsersFromApi as jest.Mock).mockResolvedValue([]);
      mockedAxios.post.mockResolvedValue({ data: { status: 'Success' } });
    });

    // Test to cover the uncovered branch: (u.role || '') when u.role is falsy (line 112)
    it('should handle users with null/undefined roles in updateUsersWithRoleNameAndRefresh filter', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      // Create payload with users having null/undefined roles to trigger the || '' branch
      const usersWithNullRoles = [
        { id: 1, firstName: 'John', role: null },       // null role - triggers || ''
        { id: 2, firstName: 'Jane', role: undefined },  // undefined role - triggers || ''
        { id: 3, firstName: 'Bob', role: 'ValidRole' }  // valid role for comparison
      ];
      
      // Mock the whole flow properly
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(usersWithNullRoles);
      mockDispatch.mockResolvedValue({ payload: usersWithNullRoles });
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'ValidRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // This should trigger the (u.role || '') branch for null/undefined roles
        // and correctly count users with the ValidRole (should be 1)
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Fetched 3 users, 1 with new role "ValidRole"'));
        expect(mockDispatch).toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    // Test to cover the uncovered branch: error?.message || 'Unknown error' when error.message is falsy (line 126)
    it('should handle error object without message property in updateUsersWithRoleNameAndRefresh', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      // Create an error object without a message property to trigger the || 'Unknown error' branch
      const errorWithoutMessage = { code: 500, status: 'failed', name: 'TestError' };
      
      // Mock the updateUsersWithRoleName to throw an error without message
      (fetchUsersFromApi as jest.Mock).mockRejectedValueOnce(errorWithoutMessage);
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // This should trigger the error?.message || 'Unknown error' branch
        expect(mockSetNotification).toHaveBeenCalledWith({
          open: true,
          message: expect.stringContaining('Unknown error'),
          type: 'error'
        });
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    // Additional test to ensure complete branch coverage for the error handling with null error message
    it('should handle error with explicitly null message property', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      // Create an error object with explicitly null message to trigger the || 'Unknown error' branch
      const errorWithNullMessage = { message: null, code: 500 };
      
      (fetchUsersFromApi as jest.Mock).mockRejectedValueOnce(errorWithNullMessage);
      
      jest.useFakeTimers();
      
      try {
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', 'NewRole', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // This should also trigger the error?.message || 'Unknown error' branch (null is falsy)
        expect(mockSetNotification).toHaveBeenCalledWith({
          open: true,
          message: expect.stringContaining('Unknown error'),
          type: 'error'
        });
      } finally {
        jest.useRealTimers();
      }
    }, 10000);

    // Additional test to cover the case where u.role is an empty string but we want to test the || '' specifically
    it('should handle users with empty string roles to ensure || branch coverage', async () => {
      const { updateUsersWithRoleNameAndRefresh } = require('../../src/utils/roleNameUpdateUtils');
      
      // Create payload where some users have empty string role and we search for empty string
      const usersWithEmptyStringRoles = [
        { id: 1, firstName: 'John', role: '' },          // empty string role
        { id: 2, firstName: 'Jane', role: null },        // null role - will become '' via || ''
        { id: 3, firstName: 'Bob', role: undefined },    // undefined role - will become '' via || ''
        { id: 4, firstName: 'Alice', role: 'RealRole' }  // real role for contrast
      ];
      
      (fetchUsersFromApi as jest.Mock).mockResolvedValue(usersWithEmptyStringRoles);
      mockDispatch.mockResolvedValue({ payload: usersWithEmptyStringRoles });
      
      jest.useFakeTimers();
      
      try {
        // Search for empty string role - should match the first three users after || '' operation
        const promise = updateUsersWithRoleNameAndRefresh('OldRole', '', mockDispatch, mockSetNotification);
        
        await act(async () => {
          jest.advanceTimersByTime(2000);
          await promise;
        });
        
        // Should find 3 users with effectively empty roles after the || '' operation
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Fetched 4 users, 3 with new role ""'));
      } finally {
        jest.useRealTimers();
      }
    }, 15000);
  });
});


