// Action type
export const TOGGLE_GRID_MODE = 'TOGGLE_GRID_MODE';

// TypeScript type for allowed values
export type GridMode = 'muiDataGrid' | 'agGrid';

// Action interface
export interface ToggleGridAction {
  type: typeof TOGGLE_GRID_MODE;
}

// Action creator (default export)
const toggleGridMode = (): ToggleGridAction => ({
  type: TOGGLE_GRID_MODE,
});

export default toggleGridMode;
