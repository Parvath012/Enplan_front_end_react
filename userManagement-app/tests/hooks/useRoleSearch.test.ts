import { renderHook, act } from '@testing-library/react';
import { useRoleSearch } from '../../src/hooks/useRoleSearch';

const mockRoles = [
  {
    id: 1,
    rolename: 'Admin',
    department: 'IT',
    roledescription: 'Administrator role',
    isenabled: true,
    status: 'Active'
  },
  {
    id: 2,
    rolename: 'User',
    department: 'HR',
    roledescription: 'Regular user role',
    isenabled: true,
    status: 'Active'
  },
  {
    id: 3,
    rolename: 'Manager',
    department: 'Sales',
    roledescription: 'Manager role',
    isenabled: false,
    status: 'Inactive'
  }
];

describe('useRoleSearch', () => {
  it('should initialize with empty search term', () => {
    const { result } = renderHook(() => useRoleSearch(mockRoles));
    
    expect(result.current.searchTerm).toBe('');
    expect(result.current.isSearchActive).toBe(false);
    expect(result.current.filteredRoles).toHaveLength(3);
  });

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
    expect(result.current.filteredRoles[0].rolename).toBe('Admin');
  });

  it('should be case-insensitive', () => {
    const { result } = renderHook(() => useRoleSearch(mockRoles));
    
    act(() => {
      result.current.handleSearchChange('admin');
    });
    
    expect(result.current.filteredRoles).toHaveLength(1);
  });

  it('should activate search when handleSearchClick is called', () => {
    const { result } = renderHook(() => useRoleSearch(mockRoles));
    
    act(() => {
      result.current.handleSearchClick();
    });
    
    expect(result.current.isSearchActive).toBe(true);
  });

  it('should close search and clear term when handleSearchClose is called', () => {
    const { result } = renderHook(() => useRoleSearch(mockRoles));
    
    act(() => {
      result.current.handleSearchChange('Admin');
      result.current.handleSearchClick();
    });
    
    expect(result.current.isSearchActive).toBe(true);
    expect(result.current.searchTerm).toBe('Admin');
    
    act(() => {
      result.current.handleSearchClose();
    });
    
    expect(result.current.isSearchActive).toBe(false);
    expect(result.current.searchTerm).toBe('');
  });

  it('should filter to show only active roles when showOnlyActive is true', () => {
    const { result } = renderHook(() => useRoleSearch(mockRoles, true));
    
    expect(result.current.filteredRoles).toHaveLength(2);
    expect(result.current.filteredRoles.every(role => role.isenabled && role.status === 'Active')).toBe(true);
  });

  it('should sort roles: active first, then by name', () => {
    const { result } = renderHook(() => useRoleSearch(mockRoles));
    
    expect(result.current.filteredRoles[0].rolename).toBe('Admin');
    expect(result.current.filteredRoles[1].rolename).toBe('User');
    expect(result.current.filteredRoles[2].rolename).toBe('Manager');
  });

  it('should return empty array when no roles match search', () => {
    const { result } = renderHook(() => useRoleSearch(mockRoles));
    
    act(() => {
      result.current.handleSearchChange('NonExistent');
    });
    
    expect(result.current.filteredRoles).toHaveLength(0);
  });
});



