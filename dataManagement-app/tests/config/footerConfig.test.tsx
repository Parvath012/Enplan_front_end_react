import { footerData } from "../../src/config/footerConfig";

describe("footerConfig", () => {
  it("should have default ('') footer items with correct keys and text", () => {
    const items = footerData[""];
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    // Check a few known keys and texts
    expect(items.find(i => i.key === "activeThreads")?.text).toBe("0");
    expect(items.find(i => i.key === "queuedBytes")?.tooltip).toBe("Total queued data");
    expect(items.find(i => i.key === "lastUpdated")?.text).toBe("00:00 IST");
  });

  it("should have reporting footer items with correct keys and text", () => {
    const items = footerData["reporting"];
    expect(Array.isArray(items)).toBe(true);
    expect(items.find(i => i.key === "info")?.text).toContain("Listed services are available");
    expect(items.find(i => i.key === "lastUpdated")?.text).toBe("00:00 IST");
  });

  it("should have services footer items with correct keys and text", () => {
    const items = footerData["services"];
    expect(Array.isArray(items)).toBe(true);
    expect(items.find(i => i.key === "lastUpdated")?.text).toBe("00:00 IST");
  });
});