import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ReactFlowProvider } from 'reactflow';
import EntityStructurePanel from '../../../src/components/structure/EntityStructurePanel';
import { useSelector } from 'react-redux';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock react-redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

// Mock commonApp components
jest.mock('commonApp/FormHeader', () => {
  return function MockFormHeader({ title, onCancel, showBackButton, showResetButton, showCancelButton, showCancelIconOnly }: any) {
    return (
      <div data-testid="form-header">
        <h1>{title}</h1>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );
  };
});

// Mock React Flow components
const mockUseNodesState = jest.fn(() => [[], jest.fn()]);
const mockUseEdgesState = jest.fn(() => [[], jest.fn()]);

jest.mock('reactflow', () => ({
  ReactFlowProvider: ({ children }: any) => <div data-testid="react-flow-provider">{children}</div>,
  useNodesState: mockUseNodesState,
  useEdgesState: mockUseEdgesState,
  Background: () => <div data-testid="react-flow-background" />,
  ReactFlow: ({ children, ...props }: any) => (
    <div data-testid="react-flow" {...props}>
      {children}
    </div>
  ),
  Handle: ({ ...props }: any) => <div data-testid="react-flow-handle" {...props} />,
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right'
  }
}));

// Mock utility functions
jest.mock('../../../src/utils/graphUtils', () => ({
  processData: jest.fn((data) => {
    if (!data || data.length === 0) {
      return { nodes: [], edges: [] };
    }
    return {
      nodes: data.map((item: any) => ({
        id: item.id,
        data: { label: item.displayName, entityType: item.entityType }
      })),
      edges: []
    };
  }),
  getLayoutedElements: jest.fn((nodes, edges) => ({ nodes, edges }))
}));

jest.mock('../../../src/constants/reactFlowConfig', () => ({
  REACT_FLOW_CONFIG: {},
  fitViewToContainer: jest.fn()
}));

jest.mock('../../../src/hooks/useContainerDetection', () => ({
  useContainerDetection: jest.fn(() => ({
    isContainerDetected: false,
    containerRef: { current: null }
  }))
}));

// Mock child components
jest.mock('../../../src/components/structure/EntityStructureFooter', () => {
  return function MockEntityStructureFooter({ totalCount }: any) {
    return (
      <div data-testid="entity-structure-footer">
        Total Count: {totalCount}
      </div>
    );
  };
});

jest.mock('../../../src/components/structure/ZoomControls', () => {
  return function MockZoomControls({ zoomIndex, zoomSteps, onZoomIn, onZoomOut, onZoomReset }: any) {
    return (
      <div data-testid="zoom-controls">
        <button data-testid="zoom-in" onClick={onZoomIn}>Zoom In</button>
        <button data-testid="zoom-out" onClick={onZoomOut}>Zoom Out</button>
        <button data-testid="zoom-reset" onClick={onZoomReset}>Reset</button>
        <span data-testid="zoom-level">{zoomSteps[zoomIndex]}</span>
      </div>
    );
  };
});

jest.mock('../../../src/components/CustomNode', () => {
  return function MockCustomNode({ data }: any) {
    return (
      <div data-testid="custom-node">
        {data.label}
      </div>
    );
  };
});

// Mock hooks
jest.mock('../../../src/hooks/useContainerDetection', () => ({
  useContainerDetection: jest.fn()
}));

// Mock utils
jest.mock('../../../src/utils/graphUtils', () => ({
  processData: jest.fn((data) => {
    if (!data || data.length === 0) {
      return { nodes: [], edges: [] };
    }
    return {
      nodes: data.map((item: any) => ({
        id: item.id,
        data: { label: item.displayName, entityType: item.entityType }
      })),
      edges: []
    };
  }),
  getLayoutedElements: jest.fn((nodes, edges) => ({ nodes, edges }))
}));

// Mock constants
jest.mock('../../../src/constants/reactFlowConfig', () => ({
  REACT_FLOW_CONFIG: { fitView: true },
  fitViewToContainer: jest.fn()
}));

