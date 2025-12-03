import { configureStore } from '@reduxjs/toolkit';
import groupReducer, {
  fetchGroups,
  createGroup,
  updateGroup,
  toggleGroupStatus,
  toggleMemberStatus,
  softDeleteMember,
  mapGroupMembersForView
} from '../../../src/store/Reducers/groupSlice';
import { fetchGroupsFromApi } from '../../../src/services/groupFetchService';
import { saveGroup, saveGroupStatusToggle, toggleMemberStatus as toggleMemberStatusService, softDeleteMember as softDeleteMemberService } from '../../../src/services/groupSaveService';

// Mock the services
jest.mock('../../../src/services/groupFetchService', () => ({
  fetchGroupsFromApi: jest.fn()
}));

jest.mock('../../../src/services/groupSaveService', () => ({
  saveGroup: jest.fn(),
  saveGroupStatusToggle: jest.fn(),
  toggleMemberStatus: jest.fn(),
  softDeleteMember: jest.fn()
}));

const mockedFetchGroupsFromApi = fetchGroupsFromApi as jest.MockedFunction<typeof fetchGroupsFromApi>;
const mockedSaveGroup = saveGroup as jest.MockedFunction<typeof saveGroup>;
const mockedSaveGroupStatusToggle = saveGroupStatusToggle as jest.MockedFunction<typeof saveGroupStatusToggle>;
const mockedToggleMemberStatusService = toggleMemberStatusService as jest.MockedFunction<typeof toggleMemberStatusService>;
const mockedSoftDeleteMemberService = softDeleteMemberService as jest.MockedFunction<typeof softDeleteMemberService>;

