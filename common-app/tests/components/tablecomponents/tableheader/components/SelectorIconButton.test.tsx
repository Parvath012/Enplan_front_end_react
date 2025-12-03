import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SelectorIconButton from "../../../../../src/components/tablecomponents/tableheader/components/SelectorIconButton";

// filepath: d:\Enplan\EnPlan-2.O_React_FE\enplan-front-end-react\common-app\tests\components\tablecomponents\tableheader\components\SelectorIconButton.test.tsx

// Mock CustomTooltip to just render children
jest.mock(
  "../../../../../src/components/common/CustomTooltip",
  () => ({ children, title }: any) => (
    <div data-testid="custom-tooltip" data-title={title}>
      {children}
    </div>
  )
);

describe("SelectorIconButton", () => {
  const defaultProps = {
    tooltip: "Test Tooltip",
    expanded: false,
    className: "test-class",
    icon: <span data-testid="icon">Icon</span>,
    onClick: jest.fn(),
    onKeyDown: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders button with icon and tooltip", () => {
    render(<SelectorIconButton {...defaultProps} />);
    const button = screen.getByRole("button", { name: /test tooltip/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByTestId("custom-tooltip")).toHaveAttribute(
      "data-title",
      "Test Tooltip"
    );
  });

  it("applies className and aria attributes", () => {
    render(<SelectorIconButton {...defaultProps} expanded={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("test-class");
    expect(button).toHaveAttribute("aria-label", "Test Tooltip");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("tabIndex", "0");
  });

  it("calls onClick when button is clicked", () => {
    render(<SelectorIconButton {...defaultProps} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(defaultProps.onClick).toHaveBeenCalled();
  });

  it("calls onKeyDown when key is pressed", () => {
    render(<SelectorIconButton {...defaultProps} />);
    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: "Enter" });
    expect(defaultProps.onKeyDown).toHaveBeenCalled();
  });

  it("passes event to onClick and onKeyDown", () => {
    const onClick = jest.fn();
    const onKeyDown = jest.fn();
    render(
      <SelectorIconButton
        {...defaultProps}
        onClick={onClick}
        onKeyDown={onKeyDown}
      />
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.keyDown(button, { key: " " });
    expect(onClick.mock.calls[0][0]).toBeInstanceOf(Object);
    expect(onKeyDown.mock.calls[0][0]).toBeInstanceOf(Object);
  });

  it("renders with a different icon", () => {
    render(
      <SelectorIconButton
        {...defaultProps}
        icon={<svg data-testid="svg-icon" />}
      />
    );
    expect(screen.getByTestId("svg-icon")).toBeInTheDocument();
  });
});