import { PeriodSetupState } from '../store/Reducers/periodSetupReducer';
import { DEFAULT_PERIOD_SETUP_ENTITY_STATE } from '../constants/periodSetupConstants';

/**
 * Ensures that a period setup entity state exists, creating it with default values if it doesn't
 * @param state - The current period setup state
 * @param entityId - The entity ID to check/create
 * @returns The existing or newly created entity state
 */
export const ensureEntityStateExists = (state: PeriodSetupState, entityId: string) => {
  if (!state[entityId]) {
    state[entityId] = { ...DEFAULT_PERIOD_SETUP_ENTITY_STATE };
  }
  return state[entityId];
};

/**
 * Creates a new entity state with default values
 * @returns A new entity state with default values
 */
export const createDefaultEntityState = () => {
  return { ...DEFAULT_PERIOD_SETUP_ENTITY_STATE };
};
