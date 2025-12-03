import { saveGroup, toggleMemberStatus, softDeleteMember, deactivateUserInAllGroups } from '../../src/services/groupSaveService';
import { fetchGroupsFromApi, fetchGroupById } from '../../src/services/groupFetchService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock groupFetchService
jest.mock('../../src/services/groupFetchService', () => ({
  fetchGroupsFromApi: jest.fn(),
  fetchGroupById: jest.fn()
}));

const mockedFetchGroupsFromApi = fetchGroupsFromApi as jest.MockedFunction<typeof fetchGroupsFromApi>;
const mockedFetchGroupById = fetchGroupById as jest.MockedFunction<typeof fetchGroupById>;

describe('groupSaveService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveGroup', () => {
    it('should save new group successfully', async () => {
      const groupData = {
        name: 'New Group',
        description: 'New description',
        owner_user_id: '1',
        members: ['2'],
        isactive: true
      };

      const mockResponse = {
        data: {
          status: 'Ok',
          message: 'Group saved successfully'
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await saveGroup(groupData, 'n');

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('should update existing group successfully', async () => {
      const groupData = {
        id: '1',
        name: 'Updated Group',
        description: 'Updated description',
        owner_user_id: '1',
        members: ['2'],
        isactive: true
      };

      const mockResponse = {
        data: {
          status: 'Ok',
          message: 'Group updated successfully'
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await saveGroup(groupData, 'u');

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('toggleMemberStatus', () => {
    it('should toggle member status successfully', async () => {
      const mockGroup = {
        id: '1',
        name: 'Team A',
        members: JSON.stringify([
          { user_id: 2, is_active: true, joined_at: '2023-01-01', left_at: null }
        ])
      };

      const mockResponse = {
        data: {
          status: 'Ok',
          message: 'Member status updated'
        }
      };

      mockedFetchGroupById.mockResolvedValue(mockGroup as any);
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await toggleMemberStatus('1', '2', false);

      expect(mockedFetchGroupById).toHaveBeenCalledWith('1');
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('softDeleteMember', () => {
    it('should soft delete member successfully', async () => {
      const mockGroup = {
        id: '1',
        name: 'Team A',
        members: JSON.stringify([
          { user_id: 2, is_active: true, joined_at: '2023-01-01', left_at: null }
        ])
      };

      const mockResponse = {
        data: {
          status: 'Ok',
          message: 'Member soft deleted'
        }
      };

      mockedFetchGroupById.mockResolvedValue(mockGroup as any);
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await softDeleteMember('1', '2');

      expect(mockedFetchGroupById).toHaveBeenCalledWith('1');
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deactivateUserInAllGroups', () => {
    it('should deactivate user in all groups', async () => {
      const mockGroups = [
        {
          id: '1',
          name: 'Team A',
          members: JSON.stringify([
            { user_id: 2, is_active: true, joined_at: '2023-01-01', left_at: null }
          ])
        },
        {
          id: '2',
          name: 'Team B',
          members: JSON.stringify([
            { user_id: 2, is_active: true, joined_at: '2023-01-01', left_at: null }
          ])
        }
      ];

      const mockResponse = {
        data: {
          status: 'Ok',
          message: 'Group updated'
        }
      };

      mockedFetchGroupsFromApi.mockResolvedValue(mockGroups as any);
      mockedAxios.post.mockResolvedValue(mockResponse);

      await deactivateUserInAllGroups(2);

      expect(mockedFetchGroupsFromApi).toHaveBeenCalled();
      expect(mockedAxios.post).toHaveBeenCalledTimes(2); // Called for each group
    });
  });
});

