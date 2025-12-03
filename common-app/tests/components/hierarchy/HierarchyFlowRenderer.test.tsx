import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import HierarchyFlowRenderer from '../../../src/components/hierarchy/HierarchyFlowRenderer';

// Mock dependencies
jest.mock('../../../src/components/hierarchy/UserNode', () => {
  return function MockUserNode({ data }: any) {
    return <div data-testid="user-node">{data.fullName}</div>;
  };
});

jest.mock('../../../src/components/hierarchy/ZoomControls', () => {
  return function MockZoomControls({ zoomIndex, zoomSteps, onZoomIn, onZoomOut, onZoomReset }: any) {
    return (
      <div data-testid="zoom-controls">
        <button onClick={onZoomIn}>Zoom In</button>
        <button onClick={onZoomOut}>Zoom Out</button>
        <button onClick={onZoomReset}>Reset</button>
        <span data-testid="zoom-index">{zoomIndex}</span>
        <span data-testid="zoom-steps">{zoomSteps.join(',')}</span>
      </div>
    );
  };
});

jest.mock('../../../src/components/common/CircularLoader', () => {
  return function MockCircularLoader({ variant }: any) {
    return <div data-testid="circular-loader" data-variant={variant}>Loading...</div>;
  };
});

jest.mock('reactflow', () => {
  const actual = jest.requireActual('reactflow');
  return {
    ...actual,
    ReactFlowProvider: ({ children }: any) => <div data-testid="react-flow-provider">{children}</div>,
    ReactFlow: ({ children, nodes, edges, onInit }: any) => {
      React.useEffect(() => {
        if (onInit) {
          onInit({ fitView: jest.fn(), zoomIn: jest.fn(), zoomOut: jest.fn() });
        }
      }, []);
      return (
        <div data-testid="react-flow">
          {children}
          <div data-testid="nodes-count">{nodes?.length || 0}</div>
          <div data-testid="edges-count">{edges?.length || 0}</div>
        </div>
      );
    },
    Background: () => <div data-testid="background" />
  };
});

describe('HierarchyFlowRenderer', () => {
  const defaultProps = {
    nodes: [
      { id: '1', data: { fullName: 'John Doe' }, position: { x: 0, y: 0 } },
      { id: '2', data: { fullName: 'Jane Smith' }, position: { x: 100, y: 100 } }
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
    isInitialLoad: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render with nodes and edges', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer {...defaultProps} />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('2');
      expect(screen.getByTestId('edges-count')).toHaveTextContent('1');
    });

    it('should render zoom controls', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer {...defaultProps} />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('zoom-controls')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-index')).toHaveTextContent('2');
    });

    it('should render background', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer {...defaultProps} />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('background')).toBeInTheDocument();
    });

    it('should render full loader on initial load with no hierarchy', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            hierarchy={null}
            hierarchyLoading={true}
            isInitialLoad={true}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('circular-loader')).toBeInTheDocument();
    });

    it('should render no data message when no hierarchy and not loading', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            hierarchy={null}
            hierarchyLoading={false}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByText('No hierarchy data available')).toBeInTheDocument();
    });

    it('should render loading overlay when loading with existing hierarchy', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            hierarchy={[{ id: 1 }]}
            hierarchyLoading={true}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByText('Updating view...')).toBeInTheDocument();
      expect(screen.getByTestId('circular-loader')).toHaveAttribute('data-variant', 'content');
    });
  });

  describe('Node Types', () => {
    it('should use default node types', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer {...defaultProps} />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('should use custom node types when provided', () => {
      const CustomNode = ({ data }: any) => <div data-testid="custom-node">{data.label}</div>;
      const customNodeTypes = { user: CustomNode };

      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            nodeTypes={customNodeTypes}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('should call onNodesChange when provided', () => {
      const mockOnNodesChange = jest.fn();
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            onNodesChange={mockOnNodesChange}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('should use onNodesChangeOverride when provided', () => {
      const mockOverride = jest.fn();
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            onNodesChangeOverride={mockOverride}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('should use onEdgesChangeOverride when provided', () => {
      const mockOverride = jest.fn();
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            onEdgesChangeOverride={mockOverride}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  describe('React Flow Ref', () => {
    it('should set reactFlowRef on init', async () => {
      const ref = React.createRef();
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            reactFlowRef={ref}
          />
        </ReactFlowProvider>
      );

      await waitFor(() => {
        expect(ref.current).toBeDefined();
      });
    });

    it('should handle null reactFlowRef', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            reactFlowRef={null as any}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  describe('Debug Logging', () => {
    it('should log render state', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer {...defaultProps} />
        </ReactFlowProvider>
      );

      expect(console.log).toHaveBeenCalledWith(
        'HierarchyFlowRenderer - Render state:',
        expect.objectContaining({
          nodesCount: 2,
          edgesCount: 1,
          hierarchyCount: 1,
          hierarchyLoading: false,
          isInitialLoad: false
        })
      );
    });

    it('should log first hierarchy item when available', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer {...defaultProps} />
        </ReactFlowProvider>
      );

      expect(console.log).toHaveBeenCalledWith(
        'HierarchyFlowRenderer - First hierarchy item:',
        { id: 1, fullName: 'John Doe' }
      );
    });

    it('should log first node when available', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer {...defaultProps} />
        </ReactFlowProvider>
      );

      expect(console.log).toHaveBeenCalledWith(
        'HierarchyFlowRenderer - First node:',
        expect.objectContaining({ id: '1' })
      );
    });

    it('should handle empty hierarchy in logging', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            hierarchy={[]}
          />
        </ReactFlowProvider>
      );

      expect(console.log).toHaveBeenCalled();
    });

    it('should handle null hierarchy in logging', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            hierarchy={null}
          />
        </ReactFlowProvider>
      );

      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty nodes array', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            nodes={[]}
            edges={[]}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('nodes-count')).toHaveTextContent('0');
    });

    it('should handle empty edges array', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            edges={[]}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('edges-count')).toHaveTextContent('0');
    });

    it('should handle empty hierarchy array', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            hierarchy={[]}
            hierarchyLoading={false}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByText('No hierarchy data available')).toBeInTheDocument();
    });

    it('should handle isInitialLoad true with hierarchy', () => {
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            isInitialLoad={true}
            hierarchy={[{ id: 1 }]}
            hierarchyLoading={false}
          />
        </ReactFlowProvider>
      );

      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  describe('Zoom Controls', () => {
    it('should call zoomIn when zoom in button is clicked', () => {
      const mockZoomIn = jest.fn();
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            zoomIn={mockZoomIn}
          />
        </ReactFlowProvider>
      );

      const zoomInButton = screen.getByText('Zoom In');
      fireEvent.click(zoomInButton);
      expect(mockZoomIn).toHaveBeenCalled();
    });

    it('should call zoomOut when zoom out button is clicked', () => {
      const mockZoomOut = jest.fn();
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            zoomOut={mockZoomOut}
          />
        </ReactFlowProvider>
      );

      const zoomOutButton = screen.getByText('Zoom Out');
      fireEvent.click(zoomOutButton);
      expect(mockZoomOut).toHaveBeenCalled();
    });

    it('should call zoomReset when reset button is clicked', () => {
      const mockZoomReset = jest.fn();
      render(
        <ReactFlowProvider>
          <HierarchyFlowRenderer
            {...defaultProps}
            zoomReset={mockZoomReset}
          />
        </ReactFlowProvider>
      );

      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      expect(mockZoomReset).toHaveBeenCalled();
    });
  });
});

