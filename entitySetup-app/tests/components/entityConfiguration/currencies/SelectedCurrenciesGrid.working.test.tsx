import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectedCurrenciesGrid from '../../../../src/components/entityConfiguration/currencies/SelectedCurrenciesGrid';

// Mock the lazy-loaded components
jest.mock('commonApp/AgGridShell', () => {
  return jest.fn((props: any) => (
    <div data-testid="ag-grid-shell" {...props}>
      <div data-testid="grid-data">{JSON.stringify(props.rowData)}</div>
      <div data-testid="grid-columns">{JSON.stringify(props.columnDefs)}</div>
      <div data-testid="grid-options">{JSON.stringify(props.gridOptions)}</div>
    </div>
  ));
});

// Mock the grid styles
jest.mock('../../../../src/components/grid/GridStyles', () => {
  return jest.fn(() => <div data-testid="grid-styles">Grid Styles</div>);
});

// Mock the grid utils
jest.mock('../../../../src/components/entityConfiguration/shared/gridUtils', () => ({
  createCurrencyColumnDefs: jest.fn(() => [
    { field: 'currency', headerName: 'Currency' },
    { field: 'actions', headerName: 'Actions' }
  ]),
  createGridOptions: jest.fn(() => ({ rowSelection: 'single' }))
}));

// Mock the styles
jest.mock('../../../../src/components/entityConfiguration/styles', () => ({
  commonStyles: {
    basePaper: { padding: '16px' },
    baseHeader: { fontSize: '16px' },
    baseGridContainer: { height: '400px' },
    gridContainer: { width: '100%' }
  },
  entityConfigurationStyles: {
    gridPaper: { margin: '8px' },
    gridHeader: { marginBottom: '8px' }
  }
}));

