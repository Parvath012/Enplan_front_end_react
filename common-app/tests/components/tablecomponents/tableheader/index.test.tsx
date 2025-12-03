import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TableHeaderComponent from "../../../../src/components/tablecomponents/tableheader";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

// Fix the path to match the actual file location
jest.mock("../../../../src/components/tablecomponents/tableheader/components/FilterAndLock", () => {
  return function MockFilterAndLock() {
    return <div data-testid="filter-and-lock">FilterAndLock</div>;
  };
});

// Mock FontSelector component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/FontSelector", () => {
  return function MockFontSelector({ expanded, onExpand, onRequestExpand }) {
    return (
      <div 
        data-testid="font-selector" 
        data-expanded={expanded}
        onClick={expanded ? onExpand : onRequestExpand}
      >
        FontSelector
      </div>
    );
  };
});

// Mock AlignmentSelector component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/AlignmentSelector", () => {
  return function MockAlignmentSelector({ expanded, onExpand, onRequestExpand }) {
    return (
      <div 
        data-testid="alignment-selector" 
        data-expanded={expanded}
        onClick={expanded ? onExpand : onRequestExpand}
      >
        AlignmentSelector
      </div>
    );
  };
});

// Mock ColorSelector component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/ColorSelector", () => {
  return function MockColorSelector({ expanded, onExpand, onRequestExpand }) {
    return (
      <div 
        data-testid="color-selector" 
        data-expanded={expanded}
        onClick={expanded ? onExpand : onRequestExpand}
      >
        ColorSelector
      </div>
    );
  };
});

// Mock NumberFormatSelector component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/NumberFormatSelector", () => {
  return function MockNumberFormatSelector({ expanded, onExpand, onRequestExpand }) {
    return (
      <div 
        data-testid="number-format-selector" 
        data-expanded={expanded}
        onClick={expanded ? onExpand : onRequestExpand}
      >
        NumberFormatSelector
      </div>
    );
  };
});

// Mock ScaleSelector component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/ScaleSelector", () => {
  return function MockScaleSelector({ expanded, onExpand, onRequestExpand }) {
    return (
      <div 
        data-testid="scale-selector" 
        data-expanded={expanded}
        onClick={expanded ? onExpand : onRequestExpand}
      >
        ScaleSelector
      </div>
    );
  };
});

// Mock FreezeSelector component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/FreezeSelector", () => {
  return function MockFreezeSelector({ expanded, onExpand, onRequestExpand }) {
    return (
      <div 
        data-testid="freeze-selector" 
        data-expanded={expanded}
        onClick={expanded ? onExpand : onRequestExpand}
      >
        FreezeSelector
      </div>
    );
  };
});

// Mock FormatMenu component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/FormatMenu", () => {
  return function MockFormatMenu({ expanded, onExpand, onRequestExpand }) {
    return (
      <div 
        data-testid="format-menu" 
        data-expanded={expanded}
        onClick={expanded ? onExpand : onRequestExpand}
      >
        FormatMenu
      </div>
    );
  };
});

// Mock TransposeSelector component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/TransposeSelector", () => {
  return function MockTransposeSelector({ expanded, onExpand, onRequestExpand }) {
    return (
      <div 
        data-testid="transpose-selector" 
        data-expanded={expanded}
        onClick={expanded ? onExpand : onRequestExpand}
      >
        TransposeSelector
      </div>
    );
  };
});

// Mock SortSelector component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/SortSelector", () => {
  return function MockSortSelector({ expanded, onExpand, onRequestExpand }) {
    return (
      <div 
        data-testid="sort-selector" 
        data-expanded={expanded}
        onClick={expanded ? onExpand : onRequestExpand}
      >
        SortSelector
      </div>
    );
  };
});

// Mock PivotMenu component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/PivotMenu", () => {
  return function MockPivotMenu({ expanded, onExpand, onRequestExpand }) {
    return (
      <div 
        data-testid="pivot-menu" 
        data-expanded={expanded}
        onClick={expanded ? onExpand : onRequestExpand}
      >
        PivotMenu
      </div>
    );
  };
});

// Mock ImportExportSelector component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/ImportExportSelector", () => {
  return function MockImportExportSelector() {
    return <div data-testid="import-export-selector">ImportExportSelector</div>;
  };
});

// Mock SearchBar component
jest.mock("../../../../src/components/tablecomponents/tableheader/components/SearchBar", () => {
  return function MockSearchBar() {
    return <div data-testid="search-bar">SearchBar</div>;
  };
});

