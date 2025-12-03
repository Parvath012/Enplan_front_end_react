import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TableFooterComponent from '../../../../../src/components/tablecomponents/tablefooter/components';
import { legendConfig } from '../../../../../src/config/tableFooterConfig';


// Create a mock store
const mockStore = configureStore([]);

describe('TableFooterComponent', () => {
  let store: any;

  beforeEach(() => {
    // Initialize mock store with a default state
    store = mockStore({
      gridModeStore: 'muiDataGrid'
    });
  });

  const defaultProps = {
    statsData: { total: 10, active: 5 },
    onRefresh: jest.fn(),
    onZoomChange: jest.fn()
  };

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <TableFooterComponent
          {...defaultProps}
          {...props}
        />
      </Provider>
    );
  };

  // Rendering Tests
  describe('Rendering', () => {
    it('renders footer sections', () => {
      renderComponent();

      // Check for main sections
      expect(screen.getByText(/AG Grid/i)).toBeInTheDocument();
    });

    it('renders default legend items', () => {
      renderComponent();

      // Check for default legend items
      legendConfig.forEach(item => {
        expect(screen.getByText(new RegExp(item.label, 'i'))).toBeInTheDocument();
      });
    });

    it('renders custom legend items', () => {
      const customLegendItems = [
        { label: 'Custom Active', color: 'green' },
        { label: 'Custom Inactive', color: 'red' }
      ];

      renderComponent({ legendItems: customLegendItems });

      customLegendItems.forEach(item => {
        expect(screen.getByText(new RegExp(item.label, 'i'))).toBeInTheDocument();
      });
    });

    it('renders empty legend items correctly', () => {
      renderComponent({ legendItems: [] });

      // Ensure no legend items are rendered
      expect(screen.queryByTestId('legend-item')).toBeNull();
    });
  });

  // Stats Display Tests
  describe('Stats Display', () => {
    // it('renders default stats', () => {
    //   renderComponent();

    //   // Check for default stats
    //   expect(screen.getByText(/Total.*10/i)).toBeInTheDocument();
    //   expect(screen.getByText(/Active.*5/i)).toBeInTheDocument();
    // });

    // it('renders custom stats', () => {
    //   const statsData = {
    //     totalRows: 10,
    //     sum: 66,
    //     avg: 6,
    //     min: 1,
    //     max: 11
    //   };

    //   renderComponent({ statsData });

    //   // Check for custom stats values
    //   Object.entries(statsData).forEach(([key, value]) => {
    //     expect(screen.getByText(new RegExp(`${key}.*${value}`, 'i'))).toBeInTheDocument();
    //   });
    // });
  });

  // Grid Mode Toggle Tests
  describe('Grid Mode Toggle', () => {
    it('toggles grid mode when button is clicked', () => {
      renderComponent();

      // Find and click the grid mode toggle button
      const toggleButton = screen.getByText(/AG Grid/i);
      fireEvent.click(toggleButton);

      // Verify that the store's dispatch was called
      const actions = store.getActions();
      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('TOGGLE_GRID_MODE');
    });

    it('displays correct grid mode text', () => {
      // Test when grid mode is muiDataGrid
      const muiDataGridStore = mockStore({
        gridModeStore: 'muiDataGrid'
      });

      render(
        <Provider store={muiDataGridStore}>
          <TableFooterComponent {...defaultProps} />
        </Provider>
      );
      expect(screen.getByText(/AG Grid/i)).toBeInTheDocument();

      // Test when grid mode is not muiDataGrid
      const agGridStore = mockStore({
        gridModeStore: 'agGrid'
      });

      render(
        <Provider store={agGridStore}>
          <TableFooterComponent {...defaultProps} />
        </Provider>
      );
      expect(screen.getByText(/MUI Data Grid/i)).toBeInTheDocument();
    });
  });

  // Zoom Controls Tests
  describe('Zoom Controls', () => {
    it('renders zoom controls', () => {
      renderComponent({
        zoomPercentage: 100,
        minZoom: 50,
        maxZoom: 150
      });

      // Check for zoom percentage
      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    // it('calls onZoomChange when zoom controls are used', () => {
    //   const mockOnZoomChange = jest.fn();
    //   renderComponent({
    //     onZoomChange: mockOnZoomChange,
    //     zoomPercentage: 100
    //   });

    //   // Simulate zoom in/out actions (adjust based on actual implementation)
    //   const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
    //   const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });

    //   fireEvent.click(zoomInButton);
    //   fireEvent.click(zoomOutButton);

    //   expect(mockOnZoomChange).toHaveBeenCalledTimes(2);
    // });

    // it('respects zoom percentage limits', () => {
    //   renderComponent({
    //     zoomPercentage: 150,
    //     minZoom: 50,
    //     maxZoom: 150
    //   });

    //   // Check max zoom
    //   expect(screen.getByText(/150%/)).toBeInTheDocument();

    //   renderComponent({
    //     zoomPercentage: 50,
    //     minZoom: 50,
    //     maxZoom: 150
    //   });

    //   // Check min zoom
    //   expect(screen.getByText(/50%/)).toBeInTheDocument();
    // });
  });

  // Data Refresh Tests
  describe('Data Refresh', () => {
    it('calls onRefresh when data refresh button is clicked', () => {
      const mockOnRefresh = jest.fn();
      renderComponent({ onRefresh: mockOnRefresh });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });

    it('handles refresh button when onRefresh is not provided', () => {
      renderComponent({ onRefresh: undefined });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeDisabled();
    });
  });

  // Separator Tests
  describe('Separators', () => {
    it('renders correct number of separators', () => {
      renderComponent();

      // Check for separators
      const separators = screen.getAllByText('|');
      expect(separators.length).toBeGreaterThanOrEqual(2);
    });
  });
});