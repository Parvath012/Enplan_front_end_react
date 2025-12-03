import React from "react";
import CustomTooltip from "../../../common/CustomTooltip";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";
import SelectorIconButton from "./SelectorIconButton";
import { useExpandableSelector } from "./useExpandableSelector";
import { useDispatch } from "react-redux";
import { toggleWrapForSelectedCells } from "../../../../store/Actions/alignmentActions";

const ICON_SIZE = 25;

// Get alignment config from tableHeaderConfig
const alignmentConfig = tableHeaderConfig.alignment;

interface Props {
  expanded: boolean; // Whether the selector is expanded
  onExpand: () => void; // Callback to expand/collapse
  onRequestExpand?: () => void; // Optional callback for requesting expand
}

const AlignmentSelector: React.FC<Props> = ({
  expanded,
  onExpand,
  onRequestExpand,
}) => {
  // Handles expand/collapse logic
  const { handleExpand, handleRequestExpand, handleKeyDown } =
    useExpandableSelector(onExpand, onRequestExpand);

  const dispatch = useDispatch();

  const handleOptionClick = (key: string) => {
    if (key === "textwrapping") {
      dispatch<any>(toggleWrapForSelectedCells());
    }

    // Uncomment and use additional conditions when needed
    // else if (key === 'alignleft') {
    //   dispatch(anyOtherAction());
    // }
    else {
      console.warn(`Unhandled alignment key: ${key}`);
    }
  };

  return (
    <div className="alignment-selector-root">
      {/* Main alignment icon button */}
      <SelectorIconButton
        tooltip={alignmentConfig.tooltip}
        expanded={expanded}
        className={`alignment-selector-btn${expanded ? " expanded" : ""}`}
        icon={
          React.isValidElement(alignmentConfig.icon)
            ? React.cloneElement(
                alignmentConfig.icon as React.ReactElement<any>,
                {
                  style: {
                    fontSize: ICON_SIZE,
                    height: ICON_SIZE,
                    width: ICON_SIZE,
                    color: expanded ? "#fff" : "#5F6368",
                  },
                  "aria-hidden": true,
                }
              )
            : null
        }
        onClick={expanded ? handleExpand : handleRequestExpand}
        onKeyDown={handleKeyDown(expanded ? handleExpand : handleRequestExpand)}
      />
      {/* Divider when expanded */}
      {expanded && (
        <div className="alignment-selector-divider" aria-hidden="true" />
      )}
      {/* Show alignment options when expanded */}
      {expanded && (
        <div
          className="alignment-selector-options"
          aria-hidden="true"
          onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
        >
          {Array.isArray(alignmentConfig.expanded) &&
            alignmentConfig.expanded.map((option, idx) => (
              <React.Fragment key={option.key}>
                <CustomTooltip title={option.tooltip}>
                  <button
                    type="button"
                    aria-label={option.tooltip}
                    onClick={() => handleOptionClick(option.key)}
                    className="alignment-selector-option"
                    tabIndex={0}
                  >
                    {/* Option icon */}
                    {React.isValidElement(option.icon) &&
                      React.cloneElement(
                        option.icon as React.ReactElement<any>,
                        {
                          style: {
                            fontSize: 20,
                            color: "#667085",
                          },
                          "aria-hidden": true,
                        }
                      )}
                  </button>
                </CustomTooltip>
                {/* Divider after certain options */}
                {(idx === 3 || idx === 5 || idx === 6) && (
                  <div
                    className="alignment-selector-option-divider"
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            ))}
        </div>
      )}
    </div>
  );
};

export default AlignmentSelector;
