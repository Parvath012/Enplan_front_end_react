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
  });

  it("should render without crashing", async () => {
    // Set up the root DOM node
    const div = document.createElement("div");
    div.setAttribute("id", "app");
    document.body.appendChild(div);

    await expect(import("../src/bootstrap")).resolves.not.toThrow();
  });

  it("should throw if root element is missing", async () => {
    document.getElementById = jest.fn(() => null);

    await expect(import("../src/bootstrap")).rejects.toThrow("Root element not found");
  });
});
