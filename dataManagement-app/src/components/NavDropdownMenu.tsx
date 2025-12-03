// NavDropdownMenu.tsx
import React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Box } from "@mui/material";

export interface NavItem {
  label: string;
  path: string;
}

interface NavDropdownMenuProps {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  extraItems: NavItem[];
  activePath: string;
  onClose: () => void;
  onSelect: (item: NavItem) => void;
}

const NavDropdownMenu: React.FC<NavDropdownMenuProps> = ({
  anchorEl,
  isOpen,
  extraItems,
  activePath,
  onClose,
  onSelect,
}) => {


  return (
    <Menu
      id="fade-menu"
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      autoFocus={false}
      slotProps={{
        paper: {
          style: {
            marginTop: 0,
            width: 200,
            maxHeight: 168, // 4 items * 42px = 168px
            overflowY: "hidden",
            position: "relative",
          },
        },
      }}
    >
      <Box sx={{ position: "relative", width: "100%" }}>
        {extraItems.map((item) => {
          const isSelected = activePath === item.path;
          return (
            <MenuItem
              key={item.path}
              selected={isSelected}
              onClick={(e) => {
                e.preventDefault();
                onSelect(item);
              }}
              sx={{
                width: "200px",
                height: "42px",
                minHeight: "42px",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "12px",
                color: "#5F6368",
                textAlign: "left",
                fontFamily: "'Inter18pt-Regular', 'Inter 18pt', sans-serif",
                padding: "0 16px",
                paddingTop: "0",
                paddingBottom: "0",
                display: "flex",
                alignItems: "center",
                backgroundColor: "transparent",
                borderLeft: isSelected
                  ? "3px solid #1976d2"
                  : "3px solid transparent",
                // Override all default Material-UI selected styling
                "&.Mui-selected": {
                  backgroundColor: "transparent !important",
                  borderLeft: "3px solid #1976d2 !important",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "transparent !important",
                  borderLeft: "3px solid #1976d2 !important",
                },
                // Non-selected hover behavior
                "&:not(.Mui-selected):hover": {
                  backgroundColor: "#e8e7e7",
                  borderLeft: "3px solid transparent",
                },
                "&:not(.Mui-selected)": {
                  borderLeft: "3px solid transparent",
                },
                "&.Mui-focusVisible": {
                  backgroundColor: "transparent !important",
                },
                "& .MuiTouchRipple-root": {
                  display: "none",
                },
                // Force the border color based on selection state
                ...(isSelected && {
                  borderLeft: "3px solid #1976d2 !important",
                }),
              }}
            >
              {item.label}
            </MenuItem>
          );
        })}
      </Box>
    </Menu>
  );
};

export default NavDropdownMenu;
