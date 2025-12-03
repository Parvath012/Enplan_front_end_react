import React, { useState, useEffect, useCallback } from "react";
import {
  CaretDown,
  DataTable,
  Column,
  Row,
  Search as SearchIcon,
} from "@carbon/icons-react";
import classNames from "classnames";

// Import our custom components
import { QueryAutoComplete } from "./QueryAutoComplete";
import { FilterOptions } from "./FilterOptions";
import { ClearButton } from "./ClearButton";

// Import styles
import "./AdvancedSearchComponent.scss";

// Types
export interface SearchColumn {
  id: string;
  name: string;
  type: "string" | "numerical" | "date";
}

export interface SearchRow {
  [key: string]: any;
}

type SearchModeType = "Data" | "Columns" | "Rows";

export interface SearchMode {
  key: "Default" | "Data" | "Columns" | "Rows";
  title: string;
  icon: React.ReactNode;
  hide?: boolean;
  topBorder?: boolean;
  hideCheckbox?: boolean;
}

export interface AdvancedSearchProps {
  columns: SearchColumn[];
  data: SearchRow[];
  onSearchResults?: (filteredData: SearchRow[], filteredColumns: SearchColumn[]) => void;
  onSearchModeChange?: (mode: string) => void;
  placeholder?: string;
  className?: string;
  showTable?: boolean;
  enableColumnFilter?: boolean;
  enableRowFilter?: boolean;
  // New props for controlling search modes and filter
  searchModes?: SearchModeType[];
  showFilter?: boolean;
  defaultSearchMode?: SearchModeType;
  // Search bar dimensions
  searchBarWidth?: string;
  searchBarHeight?: string;
}

