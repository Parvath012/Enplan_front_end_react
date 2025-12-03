/**
 * Tests for userHierarchyGraphUtils
 */
import {
  getDepartmentColor,
  processUserData,
  getLayoutedUserElements,
  UserData,
  ProcessedNode,
  ProcessedEdge
} from '../../src/utils/userHierarchyGraphUtils';

// Mock graphLayoutUtils
jest.mock('commonApp/graphLayoutUtils', () => ({
  applyDagreLayout: jest.fn((nodes, edges, options) => ({
    nodes: nodes.map((node: any) => ({
      ...node,
      position: { x: 100, y: 100 }
    })),
    edges
  }))
}));

describe('userHierarchyGraphUtils', () => {
  describe('getDepartmentColor', () => {
    it('should return default color for undefined department', () => {
      const result = getDepartmentColor(undefined);
      expect(result).toBe('#4285F4');
    });

    it('should return default color for null department', () => {
      const result = getDepartmentColor(null as any);
      expect(result).toBe('#4285F4');
    });

    it('should return correct color for known department', () => {
      expect(getDepartmentColor('HR')).toBe('#4285F4');
      expect(getDepartmentColor('IT')).toBe('#34A853');
      expect(getDepartmentColor('Finance')).toBe('#EA4335');
      expect(getDepartmentColor('Operations')).toBe('#FBBC04');
      expect(getDepartmentColor('Marketing')).toBe('#9C27B0');
      expect(getDepartmentColor('Sales')).toBe('#FF5722');
      expect(getDepartmentColor('Legal')).toBe('#607D8B');
    });

    it('should return default color for unknown department', () => {
      const result = getDepartmentColor('UnknownDept');
      expect(result).toBe('#4285F4');
    });

    it('should return default color for empty string department', () => {
      const result = getDepartmentColor('');
      expect(result).toBe('#4285F4');
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
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);
      expect(result.nodes[0].id).toBe('1');
      expect(result.nodes[0].data.fullName).toBe('John Doe');
    });

    it('should use fullName when available', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'Johnny Doe',
          role: 'Developer',
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.fullName).toBe('Johnny Doe');
    });

    it('should construct fullName from firstName and lastName when fullName is missing', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: '',
          role: 'Developer',
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.fullName).toBe('John Doe');
    });

    it('should construct fullName from firstName and lastName when fullName is undefined', () => {
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

    it('should handle missing firstName and lastName', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: '',
          lastName: '',
          fullName: undefined as any,
          role: 'Developer',
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.fullName).toBe('');
    });

    it('should handle missing role', () => {
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

    it('should handle missing department', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Developer',
          department: undefined
        }
      ];

      const result = processUserData(users, 'organizational');
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
          department: 'IT'
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
              department: 'IT'
            }
          ]
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].source).toBe('1');
      expect(result.edges[0].target).toBe('2');
    });

    it('should use departmental color for edges in departmental view', () => {
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
          ]
        }
      ];

      const result = processUserData(users, 'departmental');
      expect(result.edges[0].style.stroke).toBe('#34A853');
      expect(result.nodes[0].data.borderColor).toBe('#34A853');
    });

    it('should use default color for edges in organizational view', () => {
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
          ]
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.edges[0].style.stroke).toBe('#666666');
      expect(result.nodes[0].data.borderColor).toBe('#4285F4');
    });

    it('should use dotted lines for dotted-line view', () => {
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
          ]
        }
      ];

      const result = processUserData(users, 'dotted-line');
      expect(result.edges[0].style.strokeDasharray).toBe('5,5');
    });

    it('should count total descendants recursively', () => {
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
              department: 'Executive'
            }
          ]
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
              department: 'IT'
            }
          ]
        }
      ];

      const result = processUserData(users, 'organizational');
      const ceoNode = result.nodes.find(n => n.id === '1');
      const managerNode = result.nodes.find(n => n.id === '2');
      const employeeNode = result.nodes.find(n => n.id === '3');
      
      expect(ceoNode?.data.totalDescendantsCount).toBe(2); // Manager + Employee
      expect(managerNode?.data.totalDescendantsCount).toBe(1); // Employee
      expect(employeeNode?.data.totalDescendantsCount).toBe(0); // No reports
    });

    it('should handle users with no descendants', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Developer',
          department: 'IT'
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes[0].data.totalDescendantsCount).toBe(0);
    });

    it('should handle multiple direct reports', () => {
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
          ]
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
              department: 'IT'
            }
          ]
        }
      ];

      const result = processUserData(users, 'organizational');
      const managerNode = result.nodes.find(n => n.id === '1');
      expect(managerNode?.data.totalDescendantsCount).toBe(2);
    });

    it('should not process duplicate users', () => {
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
          ]
        }
      ];

      const result = processUserData(users, 'organizational');
      const managerNodes = result.nodes.filter(n => n.id === '1');
      expect(managerNodes).toHaveLength(1);
    });

    it('should handle users with multiple reporting managers', () => {
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
          firstName: 'Manager',
          lastName: 'Two',
          fullName: 'Manager Two',
          role: 'Manager',
          department: 'HR'
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
            },
            {
              id: 2,
              firstName: 'Manager',
              lastName: 'Two',
              fullName: 'Manager Two',
              role: 'Manager',
              department: 'HR'
            }
          ]
        }
      ];

      const result = processUserData(users, 'organizational');
      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);
    });

    it('should handle default viewType parameter', () => {
      const users: UserData[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'Developer',
          department: 'IT'
        }
      ];

      const result = processUserData(users);
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].data.borderColor).toBe('#4285F4');
    });

    it('should create correct edge properties', () => {
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
          ]
        }
      ];

      const result = processUserData(users, 'organizational');
      const edge = result.edges[0];
      
      expect(edge.id).toBe('1-2');
      expect(edge.source).toBe('1');
      expect(edge.target).toBe('2');
      expect(edge.type).toBe('step');
      expect(edge.style.strokeWidth).toBe(1);
      expect(edge.markerEnd).toBeDefined();
      expect(edge.markerEnd.type).toBe('arrow');
    });

    it('should handle empty reportingManager array', () => {
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
  });

  describe('getLayoutedUserElements', () => {
    it('should return empty nodes and edges for empty input', () => {
      const result = getLayoutedUserElements([], [], 'LR');
      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it('should apply layout to nodes', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'user',
          position: { x: 0, y: 0 },
          data: {
            label: 'User 1',
            fullName: 'User 1',
            designation: 'Dev',
            department: 'IT'
          }
        }
      ];

      const edges: ProcessedEdge[] = [];

      const result = getLayoutedUserElements(nodes, edges, 'LR');
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].position.x).not.toBe(0);
      expect(result.edges).toEqual(edges);
    });

    it('should handle TB direction', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'user',
          position: { x: 0, y: 0 },
          data: {
            label: 'User 1',
            fullName: 'User 1',
            designation: 'Dev',
            department: 'IT'
          }
        }
      ];

      const result = getLayoutedUserElements(nodes, [], 'TB');
      expect(result.nodes).toHaveLength(1);
    });

    it('should handle default LR direction', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'user',
          position: { x: 0, y: 0 },
          data: {
            label: 'User 1',
            fullName: 'User 1',
            designation: 'Dev',
            department: 'IT'
          }
        }
      ];

      const result = getLayoutedUserElements(nodes, []);
      expect(result.nodes).toHaveLength(1);
    });

    it('should preserve edges when applying layout', () => {
      const nodes: ProcessedNode[] = [
        {
          id: '1',
          type: 'user',
          position: { x: 0, y: 0 },
          data: {
            label: 'User 1',
            fullName: 'User 1',
            designation: 'Dev',
            department: 'IT'
          }
        },
        {
          id: '2',
          type: 'user',
          position: { x: 0, y: 0 },
          data: {
            label: 'User 2',
            fullName: 'User 2',
            designation: 'Dev',
            department: 'IT'
          }
        }
      ];

      const edges: ProcessedEdge[] = [
        {
          id: '1-2',
          source: '1',
          target: '2',
          type: 'step'
        }
      ];

      const result = getLayoutedUserElements(nodes, edges, 'LR');
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toEqual(edges[0]);
    });
  });
});

