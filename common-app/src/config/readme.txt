
# Config Folder Overview

This folder contains configuration files for the table UI components. These files provide a single source of truth for UI metadata, menu options, and legend/statistics items. No rendering logic is present—only configuration data.

**Current config files:**
- `tableFooterConfig.tsx`: Configuration for table footer stats and legend items.
- `tableHeaderConfig.tsx`: Configuration for table header menus, selectors, and actions.

---

## 1. tableFooterConfig.tsx

Acts as a centralized configuration for all the metadata items displayed in the table footer of the application. This makes it easier to manage, modify, and scale the table footer content without touching the UI logic or other components.

If any new item needs to be added to the table footer, you simply need to update this file — no need to make changes elsewhere.

**Configuration Structure:**
- `statsConfig`:  
  An array of objects with:
  - `key`: The identifier used in code to reference this stat
  - `label`: The human-readable text displayed in the UI  
  _Current stats: totalRows, Count, sum, avg, min, max_

- `legendConfig`:  
  An array of objects with:
  - `label`: The text displayed for this legend item
  - `color`: The hex color code associated with this legend item  
  _Current legend items: Error, Warning, Info, Editable_


**Notes:**
- The file provides configuration for statistical summary items and legend items with their respective colors.
- This file does not handle rendering — it only supplies the data to the component that renders the table footer.
- Keeping this file up-to-date ensures consistency and maintainability.

---


## 2. tableHeaderConfig.tsx

**Purpose:**  
Provides a centralized configuration for all menu items, selectors, and actions displayed in the table header.

**How to use:**  
To add or modify header options (such as font, alignment, color, sorting, import/export, etc.), update this file. No changes are needed in the UI logic or header components.

**Configuration Structure:**
- Each key (e.g., `font`, `alignment`, `color`, `numberFormat`, `scale`, `sort`, `freeze`, `formatMenu`, `transpose`, `importExport`, `pivotMenu`, `filterLock`, `searchBar`) represents a header menu or control.
- Each menu contains:
  - `icon`: Icon component or image for the menu
  - `label`: Human-readable label
  - `tooltip`: Tooltip text for UI hints
  - `expanded`: Array or object describing expanded menu options, actions, or selectors
    - For `importExport`, the `expanded` array includes actions for import, export, share, run, fullscreen, and exit fullscreen. Each action should have an `icon` and `tooltip` (e.g., fullscreen and exit fullscreen icons and tooltips for toggling fullscreen mode).

**Notes:**
- This file only supplies configuration data; it does not handle rendering.
- Update this file to change available header actions, icons, or tooltips.
- Ensures a single source of truth for all table header UI options.
- Fullscreen and exit fullscreen actions are managed via the `importExport` menu configuration. Update their icons/tooltips here as needed.

---


---

**General Notes:**
- Both config files are used by their respective components to render dynamic UI.
- No rendering logic is present in these files—only configuration.
- Keeping these files up-to-date ensures consistency, scalability, and maintainability across the application.

**If you add a new config file:**
- Follow the same pattern: export config objects/arrays, no rendering logic.
- Document the structure and intended usage in this readme.