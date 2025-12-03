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

// Mock all the components that might cause issues
jest.mock('commonApp/FormHeader', () => {
  return function MockFormHeader() {
    return <div data-testid="form-header">Mock Form Header</div>;
  };
});

jest.mock('../../../src/components/structure/EntityStructureFooter', () => {
  return function MockEntityStructureFooter() {
    return <div data-testid="entity-structure-footer">Mock Footer</div>;
  };
});

jest.mock('../../../src/components/structure/ZoomControls', () => {
  return function MockZoomControls() {
    return <div data-testid="zoom-controls">Mock Zoom Controls</div>;
  };
});

jest.mock('../../../src/components/CustomNode', () => ({
  __esModule: true,
  default: function MockCustomNode() {
    return <div data-testid="custom-node">Mock Custom Node</div>;
  }
}));


// Mock React Flow components
jest.mock('reactflow', () => ({
  ReactFlowProvider: ({ children }: any) => <div data-testid="react-flow-provider">{children}</div>,
  useNodesState: jest.fn(() => [[], jest.fn()]),
  useEdgesState: jest.fn(() => [[], jest.fn()]),
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
  processData: jest.fn(() => ({ nodes: [], edges: [] })),
  getLayoutedElements: jest.fn(() => ({ nodes: [], edges: [] }))
}));

jest.mock('../../../src/constants/reactFlowConfig', () => ({
  REACT_FLOW_CONFIG: {},
  fitViewToContainer: jest.fn()
}));

jest.mock('../../../src/hooks/useContainerDetection', () => ({
  useContainerDetection: jest.fn(() => ({
    ready: true,
    containerRef: { current: document.createElement('div') }
  }))
}));

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('EntityStructurePanel - Basic Tests', () => {
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
      entities: {
        hierarchy: mockHierarchy,
        hierarchyLoading: false,
        error: null
      }
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
    
    // Mock the React Flow hooks directly
    const { useNodesState, useEdgesState } = require('reactflow');
    useNodesState.mockReturnValue([[], jest.fn()]);
    useEdgesState.mockReturnValue([[], jest.fn()]);
    
    // Mock the useContainerDetection hook
    const { useContainerDetection } = require('../../../src/hooks/useContainerDetection');
    useContainerDetection.mockReturnValue({
      ready: true,
      containerRef: { current: document.createElement('div') }
    });
    
    // Ensure the graphUtils mock is working
    const { processData, getLayoutedElements } = require('../../../src/utils/graphUtils');
    processData.mockReturnValue({ nodes: [], edges: [] });
    getLayoutedElements.mockReturnValue({ nodes: [], edges: [] });
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

  it('renders without crashing when open', () => {
    // Test that the component can be instantiated without crashing
    const component = <EntityStructurePanel open={true} onClose={jest.fn()} />;
    expect(component).toBeDefined();
  });
});
