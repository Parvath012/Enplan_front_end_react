import { GridColDef, GridRenderCellParams, GridRenderEditCellParams } from '@mui/x-data-grid';
import { ColumnConfiguration, ColumnSchema } from '../types';
import GridCellRenderer from './GridCellRenderer';
import React from 'react';
import { getActionsColumn } from './ActionsColumn';
import CustomSortButton from './CustomSortButton';
import ColumnMenu from './ColumnMenu';
import { CustomEditCellFields, GridFields } from '../../../../constants/gridFields';
import CustomEditCell from './CustomEditCell';
import BulkEditButton from './BulkEditButton';

/**
 * Interface for menu options in column headers
 * Allows custom icons and menu items to be defined
 */
interface MenuOptions {
  icon?: React.ReactNode;
  menuItems?: Array<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  }>;
}

/**
 * Interface for column generation configuration
 * Provides flexibility in defining column schemas, configurations, 
 * and selected cells
 */
interface GenerateColumnWithConfig {
  schema: ColumnSchema[];                                 // Column schema definition
  tableConfiguration?: ColumnConfiguration[];             // Optional table-level configuration
  selectedCells?: Array<{ rowId: number | string; field: string }>;  // Tracks selected cells
  columnWidths: { [field: string]: number };              // Dynamic column width mapping
  wrapConfig: Record<string, boolean>;
  formattingConfig?: Record<string, any>;                 // Formatting config from Redux
  sortMenuHandlers?: {                                          // Handlers for sort actions
    // Optional handlers for sort actions
    onSortAsc?: (field: string, type?: string | null) => void;
    onSortDesc?: (field: string, type?: string | null) => void;
    onClearSort?: (field: string) => void;
  };
}

/**
 * Predefined dropdown options for specific column types
 * Allows easy mapping of select type columns to their options
 */
const dropdownOptionsMap: Record<string, string[]> = {
  Status: ['Open', 'In Progress', 'Closed'],
  priority: ['Low', 'Medium', 'High'],
};

/**
 * Generates column definitions for DataGrid with extensive customization options
 * 
 * @param schemaWithConfig - Configuration for column generation
 * @param rowStyleResolver - Optional function to dynamically resolve row styles
 * @param enableActionsColumn - Flag to enable actions column
 * @param onActionClick - Callback for action column interactions
 * @param actionMenuItems - Custom menu items for actions column
 * @param actionsColumnWidth - Optional width for actions column
 * @param menuIconOptions - Optional menu icon configuration
 * @returns Array of GridColDef for DataGrid
 */
