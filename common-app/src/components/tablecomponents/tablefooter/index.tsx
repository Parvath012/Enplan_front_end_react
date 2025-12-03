import React from "react";
import TableFooterComponent from "./components";

// Define the prop types for the TableFooter component
// This helps with type checking and documentation
type TableFooterProps = {
  data: number[];                     // Array of numeric data to calculate stats
  numOfSelectedRows?: number;          // Optional number of selected rows
  selectedCells: [];                   // Array of selected cells
  zoom?: number;                       // Optional zoom level
  onZoomChange?: (zoom: number) => void; // Optional callback for zoom changes
  onRefresh?: () => void;              // Optional callback for refresh action
};

// TableFooter component calculates and displays statistical information
// It provides insights about the current table state
const TableFooter: React.FC<TableFooterProps> = ({
  data,
  selectedCells,
  numOfSelectedRows,
  zoom,
  onZoomChange,
  onRefresh
}) => {
  // Calculate comprehensive statistics based on the input data
  // Provides insights like total rows, filled cells, sum, average, min, and max
  const statsData = {
    // Total number of selected rows (if provided)
    totalRows: numOfSelectedRows,

    // Count of non-empty cells in the selected cells
    Count: (selectedCells as { value: string }[]).filter(cell => cell.value !== '').length,

    // Sum of all numeric values in the data array
    sum: data.reduce((a, b) => a + b, 0),

    // Calculate average with two decimal precision
    // Returns 0 if no data is available to prevent division by zero
    avg: data.length
      ? (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2)
      : 0,

    // Find minimum value in the data array
    // Returns 0 if no data is available
    min: data.length ? Math.min(...data) : 0,

    // Find maximum value in the data array
    // Returns 0 if no data is available
    max: data.length ? Math.max(...data) : 0,
  };

  // Render the footer component with calculated stats
  // Passes zoom and refresh handlers as props
  return (
    <TableFooterComponent
      statsData={statsData}           // Pass calculated statistics
      onRefresh={onRefresh}            // Refresh callback
      zoomPercentage={zoom}            // Current zoom level
      onZoomChange={onZoomChange}      // Zoom change handler
    />
  );
};

// Export the TableFooter component as default
export default TableFooter;