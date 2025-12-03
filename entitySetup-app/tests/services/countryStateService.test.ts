import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetchCountryStateMap } from '../../src/services/countryStateService';

describe('countryStateService', () => {
  let mockAxios: MockAdapter;
  let originalConsoleLog: any;
  let originalConsoleError: any;
  let originalEnv: any;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    originalEnv = process.env;
    // Mock console to reduce test noise
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    mockAxios.restore();
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('fetchCountryStateMap', () => {
    it('should fetch country-state map successfully with CSV format', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'country_state',
            value: {
              csvData: [
                'Country|States',
                'United States|["California", "Texas"]',
                'Canada|["Ontario", "Quebec"]'
              ]
            }
          }
        ]
      };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await fetchCountryStateMap();

      expect(result).toEqual({
        'Canada': { states: ['Ontario', 'Quebec'], currencies: [] },
        'United States': { states: ['California', 'Texas'], currencies: [] }
      });
    });

    it('should handle CSV data with quoted values', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'country_state',
            value: {
              csvData: [
                'Country|States',
                '"United States"|["California"]',
                "'Canada'|[\"Ontario\"]"
              ]
            }
          }
        ]
      };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await fetchCountryStateMap();

      expect(result).toEqual({
        'Canada': { states: ['Ontario'], currencies: [] },
        'United States': { states: ['California'], currencies: [] }
      });
    });

    it('should handle CSV data with JSON array states', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'country_state',
            value: {
              csvData: [
                'Country|States',
                'United States|["California", "Texas"]',
                'Canada|["Ontario", "Quebec"]'
              ]
            }
          }
        ]
      };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await fetchCountryStateMap();

      expect(result).toEqual({
        'Canada': { states: ['Ontario', 'Quebec'], currencies: [] },
        'United States': { states: ['California', 'Texas'], currencies: [] }
      });
    });

    it('should handle empty CSV data', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'country_state',
            value: {
              csvData: ['Country|States']
            }
          }
        ]
      };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await fetchCountryStateMap();

      expect(result).toEqual({});
    });

    it('should handle malformed CSV data', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'country_state',
            value: {
              csvData: 'not an array'
            }
          }
        ]
      };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await fetchCountryStateMap();

      expect(result).toEqual({});
    });

    it('should handle missing CSV data', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'country_state',
            value: {}
          }
        ]
      };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await fetchCountryStateMap();

      expect(result).toEqual({});
    });

    it('should handle empty states arrays', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'country_state',
            value: {
              csvData: [
                'Country|States',
                'United States|[]',
                'Canada|["Ontario"]'
              ]
            }
          }
        ]
      };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await fetchCountryStateMap();

      expect(result).toEqual({
        'Canada': { states: ['Ontario'], currencies: [] },
        'United States': { states: [], currencies: [] }
      });
    });

    it('should handle non-JSON states values', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'country_state',
            value: {
              csvData: [
                'Country|States',
                'United States|not json',
                'Canada|["Ontario"]'
              ]
            }
          }
        ]
      };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await fetchCountryStateMap();

      expect(result).toEqual({
        'Canada': { states: ['Ontario'], currencies: [] },
        'United States': { states: [], currencies: [] }
      });
    });

    it('should handle countries with duplicate states', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'country_state',
            value: {
              csvData: [
                'Country|States',
                'United States|["California", "Texas", "California"]'
              ]
            }
          }
        ]
      };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await fetchCountryStateMap();

      expect(result).toEqual({
        'United States': { states: ['California', 'Texas'], currencies: [] }
      });
    });

    it('should handle missing country values', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'country_state',
            value: {
              csvData: [
                'Country|States',
                '|["California"]',
                'Canada|["Ontario"]'
              ]
            }
          }
        ]
      };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await fetchCountryStateMap();

      expect(result).toEqual({
        'Canada': { states: ['Ontario'], currencies: [] }
      });
    });

    it('should sort states alphabetically', async () => {
      const mockResponse = {
        status: 'Ok',
        data: [
          {
            key: 'country_state',
            value: {
              csvData: [
                'Country|States',
                'United States|["Texas", "California", "Alaska"]'
              ]
            }
          }
        ]
      };

      mockAxios.onPost().reply(200, mockResponse);

      const result = await fetchCountryStateMap();

      expect(result).toEqual({
        'United States': { states: ['Alaska', 'California', 'Texas'], currencies: [] }
      });
    });

    it('should handle API errors', async () => {
      mockAxios.onPost().reply(500, { message: 'Server error' });

      await expect(fetchCountryStateMap()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockAxios.onPost().networkError();

      await expect(fetchCountryStateMap()).rejects.toThrow();
    });
  });
});