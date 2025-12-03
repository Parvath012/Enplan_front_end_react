import React, { useState, useMemo } from "react";
import { Column, Filter, Row, Close, Erase, ArrowRight } from "@carbon/icons-react";
import { Nav } from "rsuite";
import { ColumnFilterContent } from "./ColumnFilterContent";
import { RowFilterContent } from "./RowFilterContent";

// Types
interface FilterOptionsProps {
  columns: any[];
  selectedColumns: any[];
  onColumnsChange: (columns: any[]) => void;
  onClose: () => void;
  enableColumnFilter?: boolean;
  enableRowFilter?: boolean;
}

interface FilterButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  type?: "submit" | "clear" | "clearRow" | "clearColumn" | "cancel";
}

// Filter Button Component
const FilterButton: React.FC<FilterButtonProps> = ({ onClick, disabled, title, type }) => {
  const getButtonStyle = (type: string, disabled?: boolean) => {
    let style: React.CSSProperties = {
      background: "transparent",
      border: "1px solid #e5e5ea",
      borderRadius: "50%",
      height: 36,
      width: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 2px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "background 0.2s, border 0.2s",
      padding: 0,
    };

    if (type === "submit") {
      style.background = "#a5d6a7";
      style.border = "none";
    } else if (type === "cancel") {
      style.border = "1px solid #a5d6a7";
      style.background = "transparent";
    }
    return style;
  };

  const getIcon = () => {
    switch (type) {
      case "clearColumn":
        return <Column width={20} height={20} />;
      case "clearRow":
        return <Row width={20} height={20} />;
      case "clear":
        return <Erase width={20} height={20} />;
      case "submit":
        return <ArrowRight width={20} height={20} />;
      case "cancel":
        return <Close width={20} height={20} />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={getButtonStyle(type ?? "", disabled)}
    >
      {getIcon()}
    </button>
  );
};

// Tabs Component
const Tabs: React.FC<{
  active: string;
  onSelect: (key: string) => void;
  navItems: any[];
  onClose: () => void;
}> = ({ active, onSelect, navItems, onClose }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <Nav
        activeKey={active}
        onSelect={onSelect}
        appearance="subtle"
        style={{ flex: 1 }}
      >
        {navItems.map((item) => (
          <Nav.Item
            key={item.eventKey}
            eventKey={item.eventKey}
            icon={item.icon ? <item.icon width={16} height={16} /> : null}
            disabled={item.disabled}
            style={{
              color: active === item.eventKey ? "#333333" : "#6f6f6f",
              fontWeight: active === item.eventKey ? "600" : "400",
            }}
          >
            <span>{item.title}</span>
            {item.rightIcon && (
              <span style={{ marginLeft: "8px", fontSize: "12px", color: "#666" }}>
                {item.rightIcon}
              </span>
            )}
          </Nav.Item>
        ))}
      </Nav>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Close"
      >
        <Close width={20} height={20} style={{ color: "#666" }} />
      </button>
    </div>
  );
};

