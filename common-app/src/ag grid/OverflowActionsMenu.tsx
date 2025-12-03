// OverflowActionsMenu.tsx
import React, { useState, useCallback } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { OverflowMenuVertical } from '@carbon/icons-react';
import { ActionItem } from './Actions';
// or wherever ActionItem is declared

interface OverflowActionsMenuProps {
    actions: ActionItem[];
    row: any;
    onActionClick: (actionType: string, rowData: any) => void;
}

const OverflowActionsMenu: React.FC<OverflowActionsMenuProps> = ({ actions, row, onActionClick }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleMenuItemClick = useCallback(
        (actionType: string) => {
            onActionClick(actionType, row);
            handleClose();
        },
        [onActionClick, row, handleClose]
    );

    return (
        <>
            <IconButton
                aria-label="more"
                aria-controls="actions-menu"
                aria-haspopup="true"
                onClick={handleMenuClick}
                size="small"
            >
                <OverflowMenuVertical size={16} />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
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
};

export default React.memo(OverflowActionsMenu);
