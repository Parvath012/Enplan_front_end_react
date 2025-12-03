import { GridFields } from "../../constants/gridFields";
import { SelectedCell } from "../Reducers/gridReducer";
import { GridCellParams, GridRowId, GridColDef } from "@mui/x-data-grid";
import { parseNumberString } from '../../utils/cellFormattingHandlers';
import { Dispatch, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { RootState } from "../Reducers/rootReducer";
import { SortModel } from '../../components/tablecomponents/tablegrid/types';

/**
 * Type for Redux thunk actions
 */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Action type constants for grid cell and row selection management
export const SET_SELECTED_CELLS = "SET_SELECTED_CELLS";
export const ADD_SELECTED_CELL = "ADD_SELECTED_CELL";
export const REMOVE_SELECTED_CELL = "REMOVE_SELECTED_CELL";
export const CLEAR_SELECTED_CELLS = "CLEAR_SELECTED_CELLS";
export const STORE_NUMERIC_CELL_VALUES = "STORE_NUMERIC_CELL_VALUES";
export const ADD_SELECTED_ROW = "ADD_SELECTED_ROW";
export const REMOVE_SELECTED_ROW = "REMOVE_SELECTED_ROW";
export const CLEAR_SELECTED_ROWS = "CLEAR_SELECTED_ROWS";
export const GET_SELECTED_CELLS = "GET_SELECTED_CELLS";
export const SET_COLUMN_WIDTH = "SET_COLUMN_WIDTH";
export const RESET_FOOTER_VALUES = "RESET_FOOTER_VALUES";
export const UPDATE_SELECTED_CELLS = "UPDATE_SELECTED_CELLS";
export const UPDATE_CELL_FORMATTING = "UPDATE_CELL_FORMATTING";
export const BULK_EDIT_START = "BULK_EDIT_START";
export const BULK_EDIT_CANCEL = "BULK_EDIT_CANCEL";
export const BULK_UPDATE_CELLS = "BULK_UPDATE_CELLS";
export const SET_COLUMNS = "SET_COLUMNS";
export const SET_SORT_MODEL = "SET_SORT_MODEL";

/**
 * Action to set the sort model for the grid
 * @param sortModel - Array of SortModel objects defining the sorting state
 */
export const setSortModel = (sortModel: SortModel[]) => ({
  type: SET_SORT_MODEL,
  payload: sortModel,
});

/**
 * Action to set grid columns with serializable properties only
 * @param columns - Array of GridColDef column definitions
 */
export const setColumns = (columns: GridColDef[]) => {
  const serializableColumns = columns.map(column => {
    const { 
      renderCell, 
      renderEditCell, 
      renderHeader,
      valueFormatter,
      valueGetter,
      valueSetter,
      cellClassName,
      ...serializable 
    } = column;
    
    // Only keep serializable properties
    return {
      ...serializable
    };
  });
  
  return {
    type: SET_COLUMNS,
    payload: serializableColumns
  };
};

// Action creator to add a selected cell to the grid
// Handles numeric value validation and filtering
export const addSelectedCell = (cell: SelectedCell) => ({
  type: ADD_SELECTED_CELL,
  payload: {
    // Preserve cell identification details
    rowId: cell.rowId,
    field: cell.field,
    // Store only numeric values, convert non-numeric to null
    value: cell.value,
  },
});

// Action creator to remove a specific selected cell
export const removeSelectedCell = (cell: SelectedCell) => ({
  type: REMOVE_SELECTED_CELL,
  payload: cell,
});

// Action creator to clear all selected cells
export const clearSelectedCells = () => ({
  type: CLEAR_SELECTED_CELLS,
});

// Action creator to store numeric cell values for statistical calculations
export const storeNumericCellValues = (values: number[]) => ({
  type: STORE_NUMERIC_CELL_VALUES,
  payload: values,
});

// Action creator to add a selected row to the grid
export const addSelectedRow = (row: any) => ({
  type: ADD_SELECTED_ROW,
  payload: row,
});

// Action creator to remove a specific selected row by its ID
export const removeSelectedRow = (rowId: GridRowId) => ({
  type: REMOVE_SELECTED_ROW,
  payload: rowId,
});

// Action creator to clear all selected rows
export const clearSelectedRows = () => ({
  type: "CLEAR_SELECTED_ROWS",
});

//  Action creator to store a column's width for a specific table
export const setColumnWidth = (field: string, width: number) => ({
  type: SET_COLUMN_WIDTH,
  payload: { field, width },
});

// Action creator to update selected cells (for formatting actions)
export const updateSelectedCells = (cells: SelectedCell[]) => ({
  type: UPDATE_SELECTED_CELLS,
  payload: cells,
});

/**
 * Action to handle the cell click with proper selection behavior
 * @param params - GridCellParams with cell data
 * @param event - Mouse event to check for ctrl/meta key
 * @param selectedCells - Currently selected cells
 */
export const handleCellClickAction = (
  params: GridCellParams,
  event: MouseEvent,
  selectedCells: SelectedCell[]
): AppThunk => {
  return (dispatch: Dispatch) => {
    if (params.field === GridFields.Checkbox) return;

    const cell = { rowId: params.id, field: params.field, value: params.value };

    if (event.ctrlKey || event.metaKey) {
      const alreadySelected = selectedCells.some(
        (c: { rowId: GridRowId; field: string }) =>
          c.rowId === cell.rowId && c.field === cell.field
      );

      if (alreadySelected) {
        dispatch(removeSelectedCell(cell));
      } else {
        dispatch(addSelectedCell(cell));
      }
    } else {
      dispatch(clearSelectedCells());
      dispatch(addSelectedCell(cell));
    }
  };
};

/**
 * Action to handle row selection changes
 * @param rowSelectionModel - Selected row IDs model
 * @param rows - Available rows data
 */
export const handleRowSelectionAction = (
  rowSelectionModel: { ids?: GridRowId[] },
  rows: Array<{ id: GridRowId } & Record<string, unknown>>
): AppThunk => {
  return (dispatch: Dispatch) => {
    dispatch(clearSelectedRows());

    const selectedIds = Array.from(rowSelectionModel?.ids || []);

    if (!Array.isArray(selectedIds)) return;

    const selectedRowObjects = rows.filter((row) =>
      selectedIds.includes(row.id)
    );
    selectedRowObjects.forEach((row) => dispatch(addSelectedRow(row)));
  };
};

/**
 * Calculates the width of text using a temporary DOM element
 * This function is safe for server-side rendering and handles error cases
 * @param text - Text to measure
 * @param font - Font specification
 * @returns Width of the text in pixels
 */
export const getTextWidth = (text: string, font: string): number => {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    // Fallback for SSR - approximate width based on character count
    return text ? text.length * 8 : 0;
  }

  try {
    const span = document.createElement("span");
    span.innerText = text || '';
    span.style.font = font;
    span.style.visibility = "hidden";
    span.style.whiteSpace = "nowrap";
    span.style.position = "absolute";
    
    const container = document.body;
    container.appendChild(span);
    const width = span.offsetWidth;
    container.removeChild(span);
    
    return width;
  } catch (error: unknown) {
    // Log the error in development environments only
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Error measuring text width:', error);
    }
    
    // Fallback width if measurement fails
    return text ? text.length * 8 : 0;
  }
};