export const FilterOptions: React.FC<FilterOptionsProps> = ({
  columns,
  selectedColumns,
  onColumnsChange,
  onClose,
  enableColumnFilter = true,
  enableRowFilter = true,
}) => {
  const [open, setOpen] = useState(false);
  const [filterActiveTab, setFilterActiveTab] = useState("columnfilter");

  // State for column management (matching original logic)
  const [availableColumns, setAvailableColumns] = useState(columns);
  const [selectedColumnsTemp, setSelectedColumnsTemp] = useState<any[]>([]);
  const [selectedFieldsLeft, setSelectedFieldsLeft] = useState<any[]>([]);
  const [selectedFieldsRight, setSelectedFieldsRight] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<{ itemList: any[]; source: string }>({
    itemList: [],
    source: "left",
  });

  // Tab items
  const navItems = [
    {
      title: "Column Filter",
      eventKey: "columnfilter",
      icon: Column,
      rightIcon: selectedColumnsTemp.length < 10 ? `0${selectedColumnsTemp.length}` : selectedColumnsTemp.length,
      disabled: !enableColumnFilter,
    },
    {
      title: "Row Filter",
      eventKey: "rowfilter",
      icon: Row,
      rightIcon: "00",
      disabled: !enableRowFilter,
    },
  ];

  // Tab select handler
  const handleSelect = (event: string) => {
    setFilterActiveTab(event);
  };

  // Helper function to clear column selections
  const clearColumnSelections = () => {
    setAvailableColumns([...availableColumns, ...selectedColumnsTemp]);
    setSelectedColumnsTemp([]);
    clearItemSelectionRight();
  };

  // Clear handlers
  const clearColumnFilter = () => {
    clearColumnSelections();
  };

  const clearRowFilter = () => {
    // Row filter clear logic would go here
  };

  const clearAllFilters = () => {
    clearColumnSelections();
    // Clear row filters too
  };

  // Submit handler
  const submitFilter = () => {
    onColumnsChange(selectedColumnsTemp);
    setOpen(false);
    onClose();
  };

  // Cancel handler
  const cancelFilter = () => {
    // Reset to original state
    setAvailableColumns(columns);
    setSelectedColumnsTemp(selectedColumns);
    clearItemSelectionLeft();
    clearItemSelectionRight();
    setOpen(false);
    onClose();
  };

  // Initialize state when component mounts or props change
  React.useEffect(() => {
    setAvailableColumns(columns);
    setSelectedColumnsTemp(selectedColumns);
  }, [columns, selectedColumns]);

  // Selection handlers (matching original logic)
  const handleSelectionLeft = (index: number, ctrlKey: boolean, shiftKey: boolean) => {
    const item = availableColumns[index];
    if (ctrlKey) {
      // Multi-select with Ctrl
      if (selectedFieldsLeft.some(sel => sel.id === item.id)) {
        setSelectedFieldsLeft(selectedFieldsLeft.filter(sel => sel.id !== item.id));
      } else {
        setSelectedFieldsLeft([...selectedFieldsLeft, item]);
      }
    } else {
      // Single select
      setSelectedFieldsLeft([item]);
    }
    setSelectedList({ itemList: [item], source: "left" });
  };

  const handleSelectionRight = (index: number, ctrlKey: boolean, shiftKey: boolean) => {
    const item = selectedColumnsTemp[index];
    if (ctrlKey) {
      // Multi-select with Ctrl
      if (selectedFieldsRight.some(sel => sel.id === item.id)) {
        setSelectedFieldsRight(selectedFieldsRight.filter(sel => sel.id !== item.id));
      } else {
        setSelectedFieldsRight([...selectedFieldsRight, item]);
      }
    } else {
      // Single select
      setSelectedFieldsRight([item]);
    }
    setSelectedList({ itemList: [item], source: "right" });
  };

  const clearItemSelectionLeft = () => setSelectedFieldsLeft([]);
  const clearItemSelectionRight = () => setSelectedFieldsRight([]);

  // Move columns between lists (working with temporary state)
  const onAddColumn = () => {
    const newItems = selectedFieldsLeft.filter(
      (item: any) => !selectedColumnsTemp.some((col: any) => col.id === item.id)
    );
    setSelectedColumnsTemp([...selectedColumnsTemp, ...newItems]);
    setAvailableColumns(availableColumns.filter(col => !newItems.some(item => item.id === col.id)));
    clearItemSelectionLeft();
  };

  const onRemoveColumn = () => {
    const removeIds = selectedFieldsRight.map((item: any) => item.id);
    const removedItems = selectedColumnsTemp.filter(col => removeIds.includes(col.id));
    setSelectedColumnsTemp(selectedColumnsTemp.filter((col: any) => !removeIds.includes(col.id)));
    setAvailableColumns([...availableColumns, ...removedItems]);
    clearItemSelectionRight();
  };

  const onAddAllColumns = () => {
    setSelectedColumnsTemp([...selectedColumnsTemp, ...availableColumns]);
    setAvailableColumns([]);
    clearItemSelectionLeft();
  };

  const onRemoveAllColumns = () => {
    clearColumnSelections();
  };

  const onDoubleClick = (item: any, id: string) => {
    if (id === "left") {
      onAddColumn();
    } else {
      onRemoveColumn();
    }
  };

  // Button enable/disable logic (matching original)
  const enableAddColumn = selectedList.source === "left" && selectedFieldsLeft?.length > 0 && availableColumns?.length > 0;
  const enableRemoveColumn = selectedList.source === "right" && selectedFieldsRight?.length > 0 && selectedColumnsTemp?.length > 0;


  // Content based on active tab
  const viewContent = useMemo(() => {
    switch (filterActiveTab) {
      case "columnfilter":
        return (
          <ColumnFilterContent
            availableColumns={availableColumns}
            selectedColumnsTemp={selectedColumnsTemp}
            selectedFieldsLeft={selectedFieldsLeft}
            selectedFieldsRight={selectedFieldsRight}
            enableAddColumn={enableAddColumn}
            enableRemoveColumn={enableRemoveColumn}
            onAddColumn={onAddColumn}
            onRemoveColumn={onRemoveColumn}
            onAddAllColumns={onAddAllColumns}
            onRemoveAllColumns={onRemoveAllColumns}
            handleSelectionLeft={handleSelectionLeft}
            handleSelectionRight={handleSelectionRight}
            onDoubleClick={onDoubleClick}
          />
        );
      case "rowfilter":
        return <RowFilterContent />;
      default:
        return <div>No Filter</div>;
    }
  }, [filterActiveTab, availableColumns, selectedColumnsTemp, selectedFieldsLeft, selectedFieldsRight, enableAddColumn, enableRemoveColumn, onAddColumn, onRemoveColumn, onAddAllColumns, onRemoveAllColumns, handleSelectionLeft, handleSelectionRight, onDoubleClick]);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#e8f6e8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
        title="Filter"
      >
        <Filter width={16} height={16} style={{ color: "#666" }} />
      </button>

      {/* Modal */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              minWidth: "600px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "16px 20px 0 20px" }}>
              <Tabs
                active={filterActiveTab}
                onSelect={handleSelect}
                navItems={navItems}
                onClose={cancelFilter}
              />
            </div>
            <div style={{ padding: "0 20px", flex: 1, overflow: "auto" }}>
              {viewContent}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "16px 20px",
                borderTop: "1px solid #e5e5ea",
                gap: "8px",
              }}
            >
              <FilterButton
                onClick={clearColumnFilter}
                title="Clear Column Filter"
                type="clearColumn"
              />
              <FilterButton
                onClick={clearRowFilter}
                title="Clear Row Filter"
                type="clearRow"
                disabled={!enableRowFilter}
              />
              <FilterButton
                onClick={clearAllFilters}
                title="Clear All Filters"
                type="clear"
              />
              <FilterButton
                onClick={cancelFilter}
                title="Cancel"
                type="cancel"
              />
              <FilterButton
                onClick={submitFilter}
                title="Submit"
                type="submit"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
