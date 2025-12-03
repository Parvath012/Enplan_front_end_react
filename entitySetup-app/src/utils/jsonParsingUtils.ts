/**
 * Utility functions for parsing JSON data from CSV strings
 * These functions handle double-escaped JSON strings that come from CSV data
 */

/**
 * Strips quotes from a string value, handling various quote types
 * @param value - The value to strip quotes from
 * @returns The value with quotes stripped, or empty string if value is null/undefined
 */
export const stripQuotes = (value: string | undefined | null | object): string => {
  if (value == null) return '';
  
  // If it's already an object, return empty string (no need to strip quotes)
  if (typeof value === 'object') return '';
  
  // If it's a string, strip quotes
  let v = value.trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
    v = v.substring(1, v.length - 1);
  }
  return v;
};

/**
 * Attempts to parse a string as JSON, handling escaped quotes
 * @param v - The string to parse
 * @returns The parsed object, or the original string if parsing fails
 */
export const parseMaybeJson = (v?: string): any => {
  if (!v) return undefined;
  const s = v.trim();
  if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
    try { 
      // Handle escaped quotes by replacing them with regular quotes
      const unescaped = s.replace(/\\"/g, '"');
      return JSON.parse(unescaped); 
    } catch { return s; }
  }
  return s;
};
