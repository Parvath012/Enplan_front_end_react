/**
 * Comprehensive tests for roleSaveService
 */
import {
  saveRole,
  buildRoleCsv,
  saveRoleStatusToggle,
  softDeleteRole,
  updateRoleLockStatus,
  OperationType
} from '../../src/services/roleSaveService';
import type { RoleFormData } from '../../src/types/RoleFormData';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn()
}));

// Mock saveServiceUtils
jest.mock('../../src/utils/saveServiceUtils', () => ({
  quoteString: jest.fn((val) => val === undefined || val === null ? 'NULL' : `'${val}'`),
  formatTimestamp: jest.fn(() => "'2023-10-27 12:00:00'"),
  quoteJSON: jest.fn((val) => val === undefined || val === null ? 'NULL' : `'${JSON.stringify(val)}'`),
  getSaveEndpoint: jest.fn(() => 'https://test-api.com/save')
}));

// Mock serviceUtils
jest.mock('../../src/services/serviceUtils', () => ({
  logCsvData: jest.fn(),
  logOperationStart: jest.fn(),
  logOperationEnd: jest.fn()
}));

import axios from 'axios';

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('roleSaveService', () => {
  const mockRoleData: RoleFormData = {
    roleName: 'Admin',
    department: 'IT',
    roleDescription: 'Administrator role',
    status: 'Active',
    parentAttribute: ['Region', 'Country'],
    permissions: {
      enabledModules: ['Module1', 'Module2'],
      selectedPermissions: ['perm1', 'perm2'],
      activeModule: null,
      activeSubmodule: null
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (axios.post as jest.Mock).mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('buildRoleCsv', () => {
    it('should build CSV for new role operation', () => {
      const result = buildRoleCsv(mockRoleData, 'n');
      
      expect(result.headers).toContain('_ops');
      expect(result.headers).toContain('id');
      expect(result.headers).toContain('rolename');
      expect(result.headers).toContain('status');
      expect(result.headers).toContain('isenabled');
      expect(result.headers).toContain('createdat');
      expect(result.row).toContain('n');
      expect(result.row).toContain("'Admin'");
      expect(result.row).toContain("'Active'");
      expect(result.row).toContain('true');
    });

    it('should build CSV for update operation with id', () => {
      const roleWithId: RoleFormData = {
        ...mockRoleData,
        id: 123
      };
      
      const result = buildRoleCsv(roleWithId, 'u');
      
      expect(result.headers).toContain('_ops');
      expect(result.headers).toContain('id');
      expect(result.row).toContain('u');
      expect(result.row).toContain('123');
      expect(result.headers).toContain('lastupdatedat');
      expect(result.headers).toContain('updatedby');
    });

    it('should throw error for update operation without id', () => {
      expect(() => buildRoleCsv(mockRoleData, 'u')).toThrow('id is required for update/delete operations');
    });

    it('should throw error for delete operation without id', () => {
      expect(() => buildRoleCsv(mockRoleData, 'd')).toThrow('id is required for update/delete operations');
    });

    it('should include optional fields when provided', () => {
      const result = buildRoleCsv(mockRoleData, 'n');
      
      expect(result.headers).toContain('department');
      expect(result.headers).toContain('roledescription');
      expect(result.headers).toContain('parentattribute');
      expect(result.headers).toContain('permissions');
    });

    it('should exclude optional fields when not provided', () => {
      const minimalRole: RoleFormData = {
        roleName: 'Test',
        department: '',
        roleDescription: '',
        status: 'Active',
        parentAttribute: []
      };
      
      const result = buildRoleCsv(minimalRole, 'n');
      
      expect(result.headers).not.toContain('department');
      expect(result.headers).not.toContain('roledescription');
      expect(result.headers).not.toContain('parentattribute');
    });

    it('should set isenabled to false for Inactive status', () => {
      const inactiveRole: RoleFormData = {
        ...mockRoleData,
        status: 'Inactive'
      };
      
      const result = buildRoleCsv(inactiveRole, 'n');
      
      expect(result.row).toContain('false');
    });

    it('should handle empty parentAttribute array', () => {
      const roleWithoutParent: RoleFormData = {
        ...mockRoleData,
        parentAttribute: []
      };
      
      const result = buildRoleCsv(roleWithoutParent, 'n');
      
      expect(result.headers).not.toContain('parentattribute');
    });

    it('should include permissions when arrays are empty', () => {
      const roleWithEmptyPerms: RoleFormData = {
        ...mockRoleData,
        permissions: {
          enabledModules: [],
          selectedPermissions: [],
          activeModule: null,
          activeSubmodule: null
        }
      };
      
      const result = buildRoleCsv(roleWithEmptyPerms, 'n');
      
      expect(result.headers).toContain('permissions');
    });

    it('should handle delete operation', () => {
      const roleWithId: RoleFormData = {
        ...mockRoleData,
        id: 999
      };
      
      const result = buildRoleCsv(roleWithId, 'd');
      
      expect(result.row).toContain('d');
      expect(result.row).toContain('999');
    });
  });

  describe('saveRole', () => {
    it('should save role successfully', async () => {
      const mockResponse = {
        data: { status: 'Ok', message: 'Role saved successfully' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveRole(mockRoleData, 'n');

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith(
        'https://test-api.com/save',
        expect.objectContaining({
          tableName: 'role',
          hasHeaders: true,
          uniqueColumn: 'id'
        })
      );
    });

    it('should handle error response', async () => {
      const mockResponse = {
        data: { status: 'Error', message: 'Failed to save role' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(saveRole(mockRoleData, 'n')).rejects.toThrow('Failed to save role');
    });

    it('should handle error response without message', async () => {
      const mockResponse = {
        data: { status: 'Error' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(saveRole(mockRoleData, 'n')).rejects.toThrow('Failed to save role');
    });

    it('should handle axios error', async () => {
      const mockError = new Error('Network error');
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(saveRole(mockRoleData, 'n')).rejects.toThrow('Network error');
    });

    it('should handle success response with Success status', async () => {
      const mockResponse = {
        data: { status: 'Success', message: 'Role saved' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveRole(mockRoleData, 'n');

      expect(result).toEqual(mockResponse.data);
    });

    it('should save role with update operation', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const roleWithId: RoleFormData = {
        ...mockRoleData,
        id: 123
      };

      await saveRole(roleWithId, 'u');

      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('saveRoleStatusToggle', () => {
    it('should toggle role status to enabled successfully', async () => {
      const mockResponse = {
        data: { status: 'Ok', message: 'Status updated' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveRoleStatusToggle(123, true);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalled();
    });

    it('should toggle role status to disabled successfully', async () => {
      const mockResponse = {
        data: { status: 'Success', message: 'Status updated' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await saveRoleStatusToggle(456, false);

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error response', async () => {
      const mockResponse = {
        data: { status: 'Error', message: 'Status update failed' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(saveRoleStatusToggle(123, true)).rejects.toThrow('Status update failed');
    });

    it('should handle error response without message', async () => {
      const mockResponse = {
        data: { status: 'Error' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(saveRoleStatusToggle(123, true)).rejects.toThrow('Failed to update role status');
    });

    it('should handle axios error', async () => {
      const mockError = new Error('Network error');
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(saveRoleStatusToggle(123, true)).rejects.toThrow('Network error');
    });

    it('should build correct CSV for status toggle', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await saveRoleStatusToggle(789, true);

      const callArgs = (axios.post as jest.Mock).mock.calls[0];
      expect(callArgs[1].csvData).toHaveLength(2);
      expect(callArgs[1].csvData[0]).toContain('_ops');
      expect(callArgs[1].csvData[0]).toContain('id');
      expect(callArgs[1].csvData[0]).toContain('isenabled');
      expect(callArgs[1].csvData[0]).toContain('status');
      expect(callArgs[1].csvData[1]).toContain('u');
      expect(callArgs[1].csvData[1]).toContain('789');
      expect(callArgs[1].csvData[1]).toContain('true');
      expect(callArgs[1].csvData[1]).toContain("'Active'");
    });
  });

  describe('softDeleteRole', () => {
    it('should soft delete role successfully', async () => {
      const mockResponse = {
        data: { status: 'Ok', message: 'Role deleted successfully' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await softDeleteRole(123);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalled();
    });

    it('should handle error response', async () => {
      const mockResponse = {
        data: { status: 'Error', message: 'Failed to delete role' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(softDeleteRole(123)).rejects.toThrow('Failed to delete role');
    });

    it('should handle axios error', async () => {
      const mockError = new Error('Network error');
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(softDeleteRole(123)).rejects.toThrow('Network error');
    });

    it('should build correct CSV for soft delete', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await softDeleteRole(456);

      const callArgs = (axios.post as jest.Mock).mock.calls[0];
      expect(callArgs[1].csvData).toHaveLength(2);
      expect(callArgs[1].csvData[0]).toContain('_ops');
      expect(callArgs[1].csvData[0]).toContain('id');
      expect(callArgs[1].csvData[0]).toContain('softdelete');
      expect(callArgs[1].csvData[1]).toContain('u');
      expect(callArgs[1].csvData[1]).toContain('456');
      expect(callArgs[1].csvData[1]).toContain('true');
    });
  });

  describe('updateRoleLockStatus', () => {
    it('should update role lock status to locked successfully', async () => {
      const mockResponse = {
        data: { status: 'Ok', message: 'Lock status updated' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateRoleLockStatus(123, true);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalled();
    });

    it('should update role lock status to unlocked successfully', async () => {
      const mockResponse = {
        data: { status: 'Success', message: 'Lock status updated' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateRoleLockStatus(456, false);

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle error response', async () => {
      const mockResponse = {
        data: { status: 'Error', message: 'Lock status update failed' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(updateRoleLockStatus(123, true)).rejects.toThrow('Lock status update failed');
    });

    it('should handle error response without message', async () => {
      const mockResponse = {
        data: { status: 'Error' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(updateRoleLockStatus(123, true)).rejects.toThrow('Failed to update role lock status');
    });

    it('should handle axios error', async () => {
      const mockError = new Error('Network error');
      (axios.post as jest.Mock).mockRejectedValue(mockError);

      await expect(updateRoleLockStatus(123, true)).rejects.toThrow('Network error');
    });

    it('should build correct CSV for lock status update when locked', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await updateRoleLockStatus(789, true);

      const callArgs = (axios.post as jest.Mock).mock.calls[0];
      expect(callArgs[1].csvData).toHaveLength(2);
      expect(callArgs[1].csvData[0]).toContain('_ops');
      expect(callArgs[1].csvData[0]).toContain('id');
      expect(callArgs[1].csvData[0]).toContain('islocked');
      expect(callArgs[1].csvData[0]).toContain('lockedby');
      expect(callArgs[1].csvData[0]).toContain('lockeddate');
      expect(callArgs[1].csvData[1]).toContain('u');
      expect(callArgs[1].csvData[1]).toContain('789');
      expect(callArgs[1].csvData[1]).toContain('true');
    });

    it('should build correct CSV for lock status update when unlocked', async () => {
      const mockResponse = {
        data: { status: 'Ok' }
      };
      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      await updateRoleLockStatus(789, false);

      const callArgs = (axios.post as jest.Mock).mock.calls[0];
      expect(callArgs[1].csvData[1]).toContain('false');
      expect(callArgs[1].csvData[1]).toContain('NULL');
    });
  });
});
