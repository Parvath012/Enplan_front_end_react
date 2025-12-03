import { 
  saveUser, 
  buildUserPartialUpdateCsv, 
  saveUserPartialUpdate, 
  saveUserStatusToggle, 
  fetchLatestUserByEmail,
  UserFormData,
  OperationType
} from '../../src/services/userSaveService';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn()
}));

import axios from 'axios';

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('userSaveService', () => {
  const mockUserData: UserFormData = {
    firstname: 'John',
    lastname: 'Doe',
    emailid: 'john@example.com',
    phonenumber: '1234567890',
    isenabled: true,
    role: 'Admin',
    department: 'IT',
    reportingmanager: 'Jane Smith',
    dottedorprojectmanager: 'Bob Johnson',
    selfreporting: false,
    status: 'Active',
    regions: ['North America'],
    countries: ['USA'],
    divisions: ['Retail'],
    groups: ['Electronics'],
    departments: ['Sales'],
    class: ['Electronics'],
    subClass: ['Phones'],
    permissions: 'read,write,delete'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (axios.post as jest.Mock).mockClear();
  });

  describe('saveUser', () => {
    it('saves user successfully', async () => {
      const mockResponse = {
        data: { success: true, id: 123 }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveUser(mockUserData);

      expect(result).toEqual({ success: true, id: 123 });
      expect(axios.post).toHaveBeenCalled();
    });

    it('handles save user error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { error: 'Bad Request' }
        }
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(saveUser(mockUserData)).rejects.toEqual(mockError);
    });

    it('handles network error', async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(saveUser(mockUserData)).rejects.toThrow('Network error');
    });

    it('handles empty response', async () => {
      const mockResponse = {
        data: null
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(saveUser(mockUserData)).rejects.toThrow('Cannot read properties of null');
    });

    it('handles different response formats', async () => {
      const mockResponse = {
        data: { data: { id: 123 }, message: 'Success' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveUser(mockUserData);
      expect(result).toEqual({ data: { id: 123 }, message: 'Success' });
    });

    it('handles response with error status', async () => {
      const mockResponse = {
        data: { status: 'Error', message: 'Database error' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(saveUser(mockUserData)).rejects.toThrow('Database error');
    });

    it('handles response with error status and no message', async () => {
      const mockResponse = {
        data: { status: 'Error' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(saveUser(mockUserData)).rejects.toThrow('Failed to save user');
    });

    it('handles successful response with different structure', async () => {
      const mockResponse = {
        data: { 
          success: true, 
          id: 456,
          message: 'User created successfully',
          data: { userId: 456, status: 'active' }
        }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveUser(mockUserData);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles 500 server error', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(saveUser(mockUserData)).rejects.toEqual(mockError);
    });

    it('handles 401 unauthorized error', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(saveUser(mockUserData)).rejects.toEqual(mockError);
    });

    it('handles 403 forbidden error', async () => {
      const mockError = {
        response: {
          status: 403,
          data: { error: 'Forbidden' }
        }
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(saveUser(mockUserData)).rejects.toEqual(mockError);
    });

    it('handles 404 not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { error: 'Not Found' }
        }
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(saveUser(mockUserData)).rejects.toEqual(mockError);
    });

    it('handles 422 validation error', async () => {
      const mockError = {
        response: {
          status: 422,
          data: { error: 'Validation Error', details: ['Email is required'] }
        }
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(saveUser(mockUserData)).rejects.toEqual(mockError);
    });

    it('handles timeout error', async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error('Request timeout'));

      await expect(saveUser(mockUserData)).rejects.toThrow('Request timeout');
    });

    it('handles abort error', async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error('Request aborted'));

      await expect(saveUser(mockUserData)).rejects.toThrow('Request aborted');
    });
  });

  describe('Edge Cases', () => {
    it('handles user data with special characters', async () => {
      const specialUserData = {
        ...mockUserData,
        firstname: 'José',
        lastname: 'García-López',
        emailid: 'jose.garcia@example.com',
        phoneNumber: '+1-555-123-4567'
      };

      const mockResponse = {
        data: { success: true }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveUser(specialUserData);
      expect(result).toEqual({ success: true });
    });

    it('handles user data with large permissions array', async () => {
      const largePermissionsArray = Array.from({ length: 1000 }, (_, i) => `permission_${i}`);
      const userDataWithLargePermissions = {
        ...mockUserData,
        permissions: {
          ...mockUserData.permissions,
          regions: largePermissionsArray
        }
      };

      const mockResponse = {
        data: { success: true }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveUser(userDataWithLargePermissions);
      expect(result).toEqual({ success: true });
    });

    it('handles user data with missing optional fields', async () => {
      const minimalUserData: UserFormData = {
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        role: 'Admin',
        department: 'IT',
        status: 'Active',
        isenabled: true
      };

      const mockResponse = {
        data: { success: true }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveUser(minimalUserData);
      expect(result).toEqual({ success: true });
    });
  });

  describe('Integration Tests', () => {
    it('handles complete save workflow', async () => {
      const userData = {
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        phoneNumber: '1234567890',
        isenabled: true,
        role: 'Admin',
        department: 'IT',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: false,
        status: 'Active',
        permissions: {
          regions: ['North America'],
          countries: ['USA'],
          divisions: ['Retail'],
          groups: ['Electronics'],
          departments: ['Sales'],
          classes: ['Electronics'],
          subClasses: ['Phones']
        }
      };

      const mockResponse = {
        data: { 
          success: true, 
          id: 123,
          message: 'User created successfully'
        }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveUser(userData);

      expect(result).toEqual({
        success: true,
        id: 123,
        message: 'User created successfully'
      });

      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles axios rejection', async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error('Axios failed'));

      await expect(saveUser(mockUserData)).rejects.toThrow('Axios failed');
    });

    it('handles malformed response', async () => {
      const mockResponse = {
        data: 'invalid json string'
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveUser(mockUserData);
      expect(result).toBe('invalid json string');
    });
  });

  describe('Performance Tests', () => {
    it('handles large user data efficiently', async () => {
      const largeUserData = {
        ...mockUserData,
        permissions: {
          regions: Array.from({ length: 10000 }, (_, i) => `region_${i}`),
          countries: Array.from({ length: 10000 }, (_, i) => `country_${i}`),
          divisions: Array.from({ length: 10000 }, (_, i) => `division_${i}`),
          groups: Array.from({ length: 10000 }, (_, i) => `group_${i}`),
          departments: Array.from({ length: 10000 }, (_, i) => `department_${i}`),
          classes: Array.from({ length: 10000 }, (_, i) => `class_${i}`),
          subClasses: Array.from({ length: 10000 }, (_, i) => `subClass_${i}`)
        },
        metadata: {
          largeObject: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `value_${i}` }))
        }
      };

      const mockResponse = {
        data: { success: true }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const startTime = Date.now();
      const result = await saveUser(largeUserData);
      const endTime = Date.now();

      expect(result).toEqual({ success: true });
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('buildUserPartialUpdateCsv', () => {
    it('builds CSV for partial update with all permission fields', () => {
      const partialData: UserFormData = {
        ...mockUserData,
        id: '123'
      };
      
      const result = buildUserPartialUpdateCsv(partialData, 'u');
      
      expect(result.headers).toContain('_ops');
      expect(result.headers).toContain('id');
      expect(result.headers).toContain('regions');
      expect(result.headers).toContain('countries');
      expect(result.headers).toContain('permissions');
      expect(result.row).toContain('u');
      expect(result.row).toContain('123');
    });

    it('builds CSV for partial update with undefined fields', () => {
      const partialData: UserFormData = {
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        role: 'Admin',
        status: 'Active',
        isenabled: true,
        id: '456'
      };
      
      const result = buildUserPartialUpdateCsv(partialData, 'u');
      
      expect(result.headers).toContain('_ops');
      expect(result.headers).toContain('id');
      expect(result.headers).toContain('lastupdatedat');
      expect(result.row).toContain('u');
      expect(result.row).toContain('456');
    });

    it('handles null permission values', () => {
      const partialData: UserFormData = {
        firstname: 'John',
        lastname: 'Doe',
        emailid: 'john@example.com',
        role: 'Admin',
        status: 'Active',
        isenabled: true,
        id: '789',
        regions: null,
        countries: null,
        permissions: null
      };
      
      const result = buildUserPartialUpdateCsv(partialData, 'u');
      
      expect(result.row).toContain('NULL');
    });
  });

  describe('saveUserPartialUpdate', () => {
    it('saves partial user update successfully', async () => {
      const mockResponse = {
        data: { status: 'Ok', message: 'Updated successfully' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const partialData: UserFormData = {
        ...mockUserData,
        id: '123'
      };

      const result = await saveUserPartialUpdate(partialData);

      expect(result).toEqual({ status: 'Ok', message: 'Updated successfully' });
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          tableName: 'user_management',
          hasHeaders: true,
          uniqueColumn: 'id'
        })
      );
    });

    it('handles partial update with error response', async () => {
      const mockResponse = {
        data: { status: 'Error', message: 'Update failed' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const partialData: UserFormData = {
        ...mockUserData,
        id: '123'
      };

      await expect(saveUserPartialUpdate(partialData)).rejects.toThrow('Update failed');
    });

    it('handles partial update with error response and no message', async () => {
      const mockResponse = {
        data: { status: 'Error' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const partialData: UserFormData = {
        ...mockUserData,
        id: '123'
      };

      await expect(saveUserPartialUpdate(partialData)).rejects.toThrow('Failed to update user permissions');
    });
  });

  describe('saveUserStatusToggle', () => {
    it('toggles user status to enabled successfully', async () => {
      const mockResponse = {
        data: { status: 'Ok', message: 'Status updated' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveUserStatusToggle(123, true);

      expect(result).toEqual({ status: 'Ok', message: 'Status updated' });
      expect(axios.post).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('=== SAVE API CALLED ===');
      expect(mockConsoleLog).toHaveBeenCalledWith('User ID:', 123);
      expect(mockConsoleLog).toHaveBeenCalledWith('New isEnabled:', true);
      expect(mockConsoleLog).toHaveBeenCalledWith('New status:', 'Active');
    });

    it('toggles user status to disabled successfully', async () => {
      const mockResponse = {
        data: { status: 'Success', message: 'Status updated' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveUserStatusToggle(456, false);

      expect(result).toEqual({ status: 'Success', message: 'Status updated' });
      expect(mockConsoleLog).toHaveBeenCalledWith('New isEnabled:', false);
      expect(mockConsoleLog).toHaveBeenCalledWith('New status:', 'Inactive');
    });

    it('handles status toggle with transfer fields', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await saveUserStatusToggle(789, true, 'admin@example.com', '2023-10-27');

      expect(mockConsoleLog).toHaveBeenCalledWith('TransferedBy:', 'admin@example.com');
      expect(mockConsoleLog).toHaveBeenCalledWith('TransferedDate:', '2023-10-27');
    });

    it('handles status toggle with null transfer fields', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await saveUserStatusToggle(101, false, null, null);

      expect(mockConsoleLog).toHaveBeenCalledWith('TransferedBy:', null);
      expect(mockConsoleLog).toHaveBeenCalledWith('TransferedDate:', null);
    });

    it('handles status toggle error response', async () => {
      const mockResponse = {
        data: { status: 'Error', message: 'Status update failed' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(saveUserStatusToggle(123, true)).rejects.toThrow('Status update failed');
    });

    it('handles status toggle error response without message', async () => {
      const mockResponse = {
        data: { status: 'Error' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(saveUserStatusToggle(123, true)).rejects.toThrow('Failed to update user status');
    });

    it('handles axios error in status toggle', async () => {
      const mockError = new Error('Network error');
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(saveUserStatusToggle(123, true)).rejects.toThrow('Network error');
      expect(mockConsoleError).toHaveBeenCalledWith('Save API: Error details', expect.any(Object));
    });

    it('handles axios error with response in status toggle', async () => {
      const mockError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: { error: 'Server error' }
        },
        message: 'Request failed with status code 500'
      };
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(saveUserStatusToggle(123, true)).rejects.toEqual(mockError);
      expect(mockConsoleError).toHaveBeenCalledWith('Save API: Error details', expect.objectContaining({
        message: 'Request failed with status code 500',
        status: 500,
        statusText: 'Internal Server Error'
      }));
    });
  });

  describe('fetchLatestUserByEmail', () => {
    it('fetches user by email successfully', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            value: {
              csvData: [
                'Id|EmailId|CreatedAt',
                '123|john@example.com|2023-10-27 12:00:00'
              ]
            }
          }]
        }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchLatestUserByEmail('john@example.com');

      expect(result).toEqual({ id: '123' });
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          executeInParallel: true,
          sqlQueries: expect.arrayContaining([
            expect.objectContaining({
              name: 'user',
              query: expect.objectContaining({
                searchFilter: expect.objectContaining({
                  filters: expect.arrayContaining([
                    expect.objectContaining({
                      propertyName: 'emailid',
                      value: 'john@example.com'
                    })
                  ])
                })
              })
            })
          ])
        })
      );
    });

    it('returns null when no user found', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: []
        }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchLatestUserByEmail('notfound@example.com');

      expect(result).toBeNull();
    });

    it('returns null when CSV data is empty', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            value: {
              csvData: []
            }
          }]
        }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchLatestUserByEmail('empty@example.com');

      expect(result).toBeNull();
    });

    it('returns null when Id column not found', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            value: {
              csvData: [
                'EmailId|CreatedAt',
                'john@example.com|2023-10-27 12:00:00'
              ]
            }
          }]
        }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchLatestUserByEmail('john@example.com');

      expect(result).toBeNull();
    });

    it('handles malformed CSV data', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [{
            value: {
              csvData: [
                'Id|EmailId|CreatedAt',
                '|john@example.com|2023-10-27 12:00:00'
              ]
            }
          }]
        }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchLatestUserByEmail('john@example.com');

      expect(result).toBeNull();
    });

    it('handles fetch error', async () => {
      const mockError = new Error('Network error');
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(fetchLatestUserByEmail('error@example.com')).rejects.toThrow('Failed to fetch user by email: Error: Network error');
    });
  });

  describe('Operation Types and Edge Cases', () => {
    it('handles new user operation with all fields', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const newUserData: UserFormData = {
        ...mockUserData,
        createdby: 'admin@example.com',
        lastupdatedby: 'admin@example.com',
        createdat: '2023-10-27T12:00:00Z',
        lastupdatedat: '2023-10-27T12:00:00Z'
      };

      const result = await saveUser(newUserData, 'n');
      expect(result).toEqual({ status: 'Ok' });
    });

    it('handles update user operation', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const updateUserData: UserFormData = {
        ...mockUserData,
        id: '123',
        lastupdatedby: 'admin@example.com',
        lastupdatedat: '2023-10-27T12:00:00Z'
      };

      const result = await saveUser(updateUserData, 'u');
      expect(result).toEqual({ status: 'Ok' });
    });

    it('handles delete user operation', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const deleteUserData: UserFormData = {
        ...mockUserData,
        id: '123'
      };

      const result = await saveUser(deleteUserData, 'd');
      expect(result).toEqual({ status: 'Ok' });
    });

    it('throws error for update/delete without id', async () => {
      const userDataWithoutId: UserFormData = {
        ...mockUserData
      };
      delete userDataWithoutId.id;

      await expect(saveUser(userDataWithoutId, 'u')).rejects.toThrow('id is required for update/delete operations');
      await expect(saveUser(userDataWithoutId, 'd')).rejects.toThrow('id is required for update/delete operations');
    });

    it('handles user data with null dotted line manager', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const userDataWithNullManager: UserFormData = {
        ...mockUserData,
        dottedorprojectmanager: undefined
      };

      const result = await saveUser(userDataWithNullManager);
      expect(result).toEqual({ status: 'Ok' });
    });

    it('handles user data with boolean false values', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const userDataWithFalseValues: UserFormData = {
        ...mockUserData,
        selfreporting: false,
        isenabled: false
      };

      const result = await saveUser(userDataWithFalseValues);
      expect(result).toEqual({ status: 'Ok' });
    });

    it('handles special characters in string fields', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const specialCharData: UserFormData = {
        ...mockUserData,
        firstname: "John'O\"Connor",
        lastname: 'Doe-Smith',
        emailid: 'john+test@example.com'
      };

      const result = await saveUser(specialCharData);
      expect(result).toEqual({ status: 'Ok' });
    });
  });
});
