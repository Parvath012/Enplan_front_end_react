import React from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomTooltip from "../../../common/CustomTooltip";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";
import SelectorIconButton from "./SelectorIconButton";
import { useExpandableSelector } from "./useExpandableSelector";

const ICON_SIZE = 25;

interface Props {
  expanded: boolean;
  onExpand: () => void;
  onRequestExpand?: () => void;
  selectedCells?: any[];
  onFormat?: (
    action: string,
    payload: any,
    cells: any[],
    dispatch: any,
    formattingConfig?: Record<string, any>
  ) => void;
}

const NumberFormatSelector: React.FC<Props> = ({
  expanded,
  onExpand,
  onRequestExpand = () => {},
  selectedCells: propSelectedCells,
  onFormat,
}) => {
  // Get number format config from tableHeaderConfig
  const config = tableHeaderConfig.numberFormat;
  // Use shared expand/collapse logic
  const { handleExpand, handleRequestExpand, handleKeyDown } =
    useExpandableSelector(onExpand, onRequestExpand);
  const dispatch = useDispatch();
  const reduxSelectedCells = useSelector((state: any) => state.gridStore.selectedCells);
  const tableConfiguration = useSelector((state: any) => state.dataStore.tableConfiguration);
  const formattingConfig = useSelector((state: any) => state.dataStore.formattingConfig);
  // Use props if provided, else fallback to Redux
  const selectedCells = propSelectedCells ?? reduxSelectedCells;

  // Handler mapping for number format actions (now using props)
  const handleFormatAction = (key: string, payload: any = {}) => {
    // Only format editable cells
    const editableFields = (tableConfiguration ?? [])
      .filter((col: any) => col.isEditable)
      .map((col: any) => col.aliasName);
    const editableCells = selectedCells.filter((cell: any) =>
      editableFields.includes(cell.field)
    );
    if (onFormat) {
      onFormat(key, payload, editableCells, dispatch, formattingConfig);
    }
  };

  return (
    <div className="number-format-selector-root">
      {/* Main number format icon button */}
      <SelectorIconButton
        tooltip={config.tooltip}
        expanded={expanded}
        className={`number-format-selector-btn${expanded ? " expanded" : ""}`}
        icon={React.cloneElement(config.icon, {
          style: {
            fontSize: ICON_SIZE,
            height: ICON_SIZE,
            width: ICON_SIZE,
            color: expanded ? "#fff" : "#5F6368",
          },
          "aria-hidden": true,
        })}
        onClick={expanded ? handleExpand : handleRequestExpand}
        onKeyDown={handleKeyDown(expanded ? handleExpand : handleRequestExpand)}
      />
      {/* Divider when expanded */}
      {expanded && <div className="number-format-selector-divider" />}
      {/* Show number format options only if expanded and options exist */}
      {expanded && Array.isArray(config.expanded) && config.expanded.length > 0 && (
        <div className="number-format-selector-options">
          {config.expanded.map((option) => (
            <React.Fragment key={option.key}>
              {/* Divider before option if specified */}
              {option.dividerBefore && (
                <div className="number-format-selector-option-divider" />
              )}
              <CustomTooltip title={option.tooltip}>
                <button
                  type="button"
                  className="number-format-selector-option"
                  aria-label={option.tooltip}
                  tabIndex={0}
                  onClick={() => handleFormatAction(option.key)}
                >
                  {/* Option icon */}
                  {option.icon}
                </button>
              </CustomTooltip>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default NumberFormatSelector;
