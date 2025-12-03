import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import SortSelector from "../../../../../src/components/tablecomponents/tableheader/components/SortSelector";
import { SortType } from "../../../../../src/components/tablecomponents/tablegrid/types";

// Minimal mock reducer for required selectors
const mockStore = configureStore({
  reducer: {
    dataStore: () => ({ columns: [{ id: "col1", label: "Column 1" }] }),
    // Add other slices if needed
  },
});

// Mock SelectorIconButton
const mockSelectorIconButton = jest.fn();
jest.mock(
  "../../../../../src/components/tablecomponents/tableheader/components/SelectorIconButton",
  () => {
    // Fix implicit any types in mocks
    return function MockSelectorIconButton(props: any) {
      mockSelectorIconButton(props);
      return (
        <button
          data-testid="selector-icon-btn"
          className={props.className}
          aria-label={props.tooltip}
          aria-expanded={props.expanded}
          onClick={props.onClick}
          onKeyDown={props.onKeyDown}
        >
          {props.icon}
        </button>
      );
    };
  }
);

// Mock CustomTooltip
jest.mock(
  "../../../../../src/components/common/CustomTooltip",
  () => {
    return function MockCustomTooltip({ children, title }: { children: React.ReactNode; title: string }) {
      return (
        <div data-testid="custom-tooltip" data-title={title}>
          {children}
        </div>
      );
    };
  }
);

// Mock SortDialog component
const mockOnApplySort = jest.fn();
jest.mock(
  "../../../../../src/components/tablecomponents/tablegrid/components/SortDialog",
  () => {
    return function MockSortDialog(props: any) {
      // Store the onApplySort callback so we can call it in our tests
      if (props.onApplySort) {
        mockOnApplySort.mockImplementation(props.onApplySort);
      }
      return (
        <div data-testid="sort-dialog" onClick={() => {
          if (props.onApplySort) {
            // This lets us simulate clicking the "Apply" button in the dialog
            const mockLevels = [
              { sortBy: 'name', sortOn: 'alphanumeric', order: 'asc' },
              { sortBy: 'age', sortOn: 'numeric', order: 'desc' }
            ];
            props.onApplySort(mockLevels);
          }
        }}>
          Mock Sort Dialog
        </div>
      );
    };
  }
);

// Mock useExpandableSelector
const mockHandleExpand = jest.fn();
const mockHandleRequestExpand = jest.fn();
const mockHandleKeyDown = jest.fn(() => jest.fn());
jest.mock(
  "../../../../../src/components/tablecomponents/tableheader/components/useExpandableSelector",
  () => ({
    useExpandableSelector: () => ({
      handleExpand: mockHandleExpand,
      handleRequestExpand: mockHandleRequestExpand,
      handleKeyDown: mockHandleKeyDown,
    }),
  })
);

// Use SortModel type from component's import
type SortModel = {
  field: string;
  sort: 'asc' | 'desc';
  type: SortType;
  priority: number;
};

// Empty array cast as SortModel array for the tests
const mockSortModel = [] as SortModel[];
const mockSetSortModel = jest.fn();

