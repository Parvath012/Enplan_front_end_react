import { combineReducers } from '@reduxjs/toolkit';
import entitySetupReducer from './entitySetupReducer';
import entitySlice from './entitySlice';
import entityConfigurationReducer from './entityConfigurationReducer';
import periodSetupReducer from './periodSetupReducer';

const rootReducer = combineReducers({
  entitySetup: entitySetupReducer,
  entities: entitySlice,
  entityConfiguration: entityConfigurationReducer,
  periodSetup: periodSetupReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
