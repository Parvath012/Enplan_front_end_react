import { useState, useCallback, useEffect } from 'react';
import { EntityModel } from '../services/entitySetupService';

export const useEntitySearch = (entities: EntityModel[]) => {
  const [filteredEntities, setFilteredEntities] = useState<EntityModel[]>(entities);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  // Filter entities based on search query
  const filterEntities = useCallback((query: string = '') => {
    if (!query.trim()) {
      setFilteredEntities(entities);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = entities.filter((entity) => {
      const address = [entity.addressLine1, entity.addressLine2, entity.country, entity.state, entity.city, entity.pinZipCode]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return (
        (entity.legalBusinessName || '').toLowerCase().includes(searchTerm) ||
        (entity.displayName || '').toLowerCase().includes(searchTerm) ||
        (entity.entityType || '').toLowerCase().includes(searchTerm) ||
        address.includes(searchTerm)
      );
    });

    setFilteredEntities(filtered);
  }, [entities]);

  // Update filtered entities when entities array changes
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredEntities(entities);
    } else {
      // Re-apply the current search filter to the updated entities
      filterEntities(searchValue);
    }
  }, [entities, searchValue, filterEntities]);

  // Handle search icon click
  const handleSearchClick = useCallback(() => {
    setIsSearchActive(true);
    setSearchValue('');
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    filterEntities(value);
  }, [filterEntities]);

  // Handle search close
  const handleSearchClose = useCallback(() => {
    setIsSearchActive(false);
    setSearchValue('');
    filterEntities('');
  }, [filterEntities]);

  return {
    filteredEntities,
    isSearchActive,
    searchValue,
    filterEntities,
    handleSearchClick,
    handleSearchChange,
    handleSearchClose
  };
};
