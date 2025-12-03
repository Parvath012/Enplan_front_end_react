import { useState, useMemo } from 'react';
import { 
  sortUsersByStatusAndName, 
  filterUsersBySearchTerm, 
  filterActiveUsers 
} from '../utils/userSortingUtils';

interface UseUserSearchReturn {
  searchTerm: string;
  isSearchActive: boolean;
  filteredUsers: any[];
  handleSearchClick: () => void;
  handleSearchChange: (value: string) => void;
  handleSearchClose: () => void;
}

/**
 * Custom hook for handling user search and filtering
 */
export const useUserSearch = (users: any[], showOnlyActive: boolean = false): UseUserSearchReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Filter users based on search term and showOnlyActive state
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Apply search filter
    filtered = filterUsersBySearchTerm(filtered, searchTerm);
    
    // Apply active-only filter
    if (showOnlyActive) {
      filtered = filterActiveUsers(filtered);
    }
    
    // Sort data: Active users first, then by firstname (matching backend ordering)
    const sorted = sortUsersByStatusAndName(filtered);
    
    return sorted;
  }, [users, searchTerm, showOnlyActive]);

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
    filteredUsers,
    handleSearchClick,
    handleSearchChange,
    handleSearchClose
  };
};

