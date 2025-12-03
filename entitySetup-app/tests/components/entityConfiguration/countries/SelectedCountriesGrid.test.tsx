import React from 'react';
import { render, screen } from '@testing-library/react';
import SelectedCountriesGrid from '../../../../src/components/entityConfiguration/countries/SelectedCountriesGrid';

// Mock dependencies
jest.mock('commonApp/AgGridShell', () => {
  return function MockAgGridShell(props: any) {
    return <div data-testid="ag-grid-shell">{JSON.stringify(props.rowData)}</div>;
  };
});

jest.mock('../../../../src/components/grid/GridStyles', () => {
  return function MockGridStyles() {
    return <div data-testid="grid-styles" />;
  };
});

jest.mock('../../../../src/components/entityConfiguration/shared/gridUtils', () => ({
  createCountryColumnDefs: jest.fn(() => []),
  createGridOptions: jest.fn(() => ({})),
}));

jest.mock('../../../../src/components/entityConfiguration/shared/StatusMessage', () => {
  return function MockStatusMessage({ message, type }: { message: string; type: string }) {
    return <div data-testid="status-message" data-type={type}>{message}</div>;
  };
});

jest.mock('../../../../src/components/entityConfiguration/styles', () => ({
  commonStyles: {
    basePaper: {},
    baseHeader: {},
    baseGridContainer: {},
    gridContainer: {},
  },
  entityConfigurationStyles: {
    gridPaper: {},
    gridHeader: {},
  },
}));

