import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../src/App";
import { Provider } from "react-redux";
import store from "../src/store/configureStore";

// Mocking the Router component
jest.mock("../src/routers/Routers", () => () => <div>Mocked Router</div>);

describe("App component", () => {
  it("renders Router within Provider", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Verifying mocked Router text is visible
    expect(screen.getByText("Mocked Router")).toBeInTheDocument();
  });
});
