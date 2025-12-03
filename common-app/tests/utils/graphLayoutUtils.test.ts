import { applyDagreLayout, LayoutConfig } from '../../src/utils/graphLayoutUtils';
import { Node, Edge } from 'reactflow';

// Mock dagre
jest.mock('dagre', () => {
  const mockGraph = {
    setDefaultEdgeLabel: jest.fn(),
    setGraph: jest.fn(),
    setNode: jest.fn(),
    setEdge: jest.fn(),
    node: jest.fn((id: string) => ({
      x: 100,
      y: 200,
      width: 246,
      height: 80,
    })),
  };

  return {
    graphlib: {
      Graph: jest.fn(() => mockGraph),
    },
    layout: jest.fn(),
  };
});

describe('graphLayoutUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('applyDagreLayout', () => {
    describe('basic functionality', () => {
      it('should return nodes and edges', () => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        
        const result = applyDagreLayout(nodes, edges);
        
        expect(result).toHaveProperty('nodes');
        expect(result).toHaveProperty('edges');
        expect(Array.isArray(result.nodes)).toBe(true);
        expect(Array.isArray(result.edges)).toBe(true);
      });

      it('should return edges unchanged', () => {
        const nodes: Node[] = [];
        const edges: Edge[] = [
          { id: 'e1', source: '1', target: '2' },
          { id: 'e2', source: '2', target: '3' },
        ];
        
        const result = applyDagreLayout(nodes, edges);
        
        expect(result.edges).toEqual(edges);
      });

      it('should use default config when no config provided', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        
        applyDagreLayout(nodes, edges);
        
        const dagre = require('dagre');
        const mockGraph = dagre.graphlib.Graph();
        expect(mockGraph.setGraph).toHaveBeenCalledWith({
          rankdir: 'LR',
          nodesep: 20,
          ranksep: 70,
          edgesep: 10,
        });
      });
    });

    describe('hierarchical nodes', () => {
      it('should separate hierarchical and orphaned nodes', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
          { id: '2', position: { x: 0, y: 0 }, data: {} },
          { id: '3', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [
          { id: 'e1', source: '1', target: '2' },
        ];
        
        const result = applyDagreLayout(nodes, edges);
        
        // Nodes 1 and 2 are hierarchical (connected), node 3 is orphaned
        expect(result.nodes.length).toBe(3);
        const hierarchicalIds = result.nodes
          .filter(n => n.id === '1' || n.id === '2')
          .map(n => n.id);
        expect(hierarchicalIds).toContain('1');
        expect(hierarchicalIds).toContain('2');
      });

      it('should apply layout to hierarchical nodes', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
          { id: '2', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [
          { id: 'e1', source: '1', target: '2' },
        ];
        
        const result = applyDagreLayout(nodes, edges);
        
        const dagre = require('dagre');
        expect(dagre.layout).toHaveBeenCalled();
      });

      it('should not apply layout when no hierarchical nodes', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        
        applyDagreLayout(nodes, edges);
        
        const dagre = require('dagre');
        expect(dagre.layout).not.toHaveBeenCalled();
      });

      it('should calculate node positions correctly', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
          { id: '2', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [
          { id: 'e1', source: '1', target: '2' },
        ];
        
        const result = applyDagreLayout(nodes, edges);
        
        // Positions should be calculated (centered)
        const node1 = result.nodes.find(n => n.id === '1');
        expect(node1).toBeDefined();
        expect(node1?.position).toBeDefined();
      });
    });

    describe('orphaned nodes', () => {
      it('should position orphaned nodes in grid when no hierarchical nodes', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
          { id: '2', position: { x: 0, y: 0 }, data: {} },
          { id: '3', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        
        const result = applyDagreLayout(nodes, edges);
        
        // All nodes should be positioned in grid
        expect(result.nodes.length).toBe(3);
        result.nodes.forEach((node, index) => {
          const col = index % 3;
          const row = Math.floor(index / 3);
          expect(node.position.x).toBe(col * 300 + 50);
          expect(node.position.y).toBe(row * 120 + 50);
        });
      });

      it('should position orphaned nodes relative to hierarchical nodes', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
          { id: '2', position: { x: 0, y: 0 }, data: {} },
          { id: '3', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [
          { id: 'e1', source: '1', target: '2' },
        ];
        
        const result = applyDagreLayout(nodes, edges);
        
        // Node 3 should be positioned relative to hierarchical nodes
        const orphanedNode = result.nodes.find(n => n.id === '3');
        expect(orphanedNode).toBeDefined();
        expect(orphanedNode?.position.x).toBeDefined();
        expect(orphanedNode?.position.y).toBeDefined();
      });

      it('should stack orphaned nodes vertically', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
          { id: '2', position: { x: 0, y: 0 }, data: {} },
          { id: '3', position: { x: 0, y: 0 }, data: {} },
          { id: '4', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [
          { id: 'e1', source: '1', target: '2' },
        ];
        
        const result = applyDagreLayout(nodes, edges);
        
        const orphanedNodes = result.nodes.filter(n => n.id === '3' || n.id === '4');
        expect(orphanedNodes.length).toBe(2);
        
        // Second orphaned node should have higher y position
        const node3 = orphanedNodes.find(n => n.id === '3');
        const node4 = orphanedNodes.find(n => n.id === '4');
        if (node3 && node4) {
          expect(node4.position.y).toBeGreaterThan(node3.position.y);
        }
      });
    });

    describe('configuration', () => {
      it('should use custom direction', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        const config: LayoutConfig = { direction: 'TB' };
        
        applyDagreLayout(nodes, edges, config);
        
        const dagre = require('dagre');
        const mockGraph = dagre.graphlib.Graph();
        expect(mockGraph.setGraph).toHaveBeenCalledWith(
          expect.objectContaining({ rankdir: 'TB' })
        );
      });

      it('should use custom node dimensions', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        const config: LayoutConfig = { nodeWidth: 300, nodeHeight: 100 };
        
        applyDagreLayout(nodes, edges, config);
        
        const dagre = require('dagre');
        const mockGraph = dagre.graphlib.Graph();
        expect(mockGraph.setNode).toHaveBeenCalledWith('1', {
          width: 300,
          height: 100,
        });
      });

      it('should use custom spacing', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        const config: LayoutConfig = {
          nodeSep: 50,
          rankSep: 100,
          edgeSep: 20,
        };
        
        applyDagreLayout(nodes, edges, config);
        
        const dagre = require('dagre');
        const mockGraph = dagre.graphlib.Graph();
        expect(mockGraph.setGraph).toHaveBeenCalledWith({
          rankdir: 'LR',
          nodesep: 50,
          ranksep: 100,
          edgesep: 20,
        });
      });

      it('should merge custom config with defaults', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        const config: LayoutConfig = { direction: 'TB' };
        
        applyDagreLayout(nodes, edges, config);
        
        const dagre = require('dagre');
        const mockGraph = dagre.graphlib.Graph();
        expect(mockGraph.setGraph).toHaveBeenCalledWith({
          rankdir: 'TB',
          nodesep: 20, // default
          ranksep: 70, // default
          edgesep: 10, // default
        });
      });
    });

    describe('edge cases', () => {
      it('should handle empty nodes array', () => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        
        const result = applyDagreLayout(nodes, edges);
        
        expect(result.nodes).toEqual([]);
        expect(result.edges).toEqual([]);
      });

      it('should handle empty edges array', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        
        const result = applyDagreLayout(nodes, edges);
        
        expect(result.nodes.length).toBe(1);
        expect(result.edges).toEqual([]);
      });

      it('should handle single node', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        
        const result = applyDagreLayout(nodes, edges);
        
        expect(result.nodes.length).toBe(1);
        expect(result.nodes[0].id).toBe('1');
      });

      it('should handle single edge', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
          { id: '2', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [
          { id: 'e1', source: '1', target: '2' },
        ];
        
        const result = applyDagreLayout(nodes, edges);
        
        expect(result.nodes.length).toBe(2);
        expect(result.edges.length).toBe(1);
      });

      it('should handle nodes with zero hierarchical nodes edge case', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        
        const result = applyDagreLayout(nodes, edges);
        
        // Should handle the edge case in layoutedHierarchicalNodes map
        expect(result.nodes.length).toBe(1);
      });

      it('should handle complex graph with multiple levels', () => {
        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
          { id: '2', position: { x: 0, y: 0 }, data: {} },
          { id: '3', position: { x: 0, y: 0 }, data: {} },
          { id: '4', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [
          { id: 'e1', source: '1', target: '2' },
          { id: 'e2', source: '1', target: '3' },
          { id: 'e3', source: '2', target: '4' },
        ];
        
        const result = applyDagreLayout(nodes, edges);
        
        expect(result.nodes.length).toBe(4);
        expect(result.edges.length).toBe(3);
      });
    });

    describe('node position calculation', () => {
      it('should center node positions correctly', () => {
        const dagre = require('dagre');
        dagre.graphlib.Graph().node = jest.fn((id: string) => ({
          x: 200,
          y: 300,
          width: 246,
          height: 80,
        }));

        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        
        const result = applyDagreLayout(nodes, edges);
        
        // Position should be centered: x - width/2, y - height/2
        const node = result.nodes[0];
        expect(node.position.x).toBe(200 - 246 / 2);
        expect(node.position.y).toBe(300 - 80 / 2);
      });

      it('should handle different node widths and heights', () => {
        const dagre = require('dagre');
        dagre.graphlib.Graph().node = jest.fn((id: string) => ({
          x: 100,
          y: 200,
          width: 300,
          height: 100,
        }));

        const nodes: Node[] = [
          { id: '1', position: { x: 0, y: 0 }, data: {} },
        ];
        const edges: Edge[] = [];
        const config: LayoutConfig = { nodeWidth: 300, nodeHeight: 100 };
        
        const result = applyDagreLayout(nodes, edges, config);
        
        const node = result.nodes[0];
        expect(node.position.x).toBe(100 - 300 / 2);
        expect(node.position.y).toBe(200 - 100 / 2);
      });
    });

    describe('type safety', () => {
      it('should preserve node type', () => {
        interface CustomNode extends Node {
          data: { custom: string };
        }

        const nodes: CustomNode[] = [
          { id: '1', position: { x: 0, y: 0 }, data: { custom: 'test' } },
        ];
        const edges: Edge[] = [];
        
        const result = applyDagreLayout(nodes, edges);
        
        expect(result.nodes[0].data).toHaveProperty('custom');
        expect((result.nodes[0].data as any).custom).toBe('test');
      });

      it('should preserve edge type', () => {
        interface CustomEdge extends Edge {
          custom: string;
        }

        const nodes: Node[] = [];
        const edges: CustomEdge[] = [
          { id: 'e1', source: '1', target: '2', custom: 'test' },
        ];
        
        const result = applyDagreLayout(nodes, edges);
        
        expect((result.edges[0] as CustomEdge).custom).toBe('test');
      });
    });
  });
});

