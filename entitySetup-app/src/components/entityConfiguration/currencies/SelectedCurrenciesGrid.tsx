import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
const AgGridShell = React.lazy(() => import('commonApp/AgGridShell'));
import GridStyles from '../../grid/GridStyles';
import { createCurrencyColumnDefs, createGridOptions } from '../shared/gridUtils';
import { commonStyles, entityConfigurationStyles } from '../styles';
import StatusMessage from '../shared/StatusMessage';

interface SelectedCurrenciesGridProps {
  selectedCurrencies: string[];
  currencies: any[];
  isEditMode: boolean;
  handleCurrencyToggle: (currencyCode: string) => void;
  handleSetDefaultCurrency: (currencyCode: string) => void;
  defaultCurrency: string[];
  isDefault: string | null;
  prePopulatedCurrencies: string[];
  isLoadingSelectedCurrencies?: boolean;
}

const SelectedCurrenciesGrid: React.FC<SelectedCurrenciesGridProps> = ({
  selectedCurrencies,
  currencies,
  isEditMode,
  handleCurrencyToggle,
  handleSetDefaultCurrency,
  defaultCurrency,
  isDefault,
  prePopulatedCurrencies,
  isLoadingSelectedCurrencies = false
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
  const currencyColumnDefs = useMemo(() => createCurrencyColumnDefs(
    isEditMode, 
    handleCurrencyToggle, 
    handleSetDefaultCurrency, 
    defaultCurrency,
    isDefault,
    prePopulatedCurrencies
  ), [isEditMode, handleCurrencyToggle, handleSetDefaultCurrency, defaultCurrency, isDefault, prePopulatedCurrencies]);

  const rowData = useMemo(() => {
    // Combine selectedCurrencies and defaultCurrency for display
    // Both arrays come from Redux state and are already properly formatted
    const allCurrencies = [...new Set([
      ...selectedCurrencies, // User-editable currencies
      ...(defaultCurrency || []), // Non-editable currencies from entity creation
      ...(isDefault ? [isDefault] : []) // isDefault currency (can be from either list)
    ])];
    
    console.log('🔍 SelectedCurrenciesGrid rowData calculation:', {
      selectedCurrencies,
      defaultCurrency,
      isDefault,
      allCurrencies,
      currenciesLength: currencies.length
    });
    
    const data = allCurrencies.map(currencyName => {
      // Find currency by name comparison (handle format differences)
      const currency = currencies.find((c: any) => {
        // Check both id and currencyName fields
        return c.id === currencyName || 
               c.currencyName === currencyName || 
               c.currencyName === currencyName.replace(/\)([A-Z])/g, ') $1') ||
               currencyName === c.currencyName?.replace(/\)([A-Z])/g, ') $1');
      });
      
      const rowItem = {
        currency: currency?.currencyName || currencyName,
        currencyCode: currencyName, // Use currency name directly
        currencyName: currencyName, // Store original name for comparison
        isPrePopulated: false // Currencies are now handled by defaultCurrency and isDefault in CurrencyActionCellRenderer
      };
      
      console.log('🔍 Row item created:', rowItem);
      return rowItem;
    });
    
    console.log('🔍 Final rowData:', data);
    return data;
  }, [selectedCurrencies, defaultCurrency, isDefault, currencies]);

  const onSortChanged = () => {
    // Let AG Grid handle sorting internally
  };

  return (
    <Paper sx={{ ...commonStyles.basePaper, ...entityConfigurationStyles.gridPaper, width: "281px", height: "426px" }}>
      <Typography variant="h6" sx={{ ...commonStyles.baseHeader, ...entityConfigurationStyles.gridHeader }}>
        Selected Currencies
      </Typography>
      <Box sx={{ ...commonStyles.baseGridContainer, ...commonStyles.gridContainer }}>
        {isLoadingSelectedCurrencies ? (
          <StatusMessage message="Loading selected currencies..." type="loading" />
        ) : (
          <AgGridShell
            rowData={rowData}
            columnDefs={currencyColumnDefs}
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

export default SelectedCurrenciesGrid;
