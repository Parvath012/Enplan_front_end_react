import React from "react";
import { useSelector } from "react-redux";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { getDisplayValue } from "../../../../utils/cellDisplayUtils";

// Interface defining props for the GridCellRenderer component
// Provides flexibility for custom cell styling and rendering
interface Props {
  // MUI DataGrid cell rendering parameters
  params: GridRenderCellParams;

  // Optional custom inline styles
  style?: React.CSSProperties;

  // Optional additional CSS class names
  className?: string;
}

// Reusable cell renderer component for MUI DataGrid
// Supports custom styling and consistent cell formatting
const GridCellRenderer: React.FC<Props> = ({
  params,
  // Default to empty object and string for optional props
  style = {},
  className = "",
}) => {
  // Get formatting config from Redux store
  const formattingConfig = useSelector(
    (state: any) => state.dataStore.formattingConfig
  );
  // Build cell key for formatting lookup
  const cellKey = `${params.id}:${params.field}`;
  // Get formatting object for this cell (if any)
  const formatting = formattingConfig ? formattingConfig[cellKey] : undefined;
  // Compute the display value for the cell using formatting (currency, date, etc.)
  const displayValue = getDisplayValue(params, formatting);
  // Build dynamic style for text formatting (for cellContent)
  const textFormattingStyle: React.CSSProperties = {
    fontWeight: formatting?.bold ? "bolder" : style.fontWeight ?? undefined,
    fontStyle: formatting?.italic ? "italic" : style.fontStyle ?? undefined,
    textDecoration: [
      formatting?.underline ? "underline" : "",
      formatting?.strikethrough ? "line-through" : ""
    ].filter(Boolean).join(" ") || undefined,
    color: formatting?.textColor ?? style.color ?? undefined,
  };
  // Style for cellWrapper (background, border, color)
  const hasFillColor = !!formatting?.fillColor;
  const extraClass = hasFillColor ? 'cell-has-fillcolor' : '';
  // If fillColor, set CSS variable for use in .cell-has-fillcolor.selected-cell
  const wrapperStyle: React.CSSProperties = {
    backgroundColor: formatting?.fillColor ?? style.backgroundColor ?? undefined,
    color: undefined, // color is now handled by textFormattingStyle
    border: style.border ?? undefined,
    ...(hasFillColor ? { '--cell-fill-color': formatting.fillColor } : {}),
  } as React.CSSProperties;
  return (
    <div
      title={displayValue}
      className={`cellWrapper ${className} ${extraClass}`}
      style={wrapperStyle}
    >
      <div className="cellContent" style={textFormattingStyle}>
        {displayValue}
      </div>
    </div>
  );
};

export default GridCellRenderer;
