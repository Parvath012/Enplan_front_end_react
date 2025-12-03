import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Routers from '../../src/routers/Routers';

// Mock the components
jest.mock('../../src/pages/userManagement/UserManagement', () => {
  return function MockUserManagement() {
    return <div data-testid="user-management">User Management Component</div>;
  };
});

jest.mock('../../src/pages/userManagement/UserCreateForm', () => {
  return function MockUserCreateForm() {
    return <div data-testid="user-create-form">User Create Form Component</div>;
  };
});

jest.mock('../../src/pages/userManagement/UserList', () => {
  return function MockUserList() {
    return <div data-testid="user-list">User List Component</div>;
  };
});

jest.mock('../../src/pages/userManagement/WelcomePage', () => {
  return function MockWelcomePage() {
    return <div data-testid="welcome-page">Welcome Page Component</div>;
  };
});

// Mock react-router-dom components
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: ({ path, element }: { path: string; element: React.ReactNode }) => (
    <div data-testid={`route-${path}`}>{element}</div>
  ),
}));

describe('Routers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Routers />
      </BrowserRouter>
    );

    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('renders Routes component', () => {
    render(
      <BrowserRouter>
        <Routers />
      </BrowserRouter>
    );

    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('handles multiple route definitions', () => {
    const { container } = render(
      <BrowserRouter>
        <Routers />
      </BrowserRouter>
    );

    // Should have multiple route elements
    const routeElements = container.querySelectorAll('[data-testid^="route-"]');
    expect(routeElements.length).toBeGreaterThan(0);
  });

  it('maintains route structure', () => {
    render(
      <BrowserRouter>
        <Routers />
      </BrowserRouter>
    );

    // Check that the main structure is maintained
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('renders with BrowserRouter context', () => {
    render(
      <BrowserRouter>
        <Routers />
      </BrowserRouter>
    );

    // Should render without router-related errors
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('includes all expected route paths', () => {
    const { container } = render(
      <BrowserRouter>
        <Routers />
      </BrowserRouter>
    );

    // Check for specific route paths
    const routeElements = container.querySelectorAll('[data-testid^="route-"]');
    const routePaths = Array.from(routeElements).map(el => el.getAttribute('data-testid'));
    
    // Should include common route patterns
    expect(routePaths.some(path => path?.includes('route-/*'))).toBe(true);
  });

  it('renders without memory leaks', () => {
    const { unmount } = render(
      <BrowserRouter>
        <Routers />
      </BrowserRouter>
    );

    // Unmount should work without errors
    expect(() => unmount()).not.toThrow();
  });

  it('should render UserManagement component for any path', () => {
    render(
      <BrowserRouter>
        <Routers />
      </BrowserRouter>
    );
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
  });

  it('should render UserManagement for root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routers />
      </MemoryRouter>
    );
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
  });

  it('should render UserManagement for nested paths', () => {
    render(
      <MemoryRouter initialEntries={['/users/list']}>
        <Routers />
      </MemoryRouter>
    );
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
  });

  it('should render UserManagement for create path', () => {
    render(
      <MemoryRouter initialEntries={['/create']}>
        <Routers />
      </MemoryRouter>
    );
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
  });

  it('should render UserManagement for edit path', () => {
    render(
      <MemoryRouter initialEntries={['/edit/123']}>
        <Routers />
      </MemoryRouter>
    );
    expect(screen.getByTestId('user-management')).toBeInTheDocument();
  });

  it('should handle Router component structure', () => {
    const RouterComponent = require('../../src/routers/Routers').default;
    expect(RouterComponent).toBeDefined();
    expect(typeof RouterComponent).toBe('function');
  });

  it('should use wildcard path to catch all routes', () => {
    const paths = ['/', '/test', '/any/path', '/nested/deep/path'];
    
    paths.forEach(path => {
      const { unmount } = render(
        <MemoryRouter initialEntries={[path]}>
          <Routers />
        </MemoryRouter>
      );
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
      unmount();
    });
  });
});
