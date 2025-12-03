import React from "react";
import ReactDOM from "react-dom/client";

// Mock ReactDOM.createRoot
const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({
  render: mockRender
}));

jest.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot
}));

// Mock BrowserRouter
jest.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="browser-router">{children}</div>
  )
}));

// Mock App component
jest.mock("../src/App", () => {
  return function MockApp() {
    return <div data-testid="app">Mock App</div>;
  };
});

describe("bootstrap.tsx", () => {
  let originalGetElementById: typeof document.getElementById;

  beforeAll(() => {
    // Save original implementation
    originalGetElementById = document.getElementById;
  });

  afterAll(() => {
    // Restore original implementation
    document.getElementById = originalGetElementById;
  });

  beforeEach(() => {
    // Clean up DOM before each test
    document.body.innerHTML = "";
    jest.resetModules();
    mockRender.mockClear();
    mockCreateRoot.mockClear();
  });

  it("should render App component with BrowserRouter without crashing", async () => {
    // Set up the root DOM node
    const div = document.createElement("div");
    div.setAttribute("id", "app");
    document.body.appendChild(div);

    await expect(import("../src/bootstrap")).resolves.not.toThrow();
    
    // Verify createRoot was called with the correct element
    expect(mockCreateRoot).toHaveBeenCalledWith(div);
    
    // Verify render was called
    expect(mockRender).toHaveBeenCalled();
  });

  it("should throw if root element is missing", async () => {
    document.getElementById = jest.fn(() => null);

    await expect(import("../src/bootstrap")).rejects.toThrow("Root element not found");
  });

  it("should create root with correct element when app element exists", async () => {
    const div = document.createElement("div");
    div.setAttribute("id", "app");
    document.body.appendChild(div);

    // Mock getElementById to return our div
    document.getElementById = jest.fn(() => div);

    await import("../src/bootstrap");

    expect(mockCreateRoot).toHaveBeenCalledWith(div);
    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
  });

  it("should call render method on root", async () => {
    const div = document.createElement("div");
    div.setAttribute("id", "app");
    document.body.appendChild(div);

    // Mock getElementById to return our div
    document.getElementById = jest.fn(() => div);

    await import("../src/bootstrap");

    expect(mockRender).toHaveBeenCalledTimes(1);
  });
});
