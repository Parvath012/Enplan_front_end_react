import { configureStore } from '@reduxjs/toolkit';
import roleReducer, {
  fetchRoles,
  createRole,
  toggleRoleStatus,
  clearRoles,
  updateRoleIsEnabled
} from '../../../src/store/Reducers/roleSlice';
import { roleService, Role } from '../../../src/services/roleService';
import { fetchRolesFromApi } from '../../../src/services/roleFetchService';
import { fetchUsersFromApi } from '../../../src/services/userFetchService';
import { syncAllRolesLockStatus, isRoleAssignedToUsers } from '../../../src/utils/roleLockUtils';

// Mock the services
jest.mock('../../../src/services/roleService', () => ({
  roleService: {
    createRole: jest.fn()
  },
  Role: {}
}));

jest.mock('../../../src/services/roleFetchService', () => ({
  fetchRolesFromApi: jest.fn()
}));

jest.mock('../../../src/services/userFetchService', () => ({
  fetchUsersFromApi: jest.fn()
}));

jest.mock('../../../src/services/roleSaveService', () => ({
  saveRoleStatusToggle: jest.fn()
}));

jest.mock('../../../src/utils/roleLockUtils', () => ({
  syncAllRolesLockStatus: jest.fn(),
  isRoleAssignedToUsers: jest.fn()
}));

const mockedRoleService = roleService as jest.Mocked<typeof roleService>;
const mockedFetchRolesFromApi = fetchRolesFromApi as jest.MockedFunction<typeof fetchRolesFromApi>;
const mockedFetchUsersFromApi = fetchUsersFromApi as jest.MockedFunction<typeof fetchUsersFromApi>;
const mockedSyncAllRolesLockStatus = syncAllRolesLockStatus as jest.MockedFunction<typeof syncAllRolesLockStatus>;
const mockedIsRoleAssignedToUsers = isRoleAssignedToUsers as jest.MockedFunction<typeof isRoleAssignedToUsers>;

