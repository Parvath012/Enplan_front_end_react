/**
 * Reporting Structure Actions
 * Action creators and thunks for Reporting Structure feature
 */

import { createAction } from '@reduxjs/toolkit';
import { ViewByType } from '../../constants/reportingStructureConstants';

// Action types
export const REPORTING_STRUCTURE_ACTIONS = {
  SET_VIEW_TYPE: 'reportingStructure/setViewType',
  SET_LOADING: 'reportingStructure/setLoading',
  SET_ERROR: 'reportingStructure/setError',
} as const;

// Action creators
export const setViewType = createAction<ViewByType>(REPORTING_STRUCTURE_ACTIONS.SET_VIEW_TYPE);
export const setLoading = createAction<boolean>(REPORTING_STRUCTURE_ACTIONS.SET_LOADING);
export const setError = createAction<string | null>(REPORTING_STRUCTURE_ACTIONS.SET_ERROR);

