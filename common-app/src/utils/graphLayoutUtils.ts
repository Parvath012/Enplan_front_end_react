/**
 * Graph Layout Utilities
 * Shared utility functions for applying Dagre layout to React Flow graphs
 * Used across Entity Setup and User Management apps
 */

import dagre from 'dagre';
import { Node, Edge } from 'reactflow';

export interface LayoutConfig {
  direction?: 'TB' | 'LR';
  nodeWidth?: number;
  nodeHeight?: number;
  nodeSep?: number;
  rankSep?: number;
  edgeSep?: number;
}

const DEFAULT_CONFIG: Required<LayoutConfig> = {
  direction: 'LR',
  nodeWidth: 246,
  nodeHeight: 80,
  nodeSep: 20,
  rankSep: 70,
  edgeSep: 10,
};

/**
 * Apply Dagre layout to position nodes in a tree structure
 * Separates nodes into hierarchical (connected) and orphaned nodes
 * 
 * @param nodes - React Flow nodes
 * @param edges - React Flow edges
 * @param config - Layout configuration options
 * @returns Layouted nodes and edges
 */
export function applyDagreLayout<TNode extends Node, TEdge extends Edge>(
  nodes: TNode[],
  edges: TEdge[],
  config: LayoutConfig = {}
): { nodes: TNode[]; edges: TEdge[] } {
  const {
    direction,
    nodeWidth,
    nodeHeight,
    nodeSep,
    rankSep,
    edgeSep,
  } = { ...DEFAULT_CONFIG, ...config };

  // Separate nodes into hierarchical and orphaned
  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });
  
  const hierarchicalNodes = nodes.filter(node => connectedNodeIds.has(node.id));
  const orphanedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
  
  // Apply Dagre layout only to hierarchical nodes
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: nodeSep,
    ranksep: rankSep,
    edgesep: edgeSep
  });

  // Add hierarchical nodes to Dagre graph
  hierarchicalNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to Dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Apply layout to hierarchical nodes (only if we have nodes and edges)
  if (hierarchicalNodes.length > 0) {
    dagre.layout(dagreGraph);
  }

  // Update hierarchical node positions
  const layoutedHierarchicalNodes = hierarchicalNodes.map((node) => {
    if (hierarchicalNodes.length === 0) {
      return { ...node, position: { x: 0, y: 0 } };
    }
    
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2
      }
    };
  });
  
  // Position orphaned nodes in a separate area (left side, below the hierarchy)
  const orphanedNodesWithPositions = orphanedNodes.map((node, index) => {
    // Find the leftmost position of hierarchical nodes
    const leftmostX = Math.min(...layoutedHierarchicalNodes.map(n => n.position.x));
    const bottomY = Math.max(...layoutedHierarchicalNodes.map(n => n.position.y));
    
    // If no hierarchical nodes exist, position orphaned nodes in a grid
    if (layoutedHierarchicalNodes.length === 0) {
      const gridCols = 3;
      const col = index % gridCols;
      const row = Math.floor(index / gridCols);
      
      return {
        ...node,
        position: {
          x: col * 300 + 50,
          y: row * 120 + 50
        }
      };
    }
    
    return {
      ...node,
      position: {
        x: leftmostX - 300,
        y: bottomY + 120 + (index * 100)
      }
    };
  });
  
  // Combine both sets of nodes
  return { 
    nodes: [...layoutedHierarchicalNodes, ...orphanedNodesWithPositions], 
    edges 
  };
}

