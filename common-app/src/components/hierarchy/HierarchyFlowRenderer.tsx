import React, { Suspense, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import ReactFlow, {
  Background,
  ReactFlowProvider,
  ReactFlowInstance,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CircularLoader from '../common/CircularLoader';
import UserNode from './UserNode';
import {
  REACT_FLOW_CONFIG,
  REACT_FLOW_CONTAINER_STYLES,
  CURSOR_OVERRIDE_STYLES,
  MAIN_CONTENT_STYLES,
  ZOOM_CONTAINER_STYLES,
} from '../../constants/hierarchyConstants';
const ZoomControls = React.lazy(() => import('./ZoomControls'));

const nodeTypes = {
  user: UserNode,
};

export interface HierarchyFlowRendererProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  reactFlowRef: React.RefObject<ReactFlowInstance | null>;
  hierarchy: any[] | null;
  hierarchyLoading: boolean;
  zoomIndex: number;
  zoomSteps: readonly number[];
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  isInitialLoad?: boolean;
  nodeTypes?: Record<string, React.ComponentType<any>>;
  onNodesChangeOverride?: (changes: NodeChange[]) => void;
  onEdgesChangeOverride?: (changes: EdgeChange[]) => void;
}

// Helper function to determine type string for debug logging
const getTypeString = (value: any): string => {
  if (!value) {
    return 'null/undefined';
  }
  return Array.isArray(value) ? `Array(${value.length})` : typeof value;
};

// Helper function to build debug log data
const buildDebugLogData = (nodes: Node[], edges: Edge[], hierarchy: any[] | null, hierarchyLoading: boolean, isInitialLoad: boolean) => {
  return {
    nodesCount: nodes?.length ?? 0,
    edgesCount: edges?.length ?? 0,
    hierarchyCount: hierarchy?.length ?? 0,
    hierarchyLoading,
    isInitialLoad,
    hasNodes: nodes && nodes.length > 0,
    hasEdges: edges && edges.length > 0,
    hierarchy: getTypeString(hierarchy),
    nodes: getTypeString(nodes),
    edges: getTypeString(edges)
  };
};

// Helper function to render full loader
const renderFullLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
    <CircularLoader />
  </Box>
);

// Helper function to render no data message
const renderNoDataMessage = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
    <Typography>No hierarchy data available</Typography>
  </Box>
);

// Helper function to render loading overlay
const renderLoadingOverlay = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: '20px',
      zIndex: 1000,
      pointerEvents: 'none',
    }}
  >
    <Box
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        padding: '8px 16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <CircularLoader variant="content" />
      <Typography variant="body2" sx={{ color: '#666' }}>
        Updating view...
      </Typography>
    </Box>
  </Box>
);

// Interface for render configuration
interface RenderConfig {
  hierarchy: any[] | null;
  hierarchyLoading: boolean;
  isInitialLoad: boolean;
}

// Interface for React Flow configuration
interface ReactFlowConfig {
  nodes: Node[];
  edges: Edge[];
  effectiveNodeTypes: Record<string, React.ComponentType<any>>;
  effectiveOnNodesChange: (changes: NodeChange[]) => void;
  effectiveOnEdgesChange: (changes: EdgeChange[]) => void;
  reactFlowRef: React.RefObject<ReactFlowInstance | null>;
}

// Interface for zoom configuration
interface ZoomConfig {
  zoomIndex: number;
  zoomSteps: readonly number[];
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
}

// Helper function to determine what to render
const determineRenderContent = (
  renderConfig: RenderConfig,
  reactFlowConfig: ReactFlowConfig,
  zoomConfig: ZoomConfig
) => {
  const { hierarchy, hierarchyLoading, isInitialLoad } = renderConfig;
  const { nodes, edges, effectiveNodeTypes, effectiveOnNodesChange, effectiveOnEdgesChange, reactFlowRef } = reactFlowConfig;
  const { zoomIndex, zoomSteps, zoomIn, zoomOut, zoomReset } = zoomConfig;
  
  const hasHierarchy = hierarchy && hierarchy.length > 0;
  const shouldShowFullLoader = isInitialLoad && !hasHierarchy && hierarchyLoading;
  
  if (shouldShowFullLoader) {
    return renderFullLoader();
  }
  
  if (!hasHierarchy && !hierarchyLoading) {
    return renderNoDataMessage();
  }
  
  return (
    <>
      {hierarchyLoading && hasHierarchy && renderLoadingOverlay()}
      <Suspense fallback={<div></div>}>
        <ZoomControls
          zoomIndex={zoomIndex}
          zoomSteps={zoomSteps}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomReset={zoomReset}
        />
      </Suspense>
      <Box sx={REACT_FLOW_CONTAINER_STYLES}>
        <Box sx={ZOOM_CONTAINER_STYLES(zoomSteps, zoomIndex)}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={effectiveOnNodesChange}
              onEdgesChange={effectiveOnEdgesChange}
              nodeTypes={effectiveNodeTypes}
              onInit={(instance) => {
                if (reactFlowRef) {
                  reactFlowRef.current = instance;
                }
              }}
              {...REACT_FLOW_CONFIG}
            >
              <Background color="#f0f0f0" gap={20} />
            </ReactFlow>
          </ReactFlowProvider>
        </Box>
      </Box>
    </>
  );
};

const HierarchyFlowRenderer: React.FC<HierarchyFlowRendererProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  reactFlowRef,
  hierarchy,
  hierarchyLoading,
  zoomIndex,
  zoomSteps,
  zoomIn,
  zoomOut,
  zoomReset,
  isInitialLoad = false,
  nodeTypes: customNodeTypes,
  onNodesChangeOverride,
  onEdgesChangeOverride,
}) => {
  const effectiveNodeTypes = customNodeTypes || nodeTypes;
  const effectiveOnNodesChange = onNodesChangeOverride || onNodesChange;
  const effectiveOnEdgesChange = onEdgesChangeOverride || onEdgesChange;

  // Debug logging
  useEffect(() => {
    const logData = buildDebugLogData(nodes, edges, hierarchy, hierarchyLoading, isInitialLoad);
    console.log('HierarchyFlowRenderer - Render state:', logData);
    
    if (hierarchy && Array.isArray(hierarchy) && hierarchy.length > 0) {
      console.log('HierarchyFlowRenderer - First hierarchy item:', hierarchy[0]);
    }
    
    if (nodes && Array.isArray(nodes) && nodes.length > 0) {
      console.log('HierarchyFlowRenderer - First node:', nodes[0]);
    }
  }, [nodes, edges, hierarchy, hierarchyLoading, isInitialLoad]);

  const renderConfig: RenderConfig = {
    hierarchy,
    hierarchyLoading,
    isInitialLoad
  };

  const reactFlowConfig: ReactFlowConfig = {
    nodes,
    edges,
    effectiveNodeTypes,
    effectiveOnNodesChange,
    effectiveOnEdgesChange,
    reactFlowRef
  };

  const zoomConfig: ZoomConfig = {
    zoomIndex,
    zoomSteps,
    zoomIn,
    zoomOut,
    zoomReset
  };

  return (
    <Box sx={MAIN_CONTENT_STYLES}>
      {/* Global CSS override for React Flow cursor */}
      <style>
        {CURSOR_OVERRIDE_STYLES}
      </style>
      {determineRenderContent(renderConfig, reactFlowConfig, zoomConfig)}
    </Box>
  );
};

export default HierarchyFlowRenderer;

