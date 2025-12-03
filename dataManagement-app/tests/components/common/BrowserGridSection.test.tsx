import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrowserGridSection from '../../../src/components/common/BrowserGridSection';
import { AgGridReact } from 'ag-grid-react';

// Mock AgGridShell
jest.mock('../../../src/components/common/browserLazyImports', () => ({
  AgGridShell: ({ gridRef, rowData, columnDefs, defaultColDef, gridOptions, getRowStyle }: any) => (
    <div data-testid="ag-grid-shell">
      <div data-testid="row-count">{rowData?.length || 0}</div>
      <div data-testid="column-count">{columnDefs?.length || 0}</div>
    </div>
  )
}));

// Mock BrowserErrorDisplay
jest.mock('../../../src/components/common/BrowserErrorDisplay', () => {
  return ({ errorMessage, entityName }: any) => (
    <div data-testid="error-display">
      <div>{errorMessage}</div>
      <div>{entityName}</div>
    </div>
  );
});

describe('BrowserGridSection', () => {
  const mockGridRef = React.createRef<AgGridReact>();
  const mockGridContainerRef = React.createRef<HTMLDivElement>();
  
  const defaultProps = {
    loadingError: null,
    isDrawerReady: true,
    gridRef: mockGridRef,
    gridContainerRef: mockGridContainerRef,
    rowData: [{ id: '1', name: 'Test' }],
    columnDefs: [{ field: 'name' }],
    defaultColDef: {},
    gridOptions: {},
    getRowStyle: jest.fn(),
    entityName: 'Test Entities',
    gridContainerClassName: 'grid-container',
    gridWrapperClassName: 'grid-wrapper'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render AgGridShell when drawer is ready and no error', () => {
    render(<BrowserGridSection {...defaultProps} />);
    
    expect(screen.getByTestId('ag-grid-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('error-display')).not.toBeInTheDocument();
  });

  it('should render error display when loadingError is present', () => {
    render(
      <BrowserGridSection 
        {...defaultProps} 
        loadingError="Failed to load data" 
      />
    );
    
    expect(screen.getByTestId('error-display')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    expect(screen.getByText('Test Entities')).toBeInTheDocument();
    expect(screen.queryByTestId('ag-grid-shell')).not.toBeInTheDocument();
  });

  it('should render placeholder when drawer is not ready', () => {
    const { container } = render(
      <BrowserGridSection 
        {...defaultProps} 
        isDrawerReady={false} 
      />
    );
    
    const placeholder = container.querySelector('.grid-wrapper > div');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveStyle({
      height: '400px',
      backgroundColor: '#ffffff'
    });
  });

  it('should pass correct props to AgGridShell', () => {
    const rowData = [{ id: '1' }, { id: '2' }];
    const columnDefs = [{ field: 'id' }, { field: 'name' }];
    
    render(
      <BrowserGridSection 
        {...defaultProps} 
        rowData={rowData}
        columnDefs={columnDefs}
      />
    );
    
    expect(screen.getByTestId('row-count')).toHaveTextContent('2');
    expect(screen.getByTestId('column-count')).toHaveTextContent('2');
  });

  it('should apply correct class names', () => {
    const { container } = render(<BrowserGridSection {...defaultProps} />);
    
    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer).toHaveClass('grid-container');
    
    const gridWrapper = gridContainer.firstChild as HTMLElement;
    expect(gridWrapper).toHaveClass('grid-wrapper');
  });

  it('should prioritize error display over grid when both error and drawer ready', () => {
    render(
      <BrowserGridSection 
        {...defaultProps} 
        loadingError="Error occurred"
        isDrawerReady={true}
      />
    );
    
    expect(screen.getByTestId('error-display')).toBeInTheDocument();
    expect(screen.queryByTestId('ag-grid-shell')).not.toBeInTheDocument();
  });

  it('should render empty placeholder when drawer not ready and no error', () => {
    const { container } = render(
      <BrowserGridSection 
        {...defaultProps} 
        isDrawerReady={false}
        loadingError={null}
      />
    );
    
    const placeholder = container.querySelector('.grid-wrapper > div');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder?.textContent).toBe('');
  });
});

