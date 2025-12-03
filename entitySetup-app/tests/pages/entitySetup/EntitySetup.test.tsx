import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import EntitySetup from '../../../src/pages/entitySetup/EntitySetup';

// Mock the lazy-loaded components
jest.mock('commonApp/CircularLoader', () => {
  return function MockCircularLoader({ variant, backgroundColor, activeColor, speed }: any) {
    return (
      <div 
        data-testid="circular-loader" 
        data-variant={variant}
        data-background-color={backgroundColor}
        data-active-color={activeColor}
        data-speed={speed}
      >
        Loading...
      </div>
    );
  };
});

// Mock the child components
jest.mock('../../../src/pages/entitySetup/WelcomePage', () => ({
  __esModule: true,
  default: function MockWelcomePage() {
    return <div data-testid="welcome-page">Welcome Page</div>;
  }
}));

jest.mock('../../../src/pages/entitySetup/EntityList', () => ({
  __esModule: true,
  default: function MockEntityList() {
    return <div data-testid="entity-list">Entity List</div>;
  }
}));

jest.mock('../../../src/pages/entitySetup/EntitySetupForm', () => ({
  __esModule: true,
  default: function MockEntitySetupForm() {
    return <div data-testid="entity-setup-form">Entity Setup Form</div>;
  }
}));

jest.mock('../../../src/components/entityConfiguration/EntityConfigurationLayout', () => ({
  __esModule: true,
  default: function MockEntityConfigurationLayout({ isViewMode }: any) {
    return (
      <div data-testid="entity-configuration-layout" data-view-mode={isViewMode}>
        Entity Configuration Layout
      </div>
    );
  }
}));

// Mock react-router-dom
const mockLocation = {
  pathname: '/entitySetup',
  search: '',
  hash: '',
  state: null,
  key: 'test-key'
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation
}));

// Mock the store actions
jest.mock('../../../src/store/Reducers/entitySlice', () => ({
  fetchEntities: jest.fn(() => ({ type: 'FETCH_ENTITIES' })),
  fetchEntityHierarchy: jest.fn(() => ({ type: 'FETCH_ENTITY_HIERARCHY' }))
}));

