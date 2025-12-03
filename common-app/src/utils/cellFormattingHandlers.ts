// Handles color formatting action for selected cells (textColor, fillColor)
export function handleColorFormattingAction(key: string, payload: { color: string }, selectedCells: any[], dispatch: any, formattingConfig?: Record<string, any>) {
  // Get table configuration and determine which fields are editable
  const tableConfiguration = formattingConfig?.tableConfiguration ?? [];
  const editableFields = (tableConfiguration ?? []).filter((col: any) => col.isEditable).map((col: any) => col.aliasName);
  // Filter only editable cells from the selected cells
  const editableCells = selectedCells.filter((cell: any) => editableFields.includes(cell.field));
  // Update each editable cell with the new color formatting
  const updated = editableCells.map(cell => {
    const keyStr = `${cell.rowId}:${cell.field}`;
    dispatch({ type: UPDATE_CELL_FORMATTING, payload: { key: keyStr, formatting: { [key]: payload.color } }, });
    // Return the updated cell object
    return { ...cell, [key]: payload.color };
  });
  // Dispatch the updated cells to update the UI
  dispatch({ type: UPDATE_SELECTED_CELLS, payload: updated });
  // Return the editable cells for further use
  return { editableCells };
}
import { UPDATE_CELL_FORMATTING, UPDATE_SELECTED_CELLS } from '../store/Actions/gridActions';

/**
 * Parses a number string with commas (e.g., "23,433.00") to a numeric value
 * @param value - Value to parse, can be string, number, or other types
 * @returns Parsed number or NaN if parsing fails
 */
export function parseNumberString(value: unknown): number {
  if (typeof value === 'string') {
    return Number(value.replace(/,/g, ''));
  }
  return Number(value);
}

/**
 * Formats a number with specified decimal places and optional comma separators
 * @param value - Value to format
 * @param decimalPlaces - Number of decimal places
 * @param useComma - Whether to use comma as thousands separator
 * @returns Formatted number string or original value if not a number
 */
export function formatNumber(value: unknown, decimalPlaces: number, useComma = false): string {
  const num = parseNumberString(value);
  if (isNaN(num)) {
    // Convert to string if not a number
    return String(value);
  }
  let formatted = num.toFixed(decimalPlaces);
  if (useComma) {
    formatted = Number(formatted).toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  }
  return formatted;
}

/**
 * Gets current decimal places from a value
 * @param value - Value to examine for decimal places
 * @returns Number of decimal places or 0 if not applicable
 */
function getDecimalPlaces(value: unknown): number {
  const str = String(value);
  const dot = str.indexOf(".");
  return dot === -1 ? 0 : str.length - dot - 1;
}

// Gets cell formatting key
function getCellKey(cell: any) {
  return `${cell.rowId}:${cell.field}`;
}

// Handles generic cell formatting
export function handleCellFormatting(selectedCells: any[], dispatch: any, getFormatting: (cell: any) => Partial<{ decimalPlaces: number; rawValue: number; useComma: boolean }>) {
  const updated = selectedCells.map(cell => {
    const raw = cell.rawValue !== undefined ? cell.rawValue : parseNumberString(cell.value); // Always parse the value to a number
    if (!isNaN(raw)) {
      const formatting = getFormatting({ ...cell, rawValue: raw });
      const key = getCellKey(cell);
      dispatch({ type: UPDATE_CELL_FORMATTING, payload: { key, formatting: { ...formatting, rawValue: raw } }, });
      return { ...cell, value: formatNumber(raw, formatting.decimalPlaces ?? getDecimalPlaces(cell.value), formatting.useComma), rawValue: raw, ...formatting, };
    }
    return cell;
  });
  dispatch({ type: UPDATE_SELECTED_CELLS, payload: updated });
}

// Handles increasing decimal places
export function handleIncreaseDecimal(selectedCells: any[], dispatch: any, formattingConfig?: Record<string, any>) {
  handleCellFormatting(selectedCells, dispatch, cell => {
    const cellKey = getCellKey(cell);
    const persisted = formattingConfig?.[cellKey];
    const current = persisted?.decimalPlaces ?? cell.decimalPlaces ?? getDecimalPlaces(cell.value);
    const next = Math.min(current + 1, 6);
    return { decimalPlaces: next, useComma: persisted?.useComma ?? cell.useComma };
  });
}

// Handles decreasing decimal places
export function handleDecreaseDecimal(selectedCells: any[], dispatch: any, formattingConfig?: Record<string, any>) {
  handleCellFormatting(selectedCells, dispatch, cell => {
    const cellKey = getCellKey(cell);
    const persisted = formattingConfig?.[cellKey];
    const current = persisted?.decimalPlaces ?? cell.decimalPlaces ?? getDecimalPlaces(cell.value);
    const next = Math.max(current - 1, 0);
    return { decimalPlaces: next, useComma: persisted?.useComma ?? cell.useComma };
  });
}

// Handles comma separator formatting
export function handleCommaSeparator(selectedCells: any[], dispatch: any) {
  handleCellFormatting(selectedCells, dispatch, () => ({ decimalPlaces: 2, useComma: true, }));
}

