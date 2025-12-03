import {
  sanitizeQuotes,
  sanitizeModuleName,
  sanitizeModuleDescription,
  sanitizeTextField
} from '../../src/utils/stringUtils';

describe('stringUtils', () => {
  describe('sanitizeQuotes', () => {
    it('should remove double quotes from beginning and end', () => {
      expect(sanitizeQuotes('"Planning Module"')).toBe('Planning Module');
    });

    it('should remove single quotes from beginning and end', () => {
      expect(sanitizeQuotes("'Handles forecasting'")).toBe('Handles forecasting');
    });

    it('should preserve quotes that are part of the content', () => {
      expect(sanitizeQuotes('"Module with "quotes" inside"')).toBe('Module with "quotes" inside');
    });

    it('should return normal text unchanged', () => {
      expect(sanitizeQuotes('Normal text')).toBe('Normal text');
    });

    it('should handle empty string', () => {
      expect(sanitizeQuotes('')).toBe('');
    });

    it('should handle single quote character', () => {
      expect(sanitizeQuotes('"')).toBe('"');
    });

    it('should handle single quote character with single quotes', () => {
      expect(sanitizeQuotes("'")).toBe("'");
    });

    it('should handle string with only quotes', () => {
      expect(sanitizeQuotes('""')).toBe('');
      expect(sanitizeQuotes("''")).toBe('');
    });

    it('should handle string with spaces and quotes', () => {
      expect(sanitizeQuotes(' "quoted text" ')).toBe('quoted text');
      expect(sanitizeQuotes(" 'quoted text' ")).toBe('quoted text');
    });

    it('should handle mixed quote types', () => {
      expect(sanitizeQuotes('"text with \'inner\' quotes"')).toBe("text with 'inner' quotes");
      expect(sanitizeQuotes("'text with \"inner\" quotes'")).toBe('text with "inner" quotes');
    });

    it('should handle multiple layers of quotes', () => {
      expect(sanitizeQuotes('""double quoted""')).toBe('"double quoted"');
      expect(sanitizeQuotes("''single quoted''")).toBe("'single quoted'");
    });

    it('should handle string with quotes only at beginning', () => {
      expect(sanitizeQuotes('"text without end quote')).toBe('"text without end quote');
    });

    it('should handle string with quotes only at end', () => {
      expect(sanitizeQuotes('text without start quote"')).toBe('text without start quote"');
    });

    it('should handle string with quotes in middle', () => {
      expect(sanitizeQuotes('text "with" quotes in middle')).toBe('text "with" quotes in middle');
    });

    it('should handle null input', () => {
      expect(sanitizeQuotes(null as any)).toBe('');
    });

    it('should handle undefined input', () => {
      expect(sanitizeQuotes(undefined as any)).toBe('');
    });

    it('should handle non-string input', () => {
      expect(sanitizeQuotes(123 as any)).toBe(123);
      expect(sanitizeQuotes({} as any)).toEqual({});
      expect(sanitizeQuotes([] as any)).toEqual([]);
    });

    it('should handle very long strings', () => {
      const longText = 'a'.repeat(1000);
      const quotedLongText = `"${longText}"`;
      expect(sanitizeQuotes(quotedLongText)).toBe(longText);
    });

    it('should handle strings with special characters', () => {
      expect(sanitizeQuotes('"Special chars: !@#$%^&*()"')).toBe('Special chars: !@#$%^&*()');
      expect(sanitizeQuotes("'Unicode: 你好世界'")).toBe('Unicode: 你好世界');
    });

    it('should handle strings with newlines and tabs', () => {
      expect(sanitizeQuotes('"Line 1\nLine 2\tTabbed"')).toBe('Line 1\nLine 2\tTabbed');
      expect(sanitizeQuotes("'Line 1\nLine 2\tTabbed'")).toBe('Line 1\nLine 2\tTabbed');
    });
  });

  describe('sanitizeModuleName', () => {
    it('should call sanitizeQuotes with module name', () => {
      expect(sanitizeModuleName('"Planning Module"')).toBe('Planning Module');
      expect(sanitizeModuleName("'Handles forecasting'")).toBe('Handles forecasting');
      expect(sanitizeModuleName('Normal Module')).toBe('Normal Module');
    });

    it('should handle empty module name', () => {
      expect(sanitizeModuleName('')).toBe('');
    });

    it('should handle null/undefined module name', () => {
      expect(sanitizeModuleName(null as any)).toBe('');
      expect(sanitizeModuleName(undefined as any)).toBe('');
    });

    it('should handle module name with quotes in content', () => {
      expect(sanitizeModuleName('"Module with "quotes" inside"')).toBe('Module with "quotes" inside');
    });
  });

  describe('sanitizeModuleDescription', () => {
    it('should call sanitizeQuotes with module description', () => {
      expect(sanitizeModuleDescription('"Handles forecasting and planning"')).toBe('Handles forecasting and planning');
      expect(sanitizeModuleDescription("'Module for data management'")).toBe('Module for data management');
      expect(sanitizeModuleDescription('Normal Description')).toBe('Normal Description');
    });

    it('should handle empty module description', () => {
      expect(sanitizeModuleDescription('')).toBe('');
    });

    it('should handle null/undefined module description', () => {
      expect(sanitizeModuleDescription(null as any)).toBe('');
      expect(sanitizeModuleDescription(undefined as any)).toBe('');
    });

    it('should handle module description with quotes in content', () => {
      expect(sanitizeModuleDescription('"Description with "quotes" inside"')).toBe('Description with "quotes" inside');
    });

    it('should handle long descriptions', () => {
      const longDescription = 'A'.repeat(500);
      expect(sanitizeModuleDescription(`"${longDescription}"`)).toBe(longDescription);
    });
  });

  describe('sanitizeTextField', () => {
    it('should call sanitizeQuotes with text field', () => {
      expect(sanitizeTextField('"User input text"')).toBe('User input text');
      expect(sanitizeTextField("'Another text field'")).toBe('Another text field');
      expect(sanitizeTextField('Normal Text Field')).toBe('Normal Text Field');
    });

    it('should handle empty text field', () => {
      expect(sanitizeTextField('')).toBe('');
    });

    it('should handle null/undefined text field', () => {
      expect(sanitizeTextField(null as any)).toBe('');
      expect(sanitizeTextField(undefined as any)).toBe('');
    });

    it('should handle text field with quotes in content', () => {
      expect(sanitizeTextField('"Text with "quotes" inside"')).toBe('Text with "quotes" inside');
    });

    it('should handle various text field scenarios', () => {
      expect(sanitizeTextField('"Email: user@example.com"')).toBe('Email: user@example.com');
      expect(sanitizeTextField("'Phone: +1-555-123-4567'")).toBe('Phone: +1-555-123-4567');
      expect(sanitizeTextField('"JSON: {"key": "value"}"')).toBe('JSON: {"key": "value"}');
    });

    it('should handle multiline text fields', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      expect(sanitizeTextField(`"${multilineText}"`)).toBe(multilineText);
    });

    it('should handle text fields with special characters', () => {
      expect(sanitizeTextField('"Special: !@#$%^&*()_+-=[]{}|;:,.<>?"')).toBe('Special: !@#$%^&*()_+-=[]{}|;:,.<>?');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very short strings', () => {
      expect(sanitizeQuotes('a')).toBe('a');
      expect(sanitizeQuotes('ab')).toBe('ab');
    });

    it('should handle strings with only spaces', () => {
      expect(sanitizeQuotes('   ')).toBe('');
      expect(sanitizeQuotes('"   "')).toBe('   ');
    });

    it('should handle strings with mixed whitespace', () => {
      expect(sanitizeQuotes('\t\n\r')).toBe('');
      expect(sanitizeQuotes('"\t\n\r"')).toBe('\t\n\r');
    });

    it('should handle strings with unicode characters', () => {
      expect(sanitizeQuotes('"Hello 世界"')).toBe('Hello 世界');
      expect(sanitizeQuotes("'مرحبا بالعالم'")).toBe('مرحبا بالعالم');
    });

    it('should handle strings with emoji', () => {
      expect(sanitizeQuotes('"Hello 👋 World 🌍"')).toBe('Hello 👋 World 🌍');
    });

    it('should handle strings with escape sequences', () => {
      expect(sanitizeQuotes('"Text with \\n newline"')).toBe('Text with \\n newline');
      expect(sanitizeQuotes('"Text with \\t tab"')).toBe('Text with \\t tab');
    });

    it('should handle all wrapper functions consistently', () => {
      const testString = '"Test String"';
      expect(sanitizeQuotes(testString)).toBe('Test String');
      expect(sanitizeModuleName(testString)).toBe('Test String');
      expect(sanitizeModuleDescription(testString)).toBe('Test String');
      expect(sanitizeTextField(testString)).toBe('Test String');
    });
  });
});
