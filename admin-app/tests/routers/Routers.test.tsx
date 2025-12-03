import React from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { router } from '../../src/routers/Routers';

jest.mock('entitySetupApp/EntitySetupApp', () => () => <div>EntitySetup Microfrontend</div>);
jest.mock('userManagementApp/UserManagementApp', () => () => <div>UserManagement Microfrontend</div>);
jest.mock('dataManagementApp/DataManagementApp', () => () => <div>DataManagement Microfrontend</div>);
jest.mock('../../src/pages/userManagement/Users', () => () => <div>Users Page</div>);
jest.mock('../../src/pages/userManagement/UsersFromJava', () => () => <div>UsersFromJava Page</div>);
jest.mock('../../src/components/LeftSidebar', () => () => <div data-testid="left-sidebar">LeftSidebar</div>);
jest.mock('../../src/components/Header', () => () => <div data-testid="header">Header</div>);

describe('admin router', () => {
  it('renders home splash on root', () => {
    // Router is created with createBrowserRouter; we cannot easily change entries here.
    // Just ensure router object composes without throwing.
    render(<RouterProvider router={router} />);
    expect(screen.getByText(/Welcome to EnPlan-2.0/i)).toBeInTheDocument();
  });

  it('should have router defined', () => {
    expect(router).toBeDefined();
  });

  it('should render BaseLayout for root path', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
  });

  it('should render AdminLayout for /admin path', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/admin'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render help page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/help'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
  });

  it('should render data-management route', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/data-management'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('DataManagement Microfrontend')).toBeInTheDocument();
  });

  it('should render masters page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/masters'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Masters')).toBeInTheDocument();
  });

  it('should render budgeting page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/budgeting'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Budgeting')).toBeInTheDocument();
  });

  it('should render inventory page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/inventory'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Inventory / OTB')).toBeInTheDocument();
  });

  it('should render assortment page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/assortment'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Assortment')).toBeInTheDocument();
  });

  it('should render allocation page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/allocation'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Allocation & Replenishment')).toBeInTheDocument();
  });

  it('should render fp-and-a page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/fp-and-a'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('FP & A')).toBeInTheDocument();
  });

  it('should render notifications page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/notifications'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('should render users page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/users'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Users Page')).toBeInTheDocument();
  });

  it('should render java-users page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/java-users'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('UsersFromJava Page')).toBeInTheDocument();
  });

  it('should render admin dashboard', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/admin'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('should render admin users page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/admin/users'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Users Page')).toBeInTheDocument();
  });

  it('should render admin java-users page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/admin/java-users'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('UsersFromJava Page')).toBeInTheDocument();
  });

  it('should render admin entity-setup route', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/admin/entity-setup'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('EntitySetup Microfrontend')).toBeInTheDocument();
  });

  it('should render admin template page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/admin/template'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Template Page')).toBeInTheDocument();
  });

  it('should render admin settings page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/admin/settings'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Settings Page')).toBeInTheDocument();
  });

  it('should render admin infrastructure page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/admin/infrastructure'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Infrastructure Page')).toBeInTheDocument();
  });

  it('should render admin user-management route', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/admin/user-management'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('UserManagement Microfrontend')).toBeInTheDocument();
  });

  it('should render admin workflows page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/admin/workflows'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Workflows Page')).toBeInTheDocument();
  });

  it('should render admin dashboards page', () => {
    const testRouter = createMemoryRouter(router.routes || [], {
      initialEntries: ['/admin/dashboards'],
    });
    render(<RouterProvider router={testRouter} />);
    expect(screen.getByText('Dashboards Page')).toBeInTheDocument();
  });
});

