// Mock apiClientUtils before importing roleService
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
};

jest.mock('../../src/utils/apiClientUtils', () => ({
  createApiClient: jest.fn(() => mockApiClient)
}));

// Import after mocks are set up
import { roleService, Role, RoleCreateRequest, RoleUpdateRequest } from '../../src/services/roleService';

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('roleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockApiClient.get.mockResolvedValue({ data: {} });
    mockApiClient.post.mockResolvedValue({ data: {} });
    mockApiClient.put.mockResolvedValue({ data: {} });
    mockApiClient.patch.mockResolvedValue({ data: {} });
    mockApiClient.delete.mockResolvedValue({ data: {} });
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('getRoles', () => {
    it('should fetch roles successfully', async () => {
      const mockResponse = {
        data: {
          roles: [
            { id: 1, rolename: 'Admin', status: 'Active', isenabled: true, softdelete: false, islocked: false },
            { id: 2, rolename: 'User', status: 'Active', isenabled: true, softdelete: false, islocked: false }
          ],
          totalCount: 2,
          activeCount: 2,
          inactiveCount: 0
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await roleService.getRoles();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiClient.get).toHaveBeenCalledWith('/roles', { params: undefined });
    });

    it('should fetch roles with params', async () => {
      const mockResponse = {
        data: {
          roles: [],
          totalCount: 0,
          activeCount: 0,
          inactiveCount: 0
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const params = { page: 1, limit: 10, search: 'Admin', status: 'Active', department: 'IT' };
      await roleService.getRoles(params);

      expect(mockApiClient.get).toHaveBeenCalledWith('/roles', { params });
    });

    it('should handle error', async () => {
      const mockError = new Error('Network error');
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(roleService.getRoles()).rejects.toThrow('Network error');
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching roles:', mockError);
    });
  });

  describe('getRoleById', () => {
    it('should fetch role by id successfully', async () => {
      const mockResponse = {
        data: { id: 1, rolename: 'Admin', status: 'Active', isenabled: true, softdelete: false, islocked: false }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await roleService.getRoleById(1);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiClient.get).toHaveBeenCalledWith('/roles/1');
    });

    it('should handle error', async () => {
      const mockError = new Error('Not found');
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(roleService.getRoleById(999)).rejects.toThrow('Not found');
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching role:', mockError);
    });
  });

  describe('createRole', () => {
    it('should create role successfully', async () => {
      const roleData: RoleCreateRequest = {
        rolename: 'New Role',
        department: 'IT',
        roledescription: 'New role description',
        status: 'Active',
        isenabled: true
      };
      const mockResponse = {
        data: { id: 3, ...roleData, softdelete: false, islocked: false }
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await roleService.createRole(roleData);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiClient.post).toHaveBeenCalledWith('/roles', roleData);
    });

    it('should handle error', async () => {
      const roleData: RoleCreateRequest = {
        rolename: 'New Role',
        status: 'Active',
        isenabled: true
      };
      const mockError = new Error('Validation error');
      mockApiClient.post.mockRejectedValue(mockError);

      await expect(roleService.createRole(roleData)).rejects.toThrow('Validation error');
      expect(mockConsoleError).toHaveBeenCalledWith('Error creating role:', mockError);
    });
  });

  describe('updateRole', () => {
    it('should update role successfully', async () => {
      const roleData: RoleUpdateRequest = {
        id: 1,
        rolename: 'Updated Role',
        status: 'Active'
      };
      const mockResponse = {
        data: { id: 1, ...roleData, isenabled: true, softdelete: false, islocked: false }
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await roleService.updateRole(1, roleData);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiClient.put).toHaveBeenCalledWith('/roles/1', roleData);
    });

    it('should handle error', async () => {
      const roleData: RoleUpdateRequest = {
        id: 1,
        rolename: 'Updated Role'
      };
      const mockError = new Error('Update failed');
      mockApiClient.put.mockRejectedValue(mockError);

      await expect(roleService.updateRole(1, roleData)).rejects.toThrow('Update failed');
      expect(mockConsoleError).toHaveBeenCalledWith('Error updating role:', mockError);
    });
  });

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await roleService.deleteRole(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/roles/1');
    });

    it('should handle error', async () => {
      const mockError = new Error('Delete failed');
      mockApiClient.delete.mockRejectedValue(mockError);

      await expect(roleService.deleteRole(1)).rejects.toThrow('Delete failed');
      expect(mockConsoleError).toHaveBeenCalledWith('Error deleting role:', mockError);
    });
  });

  describe('toggleRoleStatus', () => {
    it('should toggle role status successfully', async () => {
      const mockResponse = {
        data: { id: 1, rolename: 'Admin', status: 'Active', isenabled: true, softdelete: false, islocked: false }
      };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await roleService.toggleRoleStatus(1, true);

      expect(result).toEqual(mockResponse.data);
      expect(mockApiClient.patch).toHaveBeenCalledWith('/roles/1/status', { isEnabled: true });
    });

    it('should handle error', async () => {
      const mockError = new Error('Toggle failed');
      mockApiClient.patch.mockRejectedValue(mockError);

      await expect(roleService.toggleRoleStatus(1, false)).rejects.toThrow('Toggle failed');
      expect(mockConsoleError).toHaveBeenCalledWith('Error toggling role status:', mockError);
    });
  });

  describe('getRoleCount', () => {
    it('should get role count successfully', async () => {
      const mockResponse = {
        data: { count: 5 }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await roleService.getRoleCount();

      expect(result).toEqual(mockResponse.data);
      expect(mockApiClient.get).toHaveBeenCalledWith('/roles/count');
    });

    it('should handle error', async () => {
      const mockError = new Error('Count failed');
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(roleService.getRoleCount()).rejects.toThrow('Count failed');
      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching role count:', mockError);
    });
  });
});

