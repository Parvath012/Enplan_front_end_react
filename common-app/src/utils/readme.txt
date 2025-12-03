# Utils Folder Overview

This folder contains utility files for grid/table operations, cell formatting, time formatting, and data parsing. All utility logic should be placed here to promote reuse and maintainability across the application.

**Current utility files:**
- `cellDisplayUtils.ts`: Utilities for displaying cell values (currency, date, etc.)
  - Currency, date, and number formatting for grid cells
  - Centralizes all display logic for consistency
  - Use `getDisplayValue(params, formatting)` to get the correct display value for any cell
- `cellFormattingHandlers.ts`: Utilities for formatting cell values and handling cell formatting actions
  - Formatting numbers, currencies, and dates
  - Handler functions for updating cell formatting in Redux/UI
  - All logic for updating cell formatting and dispatching changes is centralized here for maintainability and reuse
- `gridParser.ts`: Utility for parsing CSV data into row objects
  - Converts CSV strings to row objects for grid consumption
  - Handles header mapping and value parsing
- `timeUtils.ts`: Utility for time formatting (see below)
  - Time formatting and parsing helpers

---


## cellDisplayUtils.ts

This file contains utility functions for displaying cell values in the grid. These functions ensure consistent formatting and presentation of cell data throughout the application.

- Handles currency formatting (INR, USD, EUR, GBP, JPY, and system locale)
- Handles date formatting (multiple date formats)
- Handles decimal/number formatting (decimal places, comma separators)
- Centralizes all display logic for cell values so formatting is consistent across the application
- Use `getDisplayValue(params, formatting)` to get the correct display value for any cell

**When to use:**
If you need to display a cell value with specific formatting, add or update the logic in this file instead of duplicating it across components.

**Note:**
This file is intended for all cell display logic. Going forward, add any logic for cell value formatting, parsing, or display here to promote reuse and maintainability.

---

---


## cellFormattingHandlers.ts

This file contains utility functions for formatting cell values and handling cell formatting actions. These functions help update cell formatting in the Redux store and UI, and ensure consistent formatting logic across the application.

- Handles formatting numbers with decimal places and comma separators
- Handles formatting values as currency (Indian and international styles)
- Handles cell formatting actions (increase/decrease decimal, apply comma, currency, date format, etc.)
- Provides handler functions to update cell formatting in the Redux store and UI, such as `handleCellFormatting`, `handleCurrencyFormattingAction`, and `handleDateFormattingAction`
- All logic for updating cell formatting and dispatching changes is centralized here for maintainability and reuse

**When to use:**
If you need to implement or update cell formatting logic or actions, add or update the logic in this file instead of duplicating it across components.

**Note:**
This file is intended for all cell formatting logic and handlers. Going forward, add any logic for cell formatting, parsing, or formatting actions here to promote reuse and maintainability.

---

## gridParser.ts

This file provides utility functions for parsing CSV data into row objects for use in the grid/table components.

- Converts CSV strings into structured row objects
- Handles header mapping and value parsing
- Ensures consistent data ingestion for grid/table features

**When to use:**
Use this utility whenever you need to import or process CSV data for use in the grid. Add new parsing logic here if new data formats are introduced.

**Note:**
Centralize all CSV/grid data parsing logic here to avoid duplication and ensure consistency.

---

---


## timeUtils.ts

This file contains utility functions related to time formatting. These are reusable functions that help maintain consistency in how time is displayed throughout the application.

- Provides helpers for formatting, parsing, and comparing time values
- Ensures all time-related logic is consistent and reusable

**When to use:**
If you need to perform any time-related formatting, parsing, or comparisons, add the logic in this file instead of duplicating it across components.

**Note:**
This file is intended for all time-based utility functions. Going forward, add any logic for time formatting, parsing, comparisons, etc. here to promote reuse and maintainability.

---

---


## Contributing to Utils

- Add new utility files here as needed for other reusable logic.
- Keep utility functions modular, well-documented, and easy to test.
- Update this readme with a summary and section for any new utility file.
- This folder is the single source of truth for all grid/table-related utility logic in the application.

---