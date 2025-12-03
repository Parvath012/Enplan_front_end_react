// Mock for commonApp/ListToolbar
import React from 'react';
import { Box, TextField, Button, IconButton, Tooltip } from '@mui/material';

const ListToolbar: React.FC<any> = ({ 
  onSearchClick, 
  onAddClick, 
  onSearchChange,
  onSearchClose,
  isSearchActive = false,
  searchValue = '',
  ...props 
}) => {
  const handleSearchClick = () => {
    if (isSearchActive) {
      if (onSearchClose) {
        onSearchClose();
      }
    } else if (onSearchClick) {
      onSearchClick();
    }
  };

  const handleInlineClose = () => {
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <Box data-testid="list-toolbar" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isSearchActive ? (
          <>
            <TextField
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              size="small"
            />
            {searchValue && (
              <IconButton 
                size="small"
                onClick={handleInlineClose}
                data-testid="inline-close-button"
              >
                <svg viewBox="0 0 32 32" width="16" height="16">
                  <path d="M8 8l16 16M24 8L8 24" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </IconButton>
            )}
            <Button 
              data-testid="search-button" 
              onClick={handleSearchClick}
              variant="contained"
              size="small"
            >
              Search
            </Button>
          </>
        ) : (
          <Button 
            data-testid="search-button" 
            onClick={handleSearchClick}
            variant="contained"
            size="small"
          >
            Search
          </Button>
        )}
      </Box>
      <div data-testid="custom-tooltip" data-title="Filter">
        <Button 
          data-testid="add-button" 
          onClick={onAddClick}
          variant="contained"
          size="small"
        >
          Add New
        </Button>
      </div>
    </Box>
  );
};

export default ListToolbar;
