import { TOGGLE_WRAP_FOR_CELL, CLEAR_ALL_WRAP } from '../Actions/alignmentActions';

export interface AlignmentState {
  wrapConfig: Record<string, boolean>; // key: 'rowId|field'
}

const initialState: AlignmentState = {
  wrapConfig: {},
};

export const alignmentReducer = (state = initialState, action: any): AlignmentState => {
  switch (action.type) {
    case TOGGLE_WRAP_FOR_CELL: {
      const { rowId, field } = action.payload;
      const key = `${rowId}|${field}`;
      const current = state.wrapConfig[key] || false;

      return {
        ...state,
        wrapConfig: {
          ...state.wrapConfig,
          [key]: !current,
        },
      };
    }

    case CLEAR_ALL_WRAP:
      return { ...state, wrapConfig: {} };

    default:
      return state;
  }
};

export default alignmentReducer;
