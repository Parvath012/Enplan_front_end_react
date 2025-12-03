import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgGridShellFallback from '../../../src/components/grid/AgGridShellFallback';

// Mock ag-grid-react
jest.mock('ag-grid-react', () => ({
  AgGridReact: jest.fn(({ children, ...props }) => (
    <div data-testid="ag-grid-react" {...props}>
      <div data-testid="ag-grid-props">{JSON.stringify(props)}</div>
      {children}
    </div>
  ))
}));

describe('AgGridShellFallback', () => {
  const defaultProps = {
    rowData: [
      { id: 1, name: 'Test 1', value: 100 },
      { id: 2, name: 'Test 2', value: 200 }
    ],
    columnDefs: [
      { field: 'id', headerName: 'ID' },
      { field: 'name', headerName: 'Name' },
      { field: 'value', headerName: 'Value' }
    ],
    defaultColDef: {
      sortable: true,
      filter: true
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should render with minimal props', () => {
      const minimalProps = {
        rowData: [],
        columnDefs: [],
        defaultColDef: {}
      };
      render(<AgGridShellFallback {...minimalProps} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should render with all props', () => {
      const allProps = {
        ...defaultProps,
        components: { customRenderer: jest.fn() },
        gridOptions: { rowSelection: 'single' },
        onSortChanged: jest.fn(),
        rowHeight: 40,
        headerHeight: 50,
        getRowStyle: jest.fn(),
        gridRef: React.createRef(),
        isDraggable: false
      };
      render(<AgGridShellFallback {...allProps} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should pass rowData to AgGridReact', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.rowData).toEqual(defaultProps.rowData);
    });

    it('should pass columnDefs to AgGridReact', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.columnDefs).toEqual(defaultProps.columnDefs);
    });

    it('should pass defaultColDef to AgGridReact', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.defaultColDef).toEqual({
        ...defaultProps.defaultColDef,
        suppressMovable: true
      });
    });

    it('should pass components to AgGridReact', () => {
      const components = { customRenderer: jest.fn() };
      render(<AgGridShellFallback {...defaultProps} components={components} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.components).toEqual(components);
    });

    it('should pass gridOptions to AgGridReact', () => {
      const gridOptions = { rowSelection: 'single' };
      render(<AgGridShellFallback {...defaultProps} gridOptions={gridOptions} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.gridOptions).toEqual({
        ...gridOptions,
        defaultColDef: {
          ...gridOptions.defaultColDef,
          suppressMovable: true
        }
      });
    });

    it('should pass onSortChanged to AgGridReact', () => {
      const onSortChanged = jest.fn();
      render(<AgGridShellFallback {...defaultProps} onSortChanged={onSortChanged} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.onSortChanged).toEqual(onSortChanged);
    });

    it('should pass rowHeight to AgGridReact', () => {
      const rowHeight = 40;
      render(<AgGridShellFallback {...defaultProps} rowHeight={rowHeight} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.rowHeight).toEqual(rowHeight);
    });

    it('should pass headerHeight to AgGridReact', () => {
      const headerHeight = 50;
      render(<AgGridShellFallback {...defaultProps} headerHeight={headerHeight} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.headerHeight).toEqual(headerHeight);
    });

    it('should pass getRowStyle to AgGridReact', () => {
      const getRowStyle = jest.fn();
      render(<AgGridShellFallback {...defaultProps} getRowStyle={getRowStyle} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.getRowStyle).toEqual(getRowStyle);
    });

    it('should pass gridRef to AgGridReact', () => {
      const gridRef = React.createRef();
      render(<AgGridShellFallback {...defaultProps} gridRef={gridRef} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.ref).toEqual(gridRef);
    });
  });

  describe('Default Values', () => {
    it('should use default rowHeight when not provided', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.rowHeight).toEqual(30);
    });

    it('should use default headerHeight when not provided', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.headerHeight).toEqual(34);
    });

    it('should use default isDraggable when not provided', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.defaultColDef.suppressMovable).toBe(false);
      expect(agGridProps.suppressMovableColumns).toBe(false);
    });

    it('should use custom rowHeight when provided', () => {
      const rowHeight = 40;
      render(<AgGridShellFallback {...defaultProps} rowHeight={rowHeight} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.rowHeight).toEqual(rowHeight);
    });

    it('should use custom headerHeight when provided', () => {
      const headerHeight = 50;
      render(<AgGridShellFallback {...defaultProps} headerHeight={headerHeight} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.headerHeight).toEqual(headerHeight);
    });

    it('should use custom isDraggable when provided', () => {
      render(<AgGridShellFallback {...defaultProps} isDraggable={false} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.defaultColDef.suppressMovable).toBe(true);
      expect(agGridProps.suppressMovableColumns).toBe(true);
    });
  });

  describe('Grid Configuration', () => {
    it('should set suppressCellFocus to true', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.suppressCellFocus).toBe(true);
    });

    it('should set rowStyle cursor to default', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.rowStyle).toEqual({ cursor: 'default' });
    });

    it('should set className to ag-theme-alpine', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.className).toBe('ag-theme-alpine');
    });

    it('should set theme to legacy', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.theme).toBe('legacy');
    });

    it('should set enableCellTextSelection to true', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.enableCellTextSelection).toBe(true);
    });

    it('should set animateRows to false', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.animateRows).toBe(false);
    });

    it('should set domLayout to normal', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.domLayout).toBe('normal');
    });

    it('should set suppressScrollOnNewData to true', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.suppressScrollOnNewData).toBe(true);
    });

    it('should set multiSortKey to ctrl', () => {
      render(<AgGridShellFallback {...defaultProps} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.multiSortKey).toBe('ctrl');
    });
  });

  describe('Draggable Configuration', () => {
    it('should set suppressMovable to false when isDraggable is true', () => {
      render(<AgGridShellFallback {...defaultProps} isDraggable={true} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.defaultColDef.suppressMovable).toBe(false);
      expect(agGridProps.suppressMovableColumns).toBe(false);
    });

    it('should set suppressMovable to true when isDraggable is false', () => {
      render(<AgGridShellFallback {...defaultProps} isDraggable={false} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.defaultColDef.suppressMovable).toBe(true);
      expect(agGridProps.suppressMovableColumns).toBe(true);
    });

    it('should handle isDraggable in gridOptions', () => {
      const gridOptions = { rowSelection: 'single' };
      render(<AgGridShellFallback {...defaultProps} gridOptions={gridOptions} isDraggable={false} />);
      const agGridProps = JSON.parse(screen.getByTestId('ag-grid-props').textContent || '{}');
      expect(agGridProps.gridOptions.defaultColDef.suppressMovable).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty rowData', () => {
      const propsWithEmptyData = {
        ...defaultProps,
        rowData: []
      };
      render(<AgGridShellFallback {...propsWithEmptyData} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle empty columnDefs', () => {
      const propsWithEmptyColumns = {
        ...defaultProps,
        columnDefs: []
      };
      render(<AgGridShellFallback {...propsWithEmptyColumns} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle null rowData', () => {
      const propsWithNullData = {
        ...defaultProps,
        rowData: null
      };
      render(<AgGridShellFallback {...propsWithNullData} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle null columnDefs', () => {
      const propsWithNullColumns = {
        ...defaultProps,
        columnDefs: null
      };
      render(<AgGridShellFallback {...propsWithNullColumns} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle undefined defaultColDef', () => {
      const propsWithUndefinedDefaultColDef = {
        ...defaultProps,
        defaultColDef: undefined
      };
      render(<AgGridShellFallback {...propsWithUndefinedDefaultColDef} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle undefined gridOptions', () => {
      const propsWithUndefinedGridOptions = {
        ...defaultProps,
        gridOptions: undefined
      };
      render(<AgGridShellFallback {...propsWithUndefinedGridOptions} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle undefined components', () => {
      const propsWithUndefinedComponents = {
        ...defaultProps,
        components: undefined
      };
      render(<AgGridShellFallback {...propsWithUndefinedComponents} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle undefined onSortChanged', () => {
      const propsWithUndefinedOnSortChanged = {
        ...defaultProps,
        onSortChanged: undefined
      };
      render(<AgGridShellFallback {...propsWithUndefinedOnSortChanged} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle undefined getRowStyle', () => {
      const propsWithUndefinedGetRowStyle = {
        ...defaultProps,
        getRowStyle: undefined
      };
      render(<AgGridShellFallback {...propsWithUndefinedGetRowStyle} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle undefined gridRef', () => {
      const propsWithUndefinedGridRef = {
        ...defaultProps,
        gridRef: undefined
      };
      render(<AgGridShellFallback {...propsWithUndefinedGridRef} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('should handle component unmounting', () => {
      const { unmount } = render(<AgGridShellFallback {...defaultProps} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
      unmount();
    });

    it('should handle prop changes', () => {
      const { rerender } = render(<AgGridShellFallback {...defaultProps} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();

      const newProps = {
        ...defaultProps,
        rowData: [{ id: 3, name: 'Test 3', value: 300 }]
      };
      rerender(<AgGridShellFallback {...newProps} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('should handle different data types in rowData', () => {
      const propsWithDifferentDataTypes = {
        ...defaultProps,
        rowData: [
          { id: 1, name: 'String', value: 100, active: true, date: new Date() },
          { id: 2, name: null, value: undefined, active: false, date: null }
        ]
      };
      render(<AgGridShellFallback {...propsWithDifferentDataTypes} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle complex columnDefs', () => {
      const propsWithComplexColumns = {
        ...defaultProps,
        columnDefs: [
          { field: 'id', headerName: 'ID', width: 100, sortable: true },
          { field: 'name', headerName: 'Name', width: 200, filter: true },
          { field: 'value', headerName: 'Value', width: 150, cellRenderer: 'customRenderer' }
        ]
      };
      render(<AgGridShellFallback {...propsWithComplexColumns} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle complex gridOptions', () => {
      const propsWithComplexGridOptions = {
        ...defaultProps,
        gridOptions: {
          rowSelection: 'multiple',
          enableRangeSelection: true,
          enableCharts: true,
          sideBar: true,
          defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true
          }
        }
      };
      render(<AgGridShellFallback {...propsWithComplexGridOptions} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large datasets', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000
      }));
      
      const propsWithLargeDataset = {
        ...defaultProps,
        rowData: largeDataset
      };
      render(<AgGridShellFallback {...propsWithLargeDataset} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });

    it('should handle many columns', () => {
      const manyColumns = Array.from({ length: 50 }, (_, i) => ({
        field: `field${i}`,
        headerName: `Column ${i}`,
        width: 100
      }));
      
      const propsWithManyColumns = {
        ...defaultProps,
        columnDefs: manyColumns
      };
      render(<AgGridShellFallback {...propsWithManyColumns} />);
      expect(screen.getByTestId('ag-grid-react')).toBeInTheDocument();
    });
  });
});
