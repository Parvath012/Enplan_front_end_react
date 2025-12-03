import store, { RootState, AppDispatch } from '../../src/store/configureStore';

describe('configureStore', () => {
    it('should create a store with the template reducer', () => {
        const state: RootState = store.getState();
        expect(state).toHaveProperty('template');
    });

    it('should have dispatch and getState methods', () => {
        expect(typeof store.dispatch).toBe('function');
        expect(typeof store.getState).toBe('function');
    });

    it('AppDispatch should be assignable from store.dispatch', () => {
        const dispatch: AppDispatch = store.dispatch;
        expect(dispatch).toBe(store.dispatch);
    });
});