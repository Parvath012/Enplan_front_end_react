import { combineReducers } from '@reduxjs/toolkit';
import userSlice from './userSlice';
import roleSlice from './roleSlice';
import groupSlice from './groupSlice';

const rootReducer = combineReducers({
  users: userSlice,
  roles: roleSlice,
  groups: groupSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
