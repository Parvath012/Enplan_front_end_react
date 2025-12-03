import React from "react";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

// Mock config with empty expanded array before importing the component
jest.mock("../../../../../src/config/tableHeaderConfig", () => ({
  tableHeaderConfig: {
    numberFormat: {
      tooltip: "Number Format Tooltip",
      icon: <svg />,
      expanded: [],
    },
  },
}));

const NumberFormatSelector = require("../../../../../src/components/tablecomponents/tableheader/components/NumberFormatSelector").default;

const mockStore = configureStore([]);

describe("NumberFormatSelector (empty config.expanded)", () => {
  it("handles empty config.expanded array", () => {
    const store = mockStore({
      gridStore: { selectedCells: [] },
      dataStore: { tableConfiguration: [], formattingConfig: {} },
    });
    render(
      <Provider store={store}>
        <NumberFormatSelector expanded={true} onExpand={jest.fn()} />
      </Provider>
    );
    // Should NOT render options container or any option buttons
    expect(document.querySelector(".number-format-selector-options")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".number-format-selector-option").length).toBe(0);
  });
});
