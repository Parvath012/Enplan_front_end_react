import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DataGrid,
  GridCallbackDetails,
  GridCellParams,
  GridRowSelectionModel,
  GridRowId,
} from '@mui/x-data-grid';
import { generateColumns } from './components/gridUtils';
import './styles.scss';
import CustomCheckbox from './components/CustomCheckbox';
import { ExcelGridProps, SortType } from './types';
import {
  setColumnWidth,
  handleCellClickAction,
  handleRowSelectionAction,
  autoResizeColumn,
  getDynamicRowHeight,
  setColumns
} from '../../../store/Actions/gridActions';
import { MUIGridFields, WindowsEvents } from '../../../constants/gridFields';
import { preprocessRows, applyMultiColumnSort, getSortAscModel, getSortDescModel, getClearSortModel } from './components/reusableSortUtils';
import { GridSortMenuContext } from './components/GridSortMenuContext';

/**
 * Updates rows with values from selected cells
 * This ensures bulk edits are reflected in the grid
 */
export function getUpdatedRows(currentRows: any[], cellsToApply: any[]) {
  if(!cellsToApply || cellsToApply.length === 0) return currentRows;

  // Create a map of updates by rowId and field
  const updateMap = new Map();
  cellsToApply.forEach(cell => {
    if (!updateMap.has(cell.rowId)) {
      updateMap.set(cell.rowId, {});
    }
    updateMap.get(cell.rowId)[cell.field] = cell.value;
  });

  // Apply updates to the current rows
  return currentRows.map(row => {
    const updates = updateMap.get(row.id);
    if (!updates) return row;

    return {
      ...row,
      ...updates
    };
  });
}

// Dedicated type for sort model
export interface SortModel {
  field: string;
  type?: string;
  sort: string;
  priority: number;
}

/**
 * Custom Checkbox Component
 * Overrides default MUI DataGrid checkbox with custom styling
 * 
 * @param props - Checkbox properties
 * @returns Customized checkbox component
 */
export const BaseCheckbox = (props: any) => {
  // Determine if it's a header checkbox or row selection checkbox
  const isHeaderCheckbox = props.slotProps?.htmlInput?.name !== 'select_row';

  // Render CustomCheckbox with dynamic sizing
  return <CustomCheckbox {...props} boxSize={isHeaderCheckbox ? 18 : 14} />;
};

/**
 * Reusable Excel Grid Component
 * Provides a flexible and feature-rich data grid with advanced customization
 * 
 * @component
 * @param {ExcelGridProps} props - Component properties
 */
