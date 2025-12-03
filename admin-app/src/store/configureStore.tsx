import { configureStore } from "@reduxjs/toolkit";
import TemplateReducer from "./Reducers/templateReducer";

const store = configureStore({
  reducer: {
    template: TemplateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
