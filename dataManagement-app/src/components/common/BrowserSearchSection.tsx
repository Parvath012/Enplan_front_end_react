import React from 'react';
import { Typography } from '@mui/material';
import { ListToolbar } from './browserLazyImports';

interface BrowserSearchSectionProps {
  searchTerm: string;
  filteredCount: number;
  totalCount: number;
  isSearchActive: boolean;
  handleSearchClick: () => void;
  handleSearchChange: (value: string) => void;
  handleSearchClose: () => void;
  allItemsText: string; // e.g., "All Processors" or "All Controller Services"
  className: string; // e.g., "processor-browser" or "controller-service-browser"
}

const BrowserSearchSection: React.FC<BrowserSearchSectionProps> = ({
  searchTerm,
  filteredCount,
  totalCount,
  isSearchActive,
  handleSearchClick,
  handleSearchChange,
  handleSearchClose,
  allItemsText,
  className
}) => {
  return (
    <div className={`${className}__search-section`}>
      <div className={`${className}__top-bar`}>
        {searchTerm.trim() && (
          <Typography 
            variant="body2" 
            className={`${className}__count`}
          >
            Showing {filteredCount} of {totalCount}
          </Typography>
        )}
        {!searchTerm.trim() && (
          <Typography 
            variant="body2" 
            className={`${className}__count`}
          >
            {allItemsText}
          </Typography>
        )}
        <div className={`${className}__search-container`}>
          <React.Suspense fallback={<div style={{ width: '22px', height: '22px' }} />}>
            <ListToolbar
              onSearchClick={handleSearchClick}
              onSearchChange={handleSearchChange}
              onSearchClose={handleSearchClose}
              isSearchActive={isSearchActive}
              searchValue={searchTerm}
              showFilter={false}
              showAdd={false}
            />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default BrowserSearchSection;

