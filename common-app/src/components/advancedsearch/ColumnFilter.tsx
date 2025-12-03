import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "@carbon/icons-react";
import { Container, Content, Tooltip, Whisper } from "rsuite";
import SimpleBar from "simplebar-react";
import classNames from "classnames";

// Types
export interface Column {
  id: string;
  name: string;
  type: "string" | "numerical" | "date";
}

export interface ColumnFilterProps {
  columns: Column[];
  selectedColumns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  onClose?: () => void;
}

// Add/Remove Columns Component
const AddRemoveColumns: React.FC<{
  selectedList: { itemList: Column[]; source: string };
  coldata: Column[];
  selectedColData: Column[];
  data: Column[];
  selectedData: Column[];
  onAddAllColumns: () => void;
  onRemoveAllColumns: () => void;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
}> = ({
  selectedList,
  coldata,
  selectedColData,
  data,
  selectedData,
  onAddAllColumns,
  onRemoveAllColumns,
  onAddColumn,
  onRemoveColumn,
}) => {
  const enableAddColumn =
    selectedList.source === "left" &&
    selectedList?.itemList?.length > 0 &&
    coldata?.length > 0;

  const enableRemoveColumn =
    selectedList.source === "right" &&
    selectedList?.itemList?.length > 0 &&
    selectedColData?.length > 0;

  return (
    <div className="column-filter-controls">
      <Whisper
        placement="bottomStart"
        trigger="hover"
        delayOpen={500}
        speaker={
          <Tooltip>
            <p>Add column</p>
          </Tooltip>
        }
      >
        <button
          className={classNames("control-button", "add-column", {
            disabled: !enableAddColumn,
          })}
          onClick={onAddColumn}
          disabled={!enableAddColumn}
        >
          <ChevronRight />
        </button>
      </Whisper>

      <Whisper
        placement="bottomStart"
        trigger="hover"
        delayOpen={500}
        speaker={
          <Tooltip>
            <p>Add all columns</p>
          </Tooltip>
        }
      >
        <button
          className={classNames("control-button", "add-all", {
            disabled: data.length === 0,
          })}
          onClick={onAddAllColumns}
          disabled={data.length === 0}
        >
          <ChevronRight />
        </button>
      </Whisper>

      <Whisper
        placement="bottomStart"
        trigger="hover"
        delayOpen={500}
        speaker={
          <Tooltip>
            <p>Remove all columns</p>
          </Tooltip>
        }
      >
        <button
          className={classNames("control-button", "remove-all", {
            disabled: selectedData.length === 0,
          })}
          onClick={onRemoveAllColumns}
          disabled={selectedData.length === 0}
        >
          <ChevronLeft />
        </button>
      </Whisper>

      <Whisper
        placement="bottomStart"
        trigger="hover"
        delayOpen={500}
        speaker={
          <Tooltip>
            <p>Remove column</p>
          </Tooltip>
        }
      >
        <button
          className={classNames("control-button", "remove-column", {
            disabled: !enableRemoveColumn,
          })}
          onClick={onRemoveColumn}
          disabled={!enableRemoveColumn}
        >
          <ChevronLeft />
        </button>
      </Whisper>
    </div>
  );
};

// Column Filter List Item
const ColumnFilterListItem: React.FC<{
  item: Column;
  index: number;
  selectedFields: Column[];
  onSelection: (index: number, ctrlKey: boolean, shiftKey: boolean) => void;
  onDoubleClick: (item: Column, id: string) => void;
  id: string;
}> = ({ item, index, selectedFields, onSelection, onDoubleClick, id }) => {
  const selected = selectedFields?.find((field) => field.id === item.id);

  const handleRowSelection = (
    _ctrlKey: boolean,
    _shiftKey: boolean,
    index: number
  ) => {
    onSelection(index, _ctrlKey, _shiftKey);
  };

  return (
    <button
      type="button"
      className={classNames("column-item", {
        selected: !!selected,
      })}
      onClick={(e) => handleRowSelection(e.ctrlKey, e.shiftKey, index)}
      onDoubleClick={() => onDoubleClick(item, id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRowSelection(e.ctrlKey, e.shiftKey, index);
        }
      }}
      style={{
        background: selected ? "#e8f6e8" : "transparent",
        border: "none",
        width: "100%",
        textAlign: "left",
        padding: "8px 12px",
        cursor: "pointer",
        borderBottom: "1px solid #f0f0f0",
        fontWeight: selected ? "500" : "400",
      }}
    >
      {item.name}
    </button>
  );
};

// Column Filter List
const ColumnFilterList: React.FC<{
  dataList: Column[];
  id: string;
  selectedFields: Column[];
  onSelection: (index: number, ctrlKey: boolean, shiftKey: boolean) => void;
  onDoubleClick: (item: Column, id: string) => void;
}> = ({ dataList, id, selectedFields, onSelection, onDoubleClick }) => {
  return (
    <div className="column-list-container">
      <ul className="column-list">
        {dataList.length !== 0 ? (
          <SimpleBar className="column-list-scroll">
            {dataList?.map((item, index) => (
              <ColumnFilterListItem
                key={item.id}
                item={item}
                index={index}
                selectedFields={selectedFields}
                onSelection={onSelection}
                onDoubleClick={onDoubleClick}
                id={id}
              />
            ))}
          </SimpleBar>
        ) : (
          <div className="no-data">NO COLUMNS AVAILABLE</div>
        )}
      </ul>
    </div>
  );
};