describe('groupSlice', () => {
  let store: ReturnType<typeof configureStore>;

  const mockUsers = [
    { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@test.com', role: 'Admin' },
    { id: 2, firstname: 'Jane', lastname: 'Smith', emailid: 'jane@test.com', role: 'User' },
  ];

  beforeEach(() => {
    store = configureStore({
      reducer: {
        groups: groupReducer,
        users: (state = { users: mockUsers, loading: false, error: null }, action) => state,
      },
    });
    jest.clearAllMocks();
  });

  describe('fetchGroups', () => {
    it('should fetch groups successfully', async () => {
      const mockGroups = [
        {
          id: '1',
          name: 'Team A',
          description: 'Description A',
          owner_user_id: '1',
          members: JSON.stringify([{ user_id: 1, is_active: true, joined_at: '2023-01-01', left_at: null }]),
          createdat: '2023-01-01',
          lastupdatedat: '2023-01-02',
          isactive: true
        }
      ];

      mockedFetchGroupsFromApi.mockResolvedValue(mockGroups as any);

      await store.dispatch(fetchGroups());

      const state = store.getState().groups;
      expect(state.groups).toHaveLength(1);
      expect(state.groups[0].name).toBe('Team A');
      expect(state.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      mockedFetchGroupsFromApi.mockRejectedValue(new Error('Fetch failed'));

      await store.dispatch(fetchGroups());

      const state = store.getState().groups;
      expect(state.error).toBeTruthy();
      expect(state.loading).toBe(false);
    });
  });

  describe('createGroup', () => {
    it('should create group successfully', async () => {
      const groupData = {
        groupName: 'New Team',
        description: 'New Description',
        groupOwner: '1',
        members: ['2']
      };

      mockedSaveGroup.mockResolvedValue({ success: true } as any);
      mockedFetchGroupsFromApi.mockResolvedValue([]);

      await store.dispatch(createGroup(groupData));

      expect(mockedSaveGroup).toHaveBeenCalledWith(groupData, 'n');
    });

    it('should handle create error', async () => {
      const groupData = {
        groupName: 'New Team',
        description: 'New Description',
        groupOwner: '1',
        members: []
      };

      mockedSaveGroup.mockRejectedValue(new Error('Create failed'));

      await store.dispatch(createGroup(groupData));

      const state = store.getState().groups;
      expect(state.error).toBeTruthy();
    });
  });

  describe('updateGroup', () => {
    it('should update group successfully', async () => {
      const groupData = {
        id: '1',
        groupName: 'Updated Team',
        description: 'Updated Description',
        groupOwner: '1',
        members: ['2'],
        isactive: true
      };

      mockedSaveGroup.mockResolvedValue({ success: true } as any);
      mockedFetchGroupsFromApi.mockResolvedValue([]);

      await store.dispatch(updateGroup(groupData));

      expect(mockedSaveGroup).toHaveBeenCalledWith(groupData, 'u');
    });
  });

  describe('toggleGroupStatus', () => {
    it('should toggle group status', async () => {
      const initialState = {
        groups: [{
          id: '1',
          name: 'Team A',
          isActive: true,
          teamMembers: [],
          description: '',
          createdDate: '',
          lastUpdatedDate: ''
        }],
        loading: false,
        error: null
      };

      store = configureStore({
        reducer: {
          groups: groupReducer,
          users: (state = { users: mockUsers, loading: false, error: null }, action) => state,
        },
        preloadedState: {
          groups: initialState
        }
      });

      mockedSaveGroupStatusToggle.mockResolvedValue({ success: true } as any);

      await store.dispatch(toggleGroupStatus({ id: '1', isEnabled: false }));

      expect(mockedSaveGroupStatusToggle).toHaveBeenCalledWith('1', false);
    });
  });

  describe('toggleMemberStatus', () => {
    it('should toggle member status', async () => {
      mockedToggleMemberStatusService.mockResolvedValue({ success: true } as any);
      mockedFetchGroupsFromApi.mockResolvedValue([]);

      await store.dispatch(toggleMemberStatus({
        groupId: '1',
        memberUserId: '2',
        isActive: true
      }));

      expect(mockedToggleMemberStatusService).toHaveBeenCalledWith('1', '2', true);
      expect(mockedFetchGroupsFromApi).toHaveBeenCalled();
    });
  });

  describe('softDeleteMember', () => {
    it('should soft delete member', async () => {
      mockedSoftDeleteMemberService.mockResolvedValue({ success: true } as any);
      mockedFetchGroupsFromApi.mockResolvedValue([]);

      await store.dispatch(softDeleteMember({
        groupId: '1',
        memberUserId: '2'
      }));

      expect(mockedSoftDeleteMemberService).toHaveBeenCalledWith('1', '2');
      expect(mockedFetchGroupsFromApi).toHaveBeenCalled();
    });
  });

  describe('mapGroupMembersForView', () => {
    it('should map group members correctly', () => {
      const groupModel = {
        id: '1',
        name: 'Team A',
        owner_user_id: '1',
        members: JSON.stringify([
          {
            user_id: 1,
            is_active: true,
            joined_at: '2023-01-01',
            left_at: null
          },
          {
            user_id: 2,
            is_active: false,
            joined_at: '2023-01-02',
            left_at: null
          }
        ]),
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        isactive: true
      };

      const result = mapGroupMembersForView(groupModel as any, mockUsers);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        status: 'Active'
      });
      expect(result[1]).toMatchObject({
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: false,
        status: 'Inactive'
      });
    });

    it('should handle soft-deleted members', () => {
      const groupModel = {
        id: '1',
        name: 'Team A',
        owner_user_id: '1',
        members: JSON.stringify([
          {
            user_id: 1,
            is_active: true,
            joined_at: '2023-01-01',
            left_at: null
          },
          {
            user_id: 2,
            is_active: false,
            joined_at: '2023-01-02',
            left_at: '2023-02-01'
          }
        ]),
        createdat: '2023-01-01',
        lastupdatedat: '2023-01-02',
        isactive: true
      };

      const result = mapGroupMembersForView(groupModel as any, mockUsers);

      expect(result).toHaveLength(2);
      expect(result[1].isDeleted).toBe(true);
      expect(result[1].leftAt).toBe('2023-02-01');
    });
  });
});

