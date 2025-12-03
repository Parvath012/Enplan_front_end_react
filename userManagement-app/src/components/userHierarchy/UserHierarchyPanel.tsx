import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/configureStore';
import { fetchUserHierarchy } from '../../store/Reducers/userSlice';
import { processUserData, getLayoutedUserElements, UserData } from '../../utils/userHierarchyGraphUtils';
import { useHierarchyZoom } from 'commonApp/useHierarchyZoom';
import { useHierarchyDataProcessing, calculateHierarchyCount } from 'commonApp/useHierarchyDataProcessing';
import HierarchyPanelContent from '../shared/HierarchyPanelContent';
import UserHierarchyFooter from './UserHierarchyFooter';

interface UserHierarchyPanelProps {
  viewType?: 'organizational' | 'departmental' | 'dotted-line';
}

const UserHierarchyPanel: React.FC<UserHierarchyPanelProps> = ({ viewType = 'organizational' }) => {
  const dispatch = useDispatch();

  // Get hierarchy data from Redux
  const hierarchy = useSelector((state: RootState) => state.users.hierarchy);
  const hierarchyLoading = useSelector((state: RootState) => state.users.hierarchyLoading);

  // Use shared zoom hook
  const { zoomIndex, zoomSteps, zoomIn, zoomOut, zoomReset, reactFlowRef } = useHierarchyZoom();

  // Fetch hierarchy when component mounts or viewType changes
  React.useEffect(() => {
    // @ts-ignore
    dispatch(fetchUserHierarchy({ viewType }));
  }, [dispatch, viewType]);

  // Memoize processor to prevent recreation on every render
  const processor = useMemo(() => ({
    mapData: (user: any) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      reportingManager: user.reportingManager || []
    } as UserData),
    processData: (userData: UserData[]) => processUserData(userData, viewType),
    applyLayout: (nodes: any, edges: any) => getLayoutedUserElements(nodes, edges, 'LR')
  }), [viewType]);

  // Use shared hierarchy data processing hook
  const { nodes, edges, onNodesChange, onEdgesChange } = useHierarchyDataProcessing({
    hierarchy,
    hierarchyLoading,
    processor,
    layoutDirection: 'LR',
    viewType,
    reactFlowRef,
    preserveZoomOnViewChange: false,
    fitViewDelay: 100,
    logPrefix: 'UserHierarchyPanel'
  });

  // Calculate total user count using shared utility
  const totalCount = useMemo(() => calculateHierarchyCount(hierarchy), [hierarchy]);

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
      footer={<UserHierarchyFooter totalCount={totalCount} />}
    />
  );
};

export default UserHierarchyPanel;

