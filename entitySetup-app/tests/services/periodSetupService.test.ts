import axios from 'axios';
import {
  fetchPeriodSetupFromApi,
  savePeriodSetupToApi,
  PeriodSetupDto,
  PeriodSetupModel,
  PeriodSetupData,
} from '../../src/services/periodSetupService';
import { mapDtoToModel, stripQuotes, parseBool, getValueByIndex } from '../../src/utils/periodSetupServiceUtils';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the utility functions
jest.mock('../../src/utils/periodSetupServiceUtils', () => ({
  mapDtoToModel: jest.fn(),
  stripQuotes: jest.fn(),
  parseBool: jest.fn(),
  getValueByIndex: jest.fn(),
}));

// Mock the constants
jest.mock('../../src/constants/periodSetupColumnDefinitions', () => ({
  PERIOD_SETUP_COLUMNS: [
    { dboName: 'period_setup', columnName: 'id', dataType: 'UUID', aliasName: 'Id', output: true },
    { dboName: 'period_setup', columnName: 'entity_id', dataType: 'UUID', aliasName: 'EntityId', output: true },
  ],
}));

describe('periodSetupService', () => {
  const mockEntityId = 'test-entity-id';
  const mockPeriodSetupDto: PeriodSetupDto = {
    Id: '1',
    EntityId: mockEntityId,
    FinancialYearName: 'FY 2023-24',
    StartMonth: 'April',
    EndMonth: 'March',
    HistoricalYearSpan: 5,
    UserViewYearSpan: 3,
    WeekName: 'W1-23',
    MonthForWeekOne: 'January',
    StartingDayOfWeek: 'Monday',
    IsDeleted: false,
    CreatedAt: '2023-01-01T00:00:00Z',
    LastUpdatedAt: '2023-01-01T00:00:00Z',
  };

  const mockPeriodSetupModel: PeriodSetupModel = {
    id: '1',
    entityId: mockEntityId,
    financialYearName: 'FY 2023-24',
    startMonth: 'April',
    endMonth: 'March',
    historicalYearSpan: 5,
    userViewYearSpan: 3,
    weekName: 'W1-23',
    monthForWeekOne: 'January',
    startingDayOfWeek: 'Monday',
    isDeleted: false,
    createdAt: '2023-01-01T00:00:00Z',
    lastUpdatedAt: '2023-01-01T00:00:00Z',
  };

  const mockPeriodSetupData: PeriodSetupData = {
    financialYear: {
      name: 'FY 2023-24',
      startMonth: 'April',
      endMonth: 'March',
      historicalDataStartFY: '2020',
      spanningYears: '5 years',
      format: 'FY {yy} - {yy}',
    },
    weekSetup: {
      name: 'W1-23',
      monthForWeekOne: 'January',
      startingDayOfWeek: 'Monday',
      format: 'W{ww}-{YY}',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.REACT_APP_DATA_API_URL = 'http://localhost:3000';
  });

  describe('fetchPeriodSetupFromApi', () => {
    it('should fetch period setup data successfully with new API format', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [
            {
              key: 'period_setup',
              value: {
                csvData: [
                  'Id|EntityId|FinancialYearName|StartMonth|EndMonth|HistoricalYearSpan|UserViewYearSpan|WeekName|MonthForWeekOne|StartingDayOfWeek|IsDeleted|CreatedAt|LastUpdatedAt',
                  '1|test-entity-id|FY 2023-24|April|March|5|3|W1-23|January|Monday|false|2023-01-01T00:00:00Z|2023-01-01T00:00:00Z',
                ],
              },
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      (mapDtoToModel as jest.Mock).mockReturnValue(mockPeriodSetupModel);
      (stripQuotes as jest.Mock).mockImplementation((str) => str);
      (getValueByIndex as jest.Mock).mockImplementation((arr, idx) => arr[idx]);

      const result = await fetchPeriodSetupFromApi(mockEntityId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/data/Data/ExecuteSqlQueries',
        expect.objectContaining({
          executeInParallel: true,
          sqlQueries: expect.any(Array),
        })
      );
      expect(result).toEqual(mockPeriodSetupModel);
    });

    it('should return null when no data found for entity', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [
            {
              key: 'period_setup',
              value: {
                csvData: [
                  'Id|EntityId|FinancialYearName|StartMonth|EndMonth|HistoricalYearSpan|UserViewYearSpan|WeekName|MonthForWeekOne|StartingDayOfWeek|IsDeleted|CreatedAt|LastUpdatedAt',
                  '1|other-entity-id|FY 2023-24|April|March|5|3|W1-23|January|Monday|false|2023-01-01T00:00:00Z|2023-01-01T00:00:00Z',
                ],
              },
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      (stripQuotes as jest.Mock).mockImplementation((str) => str);
      (getValueByIndex as jest.Mock).mockImplementation((arr, idx) => arr[idx]);

      const result = await fetchPeriodSetupFromApi(mockEntityId);

      expect(result).toBeNull();
    });

    it('should return null when csvData is empty', async () => {
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [
            {
              key: 'period_setup',
              value: {
                csvData: ['Id|EntityId|FinancialYearName|StartMonth|EndMonth|HistoricalYearSpan|UserViewYearSpan|WeekName|MonthForWeekOne|StartingDayOfWeek|IsDeleted|CreatedAt|LastUpdatedAt'],
              },
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await fetchPeriodSetupFromApi(mockEntityId);

      expect(result).toBeNull();
    });

    it('should fallback to older API format when new format is not available', async () => {
      const mockResponse = {
        data: {
          sqlResults: [
            {
              records: [mockPeriodSetupDto],
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      (mapDtoToModel as jest.Mock).mockReturnValue(mockPeriodSetupModel);

      const result = await fetchPeriodSetupFromApi(mockEntityId);

      expect(result).toEqual(mockPeriodSetupModel);
    });

    it('should handle API error', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(fetchPeriodSetupFromApi(mockEntityId)).rejects.toThrow('Network error');
    });

    it('should handle API error with console.error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(fetchPeriodSetupFromApi(mockEntityId)).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching period setup:', error);
      
      consoleSpy.mockRestore();
    });
  });

  describe('savePeriodSetupToApi', () => {
    beforeEach(() => {
      // Mock fetchPeriodSetupFromApi to return null (new record)
      jest.spyOn(require('../../src/services/periodSetupService'), 'fetchPeriodSetupFromApi')
        .mockResolvedValue(null);
    });

    it('should save new period setup data successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      await savePeriodSetupToApi(mockEntityId, mockPeriodSetupData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/data/Data/SaveData',
        expect.objectContaining({
          tableName: 'period_setup',
          csvData: expect.any(Array),
          hasHeaders: true,
          uniqueColumn: 'id',
        })
      );

      const saveCall = mockedAxios.post.mock.calls[1]; // Second call is the save
      const savePayload = saveCall[1];
      expect(savePayload.csvData[0]).toContain('_ops|id|entity_id|financial_year_name');
      expect(savePayload.csvData[1]).toContain('n||\'test-entity-id\'|\'FY 2023-24\'');
    });

    it('should update existing period setup data successfully', async () => {
      // Mock axios to return existing data for fetch call and success for save call
      mockedAxios.post
        .mockResolvedValueOnce({ 
          data: { 
            status: 'Ok', 
            data: [{ 
              key: 'period_setup', 
              value: { 
                csvData: [
                  'Id|EntityId|FinancialYearName|StartMonth|EndMonth|HistoricalYearSpan|UserViewYearSpan|WeekName|MonthForWeekOne|StartingDayOfWeek|IsDeleted|CreatedAt|LastUpdatedAt',
                  '1|test-entity-id|FY 2023-24|April|March|5|3|W1-23|January|Monday|false|2023-01-01T00:00:00Z|2023-01-01T00:00:00Z',
                ],
              },
            }],
          },
        })
        .mockResolvedValueOnce({ data: { success: true } });

      await savePeriodSetupToApi(mockEntityId, mockPeriodSetupData);

      const saveCall = mockedAxios.post.mock.calls[1]; // Second call is the save
      const savePayload = saveCall[1];
      expect(savePayload.csvData[1]).toContain('n||\'test-entity-id\'|\'FY 2023-24\'');
    });

    it('should handle save error', async () => {
      const error = new Error('Save failed');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(savePeriodSetupToApi(mockEntityId, mockPeriodSetupData)).rejects.toThrow('Save failed');
    });

    it('should handle save error with console.error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Save failed');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(savePeriodSetupToApi(mockEntityId, mockPeriodSetupData)).rejects.toThrow('Save failed');
      expect(consoleSpy).toHaveBeenCalledWith('Error saving period setup:', error);
      
      consoleSpy.mockRestore();
    });

    it('should parse spanning years correctly', async () => {
      const dataWithSpanningYears = {
        ...mockPeriodSetupData,
        financialYear: {
          ...mockPeriodSetupData.financialYear,
          spanningYears: '10 years',
        },
      };

      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      await savePeriodSetupToApi(mockEntityId, dataWithSpanningYears);

      const saveCall = mockedAxios.post.mock.calls[1];
      const savePayload = saveCall[1];
      expect(savePayload.csvData[1]).toContain('|10|');
    });

    it('should use current timestamp for created_at and last_updated_at', async () => {
      const mockDate = new Date('2023-01-01T00:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      await savePeriodSetupToApi(mockEntityId, mockPeriodSetupData);

      const saveCall = mockedAxios.post.mock.calls[1];
      const savePayload = saveCall[1];
      expect(savePayload.csvData[1]).toContain('2023-01-01 00:00:00');

      jest.restoreAllMocks();
    });
  });

  describe('parseCsvToDtos', () => {
    it('should parse CSV data correctly', () => {
      const csvData = [
        'Id|EntityId|FinancialYearName|StartMonth|EndMonth|HistoricalYearSpan|UserViewYearSpan|WeekName|MonthForWeekOne|StartingDayOfWeek|IsDeleted|CreatedAt|LastUpdatedAt',
        '1|test-entity-id|FY 2023-24|April|March|5|3|W1-23|January|Monday|false|2023-01-01T00:00:00Z|2023-01-01T00:00:00Z',
      ];

      (stripQuotes as jest.Mock).mockImplementation((str) => str);
      (getValueByIndex as jest.Mock).mockImplementation((arr, idx) => arr[idx]);
      (parseBool as jest.Mock).mockReturnValue(false);

      // We need to access the internal parseCsvToDtos function
      // Since it's not exported, we'll test it indirectly through fetchPeriodSetupFromApi
      const mockResponse = {
        data: {
          status: 'Ok',
          data: [
            {
              key: 'period_setup',
              value: { csvData },
            },
          ],
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      (mapDtoToModel as jest.Mock).mockReturnValue(mockPeriodSetupModel);

      return fetchPeriodSetupFromApi(mockEntityId).then(() => {
        expect(mapDtoToModel).toHaveBeenCalledWith(
          expect.objectContaining({
            Id: '1',
            EntityId: 'test-entity-id',
            FinancialYearName: 'FY 2023-24',
            StartMonth: 'April',
            EndMonth: 'March',
            HistoricalYearSpan: 5,
            UserViewYearSpan: 3,
            WeekName: 'W1-23',
            MonthForWeekOne: 'January',
            StartingDayOfWeek: 'Monday',
            IsDeleted: false,
            CreatedAt: '2023-01-01T00:00:00Z',
            LastUpdatedAt: '2023-01-01T00:00:00Z',
          })
        );
      });
    });
  });

  describe('API URL construction', () => {
    it('should use environment variable for API URL', () => {
      const originalEnv = process.env.REACT_APP_DATA_API_URL;
      process.env.REACT_APP_DATA_API_URL = 'https://api.example.com';
      
      // Re-import to get the updated URL
      jest.resetModules();
      
      // Re-mock axios after reset
      const axios = require('axios');
      axios.post = jest.fn().mockResolvedValue({
        data: {
          status: 'Ok',
          data: [{ key: 'period_setup', value: { csvData: [] } }],
        },
      });
      
      const { fetchPeriodSetupFromApi: fetchPeriodSetupFromApiNew } = require('../../src/services/periodSetupService');

      return fetchPeriodSetupFromApiNew(mockEntityId).then(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'https://api.example.com/api/v1/data/Data/ExecuteSqlQueries',
          expect.any(Object)
        );
        // Restore original environment
        process.env.REACT_APP_DATA_API_URL = originalEnv;
      });
    });

    it('should use empty string as fallback when environment variable is not set', () => {
      const originalEnv = process.env.REACT_APP_DATA_API_URL;
      delete process.env.REACT_APP_DATA_API_URL;
      
      // Re-import to get the updated URL
      jest.resetModules();
      
      // Re-mock axios after reset
      const axios = require('axios');
      axios.post = jest.fn().mockResolvedValue({
        data: {
          status: 'Ok',
          data: [{ key: 'period_setup', value: { csvData: [] } }],
        },
      });
      
      const { fetchPeriodSetupFromApi: fetchPeriodSetupFromApiNew } = require('../../src/services/periodSetupService');

      return fetchPeriodSetupFromApiNew(mockEntityId).then(() => {
        expect(axios.post).toHaveBeenCalledWith(
          '/api/v1/data/Data/ExecuteSqlQueries',
          expect.any(Object)
        );
        // Restore original environment
        process.env.REACT_APP_DATA_API_URL = originalEnv;
      });
    });
  });
});
