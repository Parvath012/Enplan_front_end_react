import { Node } from 'reactflow';
import { applyDagreLayout } from 'commonApp/graphLayoutUtils';

export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  department?: string;
  reportingManager?: UserData[];
}

export interface ProcessedNode extends Node {
  id: string;
  data: {
    label: string;
    fullName: string;
    designation: string;
    department: string;
    totalDescendantsCount?: number; // Total count of direct and indirect reports
    borderColor?: string; // Border color for departmental view
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

// Department color mapping
const DEPARTMENT_COLORS: { [key: string]: string } = {
  'HR': '#4285F4',
  'IT': '#34A853',
  'Finance': '#EA4335',
  'Operations': '#FBBC04',
  'Marketing': '#9C27B0',
  'Sales': '#FF5722',
  'Legal': '#607D8B',
  'Default': '#4285F4', // Default blue for unknown departments
};

// Get color for a department
export function getDepartmentColor(department?: string): string {
  if (!department) return DEPARTMENT_COLORS.Default;
  return DEPARTMENT_COLORS[department] || DEPARTMENT_COLORS.Default;
}

/**
 * Convert user hierarchy JSON data into React Flow nodes and edges
 */
export function processUserData(
  users: UserData[], 
  viewType: 'organizational' | 'departmental' | 'dotted-line' = 'organizational'
): { nodes: ProcessedNode[]; edges: ProcessedEdge[] } {
  const nodes: ProcessedNode[] = [];
  const edges: ProcessedEdge[] = [];
  const processedIds = new Set<number>();

  // Build a map of all users for efficient lookup
  const userMap = new Map<number, UserData>();
  users.forEach(user => userMap.set(user.id, user));

  // Helper function to count total descendants (direct + indirect reports) for a user
  const countTotalDescendants = (userId: number): number => {
    let totalCount = 0;
    
    // Count direct reports (users who have this user as their reportingManager)
    users.forEach(user => {
      if (user.reportingManager?.some(manager => manager.id === userId)) {
        totalCount++;
        // Recursively count descendants of this direct report
        totalCount += countTotalDescendants(user.id);
      }
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

    // Determine border color based on view type
    const borderColor = viewType === 'departmental' 
      ? getDepartmentColor(department) 
      : '#4285F4'; // Default blue for organizational

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
        totalDescendantsCount: countTotalDescendants(user.id), // Calculate actual reports count
        borderColor: borderColor
      }
    };
    nodes.push(node);

    // Process reporting manager relationships and create edges
    // Note: reportingManager contains the manager's full details (nested structure)
    if (user.reportingManager && user.reportingManager.length > 0) {
      user.reportingManager.forEach(manager => {
        // Determine edge color and style based on view type
        const edgeColor = viewType === 'departmental' 
          ? getDepartmentColor(user.department) 
          : '#666666';
        
        const isDotted = viewType === 'dotted-line';
        
        // Create edge from manager to current user (manager -> user)
        const edge: ProcessedEdge = {
          id: `${manager.id}-${user.id}`,
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
  };

  // Process all users
  users.forEach(processUser);

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
  return applyDagreLayout(nodes, edges, { direction });
}

