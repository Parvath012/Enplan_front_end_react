import React, { createContext, useContext } from "react";

/**
 * Context for managing sort menu state in the grid
 * Provides handlers for sorting actions and menu state
 */
export interface GridSortMenuContextType {
  onSortAsc?: (field: string, type?: string | null) => void;
  onSortDesc?: (field: string, type?: string | null) => void;
  anchorEl?: HTMLElement | null;
  menuField?: string | null;
  handleMenuOpen?: (
    event: React.MouseEvent<HTMLButtonElement>,
    field: string
  ) => void;
  handleMenuClose?: () => void;
  onClearSort?: (field: string) => void;
}

// Context for managing sort menu state in the grid
export const GridSortMenuContext = createContext<GridSortMenuContextType>({});

// Custom hook to use the GridSortMenuContext
// This hook provides access to the sort menu context in components
export const useGridSortMenu = () => useContext(GridSortMenuContext);
