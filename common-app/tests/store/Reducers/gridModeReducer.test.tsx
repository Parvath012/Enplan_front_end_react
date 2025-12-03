import reducer from '../../../src/store/Reducers/gridModeReducer';
import { TOGGLE_GRID_MODE } from '../../../src/store/Actions/gridModeActions';

describe('gridModeReducer', () => {
  it('toggles between modes', () => {
    const initial = reducer(undefined as any, { type: '@@INIT' } as any);
    expect(initial).toBe('muiDataGrid');
    const toggled = reducer(initial, { type: TOGGLE_GRID_MODE } as any);
    expect(toggled).toBe('agGrid');
    const back = reducer(toggled, { type: TOGGLE_GRID_MODE } as any);
    expect(back).toBe('muiDataGrid');
  });
});


