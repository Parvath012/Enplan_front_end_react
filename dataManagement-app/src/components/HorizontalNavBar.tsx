import React, { useState } from "react";
import "./HorizontalNavBar.scss";
import {
  CaretDown,
  CaretUp,
} from "@carbon/icons-react";
import NavDropdownMenu from "./NavDropdownMenu";
import HeaderIcons from "./HeaderIcons";

interface NavItem {
  label: string;
  path: string;
}



interface HorizontalNavBarProps {
  navItems: NavItem[];
  visibleCount: number;
}

const HorizontalNavBar: React.FC<HorizontalNavBarProps> = ({
  navItems,
  visibleCount,
}) => {
  const [activePath, setActivePath] = useState<string>(navItems[0]?.path || "");
  const [isMoreActive, setIsMoreActive] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Dynamic visible and extra items based on selection
  const [visibleItems, setVisibleItems] = useState<NavItem[]>(
    navItems.slice(0, visibleCount)
  );
  const [extraItems, setExtraItems] = useState<NavItem[]>(
    navItems.slice(visibleCount)
  );

  const handleClick = (path: string) => {
    setActivePath(path);
    // navigation can be triggered here if needed
  };

  const handleMoreClick = (event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
      setIsMoreActive(false);
    } else if (event) {
      setAnchorEl(event.currentTarget);
      setIsMoreActive(true);
    }
  };

  const handleMenuItemClick = (item: NavItem) => {
    setActivePath(item.path);
    
    // Move selected item from extraItems to visibleItems (second position)
    const newExtraItems = extraItems.filter(extraItem => extraItem.path !== item.path);
    const newVisibleItems = [...visibleItems];
    
    // Remove the last item from visible items and add it to extra items
    const lastVisibleItem = newVisibleItems.pop();
    if (lastVisibleItem) {
      newExtraItems.push(lastVisibleItem);
    }
    
    // Insert the selected item at position 1 (second position after Home)
    newVisibleItems.splice(1, 0, item);
    
    // Update state
    setVisibleItems(newVisibleItems);
    setExtraItems(newExtraItems);
    
    handleMoreClick(); // close menu
  };

  return (
    <div className="horizontal-navbar">
      <div className="nav-left">
        {visibleItems.map((item) => {
          // Only show active if this item is selected AND no dropdown item is selected
          const isActiveItem =
            activePath === item.path &&
            !extraItems.some((extraItem) => extraItem.path === activePath);
          return (
            <button
              key={item.path}
              type="button"
              className={`item ${isActiveItem ? "active" : ""}`}
              onClick={() => handleClick(item.path)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(item.path);
                }
              }}
              aria-label={`Navigate to ${item.label}`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
        {extraItems.length > 0 && (
          <button
            type="button"
            className={`more ${isMoreActive ? "active" : ""} ${
              extraItems.some((item) => item.path === activePath)
                ? "selected"
                : ""
            }`}
            onClick={(e) => handleMoreClick(e)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleMoreClick(e);
              }
            }}
            aria-label={`Show more navigation items (${extraItems.length})`}
            aria-expanded={isMoreActive}
            aria-haspopup="menu"
          >
            More{" "}
            <span
              className={`more-badge ${isMoreActive ? "active" : ""} ${
                extraItems.some((item) => item.path === activePath)
                  ? "selected"
                  : ""
              }`}
            >
              {extraItems.length}
            </span>
            {isMoreActive ? <CaretUp /> : <CaretDown />}
            <NavDropdownMenu
              anchorEl={anchorEl}
              isOpen={isMoreActive}
              extraItems={extraItems}
              activePath={activePath}
              onClose={() => handleMoreClick()}
              onSelect={handleMenuItemClick}
            />
          </button>
        )}
      </div>
      <div className="header-right">
        <HeaderIcons />
      </div>
    </div>
  );
};

export default HorizontalNavBar;
