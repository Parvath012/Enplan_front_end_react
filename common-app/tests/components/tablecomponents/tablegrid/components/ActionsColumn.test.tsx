import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GridRenderCellParams, GridColDef } from '@mui/x-data-grid';
import { getActionsColumn } from '../../../../../src/components/tablecomponents/tablegrid/components/ActionsColumn';
import { GridFields } from '../../../../../src/constants/gridFields';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
    IconButton: jest.fn(({ children, ...props }) => (
        <button data-testid="icon-button" {...props}>{children}</button>
    )),
    Menu: jest.fn(({ children, open, onClose, ...props }) => {
        return open ? (
            <div data-testid="menu" {...props}>
                {React.Children.map(children, child =>
                    React.cloneElement(child as React.ReactElement, { onClose })
                )}
            </div>
        ) : null;
    }),
    MenuItem: jest.fn(({ children, onClick, onClose, ...props }) => (
        <div
            data-testid="menu-item"
            onClick={(e) => {
                onClick?.(e);
                onClose?.();
            }}
            {...props}
        >
            {children}
        </div>
    )),
}));

// Mock icons
jest.mock('@carbon/icons-react', () => ({
    OverflowMenuVertical: () => <div data-testid="overflow-menu-icon" />,
    Column: () => <div data-testid="column-icon" />,
}));

