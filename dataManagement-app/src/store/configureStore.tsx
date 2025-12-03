import { configureStore } from "@reduxjs/toolkit";
import authReducer from './Reducers/authReducer';
import nifiReducer from './Reducers/nifiReducer';

export const store = configureStore({
  reducer: {
    authStore: authReducer,
    nifi: nifiReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
