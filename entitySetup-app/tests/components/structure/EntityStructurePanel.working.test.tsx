import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import EntityStructurePanel from '../../../src/components/structure/EntityStructurePanel';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/admin/entity-setup'
  },
  writable: true
});

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
        {showCancelButton && (
          <button data-testid="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    );
  };
});

// Mock other components
jest.mock('../../../src/components/structure/EntityStructureFooter', () => {
  return function MockEntityStructureFooter({ totalCount }: any) {
    return <div data-testid="entity-structure-footer">Footer: {totalCount}</div>;
  };
});

jest.mock('../../../src/components/structure/ZoomControls', () => {
  return function MockZoomControls({ zoomIndex, zoomSteps, onZoomIn, onZoomOut, onZoomReset }: any) {
    return (
      <div data-testid="zoom-controls">
        <button onClick={onZoomIn}>Zoom In</button>
        <button onClick={onZoomOut}>Zoom Out</button>
        <button onClick={onZoomReset}>Reset</button>
      </div>
    );
  };
});

jest.mock('../../../src/components/CustomNode', () => {
  return function MockCustomNode({ data }: any) {
    return <div data-testid="custom-node">{data.label}</div>;
  };
});

// Mock React Flow components with working hooks
jest.mock('reactflow', () => {
  const mockUseNodesState = jest.fn(() => [[], jest.fn()]);
  const mockUseEdgesState = jest.fn(() => [[], jest.fn()]);
  
  return {
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
  };
});

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
    ready: true,
    containerRef: { current: null }
  }))
}));

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('EntityStructurePanel', () => {
  const mockHierarchy = [
    {
      id: '1',
      displayName: 'Entity 1',
      entityType: 'Company',
      children: []
    }
  ];

  const mockStore = configureStore({
    reducer: {
      entities: (state = { hierarchy: mockHierarchy, loading: false, error: null }) => state
    }
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <Provider store={mockStore}>
        {component}
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useSelector to return different values based on the selector
    mockUseSelector.mockImplementation((selector) => {
      const mockState = {
        entities: {
          hierarchy: mockHierarchy,
          hierarchyLoading: false,
          error: null
        }
      };
      return selector(mockState);
    });
    
    // Mock the useContainerDetection hook
    const { useContainerDetection } = require('../../../src/hooks/useContainerDetection');
    useContainerDetection.mockReturnValue({
      ready: true,
      containerRef: { current: document.createElement('div') }
    });
    
    // Ensure the graphUtils mock is working
    const { processData, getLayoutedElements } = require('../../../src/utils/graphUtils');
    processData.mockReturnValue({ 
      nodes: [{ id: '1', data: { label: 'Entity 1', entityType: 'Company' } }], 
      edges: [] 
    });
    getLayoutedElements.mockReturnValue({ 
      nodes: [{ id: '1', data: { label: 'Entity 1', entityType: 'Company' } }], 
      edges: [] 
    });
  });

  it('renders without crashing when closed', () => {
    renderWithProviders(
      <EntityStructurePanel
        open={false}
        onClose={jest.fn()}
      />
    );
    
    // When closed, the component should not render anything
    expect(screen.queryByTestId('form-header')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    // Just test that the component doesn't crash when rendered
    expect(() => {
      renderWithProviders(
        <EntityStructurePanel
          open={true}
          onClose={jest.fn()}
        />
      );
    }).not.toThrow();
  });
});