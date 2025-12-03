import React, { useState } from "react";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";
import SelectorIconButton from "./SelectorIconButton";
import { useExpandableSelector } from "./useExpandableSelector";

interface Props {
  expanded: boolean;
  onExpand: () => void;
  onRequestExpand?: () => void;
}

const FormatMenu: React.FC<Props> = ({
  expanded,
  onExpand,
  onRequestExpand = () => {},
}) => {
  // Get format menu config from tableHeaderConfig
  const config = tableHeaderConfig.formatMenu;
  const [active, setActive] = useState<string | null>(null);

  // Use shared expand/collapse logic
  const { handleExpand, handleRequestExpand, handleKeyDown } =
    useExpandableSelector(onExpand, onRequestExpand);

  return (
    <div className="format-menu-root">
      {/* Main format menu icon button */}
      <SelectorIconButton
        tooltip={config.tooltip}
        expanded={expanded}
        className={`format-menu-icon${expanded ? " expanded" : ""}`}
        icon={expanded ? config.icon.selected : config.icon.default}
        onClick={expanded ? handleExpand : handleRequestExpand}
        onKeyDown={handleKeyDown(expanded ? handleExpand : handleRequestExpand)}
      />
      {/* Divider when expanded */}
      {expanded && <div className="format-menu-divider" />}
      {/* Show format options when expanded */}
      {expanded && (
        <div className="format-menu-options">
          {config.expanded.map((option) => (
            <React.Fragment key={option.key}>
              <button
                type="button"
                className={`format-menu-btn${
                  active === option.label ? " active" : ""
                }`}
                onClick={() =>
                  setActive(active === option.label ? null : option.label)
                }
              >
                <span>{option.label}</span>
              </button>
              {/* Divider after certain options */}
              {(option.key === "topbottom" || option.key === "colorscales") && (
                <div className="format-menu-divider" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormatMenu;
