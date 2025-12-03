import React, { memo } from 'react';
import { useReportingStructure } from '../../hooks/reportingStructure';
import { ViewByType, DEFAULT_VIEW_TYPE } from '../../constants/reportingStructureConstants';
import HierarchyPanelContent from '../shared/HierarchyPanelContent';
import ReportingStructureFooter from './ReportingStructureFooter';

interface ReportingStructurePanelProps {
  viewType?: ViewByType;
}

const ReportingStructurePanel: React.FC<ReportingStructurePanelProps> = ({ 
  viewType = DEFAULT_VIEW_TYPE 
}) => {
  const {
    hierarchy,
    hierarchyLoading,
    totalCount,
    zoomIndex,
    zoomSteps,
    zoomIn,
    zoomOut,
    zoomReset,
    reactFlowRef,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
  } = useReportingStructure(viewType);

  return (
    <HierarchyPanelContent
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
      footer={
        <ReportingStructureFooter 
          totalCount={totalCount} 
          viewType={viewType}
          nodes={nodes}
        />
      }
    />
  );
};

// Memoize the component to prevent unnecessary re-renders when parent re-renders
// Only re-render when viewType prop actually changes
export default memo(ReportingStructurePanel, (prevProps, nextProps) => {
  // Only re-render if viewType changes
  return prevProps.viewType === nextProps.viewType;
});