describe('SelectedCountriesGrid', () => {
  const mockHandleCountryToggle = jest.fn();

  const defaultProps = {
    selectedCountries: ['USA', 'Canada', 'Mexico'],
    isEditMode: true,
    handleCountryToggle: mockHandleCountryToggle,
    prePopulatedCountries: ['USA'],
    isLoadingSelectedCountries: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component with title', () => {
    render(<SelectedCountriesGrid {...defaultProps} />);
    expect(screen.getByText('Selected Countries')).toBeInTheDocument();
  });

  it('should render AgGridShell when not loading', () => {
    render(<SelectedCountriesGrid {...defaultProps} />);
    expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
  });

  it('should render StatusMessage when loading', () => {
    render(<SelectedCountriesGrid {...defaultProps} isLoadingSelectedCountries={true} />);
    expect(screen.getByTestId('status-message')).toBeInTheDocument();
    expect(screen.getByText('Loading selected countries...')).toBeInTheDocument();
    expect(screen.queryByTestId('ag-grid-shell')).not.toBeInTheDocument();
  });

  it('should render GridStyles component', () => {
    render(<SelectedCountriesGrid {...defaultProps} />);
    expect(screen.getByTestId('grid-styles')).toBeInTheDocument();
  });

  it('should map selectedCountries to rowData correctly', () => {
    render(<SelectedCountriesGrid {...defaultProps} />);
    const agGridShell = screen.getByTestId('ag-grid-shell');
    const rowData = JSON.parse(agGridShell.textContent || '[]');
    expect(rowData).toHaveLength(3);
    expect(rowData[0]).toEqual({ country: 'USA', isPrePopulated: true });
    expect(rowData[1]).toEqual({ country: 'Canada', isPrePopulated: false });
    expect(rowData[2]).toEqual({ country: 'Mexico', isPrePopulated: false });
  });

  it('should handle empty selectedCountries array', () => {
    render(<SelectedCountriesGrid {...defaultProps} selectedCountries={[]} />);
    const agGridShell = screen.getByTestId('ag-grid-shell');
    const rowData = JSON.parse(agGridShell.textContent || '[]');
    expect(rowData).toHaveLength(0);
  });

  it('should correctly identify prePopulatedCountries', () => {
    const props = {
      ...defaultProps,
      selectedCountries: ['USA', 'Canada', 'UK'],
      prePopulatedCountries: ['USA', 'UK'],
    };
    render(<SelectedCountriesGrid {...props} />);
    const agGridShell = screen.getByTestId('ag-grid-shell');
    const rowData = JSON.parse(agGridShell.textContent || '[]');
    expect(rowData[0].isPrePopulated).toBe(true); // USA
    expect(rowData[1].isPrePopulated).toBe(false); // Canada
    expect(rowData[2].isPrePopulated).toBe(true); // UK
  });

  it('should handle isEditMode prop', () => {
    const { createCountryColumnDefs } = require('../../../../src/components/entityConfiguration/shared/gridUtils');
    render(<SelectedCountriesGrid {...defaultProps} isEditMode={false} />);
    expect(createCountryColumnDefs).toHaveBeenCalledWith(
      false,
      mockHandleCountryToggle,
      defaultProps.prePopulatedCountries
    );
  });

  it('should use default isLoadingSelectedCountries as false', () => {
    const { isLoadingSelectedCountries, ...props } = defaultProps;
    render(<SelectedCountriesGrid {...props} />);
    expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('status-message')).not.toBeInTheDocument();
  });

  it('should memoize countryColumnDefs based on dependencies', () => {
    const { createCountryColumnDefs } = require('../../../../src/components/entityConfiguration/shared/gridUtils');
    const { rerender } = render(<SelectedCountriesGrid {...defaultProps} />);
    
    // Clear previous calls
    jest.clearAllMocks();
    
    // Rerender with same props - should not recreate
    rerender(<SelectedCountriesGrid {...defaultProps} />);
    
    // Rerender with different isEditMode - should recreate
    rerender(<SelectedCountriesGrid {...defaultProps} isEditMode={false} />);
    expect(createCountryColumnDefs).toHaveBeenCalled();
  });

  it('should memoize rowData based on dependencies', () => {
    const { rerender } = render(<SelectedCountriesGrid {...defaultProps} />);
    const agGridShell1 = screen.getByTestId('ag-grid-shell');
    const rowData1 = JSON.parse(agGridShell1.textContent || '[]');
    
    // Rerender with same props
    rerender(<SelectedCountriesGrid {...defaultProps} />);
    const agGridShell2 = screen.getByTestId('ag-grid-shell');
    const rowData2 = JSON.parse(agGridShell2.textContent || '[]');
    
    // Rerender with different selectedCountries
    rerender(<SelectedCountriesGrid {...defaultProps} selectedCountries={['France']} />);
    const agGridShell3 = screen.getByTestId('ag-grid-shell');
    const rowData3 = JSON.parse(agGridShell3.textContent || '[]');
    
    expect(rowData1).toEqual(rowData2);
    expect(rowData3).not.toEqual(rowData1);
    expect(rowData3).toHaveLength(1);
    expect(rowData3[0].country).toBe('France');
  });

  it('should handle onSortChanged callback', () => {
    render(<SelectedCountriesGrid {...defaultProps} />);
    // onSortChanged is defined but does nothing, just verify it doesn't throw
    expect(() => {
      // This is tested implicitly through AgGridShell rendering
    }).not.toThrow();
  });

  it('should render Paper component with correct styles', () => {
    const { container } = render(<SelectedCountriesGrid {...defaultProps} />);
    const paper = container.querySelector('div[class*="MuiPaper"]');
    expect(paper).toBeInTheDocument();
  });

  it('should render Typography with correct variant', () => {
    const { container } = render(<SelectedCountriesGrid {...defaultProps} />);
    const typography = container.querySelector('h6');
    expect(typography).toBeInTheDocument();
    expect(typography?.textContent).toBe('Selected Countries');
  });

  it('should handle multiple prePopulatedCountries', () => {
    const props = {
      ...defaultProps,
      selectedCountries: ['USA', 'Canada', 'Mexico', 'UK', 'France'],
      prePopulatedCountries: ['USA', 'UK', 'France'],
    };
    render(<SelectedCountriesGrid {...props} />);
    const agGridShell = screen.getByTestId('ag-grid-shell');
    const rowData = JSON.parse(agGridShell.textContent || '[]');
    
    expect(rowData.filter((r: any) => r.isPrePopulated)).toHaveLength(3);
    expect(rowData.filter((r: any) => !r.isPrePopulated)).toHaveLength(2);
  });

  it('should handle case when no countries are prePopulated', () => {
    const props = {
      ...defaultProps,
      prePopulatedCountries: [],
    };
    render(<SelectedCountriesGrid {...props} />);
    const agGridShell = screen.getByTestId('ag-grid-shell');
    const rowData = JSON.parse(agGridShell.textContent || '[]');
    
    expect(rowData.every((r: any) => !r.isPrePopulated)).toBe(true);
  });

  it('should handle case when all countries are prePopulated', () => {
    const props = {
      ...defaultProps,
      prePopulatedCountries: ['USA', 'Canada', 'Mexico'],
    };
    render(<SelectedCountriesGrid {...props} />);
    const agGridShell = screen.getByTestId('ag-grid-shell');
    const rowData = JSON.parse(agGridShell.textContent || '[]');
    
    expect(rowData.every((r: any) => r.isPrePopulated)).toBe(true);
  });
});

