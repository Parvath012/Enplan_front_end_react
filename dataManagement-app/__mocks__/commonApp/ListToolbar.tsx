import React from 'react';

interface ListToolbarProps {
  onSearchChange?: (value: string) => void;
  onSearchClick?: () => void;
  onSearchClose?: () => void;
  onAddClick?: () => void;
  isSearchActive?: boolean;
  searchValue?: string;
  showFilter?: boolean;
  showAdd?: boolean;
}

const ListToolbar: React.FC<ListToolbarProps> = ({
  onSearchChange,
  onSearchClick,
  onSearchClose,
  onAddClick,
  isSearchActive,
  searchValue,
  showFilter,
  showAdd
}) => {
  if (isSearchActive) {
    return (
      <div data-testid="list-toolbar">
        <input
          data-testid="search-input"
          value={searchValue || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onBlur={onSearchClose}
          placeholder="Search"
        />
      </div>
    );
  }

  return (
    <div data-testid="list-toolbar">
      {showAdd !== false && (
        <button data-testid="add-button" onClick={onAddClick}>
          Add
        </button>
      )}
      <button data-testid="search-button" onClick={onSearchClick}>
        Search
      </button>
    </div>
  );
};

export default ListToolbar;

