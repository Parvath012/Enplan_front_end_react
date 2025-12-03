import { renderHook, act } from '@testing-library/react';
import { useEntitySearch } from '../../src/hooks/useEntitySearch';
import { EntityModel } from '../../src/services/entitySetupService';

describe('useEntitySearch', () => {
  // Sample entity data for testing
  const mockEntities: EntityModel[] = [
    {
      id: '1',
      legalBusinessName: 'ABC Corporation',
      displayName: 'ABC Corp',
      entityType: 'Corporate',
      addressLine1: '123 Main Street',
      addressLine2: 'Suite 100',
      country: 'United States',
      state: 'California',
      city: 'San Francisco',
      pinZipCode: '94105',
      isDeleted: false,
      isEnabled: true,
      isConfigured: true,
      softDeleted: false
    },
    {
      id: '2',
      legalBusinessName: 'XYZ Industries',
      displayName: 'XYZ Inc',
      entityType: 'Partnership',
      addressLine1: '456 Market Ave',
      addressLine2: 'Floor 12',
      country: 'Canada',
      state: 'Ontario',
      city: 'Toronto',
      pinZipCode: 'M5V 2H1',
      isDeleted: false,
      isEnabled: true,
      isConfigured: true,
      softDeleted: false
    },
    {
      id: '3',
      legalBusinessName: 'Global Solutions',
      displayName: 'GS Tech',
      entityType: 'LLC',
      addressLine1: '789 Tech Park',
      addressLine2: 'Building B',
      country: 'United Kingdom',
      state: 'England',
      city: 'London',
      pinZipCode: 'SW1A 1AA',
      isDeleted: false,
      isEnabled: true,
      isConfigured: true,
      softDeleted: false
    }
  ];

  it('should initialize with all entities', () => {
    // Act
    const { result } = renderHook(() => useEntitySearch(mockEntities));
    
    // Assert
    expect(result.current.filteredEntities).toEqual(mockEntities);
    expect(result.current.isSearchActive).toBe(false);
    expect(result.current.searchValue).toBe('');
  });

  it('should activate search when handleSearchClick is called', () => {
    // Arrange
    const { result } = renderHook(() => useEntitySearch(mockEntities));
    
    // Act
    act(() => {
      result.current.handleSearchClick();
    });
    
    // Assert
    expect(result.current.isSearchActive).toBe(true);
    expect(result.current.searchValue).toBe('');
    expect(result.current.filteredEntities).toEqual(mockEntities);
  });

  it('should filter entities by legal business name', () => {
    // Arrange
    const { result } = renderHook(() => useEntitySearch(mockEntities));
    
    // Act
    act(() => {
      result.current.handleSearchChange('abc');
    });
    
    // Assert
    expect(result.current.searchValue).toBe('abc');
    expect(result.current.filteredEntities).toHaveLength(1);
    expect(result.current.filteredEntities[0].legalBusinessName).toBe('ABC Corporation');
  });

  it('should filter entities by display name', () => {
    // Arrange
    const { result } = renderHook(() => useEntitySearch(mockEntities));
    
    // Act
    act(() => {
      result.current.handleSearchChange('xyz');
    });
    
    // Assert
    expect(result.current.searchValue).toBe('xyz');
    expect(result.current.filteredEntities).toHaveLength(1);
    expect(result.current.filteredEntities[0].displayName).toBe('XYZ Inc');
  });

  it('should filter entities by entity type', () => {
    // Arrange
    const { result } = renderHook(() => useEntitySearch(mockEntities));
    
    // Act
    act(() => {
      result.current.handleSearchChange('llc');
    });
    
    // Assert
    expect(result.current.filteredEntities).toHaveLength(1);
    expect(result.current.filteredEntities[0].entityType).toBe('LLC');
  });

  it('should filter entities by address', () => {
    // Arrange
    const { result } = renderHook(() => useEntitySearch(mockEntities));
    
    // Act
    act(() => {
      result.current.handleSearchChange('tech park');
    });
    
    // Assert
    expect(result.current.filteredEntities).toHaveLength(1);
    expect(result.current.filteredEntities[0].addressLine1).toBe('789 Tech Park');
  });

  it('should filter entities by country', () => {
    // Arrange
    const { result } = renderHook(() => useEntitySearch(mockEntities));
    
    // Act
    act(() => {
      result.current.handleSearchChange('united');
    });
    
    // Assert
    expect(result.current.filteredEntities).toHaveLength(2);
    expect(result.current.filteredEntities[0].country).toBe('United States');
    expect(result.current.filteredEntities[1].country).toBe('United Kingdom');
  });

  it('should return all entities when search is empty', () => {
    // Arrange
    const { result } = renderHook(() => useEntitySearch(mockEntities));
    
    // Act - first filter, then clear
    act(() => {
      result.current.handleSearchChange('abc');
    });
    expect(result.current.filteredEntities).toHaveLength(1);
    
    act(() => {
      result.current.handleSearchChange('');
    });
    
    // Assert
    expect(result.current.filteredEntities).toHaveLength(3);
    expect(result.current.filteredEntities).toEqual(mockEntities);
  });

  it('should reset search when handleSearchClose is called', () => {
    // Arrange
    const { result } = renderHook(() => useEntitySearch(mockEntities));
    
    // Act - first search, then close
    act(() => {
      result.current.handleSearchClick();
      result.current.handleSearchChange('abc');
    });
    expect(result.current.isSearchActive).toBe(true);
    expect(result.current.searchValue).toBe('abc');
    expect(result.current.filteredEntities).toHaveLength(1);
    
    act(() => {
      result.current.handleSearchClose();
    });
    
    // Assert
    expect(result.current.isSearchActive).toBe(false);
    expect(result.current.searchValue).toBe('');
    expect(result.current.filteredEntities).toHaveLength(3);
    expect(result.current.filteredEntities).toEqual(mockEntities);
  });

  it('should update filtered entities when source entities change', () => {
    // Arrange
    const initialEntities = mockEntities.slice(0, 2);
    const { result, rerender } = renderHook(
      (props) => useEntitySearch(props.entities), 
      { initialProps: { entities: initialEntities } }
    );
    
    // Initial state
    expect(result.current.filteredEntities).toHaveLength(2);
    
    // Act - change entities
    rerender({ entities: mockEntities });
    
    // Assert
    expect(result.current.filteredEntities).toHaveLength(3);
    expect(result.current.filteredEntities).toEqual(mockEntities);
  });

  it('should maintain search filter when source entities change', () => {
    // Arrange
    const initialEntities = mockEntities.slice(0, 2);
    const { result, rerender } = renderHook(
      (props) => useEntitySearch(props.entities), 
      { initialProps: { entities: initialEntities } }
    );
    
    // Apply a search filter
    act(() => {
      result.current.handleSearchChange('united');
    });
    expect(result.current.filteredEntities).toHaveLength(1); // Only USA in initial entities
    
    // Act - change entities to include UK as well
    rerender({ entities: mockEntities });
    
    // Assert - should now have both USA and UK entities
    expect(result.current.filteredEntities).toHaveLength(2);
    expect(result.current.filteredEntities.map(e => e.country)).toContain('United States');
    expect(result.current.filteredEntities.map(e => e.country)).toContain('United Kingdom');
  });

  it('should handle case insensitive search', () => {
    // Arrange
    const { result } = renderHook(() => useEntitySearch(mockEntities));
    
    // Act
    act(() => {
      result.current.handleSearchChange('GLOBAL');
    });
    
    // Assert
    expect(result.current.filteredEntities).toHaveLength(1);
    expect(result.current.filteredEntities[0].legalBusinessName).toBe('Global Solutions');
  });

  it('should handle partial word matches', () => {
    // Arrange
    const { result } = renderHook(() => useEntitySearch(mockEntities));
    
    // Act
    act(() => {
      result.current.handleSearchChange('corp');
    });
    
    // Assert
    expect(result.current.filteredEntities).toHaveLength(1);
    expect(result.current.filteredEntities[0].legalBusinessName).toBe('ABC Corporation');
  });
});