// Main Column Filter Component
export const ColumnFilter: React.FC<ColumnFilterProps> = ({
  columns,
  selectedColumns,
  onColumnsChange,
  onClose,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedSearchValue, setSelectedSearchValue] = useState("");
  const [selectedFieldsLeft, setSelectedFieldsLeft] = useState<Column[]>([]);
  const [selectedFieldsRight, setSelectedFieldsRight] = useState<Column[]>([]);
  const [selectedList, setSelectedList] = useState<{
    itemList: Column[];
    source: string;
  }>({
    itemList: [],
    source: "left",
  });

  // Filter columns based on search
  const filteredColumns = columns.filter((col) =>
    col.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const filteredSelectedColumns = selectedColumns.filter((col) =>
    col.name.toLowerCase().includes(selectedSearchValue.toLowerCase())
  );

  // Selection handlers
  const handleSelectionLeft = useCallback(
    (index: number, _ctrlKey: boolean, _shiftKey: boolean) => {
      setSelectedFieldsLeft([filteredColumns[index]]);
      setSelectedList({ itemList: [filteredColumns[index]], source: "left" });
    },
    [filteredColumns]
  );

  const handleSelectionRight = useCallback(
    (index: number, _ctrlKey: boolean, _shiftKey: boolean) => {
      setSelectedFieldsRight([filteredSelectedColumns[index]]);
      setSelectedList({ itemList: [filteredSelectedColumns[index]], source: "right" });
    },
    [filteredSelectedColumns]
  );

  const clearItemSelectionLeft = useCallback(() => {
    setSelectedFieldsLeft([]);
  }, []);

  const clearItemSelectionRight = useCallback(() => {
    setSelectedFieldsRight([]);
  }, []);

  // Column management handlers
  const onAddAllColumns = useCallback(() => {
    onColumnsChange([...columns]);
  }, [columns, onColumnsChange]);

  const onRemoveAllColumns = useCallback(() => {
    onColumnsChange([]);
  }, [onColumnsChange]);

  const onAddColumn = useCallback(() => {
    const newItems = selectedList.itemList.filter(
      (item) => !selectedColumns.some((col) => col.id === item.id)
    );
    onColumnsChange([...selectedColumns, ...newItems]);
    clearItemSelectionLeft();
  }, [selectedList.itemList, selectedColumns, onColumnsChange, clearItemSelectionLeft]);

  const onRemoveColumn = useCallback(() => {
    const removeIds = selectedList.itemList.map((item) => item.id);
    onColumnsChange(
      selectedColumns.filter((col) => !removeIds.includes(col.id))
    );
    clearItemSelectionRight();
  }, [selectedList.itemList, selectedColumns, onColumnsChange, clearItemSelectionRight]);

  const onDoubleClick = useCallback(
    (_item: Column, id: string) => {
      if (id === "left") {
        onAddColumn();
      } else {
        onRemoveColumn();
      }
    },
    [onAddColumn, onRemoveColumn]
  );

  return (
    <div className="column-filter">
      <div className="column-filter-header">
        <h3>Column Filter</h3>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className="column-filter-content">
        <div className="column-section">
          <div className="section-header">
            <span className="section-title">Columns Available</span>
            <div className="search-container">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search columns..."
                className="search-input"
              />
            </div>
          </div>
          <Container className="column-container">
            <Content>
              <ColumnFilterList
                dataList={filteredColumns}
                id="left"
                selectedFields={selectedFieldsLeft}
                onSelection={handleSelectionLeft}
                onDoubleClick={onDoubleClick}
              />
            </Content>
          </Container>
        </div>

        <AddRemoveColumns
          selectedList={selectedList}
          coldata={filteredColumns}
          selectedColData={filteredSelectedColumns}
          data={columns}
          selectedData={selectedColumns}
          onAddAllColumns={onAddAllColumns}
          onRemoveAllColumns={onRemoveAllColumns}
          onAddColumn={onAddColumn}
          onRemoveColumn={onRemoveColumn}
        />

        <div className="column-section">
          <div className="section-header">
            <span className="section-title">Columns Selected</span>
            <span className="column-count">
              {selectedColumns.length < 10
                ? `0${selectedColumns.length}`
                : selectedColumns.length}
            </span>
            <div className="search-container">
              <input
                type="text"
                value={selectedSearchValue}
                onChange={(e) => setSelectedSearchValue(e.target.value)}
                placeholder="Search selected columns..."
                className="search-input"
              />
            </div>
          </div>
          <Container className="column-container">
            <Content>
              <ColumnFilterList
                dataList={filteredSelectedColumns}
                id="right"
                selectedFields={selectedFieldsRight}
                onSelection={handleSelectionRight}
                onDoubleClick={onDoubleClick}
              />
            </Content>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default ColumnFilter;

