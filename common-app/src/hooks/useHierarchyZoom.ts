/**
 * Hierarchy Zoom Hook
 * Handles zoom controls and React Flow instance for hierarchy/structure visualizations
 * Uses CSS transform for zoom to enable scrolling
 */

import { useState, useRef, RefObject } from 'react';
import { ReactFlowInstance } from 'reactflow';
import { ZOOM_STEPS, DEFAULT_ZOOM_INDEX, fitViewToContainer } from '../constants/hierarchyConstants';

export interface UseHierarchyZoomReturn {
  zoomIndex: number;
  zoomSteps: readonly number[];
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  reactFlowRef: RefObject<ReactFlowInstance | null>;
}

/**
 * Hook for managing zoom state and controls in hierarchy visualizations
 * @param defaultZoomIndex - Optional default zoom index (defaults to DEFAULT_ZOOM_INDEX)
 * @returns Object with zoom state and control functions
 */
export const useHierarchyZoom = (defaultZoomIndex: number = DEFAULT_ZOOM_INDEX): UseHierarchyZoomReturn => {
  const [zoomIndex, setZoomIndex] = useState<number>(defaultZoomIndex);
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  const zoomIn = () => {
    setZoomIndex((i) => Math.min(i + 1, ZOOM_STEPS.length - 1));
  };
  
  const zoomOut = () => {
    setZoomIndex((i) => Math.max(i - 1, 0));
  };
  
  const zoomReset = () => {
    setZoomIndex(defaultZoomIndex);
    // Use setTimeout to ensure the zoom index is updated before fitting view
    setTimeout(() => {
      if (reactFlowRef.current) {
        fitViewToContainer(reactFlowRef.current);
      }
    }, 100);
  };

  return {
    zoomIndex,
    zoomSteps: ZOOM_STEPS,
    zoomIn,
    zoomOut,
    zoomReset,
    reactFlowRef,
  };
};

