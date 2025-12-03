import React from 'react';
import { render, screen } from '@testing-library/react';
import SafeNumberRenderer from '../../src/ag grid/SafeNumberRenderer';
import { ICellRendererParams } from 'ag-grid-community';

describe('SafeNumberRenderer', () => {
  const defaultProps: ICellRendererParams = {
    value: 123.45,
    node: {
      group: false,
      allLeafChildren: []
    },
    column: {
      getColId: () => 'testColumn'
    }
  };

  it('renders without crashing', () => {
    render(<SafeNumberRenderer {...defaultProps} />);
    expect(screen.getByText('123.45')).toBeInTheDocument();
  });

  it('renders with different values', () => {
    const { rerender } = render(<SafeNumberRenderer {...defaultProps} value={0} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
    
    rerender(<SafeNumberRenderer {...defaultProps} value={-123.45} />);
    expect(screen.getByText('-123.45')).toBeInTheDocument();
    
    rerender(<SafeNumberRenderer {...defaultProps} value={999999.99} />);
    expect(screen.getByText('999999.99')).toBeInTheDocument();
  });

  it('renders with different formats', () => {
    const { rerender } = render(<SafeNumberRenderer {...defaultProps} format="number" />);
    expect(screen.getByText('123.45')).toBeInTheDocument();
    
    rerender(<SafeNumberRenderer {...defaultProps} format="percentage" />);
    expect(screen.getByText('123.45')).toBeInTheDocument();
    
    rerender(<SafeNumberRenderer {...defaultProps} format="decimal" />);
    expect(screen.getByText('123.45')).toBeInTheDocument();
  });

  it('handles null values', () => {
    render(<SafeNumberRenderer {...defaultProps} value={null} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('handles undefined values', () => {
    render(<SafeNumberRenderer {...defaultProps} value={undefined} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('handles zero values', () => {
    render(<SafeNumberRenderer {...defaultProps} value={0} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('handles negative values', () => {
    render(<SafeNumberRenderer {...defaultProps} value={-123.45} />);
    expect(screen.getByText('-123.45')).toBeInTheDocument();
  });

  it('handles very large values', () => {
    render(<SafeNumberRenderer {...defaultProps} value={999999999.99} />);
    expect(screen.getByText('999999999.99')).toBeInTheDocument();
  });

  it('handles very small values', () => {
    render(<SafeNumberRenderer {...defaultProps} value={0.0001} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('handles string numbers', () => {
    render(<SafeNumberRenderer {...defaultProps} value="123.45" />);
    expect(screen.getByText('123.45')).toBeInTheDocument();
  });

  it('handles invalid string values', () => {
    render(<SafeNumberRenderer {...defaultProps} value="invalid" />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('handles empty string values', () => {
    render(<SafeNumberRenderer {...defaultProps} value="" />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('handles boolean values', () => {
    const { unmount: unmount1 } = render(<SafeNumberRenderer {...defaultProps} value={true} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
    unmount1();
    
    const { unmount: unmount2 } = render(<SafeNumberRenderer {...defaultProps} value={false} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
    unmount2();
  });

  it('handles object values', () => {
    render(<SafeNumberRenderer {...defaultProps} value={{}} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('handles array values', () => {
    render(<SafeNumberRenderer {...defaultProps} value={[]} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('handles function values', () => {
    render(<SafeNumberRenderer {...defaultProps} value={() => {}} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('handles missing format prop', () => {
    render(<SafeNumberRenderer {...defaultProps} format={undefined} />);
    expect(screen.getByText('123.45')).toBeInTheDocument();
  });

  it('handles missing value prop', () => {
    render(<SafeNumberRenderer {...defaultProps} value={undefined} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('handles component unmounting', () => {
    const { unmount } = render(<SafeNumberRenderer {...defaultProps} />);
    unmount();
    expect(screen.queryByText('123.45')).not.toBeInTheDocument();
  });

  it('handles prop changes', () => {
    const { rerender } = render(<SafeNumberRenderer {...defaultProps} value={100} />);
    expect(screen.getByText('100.00')).toBeInTheDocument();
    
    rerender(<SafeNumberRenderer {...defaultProps} value={200} />);
    expect(screen.getByText('200.00')).toBeInTheDocument();
  });

  it('handles rapid prop changes', () => {
    const { rerender } = render(<SafeNumberRenderer {...defaultProps} value={100} />);
    
    for (let i = 0; i < 10; i++) {
      rerender(<SafeNumberRenderer {...defaultProps} value={100 + i} />);
    }
    expect(screen.getByText('109.00')).toBeInTheDocument();
  });

  it('handles edge case values', () => {
    const edgeCases = [
      Infinity,
      -Infinity,
      NaN,
      Number.MAX_VALUE,
      Number.MIN_VALUE,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER
    ];
    
    edgeCases.forEach(value => {
      const { unmount } = render(<SafeNumberRenderer {...defaultProps} value={value} />);
      // Check if the component renders without crashing
      const element = screen.getByTestId('safe-number-renderer');
      expect(element).toBeInTheDocument();
      unmount();
    });
  });

  it('handles different number formats', () => {
    const formats = ['currency', 'number', 'percentage', 'decimal', 'integer'];
    
    formats.forEach(format => {
      const { unmount } = render(<SafeNumberRenderer {...defaultProps} format={format} />);
      expect(screen.getByText('123.45')).toBeInTheDocument();
      unmount();
    });
  });

  it('handles precision values', () => {
    render(<SafeNumberRenderer {...defaultProps} value={123.456789} />);
    expect(screen.getByText('123.46')).toBeInTheDocument();
  });

  it('handles scientific notation', () => {
    render(<SafeNumberRenderer {...defaultProps} value={1.23e5} />);
    expect(screen.getByText('123000.00')).toBeInTheDocument();
  });

  it('handles mixed data types', () => {
    const mixedValues = [
      '123.45',
      123.45,
      '0',
      0,
      '',
      null,
      undefined,
      true,
      false,
      {},
      [],
      () => {}
    ];
    
    mixedValues.forEach(value => {
      const { unmount } = render(<SafeNumberRenderer {...defaultProps} value={value} />);
      // Check if the component renders without crashing
      expect(screen.getByText(/0\.00|123\.45/)).toBeInTheDocument();
      unmount();
    });
  });

  describe('Grouped Rows', () => {
    it('handles grouped rows with numeric children', () => {
      const groupedProps: ICellRendererParams = {
        ...defaultProps,
        node: {
          group: true,
          allLeafChildren: [
            { data: { testColumn: 10.5 } },
            { data: { testColumn: 20.3 } },
            { data: { testColumn: 5.2 } }
          ]
        }
      };

      render(<SafeNumberRenderer {...groupedProps} />);
      expect(screen.getByText('36.00')).toBeInTheDocument();
    });

    it('handles grouped rows with mixed data types', () => {
      const groupedProps: ICellRendererParams = {
        ...defaultProps,
        node: {
          group: true,
          allLeafChildren: [
            { data: { testColumn: 10.5 } },
            { data: { testColumn: '20.3' } },
            { data: { testColumn: null } },
            { data: { testColumn: undefined } },
            { data: { testColumn: 'invalid' } }
          ]
        }
      };

      render(<SafeNumberRenderer {...groupedProps} />);
      expect(screen.getByText('10.50')).toBeInTheDocument();
    });

    it('handles grouped rows with no numeric values', () => {
      const groupedProps: ICellRendererParams = {
        ...defaultProps,
        node: {
          group: true,
          allLeafChildren: [
            { data: { testColumn: 'invalid' } },
            { data: { testColumn: null } },
            { data: { testColumn: undefined } }
          ]
        }
      };

      render(<SafeNumberRenderer {...groupedProps} />);
      expect(screen.getByText('0.00')).toBeInTheDocument();
    });

    it('handles grouped rows with empty children array', () => {
      const groupedProps: ICellRendererParams = {
        ...defaultProps,
        node: {
          group: true,
          allLeafChildren: []
        }
      };

      render(<SafeNumberRenderer {...groupedProps} />);
      expect(screen.getByText('0.00')).toBeInTheDocument();
    });

    it('handles grouped rows with missing column id', () => {
      const groupedProps: ICellRendererParams = {
        ...defaultProps,
        node: {
          group: true,
          allLeafChildren: [
            { data: { testColumn: 10.5 } },
            { data: { testColumn: 20.3 } }
          ]
        },
        column: {
          getColId: () => undefined
        }
      };

      render(<SafeNumberRenderer {...groupedProps} />);
      expect(screen.getByText('0.00')).toBeInTheDocument();
    });

    it('handles grouped rows with null column', () => {
      const groupedProps: ICellRendererParams = {
        ...defaultProps,
        node: {
          group: true,
          allLeafChildren: [
            { data: { testColumn: 10.5 } },
            { data: { testColumn: 20.3 } }
          ]
        },
        column: null
      };

      render(<SafeNumberRenderer {...groupedProps} />);
      expect(screen.getByText('0.00')).toBeInTheDocument();
    });

    it('handles grouped rows with children having no data', () => {
      const groupedProps: ICellRendererParams = {
        ...defaultProps,
        node: {
          group: true,
          allLeafChildren: [
            { data: null },
            { data: undefined },
            { data: {} }
          ]
        }
      };

      render(<SafeNumberRenderer {...groupedProps} />);
      expect(screen.getByText('0.00')).toBeInTheDocument();
    });

    it('handles grouped rows with different column ids', () => {
      const groupedProps: ICellRendererParams = {
        ...defaultProps,
        node: {
          group: true,
          allLeafChildren: [
            { data: { amount: 10.5 } },
            { data: { amount: 20.3 } }
          ]
        },
        column: {
          getColId: () => 'amount'
        }
      };

      render(<SafeNumberRenderer {...groupedProps} />);
      expect(screen.getByText('30.80')).toBeInTheDocument();
    });

    it('handles grouped rows with large numbers', () => {
      const groupedProps: ICellRendererParams = {
        ...defaultProps,
        node: {
          group: true,
          allLeafChildren: [
            { data: { testColumn: 999999.99 } },
            { data: { testColumn: 0.01 } }
          ]
        }
      };

      render(<SafeNumberRenderer {...groupedProps} />);
      expect(screen.getByText('1000000.00')).toBeInTheDocument();
    });

    it('handles grouped rows with negative numbers', () => {
      const groupedProps: ICellRendererParams = {
        ...defaultProps,
        node: {
          group: true,
          allLeafChildren: [
            { data: { testColumn: -10.5 } },
            { data: { testColumn: 20.3 } },
            { data: { testColumn: -5.2 } }
          ]
        }
      };

      render(<SafeNumberRenderer {...groupedProps} />);
      expect(screen.getByText('4.60')).toBeInTheDocument();
    });
  });
});