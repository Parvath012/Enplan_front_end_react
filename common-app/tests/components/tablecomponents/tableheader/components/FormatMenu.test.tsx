import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FormatMenu from "../../../../../src/components/tablecomponents/tableheader/components/FormatMenu";

// Mock tableHeaderConfig with formatMenu config
jest.mock(
  "../../../../../src/config/tableHeaderConfig",
  () => ({
    tableHeaderConfig: {
      formatMenu: {
        tooltip: "Format Menu Tooltip",
        icon: {
          default: <img src="/icons/format-icon.svg" alt="Format Menu" className="header-svg-img" />,
          selected: <img src="/icons/format-icon-white.svg" alt="Format Menu (Selected)" className="header-svg-img" />,
        },
        expanded: [
          {
            key: "cellrules",
            label: "Highlight Cell Rules",
          },
          {
            key: "topbottom",
            label: "Top Bottom Rules",
          },
          {
            key: "databars",
            label: "Data Bars",
          },
          {
            key: "colorscales",
            label: "Colour Scales",
          },
          {
            key: "newrule",
            label: "New Rule",
          },
          {
            key: "clearrules",
            label: "Clear Rules",
          },
          {
            key: "managerules",
            label: "Manage Rules",
          },
        ],
      },
    },
  }),
  { virtual: true }
);

// Mock the SelectorIconButton component
const mockSelectorIconButton = jest.fn();
jest.mock("../../../../../src/components/tablecomponents/tableheader/components/SelectorIconButton", () => {
  return function MockSelectorIconButton(props) {
    mockSelectorIconButton(props);
    return (
      <button
        data-testid="selector-icon-btn"
        onClick={props.onClick}
        onKeyDown={props.onKeyDown}
        className={props.className}
        aria-label={props.tooltip}
        aria-expanded={props.expanded ? "true" : "false"}
      >
        {props.icon}
      </button>
    );
  };
});

// Mock the useExpandableSelector hook
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

