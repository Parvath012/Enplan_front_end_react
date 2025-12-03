// ActionsCellRenderer.tsx
import React from "react";
import Actions, { ActionItem } from "./Actions";

interface Props {
    data: any;
    actions: ActionItem[];
    onActionClick: (actionType: string, rowData: any) => void;
}

const ActionsCellRenderer: React.FC<Props> = ({ data, actions, onActionClick }) => {
    return (
        <Actions
            row={data}
            actions={actions}
            onActionClick={onActionClick}
        />
    );
};

export default ActionsCellRenderer;
