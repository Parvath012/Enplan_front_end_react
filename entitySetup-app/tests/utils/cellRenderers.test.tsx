import { createHighlightedCellRenderer, createCellStyles, createDefaultCellRenderer } from '../../src/utils/cellRenderers';

describe('cellRenderers', () => {
  describe('createHighlightedCellRenderer', () => {
    it('should return a function that renders highlighted text', () => {
      const renderer = createHighlightedCellRenderer('test', 10);
      const params = { value: 'This is a test string' };
      const result = renderer(params);
      
      expect(result).toContain('<span>');
      expect(result).toContain('<mark>test</mark>');
    });

    it('should handle empty value', () => {
      const renderer = createHighlightedCellRenderer('test', 10);
      const params = { value: null };
      const result = renderer(params);
      
      expect(result).toBe('');
    });

    it('should handle undefined value', () => {
      const renderer = createHighlightedCellRenderer('test', 10);
      const params = { value: undefined };
      const result = renderer(params);
      
      expect(result).toBe('');
    });

    it('should handle empty string value', () => {
      const renderer = createHighlightedCellRenderer('test', 10);
      const params = { value: '' };
      const result = renderer(params);
      
      expect(result).toBe('');
    });

    it('should truncate text when it exceeds maxLength', () => {
      const renderer = createHighlightedCellRenderer('test', 10);
      const params = { value: 'This is a very long string that should be truncated' };
      const result = renderer(params);
      
      expect(result).toContain('This is a...');
    });

    it('should not truncate text when it is shorter than maxLength', () => {
      const renderer = createHighlightedCellRenderer('test', 50);
      const params = { value: 'Short text' };
      const result = renderer(params);
      
      expect(result).toContain('Short text');
      expect(result).not.toContain('...');
    });

    it('should handle case insensitive highlighting', () => {
      const renderer = createHighlightedCellRenderer('TEST', 20);
      const params = { value: 'This is a test string' };
      const result = renderer(params);
      
      expect(result).toContain('<mark>test</mark>');
    });

    it('should handle multiple occurrences of search term', () => {
      const renderer = createHighlightedCellRenderer('test', 50);
      const params = { value: 'This is a test string with test in it' };
      const result = renderer(params);
      
      expect(result).toContain('<mark>test</mark>');
      expect((result.match(/<mark>test<\/mark>/g) || []).length).toBe(2);
    });

    it('should not highlight when searchValue is empty', () => {
      const renderer = createHighlightedCellRenderer('', 20);
      const params = { value: 'This is a test string' };
      const result = renderer(params);
      
      expect(result).toContain('This is a test string');
      expect(result).not.toContain('<mark>');
    });

    it('should not highlight when searchValue is null', () => {
      const renderer = createHighlightedCellRenderer(null as any, 20);
      const params = { value: 'This is a test string' };
      const result = renderer(params);
      
      expect(result).toContain('This is a test string');
      expect(result).not.toContain('<mark>');
    });

    it('should not highlight when searchValue is undefined', () => {
      const renderer = createHighlightedCellRenderer(undefined as any, 20);
      const params = { value: 'This is a test string' };
      const result = renderer(params);
      
      expect(result).toContain('This is a test string');
      expect(result).not.toContain('<mark>');
    });

    it('should use default maxLength of 50', () => {
      const renderer = createHighlightedCellRenderer('test');
      const params = { value: 'This is a very long string that should be truncated because it exceeds the default maxLength of 50 characters' };
      const result = renderer(params);
      
      expect(result).toContain('...');
    });

    it('should handle special regex characters in search term', () => {
      const renderer = createHighlightedCellRenderer('test[0-9]', 50);
      const params = { value: 'This is a test[0-9] string' };
      const result = renderer(params);
      
      expect(result).toContain('<mark>test[0-9]</mark>');
    });

    it('should handle numeric values', () => {
      const renderer = createHighlightedCellRenderer('123', 20);
      const params = { value: 12345 };
      const result = renderer(params);
      
      expect(result).toContain('<mark>123</mark>');
    });

    it('should handle boolean values', () => {
      const renderer = createHighlightedCellRenderer('true', 20);
      const params = { value: true };
      const result = renderer(params);
      
      expect(result).toContain('<mark>true</mark>');
    });
  });

  describe('createCellStyles', () => {
    it('should return default styles for valid value', () => {
      const params = { value: 'test' };
      const styles = createCellStyles(params);
      
      expect(styles).toEqual({
        color: 'inherit',
        fontStyle: 'normal'
      });
    });

    it('should return italic styles for null value', () => {
      const params = { value: null };
      const styles = createCellStyles(params);
      
      expect(styles).toEqual({
        color: '#999',
        fontStyle: 'italic'
      });
    });

    it('should return italic styles for undefined value', () => {
      const params = { value: undefined };
      const styles = createCellStyles(params);
      
      expect(styles).toEqual({
        color: '#999',
        fontStyle: 'italic'
      });
    });

    it('should return italic styles for empty string value', () => {
      const params = { value: '' };
      const styles = createCellStyles(params);
      
      expect(styles).toEqual({
        color: '#999',
        fontStyle: 'italic'
      });
    });

    it('should return italic styles for zero value', () => {
      const params = { value: 0 };
      const styles = createCellStyles(params);
      
      expect(styles).toEqual({
        color: 'inherit',
        fontStyle: 'normal'
      });
    });

    it('should return italic styles for false value', () => {
      const params = { value: false };
      const styles = createCellStyles(params);
      
      expect(styles).toEqual({
        color: 'inherit',
        fontStyle: 'normal'
      });
    });
  });

  describe('createDefaultCellRenderer', () => {
    it('should return a function that returns the value', () => {
      const renderer = createDefaultCellRenderer();
      const params = { value: 'test value' };
      const result = renderer(params);
      
      expect(result).toBe('test value');
    });

    it('should return empty string for null value', () => {
      const renderer = createDefaultCellRenderer();
      const params = { value: null };
      const result = renderer(params);
      
      expect(result).toBe('');
    });

    it('should return empty string for undefined value', () => {
      const renderer = createDefaultCellRenderer();
      const params = { value: undefined };
      const result = renderer(params);
      
      expect(result).toBe('');
    });

    it('should return empty string for empty string value', () => {
      const renderer = createDefaultCellRenderer();
      const params = { value: '' };
      const result = renderer(params);
      
      expect(result).toBe('');
    });

    it('should return the value for numeric values', () => {
      const renderer = createDefaultCellRenderer();
      const params = { value: 123 };
      const result = renderer(params);
      
      expect(result).toBe(123);
    });

    it('should return the value for boolean values', () => {
      const renderer = createDefaultCellRenderer();
      const params = { value: true };
      const result = renderer(params);
      
      expect(result).toBe(true);
    });

    it('should return the value for object values', () => {
      const renderer = createDefaultCellRenderer();
      const params = { value: { test: 'value' } };
      const result = renderer(params);
      
      expect(result).toEqual({ test: 'value' });
    });
  });
});
