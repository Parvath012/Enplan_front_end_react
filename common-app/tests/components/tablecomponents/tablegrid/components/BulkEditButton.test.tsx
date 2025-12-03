import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import BulkEditButton from '../../../../../src/components/tablecomponents/tablegrid/components/BulkEditButton';
import * as gridActions from '../../../../../src/store/Actions/gridActions';

// Create mock store for testing
// Using function approach to avoid middleware issues
const createMockStore = () => {
  const mockStore = configureStore();
  return mockStore;
}
const mockStore = createMockStore();

// Mock the BulkEditDialog component
jest.mock('../../../../../src/components/tablecomponents/tablegrid/components/BulkEditDialog', () => {
  return function MockBulkEditDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
    return open ? (
      <div data-testid="mock-bulk-edit-dialog">
        <button onClick={onClose} data-testid="close-dialog-btn">Close</button>
      </div>
    ) : null;
  };
});

// Spy on gridActions
jest.spyOn(gridActions, 'startBulkEdit');

describe('BulkEditButton Component', () => {
  const selectedCells = [
    { rowId: '1', field: 'name', value: 'John' },
    { rowId: '2', field: 'name', value: 'Jane' }
  ];

  // Test cases for column header button (with columnField prop)
  describe('Column Header Button', () => {
    it('should be disabled when no cells are selected', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: []
        }
      });

      render(
        <Provider store={store}>
          <BulkEditButton columnField="name" />
        </Provider>
      );

      // Should render disabled button with tooltip
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when only one cell is selected', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [{ rowId: '1', field: 'name', value: 'John' }]
        }
      });

      render(
        <Provider store={store}>
          <BulkEditButton columnField="name" />
        </Provider>
      );

      // Should render disabled button
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when selected cells are from different columns', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [
            { rowId: '1', field: 'name', value: 'John' },
            { rowId: '2', field: 'age', value: 30 }
          ]
        }
      });

      render(
        <Provider store={store}>
          <BulkEditButton columnField="name" />
        </Provider>
      );

      // Should render disabled button
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be enabled when multiple cells from the same column are selected', () => {
      const store = mockStore({
        gridStore: {
          selectedCells
        }
      });

      render(
        <Provider store={store}>
          <BulkEditButton columnField="name" />
        </Provider>
      );

      // Should render enabled button
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should open dialog and dispatch startBulkEdit when clicked', () => {
      const store = mockStore({
        gridStore: {
          selectedCells
        }
      });

      render(
        <Provider store={store}>
          <BulkEditButton columnField="name" />
        </Provider>
      );

      // Click the button
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Dialog should be visible
      expect(screen.getByTestId('mock-bulk-edit-dialog')).toBeInTheDocument();

      // startBulkEdit should have been dispatched
      expect(store.getActions()).toContainEqual(gridActions.startBulkEdit());
    });

    it('should close dialog when close button is clicked', () => {
      const store = mockStore({
        gridStore: {
          selectedCells
        }
      });

      render(
        <Provider store={store}>
          <BulkEditButton columnField="name" />
        </Provider>
      );

      // Open dialog
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Dialog should be visible
      expect(screen.getByTestId('mock-bulk-edit-dialog')).toBeInTheDocument();

      // Close dialog
      const closeButton = screen.getByTestId('close-dialog-btn');
      fireEvent.click(closeButton);

      // Dialog should be closed
      expect(screen.queryByTestId('mock-bulk-edit-dialog')).not.toBeInTheDocument();
    });
  });

  // Test cases for standalone button (without columnField prop)
  describe('Standalone Button', () => {
    it('should not render when no cells are selected', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: []
        }
      });

      const { container } = render(
        <Provider store={store}>
          <BulkEditButton />
        </Provider>
      );

      // Should not render anything
      expect(container.firstChild).toBeNull();
    });

    it('should not render when only one cell is selected', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [{ rowId: '1', field: 'name', value: 'John' }]
        }
      });

      const { container } = render(
        <Provider store={store}>
          <BulkEditButton />
        </Provider>
      );

      // Should not render anything
      expect(container.firstChild).toBeNull();
    });

    it('should not render when selected cells are from different columns', () => {
      const store = mockStore({
        gridStore: {
          selectedCells: [
            { rowId: '1', field: 'name', value: 'John' },
            { rowId: '2', field: 'age', value: 30 }
          ]
        }
      });

      const { container } = render(
        <Provider store={store}>
          <BulkEditButton />
        </Provider>
      );

      // Should not render anything
      expect(container.firstChild).toBeNull();
    });
  });
});
