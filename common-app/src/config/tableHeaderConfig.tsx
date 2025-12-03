import {
  TextFont,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
  TextIndentMore,
  TextIndentLess,
  TextLineSpacing,
  TextWrap,
  ColorPalette,
  TextColor,
  TextFill,
  CharacterWholeNumber,
  SortAscending,
  SortDescending,
  SortRemove,
  Download,
  Upload,
  Share,
  Run,
  ImportExport,
  Filter,
  Locked,
  Unlocked,
  Search,
  TextBold,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  DataTable,
  CaretSortDown,
  CaretSort,
  CalendarHeatMap,
  Currency,
} from "@carbon/icons-react";
import React from "react";

// Helper for SVG images (used for custom icons in selectors)
const svgImg = (src: string, alt: string) => (
  <img src={src} alt={alt} className="header-svg-img" />
);

// Helper to create expanded menu items with icon, label, and tooltip
const createExpandedItems = (
  items: {
    key: string;
    icon: React.ReactNode;
    label: string;
    tooltip: string;
  }[]
) =>
  items.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    tooltip: item.tooltip,
  }));

// Factory for scale expanded items (K, M, B, T)
const getScaleExpandedItems = () =>
  createExpandedItems([
    {
      key: "thousand",
      icon: svgImg("/icons/scale-number-thousand.svg", "Thousand"),
      label: "Thousand",
      tooltip: "Thousands (K)",
    },
    {
      key: "million",
      icon: svgImg("/icons/scale-number-million.svg", "Million"),
      label: "Million",
      tooltip: "Millions (M)",
    },
    {
      key: "billion",
      icon: svgImg("/icons/scale-number-billion.svg", "Billion"),
      label: "Billion",
      tooltip: "Billions (B)",
    },
    {
      key: "trillion",
      icon: svgImg("/icons/scale-number-trillion.svg", "Trillion"),
      label: "Trillion",
      tooltip: "Trillions (T)",
    },
  ]);

// Factory for freeze expanded items (row, column, panes)
const getFreezeExpandedItems = () =>
  createExpandedItems([
    {
      key: "freezeRow",
      icon: svgImg("/icons/freeze-top-row.svg", "Freeze Top Row"),
      label: "Freeze Top Row",
      tooltip: "Freeze Top Row",
    },
    {
      key: "freezeCol",
      icon: svgImg("/icons/freeze-first-column.svg", "Freeze Left Column"),
      label: "Freeze Left Column",
      tooltip: "Freeze Left Column",
    },
    {
      key: "freezePanes",
      icon: svgImg("/icons/freeze-panes.svg", "Freeze Panes"),
      label: "Freeze Panes",
      tooltip: "Freeze Panes",
    },
  ]);

// Menu item type for expanded menus
type MenuItem = {
  key: string;
  icon?: React.ReactNode;
  label: string;
  tooltip?: string;
  dividerBefore?: boolean;
  dividerAfter?: boolean;
};

// Helper to create a menu item for formatting, etc.
const createMenuItem = (
  key: string,
  label: string,
  icon?: React.ReactNode,
  tooltip?: string,
  dividerBefore?: boolean,
  dividerAfter?: boolean
): MenuItem => ({
  key,
  label,
  icon,
  tooltip,
  dividerBefore,
  dividerAfter,
});

// Icon config for menu buttons
type MenuIconConfig = {
  src: string;
  alt: string;
};

// Config params for menu buttons
type MenuConfigParams = {
  iconDefault: MenuIconConfig;
  iconSelected: MenuIconConfig;
  label: string;
  tooltip: string;
  expanded: any; // You can further type this if needed
};

// Enum for sort option keys
export enum SortOptionKey {
  Asc = "asc",
  Desc = "desc",
  SortBy = "sortby",
  Remove = "remove",
}

// Helper to create menu config with default/selected icons
function createMenuConfig({
  iconDefault,
  iconSelected,
  label,
  tooltip,
  expanded,
}: MenuConfigParams) {
  return {
    icon: {
      default: svgImg(iconDefault.src, iconDefault.alt),
      selected: svgImg(iconSelected.src, iconSelected.alt),
    },
    label,
    tooltip,
    expanded,
  };
}

