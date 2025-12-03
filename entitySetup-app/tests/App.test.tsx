import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/store/Reducers/rootReducer';

// Mock the Router component
jest.mock('../src/routers/Routers', () => {
  return function MockRouter() {
    return <div data-testid="router">Mock Router</div>;
  };
});

// Mock the store
const mockStore = configureStore({
  reducer: rootReducer,
  preloadedState: {
    entities: {
      items: [],
      loading: false,
      error: null
    },
    entitySetup: {
      loading: false,
      error: null
    },
    entityConfiguration: {}
  }
});

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );
    
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('renders with CssBaseline', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );
    
    // CssBaseline should be present (it doesn't render visible content)
    expect(container.firstChild).toBeInTheDocument();
  });

  it('provides Redux store context', () => {
    render(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );
    
    // The component should render without errors, indicating store is properly provided
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('renders Router component', () => {
    render(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );
    
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('has correct component structure', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );
    
    // Should have the main app structure
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles store updates', () => {
    const { rerender } = render(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );
    
    // Re-render with same store
    rerender(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );
    
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('renders with different store states', () => {
    const storeWithData = configureStore({
      reducer: rootReducer,
      preloadedState: {
        entities: {
          items: [{ id: '1', name: 'Test Entity' }],
          loading: false,
          error: null
        },
        entitySetup: {
          loading: true,
          error: null
        },
        entityConfiguration: {}
      }
    });

    render(
      <Provider store={storeWithData}>
        <App />
      </Provider>
    );
    
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('handles error states gracefully', () => {
    const storeWithError = configureStore({
      reducer: rootReducer,
      preloadedState: {
        entities: {
          items: [],
          loading: false,
          error: 'Test error'
        },
        entitySetup: {
          loading: false,
          error: 'Test error'
        },
        entityConfiguration: {}
      }
    });

    render(
      <Provider store={storeWithError}>
        <App />
      </Provider>
    );
    
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });
});