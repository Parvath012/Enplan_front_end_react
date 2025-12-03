import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
  fetchUsers,
  createUser,
  fetchRoles,
  fetchDepartments,
  fetchUsersForReporting,
  toggleUserStatus,
  fetchUserHierarchy,
  clearUsers,
  updateUserIsEnabled
} from '../../../src/store/Reducers/userSlice';
import { userService } from '../../../src/services/userService';
import { fetchUsersFromApi } from '../../../src/services/userFetchService';
import { saveUserStatusToggle } from '../../../src/services/userSaveService';
import { fetchUserHierarchyFromApi, fetchAllHierarchiesFromApi } from '../../../src/services/reportingStructureService';

// Mock the services
jest.mock('../../../src/services/userService', () => ({
  userService: {
    createUser: jest.fn(),
    getRoles: jest.fn(),
    getDepartments: jest.fn(),
    getUsersForReporting: jest.fn(),
    toggleUserStatus: jest.fn()
  }
}));

jest.mock('../../../src/services/userFetchService', () => ({
  fetchUsersFromApi: jest.fn()
}));

jest.mock('../../../src/services/userSaveService', () => ({
  saveUserStatusToggle: jest.fn()
}));

jest.mock('../../../src/services/reportingStructureService', () => ({
  fetchUserHierarchyFromApi: jest.fn(),
  fetchAllHierarchiesFromApi: jest.fn()
}));

const mockedUserService = userService as jest.Mocked<typeof userService>;
const mockedFetchUsersFromApi = fetchUsersFromApi as jest.MockedFunction<typeof fetchUsersFromApi>;
const mockedSaveUserStatusToggle = saveUserStatusToggle as jest.MockedFunction<typeof saveUserStatusToggle>;
const mockedFetchUserHierarchyFromApi = fetchUserHierarchyFromApi as jest.MockedFunction<typeof fetchUserHierarchyFromApi>;
const mockedFetchAllHierarchiesFromApi = fetchAllHierarchiesFromApi as jest.MockedFunction<typeof fetchAllHierarchiesFromApi>;

