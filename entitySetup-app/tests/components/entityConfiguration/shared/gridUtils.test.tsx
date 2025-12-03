import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render } from '@testing-library/react';
import { createGridOptions, createCountryColumnDefs, createCurrencyColumnDefs } from '../../../../src/components/entityConfiguration/shared/gridUtils';

// Mock Carbon icons
jest.mock('@carbon/icons-react', () => ({
  ArrowUp: ({ style }: { style: any }) => <div data-testid="arrow-up" style={style}>↑</div>,
  ArrowDown: ({ style }: { style: any }) => <div data-testid="arrow-down" style={style}>↓</div>,
  ArrowsVertical: ({ style }: { style: any }) => <div data-testid="arrows-vertical" style={style}>↕</div>,
}));

// Mock cell renderers
jest.mock('../../../../src/components/entityConfiguration/shared/CountryActionCellRenderer', () => {
  return function MockCountryActionCellRenderer({ data, isEditMode, onToggle, isPrePopulated }: any) {
    return (
      <div data-testid="country-action" data-country={data.country} data-edit-mode={isEditMode} data-pre-populated={isPrePopulated}>
        Country Action
      </div>
    );
  };
});

jest.mock('../../../../src/components/entityConfiguration/shared/CurrencyDefaultCellRenderer', () => {
  return function MockCurrencyDefaultCellRenderer({ data, isEditMode, onSetDefault, defaultCurrency, isDefault, isPrePopulated }: any) {
    return (
      <div data-testid="currency-default" data-currency={data.currencyCode} data-default={isDefault} data-edit-mode={isEditMode} data-pre-populated={isPrePopulated}>
        Currency Default
      </div>
    );
  };
});

jest.mock('../../../../src/components/entityConfiguration/shared/CurrencyActionCellRenderer', () => {
  return function MockCurrencyActionCellRenderer({ data, isEditMode, onToggle, defaultCurrency, isDefault }: any) {
    return (
      <div data-testid="currency-action" data-currency={data.currencyCode} data-default={isDefault} data-edit-mode={isEditMode} data-pre-populated={false}>
        Currency Action
      </div>
    );
  };
});

