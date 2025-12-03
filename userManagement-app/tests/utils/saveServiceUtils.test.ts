import {
  escapeSingleQuotes,
  quoteString,
  formatTimestamp,
  formatTimestampFromDate,
  quoteJSON,
  getSaveEndpoint,
  getQueryEndpoint,
} from '../../src/utils/saveServiceUtils';

describe('saveServiceUtils', () => {
  describe('escapeSingleQuotes', () => {
    it('should escape single quotes in string', () => {
      expect(escapeSingleQuotes("test'string")).toBe("test''string");
    });

    it('should handle string with multiple single quotes', () => {
      expect(escapeSingleQuotes("test'string'with'quotes")).toBe("test''string''with''quotes");
    });

    it('should return unchanged string when no single quotes', () => {
      expect(escapeSingleQuotes('test string')).toBe('test string');
    });

    it('should handle empty string', () => {
      expect(escapeSingleQuotes('')).toBe('');
    });

    it('should handle string with only single quote', () => {
      expect(escapeSingleQuotes("'")).toBe("''");
    });
  });

  describe('quoteString', () => {
    it('should quote a valid string', () => {
      expect(quoteString('test')).toBe("'test'");
    });

    it('should escape single quotes in string', () => {
      expect(quoteString("test'string")).toBe("'test''string'");
    });

    it('should return NULL for undefined', () => {
      expect(quoteString(undefined)).toBe('NULL');
    });

    it('should return NULL for null', () => {
      expect(quoteString(null as any)).toBe('NULL');
    });

    it('should handle empty string', () => {
      expect(quoteString('')).toBe("''");
    });

    it('should handle string with special characters', () => {
      expect(quoteString('test&string<script>')).toBe("'test&string<script>'");
    });
  });

  describe('formatTimestamp', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-01-15T10:30:45Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should format current timestamp correctly', () => {
      const result = formatTimestamp();
      expect(result).toMatch(/^'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'$/);
    });

    it('should format timestamp with correct format', () => {
      const result = formatTimestamp();
      expect(result).toBe("'2023-01-15 10:30:45'");
    });

    it('should pad single digit values with zero', () => {
      jest.setSystemTime(new Date('2023-01-05T05:05:05Z'));
      const result = formatTimestamp();
      expect(result).toBe("'2023-01-05 05:05:05'");
    });
  });

  describe('formatTimestampFromDate', () => {
    it('should format provided timestamp correctly', () => {
      const timestamp = '2023-12-25T15:45:30Z';
      const result = formatTimestampFromDate(timestamp);
      expect(result).toMatch(/^'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'$/);
    });

    it('should format timestamp with correct values', () => {
      const timestamp = '2023-12-25T15:45:30Z';
      const result = formatTimestampFromDate(timestamp);
      expect(result).toBe("'2023-12-25 15:45:30'");
    });

    it('should pad single digit values', () => {
      const timestamp = '2023-01-05T05:05:05Z';
      const result = formatTimestampFromDate(timestamp);
      expect(result).toBe("'2023-01-05 05:05:05'");
    });

    it('should handle different date formats', () => {
      const timestamp = '2023-06-15T09:20:10.123Z';
      const result = formatTimestampFromDate(timestamp);
      expect(result).toMatch(/^'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'$/);
    });
  });

  describe('quoteJSON', () => {
    it('should quote JSON object', () => {
      const obj = { key: 'value' };
      const result = quoteJSON(obj);
      expect(result).toBe("'{\"key\":\"value\"}'");
    });

    it('should quote JSON array', () => {
      const arr = [1, 2, 3];
      const result = quoteJSON(arr);
      expect(result).toBe("'[1,2,3]'");
    });

    it('should return NULL for undefined', () => {
      expect(quoteJSON(undefined)).toBe('NULL');
    });

    it('should return NULL for null', () => {
      expect(quoteJSON(null)).toBe('NULL');
    });

    it('should handle complex JSON object', () => {
      const obj = {
        key1: 'value1',
        key2: { nested: 'value' },
        key3: [1, 2, 3],
      };
      const result = quoteJSON(obj);
      expect(result).toContain('key1');
      expect(result).toContain('key2');
      expect(result).toContain('key3');
    });

    it('should handle JSON with single quotes in values', () => {
      const obj = { key: "value'with'quotes" };
      const result = quoteJSON(obj);
      expect(result).toContain("value''with''quotes");
    });

    it('should return NULL on JSON stringify error', () => {
      const circular: any = {};
      circular.self = circular;
      
      // Mock JSON.stringify to throw error
      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn(() => {
        throw new Error('Circular reference');
      });

      const result = quoteJSON(circular);
      expect(result).toBe('NULL');

      JSON.stringify = originalStringify;
    });
  });

  describe('getSaveEndpoint', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return default endpoint when env var is not set', () => {
      delete process.env.REACT_APP_DATA_API_URL;
      const result = getSaveEndpoint();
      expect(result).toBe('https://172.16.20.116:50005/api/v1/data/Data/SaveData');
    });

    it('should return endpoint with custom base URL from env var', () => {
      process.env.REACT_APP_DATA_API_URL = 'https://custom-url:8080';
      const result = getSaveEndpoint();
      expect(result).toBe('https://custom-url:8080/api/v1/data/Data/SaveData');
    });

    it('should log the baseUrl', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      delete process.env.REACT_APP_DATA_API_URL;
      getSaveEndpoint();
      expect(consoleSpy).toHaveBeenCalledWith('getSaveEndpoint: Using baseUrl:', 'https://172.16.20.116:50005');
      consoleSpy.mockRestore();
    });
  });

  describe('getQueryEndpoint', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return default endpoint when env var is not set', () => {
      delete process.env.REACT_APP_DATA_API_URL;
      const result = getQueryEndpoint();
      expect(result).toBe('https://172.16.20.116:50005/api/v1/data/Data/ExecuteSqlQueries');
    });

    it('should return endpoint with custom base URL from env var', () => {
      process.env.REACT_APP_DATA_API_URL = 'https://custom-url:8080';
      const result = getQueryEndpoint();
      expect(result).toBe('https://custom-url:8080/api/v1/data/Data/ExecuteSqlQueries');
    });
  });
});


