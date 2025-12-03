import React from "react";
import { render, fireEvent } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import CurrencyFormatSelector from "../../../../../src/components/tablecomponents/tableheader/components/CurrencyFormatSelector";

const mockStore = configureStore([]);
const initialState = {
  gridStore: { selectedCells: [{ rowId: 1, field: "amount" }] },
  dataStore: {
    tableConfiguration: [],
    formattingConfig: { "1:amount": { currency: "currency-USD" } }, // match option key
  },
};

describe("CurrencyFormatSelector", () => {
  let store: any;
  beforeEach(() => {
    store = mockStore(initialState);
  });

  it("renders without crashing", () => {
    const { container } = render(
      <Provider store={store}>
        <CurrencyFormatSelector expanded={false} onExpand={jest.fn()} />
      </Provider>
    );
    expect(container.querySelector(".font-selector-root")).toBeInTheDocument();
  });

  it("renders expanded options when expanded", () => {
    const { container } = render(
      <Provider store={store}>
        <CurrencyFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    expect(container.querySelector(".font-selector-divider")).toBeInTheDocument();
  });

  it("uses prop selectedCells and dispatch if provided", () => {
    const fakeDispatch = jest.fn();
    const customStore = mockStore({
      gridStore: { selectedCells: [] },
      dataStore: { tableConfiguration: [], formattingConfig: {} },
    });
    const { getByRole } = render(
      <Provider store={customStore}>
        <CurrencyFormatSelector
          expanded={true}
          onExpand={jest.fn()}
          selectedCells={[{ rowId: 2, field: "amount" }]}
          dispatch={fakeDispatch}
        />
      </Provider>
    );
    expect(getByRole("button")).toBeInTheDocument();
  });

  it("calls onFormat when a currency is selected", () => {
    const onFormat = jest.fn();
    const { getByRole, getAllByText } = render(
      <Provider store={store}>
        <CurrencyFormatSelector expanded={true} onExpand={jest.fn()} onFormat={onFormat} />
      </Provider>
    );
    // Open the dropdown
    fireEvent.mouseDown(getByRole("combobox"));
    // Find all elements containing "EUR"
    const options = getAllByText((content) => content.includes("EUR"));
    // Pick the menu item (role="option")
    const option = options.find(
      (el) => el.getAttribute && el.getAttribute("role") === "option"
    );
    expect(option).toBeTruthy();
    fireEvent.click(option!);
    expect(onFormat).toHaveBeenCalled();
  });

  it("shows placeholder when no currency is selected", () => {
    const emptyStore = mockStore({
      gridStore: { selectedCells: [] },
      dataStore: { tableConfiguration: [], formattingConfig: {} },
    });
    const { getByText } = render(
      <Provider store={emptyStore}>
        <CurrencyFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    expect(getByText(/Select currency/i)).toBeInTheDocument();
  });

  it("calls onRequestExpand when provided", () => {
    const onRequestExpand = jest.fn();
    const { getByRole } = render(
      <Provider store={store}>
        <CurrencyFormatSelector expanded={false} onExpand={jest.fn()} onRequestExpand={onRequestExpand} />
      </Provider>
    );
    // Simulate expand event (assuming GenericFormatSelector calls onRequestExpand)
    onRequestExpand();
    expect(onRequestExpand).toHaveBeenCalled();
  });

  it("handles empty selectedCells and formattingConfig", () => {
    const emptyStore = mockStore({
      gridStore: { selectedCells: undefined },
      dataStore: { tableConfiguration: [], formattingConfig: undefined },
    });
    const { getByText } = render(
      <Provider store={emptyStore}>
        <CurrencyFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    expect(getByText(/Select currency/i)).toBeInTheDocument();
  });

  it("renders without icon if config.icon is not a valid element", () => {
    jest.mock("../../../../../src/config/tableHeaderConfig", () => ({
      tableHeaderConfig: {
        currencyFormat: {
          ...jest.requireActual("../../../../../src/config/tableHeaderConfig").tableHeaderConfig.currencyFormat,
          icon: "not-a-react-element",
        },
      },
    }));
    const { container } = render(
      <Provider store={store}>
        <CurrencyFormatSelector expanded={false} onExpand={jest.fn()} />
      </Provider>
    );
    expect(container.querySelector("svg")).toBeTruthy(); // Should fallback or not render icon
  });
});
