import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Whisper, Dropdown, Popover } from "rsuite";
import classNames from "classnames";

// Import the debounce hook
import { useDebounce } from "../../hooks/useDebounce";
import { ClearButton } from "./ClearButton";

// Types
export interface Column {
  id: string;
  name: string;
  type: "string" | "numerical" | "date";
}

export interface Operator {
  name: string;
  type: string;
  icon?: React.ReactNode;
}

export interface QueryAutoCompleteProps {
  columns: Column[];
  onChange: (value: string, query: any[]) => void;
  onParseOK?: (valid: boolean, parsedString: any[]) => void;
  onParseSuccess?: (parsedString: any[]) => void;
  onParseError?: () => void;
  onClose?: () => void;
  onError?: (error: string) => void;
  name?: string;
  clear?: boolean;
  disableAddToFilter?: boolean;
  popOverStyle?: React.CSSProperties;
  leaderboardSearch?: boolean;
}

// Utility functions (simplified versions from original)
const numericalOp: Operator[] = [
  { name: "=", type: "equals" },
  { name: "!=", type: "not_equals" },
  { name: ">", type: "greater_than" },
  { name: "<", type: "less_than" },
  { name: ">=", type: "greater_equal" },
  { name: "<=", type: "less_equal" },
  { name: "between", type: "between" },
];

const categoricalOp: Operator[] = [
  { name: "=", type: "equals" },
  { name: "!=", type: "not_equals" },
  { name: "contains", type: "contains" },
  { name: "not contains", type: "not_contains" },
];

const logicalOp: Operator[] = [
  { name: "and", type: "and" },
  { name: "or", type: "or" },
];

const isColumn = (data: any[], columns: Column[]) => {
  return data.some(item => columns.some(col => 
    col.name.toLowerCase() === item.name?.toLowerCase() || 
    col.id.toLowerCase() === item.id?.toLowerCase()
  ));
};

const isOperator = (data: any[]) => {
  return data.some(item => 
    [...numericalOp, ...categoricalOp].some(op => op.name === item.name)
  );
};

const isLogicalOperator = (data: any[]) => {
  return data.some(item => logicalOp.some(op => op.name === item.name));
};

const findColumnType = (columns: Column[], columnName: string) => {
  const column = columns.find(col => 
    col.name.toLowerCase() === columnName.toLowerCase() || 
    col.id.toLowerCase() === columnName.toLowerCase()
  );
  return column?.type ?? "string";
};


