// Import from commonApp mock instead of non-existent source file
import {
  sanitizeQuotes,
  sanitizeModuleName,
  sanitizeModuleDescription,
  sanitizeTextField,
} from 'commonApp/stringUtils';

describe('stringUtils', () => {
  describe('sanitizeQuotes', () => {
    it('should remove double quotes from beginning and end', () => {
      expect(sanitizeQuotes('"Planning Module"')).toBe('Planning Module');
      expect(sanitizeQuotes('"Handles forecasting"')).toBe('Handles forecasting');
      expect(sanitizeQuotes('"Module with spaces"')).toBe('Module with spaces');
    });

    it('should remove single quotes from beginning and end', () => {
      expect(sanitizeQuotes("'Planning Module'")).toBe('Planning Module');
      expect(sanitizeQuotes("'Handles forecasting'")).toBe('Handles forecasting');
      expect(sanitizeQuotes("'Module with spaces'")).toBe('Module with spaces');
    });

    it('should preserve quotes that are part of the content', () => {
      expect(sanitizeQuotes('"Module with "quotes" inside"')).toBe('Module with "quotes" inside');
      expect(sanitizeQuotes("'Module with 'quotes' inside'")).toBe("Module with 'quotes' inside");
      expect(sanitizeQuotes('"He said "Hello" to me"')).toBe('He said "Hello" to me');
    });

    it('should handle mixed quote types', () => {
      expect(sanitizeQuotes('"Module with \'single\' quotes"')).toBe("Module with 'single' quotes");
      expect(sanitizeQuotes("'Module with \"double\" quotes'")).toBe('Module with "double" quotes');
    });

    it('should handle strings without quotes', () => {
      expect(sanitizeQuotes('Normal text')).toBe('Normal text');
      expect(sanitizeQuotes('Module Name')).toBe('Module Name');
      expect(sanitizeQuotes('Description without quotes')).toBe('Description without quotes');
    });

    it('should handle empty strings', () => {
      expect(sanitizeQuotes('')).toBe('');
      expect(sanitizeQuotes('   ')).toBe('');
    });

    it('should handle single character quotes', () => {
      expect(sanitizeQuotes('"')).toBe('"');
      expect(sanitizeQuotes("'")).toBe("'");
    });

    it('should handle strings with only quotes', () => {
      expect(sanitizeQuotes('""')).toBe('');
      expect(sanitizeQuotes("''")).toBe('');
      expect(sanitizeQuotes('"\'')).toBe('"\'');
    });

    it('should trim whitespace before processing', () => {
      expect(sanitizeQuotes('  "Planning Module"  ')).toBe('Planning Module');
      expect(sanitizeQuotes("  'Handles forecasting'  ")).toBe('Handles forecasting');
      expect(sanitizeQuotes('  Normal text  ')).toBe('Normal text');
    });

    it('should handle null and undefined inputs', () => {
      expect(sanitizeQuotes(null as any)).toBe('');
      expect(sanitizeQuotes(undefined as any)).toBe('');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeQuotes(123 as any)).toBe(123);
      expect(sanitizeQuotes(true as any)).toBe(true);
      expect(sanitizeQuotes({} as any)).toEqual({});
    });

    it('should handle complex nested quotes', () => {
      expect(sanitizeQuotes('"Module "A" handles "planning""')).toBe('Module "A" handles "planning"');
      expect(sanitizeQuotes("'Module 'B' handles 'forecasting''")).toBe("Module 'B' handles 'forecasting'");
    });

    it('should handle strings with multiple quote pairs', () => {
      expect(sanitizeQuotes('"First" and "Second"')).toBe('First" and "Second');
      expect(sanitizeQuotes("'First' and 'Second'")).toBe("First' and 'Second");
    });
  });

  describe('sanitizeModuleName', () => {
    it('should remove quotes from module names', () => {
      expect(sanitizeModuleName('"Budgeting"')).toBe('Budgeting');
      expect(sanitizeModuleName("'Inventory Planning'")).toBe('Inventory Planning');
      expect(sanitizeModuleName('"Assortment Planning"')).toBe('Assortment Planning');
    });

    it('should preserve quotes within module names', () => {
      expect(sanitizeModuleName('"Module "A" for Planning"')).toBe('Module "A" for Planning');
      expect(sanitizeModuleName("'Module 'B' for Analysis'")).toBe("Module 'B' for Analysis");
    });

    it('should handle module names without quotes', () => {
      expect(sanitizeModuleName('Budgeting')).toBe('Budgeting');
      expect(sanitizeModuleName('Inventory Planning')).toBe('Inventory Planning');
    });

    it('should handle empty module names', () => {
      expect(sanitizeModuleName('')).toBe('');
      expect(sanitizeModuleName('"')).toBe('"');
    });
  });

  describe('sanitizeModuleDescription', () => {
    it('should remove quotes from module descriptions', () => {
      expect(sanitizeModuleDescription('"This module enables planning financial goals"')).toBe('This module enables planning financial goals');
      expect(sanitizeModuleDescription("'Handles inventory management and tracking'")).toBe('Handles inventory management and tracking');
    });

    it('should preserve quotes within descriptions', () => {
      expect(sanitizeModuleDescription('"This module handles "planning" and "forecasting""')).toBe('This module handles "planning" and "forecasting"');
      expect(sanitizeModuleDescription("'Module for 'inventory' management'")).toBe("Module for 'inventory' management");
    });

    it('should handle descriptions without quotes', () => {
      expect(sanitizeModuleDescription('This module enables planning financial goals')).toBe('This module enables planning financial goals');
      expect(sanitizeModuleDescription('Handles inventory management')).toBe('Handles inventory management');
    });

    it('should handle empty descriptions', () => {
      expect(sanitizeModuleDescription('')).toBe('');
      expect(sanitizeModuleDescription('"')).toBe('"');
    });

    it('should handle long descriptions with quotes', () => {
      const longDesc = '"This module enables selecting the optimal product mix across locations and time periods to satisfy customer preferences, while determining the types, quantities, and presentation of products to create a balanced, profitable, and cohesive assortment that aligns with customer needs and seasonal trends."';
      const expected = 'This module enables selecting the optimal product mix across locations and time periods to satisfy customer preferences, while determining the types, quantities, and presentation of products to create a balanced, profitable, and cohesive assortment that aligns with customer needs and seasonal trends.';
      expect(sanitizeModuleDescription(longDesc)).toBe(expected);
    });
  });

  describe('sanitizeTextField', () => {
    it('should work as an alias for sanitizeQuotes', () => {
      expect(sanitizeTextField('"Any text field"')).toBe('Any text field');
      expect(sanitizeTextField("'Another text field'")).toBe('Another text field');
      expect(sanitizeTextField('Text without quotes')).toBe('Text without quotes');
    });

    it('should handle various text field scenarios', () => {
      expect(sanitizeTextField('"User input"')).toBe('User input');
      expect(sanitizeTextField("'API response'")).toBe('API response');
      expect(sanitizeTextField('"Field with "nested" quotes"')).toBe('Field with "nested" quotes');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed quote patterns', () => {
      expect(sanitizeQuotes('"Unclosed quote')).toBe('"Unclosed quote');
      expect(sanitizeQuotes("'Unclosed single quote")).toBe("'Unclosed single quote");
      expect(sanitizeQuotes('Quote in "middle" of text')).toBe('Quote in "middle" of text');
    });

    it('should handle strings with only whitespace and quotes', () => {
      expect(sanitizeQuotes('  "  "  ')).toBe('  ');
      expect(sanitizeQuotes("  '  '  ")).toBe('  ');
    });

    it('should handle very long strings', () => {
      const longString = '"' + 'A'.repeat(1000) + '"';
      expect(sanitizeQuotes(longString)).toBe('A'.repeat(1000));
    });

    it('should handle strings with special characters', () => {
      expect(sanitizeQuotes('"Module with special chars: @#$%^&*()"')).toBe('Module with special chars: @#$%^&*()');
      expect(sanitizeQuotes('"Unicode: 你好世界"')).toBe('Unicode: 你好世界');
    });

    it('should handle strings with newlines and tabs', () => {
      expect(sanitizeQuotes('"Line 1\nLine 2"')).toBe('Line 1\nLine 2');
      expect(sanitizeQuotes('"Tab\tseparated"')).toBe('Tab\tseparated');
    });
  });

  describe('Performance', () => {
    it('should handle rapid calls efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        sanitizeQuotes('"Test string"');
        sanitizeQuotes("'Another test'");
        sanitizeQuotes('No quotes here');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 3000 operations in less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
