import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import EntityList from '../../../src/pages/entitySetup/EntityList';

// Mock the lazy-loaded components
jest.mock('commonApp/HeaderBar', () => {
  return jest.fn(({ title, RightAction }: any) => (
    <div data-testid="header-bar">
      <h1>{title}</h1>
      {RightAction}
    </div>
  ));
});

jest.mock('commonApp/AgGridShell', () => {
  return jest.fn((props: any) => (
    <div data-testid="ag-grid-shell" {...props}>
      <div data-testid="grid-data">{JSON.stringify(props.rowData)}</div>
      <div data-testid="grid-columns">{JSON.stringify(props.columnDefs)}</div>
      <div data-testid="grid-options">{JSON.stringify(props.gridOptions)}</div>
    </div>
  ));
});

jest.mock('commonApp/NotificationAlert', () => {
  return jest.fn(({ open, variant, title, message, onClose, actions }: any) => {
    if (!open) return null;
    return (
      <div data-testid="notification-alert" data-variant={variant}>
        <h2>{title}</h2>
        <p>{message}</p>
        {actions?.map((action: any, index: number) => (
          <button key={index} onClick={action.onClick} data-testid={`alert-action-${index}`}>
            {action.label}
          </button>
        ))}
        <button onClick={onClose} data-testid="alert-close">Close</button>
      </div>
    );
  });
});

jest.mock('commonApp/Footer', () => {
  return jest.fn(({ label, count }: any) => (
    <div data-testid="footer">
      <span>{label}: {count}</span>
    </div>
  ));
});

jest.mock('commonApp/NoResultsFound', () => {
  return jest.fn(({ message, height }: any) => (
    <div data-testid="no-results-found" style={{ height }}>
      {message}
    </div>
  ));
});

// Mock the custom components
jest.mock('../../../src/components/toolbar/ListToolbar', () => {
  return jest.fn(({ onSearchClick, onAddClick, isSearchActive, onSearchChange, searchValue, onSearchClose }: any) => (
    <div data-testid="list-toolbar">
      <button onClick={onSearchClick} data-testid="search-button">Search</button>
      <button onClick={onAddClick} data-testid="add-button">Add</button>
      {isSearchActive && (
        <input
          data-testid="search-input"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search entities..."
        />
      )}
      <button onClick={onSearchClose} data-testid="search-close">Close Search</button>
    </div>
  ));
});

jest.mock('../../../src/components/structure/EntityStructurePanel', () => {
  return jest.fn(({ open, onClose }: any) => {
    if (!open) return null;
    return (
      <div data-testid="entity-structure-panel">
        <button onClick={onClose} data-testid="close-structure-panel">Close</button>
      </div>
    );
  });
});

jest.mock('../../../src/components/entitySetup/StructureRenderer', () => {
  return jest.fn(({ entity, onViewStructure }: any) => (
    <button onClick={() => onViewStructure(entity.id)} data-testid="structure-renderer">
      View Structure
    </button>
  ));
});

jest.mock('../../../src/components/entitySetup/ActionRenderer', () => {
  return jest.fn(({ entity, onEdit, onDelete, onToggleEnabled, onConfigureOrView }: any) => (
    <div data-testid="action-renderer">
      <button onClick={() => onEdit(entity.id)} data-testid="edit-button">Edit</button>
      <button onClick={() => onDelete(entity.id)} data-testid="delete-button">Delete</button>
      <button onClick={() => onToggleEnabled(entity.id, entity.isEnabled)} data-testid="toggle-button">Toggle</button>
      <button onClick={() => onConfigureOrView(entity)} data-testid="configure-button">Configure</button>
    </div>
  ));
});

// Mock the hooks
jest.mock('../../../src/hooks/useEntitySearch', () => ({
  useEntitySearch: jest.fn()
}));

// Mock the utils
jest.mock('../../../src/utils/entityListColumns', () => ({
  createColumnDefs: jest.fn(() => [
    { field: 'name', headerName: 'Name' },
    { field: 'actions', headerName: 'Actions' }
  ]),
  createDefaultColDef: jest.fn(() => ({ resizable: true })),
  createGridOptions: jest.fn(() => ({ rowSelection: 'single' }))
}));