const ReusableExcelGrid: React.FC<ExcelGridProps> = ({
  rows,                           // Data rows for the grid
  schema,                         // Column schema definition
  tableConfiguration,             // Additional table configuration
  processRowUpdate = (updatedRow) => updatedRow,  // Row update handler
  rowStyleResolver,               // Custom row style resolver
  enableActionsColumn = false,    // Flag to enable actions column
  onActionClick,                  // Action click handler
  actionMenuItems,                // Custom action menu items
  actionsColumnWidth = 100,       // Width of actions column
  zoom = 100,                      // Zoom level for the grid
  setRows,                         // Function to set updated rows
  sortModel,                       // Current sort model
  setSortModel                     // Function to set sort model
}) => {
  // Redux dispatch hook for state management
  const dispatch = useDispatch();

  // Select grid-related state from Redux store
  const selectedCells = useSelector((state: any) => state.gridStore.selectedCells);
  const columnWidths = useSelector((state: any) => state.gridStore.columnWidths);
  const wrapConfig = useSelector((state: any) => state.alignmentStore.wrapConfig);
  const formattingConfig = useSelector((state: any) => state.dataStore.formattingConfig);

  // Memoized state for managing sort model and menu actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // State for managing the field for which the menu is open
  const [menuField, setMenuField] = useState<string | null>(null);

  // Handle menu open event to set anchor and field
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, field: string) => {
    setAnchorEl(event.currentTarget);
    setMenuField(field);
  };

  // Handle menu close event to reset anchor and field
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuField(null);
  };

  // Sorting handlers for menu actions Ascending
  const handleSortAsc = (field: string, type: SortType) => {
    if (setSortModel && sortModel) {
      const newModel = getSortAscModel(sortModel, field, type);
      setSortModel(newModel);
    }
    handleMenuClose();
  };

  // Sorting handlers for menu actions Descending
  const handleSortDesc = (field: string, type: SortType) => {
    if (setSortModel && sortModel) {
      const newModel = getSortDescModel(sortModel, field, type);
      setSortModel(newModel);
    }
    handleMenuClose();
  };

  // Clear sort handler for menu actions
  const handleClearSort = (field: string) => {
    if (setSortModel && sortModel) {
      const newModel = getClearSortModel(sortModel, field);
      setSortModel(newModel);
    }
    handleMenuClose();
  };

  // Memoized column generation to optimize performance, including sort state
  const columns = useMemo(
    () =>
      generateColumns(
        {
          schema,
          tableConfiguration,
          selectedCells,
          columnWidths,
          wrapConfig,
          formattingConfig,
          sortMenuHandlers: {
            onSortAsc: (field: string, type?: string | null) => handleSortAsc(field, (type as SortType) ?? 'alphanumeric'),
            onSortDesc: (field: string, type?: string | null) => handleSortDesc(field, (type as SortType) ?? 'alphanumeric'),
            onClearSort: handleClearSort
          }
        },
        rowStyleResolver,
        enableActionsColumn,
        onActionClick,
        actionMenuItems,
        actionsColumnWidth
      ).map(col => {
        const safeSortModel = sortModel ?? [];
        const sortEntry = safeSortModel.find((s: SortModel) => s.field === col.field);
        return {
          ...col,
          sortDirection: sortEntry?.sort ?? null,
          sortPriority: sortEntry ? safeSortModel.findIndex((s: SortModel) => s.field === col.field) + 1 : null,
          sortType: sortEntry?.type ?? null,
        };
      }),
    [
      schema,
      tableConfiguration,
      selectedCells,
      columnWidths,
      wrapConfig,
      formattingConfig,
      rowStyleResolver,
      enableActionsColumn,
      onActionClick,
      actionMenuItems,
      actionsColumnWidth,
      sortModel,
      anchorEl,
      menuField,
      handleMenuOpen,
      handleMenuClose,
      handleSortAsc,
      handleSortDesc,
      handleClearSort
    ]
  );

  // Add this effect to update Redux when columns change
  useEffect(() => {
  // Dispatch columns to Redux store to make them available to BulkEditButton
  dispatch(setColumns(columns));
  }, [columns]);

  /**
   * Handles cell click events
   * Dispatches cell click action to Redux store
   * 
   * @param params - Cell parameters
   * @param event - Mouse click event
   */
  const handleCellClick = (params: GridCellParams, event: React.MouseEvent) => {
    dispatch<any>(handleCellClickAction(params, event.nativeEvent, selectedCells));
  };

  /**
   * Handles row selection events
   * Dispatches row selection action to Redux store
   * 
   * @param rowSelectionModel - Selected row IDs
   * @param _details - Additional selection details
   */
  const handleRowSelection = (
    rowSelectionModel: GridRowSelectionModel,
    _details: GridCallbackDetails
  ) => {
    // Handle the GridRowSelectionModel safely by converting to unknown first and then to the expected type
    const selectedIds = (rowSelectionModel as unknown) as GridRowId[];
    dispatch<any>(handleRowSelectionAction({ ids: selectedIds }, rows));
  };

  /**
   * Handle cell edit stop events
   * Called after a cell edit is committed to update data
   * 
   * @param params - Cell edit parameters
   */
  const handleCellEditStop = (params: any) => {
    console.log("Cell edit stopped:", params);
  }

  /**
   * Custom column resizing and auto-resize logic
   * Adds event listeners for column resizing and double-click auto-resize
   */
  useEffect(() => {
    let isResizing = false;
    const indicator = document.getElementById('resize-indicator');

    // Handle mouse down event for column resizing
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target?.classList.contains('MuiDataGrid-columnSeparator')) return;
      if (e.detail === 2) return;

      isResizing = true;
      if (indicator) {
        indicator.style.display = 'block';
        indicator.style.left = `${e.pageX}px`;
      }
    };

    // Handle mouse move during resizing
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && indicator) {
        indicator.style.left = `${e.pageX}px`;
      }
    };

    // Handle mouse up to end resizing
    const handleMouseUp = () => {
      isResizing = false;
      if (indicator) {
        indicator.style.display = 'none';
      }
    };

    // Handle double-click to auto-resize column
    const handleDoubleClick = (e: MouseEvent) => {
      const headerCell = (e.target as HTMLElement).closest('.MuiDataGrid-columnHeader');
      if (!headerCell) return;

      const field = headerCell.getAttribute('data-field');
      if (!field) return;

      dispatch<any>(autoResizeColumn(field));
    };

    // Add event listeners
    window.addEventListener(WindowsEvents.MouseDown, handleMouseDown);
    window.addEventListener(WindowsEvents.MouseMove, handleMouseMove);
    window.addEventListener(WindowsEvents.MouseUp, handleMouseUp);
    window.addEventListener(WindowsEvents.DblClick, handleDoubleClick);

    // Cleanup event listeners
    return () => {
      window.removeEventListener(WindowsEvents.MouseDown, handleMouseDown);
      window.removeEventListener(WindowsEvents.MouseMove, handleMouseMove);
      window.removeEventListener(WindowsEvents.MouseUp, handleMouseUp);
      window.removeEventListener(WindowsEvents.DblClick, handleDoubleClick);
    };
  }, [columns, rows]);

