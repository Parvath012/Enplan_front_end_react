import React from "react";
import { render, screen } from "@testing-library/react";
jest.mock('react-dom/server', () => ({
  renderToStaticMarkup: jest.fn(() => '<svg></svg>'), // Use jest.fn() for better tracking
}));
import App from "../src/App";

describe("App Component", () => {
  it("renders the table footer", () => {
    render(<App />);
    // Check for a stat label from your config
    expect(screen.getByText(/Total rows/i)).toBeInTheDocument();
  });
});
