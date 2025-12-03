// tests/bootstrap.test.tsx

jest.mock('react-dom/server', () => ({
  renderToStaticMarkup: jest.fn(() => '<svg></svg>'), // Use jest.fn() for better tracking
}));

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
  });

  it("should render without crashing", async () => {
    // Set up the root DOM node
    const div = document.createElement("div");
    div.setAttribute("id", "app");
    document.body.appendChild(div);

    await expect(import("../src/bootstrap")).resolves.not.toThrow();
  });

  it("should throw if root element is missing", async () => {
    // Ensure no #app element exists
    document.getElementById = jest.fn(() => null);

    // Clear the module cache to force re-execution
    jest.resetModules();

    await expect(import("../src/bootstrap")).rejects.toThrow("Root element not found");
  });
});