// handle to manage the width of the column when double click on column header edge

/**
 * Auto-resizes the given column based on visible content width
 * @param field - Column field to resize
 */
export const autoResizeColumn = (field: string): AppThunk => {
  return (dispatch: Dispatch) => {
    const font = "10px Roboto, Arial, sans-serif";
    const padding = 20;
    const minWidth = 60;

    const headerCell = document.querySelector<HTMLElement>(
      `.MuiDataGrid-columnHeader[data-field="${field}"]`
    );
    const headerText = headerCell?.textContent?.trim() ?? field;

    let maxContentWidth = getTextWidth(headerText, font);

    const visibleCells = document.querySelectorAll<HTMLElement>(
      `.MuiDataGrid-cell[data-field="${field}"]`
    );
    visibleCells.forEach((cell) => {
      const text = cell.textContent?.trim() ?? "";
      const width = getTextWidth(text, font);
      maxContentWidth = Math.max(maxContentWidth, width);
    });

    const finalWidth = Math.max(minWidth, maxContentWidth + padding);
    dispatch(setColumnWidth(field, finalWidth));
  };
};

// Action to reset footer values, typically used when clearing selections or resetting the grid
export const resetFooterValues = () => ({
  type: RESET_FOOTER_VALUES,
});

/**
 * Action creator to update cell formatting (persist until refresh)
 * @param key - Unique key for the cell
 * @param formatting - Formatting options to apply
 */
