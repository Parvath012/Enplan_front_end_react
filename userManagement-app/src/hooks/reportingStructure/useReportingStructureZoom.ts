/**
 * Reporting Structure Zoom Hook
 * Handles zoom controls and React Flow instance
 * Uses CSS transform for zoom (similar to entity setup hierarchy) to enable scrolling
 * 
 * Note: This hook wraps the shared useHierarchyZoom hook for Reporting Structure specific needs
 */

import { DEFAULT_ZOOM_INDEX } from 'commonApp/hierarchyConstants';
import { useHierarchyZoom } from 'commonApp/useHierarchyZoom';

export const useReportingStructureZoom = () => {
  // Use the shared hierarchy zoom hook
  const { zoomIndex, zoomSteps, zoomIn, zoomOut, zoomReset, reactFlowRef } = useHierarchyZoom(DEFAULT_ZOOM_INDEX);

  return {
    zoomIndex,
    zoomSteps,
    zoomIn,
    zoomOut,
    zoomReset,
    reactFlowRef,
  };
};

