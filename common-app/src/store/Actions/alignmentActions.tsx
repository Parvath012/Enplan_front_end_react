export const TOGGLE_WRAP_FOR_CELL = 'TOGGLE_WRAP_FOR_CELL';
export const CLEAR_ALL_WRAP = 'CLEAR_ALL_WRAP';

export const toggleWrapForCell = (rowId: string | number, field: string) => ({
    type: TOGGLE_WRAP_FOR_CELL,
    payload: { rowId, field },
});

export const clearAllWrap = () => ({
    type: CLEAR_ALL_WRAP,
});


export const toggleWrapForSelectedCells = () => {
    return (dispatch: any, getState: any) => {
        const state = getState();
        const selectedCells = state?.gridStore?.selectedCells;

        if (!Array.isArray(selectedCells)) return;

        selectedCells.forEach((cell: { rowId: string | number; field: string }) => {
            dispatch({
                type: TOGGLE_WRAP_FOR_CELL,
                payload: { rowId: cell.rowId, field: cell.field },
            });
        });
    };
};

