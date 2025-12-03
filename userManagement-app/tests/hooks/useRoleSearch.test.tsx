import { renderHook, act } from '@testing-library/react';
import { useRoleSearch } from '../../src/hooks/useRoleSearch';

describe('useRoleSearch', () => {
  const mockRoles = [
    {
      id: 1,
      rolename: 'Admin',
      department: 'IT',
      roledescription: 'Administrator role',
      isenabled: true,
      status: 'Active',
    },
    {
      id: 2,
      rolename: 'Manager',
      department: 'HR',
      roledescription: 'Manager role',
      isenabled: true,
      status: 'Active',
    },
    {
      id: 3,
      rolename: 'User',
      department: 'Sales',
      roledescription: 'Regular user role',
      isenabled: false,
      status: 'Inactive',
    },
  ];

  describe('Initial State', () => {
    it('should initialize with empty search term', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      expect(result.current.searchTerm).toBe('');
    });

    it('should initialize with search inactive', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      expect(result.current.isSearchActive).toBe(false);
    });

    it('should return all roles when no search term', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      expect(result.current.filteredRoles).toHaveLength(3);
    });
  });

  describe('Search Functionality', () => {
    it('should filter roles by role name', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchChange('Admin');
      });
      
      expect(result.current.filteredRoles).toHaveLength(1);
      expect(result.current.filteredRoles[0].rolename).toBe('Admin');
    });

    it('should filter roles by department', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchChange('IT');
      });
      
      expect(result.current.filteredRoles).toHaveLength(1);
      expect(result.current.filteredRoles[0].department).toBe('IT');
    });

    it('should filter roles by description', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchChange('Administrator');
      });
      
      expect(result.current.filteredRoles).toHaveLength(1);
      expect(result.current.filteredRoles[0].roledescription).toBe('Administrator role');
    });

    it('should be case-insensitive', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchChange('admin');
      });
      
      expect(result.current.filteredRoles).toHaveLength(1);
      expect(result.current.filteredRoles[0].rolename).toBe('Admin');
    });

    it('should return empty array when no matches', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchChange('NonExistent');
      });
      
      expect(result.current.filteredRoles).toHaveLength(0);
    });

    it('should handle partial matches', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchChange('Man');
      });
      
      expect(result.current.filteredRoles.length).toBeGreaterThan(0);
    });

    it('should handle empty search term', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchChange('Admin');
      });
      
      act(() => {
        result.current.handleSearchChange('');
      });
      
      expect(result.current.filteredRoles).toHaveLength(3);
    });

    it('should handle whitespace-only search term', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchChange('   ');
      });
      
      expect(result.current.filteredRoles).toHaveLength(3);
    });
  });

  describe('Active Only Filter', () => {
    it('should filter only active roles when showOnlyActive is true', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles, true));
      
      expect(result.current.filteredRoles).toHaveLength(2);
      expect(result.current.filteredRoles.every(role => 
        role.isenabled && role.status === 'Active'
      )).toBe(true);
    });

    it('should show all roles when showOnlyActive is false', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles, false));
      
      expect(result.current.filteredRoles).toHaveLength(3);
    });

    it('should combine search and active filter', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles, true));
      
      act(() => {
        result.current.handleSearchChange('Admin');
      });
      
      expect(result.current.filteredRoles).toHaveLength(1);
      expect(result.current.filteredRoles[0].rolename).toBe('Admin');
      expect(result.current.filteredRoles[0].isenabled).toBe(true);
      expect(result.current.filteredRoles[0].status).toBe('Active');
    });
  });

  describe('Sorting', () => {
    it('should sort active roles before inactive', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      const sorted = result.current.filteredRoles;
      const activeIndex = sorted.findIndex(r => r.rolename === 'Admin');
      const inactiveIndex = sorted.findIndex(r => r.rolename === 'User');
      
      expect(activeIndex).toBeLessThan(inactiveIndex);
    });

    it('should sort by role name within same status', () => {
      const roles = [
        { id: 1, rolename: 'Zebra', isenabled: true, status: 'Active' },
        { id: 2, rolename: 'Alpha', isenabled: true, status: 'Active' },
        { id: 3, rolename: 'Beta', isenabled: true, status: 'Active' },
      ];
      
      const { result } = renderHook(() => useRoleSearch(roles));
      
      const sorted = result.current.filteredRoles;
      expect(sorted[0].rolename).toBe('Alpha');
      expect(sorted[1].rolename).toBe('Beta');
      expect(sorted[2].rolename).toBe('Zebra');
    });

    it('should handle roles with missing rolename', () => {
      const roles = [
        { id: 1, rolename: 'Admin', isenabled: true, status: 'Active' },
        { id: 2, rolename: undefined, isenabled: true, status: 'Active' },
        { id: 3, rolename: null, isenabled: true, status: 'Active' },
      ];
      
      const { result } = renderHook(() => useRoleSearch(roles));
      
      expect(result.current.filteredRoles).toHaveLength(3);
    });
  });

  describe('Search State Management', () => {
    it('should activate search when handleSearchClick is called', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchClick();
      });
      
      expect(result.current.isSearchActive).toBe(true);
    });

    it('should deactivate search and clear term when handleSearchClose is called', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchClick();
        result.current.handleSearchChange('Admin');
      });
      
      expect(result.current.isSearchActive).toBe(true);
      expect(result.current.searchTerm).toBe('Admin');
      
      act(() => {
        result.current.handleSearchClose();
      });
      
      expect(result.current.isSearchActive).toBe(false);
      expect(result.current.searchTerm).toBe('');
    });

    it('should update search term when handleSearchChange is called', () => {
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchChange('Test');
      });
      
      expect(result.current.searchTerm).toBe('Test');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty roles array', () => {
      const { result } = renderHook(() => useRoleSearch([]));
      
      expect(result.current.filteredRoles).toHaveLength(0);
    });

    it('should handle roles with missing fields', () => {
      const roles = [
        { id: 1, rolename: 'Admin' },
        { id: 2, department: 'IT' },
        { id: 3, roledescription: 'Description' },
      ];
      
      const { result } = renderHook(() => useRoleSearch(roles));
      
      expect(result.current.filteredRoles).toHaveLength(3);
    });

    it('should handle null/undefined role values', () => {
      const roles = [
        { id: 1, rolename: null, department: undefined, roledescription: null },
      ];
      
      const { result } = renderHook(() => useRoleSearch(roles));
      
      expect(result.current.filteredRoles).toHaveLength(1);
    });

    it('should handle special characters in search', () => {
      const roles = [
        { id: 1, rolename: 'Admin & Manager', isenabled: true, status: 'Active' },
      ];
      
      const { result } = renderHook(() => useRoleSearch(roles));
      
      act(() => {
        result.current.handleSearchChange('&');
      });
      
      expect(result.current.filteredRoles).toHaveLength(1);
    });

    it('should not mutate original roles array', () => {
      const originalRoles = [...mockRoles];
      const { result } = renderHook(() => useRoleSearch(mockRoles));
      
      act(() => {
        result.current.handleSearchChange('Admin');
      });
      
      expect(mockRoles).toEqual(originalRoles);
    });
  });
});


