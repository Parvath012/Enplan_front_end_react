import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../src/App";
import { Provider } from "react-redux";
import store from "../src/store/configureStore";

// Mock Router to simplify the test
jest.mock("../src/routers/Routers", () => () => <div data-testid="router">Mocked Router</div>);

// Mock Material-UI CssBaseline
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  CssBaseline: () => <div data-testid="css-baseline">CssBaseline</div>
}));

describe("App component", () => {
  it("renders without crashing", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    
    expect(screen.getByTestId("router")).toBeInTheDocument();
    expect(screen.getByTestId("css-baseline")).toBeInTheDocument();
  });

  it("renders Router within Provider", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    
    // Verifying mocked Router is rendered
    expect(screen.getByTestId("router")).toBeInTheDocument();
  });

  it("includes CssBaseline component", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    
    // Verifying CssBaseline is rendered
    expect(screen.getByTestId("css-baseline")).toBeInTheDocument();
  });
});
