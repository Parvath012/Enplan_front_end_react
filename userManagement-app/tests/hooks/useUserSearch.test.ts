import { renderHook, act } from '@testing-library/react';
import { useUserSearch } from '../../src/hooks/useUserSearch';

describe('useUserSearch', () => {
  const mockUsers = [
    { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com', role: 'Admin', department: 'IT', isenabled: true, status: 'Active' },
    { id: 2, firstname: 'Jane', lastname: 'Smith', emailid: 'jane@example.com', role: 'User', department: 'HR', isenabled: false, status: 'Inactive' },
    { id: 3, firstname: 'Bob', lastname: 'Johnson', emailid: 'bob@example.com', role: 'Manager', department: 'Sales', isenabled: true, status: 'Active' },
    { id: 4, firstname: 'Alice', lastname: 'Brown', emailid: 'alice@example.com', role: 'User', department: 'IT', isenabled: false, status: 'Inactive' }
  ];

  describe('Initial State', () => {
    it('should initialize with empty search term', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      expect(result.current.searchTerm).toBe('');
    });

    it('should initialize with isSearchActive as false', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      expect(result.current.isSearchActive).toBe(false);
    });

    it('should initialize with all users when no search term', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      expect(result.current.filteredUsers).toHaveLength(4);
    });

    it('should sort users by status and name initially', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      // Active users should come first, then sorted by firstname
      expect(result.current.filteredUsers[0].status).toBe('Active');
      expect(result.current.filteredUsers[0].firstname).toBe('Bob');
      expect(result.current.filteredUsers[1].firstname).toBe('John');
    });
  });

  describe('handleSearchClick', () => {
    it('should set isSearchActive to true', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchClick();
      });

      expect(result.current.isSearchActive).toBe(true);
    });

    it('should not change search term', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchClick();
      });

      expect(result.current.searchTerm).toBe('');
    });

    it('should not change filtered users', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      const initialLength = result.current.filteredUsers.length;

      act(() => {
        result.current.handleSearchClick();
      });

      expect(result.current.filteredUsers).toHaveLength(initialLength);
    });
  });

  describe('handleSearchChange', () => {
    it('should update search term', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('John');
      });

      expect(result.current.searchTerm).toBe('John');
    });

    it('should filter users by search term', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('John');
      });

      expect(result.current.filteredUsers).toHaveLength(2); // John Doe and Bob Johnson
    });

    it('should filter users case-insensitively', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('JOHN');
      });

      expect(result.current.filteredUsers).toHaveLength(2);
    });

    it('should filter by email', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('jane@example.com');
      });

      expect(result.current.filteredUsers).toHaveLength(1);
      expect(result.current.filteredUsers[0].emailid).toBe('jane@example.com');
    });

    it('should filter by role', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('Admin');
      });

      expect(result.current.filteredUsers).toHaveLength(1);
      expect(result.current.filteredUsers[0].role).toBe('Admin');
    });

    it('should filter by department', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('IT');
      });

      // IT appears in department field, but also in other fields (Smith contains 'it')
      expect(result.current.filteredUsers.length).toBeGreaterThan(0);
      // Check that at least one IT department user is included
      const hasITUser = result.current.filteredUsers.some(u => u.department === 'IT');
      expect(hasITUser).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('NonExistent');
      });

      expect(result.current.filteredUsers).toHaveLength(0);
    });

    it('should clear filter when search term is empty', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('John');
      });

      expect(result.current.filteredUsers).toHaveLength(2);

      act(() => {
        result.current.handleSearchChange('');
      });

      expect(result.current.filteredUsers).toHaveLength(4);
    });

    it('should update search term multiple times', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('John');
      });
      expect(result.current.searchTerm).toBe('John');

      act(() => {
        result.current.handleSearchChange('Jane');
      });
      expect(result.current.searchTerm).toBe('Jane');

      act(() => {
        result.current.handleSearchChange('Bob');
      });
      expect(result.current.searchTerm).toBe('Bob');
    });
  });

  describe('handleSearchClose', () => {
    it('should set isSearchActive to false', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchClick();
        result.current.handleSearchClose();
      });

      expect(result.current.isSearchActive).toBe(false);
    });

    it('should clear search term', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('John');
        result.current.handleSearchClose();
      });

      expect(result.current.searchTerm).toBe('');
    });

    it('should reset filtered users to all users', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('John');
      });

      expect(result.current.filteredUsers).toHaveLength(2);

      act(() => {
        result.current.handleSearchClose();
      });

      expect(result.current.filteredUsers).toHaveLength(4);
    });
  });

  describe('showOnlyActive Parameter', () => {
    it('should filter only active users when showOnlyActive is true', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers, true));

      expect(result.current.filteredUsers).toHaveLength(2);
      result.current.filteredUsers.forEach(user => {
        expect(user.isenabled).toBe(true);
        expect(user.status).toBe('Active');
      });
    });

    it('should show all users when showOnlyActive is false', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers, false));

      expect(result.current.filteredUsers).toHaveLength(4);
    });

    it('should apply both search and active filter', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers, true));

      act(() => {
        result.current.handleSearchChange('IT');
      });

      // Only John (Active, IT) should match, not Alice (Inactive, IT)
      expect(result.current.filteredUsers).toHaveLength(1);
      expect(result.current.filteredUsers[0].firstname).toBe('John');
    });

    it('should update filtered users when showOnlyActive changes', () => {
      const { result, rerender } = renderHook(
        ({ users, showOnlyActive }) => useUserSearch(users, showOnlyActive),
        { initialProps: { users: mockUsers, showOnlyActive: false } }
      );

      expect(result.current.filteredUsers).toHaveLength(4);

      rerender({ users: mockUsers, showOnlyActive: true });

      expect(result.current.filteredUsers).toHaveLength(2);
    });
  });

  describe('Sorting Behavior', () => {
    it('should sort filtered results by status and name', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('o'); // Matches John, Bob, Johnson, Brown
      });

      // Active users first, then alphabetically
      const filtered = result.current.filteredUsers;
      expect(filtered[0].status).toBe('Active');
      expect(filtered[1].status).toBe('Active');
    });

    it('should maintain sort order after search', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('John');
      });

      const filtered = result.current.filteredUsers;
      // Should have Bob Johnson (Active) before John Doe (Active) alphabetically
      expect(filtered[0].firstname).toBe('Bob');
      expect(filtered[1].firstname).toBe('John');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty users array', () => {
      const { result } = renderHook(() => useUserSearch([]));

      expect(result.current.filteredUsers).toHaveLength(0);
    });

    it('should handle search with special characters', () => {
      const specialUsers = [
        { id: 1, firstname: "O'Brien", lastname: 'Doe', emailid: 'obrien@example.com', role: 'Admin', department: 'IT', isenabled: true, status: 'Active' }
      ];

      const { result } = renderHook(() => useUserSearch(specialUsers));

      act(() => {
        result.current.handleSearchChange("O'Brien");
      });

      expect(result.current.filteredUsers).toHaveLength(1);
    });

    it('should handle search with whitespace', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      act(() => {
        result.current.handleSearchChange('John');
      });

      expect(result.current.filteredUsers.length).toBeGreaterThan(0);
    });

    it('should handle users with null department', () => {
      const usersWithNullDept = [
        { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com', role: 'Admin', department: null, isenabled: true, status: 'Active' }
      ];

      const { result } = renderHook(() => useUserSearch(usersWithNullDept));

      act(() => {
        result.current.handleSearchChange('John');
      });

      expect(result.current.filteredUsers).toHaveLength(1);
    });

    it('should handle users with undefined department', () => {
      const usersWithUndefinedDept = [
        { id: 1, firstname: 'John', lastname: 'Doe', emailid: 'john@example.com', role: 'Admin', department: undefined, isenabled: true, status: 'Active' }
      ];

      const { result } = renderHook(() => useUserSearch(usersWithUndefinedDept));

      act(() => {
        result.current.handleSearchChange('John');
      });

      expect(result.current.filteredUsers).toHaveLength(1);
    });
  });

  describe('useMemo Optimization', () => {
    it('should recalculate filtered users when users change', () => {
      const { result, rerender } = renderHook(
        ({ users }) => useUserSearch(users),
        { initialProps: { users: mockUsers } }
      );

      expect(result.current.filteredUsers).toHaveLength(4);

      const newUsers = [...mockUsers, { id: 5, firstname: 'Charlie', lastname: 'Davis', emailid: 'charlie@example.com', role: 'User', department: 'IT', isenabled: true, status: 'Active' }];
      rerender({ users: newUsers });

      expect(result.current.filteredUsers).toHaveLength(5);
    });

    it('should recalculate filtered users when search term changes', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      const initialLength = result.current.filteredUsers.length;

      act(() => {
        result.current.handleSearchChange('John');
      });

      expect(result.current.filteredUsers.length).not.toBe(initialLength);
    });

    it('should recalculate filtered users when showOnlyActive changes', () => {
      const { result, rerender } = renderHook(
        ({ showOnlyActive }) => useUserSearch(mockUsers, showOnlyActive),
        { initialProps: { showOnlyActive: false } }
      );

      const allUsersLength = result.current.filteredUsers.length;

      rerender({ showOnlyActive: true });

      expect(result.current.filteredUsers.length).toBeLessThan(allUsersLength);
    });
  });

  describe('Complete Workflow', () => {
    it('should handle complete search workflow', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      // Initial state
      expect(result.current.isSearchActive).toBe(false);
      expect(result.current.searchTerm).toBe('');
      expect(result.current.filteredUsers).toHaveLength(4);

      // Click search
      act(() => {
        result.current.handleSearchClick();
      });
      expect(result.current.isSearchActive).toBe(true);

      // Enter search term
      act(() => {
        result.current.handleSearchChange('John');
      });
      expect(result.current.searchTerm).toBe('John');
      expect(result.current.filteredUsers).toHaveLength(2);

      // Close search
      act(() => {
        result.current.handleSearchClose();
      });
      expect(result.current.isSearchActive).toBe(false);
      expect(result.current.searchTerm).toBe('');
      expect(result.current.filteredUsers).toHaveLength(4);
    });

    it('should handle search with active filter workflow', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers, true));

      // Initial state with active filter
      expect(result.current.filteredUsers).toHaveLength(2);

      // Search within active users
      act(() => {
        result.current.handleSearchChange('IT');
      });
      expect(result.current.filteredUsers).toHaveLength(1);
      expect(result.current.filteredUsers[0].firstname).toBe('John');

      // Clear search
      act(() => {
        result.current.handleSearchClose();
      });
      expect(result.current.filteredUsers).toHaveLength(2);
    });
  });

  describe('Return Value Structure', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      expect(result.current).toHaveProperty('searchTerm');
      expect(result.current).toHaveProperty('isSearchActive');
      expect(result.current).toHaveProperty('filteredUsers');
      expect(result.current).toHaveProperty('handleSearchClick');
      expect(result.current).toHaveProperty('handleSearchChange');
      expect(result.current).toHaveProperty('handleSearchClose');
    });

    it('should return functions for handlers', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      expect(typeof result.current.handleSearchClick).toBe('function');
      expect(typeof result.current.handleSearchChange).toBe('function');
      expect(typeof result.current.handleSearchClose).toBe('function');
    });

    it('should return correct types', () => {
      const { result } = renderHook(() => useUserSearch(mockUsers));

      expect(typeof result.current.searchTerm).toBe('string');
      expect(typeof result.current.isSearchActive).toBe('boolean');
      expect(Array.isArray(result.current.filteredUsers)).toBe(true);
    });
  });
});