export const updateCellFormatting = (
  key: string,
  formatting: Record<string, unknown>
) => ({
  type: UPDATE_CELL_FORMATTING,
  payload: { key, formatting },
});
export const getDynamicRowHeight = (
  row: Record<string, unknown>,
  wrapConfig?: Record<string, boolean>,
  columnWidths?: Record<string, number>
): number | "auto" => {
  const defaultHeight = 24;
  const fallbackWidth = 120; // Fallback if column width is unknown
  const font = "10px Roboto, Arial, sans-serif";

  if (!wrapConfig) return defaultHeight;

  for (const [key, enabled] of Object.entries(wrapConfig)) {
    if (!enabled) continue;

    const [rowId, field] = key.split("|");
    if (rowId !== String(row?.id)) continue;

    const value = row[field];
    if (typeof value === "string" || typeof value === "number") {
      const textWidth = getTextWidth(value.toString(), font);

      // Use columnWidths from Redux if available
      const estimatedCellWidth = columnWidths?.[field] ?? fallbackWidth;

      if (textWidth > estimatedCellWidth) {
        return "auto";
      }
    }
  }

  return defaultHeight;
};

// Action creator to start bulk edit mode
export const startBulkEdit = () => ({
  type: BULK_EDIT_START
});

// Action creator to cancel bulk edit mode
export const cancelBulkEdit = () => ({
  type: BULK_EDIT_CANCEL
});

/**
 * Action creator for bulk updating cell values
 * @param cells - Selected cells to update
 * @param value - New value to apply to all cells
 * @param formatting - Optional formatting to apply
 */
export const bulkUpdateCells = (
  cells: SelectedCell[],
  value: unknown,
  formatting?: Record<string, unknown>
): {
  type: string;
  payload: {
    cells: SelectedCell[];
    value: unknown;
    formatting?: Record<string, unknown>;
  };
} => {
  return {
  type: BULK_UPDATE_CELLS,
  payload: {
    cells,
    value,
    formatting
  }
  };
};

/**
 * Thunk action to apply bulk edits with validation and formatting
 * @param cells - Selected cells to update
 * @param value - New value to apply
 * @param config - Configuration for the bulk edit operation
 */
export const applyBulkEdit = (
  cells: SelectedCell[],
  value: unknown,
  config: {
    dataType: string;
    formatting?: Record<string, unknown>;
    formatValue?: (val: unknown) => unknown;
  }
): AppThunk => {
  return (dispatch: Dispatch) => {
    // Format the value based on data type
    const formattedValue = config.formatValue ? config.formatValue(value) : value;

    // Apply bulk update to cells
    dispatch(bulkUpdateCells(cells, formattedValue, config.formatting));

    // Apply cell-specific formatting if needed
    if (config.formatting) {
      cells.forEach(cell => {
        const key = `${cell.rowId}:${cell.field}`;

        // Add rawValue for numeric types
        const formatting = {
          ...config.formatting,
          rawValue: (config.dataType === 'number' || config.dataType === 'currency')
            ? parseNumberString(formattedValue)
            : formattedValue
        };

        dispatch({
          type: UPDATE_CELL_FORMATTING,
          payload: { key, formatting }
        });
      });
    }

    // Exit bulk edit mode
    dispatch(cancelBulkEdit());
  };
};