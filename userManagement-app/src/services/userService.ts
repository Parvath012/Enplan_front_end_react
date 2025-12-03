// User interface based on the provided table schema
export interface User {
  id?: number;
  firstname: string;
  lastname: string;
  phonenumber?: string;
  role: string;
  department?: string;
  emailid: string;
  reportingmanager?: string;
  dottedorprojectmanager?: string;
  selfreporting?: string;
  regions?: any;
  countries?: any;
  divisions?: any;
  groups?: any;
  departments?: any;
  class?: any;
  subClass?: any;
  permissions?: any;
  createdat?: string;
  lastupdatedat?: string;
  status: string;
  isenabled: boolean;
  createdby?: string;
  lastupdatedby?: string;
  transferedby?: string;
  transferedto?: string;
  transfereddate?: string;
}

export interface UserCreateRequest {
  firstname: string;
  lastname: string;
  phonenumber?: string;
  role: string;
  department?: string;
  emailid: string;
  reportingmanager?: string;
  dottedorprojectmanager?: string;
  selfreporting?: string;
  regions?: any;
  countries?: any;
  divisions?: any;
  groups?: any;
  departments?: any;
  class?: any;
  subClass?: any;
  permissions?: any;
  status: string;
  isenabled: boolean;
  createdby?: string;
}

export interface UserUpdateRequest extends Partial<UserCreateRequest> {
  id: number;
  lastupdatedby?: string;
}

export interface UserListResponse {
  users: User[];
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

import { createApiClient } from '../utils/apiClientUtils';

// Create axios instance with default config
const apiClient = createApiClient();

class UserService {
  // Get all users with pagination and filtering
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
    department?: string;
  }): Promise<UserListResponse> {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData: UserCreateRequest): Promise<User> {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update existing user
  async updateUser(id: number, userData: UserUpdateRequest): Promise<User> {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id: number): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Toggle user status (active/inactive)
  async toggleUserStatus(id: number, isEnabled: boolean): Promise<User> {
    try {
      const response = await apiClient.patch(`/users/${id}/status`, { isEnabled });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  // Get user count (for checking if users exist)
  async getUserCount(): Promise<{ count: number }> {
    try {
      const response = await apiClient.get('/users/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching user count:', error);
      throw error;
    }
  }

  // Bulk upload users
  async bulkUploadUsers(file: File): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/users/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk uploading users:', error);
      throw error;
    }
  }

  // Get available roles
  async getRoles(): Promise<{ value: string; label: string }[]> {
    try {
      const response = await apiClient.get('/roles');
      return response.data.map((role: any) => ({
        value: role.name,
        label: role.name,
      }));
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Return default roles if API fails
      return [
        { value: 'Admin', label: 'Admin' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Employee', label: 'Employee' },
        { value: 'Supervisor', label: 'Supervisor' },
      ];
    }
  }

  // Get available departments
  async getDepartments(): Promise<{ value: string; label: string }[]> {
    try {
      const response = await apiClient.get('/departments');
      return response.data.map((dept: any) => ({
        value: dept.name,
        label: dept.name,
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Return default departments if API fails
      return [
        { value: 'IT', label: 'IT' },
        { value: 'HR', label: 'HR' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Operations', label: 'Operations' },
        { value: 'Marketing', label: 'Marketing' },
      ];
    }
  }

  // Get available users for reporting manager selection
  async getUsersForReporting(): Promise<{ value: string; label: string }[]> {
    try {
      const response = await apiClient.get('/users/for-reporting');
      return response.data.map((user: User) => ({
        value: `${user.firstname} ${user.lastname}`,
        label: `${user.firstname} ${user.lastname}`,
      }));
    } catch (error) {
      console.error('Error fetching users for reporting:', error);
      return [];
    }
  }

  // Validate email uniqueness
  async validateEmail(email: string, excludeId?: number): Promise<{ isValid: boolean; message?: string }> {
    try {
      const response = await apiClient.post('/users/validate-email', { email, excludeId });
      return response.data;
    } catch (error) {
      console.error('Error validating email:', error);
      return { isValid: false, message: 'Error validating email' };
    }
  }
}

// User Hierarchy interface - matches API response structure
// Note: This interface is shared between userService and reportingStructureService
export interface UserHierarchyModel {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  department?: string;
  reportingManager?: UserHierarchyModel[];
}

// Export singleton instance
export const userService = new UserService();
export default userService;