// Mock the useSelector hook
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('EntityStructurePanel', () => {
  const mockOnClose = jest.fn();
  const mockHierarchy = [
    {
      id: '1',
      displayName: 'Entity 1',
      legalBusinessName: 'Legal Entity 1',
      entityType: 'company',
      parent: []
    },
    {
      id: '2',
      displayName: 'Entity 2',
      legalBusinessName: 'Legal Entity 2',
      entityType: 'individual',
      parent: ['1']
    }
  ];

  const mockStore = configureStore({
    reducer: {
      entities: {
        hierarchy: mockHierarchy,
        hierarchyLoading: false
      }
    }
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        <ReactFlowProvider>
          {component}
        </ReactFlowProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useSelector to return hierarchy data
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entities: {
          hierarchy: mockHierarchy,
          hierarchyLoading: false
        }
      };
      return selector(state);
    });

    // Reset React Flow hooks
    mockUseNodesState.mockReturnValue([[], jest.fn()]);
    mockUseEdgesState.mockReturnValue([[], jest.fn()]);

    // Mock useContainerDetection hook
    const { useContainerDetection } = require('../../../src/hooks/useContainerDetection');
    useContainerDetection.mockReturnValue({
      ready: true,
      containerRef: { current: document.createElement('div') }
    });

    // Reset graphUtils mocks
    const { processData, getLayoutedElements } = require('../../../src/utils/graphUtils');
    processData.mockImplementation((data) => {
      if (!data || data.length === 0) {
        return { nodes: [], edges: [] };
      }
      return {
        nodes: data.map((item: any) => ({
          id: item.id,
          data: { label: item.displayName, entityType: item.entityType }
        })),
        edges: []
      };
    });
    getLayoutedElements.mockImplementation((nodes, edges) => ({ nodes, edges }));

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/admin/entity-setup'
      },
      writable: true
    });
  });

  it('renders without crashing when closed', () => {
    renderWithProviders(
      <EntityStructurePanel open={false} onClose={mockOnClose} />
    );
    
    expect(screen.queryByTestId('form-header')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    expect(screen.getByTestId('form-header')).toBeInTheDocument();
    expect(screen.getByText('Entity Structure')).toBeInTheDocument();
  });

  it('displays loading state when hierarchy is loading', () => {
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entities: {
          hierarchy: null,
          hierarchyLoading: true
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    expect(screen.getByText('Loading entity hierarchy...')).toBeInTheDocument();
  });

  it('displays no data message when hierarchy is empty', () => {
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entities: {
          hierarchy: [],
          hierarchyLoading: false
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    expect(screen.getByText('No hierarchy data available')).toBeInTheDocument();
  });

  it('displays hierarchy data when available', () => {
    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    expect(screen.getByTestId('zoom-controls')).toBeInTheDocument();
    expect(screen.getByTestId('entity-structure-footer')).toBeInTheDocument();
    expect(screen.getByText('Total Count: 2')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles zoom controls', () => {
    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    const zoomInButton = screen.getByTestId('zoom-in');
    const zoomOutButton = screen.getByTestId('zoom-out');
    const zoomResetButton = screen.getByTestId('zoom-reset');
    
    fireEvent.click(zoomInButton);
    fireEvent.click(zoomOutButton);
    fireEvent.click(zoomResetButton);
    
    // The zoom controls should be rendered
    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
    expect(zoomResetButton).toBeInTheDocument();
  });

  it('handles different admin app paths', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/admin/entity-setup'
      },
      writable: true
    });

    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    expect(screen.getByTestId('form-header')).toBeInTheDocument();
  });

  it('handles non-admin app paths', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/entity-setup'
      },
      writable: true
    });

    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    expect(screen.getByTestId('form-header')).toBeInTheDocument();
  });

  it('handles container detection hook', () => {
    const { useContainerDetection } = require('../../../src/hooks/useContainerDetection');
    useContainerDetection.mockReturnValue({
      ready: false,
      containerRef: { current: null }
    });

    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    // Should not render when container is not ready
    expect(screen.queryByTestId('form-header')).not.toBeInTheDocument();
  });

  it('handles hierarchy data processing', () => {
    const { processData, getLayoutedElements } = require('../../../src/utils/graphUtils');
    
    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    expect(processData).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          displayName: 'Entity 1',
          entityType: 'company'
        }),
        expect.objectContaining({
          id: '2',
          displayName: 'Entity 2',
          entityType: 'individual'
        })
      ])
    );
    
    expect(getLayoutedElements).toHaveBeenCalled();
  });

  it('handles React Flow initialization', () => {
    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    // React Flow should be rendered
    expect(screen.getByTestId('zoom-controls')).toBeInTheDocument();
  });

  it('handles component unmounting', () => {
    const { unmount } = renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    expect(() => unmount()).not.toThrow();
  });

  it('handles null hierarchy data', () => {
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entities: {
          hierarchy: null,
          hierarchyLoading: false
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    expect(screen.getByText('No hierarchy data available')).toBeInTheDocument();
  });

  it('handles undefined hierarchy data', () => {
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        entities: {
          hierarchy: undefined,
          hierarchyLoading: false
        }
      };
      return selector(state);
    });

    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    expect(screen.getByText('No hierarchy data available')).toBeInTheDocument();
  });

  it('handles rapid open/close cycles', () => {
    const { rerender } = renderWithProviders(
      <EntityStructurePanel open={false} onClose={mockOnClose} />
    );
    
    expect(screen.queryByTestId('form-header')).not.toBeInTheDocument();
    
    rerender(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    expect(screen.getByTestId('form-header')).toBeInTheDocument();
    
    rerender(
      <EntityStructurePanel open={false} onClose={mockOnClose} />
    );
    
    expect(screen.queryByTestId('form-header')).not.toBeInTheDocument();
  });

  it('handles different zoom levels', () => {
    renderWithProviders(
      <EntityStructurePanel open={true} onClose={mockOnClose} />
    );
    
    const zoomLevel = screen.getByTestId('zoom-level');
    expect(zoomLevel).toBeInTheDocument();
  });
});
