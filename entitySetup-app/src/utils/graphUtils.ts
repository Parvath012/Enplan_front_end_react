import { Node } from 'reactflow';
import { applyDagreLayout } from 'commonApp/graphLayoutUtils';

export interface EntityData {
  id: number;
  displayName?: string;
  legalBusinessName?: string;
  entityType?: string;
  parent?: EntityData[];
}

export interface ProcessedNode extends Node {
  id: string;
  data: {
    label: string;
    entityType: string;
    displayName: string;
    totalDescendantsCount: number; // Changed to reflect total descendants count
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
 * Convert your JSON hierarchy data into React Flow nodes and edges
 */
export function processData(entities: EntityData[]): { nodes: ProcessedNode[]; edges: ProcessedEdge[] } {
  const nodes: ProcessedNode[] = [];
  const edges: ProcessedEdge[] = [];
  const processedIds = new Set<number>();

  // First pass: create all nodes and build a map for children counting
  const entityMap = new Map<number, EntityData>();
  entities.forEach(entity => entityMap.set(entity.id, entity));

  // Helper function to count total descendants (direct + indirect) for an entity
  const countTotalDescendants = (entityId: number): number => {
    let totalCount = 0;
    
    // Count direct children
    entities.forEach(entity => {
      if (entity.parent?.some(parent => parent.id === entityId)) {
        totalCount++;
        // Recursively count descendants of this child
        totalCount += countTotalDescendants(entity.id);
      }
    });
    
    return totalCount;
  };

  // Helper function to process entities recursively
  const processEntity = (entity: EntityData) => {
    if (processedIds.has(entity.id)) return;
    processedIds.add(entity.id);

    // Create node
    const node: ProcessedNode = {
      id: entity.id.toString(),
      type: 'custom',
      position: { x: 0, y: 0 }, // Will be set by Dagre
      data: {
        label: entity.displayName ?? entity.legalBusinessName ?? `Entity ${entity.id}`,
        entityType: entity.entityType ?? 'Unknown',
        displayName: entity.displayName ?? entity.legalBusinessName ?? `Entity ${entity.id}`,
        totalDescendantsCount: countTotalDescendants(entity.id) // Calculate actual children count
      }
    };
    nodes.push(node);

    // Process parent relationships and create edges
    if (entity.parent && entity.parent.length > 0) {
      entity.parent.forEach(parentEntity => {
        // Create edge from parent to current entity
        const edge: ProcessedEdge = {
          id: `${parentEntity.id}-${entity.id}`,
          source: parentEntity.id.toString(),
          target: entity.id.toString(),
          type: 'step', // Changed to step for orthogonal routing with 90-degree angles
          style: { 
            stroke: '#666666', 
            strokeWidth: 1, // Increased to 4px for better visibility
            strokeDasharray: 'none'
          },
          markerEnd: {
            type: 'arrow', // Standard triangular arrowhead
            width: 30, // Increased to 18px for better visibility
            height: 30,
            color: '#666666' // Same gray color as the line
          }
        };
        edges.push(edge);

        // Recursively process parent entity
        processEntity(parentEntity);
      });
    }
  };

  // Process all entities
  entities.forEach(processEntity);

  return { nodes, edges };
}

/**
 * Apply Dagre layout to position nodes in a left-to-right tree structure
 */
export function getLayoutedElements(
  nodes: ProcessedNode[],
  edges: ProcessedEdge[],
  direction: 'TB' | 'LR' = 'LR'
): { nodes: ProcessedNode[]; edges: ProcessedEdge[] } {
  return applyDagreLayout(nodes, edges, { direction });
}

/**
 * Get the color scheme for different entity types
 */
export function getEntityColors(entityType: string): { border: string; title: string } {
  if (entityType?.toLowerCase().includes('rollup')) {
    return { border: '#4285F4', title: '#4285F4' };
  } else if (entityType?.toLowerCase().includes('planning')) {
    return { border: '#8E44AD', title: '#8E44AD' };
  }
  return { border: '#666666', title: '#666666' };
}
