import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TransposeSelector from "../../../../../src/components/tablecomponents/tableheader/components/TransposeSelector";

// Mock tableHeaderConfig with transpose config
jest.mock(
  "../../../../../src/config/tableHeaderConfig",
  () => ({
    tableHeaderConfig: {
      transpose: {
        tooltip: "Transpose X Y",
        icon: {
          default: <img src="/icons/table_convert.svg" alt="Transpose" className="header-svg-img" />,
          selected: <img src="/icons/table_convert_white.svg" alt="Transpose (Selected)" className="header-svg-img" />,
        },
        expanded: [
          {
            key: "switchRowCol",
            label: "Switch Row/Column",
            onClick: jest.fn(),
          }
        ],
      },
    },
  }),
  { virtual: true }
);

// Mock the SelectorIconButton component
jest.mock("../../../../../src/components/tablecomponents/tableheader/components/SelectorIconButton", () => {
  return function MockSelectorIconButton(props) {
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

// Mock the CustomTooltip component
jest.mock("../../../../../src/components/common/CustomTooltip", () => {
  return function MockCustomTooltip({ children, title }) {
    return React.cloneElement(children, {
      "data-testid": "custom-tooltip",
      "data-title": title,
    });
  };
});

// Mock the useExpandableSelector hook
jest.mock("../../../../../src/components/tablecomponents/tableheader/components/useExpandableSelector", () => ({
  useExpandableSelector: (onExpand, onRequestExpand) => ({
    handleExpand: onExpand,
    handleRequestExpand: onRequestExpand,
    handleKeyDown: (callback) => (e) => {
      if (e.key === "Enter") callback();
    },
  }),
}));

describe("TransposeSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<TransposeSelector expanded={false} onExpand={jest.fn()} />);
    expect(screen.getByTestId("selector-icon-btn")).toBeInTheDocument();
  });

  it("displays correct icon when not expanded", () => {
    render(<TransposeSelector expanded={false} onExpand={jest.fn()} />);
    expect(screen.getByAltText("Transpose")).toBeInTheDocument();
  });

  it("displays correct icon when expanded", () => {
    render(<TransposeSelector expanded={true} onExpand={jest.fn()} />);
    expect(screen.getByAltText("Transpose (Selected)")).toBeInTheDocument();
  });

  it("calls onExpand when button is clicked", () => {
    const mockOnExpand = jest.fn();
    render(<TransposeSelector expanded={true} onExpand={mockOnExpand} />);

    fireEvent.click(screen.getByTestId("selector-icon-btn"));
    expect(mockOnExpand).toHaveBeenCalledTimes(1);
  });

  it("calls onRequestExpand when button is clicked and not expanded", () => {
    const mockOnExpand = jest.fn();
    const mockOnRequestExpand = jest.fn();
    render(<TransposeSelector expanded={false} onExpand={mockOnExpand} onRequestExpand={mockOnRequestExpand} />);

    fireEvent.click(screen.getByTestId("selector-icon-btn"));
    expect(mockOnRequestExpand).toHaveBeenCalledTimes(1);
    expect(mockOnExpand).not.toHaveBeenCalled();
  });

  it("uses default onRequestExpand when not provided", () => {
    const mockOnExpand = jest.fn();
    render(<TransposeSelector expanded={false} onExpand={mockOnExpand} />);
    
    // This should use the default empty function and not throw an error
    fireEvent.click(screen.getByTestId("selector-icon-btn"));
    expect(mockOnExpand).not.toHaveBeenCalled();
  });

  it("renders expanded options when expanded is true", () => {
    render(<TransposeSelector expanded={true} onExpand={jest.fn()} />);

    // Check that the menu options are rendered
    expect(screen.getByText("Switch Row/Column")).toBeInTheDocument();
  });

  it("doesn't render expanded options when expanded is false", () => {
    render(<TransposeSelector expanded={false} onExpand={jest.fn()} />);

    // Expanded options should not be in the document
    expect(screen.queryByText("Switch Row/Column")).not.toBeInTheDocument();
  });

  it("handles missing or undefined icon", () => {
    // Instead of using spyOn to mock the getter, let's temporarily replace the mock
    const originalMock = jest.requireMock(
      "../../../../../src/config/tableHeaderConfig"
    ).tableHeaderConfig;

    // Create a modified mock with undefined icon
    const modifiedMock = {
      ...originalMock,
      transpose: {
        ...originalMock.transpose,
        icon: undefined,
      },
    };

    // Replace the mock temporarily
    jest.requireMock(
      "../../../../../src/config/tableHeaderConfig"
    ).tableHeaderConfig = modifiedMock;

    // Render should not crash even with undefined icon
    render(<TransposeSelector expanded={false} onExpand={jest.fn()} />);

    // Button should still be there
    expect(screen.getByTestId("selector-icon-btn")).toBeInTheDocument();

    // Restore the original mock
    jest.requireMock(
      "../../../../../src/config/tableHeaderConfig"
    ).tableHeaderConfig = originalMock;
  });

  it("handles empty expanded options array", () => {
    // Use the same approach as above
    const originalMock = jest.requireMock(
      "../../../../../src/config/tableHeaderConfig"
    ).tableHeaderConfig;

    // Create a modified mock with empty expanded array
    const modifiedMock = {
      ...originalMock,
      transpose: {
        ...originalMock.transpose,
        expanded: [],
      },
    };

    // Replace the mock temporarily
    jest.requireMock(
      "../../../../../src/config/tableHeaderConfig"
    ).tableHeaderConfig = modifiedMock;

    // Render with expanded=true should not crash even with empty options
    const { container } = render(<TransposeSelector expanded={true} onExpand={jest.fn()} />);

    // Button should still be there
    expect(screen.getByTestId("selector-icon-btn")).toBeInTheDocument();
    
    // Fixed: Use querySelector instead of getByClassName
    expect(container.querySelector(".transpose-selector-divider")).toBeInTheDocument();
    expect(container.querySelector(".transpose-selector-options")).toBeInTheDocument();

    // Restore the original mock
    jest.requireMock(
      "../../../../../src/config/tableHeaderConfig"
    ).tableHeaderConfig = originalMock;
  });

  it("toggles active state when an option is clicked", () => {
    render(<TransposeSelector expanded={true} onExpand={jest.fn()} />);
    
    // Use the button with the actual text in our mock
    const optionButton = screen.getByText("Switch Row/Column").closest("button");
    expect(optionButton).toBeInTheDocument();
    
    // Initially not active
    expect(optionButton).not.toHaveClass("active");
    
    // Click to activate
    fireEvent.click(optionButton);
    
    // Should now be active
    expect(optionButton).toHaveClass("active");
    
    // Click again to deactivate
    fireEvent.click(optionButton);
    
    // Should no longer be active
    expect(optionButton).not.toHaveClass("active");
  });

  it("handles keydown events from SelectorIconButton", () => {
    const mockOnExpand = jest.fn();
    render(<TransposeSelector expanded={true} onExpand={mockOnExpand} />);
    
    // Get the button and trigger Enter key event
    const button = screen.getByTestId("selector-icon-btn");
    fireEvent.keyDown(button, { key: "Enter" });
    
    // onExpand should be called
    expect(mockOnExpand).toHaveBeenCalled();
  });
});