// List of supported date format options for the date format selector
const dateFormatOptions = [
  {
    key: "formatDate-DD-MM-YYYY",
    label: "DD-MM-YYYY",
    tooltip: "Standard Indian format",
  },
  {
    key: "formatDate-DD-MMM-YYYY",
    label: "DD-MMM-YYYY",
    tooltip: "Compact and readable",
  },
  {
    key: "formatDate-MMM-DD-YYYY",
    label: "MMM DD, YYYY",
    tooltip: "Reports, presentations",
  },
  {
    key: "formatDate-MM-DD-YYYY",
    label: "MM-DD-YYYY",
    tooltip: "US format",
  },
  {
    key: "formatDate-YYYY-MM-DD",
    label: "YYYY-MM-DD (ISO)",
    tooltip: "ISO format, sorting, imports/exports",
  },
];

// List of supported currency format options for the currency format selector
const currencyFormatOptions = [
  { key: "currency-INR", label: "₹ (INR) - Indian Rupee", tooltip: "Indian Rupee" },
  { key: "currency-USD", label: "$ (USD) - US Dollar", tooltip: "US Dollar" },
  { key: "currency-EUR", label: "€ (EUR) - Euro", tooltip: "Euro" },
  { key: "currency-GBP", label: "£ (GBP) - British Pound", tooltip: "British Pound" },
  { key: "currency-JPY", label: "¥ (JPY) - Japanese Yen", tooltip: "Japanese Yen" },
];

// Menu config for sort options
const sortMenuConfig = {
  icon: {
    default: svgImg("/icons/sort_by_alpha.svg", "Sort"),
    selected: svgImg("/icons/sort_by_alpha_white.svg", "Sort (Selected)"),
  },
  label: "Sort",
  tooltip: "Sort",
  expanded: [
    {
      key: SortOptionKey.Asc,
      icon: <SortAscending />,
      label: "Sort Ascending",
      tooltip: "Sort Ascending",
    },
    {
      key: SortOptionKey.Desc,
      icon: <SortDescending />,
      label: "Sort Descending",
      tooltip: "Sort Descending",
    },
    {
      key: SortOptionKey.SortBy,
      icon: <CaretSort />,
      label: "Sort By",
      tooltip: "Sort By",
    },
    {
      key: SortOptionKey.Remove,
      icon: <SortRemove />,
      label: "Clear all Sort applied",
      tooltip: "Clear all Sort applied",
    },
  ],
};

