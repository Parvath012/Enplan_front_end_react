import { getDisplayValue } from "../../src/utils/cellDisplayUtils";

describe("cellDisplayUtils", () => {
  it("returns formatted currency value for USD", () => {
    const params = { value: 1234.56 };
    const formatting = { currency: "currency-USD", rawValue: 1234.56 };
    const result = getDisplayValue(params, formatting);
    expect(result).toMatch(/\$/);
  });

  it("returns formatted currency value for INR", () => {
    const params = { value: 1234.56 };
    const formatting = { currency: "currency-INR", rawValue: 1234.56 };
    const result = getDisplayValue(params, formatting);
    expect(result).toMatch(/₹/);
  });

  it("returns formatted currency value for EUR", () => {
    const params = { value: 1234.56 };
    const formatting = { currency: "currency-EUR", rawValue: 1234.56 };
    const result = getDisplayValue(params, formatting);
    expect(result).toMatch(/€/);
  });

  it("returns formatted currency value for GBP", () => {
    const params = { value: 1234.56 };
    const formatting = { currency: "currency-GBP", rawValue: 1234.56 };
    const result = getDisplayValue(params, formatting);
    expect(result).toMatch(/£/);
  });

  it("returns formatted currency value for JPY", () => {
    const params = { value: 1234.56 };
    const formatting = { currency: "currency-JPY", rawValue: 1234.56 };
    const result = getDisplayValue(params, formatting);
    // Accept both fullwidth and ASCII yen symbols
    expect(result).toMatch(/[¥￥]/);
  });

  it("returns formatted currency value for system locale", () => {
    const params = { value: 1234.56 };
    const formatting = { currency: "currency-IN-LOCALE", rawValue: 1234.56 };
    const result = getDisplayValue(params, formatting);
    expect(typeof result).toBe("string");
  });

  it("returns formatted currency value for DEFAULT", () => {
    const params = { value: 1234.56 };
    const formatting = { currency: "currency-DEFAULT", rawValue: 1234.56 };
    const result = getDisplayValue(params, formatting);
    expect(typeof result).toBe("string");
  });

  it("returns formatted currency value for LOCALE", () => {
    const params = { value: 1234.56 };
    const formatting = { currency: "currency-LOCALE", rawValue: 1234.56 };
    const result = getDisplayValue(params, formatting);
    expect(typeof result).toBe("string");
  });

  it("returns original value for unknown currency", () => {
    const params = { value: 1234.56 };
    const formatting = { currency: "currency-UNKNOWN", rawValue: 1234.56 };
    const result = getDisplayValue(params, formatting);
    expect(result).toBe(1234.56);
  });

  it("returns formatted date value DD-MM-YYYY", () => {
    const params = { value: "2023-01-02" };
    const formatting = { dateFormat: "formatDate-DD-MM-YYYY" };
    const result = getDisplayValue(params, formatting);
    expect(result).toBe("02-01-2023");
  });

  it("returns formatted date value MM-DD-YYYY", () => {
    const params = { value: "2023-01-02" };
    const formatting = { dateFormat: "formatDate-MM-DD-YYYY" };
    const result = getDisplayValue(params, formatting);
    expect(result).toBe("01-02-2023");
  });

  it("returns formatted date value YYYY-MM-DD", () => {
    const params = { value: "2023-01-02" };
    const formatting = { dateFormat: "formatDate-YYYY-MM-DD" };
    const result = getDisplayValue(params, formatting);
    expect(result).toBe("2023-01-02");
  });

  it("returns formatted date value DD-MMM-YYYY", () => {
    const params = { value: "2023-01-02" };
    const formatting = { dateFormat: "formatDate-DD-MMM-YYYY" };
    const result = getDisplayValue(params, formatting);
    expect(result).toMatch(/^02-\w{3}-2023$/);
  });

  it("returns formatted date value MMM-DD-YYYY", () => {
    const params = { value: "2023-01-02" };
    const formatting = { dateFormat: "formatDate-MMM-DD-YYYY" };
    const result = getDisplayValue(params, formatting);
    expect(result).toMatch(/^\w{3} 02, 2023$/);
  });

  it("returns original value for unknown date format", () => {
    const params = { value: "2023-01-02" };
    const formatting = { dateFormat: "formatDate-UNKNOWN" };
    const result = getDisplayValue(params, formatting);
    expect(result).toBe("2023-01-02");
  });

  it("returns original value for invalid date", () => {
    const params = { value: "not-a-date" };
    const formatting = { dateFormat: "formatDate-DD-MM-YYYY" };
    const result = getDisplayValue(params, formatting);
    expect(result).toBe("not-a-date");
  });

  it("returns formatted decimal value", () => {
    const params = { value: 1234.56 };
    const formatting = { decimalPlaces: 1, rawValue: 1234.56, useComma: true };
    const result = getDisplayValue(params, formatting);
    expect(result).toBe("1,234.6");
  });

  it("returns formatted decimal value with 0 decimalPlaces", () => {
    const params = { value: 1234.56 };
    const formatting = { decimalPlaces: 0, rawValue: 1234.56, useComma: false };
    const result = getDisplayValue(params, formatting);
    expect(typeof result).toBe("string");
  });

  it("returns original value if no formatting", () => {
    const params = { value: "plain" };
    const formatting = {};
    expect(getDisplayValue(params, formatting)).toBe("plain");
  });

  it("returns original value if decimalPlaces is set but rawValue is NaN", () => {
    const params = { value: "plain" };
    const formatting = { decimalPlaces: 2, rawValue: "not-a-number" };
    expect(getDisplayValue(params, formatting)).toBe("plain");
  });

  it("returns original value if currency is set but rawValue is NaN", () => {
    const params = { value: "plain" };
    const formatting = { currency: "currency-USD", rawValue: "not-a-number" };
    expect(getDisplayValue(params, formatting)).toBe("plain");
  });

  it("returns original value if currency is set but rawValue is undefined", () => {
    const params = { value: "plain" };
    const formatting = { currency: "currency-USD" };
    expect(getDisplayValue(params, formatting)).toBe("plain");
  });

  it("returns original value if decimalPlaces is set but rawValue is undefined", () => {
    const params = { value: "plain" };
    const formatting = { decimalPlaces: 2 };
    expect(getDisplayValue(params, formatting)).toBe("plain");
  });

  it("returns original value if params.value is undefined", () => {
    const params = {};
    const formatting = {};
    expect(getDisplayValue(params, formatting)).toBe(undefined);
  });

  it("handles system locale currency when navigator is undefined", () => {
    const originalNavigator = global.navigator;
    // Remove navigator to simulate Node environment
    // @ts-ignore
    delete global.navigator;
    const params = { value: 1234.56 };
    const formatting = { currency: "currency-LOCALE", rawValue: 1234.56 };
    const result = getDisplayValue(params, formatting);
    expect(typeof result).toBe("string");
    // Restore navigator
    global.navigator = originalNavigator;
  });
});