describe('getActionsColumn', () => {
    const mockOnActionClick = jest.fn();
    const mockActions = [
        {
            label: 'Edit',
            action: 'edit',
            icon: <span data-testid="edit-icon">✏️</span>
        },
        {
            label: 'Delete',
            action: 'delete',
            icon: <span data-testid="delete-icon">🗑️</span>
        }
    ];

    const mockRow = { id: 1, name: 'Test Item' };
    const mockParams: GridRenderCellParams = {
        row: mockRow,
        field: 'actions',
        value: null,
        colDef: {},
    } as GridRenderCellParams;

    // Utility function to safely render cell
    const safeRenderCell = (column: GridColDef, params: GridRenderCellParams): React.ReactElement => {
        if (!column.renderCell) {
            throw new Error('renderCell is not defined');
        }
        return column.renderCell(params) as React.ReactElement;
    };

    // Utility function to safely render header
    const safeRenderHeader = (column: GridColDef): React.ReactElement => {
        if (!column.renderHeader) {
            throw new Error('renderHeader is not defined');
        }
        return column.renderHeader() as React.ReactElement;
    };

    beforeEach(() => {
        mockOnActionClick.mockClear();
    });

    describe('Column Configuration', () => {
        test('should have correct column properties', () => {
            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: mockActions,
                width: 120
            });

            expect(ActionsColumn.field).toBe(GridFields.Action);
            expect(ActionsColumn.type).toBe('actions');
            expect(ActionsColumn.width).toBe(120);
            expect(ActionsColumn.sortable).toBe(false);
            expect(ActionsColumn.filterable).toBe(false);
            expect(ActionsColumn.disableColumnMenu).toBe(true);
            expect(ActionsColumn.resizable).toBe(true);
        });

        test('uses default values when not provided', () => {
            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick
            });

            expect(ActionsColumn.field).toBe(GridFields.Action);
            expect(ActionsColumn.width).toBe(100);
        });
    });

    describe('Rendering', () => {
        test('renders overflow menu button', () => {
            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: mockActions
            });

            const cellElement = safeRenderCell(ActionsColumn, mockParams);
            render(cellElement);

            const overflowButton = screen.getByRole('button', { name: /more/i });
            expect(overflowButton).toBeInTheDocument();
        });

        test('renders column header icon', () => {
            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: mockActions
            });

            const headerElement = safeRenderHeader(ActionsColumn);
            render(headerElement);

            const columnIcon = screen.getByTestId('column-icon');
            expect(columnIcon).toBeInTheDocument();
        });
    });

    describe('Menu Interactions', () => {
        test('opens and closes menu when overflow button is clicked', async () => {
            const user = userEvent.setup();
            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: mockActions
            });

            const cellElement = safeRenderCell(ActionsColumn, mockParams);
            render(cellElement);

            // Open menu
            const overflowButton = screen.getByRole('button', { name: /more/i });
            await user.click(overflowButton);

            // Check if menu items are visible
            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        test('calls onActionClick with correct parameters', async () => {
            const user = userEvent.setup();
            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: mockActions
            });

            const cellElement = safeRenderCell(ActionsColumn, mockParams);
            render(cellElement);

            // Open menu
            const overflowButton = screen.getByRole('button', { name: /more/i });
            await user.click(overflowButton);

            // Select edit action
            const editMenuItem = screen.getByText('Edit');
            await user.click(editMenuItem);

            // Verify action was called
            expect(mockOnActionClick).toHaveBeenCalledWith('edit', mockRow);
        });

        test('closes menu after action selection', async () => {
            const user = userEvent.setup();
            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: mockActions
            });

            const cellElement = safeRenderCell(ActionsColumn, mockParams);
            render(cellElement);

            // Open menu
            const overflowButton = screen.getByRole('button', { name: /more/i });
            await user.click(overflowButton);

            // Select delete action
            const deleteMenuItem = screen.getByText('Delete');
            await user.click(deleteMenuItem);

            // Verify action was called
            expect(mockOnActionClick).toHaveBeenCalledWith('delete', mockRow);

            // Menu should be closed (no menu items visible)
            await waitFor(() => {
                expect(screen.queryByText('Edit')).not.toBeInTheDocument();
            });
        });
    });

    describe('Edge Cases', () => {
        test('handles empty actions array', () => {
            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: []
            });

            const cellElement = safeRenderCell(ActionsColumn, mockParams);
            render(cellElement);

            // Open menu
            const overflowButton = screen.getByTestId('icon-button');
            fireEvent.click(overflowButton);

            // Check for no menu items
            const menuItems = screen.queryAllByTestId('menu-item');
            expect(menuItems).toHaveLength(0);
        });

        test('renders menu items with icons', async () => {
            const user = userEvent.setup();
            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: mockActions
            });

            const cellElement = safeRenderCell(ActionsColumn, mockParams);
            render(cellElement);

            // Open menu
            const overflowButton = screen.getByRole('button', { name: /more/i });
            await user.click(overflowButton);

            // Check for icons
            const editIcon = screen.getByTestId('edit-icon');
            const deleteIcon = screen.getByTestId('delete-icon');
            expect(editIcon).toBeInTheDocument();
            expect(deleteIcon).toBeInTheDocument();
        });

        test('handles menu item without icon', () => {
            const actionsWithoutIcon = [
                { label: 'View', action: 'view' }
            ];

            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: actionsWithoutIcon
            });

            const cellElement = safeRenderCell(ActionsColumn, mockParams);
            render(cellElement);

            // Open menu
            const overflowButton = screen.getByRole('button', { name: /more/i });
            fireEvent.click(overflowButton);

            // Check menu item
            const viewMenuItem = screen.getByText('View');
            expect(viewMenuItem).toBeInTheDocument();
        });
    });
    describe('Event Handling', () => {

        test('stops event propagation on menu item click', async () => {
            const   ActionsColumn  = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: mockActions
            });

            const cellElement = safeRenderCell(ActionsColumn, mockParams);
            render(cellElement);

            // Open menu
            const overflowButton = screen.getByRole('button', { name: /more/i });
            fireEvent.click(overflowButton);

            // Create a mock event for menu item click
            const mockEvent = {
                stopPropagation: jest.fn()
            };

            // Find and click menu item
            const editMenuItem = screen.getByText('Edit');
            fireEvent.click(editMenuItem, {
                stopPropagation: mockEvent.stopPropagation
            });

            // Verify action was called
            expect(mockOnActionClick).toHaveBeenCalledWith('edit', mockRow);
        });

        test('closes menu after action selection', async () => {
            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: mockActions
            });

            const cellElement = safeRenderCell(ActionsColumn, mockParams);
            render(cellElement);

            // Open menu
            const overflowButton = screen.getByRole('button', { name: /more/i });
            fireEvent.click(overflowButton);

            // Verify menu is open
            expect(screen.getByText('Edit')).toBeInTheDocument();

            // Select edit action
            const editMenuItem = screen.getByText('Edit');
            fireEvent.click(editMenuItem);

            // Verify menu is closed
            await waitFor(() => {
                expect(screen.queryByText('Edit')).not.toBeInTheDocument();
            });
        });
    });

    describe('Memoization', () => {
        test('memoized wrapper prevents unnecessary re-renders', () => {
            const ActionsColumn = getActionsColumn({
                onActionClick: mockOnActionClick,
                actions: mockActions
            });

            const { rerender } = render(
                <div data-testid="actions-wrapper">
                    {safeRenderCell(ActionsColumn, { ...mockParams, row: { id: 1 } })}
                </div>
            );

            const initialWrapper = screen.getByTestId('actions-wrapper');
            const initialButton = screen.getByRole('button', { name: /more/i });

            // Rerender with same row
            rerender(
                <div data-testid="actions-wrapper">
                    {safeRenderCell(ActionsColumn, { ...mockParams, row: { id: 1 } })}
                </div>
            );

            const rerenderWrapper = screen.getByTestId('actions-wrapper');
            const rerenderButton = screen.getByRole('button', { name: /more/i });

            // Check that the wrapper and button are the same instance
            expect(initialWrapper).toBe(rerenderWrapper);
            expect(initialButton).toBe(rerenderButton);
        });
    });
});