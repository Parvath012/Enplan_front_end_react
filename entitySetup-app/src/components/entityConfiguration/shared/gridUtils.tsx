import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArrowUp, ArrowDown, ArrowsVertical } from '@carbon/icons-react';
import CountryActionCellRenderer from './CountryActionCellRenderer';
import CurrencyDefaultCellRenderer from './CurrencyDefaultCellRenderer';
import CurrencyActionCellRenderer from './CurrencyActionCellRenderer';

// Grid options configuration
export const createGridOptions = () => ({
  headerHeight: 34,
  defaultColDef: {
    sortable: true,
    filter: false,
    resizable: true,
    suppressHeaderClickSorting: true,
  },
  icons: {
    sortAscending: renderToStaticMarkup(<ArrowUp style={{ width: 12, height: 11, color: '#0051AB' }} />),
    sortDescending: renderToStaticMarkup(<ArrowDown style={{ width: 12, height: 11, color: '#0051AB' }} />),
    sortUnSort: renderToStaticMarkup(<ArrowsVertical style={{ width: 12, height: 12, color: '#0051AB' }} />),
  },
  suppressMenuHide: true,
  suppressMenuShow: true,
});

// Column definition creators
export const createCountryColumnDefs = (
  isEditMode: boolean, 
  onToggle: (country: string) => void, 
  prePopulatedCountries: string[]
) => [
  {
    headerName: 'Country',
    field: 'country',
    sortable: true,
    suppressHeaderClickSorting: true,
    filter: false,
    suppressMenu: true,
    width: 180,
    resizable: true,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    headerStyle: { fontSize: '10px' },
    cellStyle: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  {
    headerName: 'Action',
    field: 'action',
    sortable: false,
    filter: false,
    suppressMenu: true,
    width: 90,
    resizable: true,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    headerStyle: { fontSize: '10px' },
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 30px 0 0'
    },
    cellRenderer: (params: any) => (
      <CountryActionCellRenderer
        data={params.data}
        isEditMode={isEditMode}
        onToggle={onToggle}
        isPrePopulated={prePopulatedCountries.includes(params.data.country)}
      />
    ),
  }
];

export const createCurrencyColumnDefs = (
  isEditMode: boolean,
  onToggle: (currencyCode: string) => void,
  onSetDefault: (currencyCode: string) => void,
  defaultCurrency: string[],
  isDefault: string | null,
  prePopulatedCurrencies: string[]
) => [
  {
    headerName: 'Currency',
    field: 'currency',
    sortable: true,
    suppressHeaderClickSorting: true,
    filter: false,
    suppressMenu: true,
    width: 120,
    resizable: true,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    headerStyle: { fontSize: '10px' },
    cellStyle: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  {
    headerName: 'Default',
    field: 'default',
    sortable: false,
    filter: false,
    suppressMenu: true,
    width: 80,
    resizable: true,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    headerStyle: { fontSize: '10px' },
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 20px 0 0'
    },
    cellRenderer: (params: any) => (
      <CurrencyDefaultCellRenderer
        data={params.data}
        isEditMode={isEditMode}
        onSetDefault={onSetDefault}
        defaultCurrency={defaultCurrency}
        isDefault={isDefault}
        isPrePopulated={prePopulatedCurrencies.includes(params.data.currencyCode)}
      />
    ),
  },
  {
    headerName: 'Action',
    field: 'action',
    sortable: false,
    filter: false,
    suppressMenu: true,
    width: 65,
    resizable: true,
    headerClass: 'ag-header-cell-custom',
    cellClass: 'ag-cell-custom',
    headerStyle: { fontSize: '10px' },
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 3px 0 0'
    },
    cellRenderer: (params: any) => (
      <CurrencyActionCellRenderer
        data={params.data}
        isEditMode={isEditMode}
        onToggle={onToggle}
        defaultCurrency={defaultCurrency}
        isDefault={isDefault}
      />
    ),
  }
];
