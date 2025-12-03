import {
  formatNumber,
  formatCurrencyValue,
  handleIncreaseDecimal,
  handleDecreaseDecimal,
  handleCommaSeparator,
  handleCurrencyFormattingAction,
  handleDateFormattingAction,
  handleCellFormattingAction,
  handleCellFormatting,
} from "../../src/utils/cellFormattingHandlers";

describe("cellFormattingHandlers", () => {
  it("formats numbers with decimals and commas", () => {
    expect(formatNumber("1234.5", 2, true)).toBe("1,234.50");
    expect(formatNumber("1234", 0, false)).toBe("1234");
    expect(formatNumber("1,234.56", 1, false)).toBe("1234.6");
    // Edge: NaN input
    expect(formatNumber("notanumber", 2, true)).toBe("notanumber");
    // Edge: number input
    expect(formatNumber(1234.567, 1, true)).toBe("1,234.6");
    // Edge: negative numbers
    expect(formatNumber("-1234.5", 2, true)).toBe("-1,234.50");
    // Edge: zero decimal
    expect(formatNumber("1234.56", 0, true)).toBe("1,235");
  });

  it("handleColorFormattingAction covers all branches", () => {
    const dispatch = jest.fn();
    const cell1 = { rowId: 1, field: "a" };
    const cell2 = { rowId: 2, field: "b" };
    const selectedCells = [cell1, cell2];
    // Case: formattingConfig with editable field
    const formattingConfig = { tableConfiguration: [ { aliasName: "a", isEditable: true }, { aliasName: "b", isEditable: false } ] };
    const result = require("../../src/utils/cellFormattingHandlers").handleColorFormattingAction("textColor", { color: "#fff" }, selectedCells, dispatch, formattingConfig);
    expect(dispatch).toHaveBeenCalled();
    expect(Array.isArray(result.editableCells)).toBe(true);
    expect(result.editableCells.length).toBe(1);
    // Case: formattingConfig undefined (should result in no editable cells)
    const result2 = require("../../src/utils/cellFormattingHandlers").handleColorFormattingAction("textColor", { color: "#fff" }, selectedCells, dispatch);
    expect(Array.isArray(result2.editableCells)).toBe(true);
    expect(result2.editableCells.length).toBe(0);
    // Case: no editable fields
    const formattingConfig2 = { tableConfiguration: [ { aliasName: "c", isEditable: true } ] };
    const result3 = require("../../src/utils/cellFormattingHandlers").handleColorFormattingAction("fillColor", { color: "#000" }, selectedCells, dispatch, formattingConfig2);
    expect(result3.editableCells.length).toBe(0);
  });

  it("formats currency values", () => {
    expect(formatCurrencyValue(1234.56, "USD", "en-US")).toMatch(/\$/);
    expect(formatCurrencyValue(1234.56, "INR", "en-IN", true)).toContain("₹");
    // Edge: Indian format with 0
    expect(formatCurrencyValue(0, "INR", "en-IN", true)).toBe("₹0.00");
    // Edge: Other currency
    expect(formatCurrencyValue(1234.56, "EUR", "en-IE")).toMatch(/€|EUR/);
  });

  it("handleIncreaseDecimal dispatches correct actions", () => {
    const dispatch = jest.fn();
    const cell = { rowId: 1, field: "a", value: "1.2" };
    handleIncreaseDecimal([cell], dispatch, {});
    expect(dispatch).toHaveBeenCalled();
    // Edge: with formattingConfig
    handleIncreaseDecimal([cell], dispatch, { "1:a": { decimalPlaces: 2, useComma: true } });
    expect(dispatch).toHaveBeenCalled();
  });

  it("handleDecreaseDecimal dispatches correct actions", () => {
    const dispatch = jest.fn();
    const cell = { rowId: 1, field: "a", value: "1.2" };
    handleDecreaseDecimal([cell], dispatch, {});
    expect(dispatch).toHaveBeenCalled();
    // Edge: with formattingConfig
    handleDecreaseDecimal([cell], dispatch, { "1:a": { decimalPlaces: 1, useComma: false } });
    expect(dispatch).toHaveBeenCalled();
  });

  it("handleCommaSeparator dispatches correct actions", () => {
    const dispatch = jest.fn();
    const cell = { rowId: 1, field: "a", value: "1234.56" };
    handleCommaSeparator([cell], dispatch);
    expect(dispatch).toHaveBeenCalled();
  });

  it("handleCurrencyFormattingAction dispatches and returns formatter", () => {
    const dispatch = jest.fn();
    const cell = { rowId: 1, field: "a", value: "1234.56" };
    const tableConfiguration = [{ aliasName: "a", isEditable: true }, { aliasName: "b", isEditable: false }];
    // Test all currency keys
    [
      "currency-USD",
      "currency-INR",
      "currency-EUR",
      "currency-GBP",
      "currency-JPY",
      "currency-IN-LOCALE",
      "currency-DEFAULT",
      "currency-LOCALE",
    ].forEach(key => {
      const result = handleCurrencyFormattingAction(key, [cell], dispatch, { tableConfiguration });
      expect(dispatch).toHaveBeenCalled();
      expect(typeof result.formatter).toBe("function");
      expect(Array.isArray(result.editableCells)).toBe(true);
    });
    // Edge: unknown key
    const result = handleCurrencyFormattingAction("currency-UNKNOWN", [cell], dispatch, { tableConfiguration });
    expect(typeof result.formatter).toBe("function");
    // Edge: non-editable cell
    const cell2 = { rowId: 2, field: "b", value: "100" };
    const result2 = handleCurrencyFormattingAction("currency-USD", [cell2], dispatch, { tableConfiguration });
    expect(result2.editableCells.length).toBe(0);
    // Edge: missing formattingConfig
    handleCurrencyFormattingAction("currency-USD", [cell], dispatch);
    // Edge: formattingConfig with empty tableConfiguration (should result in no editable cells)
    const result3 = handleCurrencyFormattingAction("currency-USD", [cell], dispatch, { tableConfiguration: [] });
    expect(result3.editableCells.length).toBe(0);
    // Edge: formattingConfig undefined (should result in no editable cells)
    const result4 = handleCurrencyFormattingAction("currency-USD", [cell], dispatch);
    expect(result4.editableCells.length).toBe(0);
  });

  it("handleDateFormattingAction dispatches and returns formatter", () => {
    const dispatch = jest.fn();
    const cell = { rowId: 1, field: "a", value: "2023-01-01" };
    const tableConfiguration = [{ aliasName: "a", isEditable: true }];
    const result = handleDateFormattingAction("formatDate-DD-MM-YYYY", [cell], dispatch, { tableConfiguration });
    expect(dispatch).toHaveBeenCalled();
    expect(typeof result.formatter).toBe("function");
    // Edge: non-editable cell
    const cell2 = { rowId: 2, field: "b", value: "2023-01-01" };
    const result2 = handleDateFormattingAction("formatDate-YYYY-MM-DD", [cell2], dispatch, { tableConfiguration });
    expect(result2.editableCells.length).toBe(0);
    // Edge: missing formattingConfig
    handleDateFormattingAction("formatDate-YYYY-MM-DD", [cell], dispatch);
    // Edge: formattingConfig with empty tableConfiguration (should result in no editable cells)
    const result3 = handleDateFormattingAction("formatDate-DD-MM-YYYY", [cell], dispatch, { tableConfiguration: [] });
    expect(result3.editableCells.length).toBe(0);
    // Edge: formattingConfig undefined (should result in no editable cells)
    const result4 = handleDateFormattingAction("formatDate-DD-MM-YYYY", [cell], dispatch);
    expect(result4.editableCells.length).toBe(0);
  });

  it("handleCellFormattingAction covers all cases", () => {
    const dispatch = jest.fn();
    const cell = { rowId: 1, field: "a", value: "1.23" };
    // increaseDecimal
    handleCellFormattingAction("increaseDecimal", [cell], dispatch, {});
    // decreaseDecimal
    handleCellFormattingAction("decreaseDecimal", [cell], dispatch, {});
    // comma
    handleCellFormattingAction("comma", [cell], dispatch, {});
    // currency keys (should be no-op)
    [
      "currency-INR",
      "currency-USD",
      "currency-EUR",
      "currency-GBP",
      "currency-JPY",
      "currency-IN-LOCALE",
      "currency-DEFAULT",
      "currency-LOCALE",
    ].forEach(key => {
      handleCellFormattingAction(key, [cell], dispatch, {});
    });
    // default (unknown action)
    handleCellFormattingAction("unknown-action", [cell], dispatch, {});
    // Explicitly test default case for coverage
    expect(() => handleCellFormattingAction("not-a-real-action", [cell], dispatch, {})).not.toThrow();
  });

  it("handleCellFormatting works for NaN and valid numbers", () => {
    const dispatch = jest.fn();
    const cells = [
      { rowId: 1, field: "a", value: "notanumber" },
      { rowId: 2, field: "b", value: "123.45" },
    ];
    handleCellFormatting(cells, dispatch, () => ({ decimalPlaces: 1, useComma: true }));
    expect(dispatch).toHaveBeenCalled();
  });
});
