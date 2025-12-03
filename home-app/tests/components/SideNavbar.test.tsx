import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SideNavbar from '../../src/components/SideNavbar';

describe('SideNavbar component', () => {
  test('renders Home navigation link when path starts with /home-app', () => {
    render(
      <MemoryRouter initialEntries={['/home-app']}>
        <SideNavbar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/home-app');
  });

  test('renders Home navigation link when path does NOT start with /home-app', () => {
    render(
      <MemoryRouter initialEntries={['/other']}>
        <SideNavbar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    // React Router resolves <Link to=""> to "/"
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });
});
