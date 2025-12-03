import React from "react";
import { Menu, MenuItem } from "@mui/material";
import CustomMenuIcon from "./CustomMenuIcon";
import { useGridSortMenu } from "./GridSortMenuContext";

/**
 * ColumnMenu component
 * Renders a menu for sorting options for a specific column in the data grid
 */
export interface ColumnMenuProps {
  field: string;
  menuIcon?: React.ReactNode;
}

/**
 * ColumnMenu component
 * This component provides a menu for sorting options for a specific column in the grid
 * It allows users to sort by alphanumeric, numeric, date, fill color, and font color
 * It uses the GridSortMenuContext to manage the menu state and sorting actions
 */
const ColumnMenu: React.FC<ColumnMenuProps> = ({ field, menuIcon }) => {
  const {
    anchorEl,
    menuField,
    handleMenuOpen,
    handleMenuClose,
    onSortAsc,
    onSortDesc,
  } = useGridSortMenu();

  return (
    <>
      <CustomMenuIcon
        className="custom-menu-icon"
        icon={menuIcon}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          handleMenuOpen?.(event, field);
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && menuField === field}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            onSortAsc?.(field, "alphanumeric");
            handleMenuClose?.();
          }}
        >
          Alphanumeric (A-Z, 1-9)
        </MenuItem>
        <MenuItem
          onClick={() => {
            onSortDesc?.(field, "alphanumeric");
            handleMenuClose?.();
          }}
        >
          Alphanumeric (Z-A, 9-1)
        </MenuItem>
        <MenuItem
          onClick={() => {
            onSortAsc?.(field, "numeric");
            handleMenuClose?.();
          }}
        >
          Numerical (Smallest-to-Largest)
        </MenuItem>
        <MenuItem
          onClick={() => {
            onSortDesc?.(field, "numeric");
            handleMenuClose?.();
          }}
        >
          Numerical (Largest-to-Smallest)
        </MenuItem>
        <MenuItem
          onClick={() => {
            onSortAsc?.(field, "date");
            handleMenuClose?.();
          }}
        >
          Date (Earliest-to-Latest)
        </MenuItem>
        <MenuItem
          onClick={() => {
            onSortDesc?.(field, "date");
            handleMenuClose?.();
          }}
        >
          Date (Latest-to-Earliest)
        </MenuItem>
        <MenuItem
          onClick={() => {
            onSortAsc?.(field, "fillColor");
            handleMenuClose?.();
          }}
        >
          Fill Color (Asc)
        </MenuItem>
        <MenuItem
          onClick={() => {
            onSortDesc?.(field, "fillColor");
            handleMenuClose?.();
          }}
        >
          Fill Color (Desc)
        </MenuItem>
        <MenuItem
          onClick={() => {
            onSortAsc?.(field, "fontColor");
            handleMenuClose?.();
          }}
        >
          Font Color (Asc)
        </MenuItem>
        <MenuItem
          onClick={() => {
            onSortDesc?.(field, "fontColor");
            handleMenuClose?.();
          }}
        >
          Font Color (Desc)
        </MenuItem>
      </Menu>
    </>
  );
};

export default ColumnMenu;
