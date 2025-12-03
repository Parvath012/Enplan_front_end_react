import React, { Suspense } from 'react';
import { Box } from '@mui/material';
import { Node, Edge, NodeChange, EdgeChange, ReactFlowInstance } from 'reactflow';
import { HIERARCHY_PANEL_CONTAINER_STYLES } from 'commonApp/hierarchyPanelStyles';
const HierarchyFlowRenderer = React.lazy(() => import('commonApp/HierarchyFlowRenderer'));

interface HierarchyPanelContentProps {
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
  footer: React.ReactNode;
}

/**
 * Shared component for hierarchy panel content to avoid duplication
 * between ReportingStructurePanel and UserHierarchyPanel
 */
const HierarchyPanelContent: React.FC<HierarchyPanelContentProps> = ({
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
  footer
}) => {
  return (
    <Box sx={HIERARCHY_PANEL_CONTAINER_STYLES}>
      {/* Main content area with scrollbars */}
      <Suspense fallback={<div>Loading...</div>}>
        <HierarchyFlowRenderer
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          reactFlowRef={reactFlowRef}
          hierarchy={hierarchy}
          hierarchyLoading={hierarchyLoading}
          zoomIndex={zoomIndex}
          zoomSteps={zoomSteps}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          zoomReset={zoomReset}
          isInitialLoad={false}
        />
      </Suspense>

      {footer}
    </Box>
  );
};

export default HierarchyPanelContent;

