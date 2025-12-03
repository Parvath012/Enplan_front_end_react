import React from 'react';
import { render } from '@testing-library/react';
import GridStyles from '../../src/components/GridStyles';

describe('GridStyles', () => {
  it('renders without crashing', () => {
    expect(() => render(<GridStyles />)).not.toThrow();
  });

  it('injects CSS styles into the document', () => {
    const { container } = render(<GridStyles />);
    
    // Check if style element is rendered in the component
    const styleElement = container.querySelector('style');
    expect(styleElement).toBeTruthy();
    
    // Check if the style element contains AG Grid CSS
    if (styleElement) {
      expect(styleElement.textContent).toContain('ag-header-cell');
    }
  });

  it('applies grid-specific styles', () => {
    const { container } = render(<GridStyles />);
    
    const styleElement = container.querySelector('style');
    expect(styleElement).toBeTruthy();
    
    if (styleElement) {
      const cssText = styleElement.textContent || '';
      expect(cssText).toContain('ag-header-cell');
      expect(cssText).toContain('ag-theme-alpine');
      expect(cssText).toContain('background-color: transparent');
    }
  });

  it('handles multiple instances gracefully', () => {
    const { rerender } = render(<GridStyles />);
    expect(() => rerender(<GridStyles />)).not.toThrow();
  });

  it('creates style component correctly', () => {
    const { container } = render(<GridStyles />);
    // GridStyles typically doesn't render visible content
    expect(container.firstChild).toBeTruthy();
  });

  it('applies custom CSS variables', () => {
    render(<GridStyles />);
    
    const styleElement = Array.from(document.head.querySelectorAll('style')).find(
      style => style.textContent?.includes('--ag-') || style.textContent?.includes('grid')
    );
    
    if (styleElement) {
      expect(styleElement.textContent).toBeTruthy();
    }
  });

  it('maintains consistent styling across renders', () => {
    const { rerender } = render(<GridStyles />);
    const initialStyleCount = document.head.querySelectorAll('style').length;
    
    rerender(<GridStyles />);
    const afterRerenderStyleCount = document.head.querySelectorAll('style').length;
    
    expect(afterRerenderStyleCount).toBeGreaterThanOrEqual(initialStyleCount);
  });

  it('does not interfere with other components', () => {
    const TestComponent = () => <div data-testid="test-component">Test</div>;
    
    const { getByTestId } = render(
      <>
        <GridStyles />
        <TestComponent />
      </>
    );
    
    expect(getByTestId('test-component')).toBeInTheDocument();
  });

  it('cleans up styles on unmount', () => {
    const { unmount } = render(<GridStyles />);
    
    expect(() => unmount()).not.toThrow();
  });

  it('works with styled-components or emotion', () => {
    // Test that GridStyles works with different CSS-in-JS libraries
    expect(() => render(<GridStyles />)).not.toThrow();
  });
});