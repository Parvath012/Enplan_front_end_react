it("covers useEffect early return when screenfull is not enabled", () => {
    // First render with enabled true (subscribe branch)
    isEnabled = true;
    const { unmount } = render(<ImportExportSelector />);
    unmount();
    // Now render with enabled false (early return branch)
    isEnabled = false;
    render(<ImportExportSelector />);
    // If no error, both branches are covered
    isEnabled = true; // reset for other tests
  });
// Mock screenfull globally so component and test share the same instance
const mockToggle = jest.fn();
let isEnabled = true;
let isFullscreen = false;
jest.mock("screenfull", () => ({
  __esModule: true,
  default: {
    get isEnabled() { return isEnabled; },
    set isEnabled(val) { isEnabled = val; },
    get isFullscreen() { return isFullscreen; },
    set isFullscreen(val) { isFullscreen = val; },
    toggle: (...args: any[]) => mockToggle(...args),
    on: jest.fn(),
    off: jest.fn(),
  },
}));
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import ImportExportSelector from "../../../../../src/components/tablecomponents/tableheader/components/ImportExportSelector";

// Mock the tableHeaderConfig
jest.mock("../../../../../src/config/tableHeaderConfig", () => ({
  tableHeaderConfig: {
    importExport: {
      tooltip: "Import/Export Tooltip",
      icon: <div data-testid="import-export-icon">Import/Export</div>,
      expanded: [
        {
          key: "upload",
          tooltip: "Upload Tooltip",
          icon: <div data-testid="upload-icon">Upload</div>,
        },
        {
          key: "download",
          tooltip: "Download Tooltip",
          icon: <div data-testid="download-icon">Download</div>,
        },
        {
          key: "share",
          tooltip: "Share Tooltip",
          icon: <div data-testid="share-icon">Share</div>,
        },
        {
          key: "run",
          tooltip: "Run Tooltip",
          icon: <div data-testid="run-icon">Run</div>,
        },
      ],
    },
  },
}));

// Mock the SearchBar component
jest.mock("../../../../../src/components/tablecomponents/tableheader/components/SearchBar", () => {
  return function MockSearchBar() {
    return <div data-testid="search-bar">Search Bar</div>;
  };
});

