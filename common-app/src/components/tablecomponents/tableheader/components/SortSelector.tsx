import React, { useState } from "react";
import CustomTooltip from "../../../common/CustomTooltip";
import { tableHeaderConfig, SortOptionKey } from "../../../../config/tableHeaderConfig";
import SelectorIconButton from "./SelectorIconButton";
import { useExpandableSelector } from "./useExpandableSelector";
import SortDialog from "../../tablegrid/components/SortDialog";
import { useSelector } from "react-redux";
import { SortType, SortModel } from '../../tablegrid/types';

interface Props {
  /**
   * Whether the sort selector is expanded (showing options)
   */
  expanded: boolean;
  /**
   * Handler to expand the selector
   */
  onExpand: () => void;
  /**
   * Optional handler to request expand (keyboard, etc.)
   */
  onRequestExpand?: () => void;
  /**
   * Updates the sort model (multi-column sort state)
   */
  setSortModel: (model: SortModel[]) => void;
  /**
   * Current sort model (multi-column sort state)
   */
  sortModel: SortModel[];
}

const SortSelector: React.FC<Props> = ({
  expanded,
  onExpand,
  onRequestExpand = () => {},
  setSortModel,
  sortModel,
}) => {
  // Get sort config from tableHeaderConfig
  const config = tableHeaderConfig.sort;
  // Use shared expand/collapse logic
  const { handleExpand, handleRequestExpand, handleKeyDown } =
    useExpandableSelector(onExpand, onRequestExpand);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  // Access columns from Redux store
  // This assumes you have a Redux store setup with columns in state.dataStore.columns
  const columns = useSelector((state: any) => state.dataStore.columns);

  return (
    <div className="sort-selector-root">
      {/* Main sort icon button */}
      <SelectorIconButton
        tooltip={config.tooltip}
        expanded={expanded}
        className={`sort-selector-btn${expanded ? " expanded" : ""}`}
        icon={expanded ? config.icon.selected : config.icon.default}
        onClick={expanded ? handleExpand : handleRequestExpand}
        onKeyDown={handleKeyDown(expanded ? handleExpand : handleRequestExpand)}
      />
      {/* Divider when expanded */}
      {expanded && <div className="sort-selector-divider" />}
      {/* Show sort options when expanded */}
      {expanded && (
        <div className="sort-selector-options">
          {config.expanded.map((option) => {
            let handleClick: (() => void) | undefined;
            if (option.key === SortOptionKey.SortBy) {
              handleClick = handleDialogOpen;
            } else if (option.key === SortOptionKey.Remove) {
              handleClick = () => setSortModel([]);
            }
            return (
              <CustomTooltip key={option.key} title={option.tooltip}>
                <button
                  type="button"
                  className="sort-selector-option"
                  aria-label={option.tooltip}
                  tabIndex={0}
                  onClick={handleClick}
                >
                  {/* Option icon */}
                  {React.cloneElement(option.icon, {
                    style: {
                      fontSize: 20,
                      border: "none",
                      boxShadow: "none",
                      outline: "none",
                    },
                  })}
                </button>
              </CustomTooltip>
            );
          })}
          {/* SortDialog integration */}
          <SortDialog
            open={dialogOpen}
            onClose={handleDialogClose}
            columns={columns}
            sortLevels={sortModel?.map(({ field, type, sort }) => ({
              sortBy: field,
              sortOn: type,
              order: sort,
            }))}
            onApplySort={(levels) => {
              if (typeof setSortModel === "function") {
                setSortModel(
                  levels.map((level, idx) => ({
                    field: level.sortBy,
                    type: level.sortOn as SortType,
                    sort: level.order,
                    priority: idx + 1,
                  }))
                );
              } else {
                // eslint-disable-next-line no-console
                console.error(
                  "setSortModel is not a function. Please ensure it is passed as a prop to SortSelector."
                );
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SortSelector;
