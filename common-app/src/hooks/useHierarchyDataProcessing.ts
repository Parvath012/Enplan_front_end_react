/**
 * Shared Hierarchy Data Processing Hook
 * Handles common hierarchy data processing patterns
 */

import { useMemo, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, ReactFlowInstance, Node, Edge } from 'reactflow';
import { fitViewToContainer } from '../constants/hierarchyConstants';

// Helper to compare arrays by serializing their IDs
function arraysEqual<T extends { id: string | number }>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  // Use localeCompare for reliable alphabetical sorting
  const compareIds = (id1: string, id2: string) => id1.localeCompare(id2, undefined, { numeric: true, sensitivity: 'base' });
  const aIds = a.map(item => String(item.id)).sort(compareIds).join(',');
  const bIds = b.map(item => String(item.id)).sort(compareIds).join(',');
  return aIds === bIds;
}

// Helper to compare nodes/edges including their data properties (for detecting visual changes)
function nodesOrEdgesChanged<T extends { id: string | number; data?: any; style?: any }>(
  current: T[], 
  previous: T[] | null
): boolean {
  if (!previous || current.length !== previous.length) return true;
  
  // Create maps for efficient lookup
  const currentMap = new Map(current.map(item => [String(item.id), item]));
  const previousMap = new Map(previous.map(item => [String(item.id), item]));
  
  // Check if any node/edge has different visual properties
  for (const [id, currentItem] of currentMap) {
    const previousItem = previousMap.get(id);
    if (!previousItem) return true; // New item
    
    // Compare data properties (for nodes: borderColor, backgroundColor, etc.)
    // Handle cases where data might not exist in one or both items
    const currentData = currentItem.data || {};
    const previousData = previousItem.data || {};
    const currentDataStr = JSON.stringify(currentData);
    const previousDataStr = JSON.stringify(previousData);
    if (currentDataStr !== previousDataStr) return true;
    
    // Compare style properties (for edges: stroke, strokeDasharray, etc.)
    // Handle cases where style might not exist in one or both items
    const currentStyle = currentItem.style || {};
    const previousStyle = previousItem.style || {};
    const currentStyleStr = JSON.stringify(currentStyle);
    const previousStyleStr = JSON.stringify(previousStyle);
    if (currentStyleStr !== previousStyleStr) return true;
  }
  
  return false;
}

export interface HierarchyDataProcessor<TData, TProcessed> {
  mapData: (item: TData) => TProcessed;
  processData: (mappedData: TProcessed[], viewType?: any) => { nodes: Node[]; edges: Edge[] };
  applyLayout?: (nodes: Node[], edges: Edge[], direction?: 'LR' | 'TB') => { nodes: Node[]; edges: Edge[] };
}

export interface UseHierarchyDataProcessingOptions<TData> {
  hierarchy: TData[] | null;
  hierarchyLoading: boolean;
  processor: HierarchyDataProcessor<TData, any>;
  layoutDirection?: 'LR' | 'TB';
  viewType?: any;
  reactFlowRef: React.RefObject<ReactFlowInstance | null>;
  preserveZoomOnViewChange?: boolean;
  fitViewDelay?: number;
  logPrefix?: string;
}

/**
 * Shared hook for processing hierarchy data and managing React Flow state
 * Eliminates duplication across Entity and User hierarchy panels
 */
