import {
    TOGGLE_WRAP_FOR_CELL,
    CLEAR_ALL_WRAP,
    toggleWrapForCell,
    clearAllWrap,
    toggleWrapForSelectedCells
} from '../../../src/store/Actions/alignmentActions';

import { alignmentReducer } from '../../../src/store/Reducers/alignmentReducer';

describe('Alignment Actions', () => {
    describe('Action Type Constants', () => {
        it('should have correct constants', () => {
            expect(TOGGLE_WRAP_FOR_CELL).toBe('TOGGLE_WRAP_FOR_CELL');
            expect(CLEAR_ALL_WRAP).toBe('CLEAR_ALL_WRAP');
        });
    });

    describe('toggleWrapForCell', () => {
        it('creates action with string rowId', () => {
            const action = toggleWrapForCell('123', 'name');
            expect(action).toEqual({
                type: TOGGLE_WRAP_FOR_CELL,
                payload: { rowId: '123', field: 'name' }
            });
        });

        it('creates action with numeric rowId', () => {
            const action = toggleWrapForCell(456, 'description');
            expect(action).toEqual({
                type: TOGGLE_WRAP_FOR_CELL,
                payload: { rowId: 456, field: 'description' }
            });
        });

        it('creates action with empty field', () => {
            const action = toggleWrapForCell(789, '');
            expect(action).toEqual({
                type: TOGGLE_WRAP_FOR_CELL,
                payload: { rowId: 789, field: '' }
            });
        });
    });

    describe('clearAllWrap', () => {
        it('creates action to clear all wraps', () => {
            const action = clearAllWrap();
            expect(action).toEqual({ type: CLEAR_ALL_WRAP });
        });
    });

    describe('toggleWrapForSelectedCells', () => {
        it('dispatches TOGGLE_WRAP_FOR_CELL for each selected cell', () => {
            const selectedCells = [
                { rowId: '1', field: 'name' },
                { rowId: '2', field: 'description' }
            ];

            const dispatch = jest.fn();
            const getState = () => ({ gridStore: { selectedCells } });

            toggleWrapForSelectedCells()(dispatch, getState);

            expect(dispatch).toHaveBeenCalledWith({
                type: TOGGLE_WRAP_FOR_CELL,
                payload: { rowId: '1', field: 'name' }
            });

            expect(dispatch).toHaveBeenCalledWith({
                type: TOGGLE_WRAP_FOR_CELL,
                payload: { rowId: '2', field: 'description' }
            });
        });

        it('handles empty selected cells scenario', () => {
            const dispatch = jest.fn();
            const getState = () => ({ gridStore: { selectedCells: [] } });

            toggleWrapForSelectedCells()(dispatch, getState);

            expect(dispatch).not.toHaveBeenCalled();
        });

        it('handles undefined gridStore gracefully', () => {
            const dispatch = jest.fn();
            const getState = () => ({});

            toggleWrapForSelectedCells()(dispatch, getState);

            expect(dispatch).not.toHaveBeenCalled();
        });

        it('handles null selectedCells gracefully', () => {
            const dispatch = jest.fn();
            const getState = () => ({ gridStore: { selectedCells: null } });

            toggleWrapForSelectedCells()(dispatch, getState);

            expect(dispatch).not.toHaveBeenCalled();
        });

        it('handles non-array selectedCells', () => {
            const dispatch = jest.fn();
            const getState = () => ({ gridStore: { selectedCells: {} } });

            toggleWrapForSelectedCells()(dispatch, getState);

            expect(dispatch).not.toHaveBeenCalled();
        });

        it('handles mixed type selected cells', () => {
            const selectedCells = [
                { rowId: 1, field: 'name' },
                { rowId: '2', field: 'description' }
            ];

            const dispatch = jest.fn();
            const getState = () => ({ gridStore: { selectedCells } });

            toggleWrapForSelectedCells()(dispatch, getState);

            expect(dispatch).toHaveBeenCalledWith({
                type: TOGGLE_WRAP_FOR_CELL,
                payload: { rowId: 1, field: 'name' }
            });

            expect(dispatch).toHaveBeenCalledWith({
                type: TOGGLE_WRAP_FOR_CELL,
                payload: { rowId: '2', field: 'description' }
            });
        });


        it('skips if cell field is undefined', () => {
            const selectedCells = [
                { rowId: '1' },
                { rowId: '2', field: 'validField' }
            ];

            const dispatch = jest.fn();
            const getState = () => ({ gridStore: { selectedCells } });

            toggleWrapForSelectedCells()(dispatch, getState);

            expect(dispatch).toHaveBeenCalledTimes(2);
            expect(dispatch).toHaveBeenCalledWith({
                type: TOGGLE_WRAP_FOR_CELL,
                payload: { rowId: '2', field: 'validField' }
            });
        });
    });
});

describe('alignmentReducer', () => {
    it('should return the initial state', () => {
        expect(alignmentReducer(undefined, {})).toEqual({ wrapConfig: {} });
    });

    it('should handle TOGGLE_WRAP_FOR_CELL by toggling state from false to true', () => {
        const action = {
            type: TOGGLE_WRAP_FOR_CELL,
            payload: { rowId: '1', field: 'name' }
        };
        const state = alignmentReducer(undefined, action);
        expect(state.wrapConfig).toEqual({ '1|name': true });
    });

    it('should handle TOGGLE_WRAP_FOR_CELL by toggling state from true to false', () => {
        const initialState = {
            wrapConfig: { '1|name': true }
        };
        const action = {
            type: TOGGLE_WRAP_FOR_CELL,
            payload: { rowId: '1', field: 'name' }
        };
        const state = alignmentReducer(initialState, action);
        expect(state.wrapConfig).toEqual({ '1|name': false });
    });

    it('should handle CLEAR_ALL_WRAP by resetting wrapConfig', () => {
        const initialState = {
            wrapConfig: { '1|name': true, '2|desc': false }
        };
        const action = { type: CLEAR_ALL_WRAP };
        const state = alignmentReducer(initialState, action);
        expect(state.wrapConfig).toEqual({});
    });

    it('should return the same state for unknown action type', () => {
        const initialState = {
            wrapConfig: { '1|name': true }
        };
        const action = { type: 'UNKNOWN_ACTION' };
        const state = alignmentReducer(initialState, action);
        expect(state).toEqual(initialState);
    });
});
