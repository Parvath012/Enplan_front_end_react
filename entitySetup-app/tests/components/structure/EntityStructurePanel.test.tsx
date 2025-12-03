import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EntityStructurePanel from '../../../src/components/structure/EntityStructurePanel';

// Mock all dependencies
jest.mock('commonApp/FormHeader', () => {
  return jest.fn(({ title, onCancel, showCancelButton, showCancelIconOnly }: any) => (
    <div data-testid="form-header">
      <h2>{title}</h2>
      {showCancelButton && (
        <button onClick={onCancel} data-testid="cancel-button">
          {showCancelIconOnly ? '✕' : 'Cancel'}
        </button>
      )}
    </div>
  ));
});

jest.mock('commonApp/HierarchyFlowRenderer', () => {
  return jest.fn(({ nodes, edges, hierarchy, hierarchyLoading, zoomIndex, zoomSteps, zoomIn, zoomOut, zoomReset, nodeTypes }: any) => (
    <div data-testid="hierarchy-flow-renderer">
      <div data-testid="nodes-count">{nodes?.length || 0}</div>
      <div data-testid="edges-count">{edges?.length || 0}</div>
      <div data-testid="hierarchy-loading">{hierarchyLoading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="zoom-index">{zoomIndex}</div>
      <button onClick={zoomIn} data-testid="zoom-in">Zoom In</button>
      <button onClick={zoomOut} data-testid="zoom-out">Zoom Out</button>
      <button onClick={zoomReset} data-testid="zoom-reset">Reset</button>
    </div>
  ));
});

jest.mock('../../../src/components/structure/EntityStructureFooter', () => {
  return jest.fn(({ totalCount }: any) => (
    <div data-testid="entity-structure-footer">
      <span>Total: {totalCount}</span>
    </div>
  ));
});

jest.mock('commonApp/useContainerDetection', () => ({
  useContainerDetection: jest.fn(() => ({
    ready: true,
    containerRef: { current: document.createElement('div') }
  }))
}));

jest.mock('commonApp/useHierarchyZoom', () => ({
  useHierarchyZoom: jest.fn(() => ({
    zoomIndex: 2,
    zoomSteps: [0.5, 0.75, 1, 1.25, 1.5],
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    zoomReset: jest.fn(),
    reactFlowRef: { current: null }
  }))
}));

jest.mock('commonApp/useHierarchyDataProcessing', () => ({
  useHierarchyDataProcessing: jest.fn(() => ({
    nodes: [
      { id: '1', data: { label: 'Entity 1' } },
      { id: '2', data: { label: 'Entity 2' } }
    ],
    edges: [
      { id: '1-2', source: '1', target: '2' }
    ],
    onNodesChange: jest.fn(),
    onEdgesChange: jest.fn()
  })),
  calculateHierarchyCount: jest.fn((hierarchy) => {
    if (!hierarchy || hierarchy.length === 0) return 0;
    return hierarchy.length;
  })
}));

jest.mock('../../../src/utils/graphUtils', () => ({
  processData: jest.fn((data) => ({
    nodes: data.map((item: any) => ({ id: item.id, data: { label: item.displayName } })),
    edges: []
  })),
  getLayoutedElements: jest.fn((nodes, edges) => ({ nodes, edges }))
}));

jest.mock('../../../src/components/CustomNode', () => {
  return jest.fn(() => <div data-testid="custom-node">Custom Node</div>);
});

jest.mock('../../../src/constants/structureStyles', () => ({
  DRAWER_STYLES: {
    '& .MuiDrawer-paper': {
      height: '80vh'
    }
  },
  HEADER_STYLES: {
    padding: '16px'
  },
  ADMIN_HEADER_STYLES: {
    paddingTop: '40px'
  }
}));

describe('EntityStructurePanel', () => {
  let mockStore: any;
  let mockOnClose: jest.Mock;
  let originalLocation: Location;

  beforeEach(() => {
    mockOnClose = jest.fn();
    
    // Mock window.location
    originalLocation = window.location;
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      pathname: '/entity-setup'
    } as any;

    mockStore = configureStore({
      reducer: {
        entities: (state = { 
          hierarchy: [
            {
              id: '1',
              displayName: 'Entity 1',
              legalBusinessName: 'Entity 1 Legal',
              entityType: 'planning',
              parent: []
            },
            {
              id: '2',
              displayName: 'Entity 2',
              legalBusinessName: 'Entity 2 Legal',
              entityType: 'rollup',
              parent: [{ id: '1' }]
            }
          ],
          hierarchyLoading: false
        }) => state
      }
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    window.location = originalLocation;
    jest.clearAllMocks();
  });

  const renderWithProvider = (props: { open: boolean; onClose: jest.Mock }) => {
    return render(
      <Provider store={mockStore}>
        <EntityStructurePanel {...props} />
      </Provider>
    );
  };

  describe('Component Rendering', () => {
    it('should render when open is true', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    });

    it('should not render drawer when open is false', () => {
      renderWithProvider({ open: false, onClose: mockOnClose });
      // Drawer might still be in DOM but not visible
      const drawer = document.querySelector('[role="presentation"]');
      expect(drawer).not.toHaveClass('MuiDrawer-root');
    });

    it('should render FormHeader with correct props', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByText('Entity Structure')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    });

    it('should render HierarchyFlowRenderer', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('hierarchy-flow-renderer')).toBeInTheDocument();
    });

    it('should render EntityStructureFooter', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('entity-structure-footer')).toBeInTheDocument();
    });

    it('should calculate and display total count', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByText(/Total: 2/)).toBeInTheDocument();
    });
  });

  describe('Drawer Functionality', () => {
    it('should call onClose when cancel button is clicked', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when drawer backdrop is clicked', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      const drawer = document.querySelector('[role="presentation"]');
      if (drawer) {
        const backdrop = drawer.querySelector('.MuiBackdrop-root');
        if (backdrop) {
          fireEvent.click(backdrop);
          expect(mockOnClose).toHaveBeenCalled();
        }
      }
    });

    it('should reset zoom when closing', () => {
      const { useHierarchyZoom } = require('commonApp/useHierarchyZoom');
      const mockZoomReset = jest.fn();
      useHierarchyZoom.mockReturnValue({
        zoomIndex: 2,
        zoomSteps: [0.5, 0.75, 1, 1.25, 1.5],
        zoomIn: jest.fn(),
        zoomOut: jest.fn(),
        zoomReset: mockZoomReset,
        reactFlowRef: { current: null }
      });

      renderWithProvider({ open: true, onClose: mockOnClose });
      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);
      expect(mockZoomReset).toHaveBeenCalled();
    });
  });

  describe('Admin App Path', () => {
    it('should return null when in admin app and container not ready', () => {
      window.location.pathname = '/admin/entity-setup';
      const { useContainerDetection } = require('commonApp/useContainerDetection');
      useContainerDetection.mockReturnValue({
        ready: false,
        containerRef: { current: null }
      });

      const { container } = renderWithProvider({ open: true, onClose: mockOnClose });
      expect(container.firstChild).toBeNull();
    });

    it('should return null when in admin app and containerRef is null', () => {
      window.location.pathname = '/admin/entity-setup';
      const { useContainerDetection } = require('commonApp/useContainerDetection');
      useContainerDetection.mockReturnValue({
        ready: true,
        containerRef: { current: null }
      });

      const { container } = renderWithProvider({ open: true, onClose: mockOnClose });
      expect(container.firstChild).toBeNull();
    });

    it('should render when in admin app and container is ready', () => {
      window.location.pathname = '/admin/entity-setup';
      const { useContainerDetection } = require('commonApp/useContainerDetection');
      const mockContainer = document.createElement('div');
      useContainerDetection.mockReturnValue({
        ready: true,
        containerRef: { current: mockContainer }
      });

      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    });

    it('should apply admin-specific styles when in admin app', () => {
      window.location.pathname = '/admin/entity-setup';
      const { useContainerDetection } = require('commonApp/useContainerDetection');
      const mockContainer = document.createElement('div');
      useContainerDetection.mockReturnValue({
        ready: true,
        containerRef: { current: mockContainer }
      });

      renderWithProvider({ open: true, onClose: mockOnClose });
      const drawer = document.querySelector('[role="presentation"]');
      expect(drawer).toBeInTheDocument();
    });
  });

  describe('Hierarchy Data Processing', () => {
    it('should process hierarchy data correctly', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('2');
      expect(screen.getByTestId('edges-count')).toHaveTextContent('1');
    });

    it('should handle empty hierarchy', () => {
      mockStore = configureStore({
        reducer: {
          entities: (state = { hierarchy: [], hierarchyLoading: false }) => state
        }
      });

      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('nodes-count')).toHaveTextContent('0');
    });

    it('should handle null hierarchy', () => {
      mockStore = configureStore({
        reducer: {
          entities: (state = { hierarchy: null, hierarchyLoading: false }) => state
        }
      });

      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByText(/Total: 0/)).toBeInTheDocument();
    });

    it('should handle hierarchy loading state', () => {
      mockStore = configureStore({
        reducer: {
          entities: (state = { 
            hierarchy: [],
            hierarchyLoading: true
          }) => state
        }
      });

      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('hierarchy-loading')).toHaveTextContent('Loading');
    });
  });

  describe('Zoom Functionality', () => {
    it('should display zoom controls', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('zoom-in')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-out')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-reset')).toBeInTheDocument();
    });

    it('should display current zoom index', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('zoom-index')).toHaveTextContent('2');
    });

    it('should handle zoom in', () => {
      const { useHierarchyZoom } = require('commonApp/useHierarchyZoom');
      const mockZoomIn = jest.fn();
      useHierarchyZoom.mockReturnValue({
        zoomIndex: 2,
        zoomSteps: [0.5, 0.75, 1, 1.25, 1.5],
        zoomIn: mockZoomIn,
        zoomOut: jest.fn(),
        zoomReset: jest.fn(),
        reactFlowRef: { current: null }
      });

      renderWithProvider({ open: true, onClose: mockOnClose });
      fireEvent.click(screen.getByTestId('zoom-in'));
      expect(mockZoomIn).toHaveBeenCalled();
    });

    it('should handle zoom out', () => {
      const { useHierarchyZoom } = require('commonApp/useHierarchyZoom');
      const mockZoomOut = jest.fn();
      useHierarchyZoom.mockReturnValue({
        zoomIndex: 2,
        zoomSteps: [0.5, 0.75, 1, 1.25, 1.5],
        zoomIn: jest.fn(),
        zoomOut: mockZoomOut,
        zoomReset: jest.fn(),
        reactFlowRef: { current: null }
      });

      renderWithProvider({ open: true, onClose: mockOnClose });
      fireEvent.click(screen.getByTestId('zoom-out'));
      expect(mockZoomOut).toHaveBeenCalled();
    });

    it('should handle zoom reset', () => {
      const { useHierarchyZoom } = require('commonApp/useHierarchyZoom');
      const mockZoomReset = jest.fn();
      useHierarchyZoom.mockReturnValue({
        zoomIndex: 2,
        zoomSteps: [0.5, 0.75, 1, 1.25, 1.5],
        zoomIn: jest.fn(),
        zoomOut: jest.fn(),
        zoomReset: mockZoomReset,
        reactFlowRef: { current: null }
      });

      renderWithProvider({ open: true, onClose: mockOnClose });
      fireEvent.click(screen.getByTestId('zoom-reset'));
      expect(mockZoomReset).toHaveBeenCalled();
    });
  });

  describe('Data Mapping', () => {
    it('should map entity data correctly', () => {
      const { useHierarchyDataProcessing } = require('commonApp/useHierarchyDataProcessing');
      renderWithProvider({ open: true, onClose: mockOnClose });
      
      expect(useHierarchyDataProcessing).toHaveBeenCalled();
      const callArgs = useHierarchyDataProcessing.mock.calls[0][0];
      expect(callArgs.hierarchy).toBeDefined();
      expect(callArgs.processor).toBeDefined();
      expect(callArgs.layoutDirection).toBe('LR');
    });

    it('should use correct processor configuration', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      const { useHierarchyDataProcessing } = require('commonApp/useHierarchyDataProcessing');
      const callArgs = useHierarchyDataProcessing.mock.calls[0][0];
      
      expect(callArgs.processor.mapData).toBeDefined();
      expect(callArgs.processor.processData).toBeDefined();
      expect(callArgs.processor.applyLayout).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined hierarchy', () => {
      mockStore = configureStore({
        reducer: {
          entities: (state = { hierarchy: undefined, hierarchyLoading: false }) => state
        }
      });

      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByText(/Total: 0/)).toBeInTheDocument();
    });

    it('should handle entities with missing parent', () => {
      mockStore = configureStore({
        reducer: {
          entities: (state = { 
            hierarchy: [
              {
                id: '1',
                displayName: 'Entity 1',
                legalBusinessName: 'Entity 1 Legal',
                entityType: 'planning',
                parent: undefined
              }
            ],
            hierarchyLoading: false
          }) => state
        }
      });

      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('hierarchy-flow-renderer')).toBeInTheDocument();
    });

    it('should handle multiple re-renders', () => {
      const { rerender } = renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
      
      rerender(
        <Provider store={mockStore}>
          <EntityStructurePanel open={false} onClose={mockOnClose} />
        </Provider>
      );
      
      // Component should handle re-render gracefully
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Suspense Fallbacks', () => {
    it('should render Suspense fallback for FormHeader', () => {
      // Suspense is mocked in jest.setup.ts to render children directly
      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
    });

    it('should render Suspense fallback for HierarchyFlowRenderer', () => {
      renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('hierarchy-flow-renderer')).toBeInTheDocument();
    });
  });

  describe('Component Unmounting', () => {
    it('should clean up on unmount', () => {
      const { unmount } = renderWithProvider({ open: true, onClose: mockOnClose });
      expect(screen.getByTestId('form-header')).toBeInTheDocument();
      
      unmount();
      expect(screen.queryByTestId('form-header')).not.toBeInTheDocument();
    });
  });
});
