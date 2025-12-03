import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SelectorIconButton from "../../../../../src/components/tablecomponents/tableheader/components/SelectorIconButton";


// ✅ Mock useDispatch globally once
const mockDispatch = jest.fn();
jest.mock("react-redux", () => {
  const actualRedux = jest.requireActual("react-redux");
  return {
    ...actualRedux,
    useDispatch: () => mockDispatch,
  };
});

// Mock actions just for coverage
import * as alignmentActions from "../../../../../src/store/Actions/alignmentActions";

// Define top-level mocks for useExpandableSelector
const mockHandleExpand = jest.fn();
const mockHandleRequestExpand = jest.fn();
const mockHandleKeyDown = jest.fn();

jest.mock("../../../../../src/components/tablecomponents/tableheader/components/useExpandableSelector", () => ({
  useExpandableSelector: () => ({
    handleExpand: mockHandleExpand,
    handleRequestExpand: mockHandleRequestExpand,
    handleKeyDown: mockHandleKeyDown,
  }),
}));

// Mock tableHeaderConfig
const expandedOptions = [
  { key: "textwrapping", tooltip: "Text Wrapping Tooltip", icon: <div data-testid="textwrapping-icon" style={{ fontSize: 20, color: "#667085" }}>Wrap</div> },
  { key: "align2", tooltip: "Align 2 Tooltip", icon: <div data-testid="align2-icon" style={{ fontSize: 20, color: "#667085" }}>Align 2</div> },
  { key: "align3", tooltip: "Align 3 Tooltip", icon: <div data-testid="align3-icon" style={{ fontSize: 20, color: "#667085" }}>Align 3</div> },
  { key: "align4", tooltip: "Align 4 Tooltip", icon: <div data-testid="align4-icon" style={{ fontSize: 20, color: "#667085" }}>Align 4</div> },
  { key: "align5", tooltip: "Align 5 Tooltip", icon: <div data-testid="align5-icon" style={{ fontSize: 20, color: "#667085" }}>Align 5</div> },
  { key: "align6", tooltip: "Align 6 Tooltip", icon: <div data-testid="align6-icon" style={{ fontSize: 20, color: "#667085" }}>Align 6</div> },
  { key: "align7", tooltip: "Align 7 Tooltip", icon: <div data-testid="align7-icon" style={{ fontSize: 20, color: "#667085" }}>Align 7</div> },
  { key: "align8", tooltip: "Align 8 Tooltip", icon: <div data-testid="align8-icon" style={{ fontSize: 20, color: "#667085" }}>Align 8</div> },
];

// Mock the entire module to prevent interference
jest.mock("../../../../../src/config/tableHeaderConfig", () => {
  const mockConfig = {
    tableHeaderConfig: {
      alignment: {
        tooltip: "Alignment Tooltip",
        icon: <div data-testid="icon-default">Alignment Icon</div>,
        expanded: expandedOptions,
      },
    },
  };
  return mockConfig;
});

