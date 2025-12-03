
# Table Header Component

---

## Overview

The Table Header component is a modular, extensible solution for adding a feature-rich header to your data tables. It provides formatting controls, filtering, import/export, fullscreen toggling, and other interactive tools for managing table data and appearance.

---

## Features

- Font and font size selection
- Text formatting (bold, italic, underline, etc.)
- Alignment and color selectors
- Number and scale formatting
- Currency formatting
- Date formatting
- Freeze, sort, and transpose controls
- Filter and lock toggles with visual indicators
- Import, export, share, and run actions
- Integrated search bar
- Pivot menu for advanced data operations
- Responsive layout with left/right sections
- Fullscreen and exit fullscreen support (using `screenfull` library)

---


## Fullscreen Support

The Table Header includes buttons for toggling fullscreen and exiting fullscreen mode for the table area. This is implemented using the [`screenfull`](https://www.npmjs.com/package/screenfull) library, which provides a cross-browser JavaScript API for the Fullscreen API. The fullscreen/exit fullscreen icons and tooltips are managed via the `tableHeaderConfig` and are conditionally rendered based on the current fullscreen state.

> **Note:**
> The fullscreen logic is currently implemented within the Table Header component. In the future, as requirements evolve, this logic may be refactored and moved to a more appropriate location in the application architecture.

---


## Usage

```tsx
import TableHeader from 'common-app/src/components/tablecomponents/tableheader';

function MyDataTable() {
  return (
    <div className="table-container">
      <TableHeader />
      <DataGrid {...dataGridProps} />
    </div>
  );
}
```

---


## Component Structure

The TableHeader component consists of:

1. Main wrapper (`index.tsx`)
   - Manages expanded/collapsed state for selectors
   - Lays out left and right header sections

2. Selector and action subcomponents in `components/`
   - FontSelector, AlignmentSelector, ColorSelector, NumberFormatSelector, CurrencyFormatSelector, DateFormatSelector, GenericFormatSelector, ScaleSelector, FreezeSelector, FormatMenu, TransposeSelector, SortSelector, PivotMenu, ImportExportSelector, FilterAndLock, SearchBar, TextFormatting, SelectorIconButton

3. Custom hooks for logic and state management
   - useExpandableSelector (expand/collapse logic)
   - useScreenfullSubscription (fullscreen event handling)

---


## Props Interface

The main TableHeader component does not require props by default. Subcomponents may accept props for expanded state and event handlers:

```typescript
interface SelectorProps {
  expanded: boolean;
  onExpand: () => void;
  onRequestExpand?: () => void;
}
```

---


## Configuration

The TableHeader uses configuration from `tableHeaderConfig.tsx`:

```typescript
export const tableHeaderConfig = {
  font: { /* icon, tooltip, expanded options */ },
  alignment: { /* icon, tooltip, expanded options */ },
  color: { /* icon, tooltip, expanded options */ },
  numberFormat: { /* ... */ },
  scale: { /* ... */ },
  freeze: { /* ... */ },
  formatMenu: { /* ... */ },
  transpose: { /* ... */ },
  sort: { /* ... */ },
  pivotMenu: { /* ... */ },
  importExport: { /* icon, tooltip, expanded actions */ },
  filterLock: { /* filter and lock icons, tooltips */ },
  searchBar: { /* icon, tooltip, label */ },
};
```

---


## Subcomponents

### FontSelector
**Purpose:** Select font family and size, and access text formatting options.

---

### AlignmentSelector
**Purpose:** Controls for horizontal and vertical alignment of cell content.

---

### ColorSelector
**Purpose:** Pick cell background or text colors.

---

### NumberFormatSelector
**Purpose:** Number formatting options for selected cells.

---

### ScaleSelector
**Purpose:** Scaling options for numeric cell values.

---

### CurrencyFormatSelector
**Purpose:** Dropdown selector for choosing currency format for selected cells.
**Details:**
  - Reads and updates the currency format for the current selection.
  - Integrates with Redux for selected cells and formatting config.
  - Calls formatting handlers and updates the Redux store/UI.
  - Uses options and icons from `tableHeaderConfig`.

---

### DateFormatSelector
**Purpose:** Dropdown selector for choosing date format for selected cells.
**Details:**
  - Reads and updates the date format for the current selection.
  - Integrates with Redux for selected cells and formatting config.
  - Calls formatting handlers and updates the Redux store/UI.
  - Uses options and icons from `tableHeaderConfig`.

---

### GenericFormatSelector
**Purpose:** Reusable selector for various formatting options (used by currency/date selectors).

---

### FreezeSelector
**Purpose:** Freeze rows/columns in the table.

---

### FormatMenu
**Purpose:** Additional formatting options (e.g., conditional formatting).

---

### TransposeSelector
**Purpose:** Transpose table data (swap rows/columns).

---

### SortSelector
**Purpose:** Sort table data by selected column(s).

---

### PivotMenu
**Purpose:** Advanced data grouping and pivoting controls.

---

### ImportExportSelector
**Purpose:** Handles import, export, share, and run actions, and includes the search bar.

---

### FilterAndLock
**Purpose:** Toggles filters and lock status with visual feedback.

---

### SearchBar
**Purpose:** Integrated search input for table data.

---

### TextFormatting
**Purpose:** Renders text formatting icons (bold, italic, underline, etc.) with tooltips.

---

### SelectorIconButton
**Purpose:** Reusable icon button with tooltip for selector components.

---

### useExpandableSelector (hook)
**Purpose:** Custom hook to handle expand/collapse logic for selector components.

---

### useScreenfullSubscription (hook)
**Purpose:** Custom hook to handle fullscreen event subscription (used for fullscreen logic).

---


## Customization

You can customize the TableHeader by:
1. Modifying the `tableHeaderConfig` for icons, tooltips, and available options.
2. Adding or removing selector components in the main header layout.
3. Extending subcomponents for additional features or custom logic.

---