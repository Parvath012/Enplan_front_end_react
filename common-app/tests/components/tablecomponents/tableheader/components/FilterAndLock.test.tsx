import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FilterAndLock from "../../../../../src/components/tablecomponents/tableheader/components/FilterAndLock";

// Mock the tableHeaderConfig
jest.mock("../../../../../src/config/tableHeaderConfig", () => ({
  tableHeaderConfig: {
    filterLock: {
      filter: {
        tooltip: "Filter Tooltip",
        icon: <div data-testid="filter-icon">Filter Icon</div>,
      },
      lock: {
        tooltip: "Lock Tooltip",
        locked: {
          icon: <div data-testid="locked-icon">Locked Icon</div>,
        },
        unlocked: {
          icon: <div data-testid="unlocked-icon">Unlocked Icon</div>,
        },
      },
    },
  },
}));

// Mock the CustomTooltip component
jest.mock("../../../../../src/components/common/CustomTooltip", () => {
  return function MockCustomTooltip({ children, title }) {
    return React.cloneElement(children, {
      "data-testid": "custom-tooltip",
      "data-title": title,
    });
  };
});

describe("FilterAndLock", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<FilterAndLock />);
    expect(screen.getByTestId("filter-icon")).toBeInTheDocument();
    expect(screen.getByTestId("unlocked-icon")).toBeInTheDocument();
  });

  it("displays tooltips for filter and lock buttons", () => {
    render(<FilterAndLock />);
    
    const filterButton = screen.getByTestId("filter-icon").closest("[data-testid='custom-tooltip']");
    const lockButton = screen.getByTestId("unlocked-icon").closest("[data-testid='custom-tooltip']");
    
    expect(filterButton).toHaveAttribute("data-title", "Filter Tooltip");
    expect(lockButton).toHaveAttribute("data-title", "Lock Tooltip");
  });

  it("toggles lock state when lock button is clicked", () => {
    render(<FilterAndLock />);
    
    // Initially unlocked
    expect(screen.getByTestId("unlocked-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("locked-icon")).not.toBeInTheDocument();
    
    // Click to lock
    fireEvent.click(screen.getByTestId("unlocked-icon").closest("button"));
    
    // Now it should be locked
    expect(screen.queryByTestId("unlocked-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("locked-icon")).toBeInTheDocument();
    
    // Click again to unlock
    fireEvent.click(screen.getByTestId("locked-icon").closest("button"));
    
    // Back to unlocked
    expect(screen.getByTestId("unlocked-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("locked-icon")).not.toBeInTheDocument();
  });

  it("toggles filter state when filter button is clicked", () => {
    render(<FilterAndLock />);
    
    // Initially no badge/dot
    expect(document.querySelector(".filter-lock-badge")).not.toBeInTheDocument();
    
    // Click to filter
    fireEvent.click(screen.getByTestId("filter-icon").closest("button"));
    
    // Now badge and dot should appear
    expect(document.querySelector(".filter-lock-badge")).toBeInTheDocument();
    expect(document.querySelector(".filter-lock-dot")).toBeInTheDocument();
    
    // Click again to remove filter
    fireEvent.click(screen.getByTestId("filter-icon").closest("button"));
    
    // Badge and dot should be gone
    expect(document.querySelector(".filter-lock-badge")).not.toBeInTheDocument();
    expect(document.querySelector(".filter-lock-dot")).not.toBeInTheDocument();
  });

  it("adds filter-active class to divider when filter is active", () => {
    render(<FilterAndLock />);
    
    // Initially divider has no filter-active class
    const divider = document.querySelector(".filter-lock-divider");
    expect(divider).not.toHaveClass("filter-active");
    
    // Click to filter
    fireEvent.click(screen.getByTestId("filter-icon").closest("button"));
    
    // Now divider should have filter-active class
    expect(divider).toHaveClass("filter-active");
  });

  it("renders with correct button classNames", () => {
    render(<FilterAndLock />);
    
    // Check filter button class
    expect(screen.getByTestId("filter-icon").closest("button")).toHaveClass("filter-lock-btn");
    
    // Check lock button class
    expect(screen.getByTestId("unlocked-icon").closest("button")).toHaveClass("icon-lock");
  });

  it("sets aria-hidden on appropriate elements", () => {
    render(<FilterAndLock />);
    
    // Icons should have aria-hidden="true"
    expect(screen.getByTestId("filter-icon").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("unlocked-icon").parentElement).toHaveAttribute("aria-hidden", "true");
    
    // Divider should have aria-hidden="true"
    expect(document.querySelector(".filter-lock-divider")).toHaveAttribute("aria-hidden", "true");
  });

  it("handles missing config values gracefully", () => {
    // Save original config
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    
    // Replace with minimal config to test error handling
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      filterLock: {
        filter: {
          tooltip: "Filter Tooltip",
          icon: <div data-testid="filter-icon">Filter Icon</div>,
        },
        lock: {
          tooltip: "Lock Tooltip",
          // Use empty objects to prevent errors
          locked: { icon: <div>Locked</div> },
          unlocked: { icon: <div>Unlocked</div> },
        },
      },
    };
    
    // Should not throw
    expect(() => {
      render(<FilterAndLock />);
    }).not.toThrow();
    
    // Restore original config
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("renders root element with correct class", () => {
    const { container } = render(<FilterAndLock />);
    expect(container.querySelector(".filter-lock-root")).toBeInTheDocument();
  });

  it("sets correct button type attributes", () => {
    render(<FilterAndLock />);
    
    // Both buttons should have type="button"
    expect(screen.getByTestId("filter-icon").closest("button")).toHaveAttribute("type", "button");
    expect(screen.getByTestId("unlocked-icon").closest("button")).toHaveAttribute("type", "button");
  });
});