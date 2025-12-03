import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../src/App";
import { Provider } from "react-redux";
import store from "../src/store/configureStore";

// Mock useRoutes to simplify the test
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRoutes: jest.fn(() => <div>Mocked Routes</div>),
}));

describe("App component", () => {
  it("renders routes within Provider", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Verifying mocked routes text is visible
    expect(screen.getByText("Mocked Routes")).toBeInTheDocument();
  });
});