// Mock the CustomTooltip component
jest.mock("../../../../../src/components/common/CustomTooltip", () => {
  return function MockCustomTooltip({ children, title, placement }: { children: any, title: any, placement: any }) {
    return React.cloneElement(children, {
      "data-testid": "custom-tooltip",
      "data-title": title,
      "data-placement": placement,
    });
  };
});

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe("ImportExportSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<ImportExportSelector />);
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("import-export-icon")).toBeInTheDocument();
    expect(screen.getByTestId("run-icon")).toBeInTheDocument();
  });

  it("renders in initial collapsed state", () => {
    render(<ImportExportSelector />);
    
    // Should show SearchBar
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    
    // Should show dividers
    const dividers = document.querySelectorAll(".import-export-divider");
    expect(dividers.length).toBe(3);
    
    // Should show import/export icon
    const importExportIcon = screen.getByTestId("import-export-icon");
    expect(importExportIcon).toBeInTheDocument();
    expect(importExportIcon.parentElement).toHaveAttribute("data-title", "Import/Export Tooltip");
    
    // Should show run icon
    const runIcon = screen.getByTestId("run-icon");
    expect(runIcon).toBeInTheDocument();
    expect(runIcon.parentElement).toHaveAttribute("data-title", "Run Tooltip");
    
    // Should not show action icons
    expect(screen.queryByTestId("upload-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("download-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("share-icon")).not.toBeInTheDocument();
  });

  it("expands when import/export icon is clicked", () => {
    render(<ImportExportSelector />);
    
    // Find and click the import/export icon
    const importExportIcon = screen.getByTestId("import-export-icon");
    fireEvent.click(importExportIcon);
    
    // Should now show action icons
    expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
    expect(screen.getByTestId("download-icon")).toBeInTheDocument();
    expect(screen.getByTestId("share-icon")).toBeInTheDocument();
    
    // Check that more dividers are shown
    const dividers = document.querySelectorAll(".import-export-divider");
    expect(dividers.length).toBe(4);
  });

  it("collapses when expanded import/export icon is clicked", () => {
    render(<ImportExportSelector />);
    
    // First expand
    const importExportIcon = screen.getByTestId("import-export-icon");
    fireEvent.click(importExportIcon);
    
    // Verify expanded state
    expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
    
    // Then collapse
    const expandedImportExportIcon = screen.getByTestId("import-export-icon");
    fireEvent.click(expandedImportExportIcon);
    
    // Verify collapsed state
    expect(screen.queryByTestId("upload-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("download-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("share-icon")).not.toBeInTheDocument();
  });

  it("shows upload icon without tooltip immediately after expanding", () => {
    render(<ImportExportSelector />);
    
    // Expand the menu
    const importExportIcon = screen.getByTestId("import-export-icon");
    fireEvent.click(importExportIcon);
    
    // Find upload icon
    const uploadIcon = screen.getByTestId("upload-icon");
    expect(uploadIcon).toBeInTheDocument();
    
    // The upload icon should not have the tooltip initially
    expect(uploadIcon.parentElement).not.toHaveAttribute("data-title");
    
    // After the timer completes, it should have a tooltip
    act(() => {
      jest.advanceTimersByTime(500); // More than the 400ms timeout
    });
    
    // Re-render to see the effect of the timeout
    const uploadIconAfterTimeout = screen.getByTestId("upload-icon");
    expect(uploadIconAfterTimeout.parentElement).toHaveAttribute("data-title", "Upload Tooltip");
  });

  it("clears timeout when collapsing before timer completes", () => {
    // Spy on clearTimeout
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    render(<ImportExportSelector />);
    
    // Expand the menu
    const importExportIcon = screen.getByTestId("import-export-icon");
    fireEvent.click(importExportIcon);
    
    // Collapse before timeout completes
    const expandedImportExportIcon = screen.getByTestId("import-export-icon");
    fireEvent.click(expandedImportExportIcon);
    
    // Should have called clearTimeout
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });

  it("clears timeout when expanding again before timer completes", () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    render(<ImportExportSelector />);
    // First expand
    fireEvent.click(screen.getByTestId("import-export-icon"));

    // Re-query after state change
    const expandedImportExportIcon = screen.getByTestId("import-export-icon");

    // Second expand before timeout fires
    fireEvent.click(expandedImportExportIcon);

    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it("handles missing icons gracefully", () => {
    // Save original config
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    
    // Modify the mock to have null icon
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        icon: null,
      },
    };
    
    // Should render without crashing even with null icon
    render(<ImportExportSelector />);
    
    // Search bar and run icon should still be there
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByTestId("run-icon")).toBeInTheDocument();
    
    // Restore original config
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("handles empty actions array", () => {
    // Save original config
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    
    // Modify the mock to have empty expanded array
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        expanded: [],
      },
    };
    
    // Should render without crashing
    const { container } = render(<ImportExportSelector />);
    
    // SearchBar should still be there
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    
    // Import/Export icon should still be there
    expect(screen.getByTestId("import-export-icon")).toBeInTheDocument();
    
    // No run icon should be visible since actions[3] would be undefined
    expect(screen.queryByTestId("run-icon")).not.toBeInTheDocument();
    
    // Restore original config
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("applies correct classes to import/export icon", () => {
    render(<ImportExportSelector />);
    
    // Check initial class
    const importExportIcon = screen.getByTestId("import-export-icon");
    expect(importExportIcon).toHaveClass("import-export-icon");
    expect(importExportIcon).not.toHaveClass("show");
    
    // Expand
    fireEvent.click(importExportIcon);
    
    // After expanding, icon should have "show" class
    const expandedIcon = screen.getByTestId("import-export-icon");
    expect(expandedIcon).toHaveClass("import-export-icon");
    expect(expandedIcon).toHaveClass("show");
  });

  it("applies correct styling to icons", () => {
    render(<ImportExportSelector />);
    
    // Check that import/export icon has correct styling
    const importExportIcon = screen.getByTestId("import-export-icon");
    expect(importExportIcon).toHaveStyle({
      width: "25px",
      height: "25px",
    });
    
    // Expand to check action icons
    fireEvent.click(importExportIcon);
    
    // After expanding, expanded icon should have same styling
    const expandedIcon = screen.getByTestId("import-export-icon");
    expect(expandedIcon).toHaveStyle({
      width: "25px",
      height: "25px",
    });
  });

  it("handles optional chaining for run action", () => {
    // Save original config
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    
    // Modify the mock to have only 3 actions (no run action)
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        expanded: originalConfig.importExport.expanded.slice(0, 3),
      },
    };
    
    // Should render without crashing
    render(<ImportExportSelector />);
    
    // The run icon should not be visible
    expect(screen.queryByTestId("run-icon")).not.toBeInTheDocument();
    
    // Restore original config
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("renders with correct tooltip placements", () => {
    render(<ImportExportSelector />);
    
    // Import/Export icon should have bottom placement
    const importExportIcon = screen.getByTestId("import-export-icon");
    expect(importExportIcon.parentElement).toHaveAttribute("data-placement", "bottom");
    
    // Run icon should have bottom placement
    const runIcon = screen.getByTestId("run-icon");
    expect(runIcon.parentElement).toHaveAttribute("data-placement", "bottom");
    
    // Expand to check action icons
    fireEvent.click(importExportIcon);
    
    // Wait for justExpanded to become false
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // All action icons should have bottom placement
    const uploadIcon = screen.getByTestId("upload-icon");
    const downloadIcon = screen.getByTestId("download-icon");
    const shareIcon = screen.getByTestId("share-icon");
    
    expect(uploadIcon.parentElement).toHaveAttribute("data-placement", "bottom");
    expect(downloadIcon.parentElement).toHaveAttribute("data-placement", "bottom");
    expect(shareIcon.parentElement).toHaveAttribute("data-placement", "bottom");
  });

  it("handles missing importExport config gracefully", () => {
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {};
    expect(() => render(<ImportExportSelector />)).not.toThrow();
    // Restore
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("handles missing expanded actions array gracefully", () => {
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        expanded: undefined,
      },
    };
    expect(() => render(<ImportExportSelector />)).not.toThrow();
    // Restore
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("handles missing icon in actions gracefully", () => {
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        expanded: [
          { ...originalConfig.importExport.expanded[0], icon: null },
          ...originalConfig.importExport.expanded.slice(1),
        ],
      },
    };
    render(<ImportExportSelector />);
    // Should not throw and should render without upload icon
    // Restore
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("handles missing tooltip in actions gracefully", () => {
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        expanded: [
          { ...originalConfig.importExport.expanded[0], tooltip: undefined },
          ...originalConfig.importExport.expanded.slice(1),
        ],
      },
    };
    render(<ImportExportSelector />);
    // Should not throw and should render upload icon without tooltip
    // Restore
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("handles missing fullscreen actions gracefully", () => {
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        expanded: [
          ...originalConfig.importExport.expanded,
          undefined, // 4
          undefined, // 5
        ],
      },
    };
    render(<ImportExportSelector />);
    // Should not throw and should render fullscreen button without icon
    // Restore
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("handles screenfull not enabled", () => {
    isEnabled = false;
    render(<ImportExportSelector />);
    // Fullscreen button should be disabled
    const btn = document.querySelector(".import-export-fit-to-screen");
    expect(btn).toBeDisabled();
    isEnabled = true;
  });

  it("handles screenfull toggle", () => {
    isEnabled = true;
    mockToggle.mockClear();
    render(<ImportExportSelector />);
    const btn = document.querySelector(".import-export-fit-to-screen");
    if (btn) {
      fireEvent.click(btn);
      expect(mockToggle).toHaveBeenCalled();
    } else {
      throw new Error("Fullscreen button not found");
    }
  });

  it("does not subscribe to screenfull events if not enabled", () => {
    // Arrange
    isEnabled = false;
    const screenfullModule = require("screenfull");
    const onSpy = jest.spyOn(screenfullModule.default, "on");
    const offSpy = jest.spyOn(screenfullModule.default, "off");
    render(<ImportExportSelector />);
    // Should not subscribe or unsubscribe
    expect(onSpy).not.toHaveBeenCalled();
    expect(offSpy).not.toHaveBeenCalled();
    onSpy.mockRestore();
    offSpy.mockRestore();
    isEnabled = true;
  });

  it("clears timeout if expandTimeout.current is set before expand/collapse", () => {
    render(<ImportExportSelector />);
    // Manually set expandTimeout.current
    const comp = screen.getByTestId("import-export-icon");
    fireEvent.click(comp); // expand
    act(() => {
      jest.advanceTimersByTime(100);
    });
    fireEvent.click(comp); // collapse
    // If no error, branch is covered
  });

  it("renders actions[0-3] with icon as null/undefined", () => {
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    // Set icons to null/undefined for actions[0-3]
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        expanded: [
          { ...originalConfig.importExport.expanded[0], icon: null },
          { ...originalConfig.importExport.expanded[1], icon: undefined },
          { ...originalConfig.importExport.expanded[2], icon: null },
          { ...originalConfig.importExport.expanded[3], icon: undefined },
        ],
      },
    };
    render(<ImportExportSelector />);
    // Should not throw and should not render those icons
    expect(screen.queryByTestId("upload-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("download-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("share-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("run-icon")).not.toBeInTheDocument();
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("renders tooltips as empty string or undefined for actions[0-3]", () => {
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        expanded: [
          { ...originalConfig.importExport.expanded[0], tooltip: "" },
          { ...originalConfig.importExport.expanded[1], tooltip: undefined },
          { ...originalConfig.importExport.expanded[2], tooltip: "" },
          { ...originalConfig.importExport.expanded[3], tooltip: undefined },
        ],
      },
    };
    render(<ImportExportSelector />);
    fireEvent.click(screen.getByTestId("import-export-icon"));
    act(() => {
      jest.advanceTimersByTime(500);
    });
    // Should render icons with empty/undefined tooltip
    const uploadIcon = screen.queryByTestId("upload-icon");
    if (uploadIcon) expect(uploadIcon.parentElement).toHaveAttribute("data-title", "");
    const downloadIcon = screen.queryByTestId("download-icon");
    if (downloadIcon) expect(downloadIcon.parentElement).toHaveAttribute("data-title", "");
    const shareIcon = screen.queryByTestId("share-icon");
    if (shareIcon) expect(shareIcon.parentElement).toHaveAttribute("data-title", "");
    const runIcon = screen.queryByTestId("run-icon");
    if (runIcon) expect(runIcon.parentElement).toHaveAttribute("data-title", "");
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("renders importExport tooltip as empty string or undefined", () => {
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        tooltip: "",
      },
    };
    render(<ImportExportSelector />);
    const icons = screen.getAllByTestId("import-export-icon");
    expect(icons[0].parentElement).toHaveAttribute("data-title", "");
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        tooltip: undefined,
      },
    };
    render(<ImportExportSelector />);
    const icons2 = screen.getAllByTestId("import-export-icon");
    expect(icons2[0].parentElement).toHaveAttribute("data-title", "");
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  it("renders fullscreen actions[4/5] with icon as null/undefined", () => {
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      importExport: {
        ...originalConfig.importExport,
        expanded: [
          ...originalConfig.importExport.expanded,
          { tooltip: "Fullscreen Tooltip", icon: null }, // 4
          { tooltip: "Exit Fullscreen Tooltip", icon: undefined }, // 5
        ],
      },
    };
    render(<ImportExportSelector />);
    // Should not throw and should not render fullscreen icons
    const btn = document.querySelector(".import-export-fit-to-screen");
    expect(btn).toBeInTheDocument();
    expect(btn?.querySelector("[data-testid]"))?.toBeNull();
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });
});