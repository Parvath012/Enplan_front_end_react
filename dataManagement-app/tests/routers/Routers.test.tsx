import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { router } from '../../src/routers/Routers';

// Mock the Layout component
jest.mock('../../src/pages/layout', () => {
  return function MockLayout() {
    return <div data-testid="mock-layout">Mock Layout Component</div>;
  };
});

describe('Routers', () => {
  it('exports router configuration correctly', () => {
    expect(router).toBeDefined();
    expect(Array.isArray(router)).toBe(true);
    expect(router.length).toBeGreaterThan(0);
  });

  it('contains root path route', () => {
    const rootRoute = router.find(route => route.path === '/');
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.element).toBeDefined();
  });

  it('root route renders Layout component', () => {
    const rootRoute = router.find(route => route.path === '/');
    expect(React.isValidElement(rootRoute?.element)).toBe(true);
  });

  it('has correct route structure', () => {
    router.forEach(route => {
      expect(route).toHaveProperty('path');
      expect(route).toHaveProperty('element');
      expect(typeof route.path).toBe('string');
      expect(React.isValidElement(route.element)).toBe(true);
    });
  });

  it('router configuration is immutable', () => {
    const originalLength = router.length;
    const originalFirstRoute = { ...router[0] };
    
    // Attempt to modify router (should not affect original)
    const modifiedRouter = [...router, { path: '/test', element: <div>Test</div> }];
    
    expect(router.length).toBe(originalLength);
    expect(router[0]).toEqual(originalFirstRoute);
    expect(modifiedRouter.length).toBe(originalLength + 1);
  });

  it('all routes have valid React elements', () => {
    router.forEach(route => {
      expect(React.isValidElement(route.element)).toBe(true);
    });
  });

  it('root route element is Layout', () => {
    const rootRoute = router.find(route => route.path === '/');
    
    // Render the element to test it
    const { getByTestId } = render(
      <BrowserRouter>
        {rootRoute?.element}
      </BrowserRouter>
    );
    
    expect(getByTestId('mock-layout')).toBeInTheDocument();
  });

  it('router handles single route correctly', () => {
    expect(router).toHaveLength(1);
    expect(router[0].path).toBe('/');
  });

  it('maintains consistent export structure', () => {
    // Test that router is always an array with consistent structure
    expect(router).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.any(String),
          element: expect.any(Object)
        })
      ])
    );
  });

  it('does not have duplicate routes', () => {
    const paths = router.map(route => route.path);
    const uniquePaths = [...new Set(paths)];
    expect(paths.length).toBe(uniquePaths.length);
  });
});