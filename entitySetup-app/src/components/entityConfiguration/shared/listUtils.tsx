import React from 'react';
const ListItem = React.lazy(() => import('commonApp/ListItem'));
import NoResultsFound from 'commonApp/NoResultsFound';
import StatusMessage from './StatusMessage';

// List rendering logic with reduced parameters
interface ListRenderConfig {
  items: any[];
  isLoading: boolean;
  searchTerm: string;
  searchField: string;
  displayField: string;
  idField: string;
  selectedItems: string[];
  onToggle: (id: string) => void;
  loadingMessage: string;
  emptyMessage: string;
  prePopulatedItems: string[];
  defaultCurrency?: string[];
  isDefault?: string | null;
}

export const renderListItems = (config: ListRenderConfig, isEditMode: boolean) => {
  const {
    items,
    isLoading,
    searchTerm,
    searchField,
    displayField,
    idField,
    selectedItems,
    onToggle,
    loadingMessage,
    emptyMessage,
    prePopulatedItems,
    defaultCurrency,
    isDefault
  } = config;

  if (isLoading) {
    return <StatusMessage message={loadingMessage} type="loading" />;
  }

  if (items.length === 0) {
    return <StatusMessage message={emptyMessage} type="empty" />;
  }

  const filteredItems = items.filter((item: any) => {
    const searchValue = item[searchField]?.toLowerCase() || '';
    const idValue = item[idField]?.toLowerCase() || '';
    return searchValue.includes(searchTerm.toLowerCase()) || idValue.includes(searchTerm.toLowerCase());
  });

  // Show NoResultsFound when search returns no results
  if (searchTerm && filteredItems.length === 0) {
    return (
      <NoResultsFound 
        message="No Results Found"
        height="200px"
      />
    );
  }

  return filteredItems.map((item: any, index: number) => {
    // For currencies, we don't use isPrePopulated anymore since selectedCurrencies should be editable
    // Only defaultCurrency and isDefault should be non-editable (handled in ListItem component)
    const isPrePopulated = displayField === 'currencyName' 
      ? false // For currencies, selectedCurrencies are now editable, so we don't set isPrePopulated
      : prePopulatedItems.includes(item[idField]); // For other items (countries), use ID comparison
    
    return (
      <ListItem
        key={item[idField]}
        item={item}
        index={index}
        totalItems={filteredItems.length}
        idField={idField}
        displayField={displayField}
        selectedItems={selectedItems}
        isEditMode={isEditMode}
        onToggle={onToggle}
        isPrePopulated={isPrePopulated}
        defaultCurrency={defaultCurrency}
        isDefault={isDefault}
      />
    );
  });
};