describe('gridUtils', () => {
  describe('createGridOptions', () => {
    it('should return correct grid options', () => {
      const options = createGridOptions();
      
      expect(options).toEqual({
        headerHeight: 34,
        defaultColDef: {
          sortable: true,
          filter: false,
          resizable: true,
          suppressHeaderClickSorting: true,
        },
        icons: {
          sortAscending: expect.any(String),
          sortDescending: expect.any(String),
          sortUnSort: expect.any(String),
        },
        suppressMenuHide: true,
        suppressMenuShow: true,
      });
    });

    it('should have correct header height', () => {
      const options = createGridOptions();
      expect(options.headerHeight).toBe(34);
    });

    it('should have correct default column definition', () => {
      const options = createGridOptions();
      expect(options.defaultColDef).toEqual({
        sortable: true,
        filter: false,
        resizable: true,
        suppressHeaderClickSorting: true,
      });
    });

    it('should have correct menu suppression settings', () => {
      const options = createGridOptions();
      expect(options.suppressMenuHide).toBe(true);
      expect(options.suppressMenuShow).toBe(true);
    });

    it('should generate sort icons', () => {
      const options = createGridOptions();
      
      expect(options.icons.sortAscending).toBeDefined();
      expect(options.icons.sortDescending).toBeDefined();
      expect(options.icons.sortUnSort).toBeDefined();
      
      // Icons should be HTML strings
      expect(typeof options.icons.sortAscending).toBe('string');
      expect(typeof options.icons.sortDescending).toBe('string');
      expect(typeof options.icons.sortUnSort).toBe('string');
    });
  });

  describe('createCountryColumnDefs', () => {
    const defaultParams = {
      isEditMode: true,
      onToggle: jest.fn(),
      prePopulatedCountries: ['United States'],
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return correct column definitions', () => {
      const columnDefs = createCountryColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.prePopulatedCountries
      );
      
      expect(columnDefs).toHaveLength(2);
      expect(columnDefs[0].headerName).toBe('Country');
      expect(columnDefs[1].headerName).toBe('Action');
    });

    it('should have correct country column configuration', () => {
      const columnDefs = createCountryColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.prePopulatedCountries
      );
      
      const countryColumn = columnDefs[0];
      expect(countryColumn).toEqual({
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
      });
    });

    it('should have correct action column configuration', () => {
      const columnDefs = createCountryColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.prePopulatedCountries
      );
      
      const actionColumn = columnDefs[1];
      expect(actionColumn).toEqual({
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
        cellRenderer: expect.any(Function),
      });
    });

    it('should render CountryActionCellRenderer with correct props', () => {
      const columnDefs = createCountryColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.prePopulatedCountries
      );
      
      const actionColumn = columnDefs[1];
      const mockParams = {
        data: { country: 'United States' },
      };
      
      const result = actionColumn.cellRenderer(mockParams);
      const { container } = render(result);
      
      const countryAction = container.querySelector('[data-testid="country-action"]');
      expect(countryAction).toBeInTheDocument();
      expect(countryAction).toHaveAttribute('data-country', 'United States');
      expect(countryAction).toHaveAttribute('data-edit-mode', 'true');
      expect(countryAction).toHaveAttribute('data-pre-populated', 'true');
    });

    it('should handle different edit modes', () => {
      const columnDefs = createCountryColumnDefs(
        false, // not in edit mode
        defaultParams.onToggle,
        defaultParams.prePopulatedCountries
      );
      
      const actionColumn = columnDefs[1];
      const mockParams = {
        data: { country: 'Canada' },
      };
      
      const result = actionColumn.cellRenderer(mockParams);
      const { container } = render(result);
      
      const countryAction = container.querySelector('[data-testid="country-action"]');
      expect(countryAction).toHaveAttribute('data-edit-mode', 'false');
    });

    it('should handle different pre-populated countries', () => {
      const columnDefs = createCountryColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        ['Canada', 'Mexico'] // different pre-populated countries
      );
      
      const actionColumn = columnDefs[1];
      const mockParams = {
        data: { country: 'United States' },
      };
      
      const result = actionColumn.cellRenderer(mockParams);
      const { container } = render(result);
      
      const countryAction = container.querySelector('[data-testid="country-action"]');
      expect(countryAction).toHaveAttribute('data-pre-populated', 'false');
    });

    it('should handle empty pre-populated countries array', () => {
      const columnDefs = createCountryColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        []
      );
      
      const actionColumn = columnDefs[1];
      const mockParams = {
        data: { country: 'United States' },
      };
      
      const result = actionColumn.cellRenderer(mockParams);
      const { container } = render(result);
      
      const countryAction = container.querySelector('[data-testid="country-action"]');
      expect(countryAction).toHaveAttribute('data-pre-populated', 'false');
    });
  });

  describe('createCurrencyColumnDefs', () => {
    const defaultParams = {
      isEditMode: true,
      onToggle: jest.fn(),
      onSetDefault: jest.fn(),
      defaultCurrency: ['USD'],
      isDefault: 'USD',
      prePopulatedCurrencies: ['USD'],
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return correct column definitions', () => {
      const columnDefs = createCurrencyColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.onSetDefault,
        defaultParams.defaultCurrency,
        defaultParams.isDefault,
        defaultParams.prePopulatedCurrencies
      );
      
      expect(columnDefs).toHaveLength(3);
      expect(columnDefs[0].headerName).toBe('Currency');
      expect(columnDefs[1].headerName).toBe('Default');
      expect(columnDefs[2].headerName).toBe('Action');
    });

    it('should have correct currency column configuration', () => {
      const columnDefs = createCurrencyColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.onSetDefault,
        defaultParams.defaultCurrency,
        defaultParams.isDefault,
        defaultParams.prePopulatedCurrencies
      );
      
      const currencyColumn = columnDefs[0];
      expect(currencyColumn).toEqual({
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
      });
    });

    it('should have correct default column configuration', () => {
      const columnDefs = createCurrencyColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.onSetDefault,
        defaultParams.defaultCurrency,
        defaultParams.isDefault,
        defaultParams.prePopulatedCurrencies
      );
      
      const defaultColumn = columnDefs[1];
      expect(defaultColumn).toEqual({
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
        cellRenderer: expect.any(Function),
      });
    });

    it('should have correct action column configuration', () => {
      const columnDefs = createCurrencyColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.onSetDefault,
        defaultParams.defaultCurrency,
        defaultParams.isDefault,
        defaultParams.prePopulatedCurrencies
      );
      
      const actionColumn = columnDefs[2];
      expect(actionColumn).toEqual({
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
        cellRenderer: expect.any(Function),
      });
    });

    it('should render CurrencyDefaultCellRenderer with correct props', () => {
      const columnDefs = createCurrencyColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.onSetDefault,
        defaultParams.defaultCurrency,
        defaultParams.isDefault,
        defaultParams.prePopulatedCurrencies
      );
      
      const defaultColumn = columnDefs[1];
      const mockParams = {
        data: { currencyCode: 'USD' },
      };
      
      const result = defaultColumn.cellRenderer(mockParams);
      const { container } = render(result);
      
      const currencyDefault = container.querySelector('[data-testid="currency-default"]');
      expect(currencyDefault).toBeInTheDocument();
      expect(currencyDefault).toHaveAttribute('data-currency', 'USD');
      expect(currencyDefault).toHaveAttribute('data-default', 'USD');
      expect(currencyDefault).toHaveAttribute('data-edit-mode', 'true');
      expect(currencyDefault).toHaveAttribute('data-pre-populated', 'true');
    });

    it('should render CurrencyActionCellRenderer with correct props', () => {
      const columnDefs = createCurrencyColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.onSetDefault,
        defaultParams.defaultCurrency,
        defaultParams.isDefault,
        defaultParams.prePopulatedCurrencies
      );
      
      const actionColumn = columnDefs[2];
      const mockParams = {
        data: { currencyCode: 'EUR' },
      };
      
      const result = actionColumn.cellRenderer(mockParams);
      const { container } = render(result);
      
      const currencyAction = container.querySelector('[data-testid="currency-action"]');
      expect(currencyAction).toBeInTheDocument();
      expect(currencyAction).toHaveAttribute('data-currency', 'EUR');
      expect(currencyAction).toHaveAttribute('data-default', 'USD');
      expect(currencyAction).toHaveAttribute('data-edit-mode', 'true');
    });

    it('should handle different edit modes', () => {
      const columnDefs = createCurrencyColumnDefs(
        false, // not in edit mode
        defaultParams.onToggle,
        defaultParams.onSetDefault,
        defaultParams.defaultCurrency,
        defaultParams.isDefault,
        defaultParams.prePopulatedCurrencies
      );
      
      const defaultColumn = columnDefs[1];
      const mockParams = {
        data: { currencyCode: 'USD' },
      };
      
      const result = defaultColumn.cellRenderer(mockParams);
      const { container } = render(result);
      
      const currencyDefault = container.querySelector('[data-testid="currency-default"]');
      expect(currencyDefault).toHaveAttribute('data-edit-mode', 'false');
    });

    it('should handle different pre-populated currencies', () => {
      const columnDefs = createCurrencyColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.onSetDefault,
        defaultParams.defaultCurrency,
        defaultParams.isDefault,
        ['EUR', 'GBP'] // different pre-populated currencies
      );
      
      const actionColumn = columnDefs[2];
      const mockParams = {
        data: { currencyCode: 'USD' },
      };
      
      const result = actionColumn.cellRenderer(mockParams);
      const { container } = render(result);
      
      const currencyAction = container.querySelector('[data-testid="currency-action"]');
      expect(currencyAction).toBeInTheDocument();
    });

    it('should handle empty pre-populated currencies array', () => {
      const columnDefs = createCurrencyColumnDefs(
        defaultParams.isEditMode,
        defaultParams.onToggle,
        defaultParams.onSetDefault,
        defaultParams.defaultCurrency,
        defaultParams.isDefault,
        []
      );
      
      const actionColumn = columnDefs[2];
      const mockParams = {
        data: { currencyCode: 'USD' },
      };
      
      const result = actionColumn.cellRenderer(mockParams);
      const { container } = render(result);
      
      const currencyAction = container.querySelector('[data-testid="currency-action"]');
      expect(currencyAction).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined parameters in createCountryColumnDefs', () => {
      const columnDefs = createCountryColumnDefs(
        undefined,
        undefined,
        undefined
      );
      
      expect(columnDefs).toHaveLength(2);
      expect(columnDefs[0].headerName).toBe('Country');
      expect(columnDefs[1].headerName).toBe('Action');
    });

    it('should handle undefined parameters in createCurrencyColumnDefs', () => {
      const columnDefs = createCurrencyColumnDefs(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
      
      expect(columnDefs).toHaveLength(3);
      expect(columnDefs[0].headerName).toBe('Currency');
      expect(columnDefs[1].headerName).toBe('Default');
      expect(columnDefs[2].headerName).toBe('Action');
    });

    it('should handle empty arrays for pre-populated items', () => {
      const countryColumnDefs = createCountryColumnDefs(true, jest.fn(), []);
      const currencyColumnDefs = createCurrencyColumnDefs(true, jest.fn(), jest.fn(), ['USD'], 'USD', []);
      
      expect(countryColumnDefs).toHaveLength(2);
      expect(currencyColumnDefs).toHaveLength(3);
    });
  });

  describe('Function Parameters', () => {
    it('should pass onToggle function to country action renderer', () => {
      const onToggle = jest.fn();
      const columnDefs = createCountryColumnDefs(true, onToggle, []);
      
      const actionColumn = columnDefs[1];
      const mockParams = {
        data: { country: 'Test Country' },
      };
      
      const result = actionColumn.cellRenderer(mockParams);
      expect(result).toBeDefined();
    });

    it('should pass onToggle and onSetDefault functions to currency renderers', () => {
      const onToggle = jest.fn();
      const onSetDefault = jest.fn();
      const columnDefs = createCurrencyColumnDefs(true, onToggle, onSetDefault, ['USD'], 'USD', []);
      
      const defaultColumn = columnDefs[1];
      const actionColumn = columnDefs[2];
      
      const mockParams = {
        data: { currencyCode: 'USD' },
      };
      
      const defaultResult = defaultColumn.cellRenderer(mockParams);
      const actionResult = actionColumn.cellRenderer(mockParams);
      
      expect(defaultResult).toBeDefined();
      expect(actionResult).toBeDefined();
    });
  });
});