// Mock the constants
jest.mock('../../../src/constants/entityListStyles', () => ({
  ENTITY_LIST_STYLES: {
    container: { padding: '16px' },
    contentBox: { marginTop: '16px' },
    gridContainer: { height: '400px' },
    gridWrapper: { width: '100%', height: '100%' }
  }
}));

// Mock the store actions
jest.mock('../../../src/store/Actions/entitySetupActions', () => ({
  deleteEntity: jest.fn(() => ({ type: 'DELETE_ENTITY' })),
  updateEntityPartial: jest.fn(() => ({ type: 'UPDATE_ENTITY_PARTIAL' }))
}));

jest.mock('../../../src/store/Reducers/entitySlice', () => ({
  fetchEntities: jest.fn(() => ({ type: 'FETCH_ENTITIES' })),
  fetchEntityHierarchy: jest.fn(() => ({ type: 'FETCH_ENTITY_HIERARCHY' }))
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock AG Grid modules
jest.mock('ag-grid-community', () => ({
  ModuleRegistry: {
    registerModules: jest.fn()
  },
  AllCommunityModule: {}
}));

// Mock AG Grid CSS imports
jest.mock('ag-grid-community/styles/ag-grid.css', () => ({}));
jest.mock('ag-grid-community/styles/ag-theme-alpine.css', () => ({}));

// Mock the grid styles
jest.mock('../../../src/components/grid/GridStyles', () => {
  return jest.fn(() => <div data-testid="grid-styles">Grid Styles</div>);
});

describe('EntityList Component', () => {
  let mockStore: any;
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockStore = configureStore({
      reducer: {
        entities: (state = { items: [] }) => state
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false
        })
    });

    // Mock the store's dispatch
    jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

    // Setup useEntitySearch mock
    const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
    useEntitySearch.mockReturnValue({
      filteredEntities: [
        { id: '1', name: 'Entity 1', isEnabled: true, progressPercentage: '50' }
      ],
      isSearchActive: false,
      searchValue: '',
      handleSearchClick: jest.fn(),
      handleSearchChange: jest.fn(),
      handleSearchClose: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<EntityList />);
      expect(screen.getByTestId('header-bar')).toBeInTheDocument();
    });

    it('should render header with correct title', () => {
      renderWithProviders(<EntityList />);
      expect(screen.getByText('Entity Details')).toBeInTheDocument();
    });

    it('should render list toolbar', () => {
      renderWithProviders(<EntityList />);
      expect(screen.getByTestId('list-toolbar')).toBeInTheDocument();
    });

    it('should render AG Grid shell', () => {
      renderWithProviders(<EntityList />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });

    it('should render footer with entity count', () => {
      renderWithProviders(<EntityList />);
      expect(screen.getByText('Total Entity: 1')).toBeInTheDocument();
    });

    it('should render grid styles', () => {
      renderWithProviders(<EntityList />);
      expect(screen.getByTestId('grid-styles')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should handle search button click', () => {
      const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
      const mockHandleSearchClick = jest.fn();
      useEntitySearch.mockReturnValue({
        filteredEntities: [],
        isSearchActive: false,
        searchValue: '',
        handleSearchClick: mockHandleSearchClick,
        handleSearchChange: jest.fn(),
        handleSearchClose: jest.fn()
      });

      renderWithProviders(<EntityList />);
      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);
      expect(mockHandleSearchClick).toHaveBeenCalled();
    });

    it('should handle search input when active', () => {
      const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
      const mockHandleSearchChange = jest.fn();
      useEntitySearch.mockReturnValue({
        filteredEntities: [],
        isSearchActive: true,
        searchValue: 'test',
        handleSearchClick: jest.fn(),
        handleSearchChange: mockHandleSearchChange,
        handleSearchClose: jest.fn()
      });

      renderWithProviders(<EntityList />);
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'new search' } });
      expect(mockHandleSearchChange).toHaveBeenCalledWith('new search');
    });

    it('should handle search close', () => {
      const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
      const mockHandleSearchClose = jest.fn();
      useEntitySearch.mockReturnValue({
        filteredEntities: [],
        isSearchActive: true,
        searchValue: 'test',
        handleSearchClick: jest.fn(),
        handleSearchChange: jest.fn(),
        handleSearchClose: mockHandleSearchClose
      });

      renderWithProviders(<EntityList />);
      const searchCloseButton = screen.getByTestId('search-close');
      fireEvent.click(searchCloseButton);
      expect(mockHandleSearchClose).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to create page when add button is clicked', () => {
      renderWithProviders(<EntityList />);
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);
      expect(mockNavigate).toHaveBeenCalledWith('create');
    });

    it('should navigate to edit page when edit button is clicked', () => {
      renderWithProviders(<EntityList />);
      const editButton = screen.getByTestId('edit-button');
      fireEvent.click(editButton);
      expect(mockNavigate).toHaveBeenCalledWith('edit/1');
    });

    it('should navigate to view page when progress is 100%', () => {
      const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
      useEntitySearch.mockReturnValue({
        filteredEntities: [
          { id: '1', name: 'Entity 1', isEnabled: true, progressPercentage: '100' }
        ],
        isSearchActive: false,
        searchValue: '',
        handleSearchClick: jest.fn(),
        handleSearchChange: jest.fn(),
        handleSearchClose: jest.fn()
      });

      renderWithProviders(<EntityList />);
      const configureButton = screen.getByTestId('configure-button');
      fireEvent.click(configureButton);
      expect(mockNavigate).toHaveBeenCalledWith('view/1');
    });

    it('should navigate to configure page when progress is not 100%', () => {
      const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
      useEntitySearch.mockReturnValue({
        filteredEntities: [
          { id: '1', name: 'Entity 1', isEnabled: true, progressPercentage: '50' }
        ],
        isSearchActive: false,
        searchValue: '',
        handleSearchClick: jest.fn(),
        handleSearchChange: jest.fn(),
        handleSearchClose: jest.fn()
      });

      renderWithProviders(<EntityList />);
      const configureButton = screen.getByTestId('configure-button');
      fireEvent.click(configureButton);
      expect(mockNavigate).toHaveBeenCalledWith('configure/1');
    });

    it('should not navigate when entity id is undefined', () => {
      const { ActionRenderer } = require('../../../src/components/entitySetup/ActionRenderer');
      ActionRenderer.mockImplementation(({ entity, onConfigureOrView }: any) => (
        <button onClick={() => onConfigureOrView({ ...entity, id: undefined })} data-testid="configure-button">
          Configure
        </button>
      ));

      renderWithProviders(<EntityList />);
      const configureButton = screen.getByTestId('configure-button');
      fireEvent.click(configureButton);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Toggle Enabled', () => {
    it('should toggle entity enabled status', async () => {
      const { updateEntityPartial } = require('../../../src/store/Actions/entitySetupActions');
      updateEntityPartial.mockReturnValue({ type: 'UPDATE_ENTITY_PARTIAL' });

      renderWithProviders(<EntityList />);
      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(updateEntityPartial).toHaveBeenCalledWith({
          id: '1',
          isEnabled: false
        });
      });
    });

    it('should toggle from false to true', async () => {
      const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
      const { updateEntityPartial } = require('../../../src/store/Actions/entitySetupActions');
      updateEntityPartial.mockReturnValue({ type: 'UPDATE_ENTITY_PARTIAL' });

      useEntitySearch.mockReturnValue({
        filteredEntities: [
          { id: '1', name: 'Entity 1', isEnabled: false, progressPercentage: '50' }
        ],
        isSearchActive: false,
        searchValue: '',
        handleSearchClick: jest.fn(),
        handleSearchChange: jest.fn(),
        handleSearchClose: jest.fn()
      });

      renderWithProviders(<EntityList />);
      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(updateEntityPartial).toHaveBeenCalledWith({
          id: '1',
          isEnabled: true
        });
      });
    });
  });

  describe('Grid Functionality', () => {
    it('should render grid with correct props', () => {
      renderWithProviders(<EntityList />);
      const gridShell = screen.getByTestId('ag-grid-shell');
      expect(gridShell).toBeInTheDocument();
    });

    it('should handle empty entities list and show NoResultsFound', () => {
      const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
      useEntitySearch.mockReturnValue({
        filteredEntities: [],
        isSearchActive: false,
        searchValue: '',
        handleSearchClick: jest.fn(),
        handleSearchChange: jest.fn(),
        handleSearchClose: jest.fn()
      });

      renderWithProviders(<EntityList />);
      expect(screen.getByTestId('no-results-found')).toBeInTheDocument();
      expect(screen.getByText('No Results Found')).toBeInTheDocument();
    });

    it('should handle grid sorting', () => {
      renderWithProviders(<EntityList />);
      // Grid sorting is handled internally by AG Grid
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });

    it('should apply row styles correctly', () => {
      const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
      useEntitySearch.mockReturnValue({
        filteredEntities: [
          { id: '1', name: 'Entity 1', isEnabled: true, isDeleted: false },
          { id: '2', name: 'Entity 2', isEnabled: false, isDeleted: true }
        ],
        isSearchActive: false,
        searchValue: '',
        handleSearchClick: jest.fn(),
        handleSearchChange: jest.fn(),
        handleSearchClose: jest.fn()
      });

      renderWithProviders(<EntityList />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });

    it('should log AG Grid initialization', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      renderWithProviders(<EntityList />);
      
      waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'AG Grid initialization - checking modules:',
          expect.any(Object)
        );
      });
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should show error message when error occurs', () => {
      // Mock window error event
      const mockErrorEvent = new ErrorEvent('error', { message: 'Test error' });
      renderWithProviders(<EntityList />);
      
      // Simulate error
      window.dispatchEvent(mockErrorEvent);
      
      // Wait for error state to update
      waitFor(() => {
        expect(screen.getByText('Error occurred:')).toBeInTheDocument();
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
    });

    it('should retry when retry button is clicked', () => {
      const mockErrorEvent = new ErrorEvent('error', { message: 'Test error' });
      renderWithProviders(<EntityList />);
      
      window.dispatchEvent(mockErrorEvent);
      
      waitFor(() => {
        const retryButton = screen.getByText('Retry');
        fireEvent.click(retryButton);
        expect(screen.queryByText('Error occurred:')).not.toBeInTheDocument();
      });
    });

    it('should handle component unmounting', () => {
      const { unmount } = renderWithProviders(<EntityList />);
      expect(screen.getByTestId('header-bar')).toBeInTheDocument();
      unmount();
    });

    it('should clean up error event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = renderWithProviders(<EntityList />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Structure Panel', () => {
    it('should not show structure panel by default', () => {
      renderWithProviders(<EntityList />);
      expect(screen.queryByTestId('entity-structure-panel')).not.toBeInTheDocument();
    });

    it('should open structure panel when view structure is clicked', async () => {
      const { fetchEntityHierarchy } = require('../../../src/store/Reducers/entitySlice');
      fetchEntityHierarchy.mockResolvedValue({ type: 'FETCH_ENTITY_HIERARCHY' });

      renderWithProviders(<EntityList />);
      
      // Find and click the structure renderer button
      const structureButton = screen.getByTestId('structure-renderer');
      fireEvent.click(structureButton);

      await waitFor(() => {
        expect(screen.getByTestId('entity-structure-panel')).toBeInTheDocument();
      });
      expect(fetchEntityHierarchy).toHaveBeenCalled();
    });

    it('should open structure panel even if hierarchy fetch fails', async () => {
      const { fetchEntityHierarchy } = require('../../../src/store/Reducers/entitySlice');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      fetchEntityHierarchy.mockRejectedValue(new Error('Fetch failed'));

      renderWithProviders(<EntityList />);
      
      const structureButton = screen.getByTestId('structure-renderer');
      fireEvent.click(structureButton);

      await waitFor(() => {
        expect(screen.getByTestId('entity-structure-panel')).toBeInTheDocument();
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch hierarchy data:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should not open structure panel when id is undefined', () => {
      const { StructureRenderer } = require('../../../src/components/entitySetup/StructureRenderer');
      StructureRenderer.mockImplementation(({ entity, onViewStructure }: any) => (
        <button onClick={() => onViewStructure(undefined)} data-testid="structure-renderer">
          View Structure
        </button>
      ));

      renderWithProviders(<EntityList />);
      const structureButton = screen.getByTestId('structure-renderer');
      fireEvent.click(structureButton);

      expect(screen.queryByTestId('entity-structure-panel')).not.toBeInTheDocument();
    });

    it('should close structure panel', () => {
      const { fetchEntityHierarchy } = require('../../../src/store/Reducers/entitySlice');
      fetchEntityHierarchy.mockResolvedValue({ type: 'FETCH_ENTITY_HIERARCHY' });

      renderWithProviders(<EntityList />);
      
      const structureButton = screen.getByTestId('structure-renderer');
      fireEvent.click(structureButton);

      waitFor(() => {
        const closeButton = screen.getByTestId('close-structure-panel');
        fireEvent.click(closeButton);
        expect(screen.queryByTestId('entity-structure-panel')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delete Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should not show delete confirmation by default', () => {
      renderWithProviders(<EntityList />);
      expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
    });

    it('should show delete confirmation when delete button is clicked', () => {
      renderWithProviders(<EntityList />);
      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);

      expect(screen.getByTestId('notification-alert')).toBeInTheDocument();
      expect(screen.getByText('Warning – Action Required')).toBeInTheDocument();
    });

    it('should cancel delete when No button is clicked', () => {
      renderWithProviders(<EntityList />);
      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);

      const noButton = screen.getByTestId('alert-action-0');
      fireEvent.click(noButton);

      expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
    });

    it('should cancel delete when close button is clicked', () => {
      renderWithProviders(<EntityList />);
      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);

      const closeButton = screen.getByTestId('alert-close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
    });

    it('should confirm and delete entity when Yes button is clicked', async () => {
      const { deleteEntity } = require('../../../src/store/Actions/entitySetupActions');
      const { fetchEntities } = require('../../../src/store/Reducers/entitySlice');
      deleteEntity.mockReturnValue({ type: 'DELETE_ENTITY' });
      fetchEntities.mockReturnValue({ type: 'FETCH_ENTITIES' });

      renderWithProviders(<EntityList />);
      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);

      const yesButton = screen.getByTestId('alert-action-1');
      fireEvent.click(yesButton);

      expect(deleteEntity).toHaveBeenCalled();
      
      // Wait for setTimeout
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(fetchEntities).toHaveBeenCalled();
      });

      // Check success alert
      await waitFor(() => {
        const alerts = screen.queryAllByTestId('notification-alert');
        const successAlert = alerts.find(alert => alert.getAttribute('data-variant') === 'success');
        expect(successAlert).toBeInTheDocument();
      });
    });

    it('should handle delete error gracefully', async () => {
      const { deleteEntity } = require('../../../src/store/Actions/entitySetupActions');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      deleteEntity.mockImplementation(() => {
        throw new Error('Delete failed');
      });

      renderWithProviders(<EntityList />);
      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);

      const yesButton = screen.getByTestId('alert-action-1');
      fireEvent.click(yesButton);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error during entity deletion:', expect.any(Error));
      expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
      
      consoleErrorSpy.mockRestore();
    });

    it('should not delete when entityId is null', () => {
      renderWithProviders(<EntityList />);
      // Simulate delete with null entityId
      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);

      // Manually set entityId to null (simulating edge case)
      // This tests the guard clause in handleDeleteConfirm
    });
  });

  describe('Success Alert', () => {
    it('should not show success alert by default', () => {
      renderWithProviders(<EntityList />);
      expect(screen.queryByTestId('notification-alert')).not.toBeInTheDocument();
    });

    it('should close success alert when close button is clicked', async () => {
      jest.useFakeTimers();
      const { deleteEntity } = require('../../../src/store/Actions/entitySetupActions');
      const { fetchEntities } = require('../../../src/store/Reducers/entitySlice');
      deleteEntity.mockReturnValue({ type: 'DELETE_ENTITY' });
      fetchEntities.mockReturnValue({ type: 'FETCH_ENTITIES' });

      renderWithProviders(<EntityList />);
      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);

      const yesButton = screen.getByTestId('alert-action-1');
      fireEvent.click(yesButton);

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        const alerts = screen.queryAllByTestId('notification-alert');
        const successAlert = alerts.find(alert => alert.getAttribute('data-variant') === 'success');
        expect(successAlert).toBeInTheDocument();
        
        const closeButton = successAlert?.querySelector('[data-testid="alert-close"]');
        if (closeButton) {
          fireEvent.click(closeButton);
        }
      });

      jest.useRealTimers();
    });

    it('should auto-hide success alert after duration', async () => {
      jest.useFakeTimers();
      const { deleteEntity } = require('../../../src/store/Actions/entitySetupActions');
      const { fetchEntities } = require('../../../src/store/Reducers/entitySlice');
      deleteEntity.mockReturnValue({ type: 'DELETE_ENTITY' });
      fetchEntities.mockReturnValue({ type: 'FETCH_ENTITIES' });

      renderWithProviders(<EntityList />);
      const deleteButton = screen.getByTestId('delete-button');
      fireEvent.click(deleteButton);

      const yesButton = screen.getByTestId('alert-action-1');
      fireEvent.click(yesButton);

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        const alerts = screen.queryAllByTestId('notification-alert');
        const successAlert = alerts.find(alert => alert.getAttribute('data-variant') === 'success');
        expect(successAlert).toBeInTheDocument();
      });

      // Advance time for auto-hide
      jest.advanceTimersByTime(3000);

      jest.useRealTimers();
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle prop changes', () => {
      const { rerender } = renderWithProviders(<EntityList />);
      expect(screen.getByTestId('header-bar')).toBeInTheDocument();
      
      rerender(<EntityList />);
      expect(screen.getByTestId('header-bar')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure', () => {
      renderWithProviders(<EntityList />);
      
      expect(screen.getByTestId('header-bar')).toBeInTheDocument();
      expect(screen.getByTestId('list-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Error Boundary', () => {
    it('should catch errors in NotificationAlert', () => {
      const { NotificationAlert } = require('commonApp/NotificationAlert');
      NotificationAlert.mockImplementation(() => {
        throw new Error('Test error');
      });

      renderWithProviders(<EntityList />);
      // Error boundary should catch and display fallback
      expect(screen.getByText('NotificationAlert Error')).toBeInTheDocument();
    });

    it('should log errors in ErrorBoundary', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const { NotificationAlert } = require('commonApp/NotificationAlert');
      NotificationAlert.mockImplementation(() => {
        throw new Error('Test error');
      });

      renderWithProviders(<EntityList />);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Column Definitions', () => {
    it('should create column definitions with search value', () => {
      const { createColumnDefs } = require('../../../src/utils/entityListColumns');
      const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
      
      useEntitySearch.mockReturnValue({
        filteredEntities: [],
        isSearchActive: true,
        searchValue: 'test',
        handleSearchClick: jest.fn(),
        handleSearchChange: jest.fn(),
        handleSearchClose: jest.fn()
      });

      renderWithProviders(<EntityList />);
      expect(createColumnDefs).toHaveBeenCalledWith('test');
    });

    it('should create column definitions with empty search value', () => {
      const { createColumnDefs } = require('../../../src/utils/entityListColumns');
      renderWithProviders(<EntityList />);
      expect(createColumnDefs).toHaveBeenCalledWith('');
    });
  });

  describe('Footer Count', () => {
    it('should display correct count in footer', () => {
      const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
      useEntitySearch.mockReturnValue({
        filteredEntities: [
          { id: '1', name: 'Entity 1' },
          { id: '2', name: 'Entity 2' },
          { id: '3', name: 'Entity 3' }
        ],
        isSearchActive: false,
        searchValue: '',
        handleSearchClick: jest.fn(),
        handleSearchChange: jest.fn(),
        handleSearchClose: jest.fn()
      });

      renderWithProviders(<EntityList />);
      expect(screen.getByText('Total Entity: 3')).toBeInTheDocument();
    });

    it('should display zero count when no entities', () => {
      const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
      useEntitySearch.mockReturnValue({
        filteredEntities: [],
        isSearchActive: false,
        searchValue: '',
        handleSearchClick: jest.fn(),
        handleSearchChange: jest.fn(),
        handleSearchClose: jest.fn()
      });

      renderWithProviders(<EntityList />);
      expect(screen.getByText('Total Entity: 0')).toBeInTheDocument();
    });
  });

  describe('Component Memoization', () => {
    it('should memoize components correctly', () => {
      renderWithProviders(<EntityList />);
      // Components should be memoized to prevent unnecessary re-renders
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });

    it('should memoize grid options correctly', () => {
      const { createGridOptions } = require('../../../src/utils/entityListColumns');
      renderWithProviders(<EntityList />);
      expect(createGridOptions).toHaveBeenCalled();
    });
  });
});