// Main table header config object for all selectors and menus
// This config drives the TableHeaderComponent and all selector menus
export const tableHeaderConfig = {
  // Filter and lock section (leftmost)
  filterLock: {
    filter: {
      icon: <Filter />,
      label: "Filter",
      tooltip: "Filter",
    },
    lock: {
      tooltip: "Lock Table",
      locked: {
        icon: <Locked />,
        label: "Unlock",
      },
      unlocked: {
        icon: <Unlocked />,
        label: "Lock",
      },
    },
  },
  // Search bar config (right section)
  searchBar: {
    icon: (
      <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <DataTable className="icon-12" />
        <CaretSortDown className="icon-12" style={{ color: "#8d99ae" }} />
      </span>
    ),
    searchIcon: <Search />,
    label: "Search",
    tooltip: "Search By",
  },
  // Font selector config
  font: {
    icon: <TextFont />,
    label: "Font",
    tooltip: "Fonts",
    expanded: {
      fontOptions: ["Inter", "Roboto", "Open Sans", "Noto Sans Japanese"],
      fontSizeOptions: [8, 9, 10, 11, 12, 14, 16, 18, 20],
      actions: [
        {
          key: "increase",
          icon: svgImg("/icons/text_increase.svg", "Increase Text"),
          label: "Increase Text",
          tooltip: "Increase Text Size",
        },
        {
          key: "decrease",
          icon: svgImg("/icons/text_decrease.svg", "Decrease Text"),
          label: "Decrease Text",
          tooltip: "Decrease Text Size",
        },
      ],
      formatting: [
        createMenuItem("bold", "Bold", <TextBold />, "Bold"),
        createMenuItem("italic", "Italic", <TextItalic />, "Italic"),
        createMenuItem(
          "underline",
          "Underline",
          <TextUnderline />,
          "Underline"
        ),
        createMenuItem(
          "strikethrough",
          "Strikethrough",
          <TextStrikethrough />,
          "Strikethrough"
        ),
      ],
    },
  },
  // Alignment selector config
  alignment: {
    icon: <TextAlignCenter />,
    label: "Alignment",
    tooltip: "Alignment",
    expanded: [
      {
        key: "left",
        icon: <TextAlignLeft />,
        label: "Align Left",
        tooltip: "Align Left",
      },
      {
        key: "center",
        icon: <TextAlignCenter />,
        label: "Align Center",
        tooltip: "Align Center",
      },
      {
        key: "right",
        icon: <TextAlignRight />,
        label: "Align Right",
        tooltip: "Align Right",
      },
      {
        key: "justify",
        icon: <TextAlignJustify />,
        label: "Justify",
        tooltip: "Justify",
      },
      {
        key: "indentmore",
        icon: <TextIndentMore />,
        label: "Indent More",
        tooltip: "Indent More",
      },
      {
        key: "indentless",
        icon: <TextIndentLess />,
        label: "Indent Less",
        tooltip: "Indent Less",
      },
      {
        key: "linespacing",
        icon: <TextLineSpacing />,
        label: "Line Spacing",
        tooltip: "Line Spacing",
      },
      {
        key: "textwrapping",
        icon: <TextWrap />,
        label: "Text Wrapping",
        tooltip: "Text Wrap",
      },
    ],
  },
  // Color selector config
  color: {
    icon: <ColorPalette />,
    label: "Color",
    tooltip: "Color",
    expanded: [
      {
        key: "textColor",
        icon: <TextColor />,
        label: "Text Color",
        tooltip: "Text Color",
      },
      {
        key: "fillColor",
        icon: <TextFill />,
        label: "Fill Color",
        tooltip: "Fill Color",
      },
    ],
    themeColors: [
      // Row 1
      '#ffffff', '#000000', '#7f7f7f', '#e6b8af', '#f4b084', '#fff2cc', '#d9ead3', '#cfe2f3', '#d9d2e9', '#b6d7a8',
      // Row 2
      '#f2f2f2', '#1f497d', '#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050', '#00b050', '#00b0f0', '#0070c0',
      // Row 3
      '#d9d9d9', '#4f81bd', '#9bbb59', '#8064a2', '#4bacc6', '#f79646', '#bfbfbf', '#b7dee8', '#b7b7b7', '#b7e1cd',
      // Row 4
      '#bfbfbf', '#c6d9f0', '#dbe5f1', '#eaf1dd', '#f2dcdb', '#e4dfec', '#fce4d6', '#f2f2f2', '#dbe5f1', '#eaf1dd',
      // Row 5
      '#a6a6a6', '#548dd4', '#00b0f0', '#00b0f0', '#00b0f0', '#00b0f0', '#00b0f0', '#00b0f0', '#00b0f0', '#00b0f0',
      // Row 6
      '#808080', '#17365d', '#60497a', '#31859b', '#e36c09', '#c0504d', '#9bbb59', '#4bacc6', '#8064a2', '#4f81bd',
      // Row 7
      '#404040', '#0f243e', '#3f3151', '#1e4e79', '#b0916f', '#7f7f7f', '#bfbfbf', '#b7dee8', '#b7b7b7', '#b7e1cd',
    ],
    standardColors: [
      '#ff0000', '#ff9900', '#ffff00', '#00b050', '#00b0f0', '#0070c0', '#7030a0', '#00ff00', '#00ffff', '#800080'
    ],
  },
  // Number format selector config
  numberFormat: {
    icon: <CharacterWholeNumber />,
    label: "Number Format",
    tooltip: "Number Formatting",
    expanded: [
      {
        key: "increaseDecimal",
        icon: svgImg("/icons/increase--decimal.svg", "Increase Decimal"),
        label: "Increase Decimal",
        tooltip: "Increase Decimal",
      },
      {
        key: "decreaseDecimal",
        icon: svgImg("/icons/decrease--decimal.svg", "Decrease Decimal"),
        label: "Decrease Decimal",
        tooltip: "Decrease Decimal",
      },
      {
        key: "comma",
        icon: svgImg("/icons/comma.svg", "Comma Separator"),
        label: "Comma Separator",
        tooltip: "Comma Separator",
        dividerBefore: true, // Custom property to indicate divider before this option
      },
    ],
  },
  // Date format selector config
  dateformat: {
    icon: <CalendarHeatMap />,
    label: "Date Format",
    tooltip: "Date Formatting",
    expanded: dateFormatOptions,
  },
  // Currency format selector config
  currencyFormat: {
    icon: <Currency />,
    label: "Currency Format",
    tooltip: "Currency Formatting",
    expanded: currencyFormatOptions,
  },
  // Scale selector config (K, M, B, T)
  scale: createMenuConfig({
    iconDefault: { src: "/icons/scale-number.svg", alt: "Scale" },
    iconSelected: {
      src: "/icons/scale-number-white.svg",
      alt: "Scale (Selected)",
    },
    label: "Scale",
    tooltip: "Scale Numbers",
    expanded: getScaleExpandedItems(),
  }),
  // Sort selector config
  sort: sortMenuConfig,
  // Freeze selector config (row, column, panes)
  freeze: createMenuConfig({
    iconDefault: { src: "/icons/freeze-panes.svg", alt: "Freeze" },
    iconSelected: {
      src: "/icons/freeze-panes-white.svg",
      alt: "Freeze (Selected)",
    },
    label: "Freeze",
    tooltip: "Freeze Row Columns",
    expanded: getFreezeExpandedItems(),
  }),
  // Format menu config (conditional formatting, etc.)
  formatMenu: {
    icon: {
      default: svgImg("/icons/format-icon.svg", "Format Menu"),
      selected: svgImg(
        "/icons/format-icon-white.svg",
        "Format Menu (Selected)"
      ),
    },
    label: "Format Menu",
    tooltip: "Format Menu",
    expanded: [
      { key: "highlight", label: "Highlight Cell Rules" },
      { key: "topbottom", label: "Top Bottom Rules" },
      { key: "databars", label: "Data Bars" },
      { key: "colorscales", label: "Colour Scales" },
      { key: "newrule", label: "New Rule" },
      { key: "clearrules", label: "Clear Rules" },
      { key: "managerules", label: "Manage Rules" },
    ],
  },
  // Transpose selector config (switch row/column)
  transpose: {
    icon: {
      default: svgImg("/icons/table_convert.svg", "Transpose"),
      selected: svgImg(
        "/icons/table_convert_white.svg",
        "Transpose (Selected)"
      ),
    },
    label: "Transpose",
    tooltip: "Transpose X Y",
    expanded: [{ key: "switch", label: "Switch Row/Column" }],
  },
  // Import/export section config (right section)
  importExport: {
    icon: <ImportExport />,
    label: "Import/Export",
    tooltip: "Import / Export",
    expanded: [
      { key: "upload", icon: <Upload />, label: "Upload", tooltip: "Upload" },
      {
        key: "download",
        icon: <Download />,
        label: "Download",
        tooltip: "Download",
      },
      { key: "share", icon: <Share />, label: "Share", tooltip: "Share" },
      { key: "run", icon: <Run />, label: "Run", tooltip: "Run" },
      // Fullscreen action: toggles the table area to fullscreen mode
      {
        key: "fullscreen",
        icon: svgImg("/icons/fullscreen.svg", "Full Screen"),
        label: "Full Screen",
        tooltip: "Full Screen",
      },
      // Exit fullscreen action: exits fullscreen mode for the table area
      {
        key: "fullscreen_exit",
        icon: svgImg("/icons/fullscreen_exit.svg", "Exit Full Screen"),
        label: "Exit Full Screen",
        tooltip: "Exit Full Screen",
      },
    ],
  },
  // Pivot menu config (pivot table options)
  pivotMenu: {
    icon: {
      default: svgImg("/icons/pivot_table_chart.svg", "Pivot"),
      selected: svgImg(
        "/icons/pivot_table_chart_white.svg",
        "Pivot (Selected)"
      ),
    },
    label: "Pivot",
    tooltip: "Pivot",
    expanded: [
      {
        key: "subtotals",
        label: "Subtotals",
        tooltip: "Show Subtotals",
      },
      {
        key: "grandTotals",
        label: "Grand Totals",
        tooltip: "Show Grand Totals",
        dividerAfter: true,
      },
      {
        key: "fieldList",
        label: "Field List",
        tooltip: "Pivot Fields List",
      },
    ],
  },
};
