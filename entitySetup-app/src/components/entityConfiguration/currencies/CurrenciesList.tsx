import React from 'react';
import { Box, Paper } from '@mui/material';
const SearchField = React.lazy(() => import('commonApp/SearchField'));
import ListHeader from '../shared/ListHeader';
import { renderListItems } from '../shared/listUtils';
import { commonStyles, entityConfigurationStyles } from '../styles';

interface CurrenciesListProps {
  currencies: any[];
  currenciesLoading: boolean;
  currencySearch: string;
  setCurrencySearch: (value: string) => void;
  selectedCurrencies: string[];
  handleCurrencyToggle: (currencyCode: string) => void;
  isEditMode: boolean;
  prePopulatedCurrencies: string[];
  defaultCurrency: string[];
  isDefault: string | null;
}

const CurrenciesList: React.FC<CurrenciesListProps> = ({
  currencies,
  currenciesLoading,
  currencySearch,
  setCurrencySearch,
  selectedCurrencies,
  handleCurrencyToggle,
  isEditMode,
  prePopulatedCurrencies,
  defaultCurrency,
  isDefault
}) => {
  return (
    <Paper
      sx={{
        ...commonStyles.basePaper,
        ...entityConfigurationStyles.listPaper,
        width: '254px',
        height: '426px',
      }}
    >
      <ListHeader
        title="Currencies List"
        count={selectedCurrencies.length}
        total={currencies.length}
      />

      <Box
        sx={{
          opacity: isEditMode ? 1 : 0.5, 
          pointerEvents: isEditMode ? 'auto' : 'none',
        }}
      >
        <SearchField
          value={currencySearch}
          onChange={setCurrencySearch}
          placeholder="Search"
          customStyle={{
            ...commonStyles.baseSearchField,
            ...commonStyles.currencySearchField,
          }}
          disabled={!isEditMode}
        />
      </Box>

      <Box sx={entityConfigurationStyles.listDivider} />

      <Box
        sx={{
          ...entityConfigurationStyles.listContent,
          ...commonStyles.listContainer,
        }}
      >
        {renderListItems(
          {
            items: currencies,
            isLoading: currenciesLoading,
            searchTerm: currencySearch,
            searchField: 'currencyName',
            displayField: 'currencyName',
            idField: 'id',
            selectedItems: selectedCurrencies,
            onToggle: handleCurrencyToggle,
            loadingMessage: 'Loading currencies...',
            emptyMessage: 'No currencies available',
            prePopulatedItems: prePopulatedCurrencies,
            defaultCurrency,
            isDefault,
          },
          isEditMode
        )}
      </Box>
    </Paper>
  );
};

export default CurrenciesList;
