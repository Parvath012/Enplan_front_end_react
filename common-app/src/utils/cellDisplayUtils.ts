import { formatNumber, formatCurrencyValue } from './cellFormattingHandlers';

// Returns formatted currency display value based on formatting config
function getCurrencyDisplayValue(params: any, formatting: any) {
    switch (formatting.currency) {
        // Handle INR with Indian number formatting
        case 'currency-INR': return formatCurrencyValue(formatting.rawValue, 'INR', 'en-IN', true);
        // Handle USD, EUR, GBP, JPY with respective locales
        case 'currency-USD': return formatCurrencyValue(formatting.rawValue, 'USD', 'en-US');
        case 'currency-EUR': return formatCurrencyValue(formatting.rawValue, 'EUR', 'en-IE');
        case 'currency-GBP': return formatCurrencyValue(formatting.rawValue, 'GBP', 'en-GB');
        case 'currency-JPY': return formatCurrencyValue(formatting.rawValue, 'JPY', 'ja-JP');
        // Handle system locale or default currency
        case 'currency-IN-LOCALE':
        case 'currency-DEFAULT':
        case 'currency-LOCALE': {
            // Get system locale if available, fallback to en-US
            const sysLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
            let sysCurrency = 'USD';
            // Try to extract system currency code from locale
            try {
                sysCurrency = (0).toLocaleString(sysLocale, { style: 'currency', currency: 'USD' })
                    .replace(/[^A-Z]*/gi, '')
                    .replace(/\d/g, '') || 'USD';
            } catch { }
            // Format using system currency and locale
            return formatCurrencyValue(formatting.rawValue, sysCurrency, sysLocale);
        }
        // Default: return original value if no formatting matches
        default: return params.value;
    }
}

// Returns formatted date display value based on formatting config
function getDateDisplayValue(params: any, formatting: any) {
    // Parse the value as a date
    const date = new Date(params.value);
    // If not a valid date, return original value
    if (!(date instanceof Date) || isNaN(date as any)) return params.value;
    switch (formatting.dateFormat) {
        // Format as DD-MM-YYYY
        case 'formatDate-DD-MM-YYYY': return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        // Format as MM-DD-YYYY
        case 'formatDate-MM-DD-YYYY': return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${date.getFullYear()}`;
        // Format as YYYY-MM-DD
        case 'formatDate-YYYY-MM-DD': return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        // Format as DD-MMM-YYYY (e.g., 04-Jul-2025)
        case 'formatDate-DD-MMM-YYYY': return `${date.getDate().toString().padStart(2, '0')}-${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;
        // Format as MMM-DD-YYYY (e.g., Jul 04, 2025)
        case 'formatDate-MMM-DD-YYYY': return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate().toString().padStart(2, '0')}, ${date.getFullYear()}`;
        // Default: return original value if no formatting matches
        default: return params.value;
    }
}

// Returns formatted decimal/number display value based on formatting config
function getDecimalDisplayValue(formatting: any) {
    // Use formatNumber utility to format the value with decimal places and comma if needed
    return formatNumber(formatting.rawValue, formatting.decimalPlaces, formatting.useComma);
}

// Returns the display value for a cell based on formatting config
export function getDisplayValue(params: any, formatting: any) {
    // If currency formatting is specified and value is valid, format as currency
    if (formatting?.currency && formatting?.rawValue !== undefined && !isNaN(Number(formatting.rawValue))) return getCurrencyDisplayValue(params, formatting); // Currency formatting
    // If date formatting is specified and value is present, format as date
    if (formatting?.dateFormat && params?.value) return getDateDisplayValue(params, formatting); // Date formatting
    // If decimal formatting is specified and value is valid, format as decimal/number
    if (formatting?.decimalPlaces !== undefined && formatting?.rawValue !== undefined && !isNaN(Number(formatting.rawValue))) return getDecimalDisplayValue(formatting); // Decimal/number formatting
    // Default: return original value if no formatting matches
    return params?.value;
}
