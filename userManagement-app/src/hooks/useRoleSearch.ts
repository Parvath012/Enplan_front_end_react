import { useState, useMemo } from 'react';

interface UseRoleSearchReturn {
  searchTerm: string;
  isSearchActive: boolean;
  filteredRoles: any[];
  handleSearchClick: () => void;
  handleSearchChange: (value: string) => void;
  handleSearchClose: () => void;
}

/**
 * Custom hook for handling role search and filtering
 */
export const useRoleSearch = (roles: any[], showOnlyActive: boolean = false): UseRoleSearchReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Filter roles based on search term and showOnlyActive state
  const filteredRoles = useMemo(() => {
    // Create a copy of the array to avoid mutating the read-only Redux state
    let filtered = [...roles];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(role => {
        const roleName = (role.rolename || '').toLowerCase();
        const department = (role.department || '').toLowerCase();
        const description = (role.roledescription || '').toLowerCase();
        return roleName.includes(searchLower) || 
               department.includes(searchLower) || 
               description.includes(searchLower);
      });
    }
    
    // Apply active-only filter
    if (showOnlyActive) {
      filtered = filtered.filter(role => role.isenabled && role.status === 'Active');
    }
    
    // Sort data: Active roles first, then by rolename
    // Create a new sorted array instead of mutating the existing one
    const sorted = [...filtered].sort((a, b) => {
      // First sort by status (Active before Inactive)
      const aActive = a.isenabled && a.status === 'Active';
      const bActive = b.isenabled && b.status === 'Active';
      if (aActive !== bActive) {
        return aActive ? -1 : 1;
      }
      // Then sort by rolename
      const aName = (a.rolename || '').toLowerCase();
      const bName = (b.rolename || '').toLowerCase();
      return aName.localeCompare(bName);
    });
    
    return sorted;
  }, [roles, searchTerm, showOnlyActive]);

  const handleSearchClick = () => {
    setIsSearchActive(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchTerm('');
  };

  return {
    searchTerm,
    isSearchActive,
    filteredRoles,
    handleSearchClick,
    handleSearchChange,
    handleSearchClose
  };
};

