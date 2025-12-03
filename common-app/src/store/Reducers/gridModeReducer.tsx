import { GridMode, TOGGLE_GRID_MODE, ToggleGridAction } from "../Actions/gridModeActions";

const initialState: GridMode = 'muiDataGrid';

const gridModeReducer = (
    state = initialState,
    action: ToggleGridAction
): GridMode => {
    if (action.type === TOGGLE_GRID_MODE) {
        return state === 'muiDataGrid' ? 'agGrid' : 'muiDataGrid';
    }

    return state;
};

export default gridModeReducer;
