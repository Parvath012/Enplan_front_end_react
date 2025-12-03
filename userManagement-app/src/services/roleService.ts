// Role interface based on the provided table schema
export interface Role {
  id?: number;
  rolename: string;
  department?: string;
  roledescription?: string;
  status: string;
  parentattribute?: any;
  permissions?: any;
  createdat?: string;
  lastupdatedat?: string;
  isenabled: boolean;
  createdby?: string;
  updatedby?: string;
  softdelete: boolean;
  islocked: boolean;
  lockedby?: string;
  lockeddate?: string;
}

export interface RoleCreateRequest {
  rolename: string;
  department?: string;
  roledescription?: string;
  status: string;
  parentattribute?: any;
  permissions?: any;
  isenabled: boolean;
  createdby?: string;
}

export interface RoleUpdateRequest extends Partial<RoleCreateRequest> {
  id: number;
  updatedby?: string;
}

export interface RoleListResponse {
  roles: Role[];
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

import { createApiClient } from '../utils/apiClientUtils';

// Create axios instance with default config
const apiClient = createApiClient();

class RoleService {
  // Get all roles with pagination and filtering
  async getRoles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department?: string;
  }): Promise<RoleListResponse> {
    try {
      const response = await apiClient.get('/roles', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  // Get role by ID
  async getRoleById(id: number): Promise<Role> {
    try {
      const response = await apiClient.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  // Create new role
  async createRole(roleData: RoleCreateRequest): Promise<Role> {
    try {
      const response = await apiClient.post('/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  // Update existing role
  async updateRole(id: number, roleData: RoleUpdateRequest): Promise<Role> {
    try {
      const response = await apiClient.put(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  // Delete role
  async deleteRole(id: number): Promise<void> {
    try {
      await apiClient.delete(`/roles/${id}`);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  // Toggle role status (active/inactive)
  async toggleRoleStatus(id: number, isEnabled: boolean): Promise<Role> {
    try {
      const response = await apiClient.patch(`/roles/${id}/status`, { isEnabled });
      return response.data;
    } catch (error) {
      console.error('Error toggling role status:', error);
      throw error;
    }
  }

  // Get role count (for checking if roles exist)
  async getRoleCount(): Promise<{ count: number }> {
    try {
      const response = await apiClient.get('/roles/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching role count:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const roleService = new RoleService();
export default roleService;

