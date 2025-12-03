import { processData, getLayoutedElements, getEntityColors, type EntityData, type ProcessedNode, type ProcessedEdge } from '../../src/utils/graphUtils';

// Mock dagre
jest.mock('dagre', () => ({
  graphlib: {
    Graph: jest.fn().mockImplementation(() => ({
      setDefaultEdgeLabel: jest.fn(),
      setGraph: jest.fn(),
      setNode: jest.fn(),
      setEdge: jest.fn(),
      node: jest.fn().mockReturnValue({ x: 100, y: 100, width: 246, height: 80 })
    }))
  },
  layout: jest.fn()
}));

describe('graphUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEntityColors', () => {
    it('should return correct colors for rollup entities', () => {
      const result = getEntityColors('Rollup Entity');
      expect(result).toEqual({ border: '#4285F4', title: '#4285F4' });
    });

    it('should return correct colors for planning entities', () => {
      const result = getEntityColors('Planning Entity');
      expect(result).toEqual({ border: '#8E44AD', title: '#8E44AD' });
    });

    it('should return default colors for other entities', () => {
      const result = getEntityColors('Custom Entity');
      expect(result).toEqual({ border: '#666666', title: '#666666' });
    });

    it('should handle undefined entity type', () => {
      const result = getEntityColors(undefined as any);
      expect(result).toEqual({ border: '#666666', title: '#666666' });
    });

    it('should handle null entity type', () => {
      const result = getEntityColors(null as any);
      expect(result).toEqual({ border: '#666666', title: '#666666' });
    });

    it('should handle empty string entity type', () => {
      const result = getEntityColors('');
      expect(result).toEqual({ border: '#666666', title: '#666666' });
    });

    it('should handle case insensitive matching', () => {
      const result1 = getEntityColors('ROLLUP Entity');
      const result2 = getEntityColors('rollup entity');
      const result3 = getEntityColors('Rollup Entity');
      
      expect(result1).toEqual({ border: '#4285F4', title: '#4285F4' });
      expect(result2).toEqual({ border: '#4285F4', title: '#4285F4' });
      expect(result3).toEqual({ border: '#4285F4', title: '#4285F4' });
    });

    it('should handle partial matches', () => {
      const result1 = getEntityColors('Planning Unit');
      const result2 = getEntityColors('Rollup Company');
      
      expect(result1).toEqual({ border: '#8E44AD', title: '#8E44AD' });
      expect(result2).toEqual({ border: '#4285F4', title: '#4285F4' });
    });
  });

  describe('processData', () => {
    it('should process entities into nodes and edges', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          displayName: 'Entity 1',
          entityType: 'planning',
          parent: []
        },
        {
          id: 2,
          displayName: 'Entity 2',
          entityType: 'rollup',
          parent: [{ id: 1, displayName: 'Entity 1', entityType: 'planning' }]
        }
      ];

      const result = processData(entities);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      expect(result.nodes[0].id).toBe('1');
      expect(result.nodes[1].id).toBe('2');
      expect(result.edges[0].source).toBe('1');
      expect(result.edges[0].target).toBe('2');
    });

    it('should handle entities without parents', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          displayName: 'Entity 1',
          entityType: 'planning'
        }
      ];

      const result = processData(entities);

      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);
    });

    it('should handle entities with multiple parents', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          displayName: 'Parent 1',
          entityType: 'planning'
        },
        {
          id: 2,
          displayName: 'Parent 2',
          entityType: 'rollup'
        },
        {
          id: 3,
          displayName: 'Child',
          entityType: 'planning',
          parent: [
            { id: 1, displayName: 'Parent 1', entityType: 'planning' },
            { id: 2, displayName: 'Parent 2', entityType: 'rollup' }
          ]
        }
      ];

      const result = processData(entities);

      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);
    });

    it('should handle entities with missing displayName', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          legalBusinessName: 'Legal Name',
          entityType: 'planning'
        }
      ];

      const result = processData(entities);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].data.label).toBe('Legal Name');
    });

    it('should handle entities with missing displayName and legalBusinessName', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          entityType: 'planning'
        }
      ];

      const result = processData(entities);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].data.label).toBe('Entity 1');
    });

    it('should handle entities with missing entityType', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          displayName: 'Entity 1'
        }
      ];

      const result = processData(entities);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].data.entityType).toBe('Unknown');
    });

    it('should calculate total descendants count correctly', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          displayName: 'Root',
          entityType: 'planning'
        },
        {
          id: 2,
          displayName: 'Child 1',
          entityType: 'rollup',
          parent: [{ id: 1, displayName: 'Root', entityType: 'planning' }]
        },
        {
          id: 3,
          displayName: 'Child 2',
          entityType: 'planning',
          parent: [{ id: 1, displayName: 'Root', entityType: 'planning' }]
        },
        {
          id: 4,
          displayName: 'Grandchild',
          entityType: 'rollup',
          parent: [{ id: 2, displayName: 'Child 1', entityType: 'rollup' }]
        }
      ];

      const result = processData(entities);

      expect(result.nodes).toHaveLength(4);
      expect(result.nodes[0].data.totalDescendantsCount).toBe(3); // Root has 3 descendants
      expect(result.nodes[1].data.totalDescendantsCount).toBe(1); // Child 1 has 1 descendant
      expect(result.nodes[2].data.totalDescendantsCount).toBe(0); // Child 2 has no descendants
      expect(result.nodes[3].data.totalDescendantsCount).toBe(0); // Grandchild has no descendants
    });

    it('should create edges with correct properties', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          displayName: 'Parent',
          entityType: 'planning'
        },
        {
          id: 2,
          displayName: 'Child',
          entityType: 'rollup',
          parent: [{ id: 1, displayName: 'Parent', entityType: 'planning' }]
        }
      ];

      const result = processData(entities);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].id).toBe('1-2');
      expect(result.edges[0].source).toBe('1');
      expect(result.edges[0].target).toBe('2');
      expect(result.edges[0].type).toBe('step');
      expect(result.edges[0].style).toEqual({
        stroke: '#666666',
        strokeWidth: 1,
        strokeDasharray: 'none'
      });
      expect(result.edges[0].markerEnd).toEqual({
        type: 'arrow',
        width: 30,
        height: 30,
        color: '#666666'
      });
    });

    it('should handle empty entities array', () => {
      const result = processData([]);

      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });

    it('should prevent duplicate processing of entities', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          displayName: 'Entity 1',
          entityType: 'planning'
        }
      ];

      const result = processData(entities);
      const result2 = processData(entities);

      expect(result.nodes).toHaveLength(1);
      expect(result2.nodes).toHaveLength(1);
    });
  });

  describe('getLayoutedElements', () => {
    it('should apply layout to hierarchical nodes', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1', entityType: 'planning', displayName: 'Node 1', totalDescendantsCount: 1 }
        },
        {
          id: '2',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Node 2', entityType: 'rollup', displayName: 'Node 2', totalDescendantsCount: 0 }
        }
      ];

      const edges: ProcessedEdge[] = [
        { id: '1-2', source: '1', target: '2', type: 'step' }
      ];

      const result = getLayoutedElements(nodes, edges, 'LR');

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      expect(result.nodes[0]).toHaveProperty('position');
      expect(result.nodes[1]).toHaveProperty('position');
    });

    it('should handle empty nodes and edges', () => {
      const result = getLayoutedElements([], [], 'LR');

      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });

    it('should handle orphaned nodes', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Orphaned Node', entityType: 'planning', displayName: 'Orphaned Node', totalDescendantsCount: 0 }
        }
      ];

      const result = getLayoutedElements(nodes, [], 'LR');

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].position).toEqual({ x: 50, y: 50 });
    });

    it('should handle mixed hierarchical and orphaned nodes', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Connected Node', entityType: 'planning', displayName: 'Connected Node', totalDescendantsCount: 1 }
        },
        {
          id: '2',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Orphaned Node', entityType: 'rollup', displayName: 'Orphaned Node', totalDescendantsCount: 0 }
        }
      ];

      const edges: ProcessedEdge[] = [
        { id: '1-2', source: '1', target: '2', type: 'step' }
      ];

      const result = getLayoutedElements(nodes, edges, 'LR');

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
    });

    it('should use different directions', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1', entityType: 'planning', displayName: 'Node 1', totalDescendantsCount: 0 }
        }
      ];

      const resultTB = getLayoutedElements(nodes, [], 'TB');
      const resultLR = getLayoutedElements(nodes, [], 'LR');

      expect(resultTB.nodes).toHaveLength(1);
      expect(resultLR.nodes).toHaveLength(1);
    });

    it('should handle single node without edges', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Single Node', entityType: 'planning', displayName: 'Single Node', totalDescendantsCount: 0 }
        }
      ];

      const result = getLayoutedElements(nodes, [], 'LR');

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].position).toEqual({ x: 50, y: 50 });
    });

    it('should handle multiple orphaned nodes in grid layout', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1', entityType: 'planning', displayName: 'Node 1', totalDescendantsCount: 0 }
        },
        {
          id: '2',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Node 2', entityType: 'rollup', displayName: 'Node 2', totalDescendantsCount: 0 }
        },
        {
          id: '3',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Node 3', entityType: 'planning', displayName: 'Node 3', totalDescendantsCount: 0 }
        },
        {
          id: '4',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Node 4', entityType: 'rollup', displayName: 'Node 4', totalDescendantsCount: 0 }
        }
      ];

      const result = getLayoutedElements(nodes, [], 'LR');

      expect(result.nodes).toHaveLength(4);
      expect(result.nodes[0].position).toEqual({ x: 50, y: 50 });
      expect(result.nodes[1].position).toEqual({ x: 350, y: 50 });
      expect(result.nodes[2].position).toEqual({ x: 650, y: 50 });
      expect(result.nodes[3].position).toEqual({ x: 50, y: 170 });
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complete graph creation', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          displayName: 'Entity 1',
          entityType: 'planning'
        },
        {
          id: 2,
          displayName: 'Entity 2',
          entityType: 'rollup',
          parent: [{ id: 1, displayName: 'Entity 1', entityType: 'planning' }]
        }
      ];

      const { nodes, edges } = processData(entities);
      const layoutedResult = getLayoutedElements(nodes, edges, 'LR');

      expect(layoutedResult.nodes).toHaveLength(2);
      expect(layoutedResult.edges).toHaveLength(1);
      expect(layoutedResult.nodes[0].data.label).toBe('Entity 1');
      expect(layoutedResult.nodes[1].data.label).toBe('Entity 2');
    });

    it('should handle complex graph structures', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          displayName: 'Root',
          entityType: 'planning'
        },
        {
          id: 2,
          displayName: 'Child 1',
          entityType: 'rollup',
          parent: [{ id: 1, displayName: 'Root', entityType: 'planning' }]
        },
        {
          id: 3,
          displayName: 'Child 2',
          entityType: 'planning',
          parent: [{ id: 1, displayName: 'Root', entityType: 'planning' }]
        },
        {
          id: 4,
          displayName: 'Grandchild',
          entityType: 'rollup',
          parent: [{ id: 2, displayName: 'Child 1', entityType: 'rollup' }]
        }
      ];

      const { nodes, edges } = processData(entities);
      const layoutedResult = getLayoutedElements(nodes, edges, 'TB');

      expect(layoutedResult.nodes).toHaveLength(4);
      expect(layoutedResult.edges).toHaveLength(3);
      expect(layoutedResult.nodes[0].data.label).toBe('Root');
      expect(layoutedResult.nodes[1].data.label).toBe('Child 1');
      expect(layoutedResult.nodes[2].data.label).toBe('Child 2');
      expect(layoutedResult.nodes[3].data.label).toBe('Grandchild');
    });

    it('should handle mixed hierarchical and orphaned nodes', () => {
      const entities: EntityData[] = [
        {
          id: 1,
          displayName: 'Connected Entity',
          entityType: 'planning'
        },
        {
          id: 2,
          displayName: 'Child',
          entityType: 'rollup',
          parent: [{ id: 1, displayName: 'Connected Entity', entityType: 'planning' }]
        },
        {
          id: 3,
          displayName: 'Orphaned Entity',
          entityType: 'planning'
        }
      ];

      const { nodes, edges } = processData(entities);
      const layoutedResult = getLayoutedElements(nodes, edges, 'LR');

      expect(layoutedResult.nodes).toHaveLength(3);
      expect(layoutedResult.edges).toHaveLength(1);
    });
  });
});
