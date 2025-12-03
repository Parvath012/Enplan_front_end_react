import { parseCSVToRows } from '../../src/utils/gridParser';

describe('gridParser', () => {
  describe('parseCSVToRows', () => {
    it('should parse simple CSV data correctly', () => {
      const csvData = [
        'Name|Age|City',
        'John|25|New York',
        'Jane|30|London'
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, Name: 'John', Age: '25', City: 'New York' },
        { id: 1, Name: 'Jane', Age: '30', City: 'London' }
      ]);
    });

    it('should handle empty data rows', () => {
      const csvData = ['Name|Age|City'];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([]);
    });

    it('should handle single column data', () => {
      const csvData = [
        'Name',
        'John',
        'Jane'
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, Name: 'John' },
        { id: 1, Name: 'Jane' }
      ]);
    });

    it('should remove leading single quotes from values', () => {
      const csvData = [
        'Name|Age|City',
        "'John'|'25'|'New York'",
        "'Jane'|'30'|'London'"
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, Name: 'John', Age: '25', City: 'New York' },
        { id: 1, Name: 'Jane', Age: '30', City: 'London' }
      ]);
    });

    it('should remove trailing single quotes from values', () => {
      const csvData = [
        'Name|Age|City',
        "John'|25'|New York'",
        "Jane'|30'|London'"
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, Name: 'John', Age: '25', City: 'New York' },
        { id: 1, Name: 'Jane', Age: '30', City: 'London' }
      ]);
    });

    it('should remove multiple leading single quotes', () => {
      const csvData = [
        'Name|Age|City',
        "'''John'''|'''25'''|'''New York'''",
        "'''Jane'''|'''30'''|'''London'''"
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, Name: 'John', Age: '25', City: 'New York' },
        { id: 1, Name: 'Jane', Age: '30', City: 'London' }
      ]);
    });

    it('should handle mixed quote scenarios', () => {
      const csvData = [
        'Name|Age|City',
        "'John'|25|'New York'",
        "Jane|'30'|London"
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, Name: 'John', Age: '25', City: 'New York' },
        { id: 1, Name: 'Jane', Age: '30', City: 'London' }
      ]);
    });

    it('should trim whitespace from values', () => {
      const csvData = [
        'Name|Age|City',
        '  John  |  25  |  New York  ',
        '  Jane  |  30  |  London  '
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, Name: 'John', Age: '25', City: 'New York' },
        { id: 1, Name: 'Jane', Age: '30', City: 'London' }
      ]);
    });

    it('should handle empty values', () => {
      const csvData = [
        'Name|Age|City',
        'John||New York',
        '|30|London'
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, Name: 'John', Age: '', City: 'New York' },
        { id: 1, Name: '', Age: '30', City: 'London' }
      ]);
    });

    it('should handle undefined values gracefully', () => {
      const csvData = [
        'Name|Age|City',
        'John|25|New York',
        'Jane|30|' // Missing last value
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, Name: 'John', Age: '25', City: 'New York' },
        { id: 1, Name: 'Jane', Age: '30', City: '' }
      ]);
    });

    it('should handle large datasets', () => {
      const headers = 'Name|Age|City|Country|Occupation';
      const dataRows = Array.from({ length: 1000 }, (_, i) => 
        `Person${i}|${20 + i}|City${i}|Country${i}|Job${i}`
      );
      const csvData = [headers, ...dataRows];

      const result = parseCSVToRows(csvData);

      expect(result).toHaveLength(1000);
      expect(result[0]).toEqual({
        id: 0,
        Name: 'Person0',
        Age: '20',
        City: 'City0',
        Country: 'Country0',
        Occupation: 'Job0'
      });
      expect(result[999]).toEqual({
        id: 999,
        Name: 'Person999',
        Age: '1019',
        City: 'City999',
        Country: 'Country999',
        Occupation: 'Job999'
      });
    });

    it('should handle special characters in data', () => {
      const csvData = [
        'Name|Description|Price',
        'Item1|"Special chars: @#$%^&*()"|$10.99',
        'Item2|"Unicode: 你好世界"|€15.50',
        'Item3|"Symbols: ±×÷≤≥"|¥100'
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, Name: 'Item1', Description: '"Special chars: @#$%^&*()"', Price: '$10.99' },
        { id: 1, Name: 'Item2', Description: '"Unicode: 你好世界"', Price: '€15.50' },
        { id: 2, Name: 'Item3', Description: '"Symbols: ±×÷≤≥"', Price: '¥100' }
      ]);
    });

    it('should handle numeric data correctly', () => {
      const csvData = [
        'ID|Value|Decimal|Percentage',
        '1|100|3.14159|25.5%',
        '2|-50|-2.71828|0%',
        '3|0|0.0|100%'
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, ID: '1', Value: '100', Decimal: '3.14159', Percentage: '25.5%' },
        { id: 1, ID: '2', Value: '-50', Decimal: '-2.71828', Percentage: '0%' },
        { id: 2, ID: '3', Value: '0', Decimal: '0.0', Percentage: '100%' }
      ]);
    });

    it('should handle edge case with only header', () => {
      const csvData = ['Name|Age|City'];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([]);
    });

    it('should handle edge case with empty string values', () => {
      const csvData = [
        'Name|Age|City',
        '||',
        'John||',
        '|25|'
      ];

      const result = parseCSVToRows(csvData);

      expect(result).toEqual([
        { id: 0, Name: '', Age: '', City: '' },
        { id: 1, Name: 'John', Age: '', City: '' },
        { id: 2, Name: '', Age: '25', City: '' }
      ]);
    });
  });
});
