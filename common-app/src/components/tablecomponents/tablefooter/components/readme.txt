# Table Footer Component

## Overview

The Table Footer component is a comprehensive, reusable solution for adding a footer to data tables. It provides statistical information about your data, display controls, and interactive features for data grid integration.

## Features

- 🔹 Dynamic statistics calculation
- 🔹 Customizable stats display (total rows, sum, average, min, max)
- 🔹 Color-coded legend system
- 🔹 Data refresh functionality
- 🔹 Interactive zoom controls
- 🔹 Responsive layout with distinct sections

## Installation

No additional installation required beyond existing project dependencies:
- `@mui/material`
- `@carbon/icons-react`

## Usage

```tsx
import TableFooter from 'common-app/src/components/tablefooter';

// Inside your component
function MyDataTable() {
  const dataArray = [1, 2, 3, 4, 5];
  
  return (
    <div className="table-container">
      <DataGrid {...dataGridProps} />
      <TableFooter data={dataArray} />
    </div>
  );
}
```

## Component Structure

The TableFooter component consists of:

1. A wrapper component (`index.tsx`) that handles:
   - Statistics calculation from provided data
   - Zoom state management
   - Passing props to the presentation component

2. A presentation component (`components/index.tsx`) that:
   - Renders the stats display
   - Shows color legend
   - Provides refresh button
   - Renders zoom controls

## Props Interface

```typescript
// Main TableFooter component props
type TableFooterProps = {
  data?: number[]; // Optional array of numbers to calculate stats from
};

// Internal TableFooterComponent props
interface FooterProps {
  statsData: {
    totalRows: number;
    sum: number;
    avg: number | string;
    min: number;
    max: number;
    [key: string]: any;
  };
  onRefresh?: () => void;
  zoomPercentage?: number;
  onZoomChange?: (zoom: number) => void;
  legendItems?: Array<{ label: string; color: string }>;
  minZoom?: number;
  maxZoom?: number;
}
```

## Configuration

The TableFooter uses configuration from `tableFooterConfig.tsx`:

```typescript
// Stats configuration
export const statsConfig = [
  { key: 'totalRows', label: 'Total rows' },
  { key: 'sum', label: 'Sum' },
  { key: 'avg', label: 'Avg' },
  { key: 'min', label: 'Min' },
  { key: 'max', label: 'Max' },
];

// Legend configuration
export const legendConfig = [
  { label: 'Error:', color: '#E23636' },
  { label: 'Warning:', color: '#EDB95E' },
  { label: 'Info:', color: '#33B5E5' },
  { label: 'Editable:', color: '#E8F1FE' },
];
```

## Subcomponents

### Stats Display

Renders configurable statistics in the footer's left section based on the `statsConfig`.

### Legend Display

Visualizes color-coded legend items with labels based on the `legendConfig`.

### Data Refresh Button

Provides a button to trigger data refresh operations with the `onRefresh` callback.

### Zoom Controls

Offers interactive tools for adjusting zoom levels with:
- Current zoom percentage display
- Min/max zoom constraints (defaults to 50-150%)
- Increment/decrement buttons
- Slider for precise adjustment

## Customization

The TableFooter component can be customized by:
1. Modifying the `statsConfig` and `legendConfig` arrays
2. Implementing custom refresh logic in the `onRefresh` handler
3. Setting initial zoom values
4. Providing custom data arrays for statistics calculation