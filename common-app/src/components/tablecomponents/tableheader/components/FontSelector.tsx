import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { MenuItem, Select, FormControl } from "@mui/material";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import CustomTooltip from "../../../common/CustomTooltip";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";
import TextFormatting from "./TextFormatting";
import SelectorIconButton from "./SelectorIconButton";
import { useExpandableSelector } from "./useExpandableSelector";
import { UPDATE_CELL_FORMATTING } from "../../../../store/Actions/gridActions";

type FormattingKey = 'bold' | 'italic' | 'underline' | 'strikethrough';
type FormattingState = Record<FormattingKey, boolean>;

const ICON_SIZE = 25;

interface Props {
  expanded: boolean;
  onExpand: () => void;
  onRequestExpand?: () => void;
}

const FontSelector: React.FC<Props> = ({
  expanded,
  onExpand,
  onRequestExpand = () => {},
}) => {
  // Get font config from tableHeaderConfig
  const config = tableHeaderConfig.font;
  const fontOptions = config.expanded.fontOptions;
  const fontSizeOptions = config.expanded.fontSizeOptions;
  const actions = config.expanded.actions;

  // State for selected font and font size
  const [font, setFont] = React.useState<string>(fontOptions[0]);
  const [fontSize, setFontSize] = React.useState<number>(fontSizeOptions[0]);

  // State for text formatting (bold, italic, underline, etc.)
  const [activeFormatting, setActiveFormatting] = React.useState<FormattingState>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });

  // Redux selectors for formatting logic
  const dispatch = useDispatch();
  const selectedCells = useSelector((state: any) => state.gridStore.selectedCells);
  const tableConfiguration = useSelector((state: any) => state.dataStore.tableConfiguration);
  const formattingConfig = useSelector((state: any) => state.dataStore.formattingConfig);

  // Use shared expand/collapse logic
  // Update formatting state based on selected cell(s)
  React.useEffect(() => {
    if (!selectedCells || selectedCells.length === 0) {
      setActiveFormatting({ bold: false, italic: false, underline: false, strikethrough: false });
      return;
    }
    // Use the first selected cell for formatting state
    const cell = selectedCells[0];
    const key = `${cell.rowId}:${cell.field}`;
    const cellFormatting = formattingConfig[key] ?? {};
    setActiveFormatting({
      bold: !!cellFormatting.bold,
      italic: !!cellFormatting.italic,
      underline: !!cellFormatting.underline,
      strikethrough: !!cellFormatting.strikethrough,
    });
  }, [selectedCells, formattingConfig]);
  const { handleExpand, handleRequestExpand, handleKeyDown } =
    useExpandableSelector(onExpand, onRequestExpand);

  // Handler to apply text formatting to editable cells
  const handleTextFormatting = (action: string) => {
    // Update local formatting state for UI
    if (!selectedCells || selectedCells.length === 0) return;

    // Only apply to editable cells
    const editableFields = (tableConfiguration ?? [])
      .filter((col: any) => col.isEditable)
      .map((col: any) => col.aliasName);
    const editableCells = (selectedCells ?? []).filter((cell: any) =>
      editableFields.includes(cell.field)
    );

    // Determine the current state from the first selected cell
    const firstCell = editableCells[0];
    const firstKey = `${firstCell.rowId}:${firstCell.field}`;
    const firstCellFormatting = formattingConfig[firstKey] ?? {};
    const shouldApply = !firstCellFormatting[action as FormattingKey]; // true if first cell is not formatted

    // Apply formatting to all selected cells
    editableCells.forEach((cell: any) => {
      const key = `${cell.rowId}:${cell.field}`;
      const prev = formattingConfig[key] ?? {};
      dispatch({
        type: UPDATE_CELL_FORMATTING,
        payload: {
          key,
          formatting: { ...prev, [action]: shouldApply }
        }
      });
    });
  };

  return (
    <div className="font-selector-root">
      {/* Main font icon button */}
      <SelectorIconButton
        tooltip={config.tooltip}
        expanded={expanded}
        className={`color-selector-btn${expanded ? " expanded" : ""}`}
        icon={
          React.isValidElement(config.icon)
            ? React.cloneElement(config.icon as React.ReactElement<any>, {
                style: {
                  fontSize: ICON_SIZE,
                  height: ICON_SIZE,
                  width: ICON_SIZE,
                  color: expanded ? "#fff" : "#5F6368",
                },
                "aria-hidden": true,
              })
            : null
        }
        onClick={expanded ? handleExpand : handleRequestExpand}
        onKeyDown={handleKeyDown(expanded ? handleExpand : handleRequestExpand)}
      />
      {/* Divider when expanded */}
      {expanded && <div className="font-selector-divider" />}
      {/* Show font and font size selectors when expanded */}
      {expanded && (
        <div className="font-selector-menu">
          {/* Font Select */}
          <FormControl
            variant="outlined"
            size="small"
            sx={{
              height: 22,
              minWidth: 89,
              maxWidth: 89,
              borderRadius: "6px 0 0 6px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px 0 0 6px",
                padding: 0,
                backgroundColor: "transparent",
                borderColor: "transparent",
                height: 22,
              },
            }}
          >
            <Select
              value={font}
              displayEmpty
              onChange={(e) => setFont(e.target.value)}
              renderValue={(selected) => selected || fontOptions[0]}
              variant="outlined"
              IconComponent={KeyboardArrowDownOutlinedIcon}
              sx={{
                minWidth: 89,
                maxWidth: 89,
                height: 22,
                padding: "4px 8px",
                fontFamily: '"Inter-Regular", "Inter", sans-serif',
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: 10,
                color: "#5F6368",
                background: "transparent",
                borderColor: "transparent",
                boxShadow: "none",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& .MuiSelect-select": {
                  padding: "4px 8px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiSelect-iconOutlined": {
                  fontSize: 12,
                  width: 12,
                  height: 12,
                  right: 2,
                  top: "50%",
                  transform: "translateY(-50%)",
                  transition: "transform 0.2s",
                },
                "& .MuiSelect-iconOpen": {
                  transform: "translateY(-50%) rotate(180deg)",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    fontSize: 10,
                    fontFamily: '"Inter-Regular", "Inter", sans-serif',
                    minWidth: 80,
                    paddingY: 0,
                    paddingX: 0,
                  },
                },
                MenuListProps: {
                  sx: {
                    paddingY: 0,
                    paddingX: 0,
                  },
                },
              }}
            >
              {fontOptions.map((option) => (
                <MenuItem
                  key={option}
                  value={option}
                  sx={{
                    fontSize: 10,
                    minHeight: 24,
                    height: 24,
                    paddingY: 0,
                    paddingX: 1.5,
                    lineHeight: 1.2,
                  }}
                >
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Font Size Select */}
          <FormControl
            variant="outlined"
            size="small"
            sx={{
              height: 22,
              minWidth: 46,
              maxWidth: 46,
              borderRadius: "0 6px 6px 0",
              borderLeft: "1px solid #e0e0e0",
              "& .MuiOutlinedInput-root": {
                borderRadius: "0 6px 6px 0",
                padding: 0,
                backgroundColor: "transparent",
                borderColor: "transparent",
                height: 22,
              },
            }}
          >
            <Select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              IconComponent={KeyboardArrowDownOutlinedIcon}
              sx={{
                minWidth: 46,
                maxWidth: 46,
                height: 22,
                padding: "4px 8px",
                fontFamily: '"Inter-Regular", "Inter", sans-serif',
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: 10,
                color: "#5F6368",
                background: "transparent",
                borderColor: "transparent",
                boxShadow: "none",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& .MuiSelect-select": {
                  padding: "4px 8px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiSelect-iconOutlined": {
                  fontSize: 10,
                  width: 12,
                  height: 12,
                  right: 2,
                  top: "50%",
                  transform: "translateY(-50%)",
                  transition: "transform 0.2s",
                },
                "& .MuiSelect-iconOpen": {
                  transform: "translateY(-50%) rotate(180deg)",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    fontSize: 10,
                    fontFamily: '"Inter-Regular", "Inter", sans-serif',
                    minWidth: 50,
                    paddingY: 0,
                    paddingX: 0,
                  },
                },
                MenuListProps: {
                  sx: {
                    paddingY: 0,
                    paddingX: 0,
                  },
                },
              }}
            >
              {fontSizeOptions.map((size) => (
                <MenuItem
                  key={size}
                  value={size}
                  sx={{
                    fontSize: 10,
                    minHeight: 24,
                    height: 24,
                    paddingY: 0,
                    paddingX: 1.5,
                    lineHeight: 1.2,
                  }}
                >
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      )}
      {/* Show font actions and formatting when expanded */}
      {expanded && (
        <div className="font-selector-actions">
          {actions.map((action) => (
            <CustomTooltip key={action.key} title={action.tooltip}>
              <span className="font-selector-action">{action.icon}</span>
            </CustomTooltip>
          ))}
          {/* Pass onFormat and activeFormatting as props to TextFormatting */}
          <TextFormatting 
            onFormat={handleTextFormatting}
            activeFormatting={activeFormatting}
          />
        </div>
      )}
    </div>
  );
};

export default FontSelector;
