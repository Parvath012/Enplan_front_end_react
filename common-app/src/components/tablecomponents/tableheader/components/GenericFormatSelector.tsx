// GenericFormatSelector: A reusable dropdown selector for formatting options (currency, date, etc.)
import React from "react";
import { MenuItem, Select, FormControl } from "@mui/material";
import SelectorIconButton from "./SelectorIconButton";
import { useExpandableSelector } from "./useExpandableSelector";

// Props for GenericFormatSelector
interface GenericFormatSelectorProps {
  expanded: boolean; // Whether the selector is expanded
  onExpand: () => void; // Handler to expand selector
  onRequestExpand?: () => void; // Optional handler to request expand
  config: any; // Config object for tooltip, etc.
  options: any[]; // List of selectable options (with key, label, tooltip)
  selectedValue: string; // Currently selected value
  onChange: (e: any) => void; // Change handler
  icon: React.ReactNode; // Icon to display in the selector button
  renderValuePlaceholder?: string; // Placeholder text for empty selection
}

const GenericFormatSelector: React.FC<GenericFormatSelectorProps> = ({
  expanded,
  onExpand,
  onRequestExpand = () => {},
  config,
  options,
  selectedValue,
  onChange,
  icon,
  renderValuePlaceholder = "Select…",
}) => {
  // Use custom hook for expand/collapse logic and keyboard handling
  const { handleExpand, handleRequestExpand, handleKeyDown } =
    useExpandableSelector(onExpand, onRequestExpand);

  return (
    <div className="font-selector-root">
      {/* Selector icon button with tooltip and expand/collapse logic */}
      <SelectorIconButton
        tooltip={config.tooltip}
        expanded={expanded}
        className={`color-selector-btn${expanded ? " expanded" : ""}`}
        icon={icon}
        onClick={expanded ? handleExpand : handleRequestExpand}
        onKeyDown={handleKeyDown(expanded ? handleExpand : handleRequestExpand)}
      />
      {/* Divider between icon and dropdown */}
      {expanded && <div className="font-selector-divider" />}
      {/* Dropdown select for options, only shown when expanded */}
      {expanded && (
        <div>
          <FormControl
            variant="outlined"
            size="small"
            sx={{
              height: 22,
              minWidth: 120,
              maxWidth: 180,
              borderRadius: "6px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
                padding: 0,
                backgroundColor: "transparent",
                borderColor: "transparent",
                height: 22,
                fontSize: 10,
              },
            }}
          >
            <Select
              value={selectedValue}
              displayEmpty
              onChange={onChange}
              renderValue={(selected) => {
                // Show placeholder if nothing is selected
                if (!selected) {
                  return (
                    <span className="mui-shared-select-placeholder">
                      {renderValuePlaceholder}
                    </span>
                  );
                }
                // Find the selected option and show its label
                const found = options.find((o) => o.key === selected);
                return found ? found.label : selected;
              }}
              variant="outlined"
              className="mui-shared-select"
            >
              {/* Placeholder menu item (disabled) if nothing is selected */}
              {!selectedValue && (
                <MenuItem
                  value=""
                  disabled
                  className="mui-shared-select-placeholder"
                >
                  {renderValuePlaceholder}
                </MenuItem>
              )}
              {/* Render all options as menu items */}
              {options.map((option) => (
                <MenuItem
                  key={option.key}
                  value={option.key}
                  title={option.tooltip}
                  sx={{
                    fontSize: 10,
                    minHeight: 24,
                    height: 24,
                    paddingY: 0,
                    paddingX: 1.5,
                    lineHeight: 1.2,
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      )}
    </div>
  );
};

export default GenericFormatSelector;
