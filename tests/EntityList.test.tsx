import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';

// Mock all dependencies first
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: 'test-id' }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: () => [],
}));

jest.mock('ag-grid-react', () => ({
  AgGridReact: () => <div data-testid="ag-grid">AG Grid</div>,
}));

jest.mock('ag-grid-community', () => ({
  ModuleRegistry: { registerModules: jest.fn() },
  AllCommunityModule: {},
}));

jest.mock('../src/components/layout/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

jest.mock('../src/components/toolbar/ListToolbar', () => {
  return function MockListToolbar() {
    return <div data-testid="list-toolbar">List Toolbar</div>;
  };
});

jest.mock('../src/components/structure/EntityStructurePanel', () => {
  return function MockEntityStructurePanel() {
    return <div data-testid="entity-structure-panel">Structure Panel</div>;
  };
});

jest.mock('../src/components/entitySetup/StructureRenderer', () => {
  return function MockStructureRenderer() {
    return <div data-testid="structure-renderer">Structure Renderer</div>;
  };
});

jest.mock('../src/components/entitySetup/ActionRenderer', () => {
  return function MockActionRenderer() {
    return <div data-testid="action-renderer">Action Renderer</div>;
  };
});

jest.mock('../src/hooks/useEntitySearch', () => ({
  useEntitySearch: () => ({
    filteredEntities: [],
    isSearchActive: false,
    searchValue: '',
    handleSearchClick: jest.fn(),
    handleSearchChange: jest.fn(),
    handleSearchClose: jest.fn(),
  }),
}));

jest.mock('../src/utils/entityListColumns', () => ({
  createColumnDefs: () => [],
  createDefaultColDef: () => ({}),
  createGridOptions: () => ({}),
}));

jest.mock('../src/constants/entityListStyles', () => ({
  ENTITY_LIST_STYLES: {
    container: {},
    contentBox: {},
    gridContainer: {},
    gridWrapper: {},
  },
}));

// Import the component after mocking
const EntityList = React.lazy(() => import('../src/pages/entitySetup/EntityList'));

const createMockStore = () => {
  return configureStore({
    reducer: {
      entities: (state = { items: [] }, action) => state,
    },
  });
};

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {component}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('EntityList Test', () => {
  it('should render without crashing', () => {
    renderWithProviders(
      <React.Suspense fallback={<div>Loading...</div>}>
        <EntityList />
      </React.Suspense>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});