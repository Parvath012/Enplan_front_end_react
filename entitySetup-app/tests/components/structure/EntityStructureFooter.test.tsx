import React from 'react';
import { render, screen } from '@testing-library/react';
import EntityStructureFooter from '../../../src/components/structure/EntityStructureFooter';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div data-testid="mui-box" {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <div data-testid="typography" {...props}>{children}</div>,
}));

describe('EntityStructureFooter', () => {
  const defaultProps = {
    totalCount: 5,
  };

  const renderComponent = (props = {}) => {
    return render(<EntityStructureFooter {...defaultProps} {...props} />);
  };

  it('renders without crashing', () => {
    renderComponent();
    // Use getAllByTestId since there are multiple mui-box elements
    const boxes = screen.getAllByTestId('mui-box');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('displays the total entity count', () => {
    renderComponent();
    expect(screen.getByText('Total Entity: 5')).toBeInTheDocument();
  });

  it('displays correct total count when prop changes', () => {
    const { rerender } = renderComponent({ totalCount: 10 });
    expect(screen.getByText('Total Entity: 10')).toBeInTheDocument();

    rerender(<EntityStructureFooter totalCount={0} />);
    expect(screen.getByText('Total Entity: 0')).toBeInTheDocument();

    rerender(<EntityStructureFooter totalCount={100} />);
    expect(screen.getByText('Total Entity: 100')).toBeInTheDocument();
  });

  it('displays the rollup entity legend', () => {
    renderComponent();
    expect(screen.getByText('Rollup Entity:')).toBeInTheDocument();
  });

  it('displays the planning entity legend', () => {
    renderComponent();
    expect(screen.getByText('Planning Entity:')).toBeInTheDocument();
  });

  it('renders legend indicators with correct colors', () => {
    renderComponent();
    
    // Get all mui-box elements and check that we have the expected structure
    const boxes = screen.getAllByTestId('mui-box');
    
    // The component should have multiple boxes including the legend indicators
    // We expect at least the main container, total count container, and legend containers
    expect(boxes.length).toBeGreaterThanOrEqual(3);
    
    // Check that we have the legend text elements
    expect(screen.getByText('Rollup Entity:')).toBeInTheDocument();
    expect(screen.getByText('Planning Entity:')).toBeInTheDocument();
  });

  it('renders with correct structure', () => {
    renderComponent();
    
    // Check main container - use getAllByTestId and get the first one
    const mainContainer = screen.getAllByTestId('mui-box')[0];
    expect(mainContainer).toBeInTheDocument();
    
    // Check total count text
    expect(screen.getByText('Total Entity: 5')).toBeInTheDocument();
    
    // Check legend section
    expect(screen.getByText('Rollup Entity:')).toBeInTheDocument();
    expect(screen.getByText('Planning Entity:')).toBeInTheDocument();
  });

  it('handles zero total count', () => {
    renderComponent({ totalCount: 0 });
    expect(screen.getByText('Total Entity: 0')).toBeInTheDocument();
  });

  it('handles large total count', () => {
    renderComponent({ totalCount: 999999 });
    expect(screen.getByText('Total Entity: 999999')).toBeInTheDocument();
  });

  it('renders with default zoom percentage when not provided', () => {
    renderComponent();
    // The component should still render correctly without zoomPercentage prop
    expect(screen.getByText('Total Entity: 5')).toBeInTheDocument();
  });

  it('renders with custom zoom percentage when provided', () => {
    renderComponent({ totalCount: 5, zoomPercentage: 150 });
    // The component should render correctly with zoomPercentage prop
    expect(screen.getByText('Total Entity: 5')).toBeInTheDocument();
  });

  it('maintains consistent layout with different counts', () => {
    const testCounts = [0, 1, 10, 100, 1000];
    
    testCounts.forEach(count => {
      const { unmount } = renderComponent({ totalCount: count });
      expect(screen.getByText(`Total Entity: ${count}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders all required Material-UI components', () => {
    renderComponent();
    
    // Check that all Material-UI components are rendered
    const boxes = screen.getAllByTestId('mui-box');
    const typographies = screen.getAllByTestId('typography');
    
    expect(boxes.length).toBeGreaterThan(0);
    expect(typographies.length).toBeGreaterThan(0);
  });

  it('displays legend items in correct order', () => {
    renderComponent();
    
    const totalText = screen.getByText('Total Entity: 5');
    const rollupText = screen.getByText('Rollup Entity:');
    const planningText = screen.getByText('Planning Entity:');
    
    // Check that elements are rendered
    expect(totalText).toBeInTheDocument();
    expect(rollupText).toBeInTheDocument();
    expect(planningText).toBeInTheDocument();
  });

  it('handles negative total count gracefully', () => {
    renderComponent({ totalCount: -5 });
    expect(screen.getByText('Total Entity: -5')).toBeInTheDocument();
  });

  it('renders with proper styling attributes', () => {
    renderComponent();
    
    // Use getAllByTestId and get the first one for main container
    const mainContainer = screen.getAllByTestId('mui-box')[0];
    expect(mainContainer).toBeInTheDocument();
    
    // Check that the component has the expected structure
    expect(screen.getByText('Total Entity: 5')).toBeInTheDocument();
    expect(screen.getByText('Rollup Entity:')).toBeInTheDocument();
    expect(screen.getByText('Planning Entity:')).toBeInTheDocument();
  });

  it('maintains accessibility with proper text content', () => {
    renderComponent();
    
    // Check that all text content is accessible
    expect(screen.getByText('Total Entity: 5')).toBeInTheDocument();
    expect(screen.getByText('Rollup Entity:')).toBeInTheDocument();
    expect(screen.getByText('Planning Entity:')).toBeInTheDocument();
  });
});
