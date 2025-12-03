// Configuration for which stats to display in the footer
export const statsConfig = [
  { key: 'totalRows', label: 'Total rows' },
  { key: 'Count', label :"Count"}, // Shows total number of rows
  { key: 'sum', label: 'Sum' },              // Shows sum of values
  { key: 'avg', label: 'Avg' },              // Shows average
  { key: 'min', label: 'Min' },              // Shows minimum
  { key: 'max', label: 'Max' },              // Shows maximum
];

// Configuration for legend items and their colors
export const legendConfig = [
  { label: 'Error:', color: '#E23636' },     // Error color
  { label: 'Warning:', color: '#EDB95E' },   // Warning color
  { label: 'Info:', color: '#33B5E5' },      // Info color
  { label: 'Editable:', color: '#E8F1FE' },  // Editable color
];