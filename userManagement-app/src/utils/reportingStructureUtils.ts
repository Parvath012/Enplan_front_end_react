/**
 * Reporting Structure Utilities
 * Utility functions for processing hierarchy data and graph operations
 */

import { Node } from 'reactflow';
import { ViewByType, DEPARTMENT_COLORS, DEFAULT_BORDER_COLOR, DEFAULT_EDGE_COLOR, DOTTED_LINE_EDGE_COLOR, OVERLAPPING_EDGE_COLOR, NODE_WIDTH, NODE_HEIGHT, getDepartmentColorPair } from '../constants/reportingStructureConstants';
import { applyDagreLayout } from 'commonApp/graphLayoutUtils';

export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  department?: string;
  reportingManager?: UserData[];
  dottedProjectManager?: UserData[];
}

export interface ProcessedNode extends Node {
  id: string;
  data: {
    label: string;
    fullName: string;
    designation: string;
    department: string;
    totalDescendantsCount?: number;
    borderColor?: string;
    backgroundColor?: string;
  };
}

export interface ProcessedEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  style?: any;
  markerEnd?: any;
}

/**
 * Get color for a department
 */
export function getDepartmentColor(department?: string): string {
  if (!department) return DEPARTMENT_COLORS.Default;
  return DEPARTMENT_COLORS[department] || DEPARTMENT_COLORS.Default;
}

/**
 * Convert user hierarchy JSON data into React Flow nodes and edges
 */
