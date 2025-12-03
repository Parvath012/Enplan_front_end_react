import { configureStore } from "@reduxjs/toolkit";
import authReducer from './Reducers/authReducer';
import dataReducer from "./Reducers/dataReducer";
import selectedCellsReducer from "./Reducers/gridReducer";
import alignmentReducer from "./Reducers/alignmentReducer";
import { RootState } from "./Reducers/rootReducer";
import gridModeReducer from "./Reducers/gridModeReducer";

// Export RootState type for use in components
export type { RootState };

const store = configureStore({
  reducer: {
    authStore: authReducer,
    dataStore: dataReducer,
    gridStore: selectedCellsReducer,
    alignmentStore: alignmentReducer,
    gridModeStore: gridModeReducer,
  },
});

export default store;
