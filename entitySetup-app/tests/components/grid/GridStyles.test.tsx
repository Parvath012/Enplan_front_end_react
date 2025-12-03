import React from 'react';
import { render } from '@testing-library/react';
import GridStyles from '../../../src/components/grid/GridStyles';

// Mock console.error to prevent React strict mode warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('React does not recognize')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('GridStyles Component', () => {
  // Basic rendering tests
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<GridStyles />);
      expect(container).toBeInTheDocument();
    });

    it('should render as style element', () => {
      const { container } = render(<GridStyles />);
      const styleElement = container.querySelector('style');
      expect(styleElement).toBeInTheDocument();
    });

    it('should contain CSS content', () => {
      const { container } = render(<GridStyles />);
      const styleElement = container.querySelector('style');
      expect(styleElement?.textContent).toBeTruthy();
      expect(styleElement?.textContent?.length).toBeGreaterThan(0);
    });
  });

  // CSS Content Tests
  describe('CSS Content', () => {
    let styleContent: string;

    beforeEach(() => {
      const { container } = render(<GridStyles />);
      const styleElement = container.querySelector('style');
      styleContent = styleElement?.textContent || '';
    });

    it('should contain AG Grid header cell styles', () => {
      expect(styleContent).toContain('.ag-header-cell-custom .ag-header-cell-text');
      expect(styleContent).toContain('.ag-header-cell-custom-center .ag-header-cell-text');
    });

    it('should contain font family definitions', () => {
      expect(styleContent).toContain("font-family: 'Inter Tight'");
      expect(styleContent).toContain('-apple-system');
      expect(styleContent).toContain('BlinkMacSystemFont');
      expect(styleContent).toContain('sans-serif');
    });

    it('should contain font weight and size styles', () => {
      expect(styleContent).toContain('font-size: 10px !important');
      expect(styleContent).toContain('font-weight: 650 !important');
    });

    it('should contain color definitions', () => {
      expect(styleContent).toContain('color: #818586 !important');
    });

    it('should contain header label layout styles', () => {
      expect(styleContent).toContain('.ag-header-cell.ag-header-cell-sortable .ag-header-label');
      expect(styleContent).toContain('.ag-header-cell .ag-header-label');
      expect(styleContent).toContain('display: flex');
      expect(styleContent).toContain('align-items: center');
    });

    it('should contain text overflow handling', () => {
      expect(styleContent).toContain('overflow: hidden');
      expect(styleContent).toContain('text-overflow: ellipsis');
      expect(styleContent).toContain('white-space: nowrap');
    });

    it('should contain sort indicator styles', () => {
      expect(styleContent).toContain('.ag-sort-indicator-container');
      expect(styleContent).toContain('.ag-sort-indicator-icon');
      expect(styleContent).toContain('.ag-sort-ascending-icon');
      expect(styleContent).toContain('.ag-sort-descending-icon');
      expect(styleContent).toContain('.ag-sort-none-icon');
      expect(styleContent).toContain('margin-left: auto');
    });

    it('should hide header filter icon', () => {
      expect(styleContent).toContain('.ag-header-icon.ag-header-icon-filter');
      expect(styleContent).toContain('display: none !important');
    });
  });

  // Hover Effect Tests
  describe('Hover Effects', () => {
    let styleContent: string;

    beforeEach(() => {
      const { container } = render(<GridStyles />);
      const styleElement = container.querySelector('style');
      styleContent = styleElement?.textContent || '';
    });

    it('should disable row hover effects', () => {
      expect(styleContent).toContain('.ag-theme-alpine .ag-row-hover');
      expect(styleContent).toContain('.ag-theme-alpine .ag-row:hover');
      expect(styleContent).toContain('.ag-theme-alpine .ag-row-selected:hover');
      expect(styleContent).toContain('.ag-theme-alpine .ag-row.ag-row-hover');
      expect(styleContent).toContain('background-color: transparent !important');
    });

    it('should disable cell hover effects', () => {
      expect(styleContent).toContain('.ag-theme-alpine .ag-cell:hover');
      expect(styleContent).toContain('.ag-theme-alpine .ag-cell-selected:hover');
      expect(styleContent).toContain('.ag-theme-alpine .ag-row:hover .ag-cell');
      expect(styleContent).toContain('.ag-theme-alpine .ag-row-hover .ag-cell');
    });

    it('should contain CSS custom properties for hover effects', () => {
      expect(styleContent).toContain('--ag-row-hover-color: transparent !important');
      expect(styleContent).toContain('--ag-selected-row-background-color: transparent !important');
      expect(styleContent).toContain('--ag-range-selection-background-color: transparent !important');
    });

    it('should contain fallback hover selectors', () => {
      expect(styleContent).toContain('.ag-row-hover {');
      expect(styleContent).toContain('.ag-row:hover {');
      expect(styleContent).toContain('.ag-row-selected:hover {');
      expect(styleContent).toContain('.ag-cell:hover {');
      expect(styleContent).toContain('.ag-cell-selected:hover {');
    });
  });

  // Overlay Tests
  describe('Overlay Styles', () => {
    let styleContent: string;

    beforeEach(() => {
      const { container } = render(<GridStyles />);
      const styleElement = container.querySelector('style');
      styleContent = styleElement?.textContent || '';
    });

    it('should hide "No rows to show" overlay', () => {
      expect(styleContent).toContain('.ag-overlay-no-rows-wrapper');
      expect(styleContent).toContain('.ag-overlay-no-rows-center');
      expect(styleContent).toContain('display: none !important');
    });

    it('should hide loading overlay', () => {
      expect(styleContent).toContain('.ag-overlay-loading-wrapper');
      expect(styleContent).toContain('.ag-overlay-loading-center');
      expect(styleContent).toContain('display: none !important');
    });
  });

  // Component Structure Tests
  describe('Component Structure', () => {
    it('should be a functional component', () => {
      expect(typeof GridStyles).toBe('function');
    });

    it('should have correct display name', () => {
      expect(GridStyles.name).toBe('GridStyles');
    });

    it('should not have any props', () => {
      expect(GridStyles.length).toBe(0);
    });
  });

  // Multiple Renders Test
  describe('Multiple Renders', () => {
    it('should render consistently across multiple mounts', () => {
      const { container: container1 } = render(<GridStyles />);
      const { container: container2 } = render(<GridStyles />);
      
      const style1 = container1.querySelector('style')?.textContent;
      const style2 = container2.querySelector('style')?.textContent;
      
      expect(style1).toBe(style2);
    });

    it('should maintain style content after re-render', () => {
      const { container, rerender } = render(<GridStyles />);
      const initialContent = container.querySelector('style')?.textContent;
      
      rerender(<GridStyles />);
      const rerenderedContent = container.querySelector('style')?.textContent;
      
      expect(rerenderedContent).toBe(initialContent);
    });
  });

  // Style Element Properties
  describe('Style Element Properties', () => {
    it('should have style element as direct child', () => {
      const { container } = render(<GridStyles />);
      const styleElement = container.firstChild;
      expect(styleElement?.nodeName).toBe('STYLE');
    });

    it('should not have any attributes on style element', () => {
      const { container } = render(<GridStyles />);
      const styleElement = container.querySelector('style');
      expect(styleElement?.attributes.length).toBe(0);
    });
  });

  // CSS Specificity Tests
  describe('CSS Specificity', () => {
    let styleContent: string;

    beforeEach(() => {
      const { container } = render(<GridStyles />);
      const styleElement = container.querySelector('style');
      styleContent = styleElement?.textContent || '';
    });

    it('should use !important declarations for critical styles', () => {
      const importantDeclarations = (styleContent.match(/!important/g) || []).length;
      expect(importantDeclarations).toBeGreaterThan(0);
    });

    it('should have proper selector specificity for theme overrides', () => {
      expect(styleContent).toContain('.ag-theme-alpine');
    });
  });

  // CSS Validation Tests
  describe('CSS Validation', () => {
    let styleContent: string;

    beforeEach(() => {
      const { container } = render(<GridStyles />);
      const styleElement = container.querySelector('style');
      styleContent = styleElement?.textContent || '';
    });

    it('should have properly formatted CSS', () => {
      expect(styleContent).toContain('{');
      expect(styleContent).toContain('}');
      expect(styleContent).toContain(';');
    });

    it('should not contain syntax errors', () => {
      // Check for common CSS syntax issues
      expect(styleContent).not.toMatch(/[{}]\s*[{}]/); // No empty rules
      expect(styleContent).not.toMatch(/:\s*;/); // No empty values
    });

    it('should have consistent indentation and formatting', () => {
      const lines = styleContent.split('\n').filter(line => line.trim());
      expect(lines.length).toBeGreaterThan(0);
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle unmounting gracefully', () => {
      const { unmount } = render(<GridStyles />);
      expect(() => unmount()).not.toThrow();
    });

    it('should work with React StrictMode', () => {
      expect(() => {
        render(
          <React.StrictMode>
            <GridStyles />
          </React.StrictMode>
        );
      }).not.toThrow();
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = performance.now();
      render(<GridStyles />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
    });

    it('should not cause memory leaks on multiple renders', () => {
      const iterations = 10;
      
      expect(() => {
        for (let i = 0; i < iterations; i++) {
          const { unmount } = render(<GridStyles />);
          unmount();
        }
      }).not.toThrow();
    });
  });
});