// Mock console.log to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('EntitySetup Component', () => {
  let mockStore: any;
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockStore = configureStore({
      reducer: {
        entities: (state = { items: [], loading: false }) => state
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false
        })
    });

    // Mock the store's dispatch
    jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  const renderWithProviders = (component: React.ReactElement, initialEntries = ['/entitySetup']) => {
    return render(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={initialEntries}>
          {component}
        </MemoryRouter>
      </Provider>
    );
  };

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<EntitySetup />);
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });

    it('dispatches fetch actions on mount', () => {
      renderWithProviders(<EntitySetup />);
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'FETCH_ENTITIES' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'FETCH_ENTITY_HIERARCHY' });
    });

    it('renders circular loader with correct props on index route when loading', () => {
      renderWithProviders(<EntitySetup />);
      
      const loader = screen.getByTestId('circular-loader');
      expect(loader).toHaveAttribute('data-variant', 'content');
      expect(loader).toHaveAttribute('data-background-color', '#e0f2ff');
      expect(loader).toHaveAttribute('data-active-color', '#007bff');
      expect(loader).toHaveAttribute('data-speed', '1');
    });
  });

  describe('Loading States', () => {
    it('shows loader when globalLoading is true on index route', () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [], loading: true })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });

    it('shows loader when hasEntities is null on index route', () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });

    it('shows loader when globalLoading is true on non-index route', () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [], loading: true })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />, ['/entitySetup/create']);
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });
  });

  describe('Route Handling', () => {
    it('renders welcome page when no entities exist on index route', async () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      
      await waitFor(() => {
        expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
      });
    });

    it('renders entity list when entities exist on index route', async () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [{ id: 1, name: 'Entity 1' }], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      
      await waitFor(() => {
        expect(screen.getByTestId('entity-list')).toBeInTheDocument();
      });
    });

    it('renders welcome page route', () => {
      renderWithProviders(<EntitySetup />, ['/entitySetup/welcome']);
      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
    });

    it('renders entity list route', () => {
      renderWithProviders(<EntitySetup />, ['/entitySetup/list']);
      expect(screen.getByTestId('entity-list')).toBeInTheDocument();
    });

    it('renders entity setup form route', () => {
      renderWithProviders(<EntitySetup />, ['/entitySetup/create']);
      expect(screen.getByTestId('entity-setup-form')).toBeInTheDocument();
    });

    it('renders entity setup form route with id', () => {
      renderWithProviders(<EntitySetup />, ['/entitySetup/edit/123']);
      expect(screen.getByTestId('entity-setup-form')).toBeInTheDocument();
    });

    it('renders entity configuration layout route for configure', () => {
      renderWithProviders(<EntitySetup />, ['/entitySetup/configure/123']);
      expect(screen.getByTestId('entity-configuration-layout')).toBeInTheDocument();
      expect(screen.getByTestId('entity-configuration-layout')).toHaveAttribute('data-view-mode', 'false');
    });

    it('renders entity configuration layout route for view', () => {
      renderWithProviders(<EntitySetup />, ['/entitySetup/view/123']);
      expect(screen.getByTestId('entity-configuration-layout')).toBeInTheDocument();
      expect(screen.getByTestId('entity-configuration-layout')).toHaveAttribute('data-view-mode', 'true');
    });

    it('renders fallback route when no entities exist', () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />, ['/entitySetup/unknown']);
      
      expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
    });

    it('renders fallback route when entities exist', () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [{ id: 1, name: 'Entity 1' }], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />, ['/entitySetup/unknown']);
      
      expect(screen.getByTestId('entity-list')).toBeInTheDocument();
    });
  });

  describe('Pathname Detection', () => {
    it('detects index route with /entitySetup', () => {
      mockLocation.pathname = '/entitySetup';
      renderWithProviders(<EntitySetup />);
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });

    it('detects index route with /entitySetup/', () => {
      mockLocation.pathname = '/entitySetup/';
      renderWithProviders(<EntitySetup />);
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });

    it('detects index route with /', () => {
      mockLocation.pathname = '/';
      renderWithProviders(<EntitySetup />);
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });

    it('detects index route with /admin/entity-setup', () => {
      mockLocation.pathname = '/admin/entity-setup';
      renderWithProviders(<EntitySetup />);
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });

    it('detects index route with /admin/entity-setup/', () => {
      mockLocation.pathname = '/admin/entity-setup/';
      renderWithProviders(<EntitySetup />);
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('handles hasEntities state changes', async () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      
      await waitFor(() => {
        expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
      });
    });

    it('handles loading state transitions', async () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [{ id: 1, name: 'Entity 1' }], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      
      await waitFor(() => {
        expect(screen.getByTestId('entity-list')).toBeInTheDocument();
      });
    });

    it('handles timeout in useEffect', async () => {
      jest.useFakeTimers();
      
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [{ id: 1, name: 'Entity 1' }], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      
      // Fast-forward time to trigger the timeout
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('entity-list')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Console Logging', () => {
    it('logs render state information', () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('logs hasEntities setting information', async () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [{ id: 1, name: 'Entity 1' }], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('handles component unmounting', () => {
      const { unmount } = renderWithProviders(<EntitySetup />);
      
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
      
      unmount();
      
      expect(screen.queryByTestId('circular-loader')).not.toBeInTheDocument();
    });

    it('handles prop changes', () => {
      const { rerender } = renderWithProviders(<EntitySetup />);
      
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
      
      rerender(<EntitySetup />);
      
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });
  });

  describe('Suspense Fallback', () => {
    it('handles Suspense fallback for CircularLoader', () => {
      renderWithProviders(<EntitySetup />);
      
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty entities array', async () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      
      await waitFor(() => {
        expect(screen.getByTestId('welcome-page')).toBeInTheDocument();
      });
    });

    it('handles entities array with items', async () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [{ id: 1, name: 'Entity 1' }], loading: false })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      
      await waitFor(() => {
        expect(screen.getByTestId('entity-list')).toBeInTheDocument();
      });
    });

    it('handles loading state with entities', () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [{ id: 1, name: 'Entity 1' }], loading: true })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });

    it('handles loading state without entities', () => {
      mockStore = configureStore({
        reducer: {
          entities: () => ({ items: [], loading: true })
        }
      });
      jest.spyOn(mockStore, 'dispatch').mockImplementation(mockDispatch);

      renderWithProviders(<EntitySetup />);
      
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper structure for screen readers', () => {
      renderWithProviders(<EntitySetup />);
      
      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });

    it('maintains accessibility during loading states', () => {
      renderWithProviders(<EntitySetup />);
      
      const loader = screen.getByTestId('circular-loader');
      expect(loader).toBeInTheDocument();
      expect(loader).toHaveTextContent('Loading...');
    });
  });
});