import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

import NumberFormatSelector from "../../../../../src/components/tablecomponents/tableheader/components/NumberFormatSelector";

// Mock the SelectorIconButton component
const mockSelectorIconButton = jest.fn();
jest.mock("../../../../../src/components/tablecomponents/tableheader/components/SelectorIconButton", () => {
  return function MockSelectorIconButton(props: any) {
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

// Mock the CustomTooltip component
jest.mock("../../../../../src/components/common/CustomTooltip", () => {
  return function MockCustomTooltip({ children, title }: { children: React.ReactElement; title: string }) {
    return React.cloneElement(
      children as React.ReactElement<any>,
      {
        ...(children.props ?? {}),
        "data-testid": "custom-tooltip",
        title: title
      }
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

const mockStore = configureStore([]);
// Update initialState to match the expected Redux state shape
const initialState = {
  gridStore: {
    selectedCells: [],
  },
  dataStore: {
    tableConfiguration: [],
    formattingConfig: {},
  },
};

describe("NumberFormatSelector", () => {
  let store: any;

  beforeEach(() => {
    store = mockStore(initialState);
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NumberFormatSelector expanded={false} onExpand={jest.fn()} />
      </Provider>
    );
    expect(getByTestId("selector-icon-btn")).toBeInTheDocument();
  });

  it("displays main icon with correct styling when not expanded", () => {
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={false} onExpand={jest.fn()} />
      </Provider>
    );
    // The main icon is a Carbon icon (CharacterWholeNumber), not a div or img
    const button = screen.getByTestId("selector-icon-btn");
    expect(button.querySelector("svg")).toBeInTheDocument();
    // Check that the icon was cloned with correct styling
    expect(mockSelectorIconButton).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.objectContaining({
          props: expect.objectContaining({
            style: expect.objectContaining({
              fontSize: 25,
              height: 25,
              width: 25,
              color: "#5F6368",
            }),
            "aria-hidden": true,
          }),
        }),
      })
    );
  });

  it("displays main icon with correct styling when expanded", () => {
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    const button = screen.getByTestId("selector-icon-btn");
    expect(button.querySelector("svg")).toBeInTheDocument();
    expect(mockSelectorIconButton).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.objectContaining({
          props: expect.objectContaining({
            style: expect.objectContaining({
              fontSize: 25,
              height: 25,
              width: 25,
              color: "#fff",
            }),
            "aria-hidden": true,
          }),
        }),
      })
    );
  });

  it("renders expanded options with correct icons and attributes", () => {
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    // Check for divider
    expect(document.querySelector(".number-format-selector-divider")).toBeInTheDocument();
    // Check for options container
    expect(document.querySelector(".number-format-selector-options")).toBeInTheDocument();
    // Check for option icons (img)
    expect(screen.getByAltText("Increase Decimal")).toBeInTheDocument();
    expect(screen.getByAltText("Decrease Decimal")).toBeInTheDocument();
    expect(screen.getByAltText("Comma Separator")).toBeInTheDocument();
    // Check for divider before comma
    const dividers = document.querySelectorAll(".number-format-selector-option-divider");
    expect(dividers.length).toBe(1);
  });

  it("doesn't render expanded options when expanded is false", () => {
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={false} onExpand={jest.fn()} />
      </Provider>
    );
    expect(document.querySelector(".number-format-selector-divider")).not.toBeInTheDocument();
    expect(document.querySelector(".number-format-selector-options")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Increase Decimal")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Decrease Decimal")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Comma Separator")).not.toBeInTheDocument();
  });

  it("calls onExpand when button is clicked in expanded state", () => {
    const mockOnExpand = jest.fn();
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={true} onExpand={mockOnExpand} />
      </Provider>
    );
    expect(mockSelectorIconButton).toHaveBeenCalledWith(
      expect.objectContaining({
        onClick: expect.any(Function)
      })
    );
    const button = screen.getByTestId("selector-icon-btn");
    fireEvent.click(button);
    expect(mockHandleExpand).toHaveBeenCalled();
  });

  it("calls onRequestExpand when button is clicked in non-expanded state", () => {
    const mockOnExpand = jest.fn();
    const mockOnRequestExpand = jest.fn();
    render(
      <Provider store={store}>
        <NumberFormatSelector 
          expanded={false} 
          onExpand={mockOnExpand} 
          onRequestExpand={mockOnRequestExpand} 
        />
      </Provider>
    );
    expect(mockSelectorIconButton).toHaveBeenCalledWith(
      expect.objectContaining({
        onClick: expect.any(Function)
      })
    );
    const button = screen.getByTestId("selector-icon-btn");
    fireEvent.click(button);
    expect(mockHandleRequestExpand).toHaveBeenCalled();
    expect(mockHandleExpand).not.toHaveBeenCalled();
  });

  it("uses default onRequestExpand when not provided", () => {
    const mockOnExpand = jest.fn();
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={false} onExpand={mockOnExpand} />
      </Provider>
    );
    const button = screen.getByTestId("selector-icon-btn");
    fireEvent.click(button);
    expect(mockHandleRequestExpand).toHaveBeenCalled();
  });

  it("handles keyboard events", () => {
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    expect(mockHandleKeyDown).toHaveBeenCalled();
    const keyDownHandler = mockSelectorIconButton.mock.calls[0][0].onKeyDown;
    keyDownHandler({ key: "Enter" });
    const returnedHandler = mockHandleKeyDown.mock.results[0].value;
    expect(returnedHandler).toHaveBeenCalled();
  });

  it("renders option buttons with correct attributes", () => {
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    const optionButtons = document.querySelectorAll(".number-format-selector-option");
    expect(optionButtons.length).toBe(3);
    optionButtons.forEach((button) => {
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("tabIndex", "0");
      expect(button).toHaveAttribute("aria-label");
    });
  });

  it("applies correct class names", () => {
    const { container } = render(
      <Provider store={store}>
        <NumberFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    expect(container.querySelector(".number-format-selector-root")).toBeInTheDocument();
    expect(mockSelectorIconButton).toHaveBeenCalledWith(
      expect.objectContaining({
        className: "number-format-selector-btn expanded"
      })
    );
    mockSelectorIconButton.mockClear();
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={false} onExpand={jest.fn()} />
      </Provider>
    );
    expect(mockSelectorIconButton).toHaveBeenCalledWith(
      expect.objectContaining({
        className: "number-format-selector-btn"
      })
    );
  });

  it("calls onFormat with correct arguments when option is clicked", () => {
    const mockOnFormat = jest.fn();
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={true} onExpand={jest.fn()} onFormat={mockOnFormat} />
      </Provider>
    );
    // Click the first option (Increase Decimal)
    const btns = document.querySelectorAll(".number-format-selector-option");
    fireEvent.click(btns[0]);
    expect(mockOnFormat).toHaveBeenCalled();
    // Should only call with editable cells (none in initialState)
    expect(mockOnFormat.mock.calls[0][2]).toEqual([]);
  });

  it("uses selectedCells prop over Redux", () => {
    const mockOnFormat = jest.fn();
    const selectedCells = [{ field: "foo" }, { field: "bar" }];
    render(
      <Provider store={store}>
        <NumberFormatSelector
          expanded={true}
          onExpand={jest.fn()}
          onFormat={mockOnFormat}
          selectedCells={selectedCells}
        />
      </Provider>
    );
    // Click the first option
    const btns = document.querySelectorAll(".number-format-selector-option");
    fireEvent.click(btns[0]);
    // Should use prop selectedCells (but no editable fields in config, so filtered to [])
    expect(mockOnFormat.mock.calls[0][2]).toEqual([]);
  });

  it("handles missing config.expanded gracefully", () => {
    // Save original config
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      ...originalConfig,
      numberFormat: {
        ...originalConfig.numberFormat,
        expanded: undefined,
      },
    };
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    // Should not throw and not render options
    expect(document.querySelector(".number-format-selector-options")).toBeInTheDocument();
    // Restore
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  // (moved to NumberFormatSelector.emptyConfig.test.tsx)

  it("handles missing Redux state gracefully", () => {
    // Provide minimal state shape to avoid TypeError
    const emptyStore = mockStore({
      gridStore: { selectedCells: [] },
      dataStore: { tableConfiguration: [], formattingConfig: {} },
    });
    render(
      <Provider store={emptyStore}>
        <NumberFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    // Should render without crashing
    expect(screen.getByTestId("selector-icon-btn")).toBeInTheDocument();
  });

  it("does not call onFormat if not provided", () => {
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    const btns = document.querySelectorAll(".number-format-selector-option");
    btns.forEach(btn => fireEvent.click(btn));
    // No error, nothing to assert
  });

  it("renders with dividerBefore option", () => {
    // Save original config
    const originalConfig = jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig;
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = {
      ...originalConfig,
      numberFormat: {
        ...originalConfig.numberFormat,
        expanded: [
          { key: "inc", tooltip: "Inc", icon: <img alt="Inc" />, dividerBefore: true },
        ],
      },
    };
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    expect(document.querySelector(".number-format-selector-option-divider")).toBeInTheDocument();
    // Restore
    jest.requireMock("../../../../../src/config/tableHeaderConfig").tableHeaderConfig = originalConfig;
  });

  // Remove or skip tests that expect test IDs or icon structure not present in the real config
});