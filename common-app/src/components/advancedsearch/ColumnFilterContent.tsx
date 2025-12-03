import React from "react";
import { ColumnList } from "./ColumnList";
import { TransferButton } from "./TransferButton";

interface ColumnFilterContentProps {
  availableColumns: any[];
  selectedColumnsTemp: any[];
  selectedFieldsLeft: any[];
  selectedFieldsRight: any[];
  enableAddColumn: boolean;
  enableRemoveColumn: boolean;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
  onAddAllColumns: () => void;
  onRemoveAllColumns: () => void;
  handleSelectionLeft: (index: number, ctrlKey: boolean, shiftKey: boolean) => void;
  handleSelectionRight: (index: number, ctrlKey: boolean, shiftKey: boolean) => void;
  onDoubleClick: (item: any, side: string) => void;
}

export const ColumnFilterContent: React.FC<ColumnFilterContentProps> = ({
  availableColumns,
  selectedColumnsTemp,
  selectedFieldsLeft,
  selectedFieldsRight,
  enableAddColumn,
  enableRemoveColumn,
  onAddColumn,
  onRemoveColumn,
  onAddAllColumns,
  onRemoveAllColumns,
  handleSelectionLeft,
  handleSelectionRight,
  onDoubleClick,
}) => (
  <div style={{ padding: "16px 0" }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "16px", alignItems: "start" }}>
      {/* Available Columns */}
      <div>
        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontWeight: "600", color: "#333", fontSize: "14px" }}>
            Columns Available
          </span>
        </div>
        <ColumnList 
          columns={availableColumns} 
          onSelection={handleSelectionLeft} 
          selectedFields={selectedFieldsLeft} 
          side="left" 
          onDoubleClick={onDoubleClick}
        />
      </div>

      {/* Transfer Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "20px 0" }}>
        <TransferButton onClick={onAddColumn} disabled={!enableAddColumn} title="Add Selected">
          &gt;
        </TransferButton>
        <TransferButton onClick={onRemoveColumn} disabled={!enableRemoveColumn} title="Remove Selected">
          &lt;
        </TransferButton>
        <TransferButton onClick={onRemoveAllColumns} disabled={selectedColumnsTemp.length === 0} title="Remove All">
          &lt;&lt;
        </TransferButton>
        <TransferButton onClick={onAddAllColumns} disabled={availableColumns.length === 0} title="Add All">
          &gt;&gt;
        </TransferButton>
      </div>

      {/* Selected Columns */}
      <div>
        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontWeight: "600", color: "#333", fontSize: "14px" }}>
            Columns Selected
          </span>
          <span style={{ 
            marginLeft: "8px", 
            color: "#666", 
            fontSize: "12px",
            background: "#f0f0f0",
            padding: "2px 6px",
            borderRadius: "4px"
          }}>
            {selectedColumnsTemp.length < 10 ? `0${selectedColumnsTemp.length}` : selectedColumnsTemp.length}
          </span>
        </div>
        <ColumnList 
          columns={selectedColumnsTemp} 
          onSelection={handleSelectionRight} 
          selectedFields={selectedFieldsRight} 
          side="right" 
          onDoubleClick={onDoubleClick}
        />
      </div>
    </div>
  </div>
);
