import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import userReducer from '../../src/store/Reducers/userSlice';

// A custom render function that includes providers
export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store,
    ...renderOptions
  }: any = {}
) {
  // Create store with proper preloadedState
  const testStore = store || configureStore({
    reducer: { 
      users: userReducer 
    },
    preloadedState: {
      users: {
        users: [
          { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com', role: 'admin', department: 'it', status: 'Active', isenabled: true },
          { id: 2, firstname: 'Jane', lastname: 'Smith', emailid: 'jane@example.com', role: 'user', department: 'hr', status: 'Active', isenabled: true }
        ],
        hasUsers: true,
        loading: false,
        error: null,
        hierarchyLoading: false,
        hierarchyError: null,
        initialFetchAttempted: false,
        ...(preloadedState.users || {})
      },
      ...preloadedState
    },
  });
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = createTheme();
    return (
      <Provider store={testStore}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  };
  return { store: testStore, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Mock store factory
export function createMockStore(preloadedState = {}) {
  return configureStore({
    reducer: { users: userReducer },
    preloadedState: {
      users: {
        users: [
          { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com', role: 'admin', department: 'it', status: 'Active', isenabled: true },
          { id: 2, firstname: 'Jane', lastname: 'Smith', emailid: 'jane@example.com', role: 'user', department: 'hr', status: 'Active', isenabled: true }
        ],
        hasUsers: true,
        loading: false,
        error: null,
        hierarchyLoading: false,
        hierarchyError: null,
        initialFetchAttempted: false,
        ...(preloadedState.users || {})
      },
      ...preloadedState
    },
  });
}

// Mock user data factory
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '1234567890',
    role: 'Admin',
    department: 'IT',
    reportingManager: 'Jane Smith',
    isenabled: true,
    status: 'Active',
    ...overrides,
  };
}

// Wait for async operations
export async function waitForAsync() {
  await new Promise(resolve => setTimeout(resolve, 0));
}
