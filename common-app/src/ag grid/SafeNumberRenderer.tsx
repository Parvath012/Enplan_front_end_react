import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';

// Safe number renderer that can handle different data types
const SafeNumberRenderer = (props: ICellRendererParams) => {
  // Handle grouped rows
  if (props.node?.group) {
    const total = props.node.allLeafChildren.reduce((sum: number, child: any) => {
      return sum + (typeof child.data?.[props.column?.getColId() || ''] === 'number' 
        ? child.data?.[props.column?.getColId() ?? ''] 
        : 0);
    }, 0);
    return <span>{total.toFixed(2)}</span>;
  }
  
  // Handle different data types
  const value = props.value;
  
  if (value === null || value === undefined) {
    return <span data-testid="safe-number-renderer">0.00</span>;
  }
  
  if (typeof value === 'number') {
    return <span data-testid="safe-number-renderer">{value.toFixed(2)}</span>;
  }
  
  if (typeof value === 'object') {
    return <span data-testid="safe-number-renderer">0.00</span>; // Handle object type
  }
  
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return <span data-testid="safe-number-renderer">{num.toFixed(2)}</span>;
    }
  }
  
  return <span data-testid="safe-number-renderer">0.00</span>;
};

export default SafeNumberRenderer;
