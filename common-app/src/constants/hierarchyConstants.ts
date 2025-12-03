/**
 * Hierarchy Constants
 * Shared constants for hierarchy/structure visualization components
 * Used across Entity Setup and User Management apps
 */

import { ReactFlowInstance } from 'reactflow';

// Zoom configuration
export const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
export const DEFAULT_ZOOM_INDEX = 3; // 100%

// React Flow configuration
export const REACT_FLOW_CONFIG = {
  fitViewOptions: {
    padding: 0.1,
    includeHiddenNodes: false,
    minZoom: 0.1,
    maxZoom: 2
  },
  minZoom: 0.1,
  maxZoom: 2,
  panOnDrag: false,
  zoomOnScroll: false,
  zoomOnPinch: false,
  zoomOnDoubleClick: false,
  connectOnClick: false,
  nodesDraggable: false,
  nodesConnectable: false,
  elementsSelectable: false,
  defaultEdgeOptions: {
    type: 'step',
    style: {
      stroke: '#666666',
      strokeWidth: 1,
      strokeDasharray: 'none'
    },
    markerEnd: {
      type: 'arrow' as any,
      width: 30,
      height: 30,
      color: '#666666'
    }
  },
  proOptions: { hideAttribution: true },
  style: {
    width: '100%',
    height: '100%',
    cursor: 'default'
  },
  panOnScroll: false,
  selectionOnDrag: false,
  multiSelectionKeyCode: null,
  deleteKeyCode: null,
  className: "no-hand-cursor"
};

// Container styles
export const REACT_FLOW_CONTAINER_STYLES = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '12px',
    height: '12px'
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '6px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#c1c1c1',
    borderRadius: '6px',
    '&:hover': {
      background: '#a8a8a8'
    }
  },
  '&::-webkit-scrollbar-corner': {
    background: '#f1f1f1'
  },
  '& .react-flow__node': {
    cursor: 'default !important'
  },
  '& .react-flow__edge': {
    cursor: 'default !important'
  },
  '& .react-flow__viewport': {
    cursor: 'default !important'
  },
  '& .react-flow__pane': {
    cursor: 'default !important'
  }
};

// Zoom container styles factory
export const ZOOM_CONTAINER_STYLES = (zoomSteps: readonly number[], zoomIndex: number) => ({
  width: '100%',
  height: '100%',
  transform: `scale(${zoomSteps[zoomIndex]})`,
  transformOrigin: '0 0',
  transition: 'transform 150ms ease-out',
  position: 'relative'
});

// Cursor override styles (as CSS string)
export const CURSOR_OVERRIDE_STYLES = `
  .react-flow__node,
  .react-flow__edge,
  .react-flow__viewport,
  .react-flow__pane,
  .react-flow__renderer,
  .react-flow__selection,
  .react-flow__selection-rect,
  .react-flow__nodesselection,
  .react-flow__nodesselection-rect {
    cursor: default !important;
  }
  .no-hand-cursor * {
    cursor: default !important;
  }
`;

// Main content styles
export const MAIN_CONTENT_STYLES = {
  flex: 1,
  position: 'relative',
  backgroundColor: '#fafafa',
  overflow: 'hidden'
};

/**
 * Fit React Flow view to container
 * @param instance - React Flow instance
 */
export const fitViewToContainer = (instance: ReactFlowInstance | null) => {
  if (instance) {
    instance.fitView({
      padding: 0.1,
      includeHiddenNodes: false,
      minZoom: 0.1,
      maxZoom: 2
    });
  }
};

