import { formatTime, formatStatusTimestamp } from '../../src/utils/timeUtils';

describe('timeUtils', () => {
  describe('formatTime', () => {
    it('should return formatted time with IST suffix', () => {
      const result = formatTime();
      expect(result).toContain('IST');
      expect(result).toMatch(/\d{2}:\d{2} IST/);
    });

    it('should return time in 24-hour format', () => {
      const result = formatTime();
      // Should match HH:MM format (24-hour)
      expect(result).toMatch(/^\d{2}:\d{2} IST$/);
    });

    it('should use en-IN locale', () => {
      const mockDate = new Date('2025-01-15T14:30:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      jest.spyOn(mockDate, 'toLocaleTimeString').mockReturnValue('14:30');

      const result = formatTime();
      expect(mockDate.toLocaleTimeString).toHaveBeenCalledWith('en-IN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
      expect(result).toBe('14:30 IST');

      jest.restoreAllMocks();
    });
  });

  describe('formatStatusTimestamp', () => {
    it('should return empty string for null timestamp', () => {
      expect(formatStatusTimestamp(null)).toBe('');
    });

    it('should return empty string for undefined timestamp', () => {
      expect(formatStatusTimestamp(undefined)).toBe('');
    });

    it('should format valid ISO timestamp string', () => {
      const timestamp = '2025-08-05T14:00:00Z';
      const result = formatStatusTimestamp(timestamp);
      expect(result).toMatch(/^\d{2}-[A-Za-z]{3}-\d{4} \d{2}:\d{2} (AM|PM)$/);
      expect(result).toContain('Aug');
      expect(result).toContain('2025');
    });

    it('should format Date object', () => {
      const date = new Date('2025-08-05T14:00:00Z');
      const result = formatStatusTimestamp(date);
      expect(result).toMatch(/^\d{2}-[A-Za-z]{3}-\d{4} \d{2}:\d{2} (AM|PM)$/);
    });

    it('should return empty string for invalid date string', () => {
      const result = formatStatusTimestamp('invalid-date');
      expect(result).toBe('');
    });

    it('should format date with single digit day correctly', () => {
      const date = new Date('2025-08-05T14:00:00Z');
      const result = formatStatusTimestamp(date);
      expect(result).toMatch(/^05-/);
    });

    it('should format date with double digit day correctly', () => {
      const date = new Date('2025-08-15T14:00:00Z');
      const result = formatStatusTimestamp(date);
      expect(result).toMatch(/^15-/);
    });

    it('should format all months correctly', () => {
      const months = [
        { month: 0, name: 'Jan' },
        { month: 1, name: 'Feb' },
        { month: 2, name: 'Mar' },
        { month: 3, name: 'Apr' },
        { month: 4, name: 'May' },
        { month: 5, name: 'Jun' },
        { month: 6, name: 'Jul' },
        { month: 7, name: 'Aug' },
        { month: 8, name: 'Sep' },
        { month: 9, name: 'Oct' },
        { month: 10, name: 'Nov' },
        { month: 11, name: 'Dec' },
      ];

      months.forEach(({ month, name }) => {
        const date = new Date(2025, month, 15, 14, 30);
        const result = formatStatusTimestamp(date);
        expect(result).toContain(name);
      });
    });

    it('should format AM time correctly', () => {
      const date = new Date('2025-08-05T09:30:00Z');
      const result = formatStatusTimestamp(date);
      expect(result).toContain('AM');
    });

    it('should format PM time correctly', () => {
      const date = new Date('2025-08-05T14:30:00Z');
      const result = formatStatusTimestamp(date);
      expect(result).toContain('PM');
    });

    it('should convert 00:00 to 12:00 AM', () => {
      const date = new Date('2025-08-05T00:00:00Z');
      const result = formatStatusTimestamp(date);
      expect(result).toContain('12:');
      expect(result).toContain('AM');
    });

    it('should convert 12:00 to 12:00 PM', () => {
      // Use local date to avoid timezone issues
      const date = new Date(2025, 7, 5, 12, 0, 0);
      const result = formatStatusTimestamp(date);
      expect(result).toContain('12:');
      expect(result).toContain('PM');
    });

    it('should convert 13:00 to 01:00 PM', () => {
      // Use local date to avoid timezone issues
      const date = new Date(2025, 7, 5, 13, 0, 0);
      const result = formatStatusTimestamp(date);
      expect(result).toMatch(/01:/);
      expect(result).toContain('PM');
    });

    it('should pad hours and minutes with zero', () => {
      // Use local date to avoid timezone issues
      const date = new Date(2025, 7, 5, 9, 5, 0);
      const result = formatStatusTimestamp(date);
      expect(result).toMatch(/09:05/);
    });

    it('should handle edge case of 23:59', () => {
      // Use local date to avoid timezone issues
      const date = new Date(2025, 7, 5, 23, 59, 0);
      const result = formatStatusTimestamp(date);
      expect(result).toMatch(/11:59 PM/);
    });

    it('should handle edge case of 01:00', () => {
      // Use local date to avoid timezone issues
      const date = new Date(2025, 7, 5, 1, 0, 0);
      const result = formatStatusTimestamp(date);
      expect(result).toMatch(/01:00 AM/);
    });

    it('should format complete example correctly', () => {
      const date = new Date('2025-08-05T14:30:00Z');
      const result = formatStatusTimestamp(date);
      // Should match format: "05-Aug-2025 02:30 PM" (adjusted for timezone)
      expect(result).toMatch(/^\d{2}-Aug-2025 \d{2}:\d{2} PM$/);
    });
  });
});