describe('roleSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        roles: roleReducer
      }
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().roles as ReturnType<typeof roleReducer>;
      expect(state).toEqual({
        roles: [],
        loading: false,
        error: null,
        hasRoles: false,
        initialFetchAttempted: false
      });
    });
  });

  describe('fetchRoles', () => {
    it('should handle fetchRoles.pending', () => {
      store.dispatch(fetchRoles.pending('', undefined));
      const state = store.getState().roles as ReturnType<typeof roleReducer>;
      
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.initialFetchAttempted).toBe(true);
    });

    it('should handle fetchRoles.fulfilled with roles', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: ['Region'],
          permissions: { enabledModules: ['Module1'] },
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: false,
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      const mockUsers = [
        {
          id: '1',
          firstname: 'John',
          lastname: 'Doe',
          role: 'Admin',
          emailid: 'john@example.com',
          status: 'Active',
          isenabled: true,
          createdat: '2023-01-01',
          phonenumber: '1234567890',
          department: 'IT',
          reportingmanager: '',
          dottedorprojectmanager: '',
          selfreporting: true,
          lastupdatedat: '',
          createdby: '',
          lastupdatedby: '',
          transferedby: '',
          transferedto: '',
          transfereddate: '',
          regions: [],
          countries: [],
          divisions: [],
          groups: [],
          departments: [],
          class: '',
          subClass: '',
          permissions: {}
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      mockedIsRoleAssignedToUsers.mockReturnValue(true);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.loading).toBe(false);
      expect(state.roles).toHaveLength(1);
      expect(state.roles[0]).toEqual({
        id: 1,
        rolename: 'Admin',
        department: 'IT',
        roledescription: 'Administrator',
        status: 'Active',
        parentattribute: ['Region'],
        permissions: { enabledModules: ['Module1'] },
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        isenabled: true,
        createdby: 'Admin',
        updatedby: 'Admin',
        softdelete: false,
        islocked: true,
        lockedby: '',
        lockeddate: ''
      });
      expect(state.hasRoles).toBe(true);
      expect(mockedSyncAllRolesLockStatus).toHaveBeenCalled();
    });

    it('should handle fetchRoles.fulfilled with empty array', async () => {
      mockedFetchRolesFromApi.mockResolvedValue([]);
      mockedFetchUsersFromApi.mockResolvedValue([]);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.loading).toBe(false);
      expect(state.roles).toEqual([]);
      expect(state.hasRoles).toBe(false);
    });

    it('should handle fetchRoles.rejected', async () => {
      const errorMessage = 'Network error';
      mockedFetchRolesFromApi.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should convert role data correctly with nullish coalescing', async () => {
      const mockRoles = [
        {
          id: '2',
          rolename: 'User',
          department: undefined,
          roledescription: undefined,
          status: 'Inactive',
          parentattribute: undefined,
          permissions: undefined,
          createdat: '2023-01-01',
          lastupdatedat: undefined,
          isenabled: false,
          createdby: undefined,
          updatedby: undefined,
          softdelete: false,
          islocked: false,
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue([]);
      mockedIsRoleAssignedToUsers.mockReturnValue(false);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.roles[0]).toEqual({
        id: 2,
        rolename: 'User',
        department: '',
        roledescription: '',
        status: 'Inactive',
        parentattribute: undefined,
        permissions: undefined,
        createdat: '2023-01-01',
        lastupdatedat: '',
        isenabled: false,
        createdby: '',
        updatedby: '',
        softdelete: false,
        islocked: false,
        lockedby: '',
        lockeddate: ''
      });
    });

    it('should handle user conversion with selfreporting as true', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: [],
          permissions: {},
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: false,
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      const mockUsers = [
        {
          id: '1',
          firstname: 'John',
          lastname: 'Doe',
          role: 'Admin',
          emailid: 'john@example.com',
          status: 'Active',
          isenabled: true,
          createdat: '2023-01-01',
          phonenumber: '1234567890',
          department: 'IT',
          reportingmanager: '',
          dottedorprojectmanager: '',
          selfreporting: true,
          lastupdatedat: '',
          createdby: '',
          lastupdatedby: '',
          transferedby: '',
          transferedto: '',
          transfereddate: '',
          regions: [],
          countries: [],
          divisions: [],
          groups: [],
          departments: [],
          class: '',
          subClass: '',
          permissions: {}
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      mockedIsRoleAssignedToUsers.mockReturnValue(false);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);

      expect(mockedFetchUsersFromApi).toHaveBeenCalled();
    });

    it('should handle user conversion with selfreporting as string "true"', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: [],
          permissions: {},
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: false,
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      const mockUsers = [
        {
          id: '1',
          firstname: 'John',
          lastname: 'Doe',
          role: 'Admin',
          emailid: 'john@example.com',
          status: 'Active',
          isenabled: true,
          createdat: '2023-01-01',
          phonenumber: '1234567890',
          department: 'IT',
          reportingmanager: '',
          dottedorprojectmanager: '',
          selfreporting: true,
          lastupdatedat: '',
          createdby: '',
          lastupdatedby: '',
          transferedby: '',
          transferedto: '',
          transfereddate: '',
          regions: [],
          countries: [],
          divisions: [],
          groups: [],
          departments: [],
          class: '',
          subClass: '',
          permissions: {}
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      mockedIsRoleAssignedToUsers.mockReturnValue(false);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);

      expect(mockedFetchUsersFromApi).toHaveBeenCalled();
    });

    it('should handle user conversion with selfreporting as string "1"', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: [],
          permissions: {},
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: false,
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      const mockUsers = [
        {
          id: '1',
          firstname: 'John',
          lastname: 'Doe',
          role: 'Admin',
          emailid: 'john@example.com',
          status: 'Active',
          isenabled: true,
          createdat: '2023-01-01',
          phonenumber: '1234567890',
          department: 'IT',
          reportingmanager: '',
          dottedorprojectmanager: '',
          selfreporting: true,
          lastupdatedat: '',
          createdby: '',
          lastupdatedby: '',
          transferedby: '',
          transferedto: '',
          transfereddate: '',
          regions: [],
          countries: [],
          divisions: [],
          groups: [],
          departments: [],
          class: '',
          subClass: '',
          permissions: {}
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      mockedIsRoleAssignedToUsers.mockReturnValue(false);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);

      expect(mockedFetchUsersFromApi).toHaveBeenCalled();
    });

    it('should handle role lock status conversion with string "true"', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: [],
          permissions: {},
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: 'true',
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue([]);
      mockedIsRoleAssignedToUsers.mockReturnValue(false);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(mockedSyncAllRolesLockStatus).toHaveBeenCalled();
      expect(state.roles[0].islocked).toBe(false); // Calculated value, not original
    });

    it('should handle role lock status conversion with string "false"', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: [],
          permissions: {},
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: 'false',
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue([]);
      mockedIsRoleAssignedToUsers.mockReturnValue(true);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(mockedSyncAllRolesLockStatus).toHaveBeenCalled();
      expect(state.roles[0].islocked).toBe(true); // Calculated value
    });

    it('should handle role lock status conversion with string "1"', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: [],
          permissions: {},
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: '1',
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue([]);
      mockedIsRoleAssignedToUsers.mockReturnValue(false);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);

      expect(mockedSyncAllRolesLockStatus).toHaveBeenCalled();
    });

    it('should handle role lock status conversion with number 1', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: [],
          permissions: {},
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: 1,
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue([]);
      mockedIsRoleAssignedToUsers.mockReturnValue(false);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);

      expect(mockedSyncAllRolesLockStatus).toHaveBeenCalled();
    });

    it('should handle role lock status conversion with number 0', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: [],
          permissions: {},
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: 0,
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue([]);
      mockedIsRoleAssignedToUsers.mockReturnValue(true);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(mockedSyncAllRolesLockStatus).toHaveBeenCalled();
      expect(state.roles[0].islocked).toBe(true); // Calculated value
    });

    it('should handle role lock status conversion with boolean false', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: [],
          permissions: {},
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: false,
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue([]);
      mockedIsRoleAssignedToUsers.mockReturnValue(true);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(mockedSyncAllRolesLockStatus).toHaveBeenCalled();
      expect(state.roles[0].islocked).toBe(true); // Calculated value
    });

    it('should handle role lock status conversion with invalid type defaulting to false', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: [],
          permissions: {},
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: 'invalid' as any,
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue([]);
      mockedIsRoleAssignedToUsers.mockReturnValue(false);
      mockedSyncAllRolesLockStatus.mockResolvedValue(undefined);

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(mockedSyncAllRolesLockStatus).toHaveBeenCalled();
      expect(state.roles[0].islocked).toBe(false);
    });

    it('should handle sync error gracefully', async () => {
      const mockRoles = [
        {
          id: '1',
          rolename: 'Admin',
          department: 'IT',
          roledescription: 'Administrator',
          status: 'Active',
          parentattribute: [],
          permissions: {},
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isenabled: true,
          createdby: 'Admin',
          updatedby: 'Admin',
          softdelete: false,
          islocked: false,
          lockedby: undefined,
          lockeddate: undefined
        }
      ];

      mockedFetchRolesFromApi.mockResolvedValue(mockRoles);
      mockedFetchUsersFromApi.mockResolvedValue([]);
      mockedIsRoleAssignedToUsers.mockReturnValue(false);
      mockedSyncAllRolesLockStatus.mockRejectedValue(new Error('Sync failed'));

      jest.spyOn(console, 'error').mockImplementation(() => {});

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.loading).toBe(false);
      expect(state.roles).toHaveLength(1);
      expect(console.error).toHaveBeenCalledWith(
        '❌ Error syncing role lock status in background:',
        expect.any(Error)
      );

      (console.error as jest.Mock).mockRestore();
    });
  });

  describe('createRole', () => {
    it('should handle createRole.pending', () => {
      store.dispatch(createRole.pending('', {}));
      const state = store.getState().roles as ReturnType<typeof roleReducer>;
      
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle createRole.fulfilled', async () => {
      const newRole: Role = {
        id: 3,
        rolename: 'New Role',
        department: 'HR',
        roledescription: 'New role',
        status: 'Active',
        isenabled: true,
        softdelete: false,
        islocked: false
      };

      mockedRoleService.createRole.mockResolvedValue(newRole);

      await store.dispatch(createRole({}));
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.loading).toBe(false);
      expect(state.roles).toContain(newRole);
    });

    it('should handle createRole.rejected', async () => {
      const errorMessage = 'Failed to create role';
      mockedRoleService.createRole.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(createRole({}) as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('toggleRoleStatus', () => {
    it('should handle toggleRoleStatus.pending', () => {
      store.dispatch(toggleRoleStatus.pending('', { id: 1, isEnabled: true }));
      const state = store.getState().roles as ReturnType<typeof roleReducer>;
      
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle toggleRoleStatus.fulfilled', async () => {
      // First add a role to the state
      store.dispatch(fetchRoles.fulfilled([{
        id: 1,
        rolename: 'Admin',
        department: 'IT',
        roledescription: 'Administrator',
        status: 'Active',
        parentattribute: [],
        permissions: {},
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        isenabled: true,
        createdby: 'Admin',
        updatedby: 'Admin',
        softdelete: false,
        islocked: false
      }], ''));

      const { saveRoleStatusToggle } = await import('../../../src/services/roleSaveService');
      (saveRoleStatusToggle as jest.Mock).mockResolvedValue({});

      await store.dispatch(toggleRoleStatus({ id: 1, isEnabled: false }) as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.loading).toBe(false);
      expect(state.roles[0].isenabled).toBe(false);
      expect(state.roles[0].status).toBe('Inactive');
    });

    it('should handle toggleRoleStatus.rejected', async () => {
      const errorMessage = 'Failed to toggle role status';
      const { saveRoleStatusToggle } = await import('../../../src/services/roleSaveService');
      (saveRoleStatusToggle as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await store.dispatch(toggleRoleStatus({ id: 1, isEnabled: true }));
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should handle toggleRoleStatus.fulfilled when role not found', async () => {
      const { saveRoleStatusToggle } = await import('../../../src/services/roleSaveService');
      (saveRoleStatusToggle as jest.Mock).mockResolvedValue({});

      await store.dispatch(toggleRoleStatus({ id: 999, isEnabled: false }));
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.loading).toBe(false);
      expect(state.roles).toEqual([]);
    });

    it('should handle toggleRoleStatus.fulfilled when role found and enabled', async () => {
      mockedFetchRolesFromApi.mockResolvedValue([{
        id: '1',
        rolename: 'Admin',
        department: 'IT',
        roledescription: 'Administrator',
        status: 'Inactive',
        parentattribute: [],
        permissions: {},
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        isenabled: false,
        createdby: 'Admin',
        updatedby: 'Admin',
        softdelete: false,
        islocked: false
      }]);

      await store.dispatch(fetchRoles() as any);
      
      const { saveRoleStatusToggle } = await import('../../../src/services/roleSaveService');
      (saveRoleStatusToggle as jest.Mock).mockResolvedValue({});

      await store.dispatch(toggleRoleStatus({ id: 1, isEnabled: true }));
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.loading).toBe(false);
      expect(state.roles[0].isenabled).toBe(true);
      expect(state.roles[0].status).toBe('Active');
    });

    it('should handle toggleRoleStatus.fulfilled enabling role', async () => {
      store.dispatch(fetchRoles.fulfilled([{
        id: 1,
        rolename: 'Admin',
        department: 'IT',
        roledescription: 'Administrator',
        status: 'Inactive',
        parentattribute: [],
        permissions: {},
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        isenabled: false,
        createdby: 'Admin',
        updatedby: 'Admin',
        softdelete: false,
        islocked: false
      }], ''));

      const { saveRoleStatusToggle } = await import('../../../src/services/roleSaveService');
      (saveRoleStatusToggle as jest.Mock).mockResolvedValue({});

      await store.dispatch(toggleRoleStatus({ id: 1, isEnabled: true }));
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.loading).toBe(false);
      expect(state.roles[0].isenabled).toBe(true);
      expect(state.roles[0].status).toBe('Active');
    });
  });

  describe('Synchronous Actions', () => {
    it('should handle clearRoles', () => {
      // First add some roles
      store.dispatch(fetchRoles.fulfilled([{
        id: 1,
        rolename: 'Admin',
        department: 'IT',
        roledescription: 'Administrator',
        status: 'Active',
        parentattribute: [],
        permissions: {},
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        isenabled: true,
        createdby: 'Admin',
        updatedby: 'Admin',
        softdelete: false,
        islocked: false
      }], ''));

      store.dispatch(clearRoles());
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.roles).toEqual([]);
      expect(state.error).toBeNull();
      expect(state.loading).toBe(false);
    });

    it('should handle updateRoleIsEnabled', () => {
      // First add a role
      store.dispatch(fetchRoles.fulfilled([{
        id: 1,
        rolename: 'Admin',
        department: 'IT',
        roledescription: 'Administrator',
        status: 'Active',
        parentattribute: [],
        permissions: {},
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        isenabled: true,
        createdby: 'Admin',
        updatedby: 'Admin',
        softdelete: false,
        islocked: false
      }], ''));

      store.dispatch(updateRoleIsEnabled({ id: 1, isEnabled: false }));
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.roles[0].isenabled).toBe(false);
    });

    it('should not update role if role not found in updateRoleIsEnabled', () => {
      store.dispatch(updateRoleIsEnabled({ id: 999, isEnabled: false }));
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.roles).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle error messages correctly', async () => {
      const errorMessage = 'Custom error message';
      mockedFetchRolesFromApi.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.error).toBe(errorMessage);
    });

    it('should handle undefined error messages', async () => {
      const errorWithoutMessage = { message: undefined };
      mockedFetchRolesFromApi.mockRejectedValue(errorWithoutMessage);

      await store.dispatch(fetchRoles() as any);
      const state = store.getState().roles as ReturnType<typeof roleReducer>;

      expect(state.error).toBe('Failed to fetch roles');
    });
  });
});

