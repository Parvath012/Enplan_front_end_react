import {
  GetMainMenuItemsParams,
  MenuItemDef
} from 'ag-grid-community';

const getMainMenuItems = (
  params: GetMainMenuItemsParams
): MenuItemDef[] => {
  const { column, api } = params;
  const colId = column?.getColId();

  const moveColumn = (direction: 'left' | 'right') => {
    if (!colId) return;

    const displayedCols = api.getAllDisplayedColumns();
    const currentIndex = displayedCols.findIndex((col) => col.getColId() === colId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= displayedCols.length) return;

    api.moveColumns([colId], newIndex);
  };

  const items: MenuItemDef[] = [
    {
      name: 'Configure Column',
      disabled: true,
    },
    {
      name: 'Rename Column',
      action: () => {
        if (!colId) return;
        const newName = prompt(`Rename column "${colId}":`);
        if (newName) {
          const newDefs = api.getColumnDefs()?.map((def: any) => {
            if (def.field === colId) {
              return { ...def, headerName: newName };
            }
            return def;
          });
          api.setGridOption('columnDefs', newDefs);
        }
      }
    },
    'separator',
    {
      name: 'Insert Column Left',
      disabled: true
    },
    {
      name: 'Insert Column Right',
      disabled: true
    },
    {
      name: 'Auto-fit Column to Content',
      action: () => colId && api.autoSizeColumns([colId])
    },
    'separator',
    {
      name: 'Hide Column',
      action: () => colId && api.setColumnsVisible([colId], false)
    },
    {
      name: 'Delete Column',
      disabled: true
    },
    'separator',
    {
      name: 'Move Column Left',
      action: () => moveColumn('left')
    },
    {
      name: 'Move Column Right',
      action: () => moveColumn('right')
    },
     'separator',
    {
      name: 'Sort Ascending (A to Z, 1 to 9)',
    //   action: () => moveColumn('left')
    },
    {
      name: 'Sort Descending (Z to A, 9 to 1)',
      action: () => moveColumn('right')
    }
  ];

  return items;
};

export default getMainMenuItems;