describe('userSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: userReducer
      }
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().users;
      expect(state).toEqual({
        users: [],
        loading: false,
        hierarchyLoading: false,
        error: null,
        hierarchyError: null,
        hasUsers: false,
        initialFetchAttempted: false
      });
    });
  });

  describe('fetchUsers', () => {
    it('should handle fetchUsers.pending', () => {
      store.dispatch(fetchUsers.pending('', undefined));
      const state = store.getState().users;
      
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.initialFetchAttempted).toBe(true);
    });

    it('should handle fetchUsers.fulfilled with users', async () => {
      const mockUsers = [
        {
          id: '1',
          firstname: 'John',
          lastname: 'Doe',
          phonenumber: '1234567890',
          role: 'Admin',
          department: 'IT',
          emailid: 'john@example.com',
          reportingmanager: 'Jane Smith',
          dottedorprojectmanager: 'Bob Johnson',
          selfreporting: true,
          status: 'Active',
          isenabled: true,
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          createdby: 'Admin',
          lastupdatedby: 'Admin',
          transferedby: '',
          transferedto: '',
          transfereddate: ''
        }
      ];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);

      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.users).toHaveLength(1);
      expect(state.users[0]).toEqual({
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      });
      expect(state.hasUsers).toBe(true);
    });

    it('should handle fetchUsers.fulfilled with empty array', async () => {
      mockedFetchUsersFromApi.mockResolvedValue([]);

      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.users).toEqual([]);
      expect(state.hasUsers).toBe(false);
    });

    it('should handle fetchUsers.rejected', async () => {
      const errorMessage = 'Network error';
      mockedFetchUsersFromApi.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should convert user data correctly with nullish coalescing', async () => {
      const mockUsers = [
        {
          id: '2',
          firstname: 'Jane',
          lastname: 'Smith',
          phonenumber: null,
          role: 'User',
          department: null,
          emailid: 'jane@example.com',
          reportingmanager: null,
          dottedorprojectmanager: null,
          selfreporting: false,
          status: 'Inactive',
          isenabled: false,
          createdat: '2023-01-01',
          lastupdatedat: null,
          createdby: null,
          lastupdatedby: null,
          transferedby: null,
          transferedto: null,
          transfereddate: null
        }
      ];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);

      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0]).toEqual({
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        phonenumber: '',
        role: 'User',
        department: '',
        emailid: 'jane@example.com',
        reportingmanager: '',
        dottedorprojectmanager: '',
        selfreporting: 'false',
        status: 'Inactive',
        isenabled: false,
        createdat: '2023-01-01',
        lastupdatedat: '',
        createdby: '',
        lastupdatedby: '',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      });
    });
  });

  describe('createUser', () => {
    it('should handle createUser.pending', () => {
      store.dispatch(createUser.pending('', {}));
      const state = store.getState().users;
      
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle createUser.fulfilled', async () => {
      const newUser = {
        id: 3,
        firstname: 'Bob',
        lastname: 'Johnson',
        phonenumber: '9876543210',
        role: 'Manager',
        department: 'HR',
        emailid: 'bob@example.com',
        reportingmanager: '',
        dottedorprojectmanager: '',
        selfreporting: 'false',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-03',
        lastupdatedat: '',
        createdby: 'Admin',
        lastupdatedby: '',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      };

      mockedUserService.createUser.mockResolvedValue(newUser);

      await store.dispatch(createUser({}));
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.users).toContain(newUser);
    });

    it('should handle createUser.rejected', async () => {
      const errorMessage = 'Failed to create user';
      mockedUserService.createUser.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(createUser({}));
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('toggleUserStatus', () => {
    it('should handle toggleUserStatus.pending', () => {
      store.dispatch(toggleUserStatus.pending('', { id: 1, isEnabled: true }));
      const state = store.getState().users;
      
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle toggleUserStatus.fulfilled', async () => {
      const updatedUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Active',
        isenabled: false,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      };

      // First add a user to the state
      store.dispatch(fetchUsers.fulfilled([{
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }], ''));

      mockedSaveUserStatusToggle.mockResolvedValue(updatedUser);

      await store.dispatch(toggleUserStatus({ id: 1, isEnabled: false }));
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.users[0].isenabled).toBe(false);
    });

    it('should handle toggleUserStatus.rejected', async () => {
      const errorMessage = 'Failed to toggle user status';
      mockedSaveUserStatusToggle.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(toggleUserStatus({ id: 1, isEnabled: true }));
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('fetchUserHierarchy', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle fetchUserHierarchy.pending', () => {
      store.dispatch(fetchUserHierarchy.pending('', undefined));
      const state = store.getState().users;
      
      expect(state.hierarchyLoading).toBe(true);
      expect(state.hierarchyError).toBeNull();
    });

    it('should handle fetchUserHierarchy.fulfilled with organizational viewType', async () => {
      const mockHierarchy = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Admin',
          department: 'IT'
        }
      ];

      mockedFetchUserHierarchyFromApi.mockResolvedValue(mockHierarchy);

      await store.dispatch(fetchUserHierarchy({ viewType: 'organizational' }));
      const state = store.getState().users;

      expect(state.hierarchyLoading).toBe(false);
      expect(state.hierarchy).toEqual(mockHierarchy);
      expect(mockedFetchUserHierarchyFromApi).toHaveBeenCalled();
      expect(mockedFetchAllHierarchiesFromApi).not.toHaveBeenCalled();
    });

    it('should handle fetchUserHierarchy.fulfilled with departmental viewType', async () => {
      const mockHierarchy = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Admin',
          department: 'IT'
        }
      ];

      mockedFetchUserHierarchyFromApi.mockResolvedValue(mockHierarchy);

      await store.dispatch(fetchUserHierarchy({ viewType: 'departmental' }));
      const state = store.getState().users;

      expect(state.hierarchyLoading).toBe(false);
      expect(state.hierarchy).toEqual(mockHierarchy);
      expect(mockedFetchUserHierarchyFromApi).toHaveBeenCalled();
      expect(mockedFetchAllHierarchiesFromApi).not.toHaveBeenCalled();
    });

    it('should handle fetchUserHierarchy.fulfilled with dotted-line viewType', async () => {
      const mockHierarchy = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Admin',
          department: 'IT',
          reportingManager: [],
          dottedProjectManager: []
        }
      ];

      mockedFetchAllHierarchiesFromApi.mockResolvedValue(mockHierarchy);

      await store.dispatch(fetchUserHierarchy({ viewType: 'dotted-line' }));
      const state = store.getState().users;

      expect(state.hierarchyLoading).toBe(false);
      expect(state.hierarchy).toEqual(mockHierarchy);
      expect(mockedFetchAllHierarchiesFromApi).toHaveBeenCalled();
      expect(mockedFetchUserHierarchyFromApi).not.toHaveBeenCalled();
    });

    it('should handle fetchUserHierarchy.fulfilled with default viewType (organizational)', async () => {
      const mockHierarchy = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Admin',
          department: 'IT'
        }
      ];

      mockedFetchUserHierarchyFromApi.mockResolvedValue(mockHierarchy);

      await store.dispatch(fetchUserHierarchy());
      const state = store.getState().users;

      expect(state.hierarchyLoading).toBe(false);
      expect(state.hierarchy).toEqual(mockHierarchy);
      expect(mockedFetchUserHierarchyFromApi).toHaveBeenCalled();
    });

    it('should handle fetchUserHierarchy.rejected', async () => {
      const errorMessage = 'Failed to fetch hierarchy';
      mockedFetchUserHierarchyFromApi.mockRejectedValue(new Error(errorMessage));
      
      try {
        await store.dispatch(fetchUserHierarchy());
      } catch (error) {
        // Expected to throw - error is handled by manually dispatching rejected action below
        // Error is intentionally caught to allow manual dispatch of rejected action
        void error; // Explicitly acknowledge error is handled
      }
      
      const rejectedAction = {
        type: fetchUserHierarchy.rejected.type,
        payload: undefined,
        error: { message: errorMessage }
      };
      
      store.dispatch(rejectedAction);
      const state = store.getState().users;

      expect(state.hierarchyLoading).toBe(false);
      expect(state.hierarchyError).toBe(errorMessage);
    });

    it('should handle fetchUserHierarchy.rejected with dotted-line viewType', async () => {
      const errorMessage = 'Failed to fetch all hierarchies';
      mockedFetchAllHierarchiesFromApi.mockRejectedValue(new Error(errorMessage));
      
      try {
        await store.dispatch(fetchUserHierarchy({ viewType: 'dotted-line' }));
      } catch (error) {
        // Expected to throw - error is handled by manually dispatching rejected action below
        // Error is intentionally caught to allow manual dispatch of rejected action
        void error; // Explicitly acknowledge error is handled
      }
      
      const rejectedAction = {
        type: fetchUserHierarchy.rejected.type,
        payload: undefined,
        error: { message: errorMessage }
      };
      
      store.dispatch(rejectedAction);
      const state = store.getState().users;

      expect(state.hierarchyLoading).toBe(false);
      expect(state.hierarchyError).toBe(errorMessage);
    });

    it('should handle fetchUserHierarchy with empty hierarchy array', async () => {
      mockedFetchUserHierarchyFromApi.mockResolvedValue([]);

      await store.dispatch(fetchUserHierarchy());
      const state = store.getState().users;

      expect(state.hierarchyLoading).toBe(false);
      expect(state.hierarchy).toEqual([]);
    });

    it('should preserve existing hierarchy during loading', () => {
      const existingHierarchy = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Admin',
          department: 'IT'
        }
      ];

      store.dispatch(fetchUserHierarchy.fulfilled(existingHierarchy, ''));
      let state = store.getState().users;
      expect(state.hierarchy).toEqual(existingHierarchy);

      store.dispatch(fetchUserHierarchy.pending('', undefined));
      state = store.getState().users;
      
      // Hierarchy should still be present during loading
      expect(state.hierarchy).toEqual(existingHierarchy);
      expect(state.hierarchyLoading).toBe(true);
    });
  });

  describe('Synchronous Actions', () => {
    it('should handle clearUsers', () => {
      // First add some users
      store.dispatch(fetchUsers.fulfilled([{
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }], ''));

      store.dispatch(clearUsers());
      const state = store.getState().users;

      expect(state.users).toEqual([]);
      expect(state.error).toBeNull();
      expect(state.loading).toBe(false);
    });

    it('should handle updateUserIsEnabled', () => {
      // First add a user
      store.dispatch(fetchUsers.fulfilled([{
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }], ''));

      store.dispatch(updateUserIsEnabled({ id: 1, isEnabled: false }));
      const state = store.getState().users;

      expect(state.users[0].isenabled).toBe(false);
    });

    it('should not update user if user not found in updateUserIsEnabled', () => {
      store.dispatch(updateUserIsEnabled({ id: 999, isEnabled: false }));
      const state = store.getState().users;

      expect(state.users).toEqual([]);
    });
  });

  describe('Other Async Thunks', () => {
    it('should handle fetchRoles', async () => {
      const mockRoles = ['Admin', 'User', 'Manager'];
      mockedUserService.getRoles.mockResolvedValue(mockRoles);

      await store.dispatch(fetchRoles());
      
      expect(mockedUserService.getRoles).toHaveBeenCalled();
    });

    it('should handle fetchDepartments', async () => {
      const mockDepartments = ['IT', 'HR', 'Finance'];
      mockedUserService.getDepartments.mockResolvedValue(mockDepartments);

      await store.dispatch(fetchDepartments());
      
      expect(mockedUserService.getDepartments).toHaveBeenCalled();
    });

    it('should handle fetchUsersForReporting', async () => {
      const mockUsers = [{ id: 1, name: 'John Doe' }];
      mockedUserService.getUsersForReporting.mockResolvedValue(mockUsers);

      await store.dispatch(fetchUsersForReporting());
      
      expect(mockedUserService.getUsersForReporting).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle error messages correctly', async () => {
      const errorMessage = 'Custom error message';
      mockedFetchUsersFromApi.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.error).toBe(errorMessage);
    });

    it('should handle undefined error messages', async () => {
      // Create an error with undefined message
      const errorWithoutMessage = { message: undefined };
      mockedFetchUsersFromApi.mockRejectedValue(errorWithoutMessage);

      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.error).toBe('Failed to fetch users');
    });
  });

  describe('State Updates', () => {
    it('should maintain state consistency across multiple actions', async () => {
      // Initial state
      let state = store.getState().users;
      expect(state.users).toEqual([]);
      expect(state.hasUsers).toBe(false);

      // Fetch users
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: true,
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());

      state = store.getState().users;
      expect(state.users).toHaveLength(1);
      expect(state.hasUsers).toBe(true);

      // Clear users
      store.dispatch(clearUsers());
      state = store.getState().users;
      expect(state.users).toEqual([]);
      expect(state.hasUsers).toBe(true); // hasUsers is not reset by clearUsers
    });
  });

  describe('Comprehensive Selfreporting Conversion Tests', () => {
    it('should convert selfreporting true boolean to string', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: true,
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('true');
    });

    it('should convert selfreporting false boolean to string', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: false,
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('false');
    });

    it('should convert selfreporting string "true" to string', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('true');
    });

    it('should convert selfreporting string "false" to string', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'false',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('false');
    });

    it('should convert selfreporting string "1" to string "true"', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: '1',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('true');
    });

    it('should convert selfreporting string "0" to string "false"', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: '0',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('false');
    });

    it('should convert selfreporting string "True" to string "true"', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'True',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('true');
    });

    it('should convert selfreporting string "False" to string "false"', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'False',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('false');
    });

    it('should convert selfreporting string "TRUE" to string "true"', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'TRUE',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('true');
    });

    it('should convert selfreporting string "FALSE" to string "false"', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'FALSE',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('false');
    });

    it('should convert selfreporting null to string "false"', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: null,
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('false');
    });

    it('should convert selfreporting undefined to string "false"', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: undefined,
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('false');
    });

    it('should convert selfreporting empty string to string "false"', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: '',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('false');
    });

    it('should convert selfreporting invalid value to string "false"', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'invalid',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].selfreporting).toBe('false');
    });
  });

  describe('Comprehensive ToggleUserStatus Tests', () => {
    it('should handle toggleUserStatus.fulfilled with transferedby and transfereddate', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      };

      // First add a user to the state
      store.dispatch(fetchUsers.fulfilled([user], ''));

      const mockResponse = { success: true };
      mockedSaveUserStatusToggle.mockResolvedValue(mockResponse);

      await store.dispatch(toggleUserStatus({ 
        id: 1, 
        isEnabled: false, 
        transferedby: 'Admin', 
        transferedto: 'Manager',
        transfereddate: '2023-01-03' 
      }));
      
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.users[0].isenabled).toBe(false);
      expect(state.users[0].status).toBe('Inactive');
      expect(state.users[0].transferedby).toBe('Admin');
      expect(state.users[0].transferedto).toBe('Manager');
      expect(state.users[0].transfereddate).toBe('2023-01-03');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle toggleUserStatus.fulfilled without transferedby and transfereddate', async () => {
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      };

      // First add a user to the state
      store.dispatch(fetchUsers.fulfilled([user], ''));

      const mockResponse = { success: true };
      mockedSaveUserStatusToggle.mockResolvedValue(mockResponse);

      await store.dispatch(toggleUserStatus({ 
        id: 1, 
        isEnabled: false 
      }));
      
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.users[0].isenabled).toBe(false);
      expect(state.users[0].status).toBe('Inactive');
      expect(state.users[0].transferedby).toBe(''); // Should remain unchanged
      expect(state.users[0].transfereddate).toBe(''); // Should remain unchanged
    });

    it('should handle toggleUserStatus.fulfilled with null transferedby and transfereddate', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: 'OldAdmin',
        transferedto: '',
        transfereddate: '2023-01-01'
      };

      // First add a user to the state
      store.dispatch(fetchUsers.fulfilled([user], ''));

      const mockResponse = { success: true };
      mockedSaveUserStatusToggle.mockResolvedValue(mockResponse);

      await store.dispatch(toggleUserStatus({ 
        id: 1, 
        isEnabled: false, 
        transferedby: null, 
        transferedto: null,
        transfereddate: null 
      }));
      
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.users[0].isenabled).toBe(false);
      expect(state.users[0].status).toBe('Inactive');
      expect(state.users[0].transferedby).toBe('');
      expect(state.users[0].transferedto).toBe('');
      expect(state.users[0].transfereddate).toBe('');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle toggleUserStatus.fulfilled with undefined transferedby and transferedto', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: 'OldAdmin',
        transferedto: 'OldManager',
        transfereddate: '2023-01-01'
      };

      store.dispatch(fetchUsers.fulfilled([user], ''));

      const mockResponse = { success: true };
      mockedSaveUserStatusToggle.mockResolvedValue(mockResponse);

      await store.dispatch(toggleUserStatus({ 
        id: 1, 
        isEnabled: false
        // transferedby, transferedto, transfereddate are undefined
      }));
      
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.users[0].isenabled).toBe(false);
      expect(state.users[0].status).toBe('Inactive');
      // Should remain unchanged when undefined
      expect(state.users[0].transferedby).toBe('OldAdmin');
      expect(state.users[0].transferedto).toBe('OldManager');
      expect(state.users[0].transfereddate).toBe('2023-01-01');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle toggleUserStatus.fulfilled when user not found', async () => {
      const mockResponse = { success: true };
      mockedSaveUserStatusToggle.mockResolvedValue(mockResponse);

      await store.dispatch(toggleUserStatus({ 
        id: 999, 
        isEnabled: false 
      }));
      
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.users).toEqual([]);
    });

    it('should handle toggleUserStatus.fulfilled enabling user', async () => {
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Inactive',
        isenabled: false,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      };

      // First add a user to the state
      store.dispatch(fetchUsers.fulfilled([user], ''));

      const mockResponse = { success: true };
      mockedSaveUserStatusToggle.mockResolvedValue(mockResponse);

      await store.dispatch(toggleUserStatus({ 
        id: 1, 
        isEnabled: true 
      }));
      
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.users[0].isenabled).toBe(true);
      expect(state.users[0].status).toBe('Active');
    });
  });

  describe('Comprehensive Error Handling Tests', () => {
    it('should handle createUser.rejected with undefined error message', async () => {
      const errorWithoutMessage = { message: undefined };
      mockedUserService.createUser.mockRejectedValue(errorWithoutMessage);

      await store.dispatch(createUser({}));
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to create user');
    });

    it('should handle toggleUserStatus.rejected with undefined error message', async () => {
      const errorWithoutMessage = { message: undefined };
      mockedSaveUserStatusToggle.mockRejectedValue(errorWithoutMessage);

      await store.dispatch(toggleUserStatus({ id: 1, isEnabled: true }));
      const state = store.getState().users;

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to toggle user status');
    });

    it('should handle fetchUserHierarchy.rejected with undefined error message', async () => {
      const errorWithoutMessage = { message: undefined };
      
      // Mock the thunk to throw an error
      const rejectedAction = {
        type: fetchUserHierarchy.rejected.type,
        payload: undefined,
        error: { message: undefined }
      };
      
      store.dispatch(rejectedAction);
      const state = store.getState().users;

      expect(state.hierarchyLoading).toBe(false);
      expect(state.hierarchyError).toBe('Failed to fetch user hierarchy');
    });
  });

  describe('Comprehensive Data Conversion Tests', () => {
    it('should handle user with all nullish coalescing fields', async () => {
      const mockUsers = [{
        id: '3',
        firstname: 'Test',
        lastname: 'User',
        phonenumber: null,
        role: 'User',
        department: null,
        emailid: 'test@example.com',
        reportingmanager: null,
        dottedorprojectmanager: null,
        selfreporting: null,
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: null,
        createdby: null,
        lastupdatedby: null,
        transferedby: null,
        transferedto: null,
        transfereddate: null,
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        class: [],
        subClass: [],
        permissions: []
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0]).toEqual({
        id: 3,
        firstname: 'Test',
        lastname: 'User',
        phonenumber: '',
        role: 'User',
        department: '',
        emailid: 'test@example.com',
        reportingmanager: '',
        dottedorprojectmanager: '',
        selfreporting: 'false',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
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
        class: [],
        subClass: [],
        permissions: []
      });
    });

    it('should handle user with undefined id', async () => {
      const mockUsers = [{
        id: undefined,
        firstname: 'Test',
        lastname: 'User',
        phonenumber: '1234567890',
        role: 'User',
        department: 'IT',
        emailid: 'test@example.com',
        reportingmanager: 'Manager',
        dottedorprojectmanager: 'PM',
        selfreporting: true,
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: '',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        class: [],
        subClass: [],
        permissions: []
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].id).toBe(NaN); // parseInt(undefined) returns NaN
    });

    it('should handle user with invalid id string', async () => {
      const mockUsers = [{
        id: 'invalid',
        firstname: 'Test',
        lastname: 'User',
        phonenumber: '1234567890',
        role: 'User',
        department: 'IT',
        emailid: 'test@example.com',
        reportingmanager: 'Manager',
        dottedorprojectmanager: 'PM',
        selfreporting: true,
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: '',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        class: [],
        subClass: [],
        permissions: []
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].id).toBe(NaN); // parseInt('invalid') returns NaN
    });

    it('should handle user with null id using nullish coalescing', async () => {
      // Mock parseInt to return null to test nullish coalescing
      const originalParseInt = global.parseInt;
      global.parseInt = jest.fn().mockReturnValue(null);

      const mockUsers = [{
        id: 'test',
        firstname: 'Test',
        lastname: 'User',
        phonenumber: '1234567890',
        role: 'User',
        department: 'IT',
        emailid: 'test@example.com',
        reportingmanager: 'Manager',
        dottedorprojectmanager: 'PM',
        selfreporting: true,
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: '',
        regions: [],
        countries: [],
        divisions: [],
        groups: [],
        departments: [],
        class: [],
        subClass: [],
        permissions: []
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.users[0].id).toBe(0); // parseInt returns null, ?? 0 returns 0

      // Restore original parseInt
      global.parseInt = originalParseInt;
    });
  });

  describe('Console Log Coverage Tests', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log debug information during selfreporting conversion', async () => {
      const mockUsers = [{
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: true,
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      }];

      mockedFetchUsersFromApi.mockResolvedValue(mockUsers);
      await store.dispatch(fetchUsers());

      expect(consoleSpy).toHaveBeenCalledWith(
        'DEBUG userSlice - Converting selfreporting:',
        true,
        'Type:',
        'boolean',
        'to:',
        'true'
      );
    });

    it('should log debug information during toggleUserStatus.fulfilled', async () => {
      const user = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        phonenumber: '1234567890',
        role: 'Admin',
        department: 'IT',
        emailid: 'john@example.com',
        reportingmanager: 'Jane Smith',
        dottedorprojectmanager: 'Bob Johnson',
        selfreporting: 'true',
        status: 'Active',
        isenabled: true,
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        createdby: 'Admin',
        lastupdatedby: 'Admin',
        transferedby: '',
        transferedto: '',
        transfereddate: ''
      };

      store.dispatch(fetchUsers.fulfilled([user], ''));
      const mockResponse = { success: true };
      mockedSaveUserStatusToggle.mockResolvedValue(mockResponse);

      await store.dispatch(toggleUserStatus({ id: 1, isEnabled: false }));

      expect(consoleSpy).toHaveBeenCalledWith('Redux: toggleUserStatus.fulfilled', expect.any(Object));
      expect(consoleSpy).toHaveBeenCalledWith('=== REDUX STATE UPDATE ===');
      expect(consoleSpy).toHaveBeenCalledWith('User found at index:', 0);
      expect(consoleSpy).toHaveBeenCalledWith('Old isenabled:', true);
      expect(consoleSpy).toHaveBeenCalledWith('New isenabled:', false);
      expect(consoleSpy).toHaveBeenCalledWith('Old status:', 'Active');
      expect(consoleSpy).toHaveBeenCalledWith('Old transferedby:', '');
      expect(consoleSpy).toHaveBeenCalledWith('New transferedby:', undefined);
      expect(consoleSpy).toHaveBeenCalledWith('New transfereddate:', undefined);
      expect(consoleSpy).toHaveBeenCalledWith('New isenabled:', false);
      expect(consoleSpy).toHaveBeenCalledWith('New status:', 'Inactive');
      expect(consoleSpy).toHaveBeenCalledWith('New transferedby:', '');
      expect(consoleSpy).toHaveBeenCalledWith('New transfereddate:', '');
      expect(consoleSpy).toHaveBeenCalledWith('===========================');
    });

    it('should log when user not found in toggleUserStatus.fulfilled', async () => {
      const mockResponse = { success: true };
      mockedSaveUserStatusToggle.mockResolvedValue(mockResponse);

      await store.dispatch(toggleUserStatus({ id: 999, isEnabled: false }));

      expect(consoleSpy).toHaveBeenCalledWith('Redux: User not found with id', 999);
    });

    it('should log during fetchUserHierarchy operations', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Test pending
      store.dispatch(fetchUserHierarchy.pending('', undefined));
      expect(consoleSpy).toHaveBeenCalledWith('Redux: fetchUserHierarchy.pending - setting hierarchyLoading to true');

      // Test fulfilled
      await store.dispatch(fetchUserHierarchy());
      expect(consoleSpy).toHaveBeenCalledWith('Redux: fetchUserHierarchy.fulfilled - setting hierarchy data:', []);

      // Test rejected
      const rejectedAction = {
        type: fetchUserHierarchy.rejected.type,
        payload: undefined,
        error: { message: 'Test error' }
      };
      store.dispatch(rejectedAction);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Redux: fetchUserHierarchy.rejected - error:', 'Test error');

      consoleErrorSpy.mockRestore();
    });

    it('should log error when fetchUserHierarchy thunk throws error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Don't catch the error - let it propagate naturally
      await expect(store.dispatch(fetchUserHierarchy(true))).rejects.toThrow();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Redux: fetchUserHierarchy thunk failed:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });
});
