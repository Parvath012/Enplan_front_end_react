import React, { useState, useRef } from "react";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";
import CustomTooltip from "../../../common/CustomTooltip";
import SearchBar from "./SearchBar";
import screenfull from "screenfull"; // Handles cross-browser fullscreen API
import { useScreenfullSubscription } from "./useScreenfullSubscription";
import { useExpandableSelector } from "./useExpandableSelector";

const ICON_SIZE = 25;

const ImportExportSelector: React.FC = () => {
  const [showActions, setShowActions] = useState(false);
  const [justExpanded, setJustExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(screenfull.isFullscreen);
  const expandTimeout = useRef<NodeJS.Timeout | null>(null);

  useScreenfullSubscription(setIsFullscreen);

  // Get import/export actions from tableHeaderConfig, handle missing config gracefully
  const actions = tableHeaderConfig?.importExport?.expanded || [];

  // Show actions and set justExpanded for tooltip delay
  const handleExpand = () => {
    setShowActions(true);
    setJustExpanded(true);
    if (expandTimeout.current) clearTimeout(expandTimeout.current);
    expandTimeout.current = setTimeout(() => setJustExpanded(false), 400); // 400ms delay
  };

  // Hide actions and clear timeout
  const handleCollapse = () => {
    setShowActions(false);
    setJustExpanded(false);
    if (expandTimeout.current) clearTimeout(expandTimeout.current);
  };

  // Full screen handler
  const handleFullScreen = () => {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  };

  // Use the hook for fullscreen toggle
  const { handleExpand: handleFullScreenExpand, handleKeyDown: handleFullScreenKeyDown } =
    useExpandableSelector(handleFullScreen);

  return (
    <div className="import-export-root">
      {/* Search */}
      <SearchBar />

      {/* Divider between search and next icon */}
      <div className="import-export-divider" />

      {showActions ? (
        <>
          {/* Upload */}
          {actions[0]?.icon && (justExpanded ? (
            <span className="import-export-action">{actions[0].icon}</span>
          ) : (
            <CustomTooltip title={actions[0]?.tooltip || ""} placement="bottom">
              <span className="import-export-action">{actions[0].icon}</span>
            </CustomTooltip>
          ))}
          {/* Download */}
          {actions[1]?.icon && (
            <CustomTooltip title={actions[1]?.tooltip || ""} placement="bottom">
              <span className="import-export-action">{actions[1].icon}</span>
            </CustomTooltip>
          )}
          {/* Share */}
          {actions[2]?.icon && (
            <CustomTooltip title={actions[2]?.tooltip || ""} placement="bottom">
              <span className="import-export-action">{actions[2].icon}</span>
            </CustomTooltip>
          )}
          {/* Divider between share and import/export */}
          <div className="import-export-divider" />
          {/* Import/Export (active) */}
          <CustomTooltip
            title={tableHeaderConfig?.importExport?.tooltip || ""}
            placement="bottom"
          >
            <span>
              {React.isValidElement(tableHeaderConfig?.importExport?.icon) &&
                React.cloneElement(
                  tableHeaderConfig.importExport.icon as React.ReactElement<any>,
                  {
                    className: "import-export-icon show",
                    style: { width: ICON_SIZE, height: ICON_SIZE },
                    onClick: handleCollapse,
                  }
                )}
            </span>
          </CustomTooltip>
        </>
      ) : (
        <>
          {/* Import/Export (inactive) */}
          <CustomTooltip
            title={tableHeaderConfig?.importExport?.tooltip || ""}
            placement="bottom"
          >
            <span>
              {React.isValidElement(tableHeaderConfig?.importExport?.icon) &&
                React.cloneElement(
                  tableHeaderConfig.importExport.icon as React.ReactElement<any>,
                  {
                    className: "import-export-icon",
                    style: { width: ICON_SIZE, height: ICON_SIZE },
                    onClick: handleExpand,
                  }
                )}
            </span>
          </CustomTooltip>
        </>
      )}

      {/* Divider between import/export and run */}
      <div className="import-export-divider" />


      {/* Run */}
      {actions[3]?.icon && (
        <CustomTooltip title={actions[3]?.tooltip || ""} placement="bottom">
          <span className="import-export-run">{actions[3]?.icon}</span>
        </CustomTooltip>
      )}

      <div className="import-export-divider" />

      {/* Fullscreen toggle button (screenfull, icon/tooltip switch by state) */}
      <CustomTooltip title={actions[isFullscreen ? 5 : 4]?.tooltip || ""} placement="bottom">
        <button
          type="button"
          className={isFullscreen ? "import-export-exit-full-screen" : "import-export-fit-to-screen"}
          style={{
            cursor: screenfull.isEnabled ? "pointer" : "not-allowed",
            background: "none",
            border: "none",
            padding: 0,
          }}
          onClick={screenfull.isEnabled ? handleFullScreenExpand : undefined}
          onKeyDown={handleFullScreenKeyDown(handleFullScreenExpand)}
          aria-label={actions[isFullscreen ? 5 : 4]?.tooltip || ""}
          tabIndex={0}
          disabled={!screenfull.isEnabled}
        >
          {/* Render fullscreen or exit fullscreen icon based on state */}
          {screenfull.isEnabled && actions[isFullscreen ? 5 : 4]?.icon}
        </button>
      </CustomTooltip>
    </div>
  );
};

export default ImportExportSelector;