// Search Mode Dropdown Component
const SearchModeDropdown: React.FC<{
  selectedValue: string;
  onChange: (key: string) => void;
  modes: SearchMode[];
}> = ({ selectedValue, onChange, modes }) => {
  const [open, setOpen] = useState(false);

  const getIcon = (mode: string) => {
    const modeObj = modes.find(m => m.key === mode);
    return modeObj?.icon ?? <SearchIcon />;
  };

  const getTooltip = (mode: string) => {
    const modeObj = modes.find(m => m.key === mode);
    return modeObj?.title ?? "Search";
  };

  const handleSelect = (key: string) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <div className="search-mode-wrapper">
      <button
        type="button"
        className={classNames("search-mode-button", {
          "default-mode": selectedValue === "Default",
        })}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        style={{
          cursor: "pointer",
          background: "none",
          border: "none",
          padding: 0,
          display: "flex",
          alignItems: "center",
        }}
        title={getTooltip(selectedValue)}
      >
        {getIcon(selectedValue)}
        {selectedValue === "Default" && (
          <span className="default-label" style={{ margin: "0 4px" }}>
            Search
          </span>
        )}
        <CaretDown />
      </button>
      {open && (
        <div
          className="search-mode-dropdown"
          style={{
            position: "absolute",
            background: "#fff",
            border: "1px solid #e5e5ea",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            zIndex: 10,
            minWidth: "220px",
            padding: "8px 0",
            top: "46%",
            left: 0,
            marginTop: "4px",
          }}
        >
          {modes.map((item) =>
            item.hide ? null : (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelect(item.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(item.key);
                  }
                }}
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  cursor: item.key === selectedValue ? "default" : "pointer",
                  borderTop: item.topBorder ? "1px solid #e5e5ea" : undefined,
                  background: item.key === selectedValue ? "#f5f7fa" : "transparent",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  opacity: item.key === selectedValue ? 0.6 : 1,
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#222",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#e8f6e8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    item.key === selectedValue ? "#f5f7fa" : "transparent")
                }
              >
                {item.icon}
                <span style={{ marginLeft: 12 }}>{item.title}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};


// Data Table View Component
const DataTableView: React.FC<{
  columns: SearchColumn[];
  data: SearchRow[];
}> = ({ columns, data }) => (
  <div className="data-table-container">
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.id}>{col.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={`row-${idx}-${row.id || idx}`}>
            {columns.map((col) => (
              <td key={`${col.id}-${idx}`}>{row[col.id]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Main Advanced Search Component
export const AdvancedSearchComponent: React.FC<AdvancedSearchProps> = ({
  columns,
  data,
  onSearchResults,
  onSearchModeChange,
  placeholder,
  className,
  showTable = true,
  enableColumnFilter = true,
  enableRowFilter = true,
  searchModes = ["Data", "Columns", "Rows"],
  showFilter = true,
  defaultSearchMode = "Data",
  searchBarWidth = "170px",
  searchBarHeight = "12px",
}) => {
  const [searchMode, setSearchMode] = useState<"Default" | "Data" | "Columns" | "Rows">(defaultSearchMode);
  const [searchValue, setSearchValue] = useState("");
  const [filteredColumns, setFilteredColumns] = useState<SearchColumn[]>(columns);
  const [filteredData, setFilteredData] = useState<SearchRow[]>(data);
  const [parsedQuery, setParsedQuery] = useState<any[]>([]);
  const [queryValue, setQueryValue] = useState("");

  // Search modes configuration based on props
  const availableSearchModes: SearchMode[] = [
    {
      key: "Data",
      title: "Search Data",
      icon: <DataTable />,
    },
    {
      key: "Columns",
      title: "Search Columns",
      icon: <Column />,
    },
    {
      key: "Rows",
      title: "Search Rows",
      icon: <Row />,
    },
  ];

  // Filter modes based on searchModes prop
  const filteredSearchModes = availableSearchModes.filter(mode => 
    searchModes.includes(mode.key as "Data" | "Columns" | "Rows")
  );

  // Helper functions for query parsing
  const isLogicalOperator = useCallback((item: any) => {
    return typeof item === "object" && 
           item?.type && 
           (item.type === "and" || item.type === "or");
  }, []);

  const findColumnByName = useCallback((name: string) => {
    const cleanName = name.replace(/"/g, "").toLowerCase();
    return columns.find(
      (col) =>
        col.name.toLowerCase() === cleanName ||
        col.id.toLowerCase() === cleanName
    );
  }, [columns]);

  const processObjectFormat = useCallback((queryArr: any[], i: number, result: any[]) => {
    const colObj = findColumnByName(queryArr[i]);
    if (colObj) {
      result.push({
        column_hash: colObj.id,
        operator: queryArr[i + 1].operator,
        value: queryArr[i + 1].value ?? "",
      });
    }
    return i + 2;
  }, [findColumnByName]);

  const processStringFormat = useCallback((queryArr: any[], i: number, result: any[]) => {
    const colObj = findColumnByName(queryArr[i]);
    if (colObj) {
      result.push({
        column_hash: colObj.id,
        operator: queryArr[i + 1],
        value: queryArr[i + 2].replace(/"/g, ""),
      });
    }
    return i + 3;
  }, [findColumnByName]);

  // Parse query array for row filtering
  const parseQueryArray = useCallback((queryArr: any[]) => {
    const result: { column_hash: string; operator: string; value: any }[] = [];
    let i = 0;
    
    while (i < queryArr.length) {
      if (isLogicalOperator(queryArr[i])) {
        i++;
        continue;
      }

      // Handle object format: [columnName, {operator, value}]
      if (
        typeof queryArr[i] === "string" &&
        typeof queryArr[i + 1] === "object" &&
        queryArr[i + 1]?.operator &&
        "value" in queryArr[i + 1]
      ) {
        i = processObjectFormat(queryArr, i, result);
        continue;
      }

      // Handle string format: [columnName, operator, value]
      if (
        typeof queryArr[i] === "string" &&
        typeof queryArr[i + 1] === "string" &&
        typeof queryArr[i + 2] === "string"
      ) {
        i = processStringFormat(queryArr, i, result);
        continue;
      }

      i++;
    }
    return result;
  }, [isLogicalOperator, processObjectFormat, processStringFormat]);

  // Helper function to evaluate query conditions
  const evaluateQueryCondition = useCallback((rowObj: Record<string, any>, column_hash: string, operator: string, value: any) => {
    const column = columns.find((col) => col.id === column_hash);
    if (!column) return false;
    
    let cellValue = rowObj[column_hash];
    let queryValue = value;

    if (column.type === "numerical") {
      cellValue = Number(cellValue);
      queryValue = Number(queryValue);
    }

    switch (operator) {
      case "=":
      case "eq":
      case "is":
        return cellValue === queryValue;
      case "!=":
      case "neq":
      case "isn":
        return cellValue !== queryValue;
      case ">":
      case "gt":
        return cellValue > queryValue;
      case "<":
      case "lt":
        return cellValue < queryValue;
      case ">=":
      case "ge":
        return cellValue >= queryValue;
      case "<=":
      case "le":
        return cellValue <= queryValue;
      case "contains":
        return cellValue?.toString().toLowerCase().includes(queryValue?.toString().toLowerCase());
      case "not contains":
        return !cellValue?.toString().toLowerCase().includes(queryValue?.toString().toLowerCase());
      default:
        return false;
    }
  }, [columns]);

  // Filter rows by query
  const filterRowsByQuery = useCallback((rows: SearchRow[], query: any[]) => {
    if (!query || query.length === 0) return rows;
    
    const parsed = Array.isArray(query) && query.length > 0 && query[0].column_hash
      ? query
      : parseQueryArray(query);

    return rows.filter((row) => {
      const rowObj: Record<string, any> = {};
      columns.forEach((col) => {
        rowObj[col.id] = row[col.id];
      });
      
      return parsed.every(({ column_hash, operator, value }) => {
        return evaluateQueryCondition(rowObj, column_hash, operator, value);
      });
    });
  }, [columns, parseQueryArray]);

  // Helper functions for query parsing callbacks
  const handleParseSuccess = useCallback((parsedString: any) => {
    setParsedQuery(parsedString || []);
  }, []);

  const handleParseError = useCallback(() => {
    setParsedQuery([]);
  }, []);

  // Separate callbacks for parse results
  const handleParseSuccessCallback = useCallback((parsedString: any) => {
    handleParseSuccess(parsedString);
  }, [handleParseSuccess]);

  const handleParseErrorCallback = useCallback(() => {
    handleParseError();
  }, [handleParseError]);

  // Filter data based on search mode and value
  const filterData = useCallback(() => {
    let newColumns = [...filteredColumns]; // Use current filtered columns as base
    let newData = [...data];

    switch (searchMode) {
      case "Data":
        newData = data.filter((row) =>
          Object.values(row).some((cell) =>
            cell?.toString().toLowerCase().includes(searchValue.toLowerCase())
          )
        );
        break;
      case "Columns":
        if (searchValue) {
          try {
            const regex = new RegExp(searchValue, "i");
            newColumns = filteredColumns.filter((col) => regex.test(col.name));
          } catch {
            // Invalid regex, show all filtered columns
            newColumns = filteredColumns;
          }
        }
        break;
      case "Rows":
        if (queryValue) {
          newData = filterRowsByQuery(data, parsedQuery);
        } else {
          newData = data;
        }
        break;
      default:
        break;
    }

    setFilteredColumns(newColumns);
    setFilteredData(newData);
    
    if (onSearchResults) {
      onSearchResults(newData, newColumns);
    }
  }, [searchMode, searchValue, queryValue, parsedQuery, columns, data, onSearchResults, filterRowsByQuery, filteredColumns]);


  // Handle search mode change
  const handleSearchModeChange = (mode: string) => {
    setSearchMode(mode as any);
    setSearchValue("");
    if (onSearchModeChange) {
      onSearchModeChange(mode);
    }
  };

  // Handle search value change
  const handleSearchValueChange = (value: string) => {
    setSearchValue(value);
  };

  // Trigger filtering when search value changes
  useEffect(() => {
    filterData();
  }, [searchValue, queryValue, parsedQuery]);


  return (
    <div className={classNames("advanced-search-component", className)}>
      <div className="search-controls" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {filteredSearchModes.length > 1 && (
          <SearchModeDropdown
            selectedValue={searchMode}
            onChange={handleSearchModeChange}
            modes={filteredSearchModes}
          />
        )}
        
        <div
          className="search-input-container"
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f5f7fa",
            borderRadius: "8px",
            border: "1px solid #e5e5ea",
            padding: "6px 12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            width: searchBarWidth,
            height: searchBarHeight,
            }}
          >
            <SearchIcon style={{ marginRight: 8, color: "#7d7d7d" }} />
            {searchMode === "Rows" ? (
              <div style={{ flex: 1, position: "relative" }}>
                <QueryAutoComplete
                  columns={columns}
                  onChange={(value) => {
                    setQueryValue(value);
                    if (!value) {
                      setFilteredColumns(columns);
                      setFilteredData(data);
                      setParsedQuery([]);
                    }
                  }}
                  onParseSuccess={handleParseSuccessCallback}
                  onParseError={handleParseErrorCallback}
                  popOverStyle={{
                    width: 200,
                    top: 0,
                    left: "0px",
                    padding: 0,
                  }}
                  onClose={() => setQueryValue("")}
                  onError={() => {}}
                  name="querySearch"
                  clear={queryValue === ""}
                  disableAddToFilter={false}
                />
              </div>
            ) : (
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearchValueChange(e.target.value)}
                  placeholder={
                    searchMode === "Columns" 
                      ? "Search Columns" 
                      : "Search Data"
                  }
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "16px",
                    color: "#222",
                    paddingRight: searchValue ? "30px" : "0",
                  }}
                />
                <ClearButton 
                  onClick={() => handleSearchValueChange("")} 
                  visible={!!searchValue} 
                />
              </div>
            )}
          </div>
          
        {showFilter && (enableColumnFilter || enableRowFilter) && (
          <FilterOptions
            columns={columns}
            selectedColumns={filteredColumns}
            onColumnsChange={(newColumns) => {
              // If no columns selected, show all columns
              if (newColumns.length === 0) {
                setFilteredColumns(columns);
              } else {
                // Show only selected columns
                setFilteredColumns(newColumns);
              }
              // Trigger data filtering with new columns
              setTimeout(() => filterData(), 0);
            }}
            onClose={() => {}}
            enableColumnFilter={enableColumnFilter}
            enableRowFilter={enableRowFilter}
          />
        )}
      </div>

      {showTable && (
        <DataTableView
          columns={filteredColumns}
          data={filteredData}
        />
      )}

    </div>
  );
};

export default AdvancedSearchComponent;
