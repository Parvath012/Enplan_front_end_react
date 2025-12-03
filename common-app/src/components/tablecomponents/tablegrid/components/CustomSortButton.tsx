import React from "react";
import CustomSortIcon from "./CustomSortIcon";
import type { GridSortDirection } from "@mui/x-data-grid";

/**
 *  CustomSortButton component
 *  Renders a button for sorting a specific column in the data grid
 */
interface CustomSortButtonProps {
  field: string;
  sortDirection: string | null;
  sortPriority: number | null;
  sortType: string | null;
  onSortAsc?: (field: string, type?: string | null) => void;
  onSortDesc?: (field: string, type?: string | null) => void;
  onClearSort?: (field: string) => void;
}

/**
 * CustomSortButton component
 * This button handles sorting actions for a specific column in the grid
 * It displays the current sort direction and allows toggling between ascending, descending, and clearing the sort
 */
const CustomSortButton: React.FC<CustomSortButtonProps> = ({
  field,
  sortDirection,
  sortPriority,
  sortType,
  onSortAsc,
  onSortDesc,
  onClearSort,
}) => {
  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center" }}
    >
      <button
        type="button"
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          background: "none",
          border: "none",
          padding: 0,
        }}
        onClick={() => {
          const typeToUse = !sortDirection
            ? "alphanumeric"
            : sortType ?? "alphanumeric";
          if (!sortDirection) {
            onSortDesc?.(field, typeToUse);
          } else if (sortDirection === "desc") {
            onSortAsc?.(field, typeToUse);
          } else {
            onClearSort?.(field);
          }
        }}
        aria-label="Sort column"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const typeToUse = !sortDirection
              ? "alphanumeric"
              : sortType ?? "alphanumeric";
            if (!sortDirection) {
              onSortDesc?.(field, typeToUse);
            } else if (sortDirection === "desc") {
              onSortAsc?.(field, typeToUse);
            } else {
              onClearSort?.(field);
            }
          }
        }}
      >
        <CustomSortIcon
          direction={sortDirection as GridSortDirection}
          className="custom-sort-icon"
          data-testid="custom-sort-icon"
        />
      </button>
      {sortPriority && (
        <span
          className="sort-priority-indicator"
          style={{
            position: "absolute",
            top: -6,
            right: -10,
            fontSize: 10,
            background: "#156ff5",
            color: "#fff",
            borderRadius: "50%",
            width: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            zIndex: 2,
          }}
          title={
            sortType
              ? `Sort priority: ${sortPriority} (${sortType})`
              : `Sort priority: ${sortPriority}`
          }
        >
          {sortPriority}
        </span>
      )}
    </div>
  );
};

export default CustomSortButton;
