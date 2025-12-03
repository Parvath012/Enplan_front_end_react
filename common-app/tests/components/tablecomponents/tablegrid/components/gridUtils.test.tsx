import { GridCellParams, GridRenderCellParams, GridRenderEditCellParams } from '@mui/x-data-grid';
import React from 'react';
import { render } from '@testing-library/react';
import { ColumnConfiguration, ColumnSchema } from '../../../../../src/components/tablecomponents/tablegrid/types';
import { generateColumns } from '../../../../../src/components/tablecomponents/tablegrid/components/gridUtils';
import { GridFields } from '../../../../../src/constants/gridFields';

// Mock dependencies
const mockCalls = {
    GridCellRenderer: [] as any[],
    CustomSortIcon: [] as any[],
    CustomMenuIcon: [] as any[],
    CustomEditCell: [] as any[],
    ActionsColumn: [] as any[]
};

jest.mock('../../../../../src/components/tablecomponents/tablegrid/components/GridCellRenderer', () => ({
    __esModule: true,
    default: jest.fn((props) => {
        mockCalls.GridCellRenderer.push(props);
        return <div data-testid="grid-cell-renderer">{JSON.stringify(props)}</div>;
    })
}));

jest.mock('../../../../../src/components/tablecomponents/tablegrid/components/CustomSortIcon', () => ({
    __esModule: true,
    default: jest.fn((props) => {
        mockCalls.CustomSortIcon.push(props);
        return <div data-testid="custom-sort-icon">{JSON.stringify(props)}</div>;
    })
}));

jest.mock('../../../../../src/components/tablecomponents/tablegrid/components/CustomMenuIcon', () => ({
    __esModule: true,
    default: jest.fn((props) => {
        mockCalls.CustomMenuIcon.push(props);
        return <div data-testid="custom-menu-icon">{JSON.stringify(props)}</div>;
    })
}));

jest.mock('../../../../../src/components/tablecomponents/tablegrid/components/CustomEditCell', () => ({
    __esModule: true,
    default: jest.fn((props) => {
        mockCalls.CustomEditCell.push(props);
        return <div data-testid="custom-edit-cell">{JSON.stringify(props)}</div>;
    })
}));

jest.mock('../../../../../src/components/tablecomponents/tablegrid/components/BulkEditButton', () => ({
    __esModule: true,
    default: jest.fn(() => {
        return <div data-testid="bulk-edit-button">Bulk Edit Button</div>;
    })
}));

jest.mock('../../../../../src/components/tablecomponents/tablegrid/components/ActionsColumn', () => ({
    getActionsColumn: jest.fn((config) => {
        mockCalls.ActionsColumn.push(config);
        return {
            field: GridFields.Action,
            headerName: 'Actions',
            width: config.width || 100
        };
    })
}));