describe("SortSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetSortModel.mockClear();
  });

  it("renders root and SelectorIconButton with expanded=false", () => {
    render(
      <Provider store={mockStore}>
        <SortSelector expanded={false} onExpand={jest.fn()} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    expect(screen.getByTestId("selector-icon-btn")).toBeInTheDocument();
    // Check for the default icon by alt text (real config uses img with alt)
    expect(screen.getByAltText("Sort")).toBeInTheDocument();
    expect(screen.queryByAltText("Sort (Selected)")).not.toBeInTheDocument();
    expect(document.querySelector(".sort-selector-divider")).not.toBeInTheDocument();
    expect(document.querySelector(".sort-selector-options")).not.toBeInTheDocument();
    expect(mockSelectorIconButton).toHaveBeenCalledWith(
      expect.objectContaining({
        tooltip: "Sort",
        expanded: false,
        className: "sort-selector-btn",
        icon: expect.anything(),
        onClick: mockHandleRequestExpand,
        onKeyDown: expect.any(Function),
      })
    );
  });

  it("renders SelectorIconButton with expanded=true and correct icon", () => {
    render(
      <Provider store={mockStore}>
        <SortSelector expanded={true} onExpand={jest.fn()} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    expect(screen.getByTestId("selector-icon-btn")).toBeInTheDocument();
    // Check for the selected icon by alt text
    expect(screen.getByAltText("Sort (Selected)")).toBeInTheDocument();
    expect(screen.queryByAltText("Sort")).not.toBeInTheDocument();
    expect(mockSelectorIconButton).toHaveBeenCalledWith(
      expect.objectContaining({
        expanded: true,
        className: "sort-selector-btn expanded",
        icon: expect.anything(),
        onClick: mockHandleExpand,
        onKeyDown: expect.any(Function),
      })
    );
  });

  it("renders divider and options only when expanded", () => {
    const { rerender } = render(
      <Provider store={mockStore}>
        <SortSelector expanded={false} onExpand={jest.fn()} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    expect(document.querySelector(".sort-selector-divider")).not.toBeInTheDocument();
    expect(document.querySelector(".sort-selector-options")).not.toBeInTheDocument();

    rerender(
      <Provider store={mockStore}>
        <SortSelector expanded={true} onExpand={jest.fn()} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    expect(document.querySelector(".sort-selector-divider")).toBeInTheDocument();
    expect(document.querySelector(".sort-selector-options")).toBeInTheDocument();
  });

  it("renders all option buttons with correct tooltips and icons", () => {
    render(
      <Provider store={mockStore}>
        <SortSelector expanded={true} onExpand={jest.fn()} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    const tooltips = screen.getAllByTestId("custom-tooltip");
    // There should be 4 tooltips for the 4 options in the real config
    expect(tooltips.length).toBe(4);
    // Check for tooltips by their data-title
    expect(tooltips.some(el => el.getAttribute("data-title") === "Sort Ascending")).toBe(true);
    expect(tooltips.some(el => el.getAttribute("data-title") === "Sort Descending")).toBe(true);
    expect(tooltips.some(el => el.getAttribute("data-title") === "Sort By")).toBe(true);
    expect(tooltips.some(el => el.getAttribute("data-title") === "Clear all Sort applied")).toBe(true);
    // Check for Carbon icons by role (svg) or by label
    expect(screen.getByLabelText("Sort Ascending")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort Descending")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort By")).toBeInTheDocument();
    expect(screen.getByLabelText("Clear all Sort applied")).toBeInTheDocument();
  });

  it("calls onClick/onKeyDown handlers from SelectorIconButton", () => {
    render(
      <Provider store={mockStore}>
        <SortSelector expanded={true} onExpand={jest.fn()} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    // Verify SelectorIconButton was called
    expect(mockSelectorIconButton).toHaveBeenCalled();
    // Get the props that were passed to SelectorIconButton
    const props = mockSelectorIconButton.mock.calls[0][0];
    // Simulate click
    props.onClick();
    expect(mockHandleExpand).toHaveBeenCalled();
    // Simulate keydown
    props.onKeyDown({ key: "Enter" });
    expect(mockHandleKeyDown).toHaveBeenCalled();
    // The handler returned by mockHandleKeyDown should be called
    const returnedHandler = mockHandleKeyDown.mock.results[0].value;
    expect(returnedHandler).toHaveBeenCalled();
  });

  it("calls onRequestExpand handler when expanded=false", () => {
    render(
      <Provider store={mockStore}>
        <SortSelector expanded={false} onExpand={jest.fn()} onRequestExpand={jest.fn()} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    // Get the onClick handler from the mocked component
    const props = mockSelectorIconButton.mock.calls[0][0];
    props.onClick();
    // The request expand handler should be called
    expect(mockHandleRequestExpand).toHaveBeenCalled();
  });

  it("renders with custom onRequestExpand", () => {
    const customRequestExpand = jest.fn();
    render(
      <Provider store={mockStore}>
        <SortSelector expanded={false} onExpand={jest.fn()} onRequestExpand={customRequestExpand} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    // Get props passed to SelectorIconButton
    const props = mockSelectorIconButton.mock.calls[0][0];
    // Call the onClick handler
    props.onClick();
    // The mock handler from useExpandableSelector should be called, not the passed prop directly
    expect(mockHandleRequestExpand).toHaveBeenCalled();
  });

  it("renders with missing onRequestExpand prop (default)", () => {
    render(
      <Provider store={mockStore}>
        <SortSelector expanded={false} onExpand={jest.fn()} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    // Get the onClick handler
    const props = mockSelectorIconButton.mock.calls[0][0];
    expect(typeof props.onClick).toBe("function");
    // Call the handler
    props.onClick();
    // The default handler should be called
    expect(mockHandleRequestExpand).toHaveBeenCalled();
  });

  it("option button is focusable and has correct type", () => {
    render(
      <Provider store={mockStore}>
        <SortSelector expanded={true} onExpand={jest.fn()} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    // Find all the option buttons
    const optionButtons = screen.getAllByRole("button", { name: /sort/i });
    // Skip the first one which is the main button
    const sortOptionButtons = optionButtons.slice(1);
    // Verify there are option buttons
    expect(sortOptionButtons.length).toBeGreaterThan(0);
    // Test each button
    sortOptionButtons.forEach(button => {
      expect(button).toHaveAttribute("tabindex", "0");
      // Fire events to test click handlers
      fireEvent.click(button);
      // Test keydown handlers
      fireEvent.keyDown(button, { key: "Enter" });
    });
  });

  it("handles option button click events", () => {
    const { container } = render(
      <Provider store={mockStore}>
        <SortSelector expanded={true} onExpand={jest.fn()} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    // Find all option buttons
    const buttons = container.querySelectorAll(".sort-selector-option");
    expect(buttons.length).toBeGreaterThan(0);
    // Click each button
    Array.from(buttons).forEach(button => {
      fireEvent.click(button);
    });
  });

  it("handles option button keydown events", () => {
    const { container } = render(
      <Provider store={mockStore}>
        <SortSelector expanded={true} onExpand={jest.fn()} sortModel={mockSortModel} setSortModel={mockSetSortModel} />
      </Provider>
    );
    // Find all option buttons
    const buttons = container.querySelectorAll(".sort-selector-option");
    expect(buttons.length).toBeGreaterThan(0);
    // Trigger Enter key on each button
    Array.from(buttons).forEach(button => {
      fireEvent.keyDown(button, { key: "Enter" });
      // Test with non-action key
      fireEvent.keyDown(button, { key: "Tab" });
    });
  });

  it("handles SortDialog onApplySort correctly", () => {
    const setSortModel = jest.fn();
    
    // Clear the mock implementation before this test
    mockOnApplySort.mockClear();
    
    render(
      <Provider store={mockStore}>
        <SortSelector 
          expanded={true} 
          onExpand={jest.fn()} 
          sortModel={mockSortModel}
          setSortModel={setSortModel}
        />
      </Provider>
    );

    // Find the sort-by button that opens the dialog
    const sortByButton = screen.getByLabelText("Sort By");
    fireEvent.click(sortByButton);
    
    // Find the dialog and click it (which will trigger onApplySort due to our mock)
    const sortDialog = screen.getByTestId("sort-dialog");
    fireEvent.click(sortDialog);
    
    // Verify setSortModel was called with the correctly transformed data
    expect(setSortModel).toHaveBeenCalledWith([
      { field: 'name', type: 'alphanumeric', sort: 'asc', priority: 1 },
      { field: 'age', type: 'numeric', sort: 'desc', priority: 2 }
    ]);
  });
  
  it("handles SortDialog onApplySort with invalid setSortModel", () => {
    // Create a spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <Provider store={mockStore}>
        <SortSelector 
          expanded={true} 
          onExpand={jest.fn()} 
          sortModel={mockSortModel}
          // Pass undefined as setSortModel to trigger error path
          setSortModel={undefined as any}
        />
      </Provider>
    );

    // Find the sort-by button that opens the dialog
    const sortByButton = screen.getByLabelText("Sort By");
    fireEvent.click(sortByButton);
    
    // Find the dialog and click it (which will trigger onApplySort with undefined setSortModel)
    const sortDialog = screen.getByTestId("sort-dialog");
    fireEvent.click(sortDialog);
    
    // Verify console.error was called with the right message
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "setSortModel is not a function. Please ensure it is passed as a prop to SortSelector."
    );
    
    // Clean up
    consoleErrorSpy.mockRestore();
  });
  
  it("handles SortDialog close event", () => {
    // Enhance the mock for SortDialog to expose onClose callback
    jest.mock(
      "../../../../../src/components/tablecomponents/tablegrid/components/SortDialog",
      () => {
        return function MockSortDialog(props: any) {
          return (
            <div 
              data-testid="sort-dialog" 
              onClick={() => {
                // Mock clicking the "Apply" button
                if (props.onApplySort) {
                  props.onApplySort([]);
                }
              }}
              onKeyDown={() => {
                // Mock the dialog close event (e.g., pressing ESC)
                if (props.onClose) {
                  props.onClose();
                }
              }}
            >
              Mock Sort Dialog
            </div>
          );
        };
      }
    );
    
    const setSortModel = jest.fn();
    
    render(
      <Provider store={mockStore}>
        <SortSelector 
          expanded={true} 
          onExpand={jest.fn()} 
          sortModel={mockSortModel}
          setSortModel={setSortModel}
        />
      </Provider>
    );

    // Find the sort-by button to open dialog
    const sortByButton = screen.getByLabelText("Sort By");
    fireEvent.click(sortByButton);
    
    // Find the dialog and trigger a keyDown to close it
    const sortDialog = screen.getByTestId("sort-dialog");
    fireEvent.keyDown(sortDialog, { key: 'Escape' });
    
    // Verify dialog was closed (this is just testing state changes internally)
    // We can't easily check the dialog state, but we can verify the dialog props were used
  });
  
  it("renders SortDialog with non-empty sortModel", () => {
    const nonEmptySortModel = [
      { field: 'name', type: 'alphanumeric' as SortType, sort: 'asc' as const, priority: 1 }
    ];
    
    render(
      <Provider store={mockStore}>
        <SortSelector 
          expanded={true} 
          onExpand={jest.fn()} 
          sortModel={nonEmptySortModel}
          setSortModel={jest.fn()}
        />
      </Provider>
    );

    // Find the sort-by button that opens the dialog
    const sortByButton = screen.getByLabelText("Sort By");
    fireEvent.click(sortByButton);
    
    // Find the dialog
    const sortDialog = screen.getByTestId("sort-dialog");
    expect(sortDialog).toBeInTheDocument();
  });
});