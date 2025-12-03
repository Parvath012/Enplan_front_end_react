/**
 * Reporting Structure Hook
 * Main hook that combines all Reporting Structure logic
 */

import { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUserHierarchy } from '../../store/Reducers/userSlice';
import { ViewByType, DEFAULT_VIEW_TYPE } from '../../constants/reportingStructureConstants';
import { useReportingStructureData } from './useReportingStructureData';
import { useReportingStructureZoom } from './useReportingStructureZoom';
import { useReportingStructureGraph } from './useReportingStructureGraph';

export const useReportingStructure = (viewType: ViewByType = DEFAULT_VIEW_TYPE) => {
  const dispatch = useDispatch();
  
  // Get hierarchy data from Redux
  const { hierarchy, hierarchyLoading } = useReportingStructureData();
  
  // Zoom controls
  const { zoomIndex, zoomSteps, zoomIn, zoomOut, zoomReset, reactFlowRef } = useReportingStructureZoom();
  
  // Graph processing
  const { nodes, edges, onNodesChange, onEdgesChange, processedData } = useReportingStructureGraph(hierarchy, hierarchyLoading, viewType, reactFlowRef);

  // Track the last fetched viewType to avoid unnecessary refetches
  const lastFetchedViewTypeRef = useRef<ViewByType | null>(null);
  const hasFetchedRef = useRef<boolean>(false);
  
  // Fetch hierarchy when component mounts or viewType changes
  useEffect(() => {
    const needsDottedLineData = viewType === 'dotted-line';
    const hasData = hierarchy && hierarchy.length > 0;
    const lastViewType = lastFetchedViewTypeRef.current;
    
    // Check if we need to fetch:
    // 1. If no data exists, fetch
    // 2. If switching between dotted-line and other views (they need different data), fetch
    // 3. If hook hasn't fetched yet but data exists, check if viewType matches:
    //    - organizational and departmental use the same data, so if data exists and we're switching between them, skip
    //    - dotted-line needs different data, so always fetch when switching to/from it
    const isOrganizationalOrDepartmental = viewType === 'organizational' || viewType === 'departmental';
    const wasOrganizationalOrDepartmental = lastViewType === 'organizational' || lastViewType === 'departmental';
    
    // If data exists and we're switching between organizational/departmental (same data source), skip fetch
    const canUseExistingData = hasData && 
      ((isOrganizationalOrDepartmental && wasOrganizationalOrDepartmental) || 
       (needsDottedLineData && lastViewType === 'dotted-line'));
    
    const shouldFetch = !hasData ||
      (needsDottedLineData && lastViewType !== 'dotted-line') ||
      (!needsDottedLineData && lastViewType === 'dotted-line') ||
      (!hasFetchedRef.current && !canUseExistingData);
    
    if (shouldFetch) {
      // Update the ref before dispatching to track the transition
      lastFetchedViewTypeRef.current = viewType;
      hasFetchedRef.current = true;
      console.log('useReportingStructure: Fetching hierarchy with viewType:', viewType, 'Previous viewType:', lastViewType);
      // @ts-ignore
      // Dispatch fetch - Redux will preserve existing hierarchy during loading for smooth transition
      dispatch(fetchUserHierarchy({ viewType }));
    } else {
      // Mark as fetched even if we didn't fetch, to prevent unnecessary refetches
      if (!hasFetchedRef.current && hasData) {
        lastFetchedViewTypeRef.current = viewType;
        hasFetchedRef.current = true;
      }
      console.log('useReportingStructure: Skipping fetch - using existing data (organizational <-> departmental)');
    }
    // Only depend on viewType - hierarchy changes will be handled by Redux state updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, viewType]);

  // Calculate total user count
  const totalCount = useMemo(() => {
    if (!hierarchy) return 0;
    return hierarchy.length;
  }, [hierarchy]);

  return {
    // Data
    hierarchy,
    hierarchyLoading,
    totalCount,
    
    // Zoom
    zoomIndex,
    zoomSteps,
    zoomIn,
    zoomOut,
    zoomReset,
    reactFlowRef,
    
    // Graph
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    processedData,
  };
};