describe('generateColumns', () => {
    const mockSchema: ColumnSchema[] = [
        {
            aliasName: 'Status',
            dataType: 'string',
            columnName: 'status',
        },
        {
            aliasName: 'Priority',
            dataType: 'string',
            columnName: 'priority',
        },
        {
            aliasName: 'Name',
            dataType: 'string',
            columnName: 'name',
        }
    ];

    const mockTableConfiguration: ColumnConfiguration[] = [
        {
            aliasName: 'Status',
            columnName: 'status',
            type: 'select',
            isEditable: true
        },
        {
            aliasName: 'Priority',
            columnName: 'priority',
            type: '',
            isEditable: true
        },
        {
            aliasName: 'Name',
            columnName: 'name',
            type: '',
            isEditable: false
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockCalls.GridCellRenderer = [];
        mockCalls.CustomSortIcon = [];
        mockCalls.CustomMenuIcon = [];
        mockCalls.CustomEditCell = [];
        mockCalls.ActionsColumn = [];
    });

    describe('Column Generation Features', () => {
        test('renders cell with style resolver and editable background', () => {
            const mockStyleResolver = jest.fn().mockReturnValue({ color: 'red' });
            const mockParams: GridRenderCellParams = {
                id: 1,
                field: 'Status',
                value: 'Open',
                row: {},
                colDef: { editable: true },
                api: {} as any,
                getValue: jest.fn(),
                isEditable: true,
                formattedValue: '',
                hasFocus: false,
                tabIndex: 0
            };

            const columns = generateColumns(
                {
                    schema: mockSchema,
                    tableConfiguration: mockTableConfiguration,
                    columnWidths: { Status: 200 }
                },
                mockStyleResolver,
                false
            );

            const renderCell = columns[0].renderCell;
            expect(renderCell).toBeDefined();
            
            if (renderCell) {
                render(<div>{renderCell(mockParams)}</div>);
                expect(mockCalls.GridCellRenderer).toHaveLength(1);
                expect(mockCalls.GridCellRenderer[0].style).toEqual({
                    backgroundColor: 'rgb(232, 241, 254)',
                    color: 'red'
                });
                expect(mockStyleResolver).toHaveBeenCalledWith(mockParams);
            }
        });

        test('renders cell with selected cell class', () => {
            const columns = generateColumns({
                schema: mockSchema,
                tableConfiguration: mockTableConfiguration,
                selectedCells: [{ rowId: 1, field: 'Status' }],
                columnWidths: {}
            });

            const renderCell = columns[0].renderCell;
            expect(renderCell).toBeDefined();

            if (renderCell) {
                const mockParams: GridRenderCellParams = {
                    id: 1,
                    field: 'Status',
                    value: 'Open',
                    row: {},
                    colDef: { editable: true },
                    api: {} as any,
                    getValue: jest.fn(),
                    isEditable: true,
                    formattedValue: '',
                    hasFocus: false,
                    tabIndex: 0
                };

                render(<div>{renderCell(mockParams)}</div>);
                expect(mockCalls.GridCellRenderer[0].className).toBe('selected-cell');
            }
        });

        test('renders select column with custom edit cell', () => {
            const columns = generateColumns(
                {
                    schema: mockSchema,
                    tableConfiguration: mockTableConfiguration,
                    columnWidths: {}
                }
            );

            const renderEditCell = columns[0].renderEditCell;
            expect(renderEditCell).toBeDefined();

            if (renderEditCell) {
                const editParams: GridRenderEditCellParams = {
                    id: 1,
                    value: 'Open',
                    field: 'Status',
                    api: {} as any,
                    row: {},
                    cellMode: 'edit'
                };

                render(<div>{renderEditCell(editParams)}</div>);
                expect(mockCalls.CustomEditCell).toHaveLength(1);
                expect(mockCalls.CustomEditCell[0].type).toBe('select');
                expect(mockCalls.CustomEditCell[0].options).toEqual(['Open', 'In Progress', 'Closed']);
            }
        });

        test('renders header with custom menu icon', () => {
            const mockMenuIcon = <div data-testid="custom-menu-icon" />;
            const mockMenuOptions = {
                icon: mockMenuIcon
            };

            const columns = generateColumns(
                {
                    schema: mockSchema,
                    tableConfiguration: mockTableConfiguration,
                    columnWidths: {}
                },
                undefined,
                false,
                undefined,
                undefined,
                undefined,
                mockMenuOptions
            );

            const renderHeader = columns[0].renderHeader;
            expect(renderHeader).toBeDefined();

            if (renderHeader) {
                const headerParams = {
                    colDef: {
                        headerName: 'Status',
                        sortDirection: 'asc'
                    }
                };

                render(<div>{renderHeader(headerParams)}</div>);
                expect(mockCalls.CustomSortIcon).toHaveLength(1);
                expect(mockCalls.CustomMenuIcon).toHaveLength(1);
            }
        });

        test('adds actions column when enabled', () => {
            const mockActionClick = jest.fn();
            const actionMenuItems = [{ label: 'Edit', action: 'edit' }];

            const columns = generateColumns(
                {
                    schema: mockSchema,
                    tableConfiguration: mockTableConfiguration,
                    columnWidths: { [GridFields.Action]: 150 }
                },
                undefined,
                true,
                mockActionClick,
                actionMenuItems,
                150
            );

            expect(columns).toHaveLength(4); // 3 original + 1 actions column
            expect(columns[3]).toEqual(
                expect.objectContaining({
                    field: GridFields.Action,
                    headerName: 'Actions',
                    width: 150
                })
            );
        });

        test('handles column with right border class', () => {
            const columns = generateColumns({
                schema: mockSchema,
                tableConfiguration: mockTableConfiguration,
                columnWidths: {}
            });

            const cellClassName = columns[0].cellClassName;
            expect(cellClassName).toBeDefined();

            if (typeof cellClassName === 'function') {
                const result = cellClassName({
                    colDef: { editable: true },
                    field: 'Status'
                } as GridCellParams);
                expect(result).toBe('right-border');
            }
        });
    });

    describe('Advanced Scenarios', () => {
        test('handles multiple select columns with different options', () => {
            const extendedSchema: ColumnSchema[] = [
                ...mockSchema,
                {
                    aliasName: 'Department',
                    dataType: 'string',
                    columnName: 'department',
                }
            ];

            const extendedConfiguration: ColumnConfiguration[] = [
                ...mockTableConfiguration,
                {
                    aliasName: 'Department',
                    columnName: 'department',
                    type: 'select',
                    isEditable: true
                }
            ];

            const columns = generateColumns({
                schema: extendedSchema,
                tableConfiguration: extendedConfiguration,
                columnWidths: {}
            });

            const departmentColumn = columns.find(col => col.field === 'Department');
            expect(departmentColumn).toBeDefined();
            
            if (departmentColumn && departmentColumn.renderEditCell) {
                const editParams: GridRenderEditCellParams = {
                    id: 1,
                    value: '',
                    field: 'Department',
                    api: {} as any,
                    row: {},
                    cellMode: 'edit'
                };

                render(<div>{departmentColumn.renderEditCell(editParams)}</div>);
                expect(mockCalls.CustomEditCell).toHaveLength(1);
                expect(mockCalls.CustomEditCell[0].options).toEqual(undefined);
            }
        });

        test('handles actions column with custom action items', () => {
            const mockActionClick = jest.fn();
            const actionMenuItems = [
                { label: 'Edit', action: 'edit', icon: <div>Edit Icon</div> },
                { label: 'Delete', action: 'delete', icon: <div>Delete Icon</div> }
            ];

            const columns = generateColumns(
                {
                    schema: mockSchema,
                    tableConfiguration: mockTableConfiguration,
                    columnWidths: {}
                },
                undefined,
                true,
                mockActionClick,
                actionMenuItems,
                200
            );

            expect(columns).toHaveLength(4);
            expect(mockCalls.ActionsColumn[0].actions).toEqual(actionMenuItems);
            expect(mockCalls.ActionsColumn[0].onActionClick).toBe(mockActionClick);
        });
    });

    describe('Edge Cases', () => {
        test('handles empty schema', () => {
            const columns = generateColumns({
                schema: [],
                columnWidths: {}
            });
            expect(columns).toHaveLength(0);
        });

        test('handles schema with no configuration', () => {
            const unconfiguredSchema: ColumnSchema[] = [{
                aliasName: 'Unconfigured',
                dataType: 'string',
                columnName: 'unconfigured',
            }];

            const columns = generateColumns({
                schema: unconfiguredSchema,
                columnWidths: {}
            });

            expect(columns[0].editable).toBe(false);
            expect(columns[0].type).toBe('string');
        });

        test('handles column with no configuration and non-select type', () => {
            const unconfiguredSchema: ColumnSchema[] = [{
                aliasName: 'Unconfigured',
                dataType: 'number',
                columnName: 'unconfigured',
            }];

            const columns = generateColumns({
                schema: unconfiguredSchema,
                columnWidths: {}
            });

            expect(columns[0].editable).toBe(false);
            expect(columns[0].type).toBe('string');
        });

        test('handles select column without predefined options', () => {
            const customSchema: ColumnSchema[] = [{
                aliasName: 'CustomStatus',
                dataType: 'string',
                columnName: 'custom_status',
            }];

            const customConfiguration: ColumnConfiguration[] = [{
                aliasName: 'CustomStatus',
                columnName: 'custom_status',
                type: 'select',
                isEditable: true
            }];

            const columns = generateColumns({
                schema: customSchema,
                tableConfiguration: customConfiguration,
                columnWidths: {}
            });

            const renderEditCell = columns[0].renderEditCell;
            expect(renderEditCell).toBeDefined();

            if (renderEditCell) {
                const editParams: GridRenderEditCellParams = {
                    id: 1,
                    value: '',
                    field: 'CustomStatus',
                    api: {} as any,
                    row: {},
                    cellMode: 'edit',
                    rowNode: undefined,
                    colDef: undefined,
                    hasFocus: false,
                    tabIndex: 0
                };

                render(<div>{renderEditCell(editParams)}</div>);
                expect(mockCalls.CustomEditCell).toHaveLength(1);
                expect(mockCalls.CustomEditCell[0].options).toEqual(undefined);
            }
        });
    });

    describe('Additional Coverage Scenarios', () => {
        test('handles header rendering with no sort direction', () => {
            const columns = generateColumns({
                schema: mockSchema,
                tableConfiguration: mockTableConfiguration,
                columnWidths: {}
            });

            const renderHeader = columns[0].renderHeader;
            expect(renderHeader).toBeDefined();

            if (renderHeader) {
                const headerParams = {
                    colDef: {
                        headerName: 'Status'
                        // No sortDirection
                    }
                };

                render(<div>{renderHeader(headerParams)}</div>);
                expect(mockCalls.CustomSortIcon).toHaveLength(1);
                expect(mockCalls.CustomMenuIcon).toHaveLength(1);
            }
        });

        test('handles actions column with no width specified', () => {
            const mockActionClick = jest.fn();
            const actionMenuItems = [{ label: 'Edit', action: 'edit' }];

            const columns = generateColumns(
                {
                    schema: mockSchema,
                    tableConfiguration: mockTableConfiguration,
                    columnWidths: {}
                },
                undefined,
                true,
                mockActionClick,
                actionMenuItems
            );

            expect(columns).toHaveLength(4);
            expect(mockCalls.ActionsColumn[0].width).toBe(undefined); // Default width
        });

        test('handles cell rendering with no style resolver', () => {
            const columns = generateColumns({
                schema: mockSchema,
                tableConfiguration: mockTableConfiguration,
                columnWidths: {}
            });

            const renderCell = columns[0].renderCell;
            expect(renderCell).toBeDefined();

            if (renderCell) {
                const mockParams: GridRenderCellParams = {
                    id: 1,
                    field: 'Status',
                    value: 'Open',
                    row: {},
                    colDef: { editable: true },
                    api: {} as any,
                    getValue: jest.fn(),
                    isEditable: true,
                    formattedValue: '',
                    hasFocus: false,
                    tabIndex: 0
                };

                render(<div>{renderCell(mockParams)}</div>);
                expect(mockCalls.GridCellRenderer[0].style).toEqual({
                    backgroundColor: 'rgb(232, 241, 254)'
                });
            }
        });

        test('handles menu icon options with no menu items', () => {
            const mockMenuIcon = <div data-testid="custom-menu-icon" />;
            const mockMenuOptions = {
                icon: mockMenuIcon
            };

            const columns = generateColumns(
                {
                    schema: mockSchema,
                    tableConfiguration: mockTableConfiguration,
                    columnWidths: {}
                },
                undefined,
                false,
                undefined,
                undefined,
                undefined,
                mockMenuOptions
            );

            const renderHeader = columns[0].renderHeader;
            expect(renderHeader).toBeDefined();

            if (renderHeader) {
                const headerParams = {
                    colDef: {
                        headerName: 'Status',
                        sortDirection: 'desc'
                    }
                };

                render(<div>{renderHeader(headerParams)}</div>);
                expect(mockCalls.CustomSortIcon).toHaveLength(1);
                expect(mockCalls.CustomMenuIcon).toHaveLength(1);
            }
        });
    });

    describe('Boundary Conditions', () => {
        test('handles next column configuration for right border', () => {
            const extendedSchema: ColumnSchema[] = [
                ...mockSchema,
                {
                    aliasName: 'Description',
                    dataType: 'string',
                    columnName: 'description',
                }
            ];

            const extendedConfiguration: ColumnConfiguration[] = [
                ...mockTableConfiguration,
                {
                    aliasName: 'Description',
                    columnName: 'description',
                    type: '',
                    isEditable: true
                }
            ];

            const columns = generateColumns({
                schema: extendedSchema,
                tableConfiguration: extendedConfiguration,
                columnWidths: {}
            });

            const cellClassName = columns[1].cellClassName;
            expect(cellClassName).toBeDefined();

            if (typeof cellClassName === 'function') {
                const result = cellClassName({
                    colDef: { editable: true },
                    field: 'Priority'
                } as GridCellParams);
                expect(result).toBe("");
            }
        });
    });
});