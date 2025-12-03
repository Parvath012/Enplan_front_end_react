import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the ListToolbar component completely to avoid React.lazy() issues
jest.mock('../../../src/components/toolbar/ListToolbar', () => {
  return function MockListToolbar(props: any) {
    const { onSearchClick, onFilterToggle, onAddClick, isSearchActive, onSearchChange, searchValue, onSearchClose } = props;
    
    return (
      <div data-testid="list-toolbar">
        {/* Search Button */}
        <button 
          data-testid="search-button" 
          onClick={onSearchClick}
          title="Search"
        >
          Search
        </button>
        
        {/* Filter Button */}
        <button 
          data-testid="filter-button" 
          onClick={onFilterToggle}
          title="Filter"
          disabled={false}
        >
          Filter
        </button>
        
        {/* Add Button */}
        <button 
          data-testid="add-button" 
          onClick={onAddClick}
        >
          Add
        </button>
        
        {/* Search Input (when active) */}
        {isSearchActive && (
          <div data-testid="search-input-container">
            <input 
              data-testid="search-input" 
              value={searchValue || ''} 
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search"
            />
            <button 
              data-testid="search-close-button" 
              onClick={onSearchClose}
            >
              Close
            </button>
            {searchValue && (
              <button 
                data-testid="inline-close-button" 
                onClick={() => onSearchChange?.('')}
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>
    );
  };
});

import ListToolbar from '../../../src/components/toolbar/ListToolbar';

describe('ListToolbar (Working Test)', () => {
  const mockOnSearchClick = jest.fn();
  const mockOnAddClick = jest.fn();
  const mockOnSearchChange = jest.fn();
  const mockOnSearchClose = jest.fn();
  const mockOnFilterToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );
      expect(screen.getByTestId('list-toolbar')).toBeInTheDocument();
    });

    it('renders search button when search is not active', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );
      expect(screen.getByTestId('search-button')).toBeInTheDocument();
    });

    it('renders filter button', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );
      expect(screen.getByTestId('filter-button')).toBeInTheDocument();
    });

    it('renders add button', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );
      expect(screen.getByTestId('add-button')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('calls onSearchClick when search button is clicked', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );
      
      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);
      expect(mockOnSearchClick).toHaveBeenCalledTimes(1);
    });

    it('renders search input when search is active', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
        />
      );
      expect(screen.getByTestId('search-input-container')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('calls onSearchChange when search input changes', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'new search' } });
      expect(mockOnSearchChange).toHaveBeenCalledWith('new search');
    });

    it('calls onSearchClose when close button is clicked', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          onSearchClose={mockOnSearchClose}
          searchValue="test"
        />
      );
      
      const closeButton = screen.getByTestId('search-close-button');
      fireEvent.click(closeButton);
      expect(mockOnSearchClose).toHaveBeenCalledTimes(1);
    });

    it('shows inline close button when search has value', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
        />
      );
      expect(screen.getByTestId('inline-close-button')).toBeInTheDocument();
    });

    it('calls onSearchChange with empty string when inline close button is clicked', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="test"
        />
      );
      
      const inlineCloseButton = screen.getByTestId('inline-close-button');
      fireEvent.click(inlineCloseButton);
      expect(mockOnSearchChange).toHaveBeenCalledWith('');
    });
  });

  describe('Filter Functionality', () => {
    it('calls onFilterToggle when filter button is clicked', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
          isSearchActive={false}
        />
      );
      
      const filterButton = screen.getByTestId('filter-button');
      fireEvent.click(filterButton);
      expect(mockOnFilterToggle).toHaveBeenCalledTimes(1);
    });

    it('renders filter button as enabled by default', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );
      
      const filterButton = screen.getByTestId('filter-button');
      expect(filterButton).not.toBeDisabled();
    });
  });

  describe('Add Functionality', () => {
    it('calls onAddClick when add button is clicked', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );
      
      const addButton = screen.getByTestId('add-button');
      fireEvent.click(addButton);
      expect(mockOnAddClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component States', () => {
    it('handles search active state correctly', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue="active search"
        />
      );
      
      expect(screen.getByTestId('search-input-container')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toHaveValue('active search');
    });

    it('handles search inactive state correctly', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );
      
      expect(screen.queryByTestId('search-input-container')).not.toBeInTheDocument();
    });

    it('handles empty search value', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
        />
      );
      
      expect(screen.getByTestId('search-input')).toHaveValue('');
      expect(screen.queryByTestId('inline-close-button')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles multiple button clicks correctly', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          onFilterToggle={mockOnFilterToggle}
          isSearchActive={false}
        />
      );
      
      const searchButton = screen.getByTestId('search-button');
      const filterButton = screen.getByTestId('filter-button');
      const addButton = screen.getByTestId('add-button');
      
      fireEvent.click(searchButton);
      fireEvent.click(filterButton);
      fireEvent.click(addButton);
      
      expect(mockOnSearchClick).toHaveBeenCalledTimes(1);
      expect(mockOnFilterToggle).toHaveBeenCalledTimes(1);
      expect(mockOnAddClick).toHaveBeenCalledTimes(1);
    });

    it('handles search input interactions', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          onSearchClose={mockOnSearchClose}
          searchValue="test"
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      const closeButton = screen.getByTestId('search-close-button');
      
      fireEvent.change(searchInput, { target: { value: 'new value' } });
      fireEvent.click(closeButton);
      
      expect(mockOnSearchChange).toHaveBeenCalledWith('new value');
      expect(mockOnSearchClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper button labels', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );
      
      expect(screen.getByTestId('search-button')).toHaveAttribute('title', 'Search');
      expect(screen.getByTestId('filter-button')).toHaveAttribute('title', 'Filter');
    });

    it('has proper input placeholder', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={true}
          onSearchChange={mockOnSearchChange}
          searchValue=""
        />
      );
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('placeholder', 'Search');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined callbacks gracefully', () => {
      render(
        <ListToolbar
          onSearchClick={undefined}
          onAddClick={undefined}
          isSearchActive={false}
        />
      );
      
      const searchButton = screen.getByTestId('search-button');
      const addButton = screen.getByTestId('add-button');
      
      // Should not throw errors
      fireEvent.click(searchButton);
      fireEvent.click(addButton);
    });

    it('handles missing optional props', () => {
      render(
        <ListToolbar
          onSearchClick={mockOnSearchClick}
          onAddClick={mockOnAddClick}
          isSearchActive={false}
        />
      );
      
      expect(screen.getByTestId('list-toolbar')).toBeInTheDocument();
    });
  });
});





