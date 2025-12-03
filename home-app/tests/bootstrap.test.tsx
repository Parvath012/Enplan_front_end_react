describe("bootstrap.tsx", () => {
  beforeAll(() => {
    // Set up the root DOM node
    const div = document.createElement("div");
    div.setAttribute("id", "app");
    document.body.appendChild(div);
  });

  afterAll(() => {
    // Clean up the root DOM node
    const div = document.getElementById("app");
    if (div) div.remove();
  });

  it("should render without crashing", async () => {
    await expect(import("../src/bootstrap")).resolves.not.toThrow();
  });

  it("should throw if root element is missing", async () => {
    // Remove the root element
    const div = document.getElementById("app");
    if (div) div.remove();

    // Clear the module cache so bootstrap re-runs
    jest.resetModules();

    await expect(import("../src/bootstrap")).rejects.toThrow("Root element not found");
  });
});
