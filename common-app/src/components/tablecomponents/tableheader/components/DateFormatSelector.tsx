// DateFormatSelector: Dropdown selector for choosing date format for selected cells
import React from "react";
import GenericFormatSelector from "./GenericFormatSelector";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";
import { useDispatch, useSelector } from "react-redux";
import { handleDateFormattingAction } from "../../../../utils/cellFormattingHandlers";

// Props for DateFormatSelector
interface Props {
  expanded: boolean; // Whether the selector is expanded
  onExpand: () => void; // Handler to expand selector
  onRequestExpand?: () => void; // Optional handler to request expand
  selectedCells?: any[]; // Optional selected cells (from parent)
  onFormat?: (
    action: string,
    payload: any,
    cells: any[],
    dispatch: any,
    formattingConfig?: Record<string, any>
  ) => void; // Optional callback after formatting
  dispatch?: any; // Optional dispatch override
}

const DateFormatSelector: React.FC<Props> = ({
  expanded,
  onExpand,
  onRequestExpand = () => {},
  selectedCells: propSelectedCells,
  onFormat,
  dispatch: propDispatch,
}) => {
  // Get date format config and options from tableHeaderConfig
  const config = tableHeaderConfig.dateformat;
  const dateFormatOptions = config.expanded;

  // Use Redux hooks for selected cells, table config, and formatting config
  const reduxDispatch = useDispatch();
  const reduxSelectedCells = useSelector(
    (state: any) => state.gridStore.selectedCells
  );
  const tableConfiguration = useSelector(
    (state: any) => state.dataStore.tableConfiguration
  );
  const formattingConfig = useSelector(
    (state: any) => state.dataStore.formattingConfig
  );
  // Allow props to override Redux values
  const dispatch = propDispatch ?? reduxDispatch;
  const selectedCells = propSelectedCells ?? reduxSelectedCells;

  // State for currently selected date format
  const [selectedFormat, setSelectedFormat] = React.useState<string>("");

  // Update selectedFormat when selectedCells or formattingConfig changes
  React.useEffect(() => {
    if (selectedCells && selectedCells.length > 0) {
      // Use the last selected cell to determine the current format
      const lastIdx = selectedCells.length - 1;
      const cellKey = `${selectedCells[lastIdx].rowId}:${selectedCells[lastIdx].field}`;
      const formatting = formattingConfig?.[cellKey];
      if (formatting?.dateFormat) {
        setSelectedFormat(formatting.dateFormat);
        return;
      }
    }
    setSelectedFormat("");
  }, [selectedCells, formattingConfig]);

  // Handler for when the user selects a new date format
  const handleChange = (e: any) => {
    setSelectedFormat(e.target.value); // Update local state
    if (onFormat) {
      // Call formatting handler and notify parent via onFormat
      const { formatter, editableCells } = handleDateFormattingAction(
        e.target.value,
        selectedCells,
        dispatch,
        { ...formattingConfig, tableConfiguration }
      );
      onFormat(
        e.target.value,
        { formatter },
        editableCells,
        dispatch,
        formattingConfig
      );
    }
    // Do not collapse on select
  };

  return (
    <GenericFormatSelector
      expanded={expanded}
      onExpand={onExpand}
      onRequestExpand={onRequestExpand}
      config={config}
      options={dateFormatOptions}
      selectedValue={selectedFormat}
      onChange={handleChange}
      icon={
        // Clone the icon and apply custom styles for expanded/collapsed state
        React.isValidElement(config.icon)
          ? React.cloneElement(config.icon as React.ReactElement<any>, {
              style: {
                fontSize: 25,
                height: 25,
                width: 25,
                color: expanded ? "#fff" : "#5F6368",
              },
              "aria-hidden": true,
            })
          : null
      }
      renderValuePlaceholder="Select date format…"
    />
  );
};

export default DateFormatSelector;
