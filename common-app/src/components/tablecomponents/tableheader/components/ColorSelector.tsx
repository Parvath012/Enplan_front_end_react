import React from "react";
import CustomTooltip from "../../../common/CustomTooltip";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";
import SelectorIconButton from "./SelectorIconButton";
import { useExpandableSelector } from "./useExpandableSelector";
import { useDispatch, useSelector } from "react-redux";

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

const ColorSelector: React.FC<Props> = ({
  expanded,
  onExpand,
  onRequestExpand = () => {},
  selectedCells: propSelectedCells,
  onFormat,
}) => {
  // Get color config from tableHeaderConfig
  const config = tableHeaderConfig.color;

  // Use shared expand/collapse logic
  const { handleExpand, handleRequestExpand, handleKeyDown } =
    useExpandableSelector(onExpand, onRequestExpand);

  // Redux integration for selectedCells, table config, formatting config
  const dispatch = useDispatch();
  const reduxSelectedCells = useSelector((state: any) => state.gridStore.selectedCells);
  const tableConfiguration = useSelector((state: any) => state.dataStore.tableConfiguration);
  const formattingConfig = useSelector((state: any) => state.dataStore.formattingConfig);
  // Use props if provided, else fallback to Redux
  const selectedCells = propSelectedCells || reduxSelectedCells;

  const [activePicker, setActivePicker] = React.useState<string | null>(null);
  const handleColorButtonClick = (key: string) => {
    setActivePicker((prev) => (prev === key ? null : key));
  };
  const handleColorChange = (key: string, color: string) => {
    // Only format editable cells
    const editableFields = (tableConfiguration ?? [])
      .filter((col: any) => col.isEditable)
      .map((col: any) => col.aliasName);
    const editableCells = selectedCells.filter((cell: any) =>
      editableFields.includes(cell.field)
    );
    if (onFormat) {
      // action: key is either 'textColor' or 'fillColor' from config
      onFormat(key, { color }, editableCells, dispatch, formattingConfig);
    }
    setActivePicker(null);
  };
  return (
    <div className="color-selector-root">
      {/* Main color icon button */}
      {config.icon ? (
        <SelectorIconButton
          tooltip={config.tooltip}
          expanded={expanded}
          className={`color-selector-btn${expanded ? " expanded" : ""}`}
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
      ) : null}
      {/* Divider when expanded */}
      {expanded && (
        <div className="color-selector-divider" aria-hidden="true" />
      )}
      {/* Show color options when expanded */}
      {expanded && (
        <div
          className="color-selector-options"
          aria-hidden="true"
          onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
        >
          {/* Overlay to close picker when clicking outside */}
          {activePicker && (
            <button
              type="button"
              aria-label="Close color picker"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9,
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
              }}
              onClick={() => setActivePicker(null)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') setActivePicker(null);
              }}
              tabIndex={0}
            />
          )}
          {config.expanded.map((option) => (
            <CustomTooltip key={option.key} title={option.tooltip}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <button
                  type="button"
                  aria-label={option.tooltip}
                  className="color-selector-option"
                  tabIndex={0}
                  data-testid={`color-option-${option.key}`}
                  onClick={() => handleColorButtonClick(option.key)}
                >
                  {React.cloneElement(option.icon, {
                    style: {
                      fontSize: 20,
                      color: "#667085",
                    },
                    "aria-hidden": true,
                  })}
                </button>
                {activePicker === option.key && (
                  <div
                    style={{ position: "absolute", top: 30, left: 0, zIndex: 10, background: '#fff', border: '1px solid #ccc', borderRadius: 4, padding: 12, minWidth: 220 }}
                  >
                    <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Theme Colors</div>
                    <div className="custom-theme-swatches" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 2, marginBottom: 12 }}>
                      {config.themeColors.map((color: string, idx: number) => (
                        <button
                          key={color + idx}
                          style={{ background: color, width: 22, height: 22, border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer', padding: 0 }}
                          onClick={() => handleColorChange(option.key, color)}
                          aria-label={color}
                        />
                      ))}
                    </div>
                    <div style={{ margin: '12px 0 4px 0', fontWeight: 600, fontSize: 13 }}>Standard Colors</div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      {config.standardColors.map((col: string) => (
                        <button
                          key={col}
                          style={{ background: col, width: 22, height: 22, border: '1px solid #ccc', borderRadius: 3, cursor: 'pointer' }}
                          onClick={() => handleColorChange(option.key, col)}
                          aria-label={col}
                        />
                      ))}
                    </div>
                    {/* Removed No Fill, Highlight when..., More Colors..., Eyedropper options as requested */}
                  </div>
                )}
              </div>
            </CustomTooltip>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
