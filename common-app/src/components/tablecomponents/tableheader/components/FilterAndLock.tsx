import React, { useState } from "react";
import CustomTooltip from "../../../common/CustomTooltip";
import { tableHeaderConfig } from "../../../../config/tableHeaderConfig";

const FilterAndLock: React.FC = () => {
  // Get filter and lock config from tableHeaderConfig
  const config = tableHeaderConfig.filterLock;
  const [locked, setLocked] = useState(false);
  const [filterClicked, setFilterClicked] = useState(false);

  // Toggle lock state
  const handleLockClick = () => {
    setLocked((prev) => !prev);
  };

  // Toggle filter clicked state
  const handleFilterClick = () => {
    setFilterClicked((prev) => !prev);
  };

  return (
    <div className="filter-lock-root">
      {/* Filter Icon with Tooltip */}
      <CustomTooltip title={config.filter.tooltip}>
        <button
          className="filter-lock-btn"
          onClick={handleFilterClick}
          type="button"
        >
          <span className="filter-lock-icon" aria-hidden="true">
            {config.filter.icon}
          </span>
          {/* Badge: show only if filterClicked */}
          {filterClicked && (
            <>
              <span className="filter-lock-badge">1</span>
              <span className="filter-lock-dot" />
            </>
          )}
        </button>
      </CustomTooltip>
      {/* Divider */}
      <div
        className={
          "filter-lock-divider" + (filterClicked ? " filter-active" : "")
        }
        aria-hidden="true"
      />
      {/* Lock/Unlock Icon with Tooltip */}
      <CustomTooltip title={config.lock.tooltip}>
        <button className="icon-lock" onClick={handleLockClick} type="button">
          <span className="filter-lock-icon" aria-hidden="true">
            {/* Show locked or unlocked icon based on state */}
            {locked ? config.lock.locked.icon : config.lock.unlocked.icon}
          </span>
        </button>
      </CustomTooltip>
    </div>
  );
};

export default FilterAndLock;