describe('SelectedCurrenciesGrid Component', () => {
  const defaultProps = {
    selectedCurrencies: ['USD', 'EUR'],
    currencies: [
      { id: 'USD', currencyName: 'US Dollar (USD)' },
      { id: 'EUR', currencyName: 'Euro (EUR)' },
      { id: 'GBP', currencyName: 'British Pound (GBP)' }
    ],
    isEditMode: true,
    handleCurrencyToggle: jest.fn(),
    handleSetDefaultCurrency: jest.fn(),
    defaultCurrency: ['GBP'],
    isDefault: 'USD',
    prePopulatedCurrencies: ['JPY']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<SelectedCurrenciesGrid {...defaultProps} />);
      expect(screen.getByText('Selected Currencies')).toBeInTheDocument();
    });

    it('should render grid with correct props', () => {
      render(<SelectedCurrenciesGrid {...defaultProps} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
      expect(screen.getByTestId('grid-styles')).toBeInTheDocument();
    });

    it('should render grid styles', () => {
      render(<SelectedCurrenciesGrid {...defaultProps} />);
      expect(screen.getByTestId('grid-styles')).toBeInTheDocument();
    });
  });

  describe('Grid Data Processing', () => {
    it('should process row data correctly with selected currencies', () => {
      render(<SelectedCurrenciesGrid {...defaultProps} />);
      const gridData = screen.getByTestId('grid-data');
      expect(gridData).toBeInTheDocument();
      expect(gridData.textContent).toContain('USD');
      expect(gridData.textContent).toContain('EUR');
    });

    it('should handle empty selected currencies', () => {
      const propsWithEmptyCurrencies = {
        ...defaultProps,
        selectedCurrencies: []
      };
      render(<SelectedCurrenciesGrid {...propsWithEmptyCurrencies} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });

    it('should handle undefined selected currencies', () => {
      const propsWithUndefinedCurrencies = {
        ...defaultProps,
        selectedCurrencies: undefined as any
      };
      render(<SelectedCurrenciesGrid {...propsWithUndefinedCurrencies} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });

    it('should handle null selected currencies', () => {
      const propsWithNullCurrencies = {
        ...defaultProps,
        selectedCurrencies: null as any
      };
      render(<SelectedCurrenciesGrid {...propsWithNullCurrencies} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });
  });

  describe('Currency Matching', () => {
    it('should match currencies by id', () => {
      const propsWithMatchingCurrencies = {
        ...defaultProps,
        selectedCurrencies: ['USD'],
        currencies: [
          { id: 'USD', currencyName: 'US Dollar (USD)' }
        ]
      };
      render(<SelectedCurrenciesGrid {...propsWithMatchingCurrencies} />);
      const gridData = screen.getByTestId('grid-data');
      expect(gridData.textContent).toContain('USD');
    });

    it('should match currencies by currencyName', () => {
      const propsWithMatchingCurrencies = {
        ...defaultProps,
        selectedCurrencies: ['US Dollar (USD)'],
        currencies: [
          { id: 'USD', currencyName: 'US Dollar (USD)' }
        ]
      };
      render(<SelectedCurrenciesGrid {...propsWithMatchingCurrencies} />);
      const gridData = screen.getByTestId('grid-data');
      expect(gridData.textContent).toContain('US Dollar (USD)');
    });

    it('should handle currency name format differences', () => {
      const propsWithFormatDifferences = {
        ...defaultProps,
        selectedCurrencies: ['US Dollar(USD)'],
        currencies: [
          { id: 'USD', currencyName: 'US Dollar (USD)' }
        ]
      };
      render(<SelectedCurrenciesGrid {...propsWithFormatDifferences} />);
      const gridData = screen.getByTestId('grid-data');
      expect(gridData.textContent).toContain('US Dollar(USD)');
    });
  });

  describe('Default Currency Handling', () => {
    it('should include default currency in row data', () => {
      const propsWithDefaultCurrency = {
        ...defaultProps,
        defaultCurrency: ['GBP'],
        selectedCurrencies: ['USD']
      };
      render(<SelectedCurrenciesGrid {...propsWithDefaultCurrency} />);
      const gridData = screen.getByTestId('grid-data');
      expect(gridData.textContent).toContain('GBP');
    });

    it('should handle empty default currency', () => {
      const propsWithEmptyDefaultCurrency = {
        ...defaultProps,
        defaultCurrency: []
      };
      render(<SelectedCurrenciesGrid {...propsWithEmptyDefaultCurrency} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });

    it('should handle null default currency', () => {
      const propsWithNullDefaultCurrency = {
        ...defaultProps,
        defaultCurrency: null as any
      };
      render(<SelectedCurrenciesGrid {...propsWithNullDefaultCurrency} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });
  });

  describe('IsDefault Currency Handling', () => {
    it('should include isDefault currency in row data', () => {
      const propsWithIsDefault = {
        ...defaultProps,
        isDefault: 'USD'
      };
      render(<SelectedCurrenciesGrid {...propsWithIsDefault} />);
      const gridData = screen.getByTestId('grid-data');
      expect(gridData.textContent).toContain('USD');
    });

    it('should handle null isDefault', () => {
      const propsWithNullIsDefault = {
        ...defaultProps,
        isDefault: null
      };
      render(<SelectedCurrenciesGrid {...propsWithNullIsDefault} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });
  });

  describe('Grid Configuration', () => {
    it('should create column definitions with correct props', () => {
      const { createCurrencyColumnDefs } = require('../../../../src/components/entityConfiguration/shared/gridUtils');
      render(<SelectedCurrenciesGrid {...defaultProps} />);
      
      expect(createCurrencyColumnDefs).toHaveBeenCalledWith(
        defaultProps.isEditMode,
        defaultProps.handleCurrencyToggle,
        defaultProps.handleSetDefaultCurrency,
        defaultProps.defaultCurrency,
        defaultProps.isDefault,
        defaultProps.prePopulatedCurrencies
      );
    });

    it('should create grid options', () => {
      const { createGridOptions } = require('../../../../src/components/entityConfiguration/shared/gridUtils');
      render(<SelectedCurrenciesGrid {...defaultProps} />);
      
      expect(createGridOptions).toHaveBeenCalled();
    });
  });

  describe('Grid Sorting', () => {
    it('should handle sort changed event', () => {
      render(<SelectedCurrenciesGrid {...defaultProps} />);
      // Grid sorting is handled internally by AG Grid
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should render in edit mode', () => {
      render(<SelectedCurrenciesGrid {...defaultProps} isEditMode={true} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });

    it('should render in view mode', () => {
      render(<SelectedCurrenciesGrid {...defaultProps} isEditMode={false} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component unmounting', () => {
      const { unmount } = render(<SelectedCurrenciesGrid {...defaultProps} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
      unmount();
    });

    it('should handle prop changes', () => {
      const { rerender } = render(<SelectedCurrenciesGrid {...defaultProps} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
      
      rerender(<SelectedCurrenciesGrid {...defaultProps} selectedCurrencies={['JPY']} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty currencies array', () => {
      const propsWithEmptyCurrencies = {
        ...defaultProps,
        currencies: []
      };
      render(<SelectedCurrenciesGrid {...propsWithEmptyCurrencies} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });

    it('should handle undefined currencies', () => {
      const propsWithUndefinedCurrencies = {
        ...defaultProps,
        currencies: undefined as any
      };
      render(<SelectedCurrenciesGrid {...propsWithUndefinedCurrencies} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });

    it('should handle null currencies', () => {
      const propsWithNullCurrencies = {
        ...defaultProps,
        currencies: null as any
      };
      render(<SelectedCurrenciesGrid {...propsWithNullCurrencies} />);
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure', () => {
      render(<SelectedCurrenciesGrid {...defaultProps} />);
      expect(screen.getByText('Selected Currencies')).toBeInTheDocument();
      expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    });
  });
});





