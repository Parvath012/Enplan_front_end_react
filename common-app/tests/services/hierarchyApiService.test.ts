import axios from 'axios';
import { fetchHierarchyFromApi, HierarchyApiConfig } from '../../src/services/hierarchyApiService';
import { handleApiError } from '../../src/utils/apiErrorHandler';

// Mock dependencies
jest.mock('axios');
jest.mock('../../src/utils/apiErrorHandler', () => ({
  handleApiError: jest.fn((error) => {
    throw error;
  })
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('hierarchyApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchHierarchyFromApi', () => {
    const defaultConfig: HierarchyApiConfig = {
      baseUrl: 'http://localhost:3000',
      apiPath: '/api/hierarchy',
      timeout: 10000
    };

    it('should fetch hierarchy data successfully', async () => {
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      const result = await fetchHierarchyFromApi(defaultConfig);

      expect(result).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/hierarchy',
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    });

    it('should use default timeout when not provided', async () => {
      const config: HierarchyApiConfig = {
        baseUrl: 'http://localhost:3000',
        apiPath: '/api/hierarchy'
      };

      const mockData = [{ id: 1 }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(config);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/hierarchy',
        expect.objectContaining({
          timeout: 10000
        })
      );
    });

    it('should use custom timeout when provided', async () => {
      const config: HierarchyApiConfig = {
        baseUrl: 'http://localhost:3000',
        apiPath: '/api/hierarchy',
        timeout: 5000
      };

      const mockData = [{ id: 1 }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(config);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/hierarchy',
        expect.objectContaining({
          timeout: 5000
        })
      );
    });

    it('should log API call information', async () => {
      const mockData = [{ id: 1 }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(defaultConfig);

      expect(console.log).toHaveBeenCalledWith(
        'fetchHierarchyFromApi: Making API call to http://localhost:3000/api/hierarchy'
      );
    });

    it('should log successful API response', async () => {
      const mockData = [{ id: 1, name: 'Item 1' }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(defaultConfig);

      expect(console.log).toHaveBeenCalledWith(
        'fetchHierarchyFromApi: API call successful:',
        mockData
      );
    });

    it('should log response structure for array data', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(defaultConfig);

      expect(console.log).toHaveBeenCalledWith(
        'fetchHierarchyFromApi: Response structure:',
        expect.objectContaining({
          status: 200,
          dataLength: 2,
          dataType: 'object',
          sampleData: { id: 1 }
        })
      );
    });

    it('should log response structure for non-array data', async () => {
      const mockData = { items: [{ id: 1 }] };
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(defaultConfig);

      expect(console.log).toHaveBeenCalledWith(
        'fetchHierarchyFromApi: Response structure:',
        expect.objectContaining({
          status: 200,
          dataLength: 'Not an array',
          dataType: 'object'
        })
      );
    });

    it('should log response structure for empty array', async () => {
      const mockData: any[] = [];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(defaultConfig);

      expect(console.log).toHaveBeenCalledWith(
        'fetchHierarchyFromApi: Response structure:',
        expect.objectContaining({
          status: 200,
          dataLength: 0,
          dataType: 'object',
          sampleData: 'No data'
        })
      );
    });

    it('should log full response data as JSON', async () => {
      const mockData = [{ id: 1, name: 'Item 1' }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(defaultConfig);

      expect(console.log).toHaveBeenCalledWith(
        'fetchHierarchyFromApi: Full response data:',
        JSON.stringify(mockData, null, 2)
      );
    });

    it('should log response length', async () => {
      const mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(defaultConfig);

      expect(console.log).toHaveBeenCalledWith(
        'fetchHierarchyFromApi: Response length:',
        3
      );
    });

    it('should log isArray check', async () => {
      const mockData = [{ id: 1 }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(defaultConfig);

      expect(console.log).toHaveBeenCalledWith(
        'fetchHierarchyFromApi: Is Array:',
        true
      );
    });

    it('should handle API errors', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(fetchHierarchyFromApi(defaultConfig)).rejects.toThrow('Network error');
      expect(handleApiError).toHaveBeenCalledWith(error, 'fetchHierarchyFromApi', true);
    });

    it('should handle errors with specific error messages', async () => {
      const error = { message: 'API Error', response: { status: 500 } };
      mockedAxios.get.mockRejectedValueOnce(error);
      (handleApiError as jest.Mock).mockReturnValueOnce([]);

      const result = await fetchHierarchyFromApi(defaultConfig);

      expect(handleApiError).toHaveBeenCalledWith(error, 'fetchHierarchyFromApi', true);
      expect(result).toEqual([]);
    });

    it('should construct correct API URL', async () => {
      const config: HierarchyApiConfig = {
        baseUrl: 'https://api.example.com',
        apiPath: '/v1/hierarchy/users'
      };

      const mockData = [{ id: 1 }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(config);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.example.com/v1/hierarchy/users',
        expect.any(Object)
      );
    });

    it('should handle empty baseUrl', async () => {
      const config: HierarchyApiConfig = {
        baseUrl: '',
        apiPath: '/api/hierarchy'
      };

      const mockData = [{ id: 1 }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(config);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/hierarchy',
        expect.any(Object)
      );
    });

    it('should handle empty apiPath', async () => {
      const config: HierarchyApiConfig = {
        baseUrl: 'http://localhost:3000',
        apiPath: ''
      };

      const mockData = [{ id: 1 }];
      mockedAxios.get.mockResolvedValueOnce({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      });

      await fetchHierarchyFromApi(config);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000',
        expect.any(Object)
      );
    });

    it('should return empty array when handleApiError returns empty array', async () => {
      const error = new Error('Test error');
      mockedAxios.get.mockRejectedValueOnce(error);
      (handleApiError as jest.Mock).mockReturnValueOnce([]);

      const result = await fetchHierarchyFromApi(defaultConfig);

      expect(result).toEqual([]);
    });
  });
});

