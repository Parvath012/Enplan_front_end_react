import React from "react";

interface ColumnListProps {
  columns: any[];
  onSelection: (index: number, ctrlKey: boolean, shiftKey: boolean) => void;
  selectedFields: any[];
  side: string;
  onDoubleClick: (item: any, side: string) => void;
}

export const ColumnList: React.FC<ColumnListProps> = ({ 
  columns, 
  onSelection, 
  selectedFields, 
  side, 
  onDoubleClick 
}) => (
  <div
    style={{
      border: "1px solid #e5e5ea",
      borderRadius: "4px",
      height: "200px",
      overflowY: "auto",
      background: "#fff",
    }}
  >
    {columns.length > 0 ? (
      columns.map((col, index) => (
        <button
          type="button"
          key={col.id || index}
          onClick={(e) => onSelection(index, e.ctrlKey, e.shiftKey)}
          onDoubleClick={() => onDoubleClick(col, side)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelection(index, e.ctrlKey, e.shiftKey);
            }
          }}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            borderBottom: "1px solid #f0f0f0",
            background: selectedFields.some(sel => sel.id === col.id) ? "#e8f6e8" : "transparent",
            fontWeight: selectedFields.some(sel => sel.id === col.id) ? "500" : "400",
            border: "none",
            width: "100%",
            textAlign: "left",
          }}
        >
          {col.name}
        </button>
      ))
    ) : (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100%", 
        color: "#999", 
        fontStyle: "italic" 
      }}>
        {side === "left" ? "NO COLUMNS AVAILABLE" : "NO COLUMNS SELECTED"}
      </div>
    )}
  </div>
);
