# Advanced Search Component

A comprehensive, reusable search component that provides multiple search modes and advanced filtering capabilities for data tables.

## Features

### 🔍 Multiple Search Modes
- **Default Search**: Simple text search across all data
- **Data Search**: Search across all table values
- **Column Search**: Filter columns using regex patterns
- **Row Search**: Advanced query syntax with operators

### 🎯 Advanced Filtering
- **Column Filter**: Drag-and-drop column selection with search
- **Query AutoComplete**: Intelligent query building with suggestions
- **Real-time Results**: Instant filtering and display updates

### 🎨 Modern UI
- Carbon Design System integration
- Responsive design
- Dark mode support
- Customizable styling

## Installation

The component requires the following dependencies (already included in common-app):

```json
{
  "@carbon/icons-react": "^11.59.0",
  "classnames": "^2.5.1",
  "rsuite": "^5.83.2",
  "simplebar-react": "^3.3.2"
}
```

## Usage

### Basic Usage

```tsx
import { AdvancedSearchComponent, SearchColumn, SearchRow } from './components/search';

const columns: SearchColumn[] = [
  { id: "id", name: "ID", type: "numerical" },
  { id: "name", name: "Name", type: "string" },
  { id: "age", name: "Age", type: "numerical" },
  { id: "email", name: "Email", type: "string" },
];

const data: SearchRow[] = [
  { id: 1, name: "John Doe", age: 30, email: "john@example.com" },
  { id: 2, name: "Jane Smith", age: 25, email: "jane@example.com" },
];

function MyComponent() {
  const handleSearchResults = (filteredData: SearchRow[], filteredColumns: SearchColumn[]) => {
    console.log('Filtered data:', filteredData);
    console.log('Filtered columns:', filteredColumns);
  };

  return (
    <AdvancedSearchComponent
      columns={columns}
      data={data}
      onSearchResults={handleSearchResults}
      placeholder="Search employees..."
      showTable={true}
      enableColumnFilter={true}
      enableRowFilter={true}
    />
  );
}
```

### Advanced Usage

```tsx
<AdvancedSearchComponent
  columns={columns}
  data={data}
  onSearchResults={handleSearchResults}
  onSearchModeChange={(mode) => console.log('Mode changed:', mode)}
  placeholder="Custom placeholder..."
  className="my-custom-search"
  showTable={true}
  enableColumnFilter={true}
  enableRowFilter={true}
/>
```

## Props

### AdvancedSearchProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `SearchColumn[]` | - | Array of column definitions |
| `data` | `SearchRow[]` | - | Array of data rows |
| `onSearchResults` | `(data: SearchRow[], columns: SearchColumn[]) => void` | - | Callback when search results change |
| `onSearchModeChange` | `(mode: string) => void` | - | Callback when search mode changes |
| `placeholder` | `string` | - | Placeholder text for search input |
| `className` | `string` | - | Additional CSS class |
| `showTable` | `boolean` | `true` | Whether to show the data table |
| `enableColumnFilter` | `boolean` | `true` | Enable column filtering |
| `enableRowFilter` | `boolean` | `true` | Enable row filtering |

### SearchColumn

```tsx
interface SearchColumn {
  id: string;
  name: string;
  type: "string" | "numerical" | "date";
}
```

### SearchRow

```tsx
interface SearchRow {
  [key: string]: any;
}
```

## Search Modes

### 1. Default Search
Simple text search across all data values.

### 2. Data Search
Search across all table values with real-time filtering.

### 3. Column Search
Filter columns using regex patterns:
- `/^[A-Z]/` - Columns starting with uppercase letters
- `age|salary` - Columns containing "age" or "salary"
- `name` - Columns containing "name"

### 4. Row Search
Advanced query syntax with operators:
- `age > 30` - Age greater than 30
- `department = Engineering` - Department equals Engineering
- `name contains John` - Name contains "John"
- `salary between 50000 80000` - Salary between 50k and 80k

## Query Operators

### Numerical Operators
- `=`, `eq`, `is` - Equals
- `!=`, `neq`, `isn` - Not equals
- `>`, `gt` - Greater than
- `<`, `lt` - Less than
- `>=`, `ge` - Greater than or equal
- `<=`, `le` - Less than or equal
- `between` - Between two values

### String Operators
- `=`, `eq`, `is` - Equals
- `!=`, `neq`, `isn` - Not equals
- `contains` - Contains text
- `not contains` - Does not contain text

### Logical Operators
- `and` - AND condition
- `or` - OR condition

## Styling

The component uses SCSS for styling and supports:

- Custom CSS classes via `className` prop
- CSS custom properties for theming
- Responsive design
- Dark mode support

### Custom Styling

```scss
.my-custom-search {
  .advanced-search-component {
    border: 2px solid #007acc;
    border-radius: 12px;
  }
  
  .search-input-container {
    background: #f0f8ff;
  }
}
```

## Examples

### Demo Component

See `SearchDemo.tsx` for a complete working example with sample data.

### Integration with Existing Tables

```tsx
// Replace existing search bar
import { AdvancedSearchComponent } from './components/search';

// In your table component
<AdvancedSearchComponent
  columns={tableColumns}
  data={tableData}
  onSearchResults={(filteredData, filteredColumns) => {
    setDisplayData(filteredData);
    setVisibleColumns(filteredColumns);
  }}
  showTable={false} // Hide built-in table if you have your own
/>
```

## Performance Considerations

- The component uses `useCallback` and `useMemo` for performance optimization
- Debounced search input prevents excessive filtering
- Virtual scrolling for large datasets (can be added)
- Memoized filter functions

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

When adding new features:

1. Update the TypeScript interfaces
2. Add corresponding SCSS styles
3. Update this README
4. Add examples to the demo component

## License

This component is part of the EnPlan project and follows the same licensing terms.


