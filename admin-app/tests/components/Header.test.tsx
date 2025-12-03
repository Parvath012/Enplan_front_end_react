import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../src/components/Header';

// Mock location hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/admin/entity-setup'
  }),
}));

describe('Header Component', () => {
  it('renders the header with navigation items', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if navigation items are rendered
    expect(screen.getByText('Entity Setup')).toBeInTheDocument();
    expect(screen.getByText('Template')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });
  
  it('marks the active navigation item based on current route', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // The mocked location is /admin/entity-setup, so this list item should be active
    const entitySetupLi = screen.getByText('Entity Setup').closest('li');
    expect(entitySetupLi).toHaveClass('active');
    
    // Other links should not be active
    const templateLi = screen.getByText('Template').closest('li');
    expect(templateLi).not.toHaveClass('active');
  });
  
  it('displays icons in the header', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check for some of the icons
    expect(screen.getByAltText('Calendar')).toBeInTheDocument();
    expect(screen.getByAltText('Fullscreen')).toBeInTheDocument();
  });
  
  it('includes icons for functionality', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check for Volume Block Storage and Chat icons from Carbon
    const iconItems = document.querySelectorAll('.icon-item svg');
    expect(iconItems.length).toBeGreaterThan(0);
  });
  
  it('has exactly one active nav based on current route', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    const active = document.querySelectorAll('li.active');
    expect(active.length).toBe(1);
  });

  it('should update active item when a navigation link is clicked', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Initially Entity Setup should be active
    const entitySetupLi = screen.getByText('Entity Setup').closest('li');
    expect(entitySetupLi).toHaveClass('active');
    
    // Click on Template link
    const templateLink = screen.getByText('Template');
    fireEvent.click(templateLink);
    
    // Now the Template item should be active
    const templateLi = templateLink.closest('li');
    expect(templateLi).toHaveClass('active');
    
    // And Entity Setup should no longer be active
    expect(entitySetupLi).not.toHaveClass('active');
  });
  
  it('renders all navigation items correctly', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    const expectedNavItems = [
      'Entity Setup',
      'Template',
      'Settings',
      'Infrastructure',
      'User Management',
      'Workflows',
      'Dashboards'
    ];
    
    // Check if all expected navigation items are present
    expectedNavItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
    
    // Check if the correct number of nav items are rendered
    const navItems = document.querySelectorAll('.nav-item');
    expect(navItems.length).toBe(expectedNavItems.length);
  });
  
  it('renders the correct icons', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if the divider is rendered
    const divider = document.querySelector('.header-divider');
    expect(divider).toBeInTheDocument();
    
    // Check if the correct number of icon items are rendered
    const iconItems = document.querySelectorAll('.icon-item');
    expect(iconItems.length).toBe(4); // 2 image icons + 2 SVG icons
  });
});
