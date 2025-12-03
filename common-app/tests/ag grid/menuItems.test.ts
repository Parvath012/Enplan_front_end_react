import getMainMenuItems from '../../src/ag grid/menuItems';

describe('getMainMenuItems', () => {
  const makeParams = () => {
    const displayed = [
      { getColId: () => 'a' },
      { getColId: () => 'b' },
      { getColId: () => 'c' },
    ];
    const api = {
      getAllDisplayedColumns: jest.fn(() => displayed),
      moveColumns: jest.fn(),
      autoSizeColumns: jest.fn(),
      setColumnsVisible: jest.fn(),
      getColumnDefs: jest.fn(() => [{ field: 'a' }, { field: 'b' }]),
      setGridOption: jest.fn(),
    } as any;
    const column = { getColId: () => 'b' } as any;
    return { api, column } as any;
  };

  it('returns menu items with expected entries', () => {
    const params = makeParams();
    const items = getMainMenuItems(params);
    const names = items.filter((i: any) => typeof i === 'object').map((i: any) => i.name);
    expect(names).toEqual(expect.arrayContaining([
      'Configure Column',
      'Rename Column',
      'Auto-fit Column to Content',
      'Hide Column',
      'Move Column Left',
      'Move Column Right',
      'Sort Ascending (A to Z, 1 to 9)',
      'Sort Descending (Z to A, 9 to 1)'
    ]));
  });

  it('renames column via prompt, moves left/right, auto sizes, and hides', () => {
    const params = makeParams();
    const items = getMainMenuItems(params);
    // mock prompt
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('New Header');
    const rename = items.find((i: any) => typeof i === 'object' && i.name === 'Rename Column');
    rename.action();
    expect(params.api.setGridOption).toHaveBeenCalled();
    promptSpy.mockRestore();

    const auto = items.find((i: any) => typeof i === 'object' && i.name === 'Auto-fit Column to Content');
    auto.action();
    expect(params.api.autoSizeColumns).toHaveBeenCalledWith(['b']);

    const hide = items.find((i: any) => typeof i === 'object' && i.name === 'Hide Column');
    hide.action();
    expect(params.api.setColumnsVisible).toHaveBeenCalledWith(['b'], false);

    const left = items.find((i: any) => typeof i === 'object' && i.name === 'Move Column Left');
    const right = items.find((i: any) => typeof i === 'object' && i.name === 'Move Column Right');
    left.action();
    right.action();
    expect(params.api.moveColumns).toHaveBeenCalledTimes(2);
  });

  it('no-ops when column id missing', () => {
    const params = makeParams();
    (params as any).column = { getColId: () => undefined };
    const items = getMainMenuItems(params);
    const auto = items.find((i: any) => typeof i === 'object' && i.name === 'Auto-fit Column to Content');
    auto.action();
    expect(params.api.autoSizeColumns).not.toHaveBeenCalled();
  });
});


