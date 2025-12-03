import React from 'react';
import { render } from '@testing-library/react';
import GridStyles from '../../../src/components/grid/GridStyles';

describe('GridStyles', () => {
  it('renders without crashing', () => {
    const { container } = render(<GridStyles />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders a style element', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement).toBeInTheDocument();
  });

  it('contains AG Grid header cell styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-header-cell-custom .ag-header-cell-text');
    expect(styleElement?.textContent).toContain('font-size: 10px !important');
    expect(styleElement?.textContent).toContain('font-weight: 650 !important');
  });

  it('contains AG Grid header cell center styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-header-cell-custom-center .ag-header-cell-text');
  });

  it('contains AG Grid sortable header styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-header-cell.ag-header-cell-sortable .ag-header-label');
    expect(styleElement?.textContent).toContain('display: flex');
    expect(styleElement?.textContent).toContain('align-items: center');
  });

  it('contains AG Grid header label styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-header-cell .ag-header-label');
    expect(styleElement?.textContent).toContain('width: 100%');
  });

  it('contains AG Grid header cell text styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-header-cell .ag-header-cell-text');
    expect(styleElement?.textContent).toContain('flex: 1 1 auto');
    expect(styleElement?.textContent).toContain('overflow: hidden');
    expect(styleElement?.textContent).toContain('text-overflow: ellipsis');
  });

  it('contains AG Grid sort indicator styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-header-cell .ag-header-label .ag-sort-indicator-container');
    expect(styleElement?.textContent).toContain('margin-left: auto');
    expect(styleElement?.textContent).toContain('display: inline-flex');
  });

  it('contains AG Grid filter icon hide styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-header-cell .ag-header-icon.ag-header-icon-filter');
    expect(styleElement?.textContent).toContain('display: none !important');
  });

  it('contains AG Grid row hover removal styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-theme-alpine .ag-row-hover');
    expect(styleElement?.textContent).toContain('background-color: transparent !important');
  });

  it('contains AG Grid cell hover removal styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-theme-alpine .ag-cell:hover');
    expect(styleElement?.textContent).toContain('background-color: transparent !important');
  });

  it('contains AG Grid CSS custom properties override', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-theme-alpine {');
    expect(styleElement?.textContent).toContain('--ag-row-hover-color: transparent !important');
    expect(styleElement?.textContent).toContain('--ag-selected-row-background-color: transparent !important');
  });

  it('contains fallback selectors without theme specificity', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-row-hover {');
    expect(styleElement?.textContent).toContain('.ag-row:hover {');
    expect(styleElement?.textContent).toContain('.ag-cell:hover {');
  });

  it('contains overlay hide styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-overlay-no-rows-wrapper');
    expect(styleElement?.textContent).toContain('.ag-overlay-no-rows-center');
    expect(styleElement?.textContent).toContain('.ag-overlay-loading-wrapper');
    expect(styleElement?.textContent).toContain('.ag-overlay-loading-center');
    expect(styleElement?.textContent).toContain('display: none !important');
  });

  it('contains Inter font family styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain("font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important");
  });

  it('contains color styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('color: #818586 !important');
  });

  it('contains gap styles for header labels', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('gap: 4px');
  });

  it('contains cell alignment styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-theme-alpine .ag-cell {');
    expect(styleElement?.textContent).toContain('display: flex !important');
    expect(styleElement?.textContent).toContain('align-items: center !important');
    expect(styleElement?.textContent).toContain('vertical-align: middle !important');
  });

  it('contains cell wrapper styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-theme-alpine .ag-cell-wrapper');
    expect(styleElement?.textContent).toContain('height: 100% !important');
    expect(styleElement?.textContent).toContain('width: 100% !important');
  });

  it('contains cell value styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-theme-alpine .ag-cell-value');
  });

  it('contains cell span styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-theme-alpine .ag-cell span');
  });

  it('contains custom cell class styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-theme-alpine .ag-cell-custom');
  });

  it('contains action cell styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-theme-alpine .action-cell-no-border');
    expect(styleElement?.textContent).toContain('justify-content: center !important');
    expect(styleElement?.textContent).toContain('text-align: center !important');
  });

  it('contains action cell wrapper styles', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    expect(styleElement?.textContent).toContain('.ag-theme-alpine .action-cell-no-border .ag-cell-wrapper');
  });

  it('renders as a functional component', () => {
    const { container } = render(<GridStyles />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains all CSS rules', () => {
    const { container } = render(<GridStyles />);
    const styleElement = container.querySelector('style');
    const content = styleElement?.textContent || '';
    
    // Check for key CSS rules
    expect(content).toContain('.ag-header-cell-custom');
    expect(content).toContain('.ag-theme-alpine');
    expect(content).toContain('.ag-overlay-no-rows-wrapper');
    expect(content).toContain('.ag-overlay-loading-wrapper');
    expect(content).toContain('!important');
  });
});
