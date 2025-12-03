import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import AgGridShell from '../../../src/components/grid/AgGridShell';

// Mock AgGridReact to capture props without spreading them to DOM
jest.mock('ag-grid-react', () => ({
  AgGridReact: React.forwardRef((props: any, ref: any) => {
    // Store props in a data attribute for testing, but don't spread them to DOM
    const { rowData, columnDefs, defaultColDef, ...otherProps } = props;
    
    // Create a serializable version of otherProps that includes function names
    const serializableProps = { ...otherProps };
    if (props.getRowStyle) serializableProps.getRowStyle = 'function';
    if (props.onSortChanged) serializableProps.onSortChanged = 'function';
    if (props.components) serializableProps.components = 'object';
    
    return (
      <div 
        ref={ref} 
        data-testid="ag-grid"
        data-rowdata={JSON.stringify(rowData)}
        data-columndefs={JSON.stringify(columnDefs)}
        data-defaultcoldef={JSON.stringify(defaultColDef)}
        data-otherprops={JSON.stringify(serializableProps)}
      />
    );
  }),
}));

describe('AgGridShell', () => {
  // Test data
  const mockRowData = [{ id: 1, name: 'Test' }, { id: 2, name: 'Test2' }];
  const mockColumnDefs = [{ field: 'id' }, { field: 'name' }];
  const mockDefaultColDef = { sortable: true, filter: true };
  const mockGridOptions = { pagination: true, paginationPageSize: 10 };
  const mockGetRowStyle = jest.fn(() => ({ backgroundColor: 'red' }));

  describe('Component Structure', () => {
    it('renders grid with provided props', () => {
      const gridRef = createRef<any>();
      render(
        <AgGridShell
          gridRef={gridRef}
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
          onSortChanged={() => {}}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      expect(gridElement).toBeInTheDocument();
      expect(gridRef.current).toBeDefined();
    });

    it('renders grid with all optional props', () => {
      const gridRef = createRef<any>();
      const onSortChanged = jest.fn();
      
      render(
        <AgGridShell
          gridRef={gridRef}
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
          components={{ customComponent: () => <div>Custom</div> }}
          gridOptions={mockGridOptions}
          onSortChanged={onSortChanged}
          rowHeight={40}
          headerHeight={50}
          getRowStyle={mockGetRowStyle}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      expect(gridElement).toBeInTheDocument();
      expect(gridElement).toHaveAttribute('data-rowdata', JSON.stringify(mockRowData));
      expect(gridElement).toHaveAttribute('data-columndefs', JSON.stringify(mockColumnDefs));
      
      // Check that defaultColDef includes the new properties added by AgGridShell
      const actualDefaultColDef = JSON.parse(gridElement.getAttribute('data-defaultcoldef') || '{}');
      expect(actualDefaultColDef).toHaveProperty('sortable', true);
      expect(actualDefaultColDef).toHaveProperty('filter', true);
      expect(actualDefaultColDef).toHaveProperty('suppressMovable');
    });

    it('renders grid with minimal required props', () => {
      render(
        <AgGridShell
          rowData={[]}
          columnDefs={[]}
          defaultColDef={{}}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      expect(gridElement).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('applies default values for optional props', () => {
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      expect(otherProps.rowHeight).toBe(30);
      expect(otherProps.headerHeight).toBe(34);
    });

    it('passes custom rowHeight and headerHeight', () => {
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
          rowHeight={50}
          headerHeight={60}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      expect(otherProps.rowHeight).toBe(50);
      expect(otherProps.headerHeight).toBe(60);
    });

    it('passes components prop correctly', () => {
      const customComponent = () => <div>Custom</div>;
      
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
          components={{ customComponent }}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      expect(otherProps.components).toBeDefined();
    });

    it('passes gridOptions prop correctly', () => {
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
          gridOptions={mockGridOptions}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      
      // Check that gridOptions includes the original properties plus the new ones added by AgGridShell
      expect(otherProps.gridOptions).toHaveProperty('pagination', true);
      expect(otherProps.gridOptions).toHaveProperty('paginationPageSize', 10);
      expect(otherProps.gridOptions).toHaveProperty('defaultColDef');
    });

    it('passes getRowStyle function correctly', () => {
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
          getRowStyle={mockGetRowStyle}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      expect(otherProps.getRowStyle).toBe('function');
    });

    it('handles isDraggable prop correctly', () => {
      // Test with isDraggable=false
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
          isDraggable={false}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      const actualDefaultColDef = JSON.parse(gridElement.getAttribute('data-defaultcoldef') || '{}');
      
      // Check that suppressMovable is true when isDraggable=false
      expect(actualDefaultColDef.suppressMovable).toBe(true);
    });

    it('handles isDraggable prop with default value', () => {
      // Test with isDraggable=true (default)
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      const actualDefaultColDef = JSON.parse(gridElement.getAttribute('data-defaultcoldef') || '{}');
      
      // Check that suppressMovable is false when isDraggable=true
      expect(actualDefaultColDef.suppressMovable).toBe(false);
    });

    it('passes onSortChanged callback correctly', () => {
      const onSortChanged = jest.fn();
      
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
          onSortChanged={onSortChanged}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      expect(otherProps.onSortChanged).toBe('function');
    });
  });

  describe('Default Props and Styling', () => {
    it('applies default styling props', () => {
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      expect(otherProps.suppressCellFocus).toBe(true);
      expect(otherProps.rowStyle).toEqual({ cursor: 'default' });
      expect(otherProps.className).toBe('ag-theme-alpine');
      expect(otherProps.theme).toBe('legacy');
      expect(otherProps.enableCellTextSelection).toBe(true);
      expect(otherProps.animateRows).toBe(false);
      expect(otherProps.domLayout).toBe('normal');
      expect(otherProps.suppressScrollOnNewData).toBe(true);
      expect(otherProps.multiSortKey).toBe('ctrl');
    });

    it('applies custom rowStyle when provided', () => {
      const customRowStyle = { backgroundColor: 'blue' };
      
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
          getRowStyle={() => customRowStyle}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      expect(otherProps.getRowStyle).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty rowData', () => {
      render(
        <AgGridShell
          rowData={[]}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      expect(gridElement).toBeInTheDocument();
      expect(gridElement).toHaveAttribute('data-rowdata', '[]');
    });

    it('handles empty columnDefs', () => {
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={[]}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      expect(gridElement).toBeInTheDocument();
      expect(gridElement).toHaveAttribute('data-columndefs', '[]');
    });

    it('handles null/undefined optional props', () => {
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
          components={undefined}
          gridOptions={undefined}
          onSortChanged={undefined}
          getRowStyle={undefined}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      expect(gridElement).toBeInTheDocument();
    });

    it('handles large datasets', () => {
      const largeRowData = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      
      render(
        <AgGridShell
          rowData={largeRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      expect(gridElement).toBeInTheDocument();
      expect(gridElement).toHaveAttribute('data-rowdata', JSON.stringify(largeRowData));
    });
  });

  describe('Ref Handling', () => {
    it('forwards ref correctly', () => {
      const gridRef = createRef<any>();
      
      render(
        <AgGridShell
          gridRef={gridRef}
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      expect(gridRef.current).toBeDefined();
      expect(gridRef.current).toBeInstanceOf(HTMLDivElement);
    });

    it('works without ref', () => {
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      expect(gridElement).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('integrates with AG Grid React component', () => {
      const gridRef = createRef<any>();
      
      render(
        <AgGridShell
          gridRef={gridRef}
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      expect(gridElement).toBeInTheDocument();
      expect(gridElement.tagName).toBe('DIV');
    });

    it('maintains AG Grid specific attributes', () => {
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      expect(otherProps.className).toBe('ag-theme-alpine');
      expect(otherProps.theme).toBe('legacy');
    });
  });

  describe('Performance and Behavior', () => {
    it('applies performance optimizations', () => {
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      expect(otherProps.animateRows).toBe(false);
      expect(otherProps.suppressScrollOnNewData).toBe(true);
    });

    it('configures sorting behavior', () => {
      render(
        <AgGridShell
          rowData={mockRowData}
          columnDefs={mockColumnDefs}
          defaultColDef={mockDefaultColDef}
        />
      );
      
      const gridElement = screen.getByTestId('ag-grid');
      const otherProps = JSON.parse(gridElement.getAttribute('data-otherprops') || '{}');
      expect(otherProps.multiSortKey).toBe('ctrl');
    });
  });
});


