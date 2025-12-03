import { parseNumberString } from "../utils/cellFormattingHandlers";

// Enum for supporting data types in bulk editing
export enum BulkEditDataType {
    Text = 'text',
    Number = 'number',
    Currency = 'currency',
    Date = 'date',
    Select = 'select'
}

// Interface for validation result
export interface ValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

// Interface for bulk edit configuration
export interface BulkEditConfig {
    dataType: BulkEditDataType;
    options?: string[];         // For select type
    currencyFormat?: string;    // For currency formatting
    dateFormat?: string;        // For date formatting
    min?: number;               // For numeric validation
    max?: number;               // For numeric validation
    required?: boolean;         // Required field validation
}

/**
 * Service for bulk editing operations.
 * Handles data type detection and validation for bulk editing.
 */
export class BulkEditService {
    /**
     * Detects data type for a collection of cells.
     * Only supports cells from the same column/field.
     * @param cells - Selected cells to analyze
     * @returns Configuration with detected data type
     */
/**
 * Detects the appropriate data type for a collection of cells
 * @param cells - Array of cell objects with field, value, and optional rawValue properties
 * @returns BulkEditConfig with detected data type and options
 */
static detectDataType(cells: Array<{field: string, value?: unknown, rawValue?: number, currency?: string}>): BulkEditConfig {
  if (!cells || cells.length === 0) {
    return { dataType: BulkEditDataType.Text };
  }

  // Get the field (column) name from the first selected cell
  const field = cells[0].field;

  // Special handling for known columns
  if (field === 'Status') {
    return {
      dataType: BulkEditDataType.Select,
      options: ['Open', 'In Progress', 'Closed'] // Same options as in gridUtils.tsx
    };
  }

  // Detect date columns
  if (field === 'BillDate' || field.includes('Date')) {
    return {
      dataType: BulkEditDataType.Date,
      dateFormat: 'YYYY-MM-DD'
    };
  }

  // Check if all cells have the same field (column)
  const firstField = cells[0].field;
  const allSameColumn = cells.every(cell => cell.field === firstField);

  // Only enable bulk editing for cells from the same column
  if (!allSameColumn) {
    return { dataType: BulkEditDataType.Text, options: [] };
  }

  // Check for currency formatting
  if (cells.some(cell => cell.currency)) {
    const format = cells[0].currency ?? '';
    return {
      dataType: BulkEditDataType.Currency,
      currencyFormat: format
    };
  }

  // Check if values are numeric
  const numericValues = cells.filter(cell => {
    // Use nullish coalescing operator instead of ternary
    const rawValue = cell.rawValue ?? parseNumberString(cell.value);
    return !isNaN(rawValue);
  });

  if (numericValues.length === cells.length) {
    return { dataType: BulkEditDataType.Number };
  }

  // Default to text
  return { dataType: BulkEditDataType.Text };
}

    /**
     * Validates a value based on data type
     * @param value - Value to validate
     * @param config - Validation configuration
     * @returns Validation result with isValid flag and optional error message
     */
    /**
     * Helper method to validate numeric values
     * @param value - Value to validate
     * @param config - Validation config
     * @returns Validation result
     */
    private static validateNumeric(value: unknown, config: BulkEditConfig): ValidationResult {
        const numValue = parseNumberString(value);

        if (isNaN(numValue)) {
            return { isValid: false, errorMessage: 'Please enter a valid number' };
        }

        if (config.min !== undefined && numValue < config.min) {
            return { isValid: false, errorMessage: `Value must be at least ${config.min}`};
        }

        if (config.max !== undefined && numValue > config.max) {
            return { isValid: false, errorMessage: `Value must be at most ${config.max}`};
        }

        return { isValid: true };
    }

    /**
     * Helper method to validate dates
     * @param value - Value to validate as date
     * @returns Validation result
     */
    private static validateDate(value: unknown): ValidationResult {
        // Cast to string first for Date constructor
        const dateValue = new Date(String(value));
        if (isNaN(dateValue.getTime())) {
            return { isValid: false, errorMessage: 'Please enter a valid date' };
        }
        return { isValid: true };
    }
    
    /**
     * Helper method to validate select options
     * @param value - Value to validate
     * @param options - Available options
     * @returns Validation result
     */
    private static validateSelect(value: unknown, options?: string[]): ValidationResult {
        if (options && !options.includes(String(value))) {
            return { isValid: false, errorMessage: 'Please select a valid option' };
        }
        return { isValid: true };
    }

    static validateValue(value: unknown, config: BulkEditConfig): ValidationResult {
        // Check required fields
        if (config.required && (value === null || value === undefined || value === '')) {
            return { isValid: false, errorMessage: 'This field is required' };
        }

        switch (config.dataType) {
            case BulkEditDataType.Number:
            case BulkEditDataType.Currency:
                return BulkEditService.validateNumeric(value, config);

            case BulkEditDataType.Date:
                return BulkEditService.validateDate(value);

            case BulkEditDataType.Select:
                return BulkEditService.validateSelect(value, config.options);

            case BulkEditDataType.Text:
            default:
                // Text is generally valid
                return { isValid: true };
        }
        }   

    /**
     * Formats a value according to its data type
     * @param value - Value to format
     * @param config - Data type configuration
     * @returns Formatted value appropriate for the data type
     */
    static formatValue(value: unknown, config: BulkEditConfig): unknown {
        switch (config.dataType) {
            case BulkEditDataType.Number:
            case BulkEditDataType.Currency:
                return parseNumberString(value);

            case BulkEditDataType.Date: {
                try {
                    // Parse the input date in any format - cast to string for type safety
                    const dateObj = new Date(String(value));
                    
                    if (!isNaN(dateObj.getTime())) {
                        // Format to match the existing pattern in the grid: M/D/YYYY 12:00:00 AM
                        const month = dateObj.getMonth() + 1;
                        const day = dateObj.getDate();
                        const year = dateObj.getFullYear();
                        return `${month}/${day}/${year} 12:00:00 AM`;
                    }
                    
                    // If date is invalid, return original value
                    return value;
                } catch (e: unknown) {
                    // Log the error in development environments
                    if (process.env.NODE_ENV !== 'production') {
                        console.warn('Error formatting date:', e);
                    }
                    
                    // In case of error parsing the date, return original value
                    return value;
                }
            }

            case BulkEditDataType.Text:
            case BulkEditDataType.Select:
            default:
                return value;
        }
    }
}