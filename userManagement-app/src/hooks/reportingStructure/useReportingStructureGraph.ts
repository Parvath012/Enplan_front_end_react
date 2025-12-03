/**
 * Reporting Structure Graph Hook
 * Handles graph processing and React Flow state
 * Uses shared useHierarchyDataProcessing hook with zoom preservation
 */

import { useMemo } from 'react';
import { ReactFlowInstance } from 'reactflow';
import { UserHierarchyModel } from '../../services/reportingStructureService';
import { ViewByType } from '../../constants/reportingStructureConstants';
import { processUserData, getLayoutedUserElements, UserData } from '../../utils/reportingStructureUtils';
import { useHierarchyDataProcessing } from 'commonApp/useHierarchyDataProcessing';

export const useReportingStructureGraph = (
  hierarchy: UserHierarchyModel[] | null,
  hierarchyLoading: boolean,
  viewType: ViewByType,
  reactFlowRef: React.RefObject<ReactFlowInstance | null>
) => {
  // Memoize processor to prevent recreation on every render
  const processor = useMemo(() => ({
    mapData: (user: any) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      reportingManager: user.reportingManager || [],
      dottedProjectManager: user.dottedProjectManager || []
    } as UserData),
    processData: (userData: UserData[]) => processUserData(userData, viewType),
    applyLayout: (nodes: any, edges: any) => getLayoutedUserElements(nodes, edges, 'LR')
  }), [viewType]);

  // Use shared hierarchy data processing hook with zoom preservation
  const { nodes, edges, onNodesChange, onEdgesChange, processedData } = useHierarchyDataProcessing({
    hierarchy,
    hierarchyLoading,
    processor,
    layoutDirection: 'LR',
    viewType,
    reactFlowRef,
    preserveZoomOnViewChange: true, // Preserve zoom when switching views
    fitViewDelay: 200,
    logPrefix: 'useReportingStructureGraph'
  });

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    processedData,
  };
};

