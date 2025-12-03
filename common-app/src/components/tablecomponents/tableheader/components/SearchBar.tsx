import React, { useRef, useState, useEffect } from "react";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";
import CustomTooltip from "../../../common/CustomTooltip";

const SearchBar: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [justExpanded, setJustExpanded] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const expandTimeout = useRef<NodeJS.Timeout | null>(null);

  // Focus input when expanded
  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  // Handle expand/collapse and suppress tooltip on expand
  const handleExpand = () => {
    setExpanded((prev) => {
      const next = !prev;
      if (next) {
        setJustExpanded(true);
        if (expandTimeout.current) clearTimeout(expandTimeout.current);
        expandTimeout.current = setTimeout(() => setJustExpanded(false), 400);
      }
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (expandTimeout.current) clearTimeout(expandTimeout.current);
    };
  }, []);

  // Extracted input+icon JSX to avoid duplication
  const inputWithIcon = (
    <span className="search-bar-input-wrapper">
      {/* Search icon (left) */}
      {React.isValidElement(tableHeaderConfig.searchBar.searchIcon) &&
        React.cloneElement(
          tableHeaderConfig.searchBar.searchIcon as React.ReactElement<any>,
          {
            className: "icon-12",
            style: {
              color: "#8d99ae",
              marginRight: 6,
              opacity: expanded ? 1 : 0,
              transition: "opacity 0.2s",
              pointerEvents: "none",
            },
          }
        )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search data"
        className={`search-bar-input${expanded ? "" : " collapsed"}`}
      />
    </span>
  );

  return (
    <div className="search-bar-root">
      {/* Connected left-side dropdown, only when expanded */}
      {expanded && (
        <CustomTooltip title={tableHeaderConfig.searchBar.tooltip}>
          <button
            type="button"
            className="search-bar-dropdown"
            onClick={() => alert("Dropdown clicked")}
            aria-label="Open search dropdown"
            tabIndex={0}
          >
            {tableHeaderConfig.searchBar.icon}
          </button>
        </CustomTooltip>
      )}

      {/* Animated Search Bar */}
      <div className={`search-bar-animated${expanded ? "" : " collapsed"}`}>
        {!justExpanded ? (
          <CustomTooltip title={tableHeaderConfig.searchBar.label}>
            {inputWithIcon}
          </CustomTooltip>
        ) : (
          inputWithIcon
        )}
      </div>

      {/* Divider between search bar and search icon, only when expanded */}
      {expanded && <div className="search-bar-divider" />}

      {/* Right-side Search Icon (always visible, toggles expand/collapse, large) */}
      <CustomTooltip title={tableHeaderConfig.searchBar.label}>
        <span>
          {React.isValidElement(tableHeaderConfig.searchBar.searchIcon) &&
            React.cloneElement(
              tableHeaderConfig.searchBar.searchIcon as React.ReactElement<any>,
              {
                className: `search-bar-icon${expanded ? " expanded" : ""}`,
                onClick: handleExpand,
              }
            )}
        </span>
      </CustomTooltip>
    </div>
  );
};

export default SearchBar;