export function useHierarchyDataProcessing<TData = any>({
  hierarchy,
  hierarchyLoading,
  processor,
  layoutDirection = 'LR',
  viewType,
  reactFlowRef,
  preserveZoomOnViewChange = false,
  fitViewDelay = 100,
  logPrefix = 'useHierarchyDataProcessing',
}: UseHierarchyDataProcessingOptions<TData>) {
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Track if this is the initial load
  const isInitialLoadRef = useRef(true);
  
  // Track previous processed data to avoid unnecessary updates
  const prevProcessedDataRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);

  // Process hierarchy data and create React Flow elements
  const processedData = useMemo(() => {
    if (hierarchyLoading || !hierarchy) {
      return { nodes: [], edges: [] };
    }

    console.log(`${logPrefix}: Processing hierarchy data:`, hierarchy);

    // Map hierarchy data using provided mapper
    const mappedData = hierarchy.map(processor.mapData);

    // Process data using provided processor (pass viewType if needed)
    let { nodes: rawNodes, edges: rawEdges } = processor.processData(mappedData, viewType);

    // Apply layout if provided
    if (processor.applyLayout) {
      const layouted = processor.applyLayout(rawNodes, rawEdges, layoutDirection);
      rawNodes = layouted.nodes;
      rawEdges = layouted.edges;
    }

    console.log(`${logPrefix}: Processed data:`, {
      nodesCount: rawNodes.length,
      edgesCount: rawEdges.length,
      nodes: rawNodes.map(n => ({ id: n.id, label: n.data?.label })),
      edges: rawEdges.map(e => ({ source: e.source, target: e.target }))
    });

    return { nodes: rawNodes, edges: rawEdges };
  }, [hierarchy, hierarchyLoading, processor, layoutDirection, viewType, logPrefix]);

  // Track previous viewType to detect view changes
  const prevViewTypeRef = useRef(viewType);
  
  // Update React Flow state when processed data changes
  useEffect(() => {
    // Check if viewType changed (this forces update even if IDs are the same)
    const viewTypeChanged = prevViewTypeRef.current !== viewType;
    prevViewTypeRef.current = viewType;
    
    // Check if nodes or edges changed (including visual properties)
    const prevData = prevProcessedDataRef.current;
    // Use nodesOrEdgesChanged to detect visual property changes, not just ID changes
    const nodesChanged = !prevData || nodesOrEdgesChanged(processedData.nodes, prevData.nodes);
    const edgesChanged = !prevData || nodesOrEdgesChanged(processedData.edges, prevData.edges);
    
    // Force update if viewType changed or if nodes/edges changed (including visual properties)
    if (viewTypeChanged || nodesChanged || edgesChanged) {
      // Update state only if data actually changed
      if (viewTypeChanged || nodesChanged) {
        setNodes(processedData.nodes);
      }
      if (viewTypeChanged || edgesChanged) {
        setEdges(processedData.edges);
      }
      
      // Store current processed data for next comparison
      prevProcessedDataRef.current = {
        nodes: processedData.nodes,
        edges: processedData.edges
      };

      // Ensure hierarchy is left-aligned by fitting view after a short delay
      if (processedData.nodes.length > 0 && reactFlowRef.current) {
        const timer = setTimeout(() => {
          if (reactFlowRef.current) {
            const isInitialLoad = isInitialLoadRef.current;
            
            if (isInitialLoad) {
              // On initial load, just fit view with default zoom
              fitViewToContainer(reactFlowRef.current);
              isInitialLoadRef.current = false;
            } else if (preserveZoomOnViewChange) {
              // When switching views, preserve the current zoom level
              const currentViewport = reactFlowRef.current.getViewport();
              const currentZoom = currentViewport.zoom;
              
              // Only preserve zoom if it's not the default (1.0)
              const shouldPreserveZoom = currentZoom !== 1.0;
              
              if (shouldPreserveZoom) {
                // Fit view to container (this will reset zoom)
                fitViewToContainer(reactFlowRef.current);
                
                // Restore zoom level after fitView completes
                setTimeout(() => {
                  if (reactFlowRef.current) {
                    const newViewport = reactFlowRef.current.getViewport();
                    reactFlowRef.current.setViewport({
                      x: newViewport.x,
                      y: newViewport.y,
                      zoom: currentZoom
                    });
                  }
                }, 100);
              } else {
                // For default zoom, just fit view normally
                fitViewToContainer(reactFlowRef.current);
              }
            } else {
              // Default behavior: fit view normally
              fitViewToContainer(reactFlowRef.current);
            }
          }
        }, preserveZoomOnViewChange ? 200 : fitViewDelay);

        return () => clearTimeout(timer);
      }
    }
    // Depend on the actual arrays, not the object
    // Include viewType to detect view changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedData.nodes, processedData.edges, viewType, reactFlowRef, preserveZoomOnViewChange, fitViewDelay]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    processedData,
  };
}

/**
 * Utility function to calculate total count from hierarchy
 */
export function calculateHierarchyCount<T>(hierarchy: T[] | null): number {
  if (!hierarchy) return 0;
  return hierarchy.length;
}

