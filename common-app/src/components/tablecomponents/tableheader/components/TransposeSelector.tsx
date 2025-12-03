import React, { useState } from "react";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";
import SelectorIconButton from "./SelectorIconButton";
import { useExpandableSelector } from "./useExpandableSelector";

interface Props {
  expanded: boolean;
  onExpand: () => void;
  onRequestExpand?: () => void;
}

const TransposeSelector: React.FC<Props> = ({
  expanded,
  onExpand,
  onRequestExpand = () => {},
}) => {
  // Get transpose config from tableHeaderConfig
  const config = tableHeaderConfig.transpose;
  // State for currently active option
  const [active, setActive] = useState<string | null>(null);
  // Use shared expand/collapse logic
  const { handleExpand, handleRequestExpand, handleKeyDown } =
    useExpandableSelector(onExpand, onRequestExpand);

  // Handle button click to set active option
  const handleButtonClick = (key: string) => {
    setActive((prev) => (prev === key ? null : key));
  };

  return (
    <div className="transpose-selector-root">
      {/* Main transpose icon button */}
      <SelectorIconButton
        tooltip={config.tooltip}
        expanded={expanded}
        className={`transpose-selector-btn${expanded ? " expanded" : ""}`}
        icon={
          config.icon &&
          (expanded
            ? (config.icon as { selected: React.ReactNode }).selected
            : (config.icon as { default: React.ReactNode }).default)
        }
        onClick={expanded ? handleExpand : handleRequestExpand}
        onKeyDown={handleKeyDown(expanded ? handleExpand : handleRequestExpand)}
      />
      {/* Divider when expanded */}
      {expanded && <div className="transpose-selector-divider" />}
      {/* Show transpose options when expanded */}
      {expanded && (
        <div className="transpose-selector-options">
          {config.expanded.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`format-menu-btn${
                active === option.key ? " active" : ""
              }`}
              onClick={() => handleButtonClick(option.key)}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransposeSelector;
