import { GridRowId } from "@mui/x-data-grid";
import {
  SET_SORT_MODEL,
  ADD_SELECTED_CELL,
  CLEAR_SELECTED_CELLS,
  REMOVE_SELECTED_CELL,
  GET_SELECTED_CELLS,
  STORE_NUMERIC_CELL_VALUES,
  ADD_SELECTED_ROW,
  REMOVE_SELECTED_ROW,
  CLEAR_SELECTED_ROWS,
  SET_COLUMN_WIDTH,
  RESET_FOOTER_VALUES,
  UPDATE_SELECTED_CELLS,
  BULK_EDIT_START,
  BULK_EDIT_CANCEL,
  BULK_UPDATE_CELLS
} from "../Actions/gridActions";
import { SortModel } from '../../components/tablecomponents/tablegrid/types';

// Type definition for a selected cell
// Represents a unique cell in the grid with its identification and value
export type SelectedCell = {
  rowId: string | number; // Unique identifier for the row
  field: string; // Column/field name
  value?: any; // Cell value
};

// Interface defining the structure of grid selection state
// Manages selected cells, numeric values, and selected rows
export interface GridSelectionState {
  sortModel?: SortModel[]; // Optional: add sortModel to grid state if needed
  selectedCells: SelectedCell[]; // Currently selected cells
  numericCellValues: number[]; // Numeric values of selected cells
  selectedRows: GridRowId[]; // Currently selected rows
  columnWidths: { [field: string]: number };
  isBulkEditMode: boolean;
}

// Initial state for grid selection
// Provides a clean slate for grid interactions
const initialState: GridSelectionState = {
  sortModel: [],
  selectedCells: [],
  numericCellValues: [],
  selectedRows: [],
  columnWidths: {},
  isBulkEditMode: false
};

// Helper function to extract and filter numeric values from selected cells
// Converts cell values to numbers, filters out non-numeric and zero values
const extractNumericValues = (cells: SelectedCell[]) =>
  cells
    .map((cell) => {
      // Attempt to parse cell value as a number
      const parsed = Number(cell.value);
      // Return number if valid and non-zero, otherwise null
      return !isNaN(parsed) && parsed !== 0 ? parsed : null;
    })
    .filter((val): val is number => val !== null);

// Grid selection reducer
// Typed selector for sortModel
export const selectSortModel = (state: { grid: GridSelectionState }): SortModel[] => state.grid.sortModel ?? [];
// Manages state changes for cell and row selections
const selectedCellsReducer = (
  state = initialState,
  action: any
): GridSelectionState => {
  switch (action.type) {
    // Handle setting the sort model
    case SET_SORT_MODEL:
      return {
        ...state,
        sortModel: action.payload as SortModel[],
      };
    // Handle adding a new selected cell
    case ADD_SELECTED_CELL: {
      // Check if cell is already selected to prevent duplicates
      const alreadyExists = state.selectedCells.some(
        (cell) =>
          cell.rowId === action.payload.rowId &&
          cell.field === action.payload.field
      );

      // If cell is not already selected, add it and update numeric values
      if (!alreadyExists) {
        const updatedCells = [...state.selectedCells, action.payload];
        return {
          ...state,
          selectedCells: updatedCells,
          // Recalculate numeric values after adding new cell
          numericCellValues: extractNumericValues(updatedCells),
        };
      }
      return state;
    }

    // Handle removing a selected cell
    case REMOVE_SELECTED_CELL: {
      // Filter out the cell to be removed
      const updatedCells = state.selectedCells.filter(
        (cell) =>
          !(
            cell.rowId === action.payload.rowId &&
            cell.field === action.payload.field
          )
      );

      return {
        ...state,
        selectedCells: updatedCells,
        // Recalculate numeric values after removing cell
        numericCellValues: extractNumericValues(updatedCells),
      };
    }

    // Clear all selected cells
    case CLEAR_SELECTED_CELLS:
      return {
        ...state,
        selectedCells: [],
        numericCellValues: [],
      };

    // Manually store numeric cell values
    case STORE_NUMERIC_CELL_VALUES:
      return {
        ...state,
        numericCellValues: action.payload,
      };

    // Retrieve current selected cells (no state change)
    case GET_SELECTED_CELLS:
      return state;

    // Handle adding a selected row
    case ADD_SELECTED_ROW: {
      // Prevent duplicate row selection
      const alreadyExists = state.selectedRows.includes(action.payload.id);

      if (!alreadyExists) {
        return {
          ...state,
          // Add new row to selected rows
          selectedRows: [...state.selectedRows, action.payload],
        };
      }
      return state;
    }

    // Handle removing a selected row
    case REMOVE_SELECTED_ROW:
      return {
        ...state,
        // Filter out the row to be removed
        selectedRows: state.selectedRows.filter(
          (row: any) => row.id !== action.payload
        ),
      };

    // Clear all selected rows
    case CLEAR_SELECTED_ROWS:
      return {
        ...state,
        selectedRows: [],
      };
    case SET_COLUMN_WIDTH:
      return {
        ...state,
        columnWidths: {
          ...state.columnWidths,
          [action.payload.field]: action.payload.width,
        },
      };
    // Handle resetting footer values (if applicable)
    case RESET_FOOTER_VALUES:
      return {
        ...state,
        numericCellValues: [],
        selectedCells: [],
        selectedRows: [],
      };

    // Handle updating all selected cells (for formatting actions)
    case UPDATE_SELECTED_CELLS:
      return {
        ...state,
        selectedCells: action.payload,
        numericCellValues: extractNumericValues(action.payload),
      };

    case BULK_EDIT_START:
      return {
        ...state,
        isBulkEditMode: true
      };

    case BULK_EDIT_CANCEL:
      return {
        ...state,
        isBulkEditMode: false
      };
      
    case BULK_UPDATE_CELLS: {
      const { cells, value, formatting } = action.payload;

      // Create a map for quick cell lookup
      const updateMap = cells.reduce((map: Record<string, boolean>, cell: SelectedCell) => {
        const key = `${cell.rowId}:${cell.field}`;
        map[key] = true;
        return map;        
      }, {});

      // Update all matching cells
      const updatedCells = state.selectedCells.map(cell => {
        const key = `${cell.rowId}:${cell.field}`;

        if (updateMap[key]) {
          return {
            ...cell,
            value,
            ...(formatting ?? {})
          };
        }

        return cell;
      });

      // Use the existing extractNumericValues function

      // Bulk update completed

      return {
        ...state,
        selectedCells: updatedCells,
        numericCellValues: extractNumericValues(updatedCells),
        isBulkEditMode: false
      };
    }

    // Return current state for unhandled actions
    default:
      return state;
  }
};

export default selectedCellsReducer;