const mockStore = configureStore([]);
// Add dataStore.formattingConfig, dataStore.tableConfiguration, and gridStore.selectedCells to the initial state to prevent useSelector errors
const store = mockStore({
  dataStore: {
    formattingConfig: {},
    tableConfiguration: {},
  },
  gridStore: {
    selectedCells: [],
  },
});

describe("TableHeaderComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) =>
    render(<Provider store={store}>{ui}</Provider>);

  it("renders without crashing", () => {
    renderWithProvider(<TableHeaderComponent />);
    expect(screen.getByTestId("filter-and-lock")).toBeInTheDocument();
    expect(screen.getByTestId("import-export-selector")).toBeInTheDocument();
  });

  it("renders all selectors in collapsed state by default", () => {
    renderWithProvider(<TableHeaderComponent />);
    
    // Check that all selectors are rendered with expanded=false
    expect(screen.getByTestId("font-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("alignment-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("color-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("number-format-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("scale-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("freeze-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("format-menu")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("transpose-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("sort-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("pivot-menu")).toHaveAttribute("data-expanded", "false");
  });

  it("renders dividers between selector groups", () => {
    renderWithProvider(<TableHeaderComponent />);
    
    // There should be multiple dividers
    const dividers = document.querySelectorAll(".table-header-divider");
    
    // We expect at least 4 dividers: one after FilterAndLock and three in selectorConfig
    expect(dividers.length).toBeGreaterThanOrEqual(4);
  });

  it("expands a selector when clicked", () => {
    renderWithProvider(<TableHeaderComponent />);
    
    // Click on the font selector to request expand
    fireEvent.click(screen.getByTestId("font-selector"));
    
    // It should now be expanded
    expect(screen.getByTestId("font-selector")).toHaveAttribute("data-expanded", "true");
    
    // All other selectors should be hidden
    expect(screen.queryByTestId("alignment-selector")).not.toBeInTheDocument();
    expect(screen.queryByTestId("color-selector")).not.toBeInTheDocument();
    expect(screen.queryByTestId("number-format-selector")).not.toBeInTheDocument();
    expect(screen.queryByTestId("scale-selector")).not.toBeInTheDocument();
    expect(screen.queryByTestId("freeze-selector")).not.toBeInTheDocument();
    expect(screen.queryByTestId("format-menu")).not.toBeInTheDocument();
    expect(screen.queryByTestId("transpose-selector")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sort-selector")).not.toBeInTheDocument();
    expect(screen.queryByTestId("pivot-menu")).not.toBeInTheDocument();
  });

  it("collapses an expanded selector when clicked", () => {
    renderWithProvider(<TableHeaderComponent />);
    
    // First expand a selector
    fireEvent.click(screen.getByTestId("font-selector"));
    expect(screen.getByTestId("font-selector")).toHaveAttribute("data-expanded", "true");
    
    // Then click it again to collapse
    fireEvent.click(screen.getByTestId("font-selector"));
    
    // All selectors should now be visible again in collapsed state
    expect(screen.getByTestId("font-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("alignment-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("color-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("number-format-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("scale-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("freeze-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("format-menu")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("transpose-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("sort-selector")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("pivot-menu")).toHaveAttribute("data-expanded", "false");
  });

  it("allows switching between expanded selectors", () => {
    renderWithProvider(<TableHeaderComponent />);
    
    // First expand font selector
    fireEvent.click(screen.getByTestId("font-selector"));
    expect(screen.getByTestId("font-selector")).toHaveAttribute("data-expanded", "true");
    
    // Collapse it
    fireEvent.click(screen.getByTestId("font-selector"));
    
    // Now expand alignment selector
    fireEvent.click(screen.getByTestId("alignment-selector"));
    expect(screen.getByTestId("alignment-selector")).toHaveAttribute("data-expanded", "true");
    
    // Font selector should be hidden
    expect(screen.queryByTestId("font-selector")).not.toBeInTheDocument();
  });

  it("maintains correct structure for header sections", () => {
    renderWithProvider(<TableHeaderComponent />);
    
    // Check header structure
    expect(document.querySelector(".table-header")).toBeInTheDocument();
    expect(document.querySelector(".header-section.left")).toBeInTheDocument();
    expect(document.querySelector(".header-section.right")).toBeInTheDocument();
  });
});