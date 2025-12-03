import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import HierarchyPanelContent from '../../../src/components/shared/HierarchyPanelContent';

// Mock dependencies
jest.mock('commonApp/HierarchyFlowRenderer', () => {
  return function MockHierarchyFlowRenderer(props: any) {
    return (
      <div data-testid="hierarchy-flow-renderer">
        <div data-testid="nodes-count">{props.nodes?.length || 0}</div>
        <div data-testid="edges-count">{props.edges?.length || 0}</div>
        <div data-testid="hierarchy-count">{props.hierarchy?.length || 0}</div>
        <div data-testid="hierarchy-loading">{props.hierarchyLoading ? 'true' : 'false'}</div>
      </div>
    );
  };
});

describe('HierarchyPanelContent', () => {
  const defaultProps = {
    nodes: [
      { id: '1', data: { fullName: 'John Doe' }, position: { x: 0, y: 0 } }
    ],
    edges: [
      { id: 'e1', source: '1', target: '2' }
    ],
    onNodesChange: jest.fn(),
    onEdgesChange: jest.fn(),
    reactFlowRef: React.createRef(),
    hierarchy: [{ id: 1, fullName: 'John Doe' }],
    hierarchyLoading: false,
    zoomIndex: 2,
    zoomSteps: [50, 75, 100, 125, 150] as readonly number[],
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    zoomReset: jest.fn(),
    footer: <div data-testid="footer">Footer Content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render HierarchyFlowRenderer', () => {
    render(<HierarchyPanelContent {...defaultProps} />);

    expect(screen.getByTestId('hierarchy-flow-renderer')).toBeInTheDocument();
  });

  it('should pass correct props to HierarchyFlowRenderer', () => {
    render(<HierarchyPanelContent {...defaultProps} />);

    expect(screen.getByTestId('nodes-count')).toHaveTextContent('1');
    expect(screen.getByTestId('edges-count')).toHaveTextContent('1');
    expect(screen.getByTestId('hierarchy-count')).toHaveTextContent('1');
    expect(screen.getByTestId('hierarchy-loading')).toHaveTextContent('false');
  });

  it('should render footer', () => {
    render(<HierarchyPanelContent {...defaultProps} />);

    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('should handle empty nodes', () => {
    render(
      <HierarchyPanelContent
        {...defaultProps}
        nodes={[]}
      />
    );

    expect(screen.getByTestId('nodes-count')).toHaveTextContent('0');
  });

  it('should handle empty edges', () => {
    render(
      <HierarchyPanelContent
        {...defaultProps}
        edges={[]}
      />
    );

    expect(screen.getByTestId('edges-count')).toHaveTextContent('0');
  });

  it('should handle null hierarchy', () => {
    render(
      <HierarchyPanelContent
        {...defaultProps}
        hierarchy={null}
      />
    );

    expect(screen.getByTestId('hierarchy-count')).toHaveTextContent('0');
  });

  it('should handle loading state', () => {
    render(
      <HierarchyPanelContent
        {...defaultProps}
        hierarchyLoading={true}
      />
    );

    expect(screen.getByTestId('hierarchy-loading')).toHaveTextContent('true');
  });

  it('should pass zoom controls to HierarchyFlowRenderer', () => {
    const mockZoomIn = jest.fn();
    const mockZoomOut = jest.fn();
    const mockZoomReset = jest.fn();

    render(
      <HierarchyPanelContent
        {...defaultProps}
        zoomIn={mockZoomIn}
        zoomOut={mockZoomOut}
        zoomReset={mockZoomReset}
        zoomIndex={3}
        zoomSteps={[25, 50, 75, 100] as readonly number[]}
      />
    );

    expect(screen.getByTestId('hierarchy-flow-renderer')).toBeInTheDocument();
  });

  it('should pass reactFlowRef to HierarchyFlowRenderer', () => {
    const ref = React.createRef();

    render(
      <HierarchyPanelContent
        {...defaultProps}
        reactFlowRef={ref}
      />
    );

    expect(screen.getByTestId('hierarchy-flow-renderer')).toBeInTheDocument();
  });

  it('should pass event handlers to HierarchyFlowRenderer', () => {
    const mockOnNodesChange = jest.fn();
    const mockOnEdgesChange = jest.fn();

    render(
      <HierarchyPanelContent
        {...defaultProps}
        onNodesChange={mockOnNodesChange}
        onEdgesChange={mockOnEdgesChange}
      />
    );

    expect(screen.getByTestId('hierarchy-flow-renderer')).toBeInTheDocument();
  });

  it('should render with Suspense fallback', () => {
    const { container } = render(<HierarchyPanelContent {...defaultProps} />);

    expect(container).toBeInTheDocument();
  });

  it('should handle empty footer', () => {
    render(
      <HierarchyPanelContent
        {...defaultProps}
        footer={null}
      />
    );

    expect(screen.getByTestId('hierarchy-flow-renderer')).toBeInTheDocument();
  });

  it('should handle footer as string', () => {
    render(
      <HierarchyPanelContent
        {...defaultProps}
        footer={<div>Simple Footer</div>}
      />
    );

    expect(screen.getByText('Simple Footer')).toBeInTheDocument();
  });

  it('should set isInitialLoad to false', () => {
    render(<HierarchyPanelContent {...defaultProps} />);

    // The component should pass isInitialLoad={false} to HierarchyFlowRenderer
    expect(screen.getByTestId('hierarchy-flow-renderer')).toBeInTheDocument();
  });
});

