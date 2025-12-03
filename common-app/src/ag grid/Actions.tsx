// ActionMenu.tsx
import React, { memo } from 'react';
import OverflowActionsMenu from './OverflowActionsMenu';

export interface ActionItem {
    label: string;
    action: string;
    icon?: React.ReactNode;
}

interface ActionsMenuProps {
    row: any;
    actions: ActionItem[];
    onActionClick: (actionType: string, rowData: any) => void;
}

const Actions: React.FC<ActionsMenuProps> = memo(({ row, actions, onActionClick }) => {
    return (
        <OverflowActionsMenu
            row={row}
            actions={actions}
            onActionClick={onActionClick}
        />
    );
});

export default Actions;
