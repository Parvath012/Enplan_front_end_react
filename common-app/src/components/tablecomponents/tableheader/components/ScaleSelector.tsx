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

const ScaleSelector: React.FC<Props> = ({
  expanded,
  onExpand,
  onRequestExpand = () => {},
}) => {
  // Get scale config from tableHeaderConfig
  const config = tableHeaderConfig.scale;
  // Use shared expand/collapse logic
  const { handleExpand, handleRequestExpand, handleKeyDown } =
    useExpandableSelector(onExpand, onRequestExpand);

  // Only render icon if not null
  let icon = null;
  if (expanded && config.icon?.selected) {
    icon = config.icon.selected;
  } else if (!expanded && config.icon?.default) {
    icon = config.icon.default;
  }

  return (
    <div className="scale-selector-root">
      {/* Main scale icon button */}
      <SelectorIconButton
        tooltip={config.tooltip}
        expanded={expanded}
        className={`scale-selector-btn${expanded ? " expanded" : ""}`}
        icon={icon}
        onClick={expanded ? handleExpand : handleRequestExpand}
        onKeyDown={handleKeyDown(expanded ? handleExpand : handleRequestExpand)}
      />
      {/* Divider when expanded */}
      {expanded && <div className="scale-selector-divider" />}
      {/* Show scale options when expanded and expanded is a non-empty array */}
      {expanded && Array.isArray(config.expanded) && config.expanded.length > 0 && (
        <div className="scale-selector-options">
          {config.expanded.map(
            (option: { key: any; tooltip: any; icon: React.ReactNode }) => (
              <CustomTooltip key={option.key} title={option.tooltip}>
                <span
                  className="scale-selector-option-img"
                  data-testid={`scale-option-${option.key}`}
                >
                  {option.icon}
                </span>
              </CustomTooltip>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ScaleSelector;