// Formats a value as currency (supports Indian and Intl formats)
export function formatCurrencyValue(value: number, currency: string, locale: string, indianFormat = false) {
  // If Indian format is requested, format using lakhs/crores grouping
  if (indianFormat) {
    // Split value into integer and fraction parts
    let [integer, fraction = "00"] = value.toFixed(2).split(".");
    // Get last three digits for standard grouping
    let lastThree = integer.slice(-3);
    // Get all digits except last three for lakh/crore grouping
    let otherNumbers = integer.slice(0, -3);
    // If there are digits before last three, prepend a comma
    if (otherNumbers !== "") lastThree = "," + lastThree;
    // Build formatted string for lakh/crore grouping
    let formatted = "";
    let len = otherNumbers.length;
    // Insert a comma after every two digits from the right (except at the end)
    for (let i = 0; i < len; i++) {
      formatted += otherNumbers[i];
      if (((len - i) % 2 === 0) && i !== len - 1) { formatted += ","; }
    }
    // Append the last three digits
    formatted += lastThree;
    // Return the formatted value with rupee symbol and fraction
    return `₹${formatted}.${fraction}`;
  }
  // For other currencies, use Intl.NumberFormat
  return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value);
}

// Handles currency formatting action for selected cells
export function handleCurrencyFormattingAction(key: string, selectedCells: any[], dispatch: any, formattingConfig?: Record<string, any>) {
  // Get table configuration and determine which fields are editable
  const tableConfiguration = formattingConfig?.tableConfiguration ?? [];
  const editableFields = (tableConfiguration ?? []).filter((col: any) => col.isEditable).map((col: any) => col.aliasName);
  // Filter only editable cells from the selected cells
  const editableCells = selectedCells.filter((cell: any) => editableFields.includes(cell.field));
  // Map of supported currency keys to their formatting options
  const currencyMap: Record<string, { currency: string; locale: string; indianFormat?: boolean }> = {
    "currency-INR": { currency: "INR", locale: "en-IN", indianFormat: true },
    "currency-USD": { currency: "USD", locale: "en-US" },
    "currency-EUR": { currency: "EUR", locale: "en-IE" },
    "currency-GBP": { currency: "GBP", locale: "en-GB" },
    "currency-JPY": { currency: "JPY", locale: "ja-JP" },
  };
  // Default formatter just returns the value as string
  let formatter: (v: number) => string = (v) => v.toString();
  let sysCurrency = "USD";
  // If the key is a supported currency, set up the formatter accordingly
  if (currencyMap[key]) {
    const { currency, locale, indianFormat } = currencyMap[key];
    formatter = (v) => formatCurrencyValue(v, currency, locale, indianFormat);
  } else if (key === "currency-IN-LOCALE" || key === "currency-DEFAULT" || key === "currency-LOCALE") {
    // For system locale, try to determine the system currency
    const sysLocale = typeof navigator !== 'undefined' ? navigator.language : "en-US";
    try { sysCurrency = (0).toLocaleString(sysLocale, { style: 'currency', currency: 'USD' }).replace(/[^A-Z]*/g, '').replace(/\d/g, '') || "USD"; } catch { }
    formatter = (v) => formatCurrencyValue(v, sysCurrency, sysLocale);
  }
  // Update each editable cell with the new currency formatting
  const updated = editableCells.map(cell => {
    // Use rawValue if present, otherwise parse the value
    const raw = cell.rawValue !== undefined ? cell.rawValue : parseNumberString(cell.value);
    if (!isNaN(raw)) {
      const keyStr = getCellKey(cell);
      // Dispatch the formatting update for this cell
      dispatch({ type: UPDATE_CELL_FORMATTING, payload: { key: keyStr, formatting: { currency: key, rawValue: raw } }, });
      // Return the updated cell object
      return { ...cell, value: formatter(raw), rawValue: raw, currency: key, };
    }
    return cell;
  });
  // Dispatch the updated cells to update the UI
  dispatch({ type: UPDATE_SELECTED_CELLS, payload: updated });
  // Return the formatter and editable cells for further use
  return { formatter, editableCells };
}

// Handles date formatting action for selected cells
export function handleDateFormattingAction(key: string, selectedCells: any[], dispatch: any, formattingConfig?: Record<string, any>) {
  const tableConfiguration = formattingConfig?.tableConfiguration ?? [];
  const editableFields = (tableConfiguration ?? []).filter((col: any) => col.isEditable).map((col: any) => col.aliasName);
  const editableCells = selectedCells.filter((cell: any) => editableFields.includes(cell.field));
  const formatter = (v: any) => v;
  const updated = editableCells.map(cell => {
    const keyStr = getCellKey(cell);
    dispatch({ type: UPDATE_CELL_FORMATTING, payload: { key: keyStr, formatting: { dateFormat: key } }, });
    return { ...cell, value: formatter(cell.value), dateFormat: key, };
  });
  dispatch({ type: UPDATE_SELECTED_CELLS, payload: updated });
  return { formatter, editableCells };
}

// Unified handler for cell formatting actions
export function handleCellFormattingAction(action: string, selectedCells: any[], dispatch: any, formattingConfig?: Record<string, any>) {
  switch (action) {
    case "increaseDecimal": handleIncreaseDecimal(selectedCells, dispatch, formattingConfig); break;
    case "decreaseDecimal": handleDecreaseDecimal(selectedCells, dispatch, formattingConfig); break;
    case "comma": handleCommaSeparator(selectedCells, dispatch); break;
    case "currency-INR":
    case "currency-USD":
    case "currency-EUR":
    case "currency-GBP":
    case "currency-JPY":
    case "currency-IN-LOCALE":
    case "currency-DEFAULT":
    case "currency-LOCALE": break; // No-op here; handled in CurrencyFormatSelector
    default: break;
  }
}
