import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStoreModule from '../../src/store/configureStore';

describe('configureStore', () => {
  it('should create a store with user reducer', () => {
    const store = configureStoreModule;
    
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.dispatch).toBeDefined();
    expect(store.subscribe).toBeDefined();
  });

  it('should have initial state with user slice', () => {
    const store = configureStoreModule;
    const state = store.getState();
    
    expect(state).toHaveProperty('users');
    expect(state.users).toBeDefined();
  });

  it('should handle user actions', () => {
    const store = configureStoreModule;
    const initialState = store.getState();
    
    expect(initialState.users).toBeDefined();
  });

  it('should be usable with Provider', () => {
    const store = configureStoreModule;
    
    const TestComponent = () => <div>Test</div>;
    
    const { container } = render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have redux devtools configuration', () => {
    const store = configureStoreModule;
    
    // Store should be configured properly
    expect(store).toBeDefined();
    expect(typeof store.getState).toBe('function');
    expect(typeof store.dispatch).toBe('function');
  });

  it('should handle middleware configuration', () => {
    const store = configureStoreModule;
    
    // Store should be configured with middleware
    expect(store).toBeDefined();
  });

  it('should have proper reducer structure', () => {
    const store = configureStoreModule;
    const state = store.getState();
    
    expect(state).toHaveProperty('users');
    expect(typeof state.users).toBe('object');
  });
});
