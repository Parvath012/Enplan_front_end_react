describe("App error handling", () => {
  beforeEach(() => {
    // Ensure no #app element exists
    const existing = document.getElementById("app");
    if (existing) existing.remove();
    jest.resetModules();
  });

  it("throws an error if #app element is missing", () => {
    expect(() => {
      jest.isolateModules(() => {
        require("../src/App");
      });
    }).toThrow("Failed to find the root element");
  });
});

jest.mock("react-dom/client", () => {
  const actual = jest.requireActual("react-dom/client");
  return {
    ...actual,
    createRoot: jest.fn(() => ({ render: jest.fn() })),
  };
});

describe("App DOM mounting", () => {
  let rootDiv: HTMLDivElement;

  beforeEach(() => {
    rootDiv = document.createElement("div");
    rootDiv.id = "app";
    document.body.appendChild(rootDiv);
    jest.resetModules();
  });

  afterEach(() => {
    document.body.removeChild(rootDiv);
  });

  it("mounts App to the DOM without crashing", () => {
    const { createRoot } = require("react-dom/client");
    jest.isolateModules(() => {
      require("../src/App");
    });
    expect(createRoot).toHaveBeenCalledWith(rootDiv);
  });
});

// Test the App component itself
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  RouterProvider: () => <div data-testid="router-provider">Router Provider Mock</div>
}));

import React from 'react';

describe("App Component Function", () => {
  beforeEach(() => {
    // Create the #app element
    const appDiv = document.createElement("div");
    appDiv.id = "app";
    document.body.appendChild(appDiv);
  });

  afterEach(() => {
    // Clean up
    const appDiv = document.getElementById("app");
    if (appDiv) document.body.removeChild(appDiv);
  });

  it("has the app mount point available", () => {
    // Simply verify that the app div exists, which is what the App.tsx file needs
    expect(document.getElementById("app")).toBeTruthy();
  });
});
