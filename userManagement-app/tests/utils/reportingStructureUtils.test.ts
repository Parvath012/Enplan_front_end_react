/**
 * Unit tests for reportingStructureUtils
 */

import {
  getDepartmentColor,
  processUserData,
  getLayoutedUserElements,
  fitViewToContainer,
  UserData,
} from '../../src/utils/reportingStructureUtils';
import { DEPARTMENT_COLORS, DEFAULT_BORDER_COLOR, DEFAULT_EDGE_COLOR } from '../../src/constants/reportingStructureConstants';

describe('reportingStructureUtils', () => {
  describe('getDepartmentColor', () => {
    it('should return default color when department is undefined', () => {
      const result = getDepartmentColor(undefined);
      expect(result).toBe(DEPARTMENT_COLORS.Default);
    });

    it('should return default color when department is null', () => {
      const result = getDepartmentColor(null as any);
      expect(result).toBe(DEPARTMENT_COLORS.Default);
    });

    it('should return default color when department is empty string', () => {
      const result = getDepartmentColor('');
      expect(result).toBe(DEPARTMENT_COLORS.Default);
    });

    it('should return correct color for known department', () => {
      const result = getDepartmentColor('HR');
      expect(result).toBe(DEPARTMENT_COLORS.HR);
    });

    it('should return default color for unknown department', () => {
      const result = getDepartmentColor('UnknownDepartment');
      expect(result).toBe(DEPARTMENT_COLORS.Default);
    });

    it('should return correct color for all known departments', () => {
      Object.keys(DEPARTMENT_COLORS).forEach((dept) => {
        if (dept !== 'Default') {
          const result = getDepartmentColor(dept);
          expect(result).toBe(DEPARTMENT_COLORS[dept]);
        }
      });
    });
  });

  describe('processUserData', () => {
    it('should return empty nodes and edges for empty array', () => {
      const result = processUserData([], 'organizational');
      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it('should create a single node for a user with no managers', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Developer',
          department: 'IT',
        },
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);
      expect(result.nodes[0].id).toBe('1');
      expect(result.nodes[0].data.fullName).toBe('John Doe');
      expect(result.nodes[0].data.designation).toBe('Developer');
      expect(result.nodes[0].data.department).toBe('IT');
      expect(result.nodes[0].data.borderColor).toBe(DEFAULT_BORDER_COLOR);
    });

    it('should use fullName when available', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'Johnny Doe',
          role: 'Developer',
          department: 'IT',
        },
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.fullName).toBe('Johnny Doe');
      expect(result.nodes[0].data.label).toBe('Johnny Doe');
    });

    it('should construct fullName from firstName and lastName when fullName is missing', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: '',
          role: 'Developer',
          department: 'IT',
        },
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.fullName).toBe('John Doe');
    });

    it('should use N/A for missing role and department', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: '',
          department: undefined,
        },
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.designation).toBe('N/A');
      expect(result.nodes[0].data.department).toBe('N/A');
    });

    it('should create edge for reporting manager relationship', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'Manager',
          lastName: 'One',
          fullName: 'Manager One',
          role: 'Manager',
          department: 'IT',
        },
        {
          id: 2,
          firstName: 'Employee',
          lastName: 'One',
          fullName: 'Employee One',
          role: 'Developer',
          department: 'IT',
          reportingManager: [
            {
              id: 1,
              firstName: 'Manager',
              lastName: 'One',
              fullName: 'Manager One',
              role: 'Manager',
              department: 'IT',
            },
          ],
        },
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].source).toBe('1');
      expect(result.edges[0].target).toBe('2');
      expect(result.edges[0].type).toBe('step');
      expect(result.edges[0].style.strokeDasharray).toBe('none');
    });

    it('should use departmental color for edges in departmental view', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'Manager',
          lastName: 'One',
          fullName: 'Manager One',
          role: 'Manager',
          department: 'HR',
        },
        {
          id: 2,
          firstName: 'Employee',
          lastName: 'One',
          fullName: 'Employee One',
          role: 'Developer',
          department: 'HR',
          reportingManager: [
            {
              id: 1,
              firstName: 'Manager',
              lastName: 'One',
              fullName: 'Manager One',
              role: 'Manager',
              department: 'HR',
            },
          ],
        },
      ];

      const result = processUserData(users, 'departmental');
      expect(result.edges[0].style.stroke).toBe(DEPARTMENT_COLORS.HR);
      expect(result.edges[0].markerEnd.color).toBe(DEPARTMENT_COLORS.HR);
    });

    it('should create dotted edges for dotted-line managers in dotted-line view', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'Project',
          lastName: 'Manager',
          fullName: 'Project Manager',
          role: 'PM',
          department: 'IT',
        },
        {
          id: 2,
          firstName: 'Employee',
          lastName: 'One',
          fullName: 'Employee One',
          role: 'Developer',
          department: 'IT',
          dottedProjectManager: [
            {
              id: 1,
              firstName: 'Project',
              lastName: 'Manager',
              fullName: 'Project Manager',
              role: 'PM',
              department: 'IT',
            },
          ],
        },
      ];

      const result = processUserData(users, 'dotted-line');
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].id).toContain('dotted');
      expect(result.edges[0].style.strokeDasharray).toBe('5,5');
    });

    it('should not create dotted edges in non-dotted-line views', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'Project',
          lastName: 'Manager',
          fullName: 'Project Manager',
          role: 'PM',
          department: 'IT',
        },
        {
          id: 2,
          firstName: 'Employee',
          lastName: 'One',
          fullName: 'Employee One',
          role: 'Developer',
          department: 'IT',
          dottedProjectManager: [
            {
              id: 1,
              firstName: 'Project',
              lastName: 'Manager',
              fullName: 'Project Manager',
              role: 'PM',
              department: 'IT',
            },
          ],
        },
      ];

      const result = processUserData(users, 'organizational');
      expect(result.edges).toHaveLength(0);
    });

    it('should count only immediate children correctly', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'CEO',
          lastName: 'One',
          fullName: 'CEO One',
          role: 'CEO',
          department: 'Executive',
        },
        {
          id: 2,
          firstName: 'Manager',
          lastName: 'One',
          fullName: 'Manager One',
          role: 'Manager',
          department: 'IT',
          reportingManager: [
            {
              id: 1,
              firstName: 'CEO',
              lastName: 'One',
              fullName: 'CEO One',
              role: 'CEO',
              department: 'Executive',
            },
          ],
        },
        {
          id: 3,
          firstName: 'Employee',
          lastName: 'One',
          fullName: 'Employee One',
          role: 'Developer',
          department: 'IT',
          reportingManager: [
            {
              id: 2,
              firstName: 'Manager',
              lastName: 'One',
              fullName: 'Manager One',
              role: 'Manager',
              department: 'IT',
            },
          ],
        },
      ];

      const result = processUserData(users, 'organizational');
      const ceoNode = result.nodes.find((n) => n.id === '1');
      const managerNode = result.nodes.find((n) => n.id === '2');
      const employeeNode = result.nodes.find((n) => n.id === '3');

      // CEO has 1 immediate child (Manager), not counting Manager's child
      expect(ceoNode?.data.totalDescendantsCount).toBe(1);
      // Manager has 1 immediate child (Employee)
      expect(managerNode?.data.totalDescendantsCount).toBe(1);
      // Employee has no immediate children
      expect(employeeNode?.data.totalDescendantsCount).toBe(0);
    });

    it('should count dotted-line relationships in dotted-line view', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'Manager',
          lastName: 'One',
          fullName: 'Manager One',
          role: 'Manager',
          department: 'IT',
        },
        {
          id: 2,
          firstName: 'Employee',
          lastName: 'One',
          fullName: 'Employee One',
          role: 'Developer',
          department: 'IT',
          reportingManager: [
            {
              id: 1,
              firstName: 'Manager',
              lastName: 'One',
              fullName: 'Manager One',
              role: 'Manager',
              department: 'IT',
            },
          ],
        },
        {
          id: 3,
          firstName: 'Employee',
          lastName: 'Two',
          fullName: 'Employee Two',
          role: 'Developer',
          department: 'IT',
          dottedProjectManager: [
            {
              id: 1,
              firstName: 'Manager',
              lastName: 'One',
              fullName: 'Manager One',
              role: 'Manager',
              department: 'IT',
            },
          ],
        },
      ];

      // Test dotted-line view - should count both reportingManager and dottedProjectManager
      const resultDotted = processUserData(users, 'dotted-line');
      const managerNodeDotted = resultDotted.nodes.find((n) => n.id === '1');
      // Manager has 2 immediate children: 1 via reportingManager + 1 via dottedProjectManager
      expect(managerNodeDotted?.data.totalDescendantsCount).toBe(2);

      // Test organizational view - should count only reportingManager
      const resultOrg = processUserData(users, 'organizational');
      const managerNodeOrg = resultOrg.nodes.find((n) => n.id === '1');
      // Manager has 1 immediate child via reportingManager only
      expect(managerNodeOrg?.data.totalDescendantsCount).toBe(1);
    });

    it('should handle multiple reporting managers', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'Manager',
          lastName: 'One',
          fullName: 'Manager One',
          role: 'Manager',
          department: 'IT',
        },
        {
          id: 2,
          firstName: 'Manager',
          lastName: 'Two',
          fullName: 'Manager Two',
          role: 'Manager',
          department: 'IT',
        },
        {
          id: 3,
          firstName: 'Employee',
          lastName: 'One',
          fullName: 'Employee One',
          role: 'Developer',
          department: 'IT',
          reportingManager: [
            {
              id: 1,
              firstName: 'Manager',
              lastName: 'One',
              fullName: 'Manager One',
              role: 'Manager',
              department: 'IT',
            },
            {
              id: 2,
              firstName: 'Manager',
              lastName: 'Two',
              fullName: 'Manager Two',
              role: 'Manager',
              department: 'IT',
            },
          ],
        },
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);
    });

    it('should not process duplicate users', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'Manager',
          lastName: 'One',
          fullName: 'Manager One',
          role: 'Manager',
          department: 'IT',
        },
        {
          id: 2,
          firstName: 'Employee',
          lastName: 'One',
          fullName: 'Employee One',
          role: 'Developer',
          department: 'IT',
          reportingManager: [
            {
              id: 1,
              firstName: 'Manager',
              lastName: 'One',
              fullName: 'Manager One',
              role: 'Manager',
              department: 'IT',
            },
          ],
        },
        {
          id: 3,
          firstName: 'Employee',
          lastName: 'Two',
          fullName: 'Employee Two',
          role: 'Developer',
          department: 'IT',
          reportingManager: [
            {
              id: 1,
              firstName: 'Manager',
              lastName: 'One',
              fullName: 'Manager One',
              role: 'Manager',
              department: 'IT',
            },
          ],
        },
      ];

      const result = processUserData(users, 'organizational');
      const managerNodes = result.nodes.filter((n) => n.id === '1');
      expect(managerNodes).toHaveLength(1);
    });

    it('should use departmental border color in departmental view', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Developer',
          department: 'HR',
        },
      ];

      const result = processUserData(users, 'departmental');
      expect(result.nodes[0].data.borderColor).toBe(DEPARTMENT_COLORS.HR);
    });

    it('should use default border color in non-departmental views', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Developer',
          department: 'HR',
        },
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.borderColor).toBe(DEFAULT_BORDER_COLOR);
    });
  });

  describe('getLayoutedUserElements', () => {
    it('should return empty nodes and edges for empty input', () => {
      const result = getLayoutedUserElements([], [], 'LR');
      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it('should position orphaned nodes in grid when no hierarchical nodes exist', () => {
      const nodes = [
        {
          id: '1',
          type: 'user',
          position: { x: 0, y: 0 },
          data: { label: 'User 1', fullName: 'User 1', designation: 'Dev', department: 'IT', borderColor: '#000' },
        },
        {
          id: '2',
          type: 'user',
          position: { x: 0, y: 0 },
          data: { label: 'User 2', fullName: 'User 2', designation: 'Dev', department: 'IT', borderColor: '#000' },
        },
      ];

      const result = getLayoutedUserElements(nodes, [], 'LR');
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].position.x).toBe(50);
      expect(result.nodes[0].position.y).toBe(50);
      expect(result.nodes[1].position.x).toBe(350);
      expect(result.nodes[1].position.y).toBe(50);
    });

    it('should apply layout to hierarchical nodes', () => {
      const nodes = [
        {
          id: '1',
          type: 'user',
          position: { x: 0, y: 0 },
          data: { label: 'Manager', fullName: 'Manager', designation: 'Mgr', department: 'IT', borderColor: '#000' },
        },
        {
          id: '2',
          type: 'user',
          position: { x: 0, y: 0 },
          data: { label: 'Employee', fullName: 'Employee', designation: 'Dev', department: 'IT', borderColor: '#000' },
        },
      ];

      const edges = [
        {
          id: 'e1',
          source: '1',
          target: '2',
          type: 'step',
        },
      ];

      const result = getLayoutedUserElements(nodes, edges, 'LR');
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      // Nodes should have positions set by Dagre
      expect(result.nodes[0].position.x).not.toBe(0);
      expect(result.nodes[0].position.y).not.toBe(0);
    });

    it('should position orphaned nodes relative to hierarchical nodes', () => {
      const hierarchicalNodes = [
        {
          id: '1',
          type: 'user',
          position: { x: 100, y: 100 },
          data: { label: 'Manager', fullName: 'Manager', designation: 'Mgr', department: 'IT', borderColor: '#000' },
        },
        {
          id: '2',
          type: 'user',
          position: { x: 400, y: 100 },
          data: { label: 'Employee', fullName: 'Employee', designation: 'Dev', department: 'IT', borderColor: '#000' },
        },
      ];

      const orphanedNode = {
        id: '3',
        type: 'user',
        position: { x: 0, y: 0 },
        data: { label: 'Orphan', fullName: 'Orphan', designation: 'Dev', department: 'IT', borderColor: '#000' },
      };

      const edges = [
        {
          id: 'e1',
          source: '1',
          target: '2',
          type: 'step',
        },
      ];

      const result = getLayoutedUserElements([...hierarchicalNodes, orphanedNode], edges, 'LR');
      expect(result.nodes).toHaveLength(3);
      const orphanedResult = result.nodes.find((n) => n.id === '3');
      expect(orphanedResult).toBeDefined();
      expect(orphanedResult?.position.x).toBeLessThan(100); // Should be to the left
    });

    it('should handle TB direction', () => {
      const nodes = [
        {
          id: '1',
          type: 'user',
          position: { x: 0, y: 0 },
          data: { label: 'Manager', fullName: 'Manager', designation: 'Mgr', department: 'IT', borderColor: '#000' },
        },
        {
          id: '2',
          type: 'user',
          position: { x: 0, y: 0 },
          data: { label: 'Employee', fullName: 'Employee', designation: 'Dev', department: 'IT', borderColor: '#000' },
        },
      ];

      const edges = [
        {
          id: 'e1',
          source: '1',
          target: '2',
          type: 'step',
        },
      ];

      const result = getLayoutedUserElements(nodes, edges, 'TB');
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
    });
  });

  describe('fitViewToContainer', () => {
    it('should call fitView when instance is provided', () => {
      const mockInstance = {
        fitView: jest.fn(),
      };

      fitViewToContainer(mockInstance as any);
      expect(mockInstance.fitView).toHaveBeenCalledWith({
        padding: 0.1,
        includeHiddenNodes: false,
        minZoom: 0.1,
        maxZoom: 2,
      });
    });

    it('should not throw when instance is null', () => {
      expect(() => fitViewToContainer(null)).not.toThrow();
    });

    it('should not throw when instance is undefined', () => {
      expect(() => fitViewToContainer(undefined)).not.toThrow();
    });
  });

  describe('Edge Cases and Additional Coverage', () => {
    it('should handle users with missing firstName and lastName', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: '',
          lastName: '',
          fullName: 'Full Name Only',
          role: 'Developer',
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.fullName).toBe('Full Name Only');
    });

    it('should handle users with only firstName', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: '',
          fullName: '',
          role: 'Developer',
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.fullName).toBe('John');
    });

    it('should handle users with only lastName', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: '',
          lastName: 'Doe',
          fullName: '',
          role: 'Developer',
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.fullName).toBe('Doe');
    });

    it('should handle multiple dotted-line managers', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'PM1',
          lastName: 'One',
          fullName: 'PM1 One',
          role: 'PM',
          department: 'IT'
        },
        {
          id: 2,
          firstName: 'PM2',
          lastName: 'Two',
          fullName: 'PM2 Two',
          role: 'PM',
          department: 'IT'
        },
        {
          id: 3,
          firstName: 'Employee',
          lastName: 'One',
          fullName: 'Employee One',
          role: 'Developer',
          department: 'IT',
          dottedProjectManager: [
            {
              id: 1,
              firstName: 'PM1',
              lastName: 'One',
              fullName: 'PM1 One',
              role: 'PM',
              department: 'IT'
            },
            {
              id: 2,
              firstName: 'PM2',
              lastName: 'Two',
              fullName: 'PM2 Two',
              role: 'PM',
              department: 'IT'
            }
          ]
        }
      ];

      const result = processUserData(users, 'dotted-line');
      expect(result.edges.filter(e => e.id.includes('dotted'))).toHaveLength(2);
    });

    it('should handle complex hierarchy with multiple levels', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'CEO',
          lastName: 'One',
          fullName: 'CEO One',
          role: 'CEO',
          department: 'Executive'
        },
        {
          id: 2,
          firstName: 'VP',
          lastName: 'One',
          fullName: 'VP One',
          role: 'VP',
          department: 'Executive',
          reportingManager: [
            {
              id: 1,
              firstName: 'CEO',
              lastName: 'One',
              fullName: 'CEO One',
              role: 'CEO',
              department: 'Executive'
            }
          ]
        },
        {
          id: 3,
          firstName: 'Director',
          lastName: 'One',
          fullName: 'Director One',
          role: 'Director',
          department: 'IT',
          reportingManager: [
            {
              id: 2,
              firstName: 'VP',
              lastName: 'One',
              fullName: 'VP One',
              role: 'VP',
              department: 'Executive'
            }
          ]
        },
        {
          id: 4,
          firstName: 'Manager',
          lastName: 'One',
          fullName: 'Manager One',
          role: 'Manager',
          department: 'IT',
          reportingManager: [
            {
              id: 3,
              firstName: 'Director',
              lastName: 'One',
              fullName: 'Director One',
              role: 'Director',
              department: 'IT'
            }
          ]
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes).toHaveLength(4);
      expect(result.edges).toHaveLength(3);
    });

    it('should handle getLayoutedUserElements with TB direction', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'user',
          position: { x: 0, y: 0 },
          data: {
            label: 'Manager',
            fullName: 'Manager',
            designation: 'Mgr',
            department: 'IT',
            borderColor: '#000'
          }
        },
        {
          id: '2',
          type: 'user',
          position: { x: 0, y: 0 },
          data: {
            label: 'Employee',
            fullName: 'Employee',
            designation: 'Dev',
            department: 'IT',
            borderColor: '#000'
          }
        }
      ];

      const edges: ProcessedEdge[] = [
        {
          id: 'e1',
          source: '1',
          target: '2',
          type: 'step'
        }
      ];

      const result = getLayoutedUserElements(nodes, edges, 'TB');
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
    });

    it('should handle getLayoutedUserElements with default LR direction', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'user',
          position: { x: 0, y: 0 },
          data: {
            label: 'User',
            fullName: 'User',
            designation: 'Dev',
            department: 'IT',
            borderColor: '#000'
          }
        }
      ];

      const result = getLayoutedUserElements(nodes, []);
      expect(result.nodes).toHaveLength(1);
    });

    it('should handle processUserData with undefined fullName', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: undefined as any,
          role: 'Developer',
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.fullName).toBe('John Doe');
    });

    it('should handle processUserData with null fullName', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: null as any,
          role: 'Developer',
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.fullName).toBe('John Doe');
    });

    it('should handle processUserData with undefined role', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: undefined as any,
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.designation).toBe('N/A');
    });

    it('should handle processUserData with empty role', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: '',
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.designation).toBe('N/A');
    });

    it('should handle processUserData with null department', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Developer',
          department: null as any
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.department).toBe('N/A');
    });

    it('should handle processUserData with empty department', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Developer',
          department: ''
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.department).toBe('N/A');
    });

    it('should handle processUserData with unknown department in departmental view', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Developer',
          department: 'UnknownDept'
        }
      ];

      const result = processUserData(users, 'departmental');
      expect(result.nodes[0].data.borderColor).toBe(DEPARTMENT_COLORS.Default);
    });

    it('should handle processUserData with empty reportingManager array', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Developer',
          department: 'IT',
          reportingManager: []
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);
    });

    it('should handle processUserData with empty dottedProjectManager array in dotted-line view', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Developer',
          department: 'IT',
          dottedProjectManager: []
        }
      ];

      const result = processUserData(users, 'dotted-line');
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);
    });

    it('should handle processUserData with both reportingManager and dottedProjectManager in dotted-line view', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'Manager',
          lastName: 'One',
          fullName: 'Manager One',
          role: 'Manager',
          department: 'IT'
        },
        {
          id: 2,
          firstName: 'PM',
          lastName: 'One',
          fullName: 'PM One',
          role: 'PM',
          department: 'IT'
        },
        {
          id: 3,
          firstName: 'Employee',
          lastName: 'One',
          fullName: 'Employee One',
          role: 'Developer',
          department: 'IT',
          reportingManager: [
            {
              id: 1,
              firstName: 'Manager',
              lastName: 'One',
              fullName: 'Manager One',
              role: 'Manager',
              department: 'IT'
            }
          ],
          dottedProjectManager: [
            {
              id: 2,
              firstName: 'PM',
              lastName: 'One',
              fullName: 'PM One',
              role: 'PM',
              department: 'IT'
            }
          ]
        }
      ];

      const result = processUserData(users, 'dotted-line');
      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);
      expect(result.edges.some(e => e.id.includes('reporting'))).toBe(true);
      expect(result.edges.some(e => e.id.includes('dotted'))).toBe(true);
    });

    it('should handle getDepartmentColor with empty string', () => {
      const result = getDepartmentColor('');
      expect(result).toBe(DEPARTMENT_COLORS.Default);
    });

    it('should handle getDepartmentColor with all known departments', () => {
      const departments = ['HR', 'IT', 'Finance', 'Operations', 'Marketing', 'Sales', 'Legal'];
      departments.forEach(dept => {
        const result = getDepartmentColor(dept);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });
  });
});

