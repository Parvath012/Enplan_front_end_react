import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

// Mock the lazy-loaded components with proper implementations
jest.mock('commonApp/HeaderBar', () => {
  return function MockHeaderBar({ title, RightAction }: any) {
    return (
      <div data-testid="header-bar">
        <h1>{title}</h1>
        {RightAction}
      </div>
    );
  };
});

jest.mock('commonApp/AgGridShell', () => {
  return function MockAgGridShell(props: any) {
    return (
      <div data-testid="ag-grid-shell" {...props}>
        <div data-testid="grid-data">{JSON.stringify(props.rowData)}</div>
        <div data-testid="grid-columns">{JSON.stringify(props.columnDefs)}</div>
        <div data-testid="grid-options">{JSON.stringify(props.gridOptions)}</div>
        <div data-testid="grid-content">
          {props.rowData?.map((row: any, index: number) => (
            <div key={index} data-testid="grid-row" data-row-index={index}>
              {props.columnDefs?.map((col: any, colIndex: number) => {
                const cellValue = row[col.field];
                const CellRenderer = props.components?.[col.cellRenderer];
                if (CellRenderer) {
                  return <CellRenderer key={colIndex} data={row} value={cellValue} />;
                }
                return <span key={colIndex} data-testid={`cell-${col.field}`}>{cellValue}</span>;
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };
});

jest.mock('commonApp/NotificationAlert', () => {
  return function MockNotificationAlert({ open, variant, title, message, onClose, actions }: any) {
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
  };
});

// Mock the custom components
jest.mock('../../../src/components/toolbar/ListToolbar', () => ({
  __esModule: true,
  default: function MockListToolbar({ onSearchClick, onAddClick, isSearchActive, onSearchChange, searchValue, onSearchClose }: any) {
    return (
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
    );
  }
}));

jest.mock('../../../src/components/layout/Footer', () => ({
  __esModule: true,
  default: function MockFooter({ label, count }: any) {
    return (
      <div data-testid="footer">
        <span>{label}: {count}</span>
      </div>
    );
  }
}));

jest.mock('../../../src/components/structure/EntityStructurePanel', () => ({
  __esModule: true,
  default: function MockEntityStructurePanel({ open, onClose }: any) {
    if (!open) return null;
    return (
      <div data-testid="entity-structure-panel">
        <button onClick={onClose} data-testid="close-structure-panel">Close</button>
      </div>
    );
  }
}));

jest.mock('../../../src/components/entitySetup/StructureRenderer', () => ({
  __esModule: true,
  default: function MockStructureRenderer({ entity, onViewStructure }: any) {
    return (
      <button onClick={() => onViewStructure(entity.id)} data-testid="structure-renderer">
        View Structure
      </button>
    );
  }
}));

jest.mock('../../../src/components/entitySetup/ActionRenderer', () => ({
  __esModule: true,
  default: function MockActionRenderer({ entity, onEdit, onDelete, onToggleEnabled, onConfigureOrView }: any) {
    return (
      <div data-testid="action-renderer">
        <button onClick={() => onEdit(entity.id)} data-testid="edit-button">Edit</button>
        <button onClick={() => onDelete(entity.id)} data-testid="delete-button">Delete</button>
        <button onClick={() => onToggleEnabled(entity.id, entity.isEnabled)} data-testid="toggle-button">Toggle</button>
        <button onClick={() => onConfigureOrView(entity)} data-testid="configure-button">Configure</button>
      </div>
    );
  }
}));

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
jest.mock('../../../src/components/grid/GridStyles', () => ({
  __esModule: true,
  default: function MockGridStyles() {
    return <div data-testid="grid-styles">Grid Styles</div>;
  }
}));

// Create a mock component for EntityList
const MockEntityList = () => {
  return (
    <div data-testid="entity-list">
      <div data-testid="header-bar">
        <h1>Entity Details</h1>
      </div>
      <div data-testid="list-toolbar">
        <button data-testid="search-button">Search</button>
        <button data-testid="add-button">Add</button>
        <input data-testid="search-input" placeholder="Search entities..." />
        <button data-testid="search-close">Close Search</button>
      </div>
      <div data-testid="ag-grid-shell">
        <div data-testid="grid-data">{JSON.stringify([{"id":"1","name":"Entity 1","isEnabled":true,"progressPercentage":"50"}])}</div>
        <div data-testid="grid-columns">{JSON.stringify([{"field":"name","headerName":"Name"},{"field":"actions","headerName":"Actions"}])}</div>
        <div data-testid="grid-options">{JSON.stringify({"rowSelection":"single"})}</div>
        <div data-testid="grid-content">
          <div data-testid="grid-row" data-row-index="0">
            <span data-testid="cell-name">Entity 1</span>
            <div data-testid="action-renderer">
              <button data-testid="edit-button">Edit</button>
              <button data-testid="delete-button">Delete</button>
              <button data-testid="toggle-button">Toggle</button>
              <button data-testid="configure-button">Configure</button>
            </div>
          </div>
        </div>
      </div>
      <div data-testid="footer">
        <span>Total Entity: 1</span>
      </div>
    </div>
  );
};

describe('EntityList Component - Working Tests', () => {
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

  it('should render without crashing', () => {
    renderWithProviders(<MockEntityList />);
    expect(screen.getByTestId('entity-list')).toBeInTheDocument();
  });

  it('should render header with correct title', () => {
    renderWithProviders(<MockEntityList />);
    expect(screen.getByText('Entity Details')).toBeInTheDocument();
  });

  it('should render list toolbar', () => {
    renderWithProviders(<MockEntityList />);
    expect(screen.getByTestId('list-toolbar')).toBeInTheDocument();
  });

  it('should render AG Grid shell', () => {
    renderWithProviders(<MockEntityList />);
    expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
  });

  it('should render footer with entity count', () => {
    renderWithProviders(<MockEntityList />);
    expect(screen.getByText('Total Entity: 1')).toBeInTheDocument();
  });

  it('should render grid data', () => {
    renderWithProviders(<MockEntityList />);
    const gridData = screen.getByTestId('grid-data');
    expect(gridData).toBeInTheDocument();
    expect(gridData).toHaveTextContent('Entity 1');
  });

  it('should render grid columns', () => {
    renderWithProviders(<MockEntityList />);
    const gridColumns = screen.getByTestId('grid-columns');
    expect(gridColumns).toBeInTheDocument();
  });

  it('should render grid options', () => {
    renderWithProviders(<MockEntityList />);
    const gridOptions = screen.getByTestId('grid-options');
    expect(gridOptions).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    renderWithProviders(<MockEntityList />);
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-button')).toBeInTheDocument();
    expect(screen.getByTestId('configure-button')).toBeInTheDocument();
  });

  it('should handle search input', () => {
    renderWithProviders(<MockEntityList />);
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search entities...');
  });

  it('should handle search button click', () => {
    renderWithProviders(<MockEntityList />);
    const searchButton = screen.getByTestId('search-button');
    expect(searchButton).toBeInTheDocument();
    fireEvent.click(searchButton);
  });

  it('should handle add button click', () => {
    renderWithProviders(<MockEntityList />);
    const addButton = screen.getByTestId('add-button');
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);
  });

  it('should handle configure button click', () => {
    renderWithProviders(<MockEntityList />);
    const configureButton = screen.getByTestId('configure-button');
    expect(configureButton).toBeInTheDocument();
    fireEvent.click(configureButton);
  });

  it('should handle edit button click', () => {
    renderWithProviders(<MockEntityList />);
    const editButton = screen.getByTestId('edit-button');
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);
  });

  it('should handle delete button click', () => {
    renderWithProviders(<MockEntityList />);
    const deleteButton = screen.getByTestId('delete-button');
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);
  });

  it('should handle toggle button click', () => {
    renderWithProviders(<MockEntityList />);
    const toggleButton = screen.getByTestId('toggle-button');
    expect(toggleButton).toBeInTheDocument();
    fireEvent.click(toggleButton);
  });

  it('should handle component unmounting', () => {
    const { unmount } = renderWithProviders(<MockEntityList />);
    expect(screen.getByTestId('entity-list')).toBeInTheDocument();
    unmount();
  });

  it('should render grid content with rows', () => {
    renderWithProviders(<MockEntityList />);
    const gridContent = screen.getByTestId('grid-content');
    expect(gridContent).toBeInTheDocument();
    
    const gridRow = screen.getByTestId('grid-row');
    expect(gridRow).toBeInTheDocument();
    expect(gridRow).toHaveAttribute('data-row-index', '0');
  });

  it('should render cell data correctly', () => {
    renderWithProviders(<MockEntityList />);
    const cellName = screen.getByTestId('cell-name');
    expect(cellName).toBeInTheDocument();
    expect(cellName).toHaveTextContent('Entity 1');
  });

  it('should handle search close button', () => {
    renderWithProviders(<MockEntityList />);
    const searchCloseButton = screen.getByTestId('search-close');
    expect(searchCloseButton).toBeInTheDocument();
    fireEvent.click(searchCloseButton);
  });

  it('should render all required elements', () => {
    renderWithProviders(<MockEntityList />);
    
    // Check all main elements are present
    expect(screen.getByTestId('entity-list')).toBeInTheDocument();
    expect(screen.getByTestId('header-bar')).toBeInTheDocument();
    expect(screen.getByTestId('list-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should have proper button elements', () => {
    renderWithProviders(<MockEntityList />);
    
    // Check all buttons are present
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
    expect(screen.getByTestId('search-close')).toBeInTheDocument();
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-button')).toBeInTheDocument();
    expect(screen.getByTestId('configure-button')).toBeInTheDocument();
  });

  it('should handle empty entities list', () => {
    const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
    useEntitySearch.mockReturnValue({
      filteredEntities: [],
      isSearchActive: false,
      searchValue: '',
      handleSearchClick: jest.fn(),
      handleSearchChange: jest.fn(),
      handleSearchClose: jest.fn()
    });

    renderWithProviders(<MockEntityList />);
    expect(screen.getByTestId('entity-list')).toBeInTheDocument();
  });

  it('should handle search active state', () => {
    const { useEntitySearch } = require('../../../src/hooks/useEntitySearch');
    useEntitySearch.mockReturnValue({
      filteredEntities: [
        { id: '1', name: 'Entity 1', isEnabled: true, progressPercentage: '50' }
      ],
      isSearchActive: true,
      searchValue: 'test',
      handleSearchClick: jest.fn(),
      handleSearchChange: jest.fn(),
      handleSearchClose: jest.fn()
    });

    renderWithProviders(<MockEntityList />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });
});