useEffect(() => {
  if (selectedCells && selectedCells.length > 0) {
    // Force refresh of grid data when cells are updated
    // This ensures bulk edits are rendered
    console.log("Selected cells updated, refreshing grid");

    // This is what will actually update the grid with bulk edit values
    const updatedRows = getUpdatedRows(rows, selectedCells);

    // Only update rows if they're actually different
    if (setRows && 
        typeof setRows === 'function' && 
        JSON.stringify(updatedRows) !== JSON.stringify(rows)) {
      setRows(updatedRows);
    }
  }
}, [selectedCells]);

  // Use reusable preprocessRows
  const preprocessedRows = useMemo(() => preprocessRows(rows, formattingConfig), [rows, formattingConfig]);

  // Use reusable applyMultiColumnSort
  const sortedRows = useMemo(
    () =>
      applyMultiColumnSort(
        preprocessedRows,
        (sortModel ?? []).map(({ field, type, sort }) => ({
          sortBy: field,
          sortOn: type,
          order: sort,
        }))
      ),
    [preprocessedRows, sortModel]
  );

  // Define all sorting/menu handlers and state here
  const gridSortMenuContextValue = useMemo(() => ({
    onSortAsc: (field: string, type?: string | null) => handleSortAsc(field, (type as SortType) ?? 'alphanumeric'),
    onSortDesc: (field: string, type?: string | null) => handleSortDesc(field, (type as SortType) ?? 'alphanumeric'),
    anchorEl,
    menuField,
    handleMenuOpen,
    handleMenuClose,
    onClearSort: handleClearSort,
  }), [handleSortAsc, handleSortDesc, anchorEl, menuField, handleMenuOpen, handleMenuClose, handleClearSort]);

  return (
    <GridSortMenuContext.Provider value={gridSortMenuContextValue}>
      <div
        className="reusable-excel-grid"
        style={{ zoom: Number(zoom) / 100 }}
      >
        <DataGrid
          rows={sortedRows}
          columns={columns}
          checkboxSelection
          hideFooter
          sortingMode={MUIGridFields.Server}
          columnHeaderHeight={34}
          getRowHeight={({ model }) => {
            return getDynamicRowHeight(model, wrapConfig, columnWidths);
          }}
          processRowUpdate={processRowUpdate}
          disableRowSelectionOnClick={true}
          onCellClick={handleCellClick}
          onRowSelectionModelChange={handleRowSelection}
          onCellEditStop={handleCellEditStop}
          onColumnHeaderDoubleClick={(params, event) => {
            event.defaultMuiPrevented = true;
            const field = params.field;
            dispatch<any>(autoResizeColumn(field));
          }}
          // Handle column width changes
          onColumnWidthChange={(params) => {
            // Dispatch column width update
            dispatch(setColumnWidth(params.colDef.field, params.width));
          }}
          // Custom slots configuration
          slots={{
            baseCheckbox: BaseCheckbox
          }}
        />
        {/* Resize indicator for visual feedback during column resizing */}
        <div id="resize-indicator" />
      </div>
    </GridSortMenuContext.Provider>
  );
};

export default ReusableExcelGrid;