const containsOperator = (operator: string, columnType: string) => {
  const operators = columnType === "numerical" ? numericalOp : categoricalOp;
  return operators.some(op => op.name === operator);
};

  const convertStringtoArray = (value: string) => {
    let i = 0;
    let openingQuote = '';
    const arr: string[] = [''];
    let j = 0;
    const regex = '\\s+(?=((\\\\[\\\\"]|[^\\\\"])*"(\\\\[\\\\"]|[^\\\\"])*")*(\\\\[\\\\"]|[^\\\\"])*$)';
    const queryString = value.replaceAll(regex, ' ').trim();
    
    while (i < queryString.length) {
      if (["'", '"'].includes(queryString.charAt(i)) && openingQuote === '') {
        openingQuote = queryString.charAt(i);
        arr[j] = `${arr[j]}${queryString.charAt(i)}`;
      } else if (openingQuote === queryString.charAt(i)) {
        openingQuote = '';
        arr[j] = `${arr[j]}${queryString.charAt(i)}`;
      } else if (queryString.charAt(i) === ' ' && openingQuote === '') {
        j = j + 1;
        arr[j] = '';
      } else {
        arr[j] = `${arr[j]}${queryString.charAt(i)}`;
      }
      i++;
    }

    const resultArray: string[] = [];
    arr
      .filter(item => item !== '')
      .forEach((item: string) => {
        resultArray.push(item);
        if (
          (resultArray.length + 2) % 6 === 5 &&
          resultArray[resultArray.length - 2].toLowerCase() !== 'between'
        ) {
          resultArray.push('');
          resultArray.push('');
        }
        if ((resultArray.length - 1) % 6 == 0) {
          resultArray[resultArray.length - 1] = resultArray[resultArray.length - 1].replace(
            /^(["']|["'])$/g,
            '',
          );
        }
      });

    return resultArray;
  };

const checkSyntax = (query: string[], columns: Column[], onError?: (error: string) => void) => {
  try {
    if (query.length === 0) return true;
    
    // Check if query follows the pattern: column operator value [logical_operator column operator value ...]
    for (let i = 0; i < query.length; i += 3) {
      if (i + 2 >= query.length) break;
      
      const columnName = query[i];
      const operator = query[i + 1];
      const value = query[i + 2];
      
      // Check if column exists
      const column = columns.find(col => 
        col.name.toLowerCase() === columnName.toLowerCase() || 
        col.id.toLowerCase() === columnName.toLowerCase()
      );
      
      if (!column) {
        onError?.(`Column "${columnName}" not found`);
        return false;
      }
      
      // Check if operator is valid for this column type
      if (!containsOperator(operator, column.type)) {
        onError?.(`Invalid operator "${operator}" for column type "${column.type}"`);
        return false;
      }
      
      // Check if value is valid
      if (!value || value.trim() === '') {
        onError?.(`Value cannot be empty`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    onError?.(error as string);
    return false;
  }
};

const convertArrayToJSON = (query: string[], columns: Column[]) => {
  const result: any[] = [];
  
  for (let i = 0; i < query.length; i += 3) {
    if (i + 2 >= query.length) break;
    
    const columnName = query[i];
    const operator = query[i + 1];
    const value = query[i + 2];
    
    const column = columns.find(col => 
      col.name.toLowerCase() === columnName.toLowerCase() || 
      col.id.toLowerCase() === columnName.toLowerCase()
    );
    
    if (column) {
      result.push(columnName);
      result.push({
        operator: operator,
        value: value
      });
    }
  }
  
  return result;
};

// Dropdown List Component
const RenderList = React.forwardRef<HTMLDivElement, {
  filteredData: any[];
  handleDropdownSelect: (item: any) => void;
  activeItem: number;
  popOverStyle: React.CSSProperties;
  className?: string;
}>(({ filteredData, handleDropdownSelect, activeItem, popOverStyle, className }, ref) => {
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeItem]);

  return (
    <Popover ref={ref} style={popOverStyle} className={className}>
      <div className="query-autocomplete-dropdown">
        <Dropdown.Menu>
          {filteredData.map((item: any, index: number) => (
            <Dropdown.Item
              key={`${item.name}-${index}`}
              onClick={() => handleDropdownSelect(item)}
              className={classNames("dropdown-item", {
                active: index === activeItem
              })}
            >
              {item.icon && <span className="item-icon">{item.icon}</span>}
              <span className="item-name">{item.name}</span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </div>
    </Popover>
  );
});

RenderList.displayName = "RenderList";

// Main Query AutoComplete Component
export const QueryAutoComplete: React.FC<QueryAutoCompleteProps> = React.forwardRef<
  any,
  QueryAutoCompleteProps
>(({
  columns,
  onChange,
  onParseOK,
  onParseSuccess,
  onParseError,
  onClose,
  onError,
  name = "querySearch",
  clear = false,
  disableAddToFilter = false,
  popOverStyle = { width: 200, top: 0, left: "0px", padding: 0 },
  leaderboardSearch = false,
}, ref) => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [value, setValue] = useState<string>("");
  const [colNameStartPosition, setColNameStartPosition] = useState<number>(-1);
  const [inputCursorPosition, setInputCursorPosition] = useState<number>(0);
  const [activeItem, setActiveItem] = useState<number>(0);
  const [focus, setFocus] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"columns" | "operator" | "logicalOperator" | "none">("columns");

  // Debounced value for syntax checking
  const debouncedValue = useDebounce<string>(value.trim(), 1000);

  // Update columns when they change
  useEffect(() => {
    if (activeDropdown === "columns") {
      const sortedColumns = [...columns].sort((a, b) => a.name.localeCompare(b.name));
      setData([...sortedColumns]);
      setFilteredData([...sortedColumns]);
    }
  }, [columns, activeDropdown]);

  // Clear state when clear prop changes
  useEffect(() => {
    if (clear) {
      updateQuery("");
    }
  }, [clear]);

  // Syntax checking with debounced value
  useEffect(() => {
    if (value !== "") {
      const query = convertStringtoArray(value);
      const parsedOk = checkSyntax(query, columns, onError);

      if (parsedOk) {
        if (onParseSuccess) {
          onParseSuccess(convertArrayToJSON(query, columns));
        } else if (onParseOK) {
          onParseOK(parsedOk, convertArrayToJSON(query, columns));
        }
      } else if (onParseError) {
        onParseError();
      } else if (onParseOK) {
        onParseOK(parsedOk, []);
      }
    }
  }, [debouncedValue, columns, onError, disableAddToFilter, leaderboardSearch, onParseOK]);

  // Set focus back to input field
  useEffect(() => {
    if (focus) {
      const inputElement = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        setFocus(false);
      }
    }
  }, [focus, name]);

  // Calculate popover position
  const pop = useMemo(() => ({
    ...popOverStyle,
    left: inputCursorPosition < 52
      ? `calc(${popOverStyle.left} + ${inputCursorPosition * 6}px)`
      : `calc(${popOverStyle.left} + ${52 * 6}px)`,
  }), [inputCursorPosition, popOverStyle]);

  // Utility functions
  const openDropdown = useCallback((open = true) => {
    if (ref && typeof ref === 'object' && ref.current) {
      open ? ref.current.open() : ref.current.close();
    }
    if (value.length === 0) {
      setColNameStartPosition(1);
    }
  }, [ref, value.length]);

  const setDropdownValues = useCallback((items: any, open: boolean, dropdown: typeof activeDropdown) => {
    setData([...items]);
    setFilteredData([...items]);
    openDropdown(open);
    setActiveDropdown(dropdown);
  }, [openDropdown]);

  const handleDropdown = useCallback((dropdown?: string, type?: string, position?: number) => {
    setActiveItem(0);
    if (dropdown === "columns") {
      setDropdownValues(columns, true, "columns");
      if (position) setColNameStartPosition(position);
    } else if (dropdown === "operator") {
      const operators = type && type === "numerical" ? numericalOp : categoricalOp;
      setDropdownValues(operators, true, "operator");
    } else if (dropdown === "clear") {
      setDropdownValues([], false, "none");
    } else if (dropdown === "logicalOperator") {
      setDropdownValues(logicalOp, true, "logicalOperator");
    }
  }, [columns, setDropdownValues, value]);

  const clearQueryStates = useCallback(() => {
    setInputCursorPosition(0);
    handleDropdown("columns", "", 1);
    openDropdown(false);
  }, [handleDropdown, openDropdown]);

  const updateQuery = useCallback((updatedValue: string) => {
    setValue(updatedValue);
    onChange?.(updatedValue, convertStringtoArray(value));
    if (value.length !== 0 && updatedValue === "") {
      onClose?.();
      clearQueryStates();
    }
  }, [onChange, value, onClose, clearQueryStates]);

  // Event handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputCursorPosition(e.target.selectionStart ?? 0);
    updateQuery(e.target.value);
    
    if (isColumn(data, columns)) {
      const filtereditem = data?.filter((it) =>
        it.name
          .toLowerCase()
          .includes(
            `${e.target.value.substring(
              colNameStartPosition,
              e.target.selectionStart ?? 0
            )}`.toLowerCase()
          )
      );
      setFilteredData([...filtereditem]);
      openDropdown(filtereditem.length !== 0);
    } else {
      setFilteredData([...data]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveItem(activeItem > 0 ? activeItem - 1 : filteredData.length - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveItem(activeItem < filteredData.length - 1 ? activeItem + 1 : 0);
    } else if (e.key === "Enter" && filteredData.length > 0) {
      handleDropdownSelect(filteredData[activeItem]);
    }
  };

  const handleDropdownSelect = useCallback((event: any) => {
    if (event?.name) {
      setFocus(true);
      
      // Simple implementation - in real version would handle complex query building
      let updatedQuery = value + (value ? " " : "") + event.name;
      
      // If selecting an operator, add a space after it for the value
      if (isOperator(data)) {
        updatedQuery += " ";
      }
      
      updateQuery(updatedQuery);
      setInputCursorPosition(updatedQuery.length);
      
      if (isColumn(data, columns)) {
        handleDropdown("operator", findColumnType(columns, event.name));
      } else if (isOperator(data)) {
        handleDropdown("clear");
      } else if (isLogicalOperator(data)) {
        handleDropdown("columns", "", updatedQuery.length);
      }
    }
  }, [data, handleDropdown, columns, updateQuery, value]);

  return (
    <div className="query-autocomplete-wrapper">
      <Whisper
        placement="bottomStart"
        trigger="focus"
        speaker={
          <RenderList
            className="query-autocomplete-dropdown"
            filteredData={[...filteredData]}
            handleDropdownSelect={handleDropdownSelect}
            activeItem={activeItem}
            popOverStyle={pop}
          />
        }
        ref={ref}
        onOpen={() => {}}
        onClose={() => {}}
      >
        <div className="query-search-input" style={{ width: "100%", position: "relative" }}>
          <input
            type="text"
            name={name}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search Rows"
            className="query-input"
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "16px",
              color: "#222",
              paddingRight: value ? "30px" : "0",
            }}
            spellCheck={false}
            maxLength={1000}
          />
          <ClearButton 
            onClick={() => updateQuery("")} 
            visible={!!value} 
          />
        </div>
      </Whisper>
    </div>
  );
});

QueryAutoComplete.displayName = "QueryAutoComplete";

export default QueryAutoComplete;