export function processUserData(
  users: UserData[], 
  viewType: ViewByType = 'organizational'
): { nodes: ProcessedNode[]; edges: ProcessedEdge[] } {
  const nodes: ProcessedNode[] = [];
  const edges: ProcessedEdge[] = [];
  const processedIds = new Set<number>();

  // Build a map of all users for efficient lookup
  const userMap = new Map<number, UserData>();
  users.forEach(user => userMap.set(user.id, user));

  // Helper function to count only immediate children (direct reports only) for a user
  const countTotalDescendants = (userId: number): number => {
    let totalCount = 0;
    
    // Count only direct reports (users who have this user as their reportingManager or dottedProjectManager)
    // This counts only immediate children, not all descendants in the hierarchy
    users.forEach(user => {
      const isReportingManager = user.reportingManager?.some(manager => manager.id === userId);
      const isDottedManager = user.dottedProjectManager?.some(manager => manager.id === userId);
      
      // For dotted-line view, count both reportingManager and dottedProjectManager relationships
      // For other views, count only reportingManager relationships
      if (viewType === 'dotted-line') {
        // In dotted-line view, count both types of relationships
        if (isReportingManager || isDottedManager) {
          totalCount++;
        }
      } else if (isReportingManager) {
        // For organizational and departmental views, count only reportingManager relationships
        totalCount++;
      }
      // Removed recursive call - now only counting immediate children
    });
    
    return totalCount;
  };

  // Helper function to process users recursively
  const processUser = (user: UserData) => {
    if (processedIds.has(user.id)) return;
    processedIds.add(user.id);

    // Use fullName from API, or construct from firstName/lastName
    const fullName = user.fullName ?? `${user.firstName} ${user.lastName}`.trim();
    const designation = user.role ?? 'N/A';
    const department = user.department ?? 'N/A';

    // Determine border color and background color based on view type
    let borderColor: string;
    let backgroundColor: string | undefined;
    
    if (viewType === 'departmental') {
      const colorPair = getDepartmentColorPair(department);
      borderColor = colorPair.border;
      backgroundColor = colorPair.background;
    } else {
      borderColor = DEFAULT_BORDER_COLOR;
    }

    // Create node with total descendants count
    const node: ProcessedNode = {
      id: user.id.toString(),
      type: 'user',
      position: { x: 0, y: 0 }, // Will be set by Dagre
      data: {
        label: fullName,
        fullName: fullName,
        designation: designation,
        department: department,
        totalDescendantsCount: countTotalDescendants(user.id),
        borderColor: borderColor,
        backgroundColor: backgroundColor
      }
    };
    nodes.push(node);

    // Process reporting manager relationships and create edges (solid lines)
    // Note: reportingManager contains the manager's full details (nested structure)
    if (user.reportingManager && user.reportingManager.length > 0) {
      user.reportingManager.forEach(manager => {
        // Determine edge color and style based on view type
        const edgeColor = viewType === 'departmental' 
          ? getDepartmentColorPair(user.department).border 
          : DEFAULT_EDGE_COLOR;
        
        // For dotted-line view, reportingManager should still use solid lines
        // Only dottedProjectManager uses dotted lines
        const isDotted = false; // reportingManager always uses solid lines
        
        // Create edge from manager to current user (manager -> user)
        const edge: ProcessedEdge = {
          id: `reporting-${manager.id}-${user.id}`,
          source: manager.id.toString(),
          target: user.id.toString(),
          type: 'step',
          style: { 
            stroke: edgeColor, 
            strokeWidth: 1,
            strokeDasharray: isDotted ? '5,5' : 'none'
          },
          markerEnd: {
            type: 'arrow',
            width: 30,
            height: 30,
            color: edgeColor
          }
        };
        edges.push(edge);

        // Recursively process manager
        processUser(manager);
      });
    }

    // Process dotted-line manager relationships and create edges (dotted lines)
    // Only for dotted-line view
    if (viewType === 'dotted-line' && user.dottedProjectManager && user.dottedProjectManager.length > 0) {
      user.dottedProjectManager.forEach(manager => {
        // Dotted-line managers always use dotted lines with lighter color
        const edgeColor = DOTTED_LINE_EDGE_COLOR;
        
        // Create edge from dotted-line manager to current user (manager -> user)
        const edge: ProcessedEdge = {
          id: `dotted-${manager.id}-${user.id}`,
          source: manager.id.toString(),
          target: user.id.toString(),
          type: 'step',
          style: { 
            stroke: edgeColor, 
            strokeWidth: 1,
            strokeDasharray: '5,5' // Always dotted for dottedProjectManager
          },
          markerEnd: {
            type: 'arrow',
            width: 30,
            height: 30,
            color: edgeColor
          }
        };
        edges.push(edge);

        // Recursively process dotted-line manager
        processUser(manager);
      });
    }
  };

  // Process all users
  users.forEach(processUser);

  // Detect overlapping edges (same source and target) in dotted-line view
  // When both a solid line (reportingManager) and dotted line (dottedProjectManager) exist
  // between the same nodes, make the overlapping line darker
  if (viewType === 'dotted-line' && edges.length > 0) {
    // Create a map to track edges by source-target pair
    const edgeMap = new Map<string, { reporting?: ProcessedEdge; dotted?: ProcessedEdge }>();
    
    // Group edges by source-target pair
    edges.forEach(edge => {
      const key = `${edge.source}-${edge.target}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, {});
      }
      const edgeGroup = edgeMap.get(key)!;
      
      if (edge.id.startsWith('reporting-')) {
        edgeGroup.reporting = edge;
      } else if (edge.id.startsWith('dotted-')) {
        edgeGroup.dotted = edge;
      }
    });
    
    // For overlapping edges (both reporting and dotted exist), make them darker
    edgeMap.forEach((edgeGroup, key) => {
      if (edgeGroup.reporting && edgeGroup.dotted) {
        // Both edges exist - make both darker
        const darkerColor = OVERLAPPING_EDGE_COLOR;
        
        // Update reporting edge (solid line)
        if (edgeGroup.reporting.style) {
          edgeGroup.reporting.style.stroke = darkerColor;
        }
        if (edgeGroup.reporting.markerEnd) {
          edgeGroup.reporting.markerEnd.color = darkerColor;
        }
        
        // Update dotted edge
        if (edgeGroup.dotted.style) {
          edgeGroup.dotted.style.stroke = darkerColor;
        }
        if (edgeGroup.dotted.markerEnd) {
          edgeGroup.dotted.markerEnd.color = darkerColor;
        }
      }
    });
  }

  return { nodes, edges };
}

/**
 * Apply Dagre layout to position nodes in a left-to-right tree structure
 */
export function getLayoutedUserElements(
  nodes: ProcessedNode[],
  edges: ProcessedEdge[],
  direction: 'TB' | 'LR' = 'LR'
): { nodes: ProcessedNode[]; edges: ProcessedEdge[] } {
  return applyDagreLayout(nodes, edges, { 
    direction,
    nodeWidth: NODE_WIDTH,
    nodeHeight: NODE_HEIGHT
  });
}

// Re-export shared hierarchy utility for backward compatibility
export { fitViewToContainer } from 'commonApp/hierarchyConstants';

