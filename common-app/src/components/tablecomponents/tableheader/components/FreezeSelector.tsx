import React from "react";
import CustomTooltip from "../../../common/CustomTooltip";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";
import SelectorIconButton from "./SelectorIconButton";
import { useExpandableSelector } from "./useExpandableSelector";

interface Props {
  expanded: boolean;
  onExpand: () => void;
  onRequestExpand?: () => void;
}

const FreezeSelector: React.FC<Props> = ({
  expanded,
  onExpand,
  onRequestExpand = () => {},
}) => {
  // Get freeze config from tableHeaderConfig
  const config = tableHeaderConfig.freeze;
  // Use shared expand/collapse logic
  const { handleExpand, handleRequestExpand, handleKeyDown } =
    useExpandableSelector(onExpand, onRequestExpand);

  // Only render icon if not null
  const iconToRender = expanded ? config.icon.selected : config.icon.default;

  return (
    <div className="freeze-selector-root">
      {/* Main freeze icon button */}
      <SelectorIconButton
        tooltip={config.tooltip}
        expanded={expanded}
        className={`freeze-selector-btn${expanded ? " expanded" : ""}`}
        icon={iconToRender}
        onClick={expanded ? handleExpand : handleRequestExpand}
        onKeyDown={handleKeyDown(expanded ? handleExpand : handleRequestExpand)}
      />
      {/* Divider when expanded */}
      {expanded && <div className="freeze-selector-divider" aria-hidden="true" />}
      {/* Show freeze options when expanded and array is not empty */}
      {expanded && Array.isArray(config.expanded) && config.expanded.length > 0 && (
        <div className="freeze-selector-options">
          {config.expanded.map(
            (option: { key: any; tooltip: any; icon: React.ReactNode }) => (
              <CustomTooltip key={option.key} title={option.tooltip}>
                <button
                  type="button"
                  className="freeze-selector-option"
                  aria-label={option.tooltip}
                  tabIndex={0}
                >
                  {/* Option icon */}
                  {option.icon}
                </button>
              </CustomTooltip>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default FreezeSelector;