describe("FormatMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<FormatMenu expanded={false} onExpand={jest.fn()} />);
    expect(screen.getByTestId("selector-icon-btn")).toBeInTheDocument();
  });

  it("displays default icon when not expanded", () => {
    render(<FormatMenu expanded={false} onExpand={jest.fn()} />);
    expect(screen.getByAltText("Format Menu")).toBeInTheDocument();
  });

  it("displays selected icon when expanded", () => {
    render(<FormatMenu expanded={true} onExpand={jest.fn()} />);
    expect(screen.getByAltText("Format Menu (Selected)")).toBeInTheDocument();
  });

  it("calls onExpand when button is clicked in expanded state", () => {
    const mockOnExpand = jest.fn();
    render(<FormatMenu expanded={true} onExpand={mockOnExpand} />);
    
    // Check props passed to SelectorIconButton
    expect(mockSelectorIconButton).toHaveBeenCalledWith(
      expect.objectContaining({
        onClick: mockHandleExpand
      })
    );
    
    // Simulate click
    const button = screen.getByTestId("selector-icon-btn");
    fireEvent.click(button);
    
    // The mock function should be called
    expect(mockHandleExpand).toHaveBeenCalled();
  });

  it("calls onRequestExpand when button is clicked in collapsed state", () => {
    const mockOnExpand = jest.fn();
    render(<FormatMenu expanded={false} onExpand={mockOnExpand} />);
    
    // Check props passed to SelectorIconButton
    expect(mockSelectorIconButton).toHaveBeenCalledWith(
      expect.objectContaining({
        onClick: mockHandleRequestExpand
      })
    );
    
    // Simulate click
    const button = screen.getByTestId("selector-icon-btn");
    fireEvent.click(button);
    
    // The mock function should be called
    expect(mockHandleRequestExpand).toHaveBeenCalled();
  });

  it("calls onKeyDown handler", () => {
    render(<FormatMenu expanded={true} onExpand={jest.fn()} />);
    const keyDownHandler = mockHandleKeyDown.mock.results[0].value;
    
    fireEvent.keyDown(screen.getByTestId("selector-icon-btn"), { key: "Enter" });
    expect(keyDownHandler).toHaveBeenCalled();
  });

  it("renders with correct classes in collapsed state", () => {
    render(<FormatMenu expanded={false} onExpand={jest.fn()} />);
    
    expect(screen.getByTestId("selector-icon-btn")).toHaveClass("format-menu-icon");
    expect(screen.getByTestId("selector-icon-btn")).not.toHaveClass("expanded");
    
    expect(document.querySelector(".format-menu-divider")).not.toBeInTheDocument();
    expect(document.querySelector(".format-menu-options")).not.toBeInTheDocument();
  });

  it("renders with correct classes in expanded state", () => {
    render(<FormatMenu expanded={true} onExpand={jest.fn()} />);
    
    expect(screen.getByTestId("selector-icon-btn")).toHaveClass("format-menu-icon");
    expect(screen.getByTestId("selector-icon-btn")).toHaveClass("expanded");
    
    expect(document.querySelector(".format-menu-divider")).toBeInTheDocument();
    expect(document.querySelector(".format-menu-options")).toBeInTheDocument();
  });

  it("renders expanded options when expanded is true", () => {
    render(<FormatMenu expanded={true} onExpand={jest.fn()} />);
    
    // Check that options container is rendered
    expect(document.querySelector(".format-menu-options")).toBeInTheDocument();
    
    // Check that option buttons are rendered
    expect(screen.getByText("Highlight Cell Rules")).toBeInTheDocument();
    expect(screen.getByText("Top Bottom Rules")).toBeInTheDocument();
    expect(screen.getByText("Data Bars")).toBeInTheDocument();
    expect(screen.getByText("Colour Scales")).toBeInTheDocument();
    expect(screen.getByText("New Rule")).toBeInTheDocument();
    expect(screen.getByText("Clear Rules")).toBeInTheDocument();
    expect(screen.getByText("Manage Rules")).toBeInTheDocument();
  });

  it("toggles active state when a button is clicked", () => {
    render(<FormatMenu expanded={true} onExpand={jest.fn()} />);
    
    // Find the first button
    const cellRulesButton = screen.getByText("Highlight Cell Rules").closest("button");
    expect(cellRulesButton).not.toHaveClass("active");
    
    // Click the button
    fireEvent.click(cellRulesButton);
    
    // Now it should be active
    expect(cellRulesButton).toHaveClass("active");
    
    // Click again to deactivate
    fireEvent.click(cellRulesButton);
    
    // It should no longer be active
    expect(cellRulesButton).not.toHaveClass("active");
  });

  it("sets only one format option active at a time", () => {
    render(<FormatMenu expanded={true} onExpand={jest.fn()} />);
    
    // Find buttons
    const cellRulesButton = screen.getByText("Highlight Cell Rules").closest("button");
    const topBottomButton = screen.getByText("Top Bottom Rules").closest("button");
    
    // Click cell rules button
    fireEvent.click(cellRulesButton);
    
    // Cell rules should be active
    expect(cellRulesButton).toHaveClass("active");
    expect(topBottomButton).not.toHaveClass("active");
    
    // Click top/bottom button
    fireEvent.click(topBottomButton);
    
    // Now top/bottom should be active, cell rules should not
    expect(cellRulesButton).not.toHaveClass("active");
    expect(topBottomButton).toHaveClass("active");
  });

  it("renders dividers after specific option keys", () => {
    render(<FormatMenu expanded={true} onExpand={jest.fn()} />);
    
    // Get all options
    const options = screen.getAllByRole("button");
    
    // First option is the selector button, then we have 7 option buttons
    expect(options.length).toBe(8);
    
    // Get all the dividers in format-menu-options
    const optionDividers = Array.from(document.querySelectorAll(".format-menu-options .format-menu-divider"));
    
    // We should have dividers after topbottom and colorscales keys (2 dividers)
    expect(optionDividers.length).toBe(2);
  });
});