/**
 * Utility functions for string manipulation and sanitization
 */

/**
 * Removes quotes from the beginning and end of a string
 * Handles both single and double quotes
 * Preserves quotes that are part of the content (not wrapping the entire string)
 * 
 * @param str - The string to sanitize
 * @returns The sanitized string with outer quotes removed
 * 
 * @example
 * sanitizeQuotes('"Planning Module"') // Returns: 'Planning Module'
 * sanitizeQuotes("'Handles forecasting'") // Returns: 'Handles forecasting'
 * sanitizeQuotes('"Module with "quotes" inside"') // Returns: 'Module with "quotes" inside'
 * sanitizeQuotes('Normal text') // Returns: 'Normal text'
 * sanitizeQuotes('') // Returns: ''
 * sanitizeQuotes('"') // Returns: ''
 */
export function sanitizeQuotes(str: string): string {
  if (!str || typeof str !== 'string') {
    return str || '';
  }

  let sanitized = str.trim();
  
  // Handle double quotes wrapping the entire string
  if (sanitized.startsWith('"') && sanitized.endsWith('"') && sanitized.length > 1) {
    sanitized = sanitized.slice(1, -1);
  }
  
  // Handle single quotes wrapping the entire string
  if (sanitized.startsWith("'") && sanitized.endsWith("'") && sanitized.length > 1) {
    sanitized = sanitized.slice(1, -1);
  }
  
  return sanitized;
}

/**
 * Sanitizes module name by removing outer quotes
 * 
 * @param moduleName - The module name to sanitize
 * @returns The sanitized module name
 */
export function sanitizeModuleName(moduleName: string): string {
  return sanitizeQuotes(moduleName);
}

/**
 * Sanitizes module description by removing outer quotes
 * 
 * @param moduleDescription - The module description to sanitize
 * @returns The sanitized module description
 */
export function sanitizeModuleDescription(moduleDescription: string): string {
  return sanitizeQuotes(moduleDescription);
}

/**
 * Sanitizes any text field that might contain outer quotes
 * 
 * @param text - The text to sanitize
 * @returns The sanitized text
 */
export function sanitizeTextField(text: string): string {
  return sanitizeQuotes(text);
}
