import React, { useState, useCallback, memo } from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { Column, OverflowMenuVertical } from '@carbon/icons-react';
import { GridFields } from '../../../../constants/gridFields';

// Interface defining the structure of an action item
export interface ActionItem {
  label: string;      // Text displayed for the action
  action: string;     // Unique identifier for the action
  icon?: React.ReactNode;  // Optional icon for the action
}

// Props interface for the Actions Column configuration
interface ActionsColumnProps {
  onActionClick: (actionType: string, rowData: any) => void;  // Callback function when an action is clicked
  actions?: ActionItem[];  // Optional array of action items
  width?: number;  // Optional width for the column
  field?: string;
}

// Function to generate a dynamic actions column for data grid
export const getActionsColumn = ({
  onActionClick,
  actions = [],
  width = 100,
  field = GridFields.Action,
}: ActionsColumnProps): GridColDef => {

  // Memoized component for rendering actions menu
  const ActionsMenuWrapper = memo(({ row }: { row: any }) => {
    // State to manage anchor element for menu
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Handler to open the menu
    const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    }, []);

    // Handler to close the menu
    const handleClose = useCallback(() => {
      setAnchorEl(null);
    }, []);

    // Handler for menu item click
    const handleMenuItemClick = useCallback((actionType: string) => {
      onActionClick(actionType, row);  // Trigger action callback
      handleClose();  // Close menu after action
    }, [onActionClick, row, handleClose]);

    return (
      <>
        {/* Overflow menu button */}
        <IconButton
          aria-label="more"
          aria-controls="actions-menu"
          aria-haspopup="true"
          onClick={handleMenuClick}
          size="small"
        >
          <OverflowMenuVertical size={16} />
        </IconButton>

        {/* Dropdown menu for actions */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {/* Render menu items dynamically */}
          {actions.map(({ label, action, icon }) => (
            <MenuItem
              key={action}
              onClick={(event) => {
                event.stopPropagation();
                handleMenuItemClick(action);
              }}
            >
              {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
              {label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  });

  // Return column configuration for data grid
  return {
    field,
    type: 'actions',
    width,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    resizable: true,
    // Render actions menu for each row
    renderCell: (params: GridRenderCellParams) => (
      <ActionsMenuWrapper row={params.row} />
    ),
    // Render column header icon
    renderHeader: () => (
      <Column size={16} height={18} style={{ color: '#818586' }} />
    ),
  };
};