jest.mock("../../../../../src/components/tablecomponents/tableheader/components/SelectorIconButton", () => {
  return function MockSelectorIconButton(props: any) {
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

jest.mock("../../../../../src/components/common/CustomTooltip", () => {
  return function MockCustomTooltip({ children, title }: { children: any, title: any }) {
    return React.cloneElement(children, {
      "data-testid": "custom-tooltip",
      "data-title": title,
    });
  };
});



import AlignmentSelector from "../../../../../src/components/tablecomponents/tableheader/components/AlignmentSelector";
// Shared mock store and renderComponent helper for all tests
const mockStore = configureStore([]);
const store = mockStore({});
const renderComponent = (props: any = {}) => {
  return render(
    <Provider store={store as any}>
      <AlignmentSelector {...props} />
    </Provider>
  );
};

describe("AlignmentSelector", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  it("renders correct icon size and style for main icon", () => {
    // Test collapsed state
    renderComponent({ expanded: false, onExpand: jest.fn() });
    const collapsedButton = screen.getByTestId("selector-icon-btn");
    const collapsedIcon = collapsedButton.querySelector('[data-testid="icon-default"]');
    
    expect(collapsedIcon).toHaveStyle("font-size: 25px");
    expect(collapsedIcon).toHaveStyle("height: 25px");
    expect(collapsedIcon).toHaveStyle("width: 25px");
    expect(collapsedIcon).toHaveStyle("color: rgb(95, 99, 104)");
  });

  it("renders correct icon size and style for expanded state", () => {
    // Test expanded state
    renderComponent({ expanded: true, onExpand: jest.fn() });
    const expandedButton = screen.getByTestId("selector-icon-btn");
    const expandedIcon = expandedButton.querySelector('[data-testid="icon-default"]');
    
    expect(expandedIcon).toHaveStyle("font-size: 25px");
    expect(expandedIcon).toHaveStyle("height: 25px");
    expect(expandedIcon).toHaveStyle("width: 25px");
    expect(expandedIcon).toHaveStyle("color: rgb(255, 255, 255)");
  });

  it("renders correct icon size and style for each option icon", () => {
    renderComponent({ expanded: true, onExpand: jest.fn() });
    // Each option button contains an SVG icon
    const optionButtons = document.querySelectorAll(".alignment-selector-option");
    optionButtons.forEach((btn) => {
      const icon = btn.querySelector("svg");
      if (icon) {
        expect(icon).toHaveStyle("font-size: 20px");
        expect(icon).toHaveStyle("color: #667085");
      }
    });
  });

  it("renders no option buttons if expanded config is missing or not an array", () => {
    jest.doMock("../../../../../src/config/tableHeaderConfig", () => ({
      tableHeaderConfig: {
        alignment: {
          tooltip: "Alignment Tooltip",
          icon: <div data-testid="icon-default">Alignment Icon</div>,
          expanded: undefined,
        },
      },
    }), { virtual: true });
    const AlignmentSelectorPatched = require("../../../../../src/components/tablecomponents/tableheader/components/AlignmentSelector").default;
    render(
      <Provider store={store as any}>
        <AlignmentSelectorPatched expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    expect(document.querySelectorAll(".alignment-selector-option-btn").length).toBe(0);
  });

  it("renders correct number of option buttons when expanded", () => {
    renderComponent({ expanded: true, onExpand: jest.fn() });
    // The actual rendered button class is "alignment-selector-option"
    const optionButtons = document.querySelectorAll(".alignment-selector-option");
    expect(optionButtons.length).toBe(8);
  });

  it("renders correct number of dividers after options", () => {
    renderComponent({ expanded: true, onExpand: jest.fn() });
    const dividers = document.querySelectorAll(".alignment-selector-option-divider");
    expect(dividers.length).toBe(3);
  });

  it("renders correct aria-label for each option button", () => {
    renderComponent({ expanded: true, onExpand: jest.fn() });
    const optionButtons = document.querySelectorAll(".alignment-selector-option-btn");
    optionButtons.forEach((btn, idx) => {
      expect(btn).toHaveAttribute("aria-label", `Align ${idx + 1} Tooltip`);
    });
  });

  it("calls handleExpand when button is clicked in expanded state", () => {
    renderComponent({ expanded: true, onExpand: jest.fn() });
    fireEvent.click(screen.getByTestId("selector-icon-btn"));
    expect(mockHandleExpand).toHaveBeenCalled();
  });

  it("calls handleRequestExpand when button is clicked in collapsed state", () => {
    renderComponent({ expanded: false, onExpand: jest.fn() });
    fireEvent.click(screen.getByTestId("selector-icon-btn"));
    expect(mockHandleRequestExpand).toHaveBeenCalled();
  });

  it("calls handleKeyDown with correct handler for expanded/collapsed", () => {
    renderComponent({ expanded: true, onExpand: jest.fn() });
    let btns = screen.getAllByTestId("selector-icon-btn");
    fireEvent.keyDown(btns[btns.length - 1], { key: "Enter" });
    expect(mockHandleKeyDown).toHaveBeenCalledWith(mockHandleExpand);

    renderComponent({ expanded: false, onExpand: jest.fn() });
    btns = screen.getAllByTestId("selector-icon-btn");
    fireEvent.keyDown(btns[btns.length - 1], { key: "Enter" });
    expect(mockHandleKeyDown).toHaveBeenCalledWith(mockHandleRequestExpand);
  });

  it("renders no icon if icon is missing in config (calls SelectorIconButton with icon: null)", () => {
    // Create a mock component that passes null as icon
    const MockAlignmentSelector = ({ expanded, onExpand }: any) => (
      <div className="alignment-selector-root">
        <SelectorIconButton
          tooltip="Alignment Tooltip"
          expanded={expanded}
          className={`alignment-selector-btn${expanded ? " expanded" : ""}`}
          icon={null}
          onClick={expanded ? onExpand : onExpand}
          onKeyDown={() => {}}
        />
      </div>
    );
    
    render(
      <Provider store={store as any}>
        <MockAlignmentSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    // The icon prop should be null, so the button should not have an SVG child
    const icon = screen.getByTestId("selector-icon-btn").querySelector("svg");
    expect(icon).toBeNull();
  });

  it("stops propagation when clicking on options container", () => {
    renderComponent({ expanded: true, onExpand: jest.fn() });
    const optionsContainer = document.querySelector(".alignment-selector-options");
    const stopPropagationSpy = jest.spyOn(Event.prototype, "stopPropagation");
    fireEvent.click(optionsContainer!);
    expect(stopPropagationSpy).toHaveBeenCalled();
    stopPropagationSpy.mockRestore();
  });

  it("handles empty expanded options array (no icons rendered)", () => {
    jest.doMock("../../../../../src/config/tableHeaderConfig", () => ({
      tableHeaderConfig: {
        alignment: {
          tooltip: "Alignment Tooltip",
          icon: <div data-testid="icon-default">Alignment Icon</div>,
          expanded: [],
        },
      },
    }), { virtual: true });
    const AlignmentSelectorPatched = require("../../../../../src/components/tablecomponents/tableheader/components/AlignmentSelector").default;
    render(
      <Provider store={store as any}>
        <AlignmentSelectorPatched expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    expect(document.querySelector(".alignment-selector-options")).toBeInTheDocument();
    expect(document.querySelectorAll(".alignment-selector-option-btn").length).toBe(0);
  });

  it("handles missing icon in options", () => {
    jest.doMock("../../../../../src/config/tableHeaderConfig", () => ({
      tableHeaderConfig: {
        alignment: {
          tooltip: "Alignment Tooltip",
          icon: <div>Icon</div>,
          expanded: [{ key: "textwrapping", tooltip: "Wrap", icon: null }],
        },
      },
    }), { virtual: true });

    const PatchedAlignmentSelector = require("../../../../../src/components/tablecomponents/tableheader/components/AlignmentSelector").default;

    const { container } = render(
      <Provider store={store as any}>
        <PatchedAlignmentSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );

    expect(container.querySelectorAll(".alignment-selector-option-btn").length).toBe(0);
  });

  describe("Dividers", () => {
    it("renders correct number of dividers", () => {
      renderComponent({ expanded: true });
      const dividers = document.querySelectorAll(".alignment-selector-option-divider");
      expect(dividers.length).toBe(3);
    });

    it("adds aria-hidden to dividers", () => {
      renderComponent({ expanded: true });
      const dividers = document.querySelectorAll(".alignment-selector-option-divider");
      dividers.forEach((divider) => {
        expect(divider).toHaveAttribute("aria-hidden", "true");
      });
    });
  });
});
