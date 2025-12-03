import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
const AgGridShell = React.lazy(() => import('commonApp/AgGridShell'));
import GridStyles from '../../grid/GridStyles';
import { createCountryColumnDefs, createGridOptions } from '../shared/gridUtils';
import { commonStyles, entityConfigurationStyles } from '../styles';
import StatusMessage from '../shared/StatusMessage';

interface SelectedCountriesGridProps {
  selectedCountries: string[];
  isEditMode: boolean;
  handleCountryToggle: (country: string) => void;
  prePopulatedCountries: string[];
  isLoadingSelectedCountries?: boolean;
}

const SelectedCountriesGrid: React.FC<SelectedCountriesGridProps> = ({
  selectedCountries,
  isEditMode,
  handleCountryToggle,
  prePopulatedCountries,
  isLoadingSelectedCountries = false
}) => {
  const defaultColDef = {
    suppressHeaderClickSorting: true,
    sortable: true,
    filter: true,
    resizable: true,
    headerClass: 'ag-header-cell-custom',
    unSortIcon: true,
    sortingOrder: ['asc', 'desc', null] as any,
  };

  const gridOptions = createGridOptions();
  const countryColumnDefs = useMemo(() => createCountryColumnDefs(isEditMode, handleCountryToggle, prePopulatedCountries), [isEditMode, handleCountryToggle, prePopulatedCountries]);

  const rowData = useMemo(() => selectedCountries.map(country => ({
    country,
    isPrePopulated: prePopulatedCountries.includes(country)
  })), [selectedCountries, prePopulatedCountries]);

  const onSortChanged = () => {
    // Let AG Grid handle sorting internally
  };

  return (
    <Paper sx={{ ...commonStyles.basePaper, ...entityConfigurationStyles.gridPaper, width: "281px", height: "426px" }}>
      <Typography variant="h6" sx={{ ...commonStyles.baseHeader, ...entityConfigurationStyles.gridHeader }}>
        Selected Countries
      </Typography>
      <Box sx={{ ...commonStyles.baseGridContainer, ...commonStyles.gridContainer }}>
        {isLoadingSelectedCountries ? (
          <StatusMessage message="Loading selected countries..." type="loading" />
        ) : (
          <AgGridShell
            rowData={rowData}
            columnDefs={countryColumnDefs}
            defaultColDef={defaultColDef}
            rowHeight={30}
            headerHeight={34}
            gridOptions={gridOptions}
            onSortChanged={onSortChanged}
            getRowStyle={() => ({ backgroundColor: 'transparent' })}
            isDraggable={false}
          />
        )}
      </Box>
      <GridStyles />
    </Paper>
  );
};

export default SelectedCountriesGrid;
