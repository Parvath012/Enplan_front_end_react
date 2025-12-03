/**
 * Tests for reportingStructureService
 */
import {
  fetchUserHierarchyFromApi,
  fetchAllHierarchiesFromApi,
  UserHierarchyModel
} from '../../src/services/reportingStructureService';

// Mock hierarchyApiService
jest.mock('commonApp/hierarchyApiService', () => ({
  fetchHierarchyFromApi: jest.fn()
}));

import { fetchHierarchyFromApi } from 'commonApp/hierarchyApiService';

const mockedFetchHierarchyFromApi = fetchHierarchyFromApi as jest.MockedFunction<typeof fetchHierarchyFromApi>;

describe('reportingStructureService', () => {
  const mockHierarchyData: UserHierarchyModel[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      role: 'Manager',
      department: 'IT',
      reportingManager: []
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      fullName: 'Jane Smith',
      role: 'Developer',
      department: 'IT',
      reportingManager: [{
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        role: 'Manager',
        department: 'IT'
      }]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserHierarchyFromApi', () => {
    it('should fetch user hierarchy successfully', async () => {
      mockedFetchHierarchyFromApi.mockResolvedValue(mockHierarchyData);

      const result = await fetchUserHierarchyFromApi();

      expect(result).toEqual(mockHierarchyData);
      expect(mockedFetchHierarchyFromApi).toHaveBeenCalledWith({
        baseUrl: 'http://localhost:8881',
        apiPath: '/api/user-hierarchy/reporting/all',
        timeout: 10000
      });
    });

    it('should use custom API URL from environment variable', async () => {
      const originalEnv = process.env.REACT_APP_USER_HIERARCHY_API_URL;
      process.env.REACT_APP_USER_HIERARCHY_API_URL = 'https://custom-api.com';
      
      mockedFetchHierarchyFromApi.mockResolvedValue(mockHierarchyData);

      await fetchUserHierarchyFromApi();

      expect(mockedFetchHierarchyFromApi).toHaveBeenCalledWith({
        baseUrl: 'https://custom-api.com',
        apiPath: '/api/user-hierarchy/reporting/all',
        timeout: 10000
      });

      process.env.REACT_APP_USER_HIERARCHY_API_URL = originalEnv;
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedFetchHierarchyFromApi.mockRejectedValue(error);

      await expect(fetchUserHierarchyFromApi()).rejects.toThrow('API Error');
    });

    it('should return empty array when API returns empty data', async () => {
      mockedFetchHierarchyFromApi.mockResolvedValue([]);

      const result = await fetchUserHierarchyFromApi();

      expect(result).toEqual([]);
    });
  });

  describe('fetchAllHierarchiesFromApi', () => {
    it('should fetch all hierarchies successfully', async () => {
      mockedFetchHierarchyFromApi.mockResolvedValue(mockHierarchyData);

      const result = await fetchAllHierarchiesFromApi();

      expect(result).toEqual(mockHierarchyData);
      expect(mockedFetchHierarchyFromApi).toHaveBeenCalledWith({
        baseUrl: 'http://localhost:8881',
        apiPath: '/api/user-hierarchy/all-hierarchies',
        timeout: 10000
      });
    });

    it('should use custom API URL from environment variable', async () => {
      const originalEnv = process.env.REACT_APP_USER_HIERARCHY_API_URL;
      process.env.REACT_APP_USER_HIERARCHY_API_URL = 'https://custom-api.com';
      
      mockedFetchHierarchyFromApi.mockResolvedValue(mockHierarchyData);

      await fetchAllHierarchiesFromApi();

      expect(mockedFetchHierarchyFromApi).toHaveBeenCalledWith({
        baseUrl: 'https://custom-api.com',
        apiPath: '/api/user-hierarchy/all-hierarchies',
        timeout: 10000
      });

      process.env.REACT_APP_USER_HIERARCHY_API_URL = originalEnv;
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockedFetchHierarchyFromApi.mockRejectedValue(error);

      await expect(fetchAllHierarchiesFromApi()).rejects.toThrow('API Error');
    });

    it('should handle hierarchies with dotted-line managers', async () => {
      const hierarchyWithDottedLine: UserHierarchyModel[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Manager',
          department: 'IT',
          reportingManager: [],
          dottedProjectManager: [{
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            fullName: 'Jane Smith',
            role: 'PM',
            department: 'IT'
          }]
        }
      ];

      mockedFetchHierarchyFromApi.mockResolvedValue(hierarchyWithDottedLine);

      const result = await fetchAllHierarchiesFromApi();

      expect(result).toEqual(hierarchyWithDottedLine);
      expect(result[0].dottedProjectManager).toBeDefined();
    });
  });
});

