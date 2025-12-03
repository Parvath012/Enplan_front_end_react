import React  from 'react';
import { Box, Paper } from '@mui/material';
const SearchField = React.lazy(() => import('commonApp/SearchField'));
import ListHeader from '../shared/ListHeader';
import { renderListItems } from '../shared/listUtils';
import { commonStyles, entityConfigurationStyles } from '../styles';

interface CountriesListProps {
  allCountries: string[];
  isLoadingCountries: boolean;
  countrySearch: string;
  setCountrySearch: (value: string) => void;
  selectedCountries: string[];
  handleCountryToggle: (country: string) => void;
  isEditMode: boolean;
  prePopulatedCountries: string[];
}

const CountriesList: React.FC<CountriesListProps> = ({
  allCountries,
  isLoadingCountries,
  countrySearch,
  setCountrySearch,
  selectedCountries,
  handleCountryToggle,
  isEditMode,
  prePopulatedCountries,
}) => {
  return (
    <Paper
      sx={{
        ...commonStyles.basePaper,
        ...entityConfigurationStyles.listPaper,
        width: '240px',
        height: '426px',
      }}
    >
      <ListHeader
        title="Countries List"
        count={selectedCountries.length}
        total={allCountries.length}
      />

      
        <Box
          sx={{
            opacity: isEditMode ? 1 : 0.5, 
            pointerEvents: isEditMode ? 'auto' : 'none',
          }}
        >
          <SearchField
            value={countrySearch}
            onChange={setCountrySearch}
            placeholder="Search"
            customStyle={{
              ...commonStyles.baseSearchField,
              ...commonStyles.searchField,
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
            items: allCountries.map((country) => ({ country, id: country })),
            isLoading: isLoadingCountries,
            searchTerm: countrySearch,
            searchField: 'country',
            displayField: 'country',
            idField: 'id',
            selectedItems: selectedCountries,
            onToggle: handleCountryToggle,
            loadingMessage: 'Loading countries...',
            emptyMessage: 'No countries available',
            prePopulatedItems: prePopulatedCountries,
          },
          isEditMode
        )}
      </Box>
    </Paper>
  );
};

export default CountriesList;
