// Mock for commonApp/cellRenderers
import React from 'react';

export const ConditionalTooltipText = (props: any) => {
  return <div data-testid="conditional-tooltip-text-mock">Conditional Tooltip Text Mock</div>;
};

export const createHighlightedCellRenderer = jest.fn(() => {
  return (props: any) => <div data-testid="highlighted-cell-renderer-mock">Highlighted Cell Renderer Mock</div>;
});

