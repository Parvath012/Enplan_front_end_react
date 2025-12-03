import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./Reducers/rootReducer";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['entitySetup/setFileUpload'],
        ignoredPaths: ['entitySetup.formData.entityLogo'],
      },
    }),
});

export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;

// Add proper typing for thunk actions
export type AppThunk<ReturnType = void> = (dispatch: AppDispatch, getState: () => RootState) => ReturnType;