export const generateColumns = (
  schemaWithConfig: GenerateColumnWithConfig,
  rowStyleResolver?: (params: GridRenderCellParams) => React.CSSProperties,
  enableActionsColumn?: boolean,
  onActionClick?: (actionType: string, rowData: any) => void,
  actionMenuItems?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
  }> ,
  actionsColumnWidth?: number,
  menuIconOptions?: MenuOptions
): GridColDef[] => {
  const {
    onSortAsc,
    onSortDesc,
    onClearSort,
  } = schemaWithConfig.sortMenuHandlers || {};

  // Generate regular columns based on provided schema
  const regularColumns: GridColDef[] = schemaWithConfig.schema.map((col, index): GridColDef => {
    // Find configuration for current column
    const config = schemaWithConfig.tableConfiguration?.find(c => c.aliasName === col.aliasName);

    // Check configuration for next column (for border styling)
    const nextCol = schemaWithConfig.schema[index + 1];
    const nextConfig = schemaWithConfig.tableConfiguration?.find(c => c.aliasName === nextCol?.aliasName);

    // Determine column type and editability
    const isSelectType = config?.type === CustomEditCellFields.TypeSelect;
    const field = col.aliasName;
    const isEditable = config?.isEditable ?? false;
    const isNextEditable = nextConfig?.isEditable ?? false;

    // Get custom width for the column
    const customWidth = schemaWithConfig.columnWidths[field];

    return {
      field,
      headerName: field,
      editable: isEditable,
      width: customWidth ?? undefined,
      flex: customWidth ? undefined : 1,
      minWidth: 120,
      type: isSelectType ? 'singleSelect' : 'string',

      // Add right border for consecutive editable cells
      cellClassName: () => {
        if (isEditable && isNextEditable) return 'right-border';
        return '';
      },

      // Custom cell rendering with selection and style support
      renderCell: (params: GridRenderCellParams) => {
        // Check if current cell is selected
        const isSelected = schemaWithConfig.selectedCells?.some(
          (cell) => cell.rowId === params.id && cell.field === params.field
        );

        // Get formatting config for this cell
        const formattingConfig = schemaWithConfig.formattingConfig ?? {};
        const cellKey = `${params.id}:${params.field}`;
        const formatting = formattingConfig[cellKey] ?? {};
        // Extract background color logic to avoid nested ternary
        const cellBackgroundColor =
          formatting.fillColor ??
          (params.colDef.editable ? 'rgb(232, 241, 254)' : undefined);
        return (
          <GridCellRenderer
            params={params}
            className={isSelected ? 'selected-cell' : ''}
            style={{
              backgroundColor: cellBackgroundColor,
              // Apply additional row-specific styles
              ...(rowStyleResolver?.(params) || {}),
            }}
          />
        );
      },

      // Provide dropdown options for select type columns
      valueOptions: isSelectType ? dropdownOptionsMap[field] ?? [] : undefined,

      // Custom edit cell rendering
      renderEditCell: (params: GridRenderEditCellParams) => {
        // Get formatting config for this cell (like in GridCellRenderer)
        const formattingConfig = schemaWithConfig.formattingConfig ?? {};
        const cellKey = `${params.id}:${params.field}`;
        const formatting = formattingConfig[cellKey] ?? {};
        const wrapKey = `${params.id}|${params.field}`;
        const shouldWrap = schemaWithConfig.wrapConfig?.[wrapKey];
        return (
          <CustomEditCell
            {...params}
            isWrapped={shouldWrap && isEditable && !isSelectType}
            type={isSelectType ? CustomEditCellFields.TypeSelect : CustomEditCellFields.TypeText}
            options={isSelectType ? dropdownOptionsMap[field] : []}
            textColor={formatting.textColor}
            fillColor={formatting.fillColor}
            formatting={formatting}
          />
        );
      },

      // Custom header rendering with sort and menu icons
      renderHeader: (params: any) => {
        const { sortDirection, sortPriority, sortType } = params.colDef;
        return (
          <div className="headerContainer">
            <div className="headerText">{params.colDef.headerName}</div>
            <div className="headerIcons">
              {/* Bulk Edit button for editable columns */}
              {isEditable && (
                <div className="headerEditIcon">
                  <BulkEditButton columnField={field} />
                </div>
              )}
              {/* Custom sort button extracted to separate component */}
              <CustomSortButton
                field={field}
                sortDirection={sortDirection}
                sortPriority={sortPriority}
                sortType={sortType}
                onSortAsc={onSortAsc}
                onSortDesc={onSortDesc}
                onClearSort={onClearSort}
              />
              {/* Column menu extracted to separate component */}
              <ColumnMenu
                field={field}
                menuIcon={menuIconOptions?.icon}
              />
            </div>
          </div>
        );
      },
    };
  });

  // Conditionally add actions column if enabled
  if (enableActionsColumn && onActionClick) {
    const actionField = GridFields.Action;
    const dynamicWidth = schemaWithConfig.columnWidths[actionField] ?? actionsColumnWidth;
    const actionsColumn = getActionsColumn({
      onActionClick,
      actions: actionMenuItems,
      width: dynamicWidth,
      field: actionField,
    });
    return [...regularColumns, actionsColumn];
  }

  return regularColumns;
}
