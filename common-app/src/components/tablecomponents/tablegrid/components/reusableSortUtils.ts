import { SortModel, SortType } from '../types';
/**
 * Returns a new SortModel[] with the given field sorted ascending.
 */
export function getSortAscModel(sortModel: SortModel[], field: string, type: SortType): SortModel[] {
    const filtered = sortModel.filter((s: SortModel) => s.field !== field);
    return [...filtered, { field, sort: 'asc', type, priority: filtered.length + 1 }];
}

/**
 * Returns a new SortModel[] with the given field sorted descending.
 */
export function getSortDescModel(sortModel: SortModel[], field: string, type: SortType): SortModel[] {
    const filtered = sortModel.filter((s: SortModel) => s.field !== field);
    return [...filtered, { field, sort: 'desc', type, priority: filtered.length + 1 }];
}

/**
 * Returns a new SortModel[] with the given field removed from sorting.
 */
export function getClearSortModel(sortModel: SortModel[], field: string): SortModel[] {
    return sortModel.filter((s: SortModel) => s.field !== field);
}
/**
 * Preprocess rows to add __bgColor_{field} and __fontColor_{field} for color/font color sorting.
 * @param {Array} rows - The data rows.
 * @param {Object} formattingConfig - Formatting config with fillColor/textColor per cell.
 * @returns {Array} Preprocessed rows.
 */
export function preprocessRows(
    rows: Array<Record<string, any>>,
    formattingConfig: Record<string, any>
): Array<Record<string, any>> {
    const safeRows = Array.isArray(rows) ? rows : [];
    return safeRows.map((row: Record<string, any>) => {
        const newRow = { ...row };
        if (formattingConfig) {
            Object.keys(row).forEach((field: string) => {
                const cellKey = `${row.id}:${field}`;
                const formatting = formattingConfig[cellKey] || {};
                if (formatting.fillColor) newRow[`__bgColor_${field}`] = formatting.fillColor;
                if (formatting.textColor) newRow[`__fontColor_${field}`] = formatting.textColor;
            });
        }
        return newRow;
    });
}

/**
 * Get a comparator function for the given sort type.
 * @param {string} type - Sort type (alphanumeric, numeric, date, fillColor, fontColor).
 * @param {string} direction - 'asc' or 'desc'.
 * @param {string} field - Field name.
 * @returns {Function} Comparator function.
 */
export function getComparator(
    type: string,
    direction: 'asc' | 'desc',
    field: string
): (a: Record<string, any>, b: Record<string, any>) => number {
    switch (type) {
        case 'numeric':
            return (a, b) => direction === 'asc' ? Number(a[field]) - Number(b[field]) : Number(b[field]) - Number(a[field]);
        case 'date':
            return (a, b) => direction === 'asc'
                ? new Date(a[field]).getTime() - new Date(b[field]).getTime()
                : new Date(b[field]).getTime() - new Date(a[field]).getTime();
        case 'fillColor':
            return (a: Record<string, any>, b: Record<string, any>) => {
                const colorA = a[`__bgColor_${field}`] || '';
                const colorB = b[`__bgColor_${field}`] || '';
                return direction === 'asc'
                    ? colorA.localeCompare(colorB)
                    : colorB.localeCompare(colorA);
            };
        case 'fontColor':
            return (a: Record<string, any>, b: Record<string, any>) => {
                const colorA = a[`__fontColor_${field}`] || '';
                const colorB = b[`__fontColor_${field}`] || '';
                return direction === 'asc'
                    ? colorA.localeCompare(colorB)
                    : colorB.localeCompare(colorA);
            };
        case 'alphanumeric':
        default:
            return (a: Record<string, any> | undefined, b: Record<string, any> | undefined) => {
                // Extract field value from each row
                const aVal = a ? a[field] : undefined;
                const bVal = b ? b[field] : undefined;
                // Handle undefined/null cases
                if (aVal == null && bVal == null) return 0;
                if (aVal == null) return direction === 'asc' ? 1 : -1;
                if (bVal == null) return direction === 'asc' ? -1 : 1;
                // If either is object, try to extract value/label
                const getComparable = (val: any) => {
                    if (typeof val === 'object' && val !== null) {
                        if ('value' in val) return String(val.value);
                        if ('label' in val) return String(val.label);
                        return '';
                    }
                    return String(val);
                };
                const aComp = getComparable(aVal);
                const bComp = getComparable(bVal);
                return direction === 'asc'
                    ? aComp.localeCompare(bComp)
                    : bComp.localeCompare(aComp);
            };
    }
}

/**
 * Apply multi-column sort to rows.
 * @param {Array} rows - The data rows.
 * @param {Array} sortLevels - Array of { sortBy, sortOn, order } objects.
 * @returns {Array} Sorted rows.
 */
export interface SortLevel {
    sortBy: string;
    sortOn: string;
    order: 'asc' | 'desc';
}

// This function applies multi-column sorting based on the provided sort levels.
export function applyMultiColumnSort(
    rows: Array<Record<string, any>>,
    sortLevels: SortLevel[]
): Array<Record<string, any>> {
    if (!sortLevels.length) return rows;
    return [...rows].sort((rowA, rowB) => {
        for (const { sortBy, sortOn, order } of sortLevels) {
            const comparator = getComparator(sortOn, order, sortBy);
            const result = comparator(rowA, rowB);
            if (result !== 0) return result;
        }
        return 0;
    });
}
