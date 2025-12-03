import { stripQuotes, parseMaybeJson } from '../../src/utils/jsonParsingUtils';

describe('jsonParsingUtils', () => {
  describe('stripQuotes', () => {
    it('should strip single quotes from string', () => {
      expect(stripQuotes("'test'")).toBe('test');
    });

    it('should strip double quotes from string', () => {
      expect(stripQuotes('"test"')).toBe('test');
    });

    it('should not strip quotes if only one side has quotes', () => {
      expect(stripQuotes('"test')).toBe('"test');
      expect(stripQuotes('test"')).toBe('test"');
    });

    it('should handle empty string', () => {
      expect(stripQuotes('')).toBe('');
    });

    it('should handle string with no quotes', () => {
      expect(stripQuotes('test')).toBe('test');
    });

    it('should handle string with spaces', () => {
      expect(stripQuotes('  "test"  ')).toBe('test');
    });

    it('should return empty string for null', () => {
      expect(stripQuotes(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(stripQuotes(undefined)).toBe('');
    });

    it('should return empty string for object', () => {
      expect(stripQuotes({})).toBe('');
      expect(stripQuotes([])).toBe('');
    });

    it('should handle mixed quote types', () => {
      expect(stripQuotes("'test'")).toBe('test');
      expect(stripQuotes('"test"')).toBe('test');
    });

    it('should handle nested quotes', () => {
      expect(stripQuotes('"test with \\"nested\\" quotes"')).toBe('test with \\"nested\\" quotes');
    });
  });

  describe('parseMaybeJson', () => {
    it('should parse valid JSON object', () => {
      const result = parseMaybeJson('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('should parse valid JSON array', () => {
      const result = parseMaybeJson('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle escaped quotes in JSON', () => {
      const result = parseMaybeJson('{"key": "value with \\"quotes\\""}');
      expect(result).toBe('{"key": "value with \\"quotes\\""}');
    });

    it('should return original string for invalid JSON', () => {
      const result = parseMaybeJson('{"invalid": json}');
      expect(result).toBe('{"invalid": json}');
    });

    it('should return original string for non-JSON string', () => {
      const result = parseMaybeJson('just a string');
      expect(result).toBe('just a string');
    });

    it('should return undefined for empty string', () => {
      const result = parseMaybeJson('');
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      const result = parseMaybeJson(undefined);
      expect(result).toBeUndefined();
    });

    it('should handle string with spaces', () => {
      const result = parseMaybeJson('  {"key": "value"}  ');
      expect(result).toEqual({ key: 'value' });
    });

    it('should handle complex JSON with nested objects', () => {
      const json = '{"user": {"name": "John", "age": 30}, "active": true}';
      const result = parseMaybeJson(json);
      expect(result).toEqual({ user: { name: 'John', age: 30 }, active: true });
    });

    it('should handle JSON array with objects', () => {
      const json = '[{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]';
      const result = parseMaybeJson(json);
      expect(result).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]);
    });

    it('should handle malformed JSON gracefully', () => {
      const result = parseMaybeJson('{"incomplete": }');
      expect(result).toBe('{"incomplete": }');
    });

    it('should handle JSON with special characters', () => {
      const json = '{"message": "Hello \\"World\\" with \\n newlines"}';
      const result = parseMaybeJson(json);
      expect(result).toBe('{"message": "Hello \\"World\\" with \\n newlines"}');
    });
  });
});
