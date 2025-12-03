import React, { useMemo, Suspense } from 'react';
import { Box, Drawer } from '@mui/material';
const FormHeader = React.lazy(() => import('commonApp/FormHeader'));
import EntityStructureFooter from './EntityStructureFooter';
const HierarchyFlowRenderer = React.lazy(() => import('commonApp/HierarchyFlowRenderer'));
import { EntityHierarchyModel } from '../../services/entitySetupService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/configureStore';
import CustomNode from '../CustomNode';
import { processData, getLayoutedElements, EntityData } from '../../utils/graphUtils';
import { useContainerDetection } from 'commonApp/useContainerDetection';
import { useHierarchyZoom } from 'commonApp/useHierarchyZoom';
import { useHierarchyDataProcessing, calculateHierarchyCount } from 'commonApp/useHierarchyDataProcessing';
import {
  DRAWER_STYLES,
  HEADER_STYLES,
  ADMIN_HEADER_STYLES
} from '../../constants/structureStyles';

interface EntityStructurePanelProps {
  open: boolean;
  onClose: () => void;
}

const nodeTypes = {
  custom: CustomNode,
};

const EntityStructurePanel: React.FC<EntityStructurePanelProps> = ({ open, onClose }) => {
  const isInAdminApp = window.location.pathname.includes('/admin/entity-setup');

  // Get hierarchy data from Redux
  const hierarchy = useSelector((state: RootState) => state.entities.hierarchy);
  const hierarchyLoading = useSelector((state: RootState) => state.entities.hierarchyLoading);

  // Use shared zoom hook
  const { zoomIndex, zoomSteps, zoomIn, zoomOut, zoomReset, reactFlowRef } = useHierarchyZoom();

  // Use custom hook for container detection
  const { ready, containerRef } = useContainerDetection('.admin-content');

  const closeAndReset = () => {
    // Reset zoom when closing
    zoomReset();
    onClose();
  };

  // Memoize processor to prevent recreation on every render
  const processor = useMemo(() => ({
    mapData: (entity: EntityHierarchyModel) => ({
      id: entity.id,
      displayName: entity.displayName,
      legalBusinessName: entity.legalBusinessName,
      entityType: entity.entityType,
      parent: entity.parent || []
    } as EntityData),
    processData: (entityData: EntityData[]) => processData(entityData),
    applyLayout: (nodes: any, edges: any) => getLayoutedElements(nodes, edges, 'LR')
  }), []);

  // Use shared hierarchy data processing hook
  const { nodes, edges, onNodesChange, onEdgesChange } = useHierarchyDataProcessing({
    hierarchy,
    hierarchyLoading,
    processor,
    layoutDirection: 'LR',
    reactFlowRef,
    preserveZoomOnViewChange: false,
    fitViewDelay: 100,
    logPrefix: 'EntityStructurePanel'
  });

  // Calculate total entity count using shared utility
  const totalCount = useMemo(() => calculateHierarchyCount(hierarchy), [hierarchy]);

  // Don't render until we have the container reference
  if (isInAdminApp) {
    if (!ready || !containerRef.current) {
      return null;
    }
  }


  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={closeAndReset}
      variant="temporary"
      ModalProps={isInAdminApp ? {
        keepMounted: false,
        disablePortal: true,
        container: containerRef.current
      } : {}}
      sx={{
        ...DRAWER_STYLES,
        '& .MuiDrawer-paper': {
          ...DRAWER_STYLES['& .MuiDrawer-paper'],
          paddingTop: isInAdminApp ? '40px' : '0px',
          paddingLeft: isInAdminApp ? '50px' : '0px',
        }
      }}
    >
      <Box sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{
          ...HEADER_STYLES,
          ...(isInAdminApp && ADMIN_HEADER_STYLES),
        }}>
        <Suspense fallback={<div></div>}>
          <FormHeader
            title="Entity Structure"
            onCancel={closeAndReset}
            showBackButton={false}
            showResetButton={false}
            showCancelButton={true}
            showCancelIconOnly={true}
          />
        </Suspense>
          </Box>

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
            nodeTypes={nodeTypes}
          />
        </Suspense>

        <EntityStructureFooter totalCount={totalCount} />
      </Box>
    </Drawer>
  );
};

export default EntityStructurePanel;
