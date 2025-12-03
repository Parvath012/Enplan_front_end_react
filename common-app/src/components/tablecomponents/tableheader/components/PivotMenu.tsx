import React, { useState } from "react";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";
import CustomTooltip from "../../../common/CustomTooltip";
import SelectorIconButton from "./SelectorIconButton";
import { useExpandableSelector } from "./useExpandableSelector";

interface Props {
  expanded: boolean;
  onExpand: () => void;
  onRequestExpand?: () => void;
}

const PivotMenu: React.FC<Props> = ({
  expanded,
  onExpand,
  onRequestExpand = () => {},
}) => {
  // Get pivot menu config from tableHeaderConfig
  const config = tableHeaderConfig.pivotMenu;
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [fieldListActive, setFieldListActive] = useState<boolean>(false);

  // Use shared expand/collapse logic
  const { handleExpand, handleRequestExpand, handleKeyDown } =
    useExpandableSelector(onExpand, onRequestExpand);

  // Handle button click for group or field list
  const handleButtonClick = (key: string) => {
    if (key === "fieldList") {
      setFieldListActive((prev) => !prev);
    } else {
      setActiveGroup((prev) => (prev === key ? null : key));
    }
  };

  return (
    <div className="pivot-menu-root">
      {/* Main pivot menu icon button */}
      <SelectorIconButton
        tooltip={config.tooltip}
        expanded={expanded}
        className={`pivot-menu-btn${expanded ? " expanded" : ""}`}
        icon={expanded ? config.icon.selected : config.icon.default}
        onClick={expanded ? handleExpand : handleRequestExpand}
        onKeyDown={handleKeyDown(expanded ? handleExpand : handleRequestExpand)}
      />
      {/* Divider when expanded */}
      {expanded && <div className="pivot-menu-divider" />}
      {/* Show pivot options when expanded */}
      {expanded && (
        <div className="pivot-menu-options">
          {config.expanded.map((option) => {
            let btnClass = "format-menu-btn";
            if (option.key === "fieldList") {
              if (fieldListActive) btnClass += " active";
            } else if (activeGroup === option.key) {
              btnClass += " active";
            }
            return (
              <React.Fragment key={option.key}>
                <CustomTooltip title={option.tooltip}>
                  <button
                    type="button"
                    className={btnClass}
                    onClick={() => handleButtonClick(option.key)}
                  >
                    <span>{option.label}</span>
                  </button>
                </CustomTooltip>
                {/* Divider after option if specified */}
                {option.dividerAfter && (
                  <div className="pivot-menu-option-divider" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PivotMenu;
