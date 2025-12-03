import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PivotMenu from "../../../../../src/components/tablecomponents/tableheader/components/PivotMenu";

// Mock tableHeaderConfig with pivotMenu config matching the real implementation
jest.mock(
  "../../../../../src/config/tableHeaderConfig",
  () => ({
    tableHeaderConfig: {
      pivotMenu: {
        tooltip: "Pivot Menu Tooltip",
        icon: {
          default: <img data-testid="icon-default" alt="Pivot" src="/icons/pivot_table_chart.svg" />,
          selected: <img data-testid="icon-selected" alt="Pivot (Selected)" src="/icons/pivot_table_chart_white.svg" />,
        },
        expanded: [
          {
            key: "subtotals",
            label: "Subtotals",
            tooltip: "Show Subtotals",
            dividerAfter: false,
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
            dividerAfter: false,
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
  return function MockSelectorIconButton(props : any) {
    mockSelectorIconButton(props);
    return (
      <button
        data-testid="selector-icon-btn"
        onClick={props.onClick}
        onKeyDown={props.onKeyDown}
        aria-expanded={props.expanded}
        className={props.className}
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

describe("PivotMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<PivotMenu expanded={false} onExpand={jest.fn()} />);
    expect(screen.getByTestId("selector-icon-btn")).toBeInTheDocument();
  });

  it("renders with expanded=false", () => {
    render(<PivotMenu expanded={false} onExpand={jest.fn()} />);
    expect(screen.getByAltText("Pivot")).toBeInTheDocument();
    expect(screen.queryByAltText("Pivot (Selected)")).not.toBeInTheDocument();
    expect(document.querySelector(".pivot-menu-divider")).not.toBeInTheDocument();
    expect(document.querySelector(".pivot-menu-options")).not.toBeInTheDocument();
  });

  it("renders with expanded=true", () => {
    render(<PivotMenu expanded={true} onExpand={jest.fn()} />);
    expect(screen.queryByAltText("Pivot")).not.toBeInTheDocument();
    expect(screen.getByAltText("Pivot (Selected)")).toBeInTheDocument();
    expect(document.querySelector(".pivot-menu-divider")).toBeInTheDocument();
    expect(document.querySelector(".pivot-menu-options")).toBeInTheDocument();
  });

  it("calls handleExpand when button is clicked in expanded state", () => {
    render(<PivotMenu expanded={true} onExpand={jest.fn()} />);
    fireEvent.click(screen.getByTestId("selector-icon-btn"));
    expect(mockHandleExpand).toHaveBeenCalled();
  });

  it("calls handleRequestExpand when button is clicked in collapsed state", () => {
    render(<PivotMenu expanded={false} onExpand={jest.fn()} />);
    fireEvent.click(screen.getByTestId("selector-icon-btn"));
    expect(mockHandleRequestExpand).toHaveBeenCalled();
  });

  it("calls onKeyDown handler", () => {
    render(<PivotMenu expanded={true} onExpand={jest.fn()} />);
    const keyDownHandler = mockHandleKeyDown.mock.results[0].value;
    fireEvent.keyDown(screen.getByTestId("selector-icon-btn"), { key: "Enter" });
    expect(keyDownHandler).toHaveBeenCalled();
  });

  it("renders all option buttons with correct labels", () => {
    render(<PivotMenu expanded={true} onExpand={jest.fn()} />);
    expect(screen.getByText("Subtotals")).toBeInTheDocument();
    expect(screen.getByText("Grand Totals")).toBeInTheDocument();
    expect(screen.getByText("Field List")).toBeInTheDocument();
  });

  it("handles option button clicks correctly", () => {
    render(<PivotMenu expanded={true} onExpand={jest.fn()} />);
    fireEvent.click(screen.getByText("Subtotals"));
    fireEvent.click(screen.getByText("Subtotals"));
    fireEvent.click(screen.getByText("Field List"));
    fireEvent.click(screen.getByText("Field List"));
  });

  it("applies active class to selected options", () => {
    render(<PivotMenu expanded={true} onExpand={jest.fn()} />);
    fireEvent.click(screen.getByText("Subtotals"));
    expect(screen.getByText("Subtotals").closest("button")).toHaveClass("active");
    fireEvent.click(screen.getByText("Grand Totals"));
    expect(screen.getByText("Grand Totals").closest("button")).toHaveClass("active");
    expect(screen.getByText("Subtotals").closest("button")).not.toHaveClass("active");
  });

  it("handles fieldList option specially", () => {
    render(<PivotMenu expanded={true} onExpand={jest.fn()} />);
    fireEvent.click(screen.getByText("Field List"));
    expect(screen.getByText("Field List").closest("button")).toHaveClass("active");
    fireEvent.click(screen.getByText("Field List"));
    expect(screen.getByText("Field List").closest("button")).not.toHaveClass("active");
  });

  it("sets default value for onRequestExpand if not provided", () => {
    render(<PivotMenu expanded={false} onExpand={jest.fn()} />);
    fireEvent.click(screen.getByTestId("selector-icon-btn"));
    expect(mockHandleRequestExpand).toHaveBeenCalled();
  });
});